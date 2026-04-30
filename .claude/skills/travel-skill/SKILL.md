---
name: travel-skill
description: >-
  Plans, drafts, and publishes a new travel destination guide for the
  daisy/travel Next.js site (HumbleF/yuni-travelnote). Use when the user says
  things like "新增地点 / 加一个 / 想去 X / 帮我写 X 攻略 / 更新 X / 上线 X 攻略",
  asks to author or edit a markdown file under `content/places/`, fetch covers
  into `public/covers/<slug>/`, or push changes to GitHub so Vercel re-deploys
  https://yuni-travelnote.vercel.app/. Wraps the full pipeline: pick slug
  (avoid duplicates) -> draft markdown from docs/template.md -> auto-fetch 4
  self-hosted images via Bing+PowerShell -> triple-verify -> three regex
  self-checks -> git push (skips per-step confirmations by default).
---

# Travel Skill · 新增 / 更新一个旅行目的地的端到端 workflow

<!-- DUAL-LOCATION SOURCE
     This file is mirrored byte-identical at:
       - .cursor/skills/travel-skill/SKILL.md   (Cursor entry)
       - .claude/skills/travel-skill/SKILL.md   (Claude Code entry)
     After editing either, run from repo root:
       Copy-Item .cursor\skills\travel-skill\SKILL.md .claude\skills\travel-skill\SKILL.md -Force
     See README "AI 集成 · 三种 Claude 入口" for ZIP upload to Claude Desktop / claude.ai.
-->

This skill is **content-only** for the [daisy/travel](https://github.com/HumbleF/yuni-travelnote) Next.js site. The agent **never edits** `app/`, `lib/`, `components/`, or build config — only authors `.md` under `content/places/`, drops images under `public/covers/<slug>/`, and pushes to GitHub for Vercel auto-deploy.

## Default behavior

When the user asks to add or update a destination, **run all 9 steps below by default — no per-step confirmation**, except the two steps marked `[ASK FIRST]`.

## Workflow checklist

Copy this checklist at the start of each run and tick as you go:

```text
- [ ] Step 1: 选 / 确认地点 (slug + 大洲 + 国家), 检查不和 content/places/*.md 重复  [ASK FIRST]
- [ ] Step 2: 起本地 dev server (npm run dev) 用于 step 5 / 7 的图片与页面验证
- [ ] Step 3: 写 markdown 草稿 (基于 docs/template.md, 14 个 H2 必填)
- [ ] Step 4: 取图 (cover + 01/02/03 共 4 张), 按 README 标准取图流程
- [ ] Step 5: 三重验证图片 (>30KB + magic bytes + dev server 200 image/*)
- [ ] Step 6: 跑 README 三项自查 (禁词扫描 / 占位符扫描 / 必填章节扫描)
- [ ] Step 7: 浏览器肉眼验证首页卡片 + 详情页 (http://localhost:3000)
- [ ] Step 8: git add . && commit && push                                     [ASK FIRST: 仅确认 commit message 措辞]
- [ ] Step 9: 等 Vercel build, curl https://yuni-travelnote.vercel.app/places/<slug> 应返回 200
```

> 下文示例里 `<slug>` 是占位符（如 `kyoto` / `moganshan`），实际跑命令时要把 `<slug>` 全部替换成本次的 slug。

---

## Step details

### Step 1 · 选 / 确认地点 [ASK FIRST]

列出现有 places 防止重复：

```powershell
Get-ChildItem content/places -Filter *.md | ForEach-Object { $_.BaseName }
```

当前基线（2026-04 时点）：`tokyo` / `shaoxing` / `chengdu` / `moganshan`。新地点应避开同主题（如已有"莫干山周末游"就别再加"安吉周末游"，主题重复）。

用 `AskQuestion` 让用户从 3-5 个候选地点中选 1 个，并选 1 个侧重维度（公共交通 / 自驾 / 徒步 / 美食 / 摄影 / 亲子）。最终敲定：

| 字段 | 例子 |
| --- | --- |
| slug | `kyoto`（英文小写连字符，对应 URL `/places/kyoto`） |
| title | `京都`（中文显示名） |
| continent | `亚洲` / `欧洲` / `北美洲` / `南美洲` / `非洲` / `大洋洲` / `南极洲` 之一 |
| country | `日本` |
| 侧重 | `古都 / 红叶 / 慢生活`（决定 tags 和正文重点） |

### Step 2 · 起本地 dev server

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'
npm run dev
```

后台跑（用单独的 terminal 或 `block_until_ms: 0`）。等 `Ready in ...` 出现 → http://localhost:3000 应 200。后续 step 5 / 7 都依赖它。

### Step 3 · 写 markdown 草稿

- 路径：`content/places/<slug>.md`
- 起步：复制 [docs/template.md](../../../docs/template.md) 里 `## 模板（复制即可用）` 整段 markdown 代码块作为骨架
- 字段说明：见 [docs/template.md · Front-matter 字段说明](../../../docs/template.md#front-matter-字段说明)，必填 `title` / `continent`，强烈建议填 `cover` / `country` / `summary` / `budget` / `tags`
- **14 个必填 H2**（顺序可调，但缺一个都算不完整）：

  ```text
  ## 一句话点评
  ## 关于<X>
  ## 真实预算
  ## 行程建议
  ## 景点分级
  ## 出片机位
  ## 美食三档
  ## 预约购票实操
  ## 交通详解
  ## 住宿
  ## 打包清单
  ## 实用信息
  ## 避雷集合
  ## 写在最后
  ```

- 写完每节后 **立即删掉对应的 `<!-- HTML 注释 -->`**（注释是模板里给作者的硬约束，不是给读者看的）
- 严格遵守 [README · 内容质量红线](../../../README.md#内容质量红线写攻略前必读)：禁词词典、强制具体化（数字+单位+出处）、每节末尾 30-80 字第一人称真心话

### Step 4 · 取图

完整流程见 [README · 标准取图流程](../../../README.md#标准取图流程powershell--国内可用)。skill 层关键约定：

- **4 张图，固定命名**：`public/covers/<slug>/{cover,01-<theme>,02-<theme>,03-<theme>}.{jpg|png|webp}`
- **数据源**：`cn.bing.com/images/search`（中国大陆 Wikimedia / Pexels API / 直连 GitHub 大概率被拦）
- **抽 URL**：HTML 里的 `mediaurl=...&` 参数即原图地址
- **必须过滤的水印站**：`dreamstime, alamy, shutterstock, gettyimages, istockphoto, 123rf, depositphotos, fotolia, stock.adobe`
- **临时取图脚本** 命名 `.tmp-fetch-images.ps1`，用完 **立刻 Delete**，绝不能进 commit
- **markdown 引用方式**（路径以 `/` 开头，是 Next.js 静态资源约定）：

  ```markdown
  ![<人话 alt 文字>](/covers/<slug>/01-<theme>.jpg)
  ```

- **正文图插入位置**：`01` 一般在「关于<X>」或「行程建议」之后，`02` / `03` 在「美食」/「景点」/「住宿」之间错落，确保正文有视觉锚点而不是图片堆叠

### Step 5 · 三重验证图片

```powershell
# 1) 文件大小 > 30KB (小于这个基本是错误页 / 占位图)
Get-ChildItem public/covers/<slug>/*.* | Where-Object Length -lt 30KB

# 2) magic bytes 必须正确
#    JPEG = FF D8 FF / PNG = 89 50 4E 47 / WebP = 52 49 46 46
Get-ChildItem public/covers/<slug>/*.* | ForEach-Object {
  $b = [System.IO.File]::ReadAllBytes($_.FullName)[0..3]
  "{0,-30} {1}" -f $_.Name, (($b | ForEach-Object { '{0:X2}' -f $_ }) -join ' ')
}

# 3) dev server 必须返回 200 + Content-Type: image/*
Get-ChildItem public/covers/<slug>/*.* | ForEach-Object {
  $u = "/covers/<slug>/$($_.Name)"
  curl.exe -s -o nul -w "$u  %{http_code}  %{content_type}`n" "http://localhost:3000$u"
}
```

三项全过 → step 5 收工。任何一项失败 → 回到 step 4 重新取这一张。

### Step 6 · 三项自查（提交前必跑）

```powershell
# 1) 禁词扫描 (期望 0 匹配)
rg -n "值得一去|不容错过|必打卡|美轮美奂|流连忘返|心灵的洗礼|人间仙境|美不胜收|令人陶醉|别有一番风味|古色古香|有着悠久的历史|是一座美丽的城市|是绝佳的选择|给您留下难忘的回忆" content/places/<slug>.md

# 2) 占位符扫描 (期望 0 匹配 -- 模板里的 HTML 注释和 ... 应该都已删干净)
rg -n "<!--|^\.\.\.$" content/places/<slug>.md

# 3) 必填章节扫描 (期望恰好 14 行匹配, 14 个 H2 全在)
rg -n "^## (一句话点评|关于|真实预算|行程建议|景点分级|出片机位|美食|预约购票|交通|住宿|打包清单|实用信息|避雷集合|写在最后)" content/places/<slug>.md
```

PowerShell 没装 ripgrep 时，用 Cursor 的 Grep tool 跑同样 pattern 即可。任何一项不达标 → 回 step 3 改 markdown。

### Step 7 · 浏览器肉眼验证

- http://localhost:3000 → 首页应该出现新卡片（带真实封面图，不是渐变 + 首字 fallback）
- http://localhost:3000/places/<slug> → 详情页 14 节齐全、3 张正文图都加载
- 渲染后的 HTML 不应残留任何外链图：

  ```powershell
  curl.exe -s "http://localhost:3000/places/<slug>" | rg "images\.unsplash\.com|images\.pexels\.com" -c
  # 期望输出: 0
  ```

### Step 8 · 提交 + 推送 [ASK FIRST: 只确认 commit message]

仓库级 git 身份已经设为 `HumbleF / 1131671056@qq.com`，**不要动全局 config**。

```powershell
git add content/places/<slug>.md public/covers/<slug>/
git status   # 确认没误带 .env / node_modules / .next / 任何临时脚本

# commit message 格式: "feat(places): 新增「<title>」<侧重一句话>"
# 例: "feat(places): 新增「莫干山」周末公共交通攻略 + 4 张本地图"
# 多行 message 在 PowerShell 不能用 bash heredoc, 走文件中转:
$msg = @"
feat(places): 新增「<title>」<侧重一句话>

- 14 节攻略, 含真实预算 / 行程 / 景点分级 / 避雷
- 4 张自托管图 (cover + 01/02/03), 已通过 30KB + magic bytes + dev 200 三重验证
- 三项自查 (禁词 / 占位符 / 章节) 全 pass
"@
$msg | Out-File -FilePath .git/COMMIT_MSG.txt -Encoding UTF8 -NoNewline
git commit -F .git/COMMIT_MSG.txt
Remove-Item .git/COMMIT_MSG.txt

git push origin main
```

如果 `git push` 报 `connection to github.com port 443 timed out`（中国大陆典型症状），先核对仓库级代理：

```powershell
git config --get http.proxy   # 期望: http://127.0.0.1:7890
# 没有的话:
git config http.proxy http://127.0.0.1:7890
git config https.proxy http://127.0.0.1:7890
```

（端口按用户实际 Clash / V2ray 监听端口调，常见 7890 / 1080。）

### Step 9 · Vercel 部署验证

Vercel 通过 GitHub webhook 在 push 后 1-2 分钟内自动 build。

```powershell
Start-Sleep -Seconds 90
curl.exe -s -o nul -w "%{http_code}`n" https://yuni-travelnote.vercel.app/places/<slug>
# 期望: 200
```

如果返回 404 / 500：去 https://vercel.com/ dashboard 看最新一次 build log，常见原因是 markdown front-matter 字段类型错（如 `tags` 写成了字符串而不是数组）。

---

## Anti-patterns（千万别做）

- DON'T 用 `images.unsplash.com/photo-<id>` 之类的 CDN 外链图。**8/15 ID 不存在 → 404**，剩下 7 张内容随机（出现过一张蛇照片）。详见 [README · 图片处理](../../../README.md#图片处理必读--写新攻略前看这一节)
- DON'T 改 `app/` / `lib/` / `components/` / `next.config.ts` —— 这个 skill **只动** `content/places/` 和 `public/covers/`
- DON'T 改 **全局** git config（`git config --global`）—— 仓库级别已设 `HumbleF / 1131671056@qq.com`，污染全局会让其他仓库的 author 也变错
- DON'T 把 `.tmp-fetch-images.ps1` / `node_modules/` / `.npm-cache/` / `.next/` / 任何 `.env*` 提交进 git
- DON'T 用 README 红线词典里的形容词（"值得一去 / 美不胜收 / 古色古香 / ..."），写完 step 6 自查必须 0 匹配
- DON'T 跳过取图直接 commit。即使技术上 `cover` 缺省能渲染渐变 + 首字 fallback，**默认动作就是要取图**。仅当用户明确说「先不取图 / 占位先」才跳过 step 4-5
- DON'T 用 `git commit --amend` 改已 push 的 commit —— 会强制 force push 污染他人 clone

---

## 触发场景示例（让 agent 知道何时启用）

| 用户原话 | 是否触发 | 备注 |
| --- | --- | --- |
| "新增「奈良」攻略" | 是 | 9 步全跑 |
| "加一个京都" / "想去京都" | 是 | step 1 用 AskQuestion 确认侧重 + duration |
| "更新一下莫干山的住宿部分" | 是 | 跳过 step 1（地点已存在）+ step 4-5（图不变），跑 step 3/6/8/9 |
| "把首页布局改一下" | 否 | 这是 `app/page.tsx` 改动，不属于本 skill 范围 |
| "改一下夜间模式配色" | 否 | 这是 `app/layout.tsx` / Tailwind 配置，不属于本 skill 范围 |
| "把莫干山的封面图换一张" | 是 | 只跑 step 4-5（重新取图）+ step 7-9（验证 + push） |

---

## References

- 模板：[docs/template.md](../../../docs/template.md)
- 完整规则（红线 / 取图 / 自查 / 部署）：[README.md](../../../README.md)
- 已有攻略（按风格选最近的复制改）：`content/places/{tokyo,shaoxing,chengdu,moganshan}.md`
- 公网站点：https://yuni-travelnote.vercel.app/
- GitHub 仓库：https://github.com/HumbleF/yuni-travelnote
- 仓库级 git 身份：`HumbleF` / `1131671056@qq.com`（仅本仓库，不影响全局）
