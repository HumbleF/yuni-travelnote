"use client";

import { useRef, useState, useLayoutEffect, useCallback } from "react";

export interface FilterState {
  tags: string[];
  seasons: string[];
}

interface FilterChipsProps {
  allTags: string[];
  allSeasons: string[];
  active: FilterState;
  onChange: (state: FilterState) => void;
}

const TOGGLE_WIDTH = 50; // reserved space for "更多" button
const GAP = 8; // gap-2 = 0.5rem = 8px

export function FilterChips({
  allTags,
  allSeasons,
  active,
  onChange,
}: FilterChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const allItems = [
    ...allSeasons.map((s) => ({ key: s, type: "season" as const })),
    ...allTags.map((t) => ({ key: t, type: "tag" as const })),
  ];

  const calcVisible = useCallback(() => {
    const container = containerRef.current;
    const measurer = measureRef.current;
    if (!container || !measurer) return;

    const containerWidth = container.offsetWidth;
    const chips = measurer.children;
    let usedWidth = 0;
    let count = 0;

    for (let i = 0; i < chips.length; i++) {
      const chipWidth = (chips[i] as HTMLElement).offsetWidth;
      const nextWidth = usedWidth + (i > 0 ? GAP : 0) + chipWidth;
      const needsToggle = i < chips.length - 1;
      if (nextWidth + (needsToggle ? GAP + TOGGLE_WIDTH : 0) > containerWidth) {
        break;
      }
      usedWidth = nextWidth;
      count++;
    }

    setVisibleCount(count < allItems.length ? count : null);
  }, [allItems.length]);

  useLayoutEffect(() => {
    calcVisible();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(calcVisible);
    ro.observe(container);
    return () => ro.disconnect();
  }, [calcVisible]);

  function toggleTag(tag: string) {
    const next = active.tags.includes(tag)
      ? active.tags.filter((t) => t !== tag)
      : [...active.tags, tag];
    onChange({ ...active, tags: next });
  }

  function toggleSeason(season: string) {
    const next = active.seasons.includes(season)
      ? active.seasons.filter((s) => s !== season)
      : [...active.seasons, season];
    onChange({ ...active, seasons: next });
  }

  const hasActive = active.tags.length > 0 || active.seasons.length > 0;

  function renderChip(item: { key: string; type: "season" | "tag" }) {
    const isActive =
      item.type === "season"
        ? active.seasons.includes(item.key)
        : active.tags.includes(item.key);
    const handler =
      item.type === "season"
        ? () => toggleSeason(item.key)
        : () => toggleTag(item.key);
    return (
      <button
        key={item.key}
        onClick={handler}
        className={`rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap ${
          isActive
            ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            : "border-card bg-card text-muted hover:border-brand-400"
        }`}
      >
        {item.type === "tag" ? `#${item.key}` : item.key}
      </button>
    );
  }

  const showToggle = visibleCount !== null;
  const displayItems =
    expanded || !showToggle ? allItems : allItems.slice(0, visibleCount!);

  return (
    <div className="space-y-3">
      {/* Hidden measurer */}
      <div
        ref={measureRef}
        aria-hidden
        className="flex gap-2 absolute invisible pointer-events-none"
        style={{ top: 0, left: 0, right: 0 }}
      >
        {allItems.map((item) => (
          <span
            key={item.key}
            className="rounded-full border px-3 py-1 text-xs whitespace-nowrap"
          >
            {item.type === "tag" ? `#${item.key}` : item.key}
          </span>
        ))}
      </div>

      {/* Visible chips */}
      <div ref={containerRef} className="flex flex-wrap gap-2 relative">
        {displayItems.map(renderChip)}
        {showToggle && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 whitespace-nowrap py-1 cursor-pointer"
          >
            更多 ›
          </button>
        )}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 whitespace-nowrap py-1 cursor-pointer"
          >
            收起
          </button>
        )}
      </div>

      {hasActive && (
        <button
          onClick={() => onChange({ tags: [], seasons: [] })}
          className="text-xs text-muted hover:text-[rgb(var(--foreground))] transition-colors"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
