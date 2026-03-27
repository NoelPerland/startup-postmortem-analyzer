import { z } from "zod";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

const trimmedString = (maxLength: number, minLength = 0) =>
  z.preprocess(
    (value) => (typeof value === "string" ? collapseWhitespace(value) : ""),
    z.string().min(minLength).max(maxLength),
  );

export const analyzeRequestSchema = z.object({
  subject: trimmedString(160, 2),
  contextNotes: trimmedString(2000).optional().default(""),
});

export const companyTargetSchema = z.object({
  displayName: z.string().min(1).max(160),
  inputType: z.enum(["company", "url"]),
  normalizedUrl: z.string().url().optional(),
});

export type AnalysisInput = z.infer<typeof analyzeRequestSchema>;
export type CompanyTarget = z.infer<typeof companyTargetSchema>;

export function normalizeSubject(subject: string) {
  return collapseWhitespace(subject);
}

export function normalizeContextNotes(contextNotes: string) {
  return collapseWhitespace(contextNotes);
}

function isLikelyUrl(value: string) {
  return value.includes(".") && !value.includes(" ");
}

function normalizeHostname(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function humanizeHostname(hostname: string) {
  const [root] = normalizeHostname(hostname).split(".");

  return root
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeCompanyTarget(subject: string): CompanyTarget {
  const trimmed = normalizeSubject(subject);

  if (
    isLikelyUrl(trimmed) ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    const candidate = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);

    const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");

    return {
      displayName: humanizeHostname(url.hostname),
      inputType: "url",
      normalizedUrl: `https://${normalizeHostname(url.hostname)}${pathname}`,
    };
  }

  return {
    displayName: trimmed,
    inputType: "company",
  };
}

export function buildLookupBase(subject: string, contextNotes: string) {
  const target = normalizeCompanyTarget(subject);
  const normalizedNotes = normalizeContextNotes(contextNotes);

  return {
    target,
    normalizedSubject:
      target.inputType === "url" && target.normalizedUrl
        ? target.normalizedUrl
        : normalizeSubject(subject).toLowerCase(),
    normalizedContextNotes: normalizedNotes,
  };
}
