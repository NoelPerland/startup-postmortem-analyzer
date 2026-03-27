"use client";

import { useEffect, useState } from "react";
import {
  resolveAppliedTheme,
  sanitizeThemePreference,
  themePreferences,
  themeStorageKey,
  type ThemePreference,
} from "@/lib/theme";

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const applied = resolveAppliedTheme(preference, systemPrefersDark);

  root.dataset.themePreference = preference;
  root.dataset.theme = applied;
  root.style.colorScheme = applied;
  localStorage.setItem(themeStorageKey, preference);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof document === "undefined") {
      return "system";
    }

    return sanitizeThemePreference(document.documentElement.dataset.themePreference);
  });

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentPreference = sanitizeThemePreference(root.dataset.themePreference);

      if (currentPreference === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      className="theme-dock print-hidden"
      role="group"
      aria-label="Color theme"
      suppressHydrationWarning
    >
      <div className="theme-dock-shell">
        <span className="theme-dock-label">Theme</span>
        <div className="theme-dock-controls">
          {themePreferences.map((option) => {
            const active = preference === option;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                data-active={active}
                className="theme-toggle-button"
                onClick={() => {
                  applyTheme(option);
                  setPreference(option);
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
