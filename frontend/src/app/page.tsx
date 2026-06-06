"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnect } from "wagmi";
import { useRoundCount } from "@/hooks/useRound";
import { RoundCard } from "@/components/RoundCard";

function HeroViz() {
  return (
    <div className="relative" style={{ animation: "fade-in 0.6s ease-out" }}>
      {/* SVG protocol flow diagram */}
      <svg viewBox="0 0 360 380" className="w-full max-w-[360px]" fill="none">
        {/* Agent nodes */}
        {[
          { x: 80,  y: 20, label: "Agent A" },
          { x: 180, y: 20, label: "Agent B" },
          { x: 280, y: 20, label: "Agent C" },
        ].map((a, i) => (
          <g key={i}>
            <circle cx={a.x} cy={a.y} r="6" fill="#c084fc" opacity="0.3" style={{ animation: `node-pulse 2s ease-in-out ${i * 0.3}s infinite` }} />
            <circle cx={a.x} cy={a.y} r="4" fill="#c084fc" />
            <text x={a.x} y={a.y + 18} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">{a.label}</text>
          </g>
        ))}

        {/* Arrow connectors */}
        <line x1="180" y1="38" x2="180" y2="70" stroke="#1A1F3A" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
        <polygon points="176,66 180,75 184,66" fill="#334155" />

        {/* Encrypted votes stage */}
        <rect x="90" y="78" width="180" height="44" rx="6" fill="rgba(10,15,42,0.8)" stroke="#1A1F3A" strokeWidth="1" />
        <text x="180" y="98" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">Encrypted Votes</text>
        <text x="180" y="112" textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">FHE ciphertexts</text>

        <line x1="180" y1="122" x2="180" y2="154" stroke="#1A1F3A" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
        <polygon points="176,150 180,159 184,150" fill="#334155" />

        {/* FHE computation stage */}
        <rect x="70" y="162" width="220" height="44" rx="6" fill="rgba(10,15,42,0.8)" stroke="#1A1F3A" strokeWidth="1" />
        <text x="180" y="182" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">FHE Computation</text>
        <text x="180" y="196" textAnchor="middle" fill="#334155" fontSize="8">FHE.add · FHE.div</text>

        <line x1="180" y1="206" x2="180" y2="238" stroke="#1A1F3A" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
        <polygon points="176,234 180,243 184,234" fill="#334155" />

        {/* Threshold decrypt stage */}
        <rect x="70" y="246" width="220" height="44" rx="6" fill="rgba(10,15,42,0.8)" stroke="#1A1F3A" strokeWidth="1" />
        <text x="180" y="266" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">Threshold Decrypt</text>
        <text x="180" y="280" textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">3-of-3 threshold network</text>

        <line x1="180" y1="290" x2="180" y2="322" stroke="#1A1F3A" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
        <polygon points="176,318 180,327 184,318" fill="#334155" />

        {/* Consensus score - highlighted */}
        <rect x="110" y="330" width="140" height="44" rx="6" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" style={{ animation: "consensus-appear 0.6s ease-out 1.5s both" }} />
        <text x="180" y="350" textAnchor="middle" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="600">Consensus Score</text>
        <text x="180" y="364" textAnchor="middle" fill="#22c55e" fontSize="11" fontFamily="monospace" fontWeight="700" style={{ animation: "fade-in 0.4s ease-out 2s both" }}>72</text>

        {/* Data packet animation */}
        <circle cx="180" cy="60" r="3" fill="#c084fc" opacity="0" style={{ animation: "data-packet 2s ease-in-out 1s infinite" }} />
        <circle cx="180" cy="60" r="3" fill="#c084fc" opacity="0" style={{ animation: "data-packet 2s ease-in-out 1.6s infinite" }} />
      </svg>
    </div>
  );
}

function LandingPage() {
  const { connect, connectors } = useConnect();

  return (
    <div className="bg-topology">

      {/* ── Hero (split-screen) ───────────────────────────────────────────── */}
      <section className="py-20 border-b border-[#1A1F3A]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-xs text-[#c084fc] font-medium mb-4 tracking-wide" style={{ animation: "fade-in 0.4s ease-out" }}>
              Fully Homomorphic Encryption
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold text-[#e2e8f0] tracking-tight leading-[1.08] mb-5" style={{ animation: "fade-in 0.4s ease-out 0.1s both" }}>
              Private Consensus<br />
              <span className="text-[#c084fc]">for Autonomous Agents</span>
            </h1>
            <p className="text-base text-[#64748b] leading-relaxed mb-8 max-w-md" style={{ animation: "fade-in 0.4s ease-out 0.2s both" }}>
              AI agents that agree without revealing their votes.
              Conclave lets agents collaboratively evaluate tasks while keeping
              individual scores permanently encrypted.
            </p>
            <div className="flex items-center gap-3" style={{ animation: "fade-in 0.4s ease-out 0.3s both" }}>
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="text-sm px-4 py-2.5 rounded-lg bg-[#c084fc]/10 border border-[#c084fc]/25 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
              >
                Connect Wallet
              </button>
              <a href="#protocol" className="text-sm px-4 py-2.5 rounded-lg border border-[#1A1F3A] text-[#475569] hover:text-[#64748b] hover:border-[#334155] transition-colors">
                View Protocol
              </a>
            </div>
          </div>
          {/* Right — protocol visualization */}
          <div className="flex justify-center lg:justify-end">
            <HeroViz />
          </div>
        </div>
      </section>

      {/* ── Metrics ────────────────────────────────────────────────────────── */}
      <section className="py-14 border-b border-[#1A1F3A]">
        <div className="flex flex-wrap items-baseline gap-x-12 gap-y-6">
          {[
            { value: "3", label: "Agents per round" },
            { value: "2", label: "Encrypted operations per vote" },
            { value: "1", label: "Decryption per consensus" },
            { value: "0", label: "Scores ever revealed", note: "Only aggregate" },
          ].map((m, i) => (
            <div key={i} style={{ animation: `float-up 0.4s ease-out ${i * 0.1}s both` }}>
              <p className="text-4xl lg:text-5xl font-bold text-[#e2e8f0] tracking-tight">{m.value}</p>
              <p className="text-xs text-[#475569] mt-1">{m.label}</p>
              {m.note && <p className="text-[10px] text-[#334155] mt-0.5">{m.note}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison: Traditional vs Conclave ────────────────────────────── */}
      <section className="py-14 border-b border-[#1A1F3A]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Traditional */}
          <div className="border border-[#1A1F3A] rounded-lg p-5 lg:rounded-r-none lg:border-r-0">
            <p className="text-xs font-semibold text-[#475569] tracking-widest uppercase mb-4">Traditional Consensus</p>
            <div className="space-y-3">
              {[
                { label: "Score visibility", value: "All scores eventually visible", bad: true },
                { label: "Front-running", value: "Vulnerable to front-running", bad: true },
                { label: "Strategic voting", value: "Agents can bias based on others", bad: true },
                { label: "Trust", value: "Requires trusted third party", bad: true },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-2 text-sm">
                  <span className="text-[#ef4444] mt-0.5">✕</span>
                  <div>
                    <p className="text-[#64748b]">{r.label}</p>
                    <p className="text-xs text-[#475569]">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Conclave */}
          <div className="border border-[#1A1F3A] rounded-lg p-5 lg:rounded-l-none">
            <p className="text-xs font-semibold text-[#c084fc] tracking-widest uppercase mb-4">Conclave</p>
            <div className="space-y-3">
              {[
                { label: "Score visibility", value: "Permanently encrypted", good: true },
                { label: "Front-running", value: "Impossible — all ciphertexts", good: true },
                { label: "Strategic voting", value: "No signal to bias against", good: true },
                { label: "Trust", value: "Threshold network, trustless", good: true },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-2 text-sm">
                  <span className="text-[#22c55e] mt-0.5">✓</span>
                  <div>
                    <p className="text-[#e2e8f0]">{r.label}</p>
                    <p className="text-xs text-[#64748b]">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Protocol Pipeline (horizontal) ────────────────────────────────── */}
      <section id="protocol" className="py-14 border-b border-[#1A1F3A]">
        <p className="text-xs font-semibold text-[#475569] tracking-widest uppercase mb-6">Protocol Flow</p>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: "🔒", label: "Encrypt", desc: "Score encrypted client-side with FHE before submission" },
            { icon: "⊕", label: "Aggregate", desc: "Ciphertexts summed on-chain — no plaintext exists" },
            { icon: "↻", label: "Revise", desc: "Agents can update scores; history remains encrypted" },
            { icon: "⊘", label: "Decrypt", desc: "Threshold network decrypts only the final average" },
            { icon: "✓", label: "Reveal", desc: "Consensus score published with verifiable proof" },
          ].map((s, i) => (
            <div key={i} className="flex-1 min-w-[140px] border border-[#1A1F3A] rounded-lg p-4" style={{ animation: `float-up 0.4s ease-out ${i * 0.08}s both` }}>
              <p className="text-xs font-mono text-[#c084fc] mb-1.5">{s.icon}</p>
              <p className="text-sm font-medium text-[#e2e8f0] mb-1">{s.label}</p>
              <p className="text-xs text-[#475569] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why FHE (asymmetrical pillars) ─────────────────────────────────── */}
      <section className="py-14 border-b border-[#1A1F3A]">
        <p className="text-xs font-semibold text-[#475569] tracking-widest uppercase mb-6">Why Fully Homomorphic Encryption</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 — wider on desktop */}
          <div className="md:col-span-2 border border-[#1A1F3A] rounded-lg p-5 flex flex-col justify-between">
            <div>
              <p className="text-2xl mb-2">🔒</p>
              <p className="text-sm font-medium text-[#e2e8f0] mb-1">No Commit-Reveal</p>
              <p className="text-xs text-[#64748b] leading-relaxed">Scores are encrypted before they leave the browser. The smart contract computes the average over ciphertexts. No one ever sees individual scores — not even the contract.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1A1F3A]">
              <p className="text-[10px] text-[#475569] font-mono">FHE.encrypt(score) → FHE.add(sum) → FHE.div(sum, count)</p>
            </div>
          </div>
          {/* Pillar 2 */}
          <div className="border border-[#1A1F3A] rounded-lg p-5">
            <p className="text-2xl mb-2">⊘</p>
            <p className="text-sm font-medium text-[#e2e8f0] mb-1">Threshold Security</p>
            <p className="text-xs text-[#64748b] leading-relaxed">Decryption requires approval from multiple independent nodes. No single key can decrypt — compromise resistant.</p>
          </div>
          {/* Pillar 3 */}
          <div className="border border-[#1A1F3A] rounded-lg p-5">
            <p className="text-2xl mb-2">◇</p>
            <p className="text-sm font-medium text-[#e2e8f0] mb-1">Permanent Privacy</p>
            <p className="text-xs text-[#64748b] leading-relaxed">Individual scores remain encrypted forever. Only the group average is ever decrypted and published.</p>
          </div>
          {/* Pillar 4 — wider */}
          <div className="md:col-span-2 border border-[#1A1F3A] rounded-lg p-5">
            <p className="text-2xl mb-2">◇</p>
            <p className="text-sm font-medium text-[#e2e8f0] mb-1">Verifiable Computation</p>
            <p className="text-xs text-[#64748b] leading-relaxed">Every FHE operation is verifiable. The threshold network produces a proof that the decrypted result matches the encrypted computation.</p>
          </div>
        </div>
      </section>

      {/* ── Consensus Visualization ──────────────────────────────────────── */}
      <section className="py-14 border-b border-[#1A1F3A]">
        <p className="text-xs font-semibold text-[#475569] tracking-widest uppercase mb-6">How Consensus Forms</p>
        <div className="glass rounded-xl p-8">
          <svg viewBox="0 0 700 200" className="w-full max-w-[700px]" fill="none">
            {/* Agent A */}
            <g>
              <circle cx="60" cy="30" r="20" fill="rgba(192,132,252,0.1)" stroke="#c084fc" strokeWidth="1" />
              <text x="60" y="34" textAnchor="middle" fill="#c084fc" fontSize="9" fontFamily="monospace">A</text>
              <text x="60" y="62" textAnchor="middle" fill="#475569" fontSize="8">Agent A</text>
              {/* Encrypted score packet */}
              <rect x="45" y="72" width="30" height="16" rx="3" fill="rgba(192,132,252,0.15)" stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" style={{ animation: "data-packet 2.5s ease-in-out 0s infinite" }} />
              <text x="60" y="83" textAnchor="middle" fill="#c084fc" fontSize="6" fontFamily="monospace" opacity="0.6">72</text>
            </g>

            {/* Agent B */}
            <g>
              <circle cx="350" cy="30" r="20" fill="rgba(192,132,252,0.1)" stroke="#c084fc" strokeWidth="1" />
              <text x="350" y="34" textAnchor="middle" fill="#c084fc" fontSize="9" fontFamily="monospace">B</text>
              <text x="350" y="62" textAnchor="middle" fill="#475569" fontSize="8">Agent B</text>
              <rect x="335" y="72" width="30" height="16" rx="3" fill="rgba(192,132,252,0.15)" stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" style={{ animation: "data-packet 2.5s ease-in-out 0.5s infinite" }} />
              <text x="350" y="83" textAnchor="middle" fill="#c084fc" fontSize="6" fontFamily="monospace" opacity="0.6">85</text>
            </g>

            {/* Agent C */}
            <g>
              <circle cx="640" cy="30" r="20" fill="rgba(192,132,252,0.1)" stroke="#c084fc" strokeWidth="1" />
              <text x="640" y="34" textAnchor="middle" fill="#c084fc" fontSize="9" fontFamily="monospace">C</text>
              <text x="640" y="62" textAnchor="middle" fill="#475569" fontSize="8">Agent C</text>
              <rect x="625" y="72" width="30" height="16" rx="3" fill="rgba(192,132,252,0.15)" stroke="rgba(192,132,252,0.3)" strokeWidth="0.5" style={{ animation: "data-packet 2.5s ease-in-out 1s infinite" }} />
              <text x="640" y="83" textAnchor="middle" fill="#c084fc" fontSize="6" fontFamily="monospace" opacity="0.6">63</text>
            </g>

            {/* Down arrows */}
            <line x1="60" y1="92" x2="60" y2="120" stroke="#1A1F3A" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="57,117 60,124 63,117" fill="#334155" />
            <line x1="350" y1="92" x2="350" y2="120" stroke="#1A1F3A" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="347,117 350,124 353,117" fill="#334155" />
            <line x1="640" y1="92" x2="640" y2="120" stroke="#1A1F3A" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="637,117 640,124 643,117" fill="#334155" />

            {/* FHE computation box */}
            <rect x="100" y="128" width="500" height="36" rx="6" fill="rgba(10,15,42,0.8)" stroke="#1A1F3A" strokeWidth="1" />
            <text x="350" y="144" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">FHE.add(72) + FHE.add(85) + FHE.add(63) + FHE.div(220, 3)</text>
            <text x="350" y="156" textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">All ciphertexts · No plaintexts</text>

            {/* Down arrow */}
            <line x1="350" y1="164" x2="350" y2="180" stroke="#1A1F3A" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="347,177 350,184 353,177" fill="#334155" />

            {/* Consensus result */}
            <rect x="260" y="186" width="180" height="32" rx="16" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" style={{ animation: "consensus-appear 0.6s ease-out 3s both" }} />
            <text x="350" y="202" textAnchor="middle" fill="#22c55e" fontSize="11" fontFamily="monospace" fontWeight="700" style={{ animation: "fade-in 0.4s ease-out 3.5s both" }}>Consensus: 73 / 100</text>

            {/* Dashed connector lines from agents to FHE box */}
            <line x1="60" y1="100" x2="350" y2="128" stroke="#1A1F3A" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
            <line x1="640" y1="100" x2="350" y2="128" stroke="#1A1F3A" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
          </svg>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-xs text-[#334155] flex items-center gap-4">
        <span>Private Consensus for Autonomous Agents</span>
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

      <div className="mt-10 pt-6 border-t border-[#1A1F3A] flex items-center gap-4 text-[10px] text-[#334155]">
        <span>Private Consensus for Autonomous Agents</span>
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
        <div className="glass rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#e2e8f0]">Conclave</p>
            <p className="text-[11px] text-[#475569] mt-0.5">Private Consensus for Autonomous Agents</p>
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
