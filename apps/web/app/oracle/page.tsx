import { GatePanel } from "@oddtrust/ui";

export default function OraclePage() {
  return (
    <section className="py-12 max-w-3xl">
      <h1 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-2">Oracle Composability</h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-8">
        OddsTrust is designed to be queried by other on-chain agents before they execute trades,
        adjust liquidity, or place hedges. The oracle gates any action based on live consistency
        verification of the underlying odds markets.
      </p>

      <GatePanel />

      <div className="mt-12 bg-bg-raised border border-line-hairline rounded-lg p-6">
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">How It Works</h2>
        <ol className="space-y-3 text-xs leading-relaxed text-text-secondary">
          {[
            ["01", "Agent submits a proposed action (trade, liquidity adjustment, hedge) to the OddsTrust oracle gate.", "text-pitch-green"],
            ["02", "Oracle checks the relevant fixture&apos;s margin across all active markets for consistency.", "text-pitch-green"],
            ["03", "If margins are within threshold (&lt;5% deviation), the action is EXECUTED and recorded on-chain.", "text-pitch-green"],
            ["04", "If an anomaly is detected, the action is BLOCKED and the reason is logged with a proof hash.", "text-signal-red"],
          ].map(([num, text, color]) => (
            <li key={num as string} className="flex gap-3">
              <span className={`font-mono shrink-0 font-[500] ${color as string}`}>{num as string}</span>
              <span dangerouslySetInnerHTML={{ __html: text as string }} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
