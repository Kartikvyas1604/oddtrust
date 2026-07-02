import type { Metadata } from "next";
import { Fraunces, Martian_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "OddsTrust — On-Chain Trust Oracle",
  description:
    "Live trust verification for World Cup odds. Infrastructure agents read from, not a consumer betting app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${martianMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
