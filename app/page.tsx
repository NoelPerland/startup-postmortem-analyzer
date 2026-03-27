import { AnalyzerShell } from "@/components/analyzer-shell";
import { SiteFooter } from "@/components/footer";
import { getRuntimeFlags } from "@/lib/env";

export default function Home() {
  const runtime = getRuntimeFlags();

  return (
    <main
      id="main-content"
      className="print-page mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="print-hidden motion-enter mb-4 flex items-center justify-between gap-3 text-sm text-muted">
        <span>Prepared for editorial review</span>
        <a href="/archive" className="font-medium text-accent transition hover:opacity-80">
          Open archive
        </a>
      </div>
      <AnalyzerShell runtime={runtime} />
      <SiteFooter />
    </main>
  );
}
