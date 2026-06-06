"use client";

import { useEffect, useState, useCallback } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { getCofheClient } from "@/lib/cofhe";
import type { CofheClient } from "@cofhe/sdk";

export function useCofhe() {
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState<CofheClient | null>(null);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!walletClient || !publicClient) {
      setConnected(false);
      return;
    }

    let cancelled = false;
    getCofheClient().then(async (c) => {
      if (cancelled) return;
      await c.connect(publicClient as any, walletClient as any);
      await c.permits.createSelf({ issuer: walletClient.account.address });
      if (!cancelled) {
        setClient(c);
        setConnected(true);
      }
    }).catch(console.error);

    return () => { cancelled = true; };
  }, [walletClient, publicClient]);

  const getClient = useCallback(async () => {
    if (client && connected) return client;
    return getCofheClient();
  }, [client, connected]);

  return { cofheClient: client, connected, getClient };
}
