"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc]/50 transition-colors font-medium">
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-xs text-[#64748b]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-[11px] px-2.5 py-1.5 rounded-md border border-[#1A1F3A] text-[#475569] hover:text-[#94a3b8] hover:border-[#334155] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
    >
      Connect Wallet
    </button>
  );
}
