import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoSentry — AI Crypto Intelligence Agent",
  description: "An AI agent built on Binance Agent OS that tracks wallets, audits tokens, and generates trading signals through natural language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        <div className="fixed inset-0 mesh-gradient pointer-events-none" />
        <div className="relative">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
