import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { Cinzel, Quicksand } from "next/font/google";

import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "veDUST",
  description: "Neverland veDUST Token Metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${quicksand.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
