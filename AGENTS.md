<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:oddtrust-agent-rules -->
# OddsTrust — On-Chain Trust Oracle

## Architecture
- Monorepo: pnpm workspaces + Turborepo
- `apps/web` — Next.js 16 App Router with Tailwind v4
- `packages/ui` — All React components, must use `'use client'`
- `packages/design-tokens` — Colors, typography, spacing
- `packages/utils` — Pure functions only

## Typography
- Fraunces (serif) for: wordmark, headings, UI labels, body text
- Martian Mono (monospace) for: ALL data/numbers (odds, scores, hashes, timestamps, slots)
- NEVER use Inter, Space Grotesk, Geist, or Geist Mono

## Colors
- `--pitch-green (#39FF6A)` = consistent/approved signal
- `--signal-amber (#FFB13C)` = flagged/inconsistency warning
- `--signal-red (#FF4D4D)` = blocked/failed
- `--trophy-gold (#D4AF6A)` = tournament trust score ONLY (appears once)
- Everything else stays desaturated

## Key Sections (in order)
1. Background (atmosphere layer)
2. TopStrip (wordmark + oracle status + slot)
3. Hero (tournament trust score with count-up)
4. MatchGrid (fixture cards with badges + margins)
5. GatePanel (composability demo with scroll-reveal)
6. ProofFeed (terminal-style on-chain log)
7. Network stats bar + footer

## Motions
- Page load: wordmark → status badge → score count-up (800ms) → stats → match grid (80ms stagger)
- Gate panel: scroll-triggered agent animation with random EXECUTED/BLOCKED resolution
- Proof feed: new entries slide in from top every 4s
- Cards: 120ms lift on hover, no bounce
<!-- END:oddtrust-agent-rules -->
