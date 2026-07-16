# TxLINE Scores feed client (placeholder)

This folder is reserved for a future real TxLINE Scores-feed SSE
client. It intentionally consumes **only** the Scores API, never the
Odds/StablePrice API — per the Kickstar PRD, odds/betting data must
never be shown to the user.

Not implemented yet. The simulated event generator in
`src/app/dashboard/DashboardClient.js` produces `MatchEvent` objects
(see `src/app/lib/matchEvents.js`) tagged `source: 'simulated'`. A
real client added here would produce the same `MatchEvent` shape
tagged `source: 'txodds-live'`, so downstream consumers (Why Engine,
momentum indicators) don't need to change when a live feed is wired
in.

Real integration requires TxLINE's Solana-wallet-gated auth flow:
on-chain `subscribe` transaction → guest JWT (`/auth/guest/start`) →
wallet-signed activation (`/token/activate`) → `X-Api-Token` header
for the Scores SSE stream.
