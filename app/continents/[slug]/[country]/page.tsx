import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceCard } from "@/components/PlaceCard";
import {
  CONTINENT_BY_SLUG,
  CONTINENT_META,
  CONTINENT_ORDER,
  findCountryByContinentAndSlug,
  getCountriesByContinent,
  getPlacesByCountry,
  getRegionsByCountry,
} from "@/lib/places";

interface PageProps {
  params: Promise<{ slug: string; country: string }>;
}

export function generateStaticParams() {
  const params: { slug: string; country: string }[] = [];
  for (const continent of CONTINENT_ORDER) {
    if (continent === "其他" || continent === "南极洲") continue;
    const meta = CONTINENT_META[continent];
    const countries = getCountriesByContinent(continent);
    for (const c of countries) {
      params.push({ slug: meta.slug, country: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, country: countrySlugParam } = await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) return { title: "未知国家" };
  const country = findCountryByContinentAndSlug(continent, countrySlugParam);
  if (!country) return { title: "未知国家" };
  return {
    title: `${country} · ${continent}`,
    description: `${continent} ${country} 下芋泥到访过的目的地。`,
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { slug, country: countrySlugParam } = await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) notFound();
  const country = findCountryByContinentAndSlug(continent, countrySlugParam);
  if (!country) notFound();

  const continentMeta = CONTINENT_META[continent];
  const countries = getCountriesByContinent(continent);
  const currentCountry = countries.find((c) => c.country === country)!;
  const regions = getRegionsByCountry(country);
  const allPlaces = getPlacesByCountry(country);

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
            <Link
              href={`/continents/${continentMeta.slug}`}
              className="hover:text-[rgb(var(--foreground))] transition-colors"
            >
              {continent}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-[rgb(var(--foreground))] font-medium">
              {country}
            </span>
          </nav>

          <div className="mt-4 flex items-center gap-4">
            <div className="text-5xl sm:text-6xl">{currentCountry.flag}</div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                {currentCountry.en}
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                {country}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {regions.length > 0
                  ? `${regions.length} 个地区 · ${allPlaces.length} 个目的地`
                  : `${allPlaces.length} 个目的地`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 space-y-12">
        {regions.length > 0 && (
          <section aria-label="按地区浏览">
            <header className="mb-6 border-b border-card pb-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Regions
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                按地区浏览
              </h2>
              <p className="mt-1 text-sm text-muted">
                点击任意地区，查看该地区下的所有目的地。
              </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {regions.map((r) => (
                <Link
                  key={r.region}
                  href={`/continents/${continentMeta.slug}/${currentCountry.slug}/${r.slug}`}
                  className="group block rounded-2xl border border-card bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-brand-400"
                >
                  <div className="text-3xl transition-transform group-hover:scale-110">
                    📍
                  </div>
                  <p className="mt-2 font-medium">{r.region}</p>
                  <p className="text-xs text-muted">{r.en}</p>
                  <p className="mt-3 text-xs font-medium text-brand-600 dark:text-brand-400">
                    {r.places.length} 个目的地
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-label="全部目的地">
          <header className="mb-6 border-b border-card pb-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              All Destinations
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {country} 全部 {allPlaces.length} 个目的地
            </h2>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPlaces.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
