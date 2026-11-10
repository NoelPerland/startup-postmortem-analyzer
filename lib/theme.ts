export const themeStorageKey = "spma-theme";
export const themePreferences = ["light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export function sanitizeThemePreference(value?: string | null): ThemePreference {
  if (value === "light" || value === "dark") {
    return value;
  }

  return "light";
}

export function getThemeInitScript() {
  return `
    (() => {
      try {
        const root = document.documentElement;
        const stored = localStorage.getItem("${themeStorageKey}");
        const preference = stored === "dark" ? "dark" : "light";
        root.dataset.themePreference = preference;
        root.dataset.theme = preference;
        root.style.colorScheme = preference;
      } catch (error) {
        document.documentElement.dataset.themePreference = "light";
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;
}
