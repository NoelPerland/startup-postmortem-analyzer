import { describe, expect, it } from "vitest";
import { getThemeInitScript, sanitizeThemePreference } from "@/lib/theme";

describe("theme helpers", () => {
  it("sanitizes unknown theme preferences to light", () => {
    expect(sanitizeThemePreference("light")).toBe("light");
    expect(sanitizeThemePreference("dark")).toBe("dark");
    expect(sanitizeThemePreference("system")).toBe("light");
    expect(sanitizeThemePreference("sepia")).toBe("light");
    expect(sanitizeThemePreference()).toBe("light");
  });

  it("includes the storage key and data attributes in the init script", () => {
    const script = getThemeInitScript();

    expect(script).toContain("spma-theme");
    expect(script).toContain("dataset.themePreference");
    expect(script).toContain("dataset.theme");
  });
});
