import { useState, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return document.documentElement.classList.contains("light") ? "light" : "dark";
  });

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next);
    setTheme(next);
  }, [theme]);

  const setThemeTo = useCallback((t: "dark" | "light") => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(t);
    setTheme(t);
  }, []);

  return { theme, toggle, setTheme: setThemeTo };
}
