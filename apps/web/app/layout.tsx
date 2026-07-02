import type { Metadata } from "next";
import { Fraunces, Martian_Mono } from "next/font/google";
import { Background, TopStrip } from "@oddtrust/ui";
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
      className={`${fraunces.variable} ${martianMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Background />
        <div className="mx-auto min-h-screen max-w-6xl border-x border-[var(--color-line-hairline)] bg-[var(--color-bg-void)]">
          <TopStrip />
          {children}
        </div>
      </body>
    </html>
  );
}
