import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-reveal";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { getEnv } from "@/lib/env";
import { buildDefaultMetadata } from "@/lib/social";
import { getThemeInitScript } from "@/lib/theme";
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
      data-theme="light"
      data-theme-preference="light"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headlineFont.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ScrollReveal />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
