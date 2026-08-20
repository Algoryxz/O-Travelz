import { useEffect } from "react";

export type ThemeMode = "dark";

export function useTheme() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  return {
    theme: "dark" as const,
    setTheme: () => {},
    toggleTheme: () => {},
    isDark: true,
  };
}
