import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceCard } from "@/components/PlaceCard";
import {
  CONTINENT_BY_SLUG,
  CONTINENT_META,
  CONTINENT_ORDER,
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
    description: `${continent}（${CONTINENT_META[continent].en}）下芋泥到访过的目的地。`,
  };
}

export default async function ContinentPage({ params }: PageProps) {
  const { slug } = await params;
  const continent = CONTINENT_BY_SLUG[slug];
  if (!continent) {
    notFound();
  }

  const meta = CONTINENT_META[continent];
  const places = getPlacesByContinent(continent);

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-[rgb(var(--foreground))] transition-colors"
          >
            <span aria-hidden>←</span> 返回所有大洲
          </Link>

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
                {places.length > 0
                  ? `共 ${places.length} 个目的地`
                  : "目的地待解锁"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        {places.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
