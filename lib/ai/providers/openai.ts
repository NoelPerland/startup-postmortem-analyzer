import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  finalizeAnalysis,
  postMortemModelSchema,
  type PostMortemModel,
} from "@/domain/postmortem";
import { buildPromptMessages, editorialDisclaimer } from "@/domain/prompts";
import type { AnalysisProvider, ProviderInput, ProviderResult } from "@/lib/ai/types";

class StructuredOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StructuredOutputError";
  }
}

function isStructuredOutputError(error: unknown) {
  return error instanceof StructuredOutputError;
}

export class OpenAIAnalysisProvider implements AnalysisProvider {
  private readonly client: OpenAI;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async generateAnalysis(input: ProviderInput): Promise<ProviderResult> {
    const messages = buildPromptMessages(input);
    let repairCount = 0;
    let draft: PostMortemModel;

    try {
      draft = await this.parseStructured(messages.system, messages.user);
    } catch (error) {
      if (!isStructuredOutputError(error)) {
        throw error;
      }

      repairCount = 1;
      draft = await this.parseStructured(
        messages.system,
        `${messages.user}\n\n${messages.repair}`,
      );
    }

    return {
      analysis: finalizeAnalysis(
        input.target,
        input.nowIso,
        "ai",
        editorialDisclaimer,
        draft,
      ),
      provider: "openai",
      model: this.model,
      repairCount,
    };
  }

  private async parseStructured(system: string, user: string) {
    try {
      const completion = await this.client.chat.completions.parse({
        model: this.model,
        temperature: 0.1,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: zodResponseFormat(
          postMortemModelSchema,
          "startup_postmortem_analysis",
        ),
      });

      const parsed = completion.choices[0]?.message.parsed;

      if (!parsed) {
        throw new StructuredOutputError("The model did not return a structured analysis.");
      }

      return parsed;
    } catch (error) {
      if (error instanceof OpenAI.APIError || error instanceof TypeError) {
        throw error;
      }

      throw new StructuredOutputError(
        error instanceof Error ? error.message : "Structured output parsing failed.",
      );
    }
  }
}
