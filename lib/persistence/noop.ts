import type { AnalysisStore, SaveAnalysisInput } from "@/lib/persistence/types";

export class NoopAnalysisStore implements AnalysisStore {
  async isAvailable() {
    return false;
  }

  async saveAnalysis(input: SaveAnalysisInput): Promise<{ shareId: string; createdAt: string }> {
    void input;
    throw new Error("Persistence is not configured.");
  }

  async getAnalysisByShareId(shareId: string) {
    void shareId;
    return null;
  }

  async listRecentAnalyses() {
    return [];
  }
}
