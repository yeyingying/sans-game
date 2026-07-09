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
    return {
      hpMult: 1 + t / 22,
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

    // gentler opening: longer gaps during the first minute, old pace after
    const early = Math.max(0, 1 - this.elapsed / 60); // 1 -> 0 over 60s
    const interval = Math.max(1.3 - this.elapsed / 40, 0.28) + early * 0.7;
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
      this.eliteTimer = 30;
      const type = pickWeighted(this.typeWeights());
      const pos = this.edgePosition(camX);
      spawned.push(new Enemy(type, pos.x, pos.y, this.scale(true)));
    }

    return spawned;
  }
}
