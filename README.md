# OddsTrust — On-Chain Trust Oracle

**Infrastructure that verifies sportsbook odds consistency before agents act.**

OddsTrust is an on-chain oracle that evaluates betting markets using the **Σ(1/odds)** formula — the sum of implied probabilities across all outcomes in a market. Infrastructure agents (arbitrage bots, hedge managers, liquidity providers) query OddsTrust before executing trades. If margins are healthy, the oracle signs off. If the sum exceeds ~105%, it flags the market and logs an on-chain proof.

This is not a consumer betting application. It is **infrastructure that agents read from**.

---

## The Problem

Sportsbook odds across different books and markets are rarely consistent. A set of outcomes whose implied probabilities sum to >105% signals structural inefficiency — either a pricing error or deliberate mispricing. Agents acting on these markets without verification risk execution against bad data.

## The Solution

OddsTrust applies a single, transparent check:

```
For each outcome i in a market:
    implied_probability_i = 1 / decimal_odds_i

Market margin = Σ(implied_probability_i)

if margin > 1.05 → BLOCKED (anomaly detected, proof logged)
if margin ≤ 1.05 → EXECUTED (consistent, safe to trade)
```

In an efficient market, the sum of implied probabilities equals **1.0 (100%)**. OddsTrust flags any market exceeding **1.05 (105%)** and records the detection as an on-chain proof for downstream agents to consume.

---

## Architecture

```
oddtrust/
├── apps/
│   └── web/                     Next.js 16 app — the oracle UI
├── packages/
│   ├── design-tokens/           Colors, typography, spacing constants
│   ├── ui/                      All React components (every page section)
│   └── utils/                   Pure utility functions (formatters)
├── turbo.json                   Turborepo pipeline configuration
└── pnpm-workspace.yaml          Workspace definition
```

The monorepo follows a **shared-first** rule: logic lives in `packages/` unless it has to be in `apps/web`. The web application is thin — it imports and assembles rather than defines.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + Turbopack |
| Monorepo | pnpm workspaces + Turborepo |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 with custom design tokens |
| Fonts | Fraunces (serif/display) · Martian Mono (data/monospace) |
| Deployment | Static export via `next build` |
| CI | GitHub Actions — lint, typecheck, build |

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — Hero trust score, network stats, match grid preview, proof feed |
| `/matches` | Full match grid with filter (all/consistent/flagged) and sort controls |
| `/matches/[id]` | Match detail — market-by-market odds breakdown with margin calculation |
| `/oracle` | Oracle composability demo — GatePanel agent simulation |
| `/proof-feed` | Full-page terminal-style on-chain detection log |
| `/docs` | Consistency formula explanation, worked examples, API reference |

---

## Sections

All sections are built as shared components in `packages/ui`:

| Component | Description |
|---|---|
| **Background** | Atmospheric layer — radial gradient, grid overlay, scanline effect, glow sweep |
| **TopStrip** | Wordmark, navigation, live oracle status indicator, slot ticker |
| **Hero** | Tournament Trust Score with count-up animation (800ms) and audit statistics |
| **MatchGrid** | Fixture cards with consistency badges and live margin display |
| **GatePanel** | Scroll-triggered composability demo — simulated agent pipeline |
| **ProofFeed** | Terminal-style log — new entries slide in every 4 seconds |

---

## Design System

The palette draws from night-match broadcast and Bloomberg terminal aesthetics.

| Token | Value | Usage |
|---|---|---|
| `--bg-void` | `#0A0D0B` | Primary background |
| `--bg-panel` | `#121815` | Elevated surfaces |
| `--pitch-green` | `#39FF6A` | Dominant accent — consistency signal |
| `--signal-amber` | `#FFB13C` | Warning — flagged inconsistency |
| `--signal-red` | `#FF4D4D` | Blocked / failed check |
| `--trophy-gold` | `#D4AF6A` | Tournament trust score (used once) |

**Typography:** Fraunces for identity, headlines, UI labels, and body text. Martian Mono for all data — odds, scores, hashes, timestamps, and slots. Inter, Space Grotesk, Geist, and Geist Mono are not used.

---

## Getting Started

```bash
pnpm install
pnpm dev              # Start all workspace apps in development
pnpm build            # Production build
pnpm lint             # Run ESLint across all packages
pnpm typecheck        # TypeScript type checking
```

Run only the web application:

```bash
pnpm --filter @oddtrust/web dev
```

---

## Development

### Adding a Component

1. Create `packages/ui/src/components/[Name]/[Name].tsx` as a client component (`'use client'`)
2. Create `packages/ui/src/components/[Name]/index.ts` as a barrel export
3. Re-export from `packages/ui/src/index.ts`
4. Import in `apps/web/app/page.tsx`

### Code Style

- No comments in production code. Refactor for clarity instead.
- Tailwind utility classes over custom CSS.
- CSS custom properties (`var(--color-*)`) from the design token set.
- Interactive components use `'use client'`.
- Fraunces for display and body text; Martian Mono for all data and numbers.
- TypeScript strict mode. Avoid `any`. Prefer explicit types for public APIs.

### Commit Convention

This project uses conventional commits:

```
feat:  new feature
fix:   bug fix
docs:  documentation
style: formatting, design
refactor: code restructuring
chore: tooling, dependencies, CI
```

---

## License

MIT — see [LICENSE](LICENSE).
