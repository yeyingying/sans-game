// Persistent progression ("局间循环"): coin wallet, permanent upgrades,
// lifetime stats and character unlocks. Everything lives in localStorage so
// every run leaves something behind — the core "one more run" hook.

const store =
  typeof localStorage !== "undefined"
    ? localStorage
    : { getItem: () => null, setItem: () => {} }; // headless tests / SSR safety

function readJson(key, fallback) {
  try {
    const v = JSON.parse(store.getItem(key));
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

// ---- coin wallet -----------------------------------------------------------

let wallet = parseInt(store.getItem("coins") || "0", 10) || 0;

export function getCoins() {
  return wallet;
}

export function addCoins(n) {
  wallet = Math.max(0, wallet + Math.round(n));
  store.setItem("coins", String(wallet));
}

export function spendCoins(n) {
  if (wallet < n) return false;
  wallet -= n;
  store.setItem("coins", String(wallet));
  return true;
}

// ---- permanent upgrades ----------------------------------------------------

// cost = base * (level+1); apply() runs once at the start of every run
export const UPGRADES = [
  { id: "atk", name: "力量刻印", desc: "初始攻击 +2 / 级", max: 5, base: 30, color: "#ff6b6b" },
  { id: "hp", name: "决心之心", desc: "初始生命上限 +25 / 级", max: 5, base: 25, color: "#ff8fc7" },
  { id: "speed", name: "疾行之靴", desc: "初始移速 +8 / 级", max: 3, base: 40, color: "#8fd6ff" },
  { id: "magnet", name: "引魂磁石", desc: "初始磁吸范围 +25 / 级", max: 3, base: 30, color: "#c59bff" },
  { id: "greed", name: "财运亨通", desc: "金币获取 +20% / 级", max: 5, base: 50, color: "#ffd166" },
  { id: "reroll", name: "备用骰子", desc: "每次选卡可刷新次数 +1", max: 2, base: 100, color: "#5ee6e6" },
  { id: "gear", name: "行前整备", desc: "每局开局自带 1 件随机装备 / 级", max: 3, base: 80, color: "#7ea8ff" },
  { id: "revive", name: "重燃决心", desc: "每局死亡时原地复活一次(半血)", max: 1, base: 300, color: "#ffffff" },
];

let upgrades = readJson("metaUpgrades", {});

export function upgradeLevel(id) {
  return upgrades[id] || 0;
}

export function upgradeCost(id) {
  const u = UPGRADES.find((x) => x.id === id);
  const lvl = upgradeLevel(id);
  if (!u || lvl >= u.max) return null; // maxed out
  return u.base * (lvl + 1);
}

export function buyUpgrade(id) {
  const cost = upgradeCost(id);
  if (cost === null || !spendCoins(cost)) return false;
  upgrades[id] = upgradeLevel(id) + 1;
  store.setItem("metaUpgrades", JSON.stringify(upgrades));
  return true;
}

// starting-stat bonuses, applied right after the Player is created
export function applyMetaUpgrades(player) {
  player.atk += 2 * upgradeLevel("atk");
  player.maxHp += 25 * upgradeLevel("hp");
  player.hp = player.maxHp;
  player.moveSpeed += 8 * upgradeLevel("speed");
  player.magnetRadius += 25 * upgradeLevel("magnet");
}

export function coinGainMult() {
  return 1 + 0.2 * upgradeLevel("greed");
}

export function rerollBonus() {
  return upgradeLevel("reroll");
}

// ---- lifetime stats --------------------------------------------------------

let stats = readJson("metaStats", { totalKills: 0, runs: 0, bossKills: 0 });
if (!stats.charKills) stats.charKills = {}; // per-character kills (weapon unlocks)
if (stats.diffCleared === undefined) stats.diffCleared = -1; // hardest difficulty with a boss kill
if (!stats.killsByType) stats.killsByType = {}; // bestiary counts
if (!stats.weaponsUsed) stats.weaponsUsed = {}; // codex: weapon ever owned
if (!stats.evolved) stats.evolved = {}; // codex: evolution ever reached

export function getStats() {
  return stats;
}

export function recordRun({
  kills = 0,
  bossKilled = false,
  charId = null,
  difficulty = 0,
  killsByType = null,
  weaponsUsed = null,
  evolvedIds = null,
} = {}) {
  stats.totalKills += kills;
  stats.runs += 1;
  if (charId) stats.charKills[charId] = (stats.charKills[charId] || 0) + kills;
  if (bossKilled) {
    stats.bossKills += 1;
    stats.diffCleared = Math.max(stats.diffCleared, difficulty);
  }
  if (killsByType) {
    for (const [t, n] of Object.entries(killsByType)) {
      stats.killsByType[t] = (stats.killsByType[t] || 0) + n;
    }
  }
  if (weaponsUsed) for (const id of weaponsUsed) stats.weaponsUsed[id] = true;
  if (evolvedIds) for (const id of evolvedIds) stats.evolved[id] = true;
  store.setItem("metaStats", JSON.stringify(stats));
}

// ---- weapon unlocks --------------------------------------------------------

// per-character arsenal: first 3 weapons free, the rest earned with that
// character's own kills — every run visibly ticks the next weapon closer
const WEAPON_KILL_REQ = [0, 0, 0, 300, 800, 1500, 2500, 4000];

export function charKills(charId) {
  return stats.charKills[charId] || 0;
}

export function isWeaponUnlocked(charId, slot) {
  return charKills(charId) >= (WEAPON_KILL_REQ[slot] ?? 0);
}

export function weaponUnlockInfo(charId, slot) {
  const req = WEAPON_KILL_REQ[slot] ?? 0;
  if (req <= 0) return null;
  return { hint: `该角色累计击杀 ${req}`, progress: `${Math.min(charKills(charId), req)} / ${req}` };
}

// ---- difficulty tiers ------------------------------------------------------

export const DIFFICULTIES = [
  { id: 0, name: "普通", hpMult: 1, dmgMult: 1, coinMult: 1, scoreMult: 1, hint: null },
  { id: 1, name: "狂暴", hpMult: 1.6, dmgMult: 1.4, coinMult: 1.6, scoreMult: 1.5, hint: "击败一次Boss解锁" },
  { id: 2, name: "地狱", hpMult: 2.4, dmgMult: 1.9, coinMult: 2.5, scoreMult: 2.2, hint: "狂暴难度击败Boss解锁" },
];

export function isDifficultyUnlocked(id) {
  if (id <= 0) return true;
  if (id === 1) return stats.bossKills >= 1;
  return stats.diffCleared >= id - 1;
}

let selectedDiff = parseInt(store.getItem("selectedDiff") || "0", 10) || 0;

export function getDifficulty() {
  if (!isDifficultyUnlocked(selectedDiff)) selectedDiff = 0; // stale save guard
  return DIFFICULTIES[selectedDiff];
}

export function setDifficulty(id) {
  if (!isDifficultyUnlocked(id)) return false;
  selectedDiff = id;
  store.setItem("selectedDiff", String(id));
  return true;
}

// ---- character unlocks -----------------------------------------------------

// sans is always open; the rest are earned. Anyone with a recorded best on a
// character keeps it (players from before the unlock system lose nothing).
const CHAR_CONDITIONS = {
  ukb: {
    hint: "累计击杀 1500 只怪物",
    progress: () => `${Math.min(stats.totalKills, 1500)} / 1500`,
    met: () => stats.totalKills >= 1500,
  },
  horror: {
    hint: "击败一次天意侵蚀Sans",
    progress: () => `${Math.min(stats.bossKills, 1)} / 1`,
    met: () => stats.bossKills >= 1,
  },
  hard: {
    hint: "击败Boss且累计击杀 6000",
    progress: () => `${stats.bossKills >= 1 ? "Boss✓" : "Boss✗"} · ${Math.min(stats.totalKills, 6000)} / 6000`,
    met: () => stats.bossKills >= 1 && stats.totalKills >= 6000,
  },
};

export function isCharUnlocked(id, bestScore = 0) {
  const cond = CHAR_CONDITIONS[id];
  if (!cond) return true; // sans (and anything without a condition)
  if (bestScore > 0) return true; // grandfathered: already played this char
  return cond.met();
}

export function charUnlockInfo(id) {
  const cond = CHAR_CONDITIONS[id];
  if (!cond) return null;
  return { hint: cond.hint, progress: cond.progress() };
}
