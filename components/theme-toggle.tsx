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

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="2.45" fill="currentColor" />
      <path
        d="M7.5 1.4v1.8M7.5 11.8v1.8M1.4 7.5h1.8M11.8 7.5h1.8M3.2 3.2l1.3 1.3M10.5 10.5l1.3 1.3M11.8 3.2l-1.3 1.3M4.5 10.5l-1.3 1.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M9.9 2.1a5.55 5.55 0 1 0 3 10.2A5.9 5.9 0 0 1 9.9 2.1Z"
        fill="currentColor"
      />
    </svg>
  );
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
        <div className="theme-dock-controls">
          {themePreferences.map((option) => {
            const active = preference === option;
            const label = option === "light" ? "Light mode" : "Dark mode";

            return (
              <button
                key={option}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={active}
                data-active={active}
                className="theme-toggle-button"
                onClick={() => {
                  applyTheme(option);
                  setPreference(option);
                }}
              >
                {option === "light" ? <IconSun /> : <IconMoon />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
