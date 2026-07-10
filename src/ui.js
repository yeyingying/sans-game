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
  return { x: width - 92, y: 56, w: 76, h: 26 };
}

export function pauseButtonRect(width) {
  return { x: width - 92 - 84, y: 56, w: 76, h: 26 };
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
  ctx.fillText(paused ? "▶ 继续" : "❚❚ 暂停", btn.x + btn.w / 2, btn.y + 18);
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

export function drawSpeedButton(ctx, width, timeScale) {
  const btn = speedButtonRect(width);
  ctx.save();
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = timeScale > 1 ? "#ffd166" : "#5a5468";
  ctx.lineWidth = 2;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = timeScale > 1 ? "#ffd166" : "#c8c2d4";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`▶▶ x${timeScale}`, btn.x + btn.w / 2, btn.y + 18);
  ctx.restore();
}

// two volume rows on the pause screen: music (BGM) and sound effects
export function volumeMinusRect(width, height) {
  return { x: width / 2 - 130, y: height / 2 - 26, w: 32, h: 26 };
}

export function volumePlusRect(width, height) {
  return { x: width / 2 + 98, y: height / 2 - 26, w: 32, h: 26 };
}

export function sfxMinusRect(width, height) {
  return { x: width / 2 - 130, y: height / 2 + 10, w: 32, h: 26 };
}

export function sfxPlusRect(width, height) {
  return { x: width / 2 + 98, y: height / 2 + 10, w: 32, h: 26 };
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
    ctx.fillText(sign, btn.x + btn.w / 2, btn.y + 19);
  }
  // label + bar between the buttons
  const barX = minus.x + minus.w + 74;
  const barW = plus.x - 10 - barX;
  const barY = minus.y + 6;
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
  drawVolumeRow(ctx, width, volumeMinusRect(width, height), volumePlusRect(width, height), "音乐", volume);
  drawVolumeRow(ctx, width, sfxMinusRect(width, height), sfxPlusRect(width, height), "音效", sfxVolume);
  ctx.restore();
}

export function resumeButtonRect(width, height) {
  return { x: width / 2 - 80, y: height / 2 + 48, w: 160, h: 42 };
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
  ctx.fillText("继 续", btn.x + btn.w / 2, btn.y + 27);
  ctx.restore();
}

export function quitButtonRect(width, height) {
  return { x: width / 2 - 80, y: height / 2 + 102, w: 160, h: 42 };
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
  ctx.fillText("退 出", btn.x + btn.w / 2, btn.y + 27);
  ctx.restore();
}


export function startButtonRect(width, height) {
  return { x: width / 2 - 110, y: height / 2 + 66, w: 220, h: 52 };
}

export function creditsButtonRect(width, height) {
  return { x: width - 132, y: height - 52, w: 116, h: 34 };
}

export function backButtonRect(width, height) {
  return { x: 24, y: height - 62, w: 120, h: 44 };
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
  ctx.fillText("← 返回", btn.x + btn.w / 2, btn.y + 28);
  ctx.restore();
}

export function shopButtonRect(width, height) {
  return { x: 16, y: height - 52, w: 190, h: 34 };
}

export function drawTitleScreen(ctx, width, height, portraits, coins = 0, codexPct = 0, echoCount = "", questDone = "", giftLine = "") {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.99)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 44px monospace";
  ctx.fillText("我做了一个Sans割草游戏.", width / 2, height / 2 - 130);
  ctx.fillStyle = "#7d7690";
  ctx.font = "14px monospace";
  ctx.fillText("WASD/方向键移动 · 自动攻击 · 活下去", width / 2, height / 2 - 94);

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
  ctx.fillText("开 始", width / 2, btn.y + 34);
  ctx.fillStyle = "#7d7690";
  ctx.font = "12px monospace";
  ctx.fillText("(或按 空格/回车)", width / 2, btn.y + 76);

  // credits button, tucked into the bottom-right corner
  const cb = creditsButtonRect(width, height);
  ctx.fillStyle = "#1a1622";
  ctx.fillRect(cb.x, cb.y, cb.w, cb.h);
  ctx.strokeStyle = "#5a5468";
  ctx.lineWidth = 2;
  ctx.strokeRect(cb.x, cb.y, cb.w, cb.h);
  ctx.fillStyle = "#b9b2c9";
  ctx.font = "bold 14px monospace";
  ctx.fillText("制作名单", cb.x + cb.w / 2, cb.y + 22);

  // daily bounties
  const qb = questButtonRect(width, height);
  ctx.fillStyle = "#1f1a10";
  ctx.fillRect(qb.x, qb.y, qb.w, qb.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.strokeRect(qb.x, qb.y, qb.w, qb.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`📜 悬赏 ${questDone}`, qb.x + qb.w / 2, qb.y + 22);

  // 连日之花 greeting under the subtitle
  if (giftLine) {
    ctx.fillStyle = "#ffd93d";
    ctx.font = "bold 13px monospace";
    ctx.fillText(giftLine, width / 2, height / 2 - 70);
  }

  // echo flowers (story fragments), between daily and credits
  const eb = echoButtonRect(width, height);
  ctx.fillStyle = "#10141f";
  ctx.fillRect(eb.x, eb.y, eb.w, eb.h);
  ctx.strokeStyle = "#6bd0ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(eb.x, eb.y, eb.w, eb.h);
  ctx.fillStyle = "#6bd0ff";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`❀ 回响 ${echoCount}`, eb.x + eb.w / 2, eb.y + 22);

  // upgrade shop entrance, bottom-left, with the wallet on display
  const sb = shopButtonRect(width, height);
  ctx.fillStyle = "#241c10";
  ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`强化商店 · ⓖ ${coins}`, sb.x + sb.w / 2, sb.y + 22);

  // codex button right next to the shop
  const cx = codexButtonRect(width, height);
  ctx.fillStyle = "#151d24";
  ctx.fillRect(cx.x, cx.y, cx.w, cx.h);
  ctx.strokeStyle = "#7ea8ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx.x, cx.y, cx.w, cx.h);
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`图鉴 ${codexPct}%`, cx.x + cx.w / 2, cx.y + 22);

  // daily challenge: fixed seed, rotating character, local best
  const db = dailyButtonRect(width, height);
  ctx.fillStyle = "#1f1626";
  ctx.fillRect(db.x, db.y, db.w, db.h);
  ctx.strokeStyle = "#c59bff";
  ctx.lineWidth = 2;
  ctx.strokeRect(db.x, db.y, db.w, db.h);
  ctx.fillStyle = "#c59bff";
  ctx.font = "bold 14px monospace";
  ctx.fillText("每日挑战 ✦", db.x + db.w / 2, db.y + 22);
  ctx.restore();
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
  ctx.fillText("📜 今 日 悬 赏", width / 2, 62);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "13px monospace";
  ctx.fillText("回声花的今日委托 · 进度跨局累计 · 完成即发金币 · 每天刷新", width / 2, 92);
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
    ctx.fillText(q.done ? "已入账" : `ⓖ ${q.reward}`, box.x + box.w - 18, box.y + 34);
  });
  ctx.textAlign = "center";
  drawBackButton(ctx, width, height);
  ctx.restore();
}

export function echoButtonRect(width, height) {
  return { x: 516, y: height - 52, w: 130, h: 34 };
}

// 回响花田: 5x2 grid of echo flowers
export function echoFlowerRect(i, width, height) {
  const w = 168;
  const h = 168;
  const gap = 16;
  const col = i % 5;
  const row = Math.floor(i / 5);
  const total = 5 * w + 4 * gap;
  return { x: width / 2 - total / 2 + col * (w + gap), y: 118 + row * (h + gap), w, h };
}

// entries: [{title, hint, unlocked}]
export function drawEchoField(ctx, width, height, entries, budSprite, bloomSprite, count) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 10, 18, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#6bd0ff";
  ctx.font = "bold 30px monospace";
  ctx.fillText("❀ 回 响", width / 2, 52);
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
    const spr = e.unlocked ? bloomSprite : budSprite;
    const size = e.unlocked ? 72 : 52;
    ctx.save();
    if (e.unlocked) {
      ctx.shadowColor = "#6bd0ff";
      ctx.shadowBlur = 14;
    } else {
      ctx.globalAlpha = 0.55;
    }
    ctx.drawImage(spr, box.x + box.w / 2 - size / 2, box.y + 88 - size, size, (spr.height / spr.width) * size);
    ctx.restore();
    ctx.fillStyle = e.unlocked ? "#e8f4ff" : "#5c6478";
    ctx.font = "bold 14px monospace";
    ctx.fillText(e.unlocked ? `「${e.title}」` : "???", box.x + box.w / 2, box.y + 122);
    ctx.fillStyle = e.unlocked ? "#6bd0ff" : "#4a5164";
    ctx.font = "10px monospace";
    ctx.fillText(e.unlocked ? "点击聆听" : e.hint, box.x + box.w / 2, box.y + 144);
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
  ctx.fillText(`「${echo.title}」`, width / 2, height / 2 - 158);
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
  echo.lines.forEach((line, i) => {
    if (remaining <= 0) return;
    const shown = line.slice(0, Math.max(0, remaining));
    remaining -= line.length;
    ctx.fillText(shown, bx + 24, by + 34 + i * 32);
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#7d8698";
  ctx.font = "12px monospace";
  ctx.fillText("点击/Enter 继续 · Esc 返回花田", width / 2, by + bh + 34);
  ctx.restore();
}

export function codexButtonRect(width, height) {
  return { x: 216, y: height - 52, w: 110, h: 34 };
}

export function dailyButtonRect(width, height) {
  return { x: 336, y: height - 52, w: 170, h: 34 };
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
  ctx.fillText("审 判 结 束", width / 2, height / 2 - 96);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "16px monospace";
  ctx.fillText("你击败了天意侵蚀Sans", width / 2, height / 2 - 58);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "13px monospace";
  ctx.fillText("←→ 选择 · Enter/空格 确认 · 或直接点击", width / 2, height / 2 - 30);

  const buttons = [
    { rect: bossClearLeaveRect(width, height), label: "带着战利品离开", color: "#7cf28a" },
    { rect: bossClearContinueRect(width, height), label: "继续接受审判", color: "#ff8a5d" },
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
  ctx.fillText("※ 无尽模式的金币收益会逐渐衰减", width / 2, height / 2 + 128);
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
  ctx.fillText("←→ 选择 · Enter/空格 确认 · 或直接点击", width / 2, height / 2 - 32);

  const buttons = [
    { rect: bossClearLeaveRect(width, height), label: "撤离并结算", color: "#7cf28a" },
    { rect: bossClearContinueRect(width, height), label: "进入下一轮", color: "#ff8a5d" },
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
  ctx.fillText("※ 下一轮更危险：轮中死亡将丢失该轮待结算金币", width / 2, height / 2 + 128);
  ctx.restore();
}

// ---- codex / collection ------------------------------------------------------

export function codexEntryRect(i, width) {
  const gap = 9;
  const w = Math.min(142, Math.floor((width - 92 - gap * 5) / 6));
  const total = w * 6 + gap * 5;
  return { x: width / 2 - total / 2 + (i % 6) * (w + gap), y: 78 + Math.floor(i / 6) * 84, w, h: 76 };
}

// monsters include both the eight base encounters and four difficulty elites.
// A compact two-row index leaves a stable detail area on phone landscape.
export function drawCodexScreen(ctx, width, height, monsters, bossKills, weaponRows, pct = 0, selected = 0) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 30px monospace";
  ctx.fillText("图 鉴", width / 2, 46);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 13px monospace";
  ctx.fillText(`收集度 ${pct}%`, width / 2, 68);

  monsters.forEach((m, i) => {
    const box = codexEntryRect(i, width);
    const x = box.x;
    const y = box.y;
    const seen = m.kills > 0;
    const active = i === selected;
    ctx.fillStyle = active ? "#282037" : "#1d1828";
    ctx.fillRect(x, y, box.w, box.h);
    ctx.strokeStyle = active ? (seen ? m.color : "#6b6578") : seen ? (m.elite ? m.color : "#5a5468") : "#2a2436";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(x, y, box.w, box.h);
    if (seen && m.sprite) {
      ctx.imageSmoothingEnabled = false;
      const s = 34;
      ctx.drawImage(m.sprite, x + box.w / 2 - s / 2, y + 7, s, s);
      if (m.elite) {
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
    ctx.fillStyle = seen ? "#f2ead8" : "#453f52";
    ctx.font = "bold 12px monospace";
    ctx.fillText(seen ? m.name : "？？？", x + box.w / 2, y + 55);
    ctx.fillStyle = seen ? (m.elite ? m.color : "#9a93ab") : "#3c3548";
    ctx.font = "10px monospace";
    ctx.fillText(seen ? `${m.elite ? "精英 · " : ""}击杀 ${m.kills}` : m.elite ? "高难度精英" : "尚未遭遇", x + box.w / 2, y + 69);
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
    ctx.fillText(`${chosen.name}  ${chosen.english}`, detail.x + 130, detail.y + 28);
    ctx.fillStyle = "#9a93ab";
    ctx.font = "11px monospace";
    ctx.fillText(`${chosen.region} · ${chosen.title} · 累计击杀 ${chosen.kills}`, detail.x + 130, detail.y + 50);
    ctx.fillStyle = "#d8d1e2";
    ctx.font = "12px monospace";
    ctx.fillText(chosen.lore, detail.x + 130, detail.y + 78);
    ctx.fillStyle = chosen.color;
    ctx.font = "bold 12px monospace";
    ctx.fillText(`本作能力：${chosen.skill}`, detail.x + 130, detail.y + 108);
    if (chosen.elite) {
      ctx.fillStyle = "#ffd166";
      ctx.font = "11px monospace";
      ctx.fillText(`${chosen.unlock} · 屠杀难度进入处决态`, detail.x + 130, detail.y + 132);
    }
    ctx.textAlign = "center";
  } else {
    ctx.fillStyle = "#453f52";
    ctx.font = "bold 30px monospace";
    ctx.fillText("？", width / 2, detail.y + 52);
    ctx.font = "13px monospace";
    ctx.fillText(chosen?.elite ? chosen.unlock : "在战斗中击败一次后解锁完整档案", width / 2, detail.y + 86);
    ctx.fillStyle = "#6b6578";
    ctx.font = "11px monospace";
    ctx.fillText("怪物的名字、来历与能力仍被黑暗遮住", width / 2, detail.y + 112);
  }

  // Boss and weapon collection stay visible as compact completion summaries.
  const by = 420;
  ctx.fillStyle = bossKills > 0 ? "#ffd166" : "#453f52";
  ctx.font = "bold 12px monospace";
  ctx.fillText(bossKills > 0 ? `☠ 天意侵蚀Sans · 击败 ${bossKills} 次` : "☠ ？？？（5:00 出现的存在）", width / 2, by);

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
  // two columns x four rows
  const w = 430;
  const h = 56;
  const gap = 10;
  const col = Math.floor(i / 4);
  const x = col === 0 ? width / 2 - w - 8 : width / 2 + 8;
  return { x, y: 120 + (i % 4) * (h + gap), w, h };
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

// souls: [{id, name, color, desc, price, owned, equipped}]
export function drawShopScreen(ctx, width, height, items, coins, tab = 0, souls = [], infoLine = "") {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText("商 店", width / 2, 46);
  for (const [i, label] of [[0, "能力升级"], [1, "灵魂加护"]]) {
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
  ctx.fillStyle = "#f2ead8";
  ctx.font = "13px monospace";
  ctx.font = "12px monospace";
  ctx.fillText(
    tab === 0
      ? `金币 ⓖ ${coins} · 升级永久生效 · ${infoLine}`
      : `金币 ⓖ ${coins} · 纯外观:发光/心心拖尾/骨头换色,不加任何属性 · ${infoLine}`,
    width / 2,
    112
  );

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
      ctx.fillText(c.name, box.x + 42, box.y + 18);
      ctx.fillStyle = "#b9b2c9";
      ctx.font = "10px monospace";
      ctx.fillText(c.desc, box.x + 42, box.y + 34);
      ctx.textAlign = "right";
      ctx.font = "bold 13px monospace";
      if (c.equipped) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText("装备中 · 点击卸下", box.x + box.w - 14, box.y + 20);
      } else if (c.owned) {
        ctx.fillStyle = "#7cf28a";
        ctx.fillText("已拥有 · 点击装备", box.x + box.w - 14, box.y + 20);
      } else {
        ctx.fillStyle = affordable ? "#ffd166" : "#6b6578";
        ctx.fillText(`ⓖ ${c.price}`, box.x + box.w - 14, box.y + 20);
        ctx.font = "10px monospace";
        ctx.fillStyle = affordable ? "#7d7690" : "#5a5468";
        ctx.fillText(affordable ? "点击购买" : "金币不足", box.x + box.w - 14, box.y + 36);
      }
    }
    ctx.textAlign = "center";
    drawBackButton(ctx, width, height);
    ctx.restore();
    return;
  }

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const box = shopItemRect(i, width, height);
    const affordable = it.cost !== null && coins >= it.cost;
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = it.cost === null ? "#453f52" : affordable ? it.color : "#5a5468";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.textAlign = "left";
    ctx.fillStyle = it.color;
    ctx.font = "bold 16px monospace";
    ctx.fillText(it.name, box.x + 16, box.y + 24);
    ctx.fillStyle = "#b9b2c9";
    ctx.font = "12px monospace";
    ctx.fillText(it.desc, box.x + 16, box.y + 44);

    ctx.textAlign = "right";
    ctx.fillStyle = "#f2ead8";
    ctx.font = "bold 14px monospace";
    // level pips
    ctx.fillText(`${"■".repeat(it.lvl)}${"□".repeat(it.max - it.lvl)}`, box.x + box.w - 118, box.y + 24);
    ctx.fillStyle = it.cost === null ? "#7cf28a" : affordable ? "#ffd166" : "#6b6578";
    ctx.fillText(it.cost === null ? "已满级" : `ⓖ ${it.cost}`, box.x + box.w - 16, box.y + 24);
    if (it.cost !== null) {
      ctx.fillStyle = affordable ? "#7d7690" : "#5a5468";
      ctx.font = "11px monospace";
      ctx.fillText(affordable ? "点击购买" : "金币不足", box.x + box.w - 16, box.y + 44);
    }
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
  const w = 108;
  const h = 30;
  const gap = 10;
  const total = 4 * w + 3 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - 106, w, h };
}

// diffs: [{name, active, locked, hint}]
function drawDifficultyRow(ctx, width, height, diffs) {
  ctx.save();
  ctx.textAlign = "center";
  const activeDiff = diffs.find((d) => d.active);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "12px monospace";
  ctx.fillText(`难度：${activeDiff ? activeDiff.hint : ""}`, width / 2, diffPillRect(0, width, height).y - 10);
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
    ctx.fillText(d.locked ? `🔒 ${d.name}` : d.name, box.x + box.w / 2, box.y + 20);
  }
  ctx.restore();
}

// locks: {charId: {hint, progress}} — present only for still-locked characters
export function drawCharSelect(ctx, width, height, characters, selected, sprites, bests = {}, locks = {}, diffs = null, masteries = {}) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 32px monospace";
  ctx.fillText("我做了一个Sans割草游戏.", width / 2, 66);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(`选择你的角色 (←→/1-${characters.length} 或点击 · 空格/确定继续)`, width / 2, 100);

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
      const glow = { ukb: "#a55dff", hard: "#5db9ff" }[c.id];
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

    ctx.fillStyle = lock ? "#7d7690" : active ? "#ffffff" : "#c8c2d4";
    ctx.font = "bold 22px monospace";
    ctx.fillText(lock ? `🔒 ${c.name}` : c.name, box.x + box.w / 2, box.y + 228);
    if (lock) {
      ctx.fillStyle = "#d9c47a";
      ctx.font = "12px monospace";
      ctx.fillText(`解锁：${lock.hint}`, box.x + box.w / 2, box.y + 250);
      ctx.fillStyle = "#9a93ab";
      ctx.fillText(`进度：${lock.progress}`, box.x + box.w / 2, box.y + 270);
    } else {
      ctx.fillStyle = active ? "#b9b2c9" : "#7d7690";
      ctx.font = "12px monospace";
      ctx.fillText(c.desc, box.x + box.w / 2, box.y + 250);
      ctx.fillStyle = "#ffd166";
      ctx.font = "12px monospace";
      const m = masteries[c.id];
      ctx.fillText(
        `${bests[c.id] > 0 ? `最高 ${bests[c.id]}` : "最高 --"}${m ? ` · 专精 Lv${m.lvl}` : ""}`,
        box.x + box.w / 2,
        box.y + 270
      );
    }
    ctx.fillStyle = c.color;
    ctx.font = "bold 13px monospace";
    ctx.fillText(`[${i + 1}]`, box.x + box.w / 2, box.y + 290);

    if (active) {
      ctx.fillStyle = c.color;
      ctx.font = "bold 18px monospace";
      ctx.fillText("▼", box.x + box.w / 2, box.y - 12);
    }
  }

  if (diffs) drawDifficultyRow(ctx, width, height, diffs);

  // confirm button (shared rect with weapon select)
  const btn = confirmButtonRect(width, height);
  ctx.fillStyle = "#2e2748";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 20px monospace";
  ctx.fillText("确 定", width / 2, btn.y + 29);
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
  const h = compact ? 50 : 44;
  return { x: width / 2 - w / 2, y: height - h - 16, w, h };
}

// locks: {slotIndex: {hint, progress}} — present only for locked weapon slots
export function drawWeaponSelect(ctx, width, height, weapons, selected, charName = "", locks = {}) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.82)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ea8ff";
  ctx.font = "bold 32px monospace";
  ctx.fillText(charName ? `${charName} 的武器库` : "我做了一个Sans割草游戏.", width / 2, 62);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(`选择你的初始武器 (↑↓←→/1-${weapons.length} 或点击 · 空格开始 · Esc返回)`, width / 2, 98);

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
      ctx.fillText(`${i + 1}. 🔒 ${w.name}`, box.x + 40, box.y + 25);
      ctx.fillStyle = "#d9c47a";
      ctx.font = "12px monospace";
      ctx.fillText(`解锁：${lock.hint} · 进度 ${lock.progress}`, box.x + 40, box.y + 47);
      ctx.textAlign = "center";
      continue;
    }

    ctx.textAlign = "left";
    ctx.fillStyle = active ? "#ffffff" : "#c8c2d4";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`${i + 1}. ${w.name}`, box.x + 40, box.y + 25);
    ctx.textAlign = "right";
    ctx.fillStyle = w.color;
    ctx.font = "11px monospace";
    ctx.fillText(`[${w.tag}]`, box.x + box.w - 10, box.y + 25);
    ctx.textAlign = "left";
    ctx.fillStyle = active ? "#b9b2c9" : "#7d7690";
    // auto-fit: shrink the font a little, then truncate if still too wide
    const maxW = box.w - 50;
    let descFont = 12;
    ctx.font = `${descFont}px monospace`;
    while (descFont > 9 && ctx.measureText(w.desc).width > maxW) {
      descFont -= 1;
      ctx.font = `${descFont}px monospace`;
    }
    let desc = w.desc;
    while (desc.length > 1 && ctx.measureText(desc + "…").width > maxW) {
      desc = desc.slice(0, -1);
    }
    if (desc !== w.desc) desc += "…";
    ctx.fillText(desc, box.x + 40, box.y + 47);
    ctx.textAlign = "center";

    if (active) {
      ctx.fillStyle = w.color;
      ctx.font = "bold 16px monospace";
      ctx.fillText("▶", box.x - 16, box.y + box.h / 2 + 5);
    }
  }

  // confirm button
  const btn = confirmButtonRect(width, height);
  ctx.fillStyle = "#2e2748";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 20px monospace";
  ctx.fillText("确 定", width / 2, btn.y + 29);
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
  return { x: width / 2 - 70, y: height / 2 + 110, w: 140, h: 40 };
}

export function drawChoiceScreen(ctx, width, height, options, rerolls) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.78)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText("强 化 时 间 !", width / 2, height / 2 - 130);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText("选择一项强化 · 按 1/2/3 或点击 (游戏已暂停)", width / 2, height / 2 - 102);

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    const box = choiceBoxRect(i, width, height);
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = opt.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.fillStyle = opt.color;
    ctx.font = "bold 15px monospace";
    ctx.fillText(`[${i + 1}]`, box.x + box.w / 2, box.y + 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(opt.title, box.x + box.w / 2, box.y + 76);
    ctx.fillStyle = "#b9b2c9";
    // 4+ description lines shrink to stay inside the card
    const lines = opt.desc.split("\n");
    const many = lines.length > 3;
    ctx.font = many ? "12px monospace" : "13px monospace";
    lines.forEach((line, li) => {
      ctx.fillText(line, box.x + box.w / 2, box.y + (many ? 100 : 108) + li * (many ? 16 : 20));
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
  ctx.fillText(canReroll ? (rerolls > 1 ? `刷新 ×${rerolls}` : "刷新") : "已刷新", btn.x + btn.w / 2, btn.y + 25);
  ctx.restore();
}

export function drawHud(ctx, width, player, elapsed, weaponLabel, healFlash = 0) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // HP bar
  const hpBarW = 220;
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(16, 16, hpBarW, 18);
  const hpPct = Math.max(0, player.hp / player.maxHp);
  ctx.fillStyle = hpPct > 0.3 ? "#ff5d73" : "#ff2d2d";
  ctx.fillRect(18, 18, (hpBarW - 4) * hpPct, 14);
  if (healFlash > 0) {
    // brief whitening when healed
    ctx.save();
    ctx.globalAlpha = Math.min(healFlash / 0.45, 1) * 0.65;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(18, 18, (hpBarW - 4) * hpPct, 14);
    ctx.restore();
  }
  ctx.strokeStyle = "#f2ead8";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, hpBarW, 18);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "12px monospace";
  ctx.fillText(`HP ${Math.max(0, Math.ceil(player.hp))}/${player.maxHp}`, 22, 30);

  // XP bar
  const xpBarW = width - 32;
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(16, 40, xpBarW, 10);
  const xpPct = player.xp / player.xpToNext;
  ctx.fillStyle = "#7cf28a";
  ctx.fillRect(17, 41, (xpBarW - 2) * xpPct, 8);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "12px monospace";
  ctx.fillText(`LV ${player.level}${weaponLabel ? "  " + weaponLabel : ""}`, 20, 62);

  // Timer + kills
  ctx.textAlign = "right";
  ctx.font = "16px monospace";
  ctx.fillText(formatTime(elapsed), width - 16, 32);
  ctx.font = "12px monospace";
  ctx.fillText(`击杀 ${player.kills}`, width - 16, 50);
  ctx.textAlign = "left";
  ctx.restore();
}

export function drawCenterText(ctx, width, height, lines, yOffset = 0) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.72)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f2ead8";
  let y = height / 2 - ((lines.length - 1) * 26) / 2 + yOffset;
  for (const line of lines) {
    ctx.font = line.font || "20px monospace";
    ctx.fillStyle = line.color || "#f2ead8";
    ctx.fillText(line.text, width / 2, y);
    y += 34;
  }
  ctx.restore();
}
