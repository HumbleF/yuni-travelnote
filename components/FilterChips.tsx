"use client";

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

export function FilterChips({
  allTags,
  allSeasons,
  active,
  onChange,
}: FilterChipsProps) {
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allSeasons.map((season) => (
          <button
            key={season}
            onClick={() => toggleSeason(season)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active.seasons.includes(season)
                ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "border-card bg-card text-muted hover:border-brand-400"
            }`}
          >
            {season}
          </button>
        ))}
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active.tags.includes(tag)
                ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "border-card bg-card text-muted hover:border-brand-400"
            }`}
          >
            #{tag}
          </button>
        ))}
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
