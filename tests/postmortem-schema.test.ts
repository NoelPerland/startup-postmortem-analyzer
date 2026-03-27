import { describe, expect, it } from "vitest";
import { sanitizeModelAnalysis } from "@/domain/postmortem";

describe("sanitizeModelAnalysis", () => {
  it("trims whitespace, dedupes bullets, and normalizes punctuation", () => {
    const sanitized = sanitizeModelAnalysis({
      overview: "  A company story with too much punctuation....  ",
      timeline: [
        {
          dateLabel: "  2020  ",
          event: " Launches a flagship product.. ",
          kind: "product",
        },
        {
          dateLabel: "2020",
          event: "Launches a flagship product..",
          kind: "product",
        },
        {
          dateLabel: "2021",
          event: "Runs into financing strain!!",
          kind: "funding",
        },
      ],
      whatWentWrong: {
        title: "  What Went Wrong ",
        summary: "  Costs ran ahead of proof.. ",
        bullets: [" Burn rose quickly  ", "Burn rose quickly", "  Demand stayed soft "],
      },
      whatCouldHaveSavedIt: {
        title: "What Could Have Saved It",
        summary: " Narrower scope  ",
        bullets: ["Cut burn", " Cut burn ", "Focus earlier"],
      },
      lessonsForFounders: {
        title: " Lessons ",
        summary: "  Evidence before expansion  ",
        bullets: ["Test demand", "Test demand", "Protect runway"],
      },
      observedFacts: ["  Public launch announced  ", "Public launch announced", "Funding later tightened"],
      plausibleHypotheses: ["Margins were thin", " Margins were thin ", "Timing worsened"],
      openQuestions: ["Which customer segment really converted?", "Which customer segment really converted?", "What internal milestone slipped first?"],
    });

    expect(sanitized.overview).toBe("A company story with too much punctuation.");
    expect(sanitized.timeline).toHaveLength(2);
    expect(sanitized.whatWentWrong.bullets).toEqual([
      "Burn rose quickly",
      "Demand stayed soft",
    ]);
    expect(sanitized.whatCouldHaveSavedIt.bullets).toEqual([
      "Cut burn",
      "Focus earlier",
    ]);
    expect(sanitized.observedFacts).toEqual([
      "Public launch announced",
      "Funding later tightened",
    ]);
  });
});
