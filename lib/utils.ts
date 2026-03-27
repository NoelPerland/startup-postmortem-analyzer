import { randomBytes } from "node:crypto";

export function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function createShareId() {
  return randomBytes(6).toString("base64url").toLowerCase();
}

export function resolvePublicOrigin(appUrl?: string, requestUrl?: string) {
  if (appUrl) {
    return appUrl;
  }

  if (requestUrl) {
    return requestUrl;
  }

  return "http://localhost:3000";
}

export function truncateCopy(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
