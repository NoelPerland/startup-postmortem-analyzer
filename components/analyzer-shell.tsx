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

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="4.25" r="0.8" fill="currentColor" />
      <path d="M7 6.2v3.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

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
      <section className="paper-shell motion-enter px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="mt-4 max-w-4xl">
          <div>
            <h1 className="text-balance mt-4 max-w-4xl font-serif text-4xl leading-[1.04] text-foreground sm:text-5xl lg:text-[4.35rem]">
              What happened to this startup?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted sm:text-[1.1rem]">
              Build a first draft with a timeline, failure factors, and questions to verify.
            </p>
            {!runtime.liveAvailable ? <p className="mt-4 text-sm leading-6 text-muted">Demo mode: choose a sample case to see an editable draft. Live generation is unavailable.</p> : null}

          </div>

        </div>

        <form
          id="analyzer-form"
          ref={formRef}
          action={formAction}
          className="motion-enter motion-delay-2 mt-10 grid gap-6 border-t border-border pt-8"
          aria-busy={pending}
          data-reveal
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Build the draft
              </h2>
            </div>
            <div className="min-w-[15rem] sm:min-w-[17rem]">
              <label
                htmlFor="example-select"
                className="text-sm font-semibold text-foreground"
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
                {featuredExamples.map((example) => (
                  <option key={example.label} value={example.label}>
                    {example.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="subject"
                className="text-sm font-semibold text-foreground"
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
              aria-describedby={subjectHasError ? "subject-error" : undefined}
              aria-invalid={subjectHasError}
            />
          </div>

          <div>
            <label
              htmlFor="contextNotes"
              className="text-sm font-semibold text-foreground"
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
            />
          </div>

          <div className="section-divider mt-1 grid gap-4 pt-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <button type="submit" disabled={pending} className="button-primary">
              {pending ? "Generating draft..." : "Generate draft"}
            </button>
          </div>

        </form>

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
