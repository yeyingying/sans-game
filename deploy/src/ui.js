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

export function volumeMinusRect(width, height) {
  return { x: width / 2 - 130, y: height / 2 - 4, w: 32, h: 30 };
}

export function volumePlusRect(width, height) {
  return { x: width / 2 + 98, y: height / 2 - 4, w: 32, h: 30 };
}

export function drawVolumeControl(ctx, width, height, volume) {
  const minus = volumeMinusRect(width, height);
  const plus = volumePlusRect(width, height);
  ctx.save();
  ctx.textAlign = "center";
  // buttons
  for (const [btn, label] of [
    [minus, "−"],
    [plus, "+"],
  ]) {
    ctx.fillStyle = "#241f2b";
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    ctx.strokeStyle = "#8fd6ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    ctx.fillStyle = "#8fd6ff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(label, btn.x + btn.w / 2, btn.y + 21);
  }
  // volume bar between the buttons
  const barX = minus.x + minus.w + 10;
  const barW = plus.x - 10 - barX;
  const barY = minus.y + 8;
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(barX, barY, barW, 14);
  ctx.fillStyle = "#8fd6ff";
  ctx.fillRect(barX + 2, barY + 2, (barW - 4) * volume, 10);
  ctx.strokeStyle = "#5a5468";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, 14);
  ctx.fillStyle = "#c8c2d4";
  ctx.font = "12px monospace";
  ctx.fillText(`音量 ${Math.round(volume * 100)}%`, width / 2, minus.y - 8);
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

export function drawTitleScreen(ctx, width, height, portraits) {
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
  ctx.restore();
}

export function charBoxRect(i, width, height, count = 2) {
  const w = count >= 4 ? 210 : 240;
  const h = 300;
  const gap = count >= 4 ? 22 : count >= 3 ? 40 : 60;
  const total = count * w + (count - 1) * gap;
  return { x: (width - total) / 2 + i * (w + gap), y: height / 2 - h / 2 - 20, w, h };
}

export function drawCharSelect(ctx, width, height, characters, selected, sprites, bests = {}) {
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

    const sprite = sprites[c.id];
    if (sprite) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      const glow = { ukb: "#a55dff", hard: "#5db9ff" }[c.id];
      if (glow) {
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

    ctx.fillStyle = active ? "#ffffff" : "#c8c2d4";
    ctx.font = "bold 22px monospace";
    ctx.fillText(c.name, box.x + box.w / 2, box.y + 228);
    ctx.fillStyle = active ? "#b9b2c9" : "#7d7690";
    ctx.font = "12px monospace";
    ctx.fillText(c.desc, box.x + box.w / 2, box.y + 250);
    ctx.fillStyle = "#ffd166";
    ctx.font = "12px monospace";
    ctx.fillText(bests[c.id] > 0 ? `历史最高 ${bests[c.id]}` : "历史最高 --", box.x + box.w / 2, box.y + 270);
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
  return { x: width / 2 - 110, y: height - 62, w: 220, h: 44 };
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
    ctx.font = "12px monospace";
    ctx.fillText(w.desc, box.x + 40, box.y + 47);
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
  ctx.restore();
}

export function choiceBoxRect(i, width, height) {
  const w = 260;
  const h = 170;
  const gap = 24;
  const total = 3 * w + 2 * gap;
  return { x: (width - total) / 2 + i * (w + gap), y: height / 2 - h / 2, w, h };
}

export function drawChoiceScreen(ctx, width, height, options) {
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
    ctx.font = "13px monospace";
    const lines = opt.desc.split("\n");
    lines.forEach((line, li) => {
      ctx.fillText(line, box.x + box.w / 2, box.y + 108 + li * 20);
    });
  }
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
