import { createHash } from "node:crypto";
import { buildLookupBase } from "@/domain/inputs";

type LookupIdentityInput = {
  subject: string;
  contextNotes: string;
  provider: string;
  model: string;
  promptVersion: string;
};

export function buildAnalysisIdentity(input: LookupIdentityInput) {
  const base = buildLookupBase(input.subject, input.contextNotes);
  const fingerprint = JSON.stringify({
    subject: base.normalizedSubject,
    contextNotes: base.normalizedContextNotes,
    provider: input.provider,
    model: input.model,
    promptVersion: input.promptVersion,
  });
  const digest = createHash("sha256").update(fingerprint).digest("hex");

  return {
    target: base.target,
    normalizedSubject: base.normalizedSubject,
    normalizedContextNotes: base.normalizedContextNotes,
    lookupKey: digest.slice(0, 24),
    cacheKey: `postmortem:v1:${digest}`,
  };
}
