"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
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

function IconSpark() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M7.5 2.4v2.1M7.5 10.5v2.1M2.4 7.5h2.1M10.5 7.5h2.1"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="7.5" cy="7.5" r="1.8" fill="currentColor" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5h9M8.5 4.5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M3.2 4.4h8.6M3.2 7.5h8.6M3.2 10.6h5.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="4.25" r="0.8" fill="currentColor" />
      <path d="M7 6.2v3.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const featureStripItems = [
  "Timeline",
  "What went wrong",
  "What could have saved it",
  "Lessons for founders",
  "Failure factors",
  "Observed facts",
  "Open questions",
  "Share link",
  "PDF export",
] as const;

export function AnalyzerShell({ runtime }: AnalyzerShellProps) {
  const [subject, setSubject] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
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
  const exampleTags = ["industrial", "consumer", "regulated", "hardware"];
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

  function scrollToNode(
    node: HTMLElement | null,
    block: ScrollLogicalPosition = "start",
  ) {
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    node.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block,
    });
  }

  function focusForm() {
    scrollToNode(formRef.current, "start");
    window.setTimeout(() => subjectRef.current?.focus(), 120);
  }

  function applyExample(subjectValue: string, noteValue: string) {
    setSubject(subjectValue);
    setContextNotes(noteValue);
    focusForm();
  }

  function handleExampleSelect(value: string) {
    setSelectedExample(value);

    if (!value) {
      return;
    }

    const example = featuredExamples.find((entry) => entry.label === value);

    if (!example) {
      return;
    }

    applyExample(example.subject, example.contextNotes);
  }

  useEffect(() => {
    if (pending) {
      scrollToNode(pendingRef.current, "center");
    }
  }, [pending]);

  useEffect(() => {
    if (hasResult) {
      scrollToNode(resultRef.current, "start");
      return;
    }

    if (currentState.status === "error" || currentState.status === "success") {
      scrollToNode(feedbackRef.current, "center");
    }
  }, [currentState.status, hasResult]);

  return (
    <div className="flex flex-1 flex-col gap-10">
      <section className="paper-shell motion-enter rounded-[2rem] border border-border px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="status-chip">Editorial research tool</span>
          <span className="status-chip status-chip-strong">
            {runtime.liveAvailable ? "Live mode ready" : "Demo Mode ready"}
          </span>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.18fr_0.82fr] xl:gap-12">
          <div className="motion-enter motion-delay-1">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Research drafts for startup failures
            </p>
            <h1 className="text-balance mt-4 max-w-4xl font-serif text-4xl leading-[1.04] text-foreground sm:text-5xl lg:text-[4.35rem]">
              Analyze a startup like a{" "}
              <span className="serif-emphasis">careful editor</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted sm:text-[1.1rem]">
              Generate a clean <span className="serif-emphasis">first draft</span>{" "}
              with a timeline, failure analysis, and the questions that still
              need reporting.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="button-primary" onClick={focusForm}>
                <IconArrow />
                Start a draft
              </button>
              <a href="/archive" className="subtle-link">
                Open archive
              </a>
            </div>

          </div>

          <div className="motion-enter motion-delay-2 space-y-4" data-reveal>
            <div className="surface-inset tint-cool px-5 py-6 sm:px-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                How it works
              </h2>
              <div className="mt-5 grid gap-4">
                <div className="flex items-start gap-4 rounded-[1.2rem] bg-paper/40 px-4 py-4">
                  <span className="inline-flex rounded-full bg-paper/65 p-2 text-accent">
                    <IconSpark />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      1. Name or URL
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">
                      Start with the company or homepage.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-[1.2rem] bg-paper/40 px-4 py-4">
                  <span className="inline-flex rounded-full bg-paper/65 p-2 text-accent">
                    <IconList />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      2. Add context
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">
                      Use one note to steer the angle.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-[1.2rem] bg-paper/40 px-4 py-4">
                  <span className="inline-flex rounded-full bg-paper/65 p-2 text-accent">
                    <IconArrow />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      3. Share or export
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">
                      Save the draft or export a PDF.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          id="analyzer-form"
          ref={formRef}
          action={formAction}
          className="motion-enter motion-delay-2 mt-10 grid gap-6 rounded-[1.8rem] border border-border bg-paper/70 px-5 py-6 sm:px-6 sm:py-8 lg:px-7"
          aria-busy={pending}
          data-reveal
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Build the draft
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Name or URL first. Add context only if it helps.
              </p>
            </div>
            <div className="min-w-[15rem] sm:min-w-[17rem]">
              <label
                htmlFor="example-select"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
              >
                Try a sample
              </label>
              <select
                id="example-select"
                value={selectedExample}
                onChange={(event) => handleExampleSelect(event.target.value)}
                className="input-surface mt-2 py-3 text-sm"
              >
                <option value="">Choose a sample case</option>
                {featuredExamples.map((example, index) => (
                  <option key={example.label} value={example.label}>
                    {example.label} / {exampleTags[index]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="subject"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-muted"
              >
                Company name or URL
              </label>
              <div className="info-tooltip-group">
                <button
                  type="button"
                  className="info-tooltip-trigger"
                  aria-label="Company name or URL guidance"
                  aria-describedby="subject-guidance"
                >
                  <IconInfo />
                </button>
                <div id="subject-guidance" role="tooltip" className="info-tooltip-panel">
                  <p className="font-semibold text-foreground">
                    Start with the company, then test the angle.
                  </p>
                  <p className="mt-2">
                    Best results come from a concrete company and one clear reporting
                    angle.
                  </p>
                </div>
              </div>
            </div>
            <input
              ref={subjectRef}
              id="subject"
              name="subject"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Northvolt, Quibi, Theranos, or company.com"
              className="input-surface mt-2"
              aria-describedby={`subject-help${subjectHasError ? " subject-error" : ""}`}
              aria-invalid={subjectHasError}
            />
            <p id="subject-help" className="mt-2 text-sm leading-6 text-muted">
              Company name, homepage, or the public short name.
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
              placeholder="Optional: the angle, tension, or question you want to test"
              className="input-surface mt-2 min-h-[8.75rem] resize-y"
              aria-describedby="context-help"
            />
            <p id="context-help" className="mt-2 text-sm leading-6 text-muted">
              Keep it short. One angle is enough.
            </p>
          </div>

          <div className="section-divider mt-1 grid gap-4 pt-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={pending} className="button-primary">
                {pending ? "Generating draft..." : "Generate draft"}
              </button>
              <a href="/archive" className="subtle-link">
                Browse archive
              </a>
            </div>
          </div>

          <div className="feature-strip" aria-hidden="true">
            <div className="feature-strip-shell">
              <div className="feature-strip-title">What you get</div>
              <div className="feature-strip-viewport">
                <div className="feature-strip-track">
                  {[0, 1].map((copyIndex) => (
                    <div key={copyIndex} className="feature-strip-group">
                      {featureStripItems.map((item) => (
                        <span key={`${copyIndex}-${item}`} className="feature-strip-pill">
                          {item}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {!runtime.liveAvailable ? (
          <div
            className="motion-enter motion-delay-3 mt-8 rounded-[1.45rem] border border-accent/15 bg-accent-soft px-5 py-4 text-sm leading-7 text-accent"
            data-reveal
          >
            <span className="font-semibold">Demo Mode.</span> Curated sample workflow,
            same structure, same export path, and the same review framing as a live run.
          </div>
        ) : null}

        {pending ? (
          <div
            ref={pendingRef}
            className="motion-enter mt-8 rounded-[1.5rem] border border-border bg-paper-strong px-5 py-5"
            role="status"
            aria-live="polite"
            data-reveal
          >
            <div className="flex items-center gap-3">
              <span className="draft-spinner" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Building draft
              </p>
            </div>
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
            ref={feedbackRef}
            id={subjectHasError ? "subject-error" : undefined}
            className="motion-enter mt-8 rounded-[1.5rem] border border-danger/25 bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] px-5 py-4 text-sm leading-7 text-danger"
            role="alert"
            data-reveal
          >
            <span className="font-semibold">{errorTone.title}</span> {errorTone.detail}
          </div>
        ) : null}

        {currentState.status === "success" && currentState.message ? (
          <div
            ref={feedbackRef}
            className="motion-enter mt-8 rounded-[1.5rem] border border-border bg-paper-strong px-5 py-4 text-sm leading-7 text-muted"
            role="status"
            aria-live="polite"
            data-reveal
          >
            <span className="font-semibold text-foreground">Draft status.</span>{" "}
            {currentState.message}
          </div>
        ) : null}

      </section>

      {hasResult ? (
        <div
          ref={resultRef}
          className="motion-enter motion-delay-2 grid gap-4"
          data-reveal
        >
          <ArticleView analysis={analysis}>
            <div className="print-hidden">
              <ShareControls
                analysis={analysis}
                contextNotes={currentInput.contextNotes}
                shareAvailable={currentRuntime.persistenceAvailable}
                subject={currentInput.subject}
              />
            </div>
          </ArticleView>
        </div>
      ) : null}
    </div>
  );
}
