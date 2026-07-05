const txlineEndpoints = [
  { name: 'Fixtures', endpoint: 'https://txline-api.com/v1/fixtures', description: 'List of all live and upcoming fixtures with metadata.' },
  { name: 'Odds/StablePrice', endpoint: 'https://txline-api.com/v1/odds/stream', description: 'Real-time streaming odds data with stable price anchoring.' },
  { name: 'Validation Proofs', endpoint: 'https://txline-api.com/v1/proofs', description: 'On-chain proof retrieval for committed consistency checks.' },
];

export default function DocsPage() {
  return (
    <section className="px-6" style={{ paddingTop: 'var(--section-gap)', paddingBottom: 'var(--section-gap)' }}>
      <div className="mx-auto max-w-3xl">
        <h1
          className="mb-2 text-sm font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          How It Works
        </h1>
        <p
          className="mb-8 text-sm leading-relaxed text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
        >
          OddsTrust is an on-chain trust oracle that verifies the consistency of sports betting odds
          across multiple markets. It uses the &Sigma;(1/odds) formula to detect anomalies and publishes
          proofs to Solana.
        </p>

        <div className="mb-10 rounded-[var(--card-radius)] border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)]" style={{ padding: 'var(--card-padding)' }}>
          <h2
            className="mb-4 text-xs font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            The Consistency Formula
          </h2>
          <div className="space-y-4 text-xs leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}>
            <p>
              For any given market, OddsTrust computes the <strong>implied probability</strong> of each
              outcome as the reciprocal of its decimal odds:
            </p>
            <div
              className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-void)] p-3 text-center text-sm"
              style={{ fontFamily: 'var(--font-martian-mono), monospace', color: 'var(--color-text-primary)' }}
            >
              P(outcome) = 1 / odds<sub>outcome</sub>
            </div>
            <p>
              In an efficient market, the sum of implied probabilities across all mutually exclusive
              outcomes should equal 1.0 (100%):
            </p>
            <div
              className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-void)] p-3 text-center text-sm"
              style={{ fontFamily: 'var(--font-martian-mono), monospace', color: 'var(--color-text-primary)' }}
            >
              &Sigma;(1/odds<sub>i</sub>) = 1.0
            </div>
            <p>
              In practice, bookmakers build in a margin. OddsTrust flags any fixture where the total
              implied probability exceeds <strong>1.05 (105%)</strong>, indicating potential
              inconsistency or manipulation.
            </p>
          </div>
        </div>

        <div className="mb-10 rounded-[var(--card-radius)] border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)]" style={{ padding: 'var(--card-padding)' }}>
          <h2
            className="mb-4 text-xs font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Worked Example
          </h2>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}>
            <p>Consider a Match Winner market for Brazil vs Argentina:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]"
                style={{ fontFamily: 'var(--font-martian-mono), monospace' }}>
                <thead>
                  <tr className="border-b border-[var(--color-line-hairline)]">
                    <th className="py-2 pr-4 text-[var(--color-text-tertiary)]">Outcome</th>
                    <th className="py-2 pr-4 text-[var(--color-text-tertiary)]">Odds</th>
                    <th className="py-2 pr-4 text-[var(--color-text-tertiary)]">1/Odds</th>
                    <th className="py-2 text-[var(--color-text-tertiary)]">Implied Prob.</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { outcome: 'Brazil (Home)', odds: '1.85', inv: '0.5405', prob: '54.05%' },
                    { outcome: 'Draw', odds: '3.40', inv: '0.2941', prob: '29.41%' },
                    { outcome: 'Argentina (Away)', odds: '2.10', inv: '0.4762', prob: '47.62%' },
                  ].map((row) => (
                    <tr key={row.outcome} className="border-b border-[var(--color-line-hairline)]/40">
                      <td className="py-2 pr-4 text-[var(--color-text-primary)]">{row.outcome}</td>
                      <td className="py-2 pr-4 text-[var(--color-text-secondary)]">{row.odds}</td>
                      <td className="py-2 pr-4 text-[var(--color-text-secondary)]">{row.inv}</td>
                      <td className="py-2 text-[var(--color-text-primary)]">{row.prob}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="py-2 pr-4 font-[500] text-[var(--color-text-primary)]">Sum</td>
                    <td className="py-2 pr-4 text-[var(--color-signal-amber)]">1.3108</td>
                    <td className="py-2 text-[var(--color-signal-amber)]">131.08%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              The total implied probability is <strong>131.08%</strong>, well above the 105% threshold.
              This market would be <span className="text-[var(--color-signal-amber)] font-[500]">FLAGGED</span> as
              potentially inconsistent.
            </p>
          </div>
        </div>

        <div className="mb-10 rounded-[var(--card-radius)] border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)]" style={{ padding: 'var(--card-padding)' }}>
          <h2
            className="mb-4 text-xs font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            TxLINE API Endpoints
          </h2>
          <div className="space-y-4">
            {txlineEndpoints.map((ep) => (
              <div key={ep.name}
                className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-void)] p-3"
              >
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className="text-xs font-[500] text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {ep.name}
                  </span>
                  <span
                    className="text-[11px] text-[var(--color-pitch-green)]"
                    style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
                  >
                    {ep.endpoint}
                  </span>
                </div>
                <p
                  className="text-[11px] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
                >
                  {ep.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--card-radius)] border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)]" style={{ padding: 'var(--card-padding)' }}>
          <h2
            className="mb-4 text-xs font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            On-Chain Program
          </h2>
          <div className="space-y-3 text-xs leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}>
            <p>
              Consistency proofs are committed to the Solana devnet. Each check generates a
              hash that is stored on-chain and can be independently verified.
            </p>
            <div
              className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-void)] p-3"
              style={{ fontFamily: 'var(--font-martian-mono), monospace', color: 'var(--color-text-primary)' }}
            >
              <span className="text-[var(--color-text-tertiary)]">Program ID: </span>
              7oDTrust...3aF9
            </div>
            <p>
              All verification logic runs on-chain via Anchor. The program accepts fixture data,
              computes the &Sigma;(1/odds) check, and emits a proof event that is picked up by the
              OddsTrust indexer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
