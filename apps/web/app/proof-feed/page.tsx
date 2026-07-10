import { ProofFeed } from "@oddtrust/ui";
import Link from "next/link";

export default function ProofFeedPage() {
  return (
    <section className="py-14">
      <div className="mb-8">
        <p className="font-mono text-xs text-pitch-green uppercase tracking-wider mb-2">Proof Feed</p>
        <h1 className="text-3xl md:text-4xl font-[500] mb-3">On-Chain Verification Log</h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
          Real-time stream of consistency checks committed to Solana. Each entry represents a cryptographic proof
          of odds verification — verified, flagged, or failed.
        </p>
      </div>

      <ProofFeed />

      <div className="mt-10">
        <Link href="/" className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}
