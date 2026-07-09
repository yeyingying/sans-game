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

export function getStats() {
  return stats;
}

export function recordRun({ kills = 0, bossKilled = false } = {}) {
  stats.totalKills += kills;
  stats.runs += 1;
  if (bossKilled) stats.bossKills += 1;
  store.setItem("metaStats", JSON.stringify(stats));
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
