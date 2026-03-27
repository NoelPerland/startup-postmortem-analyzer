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
        "Permalinks require persistence in this deployment. Export as PDF or keep this tab open.",
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
          "Permalinks require persistence in this deployment. Export as PDF or keep this tab open.",
        );
        return;
      }

      setShareUrl(payload.shareUrl);
      await copyLink(payload.shareUrl, "Permalink created and copied.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create a permalink right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  const shareLabel = shareUrl ? "Copy permalink" : "Create share link";

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void handleShare();
            }}
            disabled={busy}
            className="button-secondary"
          >
            {busy ? "Creating permalink" : shareLabel}
          </button>
          <button type="button" onClick={() => window.print()} className="button-primary">
            Export as PDF
          </button>
        </div>
        <p className="text-sm leading-6 text-muted">
          Use your browser&apos;s print dialog for a clean PDF export.
        </p>
      </div>

      {shareUrl ? (
        <div className="surface-inset px-4 py-4">
          <label
            htmlFor="share-url"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted"
          >
            Permalink
          </label>
          <input
            id="share-url"
            readOnly
            value={shareUrl}
            className="input-surface mt-3 text-sm break-all"
            aria-label="Saved permalink"
          />
        </div>
      ) : null}

      {!shareAvailable && !shareUrl ? (
        <p className="text-sm leading-6 text-muted">
          Durable links need PostgreSQL. PDF export still works now.
        </p>
      ) : null}

      <p className="text-sm leading-6 text-muted" role="status" aria-live="polite">
        {message || "Structured for reporting review, not direct publication."}
      </p>
    </div>
  );
}
