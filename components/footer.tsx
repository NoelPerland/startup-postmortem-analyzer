export function SiteFooter() {
  return (
    <footer className="print-hidden motion-enter mt-10 rounded-[2rem] border border-border bg-paper/75 px-6 py-8 shadow-[var(--shadow-subtle)] backdrop-blur sm:px-8 sm:py-9">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            About
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            A newsroom-style assistant for building startup post-mortems fast,
            then tightening them with human reporting.
          </p>
        </div>
        <div className="section-divider pt-5 text-sm leading-7 text-muted lg:border-t-0 lg:pt-0">
          <p>Built for LIIVO My Apps first.</p>
          <p className="mt-2">PostgreSQL, Valkey, and Meilisearch stay optional.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/archive" className="subtle-link">
              Archive
            </a>
            <a href="/api/health" className="subtle-link">
              Health
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
