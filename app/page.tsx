import Link from "next/link";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceExplorer } from "@/components/PlaceExplorer";
import {
  CONTINENT_META,
  CONTINENT_ORDER,
  getAllPlaces,
  getPlacesGroupedByContinent,
} from "@/lib/places";

export default function HomePage() {
  const groups = getPlacesGroupedByContinent();
  const total = getAllPlaces().length;
  const visitedCounts = new Map(groups.map((g) => [g.continent, g.places.length]));
  const atlasContinents = CONTINENT_ORDER.filter(
    (c) => c !== "其他" && c !== "南极洲",
  );

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <p className="text-sm uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Where is Yuni Today
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            芋泥今天去哪里
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
            一份持续更新的旅行手册。按大洲踏行每一个目的地，附带行程、必去景点、美食与实用数据，让每一次出发都更从容。
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {groups.map((g) => (
              <a
                key={g.continent}
                href={`#${CONTINENT_META[g.continent].en}`}
                className="rounded-full border border-card bg-card px-3 py-1 hover:border-brand-400 transition-colors"
              >
                <span className="mr-1">{CONTINENT_META[g.continent].emoji}</span>
                {g.continent}
                <span className="ml-1 text-muted">· {g.places.length}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 space-y-16">
        <PlaceExplorer places={getAllPlaces()} />
        {groups.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-card p-12 text-center text-muted">
            <p className="text-base">
              还没有地点。把第一份攻略放到{" "}
              <code className="px-1.5 py-0.5 rounded bg-card border border-card text-sm">
                content/places/
              </code>{" "}
              下，并以{" "}
              <code className="px-1.5 py-0.5 rounded bg-card border border-card text-sm">
                .md
              </code>{" "}
              结尾即可。
            </p>
          </div>
        ) : (
          <>
            <section
              id="atlas"
              className="scroll-mt-20"
              aria-label="丈量世界的宽广"
            >
              <header className="mb-6 border-b border-card pb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  World Atlas
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  丈量世界的宽广
                </h2>
                <p className="mt-1 text-sm text-muted">
                  点击任意大洲，查看该大洲下的所有目的地。
                </p>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {atlasContinents.map((continent) => {
                  const meta = CONTINENT_META[continent];
                  const count = visitedCounts.get(continent) ?? 0;
                  const visited = count > 0;
                  return (
                    <Link
                      key={continent}
                      href={`/continents/${meta.slug}`}
                      className={`group block rounded-2xl border p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        visited
                          ? "border-card bg-card hover:border-brand-400"
                          : "border-dashed border-card bg-card/40 hover:border-brand-400"
                      }`}
                    >
                      <div className="text-3xl transition-transform group-hover:scale-110">
                        {meta.emoji}
                      </div>
                      <p className="mt-2 font-medium">{continent}</p>
                      <p className="text-xs text-muted">{meta.en}</p>
                      <p
                        className={`mt-3 text-xs ${
                          visited
                            ? "text-brand-600 dark:text-brand-400 font-medium"
                            : "text-muted"
                        }`}
                      >
                        {visited ? `${count} 个攻略` : "攻略待写"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            <p className="text-sm text-muted -mb-8">
              当前共收藏 <span className="font-semibold text-[rgb(var(--foreground))]">{total}</span> 个目的地，分布于{" "}
              <span className="font-semibold text-[rgb(var(--foreground))]">{groups.length}</span> 个大洲。
            </p>
            {groups.map((group) => {
              const meta = CONTINENT_META[group.continent];
              return (
                <section
                  key={group.continent}
                  id={meta.en}
                  className="scroll-mt-20"
                >
                  <header className="flex items-end justify-between gap-4 mb-6 border-b border-card pb-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {meta.en}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <span className="text-2xl">{meta.emoji}</span>
                        {group.continent}
                      </h2>
                    </div>
                    <Link
                      href={`/continents/${meta.slug}`}
                      className="text-sm text-muted shrink-0 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      按国家浏览 {group.places.length} 个地点 →
                    </Link>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.places.map((place) => (
                      <PlaceCard key={place.slug} place={place} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </section>
    </div>
  );
}
