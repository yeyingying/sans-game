import { ICONS, drawIconLabel, drawPixelIcon } from "./sprites.js";
import { t, pick, currentLang } from "./i18n.js";

// 触屏设备: 触控目标放大到 ≥68 画布px(画布600高缩到手机≈390,≈44物理px);
// 桌面鼠标保持紧凑。?touch=1 可在桌面强制预览触屏布局
export const IS_TOUCH =
  (typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches) ||
  (typeof location !== "undefined" && /[?&]touch=1/.test(location.search));
const T = (desktop, touch) => (IS_TOUCH ? touch : desktop);

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function speedButtonRect(width) {
  return { x: width - T(92, 106), y: 56, w: T(76, 90), h: T(26, 44) };
}

export function pauseButtonRect(width) {
  const s = speedButtonRect(width);
  return { x: s.x - s.w - 8, y: s.y, w: s.w, h: s.h };
}

export function drawPauseButton(ctx, width, paused) {
  const btn = pauseButtonRect(width);
  ctx.save();
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#8fd6ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#8fd6ff";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  ctx.fillText(paused ? t("▶ 继续", "▶ Resume") : t("❚❚ 暂停", "❚❚ Pause"), btn.x + btn.w / 2, btn.y + btn.h / 2 + 5);
  ctx.restore();
}

// translucent floating joystick, drawn in screen space during play
export function drawJoystick(ctx, joy) {
  if (!joy) return;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#f2ead8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(joy.ox, joy.oy, 88, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#8fd6ff";
  ctx.beginPath();
  ctx.arc(joy.x, joy.y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSpeedButton(ctx, width, timeScale, locked = false) {
  const btn = speedButtonRect(width);
  ctx.save();
  ctx.fillStyle = locked ? "#1a1622" : "#241f2b";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = locked ? "#453f52" : timeScale > 1 ? "#ffd166" : "#5a5468";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = locked ? "#6b6578" : timeScale > 1 ? "#ffd166" : "#c8c2d4";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  // 每日锁1×: 明示锁定,不再是"按了没反应"的假按钮(2026-07-14 用户困惑)
  if (locked) drawIconLabel(ctx, ICONS.lock, "x1", btn.x + btn.w / 2, btn.y + btn.h / 2 + 5, 12, 4);
  else ctx.fillText(`▶▶ x${timeScale}`, btn.x + btn.w / 2, btn.y + btn.h / 2 + 5);
  ctx.restore();
}

// two volume rows on the pause screen: music (BGM) and sound effects
export function volumeMinusRect(width, height) {
  return { x: width / 2 - T(130, 146), y: height / 2 - T(26, 40), w: T(32, 48), h: T(26, 42) };
}

export function volumePlusRect(width, height) {
  return { x: width / 2 + 98, y: height / 2 - T(26, 40), w: T(32, 48), h: T(26, 42) };
}

export function sfxMinusRect(width, height) {
  return { x: width / 2 - T(130, 146), y: height / 2 + T(10, 12), w: T(32, 48), h: T(26, 42) };
}

export function sfxPlusRect(width, height) {
  return { x: width / 2 + 98, y: height / 2 + T(10, 12), w: T(32, 48), h: T(26, 42) };
}

function drawVolumeRow(ctx, width, minus, plus, label, volume) {
  ctx.textAlign = "center";
  for (const [btn, sign] of [
    [minus, "−"],
    [plus, "+"],
  ]) {
    ctx.fillStyle = "#241f2b";
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    ctx.strokeStyle = "#8fd6ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    ctx.fillStyle = "#8fd6ff";
    ctx.font = "bold 17px monospace";
    ctx.fillText(sign, btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
  }
  // label + bar between the buttons
  const barX = minus.x + minus.w + 74;
  const barW = plus.x - 10 - barX;
  const barY = minus.y + minus.h / 2 - 7;
  ctx.fillStyle = "#c8c2d4";
  ctx.font = "12px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`${label} ${Math.round(volume * 100)}%`, minus.x + minus.w + 8, barY + 11);
  ctx.textAlign = "center";
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(barX, barY, barW, 14);
  ctx.fillStyle = "#8fd6ff";
  ctx.fillRect(barX + 2, barY + 2, (barW - 4) * volume, 10);
  ctx.strokeStyle = "#5a5468";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, 14);
}

export function drawVolumeControl(ctx, width, height, volume, sfxVolume) {
  ctx.save();
  drawVolumeRow(ctx, width, volumeMinusRect(width, height), volumePlusRect(width, height), t("音乐", "Music"), volume);
  drawVolumeRow(ctx, width, sfxMinusRect(width, height), sfxPlusRect(width, height), t("音效", "SFX"), sfxVolume);
  ctx.restore();
}

export function resumeButtonRect(width, height) {
  return { x: width / 2 - T(80, 90), y: height / 2 + T(48, 64), w: T(160, 180), h: T(42, 54) };
}

export function drawResumeButton(ctx, width, height) {
  const btn = resumeButtonRect(width, height);
  ctx.save();
  ctx.fillStyle = "#1d2a1f";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#7cf28a";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#7cf28a";
  ctx.font = "bold 17px monospace";
  ctx.textAlign = "center";
  ctx.fillText(t("继 续", "Resume"), btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
  ctx.restore();
}

export function quitButtonRect(width, height) {
  return { x: width / 2 - T(80, 90), y: height / 2 + T(102, 126), w: T(160, 180), h: T(42, 54) };
}

export function drawQuitButton(ctx, width, height) {
  const btn = quitButtonRect(width, height);
  ctx.save();
  ctx.fillStyle = "#2e1d26";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ff5d73";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ff5d73";
  ctx.font = "bold 17px monospace";
  ctx.textAlign = "center";
  ctx.fillText(t("退 出", "Quit"), btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
  ctx.restore();
}


export function startButtonRect(width, height) {
  return { x: width / 2 - T(110, 120), y: height / 2 + 66, w: T(220, 240), h: T(52, 62) };
}

export function creditsButtonRect(width, height) {
  return { x: width - T(132, 148), y: height - T(52, 64), w: T(116, 132), h: T(34, 48) };
}

// 标题页静音开关(2026-07-13 用户点名:页面开着浏览器就一直有声)
export function muteButtonRect(width) {
  return { x: width - T(60, 74), y: 14, w: T(44, 58), h: T(36, 48) };
}

// 标题页语言切换(静音左侧): 中 ⇄ EN
export function langButtonRect(width) {
  const m = muteButtonRect(width);
  return { x: m.x - m.w - 8, y: m.y, w: m.w, h: m.h };
}

export function drawLangButton(ctx, width) {
  const b = langButtonRect(width);
  ctx.save();
  ctx.fillStyle = "#141a26";
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = "#8fd6ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = "#8fd6ff";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText(currentLang() === "zh" ? "EN" : "中", b.x + b.w / 2, b.y + b.h / 2 + 5);
  ctx.restore();
}

export function drawMuteButton(ctx, width, muted) {
  const b = muteButtonRect(width);
  ctx.save();
  ctx.fillStyle = "#141a26";
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = muted ? "#8d8798" : "#8fd6ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  // 像素小喇叭:箱体+两级锥口;静音时红色阶梯斜杠盖过
  const cx = b.x + 12;
  const cy = b.y + b.h / 2;
  ctx.fillStyle = muted ? "#8d8798" : "#8fd6ff";
  ctx.fillRect(cx, cy - 3, 5, 6);
  ctx.fillRect(cx + 5, cy - 5, 3, 10);
  ctx.fillRect(cx + 8, cy - 7, 3, 14);
  if (muted) {
    ctx.fillStyle = "#ff5d73";
    for (let i = 0; i < 7; i++) ctx.fillRect(cx - 2 + i * 3, cy + 5 - i * 2, 3, 3);
  } else {
    ctx.fillRect(cx + 13, cy - 4, 2, 8);
    ctx.fillRect(cx + 17, cy - 7, 2, 14);
  }
  ctx.restore();
}

export function backButtonRect(width, height) {
  return { x: 24, y: height - T(62, 72), w: T(120, 136), h: T(44, 54) };
}

export function drawBackButton(ctx, width, height) {
  const btn = backButtonRect(width, height);
  ctx.save();
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#8fd6ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#8fd6ff";
  ctx.font = "bold 17px monospace";
  ctx.textAlign = "center";
  ctx.fillText(t("← 返回", "← Back"), btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
  ctx.restore();
}

export function shopButtonRect(width, height) {
  return { x: 16, y: height - 52, w: 190, h: 34 };
}

export function drawTitleScreen(ctx, width, height, portraits, coins = 0, codexPct = 0, echoCount = "", questDone = "", giftLine = "", menuOpen = false, menuBadge = false) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.99)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  if (!menuOpen) {
    // 九格抽屉展开时标题让位,桌面与触屏都避免顶部管理项压字。
    ctx.fillStyle = "#7ea8ff";
    ctx.font = "bold 44px monospace";
    ctx.fillText(t("我做了一个Sans割草游戏.", "I made a Sans survivors game."), width / 2, height / 2 - 130);
  }

  // the cast, bottom-aligned on a common baseline under the title
  if (portraits && portraits.length) {
    ctx.imageSmoothingEnabled = false;
    const scale = 4;
    const gap = 34;
    const baseline = height / 2 + 30;
    const total = portraits.reduce((sum, p) => sum + p.width * scale, 0) + gap * (portraits.length - 1);
    let x = width / 2 - total / 2;
    portraits.forEach((p) => {
      ctx.drawImage(p, x, baseline - p.height * scale, p.width * scale, p.height * scale);
      x += p.width * scale + gap;
    });
  }

  const btn = startButtonRect(width, height);
  ctx.fillStyle = "#2e2748";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 22px monospace";
  // 2026-07-16 塔防上线: 主键改"选择模式",经典/每日/塔防三模式集中收纳
  ctx.fillText(t("选 择 模 式", "SELECT MODE"), width / 2, btn.y + btn.h / 2 + 8);

  // credits button, tucked into the bottom-right corner
  const cb = creditsButtonRect(width, height);
  ctx.fillStyle = "#1a1622";
  ctx.fillRect(cb.x, cb.y, cb.w, cb.h);
  ctx.strokeStyle = "#5a5468";
  ctx.lineWidth = 2;
  ctx.strokeRect(cb.x, cb.y, cb.w, cb.h);
  ctx.fillStyle = "#b9b2c9";
  ctx.font = "bold 14px monospace";
  ctx.fillText(t("制作名单", "Credits"), cb.x + cb.w / 2, cb.y + cb.h / 2 + 5);

  // collapsed drawer: ☰ 菜单 holds shop/codex/echoes/quests
  const mb = menuButtonRect(width, height);
  ctx.fillStyle = "#1d1828";
  ctx.fillRect(mb.x, mb.y, mb.w, mb.h);
  ctx.strokeStyle = menuOpen ? "#ffd166" : "#8fd6ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(mb.x, mb.y, mb.w, mb.h);
  ctx.fillStyle = menuOpen ? "#ffd166" : "#8fd6ff";
  ctx.font = "bold 14px monospace";
  drawIconLabel(ctx, ICONS.menu, menuOpen ? t("收起", "Close") : t("菜单", "Menu"), mb.x + mb.w / 2, mb.y + mb.h / 2 + 5, 14, 5);
  if (menuBadge && !menuOpen) {
    // gold dot: today's bounties aren't cleared yet
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(mb.x + mb.w - 8, mb.y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (menuOpen) {
    // grouped drawer: 成长(spend/earn) low near the thumb, 收藏(browse) above;
    // 排行榜 left the drawer — it is a primary button now. Header slots are
    // not clickable (main.js targets carry null at the same indices).
    const items = [
      { label: `${t("强化商店", "Upgrade Shop")} · ${coins}`, color: "#ffd166", icon: ICONS.shop },
      { label: `${t("悬赏", "Bounties")} ${questDone}`, color: "#ffd166", icon: ICONS.quest },
      { label: t("武器图鉴", "Weapon Codex"), color: "#c8c2d4", icon: ICONS.weapon },
      { label: t("成 长", "GROWTH"), header: true },
      { label: `${t("图鉴", "Codex")} ${codexPct}%`, color: "#7ea8ff", icon: ICONS.codex },
      { label: `${t("回响", "Echoes")} ${echoCount}`, color: "#6bd0ff", icon: ICONS.flower },
      { label: t("存档码", "Save Code"), color: "#8fd6ff", icon: ICONS.save },
      { label: "DEBUG", color: "#ff5d73", icon: ICONS.warn },
      { label: t("收 藏 / 管 理", "COLLECTION / ADMIN"), header: true },
    ];
    items.forEach((it, i) => {
      const r = titleMenuItemRect(i, width, height);
      if (it.header) {
        ctx.fillStyle = "#5a5468";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`— ${it.label} —`, r.x + 6, r.y + r.h - 8);
        ctx.textAlign = "center";
        return;
      }
      ctx.fillStyle = "rgba(20, 16, 30, 0.97)";
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = it.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = it.color;
      ctx.font = "bold 14px monospace";
      drawIconLabel(ctx, it.icon, it.label, r.x + r.w / 2, r.y + r.h / 2 + 6, 16, 6);
    });
  }

  // 每日挑战并入"选择模式"(2026-07-16)——标题页副键只剩排行榜
  const rb = leaderboardButtonRect(width, height);
  ctx.fillStyle = "#261b16";
  ctx.fillRect(rb.x, rb.y, rb.w, rb.h);
  ctx.strokeStyle = "#ff8a5d";
  ctx.lineWidth = 2;
  ctx.strokeRect(rb.x, rb.y, rb.w, rb.h);
  ctx.fillStyle = "#ff8a5d";
  ctx.font = "bold 15px monospace";
  drawIconLabel(ctx, ICONS.leaderboard, t("排行榜", "Ranking"), rb.x + rb.w / 2, rb.y + rb.h / 2 + 5, 16, 6);
  ctx.restore();
}

// 审判契约 chips on the weapon-select screen (blessing / price pairs)
export function contractChipRect(i, width, height) {
  const w = 214;
  const gap = 14;
  const total = 3 * w + 2 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - 142, w, h: 56 };
}

// contracts: [{name, up, down}]; selected -1 = 无契
export function drawContractChips(ctx, width, height, contracts, selected) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#d9c47a";
  ctx.font = "bold 13px monospace";
  drawIconLabel(
    ctx,
    ICONS.pact,
    selected < 0 ? "审判契约(可选):点击签订,再点解除 · 按 C 循环" : "已签契约——审判会记得你的选择",
    width / 2,
    height - 148,
    15,
    6
  );
  contracts.forEach((c, i) => {
    const box = contractChipRect(i, width, height);
    const on = i === selected;
    ctx.fillStyle = on ? "#2e2748" : "#161221";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = on ? "#ffd166" : "#3a2f4a";
    ctx.lineWidth = on ? 3 : 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = on ? "#ffd166" : "#c8c2d4";
    ctx.font = "bold 13px monospace";
    ctx.fillText(c.name, box.x + box.w / 2, box.y + 18);
    ctx.fillStyle = "#7cf28a";
    ctx.font = "10px monospace";
    ctx.fillText(`✚ ${c.up}`, box.x + box.w / 2, box.y + 35);
    ctx.fillStyle = "#ff8a8a";
    ctx.fillText(`✖ ${c.down}`, box.x + box.w / 2, box.y + 50);
  });
  ctx.restore();
}

export function homeButtonRect(width, height) {
  return { x: width - T(174, 186), y: height - T(62, 72), w: T(150, 162), h: T(44, 54) };
}

export function drawHomeButton(ctx, width, height) {
  const btn = homeButtonRect(width, height);
  ctx.save();
  ctx.fillStyle = "#141a26";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#8fd6ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#8fd6ff";
  ctx.font = "bold 15px monospace";
  ctx.textAlign = "center";
  drawIconLabel(ctx, ICONS.home, t("回主页", "Home"), btn.x + btn.w / 2, btn.y + btn.h / 2 + 6, 16, 6);
  ctx.restore();
}

export function shareButtonRect(width, height) {
  return { x: 24, y: height - T(62, 72), w: T(150, 162), h: T(44, 54) };
}

export function drawShareButton(ctx, width, height) {
  const btn = shareButtonRect(width, height);
  ctx.save();
  ctx.fillStyle = "#1f1a10";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 15px monospace";
  ctx.textAlign = "center";
  drawIconLabel(ctx, ICONS.share, t("分享战绩", "Share"), btn.x + btn.w / 2, btn.y + btn.h / 2 + 6, 16, 6);
  ctx.restore();
}

// ---- 武器图鉴 (weapon manual) ------------------------------------------------
export function bookCharPillRect(i, width, count = 4) {
  const gap = 10;
  const w = Math.min(150, Math.floor((width - 72 - gap * (count - 1)) / count));
  const total = count * w + (count - 1) * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: 64, w, h: T(30, 40) };
}

export function bookRowRect(i, width, height) {
  return { x: 20, y: 112 + i * 48, w: 340, h: 42 };
}

const TIER_FIELD_LABELS = {
  projectiles: "发数", count: "数量", spread: "散布", pierce: "穿透",
  dmgMult: "伤害", rateMult: "攻速", size: "尺寸", radius: "半径",
  spin: "转速", turn: "转向", bombs: "雷数", blast: "爆围",
  beams: "光束", duration: "持续", width: "宽度", targets: "目标",
  spikes: "骨刺", boomerangs: "镖数", smashes: "砸击", root: "禁锢",
  waves: "波数", bones: "骨数", boneSize: "骨长", healChance: "吸血",
  bonesPer: "每目标", chains: "锁链", lasers: "光线", dashes: "突刺",
  split: "裂变", ringBones: "环骨", shards: "碎片", rings: "环数",
  orbs: "光球", ring: "阵径",
};

// EN stat labels stay ≤7 chars so the 64px label column never clips
const TIER_FIELD_LABELS_EN = {
  projectiles: "Shots", count: "Count", spread: "Spread", pierce: "Pierce",
  dmgMult: "DMG", rateMult: "Rate", size: "Size", radius: "Radius",
  spin: "Spin", turn: "Turn", bombs: "Bombs", blast: "Blast",
  beams: "Beams", duration: "Time", width: "Width", targets: "Targets",
  spikes: "Spikes", boomerangs: "Rangs", smashes: "Smashes", root: "Root",
  waves: "Waves", bones: "Bones", boneSize: "BoneLen", healChance: "Leech",
  bonesPer: "Per tgt", chains: "Chains", lasers: "Lasers", dashes: "Dashes",
  split: "Split", ringBones: "R.Bones", shards: "Shards", rings: "Rings",
  orbs: "Orbs", ring: "Ring",
};

function tierFieldLabel(k) {
  return t(TIER_FIELD_LABELS[k] || k, TIER_FIELD_LABELS_EN[k] || TIER_FIELD_LABELS[k] || k);
}

function fmtTierVal(key, v) {
  if (v === undefined) return "—";
  if (key === "dmgMult" || key === "rateMult") return `×${v}`;
  if (key === "root" || key === "duration") return `${v}s`;
  if (key === "healChance") return `${Math.round(v * 100)}%`;
  return String(v);
}

// chars: [{name,color}], list: weapon defs of the active char
export function drawWeaponBook(ctx, width, height, chars, charIdx, list, selIdx) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 26px monospace";
  drawIconLabel(ctx, ICONS.weapon, t("武 器 图 鉴", "WEAPON CODEX"), width / 2, 40, 22, 8);

  chars.forEach((c, i) => {
    const r = bookCharPillRect(i, width, chars.length);
    const on = i === charIdx;
    ctx.fillStyle = on ? "#2e2748" : "#161221";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = on ? c.color : "#3a2f4a";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = on ? c.color : "#8d8798";
    ctx.font = "bold 13px monospace";
    ctx.font = "bold 13px monospace";
    while (parseInt(ctx.font) > 9 && ctx.measureText(pick(c, "name")).width > r.w - 10) ctx.font = `bold ${parseInt(ctx.font) - 1}px monospace`;
    ctx.fillText(pick(c, "name"), r.x + r.w / 2, r.y + r.h / 2 + 5);
  });

  // left: weapon list
  list.forEach((w, i) => {
    const r = bookRowRect(i, width, height);
    const on = i === selIdx;
    ctx.fillStyle = on ? "#2e2748" : "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = on ? w.color : "#3a2f4a";
    ctx.lineWidth = on ? 2 : 1;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = w.color;
    ctx.fillRect(r.x + 10, r.y + r.h / 2 - 6, 12, 12);
    ctx.textAlign = "left";
    ctx.fillStyle = on ? "#ffffff" : "#c8c2d4";
    ctx.font = "bold 13px monospace";
    ctx.fillText(pick(w, "name"), r.x + 32, r.y + 19);
    ctx.fillStyle = "#7d7690";
    ctx.font = "10px monospace";
    ctx.fillText(`[${pick(w, "tag")}]${w.support ? t(" · 辅助:仅局内获取", " · Support: in-run only") : ""}`, r.x + 32, r.y + 34);
    ctx.textAlign = "center";
  });

  // right: detail panel
  const w = list[selIdx];
  if (w) {
    const px = 380;
    const pw = width - px - 20;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(16, 13, 26, 0.9)";
    ctx.fillRect(px, 112, pw, height - 178);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px, 112, pw, height - 178);
    ctx.fillStyle = w.color;
    ctx.font = "bold 20px monospace";
    ctx.fillText(`${pick(w, "name")}  [${pick(w, "tag")}]`, px + 18, 140);
    ctx.fillStyle = "#c8c2d4";
    ctx.font = "12px monospace";
    ctx.fillText(pick(w, "desc"), px + 18, 162);

    // tier table: rows = fields, cols = Lv1..Lv5 (+ 觉醒 gold column)
    const keys = [];
    for (const tierObj of w.tiers) for (const k of Object.keys(tierObj)) if (!keys.includes(k)) keys.push(k); // 别叫 t——遮蔽 i18n
    const cols = 5 + (w.evolve ? 1 : 0);
    const colW = Math.min(74, Math.floor((pw - 90) / cols));
    const tx = px + 18;
    let ty = 192;
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "#9a93ab";
    ctx.fillText(t("属性", "Stat"), tx, ty);
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = "#9a93ab";
      ctx.fillText(`Lv${c + 1}`, tx + 64 + c * colW, ty);
    }
    if (w.evolve) {
      ctx.fillStyle = "#ffd166";
      ctx.fillText(t("觉醒", "Awaken"), tx + 64 + 5 * colW, ty);
    }
    ty += 8;
    ctx.strokeStyle = "#3a2f4a";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(px + pw - 18, ty);
    ctx.stroke();
    ty += 16;
    ctx.font = "11px monospace";
    for (const k of keys) {
      ctx.fillStyle = "#c8c2d4";
      ctx.fillText(tierFieldLabel(k), tx, ty);
      w.tiers.forEach((tierObj, c) => {
        ctx.fillStyle = "#e8e2d4";
        ctx.fillText(fmtTierVal(k, tierObj[k]), tx + 64 + c * colW, ty);
      });
      if (w.evolve) {
        const evoVal = w.evolve.tier[k] !== undefined ? w.evolve.tier[k] : w.tiers[4][k];
        ctx.fillStyle = "#ffd166";
        ctx.fillText(fmtTierVal(k, evoVal), tx + 64 + 5 * colW, ty);
      }
      ty += 17;
    }

    // enhance + evolve blurbs
    ty += 10;
    ctx.fillStyle = "#c59bff";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${t("专属强化", "Signature")}:${pick(w.enhance, "desc")}`, tx, ty);
    ty += 17;
    ctx.fillStyle = "#9a93ab";
    ctx.font = "11px monospace";
    ctx.fillText(`${t("叠层", "Stacking")}:${pick(w.enhance, "detail")}`, tx, ty);
    if (w.evolve) {
      ty += 22;
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 12px monospace";
      ctx.fillText(t(`觉醒:「${w.evolve.name}」— ${w.evolve.desc}`, `Awakened: '${pick(w.evolve, "name")}' — ${pick(w.evolve, "desc")}`), tx, ty);
      ty += 17;
      ctx.fillStyle = "#9a93ab";
      ctx.font = "11px monospace";
      ctx.fillText(t("条件:品阶升满 Lv5 且专属强化叠满 3 层 → 选卡出现金色进化卡", "How: reach Lv5 and stack the signature ×3 → a gold card appears"), tx, ty);
      // concrete deltas: only the stats the awakening actually changes
      const lv5 = w.tiers[4];
      const deltas = [];
      for (const dk of Object.keys(w.evolve.tier)) {
        if (w.evolve.tier[dk] !== lv5[dk]) {
          deltas.push(`${tierFieldLabel(dk)} ${fmtTierVal(dk, lv5[dk])}→${fmtTierVal(dk, w.evolve.tier[dk])}`);
        }
      }
      if (deltas.length) {
        ty += 17;
        ctx.fillStyle = "#ffd93d";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`${t("觉醒增幅", "Awaken gains")}:${deltas.join(" · ")}`, tx, ty);
      }
    }
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#7d7690";
  ctx.font = "11px monospace";
  ctx.fillText(t("←→ 切换角色 · ↑↓ 选武器 · Esc 返回", "←→ character · ↑↓ weapon · Esc back"), width / 2, height - 26);
  drawBackButton(ctx, width, height);
  ctx.restore();
}

export function menuButtonRect(width, height) {
  return { x: 16, y: height - T(52, 66), w: T(110, 130), h: T(34, 50) };
}

// drawer items stack upward from the menu button; the ninth slot still fits
// inside the 600px canvas on both desktop and the taller touch layout.
export function titleMenuItemRect(i, width, height) {
  const step = T(46, 56);
  return { x: 16, y: height - T(98, 124) - step * i, w: T(236, 252), h: T(40, 50) };
}

export function questButtonRect(width, height) {
  return { x: 656, y: height - 52, w: 120, h: 34 };
}

export function questRowRect(i, width, height) {
  const w = 620;
  return { x: width / 2 - w / 2, y: 140 + i * 92, w, h: 78 };
}

// quests: [{desc, progress, target, reward, done}]
export function drawQuestsScreen(ctx, width, height, quests) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  drawIconLabel(ctx, ICONS.quest, t("今 日 悬 赏", "DAILY BOUNTIES"), width / 2, 62, 24, 8);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "13px monospace";
  ctx.fillText(
    t("回声花的今日委托 · 进度跨局累计 · 完成即发金币 · 每天刷新", "Echo Flower's daily requests · progress carries across runs · pays out on completion · resets daily"),
    width / 2,
    92
  );
  quests.forEach((q, i) => {
    const box = questRowRect(i, width, height);
    ctx.fillStyle = q.done ? "#14241a" : "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = q.done ? "#7cf28a" : "#5a5468";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.textAlign = "left";
    ctx.fillStyle = q.done ? "#7cf28a" : "#f2ead8";
    ctx.font = "bold 15px monospace";
    ctx.fillText(`${q.done ? "✓ " : ""}${q.desc}`, box.x + 18, box.y + 28);
    const bw = box.w - 160;
    ctx.fillStyle = "#241f2b";
    ctx.fillRect(box.x + 18, box.y + 44, bw, 14);
    ctx.fillStyle = q.done ? "#7cf28a" : "#ffd166";
    ctx.fillRect(box.x + 20, box.y + 46, (bw - 4) * Math.min(1, q.progress / q.target), 10);
    ctx.strokeStyle = "#5a5468";
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 18, box.y + 44, bw, 14);
    ctx.textAlign = "right";
    ctx.fillStyle = "#c8c2d4";
    ctx.font = "12px monospace";
    ctx.fillText(`${Math.min(q.progress, q.target)}/${q.target}`, box.x + box.w - 96, box.y + 55);
    ctx.fillStyle = q.done ? "#7cf28a" : "#ffd166";
    ctx.font = "bold 14px monospace";
    if (q.done) {
      ctx.fillText(t("已入账", "Paid"), box.x + box.w - 18, box.y + 34);
    } else {
      const rewardText = String(q.reward);
      const tw = ctx.measureText(rewardText).width;
      drawPixelIcon(ctx, ICONS.coin, box.x + box.w - 24 - tw - 18, box.y + 18, 16);
      ctx.fillText(rewardText, box.x + box.w - 18, box.y + 34);
    }
  });
  ctx.textAlign = "center";
  drawBackButton(ctx, width, height);
  ctx.restore();
}

export function echoButtonRect(width, height) {
  return { x: 516, y: height - 52, w: 130, h: 34 };
}

// 回响花田: 8列×3行(23朵)——6列4行会溢出画布底并被返回按钮压住
export function echoFlowerRect(i, width, height) {
  const w = 106;
  const h = 124;
  const gap = 8;
  const col = i % 8;
  const row = Math.floor(i / 8);
  const total = 8 * w + 7 * gap;
  return { x: width / 2 - total / 2 + col * (w + gap), y: 112 + row * (h + gap), w, h };
}

// entries: [{title, hint, unlocked, bud, bloom, color}] — per-entry sprites so
// character echoes bloom in their own timeline's color
export function drawEchoField(ctx, width, height, entries, count) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 10, 18, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#6bd0ff";
  ctx.font = "bold 30px monospace";
  drawIconLabel(ctx, ICONS.flower, t("回 响", "ECHOES"), width / 2, 52, 24, 8);
  ctx.fillStyle = "#9ab8d0";
  ctx.font = "13px monospace";
  ctx.fillText(`审判廊的回声花,记得每一次轮回 · 已聆听 ${count}/${entries.length}`, width / 2, 82);
  ctx.imageSmoothingEnabled = false;
  entries.forEach((e, i) => {
    const box = echoFlowerRect(i, width, height);
    ctx.fillStyle = e.unlocked ? "#141c2c" : "#10131d";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = e.unlocked ? "#6bd0ff" : "#2c3346";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    const spr = e.unlocked ? e.bloom : e.bud;
    const size = e.unlocked ? 54 : 40;
    ctx.save();
    if (e.unlocked) {
      ctx.shadowColor = e.color || "#6bd0ff";
      ctx.shadowBlur = 12;
    } else {
      ctx.globalAlpha = 0.55;
    }
    ctx.drawImage(spr, box.x + box.w / 2 - size / 2, box.y + 68 - size, size, (spr.height / spr.width) * size);
    ctx.restore();
    const fitEcho = (text, cy, px) => {
      ctx.font = `${px >= 12 ? "bold " : ""}${px}px monospace`;
      while (px > 7 && ctx.measureText(text).width > box.w - 8) {
        px -= 1;
        ctx.font = `${px >= 12 ? "bold " : ""}${px}px monospace`;
      }
      ctx.fillText(text, box.x + box.w / 2, cy);
    };
    ctx.fillStyle = e.unlocked ? "#e8f4ff" : "#5c6478";
    fitEcho(e.unlocked ? `「${e.title}」` : "???", box.y + 92, 12);
    ctx.fillStyle = e.unlocked ? e.color || "#6bd0ff" : "#4a5164";
    fitEcho(e.unlocked ? t("点击聆听", "Tap to listen") : e.hint, box.y + 110, 9);
  });
  drawBackButton(ctx, width, height);
  ctx.restore();
}

// the Undertale dialogue box: black, thick white border, asterisk lines,
// typewriter-revealed text with the bloomed flower glowing beside it
export function drawEchoRead(ctx, width, height, echo, charsShown, bloomSprite) {
  ctx.save();
  ctx.fillStyle = "rgba(4, 5, 10, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#6bd0ff";
  ctx.font = "bold 22px monospace";
  ctx.fillText(`「${pick(echo, "title")}」`, width / 2, height / 2 - 158);
  // the flower listens with you
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.shadowColor = "#6bd0ff";
  ctx.shadowBlur = 18;
  ctx.drawImage(bloomSprite, width / 2 - 300, height / 2 - 96, 64, (bloomSprite.height / bloomSprite.width) * 64);
  ctx.restore();
  // UT dialogue box
  const bw = 560;
  const bh = 168;
  const bx = width / 2 - bw / 2 + 40;
  const by = height / 2 - 96;
  ctx.fillStyle = "#000000";
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = "#f2ead8";
  ctx.lineWidth = 4;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.textAlign = "left";
  ctx.fillStyle = "#f2ead8";
  ctx.font = "15px monospace";
  let remaining = charsShown;
  pick(echo, "lines").forEach((line, i) => {
    if (remaining <= 0) return;
    const shown = line.slice(0, Math.max(0, remaining));
    remaining -= line.length;
    ctx.fillText(shown, bx + 24, by + 34 + i * 32);
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#7d8698";
  ctx.font = "12px monospace";
  ctx.fillText(t("点击/Enter 继续 · Esc 返回花田", "Click/Enter to continue · Esc back to the field"), width / 2, by + bh + 34);
  ctx.restore();
}

export function codexButtonRect(width, height) {
  return { x: 216, y: height - 52, w: 110, h: 34 };
}

// 主键布局(2026-07-16 塔防批): [选择模式] 大键 + [排行榜] 独立副键居中;
// 每日挑战并入模式选择,dailyButtonRect 保留导出防旧引用但不再绘制
export function dailyButtonRect(width, height) {
  return { x: width / 2 - T(165, 172), y: height / 2 + T(132, 136), w: T(150, 162), h: T(40, 52) };
}

export function leaderboardButtonRect(width, height) {
  return { x: width / 2 - T(75, 81), y: height / 2 + T(132, 136), w: T(150, 162), h: T(40, 52) };
}

// ---- boss-clear choice screen ------------------------------------------------

export function bossClearLeaveRect(width, height) {
  return { x: width / 2 - 240, y: height / 2 + 42, w: 220, h: 58 };
}

export function bossClearContinueRect(width, height) {
  return { x: width / 2 + 20, y: height / 2 + 42, w: 220, h: 58 };
}

// selected: 0 = leave with the loot, 1 = keep fighting (endless)
export function drawBossClearScreen(ctx, width, height, selected) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.82)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 40px monospace";
  ctx.fillText(t("审 判 结 束", "JUDGEMENT OVER"), width / 2, height / 2 - 96);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "16px monospace";
  ctx.fillText(t("你击败了天意侵蚀Sans", "You defeated Corrupted Sans"), width / 2, height / 2 - 58);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "13px monospace";

  const buttons = [
    { rect: bossClearLeaveRect(width, height), label: t("带着战利品离开", "Leave with the spoils"), color: "#7cf28a" },
    { rect: bossClearContinueRect(width, height), label: t("继续接受审判", "Face the judgement"), color: "#ff8a5d" },
  ];
  buttons.forEach((b, i) => {
    const active = i === selected;
    ctx.fillStyle = active ? "#2e2748" : "#1d1828";
    ctx.fillRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h);
    ctx.strokeStyle = active ? b.color : "#5a5468";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h);
    ctx.fillStyle = active ? b.color : "#c8c2d4";
    ctx.font = "bold 18px monospace";
    ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + 36);
    if (active) {
      ctx.font = "bold 16px monospace";
      ctx.fillText("▼", b.rect.x + b.rect.w / 2, b.rect.y - 10);
    }
  });

  ctx.fillStyle = "#d9c47a";
  ctx.font = "12px monospace";
  ctx.fillText(t("※ 无尽模式的金币收益会逐渐衰减", "※ Endless coin yield decays round by round"), width / 2, height / 2 + 128);
  ctx.restore();
}

// daily-challenge intro/lobby: explains the mode before the run starts
export function drawDailyIntro(ctx, width, height, info, selected) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#c59bff";
  ctx.font = "bold 34px monospace";
  ctx.fillText("\u2726 \u6bcf \u65e5 \u6311 \u6218", width / 2, height / 2 - 156);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(`${info.date} \u00b7 \u4eca\u65e5\u89d2\u8272\uff1a${info.charName}\uff08\u6bcf\u5929\u8f6e\u6362\uff0c\u4e0d\u53ef\u66f4\u6362\uff09`, width / 2, height / 2 - 118);
  ctx.fillStyle = "#b9b2c9";
  ctx.font = "13px monospace";
  ctx.fillText("\u4eca\u5929\u5168\u4e16\u754c\u73a9\u5bb6\u9762\u5bf9\u540c\u4e00\u5c40\uff1a\u602a\u7269\u3001\u5f3a\u5316\u5361\u3001\u6389\u843d\u5168\u90e8\u76f8\u540c", width / 2, height / 2 - 88);
  ctx.fillText("\u6ca1\u6709\u8fd0\u6c14\u5dee\u5f02\u2014\u2014\u6bd4\u7684\u5c31\u662f\u64cd\u4f5c\u548c\u6784\u7b51\u51b3\u7b56", width / 2, height / 2 - 66);
  ctx.fillText("\u53ef\u65e0\u9650\u91cd\u8bd5\uff0c\u53ea\u8bb0\u4eca\u5929\u7684\u6700\u9ad8\u5206\uff1b\u91d1\u5e01\u7167\u5e38\u83b7\u5f97", width / 2, height / 2 - 44);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 15px monospace";
  ctx.fillText(info.best > 0 ? `\u4eca\u65e5\u6700\u4f73\uff1a${info.best}` : "\u4eca\u5929\u8fd8\u6ca1\u6709\u6210\u7ee9\u2014\u2014\u6765\u521b\u9020\u5b83", width / 2, height / 2 - 8);
  const buttons = [
    { rect: bossClearLeaveRect(width, height), label: "\u2190 \u8fd4\u56de", color: "#8fd6ff" },
    { rect: bossClearContinueRect(width, height), label: "\u5f00\u59cb\u6311\u6218", color: "#c59bff" },
  ];
  buttons.forEach((b, i) => {
    const active = i === selected;
    ctx.fillStyle = active ? "#2e2748" : "#1d1828";
    ctx.fillRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h);
    ctx.strokeStyle = active ? b.color : "#5a5468";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h);
    ctx.fillStyle = active ? b.color : "#c8c2d4";
    ctx.font = "bold 18px monospace";
    ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + 36);
    if (active) ctx.fillText("\u25bc", b.rect.x + b.rect.w / 2, b.rect.y - 10);
  });
  ctx.fillStyle = "#9a93ab";
  ctx.font = "12px monospace";
  ctx.fillText("\u2190\u2192 \u9009\u62e9 \u00b7 Enter/\u7a7a\u683c \u786e\u8ba4 \u00b7 Esc \u8fd4\u56de", width / 2, height / 2 + 130);
  ctx.restore();
}

// round-clear screen reuses the same two button slots (leave / continue)
export function drawRoundClearScreen(ctx, width, height, round, selected, pendingCoins) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.82)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ff8a5d";
  ctx.font = "bold 36px monospace";
  ctx.fillText(`第 ${round} 轮审判完成`, width / 2, height / 2 - 96);
  ctx.fillStyle = "#ffd166";
  ctx.font = "15px monospace";
  ctx.fillText(`本轮待结算金币 ⓖ ${pendingCoins} —— 选择后保住`, width / 2, height / 2 - 60);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "13px monospace";

  const buttons = [
    { rect: bossClearLeaveRect(width, height), label: t("撤离并结算", "Extract & settle"), color: "#7cf28a" },
    { rect: bossClearContinueRect(width, height), label: t("进入下一轮", "Next round"), color: "#ff8a5d" },
  ];
  buttons.forEach((b, i) => {
    const active = i === selected;
    ctx.fillStyle = active ? "#2e2748" : "#1d1828";
    ctx.fillRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h);
    ctx.strokeStyle = active ? b.color : "#5a5468";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h);
    ctx.fillStyle = active ? b.color : "#c8c2d4";
    ctx.font = "bold 18px monospace";
    ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + 36);
    if (active) {
      ctx.font = "bold 16px monospace";
      ctx.fillText("▼", b.rect.x + b.rect.w / 2, b.rect.y - 10);
    }
  });

  ctx.fillStyle = "#d9c47a";
  ctx.font = "12px monospace";
  ctx.fillText(t("※ 下一轮更危险：轮中死亡将丢失该轮待结算金币", "※ Deeper is deadlier: dying mid-round forfeits its pending coins"), width / 2, height / 2 + 128);
  ctx.restore();
}

// ---- codex / collection ------------------------------------------------------

export function codexEntryRect(i, width) {
  const gap = 9;
  const columns = 8;
  const w = Math.min(130, Math.floor((width - 92 - gap * (columns - 1)) / columns));
  const total = w * columns + gap * (columns - 1);
  return { x: width / 2 - total / 2 + (i % columns) * (w + gap), y: 78 + Math.floor(i / columns) * 84, w, h: 76 };
}

// 选人页的翻页箭头: 同图鉴尺寸,但放在副标题两侧(标题行让位)
export function charPageArrowRect(direction, width) {
  const b = codexPageRect(direction, width);
  return { ...b, y: 84 };
}

export function codexPageRect(direction, width) {
  const w = T(40, 52);
  const h = T(30, 44);
  return { x: width / 2 + (direction < 0 ? -176 - (w - 32) : 144), y: T(48, 42), w, h };
}

// Keep the index at a stable 8x2 on phone landscape. Later monster batches
// paginate instead of adding rows that would collide with the detail panel.
export function drawCodexScreen(ctx, width, height, monsters, bossKills, weaponRows, pct = 0, selected = 0) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 30px monospace";
  ctx.fillText(t("图 鉴", "CODEX"), width / 2, 46);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 13px monospace";
  const pageSize = 16;
  const pageCount = Math.max(1, Math.ceil(monsters.length / pageSize));
  const page = Math.min(pageCount - 1, Math.floor(selected / pageSize));
  const pageStart = page * pageSize;
  ctx.fillText(`收集度 ${pct}% · ${page + 1}/${pageCount}`, width / 2, 68);

  if (pageCount > 1) {
    for (const direction of [-1, 1]) {
      const b = codexPageRect(direction, width);
      ctx.fillStyle = "#211a2c";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#7ea8ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#f2ead8";
      ctx.font = "bold 18px monospace";
      ctx.fillText(direction < 0 ? "‹" : "›", b.x + b.w / 2, b.y + b.h / 2 + 6);
    }
  }

  monsters.slice(pageStart, pageStart + pageSize).forEach((m, localIndex) => {
    const i = pageStart + localIndex;
    const box = codexEntryRect(localIndex, width);
    const x = box.x;
    const y = box.y;
    const seen = m.kills > 0;
    const active = i === selected;
    ctx.fillStyle = active ? "#282037" : "#1d1828";
    ctx.fillRect(x, y, box.w, box.h);
    ctx.strokeStyle = active ? (seen ? m.color : "#6b6578") : seen ? (m.elite || m.boss ? m.color : "#5a5468") : "#2a2436";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(x, y, box.w, box.h);
    if (seen && m.sprite) {
      ctx.imageSmoothingEnabled = false;
      const s = 34;
      ctx.drawImage(m.sprite, x + box.w / 2 - s / 2, y + 7, s, s);
      if (m.elite || m.boss) {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = m.color;
        ctx.beginPath();
        ctx.arc(x + box.w / 2, y + 24, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = "#453f52";
      ctx.font = "bold 22px monospace";
      ctx.fillText("?", x + box.w / 2, y + 32);
    }
    ctx.fillStyle = m.ghost ? "#3a3346" : seen ? "#f2ead8" : "#453f52";
    ctx.font = "bold 12px monospace";
    ctx.fillText(m.ghost ? pick(m, "name") : seen ? pick(m, "name") : t("？？？", "???"), x + box.w / 2, y + 55);
    ctx.fillStyle = seen ? (m.elite || m.boss ? m.color : "#9a93ab") : "#3c3548";
    ctx.font = "10px monospace";
    const rank = m.boss || m.champion ? t("首领 · ", "Boss · ") : m.elite ? t("精英 · ", "Elite · ") : "";
    ctx.fillText(
      m.ghost ? "……" : seen ? `${rank}${t("击杀", "Kills")} ${m.kills}` : m.boss ? t("最终首领", "Final boss") : m.champion ? t("无尽首领", "Endless boss") : m.elite ? t("高难度精英", "High-tier elite") : t("尚未遭遇", "Not yet met"),
      x + box.w / 2,
      y + 69
    );
  });

  const chosen = monsters[Math.max(0, Math.min(selected, monsters.length - 1))];
  const seen = chosen && chosen.kills > 0;
  const detail = { x: width / 2 - Math.min(470, width / 2 - 48), y: 252, w: Math.min(940, width - 96), h: 148 };
  ctx.fillStyle = "#15111e";
  ctx.fillRect(detail.x, detail.y, detail.w, detail.h);
  ctx.strokeStyle = seen ? chosen.color : "#3a3346";
  ctx.lineWidth = 2;
  ctx.strokeRect(detail.x, detail.y, detail.w, detail.h);
  if (seen) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(chosen.sprite, detail.x + 26, detail.y + 25, 82, 82);
    ctx.textAlign = "left";
    ctx.fillStyle = chosen.color;
    ctx.font = "bold 18px monospace";
    // zh shows 中文名+英文名 side by side; EN mode would duplicate, so EN shows one
    ctx.fillText(t(`${chosen.name}  ${chosen.english}`, chosen.english), detail.x + 130, detail.y + 28);
    // 裂缝外批注: community graffiti pinned to the corner of the dossier
    if (chosen.note) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#6f8aa8";
      ctx.font = "11px monospace";
      ctx.fillText(t(`「${chosen.note}」——裂缝外`, `'${chosen.note}' — the rift`), detail.x + detail.w - 16, detail.y + 28);
      ctx.textAlign = "left";
    }
    ctx.fillStyle = "#9a93ab";
    ctx.font = "11px monospace";
    ctx.fillText(`${chosen.region} · ${chosen.title} · ${t("累计击杀", "Total kills")} ${chosen.kills}`, detail.x + 130, detail.y + 50);
    ctx.fillStyle = "#d8d1e2";
    ctx.font = "12px monospace";
    ctx.fillText(chosen.lore, detail.x + 130, detail.y + 78);
    ctx.fillStyle = chosen.color;
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${t("本作能力", "In-game power")}：${chosen.skill}`, detail.x + 130, detail.y + 108);
    if (chosen.elite || chosen.boss) {
      ctx.fillStyle = "#ffd166";
      ctx.font = "11px monospace";
      ctx.fillText(
        chosen.boss
          ? chosen.unlock
          : chosen.champion
            ? `${chosen.unlock} · ${t("第 11 轮起循环并继续强化", "loops from round 11, still scaling")}`
            : `${chosen.unlock} · ${t("屠杀难度进入处决态", "Executioner form on GENOCIDE")}`,
        detail.x + 130,
        detail.y + 132
      );
    }
    ctx.textAlign = "center";
  } else if (chosen?.ghost) {
    // the seventeenth record: here, and then not
    ctx.fillStyle = "#6b6578";
    ctx.font = "13px monospace";
    ctx.fillText(chosen.ghostLine, width / 2, detail.y + 68);
    ctx.fillStyle = "#453f52";
    ctx.font = "11px monospace";
    ctx.fillText(chosen.ghostSub, width / 2, detail.y + 94);
  } else {
    ctx.fillStyle = "#453f52";
    ctx.font = "bold 30px monospace";
    ctx.fillText("？", width / 2, detail.y + 52);
    ctx.font = "13px monospace";
    ctx.fillText(chosen?.elite || chosen?.boss ? chosen.unlock : t("在战斗中击败一次后解锁完整档案", "Defeat it once in battle to unlock the full dossier"), width / 2, detail.y + 86);
    ctx.fillStyle = "#6b6578";
    ctx.font = "11px monospace";
    ctx.fillText(t("怪物的名字、来历与能力仍被黑暗遮住", "Its name, story and powers are still hidden in the dark"), width / 2, detail.y + 112);
  }

  // ACT → 检查: the classic Check line, white text under the dossier
  if (seen && chosen.check) {
    ctx.fillStyle = "#f2ead8";
    ctx.font = "12px monospace";
    ctx.fillText(chosen.check, width / 2, detail.y + 162);
  }

  // Boss and weapon collection stay visible as compact completion summaries.
  const by = 432;
  ctx.fillStyle = bossKills > 0 ? "#ffd166" : "#453f52";
  ctx.font = "bold 12px monospace";
  drawIconLabel(
    ctx,
    ICONS.skull,
    bossKills > 0 ? t(`天意侵蚀Sans · 击败 ${bossKills} 次`, `Corrupted Sans · defeated ${bossKills}×`) : t("？？？（5:00 出现的存在）", "??? (the one who appears at 5:00)"),
    width / 2,
    by,
    16,
    6
  );

  ctx.font = "11px monospace";
  weaponRows.forEach((r, i) => {
    const y = by + 20 + i * 17;
    ctx.fillStyle = r.color;
    ctx.textAlign = "right";
    ctx.fillText(r.charName, width / 2 - 20, y);
    ctx.textAlign = "left";
    ctx.fillStyle = "#c8c2d4";
    ctx.fillText(`武器 ${r.used}/${r.total} · 进化 ${r.evolved}/${r.evoTotal}`, width / 2 - 4, y);
  });
  ctx.textAlign = "center";

  drawBackButton(ctx, width, height);
  ctx.restore();
}

// ---- permanent upgrade shop ------------------------------------------------

export function shopItemRect(i, width, height) {
  // two columns x five rows (第二梯队上架后 10 件正好填满)
  const w = 430;
  const h = 52;
  const gap = 8;
  const col = Math.floor(i / 5);
  const x = col === 0 ? width / 2 - w - 8 : width / 2 + 8;
  return { x, y: 120 + (i % 5) * (h + gap), w, h };
}

// tab pills: 0 = 能力升级, 1 = 灵魂加护 (cosmetics)
export function shopTabRect(i, width) {
  return { x: width / 2 - 190 + i * 200, y: 66, w: 180, h: 32 };
}

// cosmetics tab uses its own compact grid: 2 cols x 6 rows
export function cosmeticItemRect(i, width, height) {
  const w = 430;
  const h = 42;
  const gap = 7;
  const col = Math.floor(i / 6);
  const x = col === 0 ? width / 2 - w - 8 : width / 2 + 8;
  return { x, y: 122 + (i % 6) * (h + gap), w, h };
}

// 商店条目像素图标(美术批 backlog 第8项)
const SHOP_ICONS = {
  atk: "attack",
  hp: "heart",
  speed: "speed",
  magnet: "magnet",
  greed: "coin",
  reroll: "refresh",
  gear: "chest",
  crystal: "star",
  bulwark: "relic",
  reviveStock: "awakening",
};

// souls: [{id, name, color, desc, price, owned, equipped}]
export function drawShopScreen(ctx, width, height, items, coins, tab = 0, souls = [], infoLine = "", showCosmetics = true, flashId = null, powerIndex = null, powerPulse = null) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText(t("商 店", "S H O P"), width / 2, 46);
  for (const [i, label] of showCosmetics ? [[0, t("能力升级", "Upgrades")], [1, t("灵魂加护", "Soul Aegis")]] : []) {
    const r = shopTabRect(i, width);
    const active = tab === i;
    ctx.fillStyle = active ? "#2e2748" : "#181521";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = active ? "#ffd166" : "#453f52";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = active ? "#ffd166" : "#7d7690";
    ctx.font = "bold 14px monospace";
    ctx.fillText(label, r.x + r.w / 2, r.y + 21);
  }
  // 钱包 = 本页最高频决策输入,右上角大号常驻(不再和摘要挤一行)
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 20px monospace";
  const walletText = String(coins);
  ctx.fillText(walletText, width - 26, 48);
  drawPixelIcon(ctx, ICONS.coin, width - 26 - ctx.measureText(walletText).width - 24, 32, 18);
  // 战力指数 = 钱包的镜像位(左上):买战力件数字当场跳涨,
  // "花钱→变强"一眼闭环;+Δ 随脉冲放大后淡出
  if (tab === 0 && powerIndex !== null) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#c8c2d4";
    ctx.font = "bold 13px monospace";
    ctx.fillText(t("战力指数", "POWER INDEX"), 26, 34);
    const pulse = powerPulse ? Math.min(1, powerPulse.t / 1.4) : 0;
    ctx.fillStyle = pulse > 0 ? "#7cf28a" : "#f2ead8";
    ctx.font = `bold ${Math.round(20 + pulse * 5)}px monospace`;
    ctx.fillText(String(powerIndex), 26, 58);
    if (powerPulse) {
      ctx.globalAlpha = Math.min(1, powerPulse.t / 0.5);
      ctx.fillStyle = "#7cf28a";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`+${powerPulse.delta}`, 26 + ctx.measureText(String(powerIndex)).width + 46, 54);
      ctx.globalAlpha = 1;
    }
  }
  ctx.textAlign = "center";

  if (tab === 1) {
    ctx.fillStyle = "#9a93ab";
    ctx.font = "12px monospace";
    ctx.fillText(`${t("灵魂外观,不影响属性", "Cosmetic only, no stats")} · ${infoLine}`, width / 2, 112);
  }

  if (tab === 1) {
    for (let i = 0; i < souls.length; i++) {
      const c = souls[i];
      const box = cosmeticItemRect(i, width, height);
      const affordable = coins >= c.price;
      ctx.fillStyle = "#1d1828";
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = c.equipped ? "#ffffff" : c.owned || affordable ? c.color : "#5a5468";
      ctx.lineWidth = c.equipped ? 3 : 2;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      // soul heart swatch
      ctx.fillStyle = c.color;
      ctx.save();
      ctx.translate(box.x + 22, box.y + box.h / 2);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-6, -6, 12, 12); // rotated square reads as a pixel heart
      ctx.restore();
      ctx.textAlign = "left";
      ctx.fillStyle = c.color;
      ctx.font = "bold 14px monospace";
      ctx.fillText(pick(c, "name"), box.x + 42, box.y + 18);
      ctx.fillStyle = "#b9b2c9";
      ctx.font = "10px monospace";
      ctx.fillText(pick(c, "desc"), box.x + 42, box.y + 34);
      ctx.textAlign = "right";
      ctx.font = "bold 13px monospace";
      if (c.equipped) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(t("装备中 · 点击卸下", "Equipped · tap to remove"), box.x + box.w - 14, box.y + 20);
      } else if (c.owned) {
        ctx.fillStyle = "#7cf28a";
        ctx.fillText(t("已拥有 · 点击装备", "Owned · tap to equip"), box.x + box.w - 14, box.y + 20);
      } else {
        ctx.fillStyle = affordable ? "#ffd166" : "#6b6578";
        const priceText = String(c.price);
        const priceW = ctx.measureText(priceText).width;
        drawPixelIcon(ctx, ICONS.coin, box.x + box.w - 20 - priceW - 14, box.y + 7, 13);
        ctx.fillText(priceText, box.x + box.w - 14, box.y + 20);
        ctx.font = "10px monospace";
        ctx.fillStyle = affordable ? "#7d7690" : "#5a5468";
        ctx.fillText(affordable ? t("点击购买", "Tap to buy") : t("金币不足", "Not enough"), box.x + box.w - 14, box.y + 36);
      }
    }
    ctx.textAlign = "center";
    drawBackButton(ctx, width, height);
    ctx.restore();
    return;
  }

  // 双列列头: 分组即导购——想变强看左列,要舒服看右列
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#8d8798";
  const colHeadY = shopItemRect(0, width, height).y - 10;
  ctx.fillText(t("— 战 力 —", "— P O W E R —"), shopItemRect(0, width, height).x + 215, colHeadY);
  ctx.fillText(t("— 品 质 —", "— Q o L —"), shopItemRect(5, width, height).x + 215, colHeadY);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const box = shopItemRect(i, width, height);
    const affordable = it.cost !== null && coins >= it.cost;
    const flashing = flashId && it.id === flashId;
    // 锁定行整体压暗: 一眼分清"现在能碰的"和"以后再来的"
    ctx.fillStyle = it.gate ? "#141020" : "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = flashing ? "#7cf28a" : it.hot ? "#ffd93d" : it.cost === null ? "#453f52" : it.gate ? "#38304a" : affordable ? it.color : "#5a5468";
    ctx.lineWidth = flashing || it.hot ? 3 : 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.textAlign = "left";
    const icon = ICONS[SHOP_ICONS[it.id]];
    if (icon) drawPixelIcon(ctx, icon, box.x + 12, box.y + 10, 16);
    ctx.fillStyle = it.gate ? "#7d7690" : it.color;
    ctx.font = "bold 15px monospace";
    ctx.fillText(it.name, box.x + (icon ? 36 : 16), box.y + 22);
    // ★推荐: 和结算页"去变强"教练句同一决策模型,进店第一眼就有答案
    if (it.hot) {
      const tag = t("★推荐", "★BEST");
      ctx.font = "bold 11px monospace";
      const tagW = ctx.measureText(tag).width + 10;
      const tagX = box.x + (icon ? 36 : 16) + ctx.measureText(it.name).width + 26;
      ctx.fillStyle = "#3a3010";
      ctx.fillRect(tagX, box.y + 8, tagW, 16);
      ctx.strokeStyle = "#ffd93d";
      ctx.lineWidth = 1;
      ctx.strokeRect(tagX, box.y + 8, tagW, 16);
      ctx.fillStyle = "#ffd93d";
      ctx.fillText(tag, tagX + 5, box.y + 20);
    }
    // 购买瞬间数值行短闪绿色: 新数值就是反馈,不加弹窗;
    // 锁定行的这一行直接写解锁条件(信息前置,不用点了才知道)
    ctx.fillStyle = flashing ? "#7cf28a" : it.gate ? "#d9c47a" : "#b9b2c9";
    const descText = it.gate || it.desc;
    const descMax = box.w - 32 - (it.gate ? 20 : 78); // 让出右下角"点击购买"/锁的空间
    let descFont = 12;
    ctx.font = `${descFont}px monospace`;
    while (descFont > 9 && ctx.measureText(descText).width > descMax) {
      descFont -= 1;
      ctx.font = `${descFont}px monospace`;
    }
    ctx.fillText(descText, box.x + 16, box.y + 42);

    ctx.textAlign = "right";
    ctx.fillStyle = it.gate ? "#5a5468" : "#f2ead8";
    ctx.font = "bold 14px monospace";
    // level pips
    ctx.fillText(`${"■".repeat(it.lvl)}${"□".repeat(it.max - it.lvl)}`, box.x + box.w - 118, box.y + 22);
    ctx.fillStyle = it.cost === null ? "#7cf28a" : it.gate ? "#6b6578" : affordable ? "#ffd166" : "#6b6578";
    if (it.cost === null) {
      ctx.fillText(t("已满级", "MAX"), box.x + box.w - 16, box.y + 22);
    } else {
      const costText = String(it.cost);
      const costW = ctx.measureText(costText).width;
      drawPixelIcon(ctx, ICONS.coin, box.x + box.w - 22 - costW - 16, box.y + 8, 14);
      ctx.fillText(costText, box.x + box.w - 16, box.y + 22);
    }
    if (it.cost !== null) {
      // 统一状态语义: 可买/金币不足/锁图标(条件已在数值行,不再重复文字)
      ctx.fillStyle = it.gate ? "#d9c47a" : affordable ? "#7d7690" : "#5a5468";
      ctx.font = "11px monospace";
      if (it.gate) {
        drawPixelIcon(ctx, ICONS.lock, box.x + box.w - 27, box.y + 30, 11);
      } else {
        ctx.fillText(affordable ? t("点击购买", "Tap to buy") : t("金币不足", "Not enough"), box.x + box.w - 16, box.y + 42);
      }
    }
  }

  // 已生效摘要退居栅格下方: 是"账单"不是"决策",别占黄金位
  if (infoLine) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#7d7690";
    ctx.font = "11px monospace";
    ctx.fillText(infoLine, width / 2, shopItemRect(4, width, height).y + 52 + 24);
  }

  ctx.textAlign = "center";
  drawBackButton(ctx, width, height);
  ctx.restore();
}

export function charBoxRect(i, width, height, count = 2) {
  const gap = count >= 4 ? 22 : count >= 3 ? 40 : 60;
  const w = count >= 4 ? Math.min(260, Math.floor((width - 96 - gap * (count - 1)) / count)) : 240;
  const h = 300;
  const total = count * w + (count - 1) * gap;
  return { x: (width - total) / 2 + i * (w + gap), y: height / 2 - h / 2 - 20, w, h };
}

// difficulty pills on the character-select screen
export function diffPillRect(i, width, height) {
  const w = T(108, 116);
  const h = T(30, 44);
  const gap = 10;
  const total = 4 * w + 3 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - T(106, 124), w, h };
}

// diffs: [{name, active, locked, hint}]
function drawDifficultyRow(ctx, width, height, diffs) {
  ctx.save();
  ctx.textAlign = "center";
  const activeDiff = diffs.find((d) => d.active);
  if (!IS_TOUCH) {
    // 触屏不画提示行: 胶囊高亮已表达当前难度,腾出的间距给选中角色详情行
    ctx.fillStyle = "#9a93ab";
    ctx.font = "12px monospace";
    drawIconLabel(ctx, ICONS.difficulty, `${t("难度", "Difficulty")}：${activeDiff ? activeDiff.hint : ""}`, width / 2, diffPillRect(0, width, height).y - 10, 13, 5);
  }
  for (let i = 0; i < diffs.length; i++) {
    const d = diffs[i];
    const box = diffPillRect(i, width, height);
    ctx.fillStyle = d.active ? "#2e2748" : "#1a1622";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = d.locked ? "#453f52" : d.active ? "#ffd166" : "#5a5468";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = d.locked ? "#6b6578" : d.active ? "#ffd166" : "#c8c2d4";
    ctx.font = "bold 14px monospace";
    if (d.locked) drawIconLabel(ctx, ICONS.lock, d.name, box.x + box.w / 2, box.y + box.h / 2 + 5, 13, 4);
    else ctx.fillText(d.name, box.x + box.w / 2, box.y + box.h / 2 + 5);
  }
  ctx.restore();
}

// locks: {charId: {hint, progress}} — present only for still-locked characters
export function drawCharSelect(ctx, width, height, characters, selected, sprites, bests = {}, locks = {}, diffs = null, masteries = {}, pageInfo = null) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 32px monospace";
  ctx.fillText(t("我做了一个Sans割草游戏.", "I made a Sans survivors game."), width / 2, 66);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(pageInfo ? `${pageInfo.label} · ${pageInfo.page + 1}/${pageInfo.pages}` : t("选择你的角色", "Choose your character"), width / 2, 100);
  // 分页箭头(复用图鉴的放大箭头,下移让开标题): 本家 ⇄ 裂缝时间线
  if (pageInfo && pageInfo.pages > 1) {
    for (const direction of [-1, 1]) {
      const b = charPageArrowRect(direction, width);
      ctx.fillStyle = "#211a2c";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#7ea8ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#f2ead8";
      ctx.font = "bold 18px monospace";
      ctx.fillText(direction < 0 ? "‹" : "›", b.x + b.w / 2, b.y + b.h / 2 + 6);
    }
  }

  for (let i = 0; i < characters.length; i++) {
    const c = characters[i];
    const box = charBoxRect(i, width, height, characters.length);
    const active = i === selected;
    ctx.fillStyle = active ? "#2e2748" : "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = active ? c.color : "#3a2f4a";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    const lock = locks[c.id];
    const sprite = sprites[c.id];
    if (sprite) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (lock) ctx.filter = "brightness(0.28)"; // locked: silhouette
      const glow = { ukb: "#a55dff", hard: "#5db9ff", insanity: "#d92535" }[c.id];
      if (glow && !lock) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 22;
      }
      const scale = 5;
      ctx.drawImage(
        sprite,
        box.x + box.w / 2 - (sprite.width * scale) / 2,
        box.y + 42,
        sprite.width * scale,
        sprite.height * scale
      );
      ctx.restore();
    }

    // 卡面文字按卡宽收缩,超宽折两行(5卡后卡面变窄,字不许溢出边框)
    const fitFill = (text, cy, px = 12) => {
      ctx.font = `${px}px monospace`;
      while (px > 8 && ctx.measureText(text).width > box.w - 12) {
        px -= 1;
        ctx.font = `${px}px monospace`;
      }
      ctx.fillText(text, box.x + box.w / 2, cy);
    };
    // 卡面减负(backlog 第6项): 只留 名字/两个玩法标签/专精等级——
    // 完整描述与最高分只讲当前选中的角色,显示在卡排下方一行
    ctx.fillStyle = lock ? "#7d7690" : active ? "#ffffff" : "#c8c2d4";
    ctx.font = "bold 22px monospace";
    if (lock) drawIconLabel(ctx, ICONS.lock, pick(c, "name"), box.x + box.w / 2, box.y + 234, 17, 5);
    else ctx.fillText(pick(c, "name"), box.x + box.w / 2, box.y + 234);
    if (lock) {
      ctx.fillStyle = "#d9c47a";
      fitFill(lock.hint, box.y + 262);
      // 种草入口: 选中后再点一次卡片可预览武器库
      ctx.fillStyle = active ? "#c8c2d4" : "#6f6880";
      fitFill(active ? t("再点一次 → 预览武器库", "Tap again → preview arsenal") : (c.tags || []).map((x) => t(x, c.tagsEn?.[(c.tags || []).indexOf(x)])).join(" · "), box.y + 284);
    } else {
      ctx.fillStyle = active ? "#b9b2c9" : "#6f6880";
      fitFill(currentLang() === "en" && c.tagsEn ? c.tagsEn.join(" · ") : (c.tags || []).join(" · "), box.y + 262);
      const m = masteries[c.id];
      if (m) {
        ctx.fillStyle = "#ffd166";
        fitFill(`${t("专精", "Mastery")} Lv${m.lvl}`, box.y + 284);
      }
    }
    // 数字快捷键仍可用(1-5 选卡);选中态由加粗彩色边框表达——
    // ▼ 标记已删(冗余,且触屏下与翻页箭头重叠,2026-07-14 拥挤专项)
  }

  // 渐进披露: 当前选中角色的完整描述+最高分,单独一行居中
  {
    const sel = characters[selected];
    const sLock = locks[sel.id];
    const sBox = charBoxRect(selected, width, height, characters.length);
    ctx.fillStyle = sLock ? "#9a93ab" : "#c8c2d4";
    ctx.font = "12px monospace";
    const line = sLock
      ? `${pick(sel, "desc")} · ${sLock.progress}`
      : `${pick(sel, "desc")}${bests[sel.id] > 0 ? ` · ${t("最高", "Best")} ${bests[sel.id]}` : ""}`;
    ctx.fillText(line, width / 2, sBox.y + sBox.h + T(26, 16));
  }

  if (diffs) drawDifficultyRow(ctx, width, height, diffs);

  // confirm button (shared rect with weapon select);
  // 选中锁定角色时变成购买按钮("动词+结果")
  const selLock = locks[characters[selected]?.id];
  const btn = confirmButtonRect(width, height);
  ctx.fillStyle = "#2e2748";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 20px monospace";
  if (selLock && selLock.gated) ctx.fillText(t("地狱通关后可购", "Clear HELL to buy"), width / 2, btn.y + btn.h / 2 + 7);
  else if (selLock) drawIconLabel(ctx, ICONS.coin, `${selLock.cost} ${t("解锁", "Unlock")}`, width / 2, btn.y + btn.h / 2 + 8, 18, 6);
  else ctx.fillText(t("确 定", "Confirm"), width / 2, btn.y + btn.h / 2 + 7);
  drawBackButton(ctx, width, height);
  ctx.restore();
}

export function weaponBoxRect(i, width) {
  const bw = 400;
  const bh = 64;
  const gap = 12;
  const col = Math.floor(i / 4);
  const row = i % 4;
  const x = col === 0 ? width / 2 - bw - 16 : width / 2 + 16;
  return { x, y: 150 + row * (bh + gap), w: bw, h: bh };
}

export function confirmButtonRect(width, height) {
  const compact = width > 1040;
  const w = compact ? 260 : 220;
  const h = T(compact ? 50 : 44, 60);
  return { x: width / 2 - w / 2, y: height - h - 16, w, h };
}

// locks: {slotIndex: {hint, progress}} — present only for locked weapon slots
// charPrice: 角色未解锁时的买断价——武器库开放预览,确认键变成购买
export function drawWeaponSelect(ctx, width, height, weapons, selected, charName = "", locks = {}, charPrice = null) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.82)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 32px monospace";
  ctx.fillText(charName ? (currentLang() === "en" ? `${charName} — Arsenal` : `${charName} 的武器库`) : t("我做了一个Sans割草游戏.", "I made a Sans survivors game."), width / 2, 62);
  ctx.fillStyle = charPrice ? "#d9c47a" : "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(charPrice ? t("预览中——解锁后即可带它们开局", "Preview — unlock to wield them") : t("选择你的初始武器", "Choose your starting weapon"), width / 2, 98);

  for (let i = 0; i < weapons.length; i++) {
    const w = weapons[i];
    const box = weaponBoxRect(i, width);
    const active = i === selected;
    const lock = locks[i];
    ctx.fillStyle = active ? "#2e2748" : "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = lock ? "#3a3444" : active ? w.color : "#3a2f4a";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // colored icon block (grey while locked)
    ctx.fillStyle = lock ? "#453f52" : w.color;
    ctx.fillRect(box.x + 12, box.y + box.h / 2 - 8, 16, 16);

    if (lock) {
      ctx.textAlign = "left";
      ctx.fillStyle = "#7d7690";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`${i + 1}.`, box.x + 40, box.y + 25);
      drawPixelIcon(ctx, ICONS.lock, box.x + 64, box.y + 12, 13);
      ctx.fillText(pick(w, "name"), box.x + 82, box.y + 25);
      ctx.fillStyle = "#d9c47a";
      ctx.font = "12px monospace";
      ctx.fillText(`解锁：${lock.hint} · 进度 ${lock.progress}`, box.x + 40, box.y + 47);
      ctx.textAlign = "center";
      continue;
    }

    ctx.textAlign = "left";
    ctx.fillStyle = active ? "#ffffff" : "#c8c2d4";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`${i + 1}. ${pick(w, "name")}`, box.x + 40, box.y + 25);
    ctx.textAlign = "right";
    ctx.fillStyle = w.color;
    ctx.font = "11px monospace";
    ctx.fillText(`[${pick(w, "tag")}]`, box.x + box.w - 10, box.y + 25);
    ctx.textAlign = "left";
    ctx.fillStyle = active ? "#b9b2c9" : "#7d7690";
    // auto-fit: shrink the font a little, then truncate if still too wide
    const maxW = box.w - 50;
    let descFont = 12;
    ctx.font = `${descFont}px monospace`;
    while (descFont > 9 && ctx.measureText(pick(w, "desc")).width > maxW) {
      descFont -= 1;
      ctx.font = `${descFont}px monospace`;
    }
    let desc = pick(w, "desc");
    while (desc.length > 1 && ctx.measureText(desc + "…").width > maxW) {
      desc = desc.slice(0, -1);
    }
    if (desc !== pick(w, "desc")) desc += "…";
    ctx.fillText(desc, box.x + 40, box.y + 47);
    ctx.textAlign = "center";

    if (active) {
      ctx.fillStyle = w.color;
      ctx.font = "bold 16px monospace";
      ctx.fillText("▶", box.x - 16, box.y + box.h / 2 + 5);
    }
  }

  // confirm button — 预览模式下是购买按钮
  const btn = confirmButtonRect(width, height);
  ctx.fillStyle = "#2e2748";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 20px monospace";
  if (charPrice) drawIconLabel(ctx, ICONS.coin, `${charPrice} ${t("解锁", "Unlock")}`, width / 2, btn.y + btn.h / 2 + 8, 18, 6);
  else ctx.fillText(t("确 定", "Confirm"), width / 2, btn.y + btn.h / 2 + 7);
  drawBackButton(ctx, width, height);
  ctx.restore();
}

export function choiceBoxRect(i, width, height) {
  const w = 260;
  const h = 170;
  const gap = 24;
  const total = 3 * w + 2 * gap;
  return { x: (width - total) / 2 + i * (w + gap), y: height / 2 - h / 2, w, h };
}

export function rerollButtonRect(width, height) {
  return { x: width / 2 - T(70, 78), y: height / 2 + 110, w: T(140, 156), h: T(40, 52) };
}

// 选卡像素图标(美术批 backlog 第3项): kind → ICONS key。
// 粗粒度语义映射——躲闪归机动,减伤归生存;缺的专属图标(荆棘/骰子/护盾)
// 记录在 docs/icon-gap-checklist.md,补齐后在这里换 key 即可
const CHOICE_KIND_ICONS = {
  atk: "attack",
  amp20: "attack",
  amp100: "attack",
  fireRate: "attack",
  hp: "heart",
  regen: "heart",
  heal50: "heart",
  tough: "heart",
  speed: "speed",
  faster: "speed",
  dodge: "speed",
  thorns: "skull",
  // 武器类三兄弟必须长得不一样(2026-07-14 用户截图:三卡同图标)
  newWeapon: "weapon", // 交叉武器=拿新家伙
  tierUp: "star", // 升星=品阶提升
  enhance: "edit", // 刻刀=在现有武器上改造
  evolve: "awakening",
};

export function drawChoiceScreen(ctx, width, height, options, rerolls) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.78)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText(t("强 化 时 间 !", "P O W E R  U P !"), width / 2, height / 2 - 130);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(t("选择一项强化", "Pick one upgrade"), width / 2, height / 2 - 102);

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    const box = choiceBoxRect(i, width, height);
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = opt.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // 快捷键提示缩到左上角,顶部中央让给像素图标
    ctx.textAlign = "left";
    ctx.fillStyle = opt.color;
    ctx.font = "bold 13px monospace";
    ctx.fillText(`[${i + 1}]`, box.x + 10, box.y + 22);
    ctx.textAlign = "center";
    const icon = ICONS[CHOICE_KIND_ICONS[opt.kind]];
    if (icon) drawPixelIcon(ctx, icon, box.x + box.w / 2 - 12, box.y + 14, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(opt.title, box.x + box.w / 2, box.y + 66);
    ctx.fillStyle = "#b9b2c9";
    // 普通卡两行/进化卡三行(超出属于文案违规,缩字号兜底)
    const lines = opt.desc.split("\n");
    const many = lines.length > 3;
    ctx.font = many ? "12px monospace" : "13px monospace";
    lines.forEach((line, li) => {
      ctx.fillText(line, box.x + box.w / 2, box.y + (many ? 90 : 98) + li * (many ? 16 : 20));
    });
  }

  // reroll button (rerolls = uses left this screen; 备用骰子 upgrade adds more)
  const canReroll = rerolls > 0;
  const btn = rerollButtonRect(width, height);
  ctx.fillStyle = canReroll ? "#241f2b" : "#181521";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = canReroll ? "#5ee6e6" : "#453f52";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = canReroll ? "#5ee6e6" : "#6b6578";
  ctx.font = "bold 15px monospace";
  drawIconLabel(
    ctx,
    ICONS.refresh,
    canReroll ? (rerolls > 1 ? `${t("刷新", "Reroll")} ×${rerolls}` : t("刷新", "Reroll")) : t("已刷新", "Used"),
    btn.x + btn.w / 2,
    btn.y + btn.h / 2 + 5,
    14,
    5
  );
  ctx.restore();
}

// 战斗 HUD 保留紧凑武器栏:玩家必须随时知道当前构筑与等级;
// 完整状态仍放在暂停页,Boss 出现后时间让位给 Boss 信息。
export function drawHud(ctx, width, player, elapsed, healFlash = 0, bossActive = false, weaponLabel = "") {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // HP bar — 加大 20%(手机上血条是保命信息,得一眼看到)
  const hpBarW = 264;
  const hpBarH = 22;
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(16, 16, hpBarW, hpBarH);
  const hpPct = Math.max(0, player.hp / player.maxHp);
  ctx.fillStyle = hpPct > 0.3 ? "#ff5d73" : "#ff2d2d";
  ctx.fillRect(18, 18, (hpBarW - 4) * hpPct, hpBarH - 4);
  if (healFlash > 0) {
    // brief whitening when healed
    ctx.save();
    ctx.globalAlpha = Math.min(healFlash / 0.45, 1) * 0.65;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(18, 18, (hpBarW - 4) * hpPct, hpBarH - 4);
    ctx.restore();
  }
  // 残血呼吸: below 25% the frame pulses red, matching the heartbeat sfx
  const lowHp = hpPct > 0 && hpPct < 0.25;
  ctx.strokeStyle = lowHp ? `rgba(255, 45, 45, ${0.6 + 0.4 * Math.sin(performance.now() / 160)})` : "#f2ead8";
  ctx.lineWidth = lowHp ? 3 : 2;
  ctx.strokeRect(16, 16, hpBarW, hpBarH);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "bold 13px monospace";
  ctx.fillText(`HP ${Math.max(0, Math.ceil(player.hp))}/${player.maxHp}`, 22, 32);

  // XP bar
  const xpBarW = width - 32;
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(16, 40, xpBarW, 10);
  const xpPct = player.xp / player.xpToNext;
  ctx.fillStyle = "#7cf28a";
  ctx.fillRect(17, 41, (xpBarW - 2) * xpPct, 8);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "12px monospace";
  ctx.fillText(`LV ${player.level}`, 20, 62);

  if (weaponLabel) {
    const x = 76;
    const maxW = Math.max(220, width - x - 188);
    let weaponFont = 11;
    ctx.font = `${weaponFont}px monospace`;
    while (weaponFont > 9 && ctx.measureText(weaponLabel).width > maxW) {
      weaponFont -= 1;
      ctx.font = `${weaponFont}px monospace`;
    }
    ctx.fillStyle = "#7ea8ff";
    ctx.fillRect(66, 53, 2, 10);
    ctx.fillStyle = "#c9d7ff";
    ctx.fillText(weaponLabel, x, 62);
  }

  // Timer — 顶部中央;Boss 战中隐藏(底部 Boss 血条才是当下的焦点)
  if (!bossActive) {
    ctx.textAlign = "center";
    ctx.font = "16px monospace";
    ctx.fillText(formatTime(elapsed), width / 2, 32);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

export function drawCenterText(ctx, width, height, lines, yOffset = 0, lineH = 34) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.72)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f2ead8";
  let y = height / 2 - ((lines.length - 1) * lineH) / 2 + yOffset;
  for (const line of lines) {
    ctx.font = line.font || "20px monospace";
    ctx.fillStyle = line.color || "#f2ead8";
    ctx.fillText(line.text, width / 2, y);
    y += lineH;
  }
  ctx.restore();
}
