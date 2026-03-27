import { describe, expect, it } from "vitest";
import { resolvePublicOrigin, truncateCopy } from "@/lib/utils";

describe("resolvePublicOrigin", () => {
  it("prefers APP_URL when present", () => {
    expect(resolvePublicOrigin("https://app.example.com", "http://localhost:3000/api/share")).toBe(
      "https://app.example.com",
    );
  });

  it("falls back to the request origin when APP_URL is absent", () => {
    expect(resolvePublicOrigin(undefined, "http://localhost:3000/api/share")).toBe(
      "http://localhost:3000",
    );
  });
});

describe("truncateCopy", () => {
  it("adds an ellipsis only when needed", () => {
    expect(truncateCopy("Short note", 20)).toBe("Short note");
    expect(truncateCopy("A much longer sentence than expected", 16)).toBe(
      "A much longer...",
    );
  });
});
