"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useRoundCount } from "@/hooks/useRound";
import { RoundCard } from "@/components/RoundCard";

function LandingPage() {
  const { connect, connectors } = useConnect();
  const router = useRouter();

  return (
    <div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-20 border-b border-[#1A1F3A]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c084fc]/20 bg-[#c084fc]/5 text-[#c084fc] text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
            Fully Homomorphic Encryption
          </div>
          <h1 className="text-4xl font-bold text-[#e2e8f0] tracking-tight leading-tight mb-4">
            Confidential Multi-Agent<br />
            <span className="text-[#c084fc]">Consensus Protocol</span>
          </h1>
          <p className="text-sm text-[#64748b] leading-relaxed mb-8 max-w-lg">
            Conclave lets multiple AI agents collaboratively score a task without any agent
            ever seeing another&apos;s score. Each vote is encrypted client-side using FHE,
            aggregated on-chain over ciphertexts, and only decrypted via threshold network
            when consensus is reached.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="text-sm px-4 py-2 rounded-lg bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
            >
              Connect Wallet to Get Started
            </button>
            <a href="#how-it-works" className="text-sm px-4 py-2 rounded-lg border border-[#1A1F3A] text-[#475569] hover:text-[#64748b] hover:border-[#334155] transition-colors">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-[#1A1F3A]">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-3">The Problem</p>
          <h2 className="text-xl font-semibold text-[#e2e8f0] tracking-tight mb-4">
            How do you reach consensus without exposing individual opinions?
          </h2>
          <div className="space-y-3 text-sm text-[#64748b] leading-relaxed">
            <p>
              Traditional multi-agent scoring requires either a commit-reveal scheme (where scores are
              eventually visible) or a trusted third party. Both leak information — agents can wait for
              others to reveal, biasing their own score.
            </p>
            <p>
              Conclave solves this with <span className="text-[#e2e8f0]">Fully Homomorphic Encryption</span>.
              Scores are encrypted before they leave the browser. The smart contract computes the average
              entirely over ciphertexts. No one — not even the contract — sees individual scores at any point.
            </p>
            <p>
              Decryption only happens via a <span className="text-[#e2e8f0]">Threshold Network</span>
              — multiple independent nodes must agree, guaranteeing integrity.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 border-b border-[#1A1F3A]">
        <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-3">How It Works</p>
        <h2 className="text-xl font-semibold text-[#e2e8f0] tracking-tight mb-8">
          Protocol Flow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              phase: "01",
              title: "Encrypted Voting",
              desc: "Each agent connects their wallet and submits a score. The browser encrypts it using FHE before the transaction is ever sent. The contract accumulates ciphertexts — no plaintext exists anywhere.",
              ops: "FHE.encrypt → FHE.add(sum) → FHE.add(count)",
            },
            {
              phase: "02",
              title: "Revision Round",
              desc: "If enabled, agents can revise their scores after seeing the group's encrypted signal. The contract subtracts the old ciphertext and adds the new one — all arithmetic is over encrypted values.",
              ops: "FHE.sub(sum, old) → FHE.add(sum, new)",
            },
            {
              phase: "03",
              title: "Finalize & Threshold Decrypt",
              desc: "The creator finalizes the round. The contract computes FHE.div(encryptedSum, encryptedCount), producing an encrypted consensus handle. The Threshold Network decrypts it — no single party can decrypt alone.",
              ops: "FHE.div(sum, count) → Threshold decrypt",
            },
            {
              phase: "04",
              title: "Consensus Revealed",
              desc: "The decrypted score is published on-chain with a zero-knowledge proof of correct decryption. The consensus is verified by anyone. Individual scores remain permanently sealed.",
              ops: "Verify proof → Publish consensus score",
            },
          ].map((item) => (
            <div key={item.phase} className="glass rounded-xl p-5">
              <p className="text-[10px] font-mono text-[#c084fc] mb-2">{item.phase}</p>
              <h3 className="text-sm font-medium text-[#e2e8f0] mb-2">{item.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed mb-3">{item.desc}</p>
              <p className="text-[10px] font-mono text-[#475569]">{item.ops}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FHE Detail ──────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-[#1A1F3A]">
        <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-3">Why FHE?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "No Commit-Reveal",
              desc: "Scores are never visible at any stage. No waiting for others to reveal. No front-running.",
            },
            {
              title: "Threshold Security",
              desc: "Decryption requires approval from multiple independent nodes. A single compromised key is not enough.",
            },
            {
              title: "Sealed Forever",
              desc: "Individual scores remain encrypted permanently. Only the group average is ever decrypted.",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-xl p-5">
              <h3 className="text-sm font-medium text-[#e2e8f0] mb-2">{item.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-[10px] text-[#334155] flex items-center gap-4">
        <span>Confidential Multi-Agent Consensus</span>
        <span className="w-1 h-1 rounded-full bg-[#1A1F3A]" />
        <span>FHE-encrypted voting</span>
        <span className="w-1 h-1 rounded-full bg-[#1A1F3A]" />
        <span>Threshold decryption</span>
      </footer>
    </div>
  );
}

function RoundsList() {
  const { data: roundCount, isLoading } = useRoundCount();
  const rounds = roundCount
    ? Array.from({ length: Number(roundCount) }, (_, i) => BigInt(i + 1))
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Rounds</h1>
          <p className="text-xs text-[#475569] mt-1 font-mono">
            {isLoading ? "Loading…" : `${rounds.length} round${rounds.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/create"
          className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
        >
          + New Round
        </Link>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[#1A1F3A] rounded w-1/4 mb-3" />
              <div className="h-3 bg-[#1A1F3A] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : rounds.length === 0 ? (
        /* Empty state */
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-xs text-[#475569] mb-4">No rounds yet. Create the first consensus round.</p>
          <Link
            href="/create"
            className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
          >
            Create Round
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.reverse().map((id) => (
            <RoundCard key={id.toString()} roundId={id} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[#1A1F3A] flex items-center gap-4 text-[10px] text-[#334155]">
        <span>Confidential Multi-Agent Consensus</span>
        <span className="w-1 h-1 rounded-full bg-[#1A1F3A]" />
        <span>FHE-encrypted voting</span>
        <span className="w-1 h-1 rounded-full bg-[#1A1F3A]" />
        <span>Threshold decryption</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <div>
        {/* Small hero banner for connected users */}
        <div className="glass rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#e2e8f0]">Conclave</p>
            <p className="text-[11px] text-[#475569] mt-0.5">Confidential Multi-Agent Consensus Protocol</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#475569]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              Connected
            </span>
          </div>
        </div>
        <RoundsList />
      </div>
    );
  }

  return <LandingPage />;
}
