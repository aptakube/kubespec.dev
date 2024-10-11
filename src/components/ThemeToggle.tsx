import { IconMoonStars, IconSunLow } from "@tabler/icons-react";
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
        <IconMoonStars stroke={1.5} className="size-5" />
      ) : (
        <IconSunLow stroke={1.5} className="size-5" />
      )}
    </button>
  );
}
