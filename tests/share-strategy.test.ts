import { describe, expect, it } from "vitest";
import { buildShareUrl, resolveShareAvailability } from "@/lib/share/strategy";

describe("share strategy", () => {
  it("reports persistence when available", () => {
    expect(resolveShareAvailability(true)).toEqual({ available: true });
  });

  it("reports stateless mode when persistence is unavailable", () => {
    expect(resolveShareAvailability(false)).toEqual({
      available: false,
      reason: "persistence_not_configured",
    });
  });

  it("builds a share URL from the current deployment origin", () => {
    expect(buildShareUrl("https://demo.example.com/api/share", "abc123")).toBe(
      "https://demo.example.com/a/abc123",
    );
  });
});
