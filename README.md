# 旅行手册 · Travel Guide

一个用 Markdown 写攻略的极简旅行网站。首页展示所有目的地的卡片，点击进入对应地点的详情页。

> 新增一个目的地 = 一个 `.md` 攻略 + `public/covers/<slug>/` 下 1 张 `cover.jpg` + 3 张正文图，无需改代码。
>
> 取图按「[图片处理](#图片处理必读--写新攻略前看这一节)」一节标准流程**默认执行**，不需要再问"要不要取图"。

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

1. 在 `content/places/` 下新建一个 Markdown 文件，文件名就是 URL slug，比如 `kyoto.md` 对应 `/places/kyoto`
2. 在文件顶部写好 front-matter
3. 正文里用任意 Markdown 写攻略（标题、列表、表格、链接、图片都支持）
4. **默认动作**：按「[图片处理](#图片处理必读--写新攻略前看这一节)」一节的标准取图流程，下载 1 张 `cover.jpg` + 3 张正文图（命名 `01-<theme>.jpg` / `02-<theme>.jpg` / `03-<theme>.jpg`）到 `public/covers/<slug>/`，front-matter 里写 `cover: /covers/<slug>/cover.jpg`，正文用 `![]()` 引用 3 张正文图。**只有用户明确说"先不取图 / 占位先"时才跳过**；技术上 cover 字段缺省也能用渐变 + 首字 fallback 渲染，但那是兜底而非常规路径。

### Markdown 模板

完整模板（≈270 行，含 14 个必填章节 + Front-matter 字段说明 + 设计哲学）已抽到 [docs/template.md](docs/template.md)。

新增地点时两种推荐写法：

- **从模板起步**：复制 [docs/template.md](docs/template.md) 里 `## 模板（复制即可用）` 那段 markdown 代码块，改字段 + 改正文
- **从相近风格起步**：复制风格最接近的现有攻略（如周末游用 `content/places/moganshan.md`，海外大城市用 `content/places/tokyo.md`），见 [docs/template.md · 已有参考攻略](docs/template.md#已有参考攻略按风格选最近的复制改)

模板里的 `<!-- HTML 注释 -->` 是写攻略时给自己的**硬约束**（标明本节必填什么、禁止写什么），**正式发布前删掉**即可（HTML 注释不会渲染到页面）。

> 文风：**客观信息**（价格 / 地址 / 时间 / 用时）走中性表格化；**提示 / 避雷 / 真心话** 用第一人称口语化，让人感觉是"刚去过的朋友写的"，不是百度百科。

<!-- 历史遗留：完整模板正文 + Front-matter 表格在 v0.x 时代直接写在本节里（约 270 行），
     从 v1 起搬到 docs/template.md，方便跑 skill 直接读模板而不用解析整篇 README。
-->

## 内容质量红线（写攻略前必读）

旅游攻略最容易翻车的不是排版，而是写成"百度百科式废话"。以下三条红线必须遵守，写完自己扫一遍。

### 红线 1 · 禁止形容词词典

下面这些词在攻略里出现 = 这一句信息密度为 0，请删掉或改写：

```text
值得一去 / 不容错过 / 必打卡 / 美轮美奂 / 流连忘返 / 心灵的洗礼 /
人间仙境 / 美不胜收 / 令人陶醉 / 别有一番风味 / 古色古香 /
有着悠久的历史 / 是一座美丽的城市 / 是绝佳的选择 / 给您留下难忘的回忆
```

写完用 ripgrep 自查一遍：

```powershell
rg -n "值得一去|不容错过|必打卡|美轮美奂|流连忘返|心灵的洗礼|人间仙境|美不胜收|令人陶醉|别有一番风味|古色古香|有着悠久的历史|是一座美丽的城市|是绝佳的选择|给您留下难忘的回忆" content/places/<slug>.md
```

期望输出：**0 行匹配**。

### 红线 2 · 强制具体化（数字 + 单位 + 出处）

| 维度 | 反面教材 | 正面写法 |
| --- | --- | --- |
| 时间 | "上午去清水寺" | "**8:00-9:30** 去清水寺，10 点后旅游团人量翻倍" |
| 地点 | "祇园附近的小桥" | "**祇园四条站 9 号出口** 步行 4 min 的白川南通 巽桥" |
| 价格 | "门票不贵" | "**500 JPY (≈25 元)，2024 年 11 月价**" |
| 用时 | "走一会儿就到" | "步行 **12 min**（含红绿灯），打车 **¥800 / 5 min**" |
| 排队 | "人很多" | "工作日 9:00 入场要排 **20 min**，周末翻倍至 **45 min**" |

### 红线 3 · 每节末尾建议加 30-80 字第一人称真心话

客观信息表格之后，用一段口语化真心话告诉读者**你的真实感受 + 哪条经验只有去过才知道**。这一段比前面所有的客观数据都更打动人。

```markdown
> 我那天 7 点到伏见稻荷，走到"奥社奉拜所"就回头了 ——
> 大部分游客根本不会走到山顶（来回 2.5h），中段已经基本没人；
> 千本鸟居最密集的那一段就在前 200 m，早起拍完直接撤是最优解。
```

### 自查清单（提交前跑）

```powershell
# 形容词扫描（应该 0 匹配）
rg -n "值得一去|不容错过|必打卡|美轮美奂|流连忘返|心灵的洗礼|有着悠久的历史" content/places/<slug>.md

# 占位符扫描（HTML 注释和 ... 应该 0 匹配，注释只是写时的约束，发布前删掉）
rg -n "<!--|^\.\.\.$" content/places/<slug>.md

# 必填章节扫描（每个二级标题都应该出现）
rg -n "^## (一句话点评|关于|真实预算|行程建议|景点分级|出片机位|美食|预约购票|交通|住宿|打包清单|实用信息|避雷集合|写在最后)" content/places/<slug>.md
```

## 图片处理（必读 · 写新攻略前看这一节）

> 历史教训：早期版本图片全部用 `images.unsplash.com/photo-<id>` 外链，结果 8/15 ID 不存在直接 404，剩下 7 张 CDN 返回 200 但内容是随机命中的缓存图（甚至出现过一张蛇照片）。**禁止再用外链图。**

> **默认行为约定（给 AI agent / 自己写攻略时）**：用户说"新增 / 加一个 / 帮我写 X"时，**默认动作 = markdown + 取图 一体执行**，不需要事前问"要不要取图"。下文的标准取图流程是默认动作而非可选项。**只有用户明确写"先不取图 / 占位先"时才跳过**。

### 黄金规则

1. **所有图片必须自托管在 `public/covers/<slug>/` 下**，markdown 里只引用 `/covers/<slug>/<name>.{jpg,png,webp}`
2. **不要凭印象猜 Unsplash / Pexels / 任何 CDN 的 photo ID**。CDN 对不存在 ID 的回包行为不可预测
3. **下载后必须本地验证**：`curl -I http://localhost:3000/covers/<slug>/<name>.jpg` 必须看到 `200` + `Content-Type: image/...`

### 命名约定

```text
public/covers/<slug>/
├── cover.jpg          # 首页卡片 + 详情页 hero
├── 01-<theme>.jpg     # 正文第 1 张配图，主题用英文短词，比如 01-shibuya
├── 02-<theme>.jpg
└── 03-<theme>.jpg
```

markdown 里这样引用（路径以 `/` 开头，是 Next.js 静态资源约定）：

```markdown
![涩谷十字路口](/covers/tokyo/01-shibuya.jpg)
```

### 标准取图流程（PowerShell · 国内可用）

适合在中国大陆网络环境（Wikimedia / Pexels API / 直连 GitHub 大概率被拦），用 `cn.bing.com` 图搜兜底：

1. **按主题写一组英文搜索词**，比如：
   - `tokyo` → `tokyo skyline night cityscape`
   - `tokyo/01-shibuya` → `shibuya crossing tokyo crowd`
   - `shaoxing/02-lanting` → `lanting orchid pavilion shaoxing`

2. **抓 Bing 图搜结果页**：

   ```powershell
   $ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
   curl.exe -s -A $ua --max-time 12 -o tmp.html `
     ("https://cn.bing.com/images/search?q=" + [System.Uri]::EscapeDataString("shibuya crossing tokyo crowd") + "&form=HDRSC2")
   ```

3. **从 HTML 里抽真实图源 URL**（Bing 把原图地址放在 `mediaurl=` 参数里）：

   ```powershell
   $page = Get-Content tmp.html -Raw
   $urls = [regex]::Matches($page, 'mediaurl=([^&]+)') |
           ForEach-Object { [System.Uri]::UnescapeDataString($_.Groups[1].Value) } |
           Select-Object -Unique
   ```

4. **过滤水印图源**（这些站点每张图都有大水印，无法直接用）：

   ```text
   dreamstime, alamy, shutterstock, gettyimages, istockphoto,
   123rf, depositphotos, fotolia, stock.adobe
   ```

5. **逐个下载，第一张 ≥ 30KB 且能成功落盘的就采纳**，存到 `public/covers/<slug>/<name>.<ext>`（保留原扩展名 jpg/png/webp）

6. **三重验证**：
   - 文件大小 > 30KB（小于这个基本是错误页 / 占位图）
   - 文件头 magic bytes：JPEG = `FF D8 FF`, PNG = `89 50 4E 47`, WebP = `52 49 46 46`
   - 通过 dev server 拉一遍：`curl -o nul -w "%{http_code} %{content_type}" http://localhost:3000/covers/...`

### 推荐主题搜索词（避免出现意外内容）

写搜索词时**越具体越好**，避免单词如 `china` / `food` 这种宽泛词，否则搜出来什么都有。参考：

| 想要的画面 | 推荐搜索词 |
| --- | --- |
| 江南水乡 | `jiangnan water village stone bridge canal` |
| 兰亭 | `lanting orchid pavilion shaoxing wang xizhi` |
| 安昌古镇 | `anchang ancient town shaoxing` |
| 涩谷十字路口 | `shibuya crossing tokyo crowd` |
| 浅草寺 | `sensoji temple kaminarimon asakusa` |
| 川菜火锅 | `sichuan hotpot red soup` |
| 大熊猫 | `chengdu giant panda bamboo` |

### 验证清单（写完攻略要跑一遍）

```powershell
# 1. 三个 md 不应有任何外链图
rg -n "https?://[^)]+\.(jpg|jpeg|png|webp|gif)" content/places/

# 2. dev server 能把所有图片以 200 + image/* MIME 返回
$urls = rg -oNI "/covers/[^\"\\s)]+" content/places/ -t md
foreach ($u in $urls) {
  curl.exe -s -o nul -w "$u  %{http_code} %{content_type}`n" "http://localhost:3000$u"
}

# 3. 渲染后的页面 HTML 也不应残留外链
curl.exe -s "http://localhost:3000/places/<slug>" | rg "images\.unsplash\.com|images\.pexels\.com" -c
# 期望输出: 0
```

三条都过 → 收工。

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

## 后续工作流

```text
你: "想去京都"
  ↓
我: 1. content/places/kyoto.md 写好攻略（front-matter + 14 个必填章节）
    2. 按标准取图流程，public/covers/kyoto/ 下放 cover + 01/02/03 共 4 张本地图
    3. 跑三项自查脚本（形容词 / 占位符 / 章节）+ 4 张图三重验证（>30KB + magic bytes + dev server 200 image/*）
  ↓
npm run dev → 首页自动出现京都卡片（带真实封面图）
  ↓
git push → 自动部署到线上
```
