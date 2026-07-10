import Link from "next/link";

const endpoints = [
  { name: "Fixtures", url: "GET /api/matches", desc: "List all tracked fixtures with trust status, margin, and last check time." },
  { name: "Overview", url: "GET /api/overview", desc: "Aggregate trust score, total checks, flagged markets, and consistency rate." },
  { name: "Proof Feed", url: "GET /api/proof-feed", desc: "Cursor-paginated proof log with SSE and WebSocket live streaming." },
  { name: "Oracle Query", url: "GET /api/oracle/query/:fixtureId", desc: "Query on-chain trust status for a specific fixture." },
  { name: "Oracle Submit", url: "POST /api/oracle/submit", desc: "Submit a consistency check result to the on-chain oracle." },
  { name: "Network Health", url: "GET /api/network-health", desc: "Solana slot, connected agents, and live health indicators." },
];

const architecture = [
  {
    step: "01",
    title: "Data Ingestion",
    desc: "Live odds are streamed from TxLINE via WebSocket. Each odds update triggers a consistency check across all active markets for the fixture.",
    color: "text-pitch-green",
  },
  {
    step: "02",
    title: "Consistency Detection",
    desc: "The core engine computes implied probabilities and checks whether the sum exceeds the 105% threshold. Multi-market covering sets ensure comprehensive coverage.",
    color: "text-pitch-green",
  },
  {
    step: "03",
    title: "Anomaly Scoring",
    desc: "Flagged fixtures are scored by deviation magnitude. Markets with margins above 5% are escalated. Arbitrage opportunities are detected and optimal stakes computed.",
    color: "text-signal-amber",
  },
  {
    step: "04",
    title: "On-Chain Commitment",
    desc: "Consistency proofs are submitted to Solana via the OddsTrust Anchor program. Each proof includes a SHA-256 hash of the odds snapshot and the check result.",
    color: "text-pitch-green",
  },
  {
    step: "05",
    title: "Composability Gate",
    desc: "External agents query the oracle before executing trades. The gate resolves EXECUTED or BLOCKED based on live oracle state, enabling trustless composability.",
    color: "text-pitch-green",
  },
];

export default function DocsPage() {
  return (
    <section className="py-12">
      <div className="max-w-3xl mb-10">
        <p className="font-mono text-[11px] text-pitch-green uppercase tracking-wider mb-2">Documentation</p>
        <h1 className="text-2xl sm:text-3xl font-[500] mb-4">How OddsTrust Works</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          OddsTrust is an autonomous on-chain trust oracle that verifies the consistency of sports
          betting odds across multiple markets. It uses the &Sigma;(1/odds) formula to detect anomalies,
          computes arbitrage opportunities, and publishes cryptographic proofs to Solana.
        </p>
      </div>

      {/* Architecture Pipeline */}
      <div className="mb-12">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-6" id="architecture">Architecture Pipeline</h2>
        <div className="space-y-3">
          {architecture.map((item) => (
            <div key={item.step} className="flex gap-4 p-5 bg-bg-raised border border-line-hairline rounded-lg">
              <span className={`font-mono text-sm shrink-0 font-[500] ${item.color}`}>{item.step}</span>
              <div>
                <p className="text-sm text-text-primary font-[500] mb-1">{item.title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consistency Formula */}
      <div className="grid lg:grid-cols-2 gap-6 mb-12" id="formula">
        <div className="bg-bg-raised border border-line-hairline rounded-lg p-6">
          <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">The Consistency Formula</h2>
          <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
            <p>For any given market, OddsTrust computes the <strong>implied probability</strong> of each outcome as the reciprocal of its decimal odds:</p>
            <div className="font-mono text-sm text-text-primary bg-bg-void border border-line-hairline rounded p-3 text-center">
              P(outcome) = 1 / odds<sub>outcome</sub>
            </div>
            <p>In an efficient market, the sum of implied probabilities across all mutually exclusive outcomes should equal 1.0 (100%):</p>
            <div className="font-mono text-sm text-text-primary bg-bg-void border border-line-hairline rounded p-3 text-center">
              &Sigma;(1/odds<sub>i</sub>) = 1.0
            </div>
            <p>In practice, bookmakers build in a margin. OddsTrust flags any fixture where the total implied probability exceeds <strong>1.05 (105%)</strong>, indicating potential inconsistency or manipulation.</p>
          </div>
        </div>

        <div className="bg-bg-raised border border-line-hairline rounded-lg p-6">
          <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">Worked Example</h2>
          <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
            <p>Consider a Match Winner market for Brazil vs Argentina:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[12px]">
                <thead>
                  <tr className="border-b border-line-hairline">
                    <th className="py-2 pr-4 text-text-tertiary">Outcome</th>
                    <th className="py-2 pr-4 text-text-tertiary">Odds</th>
                    <th className="py-2 pr-4 text-text-tertiary">1/Odds</th>
                    <th className="py-2 text-text-tertiary">Implied Prob.</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { outcome: "Brazil (Home)", odds: "1.85", inv: "0.5405", prob: "54.05%" },
                    { outcome: "Draw", odds: "3.40", inv: "0.2941", prob: "29.41%" },
                    { outcome: "Argentina (Away)", odds: "2.10", inv: "0.4762", prob: "47.62%" },
                  ].map((r) => (
                    <tr key={r.outcome} className="border-b border-line-hairline/40">
                      <td className="py-2 pr-4 text-text-primary">{r.outcome}</td>
                      <td className="py-2 pr-4 text-text-secondary">{r.odds}</td>
                      <td className="py-2 pr-4 text-text-secondary">{r.inv}</td>
                      <td className="py-2 text-text-primary">{r.prob}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="py-2 pr-4 font-[500] text-text-primary">Sum</td>
                    <td className="py-2 pr-4 text-signal-amber">1.3108</td>
                    <td className="py-2 text-signal-amber">131.08%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              The total implied probability is <strong>131.08%</strong>, well above the 105% threshold.
              This market would be <span className="text-signal-amber font-[500]">FLAGGED</span> as potentially inconsistent.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Markets */}
      <div className="mb-12">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-6" id="markets">Supported Markets</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Match Winner", outcomes: "Home, Draw, Away", icon: "1X2" },
            { name: "Double Chance", outcomes: "1X, 12, 2X", icon: "DC" },
            { name: "Over/Under 0.5", outcomes: "Over, Under", icon: "O/U" },
            { name: "Over/Under 1.5", outcomes: "Over, Under", icon: "O/U" },
            { name: "Over/Under 2.5", outcomes: "Over, Under", icon: "O/U" },
            { name: "Over/Under 3.5", outcomes: "Over, Under", icon: "O/U" },
            { name: "Over/Under 4.5", outcomes: "Over, Under", icon: "O/U" },
            { name: "Both Teams Score", outcomes: "Yes, No", icon: "BTS" },
            { name: "Correct Score", outcomes: "All scorelines", icon: "CS" },
          ].map((m) => (
            <div key={m.name} className="bg-bg-raised border border-line-hairline rounded-lg p-4 flex items-start gap-3">
              <span className="font-mono text-[10px] text-pitch-green bg-pitch-green/10 border border-pitch-green/20 rounded px-1.5 py-0.5 shrink-0">{m.icon}</span>
              <div>
                <p className="text-xs text-text-primary font-[500]">{m.name}</p>
                <p className="font-mono text-[10px] text-text-tertiary mt-0.5">{m.outcomes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="mb-12" id="api">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-6">API Endpoints</h2>
        <div className="bg-bg-raised border border-line-hairline rounded-lg overflow-hidden">
          <div className="divide-y divide-line-hairline/50">
            {endpoints.map((ep) => (
              <div key={ep.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4">
                <div className="shrink-0 w-28">
                  <span className="text-xs text-text-primary font-[500]">{ep.name}</span>
                </div>
                <div className="shrink-0 sm:w-52">
                  <span className="font-mono text-[11px] text-pitch-green">{ep.url}</span>
                </div>
                <p className="text-[11px] text-text-tertiary leading-relaxed">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* On-Chain Program */}
      <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 max-w-2xl mb-12" id="program">
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">On-Chain Program</h2>
        <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
          <p>Consistency proofs are committed to Solana via an Anchor program. Each check generates a SHA-256 hash stored on-chain and independently verifiable.</p>
          <div className="font-mono text-sm text-text-primary bg-bg-void border border-line-hairline rounded p-3">
            <span className="text-text-tertiary">Program ID: </span>HooVY5etEhNnPWouvZhzGCgbTjBfk3mff66S8jFgaAit
          </div>
          <p>The program supports four instructions:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="font-mono text-[11px] text-text-secondary">
              <span className="text-pitch-green">initialize_config</span> &mdash; Set up oracle authority and thresholds
            </li>
            <li className="font-mono text-[11px] text-text-secondary">
              <span className="text-pitch-green">submit_check</span> &mdash; Submit a consistency check result
            </li>
            <li className="font-mono text-[11px] text-text-secondary">
              <span className="text-pitch-green">query_trust</span> &mdash; Read trust status for a fixture
            </li>
            <li className="font-mono text-[11px] text-text-secondary">
              <span className="text-pitch-green">trading_agent_check</span> &mdash; Gate an agent action based on oracle state
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mb-12" id="quickstart">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-6">Quick Start</h2>
        <div className="bg-bg-raised border border-line-hairline rounded-lg p-6">
          <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
            <p>Get OddsTrust running locally in three steps:</p>
            <div className="font-mono text-[12px] bg-bg-void border border-line-hairline rounded p-4 space-y-2">
              <p className="text-text-tertiary"># 1. Install dependencies</p>
              <p className="text-text-primary">pnpm install</p>
              <p className="text-text-tertiary mt-3"># 2. Configure environment</p>
              <p className="text-text-primary">cp .env.example apps/web/.env.local</p>
              <p className="text-text-primary">pnpm --filter @oddtrust/web setup</p>
              <p className="text-text-tertiary mt-3"># 3. Start all services</p>
              <p className="text-text-primary">pnpm dev</p>
            </div>
            <p>This starts the Next.js dashboard (port 3000), WebSocket server (port 3002), background worker, and the Fastify backend (port 3001).</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="font-mono text-xs text-text-secondary hover:text-text-primary transition-colors no-underline">
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}
