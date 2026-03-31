import type { StoredAnalysisRecord } from "@/domain/postmortem";
import { getRuntimeFlags } from "@/lib/env";
import { createAnalysisIndexer, type SearchDocument } from "@/lib/future";
import { loadRecentAnalyses } from "@/lib/persistence";
import { truncateCopy } from "@/lib/utils";

type ArchiveRuntime = ReturnType<typeof getRuntimeFlags>;

type SearchField = {
  label: string;
  value: string;
  weight: number;
};

export type ArchiveSearchResult = SearchDocument & {
  preview: string;
  matchedField: string;
  score: number;
};

export type ArchiveSnapshot = {
  query: string;
  persistenceConfigured: boolean;
  searchConfigured: boolean;
  searchMode: "disabled" | "local" | "indexed";
  recent: StoredAnalysisRecord[];
  searchResults: ArchiveSearchResult[];
  searchState: "disabled" | "idle" | "results" | "empty";
};

type LoadArchiveSnapshotOptions = {
  query?: string;
  limit?: number;
  runtime?: ArchiveRuntime;
  loadRecent?: (limit: number) => Promise<StoredAnalysisRecord[]>;
  search?: (query: string, limit: number) => Promise<SearchDocument[]>;
};

const defaultLimit = 12;

export async function loadArchiveSnapshot(
  options: LoadArchiveSnapshotOptions = {},
): Promise<ArchiveSnapshot> {
  const runtime = options.runtime ?? getRuntimeFlags();
  const query = normalizeArchiveQuery(options.query);
  const limit = options.limit ?? defaultLimit;

  if (!runtime.persistenceConfigured) {
    return {
      query,
      persistenceConfigured: false,
      searchConfigured: runtime.searchConfigured,
      searchMode: "disabled",
      recent: [],
      searchResults: [],
      searchState: runtime.searchConfigured && query ? "empty" : "disabled",
    };
  }

  const loadRecent = options.loadRecent ?? loadRecentAnalyses;
  const recentLoadLimit =
    query && !runtime.searchConfigured ? Math.max(limit * 3, 36) : limit;
  const loadedRecent = await loadRecent(recentLoadLimit);
  const recent = loadedRecent.slice(0, limit);

  if (!query) {
    return {
      query,
      persistenceConfigured: true,
      searchConfigured: runtime.searchConfigured,
      searchMode: runtime.searchConfigured ? "indexed" : "local",
      recent,
      searchResults: [],
      searchState: "idle",
    };
  }

  if (!runtime.searchConfigured) {
    const localSearchResults = prepareArchiveSearchResults(
      loadedRecent.map(toArchiveSearchDocument),
      query,
      limit,
    );

    return {
      query,
      persistenceConfigured: true,
      searchConfigured: false,
      searchMode: "local",
      recent,
      searchResults: localSearchResults,
      searchState: localSearchResults.length ? "results" : "empty",
    };
  }

  const search =
    options.search ?? ((searchQuery: string, searchLimit: number) => createAnalysisIndexer().search(searchQuery, searchLimit));
  const rawResults = await search(query, limit);
  const searchResults = prepareArchiveSearchResults(rawResults, query, limit);

  return {
    query,
    persistenceConfigured: true,
    searchConfigured: true,
    searchMode: "indexed",
    recent,
    searchResults,
    searchState: searchResults.length ? "results" : "empty",
  };
}

function toArchiveSearchDocument(record: StoredAnalysisRecord): SearchDocument {
  return {
    id: record.id,
    shareId: record.shareId,
    subject: record.subject,
    company: record.analysis.company.displayName,
    overview: record.analysis.overview,
    generatedAt: record.analysis.generatedAt,
    createdAt: record.createdAt,
    contextNotes: record.contextNotes,
    provider: record.provider,
    model: record.model,
    cacheKey: record.cacheKey ?? null,
    sourceMode: record.analysis.sourceMode,
    timelineText: record.analysis.timeline
      .map((entry) => `${entry.dateLabel} ${entry.event}`)
      .join("\n"),
    whatWentWrongText: flattenSection(record.analysis.whatWentWrong),
    whatCouldHaveSavedItText: flattenSection(record.analysis.whatCouldHaveSavedIt),
    lessonsForFoundersText: flattenSection(record.analysis.lessonsForFounders),
    appendixText: [
      ...record.analysis.observedFacts,
      ...record.analysis.plausibleHypotheses,
      ...record.analysis.openQuestions,
    ].join("\n"),
  };
}

export function prepareArchiveSearchResults(
  hits: SearchDocument[],
  query: string,
  limit = defaultLimit,
) {
  const normalizedQuery = normalizeArchiveQuery(query);

  return hits
    .map((entry) => {
      const matched = selectMatchedField(entry, normalizedQuery);

      return {
        ...entry,
        matchedField: matched.label,
        preview: buildArchiveSnippet(entry, normalizedQuery, matched.value),
        score: scoreSearchDocument(entry, normalizedQuery),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    })
    .slice(0, limit);
}

export function buildArchiveSnippet(
  entry: SearchDocument,
  query: string,
  preferredField?: string,
  maxLength = 220,
) {
  const tokens = getSearchTokens(query);
  const fields = getSearchFields(entry);

  if (preferredField) {
    const snippet = buildSnippetFromField(preferredField, tokens, maxLength);

    if (snippet && snippet.length >= 40) {
      return snippet;
    }
  }

  const fallbackFields = preferredField
    ? fields.filter((field) => field.value !== preferredField)
    : fields;

  for (const field of fallbackFields) {
    const snippet = buildSnippetFromField(field.value, tokens, maxLength);

    if (snippet) {
      return snippet;
    }
  }

  return truncateCopy(entry.overview, maxLength);
}

function scoreSearchDocument(entry: SearchDocument, query: string) {
  const normalizedQuery = query.toLowerCase();
  const tokens = getSearchTokens(query);
  let score = 0;

  const company = entry.company.toLowerCase();
  const subject = entry.subject.toLowerCase();

  if (company === normalizedQuery) {
    score += 220;
  }

  if (subject === normalizedQuery) {
    score += 200;
  }

  for (const field of getSearchFields(entry)) {
    const value = field.value.toLowerCase();

    for (const token of tokens) {
      if (value.includes(token)) {
        score += field.weight;
      }
    }
  }

  return score;
}

function selectMatchedField(entry: SearchDocument, query: string) {
  const tokens = getSearchTokens(query);

  for (const field of getSearchFields(entry)) {
    const value = field.value.toLowerCase();

    if (tokens.some((token) => value.includes(token))) {
      return field;
    }
  }

  return getSearchFields(entry)[0];
}

function getSearchFields(entry: SearchDocument): SearchField[] {
  return [
    {
      label: "company",
      value: entry.company,
      weight: 60,
    },
    {
      label: "subject",
      value: entry.subject,
      weight: 54,
    },
    {
      label: "overview",
      value: entry.overview,
      weight: 28,
    },
    {
      label: "reporting notes",
      value: entry.contextNotes,
      weight: 20,
    },
    {
      label: "failure analysis",
      value: entry.whatWentWrongText,
      weight: 22,
    },
    {
      label: "salvage analysis",
      value: entry.whatCouldHaveSavedItText,
      weight: 18,
    },
    {
      label: "founder lessons",
      value: entry.lessonsForFoundersText,
      weight: 18,
    },
    {
      label: "appendix",
      value: entry.appendixText,
      weight: 14,
    },
    {
      label: "timeline",
      value: entry.timelineText,
      weight: 10,
    },
  ];
}

function buildSnippetFromField(value: string, tokens: string[], maxLength: number) {
  const collapsed = collapseWhitespace(value);

  if (!collapsed) {
    return "";
  }

  if (!tokens.length) {
    return truncateCopy(collapsed, maxLength);
  }

  const lower = collapsed.toLowerCase();
  let matchIndex = -1;

  for (const token of tokens) {
    const index = lower.indexOf(token);

    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index;
    }
  }

  if (matchIndex === -1) {
    return "";
  }

  const start = Math.max(0, matchIndex - Math.floor(maxLength * 0.3));
  const end = Math.min(collapsed.length, start + maxLength);
  const windowed = collapsed.slice(start, end).trim();
  const prefix = start > 0 ? "... " : "";
  const suffix = end < collapsed.length ? " ..." : "";

  return `${prefix}${windowed}${suffix}`;
}

function flattenSection(section: StoredAnalysisRecord["analysis"]["whatWentWrong"]) {
  return [section.title, section.summary, ...section.bullets].join("\n");
}

function normalizeArchiveQuery(value?: string) {
  return value?.trim() ?? "";
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getSearchTokens(query: string) {
  return [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 2))];
}
