import type { Metadata } from "next";
import { Fraunces, Martian_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OddsTrust — On-Chain Trust Oracle",
  description:
    "Live trust verification for World Cup odds. Infrastructure agents read from, not a consumer betting app.",
  openGraph: {
    title: "OddsTrust — On-Chain Trust Oracle",
    description:
      "Live trust verification for World Cup odds. Infrastructure agents read from.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${martianMono.variable} bg-[var(--color-bg-void)]`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
