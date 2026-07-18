# Sans 割草项目代理规则

开始任何任务前，先阅读：

1. `PRODUCT.md`：产品定位、受众与设计原则。
2. `docs/HANDOFF.md`：当前功能、架构、部署、测试与安全边界。
3. 与本次任务直接相关的设计文档，例如 `docs/hacker-design.md`。

## 项目边界

- 受众以初中生到大学生的 Undertale / B 站社区玩家为主，手机横屏是正式体验。
- 优先保证界面简洁、两秒内能理解、危险预警清楚、触控目标可点。
- 不自行增加复杂背包、随机词条、装备耐久、强化失败或大量常驻说明文字。
- 未经用户明确要求，不改已定稿的 Boss 数值、武器平衡、怪物美术、手机布局或正式文案。
- 不回退他人改动。开始前先运行 `git status --short` 和 `git log -1 --oneline`。

## 代码约定

- 前端为原生 ES Modules + Canvas，无构建步骤；生产运行时使用 Node 22。
- 新 UI 字符串使用 `t("中文", "English")`。
- 数据对象补 `nameEn` / `descEn` 等英文镜像，并通过 `pick()` 读取。
- 不要在使用 i18n 的作用域声明名为 `t` 或 `pick` 的局部变量。
- 新按钮使用 `T(desktop, touch)` 或现有触屏尺寸助手，手机触控目标不得退化。
- `server/app.mjs` 是正式后端入口；`server/server.mjs` 是旧 health 服务，不要部署或恢复为入口。
- 调试入口、DEBUG 解锁、`?boss`、`?boss=weak`、`?evolve`、`?chest` 的成绩绝不能上传排行榜。

## 静态发布镜像

修改以下文件后必须同步对应 `deploy/` 文件：

- `src/**` → `deploy/src/**`
- `index.html` → `deploy/index.html`
- `style.css` → `deploy/style.css`
- 新增的生产静态资源也必须放入 `deploy/`

修改入口模块或缓存敏感资源时，更新 `index.html` 的缓存版本参数。提交前必须运行：

```bash
node scripts/check-deploy-sync.mjs
```

## 必跑测试

每次功能修改完成后，至少运行完整生产回归：

```bash
node test/headless.mjs
node test/headless.mjs boss
node test/headless.mjs clear
node test/weapons_smoke.mjs
node test/leaderboard.mjs
node server/test.mjs
node scripts/check-deploy-sync.mjs
git diff --check
```

如果只做文档修改，可运行部署同步检查与 `git diff --check`，并在交付中说明未跑游戏回归的原因。

## Git 与部署

- 主分支为 `main`，远程为 `https://github.com/yeyingying/sans-game.git`。
- 不使用 force push、rebase 或破坏性 reset。
- 推送 `main` 会触发 `.github/workflows/deploy.yml`：测试、同步香港 OSS、Caddy 静态目录、API，并核验三端提交号。
- 正常情况下不要手工上传 OSS 或手工覆盖服务器目录。
- 部署完成后用 `node scripts/verify-public.mjs <commit-sha>` 验证公网版本。

## 安全与隐私

- 永远不要把阿里云 AccessKey、SSH 私钥、后台密码、SESSION_SECRET、恢复码或玩家完整 IP 写入仓库、日志、提交信息或聊天。
- GitHub Actions Secrets 只保留名称，不尝试读取或输出其值。
- 玩家以 HttpOnly Secure Cookie 识别；后台只展示掩码 IP、地域、设备和聚合对局信息。
- 删除玩家必须走后端事务逻辑，同时删除玩家、对局与成绩，不能只删 `players` 表。

## 交付要求

- 说明改了什么、测试结果、提交号、是否已部署及公网验证结果。
- 若发现文档与代码冲突，以当前代码和自动化测试为准，并同步修正文档。

