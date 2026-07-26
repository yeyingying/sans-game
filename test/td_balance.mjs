// Tower-defence balance invariants. This is deliberately deterministic:
// it tests real Enemy/weapon behavior rather than using the headless
// rushBoss/crushBoss lifecycle shortcuts.

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

const { Enemy, isBossLike } = await import(new URL(process.cwd() + "/src/entities.js", "file://"));
const {
  TD_BOSS_GATE_DAMAGE,
  TD_BOSS_GATE_INTERVAL,
  TD_BOSS_TARGET_TTK,
  TD_BOSS_TRAVEL_SECONDS,
  tdBuildMap,
  tdBossHp,
  tdConfigureBoss,
  tdDirectCoinDrop,
  tdKillCredit,
  tdLeaderDamagePct,
  tdPlaceCost,
  tdRouteSpeed,
  tdRouteTravelSeconds,
  tdTargetFor,
  tdTestHooksAllowed,
} = await import(new URL(process.cwd() + "/src/td.js", "file://"));
const { createWeaponInstance, updateWeapons } = await import(new URL(process.cwd() + "/src/weapon.js", "file://"));

let failures = 0;
function check(label, condition, detail = "") {
  if (condition) console.log(`ok  ${label}`);
  else {
    failures += 1;
    console.log(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
  }
}

function scale(elite = false) {
  return {
    hpMult: 1,
    dmgMult: 1,
    speedMult: 1,
    xpMult: 1,
    difficultyId: 0,
    namedElite: false,
    eliteProfileKey: null,
    elite,
  };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let value = Math.imul(a ^ (a >>> 15), 1 | a);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// 1. Overkill must not inflate the measured DPS used by the next Boss.
Enemy.dmgDealt = 0;
const fodder = new Enemy("tank", 0, 0, scale());
const fodderHp = fodder.hp;
fodder.takeDamage(fodder.hp + 99999);
check(
  "overkill records only effective HP removed",
  Enemy.dmgDealt === fodderHp,
  `expected ${fodderHp}, got ${Enemy.dmgDealt}`
);

// 2. Route time is a gameplay constant across random maps and viewports.
let minBossSpeed = Infinity;
let maxBossSpeed = 0;
let maxTravelError = 0;
for (const width of [844, 960, 1298, 1920]) {
  for (let seed = 1; seed <= 48; seed++) {
    const map = tdBuildMap(width, 720, 100, mulberry32(seed));
    const speed = tdRouteSpeed(map, 42);
    const seconds = tdRouteTravelSeconds(map, speed);
    minBossSpeed = Math.min(minBossSpeed, speed);
    maxBossSpeed = Math.max(maxBossSpeed, speed);
    maxTravelError = Math.max(maxTravelError, Math.abs(seconds - TD_BOSS_TRAVEL_SECONDS));
  }
}
check(
  "phone and desktop routes share one travel-time budget",
  maxTravelError < 1e-9,
  `max error ${maxTravelError}`
);
check(
  "normalized Boss speed stays visually readable",
  minBossSpeed >= 20 && maxBossSpeed <= 95,
  `${minBossSpeed.toFixed(1)}–${maxBossSpeed.toFixed(1)} px/s`
);

// 3. The adaptive HP formula owns a stable 42-second active-damage budget
// for realistic, non-clamped DPS values.
for (const dps of [250, 1200, 10000, 30000]) {
  const ttk = tdBossHp(dps) / dps;
  check(`Boss HP keeps ${TD_BOSS_TARGET_TTK}s TTK at ${dps} DPS`, Math.abs(ttk - TD_BOSS_TARGET_TTK) < 1e-9, `${ttk}s`);
}
check("Boss HP lower clamp remains 9000", tdBossHp(0) === 9000, String(tdBossHp(0)));
check("Boss HP upper clamp remains 1500000", tdBossHp(1000000) === 1500000, String(tdBossHp(1000000)));

// 4. Configure the real Enemy used by TD, then verify Tianyi identity,
// controls, percentage damage and an actual frame-by-frame kill budget.
const map = tdBuildMap(1298, 720, 100, mulberry32(26));
const boss = tdConfigureBoss(new Enemy("tank", map.spawn.x, map.spawn.y, scale(true)), map, 1000);
boss.championProfile = { key: "corrupted-sans" };
check("TD Tianyi is classified as a true Boss", isBossLike(boss));
check("TD Tianyi is immune to root", boss.applyRoot(5) === false && boss.rootTimer === 0);
check("TD Tianyi is immune to disarm", boss.applyDisarm(Infinity) === false && !boss.disarmed && boss.disarmTimer === 0);
check(
  "TD Tianyi gate pressure remains 10 damage every 2.5s",
  boss.gateDmg === TD_BOSS_GATE_DAMAGE && boss.contactInterval === TD_BOSS_GATE_INTERVAL
);
check("TD Tianyi grants exactly 50 kill credit", tdKillCredit(boss) === 50, String(tdKillCredit(boss)));
check("TD Tianyi does not stack a champion coin drop", tdDirectCoinDrop(boss, 1, () => 0) === 0);
check("regular TD enemies still grant one kill", tdKillCredit(fodder) === 1);
check(
  "production hides TD test hooks unless DEBUG is unlocked",
  tdTestHooksAllowed("www.sansgecao.com", false) === false &&
    tdTestHooksAllowed("api.sansgecao.com", false) === false &&
    tdTestHooksAllowed("www.sansgecao.com", true) === true
);
check(
  "headless and localhost keep TD test hooks",
  tdTestHooksAllowed("", false) === true &&
    tdTestHooksAllowed("localhost", false) === true &&
    tdTestHooksAllowed("127.0.0.1", false) === true
);
check(
  "first TD tower is free for every owned character",
  tdPlaceCost(1000, 0) === 0 &&
    tdPlaceCost(10000, 0) === 0 &&
    tdPlaceCost(15000, 0) === 0
);
check(
  "later TD towers use one shared 1000→10000 economy",
  tdPlaceCost(1000, 1) === 1000 &&
    tdPlaceCost(10000, 1) === 1000 &&
    tdPlaceCost(15000, 2) === 10000
);
check(
  "TD leader bonus comes only from the first squad member",
  tdLeaderDamagePct([{ teamDmgPct: 20 }, { teamDmgPct: 15 }]) === 20 &&
    tdLeaderDamagePct([{ teamDmgPct: 0 }, { teamDmgPct: 20 }]) === 0
);

boss.invulnTimer = 0;
const bossHpBeforeScythe = boss.hp;
const scythe = createWeaponInstance("hscythe");
const tower = {
  x: boss.x,
  y: boss.y,
  atk: 30,
  dmgAmp: 1,
  metaDmg: 1,
  relicAmp: 1,
  macroBoost: 1,
  fireRate: 1.3,
  range: 130,
  moveSpeed: 165,
  dir: "left",
  moving: false,
  walkTime: 0,
  invuln: 0,
  guardBonus: 0,
  shieldTimer: 0,
  weapons: [scythe],
  character: "hacker",
};
updateWeapons(tower, 1 / 60, {
  enemies: [boss],
  projectiles: [],
  spawnProjectile() {},
  spawnBomb() {},
  spawnSpike() {},
  spawnBlast() {},
  bounds: { top: 120, bottom: 704 },
});
const scytheDamage = bossHpBeforeScythe - boss.hp;
check(
  "Delete Scythe uses Tianyi 5% instead of champion 20%",
  scytheDamage === Math.round(boss.maxHp * 0.05),
  `damage ${scytheDamage}, maxHp ${boss.maxHp}`
);

const sustainedBoss = tdConfigureBoss(new Enemy("tank", map.spawn.x, map.spawn.y, scale(true)), map, 1000);
let fightSeconds = 0;
const dt = 1 / 60;
while (sustainedBoss.hp > 0 && fightSeconds < 80) {
  const target = tdTargetFor(sustainedBoss, map);
  sustainedBoss.update(dt, target);
  sustainedBoss.takeDamage(1000 * dt);
  fightSeconds += dt;
}
const gateBreakSeconds = TD_BOSS_TRAVEL_SECONDS + (100 / TD_BOSS_GATE_DAMAGE) * TD_BOSS_GATE_INTERVAL;
check(
  "real Enemy probe dies after invulnerability plus target TTK",
  Math.abs(fightSeconds - (3 + TD_BOSS_TARGET_TTK)) < 0.1,
  `${fightSeconds.toFixed(2)}s`
);
check(
  "calibrated Boss dies before its gate-break budget",
  fightSeconds < gateBreakSeconds,
  `kill ${fightSeconds.toFixed(2)}s vs gate ${gateBreakSeconds.toFixed(2)}s`
);

console.log(failures ? `${failures} FAILURES` : "ALL PASS");
process.exit(failures ? 1 : 0);
