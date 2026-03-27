import { afterEach, beforeEach, describe, expect, it } from "vitest";

const originalEnv = {
  VALKEY_URL: process.env.VALKEY_URL,
  MEILISEARCH_HOST: process.env.MEILISEARCH_HOST,
  MEILISEARCH_API_KEY: process.env.MEILISEARCH_API_KEY,
};

describe("optional integration factories", () => {
  beforeEach(() => {
    process.env.VALKEY_URL = "";
    process.env.MEILISEARCH_HOST = "";
    process.env.MEILISEARCH_API_KEY = "";
  });

  afterEach(() => {
    process.env.VALKEY_URL = originalEnv.VALKEY_URL;
    process.env.MEILISEARCH_HOST = originalEnv.MEILISEARCH_HOST;
    process.env.MEILISEARCH_API_KEY = originalEnv.MEILISEARCH_API_KEY;
  });

  it("returns no-op implementations with no integration env vars", async () => {
    const {
      NoopAnalysisCache,
      NoopAnalysisIndexer,
      createAnalysisCache,
      createAnalysisIndexer,
    } = await import("@/lib/future");

    expect(createAnalysisCache()).toBeInstanceOf(NoopAnalysisCache);
    expect(createAnalysisIndexer()).toBeInstanceOf(NoopAnalysisIndexer);
  });

  it("returns real implementations when integration env vars are present", async () => {
    process.env.VALKEY_URL = "redis://127.0.0.1:6379";
    process.env.MEILISEARCH_HOST = "http://127.0.0.1:7700";

    const {
      MeilisearchAnalysisIndexer,
      ValkeyAnalysisCache,
      createAnalysisCache,
      createAnalysisIndexer,
    } = await import("@/lib/future");

    expect(createAnalysisCache()).toBeInstanceOf(ValkeyAnalysisCache);
    expect(createAnalysisIndexer()).toBeInstanceOf(MeilisearchAnalysisIndexer);
  });
});
