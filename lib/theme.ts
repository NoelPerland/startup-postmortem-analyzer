export const themeStorageKey = "spma-theme";
export const themePreferences = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];
export type AppliedTheme = "light" | "dark";

export function sanitizeThemePreference(value?: string | null): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

export function resolveAppliedTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): AppliedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function getThemeInitScript() {
  return `
    (() => {
      try {
        const root = document.documentElement;
        const stored = localStorage.getItem("${themeStorageKey}");
        const preference = ${sanitizeThemePreference.name}(stored);
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const theme = ${resolveAppliedTheme.name}(preference, media.matches);
        root.dataset.themePreference = preference;
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
      } catch (error) {
        document.documentElement.dataset.themePreference = "system";
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `
    .replace(sanitizeThemePreference.name, `function sanitizeThemePreference(value) {
      return value === "light" || value === "dark" || value === "system" ? value : "system";
    }`)
    .replace(resolveAppliedTheme.name, `function resolveAppliedTheme(preference, systemPrefersDark) {
      if (preference === "system") {
        return systemPrefersDark ? "dark" : "light";
      }

      return preference;
    }`);
}
