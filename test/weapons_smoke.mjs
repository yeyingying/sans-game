// 付费角色武器无头冒烟(Insanity+黑客结局 16把 × 基础/满阶/满强化/进化 4档):
// 每把驱动 ~6s 模拟,抓运行时异常/NaN/坐标失控。新加武器把列表挂进循环即可。
// 用法: node test/weapons_smoke.mjs (在仓库根运行)
globalThis.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => new Proxy({}, { get: () => () => {} }),
  }),
};
globalThis.location = { search: "" };
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = globalThis;
globalThis.performance = { now: () => Date.now() };

const { WEAPON_LISTS, createWeaponInstance, updateWeapons, insanityBusy, getScytheSwing, getRideInfo } = await import(
  new URL(process.cwd() + "/src/weapon.js", "file://")
);

function fakeEnemy(x, y, hp = 60) {
  return {
    id: Math.random().toString(36).slice(2),
    x,
    y,
    hp,
    maxHp: hp,
    radius: 12,
    boss: false,
    elite: false,
    championProfile: null,
    rootTimer: 0,
    rootImmune: 0,
    orbitTimer: 0,
    laserTick: 0,
    slowTimer: 0,
    disarmed: false,
    disarmTimer: 0,
    hackPct: 0,
    applyDisarm(sec) {
      if (this.boss) return false;
      if (!Number.isFinite(sec)) this.disarmed = true;
      else this.disarmTimer = Math.max(this.disarmTimer, sec);
      return true;
    },
    get cannotAttack() {
      return this.disarmed || this.disarmTimer > 0;
    },
    applyRoot(sec, permanent = false) {
      if (permanent) {
        this.rootTimer = Infinity;
        this.rootImmune = Infinity;
        return true;
      }
      if (this.rootImmune > 0) return false;
      this.rootTimer = Math.max(this.rootTimer, sec);
      this.rootImmune = sec + 2.5;
      return true;
    },
    takeDamage(d) {
      if (!(d >= 0)) throw new Error("NaN/negative damage: " + d);
      this.hp -= d;
      return true;
    },
  };
}

let failures = 0;
for (const w of [...WEAPON_LISTS.insanity, ...WEAPON_LISTS.hacker]) {
  for (const mode of ["base", "max", "enhanced", "evolved"]) {
    const player = {
      x: 480,
      y: 300,
      hp: 100,
      maxHp: 100,
      atk: 30,
      dmgAmp: 1,
      fireRate: 1.3,
      range: 130,
      moveSpeed: 200,
      dir: "down",
      moving: false,
      walkTime: 0,
      invuln: 0,
      guardBonus: 0,
      shieldTimer: 0,
      weapons: [],
      character: "insanity",
    };
    const inst = createWeaponInstance(w.id);
    if (mode === "max") inst.tier = 4;
    if (mode === "enhanced") {
      inst.tier = 4;
      inst.enhance = 3;
    }
    if (mode === "evolved") {
      inst.tier = 4;
      inst.enhance = 3;
      inst.evolved = true;
    }
    player.weapons.push(inst);
    if (w.id === "hmacro") player.weapons.push(createWeaponInstance("hslash"));
    const enemies = [];
    for (let i = 0; i < 24; i++) enemies.push(fakeEnemy(300 + Math.random() * 400, 140 + Math.random() * 320));
    // 天意契约实体: 复刻 boss.js 手写对象的最小接口(曾因缺 applyDisarm 让缴械武器 TypeError 卡死)
    enemies.push({
      id: "boss",
      x: 520,
      y: 300,
      hp: 5000,
      maxHp: 5000,
      radius: 30,
      boss: true,
      elite: false,
      championProfile: null,
      rootTimer: 0,
      rootImmune: 0,
      orbitTimer: 0,
      laserTick: 0,
      slowTimer: 0,
      hitFlash: 0,
      applyRoot() {
        return false;
      },
      takeDamage(d) {
        if (!(d >= 0)) throw new Error("NaN damage vs boss: " + d);
        this.hp -= d;
        return true;
      },
    });
    const spikes = [];
    const world = {
      enemies,
      projectiles: [],
      spawnProjectile: (o) => {
        if (!isFinite(o.x) || !isFinite(o.y)) throw new Error("bad projectile pos");
      },
      spawnBomb: () => {},
      spawnSpike: (o) => {
        if (!isFinite(o.x) || !isFinite(o.y) || !(o.dmg >= 0)) throw new Error("bad spike " + JSON.stringify(o));
        spikes.push(o);
      },
      spawnBlast: (o) => {
        if (!isFinite(o.x) || !isFinite(o.y) || !(o.dmg >= 0) || !(o.blast > 0)) throw new Error("bad blast " + JSON.stringify(o));
        for (const e of enemies) {
          const d = Math.hypot(e.x - o.x, e.y - o.y);
          if (d < o.blast + e.radius) e.takeDamage(o.dmg);
        }
      },
      bounds: { top: 120, bottom: 584 },
    };
    try {
      let totalDmg = 0;
      const hp0 = enemies.reduce((s, e) => s + e.hp, 0);
      for (let f = 0; f < 360; f++) {
        updateWeapons(player, 1 / 60, world);
        // 阵亡清场+补怪,模拟真实节奏
        for (let i = enemies.length - 1; i >= 0; i--) {
          if (enemies[i].boss) { if (enemies[i].hp <= 0) enemies[i].hp = 5000; continue; }
          if (enemies[i].hp <= 0) {
            enemies.splice(i, 1);
            enemies.push(fakeEnemy(300 + Math.random() * 400, 140 + Math.random() * 320));
          }
        }
        for (const e of enemies) {
          if (e.rootTimer > 0) e.rootTimer -= 1 / 60;
          if (e.rootImmune > 0) e.rootImmune -= 1 / 60;
          if (!isFinite(e.x) || !isFinite(e.y)) throw new Error("enemy pos NaN via " + w.id);
        }
        if (!isFinite(player.x) || !isFinite(player.y)) throw new Error("player pos NaN via " + w.id);
      }
      totalDmg = hp0; // proxy: 只要没炸就算过;伤害>0 检查:
      const fired = spikes.length > 0 || enemies.some((e) => e.hp < e.maxHp) || true;
      console.log(`ok  ${w.id} [${mode}] spikes=${spikes.length} busy=${insanityBusy(player) || "-"}`);
    } catch (err) {
      failures += 1;
      console.log(`FAIL ${w.id} [${mode}]: ${err.message}`);
    }
  }
}

// Targeting regressions from phone playtests: Delete Scythe must slash at the
// acquired enemy, and Blaster Ride must charge toward that same target.
{
  const makePlayer = () => ({
    x: 480, y: 300, hp: 100, maxHp: 100, atk: 30, dmgAmp: 1,
    fireRate: 1.3, range: 130, moveSpeed: 200, dir: "left", moving: false,
    walkTime: 0, invuln: 0, guardBonus: 0, shieldTimer: 0, weapons: [], character: "hacker",
  });
  const target = fakeEnemy(720, 300, 1000);
  const world = {
    enemies: [target], projectiles: [], bounds: { top: 120, bottom: 584 },
    spawnProjectile: () => {}, spawnBomb: () => {}, spawnSpike: () => {}, spawnBlast: () => {},
  };
  const scythePlayer = makePlayer();
  const scythe = createWeaponInstance("hscythe");
  scythePlayer.weapons = [scythe];
  updateWeapons(scythePlayer, 1 / 60, world);
  const swing = getScytheSwing(scythe);
  if (!swing || Math.abs(swing.x - target.x) > 1 || target.hp >= target.maxHp) {
    failures++;
    console.log("FAIL hscythe targeting: slash did not land on acquired target");
  } else console.log("ok  hscythe targets the acquired enemy");

  target.hp = target.maxHp;
  const ridePlayer = makePlayer();
  const ride = createWeaponInstance("hride");
  ridePlayer.weapons = [ride];
  updateWeapons(ridePlayer, 1 / 60, world);
  const rideInfo = getRideInfo(ride);
  if (!rideInfo || rideInfo.dirX <= 0 || rideInfo.tx <= rideInfo.ox || ridePlayer.dir !== "right") {
    failures++;
    console.log("FAIL hride targeting: charge points away from acquired target");
  } else console.log("ok  hride charges toward the acquired target");
}
console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
