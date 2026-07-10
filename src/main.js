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
import { ECHOES, CHAR_ECHOES, ALL_ECHOES, ECHO_BUD, ECHO_BLOOM, echoUnlocked, unlockEcho, unlockedEchoCount, unlockedAllEchoCount, randomEchoQuote } from "./echo.js";
import {
  getCoins,
  addCoins,
  UPGRADES,
  upgradeLevel,
  upgradeCost,
  buyUpgrade,
  applyMetaUpgrades,
  coinGainMult,
  reviveStock,
  reviveCost,
  buyReviveStock,
  consumeRevive,
  getDailyQuests,
  questEvent,
  masteryOf,
  masteryNextAt,
  claimDailyFlower,
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
  grantCosmetic,
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
  sfxCandy,
  sfxType,
  sfxChestTick,
  sfxChestOpen,
} from "./sfx.js";
import { createBossFight, BOSS_APPEAR_TIME } from "./boss.js";
import { circleHit } from "./utils.js";
import {
  BASE_MONSTERS,
  CODEX_MONSTERS,
  codexKeyForEnemy,
  championForRound,
  eliteTypePool,
} from "./codex.js";
import { CHAMPION_SPRITES } from "./champion_sprites.js";
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
  codexEntryRect,
  drawCodexScreen,
  dailyButtonRect,
  bossClearLeaveRect,
  bossClearContinueRect,
  drawBossClearScreen,
  drawDailyIntro,
  echoButtonRect,
  menuButtonRect,
  titleMenuItemRect,
  questButtonRect,
  shareButtonRect,
  drawShareButton,
  contractChipRect,
  drawContractChips,
  questRowRect,
  drawQuestsScreen,
  echoFlowerRect,
  drawEchoField,
  drawEchoRead,
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
  const contractScore = activeContract?.id === "silence" ? 1.35 : 1;
  return Math.floor((player.kills * 5 + Math.floor(elapsed) * 2.5) * getDifficulty().scoreMult * contractScore);
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

// 2026-07-11 user decision: cosmetics are OFF the shop shelves (pure-gameplay
// store). System kept intact — earned rewards (金色之花) and already-owned
// equips still work; flip to true to restock the 灵魂加护 tab.
const COSMETICS_SHOP_ENABLED = false;
let shopTab = 0; // 0 = ability upgrades, 1 = 灵魂加护 cosmetics
let codexSelected = 0;
let deathShatter = null; // UT-style soul shatter on death {t, color}
let runOffense = false; // picked any atk/amp card this run (和平主义者 title)
let lastNewTitles = []; // titles earned at this settlement (gameover toast)
let lastNewEchoes = []; // echo fragments unlocked this run (gameover line)
let lastGoldenFlower = false; // full-bloom reward granted at this settlement
// 谜之宝箱: slot-machine chest ceremony {t, phase, rewards, jackpot, lastTick}
let chestCeremony = null;
let nearMiss = null; // "差一点" line for the gameover card

let offeredContracts = [];
let selectedContract = -1; // -1 = 无契
let activeContract = null; // the pact this run runs under
let lastNewQuests = []; // bounties finished this run (gameover lines)
let lastMasteryUp = null; // "角色 专精 LvN (+coins)" line

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

const ECHO_TINT_CACHE = {};
function tintedEcho(sprite, color) {
  const key = (sprite === ECHO_BUD ? "b" : "f") + color;
  return (ECHO_TINT_CACHE[key] ||= tintSprite(sprite, color, 0.5));
}

let echoRead = null; // {echo, t, chars, done} typewriter state
let deathQuote = null; // a remembered echo line shown on the gameover card
function unlockEchoToast(id) {
  if (!unlockEcho(id)) return;
  const e = ALL_ECHOES.find((x) => x.id === id);
  lastNewEchoes.push(e.title);
  // the field is in full bloom: the golden flower chooses you
  if (unlockedEchoCount() >= ECHOES.length) {
    if (grantCosmetic("goldenflower")) {
      lastGoldenFlower = true;
      tipQueue.push({ title: "❀ 花田满开", lines: ["「金色之花」已自动绽放在你的灵魂上"], t: 9 });
      sfxFanfare();
    }
    if (unlockTitle("listener")) lastNewTitles.push("聆听者");
  }
  if (unlockedAllEchoCount() >= ALL_ECHOES.length && unlockTitle("watcher")) {
    lastNewTitles.push("守望者");
  }
  // in-run: floating tip card; at settlement the gameover card lists it
  if (state === "playing" || state === "choice") {
    tipQueue.push({ title: `❀ 回响解锁:「${e.title}」`, lines: ["标题页 ❀回响 里,花会为你重述这段记忆"], t: 8 });
  }
  sfxCandy();
}

let candyBanner = null; // UT-style "* 你吃下了怪物糖" narration {text, t}

// one-time onboarding tips: each fires once per install (localStorage flag)
let tipQueue = [];
let activeTip = null;
function queueTipOnce(flag, title, lines) {
  if (localStorage.getItem("tip_" + flag)) return;
  localStorage.setItem("tip_" + flag, "1");
  tipQueue.push({ title, lines, t: 9 });
}

// death recap: what landed the killing blow ("死于:XXX" on the gameover screen)
const ENEMY_NAMES = Object.fromEntries(BASE_MONSTERS.map((m) => [m.type, m.name]));
function enemyDisplayName(e) {
  if (e.championProfile) return e.championProfile.name;
  if (e.eliteProfile) return `${e.eliteTier >= 3 ? "处决态·" : ""}${e.eliteProfile.name}`;
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
  if (target > 0.001) {
    if (audio.muted) audio.muted = false;
    if (audio.paused) audio.play().catch(() => {});
  } else if (audio.volume === cur && cur > 0.02) {
    // volume write ignored (iOS locks web volume): mute+pause is the only
    // real off-switch there — this also kills zombie play()-race playback
    audio.muted = true;
    if (!audio.paused) audio.pause();
  } else if (audio.volume <= 0.001 && !audio.paused) {
    audio.pause();
  }
}
let introBlack = 0; // seconds of black-screen intro when a game begins
let camX = 0; // world x of the view's left edge (map is infinite horizontally)
let bossFight = null; // active 天意侵蚀Sans encounter, or null
let eliteWave = 0; // 0=pending, 1=warned, 2=spawned (one wave per run at 4:00)

function currentCharacter() {
  return CHARACTERS[selectedChar];
}

// 2026-07-10 user decision: weapons are fully open — except pure support
// weapons (no active damage), which can't carry an opening solo and are
// in-run pickups only. The select screen shows them locked with a note.
function weaponLocks() {
  const locks = {};
  currentWeaponList().forEach((w, i) => {
    if (w.support) locks[i] = { hint: "辅助武器,无法单独开局", progress: "局内通过强化卡获得" };
  });
  return locks;
}

// one-line summary of everything the shop has permanently granted
function metaBonusLine() {
  const parts = [];
  if (upgradeLevel("atk")) parts.push(`攻+${2 * upgradeLevel("atk")}`);
  if (upgradeLevel("hp")) parts.push(`血+${25 * upgradeLevel("hp")}`);
  if (upgradeLevel("speed")) parts.push(`速+${8 * upgradeLevel("speed")}`);
  if (upgradeLevel("magnet")) parts.push(`磁+${25 * upgradeLevel("magnet")}`);
  if (upgradeLevel("greed")) parts.push(`金币+${20 * upgradeLevel("greed")}%`);
  if (upgradeLevel("reroll")) parts.push(`刷新+${upgradeLevel("reroll")}`);
  if (upgradeLevel("gear")) parts.push(`开局装备+${upgradeLevel("gear")}`);
  if (reviveStock()) parts.push(`复活×${reviveStock()}`);
  return parts.length ? `当前永久加成:${parts.join(" ")}` : "暂无永久加成";
}

function visibleCosmetics() {
  return COSMETICS.filter((c) => !c.secret || cosmeticOwned(c.id));
}

function cosmeticEquipLine() {
  const soul = equippedCosmetic();
  const bone = equippedBoneSkin();
  return `装备中:灵魂「${soul ? soul.name : "无"}」 骨装「${bone ? bone.name : "默认"}」`;
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
  let have = CODEX_MONSTERS.filter((m) => (st.killsByType[m.key] || 0) > 0).length;
  let total = CODEX_MONSTERS.length + 1;
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
  const items = UPGRADES.map((u) => ({
    id: u.id,
    name: u.name,
    desc: u.desc,
    lvl: upgradeLevel(u.id),
    max: u.max,
    cost: upgradeCost(u.id),
    color: u.color,
  }));
  // consumable revive rides in the same list with its stock as "pips"
  items.push({
    id: "reviveStock",
    name: "重燃决心",
    desc: "一次性复活,带入下局(每局限1次;屠杀无效)",
    lvl: reviveStock(),
    max: 3,
    cost: reviveCost(),
    color: "#ffffff",
  });
  return items;
}

function currentWeaponList() {
  return WEAPON_LISTS[currentCharacter().id];
}

function reset(weaponId) {
  player = new Player(WIDTH / 2, HEIGHT / 2);
  player.character = currentCharacter().id;
  applyMetaUpgrades(player); // permanent shop upgrades kick in from second zero
  player.revives = 0; // armed in startGame from the consumable stock
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
  candyBanner = null;
  deathShatter = null;
  runOffense = false;
  lastNewTitles = [];
  lastNewEchoes = [];
  lastGoldenFlower = false;
  lastNewQuests = [];
  lastMasteryUp = null;
  activeContract = null;
  chestCeremony = null;
  nearMiss = null;
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
  bgm.muted = true; // belt+braces for iOS zombie playback
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
    ["genocide", bossDefeated && getDifficulty().id === 3],
  ]) {
    if (ok && unlockTitle(id)) lastNewTitles.push(TITLES.find((t) => t.id === id).name);
  }
  // 回响 story fragments — the hall remembers this run's milestones
  if (runOutcome === "death" || runOutcome === "endlessDeath") unlockEchoToast("stay");
  if (bossDefeated) unlockEchoToast("after");
  if (roundsCleared >= 5) unlockEchoToast("deeper");
  if (getStats().runs >= 20) unlockEchoToast("back");
  if (bossDefeated && getDifficulty().id === 2) unlockEchoToast("wd");
  if (bossDefeated && getDifficulty().id === 3) unlockEchoToast("dust");
  if (Object.keys(getStats().evolved || {}).length >= 32) unlockEchoToast("gift");
  if (codexCompletion() >= 100) unlockEchoToast("end");
  deathQuote = runOutcome === "death" || runOutcome === "endlessDeath" ? randomEchoQuote() : null;
  // "差一点" (near-miss): losses that almost weren't — the strongest rerun hook
  nearMiss = null;
  if (runOutcome === "death" || runOutcome === "endlessDeath") {
    if (runOutcome === "endlessDeath" && roundTimer > 0 && roundTimer <= 30) {
      nearMiss = `差一点!再撑 ${Math.ceil(roundTimer)} 秒就能完成第 ${endlessRound} 轮审判`;
    } else if (runOutcome === "endlessDeath" && roundTimer <= 0 && roundBossSpawned && !roundBossDown) {
      nearMiss = `差一点!击倒首领就能结算第 ${endlessRound} 轮`;
    } else if (runOutcome === "death" && !bossDefeated && elapsed < BOSS_APPEAR_TIME && BOSS_APPEAR_TIME - elapsed <= 45) {
      nearMiss = `差一点!再活 ${Math.ceil(BOSS_APPEAR_TIME - elapsed)} 秒就能见到天意侵蚀Sans`;
    } else if (!newRecord && lastBest > 0 && lastScore >= lastBest * 0.8) {
      nearMiss = `差一点!距离新纪录只有 ${lastBest - lastScore + 1} 分`;
    }
  }
  // bounties settled at run end
  if (bossDefeated) questToasts(questEvent("boss", 1));
  questToasts(questEvent("survive", Math.floor(elapsed)));
  // 角色专精: lifetime kills crossed a level? coins + line
  const killsAfter = getStats().charKills[player.character] || 0;
  const lvlBefore = masteryOf(killsAfter - player.kills);
  const lvlAfter = masteryOf(killsAfter);
  if (lvlAfter > lvlBefore) {
    const bonus = 80 * (lvlAfter - lvlBefore) * lvlAfter;
    addCoins(bonus);
    lastMasteryUp = `⚔ ${currentCharacter().name} 专精升至 Lv${lvlAfter}(+${bonus}金币)`;
  }
  // 角色残响: this timeline's private echoes open with mastery
  if (lvlAfter >= 1) unlockEchoToast(player.character + "1");
  if (lvlAfter >= 3) unlockEchoToast(player.character + "2");
}
function toCharSelect() {
  // wipe the world so the old battlefield doesn't show behind the menu
  exitDailyMode(); // safety: never leak the seeded RNG into normal play
  reset(currentWeaponList()[0].id);
  bgm.pause();
  bgm.muted = true;
  bgm.currentTime = 0;
  state = "charselect";
}

// ---- daily stickiness: bounties + login flower ------------------------------
function yesterdayKey() {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
getDailyQuests(todayKey(), CHARACTERS.map((c) => c.id)); // materialize today's三条
// backfill: veterans' existing mastery opens character echoes silently
for (const c of CHARACTERS) {
  const lvl = masteryOf(getStats().charKills[c.id] || 0);
  if (lvl >= 1) unlockEcho(c.id + "1");
  if (lvl >= 3) unlockEcho(c.id + "2");
}
const flowerGift = claimDailyFlower(todayKey(), yesterdayKey());
const flowerGiftLine = flowerGift.already
  ? `❀ 连日之花:第 ${flowerGift.days} 天(今日礼物已领取)`
  : `❀ 连日之花:第 ${flowerGift.days} 天,花为你留了 ${flowerGift.coins} 金币`;

const QUEST_KIND_DESC = {
  kills: (q) => `击杀 ${q.target} 只怪物`,
  charKills: (q) => `用「${(CHARACTERS.find((c) => c.id === q.charId) || CHARACTERS[0]).name}」击杀 ${q.target} 只`,
  coins: (q) => `拾取 ${q.target} 枚金币`,
  candy: (q) => `吃下 ${q.target} 颗怪物糖`,
  elites: (q) => `击败 ${q.target} 名精英`,
  boss: () => `击败一次天意侵蚀Sans`,
  round: (q) => `完成无尽审判第 ${q.target} 轮`,
  streak: (q) => `达成一次 ${q.target} 连杀`,
  evolve: () => `完成一次武器进化`,
  survive: (q) => `单局存活 ${q.target} 秒`,
};
function questView() {
  return getDailyQuests(todayKey(), CHARACTERS.map((c) => c.id)).map((q) => ({
    ...q,
    desc: QUEST_KIND_DESC[q.kind](q),
  }));
}
function questToasts(completed) {
  for (const q of completed) {
    const line = QUEST_KIND_DESC[q.kind](q);
    lastNewQuests.push(`${line} +${q.reward}金币`);
    if (state === "playing" || state === "choice") {
      tipQueue.push({ title: "📜 悬赏完成!", lines: [`${line} —— 赏金 ${q.reward} 金币已入账`], t: 7 });
    }
    sfxEquip();
  }
}

// ---- 审判契约: optional blessing/price pacts, rolled per select-screen visit
// 2026-07-11 user decision: feature is built but SHELVED for a later release —
// flip this flag to true to ship it. All hooks stay dormant while offered=[].
const CONTRACTS_ENABLED = false;
const CONTRACTS = [
  { id: "glass", name: "玻璃之契", up: "攻击 +35%", down: "生命上限 -30%" },
  { id: "iron", name: "铁誓之契", up: "减伤 +15%", down: "移速 -15%" },
  { id: "greed", name: "贪婪之契", up: "金币 +50%", down: "怪物伤害 +25%" },
  { id: "wind", name: "疾风之契", up: "移速+20% 攻速+10%", down: "不再掉落怪物糖" },
  { id: "silence", name: "静默之契", up: "得分 +35%", down: "治疗效果减半" },
  { id: "hunt", name: "狩猎之契", up: "精英金币 ×3", down: "精英两倍频率" },
];
function rollContracts() {
  offeredContracts = [];
  selectedContract = -1;
  if (!CONTRACTS_ENABLED) return;
  const pool = [...CONTRACTS];
  for (let i = 0; i < 3 && pool.length; i++) {
    offeredContracts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  selectedContract = -1;
}

// ---- 谜之宝箱: Vampire-Survivors-style slot ceremony ------------------------
// 1 reward (70%) / 3 rewards (25%) / 5 rewards (5%) — the jackpot is the hook
function rollChestRewards() {
  const r = Math.random();
  const count = r < 0.05 ? 5 : r < 0.3 ? 3 : 1;
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const pick = Math.random() * 100;
    if (pick < 40) {
      const v = Math.round((30 + Math.random() * 50) * coinGainMult() * getDifficulty().coinMult * currentCoinFactor() || 20);
      rewards.push({ label: `金币 ×${v}`, color: "#ffd166", icon: "ⓖ", apply: () => {
        if (endlessRound > 0) roundPendingCoins += v; else runCoins += v;
      }});
    } else if (pick < 65) {
      const type = rollEquipmentDrop();
      rewards.push({ label: type.label, color: type.color, icon: "◆", apply: () => type.apply(player) });
    } else if (pick < 80) {
      rewards.push({ label: "紧急修复 35%", color: "#7cf28a", icon: "♥", apply: () => {
        player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * 0.35 * healScale()));
      }});
    } else if (pick < 95) {
      rewards.push({ label: "武器品阶 +1", color: "#7ea8ff", icon: "▲", apply: () => {
        const up = player.weapons.filter((w) => w.tier < 4);
        if (up.length) up[Math.floor(Math.random() * up.length)].tier += 1;
        else player.atk += 3;
      }});
    } else {
      rewards.push({ label: "专属强化 +1", color: "#c59bff", icon: "★", apply: () => {
        const ws = player.weapons;
        if (ws.length) ws[Math.floor(Math.random() * ws.length)].enhance += 1;
      }});
    }
  }
  return rewards;
}

function openChest() {
  chestCeremony = {
    t: 0,
    phase: "spin", // spin (1.5s, decelerating ticks) -> reveal
    rewards: rollChestRewards(),
    lastTick: -1,
  };
  state = "chest";
}

function chestAdvance() {
  if (!chestCeremony) return;
  if (chestCeremony.phase === "spin") {
    chestCeremony.phase = "reveal";
    chestCeremony.t = 0;
    const jackpot = chestCeremony.rewards.length >= 5 ? 2 : chestCeremony.rewards.length >= 3 ? 1 : 0;
    sfxChestOpen(jackpot);
    if (jackpot) killFlash = 0.3;
    if (jackpot === 2) sfxFanfare();
  } else {
    // collect and return to the fight
    for (const rw of chestCeremony.rewards) rw.apply();
    floatingTexts.push(new FloatingText(player.x, player.y - 30, `宝箱 ×${chestCeremony.rewards.length}`, "#ffd166"));
    chestCeremony = null;
    state = "playing";
    bgmPlay();
  }
}

// ---- 结算分享卡: a 720x960 pixel-styled run card --------------------------
function buildShareCard() {
  const c = document.createElement("canvas");
  c.width = 720;
  c.height = 960;
  const g = c.getContext("2d");
  if (!g || !g.fillRect) return null; // headless stubs bail out gracefully
  g.fillStyle = "#0e0b16";
  g.fillRect(0, 0, 720, 960);
  g.strokeStyle = "rgba(242,234,216,0.05)";
  for (let x = 0; x < 720; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 960); g.stroke(); }
  for (let y = 0; y < 960; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(720, y); g.stroke(); }
  g.strokeStyle = "#ffd166";
  g.lineWidth = 4;
  g.strokeRect(14, 14, 692, 932);
  g.textAlign = "center";
  g.fillStyle = "#7ea8ff";
  g.font = "bold 24px monospace";
  g.fillText("我做了一个Sans割草游戏.", 360, 72);
  const oc =
    runOutcome === "victory" ? ["通关成功！", "#7cf28a"]
    : runOutcome === "endlessDeath" ? ["无尽终局", "#ff8a5d"]
    : runOutcome === "retreat" ? ["主动撤离", "#8fd6ff"]
    : ["GAME OVER", "#ff5d73"];
  g.fillStyle = oc[1];
  g.font = "bold 52px monospace";
  g.fillText(oc[0], 360, 140);
  g.fillStyle = "#9a93ab";
  g.font = "18px monospace";
  g.fillText(`${todayKey()} · ${currentCharacter().name} · ${getDifficulty().name}难度${wasDaily ? " · ✦每日挑战" : ""}`, 360, 176);
  // portrait with soul glow
  const spr = PLAYER_SPRITES[player.character] || PLAYER_SPRITES.sans;
  const scale = 9;
  g.save();
  g.imageSmoothingEnabled = false;
  const soul = equippedCosmetic();
  if (soul) { g.shadowColor = soul.color; g.shadowBlur = 34; }
  g.drawImage(spr, 360 - (spr.width * scale) / 2, 210, spr.width * scale, spr.height * scale);
  g.restore();
  const lines = [
    [`得分 ${lastScore}`, "#ffd166", "bold 40px monospace"],
    [`存活 ${Math.floor(bossDefeated ? stageClearTime : elapsed)} 秒 · 击杀 ${player.kills} · 最高连杀 ${runMaxStreak}`, "#f2ead8", "22px monospace"],
  ];
  if (endlessResult) lines.push([`无尽审判 ${endlessResult.rounds} 轮 · 无尽得分 ${endlessResult.score}`, "#ff8a5d", "22px monospace"]);
  lines.push([`金币 +${lastRunCoins}`, "#ffd166", "22px monospace"]);
  if (nearMiss) lines.push([nearMiss, "#ff8a5d", "20px monospace"]);
  if (activeContract) lines.push([`契约「${activeContract.name}」`, "#d9c47a", "22px monospace"]);
  if (bestTitle()) lines.push([`称号「${bestTitle().name}」`, "#c59bff", "22px monospace"]);
  if (deathQuote) lines.push([deathQuote, "#8fa8c9", "20px monospace"]);
  else if (lastDeathBy && runOutcome !== "retreat") lines.push([`死于:${lastDeathBy}`, "#c95d5d", "20px monospace"]);
  let ly = 480;
  for (const [text, color, font] of lines) {
    g.fillStyle = color;
    g.font = font;
    g.fillText(text, 360, ly);
    ly += font.startsWith("bold 40") ? 58 : 40;
  }
  // echo flowers deco + link
  g.imageSmoothingEnabled = false;
  for (let i = 0; i < 5; i++) {
    g.save();
    g.globalAlpha = 0.85;
    g.shadowColor = "#6bd0ff";
    g.shadowBlur = 10;
    g.drawImage(ECHO_BLOOM, 240 + i * 52, 830, 40, (ECHO_BLOOM.height / ECHO_BLOOM.width) * 40);
    g.restore();
  }
  g.fillStyle = "#7d7690";
  g.font = "18px monospace";
  g.fillText("yeyingying.github.io/sans-game", 360, 928);
  return c;
}

function shareRun() {
  try {
    const card = buildShareCard();
    if (!card || typeof card.toBlob !== "function") return;
    card.toBlob((blob) => {
      if (!blob) return;
      const file = typeof File !== "undefined" ? new File([blob], "sans-run.png", { type: "image/png" }) : null;
      const text = runOutcome === "victory"
        ? `我在审判廊通关了审判,得分 ${lastScore}!`
        : `我在审判廊拿下 ${lastScore} 分!`;
      if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text, title: "Sans割草游戏" }).catch(() => {});
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sans-run.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }
    }, "image/png");
  } catch (err) {
    /* sharing must never break the game */
  }
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
  unlockEchoToast("why");
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

// round 3+ (and the silence pact): healing and regeneration are halved
function healScale() {
  return (endlessRound >= 3 ? 0.5 : 1) * (activeContract?.id === "silence" ? 0.5 : 1);
}

// ---- daily challenge -------------------------------------------------------
// One fixed-seed run per calendar day: same spawns/cards for everyone, a
// rotating character (locks bypassed — it doubles as a demo), local best kept.

let titleMenuOpen = false; // ☰ drawer on the title screen
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
  // daily never hands out a support weapon as the solo starter
  const dailyPool = currentWeaponList()
    .map((w, i) => ({ w, i }))
    .filter((x) => !x.w.support);
  selectedWeapon = dailyPool[(seed >>> 3) % dailyPool.length].i;
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
  // 审判契约: the pact takes hold before anything else enters the hall
  activeContract = DEBUG_BOSS === null && !dailyMode ? offeredContracts[selectedContract] || null : null;
  if (activeContract) {
    const c = activeContract.id;
    if (c === "glass") {
      player.atk = Math.round(player.atk * 1.35);
      player.maxHp = Math.round(player.maxHp * 0.7);
      player.hp = player.maxHp;
    } else if (c === "iron") {
      player.dmgReduction = Math.min(player.dmgReduction + 0.15, 0.9);
      player.moveSpeed = Math.round(player.moveSpeed * 0.85);
    } else if (c === "greed") {
      spawner.diffDmg *= 1.25;
    } else if (c === "wind") {
      player.moveSpeed = Math.round(player.moveSpeed * 1.2);
      player.fireRate *= 1.1;
    } else if (c === "hunt") {
      spawner.eliteMult = 0.5;
    }
    floatingTexts.push(new FloatingText(player.x, player.y - 44, `⚖ 契约生效:「${activeContract.name}」`, "#d9c47a"));
  }
  // 重燃决心(消耗品): arm one revive if stocked — 屠杀线没有第二次机会
  player.revives = getDifficulty().id === 3 || reviveStock() <= 0 ? 0 : 1;
  // 行前整备: shop-bought loadout, granted before the first frame
  for (let i = 0; i < upgradeLevel("gear"); i++) {
    rollEquipmentDrop().apply(player);
  }
  // warm-up welcome party: composition, size and formation vary per run
  // (and by difficulty) so no two openings look the same
  if (DEBUG_BOSS === null) {
    const pools = [
      ["slime", "slime", "bat"],
      ["slime", "bat", "ghost"],
      ["slime", "bat", "ghost", "tank"],
      ["bat", "ghost", "tank"],
    ];
    const pool = pools[getDifficulty().id] || pools[0];
    const n = 6 + Math.floor(Math.random() * 4); // 6-9
    const formation = Math.floor(Math.random() * 3); // 0 环形 1 夹击 2 正面群
    for (let i = 0; i < n; i++) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      let ex;
      let ey;
      if (formation === 0) {
        const a = (i / n) * Math.PI * 2;
        ex = player.x + Math.cos(a) * 260;
        ey = player.y + Math.sin(a) * 220;
      } else if (formation === 1) {
        const side = i % 2 === 0 ? -1 : 1;
        ex = player.x + side * (280 + Math.random() * 70);
        ey = player.y + (Math.random() - 0.5) * 260;
      } else {
        ex = player.x + 280 + Math.random() * 120;
        ey = player.y + (Math.random() - 0.5) * 320;
      }
      enemies.push(new Enemy(type, ex, clamp(ey, WALL_H + 24, HEIGHT - 24), spawner.scale(false)));
    }
  }
  timeScale = 1;
  state = "playing";
  introBlack = 1.5; // brief black screen while the battle music fades in
  // hard-stop the menu theme so it never overlaps the battle track
  menuBgm.pause();
  menuBgm.muted = true; // iOS ignores volume writes — mute is the real switch
  menuBgm.currentTime = 0;
  menuBgm.volume = 0;
  bgm.muted = false;
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
      make: () => {
        // scales with current atk (8%, floor 4) so late picks still matter
        const gain = Math.max(4, Math.round(player.atk * 0.08));
        return {
          title: `攻击力 +${gain}`,
          desc: "所有武器伤害提升(随攻击成长)",
          color: "#ff6b6b",
          apply: () => {
            player.atk += gain;
            runOffense = true;
          },
        };
      },
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
    questToasts(questEvent("evolve", 1));
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
    if (titleMenuOpen) {
      const targets = ["shop", "codex", "echoes", "quests"];
      for (let i = 0; i < targets.length; i++) {
        if (inRect(pos, titleMenuItemRect(i, WIDTH, HEIGHT))) {
          state = targets[i];
          titleMenuOpen = false;
          sfxClick();
          return;
        }
      }
    }
    if (inRect(pos, menuButtonRect(WIDTH, HEIGHT))) {
      titleMenuOpen = !titleMenuOpen;
      sfxClick();
    } else if (inRect(pos, creditsButtonRect(WIDTH, HEIGHT))) {
      state = "credits";
      titleMenuOpen = false;
      sfxClick();
    } else if (inRect(pos, dailyButtonRect(WIDTH, HEIGHT))) {
      state = "dailyintro"; // explain the mode first — never start cold
      bossClearChoice = 1;
      titleMenuOpen = false;
      sfxClick();
    } else if (inRect(pos, startButtonRect(WIDTH, HEIGHT))) {
      toCharSelect();
      titleMenuOpen = false;
      sfxClick();
    } else {
      titleMenuOpen = false; // tap empty space: fold the drawer
    }
    return;
  }
  if (state === "quests") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
    }
    return;
  }
  if (state === "echoes") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
      return;
    }
    for (let i = 0; i < ALL_ECHOES.length; i++) {
      if (inRect(pos, echoFlowerRect(i, WIDTH, HEIGHT))) {
        if (echoUnlocked(ALL_ECHOES[i].id)) {
          echoRead = { echo: ALL_ECHOES[i], t: 0, chars: 0, done: false };
          state = "echoread";
          sfxClick();
        } else {
          sfxHurt(); // still a bud
        }
        return;
      }
    }
    return;
  }
  if (state === "chest") {
    chestAdvance(); // tap: skip the spin / collect and continue
    return;
  }
  if (state === "echoread") {
    if (echoRead && !echoRead.done) {
      echoRead.done = true; // skip the typewriter
      echoRead.chars = 9999;
    } else {
      state = "echoes";
    }
    sfxClick();
    return;
  }
  if (state === "dailyintro") {
    if (inRect(pos, bossClearLeaveRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
    } else if (inRect(pos, bossClearContinueRect(WIDTH, HEIGHT))) {
      sfxClick();
      startDailyChallenge();
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
      return;
    }
    for (let i = 0; i < CODEX_MONSTERS.length; i++) {
      if (inRect(pos, codexEntryRect(i, WIDTH))) {
        codexSelected = i;
        sfxClick();
        return;
      }
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
      if (COSMETICS_SHOP_ENABLED && inRect(pos, shopTabRect(i, WIDTH))) {
        shopTab = i;
        sfxClick();
        return;
      }
    }
    if (COSMETICS_SHOP_ENABLED && shopTab === 1) {
      // 灵魂加护: buy once, then click toggles equip/unequip
      const visible = visibleCosmetics();
      for (let i = 0; i < visible.length; i++) {
        if (inRect(pos, cosmeticItemRect(i, WIDTH, HEIGHT))) {
          const c = visible[i];
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
        const ok = items[i].id === "reviveStock" ? buyReviveStock() : buyUpgrade(items[i].id);
        if (ok) sfxEquip();
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
      rollContracts();
      sfxClick();
    }
  } else if (state === "select") {
    for (let i = 0; i < offeredContracts.length; i++) {
      if (inRect(pos, contractChipRect(i, WIDTH, HEIGHT))) {
        selectedContract = selectedContract === i ? -1 : i;
        sfxClick();
        return;
      }
    }
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
    if (inRect(pos, shareButtonRect(WIDTH, HEIGHT))) {
      sfxClick();
      shareRun();
      return; // stay on the card
    }
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
    else if (state === "codex" && (k === "arrowleft" || k === "arrowright")) {
      codexSelected = (codexSelected + (k === "arrowright" ? 1 : CODEX_MONSTERS.length - 1)) % CODEX_MONSTERS.length;
      sfxClick();
    } else if (state === "codex" && (k === "arrowup" || k === "arrowdown")) {
      codexSelected = (codexSelected + (k === "arrowdown" ? 8 : CODEX_MONSTERS.length - 8)) % CODEX_MONSTERS.length;
      sfxClick();
    }
    return;
  }
  if (state === "quests" || state === "echoes") {
    if (k === "escape") state = "title";
    return;
  }
  if (state === "chest") {
    if (k === " " || k === "enter") chestAdvance();
    return;
  }
  if (state === "echoread") {
    if (k === "escape") state = "echoes";
    else if (k === " " || k === "enter") {
      if (echoRead && !echoRead.done) {
        echoRead.done = true;
        echoRead.chars = 9999;
      } else state = "echoes";
    }
    return;
  }
  if (state === "dailyintro") {
    if (k === "escape") state = "title";
    else if (k === "arrowleft" || k === "arrowright") {
      bossClearChoice = 1 - bossClearChoice;
      sfxClick();
    } else if (k === " " || k === "enter") {
      sfxClick();
      if (bossClearChoice === 0) state = "title";
      else startDailyChallenge();
    }
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
      rollContracts();
    }
  } else if (state === "select") {
    if (k === "c") {
      selectedContract = selectedContract >= offeredContracts.length - 1 ? -1 : selectedContract + 1;
      sfxClick();
      return;
    }
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
  const eliteTier = enemy.eliteProfile ? enemy.eliteTier : 0;
  const equipmentDrops = enemy.championProfile
    ? 2
    : enemy.elite
      ? 1 + (eliteTier >= 3 ? 1 : eliteTier >= 2 && Math.random() < 0.35 ? 1 : 0)
      : Math.random() < 0.12
        ? 1
        : 0;
  for (let i = 0; i < equipmentDrops; i++) {
    const type = rollEquipmentDrop();
    pickups.push(
      new Pickup(enemy.x + (Math.random() - 0.5) * 22, enemy.y + (Math.random() - 0.5) * 18, "equipment", { type })
    );
  }
  // coins: the between-runs currency. Value grows with the clock. In endless
  // the DROP CHANCE decays (50%→25%→10%→0) — chance, not value, so the decay
  // can't be defeated by Math.max(1) rounding on tiny values.
  const coinFactor = currentCoinFactor();
  if (coinFactor > 0 && (enemy.elite || Math.random() < 0.13) && Math.random() < coinFactor) {
    const base = (enemy.championProfile ? 12 + (enemy.championRound || 1) * 2 : enemy.elite ? 6 + eliteTier * 2 : 1) *
      (1 + Math.floor(elapsed / 150));
    const contractCoin = (activeContract?.id === "greed" ? 1.5 : 1) * (enemy.elite && activeContract?.id === "hunt" ? 3 : 1);
    const value = Math.max(1, Math.round(base * coinGainMult() * getDifficulty().coinMult * contractCoin));
    pickups.push(
      new Pickup(enemy.x + (Math.random() - 0.5) * 10, enemy.y + (Math.random() - 0.5) * 10, "coin", { value })
    );
  }
  // 怪物糖 (UT: healing is food): a rare clutch save — the closer to death,
  // the likelier the miracle (2.5% hurt / 6% below 40% hp)
  const candyChance =
    activeContract?.id === "wind" ? 0 : player.hp < player.maxHp * 0.4 ? 0.015 : player.hp < player.maxHp * 0.85 ? 0.006 : 0;
  if (!enemy.elite && Math.random() < candyChance) {
    pickups.push(new Pickup(enemy.x + (Math.random() - 0.5) * 12, enemy.y + (Math.random() - 0.5) * 12, "candy", {}));
  }
}

function startEliteCast(e) {
  const skill = e.eliteProfile?.skillId;
  if (!skill) return;
  const duration = {
    leap: 0.9,
    rush: 0.7,
    gaze: 1.15,
    roots: 1.05,
    dogCharge: 0.95,
    dummyVolley: 1.1,
    moonfall: 1.2,
    webFeast: 1.1,
  }[skill];
  const cast = { skill, t: duration, maxT: duration, x: player.x, y: player.y, fromX: e.x, fromY: e.y, marks: [] };
  if (skill === "roots") {
    const a0 = (e.id % 8) * (Math.PI / 4);
    for (let i = 0; i < 3; i++) {
      const a = a0 + (i / 3) * Math.PI * 2;
      cast.marks.push({ x: player.x + Math.cos(a) * 58, y: player.y + Math.sin(a) * 48 });
    }
  } else if (skill === "moonfall") {
    for (let i = 0; i < 5; i++) {
      const a = (e.id * 0.7 + i * 2.4) % (Math.PI * 2);
      const r = i === 0 ? 0 : 52 + (i % 2) * 34;
      cast.marks.push({ x: player.x + Math.cos(a) * r, y: clamp(player.y + Math.sin(a) * r, WALL_H + 34, HEIGHT - 34) });
    }
  } else if (skill === "webFeast") {
    cast.lanes = [-72, 0, 72].map((dy) => clamp(player.y + dy, WALL_H + 30, HEIGHT - 30));
    cast.dangerY = cast.lanes[(e.id + (e.championCastCount || 0)) % cast.lanes.length];
  }
  e.championCastCount = (e.championCastCount || 0) + 1;
  e.eliteCast = cast;
}

function pointSegmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function eliteHitPlayer(e, amount, label, color) {
  if (player.shieldTimer > 0) {
    floatingTexts.push(new FloatingText(player.x, player.y - 24, "BLOCK!", "#b58cff"));
    return;
  }
  const hit = player.takeDamage(Math.max(1, Math.round(amount)));
  if (hit) {
    lastHitBy = `${enemyDisplayName(e)}的${label}`;
    floatingTexts.push(new FloatingText(player.x, player.y - 24, `-${Math.max(1, Math.round(amount))}`, color));
  } else if (player.dodged) {
    floatingTexts.push(new FloatingText(player.x, player.y - 20, "MISS!", "#7cf28a"));
  }
}

function resolveEliteCast(e, cast) {
  const tierPower = e.eliteTier >= 3 ? 1.25 : 1;
  if (cast.skill === "leap") {
    e.x = cast.x;
    e.y = clamp(cast.y, WALL_H + e.radius, HEIGHT - e.radius);
    explosions.push(new Explosion(e.x, e.y, 66, e.eliteProfile.color, true));
    if (circleHit(e.x, e.y, 66, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.9 * tierPower, "审判跃击", e.eliteProfile.color);
  } else if (cast.skill === "rush") {
    e.burstTimer = Math.max(e.burstTimer, e.eliteTier >= 3 ? 1.8 : 1.35);
    e.invulnTimer = Math.max(e.invulnTimer, 0.25);
  } else if (cast.skill === "gaze") {
    explosions.push(new Explosion(e.x, e.y, 190, e.eliteProfile.color, true));
    if (circleHit(e.x, e.y, 190, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.8 * tierPower, "裁决凝视", e.eliteProfile.color);
  } else if (cast.skill === "roots") {
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 44, e.eliteProfile.color));
      if (circleHit(mark.x, mark.y, 44, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.65 * tierPower, "根须盛宴", e.eliteProfile.color);
    }
  } else if (cast.skill === "dogCharge") {
    e.x = cast.x;
    e.y = clamp(cast.y, WALL_H + e.radius, HEIGHT - e.radius);
    explosions.push(new Explosion(e.x, e.y, 62, e.eliteProfile.color, true));
    const inLane = pointSegmentDistance(player.x, player.y, cast.fromX, cast.fromY, e.x, e.y) <= 30;
    if (inLane && player.moving) eliteHitPlayer(e, e.dmg * 0.9 * tierPower, "蓝枪冲锋", e.eliteProfile.color);
  } else if (cast.skill === "dummyVolley") {
    explosions.push(new Explosion(cast.x, cast.y, 76, e.eliteProfile.color));
    if (circleHit(cast.x, cast.y, 76, e.x, e.y, e.radius)) {
      const reflected = Math.max(1, Math.round(e.maxHp * 0.08));
      e.takeDamage(reflected);
      floatingTexts.push(new FloatingText(e.x, e.y - e.radius - 18, `反伤 ${reflected}`, "#ffd166"));
    }
    if (circleHit(cast.x, cast.y, 76, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.8 * tierPower, "假人齐射", "#ffd166");
  } else if (cast.skill === "moonfall") {
    let hit = false;
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 48, e.eliteProfile.color));
      if (!hit && circleHit(mark.x, mark.y, 48, player.x, player.y, player.radius)) {
        hit = true;
        eliteHitPlayer(e, e.dmg * 0.85 * tierPower, "月陨星落", e.eliteProfile.color);
      }
    }
  } else if (cast.skill === "webFeast") {
    explosions.push(new Explosion(player.x, cast.dangerY, 54, e.eliteProfile.color, true));
    if (Math.abs(player.y - cast.dangerY) <= 25) eliteHitPlayer(e, e.dmg * 0.75 * tierPower, "蛛网宴席", e.eliteProfile.color);
  }
}

function updateEliteSkill(e, dt) {
  if (!e.eliteProfile || e.rootTimer > 0) return;
  if (e.eliteProfile.skillId === "rush" && e.burstTimer > 0) {
    e.eliteTrail.push({ x: e.x, y: e.y, t: 0.32 });
    if (e.eliteTrail.length > 8) e.eliteTrail.shift();
  }
  for (const trail of e.eliteTrail) trail.t -= dt;
  e.eliteTrail = e.eliteTrail.filter((trail) => trail.t > 0);
  if (e.eliteCast) {
    e.eliteCast.t -= dt;
    if (e.eliteCast.t <= 0) {
      resolveEliteCast(e, e.eliteCast);
      e.eliteCast = null;
      e.eliteSkillTimer = e.championProfile
        ? Math.max(3.4, 5.8 - (e.championRound || 1) * 0.22) + Math.random() * 0.6
        : Math.max(3.2, 6.2 - e.eliteTier * 0.65) + Math.random() * 0.8;
    }
    return;
  }
  e.eliteSkillTimer -= dt;
  if (e.eliteSkillTimer <= 0) startEliteCast(e);
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
      const namedTypes = eliteTypePool(getDifficulty().id, elapsed);
      const types = namedTypes || ["tank", "red", "orange", "blue", "purple", "ghost"];
      for (let i = 0; i < wave.count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const e = new Enemy(
          types[Math.floor(Math.random() * types.length)],
          camX + WIDTH / 2 + side * (WIDTH / 2 + 50),
          WALL_H + 30 + Math.random() * (HEIGHT - WALL_H - 60),
          spawner.scale(true, !!namedTypes)
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
    // T-15s: an Undertale round champion. R5+ rotates the same four with the
    // existing endless stat pressure layered on top.
    if (!roundBossSpawned && roundTimer <= 15) {
      roundBossSpawned = true;
      const profile = championForRound(endlessRound);
      const side = Math.random() < 0.5 ? -1 : 1;
      const b = new Enemy(
        profile.baseType,
        camX + WIDTH / 2 + side * (WIDTH / 2 + 60),
        WALL_H + 40 + Math.random() * (HEIGHT - WALL_H - 80),
        spawner.scale(true, false)
      );
      b.championProfile = profile;
      b.eliteProfile = profile;
      b.championRound = endlessRound;
      b.roundBoss = true;
      b.maxLives = 1;
      b.lives = 1;
      b.teleporter = false;
      b.mark = null;
      b.maxHp = Math.round(b.maxHp * (4 + endlessRound) * profile.hpFactor);
      b.hp = b.maxHp;
      b.dmg = Math.round(b.dmg * 1.35 * profile.dmgFactor);
      b.radius = Math.round(b.radius * 1.5);
      b.attackRange = b.radius;
      b.xp = Math.round(b.xp * 6);
      b.eliteSkillTimer = 1.8;
      enemies.push(b);
      roundBanner = { text: `⚠ ${profile.name} 接近`, sub: `${profile.english} · 第 ${endlessRound} 轮审判`, t: 2.2 };
      sfxAlarm();
    }
    // the round ends when the clock is out AND the champion is down
    if (roundTimer <= 0 && roundBossSpawned && roundBossDown) {
      roundsCleared = endlessRound;
      questToasts(questEvent("round", roundsCleared));
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

  if (candyBanner && (candyBanner.t -= dt) <= 0) candyBanner = null;

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
    updateEliteSkill(e, dt);
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
    const codexKey = codexKeyForEnemy(e);
    runKillsByType[codexKey] = (runKillsByType[codexKey] || 0) + 1;
    if (!e.noXp) spawnDrops(e);
    if (e.roundBoss) {
      roundBossDown = true;
      floatingTexts.push(new FloatingText(e.x, e.y - 30, `★ ${enemyDisplayName(e)}被击败！`, "#ffd166"));
    }
    if (e.elite) {
      // elites go out with a bang: shock ring + deep boom
      explosions.push(new Explosion(e.x, e.y, e.radius * 3.4, "#ffd166", true));
      sfxEliteDown();
      if (e.eliteProfile) unlockEchoToast("names"); // a NAMED resident fell
      // 谜之宝箱: champions always carry one, elites sometimes
      if (e.roundBoss || e.championProfile || Math.random() < 0.22) {
        pickups.push(new Pickup(e.x, e.y, "chest", {}));
      }
    }
  }
  enemies = enemies.filter((e) => (e.hp > 0 || e.boss));
  if (dead.length > 0) {
    questToasts(questEvent("kills", dead.length));
    questToasts(questEvent("charKills", dead.length, { charId: player.character }));
    const eliteDead = dead.filter((e) => e.elite).length;
    if (eliteDead) questToasts(questEvent("elites", eliteDead));
    sfxKill(dead.length);
    // chained kills build the streak; milestones pop the screen
    streak += dead.length;
    runMaxStreak = Math.max(runMaxStreak, streak);
    questToasts(questEvent("streak", streak));
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
      } else if (pu.kind === "chest") {
        sfxEquip();
        openChest(); // the world holds its breath for the slot ceremony
      } else if (pu.kind === "candy") {
        const heal = Math.round(Math.max(10, player.maxHp * 0.12) * healScale());
        player.hp = Math.min(player.maxHp, player.hp + heal);
        floatingTexts.push(new FloatingText(player.x, player.y - 34, "HP++", "#7cf28a"));
        candyBanner = { text: `* 你吃下了怪物糖。HP 回复了 ${heal} 点！`, t: 1.8 };
        questToasts(questEvent("candy", 1));
        explosions.push(new Explosion(player.x, player.y, 46, "#7cf28a", true));
        healFlash = 0.45;
        sfxCandy();
      } else if (pu.kind === "coin") {
        // in endless the coin rides in the round's pending pot: banked only
        // when the round is survived, lost if the player dies mid-round
        questToasts(questEvent("coins", pu.data.value));
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
      consumeRevive(); // the stocked item is spent
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
    if (pu.kind === "chest") {
      // little gold chest: body, lid seam, keyhole — pulsing glow
      ctx.save();
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 8 + 4 * Math.sin(elapsed * 5);
      ctx.fillStyle = "#a97b1e";
      ctx.fillRect(pu.x - 8, pu.y - 6, 16, 12);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(pu.x - 8, pu.y - 6, 16, 5);
      ctx.fillStyle = "#241f2b";
      ctx.fillRect(pu.x - 1.5, pu.y - 2, 3, 4);
      ctx.restore();
      continue;
    }
    if (pu.kind === "candy") {
      // little white candy with a pink swirl
      ctx.save();
      ctx.fillStyle = "#f6f2ea";
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c8b8c0";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#ff9ec4";
      ctx.beginPath();
      ctx.arc(pu.x + 1, pu.y - 1, 2, 0, Math.PI * 2);
      ctx.fill();
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

  // Named elite telegraphs: every dangerous skill announces its exact area.
  for (const e of enemies) {
    if (!e.eliteProfile) continue;
    for (const trail of e.eliteTrail || []) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, trail.t / 0.32) * 0.35;
      ctx.fillStyle = e.eliteProfile.color;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, e.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const cast = e.eliteCast;
    if (!cast) continue;
    const p = 1 - cast.t / cast.maxT;
    ctx.save();
    ctx.strokeStyle = e.eliteProfile.color;
    ctx.fillStyle = e.eliteProfile.color;
    ctx.lineWidth = 2 + p * 2;
    ctx.globalAlpha = 0.4 + p * 0.5;
    if (cast.skill === "leap") {
      ctx.beginPath();
      ctx.arc(cast.x, cast.y, 66 - p * 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha *= 0.16;
      ctx.fill();
    } else if (cast.skill === "rush") {
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(cast.x, cast.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 8 + p * 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (cast.skill === "gaze") {
      ctx.beginPath();
      ctx.arc(e.x, e.y, 45 + p * 145, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(e.x + Math.cos(a) * 26, e.y + Math.sin(a) * 26);
        ctx.lineTo(e.x + Math.cos(a) * (45 + p * 145), e.y + Math.sin(a) * (45 + p * 145));
        ctx.stroke();
      }
    } else if (cast.skill === "roots") {
      for (const mark of cast.marks) {
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 44 - p * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha *= 0.14;
        ctx.fill();
        ctx.globalAlpha = 0.4 + p * 0.5;
      }
    } else if (cast.skill === "dogCharge") {
      ctx.strokeStyle = p > 0.58 ? "#ffffff" : "#68bfff";
      ctx.lineWidth = 9 - p * 4;
      ctx.globalAlpha = 0.28 + p * 0.55;
      ctx.beginPath();
      ctx.moveTo(cast.fromX, cast.fromY);
      ctx.lineTo(cast.x, cast.y);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#d9ecff";
      ctx.stroke();
    } else if (cast.skill === "dummyVolley") {
      ctx.strokeStyle = p > 0.65 ? "#ff5d73" : "#ffd166";
      ctx.beginPath();
      ctx.arc(cast.x, cast.y, 76 - p * 35, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = elapsed * 3 + (i / 4) * Math.PI * 2;
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(cast.x + Math.cos(a) * 52 - 4, cast.y + Math.sin(a) * 52 - 4, 8, 8);
      }
    } else if (cast.skill === "moonfall") {
      for (let i = 0; i < cast.marks.length; i++) {
        const mark = cast.marks[i];
        ctx.globalAlpha = 0.3 + p * 0.65;
        ctx.strokeStyle = i % 2 === 0 ? "#e8e1ff" : "#9ff4ff";
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 48 - p * 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mark.x, mark.y - 34);
        ctx.lineTo(mark.x, mark.y + 34);
        ctx.moveTo(mark.x - 34, mark.y);
        ctx.lineTo(mark.x + 34, mark.y);
        ctx.stroke();
      }
    } else if (cast.skill === "webFeast") {
      for (const lane of cast.lanes) {
        const danger = lane === cast.dangerY;
        ctx.strokeStyle = danger ? (p > 0.55 ? "#ffffff" : "#d67cff") : "#7d4f92";
        ctx.globalAlpha = danger ? 0.45 + p * 0.5 : 0.28;
        ctx.lineWidth = danger ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(camX, lane);
        ctx.lineTo(camX + WIDTH, lane);
        ctx.stroke();
      }
    }
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
      const eliteColor = e.eliteProfile?.color || "#ffd166";
      ctx.strokeStyle = eliteColor;
      ctx.lineWidth = e.eliteProfile ? 3 : 2;
      ctx.globalAlpha = e.eliteProfile ? 0.7 + 0.25 * Math.sin(elapsed * 5 + e.id) : 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      if (e.eliteProfile) {
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 11, elapsed * 1.8, elapsed * 1.8 + Math.PI * 1.35);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = -elapsed * 1.5 + (i / 3) * Math.PI * 2;
          const r = e.radius + 15;
          ctx.save();
          ctx.translate(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r);
          ctx.rotate(a);
          ctx.fillStyle = eliteColor;
          ctx.fillRect(-2, -2, 4, 4);
          ctx.restore();
        }
        if (e.eliteTier >= 3) {
          ctx.globalAlpha = 0.38 + 0.2 * Math.sin(elapsed * 8);
          ctx.strokeStyle = "#ff3d5a";
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius + 19, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
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
    const spriteScale = e.championProfile
      ? 3.8
      : { bat: 2.2, tank: 3.2, ghost: 2.9, blue: 2.8, red: 2.7, purple: 2.7, orange: 3.0 }[e.sprite] || 2.6;
    const enemySprite = e.championProfile ? CHAMPION_SPRITES[e.championProfile.key] : ENEMY_SPRITES[e.sprite];
    drawSprite(ctx, enemySprite, e.x, e.y, e.radius * spriteScale);
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
        if (soulEq.id === "goldenflower") {
          // golden petals flutter down, spinning as they fall
          ctx.translate(s.x, s.y + s.t * 26);
          ctx.rotate(s.t * 5 + (s.x % 6));
          ctx.fillStyle = "#ffd93d";
          ctx.beginPath();
          ctx.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff3b0";
          ctx.beginPath();
          ctx.ellipse(1.2, -0.4, 2, 1, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawSprite(ctx, soulHeartSprite(soulEq.color), s.x, s.y, 9 + s.t * 6);
        }
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

  // UT-style narration line when a candy is eaten
  if (candyBanner && (state === "playing" || state === "choice")) {
    const a = Math.min(1, candyBanner.t / 0.5);
    ctx.save();
    ctx.globalAlpha = a;
    const bw = 480;
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(WIDTH / 2 - bw / 2, HEIGHT - 92, bw, 34);
    ctx.strokeStyle = "#7cf28a";
    ctx.lineWidth = 2;
    ctx.strokeRect(WIDTH / 2 - bw / 2, HEIGHT - 92, bw, 34);
    ctx.textAlign = "center";
    ctx.fillStyle = "#7cf28a";
    ctx.font = "bold 14px monospace";
    ctx.fillText(candyBanner.text, WIDTH / 2, HEIGHT - 70);
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
    if (activeContract) {
      ctx.fillStyle = "#d9c47a";
      ctx.fillText(`⚖ 「${activeContract.name}」`, WIDTH - 16, endlessRound > 0 ? 158 : dailyMode ? 104 : 86);
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
    drawTitleScreen(
      ctx,
      WIDTH,
      HEIGHT,
      [PLAYER_SPRITES.sans],
      getCoins(),
      codexCompletion(),
      `${unlockedAllEchoCount()}/${ALL_ECHOES.length}`,
      `${questView().filter((q) => q.done).length}/3`,
      flowerGiftLine,
      titleMenuOpen,
      questView().some((q) => !q.done) // gold dot: bounties waiting
    );
  } else if (state === "shop") {
    drawShopScreen(
      ctx,
      WIDTH,
      HEIGHT,
      shopItems(),
      getCoins(),
      shopTab,
      visibleCosmetics().map((c) => ({
        ...c,
        owned: cosmeticOwned(c.id),
        equipped: equippedCosmetic()?.id === c.id || equippedBoneSkin()?.id === c.id,
      })),
      shopTab === 0 ? metaBonusLine() : cosmeticEquipLine(),
      COSMETICS_SHOP_ENABLED
    );
  } else if (state === "codex") {
    const st = getStats();
    const monsters = CODEX_MONSTERS.map((m) => ({
      ...m,
      sprite: CHAMPION_SPRITES[m.key] || ENEMY_SPRITES[m.type],
      kills: st.killsByType[m.key] || 0,
      elite: m.key.startsWith("elite_") || m.key.startsWith("champion_"),
      champion: m.key.startsWith("champion_"),
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
    drawCodexScreen(ctx, WIDTH, HEIGHT, monsters, st.bossKills, weaponRows, codexCompletion(), codexSelected);
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
      diffPills(),
      Object.fromEntries(
        CHARACTERS.map((c) => {
          const k = getStats().charKills[c.id] || 0;
          return [c.id, { lvl: masteryOf(k), kills: k, next: masteryNextAt(masteryOf(k)) }];
        })
      )
    );
  } else if (state === "select") {
    drawWeaponSelect(ctx, WIDTH, HEIGHT, currentWeaponList(), selectedWeapon, currentCharacter().name, weaponLocks());
    if (CONTRACTS_ENABLED) drawContractChips(ctx, WIDTH, HEIGHT, offeredContracts, selectedContract);
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
    // 本局属性面板(左)+ 外观与称号(右)——暂停就是查看构筑的地方
    ctx.save();
    const px0 = 36;
    const py0 = 130;
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(px0, py0, 240, 246);
    ctx.strokeStyle = "#5a5468";
    ctx.strokeRect(px0, py0, 240, 246);
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 14px monospace";
    ctx.fillText("本局属性", px0 + 14, py0 + 24);
    ctx.fillStyle = "#e8e2d4";
    ctx.font = "12px monospace";
    const regenNow = player.regen + player.maxHp * player.regenPct;
    [
      `攻击 ${player.atk}  增伤 ${Math.round(player.dmgAmp * 100)}%`,
      `生命 ${Math.ceil(player.hp)}/${player.maxHp}`,
      `回血 ${regenNow.toFixed(1)}/秒`,
      `移速 ${Math.round(player.moveSpeed)}  攻速 ${player.fireRate.toFixed(2)}`,
      `减伤 ${Math.round(player.dmgReduction * 100)}%  闪避 ${Math.round(player.dodge * 100)}%`,
      `荆棘 ${player.thorns}  磁吸 ${Math.round(player.magnetRadius)}`,
      `射程 ${Math.round(player.range)}  等级 ${player.level}`,
      `复活可用 ${player.revives}`,
    ].forEach((line, i) => ctx.fillText(line, px0 + 14, py0 + 50 + i * 24));
    const qx0 = WIDTH - 276;
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(qx0, py0, 240, 130);
    ctx.strokeStyle = "#5a5468";
    ctx.strokeRect(qx0, py0, 240, 130);
    ctx.fillStyle = "#c59bff";
    ctx.font = "bold 14px monospace";
    ctx.fillText("外观与称号", qx0 + 14, py0 + 24);
    ctx.font = "12px monospace";
    const soulNow = equippedCosmetic();
    ctx.fillStyle = soulNow ? soulNow.color : "#7d7690";
    ctx.fillText(`灵魂加护:${soulNow ? soulNow.name : "无(商店可购)"}`, qx0 + 14, py0 + 50);
    if (soulNow) drawSprite(ctx, soulHeartSprite(soulNow.color), qx0 + 216, py0 + 46, 12);
    const boneNow = equippedBoneSkin();
    ctx.fillStyle = boneNow ? boneNow.color : "#7d7690";
    ctx.fillText(`骨之涂装:${boneNow ? boneNow.name : "默认白骨"}`, qx0 + 14, py0 + 76);
    ctx.fillStyle = "#c8c2d4";
    ctx.fillText(`称号:${bestTitle() ? "「" + bestTitle().name + "」" : "无"}`, qx0 + 14, py0 + 102);
    ctx.restore();
    ctx.textAlign = "center";
    drawResumeButton(ctx, WIDTH, HEIGHT);
    drawQuitButton(ctx, WIDTH, HEIGHT);
  } else if (state === "choice") {
    drawChoiceScreen(ctx, WIDTH, HEIGHT, choiceOptions, choiceRerollsLeft);
  } else if (state === "quests") {
    drawQuestsScreen(ctx, WIDTH, HEIGHT, questView());
  } else if (state === "echoes") {
    drawEchoField(
      ctx,
      WIDTH,
      HEIGHT,
      ALL_ECHOES.map((e) => ({
        title: e.title,
        hint: e.hint,
        unlocked: echoUnlocked(e.id),
        color: e.color || "#6bd0ff",
        bud: e.color ? tintedEcho(ECHO_BUD, e.color) : ECHO_BUD,
        bloom: e.color ? tintedEcho(ECHO_BLOOM, e.color) : ECHO_BLOOM,
      })),
      unlockedAllEchoCount()
    );
  } else if (state === "echoread") {
    if (echoRead) drawEchoRead(ctx, WIDTH, HEIGHT, echoRead.echo, echoRead.chars, ECHO_BLOOM);
  } else if (state === "dailyintro") {
    const seed = dailySeed();
    drawDailyIntro(
      ctx,
      WIDTH,
      HEIGHT,
      {
        date: todayKey(),
        charName: CHARACTERS[seed % CHARACTERS.length].name,
        best: parseInt(localStorage.getItem("daily_" + todayKey()) || "0", 10) || 0,
      },
      bossClearChoice
    );
  } else if (state === "chest" && chestCeremony) {
    // ---- slot-machine chest ceremony ----
    ctx.save();
    ctx.fillStyle = "rgba(6, 5, 12, 0.88)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    // the chest itself
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2 - 110;
    const open = chestCeremony.phase === "reveal";
    ctx.save();
    ctx.shadowColor = "#ffd166";
    ctx.shadowBlur = open ? 30 : 14;
    ctx.fillStyle = "#a97b1e";
    ctx.fillRect(cx - 44, cy - 20, 88, 52);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(cx - 44, cy - (open ? 44 : 20), 88, 24);
    ctx.fillStyle = "#241f2b";
    ctx.fillRect(cx - 5, cy + 2, 10, 14);
    ctx.restore();
    if (chestCeremony.phase === "spin") {
      // spinning reel of possible prizes
      const icons = ["ⓖ", "◆", "♥", "▲", "★"];
      const colors = ["#ffd166", "#ff8fc7", "#7cf28a", "#7ea8ff", "#c59bff"];
      const idx = chestCeremony.lastTick % icons.length;
      ctx.font = "bold 56px monospace";
      ctx.fillStyle = colors[(idx + icons.length) % icons.length];
      ctx.fillText(icons[(idx + icons.length) % icons.length], cx, cy + 130);
      ctx.fillStyle = "#9a93ab";
      ctx.font = "13px monospace";
      ctx.fillText("命运正在滚动…… (点击跳过)", cx, cy + 176);
    } else {
      const n = chestCeremony.rewards.length;
      ctx.fillStyle = n >= 5 ? "#ffd93d" : n >= 3 ? "#ffd166" : "#f2ead8";
      ctx.font = `bold ${n >= 5 ? 34 : 26}px monospace`;
      ctx.fillText(n >= 5 ? "★ 五 连 大 奖 ★" : n >= 3 ? "三 连 奖 !" : "战 利 品", cx, cy + 96);
      const w = 150;
      const gap = 12;
      const total = n * w + (n - 1) * gap;
      const pop = Math.min(1, chestCeremony.t / 0.25);
      chestCeremony.rewards.forEach((rw, i) => {
        const x = cx - total / 2 + i * (w + gap);
        const y = cy + 120;
        ctx.save();
        ctx.globalAlpha = pop;
        ctx.fillStyle = "#1d1828";
        ctx.fillRect(x, y, w, 84 * pop);
        ctx.strokeStyle = rw.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, 84 * pop);
        if (pop >= 1) {
          ctx.fillStyle = rw.color;
          ctx.font = "bold 30px monospace";
          ctx.fillText(rw.icon, x + w / 2, y + 40);
          ctx.font = "bold 12px monospace";
          ctx.fillText(rw.label, x + w / 2, y + 68);
        }
        ctx.restore();
      });
      ctx.fillStyle = "#9a93ab";
      ctx.font = "13px monospace";
      ctx.fillText("点击收下,继续战斗", cx, cy + 240);
    }
    ctx.restore();
    ctx.textAlign = "left";
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
      ...(nearMiss ? [{ text: nearMiss, font: "bold 13px monospace", color: "#ff8a5d" }] : []),
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
      ...(activeContract ? [{ text: `⚖ 契约「${activeContract.name}」`, font: "13px monospace", color: "#d9c47a" }] : []),
      { text: `金币 +${lastRunCoins}  (钱包 ${getCoins()} · 标题页可进强化商店)`, font: "14px monospace", color: "#ffd166" },
      ...(bestTitle() ? [{ text: `称号:「${bestTitle().name}」`, font: "13px monospace", color: "#c59bff" }] : []),
      ...(runOutcome === "victory" && getDifficulty().id < 3
        ? [{ text: "⚠ 觉得太简单？选人页可切换 狂暴/地狱 难度,金币加成更高", font: "13px monospace", color: "#ff8a5d" }]
        : []),
      ...lastNewTitles.map((n) => ({ text: `★ 新称号解锁:「${n}」`, font: "13px monospace", color: "#7cf28a" })),
      ...lastNewEchoes.map((n) => ({ text: `❀ 回响解锁:「${n}」(标题页❀回响聆听)`, font: "13px monospace", color: "#6bd0ff" })),
      ...(lastGoldenFlower ? [{ text: "❀ 花田满开——「金色之花」已绽放", font: "bold 13px monospace", color: "#ffd93d" }] : []),
      ...lastNewQuests.map((n) => ({ text: `📜 悬赏完成:${n}`, font: "13px monospace", color: "#ffd166" })),
      ...(lastMasteryUp ? [{ text: lastMasteryUp, font: "13px monospace", color: "#7cf28a" }] : []),
      ...(deathQuote ? [{ text: deathQuote, font: "13px monospace", color: "#8fa8c9" }] : []),
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
    drawShareButton(ctx, WIDTH, HEIGHT);
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
  } else if (bgm.src && (state === "playing" || state === "choice" || state === "chest")) {
    // the music ducks during the boss warning so the siren reads clearly
    fadeAudio(bgm, gameVolTarget() * (bossWarnActive() ? 0.25 : 1), dt, 1.1);
  } else {
    fadeAudio(bgm, 0, dt, 1.5); // gameover / back to menu
  }

  if (deathShatter && state === "gameover") deathShatter.t += dt;
  if (state === "chest" && chestCeremony) {
    chestCeremony.t += dt;
    if (chestCeremony.phase === "spin") {
      // decelerating slot ticks: fast at first, sparse near the stop
      const p = Math.min(1, chestCeremony.t / 1.5);
      const step = Math.floor(16 * (1 - Math.pow(1 - p, 2)));
      if (step !== chestCeremony.lastTick) {
        chestCeremony.lastTick = step;
        sfxChestTick(p);
      }
      if (chestCeremony.t >= 1.5) chestAdvance(); // auto-open at full spin
    }
  }
  if (state === "echoread" && echoRead && !echoRead.done) {
    echoRead.t += dt;
    const want = Math.floor(echoRead.t * 26); // ~26 chars/sec, UT cadence
    if (want > echoRead.chars) {
      echoRead.chars = want;
      sfxType();
    }
    const total = echoRead.echo.lines.reduce((s, l) => s + l.length, 0);
    if (echoRead.chars >= total) echoRead.done = true;
  }
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
