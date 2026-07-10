import { getMoveVector, initTouch, setMovementEnabled, getJoystick, JOY_MAX_R } from "./input.js";
import {
  WALK_SETS,
  ENEMY_FROGGIT,
  ENEMY_BAT,
  ENEMY_GHOST,
  ENEMY_TANK,
  ENEMY_RED,
  ENEMY_ORANGE,
  ENEMY_BLUE,
  ENEMY_PURPLE,
  ENEMY_WHIMSUN,
  ENEMY_JERRY,
  ENEMY_VEGETOID,
  ENEMY_WOSHUA,
  ENEMY_LOOX,
  ENEMY_ICECAP,
  ENEMY_MADJICK,
  PROJECTILE_BONE,
  PROJECTILE_BONE_BLUE,
  PROJECTILE_BONE_PURPLE,
  PROJECTILE_BONE_RED,
  PROJECTILE_AXE,
  GB_IDLE,
  GB_FIRE,
  PICKUP_XP,
  drawSprite,
  tintSprite,
} from "./sprites.js";
import { Player, Enemy, Projectile, Bomb, Explosion, Spike, Pickup, FloatingText } from "./entities.js";
import { Spawner, roundCoinFactor } from "./spawner.js";
import {
  WEAPONS,
  CHARACTERS,
  WEAPON_LISTS,
  updateWeapons,
  getOrbitBones,
  getLaserBeams,
  getBurstBones,
  getPlaserBeams,
  getSweepBone,
  getLassoAxe,
  getCleaveSwings,
  getDashInfo,
  getMegaBone,
  getGBState,
  getRingFx,
  getTurretBones,
  createWeaponInstance,
  applyLevelUpBonus,
  weaponSummary,
  canEvolve,
} from "./weapon.js";
import { rollEquipmentDrop, EQUIPMENT_TYPES } from "./items.js";
import {
  getCoins,
  addCoins,
  UPGRADES,
  upgradeLevel,
  upgradeCost,
  buyUpgrade,
  applyMetaUpgrades,
  coinGainMult,
  rerollBonus,
  recordRun,
  isCharUnlocked,
  charUnlockInfo,
  isWeaponUnlocked,
  weaponUnlockInfo,
  getStats,
  DIFFICULTIES,
  isDifficultyUnlocked,
  getDifficulty,
  setDifficulty,
  saveSafeRunCheckpoint,
  clearSafeRunCheckpoint,
  COSMETICS,
  cosmeticOwned,
  equippedCosmetic,
  equippedBoneSkin,
  buyCosmetic,
  equipCosmetic,
  TITLES,
  unlockTitle,
  bestTitle,
} from "./meta.js";
import {
  initSfx,
  setSfxVolume,
  sfxClick,
  sfxHit,
  sfxKill,
  sfxPickup,
  sfxEquip,
  sfxLevelUp,
  sfxChoice,
  sfxHurt,
  sfxStreak,
  sfxAlarm,
  sfxFanfare,
  sfxEliteDown,
  sfxHeartbeat,
  sfxCoin,
  sfxShatter,
} from "./sfx.js";
import { createBossFight, BOSS_APPEAR_TIME } from "./boss.js";
import { circleHit } from "./utils.js";
import {
  drawHud,
  drawCenterText,
  drawCharSelect,
  charBoxRect,
  drawWeaponSelect,
  weaponBoxRect,
  confirmButtonRect,
  backButtonRect,
  drawChoiceScreen,
  choiceBoxRect,
  rerollButtonRect,
  speedButtonRect,
  drawSpeedButton,
  pauseButtonRect,
  drawPauseButton,
  diffPillRect,
  drawJoystick,
  quitButtonRect,
  drawQuitButton,
  resumeButtonRect,
  drawResumeButton,
  startButtonRect,
  creditsButtonRect,
  drawTitleScreen,
  shopButtonRect,
  shopItemRect,
  shopTabRect,
  cosmeticItemRect,
  drawShopScreen,
  codexButtonRect,
  drawCodexScreen,
  dailyButtonRect,
  bossClearLeaveRect,
  bossClearContinueRect,
  drawBossClearScreen,
  drawRoundClearScreen,
  volumeMinusRect,
  volumePlusRect,
  sfxMinusRect,
  sfxPlusRect,
  drawVolumeControl,
} from "./ui.js";

const canvas = document.getElementById("game");
const BASE_WIDTH = 960;
const BASE_HEIGHT = 600;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function usePhoneCanvas() {
  const sw = window.screen?.width || window.innerWidth;
  const sh = window.screen?.height || window.innerHeight;
  return Math.min(sw, sh) <= 500 && Math.max(sw, sh) <= 950;
}

if (usePhoneCanvas()) {
  const sw = window.screen?.width || window.innerWidth;
  const sh = window.screen?.height || window.innerHeight;
  const phoneAspect = Math.max(sw, sh) / Math.max(1, Math.min(sw, sh));
  canvas.width = clamp(Math.round(BASE_HEIGHT * phoneAspect), 1080, 1400);
  canvas.height = BASE_HEIGHT;
} else {
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;
}

const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
initTouch(canvas);

// each monster keeps a light wash of its original color identity
const ENEMY_SPRITES = {
  slime: tintSprite(ENEMY_FROGGIT, "#66bb66", 0.3),
  bat: tintSprite(ENEMY_WHIMSUN, "#c39ae0", 0.3),
  ghost: tintSprite(ENEMY_VEGETOID, "#9fdc8f", 0.22),
  tank: tintSprite(ENEMY_JERRY, "#e6c84e", 0.3),
  red: tintSprite(ENEMY_LOOX, "#e05555", 0.3),
  orange: tintSprite(ENEMY_MADJICK, "#f09a4a", 0.3),
  blue: tintSprite(ENEMY_WOSHUA, "#5aa8e0", 0.3),
  purple: tintSprite(ENEMY_ICECAP, "#9a86e8", 0.3),
};
const CHOICE_INTERVAL = 15;
const WALL_H = 100; // top wall band: huge columns, no spawns, out of bounds
// portraits for the character-select screen (front-facing stand frame)
const PLAYER_SPRITES = {
  sans: WALK_SETS.sans.down[0],
  ukb: WALK_SETS.ukb.down[0],
  horror: WALK_SETS.horror.down[0],
  hard: WALK_SETS.hard.down[0],
};
// characters that radiate a glow, and its color
const CHAR_GLOWS = { ukb: "#a55dff", hard: "#5db9ff" };

let state = "title"; // title | charselect | select | playing | paused | choice | gameover | credits | shop | codex | bossclear
let selectedChar = 0;
let selectedWeapon = 0;
let timeScale = 1; // 1x -> 2x -> 3x, applies to the whole simulation
let choiceOptions = [];
let choiceRerollsLeft = 0; // rerolls per choice screen (1 + 备用骰子 upgrade)
let nextChoiceAt = CHOICE_INTERVAL;
let choiceInterval = CHOICE_INTERVAL;
let player, spawner, enemies, projectiles, bombs, explosions, spikes, pickups, floatingTexts, elapsed;
let choiceScreens = 0; // how many choice screens this run has shown
let healFlash = 0; // hp-bar whitening after a heal
// score: kills and survival time both count; bests persist per character
let lastScore = 0;
let lastBest = 0;
let newRecord = false;
function currentScore() {
  return Math.floor((player.kills * 5 + Math.floor(elapsed) * 2.5) * getDifficulty().scoreMult);
}
function bestScoreOf(charId) {
  return parseInt(localStorage.getItem("best_" + charId) || "0", 10) || 0;
}
let hurtFlash = 0; // Horror: brief red screen tint when hurt (15% chance)
let killFlash = 0; // white screen pop on kill-streak milestones

// kill streak: chained kills (within 1.6s of each other) build a counter;
// milestones flash the screen, float a callout and chirp a rising sfx
let streak = 0;
let streakTimer = 0;
let nextStreakAt = 10;
let streakTier = 0;
let runMaxStreak = 0; // best streak this run, shown on the gameover screen
let lowHpPulse = 0.9; // heartbeat timer while hp < 25%
let runCoins = 0; // coins collected this run (banked at settlement)
let runKillsByType = {}; // bestiary counts for this run
let wasDaily = false; // settled run was a daily challenge
let dailyBestToday = 0;
let dailyNewBest = false;
let lastRunCoins = 0; // shown on the gameover screen
let bossDefeated = false; // the heart was taken; endless only if the player opts in

// boss-clear choice screen + stage/endless score separation
let bossClearChoice = 0; // 0 = leave with the loot, 1 = continue (endless)
let stageClearScore = 0; // snapshot at the moment the heart is taken
let stageClearTime = 0;
let stageClearKills = 0;
let runOutcome = null; // "death" | "victory" | "endlessDeath" | "retreat" | "quit"
let endlessResult = null; // {rounds, time, kills, score, best, newBest} for the settlement

// 90-second judgement rounds (endless). Coins earned inside a round sit in
// roundPendingCoins and are only banked when the round is survived — dying
// mid-round loses them. Pre-boss coins and the boss bounty are always safe.
const ROUND_LENGTH = 90;
let endlessRound = 0; // 0 = not in endless; 1+ = current round
let roundTimer = 0;
let roundPendingCoins = 0;
let roundBossSpawned = false;
let roundBossDown = false;
let roundsCleared = 0;
let runCheckpointId = null;
let roundBanner = null; // {text, sub, t} full-screen announcement
let hazardTimer = 0; // round 4+: periodic danger zones
let hazards = []; // {x, y, t} telegraphed player-damaging zones

let shopTab = 0; // 0 = ability upgrades, 1 = 灵魂加护 cosmetics
let deathShatter = null; // UT-style soul shatter on death {t, color}
let runOffense = false; // picked any atk/amp card this run (和平主义者 title)
let lastNewTitles = []; // titles earned at this settlement (gameover toast)

// bone weapon skin: tint the default white bone sprite at runtime
const BONE_SKIN_CACHE = {};
function skinnedBone() {
  const sk = equippedBoneSkin();
  if (!sk) return PROJECTILE_BONE;
  return (BONE_SKIN_CACHE[sk.color] ||= tintSprite(PROJECTILE_BONE, sk.color, 0.45));
}

// soul cosmetic: heart trail dropped while moving (pure looks)
let soulTrail = []; // {x, y, t}
let soulTrailTimer = 0;
const SOUL_HEART_CACHE = {};
function soulHeartSprite(color) {
  return (SOUL_HEART_CACHE[color] ||= tintSprite(PICKUP_XP, color, 0.85));
}

// one-time onboarding tips: each fires once per install (localStorage flag)
let tipQueue = [];
let activeTip = null;
function queueTipOnce(flag, title, lines) {
  if (localStorage.getItem("tip_" + flag)) return;
  localStorage.setItem("tip_" + flag, "1");
  tipQueue.push({ title, lines, t: 9 });
}

// death recap: what landed the killing blow ("死于:XXX" on the gameover screen)
const ENEMY_NAMES = {
  slime: "青蛙怪",
  bat: "胆小蝶",
  ghost: "蔬菜精",
  tank: "杰瑞",
  red: "独眼怪",
  orange: "马吉克",
  blue: "洗洗",
  purple: "冰帽怪",
};
function enemyDisplayName(e) {
  return (e.elite ? "精英·" : "") + (ENEMY_NAMES[e.type] || "怪物");
}
let lastHitBy = null; // most recent damage source
let lastDeathBy = null; // frozen at death for the gameover screen

// boss warning: the last 30s before the boss the screen pulses red,
// the music ducks and a siren beeps every 10s
const BOSS_WARN_TIME = BOSS_APPEAR_TIME - 30;
let nextWarnBeep = BOSS_WARN_TIME;
function bossWarnActive() {
  return !bossFight && elapsed >= BOSS_WARN_TIME && elapsed < BOSS_APPEAR_TIME;
}

// battle BGM: per-character track, starts with the fight, pauses with Z,
// stops on death/quit. Volume is adjustable on the pause screen.
const BGM_TRACKS = {
  sans: "MEGALOVANIA.mp3",
  ukb: "ukb.mp3",
  horror: "horror.mp3",
  hard: "hard.mp3", // falls back to MEGALOVANIA if the file isn't there
};
// per-character loudness tweak (horror's track is a touch quiet)
const CHAR_VOL = { horror: 1.4 };
const MENU_STATES = new Set(["title", "charselect", "select", "credits", "shop", "codex"]);
let bgmVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("bgmVolume") ?? "0.5") || 0.5));

// menu theme plays on the title / select screens with a gentle fade
const menuBgm = new Audio("sans.mp3");
menuBgm.loop = true;
menuBgm.volume = 0;

const bgm = new Audio();
bgm.loop = true;
bgm.volume = 0;
bgm.addEventListener("error", () => {
  if (!bgm.src.endsWith("MEGALOVANIA.mp3")) {
    bgm.src = "MEGALOVANIA.mp3";
  }
});
function bgmPlay() {
  bgm.play().catch(() => {}); // autoplay may be blocked until a user gesture
}
function gameVolTarget() {
  return Math.min(bgmVolume * (CHAR_VOL[player?.character] || 1), 1);
}
function setBgmVolume(v) {
  bgmVolume = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
  localStorage.setItem("bgmVolume", String(bgmVolume));
}
// sound effects have their own knob on the pause screen
let sfxVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("sfxVolume") ?? "0.7") || 0.7));
function updateSfxVolume(v) {
  sfxVolume = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
  localStorage.setItem("sfxVolume", String(sfxVolume));
  setSfxVolume(sfxVolume);
}
setSfxVolume(sfxVolume);
// ease an audio element's volume toward a target; auto play/pause at the ends
function fadeAudio(audio, target, dt, speed) {
  const cur = audio.volume;
  if (Math.abs(cur - target) <= speed * dt) audio.volume = target;
  else audio.volume = Math.max(0, Math.min(1, cur + Math.sign(target - cur) * speed * dt));
  if (target > 0.001 && audio.paused) audio.play().catch(() => {});
  else if (audio.volume <= 0.001 && !audio.paused && target <= 0.001) audio.pause();
}
let introBlack = 0; // seconds of black-screen intro when a game begins
let camX = 0; // world x of the view's left edge (map is infinite horizontally)
let bossFight = null; // active 天意侵蚀Sans encounter, or null
let eliteWave = 0; // 0=pending, 1=warned, 2=spawned (one wave per run at 4:00)

function currentCharacter() {
  return CHARACTERS[selectedChar];
}

// 2026-07-10 user decision: weapons are fully open too — every weapon is
// selectable from the start, same as characters.
function weaponLocks() {
  return {};
}

function diffPills() {
  const active = getDifficulty().id;
  return DIFFICULTIES.map((d) => ({
    name: d.name,
    active: d.id === active,
    locked: !isDifficultyUnlocked(d.id),
    hint:
      d.id === active
        ? d.id === 0
          ? "标准体验"
          : `怪物血×${d.hpMult} 伤×${d.dmgMult} · 金币×${d.coinMult} 分数×${d.scoreMult}`
        : d.hint || "",
  }));
}

// codex completion: monsters seen + boss + weapons used + evolutions reached
function codexCompletion() {
  const st = getStats();
  let have = Object.keys(ENEMY_NAMES).filter((t) => (st.killsByType[t] || 0) > 0).length;
  let total = Object.keys(ENEMY_NAMES).length + 1;
  if (st.bossKills > 0) have += 1;
  for (const c of CHARACTERS) {
    for (const w of WEAPON_LISTS[c.id]) {
      total += 1;
      if (st.weaponsUsed[w.id]) have += 1;
      if (w.evolve) {
        total += 1;
        if (st.evolved[w.id]) have += 1;
      }
    }
  }
  return Math.floor((have / total) * 100);
}

// 2026-07-10 user decision: all four characters are freely selectable from
// the start — no character locks (weapon unlocks per character remain).
function charLocks() {
  return {};
}

function shopItems() {
  return UPGRADES.map((u) => ({
    id: u.id,
    name: u.name,
    desc: u.desc,
    lvl: upgradeLevel(u.id),
    max: u.max,
    cost: upgradeCost(u.id),
    color: u.color,
  }));
}

function currentWeaponList() {
  return WEAPON_LISTS[currentCharacter().id];
}

function reset(weaponId) {
  player = new Player(WIDTH / 2, HEIGHT / 2);
  player.character = currentCharacter().id;
  applyMetaUpgrades(player); // permanent shop upgrades kick in from second zero
  player.revives = upgradeLevel("revive"); // 重燃决心: one comeback per run
  player.weapons = [createWeaponInstance(weaponId)];
  spawner = new Spawner(WIDTH, HEIGHT, WALL_H, getDifficulty());
  enemies = [];
  projectiles = [];
  bombs = [];
  explosions = [];
  spikes = [];
  pickups = [];
  floatingTexts = [];
  elapsed = 0;
  bossFight = null;
  eliteWave = 0;
  camX = player.x - WIDTH / 2;
  choiceInterval = CHOICE_INTERVAL;
  nextChoiceAt = choiceInterval;
  choiceOptions = [];
  choiceScreens = 0;
  killFlash = 0;
  streak = 0;
  streakTimer = 0;
  nextStreakAt = 10;
  streakTier = 0;
  runMaxStreak = 0;
  lowHpPulse = 0.9;
  runCoins = 0;
  runKillsByType = {};
  bossDefeated = false;
  bossClearChoice = 0;
  stageClearScore = 0;
  stageClearTime = 0;
  stageClearKills = 0;
  runOutcome = null;
  endlessResult = null;
  endlessRound = 0;
  roundTimer = 0;
  roundPendingCoins = 0;
  roundBossSpawned = false;
  roundBossDown = false;
  roundsCleared = 0;
  runCheckpointId = null;
  roundBanner = null;
  hazardTimer = 0;
  hazards = [];
  tipQueue = [];
  activeTip = null;
  soulTrail = [];
  deathShatter = null;
  runOffense = false;
  lastNewTitles = [];
  lastHitBy = null;
  lastDeathBy = null;
  nextWarnBeep = BOSS_WARN_TIME;
}

reset(currentWeaponList()[0].id);

function bestEndlessOf(charId) {
  return parseInt(localStorage.getItem("best_endless_" + charId) || "0", 10) || 0;
}

function bestEndlessRoundOf(charId) {
  return parseInt(localStorage.getItem("best_endless_round_" + charId) || "0", 10) || 0;
}

function saveSafeProgressCheckpoint(safeCoins) {
  if (!bossDefeated) return;
  if (!runCheckpointId) {
    runCheckpointId = `${Date.now().toString(36)}-${player.character}-${stageClearScore}`;
  }
  saveSafeRunCheckpoint({
    id: runCheckpointId,
    coins: safeCoins,
    stageScore: stageClearScore,
    endlessRounds: roundsCleared,
    kills: player.kills,
    bossKilled: true,
    charId: player.character,
    difficulty: getDifficulty().id,
    killsByType: runKillsByType,
    weaponsUsed: player.weapons.map((inst) => inst.id),
    evolvedIds: player.weapons.filter((inst) => inst.evolved).map((inst) => inst.id),
  });
}

// kind: "victory" when leaving from the boss-clear screen; otherwise derived.
function settleGame(kind) {
  runOutcome =
    kind === "victory"
      ? "victory"
      : player.hp <= 0
        ? bossDefeated
          ? "endlessDeath" // died during endless
          : "death"
        : bossDefeated
          ? "retreat" // quit from pause during endless: voluntary extraction
          : "quit"; // quit from pause before the boss (classic GAME OVER card)
  lastDeathBy = player.hp <= 0 ? lastHitBy : null; // only real deaths get a recap
  // UT-style death: the soul appears, cracks, shatters (equipped soul color)
  deathShatter = player.hp <= 0 ? { t: 0, color: equippedCosmetic()?.color || "#ff3d5a" } : null;
  if (deathShatter) sfxShatter();
  // A normal settlement records the run below, so its crash-recovery checkpoint
  // must be removed first. Pending coins have already been banked only by the
  // round-clear actions; death and pause-quit deliberately leave them behind.
  if (runCheckpointId) clearSafeRunCheckpoint(runCheckpointId);
  runCheckpointId = null;
  roundPendingCoins = 0;
  state = "gameover";
  bgm.pause();
  // the normal best NEVER absorbs endless-inflated scores: once the boss is
  // down, the stage score is frozen at the moment the heart was taken
  lastScore = bossDefeated ? stageClearScore : currentScore();
  lastBest = bestScoreOf(player.character);
  newRecord = lastScore > lastBest;
  if (newRecord) localStorage.setItem("best_" + player.character, String(lastScore));
  // endless gets its own ledger and its own best
  endlessResult = null;
  if (bossDefeated && runOutcome !== "victory") {
    const eScore = Math.max(0, currentScore() - stageClearScore);
    const eBestPrev = bestEndlessOf(player.character);
    const eNew = eScore > eBestPrev;
    if (eNew) localStorage.setItem("best_endless_" + player.character, String(eScore));
    const roundBestPrev = bestEndlessRoundOf(player.character);
    const roundNew = roundsCleared > roundBestPrev;
    if (roundNew) localStorage.setItem("best_endless_round_" + player.character, String(roundsCleared));
    endlessResult = {
      rounds: roundsCleared,
      time: Math.max(0, Math.floor(elapsed - stageClearTime)),
      kills: Math.max(0, player.kills - stageClearKills),
      score: eScore,
      best: Math.max(eBestPrev, eScore),
      newBest: eNew,
      bestRound: Math.max(roundBestPrev, roundsCleared),
      newBestRound: roundNew,
    };
  }
  // bank the run: coins into the wallet, kills/boss into lifetime stats
  lastRunCoins = runCoins;
  addCoins(runCoins);
  runCoins = 0;
  // daily challenge: keep the day's best score locally
  wasDaily = dailyMode;
  if (dailyMode) {
    const key = "daily_" + todayKey();
    const prev = parseInt(localStorage.getItem(key) || "0", 10) || 0;
    dailyNewBest = lastScore > prev;
    dailyBestToday = Math.max(prev, lastScore);
    localStorage.setItem(key, String(dailyBestToday));
  }
  exitDailyMode();
  recordRun({
    kills: player.kills,
    bossKilled: bossDefeated,
    charId: player.character,
    difficulty: getDifficulty().id,
    killsByType: runKillsByType,
    weaponsUsed: player.weapons.map((i) => i.id),
    evolvedIds: player.weapons.filter((i) => i.evolved).map((i) => i.id),
  });
  runKillsByType = {};
  // honour titles (checked after the run is recorded so the codex is fresh)
  lastNewTitles = [];
  for (const [id, ok] of [
    ["pacifist", bossDefeated && !runOffense],
    ["judge", roundsCleared >= 5],
    ["raven", bossDefeated && getDifficulty().id === 2],
    ["determined", codexCompletion() >= 100],
  ]) {
    if (ok && unlockTitle(id)) lastNewTitles.push(TITLES.find((t) => t.id === id).name);
  }
}
function toCharSelect() {
  // wipe the world so the old battlefield doesn't show behind the menu
  exitDailyMode(); // safety: never leak the seeded RNG into normal play
  reset(currentWeaponList()[0].id);
  bgm.pause();
  bgm.currentTime = 0;
  state = "charselect";
}

// debug: open the page with ?boss to skip to the boss, ?boss=weak for a frail one
const DEBUG_BOSS = new URLSearchParams(location.search).get("boss");

// ---- boss-clear choices ----------------------------------------------------

function bossClearLeave() {
  // victory settlement: coins, boss kill, difficulty clear and the normal
  // best all recorded by settleGame; title reads 通关成功, never GAME OVER
  settleGame("victory");
}

function startRound(n) {
  endlessRound = n;
  roundTimer = ROUND_LENGTH;
  roundPendingCoins = 0;
  roundBossSpawned = false;
  roundBossDown = false;
  spawner.round = n;
  const rules = [
    "", // 1-based
    "精英成群 · 金币收益 50%",
    "怪物移速 +15% · 金币收益 25%",
    "怪物伤害提升 · 治疗减半 · 远程怪增多 · 金币收益 10%",
    "危险领域降临 · 金币不再掉落",
    "全部审判叠加，且仍在加深",
  ];
  roundBanner = { text: `⚖ 审判第 ${n} 轮`, sub: rules[Math.min(n, 5)], t: 2.8 };
  sfxAlarm();
  nextChoiceAt = Math.max(nextChoiceAt, elapsed + 5); // no instant backlog
  state = "playing";
  bgmPlay();
}

function bossClearContinue() {
  // full boss reward, then the judgement continues in 90s rounds
  player.hp = player.maxHp;
  for (const t of EQUIPMENT_TYPES) t.apply(player); // every gem's effect
  spawner.endless = true;
  nextChoiceAt = elapsed + choiceInterval; // no backlog of choice screens
  floatingTexts.push(new FloatingText(player.x, player.y - 26, "决心！全属性提升", "#ffffff"));
  queueTipOnce("endless", "什么是无尽审判？", [
    "每 90 秒为一轮，轮末 15 秒会出现强化首领",
    "击杀首领完成本轮，可选择撤离结算，或进入更危险的下一轮",
  ]);
  startRound(1);
}

function roundRetreat() {
  // voluntary extraction: this round's pending coins are banked, then settle
  runCoins += roundPendingCoins;
  roundPendingCoins = 0;
  settleGame(); // hp > 0 && bossDefeated → "retreat", never a death cause
}

function pauseQuit() {
  // Leaving from the pause menu is allowed, but the unfinished round was not
  // cleared and its risk pot is forfeited.
  if (endlessRound > 0) roundPendingCoins = 0;
  settleGame();
}

function roundNext() {
  runCoins += roundPendingCoins; // the finished round's loot is now safe
  startRound(endlessRound + 1);
}

// coin drop factor: 1 before the boss, per-round decay in endless
function currentCoinFactor() {
  return roundCoinFactor(endlessRound);
}

// round 3+: healing and regeneration are halved
function healScale() {
  return endlessRound >= 3 ? 0.5 : 1;
}

// ---- daily challenge -------------------------------------------------------
// One fixed-seed run per calendar day: same spawns/cards for everyone, a
// rotating character (locks bypassed — it doubles as a demo), local best kept.

let dailyMode = false;
const nativeRandom = Math.random.bind(Math);

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dailySeed() {
  let h = 2166136261;
  for (const ch of todayKey()) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function startDailyChallenge() {
  const seed = dailySeed();
  selectedChar = seed % CHARACTERS.length;
  selectedWeapon = (seed >>> 3) % currentWeaponList().length;
  dailyMode = true;
  Math.random = mulberry32(seed); // whole run becomes deterministic
  startGame();
}

function exitDailyMode() {
  if (!dailyMode) return;
  dailyMode = false;
  Math.random = nativeRandom;
}

function startGame() {
  reset(currentWeaponList()[selectedWeapon].id);
  if (DEBUG_BOSS !== null) {
    elapsed = BOSS_APPEAR_TIME - 2;
    nextChoiceAt = 99999; // skip the backlog of choice screens
    // simulate a 5-minute build so the tester isn't one-shot
    player.maxHp = 1200;
    player.hp = 1200;
    player.atk += 40;
    player.regen += 15;
    player.dmgReduction = 0.6; // survivable enough to watch the whole show
  }
  // 行前整备: shop-bought loadout, granted before the first frame
  for (let i = 0; i < upgradeLevel("gear"); i++) {
    rollEquipmentDrop().apply(player);
  }
  // warm-up ring: 8 frail slimes already closing in, so the mowing starts
  // the moment the intro fades instead of seconds of empty walking
  if (DEBUG_BOSS === null) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ex = player.x + Math.cos(a) * 260;
      const ey = clamp(player.y + Math.sin(a) * 220, WALL_H + 24, HEIGHT - 24);
      enemies.push(new Enemy("slime", ex, ey, spawner.scale(false)));
    }
  }
  timeScale = 1;
  state = "playing";
  introBlack = 1.5; // brief black screen while the battle music fades in
  // hard-stop the menu theme so it never overlaps the battle track
  menuBgm.pause();
  menuBgm.currentTime = 0;
  menuBgm.volume = 0;
  const track = BGM_TRACKS[currentCharacter().id] || "MEGALOVANIA.mp3";
  bgm.src = track; // reload also resets playback to the start
  bgm.volume = 0; // fades up during the intro
  bgmPlay();
}

// ---- 15s buff choices -----------------------------------------------------

function buildChoicePool() {
  const pool = [
    {
      kind: "atk",
      weight: 12,
      make: () => ({
        title: "攻击力 +4",
        desc: "所有武器伤害提升",
        color: "#ff6b6b",
        apply: () => {
          player.atk += 4;
          runOffense = true;
        },
      }),
    },
    {
      kind: "hp",
      weight: 12,
      make: () => {
        // scales with current bulk (8%, floor 25) so it stays worth picking
        const gain = Math.max(25, Math.round(player.maxHp * 0.08));
        return {
          title: `生命上限 +${gain}`,
          desc: `上限提升 8%(保底25) 并回复等量生命`,
          color: "#ff8fc7",
          apply: () => {
            player.maxHp += gain;
            player.hp = Math.min(player.maxHp, player.hp + Math.round(gain * healScale()));
          },
        };
      },
    },
    {
      kind: "speed",
      weight: 12,
      make: () => ({
        title: "移动速度 +18",
        desc: "跑得更快，风筝更稳",
        color: "#8fd6ff",
        apply: () => {
          player.moveSpeed += 18;
        },
      }),
    },
    {
      kind: "fireRate",
      weight: 12,
      make: () => ({
        title: "攻速 +10%",
        desc: "所有武器攻击更快",
        color: "#5ee6e6",
        apply: () => {
          player.fireRate *= 1.1;
        },
      }),
    },
    {
      kind: "regen",
      weight: 12,
      make: () => ({
        title: "每秒回血 +1%",
        // scales with max hp so it never falls behind late game
        desc: `每秒回复 1% 最大生命\n(当前 ${(player.regen + player.maxHp * player.regenPct).toFixed(1)}/秒，上限 5%)`,
        color: "#7cf28a",
        apply: () => {
          player.regenPct = Math.min(player.regenPct + 0.01, 0.05);
        },
      }),
    },
  ].filter((c) => c.kind !== "regen" || player.regenPct < 0.05);

  // (regen capped at 5% of max hp — the card stops appearing at the cap)
  pool.push({
    kind: "thorns",
    weight: 10,
    make: () => ({
      title: "荆棘之躯",
      desc: `触碰你的敌人受到伤害\n(当前 ${player.thorns} -> ${player.thorns + 5})`,
      color: "#d9c47a",
      apply: () => {
        player.thorns += 5;
      },
    }),
  });
  pool.push({
    kind: "heal50",
    weight: 12,
    make: () => ({
      title: "紧急治疗",
      // percentage-based so it never becomes chip healing late game
      desc: `立即恢复 35% 最大生命 (约${Math.max(50, Math.round(player.maxHp * 0.35))}点)`,
      color: "#7cf28a",
      apply: () => {
        const amount = Math.max(50, Math.round(player.maxHp * 0.35));
        player.hp = Math.min(player.maxHp, player.hp + Math.round(amount * healScale()));
      },
    }),
  });
  pool.push({
    kind: "amp20",
    weight: 10,
    make: () => ({
      title: "增伤 +20%",
      desc: `所有武器最终伤害提升\n(当前 ${Math.round(player.dmgAmp * 100)}%)`,
      color: "#ff6b6b",
      apply: () => {
        player.dmgAmp += 0.2;
        runOffense = true;
      },
    }),
  });
  pool.push({
    kind: "amp100",
    weight: 3,
    make: () => ({
      title: "毁灭强化 +100%",
      desc: `极稀有！最终伤害翻倍\n(当前 ${Math.round(player.dmgAmp * 100)}%)`,
      color: "#ffd166",
      apply: () => {
        player.dmgAmp += 1;
        runOffense = true;
      },
    }),
  });
  if (choiceInterval > 8) {
    pool.push({
      kind: "faster",
      weight: 8,
      make: () => ({
        title: "强化提速",
        desc: `强化卡出现间隔 -1 秒\n(${choiceInterval}s -> ${choiceInterval - 1}s)`,
        color: "#5ee6e6",
        apply: () => {
          choiceInterval = Math.max(choiceInterval - 1, 8);
        },
      }),
    });
  }
  if (player.dodge < 0.45) {
    pool.push({
      kind: "dodge",
      weight: 10,
      make: () => ({
        title: "闪避 +5%",
        desc: `有几率完全躲开攻击\n(当前 ${Math.round(player.dodge * 100)}%，上限 45%)`,
        color: "#8fd6ff",
        apply: () => {
          player.dodge = Math.min(player.dodge + 0.05, 0.45);
        },
      }),
    });
  }
  if (player.dmgReduction < 0.9) {
    pool.push({
      kind: "tough",
      weight: 10,
      make: () => ({
        title: "减伤 +10%",
        desc: `受到的伤害降低\n(当前 ${Math.round(player.dmgReduction * 100)}%，上限 90%)`,
        color: "#b8a5d0",
        apply: () => {
          player.dmgReduction = Math.min(player.dmgReduction + 0.1, 0.9);
        },
      }),
    });
  }

  // in-run new-weapon cards: the whole arsenal is open
  const unowned = currentWeaponList().filter((w) => !player.weapons.some((i) => i.id === w.id));
  if (unowned.length) {
    pool.push({
      kind: "newWeapon",
      weight: 22,
      make: () => {
        const w = unowned[Math.floor(Math.random() * unowned.length)];
        return {
          title: "获得新武器",
          desc: `${w.name}\n[${w.tag}]`,
          color: w.color,
          apply: () => {
            player.weapons.push(createWeaponInstance(w.id));
          },
        };
      },
    });
  }

  const enhanceable = player.weapons.filter((i) => WEAPONS[i.id].enhance);
  if (enhanceable.length) {
    pool.push({
      kind: "enhance",
      weight: 20,
      make: () => {
        const inst = enhanceable[Math.floor(Math.random() * enhanceable.length)];
        const w = WEAPONS[inst.id];
        const stacks = inst.enhance;
        const evoHint = w.evolve && !inst.evolved && stacks < 3 ? "\n(满品阶+3层强化 → 可进化)" : "";
        return {
          title: `专属强化·${w.name}`,
          desc: `${w.enhance.desc}\n${w.enhance.detail}${stacks > 0 ? `\n(当前 ${stacks} 层)` : ""}${evoHint}`,
          color: w.color,
          apply: () => {
            inst.enhance += 1;
          },
        };
      },
    });
  }

  // 武器进化: max tier + 3 enhance stacks awakens a whole new form
  const evolvable = player.weapons.filter(canEvolve);
  if (evolvable.length) {
    pool.push({
      kind: "evolve",
      weight: 60,
      make: () => {
        const inst = evolvable[Math.floor(Math.random() * evolvable.length)];
        const w = WEAPONS[inst.id];
        return {
          title: `武器进化·${w.evolve.name}`,
          desc: `${w.name} 觉醒为 ${w.evolve.name}！\n${w.evolve.desc}`,
          color: "#ffd166",
          fanfare: true,
          apply: () => {
            inst.evolved = true;
          },
        };
      },
    });
  }

  const upgradable = player.weapons.filter((i) => i.tier < 4);
  if (upgradable.length) {
    pool.push({
      kind: "tierUp",
      weight: 26,
      make: () => {
        const inst = upgradable[Math.floor(Math.random() * upgradable.length)];
        const w = WEAPONS[inst.id];
        return {
          title: "武器品阶提升",
          desc: `${w.name}\nLv${inst.tier + 1} → Lv${inst.tier + 2}`,
          color: w.color,
          apply: () => {
            inst.tier = Math.min(inst.tier + 1, 4);
          },
        };
      },
    });
  }
  return pool;
}

const WEAPON_KINDS = new Set(["newWeapon", "tierUp", "enhance"]);

function rollChoices() {
  const pool = buildChoicePool();
  const picked = [];
  const pickedKinds = [];
  while (picked.length < 3 && pool.length) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      if (r < pool[i].weight) {
        idx = i;
        break;
      }
      r -= pool[i].weight;
    }
    picked.push(pool[idx].make());
    pickedKinds.push(pool[idx].kind);
    pool.splice(idx, 1);
  }
  // first three choice screens guarantee at least one weapon-class card
  if (choiceScreens <= 3 && !pickedKinds.some((k) => WEAPON_KINDS.has(k))) {
    const weaponEntries = pool.filter((p) => WEAPON_KINDS.has(p.kind));
    if (weaponEntries.length) {
      const entry = weaponEntries[Math.floor(Math.random() * weaponEntries.length)];
      const slot = Math.floor(Math.random() * picked.length);
      picked[slot] = entry.make();
    }
  }
  return picked;
}

function applyChoice(i) {
  const opt = choiceOptions[i];
  if (!opt) return;
  opt.apply();
  if (opt.fanfare) {
    sfxFanfare(); // weapon evolution deserves the full jingle
    killFlash = 0.3;
  } else {
    sfxChoice();
  }
  floatingTexts.push(new FloatingText(player.x, player.y - 26, opt.title, opt.color));
  choiceOptions = [];
  state = "playing";
}

// ---- input ---------------------------------------------------------------

function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function inRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function handleCanvasTap(pos) {
  if ((state === "playing" || state === "paused" || state === "choice") && inRect(pos, speedButtonRect(WIDTH))) {
    cycleSpeed();
    sfxClick();
    return;
  }
  if ((state === "playing" || state === "paused") && inRect(pos, pauseButtonRect(WIDTH))) {
    sfxClick();
    if (state === "playing") {
      state = "paused";
      bgm.pause();
    } else {
      state = "playing";
      bgmPlay();
    }
    return;
  }
  if (state === "title") {
    if (inRect(pos, creditsButtonRect(WIDTH, HEIGHT))) {
      state = "credits";
      sfxClick();
    } else if (inRect(pos, shopButtonRect(WIDTH, HEIGHT))) {
      state = "shop";
      sfxClick();
    } else if (inRect(pos, codexButtonRect(WIDTH, HEIGHT))) {
      state = "codex";
      sfxClick();
    } else if (inRect(pos, dailyButtonRect(WIDTH, HEIGHT))) {
      startDailyChallenge();
      sfxClick();
    } else if (inRect(pos, startButtonRect(WIDTH, HEIGHT))) {
      toCharSelect();
      sfxClick();
    }
    return;
  }
  if (state === "bossclear" || state === "roundclear") {
    const leave = state === "bossclear" ? bossClearLeave : roundRetreat;
    const cont = state === "bossclear" ? bossClearContinue : roundNext;
    if (inRect(pos, bossClearLeaveRect(WIDTH, HEIGHT))) {
      sfxClick();
      leave();
    } else if (inRect(pos, bossClearContinueRect(WIDTH, HEIGHT))) {
      sfxClick();
      cont();
    }
    return;
  }
  if (state === "codex") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
    }
    return;
  }
  if (state === "shop") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
      return;
    }
    for (const i of [0, 1]) {
      if (inRect(pos, shopTabRect(i, WIDTH))) {
        shopTab = i;
        sfxClick();
        return;
      }
    }
    if (shopTab === 1) {
      // 灵魂加护: buy once, then click toggles equip/unequip
      for (let i = 0; i < COSMETICS.length; i++) {
        if (inRect(pos, cosmeticItemRect(i, WIDTH, HEIGHT))) {
          const c = COSMETICS[i];
          if (!cosmeticOwned(c.id)) {
            if (buyCosmetic(c.id)) sfxFanfare();
            else sfxHurt();
          } else if (equippedCosmetic()?.id === c.id || equippedBoneSkin()?.id === c.id) {
            equipCosmetic(null, c.slot);
            sfxClick();
          } else {
            equipCosmetic(c.id);
            sfxEquip();
          }
          return;
        }
      }
      return;
    }
    const items = shopItems();
    for (let i = 0; i < items.length; i++) {
      if (inRect(pos, shopItemRect(i, WIDTH, HEIGHT))) {
        if (buyUpgrade(items[i].id)) sfxEquip();
        else sfxHurt(); // maxed or broke: denial buzz
        return;
      }
    }
    return;
  }
  if (state === "credits") {
    state = "title";
    sfxClick();
    return;
  }
  if (state === "charselect") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
      return;
    }
    for (let i = 0; i < CHARACTERS.length; i++) {
      if (inRect(pos, charBoxRect(i, WIDTH, HEIGHT, CHARACTERS.length))) {
        selectedChar = i;
        sfxClick();
        return;
      }
    }
    for (let i = 0; i < DIFFICULTIES.length; i++) {
      if (inRect(pos, diffPillRect(i, WIDTH, HEIGHT))) {
        if (setDifficulty(i)) sfxClick();
        else sfxHurt(); // locked difficulty
        return;
      }
    }
    if (inRect(pos, confirmButtonRect(WIDTH, HEIGHT))) {
      if (charLocks()[currentCharacter().id]) {
        sfxHurt(); // locked character: show the condition, no entry
        return;
      }
      selectedWeapon = 0;
      state = "select";
      sfxClick();
    }
  } else if (state === "select") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "charselect";
      sfxClick();
      return;
    }
    for (let i = 0; i < currentWeaponList().length; i++) {
      if (inRect(pos, weaponBoxRect(i, WIDTH))) {
        if (weaponLocks()[i]) {
          sfxHurt(); // locked weapon: condition shown on the card
          return;
        }
        selectedWeapon = i;
        sfxClick();
        return;
      }
    }
    if (inRect(pos, confirmButtonRect(WIDTH, HEIGHT))) {
      if (weaponLocks()[selectedWeapon]) {
        sfxHurt();
        return;
      }
      startGame();
      sfxClick();
    }
  } else if (state === "paused") {
    if (inRect(pos, volumeMinusRect(WIDTH, HEIGHT))) {
      setBgmVolume(bgmVolume - 0.1);
      return;
    }
    if (inRect(pos, volumePlusRect(WIDTH, HEIGHT))) {
      setBgmVolume(bgmVolume + 0.1);
      return;
    }
    if (inRect(pos, sfxMinusRect(WIDTH, HEIGHT))) {
      updateSfxVolume(sfxVolume - 0.1);
      sfxClick(); // audible feedback at the new level
      return;
    }
    if (inRect(pos, sfxPlusRect(WIDTH, HEIGHT))) {
      updateSfxVolume(sfxVolume + 0.1);
      sfxClick();
      return;
    }
    if (inRect(pos, resumeButtonRect(WIDTH, HEIGHT))) {
      state = "playing";
      bgmPlay();
    } else if (inRect(pos, quitButtonRect(WIDTH, HEIGHT))) {
      pauseQuit(); // show the score settlement before leaving
    }
  } else if (state === "choice") {
    if (choiceRerollsLeft > 0 && inRect(pos, rerollButtonRect(WIDTH, HEIGHT))) {
      choiceOptions = rollChoices();
      choiceRerollsLeft -= 1;
      sfxClick();
      return;
    }
    for (let i = 0; i < choiceOptions.length; i++) {
      if (inRect(pos, choiceBoxRect(i, WIDTH, HEIGHT))) {
        applyChoice(i);
        return;
      }
    }
  } else if (state === "gameover") {
    toCharSelect();
  }
}

let lastPointerTapAt = 0;

canvas.addEventListener("pointerup", (e) => {
  initSfx(); // AudioContext may only start inside a user gesture
  if (e.isPrimary === false || (e.button !== undefined && e.button !== 0)) return;
  e.preventDefault();
  lastPointerTapAt = performance.now();
  handleCanvasTap(canvasCoords(e));
});

canvas.addEventListener("click", (e) => {
  initSfx();
  if (performance.now() - lastPointerTapAt < 500) return;
  handleCanvasTap(canvasCoords(e));
});

function cycleSpeed() {
  timeScale = timeScale >= 3 ? 1 : timeScale + 1;
}

window.addEventListener("keydown", (e) => {
  initSfx(); // AudioContext may only start inside a user gesture
  const k = e.key.toLowerCase();
  if (k === "z") {
    if (state === "playing") {
      state = "paused";
      bgm.pause();
    } else if (state === "paused") {
      state = "playing";
      bgmPlay();
    }
    return;
  }
  if (k === "x" && (state === "playing" || state === "paused" || state === "choice")) {
    cycleSpeed();
    return;
  }
  if (state === "title") {
    if (k === " " || k === "enter") state = "charselect";
    return;
  }
  if (state === "credits") {
    if (k === " " || k === "enter" || k === "escape") state = "title";
    return;
  }
  if (state === "shop" || state === "codex") {
    if (k === "escape") state = "title";
    return;
  }
  if (state === "bossclear" || state === "roundclear") {
    if (k === "arrowleft" || k === "arrowright") {
      bossClearChoice = 1 - bossClearChoice;
      sfxClick();
    } else if (k === " " || k === "enter") {
      sfxClick();
      const leave = state === "bossclear" ? bossClearLeave : roundRetreat;
      const cont = state === "bossclear" ? bossClearContinue : roundNext;
      if (bossClearChoice === 0) leave();
      else cont();
    }
    return;
  }
  if (state === "charselect") {
    const n = CHARACTERS.length;
    if (k === "arrowleft" || k === "arrowright") selectedChar = (selectedChar + 1) % n;
    else if (k >= "1" && k <= String(n)) selectedChar = Number(k) - 1;
    else if (k === " " || k === "enter") {
      if (charLocks()[currentCharacter().id]) {
        sfxHurt(); // locked: stay on the select screen
        return;
      }
      selectedWeapon = 0;
      state = "select";
    }
  } else if (state === "select") {
    const n = currentWeaponList().length;
    if (k === "arrowup") selectedWeapon = (selectedWeapon + n - 1) % n;
    else if (k === "arrowdown") selectedWeapon = (selectedWeapon + 1) % n;
    else if (k === "arrowleft" || k === "arrowright") selectedWeapon = (selectedWeapon + 4) % n;
    else if (k >= "1" && k <= String(n)) selectedWeapon = Number(k) - 1;
    else if (k === " " || k === "enter") {
      if (weaponLocks()[selectedWeapon]) {
        sfxHurt(); // locked weapon can't start a run
        return;
      }
      startGame();
    } else if (k === "escape") state = "charselect";
  } else if (state === "choice") {
    if (k >= "1" && k <= "3") applyChoice(Number(k) - 1);
  } else if (state === "gameover" && (k === " " || k === "enter")) {
    toCharSelect();
  }
});

// ---- world helpers ---------------------------------------------------------

function spawnProjectile(opts) {
  projectiles.push(new Projectile(opts));
}

function spawnBomb(opts) {
  bombs.push(new Bomb(opts));
}

function spawnSpike(opts) {
  spikes.push(new Spike(opts));
}

// immediate explosion; optionally roots everyone it catches
function spawnBlast({ x, y, dmg, blast, color, root = 0 }) {
  explosions.push(new Explosion(x, y, blast, color));
  for (const e of enemies) {
    if (circleHit(x, y, blast, e.x, e.y, e.radius)) {
      if (root > 0) e.applyRoot(root); // blast roots respect diminishing returns
      if (e.takeDamage(dmg)) sfxHit();
    }
  }
}

function explodeBomb(b) {
  explosions.push(new Explosion(b.x, b.y, b.blast, "#ffffff"));
  for (const e of enemies) {
    if (circleHit(b.x, b.y, b.blast, e.x, e.y, e.radius)) {
      if (e.takeDamage(b.dmg)) sfxHit();
    }
  }
  // 骨雷强化: echo explosions at the same spot (pure shockwave, no bone)
  for (let i = 1; i <= (b.echo || 0); i++) {
    spikes.push(new Spike({ x: b.x, y: b.y, dmg: b.dmg, delay: 0.35 * i, wave: b.blast, knockback: 0, color: "#ffffff", noBone: true }));
  }
}

function spawnDrops(enemy) {
  pickups.push(new Pickup(enemy.x, enemy.y, "xp", { amount: enemy.xp }));
  const dropChance = enemy.elite ? 1 : 0.12;
  if (Math.random() < dropChance) {
    const type = rollEquipmentDrop();
    pickups.push(
      new Pickup(enemy.x + (Math.random() - 0.5) * 14, enemy.y + (Math.random() - 0.5) * 14, "equipment", { type })
    );
  }
  // coins: the between-runs currency. Value grows with the clock. In endless
  // the DROP CHANCE decays (50%→25%→10%→0) — chance, not value, so the decay
  // can't be defeated by Math.max(1) rounding on tiny values.
  const coinFactor = currentCoinFactor();
  if (coinFactor > 0 && (enemy.elite || Math.random() < 0.13) && Math.random() < coinFactor) {
    const base = (enemy.elite ? 6 : 1) * (1 + Math.floor(elapsed / 150));
    const value = Math.max(1, Math.round(base * coinGainMult() * getDifficulty().coinMult));
    pickups.push(
      new Pickup(enemy.x + (Math.random() - 0.5) * 10, enemy.y + (Math.random() - 0.5) * 10, "coin", { value })
    );
  }
}

function onLevelUp(levels) {
  floatingTexts.push(new FloatingText(player.x, player.y - 26, "LEVEL UP!", "#ffd166"));
  sfxLevelUp();
  for (let l = 0; l < levels; l++) {
    for (const inst of player.weapons) applyLevelUpBonus(inst);
  }
}

// ---- update ---------------------------------------------------------------

function update(dt) {
  elapsed += dt;
  const hpBefore = player.hp;

  if (!bossFight && elapsed >= nextChoiceAt) {
    nextChoiceAt += choiceInterval;
    choiceScreens += 1;
    choiceOptions = rollChoices();
    choiceRerollsLeft = 1 + rerollBonus();
    state = "choice";
  }

  // elite waves: two crashes before the boss — 3:20 (6 elites) and 4:00 (8),
  // each warned 8 seconds ahead. eliteWave counts phases: 0..4
  const ELITE_WAVES = [
    { warnAt: 192, at: 200, count: 6 },
    { warnAt: 232, at: 240, count: 8 },
  ];
  const waveIdx = Math.floor(eliteWave / 2);
  const wave = ELITE_WAVES[waveIdx];
  if (wave && !bossFight) {
    if (eliteWave % 2 === 0 && elapsed >= wave.warnAt) {
      eliteWave += 1;
      floatingTexts.push(new FloatingText(player.x, player.y - 60, "※ 精英潮来袭！", "#ffd166"));
    } else if (eliteWave % 2 === 1 && elapsed >= wave.at) {
      eliteWave += 1;
      const types = ["tank", "red", "orange", "blue", "purple", "ghost"];
      for (let i = 0; i < wave.count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const e = new Enemy(
          types[Math.floor(Math.random() * types.length)],
          camX + WIDTH / 2 + side * (WIDTH / 2 + 50),
          WALL_H + 30 + Math.random() * (HEIGHT - WALL_H - 60),
          spawner.scale(true)
        );
        enemies.push(e);
      }
    }
  }

  // boss warning siren beeps every 10s while the red pulse runs
  if (bossWarnActive() && elapsed >= nextWarnBeep) {
    nextWarnBeep += 10;
    sfxAlarm();
  }

  // 天意侵蚀Sans appears at 5:00: clear the field and stop spawning
  if (!bossFight && !bossDefeated && elapsed >= BOSS_APPEAR_TIME) {
    bossFight = createBossFight(player.x + WIDTH * 0.4, player.y, player.character, WIDTH, HEIGHT, WALL_H);
    enemies.length = 0;
    pickups.length = 0;
    enemies.push(bossFight.boss);
    if (DEBUG_BOSS === "weak") {
      bossFight.boss.maxHp = 500;
      bossFight.boss.hp = 500;
    }
  }

  const bossCutscene = bossFight && (bossFight.state === "intro" || bossFight.state === "transition");
  const moveVec = bossCutscene ? { x: 0, y: 0 } : getMoveVector();
  const bounds = {
    left: -Infinity, // the hall stretches forever to both sides
    right: Infinity,
    top: WALL_H + player.radius, // the column wall is off-limits
    bottom: HEIGHT - player.radius,
  };
  // 紫魂护盾强化: +100% (+25%/层) move speed and regen while the shield is up
  const shieldInst = player.weapons.find((i) => i.id === "shield");
  const shieldBuff =
    shieldInst && shieldInst.enhance > 0 && player.shieldTimer > 0
      ? 2 + 0.25 * (shieldInst.enhance - 1)
      : 1;
  const baseMove = player.moveSpeed;
  const baseRegen = player.regen;
  const baseRegenPct = player.regenPct;
  player.moveSpeed *= shieldBuff;
  player.regen *= shieldBuff * healScale(); // round 3+: regeneration halved
  player.regenPct *= shieldBuff * healScale();
  player.update(dt, moveVec, bounds);
  player.moveSpeed = baseMove;
  player.regen = baseRegen;
  player.regenPct = baseRegenPct;
  camX = player.x - WIDTH / 2;

  if (!bossCutscene) {
    updateWeapons(player, dt, {
      enemies,
      projectiles,
      spawnProjectile,
      spawnBomb,
      spawnSpike,
      spawnBlast,
      bounds: { top: WALL_H + 20, bottom: HEIGHT - 16 }, // playfield, excluding the column wall
    });
  }

  if (!bossFight) {
    for (const e of spawner.update(dt, camX)) {
      if (enemies.length >= 220) break; // hard cap: keep phones alive in endless
      enemies.push(e);
    }
  }

  // ---- endless judgement rounds -------------------------------------------
  if (endlessRound > 0) {
    if (roundTimer > 0) roundTimer -= dt;
    // T-15s: the round's champion — a souped-up elite of an existing monster
    if (!roundBossSpawned && roundTimer <= 15) {
      roundBossSpawned = true;
      const types = ["tank", "red", "orange", "blue", "purple", "ghost"];
      const ty = types[Math.floor(Math.random() * types.length)];
      const side = Math.random() < 0.5 ? -1 : 1;
      const b = new Enemy(
        ty,
        camX + WIDTH / 2 + side * (WIDTH / 2 + 60),
        WALL_H + 40 + Math.random() * (HEIGHT - WALL_H - 80),
        spawner.scale(true)
      );
      b.roundBoss = true;
      b.maxHp = Math.round(b.maxHp * (4 + endlessRound));
      b.hp = b.maxHp;
      b.dmg = Math.round(b.dmg * 1.5);
      b.radius = Math.round(b.radius * 1.35);
      b.xp = Math.round(b.xp * 4);
      enemies.push(b);
      roundBanner = { text: "⚠ 首领接近", sub: `消灭它以完成第 ${endlessRound} 轮审判`, t: 2.2 };
      sfxAlarm();
    }
    // the round ends when the clock is out AND the champion is down
    if (roundTimer <= 0 && roundBossSpawned && roundBossDown) {
      roundsCleared = endlessRound;
      bossClearChoice = 0;
      state = "roundclear";
      saveSafeProgressCheckpoint(runCoins + roundPendingCoins);
    }
    // round 4+: periodic danger zones (existing telegraph + blast visuals)
    if (endlessRound >= 4) {
      hazardTimer -= dt;
      if (hazardTimer <= 0) {
        hazardTimer = Math.max(2.2, 4.2 - 0.2 * (endlessRound - 4));
        hazards.push({
          x: player.x + (Math.random() - 0.5) * 320,
          y: clamp(player.y + (Math.random() - 0.5) * 260, WALL_H + 30, HEIGHT - 30),
          t: 1.15,
        });
      }
    }
    for (const hz of hazards) {
      hz.t -= dt;
      if (hz.t <= 0) {
        explosions.push(new Explosion(hz.x, hz.y, 75, "#ff5d5d"));
        if (circleHit(hz.x, hz.y, 75, player.x, player.y, player.radius)) {
          if (player.takeDamage(12 + 4 * endlessRound)) lastHitBy = "审判领域";
        }
      }
    }
    hazards = hazards.filter((hz) => hz.t > 0);
  }
  if (roundBanner && (roundBanner.t -= dt) <= 0) roundBanner = null;

  // onboarding tips: one at a time, each lingers ~9s
  if (!activeTip && tipQueue.length) activeTip = tipQueue.shift();
  if (activeTip && (activeTip.t -= dt) <= 0) activeTip = null;

  // soul cosmetic: drop little hearts while moving
  if (equippedCosmetic() && player.moving) {
    soulTrailTimer -= dt;
    if (soulTrailTimer <= 0) {
      soulTrailTimer = 0.12;
      soulTrail.push({ x: player.x + (Math.random() - 0.5) * 10, y: player.y + 8, t: 0 });
      if (soulTrail.length > 12) soulTrail.shift();
    }
  }
  for (const s of soulTrail) s.t += dt;
  soulTrail = soulTrail.filter((s) => s.t < 0.6);

  // enemies left far behind wrap around to just ahead of the view so
  // running sideways forever doesn't shake off the horde
  for (const e of enemies) {
    if (e.boss) continue;
    const dx = e.x - player.x;
    if (Math.abs(dx) > WIDTH / 2 + 140) {
      e.x = player.x - Math.sign(dx) * (WIDTH / 2 + 60);
      e.y = WALL_H + Math.random() * (HEIGHT - WALL_H);
    }
  }

  const shieldUp = player.shieldTimer > 0;
  for (const e of enemies) {
    if (e.boss) continue; // the boss is driven by its own controller
    e.update(dt, player);
    // batched damage number: one floater per 0.3s window, tiny ticks stay silent
    if (e.dmgFlushT > 0) {
      e.dmgFlushT -= dt;
      if (e.dmgFlushT <= 0) {
        if (e.dmgAccum >= 18 && floatingTexts.length < 40) {
          const v = Math.round(e.dmgAccum);
          const col = v >= 300 ? "#ff8a5d" : v >= 100 ? "#ffd166" : "#f2ead8";
          floatingTexts.push(new FloatingText(e.x + (Math.random() - 0.5) * 12, e.y - e.radius - 12, String(v), col));
        }
        e.dmgAccum = 0;
      }
    }
    // teleporter arrival strike (fixed 30 dmg in a small zone)
    if (e.strike) {
      const STRIKE_DMG = 20;
      if (!shieldUp && circleHit(e.strike.x, e.strike.y, 30, player.x, player.y, player.radius)) {
        if (player.takeDamage(STRIKE_DMG)) {
          lastHitBy = enemyDisplayName(e) + "的突袭";
          floatingTexts.push(new FloatingText(player.x, player.y - 20, `-${STRIKE_DMG}`, "#c95df0"));
        } else if (player.dodged) {
          floatingTexts.push(new FloatingText(player.x, player.y - 20, "MISS!", "#7cf28a"));
        }
      }
      explosions.push(new Explosion(e.strike.x, e.strike.y, 30, "#c95df0"));
      e.strike = null;
    }
    // 荆棘: touching the player hurts the enemy
    if (player.thorns > 0 && e.thornsTick <= 0 && circleHit(e.x, e.y, e.radius, player.x, player.y, player.radius + 2)) {
      e.takeDamage(player.thorns);
      e.thornsTick = 0.5;
    }
    // rooted enemies can't attack
    if (e.rootTimer > 0) continue;
    if (e.contactTimer <= 0 && circleHit(e.x, e.y, e.attackRange, player.x, player.y, player.radius)) {
      e.contactTimer = e.contactInterval;
      if (shieldUp) {
        // 紫魂护盾: full reflect + knockback
        e.takeDamage(e.dmg);
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const d = Math.hypot(dx, dy) || 1;
        e.x += (dx / d) * 45;
        e.y += (dy / d) * 45;
        floatingTexts.push(new FloatingText(e.x, e.y - 16, `反弹 ${e.dmg}`, "#9a5df0"));
      } else {
        const hit = player.takeDamage(e.dmg);
        if (hit) {
          lastHitBy = enemyDisplayName(e);
          floatingTexts.push(new FloatingText(player.x, player.y - 20, `-${e.dmg}`, "#ff5d73"));
        } else if (player.dodged) {
          floatingTexts.push(new FloatingText(player.x, player.y - 20, "MISS!", "#7cf28a"));
        }
      }
    }
  }

  for (const p of projectiles) {
    p.update(dt);
    for (const e of enemies) {
      if (p.noHit || p.pierce <= 0 || p.hitSet.has(e.id)) continue;
      if (circleHit(p.x, p.y, p.hitR || p.size / 2, e.x, e.y, e.radius)) {
        // 十字骨射强化: extend the root of already-rooted enemies
        if (p.extendRoot > 0 && e.rootTimer > 0) e.rootTimer += p.extendRoot;
        if (!e.takeDamage(p.dmg)) continue; // immune: passes through
        sfxHit();
        // 追踪骨弹强化: hits pin the enemy in place
        if (p.rootOnHit > 0) e.applyRoot(p.rootOnHit);
        p.hitSet.add(e.id);
        p.pierce -= 1;
        // 贯穿骨矛强化: every pierced enemy detonates
        if (p.hitBlast) {
          spawnBlast({ x: e.x, y: e.y, dmg: p.hitBlast.dmg, blast: p.hitBlast.radius, color: "#ffffff" });
        }
      }
    }
    // 环绕骨雷: explodes on impact or at the end of its flight
    if (p.explode && (p.pierce <= 0 || p.traveled >= p.maxRange)) {
      spawnBlast({ x: p.x, y: p.y, dmg: p.explode.dmg, blast: p.explode.blast, color: p.explode.color });
      p.explode = null;
      p.pierce = 0;
    }
  }
  // boomerangs may legitimately leave the screen while returning; everything
  // else (e.g. 十字骨射) dies at the screen edge
  const onScreen = (p) => p.x > camX - 30 && p.x < camX + WIDTH + 30 && p.y > -30 && p.y < HEIGHT + 30;
  projectiles = projectiles.filter((p) => !p.expired && (p.boom || p.toPlayer || onScreen(p)));

  for (const b of bombs) {
    b.update(dt);
    if (b.exploded) explodeBomb(b);
  }
  bombs = bombs.filter((b) => !b.exploded);

  for (const ex of explosions) ex.update(dt);
  explosions = explosions.filter((ex) => !ex.expired);
  if (explosions.length > 40) explosions.splice(0, explosions.length - 40); // particle cap

  for (const sp of spikes) {
    sp.update(dt);
    if (sp.erupting && !sp.hasHit) {
      sp.hasHit = true;
      const radius = sp.wave || 24;
      for (const e of enemies) {
        if (circleHit(sp.x, sp.y, radius, e.x, e.y, e.radius)) {
          if (sp.root > 0) e.applyRoot(sp.root);
          const hit = e.takeDamage(sp.dmg);
          if (hit) sfxHit();
          // 环身重砸强化: i-frames per enemy struck (capped)
          if (hit && sp.invulnPerHit > 0) {
            player.invuln = Math.min(player.invuln + sp.invulnPerHit, 1.5);
            player.activeInvuln = player.invuln; // white pulse, no blink
          }
          // 崩地巨骨强化: enemies killed by the wave explode
          if (hit && sp.deathBlast && e.hp <= 0) {
            spawnBlast({
              x: e.x,
              y: e.y,
              dmg: sp.deathBlast.dmg,
              blast: sp.deathBlast.radius,
              color: "#ff8a8a",
            });
          }
          if (sp.knockback > 0) {
            const dx = e.x - sp.x;
            const dy = e.y - sp.y;
            const d = Math.hypot(dx, dy) || 1;
            e.x += (dx / d) * sp.knockback;
            e.y += (dy / d) * sp.knockback;
          }
        }
      }
      // secondary blast (e.g. 蓝骨禁锢强化)
      if (sp.blast) {
        spawnBlast({
          x: sp.x,
          y: sp.y,
          dmg: sp.blast.dmg,
          blast: sp.blast.radius,
          color: sp.blast.color || "#4f9dff",
          root: sp.blast.root || 0,
        });
      }
      // soundwave / shockwave ring visual
      if (sp.wave) explosions.push(new Explosion(sp.x, sp.y, sp.wave, sp.color, sp.hollow));
    }
  }
  spikes = spikes.filter((sp) => !sp.expired);

  const hpBeforeBoss = player ? player.hp : 0;
  if (bossFight) {
    bossFight.update(dt, {
      player,
      enemies,
      projectiles,
      camX,
      WIDTH,
      HEIGHT,
      WALL_H,
      summon: (n) => {
        const types = ["slime", "bat", "ghost", "tank", "red", "orange", "blue", "purple"];
        for (let i = 0; i < n; i++) {
          if (enemies.length >= 220) break; // same on-screen cap as the spawner
          const ty = types[Math.floor(Math.random() * types.length)];
          const ex = camX + 40 + Math.random() * (WIDTH - 80);
          const ey = WALL_H + 30 + Math.random() * (HEIGHT - WALL_H - 60);
          const e = new Enemy(ty, ex, ey, spawner.scale(false));
          e.noXp = true; // summoned monsters drop nothing
          enemies.push(e);
        }
      },
      dropHeart: (hx, hy) => {
        const heart = new Pickup(hx, hy, "bossheart", {});
        heart.radius = 12;
        pickups.push(heart);
      },
    });
    if (bossFight.done) enemies = enemies.filter((e) => !e.boss);
    // boss attacks apply damage inside bossFight.update — tag them here
    if (player.hp < hpBeforeBoss - 0.001) lastHitBy = "天意侵蚀Sans";
    // debug-only: ?boss=weak keeps phase 2 frail as well (the adaptive
    // formula reads BOSS_HP/p1Time, which explodes when phase 1 is weak)
    if (DEBUG_BOSS === "weak" && bossFight && bossFight.boss.maxHp > 600) {
      bossFight.boss.maxHp = 500;
      bossFight.boss.hp = Math.min(bossFight.boss.hp, 500);
    }
  }

  const dead = enemies.filter((e) => e.hp <= 0 && !e.boss);
  for (const e of dead) {
    player.kills += 1;
    runKillsByType[e.type] = (runKillsByType[e.type] || 0) + 1;
    if (!e.noXp) spawnDrops(e);
    if (e.roundBoss) {
      roundBossDown = true;
      floatingTexts.push(new FloatingText(e.x, e.y - 30, "★ 首领被击败！", "#ffd166"));
    }
    if (e.elite) {
      // elites go out with a bang: shock ring + deep boom
      explosions.push(new Explosion(e.x, e.y, e.radius * 3.4, "#ffd166", true));
      sfxEliteDown();
    }
  }
  enemies = enemies.filter((e) => (e.hp > 0 || e.boss));
  if (dead.length > 0) {
    sfxKill(dead.length);
    // chained kills build the streak; milestones pop the screen
    streak += dead.length;
    runMaxStreak = Math.max(runMaxStreak, streak);
    streakTimer = 1.6;
    while (streak >= nextStreakAt) {
      killFlash = 0.22;
      floatingTexts.push(new FloatingText(player.x, player.y - 44, `${nextStreakAt} 连杀！`, "#ffd166"));
      sfxStreak(streakTier);
      streakTier += 1;
      nextStreakAt = Math.max(nextStreakAt + 5, Math.round((nextStreakAt * 1.5) / 5) * 5);
    }
  } else if (streakTimer > 0) {
    streakTimer -= dt;
    if (streakTimer <= 0) {
      streak = 0;
      nextStreakAt = 10;
      streakTier = 0;
    }
  }

  for (const pu of pickups) {
    pu.update(dt, player, player.magnetRadius);
    if (circleHit(pu.x, pu.y, pu.radius, player.x, player.y, player.radius)) {
      pu.collected = true;
      if (pu.kind === "xp") {
        sfxPickup();
        const levels = player.addXp(pu.data.amount);
        if (levels > 0) onLevelUp(levels);
      } else if (pu.kind === "bossheart") {
        // the judgement is over: freeze the stage result and let the player
        // choose — leave with the loot, or opt into endless
        player.kills += 50; // the boss counts as 50 kills
        runCoins += Math.round(80 * coinGainMult() * getDifficulty().coinMult); // boss bounty
        bossDefeated = true;
        bossFight = null; // hand the field back to the spawner
        stageClearScore = currentScore();
        stageClearTime = elapsed;
        stageClearKills = player.kills;
        bossClearChoice = 0;
        state = "bossclear"; // world pauses behind the choice
        saveSafeProgressCheckpoint(runCoins);
        sfxFanfare();
      } else if (pu.kind === "coin") {
        // in endless the coin rides in the round's pending pot: banked only
        // when the round is survived, lost if the player dies mid-round
        if (endlessRound > 0) {
          roundPendingCoins += pu.data.value;
          queueTipOnce("pending", "本轮待结算金币", [
            "无尽中拾取的金币先进入“待结算”池，完成本轮才真正入账",
            "轮中死亡或暂停退出，将失去当前轮的待结算金币",
          ]);
        } else {
          runCoins += pu.data.value;
        }
        sfxCoin();
      } else {
        pu.data.type.apply(player);
        sfxEquip();
        floatingTexts.push(new FloatingText(player.x, player.y - 26, pu.data.type.label, pu.data.type.color));
      }
    }
  }
  pickups = pickups.filter((pu) => !pu.collected);

  for (const ft of floatingTexts) ft.update(dt);
  floatingTexts = floatingTexts.filter((ft) => !ft.expired);
  if (floatingTexts.length > 48) floatingTexts.splice(0, floatingTexts.length - 48);

  // low-hp heartbeat: thumps while below a quarter health
  if (player.hp > 0 && player.hp / player.maxHp < 0.25) {
    lowHpPulse += dt;
    if (lowHpPulse >= 0.9) {
      lowHpPulse = 0;
      sfxHeartbeat();
    }
  } else {
    lowHpPulse = 0.9; // first thump lands the moment hp drops low
  }

  if (player.hp - hpBefore > 0.9) healFlash = 0.45;
  if (healFlash > 0) healFlash -= dt;
  if (killFlash > 0) killFlash -= dt;
  // one central hurt cue no matter where the damage came from
  if (hpBefore - player.hp > 0.5) sfxHurt();
  // Horror's rage: taking a hit sometimes tints the whole screen red
  if (player.character === "horror" && hpBefore - player.hp > 0.5 && Math.random() < 0.15) {
    hurtFlash = 0.5;
  }
  if (hurtFlash > 0) hurtFlash -= dt;

  if (player.hp <= 0) {
    if (player.revives > 0) {
      // 重燃决心: one dramatic comeback, crowd shoved away
      player.revives -= 1;
      player.hp = Math.ceil(player.maxHp / 2);
      player.invuln = 2.5;
      player.activeInvuln = 2.5;
      for (const e of enemies) {
        if (e.boss) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 240) {
          e.x = player.x + (dx / d) * 280;
          e.y = clamp(player.y + (dy / d) * 280, WALL_H + 20, HEIGHT - 20);
        }
      }
      explosions.push(new Explosion(player.x, player.y, 200, "#ffffff", true));
      floatingTexts.push(new FloatingText(player.x, player.y - 40, "★ 决心重燃！", "#ffffff"));
      killFlash = 0.3;
      sfxFanfare();
    } else {
      settleGame();
    }
  }
}

// ---- draw -------------------------------------------------------------

// one giant hall column: only its lower half is visible — the top runs
// off-screen so the player never sees a full column
function drawColumn(x, baseY) {
  const w = 54;
  ctx.strokeStyle = "rgba(150, 168, 214, 0.42)";
  ctx.lineWidth = 2;
  // shaft, starting above the screen
  ctx.strokeRect(x - w / 2, -10, w, baseY - 18 + 10);
  for (let i = 1; i <= 4; i++) {
    const fx = x - w / 2 + (w * i) / 5;
    ctx.beginPath();
    ctx.moveTo(fx, -10);
    ctx.lineTo(fx, baseY - 18);
    ctx.stroke();
  }
  // base blocks
  ctx.strokeRect(x - w / 2 - 7, baseY - 18, w + 14, 8);
  ctx.strokeRect(x - w / 2 - 13, baseY - 10, w + 26, 10);
}

function drawBackground() {
  ctx.fillStyle = "#0e0b16";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // top wall band: unreachable, slightly raised tone
  ctx.fillStyle = "#131020";
  ctx.fillRect(0, 0, WIDTH, WALL_H);

  // giant columns move in lockstep with the world (no parallax)
  const spacing = 240;
  const off = camX;
  const first = Math.floor((off - 120) / spacing) * spacing;
  for (let wx = first; wx < off + WIDTH + 120; wx += spacing) {
    drawColumn(wx - off, WALL_H);
  }
  // wall edge the play area stops at
  ctx.strokeStyle = "rgba(150, 168, 214, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, WALL_H);
  ctx.lineTo(WIDTH, WALL_H);
  ctx.stroke();

  // floor grid scrolling at full speed with the camera
  ctx.strokeStyle = "rgba(242,234,216,0.05)";
  ctx.lineWidth = 1;
  const grid = 40;
  const gx0 = -((camX % grid) + grid) % grid;
  for (let x = gx0; x < WIDTH; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

function drawBone(cx, cy, size, angle, sprite = null) {
  sprite ||= skinnedBone(); // bone-skin cosmetic tints the default white bone
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function spikeBoneSprite(sp) {
  if (sp.color === "#ff5d5d" || sp.color === "#ff8a8a") return PROJECTILE_BONE_RED;
  if (sp.root > 0) return PROJECTILE_BONE_BLUE;
  if (sp.wave || sp.color === "#c59bff") return PROJECTILE_BONE_PURPLE;
  return skinnedBone();
}

function draw() {
  drawBackground();

  ctx.save();
  ctx.translate(-camX, 0); // world space from here

  for (const pu of pickups) {
    if (pu.kind === "bossheart") {
      ctx.save();
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 24;
      drawSprite(ctx, PICKUP_XP, pu.x, pu.y, 26);
      ctx.restore();
      continue;
    }
    if (pu.kind === "coin") {
      // gold coin: disc + rim + a little shine, no sprite needed
      ctx.save();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#a97b1e";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.arc(pu.x - 1.7, pu.y - 1.7, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    const sprite = pu.kind === "xp" ? PICKUP_XP : pu.data.type.sprite;
    if (pu.kind !== "xp") {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = pu.data.type.color;
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawSprite(ctx, sprite, pu.x, pu.y, pu.kind === "xp" ? 13 : 18);
  }

  for (const ex of explosions) {
    const t = 1 - ex.life / ex.maxLife;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius * (0.5 + t * 0.5), 0, Math.PI * 2);
    if (!ex.hollow) {
      ctx.globalAlpha = (ex.life / ex.maxLife) * 0.7;
      ctx.fillStyle = ex.color;
      ctx.fill();
    }
    ctx.globalAlpha = ex.life / ex.maxLife;
    ctx.strokeStyle = ex.color;
    ctx.lineWidth = ex.hollow ? 4 : 3;
    ctx.stroke();
    ctx.restore();
  }

  for (const sp of spikes) {
    if (!sp.erupting) {
      const t = sp.t / sp.delay;
      if (sp.fall) {
        // soundwave bone dropping from the sky
        ctx.save();
        ctx.globalAlpha = 0.5 + t * 0.5;
        drawBone(sp.x, sp.y - (1 - t) * 140, sp.boneSize, Math.PI / 2, spikeBoneSprite(sp));
        ctx.restore();
      }
      // telegraph: growing warning ring on the ground
      ctx.save();
      ctx.globalAlpha = 0.35 + t * 0.3;
      ctx.strokeStyle = sp.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 16 * t + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (sp.noBone) {
      // shockwave-only spikes draw nothing here (the wave ring is enough)
    } else if (sp.fall) {
      // landed soundwave bone stays planted and fades out with the ring
      const p = (sp.t - sp.delay) / (sp.duration - sp.delay);
      ctx.save();
      ctx.globalAlpha = 1 - p * 0.7;
      drawBone(sp.x, sp.y - sp.boneSize * 0.25, sp.boneSize, -Math.PI / 2, spikeBoneSprite(sp));
      ctx.restore();
    } else {
      const p = (sp.t - sp.delay) / (sp.duration - sp.delay);
      const pop = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) * 0.35;
      const base = sp.axe || sp.boneSize > 22 ? sp.boneSize : 30;
      const size = base * pop;
      ctx.save();
      ctx.globalAlpha = Math.min(1, 2 - p * 2);
      if (sp.axe) {
        ctx.translate(sp.x, sp.y - size * 0.3);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(PROJECTILE_AXE, -size / 2, -size / 2, size, size);
      } else {
        drawBone(sp.x, sp.y - size * 0.3, size, -Math.PI / 2, spikeBoneSprite(sp));
      }
      ctx.restore();
    }
  }

  // round 4+ danger zones: pulsing red telegraph before the blast
  for (const hz of hazards) {
    const t = 1 - hz.t / 1.15;
    ctx.save();
    ctx.strokeStyle = "#ff5d5d";
    ctx.globalAlpha = 0.35 + t * 0.55;
    ctx.lineWidth = 2 + t * 2;
    ctx.beginPath();
    ctx.arc(hz.x, hz.y, 75 * (0.5 + t * 0.5), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.10 + t * 0.14;
    ctx.fillStyle = "#ff5d5d";
    ctx.fill();
    ctx.restore();
  }

  // teleporter marks (drawn under everything else)
  for (const e of enemies) {
    if (!e.mark) continue;
    const t = 1 - e.mark.t; // 0 -> 1 as the strike approaches
    ctx.save();
    ctx.strokeStyle = "#c95df0";
    ctx.globalAlpha = 0.5 + t * 0.5;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.mark.x, e.mark.y, 30 * (1 - t * 0.6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.mark.x - 8, e.mark.y - 8);
    ctx.lineTo(e.mark.x + 8, e.mark.y + 8);
    ctx.moveTo(e.mark.x + 8, e.mark.y - 8);
    ctx.lineTo(e.mark.x - 8, e.mark.y + 8);
    ctx.stroke();
    ctx.restore();
  }

  for (const e of enemies) {
    if (e.boss) continue; // the boss draws itself
    if (e.elite) {
      ctx.save();
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      // round champion: an extra pulsing ring marks the kill target
      if (e.roundBoss) {
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(elapsed * 6);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    // extended attack range ring (blue enemy)
    if (e.attackRange > e.radius) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#7cc4ff";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.attackRange, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#7cc4ff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    const flicker = e.invulnTimer > 0;
    if (flicker) {
      ctx.save();
      ctx.globalAlpha = 0.45 + 0.2 * Math.sin(elapsed * 25);
    }
    // per-sprite render scale: tall/wide extracted sprites need tuning
    const spriteScale = { bat: 2.2, tank: 3.2, ghost: 2.9, blue: 2.8, red: 2.7, purple: 2.7, orange: 3.0 }[e.sprite] || 2.6;
    drawSprite(ctx, ENEMY_SPRITES[e.sprite], e.x, e.y, e.radius * spriteScale);
    if (flicker) ctx.restore();
    // root-immunity: small grey broken ring (diminishing returns active)
    if (e.rootImmune > 0 && e.rootTimer <= 0) {
      ctx.save();
      ctx.strokeStyle = "#8d8798";
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y - e.radius - 10, 4, 0.6, Math.PI * 2 - 0.6);
      ctx.stroke();
      ctx.restore();
    }
    // 禁锢: blue shackle ring around rooted enemies
    if (e.rootTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "#4f9dff";
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y + e.radius * 0.4, e.radius * 1.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(e.x, e.y + e.radius * 0.4, e.radius * 1.5, 0.3, Math.PI - 0.3);
      ctx.stroke();
      ctx.restore();
    }
    // madjick's magic orbs: one orbiting orb per spare life
    if (e.maxLives > 1) {
      const orbs = e.lives - 1;
      for (let i = 0; i < orbs; i++) {
        const a = elapsed * 2.4 + (i / Math.max(orbs, 1)) * Math.PI * 2;
        const ox = e.x + Math.cos(a) * (e.radius + 13);
        const oy = e.y + Math.sin(a) * (e.radius + 13) * 0.45 - 6;
        // cheap two-circle glow (shadowBlur murders mobile framerates)
        ctx.save();
        ctx.fillStyle = "rgba(155, 215, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e8f4ff";
        ctx.beginPath();
        ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    if (e.hitFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = e.hitFlash * 2;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (e.hp < e.maxHp) {
      const w = e.radius * 2;
      ctx.fillStyle = "#241f2b";
      ctx.fillRect(e.x - w / 2, e.y - e.radius - 8, w, 3);
      ctx.fillStyle = "#7cf28a";
      ctx.fillRect(e.x - w / 2, e.y - e.radius - 8, w * Math.max(0, e.hp / e.maxHp), 3);
    }
  }

  for (const p of projectiles) {
    const angle = Math.atan2(p.vy, p.vx);
    // big projectiles that die on their own fade out instead of popping
    const bigFade =
      Number.isFinite(p.maxRange) && p.size >= 12
        ? Math.max(0, Math.min(1, (p.maxRange - p.traveled) / 60))
        : 1;
    if (bigFade < 1) {
      ctx.save();
      ctx.globalAlpha = bigFade;
    }
    if (p.axe) {
      // spinning thrown axe
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.traveled * 0.045);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(PROJECTILE_AXE, -p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    } else if (p.boom) {
      // boomerang spins as it flies
      drawBone(p.x, p.y, p.size, p.traveled * 0.06);
    } else if (p.beam) {
      // elongated spear so the pierce weapon reads differently
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(skinnedBone(), -p.size * 1.8, -p.size / 2, p.size * 3.6, p.size);
      ctx.restore();
    } else if (p.orb) {
      // hollow dark-blue ring with a glowing outer halo
      ctx.save();
      ctx.strokeStyle = "#2f6ea8";
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = "#7cd0ff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#7cd0ff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      const boneSprite = p.blue
        ? PROJECTILE_BONE_BLUE
        : p.red
          ? PROJECTILE_BONE_RED
          : p.purple
            ? PROJECTILE_BONE_PURPLE
            : PROJECTILE_BONE;
      // hovering mother bones rattle right before they burst
      const jx = p.splitInfo && p.hovering && !p.didSplit ? Math.sin(p.age * 55) * 2.5 : 0;
      drawBone(p.x + jx, p.y, p.size, angle, boneSprite);
    }
    if (bigFade < 1) ctx.restore();
  }

  for (const b of bombs) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + 6, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawBone(b.x, b.y - b.arcOffset, 14, b.spin);
  }

  if (state === "playing" || state === "paused" || state === "choice") {
    for (const inst of player.weapons) {
      if (inst.id === "orbit") {
        for (const bone of getOrbitBones(player, inst)) {
          drawBone(bone.x, bone.y, bone.size, bone.angle + Math.PI / 2);
        }
      } else if (inst.id === "orbitburst") {
        for (const bone of getBurstBones(player, inst)) {
          drawBone(bone.x, bone.y, bone.size, bone.angle + Math.PI / 2, PROJECTILE_BONE_PURPLE);
        }
      } else if (inst.id === "dash") {
        const d = getDashInfo(inst);
        if (d) {
          ctx.save();
          ctx.strokeStyle = "rgba(93, 185, 255, 0.4)";
          ctx.lineWidth = 9;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(d.fx, d.fy);
          ctx.lineTo(player.x, player.y);
          ctx.stroke();
          ctx.restore();
        }
      } else if (inst.id === "megabone") {
        const m = getMegaBone(player, inst);
        if (m && m.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = m.alpha;
          drawBone(m.x, m.y, m.size, -Math.PI / 2);
          ctx.restore();
        }
      } else if (inst.id === "gaster") {
        const g = getGBState(player, inst);
        if (g) {
          for (const b of g.blasters) {
            if (b.beam) {
              ctx.save();
              ctx.lineCap = "round";
              ctx.strokeStyle = "rgba(253, 222, 254, 0.35)";
              ctx.lineWidth = b.beam.width + 10;
              ctx.beginPath();
              ctx.moveTo(b.beam.x1, b.beam.y1);
              ctx.lineTo(b.beam.x2, b.beam.y2);
              ctx.stroke();
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = b.beam.width * 0.55;
              ctx.beginPath();
              ctx.moveTo(b.beam.x1, b.beam.y1);
              ctx.lineTo(b.beam.x2, b.beam.y2);
              ctx.stroke();
              ctx.restore();
            }
            ctx.save();
            ctx.globalAlpha = b.alpha;
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle - Math.PI / 2 + (b.extraRot || 0)); // spin-in
            ctx.imageSmoothingEnabled = false;
            const spr = b.firing ? GB_FIRE : GB_IDLE;
            const gw = 48 * (b.sizeMult || 1);
            const gh = (spr.height / spr.width) * gw;
            ctx.drawImage(spr, -gw / 2, -gh / 2, gw, gh);
            ctx.restore();
          }
        }
      } else if (inst.id === "ringlaser") {
        for (const fx of getRingFx(inst)) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - fx.t / 0.14) * 0.9;
          ctx.strokeStyle = "#8fd6ff";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(fx.x1, fx.y1);
          ctx.lineTo(fx.x2, fx.y2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (inst.id === "turret") {
        for (const b of getTurretBones(player, inst)) {
          drawBone(b.x, b.y, 22, b.angle);
        }
      } else if (inst.id === "sweep") {
        const bone = getSweepBone(player, inst);
        if (bone) {
          // a proper bone: wide shaft with flat end caps, anchored at the
          // player, one end pointing at them, rotating like a clock hand
          const L = bone.radius * 0.8;
          const bw = 26;
          const drawSweep = (ang, alpha) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(player.x, player.y);
            ctx.rotate(ang);
            // shaft
            ctx.fillStyle = "#e89a9a";
            ctx.fillRect(12, -bw / 2 + 5, L - 24, bw - 10);
            // flat end caps at both ends
            ctx.fillRect(6, -bw / 2, 9, bw);
            ctx.fillRect(L - 15, -bw / 2, 9, bw);
            // cap notches so the ends read as bone knobs
            ctx.fillStyle = "#b96a6a";
            ctx.fillRect(6, -1, 9, 2);
            ctx.fillRect(L - 15, -1, 9, 2);
            ctx.restore();
          };
          // motion trail behind the swing direction (oldest first, faintest)
          for (let k = 3; k >= 1; k--) {
            drawSweep(bone.angle - bone.dir * 0.17 * k, bone.alpha * (0.4 - 0.1 * k));
          }
          drawSweep(bone.angle, bone.alpha);
        }
      } else if (inst.id === "lasso") {
        const axe = getLassoAxe(inst);
        if (axe) {
          ctx.save();
          ctx.translate(axe.x, axe.y);
          ctx.rotate(axe.angle);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(PROJECTILE_AXE, -axe.size / 2, -axe.size / 2, axe.size, axe.size);
          ctx.restore();
        }
      } else if (inst.id === "cleave") {
        for (const swing of getCleaveSwings(player, inst)) {
          ctx.save();
          ctx.globalAlpha = swing.alpha;
          ctx.translate(swing.x, swing.y);
          ctx.rotate(swing.rot);
          if (swing.flip) ctx.scale(-1, 1); // blade side leads on right chops
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(PROJECTILE_AXE, -swing.size / 2, -swing.size / 2, swing.size, swing.size);
          ctx.restore();
        }
      } else if (inst.id === "laser" || inst.id === "plaser") {
        const beams = inst.id === "laser" ? getLaserBeams(player, inst) : getPlaserBeams(player, inst);
        const glow = inst.id === "laser" ? "rgba(155, 215, 255, 0.28)" : "rgba(201, 93, 240, 0.3)";
        const core = inst.id === "laser" ? "#e3f4ff" : "#eeccff";
        for (const beam of beams) {
          ctx.save();
          ctx.lineCap = "round";
          ctx.strokeStyle = glow;
          ctx.lineWidth = beam.width + 8;
          ctx.beginPath();
          ctx.moveTo(beam.x1, beam.y1);
          ctx.lineTo(beam.x2, beam.y2);
          ctx.stroke();
          ctx.strokeStyle = core;
          ctx.lineWidth = beam.width * 0.45;
          ctx.beginPath();
          ctx.moveTo(beam.x1, beam.y1);
          ctx.lineTo(beam.x2, beam.y2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (inst.id === "chain") {
        for (const c of inst.chainTargets) {
          ctx.save();
          ctx.strokeStyle = "#b8a5d0";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(player.x, player.y);
          ctx.lineTo(c.e.x, c.e.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    // 紫魂护盾 ring
    if (player.shieldTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.1 * Math.sin(elapsed * 12);
      ctx.fillStyle = "#9a5df0";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#c59bff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 荆棘之躯: red contact-damage aura
  if (player.thorns > 0 && (state === "playing" || state === "paused" || state === "choice")) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#ff3b3b";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#ff3b3b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // hit invuln blinks; active (slam-enhance) invuln glows white instead
  const activeInv = player.activeInvuln > 0;
  const flickerHidden = player.invuln > 0 && !activeInv && Math.floor(player.invuln * 16) % 2 === 0;
  if (!flickerHidden) {
    const set = WALK_SETS[player.character] || WALK_SETS.sans;
    const frames = set[player.dir] || set.down;
    // 4-frame cycle like the sheet: stand, step, stand, other step
    const frame = player.moving ? frames[Math.floor(player.walkTime * 7) % 4] : frames[0];
    // dash afterimages: fading blue-tinted ghosts along the dash path
    for (const inst of player.weapons) {
      if (inst.id !== "dash") continue;
      const dInfo = getDashInfo(inst);
      if (!dInfo || !dInfo.trail) continue;
      for (const tr of dInfo.trail) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - tr.t / 0.22) * 0.3;
        ctx.shadowColor = "#5db9ff";
        ctx.shadowBlur = 10;
        drawSprite(ctx, frame, tr.x, tr.y, player.radius * 4.4);
        ctx.restore();
      }
    }
    // 灵魂加护 cosmetic: fading heart trail + soul-colored glow
    const soulEq = equippedCosmetic();
    if (soulEq) {
      for (const s of soulTrail) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - s.t / 0.6) * 0.55;
        drawSprite(ctx, soulHeartSprite(soulEq.color), s.x, s.y, 9 + s.t * 6);
        ctx.restore();
      }
    }
    ctx.save();
    if (soulEq) {
      ctx.shadowColor = soulEq.color;
      ctx.shadowBlur = 18;
    } else if (CHAR_GLOWS[player.character]) {
      ctx.shadowColor = CHAR_GLOWS[player.character];
      ctx.shadowBlur = 16;
    }
    if (activeInv) {
      // whitening pulse while the earned i-frames last
      ctx.filter = `brightness(${2.2 + Math.sin(elapsed * 25) * 0.8})`;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 12;
    }
    drawSprite(ctx, frame, player.x, player.y, player.radius * 4.4);
    ctx.restore();
  }

  ctx.textAlign = "center";
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
    ctx.fillStyle = ft.color;
    ctx.font = "bold 14px monospace";
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
  ctx.textAlign = "left";

  if (bossFight) bossFight.draw(ctx);

  ctx.restore(); // back to screen space for the HUD and overlays

  if (hurtFlash > 0 && (state === "playing" || state === "choice")) {
    ctx.save();
    ctx.fillStyle = `rgba(214, 40, 40, ${(hurtFlash / 0.5) * 0.45})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  // low-hp danger: dark red edges pulsing with the heartbeat
  if (player.hp > 0 && player.hp / player.maxHp < 0.25 && (state === "playing" || state === "choice")) {
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 7);
    ctx.save();
    const grad = ctx.createRadialGradient(
      WIDTH / 2, HEIGHT / 2, HEIGHT * 0.42,
      WIDTH / 2, HEIGHT / 2, HEIGHT * 0.8
    );
    grad.addColorStop(0, "rgba(140, 10, 10, 0)");
    grad.addColorStop(1, `rgba(140, 10, 10, ${0.18 + pulse * 0.14})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  // one-time onboarding tip card (top center, under the HUD)
  if (activeTip && (state === "playing" || state === "choice")) {
    const a = Math.min(1, activeTip.t / 0.8);
    const w = 640;
    const h = 34 + activeTip.lines.length * 18;
    const x = WIDTH / 2 - w / 2;
    const y = 96;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10, 8, 16, 0.92)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`💡 ${activeTip.title}`, WIDTH / 2, y + 20);
    ctx.fillStyle = "#e8e2d4";
    ctx.font = "12px monospace";
    activeTip.lines.forEach((line, i) => {
      ctx.fillText(line, WIDTH / 2, y + 40 + i * 18);
    });
    ctx.restore();
    ctx.textAlign = "left";
  }

  // endless round banner: loud full-screen announcement + red pulse
  if (roundBanner && (state === "playing" || state === "choice")) {
    const a = Math.min(1, roundBanner.t / 0.6);
    ctx.save();
    ctx.fillStyle = `rgba(200, 30, 30, ${0.14 * a})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.globalAlpha = a;
    ctx.fillStyle = "#ff8a5d";
    ctx.font = "bold 34px monospace";
    ctx.fillText(roundBanner.text, WIDTH / 2, HEIGHT / 2 - 90);
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#f2ead8";
    ctx.fillText(roundBanner.sub, WIDTH / 2, HEIGHT / 2 - 62);
    ctx.restore();
    ctx.textAlign = "left";
  }

  // kill-streak milestone: quick white pop over the whole screen
  if (killFlash > 0 && (state === "playing" || state === "choice")) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${(killFlash / 0.22) * 0.2})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  // boss warning: pulsing red vignette + countdown while the music ducks
  if (bossWarnActive() && (state === "playing" || state === "choice" || state === "paused")) {
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 5);
    ctx.save();
    const grad = ctx.createRadialGradient(
      WIDTH / 2, HEIGHT / 2, HEIGHT * 0.35,
      WIDTH / 2, HEIGHT / 2, HEIGHT * 0.85
    );
    grad.addColorStop(0, "rgba(200, 30, 30, 0)");
    grad.addColorStop(1, `rgba(200, 30, 30, ${0.14 + pulse * 0.14})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.55 + pulse * 0.45;
    ctx.fillStyle = "#ff5d5d";
    ctx.font = "bold 20px monospace";
    ctx.fillText("※ 一股可怕的气息正在逼近……", WIDTH / 2, WALL_H + 46);
    ctx.font = "bold 15px monospace";
    ctx.fillText(`${Math.max(1, Math.ceil(BOSS_APPEAR_TIME - elapsed))} 秒`, WIDTH / 2, WALL_H + 70);
    ctx.restore();
    ctx.textAlign = "left";
  }

  drawHud(ctx, WIDTH, player, elapsed, weaponSummary(player), healFlash);
  // run coins, top-right under the kill counter
  if (state === "playing" || state === "paused" || state === "choice") {
    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffd166";
    ctx.font = "12px monospace";
    ctx.fillText(`ⓖ ${runCoins}`, WIDTH - 16, 68);
    if (endlessRound > 0) {
      ctx.fillStyle = "#ff8a5d";
      const clock =
        roundTimer > 0
          ? `剩余 ${Math.ceil(roundTimer)}s`
          : roundBossDown
            ? "完成"
            : "消灭首领！";
      ctx.fillText(`⚖ 审判第 ${endlessRound} 轮 · ${clock}`, WIDTH - 16, 86);
      const cf = currentCoinFactor();
      ctx.fillStyle = cf > 0 ? "#ffd166" : "#8d8798";
      ctx.fillText(cf > 0 ? `金币收益 ${Math.round(cf * 100)}%` : "金币收益已停止", WIDTH - 16, 104);
      ctx.fillStyle = "#ffd166";
      ctx.fillText(`本轮待结算 ⓖ ${roundPendingCoins}`, WIDTH - 16, 122);
    }
    if (dailyMode) {
      ctx.fillStyle = "#c59bff";
      ctx.fillText("✦ 每日挑战", WIDTH - 16, endlessRound > 0 ? 140 : 86);
    }
    ctx.restore();
    ctx.textAlign = "left";
  }
  // live kill-streak counter: grows with the streak, pops on fresh kills
  if (streak >= 5 && (state === "playing" || state === "choice")) {
    const pop = 1 + Math.max(0, streakTimer - 1.35) * 1.6;
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = streakTier >= 3 ? "#ff8a5d" : "#ffd166";
    ctx.font = `bold ${Math.round((15 + Math.min(streak, 80) * 0.08) * pop)}px monospace`;
    ctx.fillText(`${streak} 连杀`, WIDTH / 2, 82);
    ctx.restore();
    ctx.textAlign = "left";
  }
  if (bossFight) bossFight.drawOverlay(ctx);
  if (state === "playing" || state === "paused" || state === "choice") {
    drawSpeedButton(ctx, WIDTH, timeScale);
    drawPauseButton(ctx, WIDTH, state === "paused");
  }
  if (state === "playing") drawJoystick(ctx, getJoystick());

  // black-screen intro — drawn under the menus so the pause screen still shows
  if (introBlack > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, introBlack / 1.0)})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  if (state === "title") {
    drawTitleScreen(ctx, WIDTH, HEIGHT, [PLAYER_SPRITES.sans], getCoins(), codexCompletion());
  } else if (state === "shop") {
    drawShopScreen(
      ctx,
      WIDTH,
      HEIGHT,
      shopItems(),
      getCoins(),
      shopTab,
      COSMETICS.map((c) => ({
        ...c,
        owned: cosmeticOwned(c.id),
        equipped: equippedCosmetic()?.id === c.id,
      }))
    );
  } else if (state === "codex") {
    const st = getStats();
    const monsters = Object.keys(ENEMY_NAMES).map((t) => ({
      name: ENEMY_NAMES[t],
      sprite: ENEMY_SPRITES[t],
      kills: st.killsByType[t] || 0,
    }));
    const weaponRows = CHARACTERS.map((c) => {
      const list = WEAPON_LISTS[c.id];
      return {
        charName: c.name,
        color: c.color,
        used: list.filter((w) => st.weaponsUsed[w.id]).length,
        total: list.length,
        evolved: list.filter((w) => w.evolve && st.evolved[w.id]).length,
        evoTotal: list.filter((w) => w.evolve).length,
      };
    });
    drawCodexScreen(ctx, WIDTH, HEIGHT, monsters, st.bossKills, weaponRows, codexCompletion());
  } else if (state === "charselect") {
    drawCharSelect(
      ctx,
      WIDTH,
      HEIGHT,
      CHARACTERS,
      selectedChar,
      PLAYER_SPRITES,
      Object.fromEntries(CHARACTERS.map((c) => [c.id, bestScoreOf(c.id)])),
      charLocks(),
      diffPills()
    );
  } else if (state === "select") {
    drawWeaponSelect(ctx, WIDTH, HEIGHT, currentWeaponList(), selectedWeapon, currentCharacter().name, weaponLocks());
  } else if (state === "paused") {
    drawCenterText(
      ctx,
      WIDTH,
      HEIGHT,
      [
        { text: "已 暂 停", font: "bold 32px monospace", color: "#8fd6ff" },
        { text: "按 Z 继续", font: "16px monospace", color: "#ffd166" },
        {
          text: `本局 ${Math.floor(elapsed)}s · 击杀 ${player.kills} · 最高连杀 ${runMaxStreak} · 得分 ${currentScore()}`,
          font: "13px monospace",
          color: "#9a93ab",
        },
      ],
      -100 // keep clear of the volume control below
    );
    drawVolumeControl(ctx, WIDTH, HEIGHT, bgmVolume, sfxVolume);
    drawResumeButton(ctx, WIDTH, HEIGHT);
    drawQuitButton(ctx, WIDTH, HEIGHT);
  } else if (state === "choice") {
    drawChoiceScreen(ctx, WIDTH, HEIGHT, choiceOptions, choiceRerollsLeft);
  } else if (state === "bossclear") {
    drawBossClearScreen(ctx, WIDTH, HEIGHT, bossClearChoice);
  } else if (state === "roundclear") {
    drawRoundClearScreen(ctx, WIDTH, HEIGHT, endlessRound, bossClearChoice, roundPendingCoins);
  } else if (state === "gameover") {
    const title =
      runOutcome === "victory"
        ? { text: "通关成功！", font: "bold 32px monospace", color: "#7cf28a" }
        : runOutcome === "endlessDeath"
          ? { text: "无尽终局", font: "bold 32px monospace", color: "#ff8a5d" }
          : runOutcome === "retreat"
            ? { text: "主动撤离", font: "bold 32px monospace", color: "#8fd6ff" }
            : { text: "GAME OVER", font: "bold 32px monospace", color: "#ff5d73" };
    drawCenterText(ctx, WIDTH, HEIGHT, [
      title,
      ...(lastDeathBy && runOutcome !== "retreat"
        ? [{ text: `死于:${lastDeathBy}`, font: "14px monospace", color: "#c95d5d" }]
        : []),
      { text: `${bossDefeated ? "通关得分" : "得分"} ${lastScore}`, font: "bold 24px monospace", color: "#ffd166" },
      {
        text: newRecord ? "★ 新纪录！" : `历史最高 ${lastBest}`,
        font: "14px monospace",
        color: newRecord ? "#7cf28a" : "#9a93ab",
      },
      ...(endlessResult
        ? [
            {
              text: `完成审判 ${endlessResult.rounds} 轮 · 无尽存活 ${endlessResult.time} 秒 · 无尽新增击杀 ${endlessResult.kills}`,
              font: "14px monospace",
              color: "#ff8a5d",
            },
            {
              text: `无尽得分 ${endlessResult.score}  历史最佳 ${endlessResult.best}${endlessResult.newBest ? " ★新纪录！" : ""}`,
              font: "14px monospace",
              color: endlessResult.newBest ? "#7cf28a" : "#ff8a5d",
            },
            {
              text: `最高审判轮数 ${endlessResult.bestRound}${endlessResult.newBestRound ? " ★新纪录！" : ""}`,
              font: "14px monospace",
              color: endlessResult.newBestRound ? "#7cf28a" : "#ff8a5d",
            },
          ]
        : []),
      {
        text: `存活时间 ${Math.floor(bossDefeated ? stageClearTime : elapsed)} 秒${bossDefeated ? " · ★击败Boss" : ""}`,
        font: "16px monospace",
      },
      { text: `击杀数 ${player.kills}  最高连杀 ${runMaxStreak}  等级 ${player.level}`, font: "16px monospace" },
      { text: `金币 +${lastRunCoins}  (钱包 ${getCoins()} · 标题页可进强化商店)`, font: "14px monospace", color: "#ffd166" },
      ...(bestTitle() ? [{ text: `称号:「${bestTitle().name}」`, font: "13px monospace", color: "#c59bff" }] : []),
      ...(runOutcome === "victory" && getDifficulty().id < 2
        ? [{ text: "⚠ 觉得太简单？选人页可切换 狂暴/地狱 难度,金币加成更高", font: "13px monospace", color: "#ff8a5d" }]
        : []),
      ...lastNewTitles.map((n) => ({ text: `★ 新称号解锁:「${n}」`, font: "13px monospace", color: "#7cf28a" })),
      ...(wasDaily
        ? [
            {
              text: `✦ 每日挑战 ${todayKey()} · 今日最佳 ${dailyBestToday}${dailyNewBest ? " (新纪录!)" : ""}`,
              font: "14px monospace",
              color: "#c59bff",
            },
          ]
        : []),
      { text: weaponSummary(player), font: "14px monospace", color: "#7ea8ff" },
      { text: "点击画面 或 按空格 返回角色选择", font: "16px monospace", color: "#ffd166" },
    ]);
  }
  // UT-style soul shatter: black cover, the soul cracks, pieces fly, fade out
  if (deathShatter && state === "gameover" && deathShatter.t < 2.0) {
    const t = deathShatter.t;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2 - 30;
    ctx.save();
    ctx.globalAlpha = t < 1.2 ? 1 : Math.max(0, 1 - (t - 1.2) / 0.8);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const heart = soulHeartSprite(deathShatter.color);
    if (t < 0.7) {
      // the soul holds... then starts to tremble
      const jx = t > 0.4 ? Math.sin(t * 90) * 2.5 : 0;
      drawSprite(ctx, heart, cx + jx, cy, 46 + Math.sin(t * 6) * 2);
    } else {
      // crack! pieces scatter with a little gravity
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + (i % 3) * 0.35;
        const d = (t - 0.7) * 240;
        const px = cx + Math.cos(ang) * d;
        const py = cy + Math.sin(ang) * d * 0.7 + 150 * (t - 0.7) * (t - 0.7);
        ctx.globalAlpha *= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(ctx.globalAlpha, Math.max(0, 1 - (t - 0.7) / 1.1));
        drawSprite(ctx, heart, px, py, 13);
        ctx.restore();
      }
    }
    ctx.restore();
  }
  if (state === "credits") {
    drawCenterText(ctx, WIDTH, HEIGHT, [
      { text: "制 作 名 单", font: "bold 30px monospace", color: "#7ea8ff" },
      { text: "", font: "10px monospace" },
      { text: "贴图模版: Toby Fox", font: "16px monospace", color: "#f2ead8" },
      { text: "音乐: Toby Fox / Soda Noodles / Franderman123", font: "16px monospace", color: "#f2ead8" },
      { text: "游戏制作: 26", font: "16px monospace", color: "#f2ead8" },
      { text: "", font: "10px monospace" },
      { text: "点击画面 或 按空格 返回", font: "14px monospace", color: "#ffd166" },
    ]);
  }
}

// debug probe (dev only)
window.__dbg = () => ({
  state,
  elapsed: Math.round(elapsed * 10) / 10,
  introBlack: Math.round(introBlack * 100) / 100,
  boss: bossFight ? bossFight.state + "/" + bossFight.step : null,
  bossHp: bossFight ? bossFight.boss.hp : null,
  bossX: bossFight ? Math.round(bossFight.boss.x) : null,
  bossY: bossFight ? Math.round(bossFight.boss.y) : null,
  hp: player ? Math.round(player.hp) : null,
  px: player ? Math.round(player.x) : null,
  camX: Math.round(camX),
  enemies: enemies.length,
  kills: player ? player.kills : 0,
  streak,
  deathBy: lastDeathBy,
  warn: bossWarnActive(),
  choices: choiceOptions.map((o) => o.title),
  runCoins,
  lastRunCoins,
  wallet: getCoins(),
  endless: spawner ? spawner.endless : false,
  bossDefeated,
  daily: dailyMode,
  py: player ? Math.round(player.y) : null,
  heart: (() => {
    const h = pickups && pickups.find((p) => p.kind === "bossheart");
    return h ? { x: Math.round(h.x), y: Math.round(h.y) } : null;
  })(),
  outcome: runOutcome,
  stageScore: stageClearScore,
  round: endlessRound,
  roundTimer: Math.round(roundTimer * 10) / 10,
  roundBossAlive: roundBossSpawned && !roundBossDown,
  pending: roundPendingCoins,
  roundsCleared,
  bestEndlessRound: player ? bestEndlessRoundOf(player.character) : 0,
  coinFactor: currentCoinFactor(),
  tip: activeTip ? activeTip.title : null,
});
window.__test = DEBUG_BOSS !== null
  ? {
      grantPendingCoins(amount) {
        if (endlessRound > 0) roundPendingCoins += Math.max(0, Math.round(amount));
      },
      forceDeath() {
        player.revives = 0;
        player.regen = 0;
        player.invuln = 999; // prevent another hit in this frame from replacing the test cause
        lastHitBy = "测试伤害";
        player.hp = 0;
      },
    }
  : null;
window.addEventListener("error", (e) => { window.__lastErr = e.message + " @ " + e.filename + ":" + e.lineno; });

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;

  // crossfade the menu theme and the battle music
  const inMenu = MENU_STATES.has(state);
  fadeAudio(menuBgm, inMenu ? bgmVolume : 0, dt, 0.9);
  if (state === "paused") {
    if (!bgm.paused) bgm.pause();
  } else if (bgm.src && (state === "playing" || state === "choice")) {
    // the music ducks during the boss warning so the siren reads clearly
    fadeAudio(bgm, gameVolTarget() * (bossWarnActive() ? 0.25 : 1), dt, 1.1);
  } else {
    fadeAudio(bgm, 0, dt, 1.5); // gameover / back to menu
  }

  if (deathShatter && state === "gameover") deathShatter.t += dt;
  setMovementEnabled(state === "playing" && introBlack <= 0);
  if (introBlack > 0) {
    introBlack -= dt; // hold the world frozen behind the black screen
  } else {
    // run the simulation timeScale times per frame so cooldowns, timers,
    // enemies and the player all speed up together without physics tunneling
    for (let i = 0; i < timeScale && state === "playing"; i++) update(dt);
  }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
