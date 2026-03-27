import { z } from "zod";
import type { CompanyTarget } from "@/domain/inputs";
import { companyTargetSchema } from "@/domain/inputs";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSentence(value: string) {
  return collapseWhitespace(value)
    .replace(/[!?]{2,}/g, "!")
    .replace(/[.]{2,}/g, ".")
    .replace(/[,;:]{2,}/g, ",");
}

function sanitizeItems(items: string[], _minItems: number, maxItems: number) {
  const normalized = items
    .map((item) => normalizeSentence(item))
    .filter(Boolean)
    .filter((item, index, collection) => collection.indexOf(item) === index);

  return normalized.slice(0, maxItems);
}

export const timelineEventSchema = z.object({
  dateLabel: z.string().min(1).max(60),
  event: z.string().min(1).max(360),
  kind: z.enum([
    "founding",
    "funding",
    "product",
    "leadership",
    "market",
    "shutdown",
    "other",
  ]),
});

export const analysisSectionSchema = z.object({
  title: z.string().min(1).max(80),
  summary: z.string().min(1).max(1200),
  bullets: z.array(z.string().min(1).max(240)).min(2).max(6),
});

const appendixSchema = z.array(z.string().min(1).max(240)).min(2).max(6);

export const postMortemModelSchema = z.object({
  overview: z.string().min(1).max(1600),
  timeline: z.array(timelineEventSchema).min(3).max(7),
  whatWentWrong: analysisSectionSchema,
  whatCouldHaveSavedIt: analysisSectionSchema,
  lessonsForFounders: analysisSectionSchema,
  observedFacts: appendixSchema,
  plausibleHypotheses: appendixSchema,
  openQuestions: appendixSchema,
});

export const postMortemAnalysisSchema = postMortemModelSchema.extend({
  company: companyTargetSchema,
  generatedAt: z.iso.datetime(),
  sourceMode: z.enum(["demo", "ai"]),
  disclaimer: z.string().min(1).max(320),
});

export const shareRequestSchema = z.object({
  subject: z.string().trim().min(2).max(160),
  contextNotes: z.string().trim().max(2000).optional().default(""),
  analysis: postMortemAnalysisSchema,
});

export const shareResponseSchema = z.union([
  z.object({
    available: z.literal(true),
    shareId: z.string().min(6),
    shareUrl: z.url(),
  }),
  z.object({
    available: z.literal(false),
    reason: z.literal("persistence_not_configured"),
  }),
]);

export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type AnalysisSection = z.infer<typeof analysisSectionSchema>;
export type PostMortemModel = z.infer<typeof postMortemModelSchema>;
export type PostMortemAnalysis = z.infer<typeof postMortemAnalysisSchema>;

export type StoredAnalysisRecord = {
  id: string;
  shareId: string;
  subject: string;
  contextNotes: string;
  analysis: PostMortemAnalysis;
  createdAt: string;
  provider: string;
  model: string;
  cacheKey?: string | null;
};

export function sanitizeModelAnalysis(input: PostMortemModel) {
  const timeline = input.timeline
    .map((entry) => ({
      ...entry,
      dateLabel: normalizeSentence(entry.dateLabel),
      event: normalizeSentence(entry.event),
    }))
    .filter((entry) => entry.dateLabel && entry.event)
    .filter(
      (entry, index, collection) =>
        collection.findIndex(
          (candidate) =>
            candidate.dateLabel === entry.dateLabel && candidate.event === entry.event,
        ) === index,
    )
    .slice(0, 7);

  return {
    overview: normalizeSentence(input.overview),
    timeline,
    whatWentWrong: sanitizeSection(input.whatWentWrong),
    whatCouldHaveSavedIt: sanitizeSection(input.whatCouldHaveSavedIt),
    lessonsForFounders: sanitizeSection(input.lessonsForFounders),
    observedFacts: sanitizeItems(input.observedFacts, 2, 6),
    plausibleHypotheses: sanitizeItems(input.plausibleHypotheses, 2, 6),
    openQuestions: sanitizeItems(input.openQuestions, 2, 6),
  } satisfies PostMortemModel;
}

function sanitizeSection(section: AnalysisSection): AnalysisSection {
  return {
    title: normalizeSentence(section.title),
    summary: normalizeSentence(section.summary),
    bullets: sanitizeItems(section.bullets, 2, 6),
  };
}

export function finalizeAnalysis(
  company: CompanyTarget,
  generatedAt: string,
  sourceMode: "demo" | "ai",
  disclaimer: string,
  model: PostMortemModel,
) {
  const sanitized = sanitizeModelAnalysis(model);

  return postMortemAnalysisSchema.parse({
    ...sanitized,
    company,
    generatedAt,
    sourceMode,
    disclaimer: normalizeSentence(disclaimer),
  });
}
