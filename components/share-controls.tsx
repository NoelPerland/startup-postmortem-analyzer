"use client";

import { useState } from "react";
import type { PostMortemAnalysis } from "@/domain/postmortem";

type ShareControlsProps = {
  subject: string;
  contextNotes: string;
  analysis: PostMortemAnalysis;
  shareAvailable: boolean;
  existingShareUrl?: string;
};

export function ShareControls({
  subject,
  contextNotes,
  analysis,
  shareAvailable,
  existingShareUrl,
}: ShareControlsProps) {
  const [shareUrl, setShareUrl] = useState(existingShareUrl ?? "");
  const [message, setMessage] = useState(
    existingShareUrl ? "This permalink is already saved and ready to copy." : "",
  );
  const [busy, setBusy] = useState(false);

  async function copyLink(url: string, copyMessage: string) {
    if (typeof navigator !== "undefined" && "clipboard" in navigator) {
      await navigator.clipboard.writeText(url);
      setMessage(copyMessage);
      return;
    }

    setMessage("Permalink created. Copy it manually from the field below.");
  }

  async function handleShare() {
    if (shareUrl) {
      await copyLink(shareUrl, "Permalink copied.");
      return;
    }

    if (!shareAvailable) {
      setMessage(
        "Permalinks require persistence in this deployment. Print to PDF or keep this tab open.",
      );
      return;
    }

    try {
      setBusy(true);

      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          contextNotes,
          analysis,
        }),
      });

      const payload = (await response.json()) as
        | { available: true; shareUrl: string }
        | { available: false }
        | { error: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload ? payload.error : "Unable to create a permalink right now.",
        );
      }

      if (!("available" in payload) || !payload.available) {
        setMessage(
          "Permalinks require persistence in this deployment. Print to PDF or keep this tab open.",
        );
        return;
      }

      setShareUrl(payload.shareUrl);
      await copyLink(payload.shareUrl, "Permalink created and copied.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create a permalink right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  const shareLabel = shareUrl ? "Copy permalink" : "Create share link";

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void handleShare();
            }}
            disabled={busy}
            className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Creating permalink" : shareLabel}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163129]"
          >
            Print / Save as PDF
          </button>
        </div>
        <p className="text-sm leading-6 text-muted">
          Use your browser&apos;s print dialog for a clean PDF export.
        </p>
      </div>

      {shareUrl ? (
        <div className="rounded-[1.25rem] border border-border bg-paper-strong px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Permalink
          </p>
          <p className="mt-2 break-all text-sm leading-6 text-foreground">{shareUrl}</p>
        </div>
      ) : null}

      <p className="text-sm leading-6 text-muted" role="status" aria-live="polite">
        {message || "Structured for reporting review, not direct publication."}
      </p>
    </div>
  );
}
