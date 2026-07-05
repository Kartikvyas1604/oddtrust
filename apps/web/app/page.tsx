import { Hero, MatchGrid, GatePanel, ProofFeed } from "@oddtrust/ui";

const healthStats = [
  { label: "Total Checks", value: "24,598" },
  { label: "Consistency Rate", value: "99.97%", accent: true },
  { label: "Last Slot", value: "#310,442,891" },
  { label: "Agents Connected", value: "7" },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-12 border-t border-line-hairline">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-5">
          Network Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-hairline rounded-lg overflow-hidden">
          {healthStats.map((s) => (
            <div key={s.label} className="bg-bg-raised p-6">
              <p className="text-[11px] text-text-secondary uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`font-mono text-lg ${s.accent ? "text-pitch-green" : "text-text-primary"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 border-t border-line-hairline">
        <MatchGrid preview />
      </section>

      <section className="py-12 border-t border-line-hairline">
        <GatePanel />
      </section>

      <section className="py-12 border-t border-line-hairline">
        <ProofFeed />
      </section>

      <footer className="py-8 border-t border-line-hairline text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-[500] tracking-tight text-text-secondary">OddsTrust</span>
            <span className="h-3 w-px bg-line-hairline" />
            <span className="font-mono text-[11px] text-text-tertiary">On-Chain Trust Oracle</span>
          </div>
          <span className="font-mono text-[10px] text-text-tertiary opacity-50">
            NOT FINANCIAL ADVICE · FOR DEMONSTRATION PURPOSES ONLY
          </span>
        </div>
      </footer>
    </>
  );
}
