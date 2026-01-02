import type { Metadata } from "next";
import { Cinzel } from "next/font/google";

import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
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
    <html lang="en">
      <body className={`${cinzel.className}`}>
        {children}
      </body>
    </html>
  );
}
