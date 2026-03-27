"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { generatePostMortemAction } from "@/app/analyze/actions";
import {
  initialAnalyzerState,
  type AnalyzerActionState,
} from "@/app/analyze/state";
import { ArticleView } from "@/components/article-view";
import { ShareControls } from "@/components/share-controls";
import { demoExamples } from "@/lib/demo-data";

type AnalyzerShellProps = {
  runtime: {
    liveAvailable: boolean;
    persistenceConfigured: boolean;
    appUrl?: string;
  };
};

const seededInitialState = (
  runtime: AnalyzerShellProps["runtime"],
): AnalyzerActionState => ({
  ...initialAnalyzerState,
  runtime: {
    liveAvailable: runtime.liveAvailable,
    persistenceAvailable: runtime.persistenceConfigured,
    usedMode: runtime.liveAvailable ? "live" : "demo",
  },
});

export function AnalyzerShell({ runtime }: AnalyzerShellProps) {
  const [subject, setSubject] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const initialState = seededInitialState(runtime);
  const [state, formAction, pending] = useActionState(
    generatePostMortemAction,
    initialState,
  );
  const currentState = state ?? initialState;
  const currentInput = currentState.input ?? initialState.input;
  const currentRuntime = currentState.runtime ?? initialState.runtime;

  const analysis = currentState.analysis;
  const hasResult = currentState.status === "success" && analysis !== null;
  const featuredExamples = demoExamples.slice(0, 4);
  const leadExample = featuredExamples[0];
  const subjectHasError = currentState.status === "error" && !currentInput.subject.trim();
  const errorTone = useMemo(() => {
    if (!currentInput.subject.trim()) {
      return {
        title: "Input needs a clearer starting point.",
        detail: "Enter a company name or URL before generating a draft.",
      };
    }

    return {
      title: "Draft generation stalled.",
      detail:
        currentState.message ??
        "Try the company homepage, trim the notes, or sharpen the reporting angle.",
    };
  }, [currentInput.subject, currentState.message]);

  function focusForm() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => subjectRef.current?.focus(), 120);
  }

  function applyExample(subjectValue: string, noteValue: string) {
    setSubject(subjectValue);
    setContextNotes(noteValue);
    focusForm();
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="paper-shell motion-enter rounded-[2rem] border border-border px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="status-chip">Editorial research tool</span>
          <span className="status-chip status-chip-strong">
            {runtime.liveAvailable ? "Live mode ready" : "Demo Mode ready"}
          </span>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-10">
          <div className="motion-enter motion-delay-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Startup Post-Mortem Analyzer
            </p>
            <h1 className="text-balance mt-4 max-w-4xl font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-[4rem]">
              Turn a startup name into a sober editorial post-mortem draft.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground">
              Structured reporting support for early research, not publication-ready fact.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              Timeline, failure factors, disciplined counterfactuals, and unresolved
              questions in one readable first draft.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="button-primary" onClick={focusForm}>
                Start a draft
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => applyExample(leadExample.subject, leadExample.contextNotes)}
              >
                Try Northvolt sample
              </button>
              <a href="/archive" className="button-ghost">
                Open archive
              </a>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="surface-card px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  What you get
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Timeline, failure analysis, salvage options, and founder lessons.
                </p>
              </div>
              <div className="surface-card px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Output paths
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Durable permalink when persistence exists, plus clean PDF export.
                </p>
              </div>
              <div className="surface-card px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Trust model
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Facts, hypotheses, and open questions stay visibly separated.
                </p>
              </div>
            </div>
          </div>

          <div className="motion-enter motion-delay-2 space-y-4">
            <div className="surface-card p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                Try one now
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Start with a recognizable case, add one line of reporting context,
                then show the article, permalink, and PDF flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {featuredExamples.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => applyExample(example.subject, example.contextNotes)}
                    className="chip-button"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                Paste a company homepage when you want a cleaner lookup target.
              </p>
            </div>

            <div className="surface-inset px-5 py-5 sm:px-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                How it works
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    1. Start with the company
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Name or URL is enough to begin.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    2. Add the angle
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Notes stay optional unless you want to steer the draft.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    3. Share or export
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Review the result, then save a link or export a PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!runtime.liveAvailable ? (
          <div className="motion-enter motion-delay-3 mt-8 rounded-[1.45rem] border border-accent/15 bg-accent-soft px-5 py-4 text-sm leading-7 text-accent">
            <span className="font-semibold">Demo Mode.</span> Curated sample workflow,
            same structure, same export path, and the same review framing as a live run.
          </div>
        ) : null}

        <form
          id="analyzer-form"
          ref={formRef}
          action={formAction}
          className="motion-enter motion-delay-2 mt-8 grid gap-5 rounded-[1.8rem] border border-border bg-paper/70 px-5 py-6 sm:px-6 sm:py-7"
          aria-busy={pending}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Build the draft
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Start with a company. Add notes only if you want to steer the angle.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span className="status-chip">Timeline</span>
              <span className="status-chip">Failure factors</span>
              <span className="status-chip">Open questions</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-muted"
            >
              Company name or URL
            </label>
            <input
              ref={subjectRef}
              id="subject"
              name="subject"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Northvolt, Quibi, Theranos, or company.com"
              className="input-surface mt-2"
              aria-describedby={`subject-help${subjectHasError ? " subject-error" : ""}`}
              aria-invalid={subjectHasError}
            />
            <p id="subject-help" className="mt-2 text-sm leading-6 text-muted">
              Use the company name, its homepage, or the short name most often used in public reporting.
            </p>
          </div>

          <div>
            <label
              htmlFor="contextNotes"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-muted"
            >
              Extra context or reporting notes
            </label>
            <textarea
              id="contextNotes"
              name="contextNotes"
              rows={5}
              value={contextNotes}
              onChange={(event) => setContextNotes(event.target.value)}
              placeholder="Optional: funding strain, manufacturing risk, governance tension, market timing, or the angle you want to test"
              className="input-surface mt-2 min-h-[8.75rem] resize-y"
              aria-describedby="context-help"
            />
            <p id="context-help" className="mt-2 text-sm leading-6 text-muted">
              Keep it short. A useful note names the angle to test, not the entire backstory.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={pending} className="button-primary">
                {pending ? "Generating draft..." : "Generate first draft"}
              </button>
              <a href="/archive" className="button-secondary">
                Browse archive
              </a>
            </div>
            <span className="text-sm leading-6 text-muted">
              First draft, not a verdict. Use it to tighten reporting, not replace it.
            </span>
          </div>
        </form>

        {pending ? (
          <div
            className="motion-enter mt-6 rounded-[1.5rem] border border-border bg-paper-strong px-5 py-5"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Building draft
            </p>
            <ol className="mt-4 grid gap-3 text-sm leading-7 text-muted">
              <li className="surface-inset px-4 py-3">
                1. Normalizing the subject and reporter notes
              </li>
              <li className="surface-inset px-4 py-3">
                2. Ordering a usable timeline and section structure
              </li>
              <li className="surface-inset px-4 py-3">
                3. Separating facts, inference, and open questions
              </li>
            </ol>
          </div>
        ) : null}

        {currentState.status === "error" ? (
          <div
            id={subjectHasError ? "subject-error" : undefined}
            className="motion-enter mt-6 rounded-[1.5rem] border border-danger/25 bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] px-5 py-4 text-sm leading-7 text-danger"
            role="alert"
          >
            <span className="font-semibold">{errorTone.title}</span> {errorTone.detail}
          </div>
        ) : null}

        {currentState.status === "success" && currentState.message ? (
          <div
            className="motion-enter mt-6 rounded-[1.5rem] border border-border bg-paper-strong px-5 py-4 text-sm leading-7 text-muted"
            role="status"
            aria-live="polite"
          >
            <span className="font-semibold text-foreground">Draft status.</span>{" "}
            {currentState.message}
          </div>
        ) : null}

        {!hasResult && !pending && currentState.status !== "error" ? (
          <div className="motion-enter mt-6 rounded-[1.5rem] border border-dashed border-border px-5 py-5 text-sm leading-7 text-muted">
            <p className="font-semibold text-foreground">
              Start with the company, then test the theory.
            </p>
            <p className="mt-2">
              The output is strongest when the starting point is concrete and the
              notes are specific about the angle that needs scrutiny.
            </p>
          </div>
        ) : null}
      </section>

      {hasResult ? (
        <div className="motion-enter motion-delay-2 grid gap-4">
          <div className="print-hidden flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Draft ready
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Review the article, then choose a durable link or a clean PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="status-chip">Output 1: share link</span>
              <span className="status-chip">Output 2: PDF export</span>
            </div>
          </div>
          <ArticleView analysis={analysis}>
            <div className="print-hidden border-t border-border px-6 py-5 sm:px-10">
              <ShareControls
                analysis={analysis}
                contextNotes={currentInput.contextNotes}
                shareAvailable={currentRuntime.persistenceAvailable}
                subject={currentInput.subject}
              />
              <p className="mt-3 text-sm leading-6 text-muted">
                {currentRuntime.persistenceAvailable
                  ? "Create a durable permalink, copy it, or export the article as a PDF."
                  : "Durable links need PostgreSQL. PDF export still works now."}
              </p>
            </div>
          </ArticleView>
        </div>
      ) : null}
    </div>
  );
}
