import { describe, expect, it } from "vitest";
import { getDemoAnalysis } from "@/lib/demo-data";
import { buildDefaultMetadata, buildSharedDraftMetadata } from "@/lib/social";

const liveRecord = {
  id: "row-1",
  shareId: "abc123",
  subject: "Northvolt",
  contextNotes: "Battery manufacturing",
  analysis: {
    ...getDemoAnalysis(
      {
        displayName: "Northvolt",
        inputType: "company",
      },
      "Battery manufacturing",
      "2026-03-25T10:00:00.000Z",
    ),
    sourceMode: "ai" as const,
  },
  createdAt: "2026-03-25T11:00:00.000Z",
  provider: "openai",
  model: "gpt-5-mini",
  cacheKey: "cache-key",
};

describe("social metadata", () => {
  it("builds site metadata with a default Open Graph image", () => {
    const metadata = buildDefaultMetadata("https://demo.example.com/app");

    expect(metadata.metadataBase?.toString()).toBe("https://demo.example.com/");
    expect(metadata.openGraph?.images).toEqual(["https://demo.example.com/opengraph-image"]);
    expect(metadata.twitter).toEqual(expect.objectContaining({ card: "summary_large_image" }));
  });

  it("builds canonical shared metadata when APP_URL is configured", () => {
    const metadata = buildSharedDraftMetadata(liveRecord, "https://demo.example.com/app");

    expect(metadata.alternates?.canonical).toBe("https://demo.example.com/a/abc123");
    expect(metadata.openGraph).toMatchObject({
      url: "https://demo.example.com/a/abc123",
      type: "article",
      siteName: "Startup Post-Mortem Analyzer",
      images: ["https://demo.example.com/a/abc123/opengraph-image"],
    });
    expect(metadata.description).toContain("Structured for reporting review");
  });

  it("omits canonicals when APP_URL is unavailable", () => {
    const metadata = buildSharedDraftMetadata(liveRecord);

    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({
      images: ["/a/abc123/opengraph-image"],
    });
  });

  it("keeps the root canonical unset when APP_URL is unavailable", () => {
    const metadata = buildDefaultMetadata();

    expect(metadata.alternates).toBeUndefined();
    expect(metadata.metadataBase?.toString()).toBe("http://localhost:3000/");
  });
});
