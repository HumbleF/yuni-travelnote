# 芋泥今天去哪里 — 项目优化设计文档

> 日期：2026-06-09
> 范围：架构改进 + 图片/SEO + 功能增强 + 内容对齐
> 推进顺序：Phase 1 → 2 → 3 → 4

---

## Phase 1: 架构改进 — frontmatter 声明制元数据

### 目标

新增国家/地区时无需修改代码，所有元数据从 content markdown 的 frontmatter 自动收集。

### 现状问题

`lib/places.ts` 中 `COUNTRY_META`、`REGION_META` 为硬编码映射表：

```ts
export const COUNTRY_META: Record<string, { slug: string; en: string; flag: string }> = {
  中国: { slug: "china", en: "China", flag: "🇨🇳" },
  日本: { slug: "japan", en: "Japan", flag: "🇯🇵" },
  // ...每新增一个国家必须在此手动添加
};
```

### 设计

#### 1.1 frontmatter schema 扩展

在每个 `.md` 的 frontmatter 中可选声明：

```yaml
---
title: 东京
continent: 亚洲
country: 日本
countryFlag: 🇯🇵      # 可选，至少一个日本攻略声明即可
countryEn: Japan       # 可选，同上
countrySlug: japan     # 可选，不填则自动从 countryEn 或中文名生成
region: 江西
regionEn: Jiangxi      # 可选
regionSlug: jiangxi    # 可选
---
```

规则：
- 同一 country 的多个文件中，**至少一个**需声明 `countryFlag` 和 `countryEn`
- 系统读取所有文件后去重合并，多个文件声明同一 country 的 flag/en 时以**文件名字母序最小的那个**为准（确定性排序，不依赖文件系统遍历顺序）
- 未声明 flag 的 country fallback 为 `🌐`，未声明 en 的 fallback 为中文名原值
- slug 生成优先级：`countrySlug` > 从 `countryEn` 转 kebab-case > `fallbackSlug(country)`

#### 1.2 lib/places.ts 重构

```
旧流程：
  readPlaceFile → 返回 PlaceMeta → COUNTRY_META[country] 查 flag/en/slug

新流程：
  1. scanAllFiles() — 读取所有 md，收集 PlaceMeta + 附带的 countryFlag/countryEn/regionEn
  2. buildCountryRegistry() — 从所有 PlaceMeta 中汇总 unique countries → { slug, en, flag }
  3. buildRegionRegistry() — 同理汇总 regions
  4. 后续 getCountriesByContinent() 等函数从 registry 取数据
```

接口变化：
- `COUNTRY_META` 不再作为公开常量导出 → 改为函数 `getCountryMeta(country: string): { slug, en, flag }`（内部优先从 frontmatter 收集的 registry 取，registry 中无则 fallback 到内置默认值 `🌐` / 中文名）
- `REGION_META` 同上 → 改为 `getRegionMeta(region: string): { slug, en }`
- `COUNTRY_BY_SLUG` / `REGION_BY_SLUG` 常量 → 改为函数 `findCountryBySlug(slug)` / `findRegionBySlug(slug)`（从 registry 反查）
- 保留 `CONTINENT_META` / `CONTINENT_ORDER`（大洲是固定集合，不会频繁新增）

缓存策略：
- 使用模块级变量缓存 registry（Node.js 单次构建期间只扫描一次）
- `let _cache: { countries: Map<string, CountryInfo>; regions: Map<string, RegionInfo> } | null = null`

#### 1.3 兼容性

- 现有 8 个 md 文件需要补充 `countryFlag` / `countryEn` / `regionEn` 字段（一次性迁移）
- 已有的 `country: "中国 · 江西"` 写法继续支持（`normalizeCountry` 逻辑不变）
- 不再保留旧硬编码映射表；迁移时确保每个 country/region 至少有一个 md 文件声明了完整元数据

#### 1.4 受影响文件

- `lib/places.ts` — 主要重构
- `app/page.tsx` — `CONTINENT_META` 引用方式不变，`COUNTRY_META` 调用改为函数
- `app/places/[slug]/page.tsx` — 同上
- `app/continents/[slug]/page.tsx` — 同上
- `app/continents/[slug]/[country]/page.tsx` — 同上
- `app/continents/[slug]/[country]/[region]/page.tsx` — 同上
- `content/places/*.md` — 补充 frontmatter 字段

---

## Phase 2: 图片优化 + SEO

### 2.1 图片优化

#### PlaceCard 和详情页 header

替换方式：
```tsx
// 旧
<img src={place.cover} alt={place.title} className="..." />

// 新
import Image from "next/image";
<Image
  src={place.cover}
  alt={place.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover ..."
/>
```

注意事项：
- 封面图来自 `/public/covers/`，是本地静态文件，Next.js Image 完全支持
- 详情页 header 的全宽 cover 用 `priority={true}` 避免 LCP 延迟
- PlaceCard 中的卡片图片用默认 lazy loading

#### Markdown 正文图片

正文通过 rehype 渲染为 HTML 字符串，无法直接使用 `<Image>` 组件。方案：
- 在 rehype pipeline 中添加 `rehype-img-size`（或自定义插件）给 `<img>` 标签注入 `loading="lazy"` 和 `decoding="async"` 属性
- 不做 Next.js Image 替换（复杂度过高，收益有限）

### 2.2 SEO 文件

#### sitemap.ts

```ts
// app/sitemap.ts
import { getAllPlaces, CONTINENT_ORDER, CONTINENT_META, ... } from "@/lib/places";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const places = getAllPlaces();
  // 生成：/ + /places/[slug] + /continents/[slug] + /continents/[slug]/[country] + /continents/[slug]/[country]/[region]
}
```

#### robots.ts

```ts
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://yourdomain.com/sitemap.xml",
  };
}
```

> 域名待定，先用占位符或环境变量。

#### Open Graph 图片

每个 place 详情页使用 Next.js `generateMetadata` 中的 `openGraph.images` 字段：
- 如果有 `cover`，直接用 cover 图路径
- 无 cover 时可生成动态 OG 图（Phase 3+ 再做，本阶段用静态 cover）

#### JSON-LD 结构化数据

在 `app/places/[slug]/page.tsx` 中嵌入：
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": place.title,
  "description": place.summary,
  "image": place.cover,
  // ...
}) }} />
```

### 2.3 受影响文件

- `components/PlaceCard.tsx` — img → Image
- `app/places/[slug]/page.tsx` — img → Image + JSON-LD
- `app/sitemap.ts` — 新建
- `app/robots.ts` — 新建
- `lib/places.ts` — rehype pipeline 加 lazy loading 插件（或自定义 rehype 插件）

---

## Phase 3: 功能增强

### 3.1 暗色模式切换

当前 `tailwind.config.ts` 中 `darkMode: "media"`，只跟随系统。

改造：
1. `tailwind.config.ts` 改为 `darkMode: "class"`
2. 新建 `components/ThemeProvider.tsx` — client component，从 localStorage 读取主题偏好，在 `<html>` 上加/移除 `class="dark"`
3. 新建 `components/ThemeToggle.tsx` — sun/moon 按钮，放在 header 右侧
4. `app/layout.tsx` — 包裹 `<ThemeProvider>`，`<html>` 初始 class 由 inline script 注入防止 flash

防闪烁策略：
```tsx
// layout.tsx <head> 中加入 inline script
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    var t=localStorage.getItem('theme');
    if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))
      document.documentElement.classList.add('dark');
  })()
` }} />
```

### 3.2 自定义 404

新建 `app/not-found.tsx`：
- 居中显示友好提示文案
- 返回首页按钮
- 风格与现有 "empty state"（虚线边框卡片）一致

### 3.3 搜索 + 筛选

#### 数据准备

构建时在 `lib/places.ts` 中导出一个 `getSearchIndex()` 函数，返回精简数组：
```ts
{ slug, title, country, region, continent, tags, bestSeason, duration, summary }[]
```

在首页（或独立搜索页）通过 `<script type="application/json" id="search-index">` 内嵌到 HTML，客户端组件读取后做本地模糊匹配。

#### 搜索组件

`components/SearchBar.tsx` — client component：
- 输入框 + 实时匹配（`String.includes()` 级别的子串匹配，覆盖 title / tags / country / summary；数据集 <50 条时无需引入 fuzzy 库）
- 结果下拉列表，点击跳转 `/places/[slug]`

#### 筛选组件

`components/FilterChips.tsx` — client component：
- 从 search index 提取所有 unique tags、seasons（bestSeason 中的关键词如"春"/"秋"/"冬"/"夏"）、duration
- 点击 chip 筛选首页显示的 PlaceCard 列表

#### 首页整合

`app/page.tsx` 拆分为：
- 服务端渲染所有卡片（SSG）
- 客户端 wrapper 组件接管筛选/搜索交互（CSR overlay）

### 3.4 "关于"链接处理

- 从 `app/layout.tsx` 的 header nav 中移除"关于"链接
- 不创建 about 页面（等用户决定内容后再加）

### 3.5 受影响文件

- `tailwind.config.ts` — darkMode 改 class
- `app/layout.tsx` — ThemeProvider + 移除"关于"链接 + inline script
- `components/ThemeProvider.tsx` — 新建
- `components/ThemeToggle.tsx` — 新建
- `app/not-found.tsx` — 新建
- `components/SearchBar.tsx` — 新建
- `components/FilterChips.tsx` — 新建
- `app/page.tsx` — 整合搜索/筛选

---

## Phase 4: 内容质量对齐

### 目标

将现有攻略（特别是东京）补齐到新模板标准。

### 东京攻略需补充章节

对照 `docs/template.md` 和最新的墨尔本/布拉格攻略：

| 章节 | 当前状态 | 需要 |
|------|----------|------|
| 一句话点评（适合/不适合/亮点/避雷） | 无 | 补充 |
| 真实预算（分项明细表） | 无 | 补充 |
| 景点分级（必去/可去可不去/避雷） | 仅一个平铺列表 | 改为三档 |
| 出片机位 | 无 | 补充 |
| 避雷集合 | 无 | 补充 |
| 预约购票实操 | 无 | 补充 |
| 写在最后 | 无 | 补充 |
| frontmatter 补充 | 无 budget 字段 | 补充 budget |

### 其他攻略检查

首尔、成都、莫干山、绍兴同理需检查是否缺少上述章节（但优先级低于东京，因为东京作为代表性海外城市最容易被读者点开）。

---

## 技术栈确认

- **框架**：Next.js 15 App Router（不变）
- **样式**：Tailwind CSS 3 + @tailwindcss/typography（不变）
- **内容**：Markdown + gray-matter + unified/remark/rehype（不变）
- **新增依赖预估**：无（搜索用原生 JS，暗色模式用 localStorage，Image 是 Next.js 内置）

---

## 不做的事项（YAGNI）

- 不加 i18n（网站定位为中文读者）
- 不加 CMS 后台（内容直接编辑 md 文件）
- 不加评论系统
- 不加用户登录/收藏
- 不加 RSS（内容更新频率低，优先级不够）
- 不做 ISR/动态渲染（纯 SSG 够用）
- "关于"页面暂不实现
