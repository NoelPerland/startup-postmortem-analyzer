import type { PostMortemAnalysis } from "@/domain/postmortem";

export type AnalyzerActionState = {
  status: "idle" | "success" | "error";
  analysis: PostMortemAnalysis | null;
  message: string | null;
  input: {
    subject: string;
    contextNotes: string;
  };
  runtime: {
    liveAvailable: boolean;
    persistenceAvailable: boolean;
    usedMode: "demo" | "live";
  };
};

export const initialAnalyzerState: AnalyzerActionState = {
  status: "idle",
  analysis: null,
  message: null,
  input: {
    subject: "",
    contextNotes: "",
  },
  runtime: {
    liveAvailable: false,
    persistenceAvailable: false,
    usedMode: "demo",
  },
};
