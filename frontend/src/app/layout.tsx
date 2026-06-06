import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@/components/ConnectButton";

export const metadata: Metadata = {
  title: "Conclave",
  description: "Confidential Multi-Agent Consensus Protocol",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <Providers>
          <header className="border-b border-slate-800 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                  <span className="text-xs font-bold">C</span>
                </div>
                <span className="font-semibold tracking-tight">Conclave</span>
                <span className="text-xs text-slate-600 hidden sm:block">
                  Confidential Multi-Agent Consensus
                </span>
              </div>
              <ConnectButton />
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
