// 塔防模式 (2026-07-16 用户新模式规格): BTD 式守入口玩法。
// 设计原则: 深度复用——怪物用现有 Enemy 实体(目标从玩家换成路径点),
// sans 塔用"伪玩家"跑现有武器系统(数值 getter 代理到主 player,
// 攻击/攻速/增伤卡与商店加成零改动全塔生效),掉落/结算管线照旧。
// 本文件只放 TD 专属逻辑: 地图/路径/入口/塔位/选人/绘制。
import { t, pick } from "./i18n.js";
import { IS_TOUCH } from "./ui.js";
import { drawPixelIcon, weaponFormIcon } from "./sprites.js";

// ---- 地图 -------------------------------------------------------------------
// 网格随机走廊: 从右缘随机行蜿蜒到左缘中间的入口。走廊格不可放置,
// 怪物只走走廊(到了可放置地面必须绕道=永远沿 waypoints 走)。

export const TD_CELL = 54;
export const TD_BOSS_BASE_SPEED = 42;
export const TD_BOSS_TRAVEL_SECONDS = 42;
export const TD_BOSS_TARGET_TTK = 42;
export const TD_BOSS_GATE_DAMAGE = 10;
export const TD_BOSS_GATE_INTERVAL = 2.5;

export function tdBuildMap(width, height, wallH, random = Math.random) {
  const cols = Math.floor(width / TD_CELL); // 17 @960
  const rows = Math.floor((height - wallH - 10) / TD_CELL); // 9 @600/100
  const oy = wallH + 6;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0=可放置 1=走廊 2=障碍
  const midRow = Math.floor(rows / 2);
  // 从右往左刻一条走廊: 每前进 2-4 列随机竖折一次,最后两列并回中行
  const carveLane = (startRow) => {
    let row = startRow;
    const cells = []; // [{c,r}] 右→左顺序
    let c = cols - 1;
    while (c >= 0) {
      grid[row][c] = 1;
      cells.push({ c, r: row });
      if (c === 0) break;
      const targetRow = c <= 2 ? midRow : row;
      let jog = 0;
      if (c > 2 && random() < 0.45) {
        // 只折 1–2 格，避免随机一次从顶跳到底，造成同一设备也出现
        // 30 秒与 100 秒两种完全不同的路线；地图仍有形状差异。
        const dir = random() < 0.5 ? -1 : 1;
        const amount = random() < 0.75 ? 1 : 2;
        jog = Math.max(1, Math.min(rows - 2, row + dir * amount)) - row;
      }
      if (c <= 2) jog = targetRow - row;
      const step = Math.sign(jog);
      for (let k = 0; k !== jog; k += step) {
        row += step;
        grid[row][c] = 1;
        cells.push({ c, r: row });
      }
      c -= 1;
    }
    return cells;
  };
  // 多条进攻路线(2026-07-26 用户规格): 2-3 条走廊各自从右缘蜿蜒,
  // 最后两列全部并回中行同一红门。起始行错开,保证入场口视觉分离。
  const laneCount = 2 + (random() < 0.4 ? 1 : 0);
  const startRows = [];
  for (let li = 0; li < laneCount; li++) {
    let row = 1 + Math.floor(random() * (rows - 2));
    let tries = 12;
    while (startRows.some((r) => Math.abs(r - row) < 2) && tries-- > 0) {
      row = 1 + Math.floor(random() * (rows - 2));
    }
    startRows.push(row);
  }
  const center = (cell) => ({ x: cell.c * TD_CELL + TD_CELL / 2, y: oy + cell.r * TD_CELL + TD_CELL / 2 });
  const lanes = startRows.map((startRow) => {
    const cells = carveLane(startRow);
    const waypoints = cells.map(center);
    const spawn = { x: width + 30, y: waypoints[0].y }; // 屏外右缘进场
    let pathLength = Math.hypot(spawn.x - waypoints[0].x, spawn.y - waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      pathLength += Math.hypot(waypoints[i].x - waypoints[i - 1].x, waypoints[i].y - waypoints[i - 1].y);
    }
    return { cells, waypoints, spawn, pathLength };
  });
  // 随机障碍岩块: 走廊外再啃掉几格,地图差异感(不许贴走廊起终点)
  let blocks = 5 + Math.floor(random() * 4);
  let guard = 60;
  while (blocks > 0 && guard-- > 0) {
    const rr = Math.floor(random() * rows);
    const cc = 1 + Math.floor(random() * (cols - 2));
    if (grid[rr][cc] === 0) {
      grid[rr][cc] = 2;
      blocks--;
    }
  }
  const gate = center(lanes[0].cells[lanes[0].cells.length - 1]);
  return {
    cols,
    rows,
    oy,
    grid,
    lanes,
    // 旧字段镜像到 0 号车道: 既有调用(tdAtGate/入口/兜底)零改动继续工作
    cells: lanes[0].cells,
    waypoints: lanes[0].waypoints,
    spawn: lanes[0].spawn,
    pathLength: lanes[0].pathLength,
    entranceXY: { x: gate.x - TD_CELL * 0.55, y: gate.y }, // 红门贴左缘
  };
}

// 车道解析: e.tdLane 缺失/越界时(开局热身怪、手工来源)全车道最近路径点入轨
export function tdLaneFor(e, map) {
  const lanes = map.lanes || [{ cells: map.cells, waypoints: map.waypoints, spawn: map.spawn, pathLength: map.pathLength }];
  if (e.tdLane === undefined || e.tdLane >= lanes.length) {
    let bestLane = 0;
    let bestWp = 0;
    let bd = Infinity;
    lanes.forEach((lane, li) => {
      lane.waypoints.forEach((p, wi) => {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < bd) { bd = d; bestLane = li; bestWp = wi; }
      });
    });
    e.tdLane = bestLane;
    if (e.tdWp === undefined) e.tdWp = bestWp;
  }
  return lanes[e.tdLane];
}

// 以“42 速度走 42 秒”为统一路线预算。宽屏会生成更长的路径，因此只
// 提高沿路敌人的像素速度，不增加它们到门所需的现实时间。这样手机、
// 电脑、不同随机地图和不同车道面对的是同一波次压力。
export function tdRouteSpeed(map, baseSpeed, laneIdx = 0) {
  const referenceDistance = TD_BOSS_BASE_SPEED * TD_BOSS_TRAVEL_SECONDS;
  const lane = map.lanes?.[laneIdx];
  const pathLength = lane ? lane.pathLength : map.pathLength;
  return baseSpeed * (pathLength / referenceDistance);
}

export function tdRouteTravelSeconds(map, normalizedSpeed, laneIdx = 0) {
  const lane = map.lanes?.[laneIdx];
  const pathLength = lane ? lane.pathLength : map.pathLength;
  return pathLength / Math.max(0.001, normalizedSpeed);
}

export function tdNormalizeEnemySpeed(enemy, map) {
  if (!enemy.tdSpeedNormalized) {
    enemy.speed = tdRouteSpeed(map, enemy.speed, enemy.tdLane ?? 0);
    enemy.tdSpeedNormalized = true;
  }
  return enemy.speed;
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
  // 2026-07-26 用户裁决: 同一角色可以重复放置;免费角色第一座免费,
  // 之后全队走 1000→10000→100000 梯度;付费角色每一座至少其角色价
  // (黑客初始 15000、精神错乱 10000,不再免费),梯度超过底价后按梯度走。
  const ladder = placedCount <= 0 ? 0 : 1000 * Math.pow(10, placedCount - 1);
  const premiumFloor = (charCost || 0) >= 10000 ? charCost : 0;
  return Math.max(ladder, premiumFloor);
}

export function tdLeaderDamagePct(roster) {
  return Math.max(0, Math.round(Number(roster?.[0]?.teamDmgPct) || 0));
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
    // Phase 2: TD 版天意侵蚀Sans(走路径Boss)
    bossSpawned: false,
    bossDown: false,
    dmgLog: [], // 每秒一条 Enemy.dmgDealt 累计快照,Boss血量按窗口DPS标定
    dmgLogT: 0,
    introPending: false, // 首次教学确认前冻结计时、刷怪和路径移动
  };
}

// 全塔滚动DPS: dmgLog 存最近约30秒的累计输出快照,差分即窗口均值。
// Boss 血量沿用经典的自适应思路(实测输出×目标时长),TD 目标≈42秒——
// 走廊行军约30秒,留一小段门口输出窗;上下限防炸(没放塔/极限构筑)。
export function tdMeasuredDps(td) {
  const log = td.dmgLog;
  if (log.length < 2) return 0;
  return Math.max(0, (log[log.length - 1] - log[0]) / (log.length - 1));
}

export function tdBossHp(dps) {
  return Math.round(Math.min(1500000, Math.max(9000, dps * TD_BOSS_TARGET_TTK)));
}

export function tdConfigureBoss(enemy, map, dps, laneIdx = 0) {
  enemy.tdBoss = true;
  enemy.maxLives = 1;
  enemy.lives = 1;
  enemy.teleporter = false;
  enemy.mark = null;
  enemy.maxHp = tdBossHp(dps);
  enemy.hp = enemy.maxHp;
  enemy.speed = TD_BOSS_BASE_SPEED;
  enemy.tdLane = Math.min(laneIdx, (map.lanes?.length || 1) - 1);
  tdNormalizeEnemySpeed(enemy, map);
  enemy.gateDmg = TD_BOSS_GATE_DAMAGE;
  enemy.contactInterval = TD_BOSS_GATE_INTERVAL;
  enemy.radius = Math.round(enemy.radius * 1.5);
  enemy.attackRange = enemy.radius;
  enemy.invulnTimer = 3;
  enemy.tdWp = 0;
  return enemy;
}

export function tdTestHooksAllowed(hostname = "", debugUnlocked = false) {
  const host = String(hostname || "").toLowerCase();
  return debugUnlocked || !host || host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function tdKillCredit(enemy) {
  return enemy?.tdBoss ? 50 : 1;
}

export function tdDirectCoinDrop(enemy, coinFactor, random = Math.random) {
  if (coinFactor <= 0 || enemy?.tdBoss) return 0;
  if (enemy?.championProfile) return 8;
  if (enemy?.elite) return 3;
  return random() < 0.13 * coinFactor ? 1 + Math.floor(random() * 2) : 0;
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
  // 先定车道(缺失时全车道就近入轨),再按该车道路径长度归一速度
  const lane = tdLaneFor(e, map);
  tdNormalizeEnemySpeed(e, map);
  const wps = lane.waypoints;
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
        // 走廊: 比地面亮一档的踩实土路——怪走哪条路必须零学习成本读出来
        // (放置绿格只在选卡时亮,平时全靠这里;流向箭头在格子循环后统一画)
        ctx.fillStyle = "#241b26";
        ctx.fillRect(x, y, TD_CELL, TD_CELL);
        ctx.strokeStyle = "#3a2a34";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, TD_CELL - 2, TD_CELL - 2);
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
  // 走廊流向箭头(Phase 2): 每格一枚指向下一路径点的暗红箭头,亮度沿
  // 行进方向脉冲流动——不看文字也知道怪从右缘涌向左门
  ctx.save();
  ctx.strokeStyle = "#8f3448";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const flowPhase = performance.now() / 380;
  for (const lane of map.lanes || [{ cells: map.cells, waypoints: map.waypoints }])
  for (let k = 0; k < lane.cells.length - 1; k++) {
    const a = lane.waypoints[k];
    const b = lane.waypoints[k + 1];
    const dx = Math.sign(b.x - a.x);
    const dy = Math.sign(b.y - a.y);
    // 波峰沿 k 增大方向移动;基础透明度保证静止时也读得出方向
    const crest = Math.sin(flowPhase - k * 0.55);
    ctx.globalAlpha = 0.22 + 0.5 * Math.max(0, crest) * Math.max(0, crest);
    const s = 6;
    ctx.beginPath();
    if (dx !== 0) {
      ctx.moveTo(a.x - dx * s, a.y - s);
      ctx.lineTo(a.x + dx * s, a.y);
      ctx.lineTo(a.x - dx * s, a.y + s);
    } else {
      ctx.moveTo(a.x - s, a.y - dy * s);
      ctx.lineTo(a.x, a.y + dy * s);
      ctx.lineTo(a.x + s, a.y - dy * s);
    }
    ctx.stroke();
  }
  ctx.restore();
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

// 入口血条(左上,替代玩家血条位);触控大档整体放大保可读
export function drawTdEntranceHud(ctx, entrance, width = 0) {
  const big = bigUi(width);
  const w = big ? 336 : 264;
  const h = big ? 30 : 22;
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
  ctx.font = `bold ${big ? 17 : 13}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(
    entrance.destroyed ? t("⚠ 入口已被破坏!", "⚠ GATE DESTROYED!") : `${t("入口", "GATE")} ${Math.ceil(entrance.hp)}/${entrance.maxHp}`,
    22,
    16 + h / 2 + (big ? 6 : 5)
  );
  ctx.restore();
}

// ---- 模式选择 / 塔防选人 UI 的矩形与绘制 ------------------------------------

const isPhoneLayout = (width) => width >= 1000;
// 触控大档: 手机画布或触屏设备(平板 960 画布)都用放大的局内控件——
// 编队卡/血条/文字按 ≥44 物理像素标准设计,桌面鼠标保持紧凑
const bigUi = (width) => isPhoneLayout(width) || IS_TOUCH;

export function tdModeOptions() {
  return [
    { name: t("经 典 模 式", "CLASSIC"), hint: t("五分钟构筑,挑战天意侵蚀Sans", "Five minutes of building toward the Boss"), color: "#7ea8ff" },
    { name: t("每 日 挑 战", "DAILY RUN"), hint: t("全球同一起跑线,每天一张新考卷", "One seed, one fair race, every day"), color: "#c59bff" },
    { name: t("塔 防 模 式", "TOWER DEFENSE"), hint: t("放置sans守住入口,怪物冲向左侧大门", "Place your sans, hold the gate on the left"), color: "#ff8a5d" },
  ];
}

function drawKeyboardFocus(ctx, r, color = "#f2ead8") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 5]);
  ctx.strokeRect(r.x + 5, r.y + 5, r.w - 10, r.h - 10);
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(r.x + 12, r.y + r.h / 2 - 7);
  ctx.lineTo(r.x + 24, r.y + r.h / 2);
  ctx.lineTo(r.x + 12, r.y + r.h / 2 + 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function modeOptionRect(i, width, height) {
  const w = 460;
  const h = 74;
  return { x: width / 2 - w / 2, y: 150 + i * (h + 22), w, h };
}

export function drawModeSelect(ctx, width, height, keyboardFocus = -1) {
  const phone = isPhoneLayout(width);
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = `bold ${phone ? 34 : 30}px monospace`;
  ctx.fillText(t("选 择 模 式", "SELECT MODE"), width / 2, 92);
  const modes = tdModeOptions();
  modes.forEach((m, i) => {
    const r = modeOptionRect(i, width, height);
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = m.color;
    ctx.font = `bold ${phone ? 22 : 20}px monospace`;
    ctx.fillText(m.name, width / 2, r.y + 32);
    ctx.fillStyle = "#9a93ab";
    ctx.font = `${phone ? 17 : 12}px monospace`;
    ctx.fillText(m.hint, width / 2, r.y + 56);
    if (keyboardFocus === i) drawKeyboardFocus(ctx, r);
  });
  if (keyboardFocus >= 0 && !phone) {
    ctx.fillStyle = "#8fd6ff";
    ctx.font = "13px monospace";
    ctx.fillText(t("↑↓ 选择 · Enter 确认 · Esc 返回", "↑↓ Choose · Enter Confirm · Esc Back"), width / 2, height - 16);
  }
  ctx.restore();
}

// 塔防选人: 上排角色卡,中排该角色可用武器,底部已选队列(≤3)+开战键
export function tdPickCharRect(i, width) {
  if (isPhoneLayout(width)) {
    const gap = 14;
    const total = Math.min(1120, width - 120);
    const w = (total - gap * 5) / 6;
    return { x: width / 2 - total / 2 + i * (w + gap), y: 78, w, h: 86 };
  }
  const w = 138;
  const gap = 12;
  const total = 6 * w + 5 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: 96, w, h: 96 };
}

export function tdPickWeaponRect(i, width) {
  if (isPhoneLayout(width)) {
    const cols = 4;
    const gap = 14;
    const total = Math.min(1100, width - 160);
    const w = (total - gap * (cols - 1)) / cols;
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { x: width / 2 - total / 2 + col * (w + gap), y: 184 + row * 82, w, h: 70 };
  }
  const w = 214;
  const gap = 10;
  const total = 4 * w + 3 * gap;
  const col = i % 4;
  const row = Math.floor(i / 4);
  return { x: width / 2 - total / 2 + col * (w + gap), y: 224 + row * 56, w, h: 48 };
}

export function tdRosterSlotRect(i, width, height) {
  if (isPhoneLayout(width)) {
    const gap = 16;
    const total = Math.min(840, width - 360);
    const w = (total - gap * 2) / 3;
    return { x: width / 2 - total / 2 + i * (w + gap), y: 374, w, h: 72 };
  }
  const w = 190;
  const gap = 14;
  const total = 3 * w + 2 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - 168, w, h: 56 };
}

export function tdStartRect(width, height) {
  if (isPhoneLayout(width)) return { x: width / 2 - 180, y: height - 116, w: 360, h: 76 };
  return { x: width / 2 - 150, y: height - 96, w: 300, h: 54 };
}

export function drawTdPick(ctx, width, height, chars, sel, weapons, roster, locksInfo, keyboardFocus = null) {
  const phone = isPhoneLayout(width);
  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff8a5d";
  ctx.font = `bold ${phone ? 32 : 26}px monospace`;
  ctx.fillText(t("塔 防 编 队", "TD SQUAD"), width / 2, phone ? 38 : 48);
  ctx.fillStyle = "#9a93ab";
  ctx.font = `${phone ? 17 : 12}px monospace`;
  ctx.fillText(
    phone
      ? t("选 1–3 名 sans · 每人 1 个技能", "Pick 1–3 sans · one skill each")
      : t("最多带 3 个 sans,每人只带 1 个技能;放置消耗经验,越放越贵", "Up to 3 sans, one skill each; placing costs XP and gets pricier"),
    width / 2,
    phone ? 64 : 72
  );

  // ① 选人区: 左上角步骤标签锚定第一张角色卡
  const charRect0 = tdPickCharRect(0, width);
  ctx.textAlign = "left";
  ctx.fillStyle = "#8fd6ff";
  ctx.font = `bold ${phone ? 15 : 12}px monospace`;
  ctx.fillText(t("① 选 sans", "① Pick a sans"), charRect0.x + 2, charRect0.y - 6);
  ctx.textAlign = "center";

  chars.forEach((c, i) => {
    const r = tdPickCharRect(i, width);
    const locked = locksInfo[c.id];
    const on = i === sel;
    ctx.fillStyle = on ? "#2e2748" : "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    if (on && !locked) {
      // 选中态: 角色色底纹,和下方武器分组框同色呼应
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = c.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.restore();
    }
    ctx.strokeStyle = locked ? "#453f52" : on ? c.color : "#5a5468";
    ctx.lineWidth = on ? 3 : 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = locked ? "#5a5468" : c.color;
    ctx.font = `bold ${phone ? 20 : 13}px monospace`;
    ctx.fillText(pick(c, "name"), r.x + r.w / 2, r.y + (phone ? 31 : 34));
    ctx.fillStyle = "#7d7690";
    ctx.font = `${phone ? 16 : 11}px monospace`;
    // 付费角色首座就收角色底价(tdPlaceCost),不能沿用"首塔免费"文案
    ctx.fillText(
      locked ? t("未解锁", "Locked") : c.cost ? t(`每座 ≥${c.cost}`, `≥${c.cost} per tower`) : t("全队首塔免费", "Team's first tower free"),
      r.x + r.w / 2,
      r.y + (phone ? 62 : 58)
    );
    // 入队队徽(2026-07-27): 已在③队伍里的角色,卡右上角标队长/入队——
    // 入队反馈不再只藏在底部队伍栏
    const slot = roster.findIndex((m) => m.charId === c.id);
    if (slot >= 0) {
      const lead = slot === 0;
      const label = lead ? t("队长", "LEAD") : t("入队", "IN");
      ctx.font = `bold ${phone ? 13 : 10}px monospace`;
      const bw = ctx.measureText(label).width + (phone ? 12 : 8);
      const bh = phone ? 20 : 15;
      const bx = r.x + r.w - bw - 3;
      const by = r.y + 3;
      ctx.fillStyle = lead ? "#33240f" : "#12241a";
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = lead ? "#ffd166" : "#7cf28a";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = lead ? "#ffd166" : "#7cf28a";
      ctx.fillText(label, bx + bw / 2, by + bh - (phone ? 5 : 4));
    }
    if (keyboardFocus?.zone === "char" && keyboardFocus.index === i) drawKeyboardFocus(ctx, r);
  });

  // ② 技能区: 当前角色色的分组框——被选中的角色卡向下打 ▼,框线嵌图例
  // 「给『XX』配 1 个技能」。角色一换,框/图例/▼ 同步换色换名,
  // "中间这排武器属于上面选中的人"不用读说明也能看懂
  const selChar = chars[sel];
  const selLocked = locksInfo[selChar?.id];
  const groupColor = selLocked ? "#5a5468" : selChar?.color || "#5a5468";
  if (weapons.length) {
    let fx0 = Infinity;
    let fy0 = Infinity;
    let fx1 = -Infinity;
    let fy1 = -Infinity;
    weapons.forEach((w, i) => {
      const r = tdPickWeaponRect(i, width);
      fx0 = Math.min(fx0, r.x);
      fy0 = Math.min(fy0, r.y);
      fx1 = Math.max(fx1, r.x + r.w);
      fy1 = Math.max(fy1, r.y + r.h);
    });
    const pad = phone ? 8 : 7;
    ctx.save();
    ctx.strokeStyle = groupColor;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx0 - pad, fy0 - pad, fx1 - fx0 + pad * 2, fy1 - fy0 + pad * 2);
    ctx.restore();
    // fieldset 式图例: 垫底色块盖住框线,文字骑线
    const legend = selLocked
      ? t(`② ${pick(selChar, "name")} · 未解锁`, `② ${pick(selChar, "name")} · Locked`)
      : t(`② 给「${pick(selChar, "name")}」配 1 个技能`, `② Pick 1 skill for ${pick(selChar, "name")}`);
    ctx.font = `bold ${phone ? 15 : 12}px monospace`;
    const lw = ctx.measureText(legend).width;
    // 手机档图例放框线右上角: 左侧窄带留给选中卡的 ▼ 连接符,互不相压
    const legendX = phone ? fx1 + pad - lw - 22 : fx0 - pad + 10;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(10, 8, 16, 0.97)";
    ctx.fillRect(legendX, fy0 - pad - (phone ? 10 : 8), lw + 12, phone ? 20 : 16);
    ctx.fillStyle = groupColor;
    ctx.fillText(legend, legendX + 6, fy0 - pad + (phone ? 5 : 4));
    ctx.textAlign = "center";
    // 选中角色卡 → 分组框的 ▼ 连接符(最后画,不被图例垫底块盖住)
    if (selChar) {
      const sr = tdPickCharRect(sel, width);
      ctx.fillStyle = groupColor;
      ctx.beginPath();
      const ay = fy0 - pad;
      ctx.moveTo(sr.x + sr.w / 2 - 7, sr.y + sr.h + 2);
      ctx.lineTo(sr.x + sr.w / 2 + 7, sr.y + sr.h + 2);
      ctx.lineTo(sr.x + sr.w / 2, Math.min(sr.y + sr.h + 12, ay + 1));
      ctx.closePath();
      ctx.fill();
    }
  }

  weapons.forEach((w, i) => {
    const r = tdPickWeaponRect(i, width);
    ctx.fillStyle = "#1d1828";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // 形态族像素图标(左侧竖直居中): 扫一眼就知道这把怎么打
    const icon = weaponFormIcon(w);
    if (icon) drawPixelIcon(ctx, icon, r.x + (phone ? 10 : 8), r.y + r.h / 2 - (phone ? 11 : 8), phone ? 22 : 16);
    ctx.fillStyle = w.color;
    ctx.font = `bold ${phone ? 19 : 13}px monospace`;
    ctx.fillText(pick(w, "name"), r.x + r.w / 2, r.y + (phone ? 28 : 20));
    ctx.fillStyle = "#7d7690";
    ctx.font = `${phone ? 16 : 10}px monospace`;
    ctx.fillText(`[${pick(w, "tag")}]`, r.x + r.w / 2, r.y + (phone ? 54 : 37));
    if (keyboardFocus?.zone === "weapon" && keyboardFocus.index === i) drawKeyboardFocus(ctx, r);
  });

  // 已选队列
  ctx.fillStyle = "#9a93ab";
  ctx.font = `bold ${phone ? 17 : 13}px monospace`;
  const leaderPct = tdLeaderDamagePct(roster);
  const leaderRule = roster.length
    ? leaderPct > 0
      ? t(`队长让全塔伤害 +${leaderPct}%`, `Leader gives all towers +${leaderPct}% damage`)
      : t("队长无团队加成", "Leader has no team bonus")
    : t("第一位成员是队长", "First member becomes leader");
  ctx.fillText(
    phone
      ? t(`③ 队伍 ${roster.length}/3 · ${leaderRule}`, `③ SQUAD ${roster.length}/3 · ${leaderRule}`)
      : t(`③ 出战队列 ${roster.length}/3 · ${leaderRule}`, `③ SQUAD ${roster.length}/3 · ${leaderRule}`),
    width / 2,
    phone ? 360 : height - 182
  );
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
      ctx.font = `bold ${phone ? 18 : 13}px monospace`;
      const memberName = i === 0 ? t(`队长·${pick(m.char, "name")}`, `Leader · ${pick(m.char, "name")}`) : pick(m.char, "name");
      ctx.fillText(memberName, r.x + r.w / 2, r.y + (phone ? 28 : 22));
      ctx.fillStyle = "#9a93ab";
      ctx.font = `${phone ? 15 : 11}px monospace`;
      ctx.fillText(pick(m.weapon, "name"), r.x + r.w / 2, r.y + (phone ? 55 : 42));
    } else {
      ctx.fillStyle = "#453f52";
      ctx.font = `${phone ? 17 : 12}px monospace`;
      ctx.fillText(t("空 位", "empty"), r.x + r.w / 2, r.y + (phone ? 43 : 33));
    }
    if (keyboardFocus?.zone === "roster" && keyboardFocus.index === i) drawKeyboardFocus(ctx, r);
  }
  const sr = tdStartRect(width, height);
  const ready = roster.length > 0;
  ctx.fillStyle = ready ? "#241a10" : "#14101c";
  ctx.fillRect(sr.x, sr.y, sr.w, sr.h);
  ctx.strokeStyle = ready ? "#ffd166" : "#453f52";
  ctx.lineWidth = 2;
  ctx.strokeRect(sr.x, sr.y, sr.w, sr.h);
  ctx.fillStyle = ready ? "#ffd166" : "#453f52";
  ctx.font = `bold ${phone ? 24 : 20}px monospace`;
  ctx.fillText(t("开 始 守 门", "HOLD THE GATE"), width / 2, sr.y + (phone ? 47 : 35));
  if (keyboardFocus?.zone === "start") drawKeyboardFocus(ctx, sr, ready ? "#f2ead8" : "#8a8497");
  if (keyboardFocus && !phone) {
    ctx.fillStyle = "#8fd6ff";
    ctx.font = "12px monospace";
    ctx.fillText(t("方向键移动 · Enter 选择/移除 · Esc 返回", "Arrows move · Enter select/remove · Esc back"), width / 2, height - 7);
  }
  ctx.restore();
}

// 局内底部编队栏: 三个成员卡(价格/已放置/待放置高亮)
export function tdBarSlotRect(i, width, height) {
  if (bigUi(width)) {
    // 触控档: 76 画布px ≈ 49 物理px(600→390 缩放),达到手指标准
    const w = 220;
    const gap = 12;
    const total = 3 * w + 2 * gap;
    return { x: width / 2 - total / 2 + i * (w + gap), y: height - 84, w, h: 76 };
  }
  const w = 170;
  const gap = 10;
  const total = 3 * w + 2 * gap;
  return { x: width / 2 - total / 2 + i * (w + gap), y: height - 62, w, h: 52 };
}

export function drawTdBar(ctx, width, height, td) {
  const big = bigUi(width);
  ctx.save();
  ctx.textAlign = "center";
  td.roster.forEach((m, i) => {
    const r = tdBarSlotRect(i, width, height);
    const armed = td.armedSlot === i;
    const cost = tdPlaceCost(m.cost, td.placedCount);
    const afford = td.xp >= cost;
    ctx.fillStyle = armed ? "#33240f" : "#1d1828";
    ctx.globalAlpha = 0.94;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = armed ? "#ffd93d" : afford ? "#7cf28a" : "#5a5468";
    ctx.lineWidth = armed ? 3 : 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = "#f2ead8";
    ctx.font = `bold ${big ? 17 : 12}px monospace`;
    // 同一角色可重复放置(2026-07-26): 卡片常亮,标已上场数量+下一座价格
    const placedN = m.placedN || 0;
    ctx.fillText(placedN > 0 ? `${pick(m.char, "name")} ×${placedN}` : pick(m.char, "name"), r.x + r.w / 2, r.y + (big ? 30 : 20));
    ctx.font = `${big ? 15 : 11}px monospace`;
    ctx.fillStyle = afford ? "#ffd166" : "#c95d5d";
    ctx.fillText(cost === 0 ? t("免费上场", "Deploy free") : `${t("经验", "XP")} ${cost}`, r.x + r.w / 2, r.y + (big ? 58 : 40));
  });
  // 编队栏上一行只回答一个问题: 放置态=下一步怎么做(黄),平时=队长加成(静)
  const infoY = height - (big ? 96 : 74);
  const leader = td.roster[0];
  ctx.font = `bold ${big ? 16 : 12}px monospace`;
  ctx.textAlign = "center";
  if (td.armedSlot >= 0 && td.roster[td.armedSlot]) {
    ctx.fillStyle = "#ffd93d";
    ctx.fillText(
      t(`放置 ${pick(td.roster[td.armedSlot].char, "name")}:点绿色地面 · 再点卡取消`, `Placing ${pick(td.roster[td.armedSlot].char, "name")}: tap a green tile · tap card to cancel`),
      width / 2,
      infoY
    );
  } else if (leader) {
    const leaderPct = tdLeaderDamagePct(td.roster);
    ctx.fillStyle = leaderPct > 0 ? "#ffd166" : "#9a93ab";
    ctx.fillText(
      leaderPct > 0
        ? t(`队长 ${pick(leader.char, "name")} · 全塔伤害 +${leaderPct}%`, `Leader ${pick(leader.char, "name")} · all towers +${leaderPct}% damage`)
        : t(`队长 ${pick(leader.char, "name")} · 无团队加成`, `Leader ${pick(leader.char, "name")} · no team bonus`),
      width / 2,
      infoY
    );
  }
  // 经验余额(右下角,编队栏上方)
  ctx.fillStyle = "#7cf28a";
  ctx.font = `bold ${big ? 19 : 14}px monospace`;
  ctx.textAlign = "right";
  ctx.fillText(`${t("经验", "XP")} ${Math.floor(td.xp)}`, width - 18, infoY);
  ctx.restore();
}
