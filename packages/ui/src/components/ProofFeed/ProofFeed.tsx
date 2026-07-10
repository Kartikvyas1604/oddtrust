"use client";

import { useEffect, useRef, useState } from "react";

type Status = "verified" | "inconsistent" | "failed";

interface Entry {
  id: string;
  fixtureId: string;
  action: string;
  margin: number | null;
  signature: string | null;
  slot: number | null;
  loggedAt: string;
}

const cfg: Record<string, { label: string; cls: string }> = {
  CHECK_PASSED: { label: "Verified", cls: "text-pitch-green" },
  CHECK_FLAGGED: { label: "Inconsistent", cls: "text-signal-amber" },
  CHECK_FAILED: { label: "Failed", cls: "text-signal-red" },
};

function mapAction(action: string): Status {
  if (action === "CHECK_PASSED") return "verified";
  if (action === "CHECK_FLAGGED") return "inconsistent";
  return "failed";
}

const PAGE_SIZE = 25;

export function ProofFeed() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const fetchPage = async (c?: string | null) => {
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (c) params.set("cursor", c);
      const res = await fetch(`/api/proof-feed?${params}`);
      const data = await res.json();
      return data;
    } catch {
      return { entries: [], pagination: { hasMore: false } };
    }
  };

  useEffect(() => {
    fetchPage(null).then((data) => {
      const items = data.entries ?? [];
      setEntries(items);
      if (items.length > 0) lastIdRef.current = items[0].id;
      setHasMore(data.pagination?.hasMore ?? false);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:3002`;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let ws: WebSocket | null = null;

    function connect() {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "FLAGGED" || msg.type === "CHECK_PASSED" || msg.type === "CHECK_FLAGGED") {
            const newEntry: Entry = {
              id: msg.checkId ?? crypto.randomUUID(),
              fixtureId: msg.fixtureId ?? "",
              action: msg.type === "FLAGGED" ? "CHECK_FLAGGED" : msg.type,
              margin: msg.margin ?? null,
              signature: msg.signature ?? null,
              slot: msg.slot ?? null,
              loggedAt: msg.timestamp ?? new Date().toISOString(),
            };
            setEntries((prev) => {
              if (prev.length > 0 && prev[0].id === newEntry.id) return prev;
              return [newEntry, ...prev.slice(0, 99)];
            });
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws?.close();
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const data = await fetchPage(cursor);
    const items = data.entries ?? [];
    setEntries((prev) => [...prev, ...items]);
    if (items.length > 0) {
      setCursor(items[items.length - 1].loggedAt);
    }
    setHasMore(data.pagination?.hasMore ?? false);
    setLoading(false);
  };

  const displayEntries = entries.slice(0, PAGE_SIZE);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-mono text-text-secondary uppercase tracking-[0.15em]">Proof Feed</h2>
        <span className="font-mono text-xs text-text-tertiary">{entries.length} {entries.length === 1 ? "proof" : "proofs"}</span>
      </div>
      <div className="bg-bg-panel border border-line-hairline rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-line-hairline bg-bg-void/50">
          <span className="font-mono text-xs text-text-tertiary w-[70px] shrink-0">Slot</span>
          <span className="font-mono text-xs text-text-tertiary flex-1">Fixture</span>
          <span className="font-mono text-xs text-text-tertiary w-[70px] text-right shrink-0">Margin</span>
          <span className="font-mono text-xs text-text-tertiary w-[80px] text-right shrink-0">Time</span>
          <span className="font-mono text-xs text-text-tertiary w-[90px] text-right shrink-0">Status</span>
        </div>
        <div className="divide-y divide-line-hairline/50 max-h-[400px] overflow-y-auto">
          {displayEntries.length === 0 && (
            <div className="px-5 py-8 text-center font-mono text-sm text-text-tertiary">
              {loading ? "Loading..." : "No proof entries yet."}
            </div>
          )}
          {displayEntries.map((e, i) => {
            const status = mapAction(e.action);
            const s = cfg[e.action] ?? cfg.CHECK_PASSED;
            return (
              <div key={e.id} className={`flex items-center gap-4 px-5 py-3 ${i === 0 && i >= 5 ? "animate-feed-in" : ""}`}>
                <span className="font-mono text-sm text-text-tertiary w-[70px] shrink-0">
                  {e.slot ? `#${e.slot}` : "---"}
                </span>
                <span className="text-sm text-text-primary flex-1 truncate">{e.fixtureId}</span>
                <span className="font-mono text-sm text-text-primary w-[70px] text-right shrink-0">
                  {e.margin !== null ? `${(e.margin * 100).toFixed(1)}%` : "---"}
                </span>
                <span className="font-mono text-sm text-text-tertiary w-[80px] text-right shrink-0">
                  {new Date(e.loggedAt).toLocaleTimeString("en-US", { hour12: false })}
                </span>
                <span className={`font-mono text-sm ${s.cls} w-[90px] text-right shrink-0`}>{s.label}</span>
              </div>
            );
          })}
        </div>
        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full px-5 py-2.5 font-mono text-sm text-text-secondary hover:text-text-primary bg-bg-raised hover:bg-bg-panel transition-colors border-t border-line-hairline"
          >
            Load more
          </button>
        )}
      </div>
    </section>
  );
}
