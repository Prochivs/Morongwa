"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const storageKey = "queuemate-theme";

function setDocumentTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("queuemate-theme", sync);
    return () => window.removeEventListener("queuemate-theme", sync);
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    setDocumentTheme(next);
    localStorage.setItem(storageKey, next ? "dark" : "light");
    setDark(next);
    window.dispatchEvent(new Event("queuemate-theme"));
  }

  return (
    <button
      aria-label={dark ? "Use light mode" : "Use dark mode"}
      className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-navy/10 text-navy hover:border-brand hover:bg-blue-50 hover:text-brand dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white", className)}
      onClick={toggleTheme}
      type="button"
    >
      {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
    </button>
  );
}
