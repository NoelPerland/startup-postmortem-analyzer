import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoAnalysis } from "@/lib/demo-data";

const originalEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  VALKEY_URL: process.env.VALKEY_URL,
  MEILISEARCH_HOST: process.env.MEILISEARCH_HOST,
};

const analysis = getDemoAnalysis(
  {
    displayName: "Northvolt",
    inputType: "company",
  },
  "Battery manufacturing",
  "2026-03-25T10:00:00.000Z",
);

describe("route behavior", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "";
    process.env.OPENAI_MODEL = "gpt-5-mini";
    process.env.DATABASE_URL = "";
    process.env.APP_URL = "http://localhost:3000";
    process.env.VALKEY_URL = "";
    process.env.MEILISEARCH_HOST = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
    process.env.OPENAI_MODEL = originalEnv.OPENAI_MODEL;
    process.env.DATABASE_URL = originalEnv.DATABASE_URL;
    process.env.APP_URL = originalEnv.APP_URL;
    process.env.VALKEY_URL = originalEnv.VALKEY_URL;
    process.env.MEILISEARCH_HOST = originalEnv.MEILISEARCH_HOST;
  });

  it("falls back to demo mode when no API key is configured", async () => {
    const { generatePostMortemDraft } = await import("@/lib/ai/service");
    const result = await generatePostMortemDraft({
      subject: "Unknown Startup",
      contextNotes: "",
    });

    expect(result.usedMode).toBe("demo");
    expect(result.analysis.sourceMode).toBe("demo");
  });

  it("returns a graceful stateless response when persistence is unavailable", async () => {
    vi.doMock("@/lib/persistence", () => ({
      createAnalysisStore: () => ({
        isAvailable: async () => false,
        saveAnalysis: vi.fn(),
        getAnalysisByShareId: vi.fn(),
      }),
    }));

    const { POST } = await import("@/app/api/share/route");
    const response = await POST(
      new Request("http://localhost:3000/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Northvolt",
          contextNotes: "Battery manufacturing",
          analysis,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      available: false,
      reason: "persistence_not_configured",
    });
  });

  it("creates a share link when persistence is available", async () => {
    const store = {
      isAvailable: async () => true,
      saveAnalysis: vi.fn(async () => ({
        shareId: "abc123",
        createdAt: "2026-03-25T10:00:00.000Z",
      })),
      getAnalysisByShareId: vi.fn(async () => ({
        id: "row-1",
        shareId: "abc123",
        subject: "Northvolt",
        contextNotes: "Battery manufacturing",
        analysis,
        createdAt: "2026-03-25T10:00:00.000Z",
        provider: "demo",
        model: "demo-samples",
        cacheKey: null,
      })),
    };

    vi.doMock("@/lib/persistence", () => ({
      createAnalysisStore: () => store,
    }));
    vi.doMock("@/lib/future", () => ({
      createAnalysisIndexer: () => ({
        isAvailable: async () => false,
        index: vi.fn(),
        search: vi.fn(),
      }),
    }));

    const { POST } = await import("@/app/api/share/route");
    const response = await POST(
      new Request("http://localhost:3000/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Northvolt",
          contextNotes: "Battery manufacturing",
          analysis,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      available: true,
      shareId: "abc123",
      shareUrl: "http://localhost:3000/a/abc123",
    });
    expect(store.saveAnalysis).toHaveBeenCalledOnce();
  });

  it("still returns a share link when indexing fails after save", async () => {
    const store = {
      isAvailable: async () => true,
      saveAnalysis: vi.fn(async () => ({
        shareId: "abc123",
        createdAt: "2026-03-25T10:00:00.000Z",
      })),
      getAnalysisByShareId: vi.fn(),
    };

    vi.doMock("@/lib/persistence", () => ({
      createAnalysisStore: () => store,
    }));
    vi.doMock("@/lib/future", () => ({
      createAnalysisIndexer: () => ({
        isAvailable: async () => true,
        index: vi.fn(async () => {
          throw new Error("index offline");
        }),
        search: vi.fn(),
      }),
    }));

    const { POST } = await import("@/app/api/share/route");
    const response = await POST(
      new Request("http://localhost:3000/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Northvolt",
          contextNotes: "Battery manufacturing",
          analysis,
        }),
      }),
    );
    const payload = await response.json();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      available: true,
      shareId: "abc123",
      shareUrl: "http://localhost:3000/a/abc123",
    });
    expect(store.saveAnalysis).toHaveBeenCalledOnce();
  });

  it("reports safe health diagnostics for zero-env demo mode", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(payload.mode).toBe("demo");
    expect(payload.configured).toEqual({
      openai: false,
      postgres: false,
      valkey: false,
      meilisearch: false,
    });
    expect(payload.notes).toContain(
      "OPENAI_API_KEY is not configured; the app will run in Demo Mode.",
    );
  });
});
