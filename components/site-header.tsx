import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="print-hidden mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="site-header-shell motion-enter">
        <Link href="/" className="site-mark">
          <span className="site-mark-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2.1" fill="currentColor" />
              <path
                d="M7 1.5v2.1M7 10.4v2.1M1.5 7h2.1M10.4 7h2.1"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="site-mark-copy">
            <span className="site-mark-title">Startup Analyzer</span>
          </span>
        </Link>

        <nav
          className="flex flex-wrap items-center justify-end gap-3 sm:gap-4"
          aria-label="Primary"
        >
          <Link href="/#analyzer-form" className="subtle-link">
            New draft
          </Link>
          <Link href="/archive" className="subtle-link">
            Archive
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
