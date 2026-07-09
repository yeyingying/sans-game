import { clamp } from "./utils.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.weapons = []; // WeaponInstance[], assigned by main
    this.radius = 11;
    this.maxHp = 100;
    this.hp = 100;
    this.moveSpeed = 165;
    this.atk = 6;
    this.range = 130;
    this.fireRate = 1.3;
    this.projectileSpeed = 300;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 10;
    this.invuln = 0;
    this.activeInvuln = 0; // slam-enhance i-frames: white pulse instead of blink
    this.regen = 0;
    this.thorns = 0; // contact damage dealt back to touching enemies
    this.dodge = 0; // chance to ignore a hit, capped at 0.45
    this.dmgReduction = 0; // incoming damage cut, capped at 0.9
    this.dmgAmp = 1; // outgoing weapon damage multiplier
    this.dodged = false; // set by takeDamage when a hit was dodged
    this.magnetRadius = 60;
    this.kills = 0;
    this.facing = 1;
    this.dir = "down"; // facing for the 4-direction walk animation
    this.moving = false;
    this.walkTime = 0;
    this.idleTime = 0;
    this.shieldTimer = 0; // set each frame by the UKB shield weapon
  }

  update(dt, moveVec, bounds) {
    // hard cap at 400% of base speed so pickups can always catch the player
    const speed = Math.min(this.moveSpeed, 660);
    this.x = clamp(this.x + moveVec.x * speed * dt, bounds.left, bounds.right);
    this.y = clamp(this.y + moveVec.y * speed * dt, bounds.top, bounds.bottom);
    if (moveVec.x !== 0) this.facing = moveVec.x > 0 ? 1 : -1;
    this.moving = moveVec.x !== 0 || moveVec.y !== 0;
    if (this.moving) {
      this.idleTime = 0;
      this.walkTime += dt;
      this.dir =
        Math.abs(moveVec.x) >= Math.abs(moveVec.y)
          ? moveVec.x > 0
            ? "right"
            : "left"
          : moveVec.y > 0
            ? "down"
            : "up";
    } else {
      this.walkTime = 0;
      this.idleTime += dt;
      // after standing still for a bit, turn back to face the camera
      if (this.idleTime > 2.5) this.dir = "down";
    }
    if (this.invuln > 0) this.invuln -= dt;
    if (this.activeInvuln > 0) this.activeInvuln -= dt;
    if (this.regen > 0) this.hp = Math.min(this.maxHp, this.hp + this.regen * dt);
  }

  takeDamage(amount) {
    this.dodged = false;
    if (this.invuln > 0) return false;
    if (this.dodge > 0 && Math.random() < this.dodge) {
      this.dodged = true;
      return false;
    }
    const reduction = Math.min(this.dmgReduction + (this.guardBonus || 0), 0.9);
    this.hp -= Math.max(1, Math.round(amount * (1 - reduction)));
    this.invuln = 0.6;
    return true;
  }

  addXp(amount) {
    this.xp += amount;
    let levels = 0;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.round(this.xpToNext * 1.22 + 6);
      this.maxHp += 5;
      this.hp = Math.min(this.maxHp, this.hp + 5);
      this.atk += 1;
      levels += 1;
    }
    return levels;
  }
}

export const ENEMY_TEMPLATES = {
  slime: { hp: 9, speed: 62, dmg: 8, radius: 10, xp: 3, sprite: "slime", contactInterval: 0.6 },
  bat: { hp: 5, speed: 118, dmg: 6, radius: 8, xp: 3, sprite: "bat", contactInterval: 0.5 },
  ghost: { hp: 15, speed: 46, dmg: 10, radius: 11, xp: 5, sprite: "ghost", contactInterval: 0.6 },
  tank: { hp: 42, speed: 28, dmg: 15, radius: 14, xp: 11, sprite: "tank", contactInterval: 0.8 },
  // burst: invulnerable + double speed for the first 1.5s after spawning
  red: { hp: 15, speed: 62, dmg: 10, radius: 10, xp: 6, sprite: "red", contactInterval: 0.6, burst: 1.5 },
  // three lives; 0.5s invulnerability after each "death"
  orange: { hp: 14, speed: 34, dmg: 12, radius: 11, xp: 12, sprite: "orange", contactInterval: 0.7, lives: 3, reviveInvuln: 0.5 },
  // hits from farther away; its attack range is drawn as a ring
  blue: { hp: 10, speed: 100, dmg: 9, radius: 9, xp: 8, sprite: "blue", contactInterval: 0.6, attackRangeBonus: 22 },
  // marks the player's feet, teleports to the mark 1s later for 30 dmg
  purple: { hp: 8, speed: 62, dmg: 10, radius: 10, xp: 10, sprite: "purple", contactInterval: 0.6, teleporter: true },
};

let enemyIdCounter = 0;

export class Enemy {
  constructor(type, x, y, scale) {
    const t = ENEMY_TEMPLATES[type];
    this.id = enemyIdCounter++;
    this.type = type;
    this.sprite = t.sprite;
    this.x = x;
    this.y = y;
    this.radius = t.radius * (scale.elite ? 1.6 : 1);
    this.maxHp = Math.round(t.hp * scale.hpMult * (scale.elite ? 5 : 1));
    this.hp = this.maxHp;
    this.speed = t.speed * scale.speedMult * (scale.elite ? 0.85 : 1);
    this.dmg = Math.round(t.dmg * scale.dmgMult * (scale.elite ? 1.8 : 1));
    this.xp = Math.round(t.xp * scale.xpMult * (scale.elite ? 6 : 1));
    this.elite = !!scale.elite;
    this.contactInterval = t.contactInterval;
    this.contactTimer = 0;
    this.orbitTimer = 0;
    this.thornsTick = 0;
    this.laserTick = 0;
    this.hitFlash = 0;
    this.wiggle = Math.random() * Math.PI * 2;
    // special mechanics
    this.maxLives = t.lives || 1;
    this.lives = this.maxLives;
    this.reviveInvuln = t.reviveInvuln || 1;
    this.attackRange = this.radius + (t.attackRangeBonus || 0);
    this.invulnTimer = t.burst || 0;
    this.burstTimer = t.burst || 0;
    this.teleporter = !!t.teleporter;
    this.markTimer = 0; // 0 -> mark immediately on spawn
    this.mark = null;
    this.strike = null;
    this.rootTimer = 0; // 禁锢: no move, no attack, invulnerability disabled
    this.slowTimer = 0; // 减速: half speed
  }

  // All damage flows through here so spawn/revive invulnerability works
  // against every weapon. Returns false while immune.
  takeDamage(dmg) {
    // rooted enemies lose their invulnerability
    if (this.invulnTimer > 0 && this.rootTimer <= 0) return false;
    this.hp -= dmg;
    this.hitFlash = 0.15;
    if (this.hp <= 0 && this.lives > 1) {
      this.lives -= 1;
      this.hp = this.maxHp;
      this.invulnTimer = this.reviveInvuln;
    }
    return true;
  }

  update(dt, target) {
    if (this.rootTimer > 0) {
      // rooted: no movement, no teleport progress; damage-gate timers still tick
      this.rootTimer -= dt;
      if (this.contactTimer > 0) this.contactTimer -= dt;
      if (this.orbitTimer > 0) this.orbitTimer -= dt;
      if (this.laserTick > 0) this.laserTick -= dt;
      if (this.hitFlash > 0) this.hitFlash -= dt;
      return;
    }
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    let nx = dx / dist;
    let ny = dy / dist;
    if (this.type === "bat") {
      this.wiggle += dt * 6;
      const perpX = -ny;
      const perpY = nx;
      const wobble = Math.sin(this.wiggle) * 0.5;
      nx += perpX * wobble;
      ny += perpY * wobble;
    }
    const speedMult = (this.burstTimer > 0 ? 2 : 1) * (this.slowTimer > 0 ? 0.5 : 1);
    this.x += nx * this.speed * speedMult * dt;
    this.y += ny * this.speed * speedMult * dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;

    if (this.teleporter) {
      if (this.mark) {
        this.mark.t -= dt;
        if (this.mark.t <= 0) {
          this.x = this.mark.x;
          this.y = this.mark.y;
          this.strike = { x: this.x, y: this.y }; // consumed by main
          this.mark = null;
        }
      } else {
        this.markTimer -= dt;
        if (this.markTimer <= 0) {
          this.mark = { x: target.x, y: target.y, t: 1 };
          this.markTimer = 4;
        }
      }
    }

    if (this.contactTimer > 0) this.contactTimer -= dt;
    if (this.orbitTimer > 0) this.orbitTimer -= dt;
    if (this.thornsTick > 0) this.thornsTick -= dt;
    if (this.laserTick > 0) this.laserTick -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.burstTimer > 0) this.burstTimer -= dt;
  }
}

export class Projectile {
  constructor(opts) {
    Object.assign(this, opts);
    this.hitSet = new Set();
    this.age = 0;
  }

  update(dt) {
    this.age += dt;
    const dx = this.vx * dt;
    const dy = this.vy * dt;
    this.x += dx;
    this.y += dy;
    this.traveled += Math.hypot(dx, dy);
  }

  get expired() {
    return this.traveled >= this.maxRange || this.pierce <= 0;
  }
}

// Ground spike: erupts (after an optional delay) and damages everything
// nearby. Extras used by UKB skills: root (禁锢 seconds), wave (soundwave
// blast radius + knockback), fall (bone drops from the sky), color.
export class Spike {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.dmg = opts.dmg;
    this.t = 0;
    this.delay = opts.delay || 0;
    this.duration = this.delay + 0.5;
    this.hasHit = false;
    this.root = opts.root || 0;
    this.wave = opts.wave || 0;
    this.knockback = opts.knockback || 0;
    this.fall = !!opts.fall;
    this.color = opts.color || "#d9c47a";
    this.blast = opts.blast || null; // secondary blast: { radius, dmg, root, color }
    this.boneSize = opts.boneSize || 22;
    this.axe = !!opts.axe; // draw an axe instead of a bone when erupting
    this.noBone = !!opts.noBone; // shockwave only, skip the bone pop
    this.invulnPerHit = opts.invulnPerHit || 0; // slam enhance: i-frames per enemy hit
    this.deathBlast = opts.deathBlast || null; // quake enhance: kills explode
    this.hollow = !!opts.hollow; // wave ring drawn as a hollow circle
  }

  update(dt) {
    this.t += dt;
  }

  get erupting() {
    return this.t >= this.delay;
  }

  get expired() {
    return this.t >= this.duration;
  }
}

export class Bomb {
  constructor({ x, y, tx, ty, dmg, blast, echo = 0 }) {
    this.x = x;
    this.y = y;
    this.tx = tx;
    this.ty = ty;
    this.dmg = dmg;
    this.blast = blast;
    this.echo = echo;
    this.speed = 300;
    this.spin = Math.random() * Math.PI * 2;
    this.startDist = Math.max(Math.hypot(tx - x, ty - y), 1);
    this.exploded = false;
  }

  update(dt) {
    this.spin += dt * 10;
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (dist <= step) {
      this.x = this.tx;
      this.y = this.ty;
      this.exploded = true;
      return;
    }
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  // fake lob arc for rendering only
  get arcOffset() {
    const remaining = Math.hypot(this.tx - this.x, this.ty - this.y);
    const progress = 1 - remaining / this.startDist;
    return Math.sin(progress * Math.PI) * 26;
  }
}

export class Explosion {
  constructor(x, y, radius, color = "#ffd166", hollow = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.hollow = hollow; // ring only, no fill (quake shockwaves)
    this.life = 0.35;
    this.maxLife = 0.35;
  }

  update(dt) {
    this.life -= dt;
  }

  get expired() {
    return this.life <= 0;
  }
}

export class Pickup {
  constructor(x, y, kind, data) {
    this.x = x;
    this.y = y;
    this.kind = kind; // "xp" | "equipment"
    this.data = data;
    this.radius = kind === "xp" ? 5 : 7;
    this.beingPulled = false;
  }

  update(dt, target, magnetRadius) {
    const dist = Math.hypot(target.x - this.x, target.y - this.y);
    if (dist < magnetRadius || this.beingPulled) {
      this.beingPulled = true;
      // always outrun the player so pulled pickups can never be kited forever
      const speed = Math.max(420, Math.min(target.moveSpeed || 0, 660) * 1.2);
      const nx = (target.x - this.x) / (dist || 1);
      const ny = (target.y - this.y) / (dist || 1);
      this.x += nx * speed * dt;
      this.y += ny * speed * dt;
    }
  }
}

export class FloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 0.9;
    this.maxLife = 0.9;
  }

  update(dt) {
    this.y -= 28 * dt;
    this.life -= dt;
  }

  get expired() {
    return this.life <= 0;
  }
}
