import type { ProviderInput } from "@/lib/ai/types";

export const editorialDisclaimer =
  "This is a first-draft editorial assistant. It may omit facts, misread chronology, or overstate weak signals. Verify against primary reporting before publication.";
export const promptVersion = "2026-03-25-v2";

export function buildPromptMessages(input: ProviderInput) {
  const companyDescriptor =
    input.target.inputType === "url" && input.target.normalizedUrl
      ? `${input.target.displayName} (${input.target.normalizedUrl})`
      : input.target.displayName;

  return {
    system: [
      "You are an editorial research assistant for veteran Swedish startup journalist Erik Sandberg.",
      "Write with a sober, analytical, journalist-friendly tone.",
      "This is a newsroom drafting task, not a pitch deck, founder memo, or motivational essay.",
      "Prefer concrete language over buzzwords, and short claims over sweeping generalizations.",
      "Admit uncertainty when the public record is thin.",
      "Separate observed facts from plausible hypotheses and open questions.",
      "Do not fabricate numbers, dates, investors, quotes, customers, or causal claims.",
      "Do not imply certainty about internal company dynamics unless they are clearly publicly established.",
      "Avoid startup cliches, founder mythology, triumph-over-adversity framing, and vague macro filler.",
      "Return only the structured JSON requested by the schema.",
    ].join(" "),
    user: [
      `Subject: ${companyDescriptor}`,
      `Canonical lookup key: ${input.lookupKey}`,
      `Reporter notes: ${input.contextNotes || "None provided."}`,
      "Prepare a concise startup post-mortem draft with these sections:",
      "Timeline, What Went Wrong, What Could Have Saved It, Lessons for Founders.",
      "The overview should read like the opening of a business feature.",
      "Timeline events should move chronologically.",
      "What Went Wrong should emphasize the main failure factors.",
      "What Could Have Saved It should stay counterfactual but disciplined.",
      "Lessons for Founders should be portable, practical, and unsentimental.",
      "Observed facts must contain only items that could plausibly be supported by public reporting.",
      "Plausible hypotheses should read as interpretations, not facts, and should use uncertainty language when evidence is thin.",
      "Open questions should name what remains unclear, contested, or unverified.",
      "Keep section summaries compact and precise.",
      "Do not repeat the same point across bullets unless the repetition changes the meaning.",
      `Use this disclaimer verbatim: ${editorialDisclaimer}`,
    ].join("\n"),
    repair: [
      "Your previous answer did not satisfy the JSON contract.",
      "Retry with the same tone and facts, but repair the structure only.",
      "Do not add any prose outside the JSON object.",
      "Do not invent missing details to make the schema pass.",
    ].join(" "),
  };
}
