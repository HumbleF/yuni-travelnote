import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceCard } from "@/components/PlaceCard";
import {
  CONTINENT_BY_SLUG,
  CONTINENT_META,
  CONTINENT_ORDER,
  getCountriesByContinent,
  getPlacesByContinent,
} from "@/lib/places";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CONTINENT_ORDER.filter(
    (c) => c !== "其他" && c !== "南极洲",
  ).map((continent) => ({ slug: CONTINENT_META[continent].slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) return { title: "未知大洲" };
  return {
    title: continent,
    description: `${continent}（${CONTINENT_META[continent].en}）下芋泥到访过的国家与目的地。`,
  };
}

export default async function ContinentPage({ params }: PageProps) {
  const { slug } = await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) {
    notFound();
  }

  const meta = CONTINENT_META[continent];
  const countries = getCountriesByContinent(continent);
  const totalPlaces = getPlacesByContinent(continent).length;

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <nav
            aria-label="面包屑导航"
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted"
          >
            <Link
              href="/"
              className="hover:text-[rgb(var(--foreground))] transition-colors"
            >
              首页
            </Link>
            <span aria-hidden>›</span>
            <span className="text-[rgb(var(--foreground))] font-medium">
              {continent}
            </span>
          </nav>

          <div className="mt-4 flex items-center gap-4">
            <div className="text-5xl sm:text-6xl">{meta.emoji}</div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                {meta.en}
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                {continent}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {totalPlaces > 0
                  ? `${countries.length} 个国家 · ${totalPlaces} 个目的地`
                  : "目的地待解锁"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 space-y-12">
        {countries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-card p-12 text-center text-muted space-y-4">
            <div className="text-5xl">{meta.emoji}</div>
            <p className="text-base">
              {continent} 还没有攻略，敬请期待芋泥的下一次出发。
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              返回首页看看其他大洲 →
            </Link>
          </div>
        ) : (
          <>
            <section aria-label="按国家浏览">
              <header className="mb-6 border-b border-card pb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Countries
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  按国家浏览
                </h2>
                <p className="mt-1 text-sm text-muted">
                  点击任意国家，查看该国家下的所有目的地（中国会进一步按省份分层）。
                </p>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {countries.map((c) => (
                  <Link
                    key={c.country}
                    href={`/continents/${meta.slug}/${c.slug}`}
                    className="group block rounded-2xl border border-card bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-brand-400"
                  >
                    <div className="text-3xl transition-transform group-hover:scale-110">
                      {c.flag}
                    </div>
                    <p className="mt-2 font-medium">{c.country}</p>
                    <p className="text-xs text-muted">{c.en}</p>
                    <p className="mt-3 text-xs font-medium text-brand-600 dark:text-brand-400">
                      {c.places.length} 个目的地
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-label="全部目的地">
              <header className="mb-6 border-b border-card pb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  All Destinations
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  {continent} 全部 {totalPlaces} 个目的地
                </h2>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {countries.flatMap((c) =>
                  c.places.map((place) => (
                    <PlaceCard key={place.slug} place={place} />
                  )),
                )}
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
