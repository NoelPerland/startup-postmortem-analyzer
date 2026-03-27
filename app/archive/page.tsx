import type { Metadata } from "next";
import Link from "next/link";
import { loadArchiveSnapshot } from "@/lib/archive";
import { formatDisplayDate, truncateCopy } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ArchivePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Archive",
  description: "A searchable archive of saved post-mortems for follow-up reporting.",
};

function ArchiveCard({
  href,
  eyebrow,
  title,
  summary,
  meta,
  note,
}: {
  href: string;
  eyebrow: string;
  title: string;
  summary: string;
  meta: string;
  note?: string;
}) {
  return (
    <a
      href={href}
      className="surface-card interactive-card rounded-[1.6rem] px-5 py-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground">{title}</h2>
      <p className="divider-copy mt-5 text-sm leading-7 text-muted">{summary}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">
        <span>{meta}</span>
        {note ? <span>{note}</span> : null}
      </div>
    </a>
  );
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const archive = await loadArchiveSnapshot({
    query: params.q,
    limit: 12,
  });

  if (!archive.persistenceConfigured) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      >
        <div className="paper-shell motion-enter rounded-[2rem] border border-border px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Archive
            </p>
            <Link href="/" className="subtle-link">
              Back to analyzer
            </Link>
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Archive requires durable storage in this deployment.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
            This release is running without PostgreSQL-backed persistence, so there are
            no saved drafts to revisit yet. The analyzer still works well in Demo Mode
            and for print-to-PDF export.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
    >
      <div className="motion-enter mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <Link href="/" className="subtle-link">
          Back to analyzer
        </Link>
        <span>{archive.searchConfigured ? "Archive and search" : "Recent saved drafts"}</span>
      </div>

      <section className="paper-shell motion-enter motion-delay-1 rounded-[2rem] border border-border px-8 py-10 sm:py-11">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">Archive</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          A searchable archive of saved post-mortems.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          Built for follow-up reporting, not passive browsing. Open a saved draft,
          copy its permalink, or print it for circulation.
        </p>

        <form className="section-divider mt-8 grid gap-4 pt-6 sm:grid-cols-[1fr_auto]">
          <label htmlFor="q" className="sr-only">
            Search archived analyses
          </label>
          <input
            id="q"
            name="q"
            aria-describedby="archive-search-note"
            defaultValue={archive.query}
            placeholder={
              archive.searchConfigured
                ? "Search by company, theme, or reporting angle"
                : "Search becomes available when Meilisearch indexing is configured"
            }
            disabled={!archive.searchConfigured}
            className="input-surface"
          />
          <button
            type="submit"
            disabled={!archive.searchConfigured}
            className="button-primary"
          >
            Search
          </button>
        </form>

        <p id="archive-search-note" className="mt-3 text-sm leading-6 text-muted">
          {archive.searchConfigured
            ? "Search works across company name, overview, lessons, and saved notes when indexing is enabled."
            : "Archive browsing is available now. Search appears when Meilisearch indexing is configured."}
        </p>
      </section>

      {archive.query && archive.searchConfigured ? (
        <section className="motion-enter motion-delay-2 mt-10 grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl text-foreground">Search results</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Search improves retrieval. It does not improve certainty.
              </p>
            </div>
            <span className="text-sm text-muted">
              {archive.searchResults.length} result
              {archive.searchResults.length === 1 ? "" : "s"} for &quot;{archive.query}&quot;
            </span>
          </div>
          {archive.searchState === "results" ? (
            <div className="grid gap-5">
              {archive.searchResults.map((entry) => (
                <ArchiveCard
                  key={entry.shareId}
                  href={`/a/${entry.shareId}`}
                  eyebrow="Saved analysis"
                  title={entry.company}
                  summary={entry.preview}
                  meta={`Generated ${formatDisplayDate(entry.generatedAt)}`}
                  note={`${entry.sourceMode === "demo" ? "Saved from demo sample" : "Saved from live mode"} - matched on ${entry.matchedField}`}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-divider px-5 py-5">
              <h2 className="font-serif text-2xl text-foreground">No matching analyses</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Try a company name, a broader theme, or fewer terms. Recent saved drafts still appear below.
              </p>
            </div>
          )}
        </section>
      ) : null}

      <section className="motion-enter motion-delay-2 mt-10 grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl text-foreground">Recent saved drafts</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Durable links created through PostgreSQL-backed persistence.
            </p>
          </div>
          <span className="text-sm text-muted">
            {archive.recent.length} saved draft{archive.recent.length === 1 ? "" : "s"}
          </span>
        </div>
        {archive.recent.length ? (
          <div className="grid gap-5">
            {archive.recent.map((entry) => (
              <ArchiveCard
                key={entry.shareId}
                href={`/a/${entry.shareId}`}
                eyebrow="Saved analysis"
                title={entry.analysis.company.displayName}
                summary={truncateCopy(entry.analysis.overview, 220)}
                meta={`Generated ${formatDisplayDate(entry.analysis.generatedAt)}`}
                note={entry.analysis.sourceMode === "demo" ? "Saved from demo sample" : "Saved from live mode"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-divider px-5 py-5">
            <h2 className="font-serif text-2xl text-foreground">No archived analyses yet</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Saved post-mortems will appear here once share links are stored with
              persistence enabled.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
