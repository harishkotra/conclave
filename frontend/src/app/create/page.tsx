"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";

export default function CreatePage() {
  const router = useRouter();
  const publicClient = usePublicClient();
  const [taskURI, setTaskURI] = useState("");
  const [agents, setAgents] = useState<string[]>(["", ""]);
  const [revisionsEnabled, setRevisionsEnabled] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  function addAgent() {
    if (agents.length < 50) setAgents((a) => [...a, ""]);
  }

  function removeAgent(i: number) {
    if (agents.length > 2) setAgents((a) => a.filter((_, idx) => idx !== i));
  }

  function setAgent(i: number, val: string) {
    setAgents((a) => a.map((v, idx) => (idx === i ? val : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validAgents = agents.filter((a) => /^0x[0-9a-fA-F]{40}$/.test(a)) as `0x${string}`[];
    if (validAgents.length < 2) return;
    if (!taskURI.trim()) return;
    writeContract({
      address: CONCLAVE_ADDRESS,
      abi: CONCLAVE_ABI,
      functionName: "createRound",
      args: [validAgents, taskURI.trim(), revisionsEnabled],
    });
  }

  // Redirect after confirmed
  if (isSuccess && hash && publicClient) {
    publicClient.getTransactionReceipt({ hash }).then((receipt) => {
      if (!receipt) return;
      router.push("/");
    });
  }

  if (isSuccess) {
    return (
      <div className="max-w-xl">
        <div className="rounded-xl border border-green-800/50 bg-green-900/20 p-6 text-center">
          <p className="text-green-400 font-medium mb-2">Round created!</p>
          <button onClick={() => router.push("/")} className="text-sm text-slate-400 hover:text-slate-200 underline">
            Back to rounds
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Round</h1>
        <p className="text-sm text-slate-500 mt-1">
          Register agents and set a task URI to start a confidential consensus round.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Task URI</label>
          <input
            type="text"
            value={taskURI}
            onChange={(e) => setTaskURI(e.target.value)}
            placeholder="https://example.com/task.json"
            className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 text-sm font-mono"
            required
          />
          <p className="text-xs text-slate-600 mt-1">HTTPS URL or IPFS CID pointing to task JSON</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Agent Addresses</label>
            <span className="text-xs text-slate-600">{agents.length} / 50</span>
          </div>
          <div className="space-y-2">
            {agents.map((addr, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={addr}
                  onChange={(e) => setAgent(i, e.target.value)}
                  placeholder="0x…"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 text-sm font-mono"
                />
                {agents.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeAgent(i)}
                    className="px-3 py-2 rounded-lg border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAgent}
            className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            + Add agent
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-300">Allow revision round?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Agents can update scores after all votes are in — revisions computed fully in ciphertext.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRevisionsEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              revisionsEnabled ? "bg-violet-600" : "bg-slate-600"
            }`}
            role="switch"
            aria-checked={revisionsEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                revisionsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
            {(error as any).shortMessage ?? error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
        >
          {isPending || isConfirming ? "Creating…" : "Create Round"}
        </button>
      </form>
    </div>
  );
}
