"use server";

import { analyzeRequestSchema } from "@/domain/inputs";
import {
  initialAnalyzerState,
  type AnalyzerActionState,
} from "@/app/analyze/state";
import { generatePostMortemDraft, getRuntimeSummary } from "@/lib/ai/service";
import { getRuntimeFlags } from "@/lib/env";

export async function generatePostMortemAction(
  _previousState: AnalyzerActionState,
  formData: FormData,
): Promise<AnalyzerActionState> {
  const parsedInput = analyzeRequestSchema.safeParse({
    subject: formData.get("subject"),
    contextNotes: formData.get("contextNotes"),
  });

  if (!parsedInput.success) {
    return {
      ...initialAnalyzerState,
      status: "error",
      message: "Enter a company name or URL before generating a draft.",
      input: {
        subject: typeof formData.get("subject") === "string" ? String(formData.get("subject")) : "",
        contextNotes:
          typeof formData.get("contextNotes") === "string"
            ? String(formData.get("contextNotes"))
            : "",
      },
    };
  }

  try {
    const result = await generatePostMortemDraft(parsedInput.data);
    const runtimeFlags = getRuntimeFlags();

    return {
      status: "success",
      analysis: result.analysis,
      message: result.message,
      input: parsedInput.data,
      runtime: {
        liveAvailable: getRuntimeSummary().liveAvailable,
        persistenceAvailable: runtimeFlags.persistenceConfigured,
        usedMode: result.usedMode,
      },
    };
  } catch (error) {
    return {
      ...initialAnalyzerState,
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Analysis could not be generated. Try a clearer company name or add notes.",
      input: parsedInput.data,
      runtime: {
        ...getRuntimeSummary(),
        persistenceAvailable: false,
        usedMode: "demo",
      },
    };
  }
}
