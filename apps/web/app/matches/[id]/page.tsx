"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface FixtureDetail {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

interface ConsistencyCheck {
  id: string;
  marketSet: string[];
  summedImpliedProbability: number;
  isConsistent: boolean;
  margin: number;
  optimalStakes: Record<string, Record<string, number>> | null;
  onChainStatus: string | null;
  onChainTx: string | null;
  createdAt: string;
}

interface OddsSnapshot {
  id: string;
  marketType: string;
  rawOdds: Record<string, number>;
  bookmakerMargin: number | null;
  txlineProofRef: string | null;
  ingestedAt: string;
}

const implied = (o: number) => 1 / o;
const fmtPct = (p: number) => `${(p * 100).toFixed(2)}%`;

export default function MatchDetail() {
  const params = useParams();
  const id = params.id as string;
  const [fixture, setFixture] = useState<FixtureDetail | null>(null);
  const [checks, setChecks] = useState<ConsistencyCheck[]>([]);
  const [odds, setOdds] = useState<OddsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/matches/${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data?.fixture) setFixture(data.fixture);
        if (data?.recentChecks) setChecks(data.recentChecks);
        if (data?.oddsSnapshots) setOdds(data.oddsSnapshots);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-raised rounded w-1/3 mx-auto" />
          <div className="h-4 bg-bg-raised rounded w-1/4 mx-auto" />
        </div>
      </section>
    );
  }

  if (!fixture) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-lg font-[500] text-text-secondary mb-4">Match not found</h1>
        <Link href="/matches" className="font-mono text-sm text-text-tertiary underline hover:text-text-secondary">
          &larr; Back to matches
        </Link>
      </section>
    );
  }

  const latestCheck = checks[0];
  const isConsistent = latestCheck?.isConsistent;
  const margin = latestCheck?.margin ?? 0;
  const totalSip = latestCheck?.summedImpliedProbability ?? 0;

  return (
    <section className="py-14">
      <div className="mb-6">
        <Link href="/matches" className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors">
          &larr; Back to matches
        </Link>
      </div>

      {/* Match Header */}
      <div className="mb-10 bg-bg-raised border border-line-hairline rounded-lg p-8">
        <div className="flex items-center justify-between mb-5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-wider border ${
              isConsistent === true
                ? "text-pitch-green border-pitch-green/20 bg-pitch-green/10"
                : isConsistent === false
                ? "text-signal-amber border-signal-amber/20 bg-signal-amber/10"
                : "text-text-tertiary border-line-hairline bg-bg-void"
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              isConsistent === true ? "bg-pitch-green" :
              isConsistent === false ? "bg-signal-amber" : "bg-text-tertiary"
            }`} />
            {isConsistent === true ? "Consistent" :
             isConsistent === false ? "Flagged" : "No Data"}
          </span>
          <span className="font-mono text-sm text-text-secondary">
            {new Date(fixture.startTime).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-[500] mb-5">
          {fixture.homeTeam} <span className="text-text-tertiary font-[300]">v</span> {fixture.awayTeam}
        </h1>

        <div className="flex items-center gap-8">
          <div>
            <span className="text-sm text-text-secondary block mb-1">Margin</span>
            <span className={`font-mono text-2xl ${isConsistent === false ? "text-signal-amber" : "text-pitch-green"}`}>
              {margin >= 0 ? "+" : ""}{(margin * 100).toFixed(2)}%
            </span>
          </div>
          <div className="h-10 w-px bg-line-hairline" />
          <div>
            <span className="text-sm text-text-secondary block mb-1">&Sigma;(1/odds)</span>
            <span className="font-mono text-2xl text-text-primary">{fmtPct(totalSip)}</span>
          </div>
          {latestCheck?.onChainStatus && (
            <>
              <div className="h-10 w-px bg-line-hairline" />
              <div>
                <span className="text-sm text-text-secondary block mb-1">On-Chain</span>
                <span className={`font-mono text-sm ${
                  latestCheck.onChainStatus === "confirmed" ? "text-pitch-green" :
                  latestCheck.onChainStatus === "pending" ? "text-signal-amber" : "text-text-tertiary"
                }`}>
                  {latestCheck.onChainStatus}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Odds Snapshots */}
      {odds.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-5">Latest Odds</h2>
          <div className="space-y-4">
            {odds.map((snapshot) => (
              <div key={snapshot.id} className="bg-bg-raised border border-line-hairline rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-text-secondary capitalize">{snapshot.marketType.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-4">
                    {snapshot.bookmakerMargin !== null && (
                      <span className={`font-mono text-xs ${snapshot.bookmakerMargin > 0.05 ? "text-signal-amber" : "text-pitch-green"}`}>
                        Margin: {(snapshot.bookmakerMargin * 100).toFixed(2)}%
                      </span>
                    )}
                    <span className="font-mono text-xs text-text-tertiary">
                      {new Date(snapshot.ingestedAt).toLocaleTimeString("en-US", { hour12: false })}
                    </span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(snapshot.rawOdds).map(([outcome, odds]) => {
                    const prob = implied(odds);
                    return (
                      <div key={outcome} className="flex items-center justify-between border-b border-line-hairline/40 pb-2.5 last:border-b-0 last:pb-0 text-sm">
                        <span className="text-text-primary capitalize">{outcome}</span>
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-text-secondary">{odds.toFixed(2)}</span>
                          <span className="font-mono w-16 text-right text-text-secondary">{fmtPct(prob)}</span>
                          <div className="h-1.5 w-20 rounded-full bg-bg-void overflow-hidden">
                            <div className="h-full rounded-full bg-pitch-green-dim" style={{ width: `${Math.min(prob * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consistency Check History */}
      {checks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em] mb-5">Check History</h2>
          <div className="bg-bg-raised border border-line-hairline rounded-lg overflow-hidden">
            <div className="divide-y divide-line-hairline/50">
              {checks.map((check) => (
                <div key={check.id} className="flex items-center gap-5 px-5 py-3.5">
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    check.isConsistent ? "bg-pitch-green" : "bg-signal-amber"
                  }`} />
                  <span className="font-mono text-sm text-text-primary shrink-0">
                    {fmtPct(check.summedImpliedProbability)}
                  </span>
                  <span className={`font-mono text-xs shrink-0 ${
                    check.isConsistent ? "text-pitch-green" : "text-signal-amber"
                  }`}>
                    {check.isConsistent ? "PASS" : "FLAG"}
                  </span>
                  <span className="font-mono text-xs text-text-secondary shrink-0">
                    {check.marketSet.join(", ")}
                  </span>
                  {check.onChainTx && (
                    <span className="font-mono text-xs text-pitch-green/60 truncate">
                      tx: {check.onChainTx.slice(0, 16)}...
                    </span>
                  )}
                  <span className="ml-auto font-mono text-xs text-text-tertiary shrink-0">
                    {new Date(check.createdAt).toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {checks.length === 0 && odds.length === 0 && (
        <div className="bg-bg-raised border border-line-hairline rounded-lg p-10 text-center mb-10">
          <p className="text-sm text-text-secondary mb-2">No data available for this fixture</p>
          <p className="text-sm text-text-tertiary">
            Odds data will appear once the TxLINE ingestion pipeline is connected and processing live feeds.
          </p>
        </div>
      )}

      <div className="mt-10">
        <Link href="/" className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}
