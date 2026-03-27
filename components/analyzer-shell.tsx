"use client";

import { useActionState, useMemo, useState } from "react";
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

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="paper-shell rounded-[2rem] border border-border px-6 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-border bg-paper-strong px-3 py-1 text-muted">
            Editorial research tool
          </span>
          {!runtime.liveAvailable ? (
            <span className="rounded-full bg-accent-soft px-3 py-1 font-medium text-accent">
              Demo Mode
            </span>
          ) : (
            <span className="rounded-full bg-accent px-3 py-1 font-medium text-white">
              Live model ready
            </span>
          )}
          <span className="rounded-full border border-border px-3 py-1 text-muted">
            {runtime.persistenceConfigured
              ? "Share links enabled"
              : "Stateless deployment"}
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Startup Post-Mortem Analyzer
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.7rem]">
              Turn a startup name into a sober editorial post-mortem draft.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              A calm first pass for newsroom prep: timeline, failure factors,
              disciplined counterfactuals, and the questions that still need reporting.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-paper-strong p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Best first demo
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Start with one of these four cases, add one line of reporter notes,
              then show the article, permalink, and PDF flow.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredExamples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setSubject(example.subject);
                    setContextNotes(example.contextNotes);
                  }}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  {example.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              You can also paste a company homepage URL directly when you want a cleaner lookup target.
            </p>
          </div>
        </div>

        {!runtime.liveAvailable ? (
          <div className="mt-8 rounded-[1.5rem] border border-accent/15 bg-accent-soft px-5 py-4 text-sm leading-7 text-accent">
            <span className="font-semibold">Demo Mode.</span> Fully usable sample
            workflow, curated for review and live demos.
          </div>
        ) : null}

        <form action={formAction} className="mt-8 grid gap-4" aria-busy={pending}>
          <div>
            <label
              htmlFor="subject"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-muted"
            >
              Company name or URL
            </label>
            <input
              id="subject"
              name="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Northvolt, Quibi, Theranos, or company.com"
              className="mt-2 w-full rounded-[1.35rem] border border-border bg-white px-5 py-4 text-base text-foreground outline-none transition focus:border-accent"
              aria-describedby="subject-help"
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
              className="mt-2 w-full rounded-[1.35rem] border border-border bg-white px-5 py-4 text-base text-foreground outline-none transition focus:border-accent"
              aria-describedby="context-help"
            />
            <p id="context-help" className="mt-2 text-sm leading-6 text-muted">
              Keep it short. A useful note names the angle to test, not the entire backstory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#163129] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Building first draft" : "Generate analysis"}
            </button>
            <span className="text-sm text-muted">
              First draft, not a verdict. Use it to tighten reporting, not replace it.
            </span>
          </div>
        </form>

        {pending ? (
          <div className="mt-6 rounded-[1.5rem] border border-border bg-paper-strong px-5 py-5" role="status" aria-live="polite">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Building draft
            </p>
            <ol className="mt-4 grid gap-3 text-sm leading-7 text-muted">
              <li className="rounded-[1rem] border border-border bg-white px-4 py-3">
                1. Normalizing the subject and reporter notes
              </li>
              <li className="rounded-[1rem] border border-border bg-white px-4 py-3">
                2. Ordering a usable timeline and section structure
              </li>
              <li className="rounded-[1rem] border border-border bg-white px-4 py-3">
                3. Separating facts, inference, and open questions
              </li>
            </ol>
          </div>
        ) : null}

        {currentState.status === "error" ? (
          <div className="mt-6 rounded-[1.5rem] border border-danger/20 bg-[#fff4ef] px-5 py-4 text-sm leading-7 text-danger" role="alert">
            <span className="font-semibold">{errorTone.title}</span>{" "}
            {errorTone.detail}
          </div>
        ) : null}

        {currentState.status === "success" && currentState.message ? (
          <div className="mt-6 rounded-[1.5rem] border border-border bg-paper-strong px-5 py-4 text-sm leading-7 text-muted" role="status" aria-live="polite">
            <span className="font-semibold text-foreground">Draft status.</span>{" "}
            {currentState.message}
          </div>
        ) : null}

        {!hasResult && !pending && currentState.status !== "error" ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-border px-5 py-5 text-sm leading-7 text-muted">
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
        <ArticleView analysis={analysis}>
          <div className="print-hidden border-t border-border px-6 py-5 sm:px-10">
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="rounded-full border border-border bg-paper-strong px-3 py-2">
                Output 1: durable permalink
              </span>
              <span className="rounded-full border border-border bg-paper-strong px-3 py-2">
                Output 2: clean PDF
              </span>
            </div>
            <ShareControls
              analysis={analysis}
              contextNotes={currentInput.contextNotes}
              shareAvailable={currentRuntime.persistenceAvailable}
              subject={currentInput.subject}
            />
            <p className="mt-3 text-sm leading-6 text-muted">
              {currentRuntime.persistenceAvailable
                ? "Create a durable permalink, copy it, or print the article for PDF export."
                : "Stateless mode is active. Print to PDF now, or enable PostgreSQL to create durable links."}
            </p>
          </div>
        </ArticleView>
      ) : null}
    </div>
  );
}
