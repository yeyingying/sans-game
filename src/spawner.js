import { Enemy } from "./entities.js";
import { pickWeighted, randRange } from "./utils.js";

// endless-judgement coin decay by round (1-based).
// Applied to the DROP CHANCE (not the value) so a 10% round really pays ~10%.
export function roundCoinFactor(round) {
  if (round <= 0) return 1; // not in endless
  if (round === 1) return 0.5;
  if (round === 2) return 0.25;
  if (round === 3) return 0.1;
  return 0; // round 4+: no more coins, score only
}

export class Spawner {
  // debut times for late-game enemy types; 3 are force-spawned the moment
  // each unlocks so the player clearly sees it enter the game
  static DEBUTS = { tank: 30, red: 60, orange: 105, blue: 120, purple: 150 };

  constructor(width, height, top = 0, diff = null) {
    this.width = width;
    this.height = height;
    this.top = top; // wall band at the top: no spawns, players can't enter
    this.diffHp = diff ? diff.hpMult : 1; // difficulty tier multipliers
    this.diffDmg = diff ? diff.dmgMult : 1;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.eliteTimer = 25;
    this.introduced = new Set();
    this.endless = false; // post-boss endless judgement
    this.round = 0; // current judgement round (1-based); set by main
  }

  // spawn just outside the camera's view (camX = world x of the view's left edge);
  // never inside the top wall band
  edgePosition(camX = 0) {
    const side = Math.floor(Math.random() * 4);
    const margin = 36;
    if (side === 0 || side === 2) return { x: camX + randRange(0, this.width), y: this.height + margin };
    if (side === 1) return { x: camX + this.width + margin, y: randRange(this.top, this.height) };
    return { x: camX - margin, y: randRange(this.top, this.height) };
  }

  typeWeights() {
    const t = this.elapsed;
    const after = (start, rate, cap) => Math.max(0, Math.min((t - start) / rate, cap));
    // round 3+: ranged/teleport threats (blue reach, purple strikes) surge
    const ranged = this.endless && this.round >= 3 ? 2.2 : 1;
    return [
      { value: "slime", weight: 50 },
      { value: "bat", weight: 20 + Math.min(t / 4, 35) },
      { value: "ghost", weight: 10 + Math.min(t / 6, 30) },
      { value: "tank", weight: after(30, 3, 28) },
      { value: "red", weight: after(60, 3, 22) },
      { value: "orange", weight: after(105, 4, 16) },
      { value: "blue", weight: after(120, 4, 18) * ranged },
      { value: "purple", weight: after(150, 5, 10) * ranged },
    ];
  }

  scale(elite) {
    const t = this.elapsed;
    // linear early; from 3:00 on it compounds so strong builds stay pressured
    let hpMult = t > 180 ? (1 + 180 / 22) * Math.pow(1.22, (t - 180) / 30) : 1 + t / 22;
    // warm-up minute: lots of frail enemies so the opening feels like mowing
    if (t < 60) hpMult *= 0.6 + 0.4 * (t / 60);
    // endless judgement rounds: each round adds a pressure the player can
    // feel, never just a bigger hp sponge (see main.js for round rules)
    const r = this.endless ? this.round : 0;
    // R2+: +15% move speed (then +3%/round past R4), capped for readability
    const rSpeed = r >= 2 ? Math.min(1.15 * (1 + 0.03 * Math.max(0, r - 4)), 1.5) : 1;
    // R3+: +20% damage, R5+: +8%/round on top, capped
    const rDmg = r >= 3 ? Math.min(1.2 * (1 + 0.08 * Math.max(0, r - 4)), 2.5) : 1;
    // R5+: hp finally starts climbing too, gently capped
    const rHp = r >= 5 ? Math.min(1 + 0.1 * (r - 4), 3) : 1;
    return {
      hpMult: hpMult * this.diffHp * rHp,
      dmgMult: (1 + t / 40) * this.diffDmg * rDmg,
      speedMult: (1 + Math.min(t / 90, 0.5)) * rSpeed,
      xpMult: 1 + t / 60,
      elite,
    };
  }

  update(dt, camX = 0) {
    this.elapsed += dt;
    this.spawnTimer -= dt;
    this.eliteTimer -= dt;
    const spawned = [];

    for (const [type, start] of Object.entries(Spawner.DEBUTS)) {
      if (this.elapsed >= start && !this.introduced.has(type)) {
        this.introduced.add(type);
        for (let i = 0; i < 3; i++) {
          const pos = this.edgePosition(camX);
          spawned.push(new Enemy(type, pos.x, pos.y, this.scale(false)));
        }
      }
    }

    // warm-up opening: quick 1.1s spawns of frail enemies (see scale())
    const interval = Math.max(1.1 - this.elapsed / 45, 0.28);
    if (this.spawnTimer <= 0) {
      this.spawnTimer = interval;
      // batch growth also starts 20s later so minute one stays manageable
      const batch = 1 + Math.floor(Math.max(0, this.elapsed - 20) / 35);
      for (let i = 0; i < batch; i++) {
        const type = pickWeighted(this.typeWeights());
        const pos = this.edgePosition(camX);
        spawned.push(new Enemy(type, pos.x, pos.y, this.scale(false)));
      }
    }

    if (this.eliteTimer <= 0) {
      // endless: elites arrive faster and in bigger packs each round,
      // capped so phones don't melt
      const r = this.endless ? this.round : 0;
      this.eliteTimer = this.endless ? Math.max(6, 15 - (r - 1) * 1.5) : 30;
      const eliteCount = this.endless ? Math.min(2 + Math.floor((r - 1) / 2), 5) : 1;
      for (let i = 0; i < eliteCount; i++) {
        const type = pickWeighted(this.typeWeights());
        const pos = this.edgePosition(camX);
        spawned.push(new Enemy(type, pos.x, pos.y, this.scale(true)));
      }
    }

    return spawned;
  }
}
