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

export function drawTitleScreen(ctx, width, height, portraits, coins = 0) {
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
  ctx.restore();
}

// ---- permanent upgrade shop ------------------------------------------------

export function shopItemRect(i, width, height) {
  const w = 560;
  const h = 56;
  const gap = 10;
  return { x: width / 2 - w / 2, y: 120 + i * (h + gap), w, h };
}

// items: [{name, desc, lvl, max, cost, color}], cost null = maxed
export function drawShopScreen(ctx, width, height, items, coins) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText("强 化 商 店", width / 2, 58);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "14px monospace";
  ctx.fillText(`金币 ⓖ ${coins} · 升级永久生效`, width / 2, 88);

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

// locks: {charId: {hint, progress}} — present only for still-locked characters
export function drawCharSelect(ctx, width, height, characters, selected, sprites, bests = {}, locks = {}) {
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
      ctx.fillText(bests[c.id] > 0 ? `历史最高 ${bests[c.id]}` : "历史最高 --", box.x + box.w / 2, box.y + 270);
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

export function drawWeaponSelect(ctx, width, height, weapons, selected, charName = "") {
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
    ctx.fillStyle = active ? "#2e2748" : "#1d1828";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = active ? w.color : "#3a2f4a";
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // colored icon block
    ctx.fillStyle = w.color;
    ctx.fillRect(box.x + 12, box.y + box.h / 2 - 8, 16, 16);

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
