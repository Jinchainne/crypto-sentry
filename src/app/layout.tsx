import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import PixelBackground from "@/components/PixelBackground";
import CursorGlow from "@/components/CursorGlow";

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
      <body className={`${inter.className} antialiased`}>
        <AnimatedBackground />
        <PixelBackground />
        <CursorGlow />
        <div className="relative" style={{ zIndex: 10 }}>
          <Navbar />
          <div className="pt-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
