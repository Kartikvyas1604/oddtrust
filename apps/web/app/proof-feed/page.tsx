'use client';

import { ProofFeed } from "@oddtrust/ui";

export default function ProofFeedPage() {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1
            className="mb-1 text-sm font-[500] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            On-Chain Proof Feed
          </h1>
          <p
            className="text-xs text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 300 }}
          >
            Real-time terminal log of all consistency checks, anomaly alerts, and on-chain proof
            commitments. Updates automatically every 4 seconds.
          </p>
        </div>

        <ProofFeed fullPage />
      </div>
    </section>
  );
}
