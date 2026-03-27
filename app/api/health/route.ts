import { NextResponse } from "next/server";
import { getRuntimeCapabilities } from "@/lib/env";

export async function GET() {
  const runtime = getRuntimeCapabilities();
  const notes: string[] = [];

  if (!runtime.liveAvailable) {
    notes.push("OPENAI_API_KEY is not configured; the app will run in Demo Mode.");
  }

  if (!runtime.persistenceConfigured) {
    notes.push("DATABASE_URL is not configured; durable share links are disabled.");
  }

  if (!runtime.cacheConfigured) {
    notes.push("VALKEY_URL is not configured; repeated live lookups are not cached.");
  }

  if (!runtime.searchConfigured) {
    notes.push("MEILISEARCH_HOST is not configured; saved analyses are not indexed.");
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    app: "startup-postmortem-analyzer",
    mode: runtime.defaultMode,
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? "development",
      appUrlConfigured: runtime.appUrlAvailable,
      defaultMode: runtime.defaultMode,
      openAiModel: runtime.openAiModel,
    },
    configured: {
      openai: runtime.liveAvailable,
      postgres: runtime.persistenceConfigured,
      valkey: runtime.cacheConfigured,
      meilisearch: runtime.searchConfigured,
    },
    notes: notes.length ? notes : undefined,
  });
}
