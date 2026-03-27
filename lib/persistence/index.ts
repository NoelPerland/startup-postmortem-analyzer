import { getEnv } from "@/lib/env";
import { NoopAnalysisStore } from "@/lib/persistence/noop";
import { PostgresAnalysisStore } from "@/lib/persistence/postgres";

export function createAnalysisStore() {
  const env = getEnv();

  if (!env.DATABASE_URL) {
    return new NoopAnalysisStore();
  }

  return new PostgresAnalysisStore(env.DATABASE_URL);
}

export async function loadSharedAnalysisByShareId(shareId: string) {
  try {
    return await createAnalysisStore().getAnalysisByShareId(shareId);
  } catch (error) {
    console.warn("[persistence] shared analysis load failed", error);
    return null;
  }
}

export async function loadRecentAnalyses(limit = 10) {
  try {
    return await createAnalysisStore().listRecentAnalyses({ limit });
  } catch (error) {
    console.warn("[persistence] recent analyses load failed", error);
    return [];
  }
}
