import { GatePanel } from "@oddtrust/ui";

export default function OraclePage() {
  return (
    <section className="border-b border-[var(--color-line-hairline)] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1
            className="mb-2 text-sm font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Oracle Composability
          </h1>
          <p
            className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
          >
            OddsTrust is designed to be queried by other on-chain agents before they execute trades,
            adjust liquidity, or place hedges. The oracle gates any action based on live consistency
            verification of the underlying odds markets.
          </p>
        </div>

        <div className="mb-8 mt-12">
          <GatePanel />
        </div>

        <div className="rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-bg-panel)] p-5">
          <h2
            className="mb-3 text-xs font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            How It Works
          </h2>
          <ol
            className="space-y-3 text-xs leading-relaxed text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
          >
            <li className="flex gap-3">
              <span className="shrink-0 font-[500] text-[var(--color-pitch-green)]" style={{ fontFamily: 'var(--font-martian-mono), monospace' }}>01</span>
              <span>Agent submits a proposed action (trade, liquidity adjustment, hedge) to the OddsTrust oracle gate.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-[500] text-[var(--color-pitch-green)]" style={{ fontFamily: 'var(--font-martian-mono), monospace' }}>02</span>
              <span>Oracle checks the relevant fixture&apos;s margin across all active markets for consistency.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-[500] text-[var(--color-pitch-green)]" style={{ fontFamily: 'var(--font-martian-mono), monospace' }}>03</span>
              <span>If margins are within threshold (&lt;5% deviation), the action is EXECUTED and recorded on-chain.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-[500] text-[var(--color-signal-red)]" style={{ fontFamily: 'var(--font-martian-mono), monospace' }}>04</span>
              <span>If an anomaly is detected, the action is BLOCKED and the reason is logged with a proof hash.</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
