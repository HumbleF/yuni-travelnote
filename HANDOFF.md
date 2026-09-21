# HANDOFF · 旅行手册
> 快照，每次覆盖。更新时间: 2026-09-21 ｜ 分支: main

## 从这里开始（新 agent 必读）
1. 先跑「现状 & 验证」里的命令，确认现状。
2. 若结果与本文不符 → **以现实为准**，不要盲信本文，并在 ITERATIONS.md 记一笔。
3. 看「阻塞 / 待确认」，确认无卡点、明确自主边界。
4. 从「下一步」开始，不要跳步。

## 下一步（唯一）
> 确认 `origin/main` 已包含厦门攻略与台湾政策修订；若未推上，按 push-git 用 HumbleF 身份提交并 `push origin main`（GitHub 需走 `127.0.0.1:7890` 代理）。
> 完成标准: `https://github.com/HumbleF/yuni-travelnote` 的 main 能看到 `content/places/xiamen.md`，且本地 `git status` 干净。

## 当前目标 / 不做的事
- 目标: 把本轮厦门攻略和已改的台湾政策提示落到远程 main。
- 不做: 不改站点框架代码；不另开季节独立攻略；不 force push。

## 现状 & 验证
- 分支: main ｜ 工作区: 有未提交改动（见下方待办提交清单）
- 能跑: `npm run dev` → http://localhost:3000/places/xiamen ｜ `npm test` 47 passed
- 半成品: 无
- 验证命令（只读优先）:
  - `git status` → 应见 `content/places/xiamen.md`、`public/covers/xiamen/`、`content/places/taiwan.md`
  - `npm test` → 预期 7 files / 47 tests passed
  - 页面: `/places/xiamen`、`/continents/asia/china/fujian` 应出现厦门卡片

## 待办（全量，按优先级）
1. [ ] 提交并推送本轮改动 — 完成标准: origin/main 含厦门 + 台湾政策段，工作区干净
2. [ ] 等用户下一指令（改行程 / 新目的地）— 完成标准: 有明确需求再动笔

## 仍生效的坑点 / 决策
- 坑: Unsplash 搜索页 WebFetch 401，用 `/photos/<slug>/download?force=true&w=1600` 下载后再 Read 目视。
- 坑: 本仓 remote 名叫 `origin`（GitHub `HumbleF/yuni-travelnote`），不是 push-git 示例里的 `github`；分支是 `main` 不是 `master`。
- 决策: 选「轮渡/中山路一住到底」否「住曾厝垵」，因 3 天版第二天赶早船上岛。
- 决策: 台湾文首必须写清 2026 年旅游签注暂停，否「两证一签就能走」的过时口径。

## 阻塞 / 待确认
- 阻塞: GitHub 推送依赖本机代理 `127.0.0.1:7890`；未开代理会超时。
- 自主边界: 可自主提交本轮内容并推 main；做 force push / 改 gitconfig / 换远程 URL 前必须先问。

## 环境
- env: 项目 `F:\Private\claude_code\daisy\travel` ｜ 启动: `npm run dev` ｜ 测试: `npm test`
- 推送身份: HumbleF（`commit-github` alias，见 `F:\Private\claude_code\daisy\.gitconfig`）
- 技能: `F:\Private\claude_code\daisy\Skills\handoff\SKILL.md`、`F:\Private\claude_code\daisy\Skills\push-git\SKILL.md`

## 续接 prompt（可直接粘贴给新会话）
> 你正在接手旅行手册站点。当前状态见 HANDOFF.md，请先按「从这里开始」验证，再从「下一步」开工；注意本仓 remote 是 origin→GitHub、分支 main，推送需代理。

---
背景与决策沿革见 ITERATIONS.md
