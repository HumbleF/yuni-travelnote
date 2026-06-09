"use client";

import { useState, useMemo } from "react";
import { PlaceCard } from "./PlaceCard";
import { SearchBar } from "./SearchBar";
import { FilterChips, type FilterState } from "./FilterChips";
import type { PlaceMeta } from "@/lib/places";

interface PlaceExplorerProps {
  places: PlaceMeta[];
}

const SEASON_KEYWORDS = ["春", "夏", "秋", "冬"];

export function PlaceExplorer({ places }: PlaceExplorerProps) {
  const [filter, setFilter] = useState<FilterState>({ tags: [], seasons: [] });

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of places) {
      if (p.tags) p.tags.forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, [places]);

  const allSeasons = useMemo(() => {
    const set = new Set<string>();
    for (const p of places) {
      if (p.bestSeason) {
        for (const kw of SEASON_KEYWORDS) {
          if (p.bestSeason.includes(kw)) set.add(kw);
        }
      }
    }
    return Array.from(set);
  }, [places]);

  const filtered = useMemo(() => {
    let result = places;
    if (filter.tags.length > 0) {
      result = result.filter(
        (p) => p.tags && filter.tags.some((t) => p.tags!.includes(t)),
      );
    }
    if (filter.seasons.length > 0) {
      result = result.filter(
        (p) =>
          p.bestSeason &&
          filter.seasons.some((s) => p.bestSeason!.includes(s)),
      );
    }
    return result;
  }, [places, filter]);

  const hasFilter = filter.tags.length > 0 || filter.seasons.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <SearchBar places={places} />
      </div>
      {(allTags.length > 0 || allSeasons.length > 0) && (
        <FilterChips
          allTags={allTags}
          allSeasons={allSeasons}
          active={filter}
          onChange={setFilter}
        />
      )}
      {hasFilter && (
        <div>
          <p className="text-sm text-muted mb-4">
            筛选结果：{filtered.length} 个目的地
          </p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((place) => (
                <PlaceCard key={place.slug} place={place} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">没有符合条件的目的地。</p>
          )}
        </div>
      )}
    </div>
  );
}
