import { z } from "zod";

const optionalString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  },
  z.string().optional(),
);

export const envSchema = z.object({
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: optionalString.default("gpt-5-mini"),
  DATABASE_URL: optionalString,
  APP_URL: optionalString,
  VALKEY_URL: optionalString,
  MEILISEARCH_HOST: optionalString,
  MEILISEARCH_API_KEY: optionalString,
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  return envSchema.parse(process.env);
}

export function getRuntimeFlags() {
  const env = getEnv();

  return {
    liveAvailable: Boolean(env.OPENAI_API_KEY),
    persistenceConfigured: Boolean(env.DATABASE_URL),
    cacheConfigured: Boolean(env.VALKEY_URL),
    searchConfigured: Boolean(env.MEILISEARCH_HOST),
    appUrl: env.APP_URL,
  };
}

export function getRuntimeCapabilities() {
  const env = getEnv();
  const liveAvailable = Boolean(env.OPENAI_API_KEY);
  const persistenceConfigured = Boolean(env.DATABASE_URL);
  const cacheConfigured = Boolean(env.VALKEY_URL);
  const searchConfigured = Boolean(env.MEILISEARCH_HOST);
  const appUrlAvailable = Boolean(env.APP_URL);

  return {
    liveAvailable,
    persistenceConfigured,
    cacheConfigured,
    searchConfigured,
    appUrlAvailable,
    defaultMode: liveAvailable ? ("live" as const) : ("demo" as const),
    openAiModel: env.OPENAI_MODEL,
  };
}
