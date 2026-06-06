"use client";

import type { CofheClient } from "@cofhe/sdk";

let _client: CofheClient | null = null;

export async function getCofheClient(): Promise<CofheClient> {
  if (_client) return _client;

  const { createCofheConfig, createCofheClient } = await import("@cofhe/sdk/web");
  const { sepolia: sepoliaChain } = await import("@cofhe/sdk/chains");

  const config = createCofheConfig({
    environment: "web",
    supportedChains: [sepoliaChain],
  });
  _client = createCofheClient(config);
  return _client;
}
