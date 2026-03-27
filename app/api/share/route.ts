import { NextResponse } from "next/server";
import { promptVersion } from "@/domain/prompts";
import { shareRequestSchema, shareResponseSchema } from "@/domain/postmortem";
import { buildAnalysisIdentity } from "@/lib/analysis-identity";
import { getEnv } from "@/lib/env";
import { createAnalysisIndexer } from "@/lib/future";
import { createAnalysisStore } from "@/lib/persistence";
import { buildShareUrl, resolveShareAvailability } from "@/lib/share/strategy";
import { resolvePublicOrigin } from "@/lib/utils";

export async function POST(request: Request) {
  const env = getEnv();
  const body = await request.json().catch(() => null);
  const parsedBody = shareRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "A saved link could not be created from this result.",
      },
      { status: 400 },
    );
  }

  const store = createAnalysisStore();
  const available = await store.isAvailable().catch(() => false);
  const availability = resolveShareAvailability(available);

  if (!availability.available) {
    return NextResponse.json(
      shareResponseSchema.parse({
        available: false,
        reason: "persistence_not_configured",
      }),
    );
  }

  const provider = parsedBody.data.analysis.sourceMode === "ai" ? "openai" : "demo";
  const model =
    parsedBody.data.analysis.sourceMode === "ai" ? env.OPENAI_MODEL : "demo-samples";
  const identity = buildAnalysisIdentity({
    subject: parsedBody.data.subject,
    contextNotes: parsedBody.data.contextNotes,
    provider,
    model,
    promptVersion,
  });

  try {
    const saved = await store.saveAnalysis({
      subject: parsedBody.data.subject,
      contextNotes: parsedBody.data.contextNotes,
      analysis: parsedBody.data.analysis,
      provider,
      model,
      cacheKey: parsedBody.data.analysis.sourceMode === "ai" ? identity.cacheKey : undefined,
    });
    const shareUrl = buildShareUrl(
      resolvePublicOrigin(env.APP_URL, request.url),
      saved.shareId,
    );
    const indexer = createAnalysisIndexer();

    void (async () => {
      try {
        if (!(await indexer.isAvailable())) {
          return;
        }

        await indexer.index({
          id: saved.shareId,
          shareId: saved.shareId,
          subject: parsedBody.data.subject,
          contextNotes: parsedBody.data.contextNotes,
          analysis: parsedBody.data.analysis,
          createdAt: saved.createdAt,
          provider,
          model,
          cacheKey:
            parsedBody.data.analysis.sourceMode === "ai" ? identity.cacheKey : null,
        });
      } catch (indexingError) {
        console.warn("[share] indexing skipped after save", indexingError);
      }
    })();

    return NextResponse.json(
      shareResponseSchema.parse({
        available: true,
        shareId: saved.shareId,
        shareUrl,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "A saved link could not be created right now.",
      },
      { status: 503 },
    );
  }
}
