import Link from "next/link";
import type { PlaceMeta } from "@/lib/places";

function CoverFallback({ title }: { title: string }) {
  const ch = title.trim().charAt(0) || "·";
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-700 text-white text-5xl font-bold">
      {ch}
    </div>
  );
}

export function PlaceCard({ place }: { place: PlaceMeta }) {
  return (
    <Link
      href={`/places/${place.slug}`}
      className="group block overflow-hidden rounded-2xl border border-card bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {place.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.cover}
            alt={place.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <CoverFallback title={place.title} />
        )}
        {place.country && (
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {place.country}
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">
            {place.title}
          </h3>
          {place.duration && (
            <span className="text-xs text-muted shrink-0">{place.duration}</span>
          )}
        </div>

        {place.summary && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2">
            {place.summary}
          </p>
        )}

        {place.budget && (
          <p className="text-xs text-muted flex items-center gap-1">
            <span aria-hidden>¥</span>
            <span className="line-clamp-1">{place.budget}</span>
          </p>
        )}

        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {place.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-card px-2 py-0.5 text-xs text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
