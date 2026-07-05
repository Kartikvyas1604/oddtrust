"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

type Resolution = "idle" | "inspecting" | "executed" | "blocked";

const agents = ["Gate-01", "Gate-02", "Gate-03", "Gate-04"];

function AgentRow() {
  const [state, setState] = useState<Resolution>("idle");
  const agent = useRef(agents[Math.floor(Math.random() * agents.length)]);

  const resolve = useCallback(() => {
    setState("inspecting");
    setTimeout(() => {
      setState(Math.random() > 0.4 ? "executed" : "blocked");
    }, 600 + Math.random() * 800);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(resolve, Math.random() * 1200);
    const interval = setInterval(resolve, 5000 + Math.random() * 4000);
    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [resolve]);

  return (
    <div
      className={`rounded-lg border p-3 transition-all duration-300 ${
        state === "executed"
          ? "border-pitch-green animate-gate-resolve"
          : state === "blocked"
          ? "border-signal-red animate-gate-block"
          : state === "inspecting"
          ? "border-line-hairline"
          : "border-line-hairline opacity-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono-data text-xs text-text-secondary">{agent.current}</span>
        {state === "inspecting" && (
          <span className="font-mono-data text-[10px] text-text-tertiary animate-pulse">
            Inspecting...
          </span>
        )}
        {state === "executed" && (
          <span className="font-mono-data text-[10px] text-pitch-green">EXECUTED</span>
        )}
        {state === "blocked" && (
          <span className="font-mono-data text-[10px] text-signal-red">BLOCKED</span>
        )}
      </div>
    </div>
  );
}

export function GatePanel() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`py-12 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <h2 className="text-sm font-mono-data text-text-secondary uppercase tracking-[0.1em] mb-4">
        Composability Gate
      </h2>
      <p className="text-xs text-text-tertiary mb-6 leading-relaxed max-w-lg">
        External agents audit trust data before execution. Each gate independently
        resolves a transaction based on live oracle state.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl">
        {agents.map((_, i) => (
          <AgentRow key={i} />
        ))}
      </div>
    </section>
  );
}
