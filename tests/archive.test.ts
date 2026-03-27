import { describe, expect, it, vi } from "vitest";
import type { SearchDocument } from "@/lib/future";
import { getDemoAnalysis } from "@/lib/demo-data";
import {
  buildArchiveSnippet,
  loadArchiveSnapshot,
  prepareArchiveSearchResults,
} from "@/lib/archive";

const storedAnalysis = {
  id: "row-1",
  shareId: "abc123",
  subject: "Northvolt",
  contextNotes: "Battery manufacturing and capital intensity",
  analysis: getDemoAnalysis(
    {
      displayName: "Northvolt",
      inputType: "company",
    },
    "Battery manufacturing and capital intensity",
    "2026-03-25T10:00:00.000Z",
  ),
  createdAt: "2026-03-25T11:00:00.000Z",
  provider: "demo",
  model: "demo-samples",
  cacheKey: null,
} as const;

const searchDocuments: SearchDocument[] = [
  {
    id: "row-2",
    shareId: "weaker",
    subject: "Battery supply chains",
    company: "Industrial supply chain memo",
    overview: "A broad note that mentions Northvolt only deep in the overview.",
    generatedAt: "2026-03-24T08:00:00.000Z",
    createdAt: "2026-03-24T09:00:00.000Z",
    contextNotes: "Northvolt appears in the middle of this memo.",
    provider: "openai",
    model: "gpt-5-mini",
    cacheKey: null,
    sourceMode: "ai",
    timelineText: "",
    whatWentWrongText: "",
    whatCouldHaveSavedItText: "",
    lessonsForFoundersText: "",
    appendixText: "",
  },
  {
    id: "row-1",
    shareId: "stronger",
    subject: "Northvolt",
    company: "Northvolt",
    overview:
      "Northvolt expanded too quickly into capital-heavy manufacturing before the operating discipline was ready.",
    generatedAt: "2026-03-25T10:00:00.000Z",
    createdAt: "2026-03-25T11:00:00.000Z",
    contextNotes: "Battery manufacturing and capital intensity",
    provider: "openai",
    model: "gpt-5-mini",
    cacheKey: "cache-key",
    sourceMode: "ai",
    timelineText: "2021 Gigafactory build-out accelerates",
    whatWentWrongText: "Execution slipped as the capital burden grew.",
    whatCouldHaveSavedItText: "A tighter scope and a slower plant rollout.",
    lessonsForFoundersText: "Match expansion speed to operational maturity.",
    appendixText: "Open questions remain about financing timing.",
  },
];

describe("archive helpers", () => {
  it("returns a calm unavailable snapshot when persistence is not configured", async () => {
    const snapshot = await loadArchiveSnapshot({
      runtime: {
        liveAvailable: false,
        persistenceConfigured: false,
        cacheConfigured: false,
        searchConfigured: false,
        appUrl: undefined,
      },
    });

    expect(snapshot.persistenceConfigured).toBe(false);
    expect(snapshot.recent).toEqual([]);
    expect(snapshot.searchState).toBe("disabled");
  });

  it("loads recent drafts without calling search when indexing is not configured", async () => {
    const loadRecent = vi.fn(async () => [storedAnalysis]);
    const search = vi.fn(async () => searchDocuments);

    const snapshot = await loadArchiveSnapshot({
      query: "Northvolt",
      runtime: {
        liveAvailable: false,
        persistenceConfigured: true,
        cacheConfigured: false,
        searchConfigured: false,
        appUrl: undefined,
      },
      loadRecent,
      search,
    });

    expect(loadRecent).toHaveBeenCalledWith(12);
    expect(search).not.toHaveBeenCalled();
    expect(snapshot.recent).toHaveLength(1);
    expect(snapshot.searchResults).toEqual([]);
    expect(snapshot.searchState).toBe("disabled");
  });

  it("prioritizes direct company matches and builds readable snippets", () => {
    const results = prepareArchiveSearchResults(searchDocuments, "Northvolt");

    expect(results[0]?.shareId).toBe("stronger");
    expect(results[0]?.matchedField).toBe("company");
    expect(results[0]?.preview).toContain("Northvolt expanded too quickly");
  });

  it("falls back to a trimmed overview when no query token is matched", () => {
    const snippet = buildArchiveSnippet(searchDocuments[0], "foundry");

    expect(snippet).toBe("A broad note that mentions Northvolt only deep in the overview.");
  });
});
