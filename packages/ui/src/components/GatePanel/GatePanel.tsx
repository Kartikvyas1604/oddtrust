"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Resolution = "idle" | "inspecting" | "executed" | "blocked";

interface GateAgent {
  id: string;
  label: string;
  inspectFixture: string;
}

const agents: GateAgent[] = [
  { id: "Gate-01", label: "Margin Check", inspectFixture: "Stormhaven vs Northgate" },
  { id: "Gate-02", label: "Liquidity Gate", inspectFixture: "Ironbound FC vs Silverlake" },
  { id: "Gate-03", label: "Trust Anchor", inspectFixture: "Crystal Palace vs Bridge City" },
  { id: "Gate-04", label: "Settlement Guard", inspectFixture: "Eastside FC vs Westend" },
];

function GateRow({ agent, delay }: { agent: GateAgent; delay: number }) {
  const [state, setState] = useState<Resolution>("idle");

  const resolve = useCallback(() => {
    setState("inspecting");
    setTimeout(() => {
      setState(Math.random() > 0.4 ? "executed" : "blocked");
    }, 700 + Math.random() * 600);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(resolve, 800 + Math.random() * 600);
    const iv = setInterval(resolve, 5000 + Math.random() * 3000);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, [resolve]);

  const borderStyle =
    state === "executed" ? "border-l-pitch-green border-line-hairline" :
    state === "blocked" ? "border-l-signal-red border-line-hairline" :
    state === "inspecting" ? "border-l-pitch-green-dim border-line-hairline" :
    "border-line-hairline";

  return (
    <div
      className={`bg-bg-raised border ${borderStyle} rounded-lg p-6 transition-all duration-300 animate-fade-up opacity-0 ${
        state === "idle" ? "opacity-50" : ""
      } hover:-translate-y-0.5 hover:brightness-110`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs text-text-primary font-[500]">{agent.id}</span>
        {state === "inspecting" && (
          <span className="font-mono text-[10px] text-text-tertiary animate-pulse">Inspecting...</span>
        )}
        {state === "executed" && (
          <span className="font-mono text-[10px] text-pitch-green">EXECUTED</span>
        )}
        {state === "blocked" && (
          <span className="font-mono text-[10px] text-signal-red">BLOCKED</span>
        )}
      </div>
      <p className="text-xs text-text-primary">{agent.label}</p>
      {state === "blocked" && (
        <p className="font-mono text-[10px] text-signal-red/70 mt-2 leading-tight">
          Cause: {agent.inspectFixture} flagged
        </p>
      )}
      {state === "idle" && (
        <p className="font-mono text-[10px] text-text-tertiary/50 mt-2">Awaiting check...</p>
      )}
    </div>
  );
}

export function GatePanel() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold: 0.25 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-4">
        Composability Gate
      </h2>
      <p className="text-xs text-text-tertiary leading-relaxed max-w-lg mb-6">
        External agents audit trust data before execution. Each gate independently resolves a transaction based on live oracle state.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
        {agents.map((a, i) => (
          <GateRow key={a.id} agent={a} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}
