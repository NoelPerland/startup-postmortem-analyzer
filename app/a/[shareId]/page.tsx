import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { ShareControls } from "@/components/share-controls";
import { getRuntimeFlags } from "@/lib/env";
import { loadSharedAnalysisByShareId } from "@/lib/persistence";
import { buildShareUrl } from "@/lib/share/strategy";
import { buildSharedDraftMetadata } from "@/lib/social";
import { resolvePublicOrigin } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SharedPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export async function generateMetadata({
  params,
}: SharedPageProps): Promise<Metadata> {
  const { shareId } = await params;
  const record = await loadSharedAnalysisByShareId(shareId);
  const runtime = getRuntimeFlags();

  if (!record) {
    return {
      title: "Shared Analysis Not Found",
    };
  }

  return buildSharedDraftMetadata(record, runtime.appUrl);
}

export default async function SharedAnalysisPage({ params }: SharedPageProps) {
  const { shareId } = await params;
  const record = await loadSharedAnalysisByShareId(shareId);

  if (!record) {
    notFound();
  }

  const runtime = getRuntimeFlags();
  const shareUrl = buildShareUrl(resolvePublicOrigin(runtime.appUrl), shareId);

  return (
    <main className="print-page mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="print-hidden mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="font-medium text-accent transition hover:opacity-80">
            Back to analyzer
          </Link>
          <a href="/archive" className="font-medium text-accent transition hover:opacity-80">
            Archive
          </a>
        </div>
        <span>Saved permalink</span>
      </div>
      <div className="print-hidden mb-4 rounded-[1.25rem] border border-border bg-paper-strong px-5 py-4 text-sm leading-7 text-muted">
        This link preserves the saved draft as it was generated at the time of sharing.
        {record.analysis.sourceMode === "demo"
          ? " This permalink contains sample output from Demo Mode, not a live model response."
          : " This permalink contains a saved live-model draft. Verify against reporting before reuse."}
      </div>
      <ArticleView analysis={record.analysis}>
        <div className="print-hidden border-t border-border px-6 py-5 sm:px-10">
          <ShareControls
            analysis={record.analysis}
            contextNotes={record.contextNotes}
            existingShareUrl={shareUrl}
            shareAvailable={true}
            subject={record.subject}
          />
          <p className="mt-3 text-sm leading-6 text-muted">
            This page is the shareable version of the draft. Use print or Save as PDF
            for a clean article export.
          </p>
        </div>
      </ArticleView>
    </main>
  );
}
