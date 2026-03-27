import { describe, expect, it } from "vitest";
import {
  analyzeRequestSchema,
  buildLookupBase,
  normalizeCompanyTarget,
  normalizeContextNotes,
} from "@/domain/inputs";

describe("analyzeRequestSchema", () => {
  it("accepts a company name", () => {
    const result = analyzeRequestSchema.parse({
      subject: "  Northvolt  ",
      contextNotes: "Battery   manufacturing",
    });

    expect(result.subject).toBe("Northvolt");
    expect(result.contextNotes).toBe("Battery manufacturing");
  });

  it("accepts a URL", () => {
    const result = analyzeRequestSchema.parse({
      subject: "quibi.com",
      contextNotes: "",
    });

    expect(result.subject).toBe("quibi.com");
  });

  it("rejects empty input", () => {
    const result = analyzeRequestSchema.safeParse({
      subject: "",
      contextNotes: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("normalizeCompanyTarget", () => {
  it("normalizes company strings", () => {
    expect(normalizeCompanyTarget("Babylon Health")).toEqual({
      displayName: "Babylon Health",
      inputType: "company",
    });
  });

  it("normalizes likely URLs", () => {
    expect(normalizeCompanyTarget("https://www.quibi.com/path/?utm=1#top")).toEqual({
      displayName: "Quibi",
      inputType: "url",
      normalizedUrl: "https://quibi.com/path",
    });
  });

  it("normalizes reporter notes for stable lookup use", () => {
    expect(normalizeContextNotes("  Governance   tension \n and burn  ")).toBe(
      "Governance tension and burn",
    );
  });

  it("builds a stable lookup base for cache and dedupe use", () => {
    expect(
      buildLookupBase(" https://www.Quibi.com/?utm=1 ", "  mobile   video  "),
    ).toEqual({
      target: {
        displayName: "Quibi",
        inputType: "url",
        normalizedUrl: "https://quibi.com",
      },
      normalizedSubject: "https://quibi.com",
      normalizedContextNotes: "mobile video",
    });
  });
});
