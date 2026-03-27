import type { PostMortemAnalysis } from "@/domain/postmortem";
import type { CompanyTarget } from "@/domain/inputs";

export type ProviderInput = {
  target: CompanyTarget;
  contextNotes: string;
  nowIso: string;
  lookupKey: string;
};

export type ProviderResult = {
  analysis: PostMortemAnalysis;
  provider: string;
  model: string;
  repairCount?: number;
};

export interface AnalysisProvider {
  generateAnalysis(input: ProviderInput): Promise<ProviderResult>;
}
