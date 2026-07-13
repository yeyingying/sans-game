// Persistent progression ("局间循环"): coin wallet, permanent upgrades,
// lifetime stats and character unlocks. Everything lives in localStorage so
// every run leaves something behind — the core "one more run" hook.

const store =
  typeof localStorage !== "undefined"
    ? localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} }; // headless tests / SSR safety

const RUN_CHECKPOINT_KEY = "safeRunCheckpoint_v1";

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
  { id: "atk", name: "力量刻印", desc: "最终伤害 ×1.06 / 级(独立乘区,永不稀释)", max: 5, base: 90, color: "#ff6b6b" },
  { id: "hp", name: "决心之心", desc: "生命上限 +7% / 级(升级成长同享)", max: 5, base: 75, color: "#ff8fc7" },
  { id: "speed", name: "疾行之靴", desc: "初始移速 +8 / 级", max: 3, base: 110, color: "#8fd6ff" },
  { id: "magnet", name: "引魂磁石", desc: "初始磁吸范围 +25 / 级", max: 3, base: 90, color: "#c59bff" },
  { id: "greed", name: "财运亨通", desc: "金币获取 +20% / 级", max: 5, base: 160, color: "#ffd166" },
  { id: "reroll", name: "备用骰子", desc: "每次选卡可刷新次数 +1", max: 2, base: 280, color: "#5ee6e6" },
  { id: "gear", name: "行前整备", desc: "每局开局自带 1 件随机装备 / 级", max: 3, base: 220, color: "#7ea8ff" },
];

let upgrades = readJson("metaUpgrades", {});

export function upgradeLevel(id) {
  return upgrades[id] || 0;
}

// 力量类升级的难度门槛: money can never buy power beyond your skill.
// Lv3 needs a 狂暴 clear, Lv4 地狱, Lv5 屠杀 (QoL upgrades are never gated).
const POWER_GATED = new Set(["atk", "hp"]);

export function upgradeGate(id) {
  if (!POWER_GATED.has(id)) return null;
  const lvl = upgradeLevel(id);
  // gates lag ONE tier behind the wall: the power that helps you beat a
  // difficulty is always grindable while you are stuck on it, but power
  // two tiers ahead can never be bought (2026-07-12 user design call)
  if (lvl >= 2 && stats.bossKills < 1) return "通关普通难度后解锁";
  if (lvl >= 3 && stats.diffCleared < 1) return "狂暴难度通关后解锁";
  if (lvl >= 4 && stats.diffCleared < 2) return "地狱难度通关后解锁";
  return null;
}

export function upgradeCost(id) {
  const u = UPGRADES.find((x) => x.id === id);
  const lvl = upgradeLevel(id);
  if (!u || lvl >= u.max) return null; // maxed out
  // geometric 2.3^lvl(2026-07-13 用户裁决方案B): 首购价不变保上手体验,
  // 后段更陡拉长长线——全店总价 13855→20374,熟练玩家(约1000/局)约20局清空
  return Math.round(u.base * Math.pow(2.3, lvl));
}

export function buyUpgrade(id) {
  const cost = upgradeCost(id);
  if (cost === null || upgradeGate(id) || !spendCoins(cost)) return false;
  upgrades[id] = upgradeLevel(id) + 1;
  store.setItem("metaUpgrades", JSON.stringify(upgrades));
  return true;
}

// starting-stat bonuses, applied right after the Player is created
export function applyMetaUpgrades(player) {
  // 力量刻印: an INDEPENDENT multiplier lane (metaDmg), applied inside
  // weaponDmg alongside in-run amp cards — its relative value never dilutes
  player.metaDmg = Math.pow(1.06, upgradeLevel("atk"));
  // 决心之心: percentage bulk that also scales every level-up hp gain
  player.hpAmp = 1 + 0.07 * upgradeLevel("hp");
  player.maxHp = Math.round(player.maxHp * player.hpAmp);
  player.hp = player.maxHp;
  player.moveSpeed += 8 * upgradeLevel("speed");
  player.magnetRadius += 25 * upgradeLevel("magnet");
}

// ---- 重燃决心: consumable revives -------------------------------------------
// One-shot items: 200 coins each, stock caps at 3, one fires per run at most.
// A recurring coin sink — and 屠杀 (GENOCIDE) allows no second chances at all.
const REVIVE_COST = 300;
const REVIVE_MAX = 3;
let reviveStockN = parseInt(store.getItem("reviveStock") || "0", 10) || 0;
// migrate the old 600-coin permanent revive into 3 consumables
if ((upgrades.revive || 0) > 0) {
  reviveStockN = Math.min(REVIVE_MAX, reviveStockN + 3);
  delete upgrades.revive;
  store.setItem("metaUpgrades", JSON.stringify(upgrades));
  store.setItem("reviveStock", String(reviveStockN));
}

export function reviveStock() {
  return reviveStockN;
}

export function reviveCost() {
  return reviveStockN >= REVIVE_MAX ? null : REVIVE_COST;
}

export function buyReviveStock() {
  if (reviveStockN >= REVIVE_MAX || !spendCoins(REVIVE_COST)) return false;
  reviveStockN += 1;
  store.setItem("reviveStock", String(reviveStockN));
  return true;
}

export function consumeRevive() {
  if (reviveStockN <= 0) return false;
  reviveStockN -= 1;
  store.setItem("reviveStock", String(reviveStockN));
  return true;
}

export function coinGainMult() {
  return 1 + 0.2 * upgradeLevel("greed");
}

export function rerollBonus() {
  return upgradeLevel("reroll");
}

// ---- cosmetics: 灵魂加护 (Undertale's seven human souls) --------------------

// pure looks, zero stats: player glow + heart trail in the soul's color.
// Lore: six fallen humans' souls + the protagonist's own DETERMINATION.
// slot "soul" = glow + heart trail; slot "bone" = weapon bone tint
export const COSMETICS = [
  { id: "bravery", slot: "soul", name: "勇气之魂", color: "#ff9e3d", desc: "橙色——戴着拳套的孩子留下的魂", price: 600 },
  { id: "justice", slot: "soul", name: "正义之魂", color: "#ffef3d", desc: "黄色——牛仔帽与左轮的主人", price: 600 },
  { id: "kindness", slot: "soul", name: "善良之魂", color: "#4ade5a", desc: "绿色——围裙与平底锅的温柔", price: 600 },
  { id: "patience", slot: "soul", name: "耐心之魂", color: "#5ee6e6", desc: "浅蓝——丝带与玩具刀的等待", price: 600 },
  { id: "integrity", slot: "soul", name: "诚实之魂", color: "#4f6dff", desc: "深蓝——芭蕾舞鞋的正直", price: 600 },
  { id: "perseverance", slot: "soul", name: "毅力之魂", color: "#b45df0", desc: "紫色——眼镜与笔记本的坚持", price: 600 },
  { id: "determination", slot: "soul", name: "决心", color: "#ff3d5a", desc: "红色——你自己的灵魂。DETERMINATION.", price: 2000 },
  { id: "snowdin", slot: "bone", name: "雪镇之骨", color: "#cfe8ff", desc: "冷白涂装——Snowdin 永不停的雪", price: 800 },
  { id: "waterfall", slot: "bone", name: "瀑布之骨", color: "#6bd0ff", desc: "幽蓝涂装——回声花低语的光", price: 800 },
  { id: "hotland", slot: "bone", name: "热域之骨", color: "#ff8a4a", desc: "熔岩涂装——Hotland 的灼热", price: 800 },
  { id: "core", slot: "bone", name: "核心之骨", color: "#7df0e8", desc: "电光涂装——The CORE 的能量", price: 1000 },
  // secret: never sold — granted when all ten echoes have been heard
  { id: "goldenflower", slot: "soul", name: "金色之花", color: "#ffd93d", desc: "它笑着说:这是给聆听者的。", price: 0, secret: true },
];

let cosmetics = readJson("metaCosmetics", { owned: {}, equipped: null });
// migrate v1 saves (equipped was a single soul id string) to per-slot
if (typeof cosmetics.equipped !== "object" || cosmetics.equipped === null) {
  cosmetics.equipped = { soul: typeof cosmetics.equipped === "string" ? cosmetics.equipped : null, bone: null };
}

function cosmeticById(id) {
  return COSMETICS.find((c) => c.id === id) || null;
}

export function cosmeticOwned(id) {
  return !!cosmetics.owned[id];
}

export function equippedCosmetic() {
  return cosmetics.equipped.soul ? cosmeticById(cosmetics.equipped.soul) : null;
}

export function equippedBoneSkin() {
  return cosmetics.equipped.bone ? cosmeticById(cosmetics.equipped.bone) : null;
}

export function buyCosmetic(id) {
  const c = cosmeticById(id);
  if (!c || c.secret || cosmetics.owned[id] || !spendCoins(c.price)) return false;
  cosmetics.owned[id] = true;
  cosmetics.equipped[c.slot] = id; // wear it right away
  store.setItem("metaCosmetics", JSON.stringify(cosmetics));
  return true;
}

// award path for secret cosmetics (no coins involved); true only when new
export function grantCosmetic(id) {
  const c = cosmeticById(id);
  if (!c || cosmetics.owned[id]) return false;
  cosmetics.owned[id] = true;
  cosmetics.equipped[c.slot] = id;
  store.setItem("metaCosmetics", JSON.stringify(cosmetics));
  return true;
}

// id null = take the slot's item off (pass slot explicitly for null)
export function equipCosmetic(id, slot = null) {
  if (id === null) {
    if (!slot) return false;
    cosmetics.equipped[slot] = null;
  } else {
    const c = cosmeticById(id);
    if (!c || !cosmetics.owned[id]) return false;
    cosmetics.equipped[c.slot] = id;
  }
  store.setItem("metaCosmetics", JSON.stringify(cosmetics));
  return true;
}

// ---- honour titles (UT ending references; earned, never sold) --------------

export const TITLES = [
  { id: "pacifist", name: "和平主义者", hint: "全程不选攻击/增伤卡并击败Boss" },
  { id: "judge", name: "审判者", hint: "无尽审判完成 5 轮" },
  { id: "raven", name: "渡鸦", hint: "地狱难度击败Boss" },
  { id: "determined", name: "决心的化身", hint: "图鉴收集度 100%" },
  { id: "listener", name: "聆听者", hint: "聆听全部 10 段主线回响" },
  { id: "watcher", name: "守望者", hint: "聆听全部 18 段回响(含四条时间线残响)" },
  { id: "abysswalker", name: "深渊行者", hint: "无尽审判首达第 8 轮" },
  { id: "unjudged", name: "不可审判者", hint: "无尽审判首达第 12 轮" },
  { id: "genocide", name: "尘归尘", hint: "屠杀难度击败Boss" },
];

let titles = readJson("metaTitles", {});

export function titleUnlocked(id) {
  return !!titles[id];
}

// returns true only the first time — callers use it for the unlock toast
export function unlockTitle(id) {
  if (titles[id] || !TITLES.some((t) => t.id === id)) return false;
  titles[id] = true;
  store.setItem("metaTitles", JSON.stringify(titles));
  return true;
}

// highest-prestige unlocked title (list order = ascending prestige)
export function bestTitle() {
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (titles[TITLES[i].id]) return TITLES[i];
  }
  return null;
}

// ---- 每日悬赏 (daily bounties) ----------------------------------------------
// Three deterministic quests per calendar day; progress accrues across runs
// and rewards pay out the moment a quest completes.

function questRng(dateStr) {
  let h = 2166136261;
  const key = dateStr + "#quests";
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// kinds: additive progress unless noted; streak/survive/round track the max
const QUEST_POOL = [
  { kind: "kills", target: 500, reward: 50 },
  { kind: "charKills", target: 300, reward: 60 },
  { kind: "coins", target: 120, reward: 40 },
  { kind: "candy", target: 2, reward: 40 },
  { kind: "elites", target: 8, reward: 55 },
  { kind: "boss", target: 1, reward: 80 },
  { kind: "round", target: 1, reward: 70 },
  { kind: "streak", target: 40, reward: 50 },
  { kind: "evolve", target: 1, reward: 60 },
  { kind: "survive", target: 240, reward: 50 },
];
const QUEST_MAX_KINDS = new Set(["streak", "survive", "round"]);

let questState = readJson("dailyQuests", null);

export function getDailyQuests(dateStr, charIds = []) {
  if (!questState || questState.date !== dateStr) {
    const rng = questRng(dateStr);
    const pool = [...QUEST_POOL];
    const picked = [];
    for (let i = 0; i < 3 && pool.length; i++) {
      const idx = Math.floor(rng() * pool.length);
      const q = pool.splice(idx, 1)[0];
      picked.push({
        kind: q.kind,
        target: q.target,
        reward: q.reward,
        progress: 0,
        done: false,
        charId: q.kind === "charKills" && charIds.length ? charIds[Math.floor(rng() * charIds.length)] : null,
      });
    }
    questState = { date: dateStr, quests: picked };
    store.setItem("dailyQuests", JSON.stringify(questState));
  }
  return questState.quests;
}

// feed a game signal in; returns the quests it just completed (award incl.)
export function questEvent(kind, amount = 1, ctx = {}) {
  if (!questState) return [];
  const completed = [];
  for (const q of questState.quests) {
    if (q.done || q.kind !== kind) continue;
    if (kind === "charKills" && q.charId && ctx.charId !== q.charId) continue;
    q.progress = QUEST_MAX_KINDS.has(kind) ? Math.max(q.progress, amount) : q.progress + amount;
    if (q.progress >= q.target) {
      q.progress = q.target;
      q.done = true;
      addCoins(q.reward);
      completed.push(q);
    }
  }
  store.setItem("dailyQuests", JSON.stringify(questState));
  return completed;
}

// ---- 角色专精 (per-character mastery from lifetime kills) -------------------

// level N needs 120*N^2 lifetime kills on that character
export function masteryOf(kills) {
  return Math.floor(Math.sqrt(Math.max(0, kills) / 120));
}

export function masteryNextAt(lvl) {
  return 120 * (lvl + 1) * (lvl + 1);
}

// ---- 连日之花 (daily login flower; streaks never punish a miss) -------------

export function claimDailyFlower(todayStr, yesterdayStr) {
  const st = readJson("loginFlower", { last: null, days: 0 });
  if (st.last === todayStr) return { days: st.days, coins: 0, already: true };
  const days = st.last === yesterdayStr ? st.days + 1 : 1;
  const coins = Math.min(15 + days * 5, 60);
  addCoins(coins);
  store.setItem("loginFlower", JSON.stringify({ last: todayStr, days }));
  return { days, coins, already: false };
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

// ---- crash-safe run checkpoint --------------------------------------------

function statsTargetAfterRun({
  kills = 0,
  bossKilled = false,
  charId = null,
  difficulty = 0,
  killsByType = null,
  weaponsUsed = null,
  evolvedIds = null,
} = {}) {
  const target = JSON.parse(JSON.stringify(stats));
  target.totalKills = (target.totalKills || 0) + kills;
  target.runs = (target.runs || 0) + 1;
  target.bossKills = (target.bossKills || 0) + (bossKilled ? 1 : 0);
  target.diffCleared = bossKilled ? Math.max(target.diffCleared ?? -1, difficulty) : target.diffCleared ?? -1;
  target.charKills ||= {};
  target.killsByType ||= {};
  target.weaponsUsed ||= {};
  target.evolved ||= {};
  if (charId) target.charKills[charId] = (target.charKills[charId] || 0) + kills;
  if (killsByType) {
    for (const [type, count] of Object.entries(killsByType)) {
      target.killsByType[type] = (target.killsByType[type] || 0) + count;
    }
  }
  if (weaponsUsed) for (const id of weaponsUsed) target.weaponsUsed[id] = true;
  if (evolvedIds) for (const id of evolvedIds) target.evolved[id] = true;
  return target;
}

function mergeNumberMapFloor(current, target) {
  const merged = { ...(current || {}) };
  for (const [key, value] of Object.entries(target || {})) {
    merged[key] = Math.max(merged[key] || 0, Number(value) || 0);
  }
  return merged;
}

function mergeFlagMap(current, target) {
  return { ...(current || {}), ...(target || {}) };
}

// The checkpoint stores absolute floors, not deltas. Replaying the same
// checkpoint therefore cannot double coins, kills or boss clears.
export function saveSafeRunCheckpoint({
  id,
  coins = 0,
  stageScore = 0,
  endlessRounds = 0,
  ...run
} = {}) {
  if (!id || !run.charId || !run.bossKilled) return null;
  const checkpoint = {
    version: 1,
    id,
    charId: run.charId,
    walletFloor: wallet + Math.max(0, Math.round(coins)),
    statsFloor: statsTargetAfterRun(run),
    scoreFloor: Math.max(parseInt(store.getItem("best_" + run.charId) || "0", 10) || 0, Math.round(stageScore)),
    endlessRoundFloor: Math.max(
      parseInt(store.getItem("best_endless_round_" + run.charId) || "0", 10) || 0,
      Math.max(0, Math.floor(endlessRounds))
    ),
  };
  store.setItem(RUN_CHECKPOINT_KEY, JSON.stringify(checkpoint));
  return checkpoint;
}

export function clearSafeRunCheckpoint(id = null) {
  const checkpoint = readJson(RUN_CHECKPOINT_KEY, null);
  if (!checkpoint || (id && checkpoint.id !== id)) return false;
  store.removeItem(RUN_CHECKPOINT_KEY);
  return true;
}

export function recoverSafeRunCheckpoint() {
  const checkpoint = readJson(RUN_CHECKPOINT_KEY, null);
  if (!checkpoint || checkpoint.version !== 1 || !checkpoint.charId) return null;

  wallet = Math.max(wallet, Number(checkpoint.walletFloor) || 0);
  store.setItem("coins", String(wallet));

  const target = checkpoint.statsFloor || {};
  stats.totalKills = Math.max(stats.totalKills || 0, target.totalKills || 0);
  stats.runs = Math.max(stats.runs || 0, target.runs || 0);
  stats.bossKills = Math.max(stats.bossKills || 0, target.bossKills || 0);
  stats.diffCleared = Math.max(stats.diffCleared ?? -1, target.diffCleared ?? -1);
  stats.charKills = mergeNumberMapFloor(stats.charKills, target.charKills);
  stats.killsByType = mergeNumberMapFloor(stats.killsByType, target.killsByType);
  stats.weaponsUsed = mergeFlagMap(stats.weaponsUsed, target.weaponsUsed);
  stats.evolved = mergeFlagMap(stats.evolved, target.evolved);
  store.setItem("metaStats", JSON.stringify(stats));

  const bestKey = "best_" + checkpoint.charId;
  const currentBest = parseInt(store.getItem(bestKey) || "0", 10) || 0;
  store.setItem(bestKey, String(Math.max(currentBest, checkpoint.scoreFloor || 0)));
  const roundKey = "best_endless_round_" + checkpoint.charId;
  const currentRound = parseInt(store.getItem(roundKey) || "0", 10) || 0;
  store.setItem(roundKey, String(Math.max(currentRound, checkpoint.endlessRoundFloor || 0)));

  store.removeItem(RUN_CHECKPOINT_KEY);
  return checkpoint;
}

// A stale checkpoint means the previous page was closed before settlement.
// Applying floor values is idempotent even if the browser interrupted recovery.
recoverSafeRunCheckpoint();

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
  { id: 0, name: "普通", hpMult: 1, dmgMult: 1, coinMult: 1, scoreMult: 1, xpMult: 1, hint: null },
  { id: 1, name: "狂暴", hpMult: 2.8, dmgMult: 2.2, coinMult: 1.6, scoreMult: 1.8, xpMult: 1.5, hint: "击败一次Boss解锁" },
  { id: 2, name: "地狱", hpMult: 3.5, dmgMult: 2.6, coinMult: 2.0, scoreMult: 3.0, xpMult: 1.9, hint: "狂暴难度击败Boss解锁" },
  { id: 3, name: "屠杀", hpMult: 5.0, dmgMult: 3.5, coinMult: 2.6, scoreMult: 4.5, xpMult: 2.4, hint: "地狱通关且钱包曾达2000解锁" },
];

export function isDifficultyUnlocked(id) {
  if (id <= 0) return true;
  if (id === 1) return stats.bossKills >= 1;
  if (id === 2) return stats.diffCleared >= 1;
  // 屠杀 (GENOCIDE): cleared 地狱 AND once banked 2000 coins — then sticky,
  // spending below the bar later never re-locks it
  if (!stats.genocideUnlocked && stats.diffCleared >= 2 && wallet >= 2000) {
    stats.genocideUnlocked = true;
    store.setItem("metaStats", JSON.stringify(stats));
  }
  return !!stats.genocideUnlocked;
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
