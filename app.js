/* AgentStreak frontend — static site, no backend, no tracking.
 *
 * Reads config.json at runtime (chainId, contractAddress, registryAddress,
 * rpcUrls, explorer, repoUrl) so testnet -> mainnet is a one-line config change.
 *
 * ABI below is derived from the contract interface (checkIn, getUser, CheckIn
 * event, registry balanceOf/handleOf). It MUST be re-verified against the real
 * deployed contract ABI in ~/workspace/agentid-hackathon/abi/AgentStreak.json
 * before launch. The frontend loads no ABI from anywhere else.
 */

const STREAK_ABI = [
  "function checkIn()",
  "function getUser(address user) view returns (string handle, uint256 currentStreak, uint256 bestStreak, uint256 totalCheckIns, uint256 lastCheckInDay, bool canCheckInToday)",
  "event CheckIn(address indexed user, string handle, uint256 day, uint256 streak)"
];

const REGISTRY_ABI = [
  "function balanceOf(address user) view returns (uint256)",
  "function handleOf(address user) view returns (string)"
];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const LOG_CHUNK = 2000;        // BSC public RPCs cap log ranges; chunk requests.
const LOG_LOOKBACK = 200000;   // ~200k blocks of CheckIn history for the leaderboard.

let config = null;
let readProvider = null;       // JsonRpcProvider over the public BSC RPC (reads only)
let walletProvider = null;     // BrowserProvider (window.ethereum) after connect
let signer = null;
let account = null;
let streakContract = null;
let registryContract = null;

const $ = (id) => document.getElementById(id);

function shortAddress(addr) {
  return addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "—";
}

function dayNumberToDate(day) {
  if (!day || Number(day) === 0) return "—";
  return new Date(Number(day) * 86400 * 1000).toISOString().slice(0, 10);
}

function txLink(hash) {
  return config.explorer.replace(/\/$/, "") + "/tx/" + hash;
}

function contractLink() {
  return config.explorer.replace(/\/$/, "") + "/address/" + config.contractAddress;
}

/* ---------- startup ---------- */

async function init() {
  try {
    const res = await fetch("config.json");
    config = await res.json();
  } catch (e) {
    $("networkStatus").textContent = "Could not load config.json — the site is misconfigured.";
    $("leaderboardStatus").textContent = "Leaderboard unavailable: config.json could not be loaded.";
    return;
  }

  $("switchNetworkName").textContent = config.chainName;
  $("repoLink").href = config.repoUrl || "https://github.com/Yosep55/agent-streak";
  $("contractLink").href = contractLink();

  // Read-only provider over the public RPC (first URL, fall back to the next).
  for (const url of config.rpcUrls) {
    try {
      const p = new ethers.JsonRpcProvider(url);
      await p.getBlockNumber();
      readProvider = p;
      break;
    } catch (e) { /* try the next RPC URL */ }
  }

  if (!readProvider) {
    $("leaderboardStatus").textContent =
      "Leaderboard temporarily unavailable — could not reach the BSC public RPC. Please reload later.";
    $("networkStatus").textContent = "Could not reach the BSC public RPC. Wallet features still work after connect.";
  } else {
    loadLeaderboard();
  }

  if (!window.ethereum) {
    $("connectBtn").textContent = "No wallet detected";
    $("connectBtn").disabled = true;
    $("networkStatus").textContent =
      "No injected wallet found. Install Binance Wallet or MetaMask, then reload this page.";
    return;
  }

  $("connectBtn").addEventListener("click", connectWallet);
  $("checkInBtn").addEventListener("click", doCheckIn);
  $("switchNetworkBtn").addEventListener("click", switchNetwork);

  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) { resetWalletUI(); } else { onAccount(accounts[0]); }
  });
  window.ethereum.on("chainChanged", () => { if (account) onAccount(account); });
}

function resetWalletUI() {
  account = null; signer = null;
  $("walletCard").classList.add("hidden");
  $("streakCard").classList.add("hidden");
  $("connectBtn").textContent = "Connect Wallet";
  $("networkStatus").textContent = "Not connected. Connect your wallet to see your streak.";
}

/* ---------- wallet ---------- */

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) return;
    walletProvider = new ethers.BrowserProvider(window.ethereum);
    await onAccount(accounts[0]);
  } catch (e) {
    $("networkStatus").textContent = "Connection rejected or failed: " + (e && e.message ? e.message : e);
  }
}

async function onAccount(addr) {
  account = addr;
  signer = await walletProvider.getSigner();
  $("connectBtn").textContent = "Connected: " + shortAddress(account);
  $("walletCard").classList.remove("hidden");
  $("streakCard").classList.remove("hidden");
  $("walletAddress").textContent = account;
  $("networkStatus").textContent = "Connected as " + shortAddress(account) + ".";

  const net = await walletProvider.getNetwork();
  const onRightChain = Number(net.chainId) === config.chainId;
  $("wrongNetwork").classList.toggle("hidden", onRightChain);
  if (!onRightChain) {
    $("checkInHint").textContent =
      "Switch to " + config.chainName + " (chain " + config.chainId + ") to check in.";
    $("checkInBtn").disabled = true;
  }

  // Agent ID status via the on-chain registry (read-only provider if available).
  const rpc = readProvider || walletProvider;
  registryContract = new ethers.Contract(config.registryAddress, REGISTRY_ABI, rpc);
  let handle = "";
  let balance = 0n;
  try {
    handle = await registryContract.handleOf(account);
    balance = await registryContract.balanceOf(account);
  } catch (e) {
    $("holderStatus").textContent = "Could not read the Agent ID registry — please reload and try again.";
    $("holderStatus").className = "warn";
    return;
  }

  const isHolder = balance > 0n;
  $("handleDisplay").textContent = handle ? handle : "(no handle found)";
  if (isHolder) {
    $("holderStatus").textContent = "Agent ID holder ✓ — " + (handle || "handle not set") + " (" + balance.toString() + " Agent ID" + (balance === 1n ? "" : "s") + ")";
    $("holderStatus").className = "ok";
  } else {
    $("holderStatus").textContent = "You need an Agent ID (.ai name) to check in. Get one in Binance Wallet first, then come back.";
    $("holderStatus").className = "warn";
  }

  await refreshStreak(isHolder);
}

async function refreshStreak(isHolder) {
  if (config.contractAddress.toLowerCase() === ZERO_ADDRESS) {
    $("checkInHint").textContent = "The AgentStreak contract is not deployed yet — check back soon.";
    $("checkInBtn").disabled = true;
    $("statCurrent").textContent = "—";
    $("statBest").textContent = "—";
    $("statTotal").textContent = "—";
    $("statLast").textContent = "—";
    return;
  }

  const rpc = readProvider || walletProvider;
  streakContract = new ethers.Contract(config.contractAddress, STREAK_ABI, rpc);
  let user;
  try {
    user = await streakContract.getUser(account);
  } catch (e) {
    $("checkInHint").textContent = "Could not read your streak from the contract — please reload and try again.";
    return;
  }

  $("statCurrent").textContent = user.currentStreak.toString();
  $("statBest").textContent = user.bestStreak.toString();
  $("statTotal").textContent = user.totalCheckIns.toString();
  $("statLast").textContent = dayNumberToDate(user.lastCheckInDay);

  const btn = $("checkInBtn");
  const hint = $("checkInHint");
  if (!isHolder) {
    btn.disabled = true;
    hint.textContent = "You need an Agent ID (.ai name) to check in.";
  } else if (!user.canCheckInToday) {
    btn.disabled = true;
    hint.textContent = "Already checked in today — come back tomorrow (UTC).";
  } else {
    btn.disabled = false;
    hint.textContent = user.totalCheckIns === 0n
      ? "First check-in — this starts your streak. Gas only, no other cost."
      : "Ready to check in. Gas only, no other cost.";
  }
}

async function switchNetwork() {
  const chainIdHex = "0x" + config.chainId.toString(16);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (e) {
    // 4902 = chain not added to the wallet yet: add it from config.
    if (e && e.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: chainIdHex,
            chainName: config.chainName,
            rpcUrls: config.rpcUrls,
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            blockExplorerUrls: [config.explorer]
          }]
        });
      } catch (e2) {
        $("networkStatus").textContent = "Could not add/switch network: " + (e2 && e2.message ? e2.message : e2);
      }
    } else {
      $("networkStatus").textContent = "Network switch rejected or failed: " + (e && e.message ? e.message : e);
    }
  }
}

/* ---------- check-in ---------- */

async function doCheckIn() {
  const btn = $("checkInBtn");
  const status = $("txStatus");
  btn.disabled = true;
  status.textContent = "Waiting for you to confirm in your wallet…";
  try {
    const withSigner = streakContract.connect(signer);
    const tx = await withSigner.checkIn();
    status.innerHTML = 'Transaction sent — waiting for confirmation… <a href="' + txLink(tx.hash) + '" target="_blank" rel="noopener">View on BscScan</a>';
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      status.innerHTML = '✅ Checked in! <a href="' + txLink(tx.hash) + '" target="_blank" rel="noopener">View transaction</a>';
      await refreshStreak(true);
      loadLeaderboard();
    } else {
      status.textContent = "Transaction failed on-chain. No check-in was recorded.";
      btn.disabled = false;
    }
  } catch (e) {
    status.textContent = "Check-in cancelled or failed: " + (e && e.message ? e.message : e);
    btn.disabled = false;
  }
}

/* ---------- leaderboard ---------- */

async function loadLeaderboard() {
  const list = $("leaderboard");
  const status = $("leaderboardStatus");
  list.innerHTML = "";
  status.textContent = "Loading…";

  if (!readProvider) {
    status.textContent = "Leaderboard temporarily unavailable — could not reach the BSC public RPC.";
    return;
  }
  if (config.contractAddress.toLowerCase() === ZERO_ADDRESS) {
    status.textContent = "Leaderboard will appear once the contract is deployed.";
    return;
  }

  try {
    const iface = new ethers.Interface(STREAK_ABI);
    const topic = iface.getEvent("CheckIn").topicHash;
    const latest = await readProvider.getBlockNumber();
    const fromBlock = Math.max(0, latest - LOG_LOOKBACK);

    const users = new Map(); // address -> handle (latest seen)
    for (let start = fromBlock; start <= latest; start += LOG_CHUNK) {
      const end = Math.min(start + LOG_CHUNK - 1, latest);
      let logs;
      try {
        logs = await readProvider.getLogs({
          address: config.contractAddress,
          topics: [topic],
          fromBlock: start,
          toBlock: end
        });
      } catch (e) {
        // Try the next configured RPC once for this chunk.
        logs = await retryLogsWithFallback(topic, start, end);
      }
      for (const log of logs) {
        const parsed = iface.parseLog(log);
        if (parsed) users.set(parsed.args.user.toLowerCase(), parsed.args.handle);
      }
    }

    if (users.size === 0) {
      status.textContent = "No check-ins yet — be the first.";
      return;
    }

    const contract = new ethers.Contract(config.contractAddress, STREAK_ABI, readProvider);
    const rows = [];
    for (const [addr, handle] of users) {
      try {
        const u = await contract.getUser(addr);
        rows.push({
          address: addr,
          handle: u.handle || handle || "",
          best: Number(u.bestStreak),
          current: Number(u.currentStreak),
          total: Number(u.totalCheckIns)
        });
      } catch (e) { /* skip unreadable entries */ }
    }

    rows.sort((a, b) => b.best - a.best || b.total - a.total);
    const top = rows.slice(0, 10);
    for (const [i, r] of top.entries()) {
      const li = document.createElement("li");
      const name = r.handle ? r.handle : shortAddress(r.address);
      li.innerHTML = "";
      const nameSpan = document.createElement("span");
      nameSpan.className = "lb-handle";
      nameSpan.textContent = (i + 1) + ". " + name;
      const meta = document.createElement("span");
      meta.className = "lb-meta";
      meta.textContent = " — best streak " + r.best + " days · current " + r.current + " · " + r.total + " check-ins";
      li.appendChild(nameSpan);
      li.appendChild(meta);
      list.appendChild(li);
    }
    status.textContent = top.length + " of " + rows.length + " addresses shown (top 10 by best streak).";
  } catch (e) {
    // Never render fake or partial leaderboard data.
    list.innerHTML = "";
    status.textContent = "Leaderboard temporarily unavailable — the RPC request failed. Please reload later.";
  }
}

async function retryLogsWithFallback(topic, fromBlock, toBlock) {
  let lastErr = null;
  for (const url of config.rpcUrls) {
    try {
      const p = new ethers.JsonRpcProvider(url);
      return await p.getLogs({
        address: config.contractAddress,
        topics: [topic],
        fromBlock,
        toBlock
      });
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("all RPC endpoints failed");
}

document.addEventListener("DOMContentLoaded", init);
