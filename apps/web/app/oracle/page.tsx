import { GatePanel } from "@oddtrust/ui";

export default function OraclePage() {
  return (
    <section className="py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-sm uppercase tracking-[0.12em] text-text-secondary">
          Oracle Composability
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-text-secondary">
          OddsTrust is designed to be queried by other on-chain agents before they execute trades,
          adjust liquidity, or place hedges. The oracle gates any action based on live consistency
          verification of the underlying odds markets.
        </p>
      </div>

      <div className="mb-8">
        <GatePanel />
      </div>

      <div className="rounded-lg border border-line-hairline bg-bg-panel p-6">
        <h2 className="mb-3 text-xs uppercase tracking-[0.12em] text-text-secondary">
          How It Works
        </h2>
        <ol className="space-y-3 text-xs leading-relaxed text-text-secondary">
          <li className="flex gap-3">
            <span className="font-mono-data shrink-0 font-[500] text-pitch-green">01</span>
            <span>Agent submits a proposed action (trade, liquidity adjustment, hedge) to the OddsTrust oracle gate.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono-data shrink-0 font-[500] text-pitch-green">02</span>
            <span>Oracle checks the relevant fixture&apos;s margin across all active markets for consistency.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono-data shrink-0 font-[500] text-pitch-green">03</span>
            <span>If margins are within threshold (&lt;5% deviation), the action is EXECUTED and recorded on-chain.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono-data shrink-0 font-[500] text-signal-red">04</span>
            <span>If an anomaly is detected, the action is BLOCKED and the reason is logged with a proof hash.</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
