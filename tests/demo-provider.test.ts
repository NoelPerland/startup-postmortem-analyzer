import { describe, expect, it } from "vitest";
import { postMortemAnalysisSchema } from "@/domain/postmortem";
import { DemoAnalysisProvider } from "@/lib/ai/providers/demo";

describe("DemoAnalysisProvider", () => {
  it("returns a valid structured analysis", async () => {
    const provider = new DemoAnalysisProvider();
    const result = await provider.generateAnalysis({
      target: {
        displayName: "Northvolt",
        inputType: "company",
      },
      contextNotes: "Battery manufacturing",
      nowIso: "2026-03-25T10:00:00.000Z",
      lookupKey: "northvolt-demo",
    });

    expect(result.provider).toBe("demo");
    expect(() => postMortemAnalysisSchema.parse(result.analysis)).not.toThrow();
  });
});
