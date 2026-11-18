# AgentStreak

Daily on-chain check-in for Binance Agent ID holders. Check in once per UTC day, build your streak.

**Built for the Binance Agent ID Hackathon** (60,000 USDC) — submission period 18 Nov – 9 Dec 2026.

- **Live site:** https://yosep55.github.io/agent-streak/ *(GitHub Pages — being set up)*
- **Contract (BSC mainnet):** *TBD — deployment pending; testnet contract below*
- **Contract (BSC testnet):** *TBD — see `deployed-testnet.json` once the testnet deploy lands*

## What it is

AgentStreak is a daily check-in dApp for holders of a Binance Agent ID (a `.ai` on-chain name, e.g. `octafx.ai`).

- Connect your wallet, and the app resolves your `.ai` handle from the Agent ID registry.
- Press **Check In** once per UTC day. The contract records your streak (consecutive days), your best streak, and your total check-ins.
- A leaderboard shows the top streaks.

There is **no token, no fee, no yield, and no reward of any kind** — just streaks. Check-ins cost only network gas.

## How Agent ID is used

The contract reads the official Agent ID registry on BNB Chain:

- **Registry:** `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` ([BscScan](https://bscscan.com/address/0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F))
- `checkIn()` requires `registry.balanceOf(msg.sender) > 0` — only Agent ID holders can check in.
- The emitted `CheckIn` event includes the caller's `.ai` handle from `registry.handleOf(msg.sender)`.
- The frontend shows your handle and holder status from the same registry.

## Contracts

- `contracts/AgentStreak.sol` — the check-in contract (Solidity ^0.8.24). No owner, no payable functions, no admin powers, no funds ever held.
- `contracts/MockRegistry.sol` — a mock Agent ID registry used **only on testnet** (BSC testnet has no Agent ID registry). Mainnet deployment points at the real registry above.
- `contracts/test/AgentStreak.t.sol` — Foundry tests.

Run the tests:

```sh
forge install foundry-rs/forge-std   # first time only (no --no-commit: invalid on this Foundry nightly)
forge test   # 9 tests, all passing (2026-11-18)
```

Mainnet deploy gas: **507,440** (estimated against live mainnet state, 2026-11-18);
at the 0.05 gwei gas price at check time ≈ **0.0000254 BNB**. See
`deployed-testnet.json` → `mainnetGasEstimate` for the full breakdown.

## Frontend

Static site in `frontend/` (plain HTML/JS + ethers v6 via CDN). No build step, no backend, no tracking.

```sh
cd frontend && python3 -m http.server 8000
```

Wallet connection uses the injected provider only (Binance Wallet / MetaMask). There is no QR-code login and no WalletConnect. Configuration (chain, contract address, explorer) lives in `frontend/config.json` — switch testnet → mainnet by editing that one file.

## Safety

- No seed phrases, private keys, API secrets, or pairing codes are ever requested or stored.
- No prompts that bypass your wallet's transaction confirmation — every check-in is confirmed by you in your own wallet.
- No promised returns or earnings anywhere in this project.

## License

MIT
