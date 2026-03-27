import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { getEnv } from "@/lib/env";
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

export const metadata: Metadata = {
  metadataBase: env.APP_URL ? new URL(env.APP_URL) : undefined,
  title: {
    default: "Startup Post-Mortem Analyzer",
    template: "%s | Startup Post-Mortem Analyzer",
  },
  description:
    "A newsroom-style editorial assistant for structured startup post-mortems.",
  openGraph: {
    title: "Startup Post-Mortem Analyzer",
    description:
      "A newsroom-style editorial assistant for structured startup post-mortems.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Startup Post-Mortem Analyzer",
    description:
      "A newsroom-style editorial assistant for structured startup post-mortems.",
  },
  alternates: env.APP_URL
    ? {
        canonical: env.APP_URL,
      }
    : undefined,
};

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
