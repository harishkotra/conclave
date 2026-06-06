"use client";

import { Phase } from "@/types/round";

interface Stage {
  id: string;
  label: string;
  op: string;
  detail: string;
}

const STAGES: Record<number, Stage[]> = {
  [Phase.Voting]: [
    { id: "encrypt",   label: "Encrypt",     op: "client-side",     detail: "Score encrypted via FHE before leaving browser" },
    { id: "submit",    label: "Submit",      op: "transaction",     detail: "Ciphertext submitted on-chain" },
    { id: "accumulate",label: "Accumulate",  op: "FHE.add",         detail: "Sum and count updated — still encrypted" },
  ],
  [Phase.Revision]: [
    { id: "remove",    label: "Remove",      op: "FHE.sub",         detail: "Old ciphertext subtracted from running sum" },
    { id: "insert",    label: "Insert",      op: "FHE.add",         detail: "New ciphertext added to running sum" },
    { id: "replace",   label: "Replace",     op: "handle",          detail: "Agent score handle updated" },
  ],
  [Phase.Finalized]: [
    { id: "divide",    label: "Divide",      op: "FHE.div",         detail: "Encrypted sum ÷ encrypted count" },
    { id: "permit",    label: "Permit",      op: "access",          detail: "Creator & public allowed to decrypt" },
    { id: "ready",     label: "Ready",       op: "consensusHandle", detail: "Awaiting threshold decryption" },
  ],
  [Phase.Revealed]: [
    { id: "decrypt",   label: "Decrypt",     op: "threshold",       detail: "Threshold Network decrypts handle" },
    { id: "verify",    label: "Verify",      op: "proof",           detail: "Decryption signature verified on-chain" },
    { id: "complete",  label: "Complete",    op: "consensusScore",  detail: "Consensus revealed to all participants" },
  ],
};

interface Props {
  phase: Phase;
  votesSubmitted: number;
  quorum: number;
  consensusScore: number | null;
}

export function FhePipeline({ phase, votesSubmitted, quorum, consensusScore }: Props) {
  const stages = STAGES[phase] ?? STAGES[Phase.Voting];
  const allDone = phase === Phase.Revealed;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase">Protocol Execution</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1F3A] text-[#64748b] font-mono">
          Phase: {Phase[phase]}
        </span>
      </div>

      {/* Vertical stage flow */}
      <div className="space-y-0">
        {stages.map((s, i) => {
          const isActive = !allDone && i === 0;
          const isDone = allDone || (phase === Phase.Voting && i < stages.length - 1) ||
            (phase === Phase.Revision && i < stages.length - 1) ||
            (phase === Phase.Finalized && i < stages.length - 1);
          return (
            <div key={s.id} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${
                  isDone ? "bg-[#22c55e]" : isActive ? "bg-[#c084fc]" : "bg-[#1A1F3A]"
                }`} />
                {i < stages.length - 1 && (
                  <div className="w-px h-8 bg-[#1A1F3A]" />
                )}
              </div>
              {/* Stage card */}
              <div className={`flex-1 pb-6 ${i === stages.length - 1 ? "pb-0" : ""}`}>
                <div className={`rounded-lg border px-3.5 py-2.5 ${
                  isDone ? "border-[#22c55e]/20 bg-[#22c55e]/5" :
                  isActive ? "border-[#c084fc]/20 bg-[#c084fc]/5" :
                  "border-[#1A1F3A] bg-[#1A1F3A]/30"
                }`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono text-[#64748b]">{s.op}</span>
                    {isDone && <span className="text-[10px] text-[#22c55e]">✓</span>}
                    {isActive && <span className="text-[10px] text-[#c084fc]">●</span>}
                  </div>
                  <p className="text-sm font-medium text-[#e2e8f0]">{s.label}</p>
                  <p className="text-[11px] text-[#475569] mt-0.5">{s.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ciphertext telemetry */}
      <div className="mt-4 pt-3 border-t border-[#1A1F3A]">
        <div className="flex items-center gap-4 text-[11px] text-[#475569] font-mono">
          <span>ciphertexts: <span className="text-[#64748b]">{votesSubmitted}/{quorum}</span></span>
          {phase >= Phase.Finalized && (
            <span>consensus: <span className="text-[#64748b]">{consensusScore ?? "encrypted"}</span></span>
          )}
        </div>
      </div>
    </div>
  );
}
