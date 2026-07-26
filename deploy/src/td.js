// 塔防模式 (2026-07-16 用户新模式规格): BTD 式守入口玩法。
// 设计原则: 深度复用——怪物用现有 Enemy 实体(目标从玩家换成路径点),
// sans 塔用"伪玩家"跑现有武器系统(数值 getter 代理到主 player,
// 攻击/攻速/增伤卡与商店加成零改动全塔生效),掉落/结算管线照旧。
// 本文件只放 TD 专属逻辑: 地图/路径/入口/塔位/选人/绘制。
import { t, pick } from "./i18n.js";

// ---- 地图 -------------------------------------------------------------------
// 网格随机走廊: 从右缘随机行蜿蜒到左缘中间的入口。走廊格不可放置,
// 怪物只走走廊(到了可放置地面必须绕道=永远沿 waypoints 走)。

export const TD_CELL = 54;

export function tdBuildMap(width, height, wallH) {
  const cols = Math.floor(width / TD_CELL); // 17 @960
  const rows = Math.floor((height - wallH - 10) / TD_CELL); // 9 @600/100
  const oy = wallH + 6;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0=可放置 1=走廊 2=障碍
  const midRow = Math.floor(rows / 2);
  // 从右往左刻走廊: 每前进 2-4 列随机竖折一次,最后两列并回中行
  let row = 1 + Math.floor(Math.random() * (rows - 2));
  const cells = []; // [{c,r}] 右→左顺序
  let c = cols - 1;
  while (c >= 0) {
    grid[row][c] = 1;
    cells.push({ c, r: row });
    if (c === 0) break;
    const targetRow = c <= 2 ? midRow : row;
    let jog = 0;
    if (c > 2 && Math.random() < 0.45) jog = Math.floor(Math.random() * (rows - 2)) + 1 - row;
    if (c <= 2) jog = targetRow - row;
    const step = Math.sign(jog);
    for (let k = 0; k !== jog; k += step) {
      row += step;
      grid[row][c] = 1;
      cells.push({ c, r: row });
    }
    c -= 1;
  }
  // 随机障碍岩块: 走廊外再啃掉几格,地图差异感(不许贴走廊起终点)
  let blocks = 5 + Math.floor(Math.random() * 4);
  let guard = 60;
  while (blocks > 0 && guard-- > 0) {
    const rr = Math.floor(Math.random() * rows);
    const cc = 1 + Math.floor(Math.random() * (cols - 2));
    if (grid[rr][cc] === 0) {
      grid[rr][cc] = 2;
      blocks--;
    }
  }
  const center = (cell) => ({ x: cell.c * TD_CELL + TD_CELL / 2, y: oy + cell.r * TD_CELL + TD_CELL / 2 });
  const waypoints = cells.map(center);
  const gate = center(cells[cells.length - 1]);
  return {
    cols,
    rows,
    oy,
    grid,
    cells,
    waypoints,
    spawn: { x: width + 30, y: waypoints[0].y }, // 屏外右缘进场
    entranceXY: { x: gate.x - TD_CELL * 0.55, y: gate.y }, // 红门贴左缘
  };
}

export function tdCellAt(map, x, y) {
  const c = Math.floor(x / TD_CELL);
  const r = Math.floor((y - map.oy) / TD_CELL);
  if (c < 0 || c >= map.cols || r < 0 || r >= map.rows) return null;
  return { c, r, kind: map.grid[r][c] };
}

export function tdCellCenter(map, c, r) {
  return { x: c * TD_CELL + TD_CELL / 2, y: map.oy + r * TD_CELL + TD_CELL / 2 };
}

// ---- 入口 -------------------------------------------------------------------

export function tdNewEntrance(map) {
  return {
    x: map.entranceXY.x,
    y: map.entranceXY.y,
    radius: 30,
    hp: 100,
    maxHp: 100,
    regen: 0, // 回血卡喂这里;被破坏后永久归零
    dmgReduction: 0,
    dodge: 0,
    destroyed: false,
    hitFlash: 0,
    warnT: 0,
  };
}

// 怪物打入口: 命中/闪避/减伤都在这里结算
export function tdHitEntrance(entrance, dmg) {
  if (entrance.dodge > 0 && Math.random() < entrance.dodge) return 0;
  const real = Math.max(1, Math.round(dmg * (1 - entrance.dmgReduction)));
  entrance.hp = Math.max(0, entrance.hp - real);
  entrance.hitFlash = 0.35;
  if (entrance.hp <= 0 && !entrance.destroyed) {
    entrance.destroyed = true;
    entrance.regen = 0; // 破坏后不能回血(用户规格)
    entrance.warnT = 999999;
  }
  return real;
}

export function tdEntranceTick(entrance, dt) {
  if (entrance.hitFlash > 0) entrance.hitFlash -= dt;
  if (!entrance.destroyed && entrance.regen > 0) {
    entrance.hp = Math.min(entrance.maxHp, entrance.hp + entrance.regen * dt);
  }
}

// ---- 经验经济 ---------------------------------------------------------------
// 击杀得经验(蛙吉特5/杰瑞15,用户点名;其余按体型/威胁自由发挥),
// 精英/首领大幅加成;经验用于放置 sans,每放一个全体价格 ×10。

const TD_XP_BASE = { slime: 5, bat: 6, ghost: 8, tank: 15, red: 10, orange: 14, blue: 12, purple: 12 };

export function tdXpFor(enemy, xpMult = 1) {
  const base = TD_XP_BASE[enemy.type] || 8;
  const eliteMult = enemy.championProfile ? 30 : enemy.eliteProfile ? 10 : enemy.elite ? 6 : 1;
  return Math.max(1, Math.round(base * eliteMult * xpMult));
}

export function tdPlaceCost(charCost, placedCount) {
  // 免费四人 1000 起,精神错乱 10000,黑客 15000;每放一个全体 ×10
  return (charCost || 1000) * Math.pow(10, placedCount);
}

// ---- TD 局状态工厂 ----------------------------------------------------------

export function tdNewRun(map, roster) {
  return {
    map,
    entrance: tdNewEntrance(map),
    xp: 1000, // 开局经验(用户规格)
    towers: [], // {slot, charId, weaponId, pp}
    placedCount: 0,
    armedSlot: -1, // 待放置的 roster 槽位(-1=未选)
    roster, // [{charId, weaponId, cost, placed}]
    lost: false,
    lostT: 0,
  };
}

// 塔的伪玩家: 数值字段 getter 代理到主 player——攻击/攻速/增伤选卡与
// 商店力量/结晶加成天然对全体塔生效;位置固定,位移类武器已在选人时排除
export function tdMakeTowerPP(x, y, charId, weaponInst, player) {
  return {
    x,
    y,
    dir: "left",
    moving: false,
    walkTime: 0,
    invuln: 0,
    guardBonus: 0,
    shieldTimer: 0,
    macroBoost: 1,
    character: charId,
    weapons: [weaponInst],
    kills: 0,
    get atk() { return player.atk; },
    get dmgAmp() { return player.dmgAmp; },
    get metaDmg() { return player.metaDmg; },
    get fireRate() { return player.fireRate; },
    get range() { return player.range; },
    get projectileSpeed() { return player.projectileSpeed; },
    get level() { return player.level; },
  };
}

// 位移/依赖本体的武器进不了塔防(塔不能动,用户规格)
export const TD_WEAPON_BANNED = new Set(["dash", "ipounce", "ihook", "hride", "shield", "hmacro"]);

export function tdWeaponAllowed(w) {
  return !TD_WEAPON_BANNED.has(w.id) && !w.support && !w.choiceOnly;
}

// ---- 怪物寻路 ---------------------------------------------------------------
// 目标=当前路径点;逼近则推进;最后一点=入口——停在门口输出。
// icecap(teleporter)的标记目标喂"前方第5个路径格"(半场非sans区,用户规格)。

export function tdTargetFor(e, map) {
  const wps = map.waypoints;
  if (e.tdWp === undefined) {
    // 非 spawner 来源(开局热身怪/手工精英)就近入轨,不用跑回右端重走
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < wps.length; i++) {
      const d = Math.hypot(e.x - wps[i].x, e.y - wps[i].y);
      if (d < bd) { bd = d; best = i; }
    }
    e.tdWp = best;
  }
  if (e.tdJumpTo !== undefined) {
    // icecap 瞬移落地: 路径索引跳到标记点
    e.tdWp = e.tdJumpTo;
    delete e.tdJumpTo;
  }
  let wp = wps[Math.min(e.tdWp, wps.length - 1)];
  if (Math.hypot(e.x - wp.x, e.y - wp.y) < 24 && e.tdWp < wps.length - 1) {
    e.tdWp += 1;
    wp = wps[e.tdWp];
  }
  if (e.teleporter && !e.mark && e.markTimer <= 0.05) {
    // 只在"即将落标记"那一帧喂前方路径格(半场非sans区),其余时间照常
    // 沿当前路径点走——否则它会直奔跳点抄近路穿地面
    const jump = Math.min(e.tdWp + 5, wps.length - 1);
    e.tdJumpPending = jump;
    return wps[jump];
  }
  return wp;
}

export function tdAtGate(e, map) {
  const last = map.waypoints[map.waypoints.length - 1];
  return Math.hypot(e.x - last.x, e.y - last.y) < TD_CELL * 0.9;
}

// ---- 绘制 -------------------------------------------------------------------

export function drawTdField(ctx, map, entrance, armed, hoverCell, towers) {
  // 地面: 可放置=暗紫地砖,走廊=深色石路,障碍=岩块
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      const x = c * TD_CELL;
      const y = map.oy + r * TD_CELL;
      const kind = map.grid[r][c];
      if (kind === 1) {
        // 走廊: 比地面亮一档的踩实土路 + 中央暗红引导点——怪走哪条路
        // 必须零学习成本读出来(放置绿格只在选卡时亮,平时全靠这里)
        ctx.fillStyle = "#241b26";
        ctx.fillRect(x, y, TD_CELL, TD_CELL);
        ctx.strokeStyle = "#3a2a34";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, TD_CELL - 2, TD_CELL - 2);
        ctx.fillStyle = "#5a2430";
        ctx.fillRect(x + TD_CELL / 2 - 3, y + TD_CELL / 2 - 3, 6, 6);
      } else if (kind === 2) {
        ctx.fillStyle = "#171322";
        ctx.fillRect(x, y, TD_CELL, TD_CELL);
        ctx.fillStyle = "#2c2438";
        ctx.fillRect(x + 12, y + 16, TD_CELL - 24, TD_CELL - 28); // 岩块
        ctx.fillStyle = "#3a3050";
        ctx.fillRect(x + 16, y + 12, TD_CELL - 32, 10);
      } else {
        ctx.fillStyle = "#171322";
        ctx.fillRect(x, y, TD_CELL, TD_CELL);
        ctx.strokeStyle = "rgba(58,48,80,0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TD_CELL - 1, TD_CELL - 1);
      }
    }
  }
  // 放置态: 可放格泛绿,悬停格高亮
  if (armed) {
    ctx.save();
    for (let r = 0; r < map.rows; r++) {
      for (let c = 0; c < map.cols; c++) {
        if (map.grid[r][c] !== 0) continue;
        if (towers.some((tw) => tw.cell.c === c && tw.cell.r === r)) continue;
        ctx.fillStyle = hoverCell && hoverCell.c === c && hoverCell.r === r ? "rgba(124,242,138,0.4)" : "rgba(124,242,138,0.12)";
        ctx.fillRect(c * TD_CELL + 2, map.oy + r * TD_CELL + 2, TD_CELL - 4, TD_CELL - 4);
      }
    }
    ctx.restore();
  }
  // 入口红门: 心脏一样的目标物,受击白闪,破坏后碎裂冒烟
  const g = entrance;
  ctx.save();
  const pulse = g.destroyed ? 0 : 0.5 + Math.sin(performance.now() / 300) * 0.5;
  ctx.shadowColor = "#ff3d5a";
  ctx.shadowBlur = g.destroyed ? 4 : 10 + pulse * 10;
  ctx.fillStyle = g.hitFlash > 0 ? "#ffffff" : g.destroyed ? "#5a2430" : "#c81e3c";
  ctx.fillRect(g.x - 14, g.y - 26, 22, 52);
  ctx.fillStyle = g.hitFlash > 0 ? "#ffffff" : g.destroyed ? "#3a1820" : "#8f1029";
  ctx.fillRect(g.x - 8, g.y - 18, 12, 36);
  if (g.destroyed) {
    ctx.fillStyle = "#100d18";
    ctx.fillRect(g.x - 10, g.y - 10, 8, 20); // 破洞
  }
  ctx.restore();
}

// 入口血条(左上,替代玩家血条位)
export function drawTdEntranceHud(ctx, entrance) {
  const w = 264;
  const h = 22;
  ctx.save();
  ctx.fillStyle = "#241f2b";
  ctx.fillRect(16, 16, w, h);
  const pct = Math.max(0, entrance.hp / entrance.maxHp);
  ctx.fillStyle = entrance.destroyed ? "#5a2430" : pct > 0.3 ? "#ff3d5a" : "#ff2d2d";
  ctx.fillRect(18, 18, (w - 4) * pct, h - 4);
  if (entrance.hitFlash > 0) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(18, 18, (w - 4) * pct, h - 4);
    ctx.globalAlpha = 1;
  }
  const low = !entrance.destroyed && pct > 0 && pct < 0.3;
  ctx.strokeStyle = low ? `rgba(255,45,45,${0.6 + 0.4 * Math.sin(performance.now() / 160)})` : "#f2ead8";
  ctx.lineWidth = low ? 3 : 2;
  ctx.strokeRect(16, 16, w, h);
  ctx.fillStyle = "#f2ead8";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    entrance.destroyed ? t("⚠ 入口已被破坏!", "⚠ GATE DESTROYED!") : `${t("入口", "GATE")} ${Math.ceil(entrance.hp)}/${entrance.maxHp}`,
    22,
    32
  );
  ctx.restore();
}

// ---- 模式选择 / 塔防选人 UI 的矩形与绘制 ------------------------------------

export function modeOptionRect(i, width, height) {
  const w = 460;
  const h = 74;
  return { x: width / 2 - w / 2, y: 150 + i * (h + 22), w, h };
}

export function drawModeSelect(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText(t("选 择 模 式", "SELECT MODE"), width / 2, 92);
  const modes = [
    { name: t("经 典 模 式", "CLASSIC"), hint: t("五分钟构筑,挑战天意侵蚀Sans", "Five minutes of building toward the Boss"), color: "#7ea8ff" },
    { name: t("每 日 挑 战", "DAILY RUN"), hint: t("全球同一起跑线,每天一张新考卷", "One seed, one fair race, every day"), color: "#c59bff" },
    { name: t("塔 防 模 式", "TOWER DEFENSE"), hint: t("放置sans守住入口,怪物冲向左侧大门", "Place your sans, hold the gate on the left"), color: "#ff8a5d" },
  ];
  modes.forEach((m, i) => {
    const r = modeOptionRect(i, width, height);
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = m.color;
    ctx.font = "bold 20px monospace";
    ctx.fillText(m.name, width / 2, r.y + 32);
    ctx.fillStyle = "#9a93ab";
    ctx.font = "12px monospace";
    ctx.fillText(m.hint, width / 2, r.y + 56);
  });
  ctx.restore();
}

// 塔防选人: 上排角色卡,中排该角色可用武器,底部已选队列(≤3)+开战键
export function tdPickCharRect(i, width) {
  const w = 138;
  const gap = 12;
  const total = 6 * w + 5 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: 96, w, h: 96 };
}

export function tdPickWeaponRect(i, width) {
  const w = 214;
  const gap = 10;
  const total = 4 * w + 3 * gap;
  const col = i % 4;
  const row = Math.floor(i / 4);
  return { x: width / 2 - total / 2 + col * (w + gap), y: 224 + row * 56, w, h: 48 };
}

export function tdRosterSlotRect(i, width, height) {
  const w = 190;
  const gap = 14;
  const total = 3 * w + 2 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - 168, w, h: 56 };
}

export function tdStartRect(width, height) {
  return { x: width / 2 - 150, y: height - 96, w: 300, h: 54 };
}

export function drawTdPick(ctx, width, height, chars, sel, weapons, roster, locksInfo) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff8a5d";
  ctx.font = "bold 26px monospace";
  ctx.fillText(t("塔 防 编 队", "TD SQUAD"), width / 2, 48);
  ctx.fillStyle = "#9a93ab";
  ctx.font = "12px monospace";
  ctx.fillText(t("最多带 3 个 sans,每人只带 1 个技能;放置消耗经验,越放越贵", "Up to 3 sans, one skill each; placing costs XP and gets pricier"), width / 2, 72);

  chars.forEach((c, i) => {
    const r = tdPickCharRect(i, width);
    const locked = locksInfo[c.id];
    const on = i === sel;
    ctx.fillStyle = on ? "#2e2748" : "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = locked ? "#453f52" : on ? c.color : "#5a5468";
    ctx.lineWidth = on ? 3 : 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = locked ? "#5a5468" : c.color;
    ctx.font = "bold 13px monospace";
    ctx.fillText(pick(c, "name"), r.x + r.w / 2, r.y + 34);
    ctx.fillStyle = "#7d7690";
    ctx.font = "11px monospace";
    ctx.fillText(locked ? t("未解锁", "Locked") : `${t("放置", "Cost")} ${c.cost || 1000}`, r.x + r.w / 2, r.y + 58);
  });

  weapons.forEach((w, i) => {
    const r = tdPickWeaponRect(i, width);
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = w.color;
    ctx.font = "bold 13px monospace";
    ctx.fillText(pick(w, "name"), r.x + r.w / 2, r.y + 20);
    ctx.fillStyle = "#7d7690";
    ctx.font = "10px monospace";
    ctx.fillText(`[${pick(w, "tag")}]`, r.x + r.w / 2, r.y + 37);
  });

  // 已选队列
  ctx.fillStyle = "#9a93ab";
  ctx.font = "bold 13px monospace";
  ctx.fillText(t("出 战 队 列(点击移除)", "SQUAD (tap to remove)"), width / 2, height - 182);
  for (let i = 0; i < 3; i++) {
    const r = tdRosterSlotRect(i, width, height);
    const m = roster[i];
    ctx.fillStyle = m ? "#241a2e" : "#14101c";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = m ? "#ff8a5d" : "#3a3050";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    if (m) {
      ctx.fillStyle = "#f2ead8";
      ctx.font = "bold 13px monospace";
      ctx.fillText(pick(m.char, "name"), r.x + r.w / 2, r.y + 22);
      ctx.fillStyle = "#9a93ab";
      ctx.font = "11px monospace";
      ctx.fillText(pick(m.weapon, "name"), r.x + r.w / 2, r.y + 42);
    } else {
      ctx.fillStyle = "#453f52";
      ctx.font = "12px monospace";
      ctx.fillText(t("空 位", "empty"), r.x + r.w / 2, r.y + 33);
    }
  }
  const sr = tdStartRect(width, height);
  const ready = roster.length > 0;
  ctx.fillStyle = ready ? "#241a10" : "#14101c";
  ctx.fillRect(sr.x, sr.y, sr.w, sr.h);
  ctx.strokeStyle = ready ? "#ffd166" : "#453f52";
  ctx.lineWidth = 2;
  ctx.strokeRect(sr.x, sr.y, sr.w, sr.h);
  ctx.fillStyle = ready ? "#ffd166" : "#453f52";
  ctx.font = "bold 20px monospace";
  ctx.fillText(t("开 始 守 门", "HOLD THE GATE"), width / 2, sr.y + 35);
  ctx.restore();
}

// 局内底部编队栏: 三个成员卡(价格/已放置/待放置高亮)
export function tdBarSlotRect(i, width, height) {
  const w = 170;
  const gap = 10;
  const total = 3 * w + 2 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - 62, w, h: 52 };
}

export function drawTdBar(ctx, width, height, td) {
  ctx.save();
  ctx.textAlign = "center";
  td.roster.forEach((m, i) => {
    const r = tdBarSlotRect(i, width, height);
    const armed = td.armedSlot === i;
    const cost = tdPlaceCost(m.cost, td.placedCount);
    const afford = td.xp >= cost;
    ctx.fillStyle = m.placed ? "#14101c" : armed ? "#33240f" : "#1d1828";
    ctx.globalAlpha = 0.94;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = m.placed ? "#3a3050" : armed ? "#ffd93d" : afford ? "#7cf28a" : "#5a5468";
    ctx.lineWidth = armed ? 3 : 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = m.placed ? "#5a5468" : "#f2ead8";
    ctx.font = "bold 12px monospace";
    ctx.fillText(pick(m.char, "name"), r.x + r.w / 2, r.y + 20);
    ctx.font = "11px monospace";
    if (m.placed) {
      ctx.fillStyle = "#7cf28a";
      ctx.fillText(t("已上场", "Deployed"), r.x + r.w / 2, r.y + 40);
    } else {
      ctx.fillStyle = afford ? "#ffd166" : "#c95d5d";
      ctx.fillText(`${t("经验", "XP")} ${cost}`, r.x + r.w / 2, r.y + 40);
    }
  });
  // 经验余额(右下角,编队栏上方)
  ctx.fillStyle = "#7cf28a";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${t("经验", "XP")} ${Math.floor(td.xp)}`, width - 18, height - 74);
  ctx.restore();
}
