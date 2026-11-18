# AgentStreak — Build Log (Binance Agent ID Hackathon)

**Project:** AgentStreak — daily on-chain check-in for Agent ID holders (streaks only; no token, no fees, no promised returns).
**Hackathon:** Binance Agent ID Hackathon, 60,000 USDC. Submission 2026-11-18 08:00 UTC → 2026-12-09 08:00 UTC (= 15:00 WIB 9 Dec). Review 9–17 Dec, public review 17–20 Dec.
**Started:** 2026-11-18 ~19:14 WIB. Coordinator: build subagent (parent: main agent).
**Workspace:** ~/workspace/agentid-hackathon/
**Registry:** 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F (BSC, Sourcify exact_match; ABI in registry.json)

## Plan
1. Contract AgentStreak.sol + forge tests → deploy BSC testnet (mock registry) → end-to-end check-in.
2. Frontend static page (ethers v6 CDN, injected provider only, no QR login) + leaderboard from events.
3. Public GitHub repo Yosep55/agent-streak + GitHub Pages.
4. Mainnet deploy plan (gas estimate + preview) — deploy itself needs Yosep's explicit Gas; NOT done by builders.
5. Official submission portal URL + fields (research only — no submission without Yosep's confirmation).

## Workstreams (spawned 2026-11-18 ~19:15 WIB)
- Contract + tests + testnet deploy: subagent (results pending)
- Frontend: subagent (results pending)
- Submission portal research: subagent (results pending)

## Contract

DONE 2026-11-18 ~19:21 WIB (contract subagent).
- `contracts/AgentStreak.sol` — Solidity ^0.8.24, zero dependencies beyond a minimal `IAgentIdRegistry` interface (`balanceOf`/`handleOf`). Immutable registry in constructor (reverts on zero address). `checkIn()` requires holder (`balanceOf > 0`, else "Not an Agent ID holder"), one per UTC day (`block.timestamp / 86400`, else "Already checked in today"), streak = consecutive ? +1 : 1, updates best/total, emits `CheckIn(user, handle, day, streak)`. `getUser(address)` returns (handle, currentStreak, bestStreak, totalCheckIns, lastCheckInDay, canCheckInToday). No payable functions, no owner, no fees, no token, no admin powers, no promised returns anywhere.
- `contracts/MockRegistry.sol` — test-only mock registry (testnet has no Agent ID registry). Never for mainnet.
- `contracts/test/AgentStreak.t.sol` — **forge test: 9 passed, 0 failed** (non-holder reverts; double check-in same day reverts; streak increments over consecutive days via vm.warp; resets to 1 after a missed day; bestStreak tracks max; event emitted with correct handle/day/streak; getUser for non-holder; zero-registry constructor reverts). Toolchain: Foundry 1.6.0-nightly at `~/.foundry/bin` (NOT on default PATH — export it). `forge install --no-commit` is invalid on this nightly; forge-std was cloned manually to `lib/forge-std`.
- `abi/AgentStreak.json` — real ABI from forge build (overwrites the frontend builder's draft ABI; verified compatible — frontend `app.js` `getUser` signature matches exactly).
- `script/deploy.sh` — deploy MockRegistry → mint mock Agent ID → deploy AgentStreak → checkIn → verify double check-in revert. Works against any RPC via `RPC_URL` env. One real bug found + fixed in-script: under `set -o pipefail`, piping `cast send` straight into `grep` reports cast's non-zero exit even when grep matches — output is now captured to a file first, then grepped.
- **Local end-to-end VERIFIED on anvil (chain 31337):** mock `0x29b1b13046b8330be3ac42082b940ea42e4d7acc` (deploy 388,759 gas, tx `0x504ea405…`), mint tx `0xfc4f9d3d…`, AgentStreak `0xbbf563b0d85d1b8352945a4106f5f7de9b166af9` (deploy 502,286 gas, tx `0x8da279ea…`), checkIn tx `0xb12184bd…` (121,180 gas), `CheckIn` event verified in receipt logs (handle `teststreak`, day 20775, streak 1), `getUser` = (teststreak, 1, 1, 1, 20775, false), second check-in same day reverts "Already checked in today". **These are LOCAL addresses, not testnet.**
- **BSC TESTNET DEPLOY BLOCKED — no tBNB (test wallet balance 0).** Faucet attempts, all failed for a fresh wallet with no mainnet balance and no browser/captcha access from this subagent:
  1. Official faucet (testnet.bnbchain.org/faucet-smart): invisible hCaptcha (sitekey `d9a9ee67…`) + requires ≥ 0.002 BNB on BSC mainnet at the claiming address.
  2. QuickNode faucet: requires a small mainnet balance + browser bot-check.
  3. Chainstack faucet: requires ≥ 0.08 ETH on Ethereum mainnet with holding history + account/API key.
  Full detail + unblock steps in `deployed-testnet.json` (`status: NOT_DEPLOYED_TO_TESTNET`). **Unblock (parent/browser, ~2 min):** open https://faucet.quicknode.com/binance-smart-chain/bnb-testnet in a live browser, paste test wallet `0xcEe4278ba5c7d113B3CC402Bb4399191579064fb`, complete verification; then run `RPC_URL=https://bsc-testnet-rpc.publicnode.com ./script/deploy.sh`. Whole script needs ~1.05M gas (~0.000105 tBNB at 0.1 gwei) — far below one drip. Do NOT fund from the user's real wallet (0x51d7…); it must never be touched.
- Test wallet (fresh, testnet only): `0xcEe4278ba5c7d113B3CC402Bb4399191579064fb`, key in `.test-wallet.json` (mode 600, gitignored, never printed). Working testnet RPC verified: `https://bsc-testnet-rpc.publicnode.com` (binance `data-seed-prebsc-1` timed out; `prebsc-2` works).
- **Mainnet gas estimate:** deploy = **507,440 gas** (`cast estimate --create` against live mainnet RPC, constructor arg = real registry). Gas price at check: 0.05 gwei (50,000,000 wei) → cost **~0.0000254 BNB**. User balance ~0.0007 BNB covers it **~27.6x**. Break-even gas price ≈ **1.38 gwei** (at 1 gwei: 0.000507 BNB, still covered; above ~1.38 gwei needs a top-up). checkIn ≈ 121,180 gas (~0.0000061 BNB at current price). Mainnet deploy NOT done — needs Yosep's explicit Gas + preview.
- `deployed-testnet.json` — status, faucet attempts, local verification, unblock steps, mainnet gas estimate (all machine-readable).
- `foundry.toml` (src=contracts, test=contracts/test, solc 0.8.24, optimizer 200 runs), `.gitignore` (out/, cache/, lib/, .test-wallet.json).

## Frontend

DONE 2026-11-18 ~19:20 WIB (frontend subagent). Files in `~/workspace/agentid-hackathon/frontend/`:
- `index.html` (5,342 B) — wallet card, streak card, leaderboard, FAQ, footer
- `app.js` (13,699 B) — ethers v6, injected provider only (`window.ethereum`); NO WalletConnect, NO QR login, NO seed/private-key handling anywhere (grep-verified: 0 matches for "walletconnect"/"qr")
- `style.css` — dark theme, mobile-friendly
- `config.json` — chainId 97 (BSC Testnet), contractAddress still `0x0000…0000` (no `deployed-testnet.json` existed at build time — fill in the real testnet address when the contract builder delivers it), registry `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`, explorer testnet.bscscan.com, repo `https://github.com/Yosep55/agent-streak`
- `README.md` — local serve (`python3 -m http.server`) + testnet→mainnet switch via config.json only
- ABI: `~/workspace/agentid-hackathon/abi/AgentStreak.json` did NOT exist yet, so the frontend builder wrote it from the described interface (checkIn, getUser, CheckIn event, registry balanceOf/handleOf) and embedded the same ABI in `app.js`. **MUST be re-verified against the real contract ABI before launch.**
- Features: connect wallet; Agent ID holder check via registry `handleOf`/`balanceOf`; streak card (current/best/total/last check-in UTC); Check In button (disabled with reason if not a holder or already checked in today; tx link on success); leaderboard top 10 by best streak from `CheckIn` events via `eth_getLogs`, 2,000-block chunks over last ~200k blocks, with RPC-fallback and an honest "temporarily unavailable" state (never fake data); FAQ stating no rewards/tokens/yields; footer links (BscScan contract, GitHub, Binance hackathon announcement).
- Verified: `node --check app.js` OK; `config.json` + ABI JSON parse OK; served locally on port 8123 — index.html/app.js/style.css/config.json all HTTP 200; ethers v6 CDN reachable from this VM (HTTP 200).
- Not verified live: actual wallet connect / check-in / leaderboard against a deployed contract — blocked until the contract is deployed and `config.json` gets its real address. No money spent; no mainnet work.

## Submission form — FOUND by Yosep (2026-11-18 ~19:18 WIB, via the Binance survey link)
- Chinese-language form, section "一、项目基本信息" (Basic Project Information). Required fields:
  1. 项目名称 — Project name (AgentStreak)
  2. 项目简介 — Project intro in 1–3 sentences (core features + main problem solved)
  3. 项目合约地址 — Project contract address: submit the **BscScan LINK**; source code must be verified and open-source on BscScan
  4. 项目官网 / 产品入口 — Project official website / product entry point (= GitHub Pages URL)
  5. 项目社交媒体链接 (X) — Project social media link (X)
- Do NOT fill/submit — submission only after mainnet deployment + BscScan verification, with Yosep's confirmation of the payout address.
- OPEN ITEM (field 5): no project X account exists — only Yosep's personal @Z00055. Use @Z00055 for now unless the top-level agent decides otherwise.

## Submission portal

**UPDATE 2026-11-18 ~19:18 WIB:** the portal research conclusion ("no portal published") is superseded — Yosep found the official form himself via the Binance survey link. See "Submission form" section above. Full research notes in SUBMISSION_PORTAL.md (pre-discovery state preserved + correction appended).

## Testnet verification
- **Status 2026-11-18 ~19:20 WIB: NOT deployed to testnet — BLOCKED on tBNB.** Test wallet 0xcEe4278ba5c7d113B3CC402Bb4399191579064fb, balance 0. All 3 public faucets unusable without a live browser/captcha and/or a mainnet balance the fresh wallet lacks (official faucet: hCaptcha + needs ≥0.002 mainnet BNB; QuickNode: browser bot-check; Chainstack: needs ≥0.08 ETH mainnet + account).
- **Unblock (needs parent/browser, ~2 min):** open https://faucet.quicknode.com/binance-smart-chain/bnb-testnet in a live browser, paste test wallet address above, complete verification; then run `RPC_URL=https://bsc-testnet-rpc.publicnode.com ./script/deploy.sh` (deploys MockRegistry → mints mock ID → deploys AgentStreak → checkIn → verifies double check-in revert; ~1.05M gas total ≈ 0.000105 tBNB).
- **Local anvil end-to-end (same script, chain 31337) PASSED:** MockRegistry 0x29b1b13046b8330be3ac42082b940ea42e4d7acc, AgentStreak 0xbbf563b0d85d1b8352945a4106f5f7de9b166af9, checkIn tx 0xb12184bd… (121,180 gas), CheckIn event verified in logs (handle 'teststreak', day 20775, streak 1), getUser = (teststreak, 1, 1, 1, 20775, false), second check-in same day reverts "Already checked in today". Details in deployed-testnet.json. (Local addresses, NOT testnet.)

## Mainnet deployment plan
- **NOT deployed. Needs Yosep's explicit Gas + transaction preview (top-level agent arranges).**
- Contract: AgentStreak.sol, constructor arg = real registry 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F (single arg, no other args).
- Deployment gas (measured via `cast estimate --create` against live mainnet RPC): **507,440 gas**. Gas price at check: **0.05 gwei** → cost **~0.0000254 BNB**. User balance ~0.0007 BNB covers it **~27.6×**. At 1 gwei: 0.000507 BNB (still covered). Break-even gas price ≈ **1.38 gwei** — above that, a top-up is needed. **Re-check gas price at deploy time.**
- checkIn ≈ 121,180 gas (~0.0000061 BNB at current price).
- After deploy: verify source on BscScan (contract is zero-dependency beyond the registry interface), update frontend/config.json to chain 56 + real address, push to repo, confirm Pages serves it, then submit the form (fields in "Submission form" section above) with Yosep's confirmation of the payout address.

## GitHub repo / Pages
- **Repo creation BLOCKED 2026-11-18 ~19:20 WIB:** `create_repository` via the GitHub connector returned 403 "Resource not accessible by integration" (approval was granted; the Muse GitHub App installation lacks repo-creation permission). Repo `Yosep55/agent-streak` does NOT exist yet.
- **Fallback needed (parent/browser):** create the repo at github.com/new (public, name `agent-streak`, do NOT initialize with README) — or Yosep creates it himself in ~1 min. After it exists, push the snapshot (files prepared; see below) and enable Pages (Settings → Pages → Deploy from branch `main`, folder `/` — root serves `frontend/`? NOTE: Pages serves from repo root or /docs — the frontend lives in `frontend/`; either move the site files to repo root at push time or use a `docs/` folder. Decide at push time; simplest: push frontend files to repo root so Pages serves them directly, keeping contracts/ under `contracts/`).
- **Files ready to push (once repo exists):** README.md, contracts/AgentStreak.sol, contracts/MockRegistry.sol, contracts/test/AgentStreak.t.sol, foundry.toml, abi/AgentStreak.json, registry.json, frontend/* (config.json address still placeholder until testnet deploy lands — update after). NEVER push: .test-wallet.json (secret), .git/, out/, cache/, lib/ (reinstall via `forge install`).
- **Pages status:** NOT live yet — blocked on repo creation above.
