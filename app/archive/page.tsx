import type { Metadata } from "next";
import Link from "next/link";
import { createAnalysisIndexer, type SearchDocument } from "@/lib/future";
import { getRuntimeFlags } from "@/lib/env";
import { loadRecentAnalyses } from "@/lib/persistence";
import { formatDisplayDate, truncateCopy } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ArchivePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Archive",
  description: "Recent saved post-mortem drafts and optional search results.",
};

function ArchiveCard({
  href,
  title,
  summary,
  meta,
}: {
  href: string;
  title: string;
  summary: string;
  meta: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[1.5rem] border border-border bg-paper-strong px-5 py-5 transition hover:border-accent"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{meta}</p>
      <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted">{summary}</p>
    </a>
  );
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const runtime = getRuntimeFlags();

  if (!runtime.persistenceConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="paper-shell rounded-[2rem] border border-border px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Archive
            </p>
            <Link href="/" className="font-medium text-accent transition hover:opacity-80">
              Back to analyzer
            </Link>
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            The archive becomes available when saved drafts are enabled.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
            This deployment is running without PostgreSQL-backed persistence, so there
            are no durable analyses to browse. The app remains fully usable in Demo
            Mode and for print-to-PDF export.
          </p>
        </div>
      </main>
    );
  }

  const recent = await loadRecentAnalyses(12);
  const searchConfigured = runtime.searchConfigured;
  let searchResults: SearchDocument[] = [];

  if (query && searchConfigured) {
    searchResults = await createAnalysisIndexer().search(query, 12);
  }

  const showSearchResults = query.length > 0 && searchConfigured;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <Link href="/" className="font-medium text-accent transition hover:opacity-80">
          Back to analyzer
        </Link>
        <span>{searchConfigured ? "Archive and search" : "Recent saved drafts"}</span>
      </div>

      <section className="paper-shell rounded-[2rem] border border-border px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          Archive
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          Review saved drafts without leaving the editorial flow.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          This is a lightweight archive, not a dashboard. Open a saved draft, copy its
          permalink, or print it for circulation.
        </p>

        <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label htmlFor="q" className="sr-only">
            Search saved analyses
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder={
              searchConfigured
                ? "Search saved analyses by company or theme"
                : "Search becomes available when Meilisearch is configured"
            }
            disabled={!searchConfigured}
            className="w-full rounded-[1.35rem] border border-border bg-white px-5 py-4 text-base text-foreground outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-paper"
          />
          <button
            type="submit"
            disabled={!searchConfigured}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#163129] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>
        </form>

        {!searchConfigured ? (
          <p className="mt-3 text-sm leading-6 text-muted">
            Search is optional. This deployment can still browse recent saved drafts without Meilisearch.
          </p>
        ) : null}
      </section>

      {showSearchResults ? (
        <section className="mt-8 grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-3xl text-foreground">Search results</h2>
            <span className="text-sm text-muted">
              {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for “{query}”
            </span>
          </div>
          {searchResults.length ? (
            <div className="grid gap-4">
              {searchResults.map((entry) => (
                <ArchiveCard
                  key={entry.shareId}
                  href={`/a/${entry.shareId}`}
                  title={entry.company}
                  summary={truncateCopy(entry.overview, 220)}
                  meta={`${formatDisplayDate(entry.createdAt)} · indexed draft`}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border px-5 py-5 text-sm leading-7 text-muted">
              No indexed drafts matched that query yet. Try the company name or a narrower theme.
            </div>
          )}
        </section>
      ) : null}

      <section className="mt-8 grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-3xl text-foreground">Recent saved drafts</h2>
          <span className="text-sm text-muted">
            Durable links created through PostgreSQL-backed persistence
          </span>
        </div>
        {recent.length ? (
          <div className="grid gap-4">
            {recent.map((entry) => (
              <ArchiveCard
                key={entry.shareId}
                href={`/a/${entry.shareId}`}
                title={entry.analysis.company.displayName}
                summary={truncateCopy(entry.analysis.overview, 220)}
                meta={`${formatDisplayDate(entry.createdAt)} · ${entry.analysis.sourceMode === "demo" ? "demo draft" : "live draft"}`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border px-5 py-5 text-sm leading-7 text-muted">
            No saved drafts yet. Create a share link from the main analyzer to start the archive.
          </div>
        )}
      </section>
    </main>
  );
}
