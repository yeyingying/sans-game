# Sans 割草项目交接文档

最后核对日期：2026-07-26
功能基线：塔防模式 Phase 2（TD 版天意侵蚀Sans + 塔防无尽轮，见 `git log` 最新提交；Phase 1 基线为 `ae4d394`）
仓库：`https://github.com/yeyingying/sans-game.git`  
主分支：`main`

> 本文是新 Codex、Claude 或开发者接手时的当前入口。Codex 会读取 `AGENTS.md`；Claude Code 会通过 `CLAUDE.md` 导入本文件和项目规则。根目录旧文件 `交接总结.md` 记录了历史过程，包含已完成、已撤销和过期状态，不能替代本文。

## 1. 一句话说明

这是一个原生 JavaScript Canvas 制作的 Undertale / Sans 主题网页割草游戏：玩家进行约 5 分钟的局内构筑，挑战两阶段 Boss「天意侵蚀Sans」，然后选择离开进入通关榜，或继续参加 90 秒一轮的无尽审判。

主要受众是初中生到大学生的 Undertale 与 B 站社区玩家。手机横屏不是兼容模式，而是正式体验。

## 2. 产品原则

权威产品说明见 `PRODUCT.md`，执行时重点遵守：

- 界面简洁、两秒内能理解，文字不堆叠。
- 危险必须先能读懂，再考验操作；预警与碰撞范围一致。
- 每个高潮只有一个视觉焦点，避免满屏同质光柱和模糊光效。
- 局内构筑提供变化，永久成长提供方向，每日挑战保持同一起跑线。
- 不引入暗黑式复杂背包、随机词条垃圾管理、耐久、洗词条或强化失败。
- 未成年人隐私优先；昵称与后台不得暴露联系方式、完整 IP 或自由文本隐私。

## 3. 当前线上环境

| 项目 | 地址 / 状态 |
|---|---|
| 正式站 | `https://www.sansgecao.com` |
| API | `https://api.sansgecao.com` |
| 后台 | `https://api.sansgecao.com/admin` |
| GitHub | `https://github.com/yeyingying/sans-game` |
| 静态存储 | 阿里云 OSS 香港区，Bucket `sanssurvivor` |
| API 主机 | 香港服务器，经 Caddy 反代到 `127.0.0.1:3000` |
| API 入口 | `server/app.mjs` |
| 数据库 | SQLite；路径由 `DB_PATH` 决定，默认位于后端工作目录 |
| 生产 Node | Node 22，使用内置 `node:sqlite` |
| 排行榜赛季 | `server/core.mjs` 中 `SEASON = "s2"` |
| 遥测版本 | `src/main.js` 中 `GAME_VERSION = "s2-20260718"` |

玩家数据库、服务端环境变量和浏览器 Cookie 不在 Git 仓库中。

## 4. 当前已实现内容

### 核心玩法

- 6 个角色，每个角色 8 把武器，共 48 把。
- 每把武器有五阶成长、专属强化和进化路线。
- 角色：传说之下、因果报应、恐惧传说、困难模式、精神错乱、黑客结局。
- 精神错乱为 10000G 买断；黑客结局为 15000G 且需要地狱通关。
- 15 秒三选一、刷新、装备掉落、连杀、金币、局外商店、称号、任务和回响。
- 4 档难度：普通、狂暴、地狱、屠杀。
- 玩家生命硬上限 10000，攻速硬上限 50；回血卡最高可到每秒 10%，出现概率逐步递减。
- 标题页通过“选择模式”进入经典、每日或塔防；空格键仍可直接进入经典模式。

### 塔防 Phase 1 + Phase 2

- 最多选择 3 名 Sans，每名携带 1 把适合站桩的武器，沿随机走廊守住左侧入口。
- 怪物、武器、选卡、经验和结算复用现有系统；入口初始 100 HP，破门后无法回血，再漏一只怪即失败。
- 塔防不申请排行榜 run、不上传匿名 run 报告，成绩只保存在当前浏览器的 `best_td`（无尽独立键 `best_endless_td` / `best_endless_round_td`）。
- Phase 2（2026-07-26 上线）：TD 版天意侵蚀Sans 是走路径的特殊怪（不用 `boss.js` 决斗剧本）——5:00 从走廊右端进场，血量按全塔最近 30 秒的**有效伤害** DPS 标定（过量处决伤害不计入；`tdBossHp()` 夹在 9000~150 万）。TD 天意与经典天意共享 Boss 身份规则：控制免疫、删除镰刀按天意比例结算；每 2.5 秒打门 10 点。路线统一为约 42 秒行军预算，怪物速度按实际路径长度归一，手机、电脑与随机地图不再改变到门时间。美术为 sans 走图侵蚀红染（`TD_BOSS_FRAMES`），顶部复用无尽首领的独立血条。
- Boss 死亡＝竞技止血冻结阶段分 → `bossclear` 选择：离开＝通关结算；继续＝90 秒无尽审判轮。无尽首领（champion）在塔防中从走廊右端入轨压门，打门伤害节制为 `gateDmg`（12+2×轮）；轮内金币进「待结算」池，风险规则与经典一致；round 4+ 危险领域在塔防关闭。
- 隔离契约：TD 击败 Boss 不计入 `bossKills`、不推进难度解锁 `diffCleared`、不发 Boss 系称号（和平主义者/渡鸦/尘归尘）、不解锁 Boss 系回响（after/wd/dust）、不触发审判纪元章节、不写崩溃检查点；走廊绘制含流向箭头脉冲动画。
- TD 是多角色编队，因此总击杀与怪物图鉴照常累计，但不把整队击杀归到队长的角色专精、角色残响或角色击杀任务；结算构筑会列出实际放置塔的武器。TD 天意固定折算 50 击杀，只发一次经典 Boss 赏金，不叠加冠军 8G。
- 手机横屏编队页使用独立大尺寸布局：角色卡 6 列、技能卡 4×2、队伍卡和开始/返回按钮均按至少约 44 物理像素设计。键盘可用 Enter 进入模式页，方向键/Tab 遍历“角色→技能→队伍→开始”，Enter 添加或移除，Esc 逐层返回；Canvas 带可见焦点、快捷键说明和 `aria-live` 状态播报。
- 测试钩子 `window.__tdtest`（rushBoss/crushBoss/completeRound/healGate）只在 headless、localhost 或已通过 DEBUG 验证的浏览器开放；正式玩家页面为 `null`。headless normal 模式覆盖 编队→放塔→Boss→bossclear→无尽→撤离 全链。
- `mode: "td"` 尚未加入服务端遥测白名单；是否采集塔防平衡数据需单独裁决（裁决前塔防不发任何上报）。

### Boss 与无尽

- Boss 在 5:00 出现，提前 30 秒预警。
- Boss 两阶段目标时间约 36 秒 + 54 秒，生命池根据实际输出动态标定。
- Boss 技能包含可读预警、FIGHT / MERCY 转场、光炮安全通道和二阶段视觉语言。
- 首领出场有无敌窗口；无尽首领拥有「天意侵蚀·名字」前缀和独立血条。
- 击败 Boss 后：离开进入通关结算；继续进入无尽审判。
- 无尽每轮 90 秒；排行榜先比较完成轮数，再比较无尽分数。

### 图鉴与内容

- 怪物图鉴共 29 项：8 个基础怪、10 个命名精英、10 个无尽首领、天意侵蚀Sans。
- 回响共 25 条，包括主线、角色残响与真实验室内容。
- 中英文切换已覆盖核心 UI、排行榜、叙事、角色、武器和多数次级页面。
- 怪物贴图按文件名映射，渲染层统一脚底锚点、像素缩放、受击白闪，并保留普通 / 精英 / 首领体型与身份差异。

### 排行榜

- 通关榜：显示 Boss 通关阶段分，允许局外成长，属于养成榜。
- 无尽榜：先按轮数，再按无尽阶段分。
- 每日榜：固定普通难度、固定种子、免费角色轮换、禁局外强化、零复活、锁定 1×、禁访客与契约。
- 支持角色和难度筛选，显示当前玩家名次。
- 同一榜单每名玩家只占一个位置，取该筛选条件下最佳成绩。
- 进入无尽不会丢失通关榜成绩；服务端会分别写入 normal 与 endless 两条成绩。

### 在线身份与隐私

- 首次访问自动创建游客身份，无注册页。
- 身份使用 HttpOnly、Secure、SameSite=None Cookie，玩家看不到内部 UUID。
- 自动生成全局唯一的 Undertale / B 站社区风格昵称。
- 自定义昵称 2–8 字，首次可立即修改，此后每 7 天一次。
- 服务端过滤联系方式、辱骂、长数字以及“官方 / 管理员 / 客服 / 系统”等误导名。
- 玩家可生成一次性显示的恢复码，用于恢复排行榜身份。
- 后台记录掩码 IP、地域、运营商、设备与对局进度；不展示完整 IP。

### 管理后台

后台位于 `https://api.sansgecao.com/admin`，包含：

- 玩家、对局、成绩列表与搜索筛选。
- 真实玩家、有效玩家、测试账号、空游客分类。
- 角色使用信息、设备、地域、掩码网络信息。
- 标记测试账号、隐藏成绩、重置昵称。
- 永久删除玩家；事务同时删除玩家、对局和成绩。
- 清理无对局空游客。
- 难度漏斗：开局 → 到达 Boss → Boss 战死亡 → 击败 → 进入无尽 → 完成轮数。
- 按版本、日期、角色、难度、设备和首次 / 全部尝试筛选。

后台密码只存在服务器环境变量中。不要在文档、源码或聊天中写入明文。

## 5. DEBUG 与排行榜隔离

标题页菜单内有红色 `DEBUG` 入口。正确 DEBUG 码会在当前浏览器解锁：

- 全部怪物、武器与进化图鉴。
- 全部回响。
- 全部角色。
- 全部难度。

规则：

- 客户端只保存 DEBUG 码的 SHA-256 摘要，不保存明文。
- 一旦启用，`debugUnlocked=1` 持久化到该浏览器。
- 该浏览器之后的所有对局都设置 `debug: true`，排行榜客户端不会申请正式 run。
- `?boss`、`?boss=weak`、`?evolve`、`?chest` 同样属于调试局。
- 恢复干净竞技环境需要清除该站点浏览器数据；不能只删调试标志后继续使用已解锁存档冲榜。

不要在交接文档中记录 DEBUG 码明文；由项目所有者单独提供。

## 6. 技术架构

前端没有框架和打包器，浏览器直接加载 ES Modules。

| 文件 / 目录 | 职责 |
|---|---|
| `index.html`, `style.css` | Canvas 容器、视口、横屏与页面样式 |
| `src/main.js` | 主状态机、循环、结算、无尽、每日、BGM、DEBUG、遥测编排 |
| `src/ui.js` | 全部 Canvas UI、桌面 / 触屏双档布局 |
| `src/weapon.js` | 角色、48 把武器、品阶、进化和技能状态机 |
| `src/entities.js` | Player、Enemy、投射物、伤害、硬上限、控制状态 |
| `src/boss.js` | 天意侵蚀Sans 两阶段战斗与表现 |
| `src/spawner.js` | 普通怪、精英、无尽轮次生成和金币衰减 |
| `src/codex.js` | 怪物、命名精英、无尽首领的唯一身份数据源 |
| `src/echo.js`, `src/narrative.js` | 回响、剧情、死亡台词、提示与社区文案 |
| `src/meta.js` | 金币、商店、难度、统计、任务、外观、本地检查点 |
| `src/leaderboard.js` | 游客身份、run、检查点、结算、排行榜 Canvas UI |
| `src/td.js` | 塔防随机地图、路径、入口、编队、放置与专属 UI |
| `src/dialog.js` | 可输入中文的 UT 风格 DOM 对话框 |
| `src/i18n.js` | `t()` 双语字符串和 `pick()` 数据字段选择 |
| `src/sprites.js`, `src/champion_sprites.js` | 像素图标、角色、怪物和无尽首领资源 |
| `deploy/` | 与生产静态文件完全一致的上传镜像 |
| `server/app.mjs` | 正式 HTTP API 路由与 SQLite 初始化 / 迁移 |
| `server/core.mjs` | 昵称、赛季、评分、签名与反作弊纯函数 |
| `server/admin.mjs` | 后台页面、统计、删除与测试账号管理 |
| `server/geo.mjs` | IP 掩码、设备、地域与运营商解析 |
| `.github/workflows/deploy.yml` | 自动测试、OSS / Caddy / API 同提交部署 |

`server/server.mjs` 是历史 health 服务，不是生产入口。

## 7. 排行榜与反作弊契约

正式 run 流程：

1. `GET /v1/me` 自动建立或恢复游客身份。
2. `POST /v1/runs` 申请 `runId` 与一次性 token。
3. 约每 30 秒提交 elapsed / kills / rounds 检查点。
4. Boss 通关时先提交 `/stage-clear`，保证进入无尽后仍有通关榜成绩。
5. 结算提交阶段组成，服务端使用同一公式重算分数。
6. 每个 run 只能结算一次；回滚、异常击杀 / 轮数、过快时间和高频提交会被拒绝。
7. 每局通过 `/report` 写一次匿名白名单遥测，供难度漏斗和平衡分析使用。

当前评分公式定义在 `server/core.mjs`，客户端必须保持一致：

```text
floor((kills * 5 + floor(elapsed) * 2.5)
      * difficulty.scoreMult
      * (silenceContract ? 1.35 : 1))
```

难度倍率：普通 1、狂暴 1.8、地狱 3、屠杀 4.5。

如修改评分、Boss 时间、角色强度或会显著改变榜单格局：

- 先判断是否需要更新 `GAME_VERSION`。
- 再判断是否需要更新 `SEASON`。
- 同步客户端与服务端测试期望。
- 不要仅改一端。

## 8. 部署流程

权威说明见 `docs/automatic-deploy.md`。

推送 `main` 后，GitHub Actions 自动：

1. 使用 Node 22 安装后端依赖。
2. 跑完整回归。
3. 检查 `src/` 与 `deploy/src/`、入口文件镜像一致。
4. 生成同一 Git 提交的部署清单。
5. 同步 `deploy/` 到香港 OSS。
6. 通过 SSH 同步 Caddy 静态目录和 `/opt/sansgecao-api/`。
7. 重启 `sansgecao-api` 服务。
8. 验证 OSS、Caddy 和 API `/health` 暴露同一 commit。

不要默认手工上传 OSS。自动部署失败时应先查看 Actions 日志并修复根因。

GitHub Actions 中已经配置的名称：

- Secrets：`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`DEPLOY_SSH_KEY`、`DEPLOY_KNOWN_HOSTS`
- Variables：`DEPLOY_HOST`、`DEPLOY_USER`

只记录名称，不读取、不复制、不打印值。

## 9. 静态文件同步与缓存

任何 `src/` 修改必须同步到 `deploy/src/`。任何根静态资源如 MP3、图片也要在 `deploy/` 有同名文件。

提交前运行：

```bash
node scripts/check-deploy-sync.mjs
```

修改入口模块或缓存敏感资源后，更新 `index.html` 中 `src/main.js?v=...`。如果修改了被浏览器长期缓存的依赖，也给对应 import 增加或更新版本参数。

## 10. 完整测试清单

功能提交前必须运行：

```bash
node test/headless.mjs
node test/headless.mjs boss
node test/headless.mjs clear
node test/weapons_smoke.mjs
node test/td_balance.mjs
node test/leaderboard.mjs
node server/test.mjs
node scripts/check-deploy-sync.mjs
git diff --check
```

测试职责：

- `headless.mjs`：正常流程、UI 路径、Boss、通关 / 无尽结算、元进度。
- `weapons_smoke.mjs`：48 把武器四档行为与 Boss-only 伤害契约。
- `td_balance.mjs`：过量伤害、TD 天意身份、百分比武器、跨屏路线时间、Boss TTK 与破门预算。
- `leaderboard.mjs`：游客恢复、run 生命周期、Boss 通关双榜和调试禁传。
- `server/test.mjs`：评分、昵称、地域、后台、删除事务和难度漏斗。
- `check-deploy-sync.mjs`：源码与发布镜像逐字节一致。

文档-only 提交可以不跑耗时游戏回归，但必须运行同步检查和 `git diff --check`，并在交付说明中明确。

## 11. 开发规范与常见坑

- 新 UI 文案写 `t("中文", "English")`。
- 数据对象添加 `nameEn`、`descEn` 等字段，并用 `pick()` 读取。
- 不要声明局部变量 `t` 或 `pick`，会遮蔽 i18n 函数并造成间歇崩溃。
- 新按钮使用 `T(desktop, touch)`；不要用缩小桌面 UI 的方式适配手机。
- 布局文字应锚定相邻 rect，不要在触屏双档下硬编码固定 y。
- Boss 是手写对象；对全体敌人调用新方法时，应补齐 Boss 契约或使用可选链。
- 新敌人攻击入口必须尊重 `cannotAttack` / 缴械状态。
- 每日挑战必须继续屏蔽所有局外强化、整备、复活、访客和契约。
- 排行榜中文角色名要与 `src/weapon.js` 保持一致。
- `deploy/` 不是旧备份，而是正式发布镜像，不能忽略。

## 12. Git 工作方式

开始工作：

```bash
git status --short
git log -1 --oneline
git pull --ff-only
```

规则：

- 工作区可能有用户或另一个 AI 的并行改动，不能回退或顺手提交不属于本任务的文件。
- 禁止 force push、破坏性 reset 和未经确认的 rebase。
- 一个任务使用独立提交，提交信息说明用户可见结果。
- 推送后等待 Actions 成功，再用：

```bash
node scripts/verify-public.mjs <full-commit-sha>
```

验证正式网，不要只看 GitHub push 成功。

## 13. 新电脑 / 新 AI 接手步骤

环境要求：Git、Node 22、可访问 GitHub 的 Codex 或 Claude。

```bash
git clone https://github.com/yeyingying/sans-game.git
cd sans-game
git switch main
git pull --ff-only
node test/headless.mjs
node test/headless.mjs boss
node test/headless.mjs clear
node test/weapons_smoke.mjs
node test/leaderboard.mjs
node server/test.mjs
node scripts/check-deploy-sync.mjs
```

Codex 打开仓库后会自动发现 `AGENTS.md`；Claude Code 会自动发现根目录 `CLAUDE.md`，后者再导入 `AGENTS.md`、`PRODUCT.md` 和本文。仍建议用下面的第一条消息确认接手范围：

```text
继续 Sans 割草游戏。先完整阅读 AGENTS.md、PRODUCT.md 和 docs/HANDOFF.md，
再检查 git status、最新提交和与任务相关的代码。不要回退已有改动；
完成后跑交接文档规定的完整测试，独立提交、推送 main，等待自动部署并验证公网。
```

新的 Codex / Claude 账号不会自动拥有旧对话上下文。以仓库文档和当前代码为准，不要要求模型凭记忆猜测。

## 14. 不随 Git 转移的内容

- Codex / Claude 的旧聊天和账号记忆。
- 浏览器匿名玩家 Cookie、排行榜身份和本地存档。
- DEBUG 状态与站点 localStorage。
- 阿里云、GitHub、后台的登录状态。
- GitHub Actions Secrets 的值。
- 服务器 SQLite 玩家数据库。
- 工作区外且未提交的临时附件。

如果只更换开发电脑但继续使用同一 GitHub 仓库，无需把 OSS 或 SSH 私钥下载到新电脑；有 push 权限即可继续触发自动部署。

## 15. 现有设计文档

- `PRODUCT.md`：当前产品原则，优先级最高。
- `docs/automatic-deploy.md`：当前自动部署说明。
- `docs/art-ui-ux-backlog.md`：美术与 UI/UX 审计和历史待办，实施前需重新核对现状。
- `docs/insanity-design.md`：精神错乱角色设计来源与历史数值草案；代码是最终状态。
- `docs/hacker-design.md`：黑客结局角色设计来源与历史数值草案；代码是最终状态。
- `docs/monster-wave-next.md`：冻结设计稿，不代表已获准立即实现。
- `docs/copy-audit.md`、`docs/icon-gap-checklist.md`：历史审计清单，许多项目已完成，动手前先查代码。
- `交接总结.md`：长历史记录，存在过期路径、数量和“待部署”描述，只用于追溯决策。

## 16. 接手原则

1. 代码和测试比旧聊天可靠。
2. `PRODUCT.md` 决定产品方向，`AGENTS.md` 决定工作方式，本文说明当前系统。
3. 任何平衡改动先说明玩家问题、目标指标和排行榜影响。
4. 优先修真实 bug、手机可用性和信息表达，再新增系统。
5. 涉及密码、云凭据、玩家数据或外部发布时，先确认权限与影响范围。
