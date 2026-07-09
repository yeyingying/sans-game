import { Enemy } from "./entities.js";
import { pickWeighted, randRange } from "./utils.js";

export class Spawner {
  // debut times for late-game enemy types; 3 are force-spawned the moment
  // each unlocks so the player clearly sees it enter the game
  static DEBUTS = { tank: 30, red: 60, orange: 105, blue: 120, purple: 150 };

  constructor(width, height, top = 0) {
    this.width = width;
    this.height = height;
    this.top = top; // wall band at the top: no spawns, players can't enter
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.eliteTimer = 25;
    this.introduced = new Set();
    this.endless = false; // post-boss: elites come faster and bigger batches
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
    return [
      { value: "slime", weight: 50 },
      { value: "bat", weight: 20 + Math.min(t / 4, 35) },
      { value: "ghost", weight: 10 + Math.min(t / 6, 30) },
      { value: "tank", weight: after(30, 3, 28) },
      { value: "red", weight: after(60, 3, 22) },
      { value: "orange", weight: after(105, 4, 16) },
      { value: "blue", weight: after(120, 4, 18) },
      { value: "purple", weight: after(150, 5, 10) },
    ];
  }

  scale(elite) {
    const t = this.elapsed;
    // linear early; from 3:00 on it compounds so strong builds stay pressured
    let hpMult = t > 180 ? (1 + 180 / 22) * Math.pow(1.18, (t - 180) / 30) : 1 + t / 22;
    // warm-up minute: lots of frail enemies so the opening feels like mowing
    if (t < 60) hpMult *= 0.6 + 0.4 * (t / 60);
    return {
      hpMult,
      dmgMult: 1 + t / 50,
      speedMult: 1 + Math.min(t / 90, 0.35),
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
      this.eliteTimer = this.endless ? 16 : 30;
      const eliteCount = this.endless ? 2 : 1;
      for (let i = 0; i < eliteCount; i++) {
        const type = pickWeighted(this.typeWeights());
        const pos = this.edgePosition(camX);
        spawned.push(new Enemy(type, pos.x, pos.y, this.scale(true)));
      }
    }

    return spawned;
  }
}
