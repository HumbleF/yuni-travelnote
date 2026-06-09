"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycle() {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  }

  const icon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻";
  const label =
    theme === "dark"
      ? "暗色模式"
      : theme === "light"
        ? "亮色模式"
        : "跟随系统";

  return (
    <button
      onClick={cycle}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-card transition-colors text-sm"
    >
      {icon}
    </button>
  );
}
