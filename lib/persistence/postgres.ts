import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { postMortemAnalysisSchema, type StoredAnalysisRecord } from "@/domain/postmortem";
import { createShareId } from "@/lib/utils";
import type {
  AnalysisStore,
  ListAnalysesQuery,
  SaveAnalysisInput,
} from "@/lib/persistence/types";

let poolPromise: Promise<Pool> | null = null;
let poolConnectionString: string | null = null;
let schemaPromise: Promise<void> | null = null;
let availabilityStatus:
  | {
      connectionString: string;
      available: boolean;
      checkedAt: number;
    }
  | null = null;
const availabilityTtlMs = 30_000;

async function getPool(connectionString: string): Promise<Pool> {
  if (!poolPromise || poolConnectionString !== connectionString) {
    poolConnectionString = connectionString;
    schemaPromise = null;
    poolPromise = import("pg").then(({ Pool }) => new Pool({ connectionString }));
  }

  return poolPromise;
}

async function ensureSchema(connectionString: string) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const pool = await getPool(connectionString);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          share_id TEXT UNIQUE NOT NULL,
          subject TEXT NOT NULL,
          context_notes TEXT NOT NULL DEFAULT '',
          provider TEXT NOT NULL,
          model TEXT NOT NULL,
          analysis_json JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          cache_key TEXT
        );
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS analyses_created_at_idx
        ON analyses (created_at DESC);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS analyses_subject_idx
        ON analyses (subject);
      `);
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
}

type AnalysisRow = {
  id: string;
  share_id: string;
  subject: string;
  context_notes: string;
  provider: string;
  model: string;
  analysis_json: unknown;
  created_at: Date;
  cache_key: string | null;
};

export class PostgresAnalysisStore implements AnalysisStore {
  constructor(private readonly connectionString: string) {}

  async isAvailable() {
    if (!this.connectionString) {
      return false;
    }

    if (
      availabilityStatus &&
      availabilityStatus.connectionString === this.connectionString &&
      Date.now() - availabilityStatus.checkedAt < availabilityTtlMs
    ) {
      return availabilityStatus.available;
    }

    try {
      const pool = await getPool(this.connectionString);
      await pool.query("SELECT 1");
      availabilityStatus = {
        connectionString: this.connectionString,
        available: true,
        checkedAt: Date.now(),
      };
      return true;
    } catch (error) {
      availabilityStatus = {
        connectionString: this.connectionString,
        available: false,
        checkedAt: Date.now(),
      };
      console.warn("[persistence] availability check failed", error);
      return false;
    }
  }

  async saveAnalysis(input: SaveAnalysisInput) {
    try {
      await ensureSchema(this.connectionString);
      const pool = await getPool(this.connectionString);
      const shareId = createShareId();

      const result = await pool.query<{ created_at: Date }>(
        `
          INSERT INTO analyses (
            id,
            share_id,
            subject,
            context_notes,
            provider,
            model,
            analysis_json,
            cache_key
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
          RETURNING created_at
        `,
        [
          randomUUID(),
          shareId,
          input.subject,
          input.contextNotes,
          input.provider,
          input.model,
          JSON.stringify(input.analysis),
          input.cacheKey ?? null,
        ],
      );

      availabilityStatus = {
        connectionString: this.connectionString,
        available: true,
        checkedAt: Date.now(),
      };

      return {
        shareId,
        createdAt: result.rows[0]?.created_at.toISOString() ?? new Date().toISOString(),
      };
    } catch (error) {
      availabilityStatus = null;
      throw new Error(
        error instanceof Error
          ? `Persistence is configured but saving failed: ${error.message}`
          : "Persistence is configured but saving failed.",
      );
    }
  }

  async getAnalysisByShareId(shareId: string): Promise<StoredAnalysisRecord | null> {
    try {
      await ensureSchema(this.connectionString);
      const pool = await getPool(this.connectionString);
      const result = await pool.query<AnalysisRow>(
        `
          SELECT id, share_id, subject, context_notes, provider, model, analysis_json, created_at, cache_key
          FROM analyses
          WHERE share_id = $1
          LIMIT 1
        `,
        [shareId],
      );

      if (!result.rowCount) {
        return null;
      }

      const row = result.rows[0];
      availabilityStatus = {
        connectionString: this.connectionString,
        available: true,
        checkedAt: Date.now(),
      };

      return {
        id: row.id,
        shareId: row.share_id,
        subject: row.subject,
        contextNotes: row.context_notes,
        analysis: postMortemAnalysisSchema.parse(row.analysis_json),
        createdAt: row.created_at.toISOString(),
        provider: row.provider,
        model: row.model,
        cacheKey: row.cache_key,
      };
    } catch (error) {
      availabilityStatus = null;
      throw new Error(
        error instanceof Error
          ? `Persistence is configured but loading failed: ${error.message}`
          : "Persistence is configured but loading failed.",
      );
    }
  }

  async listRecentAnalyses(query: ListAnalysesQuery = {}): Promise<StoredAnalysisRecord[]> {
    try {
      await ensureSchema(this.connectionString);
      const pool = await getPool(this.connectionString);
      const result = await pool.query<AnalysisRow>(
        `
          SELECT id, share_id, subject, context_notes, provider, model, analysis_json, created_at, cache_key
          FROM analyses
          ORDER BY created_at DESC
          LIMIT $1
        `,
        [query.limit ?? 10],
      );

      availabilityStatus = {
        connectionString: this.connectionString,
        available: true,
        checkedAt: Date.now(),
      };

      return result.rows.map((row) => ({
        id: row.id,
        shareId: row.share_id,
        subject: row.subject,
        contextNotes: row.context_notes,
        analysis: postMortemAnalysisSchema.parse(row.analysis_json),
        createdAt: row.created_at.toISOString(),
        provider: row.provider,
        model: row.model,
        cacheKey: row.cache_key,
      }));
    } catch (error) {
      availabilityStatus = null;
      throw new Error(
        error instanceof Error
          ? `Persistence is configured but listing failed: ${error.message}`
          : "Persistence is configured but listing failed.",
      );
    }
  }
}
