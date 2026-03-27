import { getDemoAnalysis } from "@/lib/demo-data";
import type { AnalysisProvider, ProviderInput, ProviderResult } from "@/lib/ai/types";

export class DemoAnalysisProvider implements AnalysisProvider {
  async generateAnalysis(input: ProviderInput): Promise<ProviderResult> {
    return {
      analysis: getDemoAnalysis(input.target, input.contextNotes, input.nowIso),
      provider: "demo",
      model: "demo-samples",
    };
  }
}
