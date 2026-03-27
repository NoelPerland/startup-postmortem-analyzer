import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6"
    >
      <section className="paper-shell motion-enter w-full rounded-[2rem] border border-border px-8 py-12 sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Shared analysis
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          This link no longer points to a saved post-mortem.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
          The analysis may have been deleted, the link may be incomplete, or
          persistence may not be configured in this deployment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="subtle-link">
            Return to the analyzer
          </Link>
          <a href="/archive" className="subtle-link">
            Open archive
          </a>
          <span className="status-chip">
            Share links require PostgreSQL-backed persistence
          </span>
        </div>
      </section>
    </main>
  );
}
