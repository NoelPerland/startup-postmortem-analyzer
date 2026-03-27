import type { PostMortemAnalysis, StoredAnalysisRecord } from "@/domain/postmortem";
import { postMortemAnalysisSchema } from "@/domain/postmortem";
import { getEnv } from "@/lib/env";

export interface AnalysisCache {
  isAvailable(): Promise<boolean>;
  get(cacheKey: string): Promise<PostMortemAnalysis | null>;
  set(
    cacheKey: string,
    analysis: PostMortemAnalysis,
    ttlSeconds: number,
  ): Promise<void>;
}

export interface AnalysisIndexer {
  isAvailable(): Promise<boolean>;
  index(record: StoredAnalysisRecord): Promise<void>;
  search(query: string, limit: number): Promise<SearchDocument[]>;
}

export class NoopAnalysisCache implements AnalysisCache {
  async isAvailable() {
    return false;
  }

  async get(cacheKey: string) {
    void cacheKey;
    return null;
  }

  async set(cacheKey: string, analysis: PostMortemAnalysis, ttlSeconds: number) {
    void cacheKey;
    void analysis;
    void ttlSeconds;
  }
}

export class NoopAnalysisIndexer implements AnalysisIndexer {
  async isAvailable() {
    return false;
  }

  async index(record: StoredAnalysisRecord) {
    void record;
  }

  async search(query: string, limit: number) {
    void query;
    void limit;
    return [];
  }
}

export class ValkeyAnalysisCache implements AnalysisCache {
  private clientPromise: Promise<{
    get(key: string): Promise<string | null>;
    set(
      key: string,
      value: string,
      options: {
        EX: number;
      },
    ): Promise<unknown>;
  }> | null = null;

  constructor(private readonly url: string) {}

  async isAvailable() {
    try {
      await this.getClient();
      return true;
    } catch {
      return false;
    }
  }

  async get(cacheKey: string) {
    try {
      const client = await this.getClient();
      const payload = await client.get(cacheKey);

      if (!payload) {
        return null;
      }

      return postMortemAnalysisSchema.parse(JSON.parse(payload));
    } catch (error) {
      console.warn("[cache] read failed", error);
      return null;
    }
  }

  async set(cacheKey: string, analysis: PostMortemAnalysis, ttlSeconds: number) {
    try {
      const client = await this.getClient();
      await client.set(cacheKey, JSON.stringify(analysis), { EX: ttlSeconds });
    } catch (error) {
      console.warn("[cache] write failed", error);
    }
  }

  private async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = import("redis")
        .then(async ({ createClient }) => {
          const client = createClient({ url: this.url });
          client.on("error", () => undefined);

          if (!client.isOpen) {
            await client.connect();
          }

          return client;
        })
        .catch((error) => {
          this.clientPromise = null;
          throw error;
        });
    }

    return this.clientPromise;
  }
}

export type SearchDocument = {
  id: string;
  shareId: string;
  subject: string;
  company: string;
  overview: string;
  generatedAt: string;
  createdAt: string;
  contextNotes: string;
  provider: string;
  model: string;
  cacheKey?: string | null;
  sourceMode: "demo" | "ai";
  timelineText: string;
  whatWentWrongText: string;
  whatCouldHaveSavedItText: string;
  lessonsForFoundersText: string;
  appendixText: string;
};

export class MeilisearchAnalysisIndexer implements AnalysisIndexer {
  private clientPromise: Promise<unknown> | null = null;

  constructor(
    private readonly host: string,
    private readonly apiKey?: string,
  ) {}

  async isAvailable() {
    return Boolean(this.host);
  }

  async index(record: StoredAnalysisRecord) {
    try {
      const client = (await this.getClient()) as {
        index(uid: string): {
          addDocuments(
            documents: SearchDocument[],
            options?: { primaryKey?: string },
          ): Promise<unknown>;
        };
      };
      const index = client.index("postmortems");

      await index.addDocuments([toSearchDocument(record)], { primaryKey: "shareId" });
    } catch (error) {
      console.warn("[search] indexing failed", error);
    }
  }

  async search(query: string, limit: number) {
    try {
      const client = (await this.getClient()) as {
        index(uid: string): {
          search(query: string, options?: { limit?: number }): Promise<{ hits: SearchDocument[] }>;
        };
      };
      const index = client.index("postmortems");
      const result = (await index.search(query, { limit })) as { hits: SearchDocument[] };

      return result.hits;
    } catch (error) {
      console.warn(`[search] query failed (length=${query.length}, limit=${limit})`, error);
      return [];
    }
  }

  private async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = import("meilisearch")
        .then(({ MeiliSearch }) => new MeiliSearch({ host: this.host, apiKey: this.apiKey }))
        .catch((error) => {
          this.clientPromise = null;
          throw error;
        });
    }

    return this.clientPromise!;
  }
}

function toSearchDocument(record: StoredAnalysisRecord): SearchDocument {
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

function flattenSection(section: PostMortemAnalysis["whatWentWrong"]) {
  return [section.title, section.summary, ...section.bullets].join("\n");
}

export function createAnalysisCache() {
  const env = getEnv();

  if (!env.VALKEY_URL) {
    return new NoopAnalysisCache();
  }

  return new ValkeyAnalysisCache(env.VALKEY_URL);
}

export function createAnalysisIndexer() {
  const env = getEnv();

  if (!env.MEILISEARCH_HOST) {
    return new NoopAnalysisIndexer();
  }

  return new MeilisearchAnalysisIndexer(env.MEILISEARCH_HOST, env.MEILISEARCH_API_KEY);
}
