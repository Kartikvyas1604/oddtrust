"use client";

import { GatePanel } from "@oddtrust/ui";
import { useEffect, useState } from "react";

interface OracleQuery {
  fixture: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    status: string;
    startTime: string;
  } | null;
  trustScore: number | null;
  latestCheck: {
    isConsistent: boolean;
    summedImpliedProbability: number;
    margin: number;
    arbitrageAvailable: boolean;
    optimalStakes: Record<string, Record<string, number>> | null;
    onChainTx: string | null;
    checkedAt: string;
  } | null;
  totalFlaggedMarkets: number;
  queriedAt: string;
}

export default function OraclePage() {
  const [queryId, setQueryId] = useState("");
  const [result, setResult] = useState<OracleQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!queryId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/oracle/query/${encodeURIComponent(queryId.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? `Query failed (${res.status})`);
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error — is the oracle running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-2xl mb-8">
        <p className="font-mono text-[11px] text-pitch-green uppercase tracking-wider mb-2">Oracle</p>
        <h1 className="text-2xl sm:text-3xl font-[500] mb-4">Composability Gate</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          OddsTrust is designed to be queried by on-chain agents before they execute trades,
          adjust liquidity, or place hedges. The oracle gates any action based on live consistency
          verification of the underlying odds markets.
        </p>
      </div>

      {/* Query Interface */}
      <div className="mb-10 bg-bg-raised border border-line-hairline rounded-lg p-6">
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-4">Query Oracle</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder="Enter fixture ID (e.g. fixture-123)"
            className="flex-1 bg-bg-void border border-line-hairline rounded-lg px-4 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-pitch-green/30 transition-colors"
          />
          <button
            onClick={handleQuery}
            disabled={loading || !queryId.trim()}
            className="px-5 py-2.5 bg-pitch-green/10 border border-pitch-green/20 rounded-lg font-mono text-sm text-pitch-green hover:bg-pitch-green/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Querying..." : "Query"}
          </button>
        </div>

        {error && (
          <div className="bg-signal-red/5 border border-signal-red/20 rounded-lg p-4">
            <p className="font-mono text-xs text-signal-red">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-bg-void border border-line-hairline rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Fixture</span>
              <span className="font-mono text-xs text-text-primary">
                {result.fixture ? `${result.fixture.homeTeam} v ${result.fixture.awayTeam}` : "---"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Status</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${
                result.latestCheck?.isConsistent === true ? "text-pitch-green" :
                result.latestCheck?.isConsistent === false ? "text-signal-amber" : "text-signal-red"
              }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  result.latestCheck?.isConsistent === true ? "bg-pitch-green" :
                  result.latestCheck?.isConsistent === false ? "bg-signal-amber" : "bg-signal-red"
                }`} />
                {result.latestCheck?.isConsistent === true ? "EXECUTED" :
                 result.latestCheck?.isConsistent === false ? "FLAGGED" : "NO DATA"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Margin</span>
              <span className="font-mono text-xs text-text-primary">
                {result.latestCheck ? `${(result.latestCheck.margin * 100).toFixed(2)}%` : "---"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">&Sigma;(1/odds)</span>
              <span className="font-mono text-xs text-text-primary">
                {result.latestCheck ? `${(result.latestCheck.summedImpliedProbability * 100).toFixed(2)}%` : "---"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Flagged Markets</span>
              <span className="font-mono text-xs text-text-primary">{result.totalFlaggedMarkets}</span>
            </div>
            {result.latestCheck?.onChainTx && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">On-Chain Tx</span>
                <span className="font-mono text-[10px] text-pitch-green/60 break-all">
                  {result.latestCheck.onChainTx}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Gate Demo */}
      <div className="mb-10">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-4">
          Live Gate Demo
        </h2>
        <p className="text-xs text-text-tertiary leading-relaxed max-w-lg mb-6">
          External agents audit trust data before execution. Each gate independently resolves a transaction
          based on live oracle state.
        </p>
        <GatePanel />
      </div>

      {/* How It Works */}
      <div className="bg-bg-raised border border-line-hairline rounded-lg p-6">
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.12em] mb-5">How It Works</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ["01", "Agent submits a proposed action (trade, liquidity adjustment, hedge) to the OddsTrust oracle gate.", "text-pitch-green"],
            ["02", "Oracle checks the relevant fixture's margin across all active markets for consistency.", "text-pitch-green"],
            ["03", "If margins are within threshold (<5% deviation), the action is EXECUTED and recorded on-chain.", "text-pitch-green"],
            ["04", "If an anomaly is detected, the action is BLOCKED and the reason is logged with a proof hash.", "text-signal-red"],
          ].map(([num, text, color]) => (
            <div key={num} className="flex gap-3 p-4 bg-bg-void border border-line-hairline rounded-lg">
              <span className={`font-mono text-sm shrink-0 font-[500] ${color}`}>{num}</span>
              <span className="text-xs text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
