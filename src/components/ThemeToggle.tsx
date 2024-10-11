import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

function getInitialTheme(): string {
  const stored = typeof window !== "undefined" && localStorage.getItem("theme");
  if (stored) {
    return stored;
  }
  const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
  return userMedia.matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
    localStorage.setItem("theme", theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      className="text-sm flex items-center gap-1 rounded-lg p-1.5 hover:bg-accent"
      onClick={toggle}
    >
      {theme === "light" ? (
        <IconSun className="size-4" />
      ) : (
        <IconMoon className="size-4" />
      )}
    </button>
  );
}
