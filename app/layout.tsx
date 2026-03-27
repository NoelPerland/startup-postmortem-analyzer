import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { getEnv } from "@/lib/env";
import { buildDefaultMetadata } from "@/lib/social";
import "./globals.css";

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const headlineFont = Newsreader({
  variable: "--font-headline",
  subsets: ["latin"],
});

const env = getEnv();

export const metadata: Metadata = buildDefaultMetadata(env.APP_URL);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headlineFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
