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
      <body className="min-h-screen antialiased">
        <Providers>
          <header className="border-b border-[#1A1F3A]">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#c084fc]">C</span>
                </div>
                <span className="font-semibold tracking-tight text-[#e2e8f0]">Conclave</span>
                <span className="hidden sm:block text-[11px] text-[#475569] tracking-wider uppercase">
                  Confidential Multi-Agent Consensus
                </span>
              </div>
              <ConnectButton />
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
