import { Hero, MatchGrid, GatePanel, ProofFeed } from "@oddtrust/ui";

const networkStats = [
  { label: "Total Checks", value: "24,598" },
  { label: "Consistency Rate", value: "99.97%", accent: true },
  { label: "Last Slot", value: "#310,442,891" },
  { label: "Agents Connected", value: "7" },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-10 border-t border-line-hairline">
        <h2 className="text-sm font-mono-data text-text-secondary uppercase tracking-[0.1em] mb-4">
          Network Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-hairline rounded-lg overflow-hidden">
          {networkStats.map((stat) => (
            <div key={stat.label} className="bg-bg-panel p-5 sm:p-6">
              <p className="text-[11px] text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <p className={`mt-1 font-mono-data text-lg sm:text-xl ${stat.accent ? 'text-pitch-green' : 'text-text-primary'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 border-t border-line-hairline">
        <MatchGrid preview />
      </section>

      <section className="py-10 border-t border-line-hairline">
        <GatePanel />
      </section>

      <section className="py-10 border-t border-line-hairline">
        <ProofFeed />
      </section>

      <footer className="py-8 border-t border-line-hairline">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-sm font-[500] tracking-tight text-text-secondary">
              OddsTrust
            </span>
            <span className="h-3 w-px bg-line-hairline" />
            <span className="font-mono-data text-[11px] text-text-tertiary">
              On-Chain Trust Oracle
            </span>
          </div>
          <span className="font-mono-data text-[10px] text-text-tertiary opacity-50">
            NOT FINANCIAL ADVICE · FOR DEMONSTRATION PURPOSES ONLY
          </span>
        </div>
      </footer>
    </>
  );
}
