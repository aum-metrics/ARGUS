import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Playfair_Display, Inter } from "next/font/google"; // Premium Academic/SaaS Pairing
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARGUS | Adversarial Research Governance System",
  description: "Automated adversarial audit for academic claims. Validating rigorous research through multi-agent stress testing.",
  keywords: ["Academic", "SaaS", "Research", "Governance", "Review", "Thesis", "Audit", "Adversarial", "AI"],
  authors: [{ name: "Argus Governance" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-white text-zinc-900 font-sans`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
