export function SiteFooter() {
  return (
    <footer className="print-hidden mt-8 rounded-[2rem] border border-border bg-paper/80 px-6 py-8 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            About
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            Startup Post-Mortem Analyzer is a newsroom research assistant for
            generating structured first drafts on failed or struggling
            startups. It is built for speed, clarity, and human verification,
            not one-click publication.
          </p>
        </div>
        <div className="text-sm leading-7 text-muted">
          <p>Designed for LIIVO My Apps deployment first.</p>
          <p className="mt-2">PostgreSQL, Valkey, and Meilisearch stay optional.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/archive" className="font-medium text-accent transition hover:opacity-80">
              Archive
            </a>
            <a href="/api/health" className="font-medium text-accent transition hover:opacity-80">
              Health
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
