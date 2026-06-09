import type { Metadata } from "next";
import Link from "next/link";
import { NavDestinations, type NavContinentItem } from "@/components/NavDestinations";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  CONTINENT_META,
  CONTINENT_ORDER,
  getPlacesGroupedByContinent,
} from "@/lib/places";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "芋泥今天去哪里",
    template: "%s · 芋泥今天去哪里",
  },
  description: "陪芋泥环游世界，按地球板块收藏每一站的行程、美食与必去景点。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const groups = getPlacesGroupedByContinent();
  const visited = new Map(groups.map((g) => [g.continent, g.places.length]));
  const navItems: NavContinentItem[] = CONTINENT_ORDER.filter(
    (c) => c !== "其他" && c !== "南极洲",
  ).map((continent) => {
    const meta = CONTINENT_META[continent];
    return {
      name: continent,
      en: meta.en,
      emoji: meta.emoji,
      count: visited.get(continent) ?? 0,
      href: `/#${meta.en}`,
    };
  });

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})()`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
        <header className="sticky top-0 z-30 backdrop-blur bg-[rgb(var(--background))]/70 border-b border-card">
          <nav className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-brand-500 text-sm"
              >
                🥐
              </span>
              芋泥今天去哪里
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted">
              <NavDestinations items={navItems} />
              <ThemeToggle />
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="mt-24 border-t border-card">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} 芋泥今天去哪里</span>
            <span>每一次出发，都从一份手写攻略开始。</span>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
