const endpoints = [
  { name: "Fixtures", url: "https://txline-api.com/v1/fixtures", desc: "List of all live and upcoming fixtures with metadata." },
  { name: "Odds / StablePrice", url: "https://txline-api.com/v1/odds/stream", desc: "Real-time streaming odds data with stable price anchoring." },
  { name: "Validation Proofs", url: "https://txline-api.com/v1/proofs", desc: "On-chain proof retrieval for committed consistency checks." },
];

export default function DocsPage() {
  return (
    <section className="py-12 max-w-3xl">
      <h1 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-2">How It Works</h1>
      <p className="text-sm text-text-tertiary leading-relaxed mb-10">
        OddsTrust is an on-chain trust oracle that verifies the consistency of sports betting odds
        across multiple markets. It uses the &Sigma;(1/odds) formula to detect anomalies and publishes
        proofs to Solana.
      </p>

      <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 mb-8">
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

      <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 mb-8">
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

      <div className="bg-bg-raised border border-line-hairline rounded-lg p-6 mb-8">
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">TxLINE API Endpoints</h2>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div key={ep.name} className="bg-bg-void border border-line-hairline rounded p-3">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs text-text-primary">{ep.name}</span>
                <span className="font-mono text-[11px] text-pitch-green">{ep.url}</span>
              </div>
              <p className="text-[11px] text-text-tertiary">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-raised border border-line-hairline rounded-lg p-6">
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">On-Chain Program</h2>
        <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
          <p>Consistency proofs are committed to the Solana devnet. Each check generates a hash stored on-chain and independently verifiable.</p>
          <div className="font-mono text-sm text-text-primary bg-bg-void border border-line-hairline rounded p-3">
            <span className="text-text-tertiary">Program ID: </span>7oDTrust...3aF9
          </div>
          <p>All verification logic runs on-chain via Anchor. The program accepts fixture data, computes the &Sigma;(1/odds) check, and emits a proof event picked up by the OddsTrust indexer.</p>
        </div>
      </div>
    </section>
  );
}
