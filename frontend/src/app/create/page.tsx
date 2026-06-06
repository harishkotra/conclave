"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";

const STEPS = ["Task", "Agents", "Rules", "Launch"];

function StepIndicator({ current, step }: { current: number; step: number }) {
  const status = step < current ? "done" : step === current ? "active" : "pending";
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-mono font-medium ${
        status === "done" ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20" :
        status === "active" ? "bg-[#c084fc]/10 text-[#c084fc] border border-[#c084fc]/20" :
        "bg-[#1A1F3A]/50 text-[#475569] border border-[#1A1F3A]"
      }`}>
        {status === "done" ? "✓" : step + 1}
      </div>
      <span className={`text-xs ${
        status === "done" ? "text-[#64748b]" : status === "active" ? "text-[#e2e8f0]" : "text-[#475569]"
      }`}>{STEPS[step]}</span>
    </div>
  );
}

function buildDataURI(title: string, description: string, rubric: Record<string, string>): string {
  const task = { title, description, rubric };
  return `data:application/json,${encodeURIComponent(JSON.stringify(task))}`;
}

export default function CreatePage() {
  const router = useRouter();
  const publicClient = usePublicClient();
  const [step, setStep] = useState(0);
  const [taskMode, setTaskMode] = useState<"inline" | "url">("inline");
  const [taskURI, setTaskURI] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [rubric, setRubric] = useState<Record<string, string>>({ "0-100": "" });
  const [agents, setAgents] = useState<string[]>(["", ""]);
  const [revisionsEnabled, setRevisionsEnabled] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  function addAgent() { if (agents.length < 50) setAgents((a) => [...a, ""]); }
  function removeAgent(i: number) { if (agents.length > 2) setAgents((a) => a.filter((_, idx) => idx !== i)); }
  function setAgent(i: number, val: string) { setAgents((a) => a.map((v, idx) => (idx === i ? val : v))); }

  const validAgents = agents.filter((a) => /^0x[0-9a-fA-F]{40}$/.test(a)) as `0x${string}`[];

  function getResolvedURI(): string {
    if (taskMode === "url") return taskURI.trim();
    return buildDataURI(taskTitle, taskDescription, Object.fromEntries(Object.entries(rubric).filter(([, v]) => v.trim())));
  }

  function canContinueStep0(): boolean {
    if (taskMode === "url") return taskURI.trim().length > 0;
    return taskTitle.trim().length > 0 && taskDescription.trim().length > 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validAgents.length < 2) return;
    writeContract({
      address: CONCLAVE_ADDRESS,
      abi: CONCLAVE_ABI,
      functionName: "createRound",
      args: [validAgents, getResolvedURI(), revisionsEnabled],
    });
  }

  if (isSuccess && hash && publicClient) {
    publicClient.getTransactionReceipt({ hash }).then((receipt) => {
      if (!receipt) return;
      router.push("/");
    });
  }

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-lg text-[#22c55e]">✓</span>
          </div>
          <p className="text-sm font-medium text-[#22c55e] mb-2">Round created successfully</p>
          <button onClick={() => router.push("/")} className="text-xs text-[#475569] hover:text-[#64748b] underline">
            Back to rounds
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step navigation */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className="flex items-center">
            <StepIndicator current={step} step={i} />
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px mx-2 bg-[#1A1F3A]" />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0: Task */}
        {step === 0 && (
          <div className="glass rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs text-[#475569] font-mono">Step 1 of 4</p>
              <h2 className="text-lg font-semibold text-[#e2e8f0] tracking-tight mt-1">Define Task</h2>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-[#1A1F3A] overflow-hidden text-xs">
              <button type="button"
                onClick={() => setTaskMode("inline")}
                className={`flex-1 py-2 text-center font-medium transition-colors ${
                  taskMode === "inline" ? "bg-[#c084fc]/10 text-[#c084fc]" : "bg-transparent text-[#475569] hover:text-[#64748b]"
                }`}
              >
                Write inline
              </button>
              <button type="button"
                onClick={() => setTaskMode("url")}
                className={`flex-1 py-2 text-center font-medium transition-colors ${
                  taskMode === "url" ? "bg-[#c084fc]/10 text-[#c084fc]" : "bg-transparent text-[#475569] hover:text-[#64748b]"
                }`}
              >
                Use URL
              </button>
            </div>

            {taskMode === "inline" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-[#64748b] font-medium mb-1.5 block">Title</label>
                  <input type="text" value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Evaluate: Confidential Multi-Agent Consensus"
                    className="w-full px-3 py-2 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#c084fc]/40 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#64748b] font-medium mb-1.5 block">Description</label>
                  <textarea value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe the task that agents will score. Include context, criteria, and any reference material."
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#c084fc]/40 text-sm transition-colors resize-vertical"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#64748b] font-medium mb-1.5 block">Rubric (optional)</label>
                  <div className="space-y-2">
                    {Object.entries(rubric).map(([range, desc]) => (
                      <div key={range} className="flex gap-2">
                        <input type="text" value={range} readOnly
                          className="w-20 px-2 py-2 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#64748b] text-xs font-mono text-center"
                        />
                        <input type="text" value={desc}
                          onChange={(e) => setRubric((r) => ({ ...r, [range]: e.target.value }))}
                          placeholder="Description for this range"
                          className="flex-1 px-3 py-2 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#c084fc]/40 text-xs transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text"
                      placeholder="e.g. 81-100"
                      className="w-20 px-2 py-1.5 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#e2e8f0] placeholder-[#334155] text-xs font-mono text-center"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.currentTarget;
                          const val = input.value.trim();
                          if (val && !rubric[val]) {
                            setRubric((r) => ({ ...r, [val]: "" }));
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <button type="button" onClick={() => {
                      const input = document.querySelector<HTMLInputElement>("input[placeholder='e.g. 81-100']");
                      if (input) {
                        const val = input.value.trim();
                        if (val && !rubric[val]) {
                          setRubric((r) => ({ ...r, [val]: "" }));
                          input.value = "";
                        }
                      }
                    }}
                      className="text-[10px] px-2 py-1.5 rounded bg-[#1A1F3A] text-[#475569] hover:text-[#64748b] transition-colors"
                    >
                      + Add range
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-[#64748b] font-medium mb-1.5 block">Task URL</label>
                <input type="text" value={taskURI}
                  onChange={(e) => setTaskURI(e.target.value)}
                  placeholder="https://example.com/task.json"
                  className="w-full px-3 py-2 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#c084fc]/40 text-sm font-mono transition-colors"
                />
                <p className="text-[10px] text-[#334155] mt-1.5">HTTPS URL or IPFS CID pointing to task JSON</p>
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(1)}
                disabled={!canContinueStep0()}
                className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Agents */}
        {step === 1 && (
          <div className="glass rounded-xl p-6 space-y-4">
            <p className="text-xs text-[#475569] font-mono">Step 2 of 4</p>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#e2e8f0] tracking-tight">Register Agents</h2>
              <span className="text-[11px] text-[#334155] font-mono">{agents.length} / 50</span>
            </div>
            <p className="text-xs text-[#475569]">Ethereum addresses of the agents that will participate in this consensus round.</p>
            <div className="space-y-2">
              {agents.map((addr, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={addr}
                    onChange={(e) => setAgent(i, e.target.value)}
                    placeholder="0x…"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#040816] border border-[#1A1F3A] text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#c084fc]/40 text-sm font-mono transition-colors"
                  />
                  {agents.length > 2 && (
                    <button type="button" onClick={() => removeAgent(i)}
                      className="px-3 py-2 rounded-lg border border-[#1A1F3A] text-[#475569] hover:text-[#64748b] hover:border-[#334155] transition-colors text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addAgent}
              className="text-xs text-[#475569] hover:text-[#64748b] transition-colors"
            >
              + Add agent
            </button>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(0)}
                className="text-xs px-3 py-1.5 rounded-md border border-[#1A1F3A] text-[#475569] hover:text-[#64748b] transition-colors font-medium"
              >
                Back
              </button>
              <button type="button" onClick={() => setStep(2)}
                disabled={validAgents.length < 2}
                className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Continue ({validAgents.length} valid)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Rules */}
        {step === 2 && (
          <div className="glass rounded-xl p-6 space-y-4">
            <p className="text-xs text-[#475569] font-mono">Step 3 of 4</p>
            <h2 className="text-lg font-semibold text-[#e2e8f0] tracking-tight">Configure Rules</h2>
            <div className="flex items-center justify-between rounded-lg border border-[#1A1F3A] bg-[#1A1F3A]/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#e2e8f0]">Allow revision round</p>
                <p className="text-xs text-[#475569] mt-0.5">
                  Agents can update scores after all votes are in. Computations remain fully encrypted.
                </p>
              </div>
              <button type="button"
                onClick={() => setRevisionsEnabled((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  revisionsEnabled ? "bg-[#c084fc]" : "bg-[#334155]"
                }`} role="switch" aria-checked={revisionsEnabled}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                  revisionsEnabled ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)}
                className="text-xs px-3 py-1.5 rounded-md border border-[#1A1F3A] text-[#475569] hover:text-[#64748b] transition-colors font-medium"
              >
                Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Launch */}
        {step === 3 && (
          <div className="glass rounded-xl p-6 space-y-4">
            <p className="text-xs text-[#475569] font-mono">Step 4 of 4</p>
            <h2 className="text-lg font-semibold text-[#e2e8f0] tracking-tight">Launch Consensus</h2>
            <div className="rounded-lg border border-[#1A1F3A] bg-[#1A1F3A]/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475569]">Task</span>
                <span className="text-[#64748b] font-mono truncate ml-4 max-w-[200px]">
                  {taskMode === "inline" ? taskTitle || "(inline)" : taskURI}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Agents</span>
                <span className="text-[#64748b]">{validAgents.length} registered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Revisions</span>
                <span className="text-[#64748b]">{revisionsEnabled ? "enabled" : "disabled"}</span>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-900/10 border border-red-800/30 rounded-lg px-3 py-2">
                {(error as any).shortMessage ?? error.message}
              </p>
            )}
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)}
                className="text-xs px-3 py-1.5 rounded-md border border-[#1A1F3A] text-[#475569] hover:text-[#64748b] transition-colors font-medium"
              >
                Back
              </button>
              <button type="submit"
                disabled={isPending || isConfirming}
                className="text-xs px-4 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isPending || isConfirming ? "Creating…" : "Launch Round"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
