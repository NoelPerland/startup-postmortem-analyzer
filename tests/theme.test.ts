import { describe, expect, it } from "vitest";
import {
  getThemeInitScript,
  resolveAppliedTheme,
  sanitizeThemePreference,
} from "@/lib/theme";

describe("theme helpers", () => {
  it("sanitizes unknown theme preferences to system", () => {
    expect(sanitizeThemePreference("light")).toBe("light");
    expect(sanitizeThemePreference("dark")).toBe("dark");
    expect(sanitizeThemePreference("system")).toBe("system");
    expect(sanitizeThemePreference("sepia")).toBe("system");
    expect(sanitizeThemePreference()).toBe("system");
  });

  it("resolves the applied theme from system preference", () => {
    expect(resolveAppliedTheme("light", true)).toBe("light");
    expect(resolveAppliedTheme("dark", false)).toBe("dark");
    expect(resolveAppliedTheme("system", true)).toBe("dark");
    expect(resolveAppliedTheme("system", false)).toBe("light");
  });

  it("includes the storage key and data attributes in the init script", () => {
    const script = getThemeInitScript();

    expect(script).toContain("spma-theme");
    expect(script).toContain("dataset.themePreference");
    expect(script).toContain("dataset.theme");
  });
});
