import { Hero, MatchGrid, ProofFeed } from "@oddtrust/ui";

const networkStats = [
  { label: 'Total Checks', value: '24,598' },
  { label: 'Consistency Rate', value: '99.97%' },
  { label: 'Last Slot', value: '#310,442,891' },
  { label: 'Agents Connected', value: '7' },
];

export default function Home() {
  return (
    <>
      <Hero />
      <section className="border-b border-[var(--color-line-hairline)] px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <p
            className="mb-4 text-xs font-[400] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Network Health
          </p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--color-line-hairline)] bg-[var(--color-line-hairline)] sm:grid-cols-4">
            {networkStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[var(--color-bg-panel)] px-4 py-4 sm:px-5 sm:py-5"
              >
                <span
                  className="block text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 400 }}
                >
                  {stat.label}
                </span>
                <span
                  className="mt-1 block text-lg font-[500] sm:text-xl"
                  style={{
                    fontFamily: 'var(--font-martian-mono), monospace',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <MatchGrid preview />
      <ProofFeed />
      <footer className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <h3
                className="text-sm font-[500] tracking-tight"
                style={{ fontFamily: 'var(--font-fraunces), serif', letterSpacing: '-0.02em', color: 'var(--color-text-secondary)' }}
              >
                OddsTrust
              </h3>
              <span className="h-3 w-px bg-[var(--color-line-hairline)]" />
              <span
                className="text-[11px] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
              >
                On-Chain Trust Oracle
              </span>
            </div>
            <span
              className="text-[10px] text-[var(--color-text-tertiary)] opacity-50"
              style={{ fontFamily: 'var(--font-martian-mono), monospace' }}
            >
              NOT FINANCIAL ADVICE \u00B7 FOR DEMONSTRATION PURPOSES ONLY
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
