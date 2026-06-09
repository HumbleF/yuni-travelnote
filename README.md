# 旅行手册 · Travel Guide

一个用 Markdown 写攻略的极简旅行网站。首页展示所有目的地的卡片，点击进入对应地点的详情页。

> 新增一个目的地 = 一个 `.md` 攻略 + `public/covers/<slug>/` 下 1 张 `cover.jpg` + 3 张正文图，无需改代码。
>
> 写攻略的完整规范（模板 / 质量红线 / 图片处理）见 [docs/template.md](docs/template.md)。

## 技术栈

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS 3](https://tailwindcss.com/) + `@tailwindcss/typography`
- [gray-matter](https://github.com/jonschlinkert/gray-matter) 解析 Markdown front-matter
- [remark](https://github.com/remarkjs/remark) + [rehype](https://github.com/rehypejs/rehype) 把 Markdown 转 HTML

## 本地运行

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可。

> 如果默认 npm 缓存目录有权限问题，可以用项目本地缓存：
> `npm install --cache ./.npm-cache`

## 目录结构

```text
.
├── app/
│   ├── layout.tsx              # 全局布局（导航、暗色模式）
│   ├── page.tsx                # 首页：所有目的地卡片
│   └── places/[slug]/page.tsx  # 单个目的地详情页
├── components/
│   ├── PlaceCard.tsx           # 首页卡片
│   └── MarkdownContent.tsx     # 渲染 Markdown 正文
├── content/
│   └── places/                 # 所有目的地的 Markdown
│       ├── tokyo.md
│       └── chengdu.md
├── lib/
│   └── places.ts               # 扫描 + 解析所有 .md
└── public/
    └── covers/                 # 每个目的地一个子目录，含 cover.jpg + 3 张正文图
```

## 如何新增一个地点

1. 在 `content/places/` 下新建 Markdown 文件（文件名 = URL slug，如 `kyoto.md` → `/places/kyoto`）
2. 按 [docs/template.md](docs/template.md) 写好 front-matter + 正文
3. 按模板中「图片处理」一节的标准取图流程，下载 cover + 3 张正文图到 `public/covers/<slug>/`
4. `npm run dev` → 首页自动出现新卡片

## 部署

### Vercel（推荐）

1. 把代码推到 GitHub
2. 在 [Vercel](https://vercel.com/) 导入仓库
3. 一键部署完成，每次推送都会自动重新构建

### 静态导出 (适合 GitHub Pages / Cloudflare Pages)

在 `next.config.ts` 加一行：

```ts
const nextConfig: NextConfig = {
  output: "export",
  // ...
};
```

然后：

```bash
npm run build
```

输出在 `out/` 目录，把它整个上传到任意静态托管即可。

## AI 集成 · 三种 Claude 入口

`travel-skill` 按 [Agent Skills 开放标准](https://github.com/anthropics/skills) 写（YAML frontmatter `name` + `description` + markdown 正文），同一份 SKILL.md 三种入口都能直接识别 + 触发：

| 入口 | 加载位置 | 怎么生效 |
| --- | --- | --- |
| **Cursor** | `.cursor/skills/travel-skill/SKILL.md`（已就位） | 打开本仓库即自动发现，命中 description 触发词时加载 |
| **Claude Code CLI** | `.claude/skills/travel-skill/SKILL.md`（已就位，与 Cursor 版 byte-identical） | `claude` 在本仓根启动即自动发现项目级 skill；想跨项目用，把整个目录复制到 `~/.claude/skills/travel-skill/` |
| **Claude Desktop / claude.ai 网页** | 上传 ZIP | 见下方「打 ZIP 上传」 |

### 双发同步约定

两份 SKILL.md 必须 byte-identical。任一边改完后跑：

```powershell
Copy-Item .cursor\skills\travel-skill\SKILL.md .claude\skills\travel-skill\SKILL.md -Force
(Get-FileHash .cursor\skills\travel-skill\SKILL.md).Hash -eq (Get-FileHash .claude\skills\travel-skill\SKILL.md).Hash
# 期望: True
```

### 打 ZIP 上传到 Claude Desktop / claude.ai

```powershell
New-Item -ItemType Directory -Force -Path dist | Out-Null
Compress-Archive -Path .claude\skills\travel-skill -DestinationPath dist\travel-skill.zip -Force
```

ZIP 内顶层必须是 `travel-skill/SKILL.md` 而不是裸 `SKILL.md`（[官方强调](https://support.claude.com/en/articles/12512180-use-skills-in-claude)）。然后：

1. Claude Desktop / claude.ai → **Customize** → **Skills**
2. 点 **+** → **+ Create skill** → **Upload a skill**
3. 选 `dist\travel-skill.zip`

`dist/` 已在 `.gitignore`，ZIP 不进 git，每次改完 SKILL.md 重新打即可。

### Skill 内的相对路径

SKILL.md 用 `../../../README.md` 和 `../../../docs/template.md` 引用主仓文档。在 **Cursor** / **Claude Code（同 repo）** 这两种「skill 在 repo 内」的模式下都能正确 resolve（路径深度同样是 3 层 up 到 repo 根）。

但在 **用户级 `~/.claude/skills/`** 或 **Claude Desktop / web 上传 ZIP** 这两种「skill 脱离 repo」的模式下，相对路径会失效 —— 此时 agent 需要改用 GitHub raw URL 抓取被引用的文件：

- `https://raw.githubusercontent.com/HumbleF/yuni-travelnote/main/README.md`
- `https://raw.githubusercontent.com/HumbleF/yuni-travelnote/main/docs/template.md`
