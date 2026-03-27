import type { PostMortemAnalysis, StoredAnalysisRecord } from "@/domain/postmortem";

export type SaveAnalysisInput = {
  subject: string;
  contextNotes: string;
  analysis: PostMortemAnalysis;
  provider: string;
  model: string;
  cacheKey?: string;
};

export type ListAnalysesQuery = {
  limit?: number;
};

export interface AnalysisStore {
  isAvailable(): Promise<boolean>;
  saveAnalysis(input: SaveAnalysisInput): Promise<{ shareId: string; createdAt: string }>;
  getAnalysisByShareId(shareId: string): Promise<StoredAnalysisRecord | null>;
  listRecentAnalyses(query?: ListAnalysesQuery): Promise<StoredAnalysisRecord[]>;
}
