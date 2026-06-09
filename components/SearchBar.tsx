"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { PlaceMeta } from "@/lib/places";

export function SearchBar({ places }: { places: PlaceMeta[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q.length > 0
    ? places.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.country && p.country.toLowerCase().includes(q)) ||
          (p.region && p.region.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
          (p.summary && p.summary.toLowerCase().includes(q)),
      )
    : [];

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="搜索目的地、标签..."
        className="w-full rounded-full border border-card bg-card px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-brand-400 transition-colors"
      />
      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-40 mt-2 max-h-72 overflow-auto rounded-xl border border-card bg-[rgb(var(--background))] shadow-lg">
          {results.slice(0, 8).map((p) => (
            <li key={p.slug}>
              <Link
                href={`/places/${p.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-card transition-colors"
              >
                <span className="text-lg">{p.cover ? "📍" : "📌"}</span>
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted">
                    {[p.country, p.region].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
