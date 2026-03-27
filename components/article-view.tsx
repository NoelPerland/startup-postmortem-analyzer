import type { ReactNode } from "react";
import type { PostMortemAnalysis } from "@/domain/postmortem";
import { formatDisplayDate } from "@/lib/utils";

type ArticleViewProps = {
  analysis: PostMortemAnalysis;
  children?: ReactNode;
};

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="surface-card px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

function SectionList({
  title,
  summary,
  bullets,
}: {
  title: string;
  summary: string;
  bullets: string[];
}) {
  return (
    <section className="print-avoid-break grid gap-5 border-t border-border py-10 first:border-t-0 first:pt-0">
      <div className="grid gap-5 lg:grid-cols-[0.32fr_0.68fr] lg:gap-10">
        <div>
          <h2 className="font-serif text-[1.9rem] text-foreground sm:text-[2.2rem]">
            {title}
          </h2>
        </div>
        <div className="article-copy max-w-3xl">
          <p className="text-base leading-8 text-foreground sm:text-lg">{summary}</p>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted sm:text-base">
            {bullets.map((bullet) => (
              <li key={bullet} className="surface-card px-4 py-3">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AppendixList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="print-avoid-break surface-card px-5 py-5">
      <h3 className="font-serif text-[1.6rem] text-foreground">{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ArticleView({ analysis, children }: ArticleViewProps) {
  const modeLabel = analysis.sourceMode === "demo" ? "Demo sample" : "Live first draft";
  const inputTypeLabel =
    analysis.company.inputType === "url"
      ? analysis.company.normalizedUrl ?? "URL lookup"
      : "Company-name lookup";

  return (
    <article className="paper-shell motion-enter overflow-hidden rounded-[2rem] border border-border">
      <div className="sr-only">Editorial post-mortem draft for {analysis.company.displayName}</div>
      <header className="border-b border-border px-6 py-8 sm:px-10 sm:py-10">
        <div className="hidden text-sm uppercase tracking-[0.22em] text-muted print:block">
          Startup Post-Mortem Analyzer
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="status-chip">Post-mortem draft</span>
          <span className="status-chip status-chip-strong">{modeLabel}</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Prepared for editorial review
            </p>
            <h1 className="text-balance mt-3 break-words font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.9rem]">
              {analysis.company.displayName}
            </h1>
            <div className="article-copy mt-6 max-w-3xl">
              <p className="text-lg leading-8 text-foreground">{analysis.overview}</p>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              Structured as a reporting aid: chronology first, then failure factors,
              then what still looks interpretive or unresolved.
            </p>
          </div>

          <aside className="grid gap-3 self-start sm:grid-cols-3 lg:grid-cols-1">
            <MetadataItem label="Generated" value={formatDisplayDate(analysis.generatedAt)} />
            <MetadataItem label="Source mode" value={modeLabel} />
            <MetadataItem label="Lookup type" value={inputTypeLabel} />
          </aside>
        </div>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <section className="print-avoid-break grid gap-5 border-t border-border py-10 first:border-t-0 first:pt-0">
          <div className="grid gap-5 lg:grid-cols-[0.32fr_0.68fr] lg:gap-10">
            <div>
              <h2 className="font-serif text-[1.9rem] text-foreground sm:text-[2.2rem]">
                Timeline
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                A concise chronology of the company&apos;s rise, pressure points,
                and eventual break.
              </p>
            </div>
            <div className="space-y-4">
              {analysis.timeline.map((entry) => (
                <div
                  key={`${entry.dateLabel}-${entry.event}`}
                  className="print-avoid-break surface-card px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {entry.dateLabel}
                  </p>
                  <p className="mt-2 text-base leading-7 text-foreground">{entry.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionList
          title={analysis.whatWentWrong.title}
          summary={analysis.whatWentWrong.summary}
          bullets={analysis.whatWentWrong.bullets}
        />

        <SectionList
          title={analysis.whatCouldHaveSavedIt.title}
          summary={analysis.whatCouldHaveSavedIt.summary}
          bullets={analysis.whatCouldHaveSavedIt.bullets}
        />

        <SectionList
          title={analysis.lessonsForFounders.title}
          summary={analysis.lessonsForFounders.summary}
          bullets={analysis.lessonsForFounders.bullets}
        />

        <section className="print-avoid-break grid gap-5 border-t border-border py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Editorial appendix
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              These notes distinguish what looks publicly supportable from what
              remains interpretive or unresolved.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <AppendixList title="Observed Facts" items={analysis.observedFacts} />
            <AppendixList
              title="Plausible Hypotheses"
              items={analysis.plausibleHypotheses}
            />
            <AppendixList title="Open Questions" items={analysis.openQuestions} />
          </div>
        </section>

        <section className="print-avoid-break surface-inset rounded-[1.5rem] px-5 py-5 text-sm leading-7 text-muted">
          <p className="font-semibold uppercase tracking-[0.18em] text-foreground">
            Verification note
          </p>
          <p className="mt-3">{analysis.disclaimer}</p>
        </section>
      </div>

      {children}
    </article>
  );
}
