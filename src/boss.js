// 天意侵蚀Sans — a scripted two-phase boss that appears at 5:00.
// Self-contained: owns its own hazards (attacks that hurt the player), its
// rendering, health bar, subtitles, and the FIGHT / MERCY transition.
// The boss body itself is pushed into main's `enemies` array so the player's
// weapons target and damage it; everything else is driven from here.
import { PROJECTILE_BONE, PROJECTILE_BONE_RED, GB_IDLE, GB_FIRE, WALK_SETS } from "./sprites.js";
import { circleHit } from "./utils.js";
import { bossLineFor } from "./narrative.js";
import { t } from "./i18n.js";

export const BOSS_APPEAR_TIME = 300; // 5 minutes
const BOSS_HP = 50000; // phase 1
const P1_SECONDS = 36; // includes signature/recovery beats in the time budget
const P2_SECONDS = 54; // normal build: both phases + transition ≈95 seconds
// 区间制自适应(2026-07-12 评审): 固定时长会抹掉“变强的反馈”——DPS翻倍
// Boss 也永远打一样久。改为时长随强度滑落: 普通构筑打满全程, 强构筑明显
// 更快(10倍输出≈快44%), 但下限兜底, 永远不会一秒融化。
const REF_DPS = 20000; // “普通构筑”的锚点输出
function fightSeconds(base, minS, dps) {
  return Math.max(minS, Math.min(base, base * Math.pow(REF_DPS / Math.max(dps, 1), 0.25)));
}
// pool ceiling: sanity guard only, NOT a balance knob — the old 1.5M cap let
// multi-evolved endgame builds (几十万 dps) melt the boss in seconds again
// (2026-07-12 user:「武器非常多等级又刷上去了,一下就秒掉」)
const HP_CAP = 100000000;
const STRIKE_DMG = 200; // intro slam (reducible)

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// ---- pixel-art helpers (2026-07-12 美术重做): no smooth arcs, no shadowBlur —
// telegraphs and blasts are built from chunky snapped squares, matching the
// champion-sprite pixel discipline
function pxRing(c, x, y, r, color, alpha, chunk = 4) {
  const steps = Math.max(12, Math.round((r * 6.28) / (chunk * 2.2)));
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = color;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    c.fillRect(Math.round(x + Math.cos(a) * r) - (chunk >> 1), Math.round(y + Math.sin(a) * r) - (chunk >> 1), chunk, chunk);
  }
  c.restore();
}
function pxBang(c, x, y, alpha) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = "#ffdf5d";
  c.fillRect(Math.round(x) - 2, Math.round(y) - 11, 4, 12);
  c.fillRect(Math.round(x) - 2, Math.round(y) + 5, 4, 4);
  c.restore();
}

function pxDashedRay(c, x, y, angle, len, color, alpha, phase = 0) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.rotate(angle);
  c.globalAlpha = alpha;
  c.fillStyle = color;
  const dash = 12;
  const gap = 8;
  const offset = Math.round(phase) % (dash + gap);
  for (let dx = -offset; dx < len; dx += dash + gap) {
    const w = Math.min(dash, len - Math.max(0, dx));
    if (w > 0) c.fillRect(Math.max(0, dx), -2, w, 4);
  }
  c.restore();
}

function drawSafeLaneBrackets(c, x, y1, y2, w, alpha) {
  const left = Math.round(x - w / 2 + 8);
  const right = Math.round(x + w / 2 - 8);
  const top = Math.round(y1 + 12);
  const bottom = Math.round(y2 - 12);
  const mid = Math.round((top + bottom) / 2);
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = "#8fd6ff";
  // Three inward-facing bracket pairs make the safe route readable by shape,
  // not merely by its cyan colour. They also stay clear of the player lane.
  for (const y of [top, mid, bottom]) {
    c.fillRect(left, y - 8, 4, 16);
    c.fillRect(left, y - 8, 13, 4);
    c.fillRect(left, y + 4, 13, 4);
    c.fillRect(right - 4, y - 8, 4, 16);
    c.fillRect(right - 13, y - 8, 13, 4);
    c.fillRect(right - 13, y + 4, 13, 4);
  }
  c.fillStyle = "#ffffff";
  c.fillRect(Math.round(x) - 5, top - 2, 10, 4);
  c.fillRect(Math.round(x) - 5, bottom - 2, 10, 4);
  c.restore();
}

function drawPixelHeart(c, x, y, scale = 2) {
  const rows = [
    ".RR..RR.",
    "RRRRRRRR",
    "RRRRRRRR",
    ".RRRRRR.",
    "..RRRR..",
    "...RR...",
  ];
  c.save();
  c.fillStyle = "#ff334d";
  for (let py = 0; py < rows.length; py++) {
    for (let px = 0; px < rows[py].length; px++) {
      if (rows[py][px] === "R") c.fillRect(Math.round(x + px * scale), Math.round(y + py * scale), scale, scale);
    }
  }
  c.restore();
}

function drawUTBattleFrame(c, W, H, t) {
  const insetX = Math.max(56, Math.round(W * 0.18));
  const top = Math.max(78, Math.round(H * 0.18));
  const bottom = H - 170;
  const reveal = Math.min(1, t * 5);
  c.save();
  c.globalAlpha = 0.84 * reveal;
  c.fillStyle = "#050308";
  c.fillRect(0, 0, W, H);
  c.globalAlpha = reveal;
  c.fillStyle = "#f2ead8";
  c.fillRect(insetX, top, W - insetX * 2, bottom - top);
  c.fillStyle = "#050308";
  c.fillRect(insetX + 4, top + 4, W - insetX * 2 - 8, bottom - top - 8);
  c.restore();
}

const BOSS_TINT_CACHE = new WeakMap();
function tintedBossSprite(spr, color) {
  let byColor = BOSS_TINT_CACHE.get(spr);
  if (!byColor) {
    byColor = new Map();
    BOSS_TINT_CACHE.set(spr, byColor);
  }
  if (byColor.has(color)) return byColor.get(color);
  const cv = document.createElement("canvas");
  cv.width = spr.width;
  cv.height = spr.height;
  const g = cv.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.drawImage(spr, 0, 0);
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = color;
  g.fillRect(0, 0, cv.width, cv.height);
  byColor.set(color, cv);
  return cv;
}

function drawPlayerFocus(c, x, y, alpha) {
  const r = 15;
  const arm = 7;
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = "#ffffff";
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const px = Math.round(x + sx * r);
      const py = Math.round(y + sy * r);
      c.fillRect(px - (sx < 0 ? 0 : arm), py, arm, 2);
      c.fillRect(px, py - (sy < 0 ? 0 : arm), 2, arm);
    }
  }
  c.restore();
}

// a minimal boss "enemy" so weapons can target and damage it
export function makeBossEnemy(x, y) {
  return {
    id: "BOSS",
    boss: true,
    type: "boss",
    sprite: "boss",
    x,
    y,
    radius: 16,
    maxHp: BOSS_HP,
    hp: BOSS_HP,
    dmg: 0, // no passive contact damage; all damage is scripted
    xp: 0,
    elite: false,
    contactInterval: 1,
    contactTimer: 0,
    orbitTimer: 0,
    thornsTick: 0,
    laserTick: 0,
    hitFlash: 0,
    maxLives: 1,
    lives: 1,
    attackRange: 0,
    invulnTimer: 999, // immune until the fight actually starts
    burstTimer: 0,
    rootTimer: 0,
    slowTimer: 0,
    mark: null,
    strike: null,
    applyRoot() {
      return false; // the boss cannot be rooted
    },
    disarmTimer: 0,
    cannotAttack: false,
    applyDisarm() {
      return false; // 天意免疫缴械(黑客结局体系);缺这个方法曾让缴械波及Boss时TypeError卡死
    },
    takeDamage(d) {
      if (this.invulnTimer > 0) return false;
      this.hp -= d;
      this.hitFlash = 0.12;
      return true;
    },
    update() {}, // driven by the controller
  };
}

export function createBossFight(x, y, character, WIDTH, HEIGHT, WALL_H, diffId = 0) {
  const boss = makeBossEnemy(x, y);
  // normal difficulty: lower HP floors so a novice's modest DPS still means
  // a ~2 minute fight, not a 4 minute endurance wall (caps unchanged)
  const p1Floor = diffId === 0 ? 30000 : BOSS_HP;
  const p2Floor = diffId === 0 ? 25000 : 40000;
  boss.maxHp = p1Floor;
  boss.hp = p1Floor;
  return {
    boss,
    character,
    WIDTH,
    HEIGHT,
    WALL_H,
    phase: 1,
    state: "intro",
    t: 0,
    step: 0,
    // 2026-07-12 user feedback「普通的boss还是太简单」: skill cadence now
    // scales with difficulty, monotonic so normal never out-paces 狂暴
    // (normal ÷1.15 → P1 every ~1.39s; 屠杀 ÷1.30)
    aggro: 1.15 + 0.05 * diffId,
    attackTimer: 1.5,
    attacksSinceSignature: 0,
    signature: null,
    recoveryTimer: 0,
    stillTimer: 0,
    lastPX: 0,
    lastPY: 0,
    hazards: [],
    gesture: null, // {kind, t, dur, fire} — wind-up animation before an attack
    tele: null, // {t, fromX, fromY, toX, toY} — sans-style blink
    particles: [], // red pixels for teleports / impacts
    flash: 0, // red screen-edge flash on big hits
    animT: 0, // walk-cycle clock
    faceDir: "down",
    moving: false,
    subtitle: null,
    subtitleT: 0,
    mercyChoice: false,
    heartDropped: false,
    done: false, // set when the heart has been collected / fight resolved
    resolved: false, // main sets this after the heart is picked up
    homeX: x,
    homeY: y,

    subtitleShow(text, dur = 3) {
      this.subtitle = text;
      this.subtitleT = dur;
    },

    // ----- attack spawners --------------------------------------------------
    // every attack's damage scales with the player's bulk (see dmgScale in
    // update) so a tanked-up build still feels the boss's hits
    scaleDmg(dmg) {
      return Math.round(dmg * (this.dmgScale || 1));
    },
    bone(px, py, dmg, delay = 0.35, opts = {}) {
      this.hazards.push({
        kind: "bone",
        x: px,
        y: py,
        dmg: this.scaleDmg(dmg),
        t: -delay,
        life: 0.7,
        hit: false,
        size: opts.size || 28,
        blast: opts.blast || 0,
        ...opts,
      });
    },
    wall(x1, y1, x2, y2, dmg, life) {
      // t starts negative: 0.5s of dashed-line warning before the bones exist
      this.hazards.push({ kind: "wall", x1, y1, x2, y2, dmg: this.scaleDmg(dmg), t: -0.5, life, hitTimer: 0 });
    },
    blaster(bx, by, angle, dmg, life, opts = {}) {
      // hard cap (P0 美术止血): never more than 6 blasters alive on screen
      if (this.hazards.filter((h) => h.kind === "blaster").length >= 6) return;
      this.hazards.push({
        kind: "blaster",
        x: bx,
        y: by,
        angle,
        dmg: this.scaleDmg(dmg),
        t: -(opts.delay || 0),
        life,
        signature: !!opts.signature,
      });
    },
    boom(px, py, r, dmg, delay = 0) {
      this.hazards.push({ kind: "boom", x: px, y: py, r, dmg: this.scaleDmg(dmg), t: -delay, life: 0.4, hit: false });
    },
    homingBone(bx, by, dmg, delay = 0) {
      // negative t = held in formation (visible, dimmed, harmless), then flies
      this.hazards.push({ kind: "homing", x: bx, y: by, vx: 0, vy: 0, dmg: this.scaleDmg(dmg), hp: 200, t: -delay, life: 5, hit: 0 });
    },

    // ----- main update ------------------------------------------------------
    update(dt, ctx) {
      const { player } = ctx;
      this._playerFocus = { x: player.x, y: player.y };
      // boss hits scale to the player's bulk (1x fresh build → 3x tank build)
      // floor raised 1 → 1.2 (2026-07-12): low-bulk (=normal/early) builds sat
      // at the old floor and shrugged the boss off; tanky builds already >1.2
      if (!this.dmgScale) this.dmgScale = Math.min(4, Math.max(1.2, player.maxHp / 350));
      this.t += dt;
      if (this.subtitleT > 0) this.subtitleT -= dt;
      if (boss.hitFlash > 0) boss.hitFlash -= dt;

      // particles / flash always tick
      for (const pt of this.particles) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.t += dt;
      }
      this.particles = this.particles.filter((pt) => pt.t < 0.5);
      if (this.flash > 0) this.flash -= dt;

      if (this.state === "intro") this.updateIntro(dt, ctx);
      else if (this.state === "fight1" || this.state === "fight2") this.updateFight(dt, ctx);
      else if (this.state === "transition") this.updateTransition(dt, ctx);
      else if (this.state === "death") this.updateDeath(dt, ctx);

      this.updateHazards(dt, ctx);

      // big-move dim (P0 美术止血): while a beam or a big volley is on stage,
      // the world under it fades so the danger reads. Visual only.
      {
        const beams = this.hazards.some((h) => h.kind === "blaster" && h.t > 0.2);
        const bigBones = this.hazards.filter((h) => h.kind === "bone" && h.size >= 70).length >= 3;
        const booms = this.hazards.filter((h) => h.kind === "boom").length >= 5;
        const want = beams || bigBones || booms ? 1 : 0;
        this.bigMove = (this.bigMove || 0) + ((want - (this.bigMove || 0)) * Math.min(1, dt * 6));
      }

      // phase transitions on hp
      if ((this.state === "fight1" || this.state === "fight2") && boss.hp <= 0) {
        if (this.phase === 1) this.beginTransition(ctx);
        else this.beginDeath(ctx);
      }
    },

    // ----- intro cinematic --------------------------------------------------
    updateIntro(dt, ctx) {
      const { player } = ctx;
      boss.invulnTimer = 999;
      // 0: darken + boss walks out from the right edge
      if (this.step === 0) {
        boss.x = ctx.camX + this.WIDTH + 40;
        boss.y = HEIGHT_MID(this);
        this.homeY = boss.y;
        player.facing = 1;
        this.step = 1;
        this.t = 0;
      } else if (this.step === 1) {
        // boss strides in toward a spot on the right third
        const targetX = ctx.camX + this.WIDTH * 0.72;
        boss.x += (targetX - boss.x) * Math.min(1, dt * 2.2);
        this.homeX = targetX;
        if (this.t > 1.6) {
          this.step = 2;
          this.t = 0;
        }
      } else if (this.step === 2) {
        // boss leaps at the player; player braces
        const px = player.x;
        const py = player.y;
        const k = Math.min(this.t / 0.5, 1);
        boss.x = this.homeX + (px + 40 - this.homeX) * k;
        boss.y = this.homeY + (py - this.homeY) * k - Math.sin(k * Math.PI) * 60;
        if (this.t > 0.5) {
          // block → red explosion
          this.boom(player.x + 22, player.y, 46, 0);
          this.step = 3;
          this.t = 0;
        }
      } else if (this.step === 3) {
        // player knocked back, boss returns home, shockwave, 200 dmg
        const kb = Math.min(this.t / 0.35, 1);
        player.x -= 120 * dt * (1 - kb) * 6;
        boss.x += (this.homeX - boss.x) * Math.min(1, dt * 6);
        boss.y += (this.homeY - boss.y) * Math.min(1, dt * 6);
        if (this.t > 0.35 && !this._slammed) {
          this._slammed = true;
          this.boom(player.x, player.y, 90, 0);
          player.takeDamage(this.scaleDmg(STRIKE_DMG));
          if (player.hp <= 0) player.hp = 1; // the opening slam never kills
          knockback(player, boss, 70, ctx);
        }
        if (this.t > 0.9) {
          this.subtitleShow(t("* 天意侵蚀Sans出现了！", "* Corrupted Sans blocks the way!"), 3);
          this.startFight(1);
        }
      }
    },

    startFight(phase) {
      this.phase = phase;
      this.state = phase === 1 ? "fight1" : "fight2";
      this._barPct = 1; // display bar resets per phase, then only ever falls
      boss.invulnTimer = 0;
      this.attackTimer = 1.2;
      this.attacksSinceSignature = 0;
      this.signature = null;
      this.recoveryTimer = 0;
      this.t = 0;
      if (phase === 1) this.p1Time = 0; // game-time spent in phase 1
    },

    // spray red dissolve pixels at a point
    burst(x, y, n = 14) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 30 + Math.random() * 70;
        this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, t: 0 });
      }
    },

    // sans-style blink to a new flank position, then run `after`
    teleportTo(tx, ty, after) {
      this.burst(boss.x, boss.y, 16);
      this.tele = { t: 0, fromX: boss.x, fromY: boss.y, toX: tx, toY: ty, after };
    },

    // wind-up gesture before firing; `fire` runs at the apex
    windup(kind, fire) {
      this.gesture = { kind, t: 0, dur: 0.42, fire, fired: false };
    },

    // A readable fight has sentences, not an endless stream of commas.
    // Each phase periodically replaces a normal attack with one learned
    // signature, then gives the player a short, explicit breathing window.
    startSignature(ctx) {
      const { player } = ctx;
      this.tele = null;
      this.gesture = null;
      this.attacksSinceSignature = 0;
      if (this.phase === 1) {
        const centreX = ctx.camX + this.WIDTH / 2;
        const gapAngle = player.x < centreX ? 0 : Math.PI; // gap points inward
        this.signature = { kind: "boneGate", t: 0, fired: false, gapAngle, px: player.x, py: player.y };
      } else {
        const slots = 6;
        const slotW = this.WIDTH / slots;
        const safe = Math.max(0, Math.min(slots - 1, Math.floor((player.x - ctx.camX) / slotW)));
        this.signature = { kind: "blasterLanes", t: 0, fired: false, safe, camX: ctx.camX };
      }
    },

    updateSignature(dt, ctx) {
      const s = this.signature;
      if (!s) return;
      s.t += dt;
      // keep the boss on stage and facing the player while the pattern reads
      boss.x += (this.homeX - boss.x) * Math.min(1, dt * 4);
      boss.y += (this.homeY - boss.y) * Math.min(1, dt * 4);
      this.faceDir = "down";
      this.moving = false;

      if (!s.fired && s.t >= 0.12) {
        s.fired = true;
        if (s.kind === "boneGate") {
          // Seven points close around the old player position; one broad gap
          // always points back toward screen centre. The delayed centre pop
          // asks the player to leave through the promised opening.
          for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2;
            const delta = Math.atan2(Math.sin(a - s.gapAngle), Math.cos(a - s.gapAngle));
            if (Math.abs(delta) < 0.62) continue;
            this.bone(s.px + Math.cos(a) * 64, s.py + Math.sin(a) * 64, 75, 0.58, { size: 34 });
          }
          this.boom(s.px, s.py, 30, 90, 0.9);
        } else {
          // Six evenly spaced lanes, five beams: the missing lane is visually
          // obvious before firing and remains safe for the whole sweep.
          const slots = 6;
          const slotW = this.WIDTH / slots;
          let fired = 0;
          for (let i = 0; i < slots; i++) {
            if (i === s.safe) continue;
            const bx = s.camX + slotW * (i + 0.5);
            // The five-lane signature keeps its exact coverage, but ignites in
            // a short left-to-right ripple so it reads as one authored move.
            this.blaster(bx, this.WALL_H + 18, Math.PI / 2, 1, 1.3, {
              delay: fired * 0.04,
              signature: true,
            });
            fired += 1;
          }
        }
      }

      const endAt = s.kind === "boneGate" ? 1.45 : 1.65;
      if (s.t >= endAt) {
        this.signature = null;
        this.recoveryTimer = this.phase === 1 ? 1.2 : 1.4;
        this.attackTimer = 0.7;
      }
    },

    // ----- combat AI --------------------------------------------------------
    updateFight(dt, ctx) {
      const { player } = ctx;
      if (this.phase === 1) {
        this.p1Time = (this.p1Time || 0) + dt;
        // the boss addresses this timeline's sans once the entry banner clears
        if (!this._charIntroSaid && this.p1Time > 3.4) {
          this._charIntroSaid = true;
          const line = bossLineFor(this.character, "intro");
          if (line) this.subtitleShow(line, 3.5);
        }
        // AU 互文: at half health he recognizes which timeline he's facing
        if (!this._halfSaid && this._charIntroSaid && boss.hp < boss.maxHp * 0.5) {
          this._halfSaid = true;
          const line = bossLineFor(this.character, "half");
          if (line) this.subtitleShow(line, 3.2);
        }
        // adaptive phase 1, CONTINUOUS (2026-07-12「至少要让boss坚持久一点」):
        // one-shot sampling kept losing the race against endgame builds — now
        // every frame tracks real cumulative damage and keeps the pool sized
        // to "~P1_SECONDS of your actual dps". The pool only grows, never
        // shrinks; death lands naturally around the target duration however
        // absurd the build. Weak debug dummies (≤1000 hp) skip everything.
        if (boss.maxHp > 1000) {
          this._p1Dealt = (this._p1Dealt || 0) + Math.max(0, (this._p1LastHp ?? boss.maxHp) - boss.hp);
          if (this.p1Time < 1.2) {
            // sampling window: unkillable floor so a measurement always exists
            if (boss.hp < boss.maxHp * 0.05) boss.hp = boss.maxHp * 0.05;
          } else {
            const dps = this._p1Dealt / this.p1Time;
            const target = Math.round(Math.min(HP_CAP, Math.max(p1Floor, dps * fightSeconds(P1_SECONDS, 20, dps))));
            const remainingWanted = target - this._p1Dealt;
            if (remainingWanted > boss.hp) {
              boss.maxHp = Math.max(boss.maxHp, target);
              boss.hp = Math.min(boss.maxHp, remainingWanted);
            }
            this.p1MaxHp = Math.max(this.p1MaxHp || 0, boss.maxHp);
          }
          this._p1LastHp = boss.hp;
        }
      } else if (this.phase === 2 && boss.maxHp > 1000) {
        // phase 2 gets the same continuous treatment: the entry pool is an
        // estimate from phase 1 — if the build spikes (late evolutions), the
        // pool keeps itself sized to ~P2_SECONDS of the real phase-2 dps
        this.p2Time = (this.p2Time || 0) + dt;
        this._p2Dealt = (this._p2Dealt || 0) + Math.max(0, (this._p2LastHp ?? boss.maxHp) - boss.hp);
        if (this.p2Time >= 1) {
          const dps = this._p2Dealt / this.p2Time;
          const target = Math.round(Math.min(HP_CAP, Math.max(p2Floor, dps * fightSeconds(P2_SECONDS, 30, dps))));
          const remainingWanted = target - this._p2Dealt;
          if (remainingWanted > boss.hp) {
            boss.maxHp = Math.max(boss.maxHp, target);
            boss.hp = Math.min(boss.maxHp, remainingWanted);
          }
        }
        this._p2LastHp = boss.hp;
      }
      const prevX = boss.x;
      const prevY = boss.y;

      if (this.signature) {
        this.updateSignature(dt, ctx);
        return;
      }

      if (this.recoveryTimer > 0) {
        this.recoveryTimer = Math.max(0, this.recoveryTimer - dt);
        boss.x += (this.homeX - boss.x) * Math.min(1, dt * 3);
        boss.y += (this.homeY - boss.y) * Math.min(1, dt * 3);
        this.faceDir = "down";
        this.moving = false;
        return;
      }

      // teleport in progress: fade out, blink, fade back in
      if (this.tele) {
        const te = this.tele;
        te.t += dt;
        if (te.t >= 0.18 && !te.blinked) {
          te.blinked = true;
          boss.x = te.toX;
          boss.y = te.toY;
          this.homeX = te.toX;
          this.homeY = te.toY;
          this.burst(te.toX, te.toY, 16);
        }
        if (te.t >= 0.34) {
          const after = te.after;
          this.tele = null;
          if (after) after();
        }
        return;
      }

      // gesture (attack wind-up) in progress
      if (this.gesture) {
        const g = this.gesture;
        g.t += dt;
        if (!g.fired && g.t >= g.dur * 0.62) {
          g.fired = true;
          g.fire();
        }
        if (g.t >= g.dur) this.gesture = null;
        return;
      }

      // idle drift: strafe around home, gentle bob
      const strafe = Math.sin(this.t * 0.9) * 70;
      boss.x += (this.homeX + strafe - boss.x) * Math.min(1, dt * 1.6);
      boss.y += (this.homeY - boss.y) * Math.min(1, dt * 1.6) + Math.sin(this.t * 2.4) * 8 * dt;

      // walk animation bookkeeping
      const mvx = boss.x - prevX;
      const mvy = boss.y - prevY;
      this.moving = Math.hypot(mvx, mvy) > 6 * dt;
      if (this.moving) {
        this.animT += dt;
        this.faceDir = Math.abs(mvx) >= Math.abs(mvy) ? (mvx > 0 ? "right" : "left") : mvy > 0 ? "down" : "up";
      }

      // track "player standing still"
      if (dist(player.x, player.y, this.lastPX, this.lastPY) < 4) this.stillTimer += dt;
      else this.stillTimer = 0;
      this.lastPX = player.x;
      this.lastPY = player.y;

      this.attackTimer -= dt;
      if (this.attackTimer > 0) return;
      const signatureEvery = this.phase === 1 ? 6 : 8;
      if (this.attacksSinceSignature >= signatureEvery) {
        this.startSignature(ctx);
        return;
      }
      const rate = this.phase === 2 ? 1.2 : 1; // phase 2 attacks 20% faster
      // 2026-07-11 user tuning: ~35% faster skill cadence across both phases
      this.attackTimer = (this.phase === 1 ? 1.6 : 1.5) / rate / (this.aggro || 1);

      const attack = () => (this.phase === 1 ? this.pickAttackP1(ctx) : this.pickAttackP2(ctx));
      this.attacksSinceSignature += 1;
      // half the time, blink to a fresh flank before attacking
      if (Math.random() < 0.5) {
        const pa = Math.random() * Math.PI * 2;
        const pr = 230 + Math.random() * 90;
        const tx = player.x + Math.cos(pa) * pr;
        const ty = Math.max(this.WALL_H + 40, Math.min(this.HEIGHT - 40, player.y + Math.sin(pa) * pr));
        this.teleportTo(tx, ty, attack);
      } else {
        attack();
      }
    },

    pickAttackP1(ctx) {
      const { player } = ctx;
      const d = dist(player.x, player.y, boss.x, boss.y);
      const approaching = d < 150;
      const retreating = d > 320;

      if (this.stillTimer > 3) {
        // 5: hop-slam — bones erupt under the still player
        this.windup("hop", () => {
          for (let i = 0; i < 5; i++) {
            this.bone(player.x + (Math.random() - 0.5) * 70, player.y + (Math.random() - 0.5) * 70, 60, 0.3 + i * 0.05, { size: 30 });
          }
        });
        this.stillTimer = 0;
      } else if (d < 90) {
        // 2: crouch — dash through the player, then blink back
        // (P0 评审修复: 原来排在 d<150 之后,贴身永远进骨墙分支,冲刺不可达)
        this.windup("crouch", () => this.dashAttack(ctx));
      } else if (approaching) {
        // 3: palm-thrust — bone wall between boss and player
        this.windup("lunge", () => {
          const mx = (player.x + boss.x) / 2;
          const my = (player.y + boss.y) / 2;
          const a = Math.atan2(player.y - boss.y, player.x - boss.x) + Math.PI / 2;
          this.wall(mx - Math.cos(a) * 70, my - Math.sin(a) * 70, mx + Math.cos(a) * 70, my + Math.sin(a) * 70, 20, 2.5);
        });
      } else if (retreating) {
        // 4: recoil — gaster blaster behind the boss, straight beam
        this.windup("recoil", () => {
          const a = Math.atan2(player.y - boss.y, player.x - boss.x);
          this.blaster(boss.x - Math.cos(a) * 30, boss.y - Math.sin(a) * 30, a, 1, 1.4);
        });
      } else {
        // 1: hop-slam — bone on each of the 4 sides of the player
        this.windup("hop", () => {
          this.bone(player.x, player.y - 46, 80);
          this.bone(player.x, player.y + 46, 80);
          this.bone(player.x - 46, player.y, 80);
          this.bone(player.x + 46, player.y, 80);
        });
      }
    },

    dashAttack(ctx) {
      const { player } = ctx;
      boss.invulnTimer = 0.6; // 50%+ effectively invuln window during dash
      this._dash = { fromX: boss.x, fromY: boss.y, t: 0 };
      this.hazards.push({
        kind: "dash",
        t: 0,
        life: 0.5,
        fromX: boss.x,
        fromY: boss.y,
        tx: player.x,
        ty: player.y,
        hit: false,
        dmg: 120,
      });
    },

    pickAttackP2(ctx) {
      const { player } = ctx;
      // 技能袋(P0 评审): 五招洗牌轮转,禁止连抽同招 — 有限随机导演,
      // 一场必见全部招式,不再出现连刷三次召唤的场次
      if (!this._p2Bag || !this._p2Bag.length) {
        this._p2Bag = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
        if (this._p2Bag[0] === this._p2Last) this._p2Bag.push(this._p2Bag.shift());
      }
      const roll = this._p2Bag.shift();
      this._p2Last = roll;
      const gestureFor = { 0: "lunge", 1: "channel", 2: "hop", 3: "recoil", 4: "channel" }[roll];
      this.windup(gestureFor, () => this.fireAttackP2(ctx, roll));
    },

    fireAttackP2(ctx, roll) {
      const { player } = ctx;
      if (roll === 0) {
        // 1: bone wall sealing 1/3 of the map on the side the player is NOT on
        const leftSide = player.x < ctx.camX + this.WIDTH / 2;
        const wx = leftSide ? ctx.camX + this.WIDTH * 0.72 : ctx.camX + this.WIDTH * 0.28;
        this.wall(wx, this.WALL_H, wx, this.HEIGHT, 20, 10);
      } else if (roll === 1) {
        // 2: summon 30 monsters in THREE waves off a visible channel —
        // reads as the boss's own skill, not "the game spawned more mobs"
        this.hazards.push({ kind: "summon", t: -0.25, life: 0.05, n: 10 });
        this.hazards.push({ kind: "summon", t: -0.75, life: 0.05, n: 10 });
        this.hazards.push({ kind: "summon", t: -1.25, life: 0.05, n: 10 });
      } else if (roll === 2) {
        // 3: 5 giant ground bones, 200 dmg + 50 explosion
        for (let i = 0; i < 5; i++) {
          const bx = ctx.camX + 80 + Math.random() * (this.WIDTH - 160);
          const by = this.WALL_H + 40 + Math.random() * (this.HEIGHT - this.WALL_H - 80);
          this.bone(bx, by, 200, 0.4 + i * 0.1, { size: 70, blast: 90, blastDmg: 50 });
        }
      } else if (roll === 3) {
        // 4: 10 homing bones — fan up behind the boss, pause, then release in
        // a 2/3/5 rhythm (P0 评审: 一招要可读,不是十个追踪物)
        const away = Math.atan2(boss.y - player.y, boss.x - player.x);
        for (let i = 0; i < 10; i++) {
          const spread = away + ((i - 4.5) / 9) * Math.PI * 0.9;
          const hx = boss.x + Math.cos(spread) * 46;
          const hy = boss.y + Math.sin(spread) * 46;
          const delay = i < 2 ? 0.4 : i < 5 ? 0.85 : 1.3;
          this.homingBone(hx, hy, 150, delay);
        }
      } else {
        // 5: 10 random explosions around the boss (near player)
        if (dist(player.x, player.y, boss.x, boss.y) < 260) {
          for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 150;
            this.boom(boss.x + Math.cos(a) * r, boss.y + Math.sin(a) * r, 46, 300, 0.2 + i * 0.06);
          }
        } else {
          // fallback if the player is far: giant bones instead
          for (let i = 0; i < 5; i++) {
            const bx = ctx.camX + 80 + Math.random() * (this.WIDTH - 160);
            const by = this.WALL_H + 40 + Math.random() * (this.HEIGHT - this.WALL_H - 80);
            this.bone(bx, by, 200, 0.4 + i * 0.1, { size: 70, blast: 90, blastDmg: 50 });
          }
        }
      }
    },

    // ----- FIGHT / MERCY transition ----------------------------------------
    beginTransition(ctx) {
      this.state = "transition";
      this.step = 0;
      this.t = 0;
      this.transitionVisualT = 0;
      boss.hp = 1;
      boss.invulnTimer = 999;
      this.hazards.length = 0;
      this._transitionCamX = ctx.camX;
      // retreat to the top-center of the view
      this.homeX = ctx.camX + this.WIDTH / 2;
      this.homeY = this.WALL_H + 105;
    },

    updateTransition(dt, ctx) {
      this._transitionCamX = ctx.camX;
      this.transitionVisualT += dt;
      if (this.step < 3) {
        boss.x += (this.homeX - boss.x) * Math.min(1, dt * 3);
        boss.y += (this.homeY - boss.y) * Math.min(1, dt * 3);
      }
      // this whole sequence is the BOSS's choice — the player just watches
      if (this.step === 0) {
        if (dist(boss.x, boss.y, this.homeX, this.homeY) < 6) {
          this.mercyChoice = true; // FIGHT / MERCY appear mid-screen
          this.step = 1;
          this.t = 0;
        }
      } else if (this.step === 1) {
        // pause… then the body shudders left-right
        if (this.t > 0.7) {
          this.step = 2;
          this.t = 0;
          // the struggle against mercy, voiced per character
          const line = bossLineFor(this.character, "mercy");
          if (line) this.subtitleShow(line, 2.5);
        }
      } else if (this.step === 2) {
        this.shake = Math.sin(this.t * 40) * 5 * Math.max(0, 1 - this.t / 0.6);
        if (this.t > 0.5) {
          this.shake = 0;
          this.step = 3;
          this.t = 0;
          // remember the button impact point; the boss stays composed inside
          // the battle box instead of walking across the frame and text.
          const m = mercyBtnRect(this.WIDTH, this.HEIGHT);
          this._mercyX = ctx.camX + m.x + m.w / 2;
          this._mercyY = m.y + m.h / 2;
        }
      } else if (this.step === 3) {
        boss.x += (this.homeX - boss.x) * Math.min(1, dt * 3);
        boss.y += (this.homeY - boss.y) * Math.min(1, dt * 3);
        if (this.t > 0.9) {
          this.step = 4;
          this.t = 0;
          this.subtitleShow(t("* Sans 拒绝了仁慈", "* Sans refused your MERCY."), 2.5);
        }
      } else if (this.step === 4) {
        if (this.t > 0.6 && !this._mercySmash) {
          this._mercySmash = true;
          // a giant bone falls from the sky and shatters MERCY
          const m = mercyBtnRect(this.WIDTH, this.HEIGHT);
          this.bone(ctx.camX + m.x + m.w / 2, m.y + m.h / 2, 0, 0.15, { size: 100 });
        }
        if (this.t > 0.9) this.mercySmashed = true; // button breaks
        if (this.t > 1.65) {
          // refill, return home, phase 2 — sized so it lasts ~P2_SECONDS
          // against the DPS the player actually showed in phase 1
          this.mercyChoice = false;
          this.mercySmashed = false;
          const p1Time = Math.max(10, this.p1Time || 60);
          const dps = (this.p1MaxHp || BOSS_HP) / p1Time; // real phase-1 pool, post-scaling
          const p2hp = Math.round(Math.min(HP_CAP, Math.max(p2Floor, dps * fightSeconds(P2_SECONDS, 30, dps))));
          boss.maxHp = p2hp;
          boss.hp = p2hp;
          this.homeX = ctx.camX + this.WIDTH * 0.72;
          this.homeY = HEIGHT_MID(this);
          this.startFight(2);
          const line = bossLineFor(this.character, "p2");
          if (line) this.subtitleShow(line, 3);
        }
      }
    },

    // ----- death ------------------------------------------------------------
    beginDeath(ctx) {
      this.state = "death";
      this.t = 0;
      boss.invulnTimer = 999;
      this.hazards.length = 0;
      this.signature = null;
      this.recoveryTimer = 0;
      this.victoryFlash = 0.55;
      const line = bossLineFor(this.character, "death");
      if (line) this.subtitleShow(line, 2.5);
      this.dust = [];
      for (let i = 0; i < 90; i++) {
        this.dust.push({
          x: boss.x + (Math.random() - 0.5) * 24,
          y: boss.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 40,
          vy: -20 - Math.random() * 40,
          t: 0,
        });
      }
    },

    updateDeath(dt, ctx) {
      if (this.victoryFlash > 0) this.victoryFlash = Math.max(0, this.victoryFlash - dt);
      for (const d of this.dust) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 8 * dt;
        d.t += dt;
      }
      if (this.t > 1.2 && !this.heartDropped) {
        this.heartDropped = true;
        ctx.dropHeart(boss.x, boss.y - 10); // bright white inverted heart
      }
      if (this.t > 1.4) this.done = true; // boss body gone; main removes it
    },

    // ----- hazards ----------------------------------------------------------
    updateHazards(dt, ctx) {
      const { player } = ctx;
      for (const h of this.hazards) {
        h.t += dt;
        if (h.kind === "bone") {
          if (h.t >= 0 && !h.hit) {
            h.hit = true;
            if (h.dmg > 0 && circleHit(h.x, h.y, h.size * 0.5, player.x, player.y, player.radius)) {
              player.takeDamage(h.dmg);
            }
            if (h.blast) {
              // giant bone: explode a moment later
              this.boom(h.x, h.y, h.blast, h.blastDmg || 0, 0.25);
            }
          }
        } else if (h.kind === "boom") {
          if (h.t >= 0 && !h.hit) {
            h.hit = true;
            if (h.dmg > 0 && circleHit(h.x, h.y, h.r, player.x, player.y, player.radius)) {
              player.takeDamage(h.dmg);
            }
          }
        } else if (h.kind === "summon") {
          if (h.t >= 0 && !h.done) {
            h.done = true;
            ctx.summon(h.n);
            this.burst(boss.x, boss.y - 10, 12);
          }
        } else if (h.kind === "wall") {
          if (h.t < 0) continue; // warning phase: no wall, no damage yet
          h.hitTimer -= dt;
          if (h.hitTimer <= 0 && segHitsPlayer(h, player, 12)) {
            h.hitTimer = 0.4;
            player.takeDamage(h.dmg);
            knockback(player, { x: (h.x1 + h.x2) / 2, y: (h.y1 + h.y2) / 2 }, 18, ctx);
          }
        } else if (h.kind === "blaster") {
          if (h.t > 0.45) {
            // beam: tick damage every ~0.02s while touching
            const len = 900;
            const x2 = h.x + Math.cos(h.angle) * len;
            const y2 = h.y + Math.sin(h.angle) * len;
            if (player.laserTick <= 0 && distToSeg(player.x, player.y, h.x, h.y, x2, y2) < 26 + player.radius) {
              player.takeDamage(h.dmg);
              player.laserTick = 0.02;
            }
          }
        } else if (h.kind === "homing") {
          if (h.t < 0) continue; // held in formation: no tracking, no contact
          const a = Math.atan2(player.y - h.y, player.x - h.x);
          const sp = 150;
          h.vx = Math.cos(a) * sp;
          h.vy = Math.sin(a) * sp;
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          if (h.hit <= 0 && circleHit(h.x, h.y, 9, player.x, player.y, player.radius)) {
            player.takeDamage(h.dmg);
            h.hit = 0.5;
            h.life = 0; // consumed on hit
          }
          if (h.hit > 0) h.hit -= dt;
          // homing bones are killable: weapons that hit near it chip its hp
          for (const p of ctx.projectiles) {
            if (p.pierce <= 0) continue;
            if (circleHit(p.x, p.y, (p.hitR || p.size / 2) + 6, h.x, h.y, 9)) {
              h.hp -= p.dmg;
            }
          }
          if (h.hp <= 0) h.life = 0;
        } else if (h.kind === "dash") {
          const k = Math.min(h.t / 0.18, 1);
          boss.x = h.fromX + (h.tx - h.fromX) * k;
          boss.y = h.fromY + (h.ty - h.fromY) * k;
          // red afterimages along the dash path
          if (!h.trail) h.trail = [];
          if (k < 1) h.trail.push({ x: boss.x, y: boss.y, t: 0 });
          for (const tr of h.trail) tr.t += dt;
          if (k >= 1 && !h.hit) {
            h.hit = true;
            if (circleHit(boss.x, boss.y, 40, player.x, player.y, player.radius)) {
              player.takeDamage(h.dmg);
              knockback(player, { x: h.fromX, y: h.fromY }, 60, ctx);
              this.flash = 0.3; // red screen flash
            }
            this.burst(boss.x, boss.y, 12);
          }
          if (h.t > 0.32 && !h.returned) {
            h.returned = true;
            // blink back home with particles
            this.burst(boss.x, boss.y, 12);
            boss.x = this.homeX;
            boss.y = this.homeY;
            this.burst(boss.x, boss.y, 12);
            boss.invulnTimer = 0;
          }
        }
      }
      this.hazards = this.hazards.filter((h) => h.t < (h.life ?? 1));
    },

    // ----- drawing (world space; caller has translated by -camX) -----------
    draw(ctx2d) {
      const c = ctx2d;
      if (this.signature?.kind === "blasterLanes") {
        const s = this.signature;
        const slotW = this.WIDTH / 6;
        const safeX = s.camX + slotW * (s.safe + 0.5);
        const blink = Math.floor(s.t * 10) % 2 === 0;
        drawSafeLaneBrackets(c, safeX, this.WALL_H, this.HEIGHT - 48, slotW, blink ? 0.9 : 0.55);
      }
      // hazards
      for (const h of this.hazards) {
        if (h.kind === "bone") {
          const app = h.t < 0 ? 1 + h.t / 0.35 : 1;
          c.save();
          if (h.t < 0) {
            // telegraph: hard-blinking pixel ring (crisp on/off, no sine mush)
            const blink = (((h.t * 8) % 1) + 1) % 1 < 0.5;
            pxRing(c, h.x, h.y, h.size * 0.5 * (1.3 - app), this.phase === 2 ? "#c95df0" : "#e04545", blink ? 0.8 : 0.3, 3);
            c.globalAlpha = 0.35;
            drawBoneRed(c, h.x, h.y, h.size * 0.5, -Math.PI / 2);
          } else {
            // eruption: bone pops with squash-stretch + expanding shockwave
            const k = h.t / h.life;
            const pop = k < 0.2 ? 0.6 + 2.5 * k : 1.1 - k * 0.1;
            c.globalAlpha = Math.max(0, 1 - k);
            drawBoneRed(c, h.x, h.y - h.size * 0.15 * pop, h.size * pop, -Math.PI / 2);
            if (h.t < 0.22) {
              pxRing(c, h.x, h.y, h.size * (0.4 + h.t * 6), "#ff9a9a", (1 - h.t / 0.22) * 0.8, 3);
            }
          }
          c.restore();
        } else if (h.kind === "boom") {
          if (h.t < 0) {
            const blink = (((h.t * 8) % 1) + 1) % 1 < 0.5;
            pxRing(c, h.x, h.y, h.r, this.phase === 2 ? "#c95df0" : "#ff5d5d", blink ? 0.7 : 0.3, 4);
            pxBang(c, h.x, h.y, blink ? 0.9 : 0.4);
          } else {
            const k = h.t / h.life;
            // chunky core flash, then two staggered pixel shockwaves
            c.save();
            c.globalAlpha = 1 - k;
            c.fillStyle = k < 0.3 ? "#fff3b0" : "#ff8a5d";
            const cs = Math.max(4, (Math.round((h.r * 0.5 * (1 - k)) / 4) << 2));
            c.fillRect(Math.round(h.x - cs / 2), Math.round(h.y - cs / 2), cs, cs);
            c.restore();
            pxRing(c, h.x, h.y, h.r * (0.45 + k * 0.6), "#e04545", (1 - k) * 0.9, 4);
            pxRing(c, h.x, h.y, h.r * (0.2 + k * 0.75), "#ff9a9a", (1 - k) * 0.6, 3);
          }
        } else if (h.kind === "wall") {
          const n = Math.max(2, Math.round(dist(h.x1, h.y1, h.x2, h.y2) / 20));
          if (h.t < 0) {
            // telegraph: blinking dashed pixel line + ghost bones at both ends
            const blink = (((h.t * 8) % 1) + 1) % 1 < 0.5;
            c.save();
            c.globalAlpha = blink ? 0.85 : 0.35;
            c.fillStyle = this.phase === 2 ? "#c95df0" : "#e04545";
            for (let i = 0; i <= n * 2; i += 2) {
              const bx = h.x1 + ((h.x2 - h.x1) * i) / (n * 2);
              const by = h.y1 + ((h.y2 - h.y1) * i) / (n * 2);
              c.fillRect(Math.round(bx) - 2, Math.round(by) - 2, 4, 4);
            }
            c.globalAlpha = 0.4;
            drawBoneRed(c, h.x1, h.y1, 22, Math.atan2(h.y2 - h.y1, h.x2 - h.x1) + Math.PI / 2);
            drawBoneRed(c, h.x2, h.y2, 22, Math.atan2(h.y2 - h.y1, h.x2 - h.x1) + Math.PI / 2);
            c.restore();
          } else {
            for (let i = 0; i <= n; i++) {
              const bx = h.x1 + ((h.x2 - h.x1) * i) / n;
              const by = h.y1 + ((h.y2 - h.y1) * i) / n;
              drawBoneRed(c, bx, by, 22, Math.atan2(h.y2 - h.y1, h.x2 - h.x1) + Math.PI / 2);
            }
          }
        } else if (h.kind === "blaster") {
          const spr = h.t > 0.45 ? GB_FIRE : GB_IDLE;
          const shownT = Math.max(0, h.t);
          if (h.t <= 0.45) {
            // The danger line exists before collision does. A moving dashed
            // phase leads the eye from skull to destination without adding a
            // smooth glow or hiding the playfield beneath a translucent cone.
            const cue = Math.max(0, Math.min(1, (h.t + 0.16) / 0.61));
            const mx = h.x + Math.cos(h.angle) * 22;
            const my = h.y + Math.sin(h.angle) * 22;
            pxDashedRay(
              c,
              mx,
              my,
              h.angle,
              900,
              this.phase === 2 ? "#ff5d73" : "#e04545",
              (0.24 + cue * 0.52) * (Math.floor((shownT + 0.08) * 12) % 2 ? 1 : 0.62),
              shownT * 90,
            );
          }
          c.save();
          c.translate(h.x, h.y);
          // spin-in entrance like the player's blaster
          const spin = shownT < 0.2 ? (1 - shownT / 0.2) * Math.PI * 2 : 0;
          c.rotate(h.angle - Math.PI / 2 + spin);
          c.imageSmoothingEnabled = false;
          const gw = 44; // head -21% (P0 美术止血)
          c.globalAlpha = h.t < 0 ? 0.25 : Math.min(1, shownT / 0.15);
          c.drawImage(spr, -gw / 2, -(spr.height / spr.width) * gw / 2, gw, (spr.height / spr.width) * gw);
          c.restore();
          if (h.t > 0.2 && h.t <= 0.45) {
            // charging: pixel diamond snaps bigger in steps, blinking hot
            const ck = (h.t - 0.2) / 0.25;
            const mx = h.x + Math.cos(h.angle) * 26;
            const my = h.y + Math.sin(h.angle) * 26;
            c.save();
            c.translate(Math.round(mx), Math.round(my));
            c.rotate(Math.PI / 4);
            const s2 = 4 + Math.round(ck * 4) * 4;
            c.fillStyle = ((h.t * 12) % 1) < 0.5 ? "#ffffff" : "#ff5d5d";
            c.fillRect(-s2 / 2, -s2 / 2, s2, s2);
            c.restore();
          }
          if (h.t > 0.45) {
            // beam: three crisp bands + stepped width pulse + pixel dither on
            // the edges — reads "gaster blaster", not "thick marker stroke"
            const len = 900;
            const pulse = 2 * Math.round((Math.sin(h.t * 40) + 1)); // 0/2/4, snapped
            c.save();
            c.translate(h.x, h.y);
            c.rotate(h.angle);
            c.globalAlpha = 0.3;
            c.fillStyle = "#e04545";
            c.fillRect(0, -(28 + pulse) / 2, len, 28 + pulse); // beam -30% wide
            c.globalAlpha = 0.85;
            c.fillStyle = "#ff9a9a";
            c.fillRect(0, -8, len, 16);
            c.globalAlpha = 1;
            c.fillStyle = "#ffffff";
            c.fillRect(0, -3.5, len, 7);
            // muzzle burst + edge dither pixels
            c.fillStyle = "#fff3b0";
            c.fillRect(-3, -10, 14, 20);
            c.fillStyle = "#ffdede";
            c.globalAlpha = 0.9;
            for (let dx = 20; dx < len; dx += 24) {
              const off = ((dx / 24) % 2 ? 1 : -1) * (9 + pulse / 2);
              c.fillRect(dx, off - 2, 4, 4);
            }
            c.restore();
          }
        } else if (h.kind === "homing") {
          if (h.t < 0) {
            c.save();
            c.globalAlpha = 0.45 + 0.3 * ((((h.t * 8) % 1) + 1) % 1 < 0.5 ? 1 : 0);
            drawBoneRed(c, h.x, h.y, 16, -Math.PI / 2);
            c.restore();
          } else {
            drawBoneRed(c, h.x, h.y, 16, Math.atan2(h.vy, h.vx) + Math.PI / 2);
          }
        } else if (h.kind === "summon") {
          // channel cue: red squares rise off the boss while the rift charges
          if (h.t < 0) {
            c.save();
            c.fillStyle = "#c95df0";
            for (let i = 0; i < 5; i++) {
              const yy = boss.y - 24 - ((-h.t * 90 + i * 14) % 60);
              c.globalAlpha = 0.7 - (boss.y - 24 - yy) / 80;
              c.fillRect(Math.round(boss.x - 16 + i * 8) - 2, Math.round(yy), 4, 4);
            }
            c.restore();
          }
        }
      }

      if (this._playerFocus && this.hazards.some((h) => h.kind === "blaster" && h.t > 0.1)) {
        const blink = Math.floor(this.t * 12) % 2;
        drawPlayerFocus(c, this._playerFocus.x, this._playerFocus.y, blink ? 1 : 0.72);
      }

      // dash afterimages: fading red silhouettes
      for (const h of this.hazards) {
        if (h.kind !== "dash" || !h.trail) continue;
        for (const tr of h.trail) {
          const a = Math.max(0, 1 - tr.t / 0.3);
          if (a <= 0) continue;
          // ghost of the boss sprite itself — pixel silhouettes, no blur blob
          c.save();
          c.globalAlpha = a * 0.35;
          drawBossBody(c, tr.x, tr.y, 0, true, { animT: 0, faceDir: this.faceDir, moving: false, hitFlash: 0, phase2: this.phase === 2 });
          c.restore();
        }
      }

      // red dissolve particles (teleports, impacts)
      if (this.particles.length) {
        c.save();
        for (const pt of this.particles) {
          c.globalAlpha = Math.max(0, 1 - pt.t / 0.5);
          c.fillStyle = "#c22e2e";
          c.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        }
        c.restore();
      }

      // dust on death
      if (this.state === "death" && this.dust) {
        c.save();
        c.fillStyle = "#e0d0d0";
        for (const d of this.dust) {
          c.globalAlpha = Math.max(0, 1 - d.t / 1.4);
          c.fillRect(d.x, d.y, 3, 3);
        }
        c.restore();
      }

      // Recovery is a reward state, not merely a gap in the attack stream.
      // Mark it on the boss itself so mobile players do not have to read HUD
      // text while steering through the last particles of the signature.
      if (this.recoveryTimer > 0) {
        const pulse = 30 + (Math.floor(this.t * 8) % 2) * 4;
        pxRing(c, boss.x, boss.y - 5, pulse, "#ffd166", 0.72, 4);
        c.save();
        c.fillStyle = "#fff3b0";
        for (const [ox, oy] of [[-24, -28], [24, -28], [-24, 18], [24, 18]]) {
          c.fillRect(Math.round(boss.x + ox) - 3, Math.round(boss.y + oy) - 3, 6, 6);
        }
        c.restore();
      }

      // boss body (unless fully dead)
      if (this.state !== "death" || this.t < 1.2) {
        drawBossBody(c, boss.x, boss.y, this.t, boss.invulnTimer <= 0 || this.state === "transition", {
          shake: this.shake || 0,
          gesture: this.gesture,
          tele: this.tele,
          animT: this.animT,
          faceDir: this.faceDir,
          moving: this.moving,
          hitFlash: boss.hitFlash,
          phase2: this.phase === 2,
        });
      }
    },

    // ----- screen-space overlay (health bar, subtitle, buttons) ------------
    drawOverlay(ctx2d) {
      const c = ctx2d;
      const W = this.WIDTH;
      const H = this.HEIGHT;
      if (this.mercyChoice) {
        drawUTBattleFrame(c, W, H, this.transitionVisualT || 0);
        // The world-space body was deliberately covered by the battle box.
        // Redraw it once in screen space so it belongs to the scene instead of
        // looking like an unrelated sprite pasted above two UI buttons.
        drawBossBody(c, boss.x - (this._transitionCamX || 0), boss.y, this.t, false, {
          shake: this.shake || 0,
          animT: this.animT,
          faceDir: this.faceDir,
          moving: this.moving,
          hitFlash: boss.hitFlash,
          phase2: this.phase === 2,
          scale: 1.35,
        });
      }
      // red vignette flash on heavy hits
      if (this.flash > 0) {
        c.save();
        const g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
        g.addColorStop(0, "rgba(214, 40, 40, 0)");
        g.addColorStop(1, `rgba(214, 40, 40, ${(this.flash / 0.3) * 0.5})`);
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
        c.restore();
      }
      // Final hit: one short white frame and a restrained gold verdict. This
      // is deliberately briefer than the chest fanfare so victory stays UT.
      if (this.state === "death" && this.t < 1.35) {
        c.save();
        if (this.victoryFlash > 0) {
          c.globalAlpha = Math.min(0.42, this.victoryFlash * 0.75);
          c.fillStyle = "#ffffff";
          c.fillRect(0, 0, W, H);
        }
        if (this.t > 0.25) {
          c.globalAlpha = Math.min(1, (this.t - 0.25) * 4) * Math.min(1, (1.35 - this.t) * 3);
          c.textAlign = "center";
          c.fillStyle = "#ffd166";
          c.font = "bold 23px monospace";
          c.fillText(t("★ 审判通过 ★", "★ JUDGEMENT PASSED ★"), W / 2, 76);
          c.fillRect(W / 2 - 88, 84, 176, 3);
        }
        c.restore();
      }
      // boss health bar at the bottom
      if ((this.state === "fight1" || this.state === "fight2" || this.state === "transition") && !this.mercyChoice) {
        const bw = W * 0.6;
        const bx = (W - bw) / 2;
        const by = H - 46;
        c.save();
        c.textAlign = "center";
        c.fillStyle = "#e04545";
        c.font = "bold 15px monospace";
        const name = this.phase === 2 ? t("天意侵蚀Sans · 二阶", "Corrupted Sans · Phase 2") : t("天意侵蚀Sans", "Corrupted Sans");
        c.fillText(name, W / 2, by - 8);
        // framed, segmented, top-lit — UT boss bar discipline
        c.fillStyle = "#f2ead8";
        c.fillRect(bx - 3, by - 3, bw + 6, 20); // crisp outer frame
        c.fillStyle = "#1a0c0c";
        c.fillRect(bx - 1, by - 1, bw + 2, 16);
        // 反“系统作弊感”(P0 评审): 内部血池弹性,但玩家看到的血条
        // 单调只降不升 — 补血/扩池永远不体现为血条回升或比例倒退
        const rawPct = Math.max(0, boss.hp / boss.maxHp);
        this._barPct = Math.min(this._barPct ?? rawPct, rawPct);
        const pct = this._barPct;
        c.fillStyle = "#e04545";
        c.fillRect(bx, by, bw * pct, 14);
        c.fillStyle = "#ff8a8a"; // pixel highlight row
        c.fillRect(bx, by, bw * pct, 3);
        c.fillStyle = "rgba(20, 8, 8, 0.55)"; // 10% segment ticks
        for (let i = 1; i < 10; i++) c.fillRect(bx + Math.round((bw * i) / 10) - 1, by, 2, 14);
        c.restore();
      }
      // subtitle
      if (this.subtitleT > 0 && this.subtitle) {
        c.save();
        c.globalAlpha = Math.min(1, this.subtitleT);
        c.textAlign = "center";
        c.fillStyle = "#ffffff";
        c.font = "bold 22px monospace";
        c.fillText(this.subtitle, W / 2, this.mercyChoice ? H - 190 : H - 90);
        c.restore();
      }
      if (this.recoveryTimer > 0) {
        c.save();
        c.textAlign = "center";
        c.fillStyle = "#ffd166";
        c.font = "bold 17px monospace";
        c.fillText(t("反击窗口", "COUNTER WINDOW"), W / 2, 118);
        const blocks = 8;
        const lit = Math.ceil((this.recoveryTimer / (this.phase === 1 ? 1.2 : 1.4)) * blocks);
        for (let i = 0; i < blocks; i++) {
          c.fillStyle = i < lit ? "#ffd166" : "#3a2f4a";
          c.fillRect(W / 2 - 50 + i * 13, 127, 9, 4);
        }
        c.restore();
      }
      // FIGHT / MERCY buttons (1:1 sprites from the reference image)
      if (this.mercyChoice) {
        c.save();
        drawUTButton(c, fightBtnRect(W, H), "FIGHT");
        const mercyRect = mercyBtnRect(W, H);
        if (!this.mercySmashed) {
          drawUTButton(c, mercyRect, "MERCY");
          const heartPulse = Math.floor(this.t * 8) % 2;
          drawPixelHeart(c, mercyRect.x - 34 - heartPulse * 2, mercyRect.y + mercyRect.h / 2 - 9, 3);
        } else if (!this._mercyShards) {
          // MERCY shatters into five readable letter blocks, not confetti.
          const m = mercyBtnRect(W, H);
          this._mercyShards = [];
          for (let i = 0; i < 5; i++) {
            this._mercyShards.push({
              x: m.x + i * (m.w / 5) + 2,
              y: m.y + 2,
              w: m.w / 5 - 4,
              h: m.h - 4,
              vx: (i - 2) * 22 + (Math.random() - 0.5) * 24,
              vy: -40 - Math.random() * 70,
              t: 0,
              glyph: "MERCY"[i],
            });
          }
        }
        if (this._mercyShards) {
          for (const sh of this._mercyShards) {
            sh.t += 1 / 60;
            sh.x += sh.vx / 60;
            sh.y += sh.vy / 60;
            sh.vy += 260 / 60;
            const a = Math.max(0, 1 - sh.t / 1.4);
            if (a <= 0) continue;
            c.globalAlpha = a;
            c.fillStyle = "#ff8a00";
            c.fillRect(Math.round(sh.x), Math.round(sh.y), Math.round(sh.w), Math.round(sh.h));
            c.fillStyle = "#050308";
            c.fillRect(Math.round(sh.x) + 2, Math.round(sh.y) + 2, Math.round(sh.w) - 4, Math.round(sh.h) - 4);
            c.fillStyle = "#ff8a00";
            c.font = "bold 11px monospace";
            c.fillText(sh.glyph, Math.round(sh.x) + 4, Math.round(sh.y) + Math.round(sh.h) - 4);
          }
          c.globalAlpha = 1;
        }
        if (this.step === 4 && this.t >= 0.52 && this.t <= 1.04) {
          const fall = Math.max(0, Math.min(1, (this.t - 0.52) / 0.3));
          const hitY = mercyRect.y + mercyRect.h / 2;
          const boneY = hitY - (1 - fall) * 170;
          drawBoneWhite(c, mercyRect.x + mercyRect.w / 2, boneY, 78, -Math.PI / 2);
          if (this.t >= 0.82 && this.t < 0.94) {
            c.globalAlpha = 0.34;
            c.fillStyle = "#ffffff";
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }
        }
        c.restore();
      }
    },
  };
}

function HEIGHT_MID(self) {
  return self.WALL_H + (self.HEIGHT - self.WALL_H) / 2;
}

// push a target away from a source point
function knockback(player, src, force, ctx) {
  const dx = player.x - src.x;
  const dy = player.y - src.y;
  const d = Math.hypot(dx, dy) || 1;
  player.x += (dx / d) * force;
  player.y = Math.max(ctx.WALL_H + player.radius, Math.min(ctx.HEIGHT - player.radius, player.y + (dy / d) * force));
}

function segHitsPlayer(h, player, pad) {
  return distToSeg(player.x, player.y, h.x1, h.y1, h.x2, h.y2) < pad + player.radius;
}

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function inRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

// UT pixel buttons (P0 美术止血): canvas-drawn, black slab + orange hard
// border + orange mono bold — no sprites, no rounding, no gradients, no blur
export function fightBtnRect(W, H) {
  const ph = W >= 1000;
  const w = ph ? 128 : 144;
  const h = ph ? 48 : 54;
  return { x: W / 2 - w - 36, y: H - 128, w, h };
}
export function mercyBtnRect(W, H) {
  const ph = W >= 1000;
  const w = ph ? 128 : 144;
  const h = ph ? 48 : 54;
  return { x: W / 2 + 36, y: H - 128, w, h };
}
function drawUTButton(c, r, label) {
  c.fillStyle = "#ff8a00"; // hard 4px border: orange slab under black plate
  c.fillRect(r.x, r.y, r.w, r.h);
  c.fillStyle = "#050308";
  c.fillRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8);
  c.fillStyle = "#ff8a00";
  c.font = `bold ${r.h >= 54 ? 22 : 20}px monospace`;
  c.textAlign = "center";
  c.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 8);
  c.textAlign = "left";
}

function drawBoneRed(c, x, y, size, angle) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.imageSmoothingEnabled = false;
  c.drawImage(PROJECTILE_BONE_RED, -size / 2, -size / 2, size, size);
  c.restore();
}

function drawBoneWhite(c, x, y, size, angle) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.imageSmoothingEnabled = false;
  c.drawImage(PROJECTILE_BONE, -size / 2, -size / 2, size, size);
  c.restore();
}

// corrupted sans: hard-edged pixel erosion, blank white sockets,
// walk animation, wind-up gestures and teleport fades
function drawBossBody(c, x, y, t, active, opts = {}) {
  const { shake = 0, gesture = null, tele = null, animT = 0, faceDir = "down", moving = false, hitFlash = 0, phase2 = false, scale = 1 } = opts;
  // pick a walk frame like the player does
  const frames = WALK_SETS.sans[faceDir] || WALK_SETS.sans.down;
  const spr = moving ? frames[Math.floor(animT * 7) % 4] : frames[0];

  // gesture offsets: hop up, lunge forward, recoil back, crouch, channel tremble
  let gx = 0;
  let gy = 0;
  let sqx = 1;
  let sqy = 1;
  if (gesture) {
    const k = gesture.t / gesture.dur; // 0..1
    const arc = Math.sin(Math.min(k / 0.62, 1) * Math.PI);
    if (gesture.kind === "hop") {
      gy = -26 * arc;
      sqy = k > 0.62 ? 0.82 : 1 + arc * 0.12; // squash on landing
      sqx = k > 0.62 ? 1.18 : 1;
    } else if (gesture.kind === "lunge") {
      gx = 14 * arc;
      sqx = 1 + arc * 0.15;
    } else if (gesture.kind === "recoil") {
      gx = -12 * arc;
      sqy = 1 + arc * 0.1;
    } else if (gesture.kind === "crouch") {
      sqy = 1 - arc * 0.3;
      sqx = 1 + arc * 0.2;
    } else if (gesture.kind === "channel") {
      gx = Math.sin(gesture.t * 45) * 2.5;
      gy = -6 * arc;
    }
  }
  // teleport: shrink+fade out, then pop back in
  let alpha = active ? 1 : 0.85;
  if (tele) {
    const half = tele.t < 0.18 ? 1 - tele.t / 0.18 : (tele.t - 0.18) / 0.16;
    alpha *= Math.max(0.05, half);
    sqy *= 0.6 + half * 0.4;
  }

  c.save();
  // flickering dark-red blocks around the body
  c.fillStyle = phase2 ? "#8a2f96" : "#5a1414";
  for (let i = 0; i < (phase2 ? 10 : 6); i++) {
    if ((Math.floor(t * 12) + i) % 3 === 0) {
      const a = (i / (phase2 ? 10 : 6)) * Math.PI * 2 + t;
      const r = 30 + (i % 2) * (phase2 ? 13 : 9);
      c.globalAlpha = alpha;
      const chunk = phase2 && i % 3 === 0 ? 4 : 6;
      c.fillRect(Math.round(x + Math.cos(a) * r) - chunk / 2, Math.round(y + Math.sin(a) * r) - chunk / 2, chunk, chunk);
    }
  }
  c.imageSmoothingEnabled = false;
  const baseH = (phase2 ? 60 : 48) * scale;
  const drawH = baseH * sqy;
  const drawW = (spr.width / spr.height) * baseH * sqx;
  c.globalAlpha = alpha;
  const bx = x + shake + gx;
  const by = y + gy + (48 - drawH) / 2; // keep the feet planted when squashing
  if (phase2) {
    const purple = tintedBossSprite(spr, "#8a2f96");
    const red = tintedBossSprite(spr, "#a8283c");
    c.globalAlpha = alpha * 0.9;
    c.drawImage(purple, bx - drawW / 2 - 3, by - drawH / 2, drawW, drawH);
    c.drawImage(purple, bx - drawW / 2 + 3, by - drawH / 2, drawW, drawH);
    c.globalAlpha = alpha * 0.7;
    c.drawImage(red, bx - drawW / 2, by - drawH / 2 + 3, drawW, drawH);
  }
  c.globalAlpha = alpha;
  c.drawImage(spr, bx - drawW / 2, by - drawH / 2, drawW, drawH);
  // blank white sockets (front-facing frames only)
  if (faceDir === "down" && !tele) {
    c.fillStyle = "#ffffff";
    c.fillRect(bx - 8 * sqx, by - drawH / 2 + 8 * sqy, 5, 5);
    c.fillRect(bx + 3 * sqx, by - drawH / 2 + 8 * sqy, 5, 5);
    if (phase2) {
      // One eye and three stepped cracks are enough to sell the corrupted
      // phase without covering the original Sans silhouette in effects.
      c.fillStyle = Math.floor(t * 10) % 2 ? "#f2a0ff" : "#c95df0";
      c.fillRect(Math.round(bx + 3 * sqx), Math.round(by - drawH / 2 + 8 * sqy), 5, 5);
      c.fillRect(Math.round(bx + 1 * sqx), Math.round(by - drawH / 2 + 10 * sqy), 9, 2);
      c.fillStyle = "#8a2f96";
      for (const [ox, oy, w, h] of [[-2, -11, 2, 5], [0, -7, 5, 2], [3, -5, 2, 5], [-7, 6, 5, 2], [-4, 8, 2, 5]]) {
        c.fillRect(Math.round(bx + ox * sqx), Math.round(by + oy * sqy), w, h);
      }
    }
  }
  // hit feedback: brief white overlay
  if (hitFlash > 0) {
    c.globalAlpha = hitFlash * 4;
    c.globalCompositeOperation = "lighter";
    c.fillStyle = "#ffffff";
    c.fillRect(bx - drawW / 2, by - drawH / 2, drawW, drawH);
  }
  c.restore();
}
