import type { Metadata } from "next";

import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
