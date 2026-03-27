"use client";

import { useState } from "react";
import {
  sanitizeThemePreference,
  themePreferences,
  themeStorageKey,
  type ThemePreference,
} from "@/lib/theme";

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;

  root.dataset.themePreference = preference;
  root.dataset.theme = preference;
  root.style.colorScheme = preference;
  localStorage.setItem(themeStorageKey, preference);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    return sanitizeThemePreference(document.documentElement.dataset.themePreference);
  });

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
