"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface NavContinentItem {
  name: string;
  en: string;
  emoji: string;
  count: number;
  href: string;
}

export function NavDestinations({ items }: { items: NavContinentItem[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 hover:text-[rgb(var(--foreground))] transition-colors"
      >
        目的地
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-card bg-card shadow-lg shadow-black/5 dark:shadow-white/5 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-40"
        >
          <ul className="py-1.5">
            {items.map((item) => (
              <li key={item.en} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{item.emoji}</span>
                    <span>
                      <span className="font-medium text-[rgb(var(--foreground))]">
                        {item.name}
                      </span>
                      <span className="ml-1.5 text-xs text-muted">
                        {item.en}
                      </span>
                    </span>
                  </span>
                  {item.count > 0 ? (
                    <span className="text-xs text-muted shrink-0">
                      {item.count} 个
                    </span>
                  ) : (
                    <span className="text-xs text-muted shrink-0">待解锁</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
