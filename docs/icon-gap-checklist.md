# 图标缺口与残留符号清单(供 Codex 1a 收尾对照)

> Claude 2026-07-13 凌晨扫描工作区 WIP 所得。此时 sprites.js ICONS 已有 22 个图标,
> 本清单 = backlog 第 1 项要求 vs 现状的差集 + 全部残留系统符号调用点。
> 行号基于当时 WIP,提交后可能漂移,按符号 rg 即可重新定位。

## 一、ICONS 已有(22 个,勿重复做)

coin lock pie hotdog tip quest weapon flower save daily leaderboard
edit copy skull relic awakening heart shop codex magnet speed attack

## 二、backlog 点名但还缺的 4 个 key

| key | 用途 | 现状 |
|---|---|---|
| `chest` | 宝箱(HUD 计数、开箱演出、结算新发现) | 无 |
| `refresh` | 选卡刷新按钮 | 无 |
| `pact` | 审判契约 | 现用 ⚖ 共 7 处 |
| `difficulty` | 难度标记(选人页/结算) | 无 |

## 三、残留符号 → 建议 key(按调用密度排序)

| 符号 | 处数 | 建议 | 主要调用点 |
|---|---|---|---|
| ★ | 15 | `star`(新纪录/称号/精英击败/五连) | main.js 3706/3859/5381/5841/5941-5993, leaderboard.js 356, weapon.js 789 |
| ⚖ | 7 | `pact`(见上) | ui.js 332, main.js 1642/1791/5304/5317/5946 |
| ⓖ | 3 | 行内金币——见"待决策" | ui.js 863, main.js 5295/5309 |
| ✦ | 5 | 复用 `daily`(✦每日挑战 尚未换) | main.js 1528/5313/6000, 5841(三连奖) |
| ☰ | 5 | `menu` | ui.js 241/250/748, main.js 1698 |
| ⚠ | 4 | `warn` | main.js 1222/3284/5954, leaderboard.js 56 |
| 📤📥 | 3 | `share` / `import` | ui.js 390, main.js 5564/5565 |
| 🏠 | 1 | `home` | ui.js 371 |
| ❚❚ / ▶ | 2 | `pause` / `play` | ui.js 32 |
| ✚ / ✖ | 2 | `up` / `down`(结算涨跌计数) | ui.js 349/351 |
| ✳ | 1 | 精英警示标——可复用 `warn` 或 `skull` | main.js 5061 |
| ✓ / ✗ | 3 | `done` / `undone`(悬赏进度) | meta.js 586, ui.js 612 |
| 📱 | 1 | DOM 横屏提示,不在 canvas——CSS 内嵌 SVG 或纯文字即可 | index.html 19 |

**可保留不换**:→(33 处,数值前后对比连接符,等宽字体下跨平台稳定)、▼▸▴▾←↑↓↻(折叠箭头/方向键,几何字形漂移小)。①②③④(main.js 教程步骤)漂移小,P2 再说。

## 四、待决策(Codex 定,或留给各自批次)

1. **行内图标**:「本轮待结算 ⓖ 123」这类符号嵌在句子中间,drawIconLabel 只支持
   图标+整段文字。要么加一个 `drawInlineIcon(ctx, icon, x, y)` 由调用方拼接,
   要么改文案把数字挪到句尾。Claude 倾向后者(顺手满足文字预算)。
2. **换点归属**:main.js 结算/商店区域的 ★⚖✦ 调用点在 Claude 的后续批次里换
   (key 存在即可);ui.js/HUD/宝箱/leaderboard 的换点归 Codex。避免同函数互踩。

## 五、验收口径(来自 backlog 第 1 项)

- 16×16 与 24×24 两档;移除全部随系统变脸的字体符号(dingbat 也算);
- 图标只用调色板色,不引入新强调色;同屏最多三种强调色不因图标破功。
