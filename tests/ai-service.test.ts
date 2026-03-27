import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoAnalysis } from "@/lib/demo-data";

const originalEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  VALKEY_URL: process.env.VALKEY_URL,
};

describe("generatePostMortemDraft", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-5-mini";
    process.env.VALKEY_URL = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
    process.env.OPENAI_MODEL = originalEnv.OPENAI_MODEL;
    process.env.VALKEY_URL = originalEnv.VALKEY_URL;
  });

  it("falls back to a demo draft when live generation throws", async () => {
    vi.doMock("@/lib/ai/providers/openai", () => ({
      OpenAIAnalysisProvider: class {
        async generateAnalysis() {
          throw new Error("rate limited");
        }
      },
    }));
    vi.doMock("@/lib/future", () => ({
      createAnalysisCache: () => ({
        isAvailable: async () => false,
        get: async () => null,
        set: async () => undefined,
      }),
    }));

    const { generatePostMortemDraft } = await import("@/lib/ai/service");
    const result = await generatePostMortemDraft({
      subject: "Northvolt",
      contextNotes: "Battery manufacturing",
    });

    expect(result.usedMode).toBe("demo");
    expect(result.analysis.sourceMode).toBe("demo");
    expect(result.message).toContain("demo-quality fallback draft");
  });

  it("returns a cached live draft before calling the live provider", async () => {
    const cachedAnalysis = {
      ...getDemoAnalysis(
        {
          displayName: "Northvolt",
          inputType: "company",
        },
        "Battery manufacturing",
        "2026-03-25T10:00:00.000Z",
      ),
      sourceMode: "ai" as const,
    };
    const generateAnalysis = vi.fn();

    vi.doMock("@/lib/ai/providers/openai", () => ({
      OpenAIAnalysisProvider: class {
        generateAnalysis = generateAnalysis;
      },
    }));
    vi.doMock("@/lib/future", () => ({
      createAnalysisCache: () => ({
        isAvailable: async () => true,
        get: async () => cachedAnalysis,
        set: async () => undefined,
      }),
    }));

    const { generatePostMortemDraft } = await import("@/lib/ai/service");
    const result = await generatePostMortemDraft({
      subject: "Northvolt",
      contextNotes: "Battery manufacturing",
    });

    expect(result.usedMode).toBe("live");
    expect(result.cached).toBe(true);
    expect(result.analysis.sourceMode).toBe("ai");
    expect(generateAnalysis).not.toHaveBeenCalled();
  });
});
