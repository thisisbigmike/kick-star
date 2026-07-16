# Kickstar — Handoff

Status as of 2026-07-16. Submission deadline: **July 19, 2026** (Superteam Earn / TxODDS World Cup Hackathon).

## What this is

Kickstar is a zero-reading football companion app: tap-only onboarding, a Solana Fan Pass (compressed NFT), tap-to-predict micro-challenges, and a "Why Engine" that explains live match moments out loud in Pidgin. See `Kick Star PRD.pdf` for the full spec.

The codebase started life as a different product (a Web3 prediction-market/token-staking app called "matchsass") and has been realigned to the PRD in 7 phases — all shipped. Package name (`matchsass-next`) and the `matchsass-user-auth` localStorage key are historical, left as-is since renaming them isn't required for correctness.

## What's built and working now

- **Icon-based onboarding** (`src/app/components/Header.js`, `src/app/components/onboarding/ClubPicker.js`) — tap a club flag, tap "Connect Wallet" (real `@solana/wallet-adapter-react`, Phantom/Solflare). Zero typed fields anywhere in `src/app`.
- **No gambling/odds surface** — the entire prediction-market/staking subsystem (buy/sell shares, $SASS staking, literal "Odds: 2.1x" labels) has been removed from `src/app/dashboard/DashboardClient.js`. Predictions are tap-only and earn XP, never show odds.
- **XP-based leaderboard** (`DashboardClient.js`, `leaderboard` tab) — ranked by points/streak only, tiers derived from XP thresholds, no stake column.
- **Animated XP reveal** (`src/app/components/onboarding/XPReveal.js`) — full-screen visual reward reveal on prediction resolution, replacing the old silent balance bump.
- **Why Engine** (`src/app/lib/whyEngine/`) — structured `MatchEvent`s (`src/app/lib/matchEvents.js`) drive a deterministic Pidgin-text generator (`pidgin.js`) and a **real** Abena AI TTS call (`ttsProvider.js`, voice ID `james_pcm`). Works today with zero API key (Abena's free tier is keyless for the first 50 requests/session). One-tap "Why" button lives on each live match card (`src/app/components/dashboard/WhyButton.js`), with a pre-warm-on-mount call to absorb Abena's ~10-15s first-call cold start.
- **Real Solana devnet cNFT minting** (`src/app/lib/solana/`) — `mintClient.js` makes a real Bubblegum `mintV1` call via the connected wallet-adapter signer, not a fabricated tx hash. Falls back to an honestly-labeled "PENDING SYNC" state (not a fake "CONFIRMED") when no merkle tree is configured or the mint fails.
- **Marketing copy** (Hero/Features/FAQ/Footer/layout metadata) rewritten to describe the actual product — zero `$SASS`/"predictive reward portal"/"consensus odds" language left in `src/app`.

Verified: `pnpm lint` clean (only pre-existing `<img>`/`useEffect`-deps warnings, no errors), `pnpm build` succeeds, both `/` and `/dashboard` render with no runtime errors.

## What's NOT done / blocked on you

These require actions outside what code changes alone can do:

1. **Devnet wallet + merkle tree** (Fan Pass / prediction-receipt minting). Steps:
   ```bash
   solana-keygen new -o ~/.config/solana/devnet.json
   solana airdrop 2 <pubkey-from-above> --url devnet   # faucet is rate-limited, retry or use a web faucet
   SOLANA_KEYPAIR_PATH=~/.config/solana/devnet.json node scripts/setup-merkle-tree.js
   ```
   Copy the printed tree address into `.env.local` as `NEXT_PUBLIC_MERKLE_TREE_ADDRESS`. Until this is set, minting shows the honest "not configured" fallback instead of a fake receipt — the app doesn't break, but the on-chain proof isn't real yet.

2. **Abena AI API key** — only needed if the free 50-request/session quota gets exhausted during demo rehearsal. Add it to `.env.local` as `NEXT_PUBLIC_ABENA_API_KEY` if that happens. Not needed to demo today.

3. **Real visual assets** — club badges/player photos for onboarding are currently flag emoji placeholders (`src/app/components/onboarding/ClubPicker.js`). No Fan Pass trophy/badge art exists yet either. Fine for a demo, but worth a real asset pass if there's time.

4. **`@metaplex-foundation/umi` peer-dependency mismatch** — `mpl-bubblegum`'s own transitive dependency (`mpl-token-metadata@3.2.1`) still wants `umi <1`, while the rest of the umi ecosystem is on `1.5.1`. This is an upstream Metaplex lag, not something fixable from here. It's a non-fatal `pnpm install` warning today; if Bubblegum bumps `mpl-token-metadata` in a future release, this may resolve itself, or may need pinning to an exact working version set.

## Key files if you're picking this up

| Area | File |
|---|---|
| Event schema | `src/app/lib/matchEvents.js` |
| Why Engine (Pidgin text) | `src/app/lib/whyEngine/pidgin.js` |
| Why Engine (TTS adapter) | `src/app/lib/whyEngine/ttsProvider.js` |
| Solana minting | `src/app/lib/solana/mintClient.js`, `mintFanPass.js`, `mintPredictionReceipt.js` |
| Merkle tree setup (run once) | `scripts/setup-merkle-tree.js` |
| Onboarding | `src/app/components/Header.js`, `src/app/components/onboarding/ClubPicker.js` |
| Main dashboard | `src/app/dashboard/DashboardClient.js` (2000+ lines — tabs: dashboard, markets/live+predict, rewards, leaderboard) |
| Design tokens | `src/app/styles/base.css` (matches PRD §7.1 palette/type exactly) |

## Running locally

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build     # production build check
pnpm lint
```
