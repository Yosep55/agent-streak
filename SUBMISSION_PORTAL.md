# Binance Agent ID Hackathon — Project Submission Portal: Research Findings

> **CORRECTION 2026-11-18 ~19:18 WIB — FORM FOUND:** Yosep found the official project submission form himself via the Binance survey link. It is a Chinese-language form, section "一、项目基本信息" (Basic Project Information), with 5 required fields: (1) 项目名称 project name, (2) 项目简介 project intro in 1–3 sentences, (3) 项目合约地址 contract address as a **BscScan link** (source verified + open-source on BscScan), (4) 项目官网 / 产品入口 official website / product entry (= GitHub Pages URL), (5) 项目社交媒体链接 (X) project X link. **The "no portal published" conclusion below is superseded** — it reflects the state before Yosep found the form. Do NOT fill/submit until after mainnet deployment + BscScan verification, with Yosep's confirmation. Field 5 is an open item (only personal @Z00055 exists; no project X account yet).

**Researched:** 2026-11-18 ~19:15 WIB (12:15 UTC), ~4 hours after the announcement went live.
**Researcher:** subagent (web search + page-text fetch only; no live browser, no sign-in, nothing submitted).

## HEADLINE FINDING: NO PROJECT SUBMISSION PORTAL IS PUBLISHED YET

As of 2026-11-18 ~19:15 WIB, **there is no findable official project-submission form/portal for the Agent ID Hackathon project tracks**. The official announcement tells projects to "submit your project name, website, contract address(es), Agent ID usage description, and other required materials during the Submission Period" but **contains no link, URL, form name, or host for that submission** — only one link in the whole announcement, and it is the *community-promotion* (X-post) survey, not the project submission.

**Do NOT use the community survey for a project submission.** It is a different track.

## What was checked

| # | Source checked | Result |
|---|---|---|
| 1 | Official announcement (support page), full text, crawled 2026-11-18 11:57 UTC | https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf — step 3 says "Submit your project name, website, contract address(es), Agent ID usage description, and other required materials during the Submission Period. No registration needed." **No submission URL anywhere in the 277-line page.** The only outbound campaign link is the "campaign survey" under the Community Promotion section (see below). |
| 2 | Same announcement mirrored on Binance Square | https://www.binance.com/en/square/post/389517345917641 — identical text, same single link. No additional submission link. |
| 3 | The announcement's one link ("campaign survey") | https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c — fetched 2026-11-18 12:14 UTC; page renders only "Scan to Download App iOS & Android" (Binance survey deep-link, opens in the Binance app). It is linked from the **Agent Ecosystem Promotion Award** section (post on X with #BinanceWalletHackathon + #AgenticWallet, submit your X link). **This is the X-post track survey, NOT the project submission.** |
| 4 | Web searches (6 queries, 2026-11-18) | "Binance Agent ID Hackathon submit project", "Agent ID Hackathon submission portal BNB Chain 60000 USDC", site:binance.com Agent ID Hackathon, "Agent ID Hackathon" dorahacks / bnbchain.org / survey submit, "BinanceWalletHackathon" submit project, "Agent ID Hackathon" Binance Wallet X announcement. **Every result points back to the same announcement or news rewrites of it. No DoraHacks page, no BNB Chain blog post, no Google Form, no second Binance survey link surfaced.** |
| 5 | BNB Chain blog / DoraHacks | No Agent ID Hackathon post on bnbchain.org and no DoraHacks hackathon page found. (For contrast: the June 2026 BNB Hack AI Trading Agents edition *does* have a DoraHacks page — https://dorahacks.io/hackathon/bnbhack-twt-cmc/ — but nothing equivalent exists for this hackathon as of this check.) |
| 6 | Third-party coverage | seismyc.com / BTC Wires story (published 2026-11-18T08:30:18Z) and Binance Square news post merely restate the announcement; neither adds a submission link. |

## The ONLY submission URL that exists (community track only)

- **URL (verbatim):** https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c
- **Hosted by:** Binance (app.binance.com survey deep-link; opens in the Binance app)
- **For:** Agent Ecosystem Promotion Award — submit your X post link (post must include #BinanceWalletHackathon and #AgenticWallet). 20 winners share 2,000 USDC equally ($100 each) based on post quality.
- **NOT for:** project submissions (Pioneer Award / Innovation Award).

## Project submission — what the announcement DOES say (no form yet)

Exact required materials named in the announcement (step 3, "How to Participate"):

- Project name
- Website
- Contract address(es)
- Agent ID usage description
- "Other required materials" — **not enumerated anywhere in the announcement**

Other facts the announcement implies about the (not yet published) submission:

- **Reward receiving address:** the Terms say "Rewards will be sent to the reward receiving address provided during project submission." So the form will ask for a payout/reward-receiving wallet address. (Chain not stated; presumably a BNB Chain USDC-receiving address.)
- **One project per team:** "Each team may submit one project only."
- **No registration needed** (per step 3) — i.e. no pre-registration step; submission itself is the entry.
- **Prerequisites before submitting:** contracts deployed on BNB Chain, source code verified + open-sourced on BscScan; product must actively use Agent ID. Innovation Award additionally requires the product to be live with ≥30 Agent ID addresses interacting with the submitted contract(s) during the Submission Period.
- **Only submitted contract addresses count** for the Pioneer Award metrics (including token contracts); interacting addresses must hold an Agent ID.
- **No file-upload requirements stated** anywhere (no repo link, demo video, or deck is named in the announcement — unlike BNB Hack editions, which explicitly require a public repo + demo video + DevEx report). Do not assume uploads are/aren't required; the form will define this when it appears.

## Deadlines (exact, from the announcement)

| Milestone | UTC | WIB (UTC+7) |
|---|---|---|
| Submission Period opens | 2026-11-18 08:00 UTC | 2026-11-18 15:00 WIB |
| **Submission Period closes (deadline)** | **2026-12-09 08:00 UTC** | **2026-12-09 15:00 WIB** |
| Internal Review Period | 2026-12-09 08:00 → 2026-12-17 08:00 UTC | 2026-12-09 15:00 → 2026-12-17 15:00 WIB |
| Public Review Period | 2026-12-17 08:00 → 2026-12-20 08:00 UTC | 2026-12-17 15:00 → 2026-12-20 15:00 WIB |

## Winners: contact / payment (what the announcement states)

- **How winners are announced:** "Binance Wallet team officially announces the winning projects and final results" (Innovation Award); Pioneer Award rankings are computed from on-chain data by the Binance Wallet team.
- **Payment:** "Rewards will be distributed **within 14 business days after the public announcement period ends** to eligible winning projects. Rewards will be sent to the **reward receiving address provided during project submission**." Public announcement period ends 2026-12-20 08:00 UTC, so payout is due by roughly early January 2027 (14 business days after 20 Dec 2026, exact date depends on business-day counting).
- **Eligibility condition for payout:** "Only users who maintain an active Binance Account on the Binance Platform are eligible… Tokens will **not** be distributed to users who delete or deactivate their Binance Wallets and/or their Binance Accounts."
- **Extra winner perks:** the 20 winning projects (10 per award) each additionally receive one eligibility spot to claim a **two-digit Agent ID** (higher-ranking projects get priority in selection); exceptionally outstanding winners are featured on the Binance Wallet Agentic Wallet ecosystem page and in future Agent ID campaigns.
- **Cheating reports:** email audit@binance.com or the risk-reporting channel, any time from event start until the end of the public announcement period; verified reporters receive a corresponding reward. Binance reserves the right of final determination on winners/rankings in disputes.
- **No other contact method is stated** (no email to winners, no KYC/invoice step mentioned — unlike Immunefi bounties). Do not expect a separate contact step unless a later update adds one.

## Prize structure (for reference)

- Total 60,000 USDC. Project Awards 58,000 USDC: Pioneer Award 29,000 (1st 10,000; 2nd 6,000; 3rd 4,000; 4th 3,000; 5th 2,000; 6th–10th 800 each) + Innovation Award 29,000 (same split). Each project may receive only one award. Community Promotion 2,000 USDC (20 × $100).

## When / where to re-check for the portal

The portal is most likely to appear as an **update/edit to the announcement itself**, a **Binance Wallet / BNB Chain X post**, or a **BNB Chain blog post**. Re-check:

1. The announcement page itself: https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf (watch for a new link in step 3 or a new "Submit here" section).
2. X: @BinanceWallet and @BNBCHAIN — search "Agent ID Hackathon" / #BinanceWalletHackathon for a submission-link post.
3. BNB Chain blog: https://www.bnbchain.org/en/blog (a hackathon post may be published later, as with past BNB Hack editions).
4. DoraHacks: search dorahacks.io for an Agent ID / BNB hackathon page (past BNB Hack editions used DoraHacks; none exists for this one yet).

**Suggested re-check cadence:** daily until a link appears; the submission window runs 3 weeks (until 9 Dec 2026 15:00 WIB), so there is time, but the form could appear at any point and the on-chain activity clock is already running (only activity during the Submission Period counts).

## Safety note

Until Binance publishes an official project-submission link, **do not trust any third-party "submit here" link** (Google Form, DoraHacks clone, Telegram bot, etc.) claiming to collect Agent ID Hackathon project submissions — the announcement names no such channel. Only a link published on binance.com, @BinanceWallet, @BNBCHAIN, or bnbchain.org should be treated as official.

## Sources

- Binance announcement (support): https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf (dated 2026-11-18; full text read 2026-11-18 ~12:00 UTC)
- Binance Square mirror: https://www.binance.com/en/square/post/389517345917641
- Community survey (X-post track only): https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c
- Agent ID contract (BNB Chain, from announcement): 0x60b9262456de011f7d15a54cdd8c48baaa8b022f (SPACE ID Agent ID, ERC-721, non-transferable)
- Developer resources in announcement: Agentic Wallet intro https://web3.binance.com/en/dev-docs/products/agentic-wallet/introduction ; Agent OS https://www.binance.com/en/agent-os ; BNB Agent Studio docs https://docs.bnbchain.org/developer-kit/bnbchain-studio/
