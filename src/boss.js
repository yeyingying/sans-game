// 天意侵蚀Sans — a scripted two-phase boss that appears at 5:00.
// Self-contained: owns its own hazards (attacks that hurt the player), its
// rendering, health bar, subtitles, and the FIGHT / MERCY transition.
// The boss body itself is pushed into main's `enemies` array so the player's
// weapons target and damage it; everything else is driven from here.
import { PROJECTILE_BONE_RED, GB_IDLE, GB_FIRE, WALK_SETS, BTN_FIGHT, BTN_MERCY } from "./sprites.js";
import { circleHit } from "./utils.js";

export const BOSS_APPEAR_TIME = 300; // 5 minutes
const BOSS_HP = 80000; // per phase
const STRIKE_DMG = 200; // intro slam (reducible)

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
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
    takeDamage(d) {
      if (this.invulnTimer > 0) return false;
      this.hp -= d;
      this.hitFlash = 0.12;
      return true;
    },
    update() {}, // driven by the controller
  };
}

export function createBossFight(x, y, character, WIDTH, HEIGHT, WALL_H) {
  const boss = makeBossEnemy(x, y);
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
    attackTimer: 1.5,
    stillTimer: 0,
    lastPX: 0,
    lastPY: 0,
    hazards: [],
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
    bone(px, py, dmg, delay = 0.35, opts = {}) {
      this.hazards.push({
        kind: "bone",
        x: px,
        y: py,
        dmg,
        t: -delay,
        life: 0.7,
        hit: false,
        size: opts.size || 28,
        blast: opts.blast || 0,
        ...opts,
      });
    },
    wall(x1, y1, x2, y2, dmg, life) {
      this.hazards.push({ kind: "wall", x1, y1, x2, y2, dmg, t: 0, life, hitTimer: 0 });
    },
    blaster(bx, by, angle, dmg, life) {
      this.hazards.push({ kind: "blaster", x: bx, y: by, angle, dmg, t: 0, life, warned: false });
    },
    boom(px, py, r, dmg, delay = 0) {
      this.hazards.push({ kind: "boom", x: px, y: py, r, dmg, t: -delay, life: 0.4, hit: false });
    },
    homingBone(bx, by, dmg) {
      this.hazards.push({ kind: "homing", x: bx, y: by, vx: 0, vy: 0, dmg, hp: 200, t: 0, life: 5, hit: 0 });
    },

    // ----- main update ------------------------------------------------------
    update(dt, ctx) {
      const { player } = ctx;
      this.t += dt;
      if (this.subtitleT > 0) this.subtitleT -= dt;
      if (boss.hitFlash > 0) boss.hitFlash -= dt;

      if (this.state === "intro") this.updateIntro(dt, ctx);
      else if (this.state === "fight1" || this.state === "fight2") this.updateFight(dt, ctx);
      else if (this.state === "transition") this.updateTransition(dt, ctx);
      else if (this.state === "death") this.updateDeath(dt, ctx);

      this.updateHazards(dt, ctx);

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
          player.takeDamage(STRIKE_DMG);
          knockback(player, boss, 70, ctx);
        }
        if (this.t > 0.9) {
          this.subtitleShow("* 天意侵蚀Sans出现了！", 3);
          this.startFight(1);
        }
      }
    },

    startFight(phase) {
      this.phase = phase;
      this.state = phase === 1 ? "fight1" : "fight2";
      boss.invulnTimer = 0;
      this.attackTimer = 1.2;
      this.t = 0;
    },

    // ----- combat AI --------------------------------------------------------
    updateFight(dt, ctx) {
      const { player } = ctx;
      // drift the boss gently around its home spot, facing the player
      boss.x += (this.homeX - boss.x) * Math.min(1, dt * 1.5);
      boss.y += (this.homeY - boss.y) * Math.min(1, dt * 1.5) + Math.sin(this.t * 2) * 6 * dt;

      // track "player standing still"
      if (dist(player.x, player.y, this.lastPX, this.lastPY) < 4) this.stillTimer += dt;
      else this.stillTimer = 0;
      this.lastPX = player.x;
      this.lastPY = player.y;

      this.attackTimer -= dt;
      if (this.attackTimer > 0) return;
      const rate = this.phase === 2 ? 1.2 : 1; // phase 2 attacks 20% faster
      this.attackTimer = (this.phase === 1 ? 2.2 : 2.0) / rate;

      if (this.phase === 1) this.pickAttackP1(ctx);
      else this.pickAttackP2(ctx);
    },

    pickAttackP1(ctx) {
      const { player } = ctx;
      const d = dist(player.x, player.y, boss.x, boss.y);
      const approaching = d < 150;
      const retreating = d > 320;

      if (this.stillTimer > 3) {
        // 5: bones erupt under the still player
        for (let i = 0; i < 5; i++) {
          this.bone(player.x + (Math.random() - 0.5) * 70, player.y + (Math.random() - 0.5) * 70, 60, 0.3 + i * 0.05, { size: 30 });
        }
        this.stillTimer = 0;
      } else if (approaching) {
        // 3: bone wall between boss and player
        const mx = (player.x + boss.x) / 2;
        const my = (player.y + boss.y) / 2;
        const a = Math.atan2(player.y - boss.y, player.x - boss.x) + Math.PI / 2;
        this.wall(mx - Math.cos(a) * 70, my - Math.sin(a) * 70, mx + Math.cos(a) * 70, my + Math.sin(a) * 70, 20, 2.5);
      } else if (retreating) {
        // 4: gaster blaster behind the boss, straight beam
        const a = Math.atan2(player.y - boss.y, player.x - boss.x);
        this.blaster(boss.x - Math.cos(a) * 30, boss.y - Math.sin(a) * 30, a, 1, 1.4);
      } else if (d < 90) {
        // 2: dash to player, knockback, teleport back (50% reduction, 120 dmg)
        this.dashAttack(ctx);
      } else {
        // 1: bone on each of the 4 sides of the player
        this.bone(player.x, player.y - 46, 80);
        this.bone(player.x, player.y + 46, 80);
        this.bone(player.x - 46, player.y, 80);
        this.bone(player.x + 46, player.y, 80);
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
      const roll = Math.floor(Math.random() * 5);
      if (roll === 0) {
        // 1: bone wall sealing 1/3 of the map on the side the player is NOT on
        const leftSide = player.x < ctx.camX + this.WIDTH / 2;
        const wx = leftSide ? ctx.camX + this.WIDTH * 0.72 : ctx.camX + this.WIDTH * 0.28;
        this.wall(wx, this.WALL_H, wx, this.HEIGHT, 20, 10);
      } else if (roll === 1) {
        // 2: summon 30 random monsters (no xp)
        ctx.summon(30);
      } else if (roll === 2) {
        // 3: 5 giant ground bones, 200 dmg + 50 explosion
        for (let i = 0; i < 5; i++) {
          const bx = ctx.camX + 80 + Math.random() * (this.WIDTH - 160);
          const by = this.WALL_H + 40 + Math.random() * (this.HEIGHT - this.WALL_H - 80);
          this.bone(bx, by, 200, 0.4 + i * 0.1, { size: 70, blast: 90, blastDmg: 50 });
        }
      } else if (roll === 3) {
        // 4: 10 homing bones behind the boss, fly at the player
        for (let i = 0; i < 10; i++) {
          this.homingBone(boss.x - 20 + (Math.random() - 0.5) * 40, boss.y + (Math.random() - 0.5) * 40, 150);
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
      boss.hp = 1;
      boss.invulnTimer = 999;
      this.hazards.length = 0;
      // retreat to the top-center of the view
      this.homeX = ctx.camX + this.WIDTH / 2;
      this.homeY = this.WALL_H + 60;
    },

    updateTransition(dt, ctx) {
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
        if (this.t > 1.0) {
          this.step = 2;
          this.t = 0;
        }
      } else if (this.step === 2) {
        this.shake = Math.sin(this.t * 40) * 5 * Math.max(0, 1 - this.t / 0.6);
        if (this.t > 0.7) {
          this.shake = 0;
          this.step = 3;
          this.t = 0;
          // walk down to stand before the MERCY button
          const m = mercyBtnRect(this.WIDTH, this.HEIGHT);
          this._mercyX = ctx.camX + m.x + m.w / 2;
          this._mercyY = m.y - 30;
        }
      } else if (this.step === 3) {
        boss.x += (this._mercyX - boss.x) * Math.min(1, dt * 2.2);
        boss.y += (this._mercyY - boss.y) * Math.min(1, dt * 2.2);
        if (dist(boss.x, boss.y, this._mercyX, this._mercyY) < 8 && this.t > 1.2) {
          this.step = 4;
          this.t = 0;
          this.subtitleShow("* Sans 拒绝了仁慈", 2.5);
        }
      } else if (this.step === 4) {
        if (this.t > 0.8 && !this._mercySmash) {
          this._mercySmash = true;
          // a giant bone falls from the sky and shatters MERCY
          const m = mercyBtnRect(this.WIDTH, this.HEIGHT);
          this.bone(ctx.camX + m.x + m.w / 2, m.y + m.h / 2, 0, 0.15, { size: 100 });
        }
        if (this.t > 1.1) this.mercySmashed = true; // button breaks
        if (this.t > 2.0) {
          // refill, return home, phase 2
          this.mercyChoice = false;
          this.mercySmashed = false;
          boss.maxHp = BOSS_HP;
          boss.hp = BOSS_HP;
          this.homeX = ctx.camX + this.WIDTH * 0.72;
          this.homeY = HEIGHT_MID(this);
          this.startFight(2);
        }
      }
    },

    // ----- death ------------------------------------------------------------
    beginDeath(ctx) {
      this.state = "death";
      this.t = 0;
      boss.invulnTimer = 999;
      this.hazards.length = 0;
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
        } else if (h.kind === "wall") {
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
          if (k >= 1 && !h.hit) {
            h.hit = true;
            if (circleHit(boss.x, boss.y, 40, player.x, player.y, player.radius)) {
              player.takeDamage(h.dmg);
              knockback(player, { x: h.fromX, y: h.fromY }, 60, ctx);
            }
          }
          if (h.t > 0.32) {
            // teleport back home
            boss.x = this.homeX;
            boss.y = this.homeY;
            boss.invulnTimer = 0;
          }
        }
      }
      this.hazards = this.hazards.filter((h) => h.t < (h.life ?? 1));
    },

    // ----- drawing (world space; caller has translated by -camX) -----------
    draw(ctx2d) {
      const c = ctx2d;
      // hazards
      for (const h of this.hazards) {
        if (h.kind === "bone") {
          const app = h.t < 0 ? 1 + h.t / 0.35 : 1;
          c.save();
          c.globalAlpha = h.t < 0 ? 0.4 : Math.max(0, 1 - h.t / h.life);
          drawBoneRed(c, h.x, h.y, h.size, h.t < 0 ? -Math.PI / 2 : -Math.PI / 2);
          if (h.t < 0) {
            c.strokeStyle = "#e04545";
            c.globalAlpha = 0.5;
            c.beginPath();
            c.arc(h.x, h.y, h.size * 0.4 * (1 - app + 0.3), 0, Math.PI * 2);
            c.stroke();
          }
          c.restore();
        } else if (h.kind === "boom") {
          if (h.t < 0) {
            c.save();
            c.globalAlpha = 0.4;
            c.strokeStyle = "#ff5d5d";
            c.beginPath();
            c.arc(h.x, h.y, h.r, 0, Math.PI * 2);
            c.stroke();
            c.restore();
          } else {
            const k = h.t / h.life;
            c.save();
            c.globalAlpha = (1 - k) * 0.8;
            c.fillStyle = "#e04545";
            c.beginPath();
            c.arc(h.x, h.y, h.r * (0.5 + k * 0.6), 0, Math.PI * 2);
            c.fill();
            c.restore();
          }
        } else if (h.kind === "wall") {
          const n = Math.max(2, Math.round(dist(h.x1, h.y1, h.x2, h.y2) / 20));
          for (let i = 0; i <= n; i++) {
            const bx = h.x1 + ((h.x2 - h.x1) * i) / n;
            const by = h.y1 + ((h.y2 - h.y1) * i) / n;
            drawBoneRed(c, bx, by, 22, Math.atan2(h.y2 - h.y1, h.x2 - h.x1) + Math.PI / 2);
          }
        } else if (h.kind === "blaster") {
          const spr = h.t > 0.45 ? GB_FIRE : GB_IDLE;
          c.save();
          c.translate(h.x, h.y);
          c.rotate(h.angle - Math.PI / 2);
          c.imageSmoothingEnabled = false;
          const gw = 56;
          c.drawImage(spr, -gw / 2, -(spr.height / spr.width) * gw / 2, gw, (spr.height / spr.width) * gw);
          c.restore();
          if (h.t > 0.45) {
            const len = 900;
            c.save();
            c.globalAlpha = 0.8;
            c.strokeStyle = "#ff9a9a";
            c.lineWidth = 40;
            c.beginPath();
            c.moveTo(h.x, h.y);
            c.lineTo(h.x + Math.cos(h.angle) * len, h.y + Math.sin(h.angle) * len);
            c.stroke();
            c.strokeStyle = "#ffffff";
            c.lineWidth = 16;
            c.stroke();
            c.restore();
          }
        } else if (h.kind === "homing") {
          drawBoneRed(c, h.x, h.y, 16, Math.atan2(h.vy, h.vx) + Math.PI / 2);
        }
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

      // boss body (unless fully dead)
      if (this.state !== "death" || this.t < 1.2) {
        drawBossBody(c, boss.x, boss.y, this.t, boss.invulnTimer <= 0 || this.state === "transition", this.shake || 0);
      }
    },

    // ----- screen-space overlay (health bar, subtitle, buttons) ------------
    drawOverlay(ctx2d) {
      const c = ctx2d;
      const W = this.WIDTH;
      const H = this.HEIGHT;
      // boss health bar at the bottom
      if (this.state === "fight1" || this.state === "fight2" || this.state === "transition") {
        const bw = W * 0.6;
        const bx = (W - bw) / 2;
        const by = H - 46;
        c.save();
        c.textAlign = "center";
        c.fillStyle = "#e04545";
        c.font = "bold 15px monospace";
        const name = this.phase === 2 ? "天意侵蚀Sans · 二阶" : "天意侵蚀Sans";
        c.fillText(name, W / 2, by - 8);
        c.fillStyle = "#3a1414";
        c.fillRect(bx, by, bw, 14);
        const pct = Math.max(0, boss.hp / boss.maxHp);
        c.fillStyle = "#e04545";
        c.fillRect(bx, by, bw * pct, 14);
        c.strokeStyle = "#ff9a9a";
        c.lineWidth = 2;
        c.strokeRect(bx, by, bw, 14);
        c.restore();
      }
      // subtitle
      if (this.subtitleT > 0 && this.subtitle) {
        c.save();
        c.globalAlpha = Math.min(1, this.subtitleT);
        c.textAlign = "center";
        c.fillStyle = "#ffffff";
        c.font = "bold 22px monospace";
        c.fillText(this.subtitle, W / 2, H - 90);
        c.restore();
      }
      // FIGHT / MERCY buttons (1:1 sprites from the reference image)
      if (this.mercyChoice) {
        const f = fightBtnRect(W, H);
        c.save();
        c.imageSmoothingEnabled = false;
        c.drawImage(BTN_FIGHT, f.x, f.y, f.w, f.h);
        if (!this.mercySmashed) {
          const m = mercyBtnRect(W, H);
          c.drawImage(BTN_MERCY, m.x, m.y, m.w, m.h);
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

export function fightBtnRect(W, H) {
  return { x: W / 2 - 220, y: H / 2 - 40, w: 176, h: 78 };
}
export function mercyBtnRect(W, H) {
  return { x: W / 2 + 44, y: H / 2 - 40, w: 176, h: 83 };
}

function drawBoneRed(c, x, y, size, angle) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.imageSmoothingEnabled = false;
  c.drawImage(PROJECTILE_BONE_RED, -size / 2, -size / 2, size, size);
  c.restore();
}

// corrupted sans: red glow, flickering dark-red blocks, blank white sockets
function drawBossBody(c, x, y, t, active, shake = 0) {
  const spr = WALK_SETS.sans.down[0];
  c.save();
  // flickering dark-red blocks around the body
  c.fillStyle = "#5a1414";
  for (let i = 0; i < 6; i++) {
    if ((Math.floor(t * 12) + i) % 3 === 0) {
      const a = (i / 6) * Math.PI * 2 + t;
      const r = 30 + (i % 2) * 9;
      c.fillRect(x + Math.cos(a) * r - 3, y + Math.sin(a) * r - 3, 6, 6);
    }
  }
  // red glow
  c.shadowColor = "#ff2d2d";
  c.shadowBlur = 20;
  c.imageSmoothingEnabled = false;
  // exactly player-sized: radius 11 * 4.4 scaled on the taller dimension
  const drawH = 48;
  const drawW = (spr.width / spr.height) * drawH;
  c.globalAlpha = active ? 1 : 0.85;
  const bx = x + shake;
  c.drawImage(spr, bx - drawW / 2, y - drawH / 2, drawW, drawH);
  // blank the eyes: white sockets, no pupils
  c.shadowBlur = 0;
  c.fillStyle = "#ffffff";
  c.fillRect(bx - 8, y - drawH / 2 + 8, 5, 5);
  c.fillRect(bx + 3, y - drawH / 2 + 8, 5, 5);
  c.restore();
}
