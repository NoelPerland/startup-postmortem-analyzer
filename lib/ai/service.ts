import type { AnalysisInput } from "@/domain/inputs";
import { promptVersion } from "@/domain/prompts";
import { buildAnalysisIdentity } from "@/lib/analysis-identity";
import { DemoAnalysisProvider } from "@/lib/ai/providers/demo";
import { OpenAIAnalysisProvider } from "@/lib/ai/providers/openai";
import { getEnv, getRuntimeCapabilities } from "@/lib/env";
import { createAnalysisCache } from "@/lib/future";

const LIVE_CACHE_TTL_SECONDS = 60 * 60 * 24;

export function getRuntimeSummary() {
  const runtime = getRuntimeCapabilities();

  return {
    liveAvailable: runtime.liveAvailable,
  };
}

export async function generatePostMortemDraft(input: AnalysisInput) {
  const env = getEnv();
  const nowIso = new Date().toISOString();
  const identity = buildAnalysisIdentity({
    subject: input.subject,
    contextNotes: input.contextNotes,
    provider: "openai",
    model: env.OPENAI_MODEL,
    promptVersion,
  });
  const providerInput = {
    target: identity.target,
    contextNotes: identity.normalizedContextNotes,
    nowIso,
    lookupKey: identity.lookupKey,
  };

  if (!env.OPENAI_API_KEY) {
    console.info("[analysis] demo mode", {
      subject: identity.normalizedSubject,
      reason: "no_api_key",
    });

    return {
      ...(await new DemoAnalysisProvider().generateAnalysis(providerInput)),
      usedMode: "demo" as const,
      message: "Showing a polished sample draft because no live model is configured.",
      lookupKey: identity.lookupKey,
    };
  }

  const cache = createAnalysisCache();
  const cached = await cache.get(identity.cacheKey);

  if (cached) {
    console.info("[analysis] cache hit", {
      subject: identity.normalizedSubject,
      lookupKey: identity.lookupKey,
      model: env.OPENAI_MODEL,
    });

    return {
      analysis: cached,
      provider: "openai",
      model: env.OPENAI_MODEL,
      usedMode: "live" as const,
      message: "Loaded a cached live draft for this lookup.",
      cacheKey: identity.cacheKey,
      lookupKey: identity.lookupKey,
      cached: true,
    };
  }

  const provider = new OpenAIAnalysisProvider(env.OPENAI_API_KEY, env.OPENAI_MODEL);

  try {
    const result = await provider.generateAnalysis(providerInput);

    await cache.set(identity.cacheKey, result.analysis, LIVE_CACHE_TTL_SECONDS);

    console.info("[analysis] live success", {
      subject: identity.normalizedSubject,
      lookupKey: identity.lookupKey,
      model: env.OPENAI_MODEL,
      repairCount: result.repairCount ?? 0,
      cached: false,
    });

    return {
      ...result,
      usedMode: "live" as const,
      message:
        result.repairCount && result.repairCount > 0
          ? "Structured draft generated from the live model after a schema repair pass."
          : "Structured draft generated from the live model.",
      cacheKey: identity.cacheKey,
      lookupKey: identity.lookupKey,
    };
  } catch (error) {
    const fallback = await new DemoAnalysisProvider().generateAnalysis(providerInput);
    const fallbackReason =
      error instanceof Error ? error.message : "Live generation failed unexpectedly.";

    console.warn("[analysis] live fallback", {
      subject: identity.normalizedSubject,
      lookupKey: identity.lookupKey,
      model: env.OPENAI_MODEL,
      fallbackReason,
    });

    return {
      ...fallback,
      usedMode: "demo" as const,
      message:
        "Live generation was unavailable for this request, so a demo-quality fallback draft is shown instead.",
      fallbackReason,
      lookupKey: identity.lookupKey,
    };
  }
}
