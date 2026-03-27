export function resolveShareAvailability(persistenceConfigured: boolean) {
  if (persistenceConfigured) {
    return { available: true as const };
  }

  return {
    available: false as const,
    reason: "persistence_not_configured" as const,
  };
}

export function buildShareUrl(base: string, shareId: string) {
  const baseUrl = new URL(base);
  return new URL(`/a/${shareId}`, baseUrl).toString();
}
