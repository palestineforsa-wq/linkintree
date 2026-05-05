import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Linkintree — the link-in-bio creators actually convert with",
    template: "%s · Linkintree",
  },
  description:
    "Faster pages. Real analytics. Blocks beyond links. Free forever, with everything you need.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="relative min-h-screen overflow-x-hidden font-sans antialiased">
        <div aria-hidden className="mesh-bg" />
        <div aria-hidden className="grain-overlay" />
        {children}
      </body>
    </html>
  );
}
