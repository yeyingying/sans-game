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
  PROJECTILE_BONE_CRIMSON,
  PROJECTILE_AXE,
  GB_IDLE,
  GB_FIRE,
  GB_IDLE_CRIMSON,
  GB_FIRE_CRIMSON,
  IHAND_OPEN,
  IHAND_CLENCH,
  PICKUP_XP,
  ICONS,
  drawPixelIcon,
  drawIconLabel,
  drawSprite,
  tintSprite,
} from "./sprites.js";
import {
  Player,
  Enemy,
  Projectile,
  Bomb,
  Explosion,
  Spike,
  Pickup,
  FloatingText,
  PLAYER_MAX_HP,
  PLAYER_FIRE_RATE_CAP,
} from "./entities.js?v=s2-20260726-td-balance1";
import { Spawner, roundCoinFactor } from "./spawner.js?v=s2-20260726-td-balance1";
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
  getIGBState,
  getHandFx,
  getHookInfo,
  getPounceInfo,
  getScytheSwing,
  getSlashWaves,
  getRideInfo,
  getTurretBones,
  createWeaponInstance,
  applyLevelUpBonus,
  weaponSummary,
  canEvolve,
} from "./weapon.js?v=s2-20260726-td-balance1";
import { rollEquipmentDrop, EQUIPMENT_TYPES } from "./items.js";
import { ECHOES, CHAR_ECHOES, ALL_ECHOES, ECHO_BUD, ECHO_BLOOM, echoUnlocked, unlockEcho, unlockedEchoCount, unlockedAllEchoCount, randomEchoQuote } from "./echo.js";
import {
  getCoins,
  addCoins,
  spendCoins,
  UPGRADES,
  upgradeLevel,
  upgradeCost,
  upgradeGate,
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
  isWeaponUnlocked,
  weaponUnlockInfo,
  isCharUnlocked,
  charUnlockInfo,
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
  sfxChestLand,
} from "./sfx.js";
import { createBossFight, BOSS_APPEAR_TIME } from "./boss.js";
import { circleHit } from "./utils.js";
import { initLeaderboard, loadLeaderboard, beginRankedRun, recordRankedStageClear, finishRankedRun, cancelRankedRun, reportRankedRun, rankedRunStatus, drawLeaderboard, leaderboardTap } from "./leaderboard.js?v=s2-20260716-4";

import { utPrompt, utNotice } from "./dialog.js?v=s2-20260718-debug1";
import { t, pick, currentLang, toggleLang } from "./i18n.js";

// bump when scoring/balance changes meaningfully — telemetry is sliced by this
const GAME_VERSION = "s2-20260718"; // 无尽首领强化+成长硬上限+回血卡曲线
import {
  BASE_MONSTERS,
  CODEX_MONSTERS,
  CORRUPTED_SANS,
  codexKeyForEnemy,
  championForRound,
  eliteProfilePool,
} from "./codex.js";
import { CHAMPION_SPRITES } from "./champion_sprites.js";
import {
  pickSavepointQuote,
  barkFor,
  pickDeathLine,
  pickLoveJudgment,
  narrativeDeathStreak,
  recordNarrativeDeath,
  resetNarrativeDeathStreak,
  unseenChapters,
  markChapterSeen,
  pickDogLine,
  pickFlowerLine,
  championEntrance,
  pickShareRoast,
  codexNote,
  pickPauseTip,
  pickRelic,
  sixSoulsLine,
  codexCheck,
  funGlitchSavepoint,
  gasterGhostLine,
  gasterGhostSub,
  funFlowerLine,
  spareNarration,
  temLine,
  shopDenyLine,
  bossAnthemLine,
  pickPapyrusLetter,
  coachLine,
} from "./narrative.js";
import {
  TD_CELL,
  tdBuildMap,
  tdCellAt,
  tdCellCenter,
  tdNewRun,
  tdMakeTowerPP,
  tdWeaponAllowed,
  tdTargetFor,
  tdAtGate,
  tdHitEntrance,
  tdEntranceTick,
  tdXpFor,
  tdPlaceCost,
  tdMeasuredDps,
  tdConfigureBoss,
  tdTestHooksAllowed,
  tdKillCredit,
  tdDirectCoinDrop,
  drawTdField,
  drawTdEntranceHud,
  drawTdBar,
  drawModeSelect,
  drawTdPick,
  tdModeOptions,
  modeOptionRect,
  tdPickCharRect,
  tdPickWeaponRect,
  tdRosterSlotRect,
  tdStartRect,
  tdBarSlotRect,
} from "./td.js?v=s2-20260726-rules1";
import {
  drawHud,
  drawCenterText,
  drawCharSelect,
  charBoxRect,
  drawWeaponSelect,
  weaponBoxRect,
  confirmButtonRect,
  backButtonRect,
  drawBackButton,
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
  codexPageRect,
  charPageArrowRect,
  drawCodexScreen,
  dailyButtonRect,
  leaderboardButtonRect,
  bossClearLeaveRect,
  bossClearContinueRect,
  drawBossClearScreen,
  drawDailyIntro,
  IS_TOUCH,
  echoButtonRect,
  menuButtonRect,
  muteButtonRect,
  drawMuteButton,
  langButtonRect,
  drawLangButton,
  titleMenuItemRect,
  bookCharPillRect,
  bookRowRect,
  drawWeaponBook,
  questButtonRect,
  shareButtonRect,
  drawShareButton,
  homeButtonRect,
  drawHomeButton,
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
} from "./ui.js?v=s2-20260726-a11y1";

const canvas = document.getElementById("game");
const srStatus = document.getElementById("game-status");
const BASE_WIDTH = 960;
const BASE_HEIGHT = 600;

function announceGame(text) {
  if (srStatus) srStatus.textContent = text;
}

let lastCanvasA11yLabel = "";
function syncCanvasA11y() {
  const screenNames = {
    title: t("主菜单", "Main menu"),
    modeselect: t("模式选择", "Mode select"),
    tdpick: t("塔防编队", "Tower defense squad"),
    charselect: t("角色选择", "Character select"),
    weaponselect: t("技能选择", "Skill select"),
    playing: tdMode ? t("塔防战斗", "Tower defense battle") : t("经典战斗", "Classic battle"),
    paused: t("暂停", "Paused"),
    choice: t("升级选择", "Upgrade select"),
    gameover: t("结算", "Results"),
    leaderboard: t("排行榜", "Leaderboard"),
    shop: t("商店", "Shop"),
    codex: t("图鉴", "Codex"),
  };
  const label = `${t("Sans 割草游戏", "Sans Survival")}：${screenNames[state] || t("游戏画面", "Game screen")}`;
  if (label !== lastCanvasA11yLabel) {
    canvas.setAttribute?.("aria-label", label);
    lastCanvasA11yLabel = label;
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function usePhoneCanvas() {
  const sw = window.screen?.width || window.innerWidth;
  const sh = window.screen?.height || window.innerHeight;
  return Math.min(sw, sh) <= 500 && Math.max(sw, sh) <= 950;
}

// ?phone: debug-force the phone canvas on desktop (排版/截图验收用)
if (usePhoneCanvas() || new URLSearchParams(location.search).has("phone")) {
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
  red: CHAMPION_SPRITES.base_loox || tintSprite(ENEMY_LOOX, "#e05555", 0.3),
  orange: tintSprite(ENEMY_MADJICK, "#f09a4a", 0.3),
  blue: tintSprite(ENEMY_WOSHUA, "#5aa8e0", 0.3),
  purple: tintSprite(ENEMY_ICECAP, "#9a86e8", 0.3),
};
// 手掌幻影: 全红重染(2026-07-15 用户裁决,配合渲染处的半透明)
const IHAND_OPEN_RED = tintSprite(IHAND_OPEN, "#e01030", 0.85);
const IHAND_CLENCH_RED = tintSprite(IHAND_CLENCH, "#e01030", 0.85);
// ---- 谜之宝箱像素贴图(2026-07-12 美术重做,champion_sprites 同工艺) --------
function buildPx(rows, palette) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d");
  if (g && g.fillRect) {
    rows.forEach((row, y) => {
      [...row].forEach((chx, x) => {
        const col = palette[chx];
        if (col) {
          g.fillStyle = col;
          g.fillRect(x, y, 1, 1);
        }
      });
    });
  }
  return cv;
}
const CHEST_PAL = { k: "#14101c", G: "#a8741a", g: "#ffd166", l: "#e0a45c", w: "#8a5527", d: "#5c3517", h: "#fff3b0" };
// 盖(22×7)与箱体(22×9)分开建,开箱动画直接拿盖子飞
const CHEST_LID = buildPx(
  [
    ".......kkkkkkkk.......",
    "....kkkggggggggkkk....",
    "..kkgggllllllllgggkk..",
    ".kgggllwwwwwwwwllgggk.",
    ".kggwwwwwwwwwwwwwwggk.",
    ".kGgggggggggggggggggk.",
    ".kkkkkkkkkkkkkkkkkkkk.",
  ],
  CHEST_PAL
);
// 开盖帧 = 盖子内侧正对镜头:大面积发亮内衬立在箱口上,一眼即「开」
const CHEST_LID_OPEN = buildPx(
  [
    "...kkkkkkkkkkkkkkkk...",
    "..kgghhhhhhhhhhhhggk..",
    ".kghhhhhhhhhhhhhhhhgk.",
    ".kghhhhhhhhhhhhhhhhgk.",
    ".kghhhhhhhhhhhhhhhhgk.",
    ".kghhhhhhhhhhhhhhhhgk.",
    ".kgghhhhhhhhhhhhhhggk.",
    ".kkkkkkkkkkkkkkkkkkkk.",
    "..kGGGGGGGGGGGGGGGGk..",
  ],
  CHEST_PAL
);
const CHEST_BASE = buildPx(
  [
    ".kkkkkkkkkkkkkkkkkkkk.",
    ".kGggggggggggggggggGk.",
    ".kdwwwwwwwGGwwwwwwwdk.",
    ".kdwwwwwwGkkGwwwwwwdk.",
    ".kdwwwwwwwGkGwwwwwwdk.",
    ".kdwwwwwwwGGwwwwwwwdk.",
    ".kdwwwwwwwwwwwwwwwwdk.",
    ".kGggggggggggggggggGk.",
    ".kkkkkkkkkkkkkkkkkkkk.",
  ],
  CHEST_PAL
);

const CHOICE_INTERVAL = 15;
const WALL_H = 100; // top wall band: huge columns, no spawns, out of bounds
// portraits for the character-select screen (front-facing stand frame)
const PLAYER_SPRITES = {
  sans: WALK_SETS.sans.down[0],
  ukb: WALK_SETS.ukb.down[0],
  horror: WALK_SETS.horror.down[0],
  hard: WALK_SETS.hard.down[0],
  insanity: WALK_SETS.insanity.down[0],
  hacker: WALK_SETS.hacker.down[0],
};
// characters that radiate a glow, and its color(hacker=眼中红光的近似)
const CHAR_GLOWS = { ukb: "#a55dff", hard: "#5db9ff", insanity: "#d92535", hacker: "#ff2d3d" };
// 付费角色天性梯度(2026-07-14 用户裁决: 票价越高天性越强)
const CHAR_NATURE = {
  insanity: { dmg: 0.15, hp: 1.15 },
  hacker: { dmg: 0.2, hp: 1.2 },
};

// ---- 付费角色解锁(own_<id> 持久化;黑客结局另需地狱通关) ----------------------
function charOwned(id) {
  return localStorage.getItem("own_" + id) === "1";
}
// 结算页"再来一局": 回到本局所属模式(2026-07-27 用户反馈——塔防死后
// 被丢进经典选人,一路点下去就开了经典局)。塔防回编队页且保留上局编队。
function restartSameMode() {
  if (tdMode) {
    tdKeyboardFocus = { zone: "char", index: 0 };
    state = "tdpick";
    return;
  }
  toCharSelect();
}

function charLocksNow() {
  const locks = {};
  for (const c of CHARACTERS) {
    if (c.cost) {
      if (charOwned(c.id)) continue;
      const gated = c.gate === "hell" && (getStats().diffCleared ?? -1) < 2;
      locks[c.id] = gated
        ? { hint: t("地狱难度通关后可购", "Clear HELL to purchase"), progress: `${t("买断价", "Price")} ${c.cost}`, cost: c.cost, gated: true }
        : { hint: `${c.cost} ${t("金币买断", "coins to own")}`, progress: `${t("钱包", "Wallet")} ${getCoins()}`, cost: c.cost };
      continue;
    }
    // 免费角色条件锁(2026-07-27 用户复现"全角色解锁"): meta.js 的
    // isCharUnlocked/charUnlockInfo 自付费角色改版后一直没人调用——
    // 击杀/Boss 门槛只写在数据里,渲染和确认都没拦。此处接回,
    // 绘制层(剪影+锁+条件行)与 tdpick 的 locked 拦截自动复用
    if (!isCharUnlocked(c.id, bestScoreOf(c.id))) {
      const info = charUnlockInfo(c.id);
      locks[c.id] = { hint: info.hint, progress: info.progress, freeLock: true };
    }
  }
  return locks;
}
// 选中锁定角色时,确认键=购买;返回 true 表示这次输入已被购买流吃掉
function tryBuySelectedChar() {
  const c = CHARACTERS[selectedChar];
  const lock = charLocksNow()[c.id];
  if (!lock) return false;
  if (lock.freeLock) {
    sfxHurt(); // 免费角色条件锁: 不可购买,卡面已写解锁条件
    return true;
  }
  if (lock.gated) {
    sfxHurt(); // 门槛未过: 先通关地狱
    return true;
  }
  if (spendCoins(c.cost)) {
    localStorage.setItem("own_" + c.id, "1");
    sfxFanfare();
    utNotice({
      title: t(`${c.name} 已解锁`, `${pick(c, "name")} unlocked`),
      hint: c.id === "hacker"
        ? t("黑屋的守门人,拿起了改写代码的权柄。", "The dark room's gatekeeper takes up the right to rewrite.")
        : t("决心过量实验体,加入了你的选择。", "The DT-overdosed subject joins your roster."),
    });
  } else {
    sfxHurt();
  }
  return true;
}

let state = "title"; // title | charselect | select | playing | paused | choice | gameover | credits | shop | codex | bossclear
let selectedChar = 0;
// 选人分页(2026-07-14 用户裁决): 第1页本家四人,第2页付费「裂缝时间线」
let charPage = 0;
const CHAR_PAGES = () => [CHARACTERS.filter((c) => !c.cost), CHARACTERS.filter((c) => c.cost)];
const CHAR_PAGE_LABELS = () => [t("本家时间线", "Main Timeline"), t("裂缝时间线", "Rift Timelines")];
function charPageList() {
  return CHAR_PAGES()[charPage];
}
function globalCharIndex(localI) {
  return CHARACTERS.indexOf(charPageList()[localI]);
}
function switchCharPage(dir) {
  const pages = CHAR_PAGES();
  charPage = (charPage + dir + pages.length) % pages.length;
  selectedChar = CHARACTERS.indexOf(pages[charPage][0]);
}
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
// wall-clock seconds for ceremony/menu animations (game clock is paused there)
function elapsedWall() {
  return (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
}

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
let bossFightStartedAt = 0; // balance telemetry: actual encounter start
let bossPhaseReached = 0;
let bossHpPctAtEnd = 0;
let hpAtBossPct = 0;

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
// codex list length incl. the FUN 61-63 ghost record (drawn + clickable)
function codexListLength() {
  return CODEX_MONSTERS.length + (funValue >= 61 && funValue <= 63 ? 1 : 0);
}
let deathShatter = null; // UT-style white, inverted soul shatter on death {t, color}
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
// declared up here (not in the daily section) because reset() reads it at
// module load — daily runs are the standardized fair-play mode
let dailyMode = false;
// ---- 塔防模式状态(2026-07-16 新模式;逻辑集中在 src/td.js) ------------------
let tdMode = false; // 本局是塔防
let td = null; // tdNewRun() 的局状态(地图/入口/塔/经验/编队)
// TD 版天意侵蚀Sans(Phase 2): 走路径的特殊怪,不用 boss.js 决斗剧本。
// 美术=sans 走图整体侵蚀红染(左向,行军方向),四帧循环
const TD_BOSS_FRAMES = WALK_SETS.sans.left.map((f) => tintSprite(f, "#ff4f70", 0.55));
let tdPickSel = 0; // 选人页当前高亮角色索引
let tdPickRoster = []; // 选人页已选 [{char, weapon, charId, weaponId, cost, placed}]
let tdHoverCell = null; // 放置态悬停格(触屏=最后一次点击预览)
let modeKeyboardFocus = -1; // 模式页键盘焦点(-1=鼠标/触屏正在操作)
let tdKeyboardFocus = null; // 编队页键盘焦点 {zone:"char|weapon|roster|start",index}
let keyboardNavigation = false; // 只在键盘操作时显示可见焦点框
let bossDeathSnapped = false; // stage score freezes the frame the boss dies
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
  lastNewEchoes.push(pick(e, "title"));
  // the field is in full bloom: the golden flower chooses you
  if (unlockedEchoCount() >= ECHOES.length) {
    if (grantCosmetic("goldenflower")) {
      lastGoldenFlower = true;
      tipQueue.push({ title: t("花田满开", "Full bloom"), lines: [t("「金色之花」已自动绽放在你的灵魂上", "The Golden Flower now blooms on your soul")], t: 9 });
      sfxFanfare();
    }
    if (unlockTitle("listener")) lastNewTitles.push(t("聆听者", "The Listener"));
  }
  if (unlockedAllEchoCount() >= ALL_ECHOES.length && unlockTitle("watcher")) {
    lastNewTitles.push(t("守望者", "The Watcher"));
  }
  // in-run: floating tip card; at settlement the gameover card lists it
  if (state === "playing" || state === "choice") {
    tipQueue.push({ title: t(`回响解锁:「${e.title}」`, `Echo unlocked: '${pick(e, "title")}'`), lines: [t("标题页「回响」里,花会为你重述这段记忆", "The flower will retell it under Echoes on the title screen")], t: 8 });
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

function confirmTdIntro() {
  if (!tdMode || !td?.introPending) return false;
  td.introPending = false;
  if (activeTip?.confirm) activeTip = null;
  announceGame(t("塔防开始。守住左边入口。", "Tower defense started. Hold the left gate."));
  sfxClick();
  return true;
}

// death recap: what landed the killing blow ("死于:XXX" on the gameover screen)
const ENEMY_NAMES = Object.fromEntries(BASE_MONSTERS.map((m) => [m.type, m.name]));
// canon EN names come straight from the codex profiles' `english` field
const ENEMY_NAMES_EN = Object.fromEntries(BASE_MONSTERS.map((m) => [m.type, m.english]));
function enemyName(type) {
  return t(ENEMY_NAMES[type] || "怪物", ENEMY_NAMES_EN[type] || ENEMY_NAMES[type] || "a monster");
}
function enemyDisplayName(e) {
  if (e.championProfile) {
    const name = pick(e.championProfile, "name");
    return e.roundBoss ? t(`天意侵蚀·${name}`, `Corrupted · ${name}`) : name;
  }
  if (e.eliteProfile) return `${e.eliteTier >= 3 ? t("处决态·", "Executioner ") : ""}${pick(e.eliteProfile, "name")}`;
  return (e.elite ? t("精英·", "Elite ") : "") + enemyName(e.type);
}
let lastHitBy = null; // most recent damage source
let lastHitKind = null; // pool key for the killer's death line (type/elite/boss/hazard)
let lastDeathBy = null; // frozen at death for the gameover screen
let deathKillerLine = null; // killer-flavored narration under 死于:XXX
let loveVerdict = null; // {lines} LOVE judgment for the settlement card
let savepointNote = null; // {text, t} savepoint aphorism typed out at run start
// ---- 新手引导(2026-07-14 用户点名"小白也能懂"): 首局分步教学 ----------------
// 每步只教一件事,一行大白话,做对了自动进下一步;可跳过,完成后永不再弹
let tutorialStep = -1; // -1=关闭
let tutorialStepT = 0; // 当前步已显示时长
let tutorialMoved = 0; // 第一步累计移动量(按实际位移测,与输入管线解耦)
let tutorialPX = null;
let tutorialPY = null;
let tutorialChoseCard = false;
const TUTORIAL_MIN_T = 1.2; // 每步至少露脸1.2s,防瞬跳
function tutorialSteps() {
  return [
    { text: IS_TOUCH ? t("拖动屏幕任意位置——移动", "Drag anywhere to move") : t("方向键或 WASD——移动", "Arrow keys / WASD to move"), done: () => tutorialMoved > 140 },
    { text: t("武器全自动开火,你只管走位", "Weapons fire on their own — just dodge"), done: () => player.kills >= 1 },
    { text: t("捡绿色经验点,攒满就升级", "Grab green XP to level up"), done: () => player.level > 1 || player.xp >= 3 },
    { text: t("每15秒弹三选一,选卡变强", "Every 15s: pick 1 of 3 upgrades"), done: () => tutorialChoseCard },
    { text: t("金币死了也带走,商店里换永久强化", "Coins persist — spend them in the shop"), done: () => runCoins > 0 },
    { text: t("目标:活到 5:00。他会来的。", "Goal: survive to 5:00. He is coming."), done: () => tutorialStepT > 5 },
  ];
}
function tutorialBannerRect(w) {
  const bw = IS_TOUCH ? 470 : 430;
  return { x: w / 2 - bw / 2, y: IS_TOUCH ? 108 : 96, w: bw, h: IS_TOUCH ? 44 : 34 };
}
function tutorialSkipRect(w) {
  const b = tutorialBannerRect(w);
  return { x: b.x + b.w - (IS_TOUCH ? 92 : 78), y: b.y, w: IS_TOUCH ? 92 : 78, h: b.h };
}
function endTutorial() {
  tutorialStep = -1;
  localStorage.setItem("tutorialDone", "1");
}
let bark = null; // {text, t} one-liner bubble above the player's head
let barkFired = {}; // per-run: each bark event speaks at most once
let chapterQueue = []; // 审判纪元 chapters earned this settlement, story order
let chapterShow = null; // {chapter, line, t} the cutscene being typed out
let shareRoast = null; // 裂缝外锐评 line for the share card
let pauseTip = null; // 小贴士 picked fresh each time the game pauses
let coachAdvice = null; // 裂缝外攻略组: the actionable line after a pre-boss death
let reviveArmed = 0; // revives carried into this run (telemetry baseline)
let tapFlash = null; // {x,y,w,h,t} white pop on the button a tap landed on
let gameoverDetail = false; // settlement page 2: unlock feed & build details

// 本局装备累计 → one compact line (提交A: 捡了什么要看得见)
function runEquipSummary() {
  const per = { atk: [t("攻击", "ATK"), 2], range: [t("射程", "Range"), 12], rapid: [t("攻速", "Rate"), 0.1], boots: [t("移速", "Speed"), 10], heart: [t("生命", "HP"), 12], core: [t("品阶", "Tier"), 1] };
  const parts = [];
  for (const [id, n] of Object.entries(runEquip)) {
    const def = per[id];
    if (!def) continue;
    const total = def[1] * n;
    parts.push(`${def[0]} +${Number.isInteger(total) ? total : total.toFixed(1)}`);
  }
  return parts.join(" · ");
}

// toggle sits above the share/home/upgrade button row
function gameoverDetailRect(w, h) {
  // 触屏: 30px高在手机上不到20物理px,放大到44
  return IS_TOUCH ? { x: w / 2 - 132, y: h - 122, w: 264, h: 44 } : { x: w / 2 - 120, y: h - 104, w: 240, h: 30 };
}

// the ONE primary action on the settlement screen (2026-07-12 评审:
// 结算页只保留一个主行动) — big, gold, thumb-sized
function restartButtonRect(w, h) {
  return IS_TOUCH ? { x: w / 2 - 140, y: h - 186, w: 280, h: 58 } : { x: w / 2 - 130, y: h - 164, w: 260, h: 48 };
}

// 缴械黑白化: 每张原图只算一次灰阶,WeakMap 缓存(黑客结局体系)
const grayCache = new WeakMap();
function grayscaleOf(spr) {
  if (!spr) return spr;
  const hit = grayCache.get(spr);
  if (hit) return hit;
  let out = spr;
  try {
    const c = document.createElement("canvas");
    c.width = spr.width;
    c.height = spr.height;
    const g = c.getContext("2d");
    g.drawImage(spr, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const y = Math.round(d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11);
      d[i] = d[i + 1] = d[i + 2] = y;
    }
    g.putImageData(img, 0, 0);
    out = c;
  } catch {
    /* headless/污染画布: 原图兜底 */
  }
  grayCache.set(spr, out);
  return out;
}

// Enemy art normalization keeps a shared visual grammar without flattening the
// hierarchy: common monsters stay compact, named elites read one tier larger,
// and endless champions remain unmistakably boss-sized.  External sprites keep
// their native aspect ratio; only their display band and anchor are normalized.
const enemyHitMaskCache = new WeakMap();
const FLOATING_ENEMY_ART = new Set([
  "bat",
  "ghost",
  "blue",
  "elite_whimsalot",
  "elite_astigmatism",
  "elite_migospel",
  "elite_pyrope",
  "elite_memoryhead",
  "elite_reaper_bird",
  "champion_glyde",
]);

function whiteSilhouetteOf(spr) {
  if (!spr) return spr;
  const hit = enemyHitMaskCache.get(spr);
  if (hit && hit.w === spr.width && hit.h === spr.height) return hit.canvas;
  let out = spr;
  try {
    const c = document.createElement("canvas");
    c.width = spr.width;
    c.height = spr.height;
    const g = c.getContext("2d");
    g.drawImage(spr, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] <= 8) continue;
      d[i] = d[i + 1] = d[i + 2] = 255;
    }
    g.putImageData(img, 0, 0);
    out = c;
  } catch {
    /* headless/污染画布: 原图兜底 */
  }
  enemyHitMaskCache.set(spr, { w: spr.width, h: spr.height, canvas: out });
  return out;
}

function enemyArtLayout(e, spr) {
  const key = e.championProfile?.key || e.eliteProfile?.key || e.sprite;
  const champion = !!e.championProfile;
  const namedElite = !champion && !!e.eliteProfile;
  const genericElite = !champion && !namedElite && e.elite;
  // Height bands preserve rank at a glance. Width caps keep unusually wide
  // source art (e.g. Royal Guards) from covering nearby threats.
  const targetH = champion
    ? Math.max(72, Math.min(92, e.radius * 4.1))
    : namedElite
      ? Math.max(48, Math.min(62, e.radius * 3.05))
      : genericElite
        ? Math.max(40, Math.min(52, e.radius * 2.75))
        : Math.max(22, Math.min(36, e.radius * 2.45));
  const maxW = champion ? 128 : namedElite ? 86 : genericElite ? 70 : 46;
  const scale = Math.min(targetH / Math.max(1, spr.height), maxW / Math.max(1, spr.width));
  const w = Math.max(1, Math.round(spr.width * scale));
  const h = Math.max(1, Math.round(spr.height * scale));
  const floating = FLOATING_ENEMY_ART.has(key);
  const x = Math.round(e.x - w / 2);
  const y = floating
    ? Math.round(e.y - h / 2)
    : Math.round(e.y + e.radius * 0.72 - h);
  return {
    x,
    y,
    w,
    h,
    footY: floating ? Math.round(e.y + Math.min(e.radius * 0.72, h * 0.42)) : y + h,
    champion,
    namedElite,
    genericElite,
  };
}

function drawEnemyArt(ctx, spr, box, alpha = 1) {
  if (!spr) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha *= alpha;
  ctx.drawImage(spr, box.x, box.y, box.w, box.h);
  ctx.restore();
}

function drawEnemyRankAura(ctx, e, box) {
  if (!e.elite) return;
  const color = e.eliteProfile?.color || "#ffd166";
  const pulse = 0.5 + 0.5 * Math.sin(elapsed * (box.champion ? 4.2 : 3.2) + e.id);
  const halfW = Math.max(e.radius * 0.95, Math.min(box.w * 0.46, box.champion ? 58 : 38));
  const halfH = box.champion ? 11 : box.namedElite ? 8 : 6;
  ctx.save();
  ctx.translate(Math.round(e.x), box.footY + 2);
  // Generic elites get one restrained gold footprint; named elites use their
  // identity color; champions add a second boss ring and four cardinal marks.
  ctx.fillStyle = color;
  ctx.globalAlpha = box.champion ? 0.12 + pulse * 0.06 : 0.07 + pulse * 0.04;
  ctx.beginPath();
  ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = box.champion ? 3 : box.namedElite ? 2 : 1.5;
  ctx.globalAlpha = box.champion ? 0.85 : box.namedElite ? 0.72 : 0.58;
  if (box.namedElite && !box.champion) ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  if (box.champion) {
    ctx.globalAlpha = 0.38 + pulse * 0.25;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW + 7, halfH + 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    for (const [dx, dy] of [[-halfW - 8, 0], [halfW + 8, 0], [0, -halfH - 6], [0, halfH + 6]]) {
      ctx.save();
      ctx.translate(Math.round(dx), Math.round(dy));
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    }
  }
  ctx.restore();
}

// 结算印章(美术批 backlog 第4项): 结果不靠读字,一眼可辨——
// 通关=金色星章 / 阵亡=尖端朝上的破碎白心 / 无尽终局与撤离=紫红审判刻度
function stampFromMap(rows, palette) {
  const c = document.createElement("canvas");
  c.width = Math.max(...rows.map((r) => r.length));
  c.height = rows.length;
  const g = c.getContext("2d");
  for (let y = 0; y < rows.length; y++)
    for (let x = 0; x < rows[y].length; x++) {
      const col = palette[rows[y][x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  return c;
}
const STAMPS = {
  victory: stampFromMap([
    "......G......",
    ".....GGG.....",
    ".....GGG.....",
    "....GGGGG....",
    "GGGGGGGGGGGGG",
    ".gGGGGGGGGGg.",
    "..gGGGGGGGg..",
    "...gGGGGGg...",
    "...gGGGGGg...",
    "..gGGg.gGGg..",
    ".gGg.....gGg.",
    ".g.........g.",
  ], { G: "#ffd166", g: "#b77a2a" }),
  death: stampFromMap([
    "......s......",
    ".....sSs.....",
    "....sS.Ss....",
    "...sSS.SSs...",
    "..sSSS.SSSs..",
    ".SSSSSS.SSSS.",
    "SSSSSS.SSSSSS",
    "SSSSS.SSSSSSS",
    "SSSSSS.SSSSSS",
    "SSSSSS.SSSSSS",
    ".SSSS...SSSS.",
  ], { S: "#ffffff", s: "#b8b8c4" }),
  judgment: stampFromMap([
    "......M......",
    ".....MMM.....",
    "......M......",
    "...mMMMMMm...",
    "......M......",
    "....mMMMm....",
    "......M......",
    "...mMMMMMm...",
    "......M......",
    "....mMMMm....",
    "......M......",
    ".....mmm.....",
  ], { M: "#e05dc9", m: "#8a2f96" }),
};
function drawStamp(ctx, kind, cx, cy, scale = 4) {
  const s = STAMPS[kind];
  if (!s) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    s,
    Math.round(cx - (s.width * scale) / 2),
    Math.round(cy - (s.height * scale) / 2),
    s.width * scale,
    s.height * scale,
  );
  ctx.restore();
}

let dogVisit = null; // {x, y, vx, coined} the annoying dog crossing the field
let flowerVisit = null; // {x, y, t, line, heard} a talking echo flower
let spareVisit = null; // {type, x, y, t, nearT, state} yellow-name SPARE monster
let temVisit = null; // {x, y, t} hOI!!!
let letterVisit = null; // {x, y, t} 帕子的信 — walk over it to read
let visitorRolls = { dog: false, flower: false, spare: false, tem: false, letter: false }; // once each per run
let shopMsg = null; // {text, t} UT-style denial line in the shop
let shopPowerPulse = null; // {delta, t} 战力指数跳涨动画(买战力件时)
let shopFlash = null; // {id, t} 购买成功后的数值短闪(美术批: 不加弹窗,行内反馈)
let hotdogStock = 0; // 🌭 chest hot dogs: auto-eaten at low HP, run-scoped
let hotdogCd = 0; // one dog per second, not a chug
let relics = {}; // 六魂遗物: run-scoped mechanic passives, chest-exclusive
let runChestsOpened = 0; // telemetry: 宝箱对平衡的真实影响用数据说话
let runEquip = {}; // 本局装备累计(提交A: 玩家要看见自己捡了什么)
let permaGrowth = null; // 结算「永久成长」块的数据快照
let gameoverCta = null; // 动态主按钮 {label, act:"shop"|"char"}
// FUN value, UT-style: rolled per run, silently decides ultra-rare events
// (66 = glitched savepoint, 61-63 = ghost codex entry, 100 = flower warning)
let funValue = 1 + Math.floor(Math.random() * 100);

// death lines: named elites/champions carry their codex key (own line pools,
// falling back to the generic elite pool inside pickDeathLine); plain elites
// fall back to the base monster's pool
function killerKindOf(e) {
  if (e.championProfile) return e.championProfile.key;
  if (e.eliteProfile) return e.eliteProfile.key;
  return e.type || null;
}

function fireBark(event) {
  if (tdMode) return; // 塔防: 本体不在场,头顶气泡无处可挂
  if (barkFired[event]) return;
  barkFired[event] = true;
  const line = barkFor(player.character, event);
  if (line) bark = { text: line, t: 2.6 };
}

// boss warning: the last 30s before the boss the screen pulses red,
// the music ducks and a siren beeps every 10s
// boss timing is uniform across difficulties (5:00) — user call 2026-07-12;
// the per-difficulty hook stays here as a future tuning knob
function bossAppearAt() {
  return BOSS_APPEAR_TIME;
}
function bossWarnAt() {
  return bossAppearAt() - 30;
}
let nextWarnBeep = Infinity; // re-armed in reset()
function bossWarnActive() {
  return !bossFight && elapsed >= bossWarnAt() && elapsed < bossAppearAt();
}

// battle BGM: per-character track, starts with the fight, pauses with Z,
// stops on death/quit. Volume is adjustable on the pause screen.
const BGM_TRACKS = {
  sans: "MEGALOVANIA.mp3",
  ukb: "ukb.mp3",
  horror: "horror.mp3",
  hard: "hard.mp3", // falls back to MEGALOVANIA if the file isn't there
  // 两位付费角色的用户选曲均已于 2026-07-16 落盘。
  insanity: "insanity.mp3?v=s2-20260718-audio1", // Undertale Insanity - Your Fault
  hacker: "hacker.mp3?v=s2-20260718-audio1", // Undertale Hacker Ending (better, knuckl_duster_archive1)
};
// per-character loudness tweak (horror's track is a touch quiet)
const CHAR_VOL = { horror: 1.4 };
const MENU_STATES = new Set(["title", "charselect", "select", "credits", "shop", "codex", "quests", "echoes", "echoread", "weaponbook", "savecode", "dailyintro", "leaderboard", "modeselect", "tdpick"]);
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
function startBattleBgm() {
  // Both classic and TD runs leave the menu through different state paths.
  // Keep the audio handoff in one place so a new mode cannot accidentally
  // inherit the previous run's track or overlap the title theme.
  menuBgm.pause();
  menuBgm.muted = true; // iOS ignores volume writes — mute is the real switch
  menuBgm.currentTime = 0;
  menuBgm.volume = 0;
  bgm.muted = audioMuted;
  bgm.src = BGM_TRACKS[currentCharacter().id] || "MEGALOVANIA.mp3";
  bgm.volume = 0;
  bgmPlay();
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
// 全局静音(标题页喇叭按钮):不动音量档位,恢复时原样回来。
// fadeAudio 在目标>0时会自动解除muted,所以静音必须闸住音量目标本身
let audioMuted = localStorage.getItem("audioMuted") === "1";
function updateSfxVolume(v) {
  sfxVolume = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
  localStorage.setItem("sfxVolume", String(sfxVolume));
  setSfxVolume(audioMuted ? 0 : sfxVolume);
}
setSfxVolume(audioMuted ? 0 : sfxVolume);
function toggleAudioMuted() {
  audioMuted = !audioMuted;
  localStorage.setItem("audioMuted", audioMuted ? "1" : "0");
  setSfxVolume(audioMuted ? 0 : sfxVolume);
  if (audioMuted) {
    bgm.muted = true;
    menuBgm.muted = true;
  }
}
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
    if (w.support) locks[i] = { hint: t("辅助武器,无法单独开局", "Support weapon — can't start with it"), progress: t("局内通过强化卡获得", "Gained via cards mid-run") };
    if (w.choiceOnly) locks[i] = { hint: t("局内技能,无法开局携带", "In-run skill — can't start with it"), progress: t("战斗中通过选卡获得", "Gained via cards in battle") };
  });
  return locks;
}

// one-line summary of everything the shop has permanently granted
function metaBonusLine() {
  // numbers must mirror what the upgrades REALLY do post-rework:
  // 力量=×1.06^lvl final damage, 决心=+7%/lvl max hp (see meta.js UPGRADES)
  const parts = [];
  if (upgradeLevel("atk")) parts.push(`${t("伤害", "DMG")}×${Math.pow(1.06, upgradeLevel("atk")).toFixed(2)}`);
  if (upgradeLevel("hp")) parts.push(`${t("生命", "HP")}+${7 * upgradeLevel("hp")}%`);
  if (upgradeLevel("speed")) parts.push(`${t("移速", "Speed")}+${8 * upgradeLevel("speed")}`);
  if (upgradeLevel("magnet")) parts.push(`${t("磁吸", "Magnet")}+${25 * upgradeLevel("magnet")}`);
  if (upgradeLevel("greed")) parts.push(`${t("金币", "Coins")}+${20 * upgradeLevel("greed")}%`);
  if (upgradeLevel("reroll")) parts.push(`${t("选卡刷新", "Rerolls")}+${upgradeLevel("reroll")}`);
  if (upgradeLevel("gear")) parts.push(`${t("开局装备", "Start gear")}+${upgradeLevel("gear")}`);
  if (upgradeLevel("crystal")) parts.push(`${t("结晶", "Crystal")}×${Math.pow(1.05, upgradeLevel("crystal")).toFixed(2)}`);
  if (upgradeLevel("bulwark")) parts.push(`${t("减伤", "DR")}+${3 * upgradeLevel("bulwark")}%`);
  if (reviveStock()) parts.push(`${t("复活", "Revives")}×${reviveStock()}`);
  return parts.length ? `${t("已生效", "Active")}:${parts.join(" ")}` : t("还没买过强化——买了的每一局自动生效", "No upgrades yet — anything you buy applies every run");
}

function visibleCosmetics() {
  return COSMETICS.filter((c) => !c.secret || cosmeticOwned(c.id));
}

function cosmeticEquipLine() {
  const soul = equippedCosmetic();
  const bone = equippedBoneSkin();
  return t(
    `装备中:灵魂「${soul ? soul.name : "无"}」 骨装「${bone ? bone.name : "默认"}」`,
    `Equipped: soul '${soul ? pick(soul, "name") : "none"}' · bones '${bone ? pick(bone, "name") : "default"}'`
  );
}

function diffPills() {
  const active = getDifficulty().id;
  return DIFFICULTIES.map((d) => ({
    name: pick(d, "name"),
    active: d.id === active,
    locked: !isDifficultyUnlocked(d.id),
    hint:
      d.id === active
        ? d.id === 0
          ? t("标准体验", "The standard experience")
          : t(
              `怪物血×${d.hpMult} 伤×${d.dmgMult} · 金币×${d.coinMult} 分数×${d.scoreMult}`,
              `HP×${d.hpMult} DMG×${d.dmgMult} · Coins×${d.coinMult} Score×${d.scoreMult}`
            )
        : pick(d, "hint") || "",
  }));
}

// codex completion: monsters seen + boss + weapons used + evolutions reached
function codexCompletion() {
  const st = getStats();
  let have = CODEX_MONSTERS.filter((m) =>
    m.boss ? st.bossKills > 0 : (st.killsByType[m.key] || 0) > 0
  ).length;
  let total = CODEX_MONSTERS.length;
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
// 购买前后真实数值(提交A): 商店不许只说「等级提高」
function shopCompareLine(id, lvl, max) {
  const maxed = lvl >= max;
  switch (id) {
    case "atk": {
      const a = Math.pow(1.06, lvl).toFixed(2);
      const b = Math.pow(1.06, lvl + 1).toFixed(2);
      return maxed
        ? t(`已满级 · 伤害倍率 ×${a}(独立乘区)`, `Maxed · damage ×${a} (own multiplier)`)
        : t(`伤害倍率 ×${a} → ×${b}(独立乘区)`, `Damage ×${a} → ×${b} (own multiplier)`);
    }
    case "hp":
      return maxed
        ? t(`已满级 · 生命加成 +${7 * lvl}%`, `Maxed · max HP +${7 * lvl}%`)
        : t(`生命加成 +${7 * lvl}% → +${7 * (lvl + 1)}%(升级成长同享)`, `Max HP +${7 * lvl}% → +${7 * (lvl + 1)}% (level-ups share it)`);
    case "speed":
      return maxed
        ? t(`已满级 · 初始移速 +${8 * lvl}`, `Maxed · starting speed +${8 * lvl}`)
        : t(`初始移速 +${8 * lvl} → +${8 * (lvl + 1)}`, `Starting speed +${8 * lvl} → +${8 * (lvl + 1)}`);
    case "magnet":
      return maxed
        ? t(`已满级 · 磁吸 +${25 * lvl}`, `Maxed · pickup radius +${25 * lvl}`)
        : t(`磁吸范围 +${25 * lvl} → +${25 * (lvl + 1)}`, `Pickup radius +${25 * lvl} → +${25 * (lvl + 1)}`);
    case "greed":
      return maxed
        ? t(`已满级 · 金币 +${20 * lvl}%`, `Maxed · coins +${20 * lvl}%`)
        : t(`金币获取 +${20 * lvl}% → +${20 * (lvl + 1)}%`, `Coin gain +${20 * lvl}% → +${20 * (lvl + 1)}%`);
    case "reroll":
      return maxed
        ? t(`已满级 · 每次选卡可刷新 ${1 + lvl} 次`, `Maxed · ${1 + lvl} rerolls per pick`)
        : t(`选卡刷新 ${1 + lvl} 次 → ${2 + lvl} 次`, `Rerolls ${1 + lvl} → ${2 + lvl}`);
    case "gear":
      return maxed
        ? t(`已满级 · 开局装备 ${lvl} 件`, `Maxed · ${lvl} starting gear`)
        : t(`开局装备 ${lvl} 件 → ${lvl + 1} 件`, `Starting gear ${lvl} → ${lvl + 1}`);
    case "crystal": {
      const a = Math.pow(1.05, lvl).toFixed(2);
      const b = Math.pow(1.05, lvl + 1).toFixed(2);
      return maxed
        ? t(`已满级 · 结晶增幅 ×${a}(与力量刻印相乘)`, `Maxed · crystal ×${a} (stacks with Power Sigil)`)
        : t(`结晶增幅 ×${a} → ×${b}(与力量刻印相乘)`, `Crystal ×${a} → ×${b} (stacks with Power Sigil)`);
    }
    case "bulwark":
      return maxed
        ? t(`已满级 · 减伤 ${3 * lvl}%`, `Maxed · damage cut ${3 * lvl}%`)
        : t(`减伤 ${3 * lvl}% → ${3 * (lvl + 1)}%(Boss也吃这套)`, `Damage cut ${3 * lvl}% → ${3 * (lvl + 1)}% (Boss included)`);
    default:
      return null;
  }
}

// 战力指数: 商店战力件折算的单一数字(基准100)——买完"能力提升"最直白的
// 感知锚点。DPS乘区×EHP乘区: 伤害×(1.06^atk·1.05^crystal),血/(1-减伤)。
function metaPowerIndex() {
  const dmg = Math.pow(1.06, upgradeLevel("atk")) * Math.pow(1.05, upgradeLevel("crystal"));
  const ehp = (1 + 0.07 * upgradeLevel("hp")) / (1 - 0.03 * upgradeLevel("bulwark"));
  return Math.round(100 * dmg * ehp);
}

function shopItems() {
  const items = UPGRADES.map((u) => ({
    id: u.id,
    name: pick(u, "name"),
    desc: shopCompareLine(u.id, upgradeLevel(u.id), u.max) || pick(u, "desc"),
    lvl: upgradeLevel(u.id),
    max: u.max,
    cost: upgradeCost(u.id),
    gate: upgradeGate(u.id),
    color: u.color,
  }));
  // consumable revive rides in the same list with its stock as "pips"
  items.push({
    id: "reviveStock",
    name: t("重燃决心", "Rekindled DT"),
    desc: t("一次性复活,带入下局(每局限1次;屠杀无效)", "One revive carried into runs; no GENOCIDE"),
    lvl: reviveStock(),
    max: 3,
    cost: reviveCost(),
    color: "#ffffff",
  });
  // UIUX(2026-07-15): 左列=战力(变强买这排),右列=品质(舒服买这排)——
  // 分组本身就是购买指引;顺序即渲染格位(shopItemRect 按 index 排两列)
  const ORDER = ["atk", "hp", "crystal", "bulwark", "reviveStock", "speed", "magnet", "greed", "reroll", "gear"];
  items.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  // ★推荐 = 当前买得起的最便宜战力件(和结算页教练句同一决策模型):
  // 玩家从"去变强"跳进来,第一眼就该知道钱花哪
  const POWER_LANE = new Set(["atk", "hp", "crystal", "bulwark"]);
  const best = items
    .filter((x) => POWER_LANE.has(x.id) && x.cost !== null && !x.gate && x.cost <= getCoins())
    .sort((a, b) => a.cost - b.cost)[0];
  if (best) best.hot = true;
  return items;
}

function currentWeaponList() {
  return WEAPON_LISTS[currentCharacter().id];
}

function reset(weaponId) {
  tdMode = false; // 世界重建=塔防状态一并清空(startTdRun 在 reset 后重新立起)
  td = null;
  tdHoverCell = null;
  player = new Player(WIDTH / 2, HEIGHT / 2);
  player.character = currentCharacter().id;
  // 每日挑战 = 标准竞技:局外强化不进场,全服同一起跑线
  if (!dailyMode) applyMetaUpgrades(player); // permanent shop upgrades kick in from second zero
  // 付费角色天性(2026-07-13/14 用户裁决: 花钱的角色比本家强,票价越高越强)
  const nature = CHAR_NATURE[player.character];
  if (nature) {
    player.dmgAmp += nature.dmg;
    player.maxHp = Math.round(player.maxHp * nature.hp);
    player.hp = player.maxHp;
  }
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
  bossFightStartedAt = 0;
  bossPhaseReached = 0;
  bossHpPctAtEnd = 0;
  hpAtBossPct = 0;
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
  lastHitKind = null;
  lastDeathBy = null;
  deathKillerLine = null;
  loveVerdict = null;
  savepointNote = null;
  bark = null;
  barkFired = {};
  chapterQueue = [];
  chapterShow = null;
  shareRoast = null;
  bossDeathSnapped = false;
  dogVisit = null;
  flowerVisit = null;
  spareVisit = null;
  temVisit = null;
  letterVisit = null;
  hotdogStock = 0;
  hotdogCd = 0;
  relics = {};
  Enemy.eliteAmp = 1;
  runChestsOpened = 0;
  runEquip = {};
  visitorRolls = { dog: false, flower: false, spare: false, tem: false, letter: false };
  nextWarnBeep = bossWarnAt();
}

reset(currentWeaponList()[0].id);

function bestEndlessOf(charId) {
  return parseInt(localStorage.getItem("best_endless_" + charId) || "0", 10) || 0;
}

function bestEndlessRoundOf(charId) {
  return parseInt(localStorage.getItem("best_endless_round_" + charId) || "0", 10) || 0;
}

function saveSafeProgressCheckpoint(safeCoins) {
  // 塔防不写检查点: 它的 bossKilled/diffCleared 地板会把 TD 通关灌进
  // 经典难度解锁线(TD Boss 数值另一套,不能当经典成绩)
  if (!bossDefeated || tdMode) return;
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
  gameoverDetail = false; // settlement always opens on the results page
  // narrative: killer-flavored death line + the LOVE judgment for the card;
  // the death streak feeds the savepoint aphorisms of the NEXT run
  if (player.hp <= 0) {
    const deathCounts = recordNarrativeDeath();
    deathKillerLine = pickDeathLine(lastHitKind, deathCounts.total);
  } else {
    deathKillerLine = null;
    if (runOutcome === "victory" || runOutcome === "retreat") resetNarrativeDeathStreak();
  }
  loveVerdict = pickLoveJudgment({
    kills: player.kills,
    difficultyId: getDifficulty().id,
    outcome: runOutcome,
    rounds: roundsCleared,
  });
  // coach only pre-boss deaths — endless deaths already beat the exam
  if (runOutcome === "death" && tdMode) {
    // 塔防死因只有一种:门破了——经典的走位建议在这里全是废话
    coachAdvice = t(
      "* 裂缝外攻略组:先把塔放在走廊拐角(覆盖两段路),入口卡别攒着,修门要趁早。",
      "* Strat corner: put towers on corridor corners (two lanes each); spend gate cards early."
    );
  } else if (runOutcome === "death") {
    coachAdvice = coachLine({
      kind: lastHitKind,
      survived: Math.floor(elapsed),
      kills: player.kills,
      moveSpeed: player.moveSpeed,
      // 商店差额尾巴在最终钱包定型后(CTA处)再追加——此处钱包还没含
      // 悬赏/专精奖励,提前算会和主按钮自相矛盾(2026-07-12 截图bug)
    });
  } else coachAdvice = null;
  shareRoast = pickShareRoast({
    outcome: runOutcome,
    deathKind: player.hp <= 0 ? lastHitKind : null,
    survived: Math.floor(bossDefeated ? stageClearTime : elapsed),
    clearTime: stageClearTime,
    maxStreak: runMaxStreak,
    rounds: roundsCleared,
    hpPct: player.maxHp > 0 ? player.hp / player.maxHp : 0,
    kills: player.kills,
    difficultyId: getDifficulty().id,
  });
  // UT-style death: the white, inverted monster soul appears and shatters.
  // Death always exposes the same white, inverted monster soul. Cosmetic
  // colours remain a living-character choice and no longer tint this beat.
  deathShatter = player.hp <= 0 ? { t: 0, color: "#ffffff" } : null;
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
  // 匿名 run 汇总: win or loss, one whitelisted blob per registered run —
  // this is the production data the balance loop runs on (P1, 2026-07-12)
  // 塔防局: 未注册 run(startTdRun 不走 beginRankedRun),不上报不上榜
  if (!tdMode) reportRankedRun({
    version: GAME_VERSION,
    mode: dailyMode ? "daily" : bossDefeated && runOutcome !== "victory" ? "endless" : "normal",
    outcome: runOutcome,
    elapsed: Math.floor(elapsed),
    kills: player.kills,
    score: bossDefeated ? stageClearScore : currentScore(),
    bossReached: bossDefeated || elapsed >= bossAppearAt(),
    bossDefeated,
    enteredEndless: bossDefeated && runOutcome !== "victory",
    bossPhaseReached: bossDefeated ? 2 : bossPhaseReached,
    bossFightSeconds: bossFightStartedAt > 0 ? Math.max(0, Math.round((bossDefeated ? stageClearTime : elapsed) - bossFightStartedAt)) : 0,
    bossHpPct: bossDefeated ? 0 : bossHpPctAtEnd,
    hpAtBossPct,
    rounds: roundsCleared,
    hpPct: player.maxHp > 0 ? Math.round((Math.max(0, player.hp) / player.maxHp) * 100) : 0,
    damageTaken: Math.round(player.damageTaken || 0),
    revivesUsed: Math.max(0, reviveArmed - player.revives),
    weapons: player.weapons.map((i) => `${i.id}${i.evolved ? "*" : ""}:${i.tier}`),
    contract: activeContract?.id || "",
    speed: timeScale,
    metaPower: UPGRADES.reduce((s, u) => s + upgradeLevel(u.id), 0),
    deathBy: lastHitKind || "",
    chests: runChestsOpened,
    relics: Object.keys(relics).length,
    wallet: getCoins(),
    up: ["atk", "hp", "speed", "magnet", "greed", "reroll", "gear"].map((id) => upgradeLevel(id)).join("."),
  });
  if (!tdMode && bossDefeated) finishRankedRun({ mode: dailyMode ? "daily" : runOutcome === "victory" ? "normal" : "endless", elapsed, kills: player.kills, rounds: dailyMode || runOutcome === "victory" ? 0 : roundsCleared, stageElapsed: stageClearTime, stageKills: stageClearKills });
  else cancelRankedRun(); // died/quit before the boss (或塔防局): the run never boards
  if (tdMode) {
    // 塔防最好成绩独立记账——量纲与经典分不可混,更不能上排行榜
    lastBest = parseInt(localStorage.getItem("best_td") || "0", 10) || 0;
    newRecord = lastScore > lastBest;
    if (newRecord) localStorage.setItem("best_td", String(lastScore));
  } else {
    lastBest = bestScoreOf(player.character);
    // Debug helpers may be useful for art/testing, but must never create a
    // convincing local "最高" that looks like a missing legitimate rank.
    newRecord = !PRODUCTION_DEBUG_RUN && lastScore > lastBest;
    if (newRecord) localStorage.setItem("best_" + player.character, String(lastScore));
  }
  // endless gets its own ledger and its own best
  endlessResult = null;
  if (bossDefeated && runOutcome !== "victory") {
    // 塔防无尽记独立底账("td"),不混进任何角色的经典无尽最好成绩
    const ledgerId = tdMode ? "td" : player.character;
    const eScore = Math.max(0, currentScore() - stageClearScore);
    const eBestPrev = bestEndlessOf(ledgerId);
    const eNew = !PRODUCTION_DEBUG_RUN && eScore > eBestPrev;
    if (eNew) localStorage.setItem("best_endless_" + ledgerId, String(eScore));
    const roundBestPrev = bestEndlessRoundOf(ledgerId);
    const roundNew = !PRODUCTION_DEBUG_RUN && roundsCleared > roundBestPrev;
    if (roundNew) localStorage.setItem("best_endless_round_" + ledgerId, String(roundsCleared));
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
    dailyNewBest = !PRODUCTION_DEBUG_RUN && lastScore > prev;
    dailyBestToday = PRODUCTION_DEBUG_RUN ? prev : Math.max(prev, lastScore);
    if (!PRODUCTION_DEBUG_RUN) localStorage.setItem(key, String(dailyBestToday));
  }
  exitDailyMode();
  // 提交A snapshots: what THIS run adds to the account, taken pre-record
  const preStats = getStats();
  const newCodexNames = Object.keys(runKillsByType)
    .filter((k) => !(preStats.killsByType[k] > 0))
    .map((k) => CODEX_MONSTERS.find((m) => m.key === k)?.name)
    .filter(Boolean);
  const diffClearedBefore = preStats.diffCleared ?? -1;
  const settledWeapons = tdMode
    ? (td?.towers || []).flatMap((tower) => tower.pp?.weapons || [])
    : player.weapons;
  recordRun({
    kills: player.kills,
    // 塔防的天意是按全塔DPS标定的另一套数值——不计入经典 Boss 击杀数,
    // 也不推进难度解锁(diffCleared);击杀图鉴照常累计
    classicRun: !tdMode, // 击杀解锁分账: TD 不喂 classicKills
    bossKilled: bossDefeated && !tdMode,
    // TD is a three-character team. Crediting every kill to the leader falsely
    // unlocks that character's mastery and echoes, so team runs stay out of
    // per-character mastery while still contributing lifetime/codex totals.
    charId: tdMode ? null : player.character,
    difficulty: getDifficulty().id,
    killsByType: runKillsByType,
    weaponsUsed: [...new Set(settledWeapons.map((i) => i.id))],
    evolvedIds: [...new Set(settledWeapons.filter((i) => i.evolved).map((i) => i.id))],
  });
  runKillsByType = {};
  // honour titles (checked after the run is recorded so the codex is fresh)
  lastNewTitles = [];
  // Boss 通关系荣誉只认经典决斗版天意(TD 版数值另一套,不当同一场考试)
  for (const [id, ok] of [
    ["pacifist", bossDefeated && !runOffense && !tdMode],
    ["judge", roundsCleared >= 5 && getDifficulty().id >= 1], // 狂暴+才算数
    ["raven", bossDefeated && getDifficulty().id === 2 && !tdMode],
    ["determined", codexCompletion() >= 100],
    ["genocide", bossDefeated && getDifficulty().id === 3 && !tdMode],
  ]) {
    if (ok && unlockTitle(id)) lastNewTitles.push(pick(TITLES.find((x) => x.id === id), "name"));
  }
  // 回响 story fragments — the hall remembers this run's milestones
  if (runOutcome === "death" || runOutcome === "endlessDeath") unlockEchoToast("stay");
  if (bossDefeated && !tdMode) unlockEchoToast("after");
  if (roundsCleared >= 5) unlockEchoToast("deeper");
  if (getStats().runs >= 20) unlockEchoToast("back");
  if (bossDefeated && getDifficulty().id === 2 && !tdMode) unlockEchoToast("wd");
  if (bossDefeated && getDifficulty().id === 3 && !tdMode) unlockEchoToast("dust");
  if (Object.keys(getStats().evolved || {}).length >= 32) unlockEchoToast("gift");
  if (codexCompletion() >= 100) unlockEchoToast("end");
  // 真实验室暗线: amalgamate kills and deep judgement rounds open the lab thread
  const ktAll = getStats().killsByType || {};
  if ((ktAll.elite_memoryhead || 0) > 0) unlockEchoToast("noise");
  if ((ktAll.elite_reaper_bird || 0) > 0) unlockEchoToast("wishes");
  if (roundsCleared >= 7 || bestEndlessRoundOf(player.character) >= 7) unlockEchoToast("whitedoor");
  deathQuote = runOutcome === "death" || runOutcome === "endlessDeath" ? randomEchoQuote() : null;
  // "差一点" (near-miss): losses that almost weren't — the strongest rerun hook
  nearMiss = null;
  if (runOutcome === "death" || runOutcome === "endlessDeath") {
    if (runOutcome === "endlessDeath" && roundTimer > 0 && roundTimer <= 30) {
      nearMiss = t(`差一点!再撑 ${Math.ceil(roundTimer)} 秒就能完成第 ${endlessRound} 轮审判`, `SO close! ${Math.ceil(roundTimer)}s more and round ${endlessRound} was yours`);
    } else if (runOutcome === "endlessDeath" && roundTimer <= 0 && roundBossSpawned && !roundBossDown) {
      nearMiss = t(`差一点!击倒首领就能结算第 ${endlessRound} 轮`, `SO close! The round boss was all that stood before round ${endlessRound} paid out`);
    } else if (runOutcome === "death" && !bossDefeated && elapsed < bossAppearAt() && bossAppearAt() - elapsed <= 45) {
      nearMiss = t(
        `差一点!再活 ${Math.ceil(bossAppearAt() - elapsed)} 秒就能见到天意侵蚀Sans`,
        `SO close! ${Math.ceil(bossAppearAt() - elapsed)}s more and you'd have met Corrupted Sans`
      );
    } else if (!newRecord && lastBest > 0 && lastScore >= lastBest * 0.8) {
      nearMiss = t(`差一点!距离新纪录只有 ${lastBest - lastScore + 1} 分`, `SO close! ${lastBest - lastScore + 1} points off a new record`);
    }
  }
  // bounties settled at run end(击败Boss悬赏=经典决斗版专属)
  if (bossDefeated && !tdMode) questToasts(questEvent("boss", 1));
  questToasts(questEvent("survive", Math.floor(elapsed)));
  // 角色专精: lifetime kills crossed a level? coins + line
  const killsAfter = getStats().charKills[player.character] || 0;
  const masteryKillsThisRun = tdMode ? 0 : player.kills;
  const lvlBefore = masteryOf(killsAfter - masteryKillsThisRun);
  const lvlAfter = masteryOf(killsAfter);
  if (!tdMode && lvlAfter > lvlBefore) {
    const bonus = 30 * (lvlAfter - lvlBefore) * lvlAfter;
    addCoins(bonus);
    lastMasteryUp = t(`${currentCharacter().name} 专精升至 Lv${lvlAfter}(+${bonus}金币)`, `${pick(currentCharacter(), "name")} mastery up to Lv${lvlAfter} (+${bonus}G)`);
  }
  // 角色残响: this timeline's private echoes open with mastery
  if (!tdMode && lvlAfter >= 1) unlockEchoToast(player.character + "1");
  if (!tdMode && lvlAfter >= 3) unlockEchoToast(player.character + "2");
  // 「永久成长」块(提交A): even a failed run visibly feeds the account
  permaGrowth = {
    coins: lastRunCoins,
    masteryEnabled: !tdMode,
    killsBefore: killsAfter - masteryKillsThisRun,
    killsAfter,
    lvlBefore,
    lvlAfter,
    newCodex: newCodexNames,
  };
  // 动态主按钮(提交A): the one next action, picked by situation
  const diffClearedNow = getStats().diffCleared ?? -1;
  const affordable = UPGRADES
    .map((u) => ({ u, lvl: upgradeLevel(u.id), cost: upgradeCost(u.id), gate: upgradeGate(u.id) }))
    .filter((x) => x.lvl < x.u.max && !x.gate && x.cost <= getCoins())
    .sort((a, b) => a.cost - b.cost)[0];
  if (runOutcome === "victory" && diffClearedNow > diffClearedBefore && diffClearedNow < 3) {
    gameoverCta = { label: t(`挑 战 ${DIFFICULTIES[diffClearedNow + 1].name}`, `CHALLENGE ${pick(DIFFICULTIES[diffClearedNow + 1], "name")}`), act: "char" };
  } else if (runOutcome !== "victory" && affordable) {
    gameoverCta = { label: t("去 变 强", "POWER UP"), act: "shop" }; // 商品名放教练句,按钮不截断
    if (coachAdvice) coachAdvice += t(`(「${affordable.u.name}」已经买得起了)`, ` (you can already afford '${pick(affordable.u, "name")}')`);
  } else if (nearMiss) {
    gameoverCta = { label: t("⟳ 再 次 挑 战", "⟳ TRY AGAIN"), act: "char" };
  } else {
    gameoverCta = { label: t("⟳ 再 来 一 局", "⟳ ONE MORE RUN"), act: "char" };
  }
  // 塔防局的主按钮语义=回塔防编队(restartSameMode),标签同步说清楚
  if (tdMode && gameoverCta.act === "char") gameoverCta = { label: t("⟳ 再 守 一 局", "⟳ HOLD AGAIN"), act: "char" };
  if (gameoverCta.act !== "shop" && coachAdvice) {
    const nextBuy = UPGRADES
      .map((u) => ({ u, lvl: upgradeLevel(u.id), cost: upgradeCost(u.id), gate: upgradeGate(u.id) }))
      .filter((x) => x.lvl < x.u.max && !x.gate)
      .sort((a, b) => a.cost - b.cost)[0];
    const gap = nextBuy ? nextBuy.cost - getCoins() : 0;
    if (nextBuy && gap > 0 && gap <= 90) coachAdvice += t(`(还差 ${gap} 金币就能拿下「${nextBuy.u.name}」)`, ` (${gap}G short of '${pick(nextBuy.u, "name")}')`);
  }
  // 审判纪元: first-time milestones open a story chapter before the results
  chapterQueue = unseenChapters({
    victory: runOutcome === "victory" && !tdMode, // 审判纪元章节=经典主线专属
    difficultyId: getDifficulty().id,
    codexPct: codexCompletion(),
  });
  if (chapterQueue.length) advanceChapterQueue();
}

// pull the next due chapter into the cutscene state (or fall back to gameover)
function advanceChapterQueue() {
  const chapter = chapterQueue.shift();
  if (!chapter) {
    state = "gameover";
    return;
  }
  markChapterSeen(chapter.id);
  chapterShow = { chapter, line: 0, t: 0 };
  state = "chapter";
}

// tap/enter on the chapter screen: finish the typing line, then step onward
function chapterAdvance() {
  if (!chapterShow) return;
  const text = chapterShow.chapter.lines[chapterShow.line];
  if (chapterShow.t * 20 < text.length) {
    chapterShow.t = text.length / 20; // impatient tap completes the line
    return;
  }
  sfxClick();
  if (chapterShow.line < chapterShow.chapter.lines.length - 1) {
    chapterShow.line += 1;
    chapterShow.t = 0;
  } else {
    chapterShow = null;
    advanceChapterQueue();
  }
}
// ---- 存档码: manual cross-device save transfer (no server needed) ----------
function exportSaveCode() {
  try {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      data[k] = localStorage.getItem(k);
    }
    const code = "SANS1." + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    try {
      navigator.clipboard && navigator.clipboard.writeText(code);
    } catch (e) {}
    utPrompt({
      title: t("* 存档码已生成", "* Save code generated"),
      hint: t(
        "已尝试自动复制;也可点「复制」或手动全选。\n在任何设备的「存档码」里导入即可恢复全部进度。",
        "Auto-copy attempted; you can also hit Copy or select all.\nImport it under Save Code on any device to restore everything."
      ),
      value: code,
      maxLength: 1000000,
      copy: true,
    });
  } catch (e) {}
}

async function importSaveCode() {
  const code = await utPrompt({
    title: t("* 导入存档码", "* Import save code"),
    hint: t(
      "粘贴完整存档码。\n⚠ 将覆盖本机全部进度,导入前建议先导出备份。",
      "Paste the full save code.\n⚠ This overwrites ALL local progress — export a backup first."
    ),
    value: "",
    maxLength: 1000000,
  });
  if (!code) return;
  try {
    const raw = code.trim().replace(/^SANS1\./, "");
    const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
    if (!data || typeof data !== "object") throw new Error("bad");
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, String(v));
    await utNotice({ title: t("* 导入成功", "* Import complete"), hint: t("即将刷新,加载新存档。", "Reloading with the new save.") });
    location.reload();
  } catch (e) {
    utNotice({ title: t("* 存档码无效", "* Invalid save code"), hint: t("请检查是否完整粘贴(应以 SANS1. 开头)。", "Check that you pasted the whole code (it starts with SANS1.).") });
  }
}

// ---- 管理员 DEBUG 解锁 ------------------------------------------------------
// This is a static client, so the gate can only prevent casual discovery; it
// is not an authentication boundary. Keep only a SHA-256 digest here so the
// backend-admin password is never shipped as plaintext in the public bundle.
const DEBUG_UNLOCK_HASH = "758d4934531bfa65c1cece06017a3fcdead64023bab50560fae83a69311a6b7a";

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function openDebugUnlock() {
  const code = await utPrompt({
    title: t("* DEBUG 管理员解锁", "* DEBUG admin unlock"),
    hint: t(
      "输入 DEBUG 码以解锁全部图鉴、回响、角色和难度。\n⚠ 本设备之后的成绩将不会上传排行榜。",
      "Enter the DEBUG code to unlock every codex entry, echo, character and difficulty.\n⚠ Scores from this device will no longer reach the ranking."
    ),
    value: "",
    maxLength: 64,
    secret: true,
  });
  if (!code) return;

  let valid = false;
  try {
    valid = (await sha256Hex(code)) === DEBUG_UNLOCK_HASH;
  } catch {
    valid = false;
  }
  if (!valid) {
    sfxHurt();
    await utNotice({
      title: t("* DEBUG 码错误", "* Wrong DEBUG code"),
      hint: t("什么也没有改变。", "Nothing changed."),
    });
    return;
  }

  let debugStats = {};
  try {
    debugStats = JSON.parse(localStorage.getItem("metaStats") || "{}") || {};
  } catch {
    debugStats = {};
  }
  debugStats.totalKills = Math.max(Number(debugStats.totalKills) || 0, CHARACTERS.length * 4000);
  debugStats.runs = Math.max(Number(debugStats.runs) || 0, 1);
  debugStats.bossKills = Math.max(Number(debugStats.bossKills) || 0, 4);
  debugStats.diffCleared = 3;
  debugStats.genocideUnlocked = true;
  debugStats.charKills ||= {};
  debugStats.killsByType ||= {};
  debugStats.weaponsUsed ||= {};
  debugStats.evolved ||= {};

  for (const character of CHARACTERS) {
    debugStats.charKills[character.id] = Math.max(Number(debugStats.charKills[character.id]) || 0, 4000);
    if (character.cost) localStorage.setItem("own_" + character.id, "1");
    for (const weapon of WEAPON_LISTS[character.id] || []) {
      debugStats.weaponsUsed[weapon.id] = true;
      if (weapon.evolve) debugStats.evolved[weapon.id] = true;
    }
  }
  for (const monster of CODEX_MONSTERS) {
    if (!monster.boss) debugStats.killsByType[monster.key] = Math.max(Number(debugStats.killsByType[monster.key]) || 0, 1);
  }
  for (const echo of ALL_ECHOES) unlockEcho(echo.id);

  localStorage.setItem("metaStats", JSON.stringify(debugStats));
  localStorage.setItem("debugUnlocked", "1");
  localStorage.setItem("tutorialDone", "1");
  sfxFanfare();
  await utNotice({
    title: t("* DEBUG 已解锁", "* DEBUG unlocked"),
    hint: t(
      "全部图鉴、回响、角色和难度已开放。\n正在刷新；调试成绩不会进入排行榜。",
      "Every codex entry, echo, character and difficulty is open.\nReloading; DEBUG scores never enter the ranking."
    ),
  });
  location.reload();
}

function goTitle() {
  exitDailyMode();
  reset(currentWeaponList()[0].id);
  bgm.pause();
  bgm.muted = true;
  bgm.currentTime = 0;
  titleMenuOpen = false;
  state = "title";
}

function toCharSelect() {
  // wipe the world so the old battlefield doesn't show behind the menu
  exitDailyMode(); // safety: never leak the seeded RNG into normal play
  // 存档守卫: 免费角色条件锁接回后,旧存档可能停留在"当时能选"的角色上
  if (charLocksNow()[CHARACTERS[selectedChar]?.id]) selectedChar = 0;
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
const flowerGiftLine = () =>
  flowerGift.already
    ? t(`连日之花:第 ${flowerGift.days} 天(今日礼物已领取)`, `Daily flower: day ${flowerGift.days} (today's gift claimed)`)
    : t(`连日之花:第 ${flowerGift.days} 天,花为你留了 ${flowerGift.coins} 金币`, `Daily flower: day ${flowerGift.days} — it kept ${flowerGift.coins}G for you`);

const QUEST_KIND_DESC = {
  kills: (q) => t(`击杀 ${q.target} 只怪物`, `Slay ${q.target} monsters`),
  charKills: (q) => {
    const c = CHARACTERS.find((x) => x.id === q.charId) || CHARACTERS[0];
    return t(`用「${c.name}」击杀 ${q.target} 只`, `Slay ${q.target} as ${pick(c, "name")}`);
  },
  coins: (q) => t(`拾取 ${q.target} 枚金币`, `Pick up ${q.target} coins`),
  candy: (q) => t(`吃下 ${q.target} 颗怪物糖`, `Eat ${q.target} monster candies`),
  elites: (q) => t(`击败 ${q.target} 名精英`, `Defeat ${q.target} elites`),
  boss: () => t(`击败一次天意侵蚀Sans`, `Defeat Corrupted Sans once`),
  round: (q) => t(`完成无尽审判第 ${q.target} 轮`, `Clear Judgement round ${q.target}`),
  streak: (q) => t(`达成一次 ${q.target} 连杀`, `Reach a ${q.target} kill streak`),
  evolve: () => t(`完成一次武器进化`, `Evolve a weapon once`),
  survive: (q) => t(`单局存活 ${q.target} 秒`, `Survive ${q.target}s in one run`),
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
    lastNewQuests.push(`${line} +${q.reward}${t("金币", "G")}`);
    if (state === "playing" || state === "choice") {
      tipQueue.push({ title: t("悬赏完成!", "Bounty complete!"), lines: [t(`${line} —— 赏金 ${q.reward} 金币已入账`, `${line} — ${q.reward}G bounty paid`)], t: 7 });
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
// 宝箱内容 v2(2026-07-12 终版): 卡池复读全部清除 — 每一格都是卡片给不了
// 的东西:永久(派/觉醒骨)、即时爆发(审判/收网)、无时限储备(热狗)、经济。
// 无任何倒计时奖励(用户裁定:临时buff是弱多巴胺)。
function rollChestRewards() {
  const r = Math.random();
  let count = r < 0.05 ? 5 : r < 0.3 ? 3 : 1;
  if (endlessRound >= 4) count = 1; // deep judgement pays single rewards only
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random() * 100; // NOTE: 别叫 pick — 会遮蔽 i18n 的 pick()
    if (roll < 22) {
      rewards.push({ label: t("羊妈的派", "Toriel's Pie"), detail: t("生命上限+15 · 回满", "Max HP +15 · full heal"), color: "#ff8fc7", icon: ICONS.pie, apply: () => {
        player.maxHp = Math.min(PLAYER_MAX_HP, player.maxHp + 15); // 永久上限,然后全回复 — 一大口家的味道
        player.hp = player.maxHp;
        healFlash = 0.6;
        candyBanner = { text: t("* 黄油太妃派。有家的味道。生命上限 +15!", "* Butterscotch-cinnamon pie. Tastes like home. Max HP +15!"), t: 3 };
      }});
    } else if (roll < 30) {
      rewards.push({ label: t("骨白审判", "Bone Judgement"), detail: t("清除全部普通怪", "Clears all normal monsters"), color: "#f2ead8", icon: ICONS.skull, apply: () => {
        let reaped = 0;
        for (const e of enemies) {
          if (!e.elite && !e.boss && e.hp > 0) {
            e.hp = 0; // 走正常死亡管线:掉落/击杀/连杀全都算
            reaped++;
          }
        }
        killFlash = 0.3;
        candyBanner = { text: t(`* 骨白审判降下。${reaped} 个身影同时化尘。`, `* The bone judgement falls. ${reaped} figures turn to dust at once.`), t: 3 };
      }});
    } else if (roll < 50) {
      rewards.push({ label: t("热狗 ×3('dogs)", "Hot Dogs ×3 ('dogs)"), detail: t("残血自动回血 · 3次", "Auto-heal at low HP · 3 uses"), color: "#ffb066", icon: ICONS.hotdog, apply: () => {
        hotdogStock = Math.min(9, hotdogStock + 3); // 残血自动吃,用完为止
        candyBanner = { text: t("* 三根热狗揣进口袋。残血时会自动想起它们。", "* Three hot dogs, pocketed. You'll remember them at low HP."), t: 3 };
      }});
    } else if (roll < 62) {
      // 六魂遗物: 机制型独特物件 — rogue-like 的 item 心跳,卡池永远给不了
      const relic = pickRelic(relics);
      if (relic) {
        rewards.push({ label: `${pick(relic, "name")}·${pick(relic, "soul")}`, detail: pick(relic, "desc"), color: relic.color, icon: ICONS.relic, apply: () => {
          relics[relic.id] = true;
          if (relic.id === "patience") player.invulnMult = 1.25;
          sfxEquip();
          candyBanner = { text: `${pick(relic, "line")}(${pick(relic, "desc")})`, t: 3.2 };
          if (Object.keys(relics).length >= 6) {
            // 六魂共鸣: the collection closes with one full-screen judgment
            let reaped = 0;
            for (const e of enemies) {
              if (!e.elite && !e.boss && e.hp > 0) {
                e.hp = 0;
                reaped++;
              }
            }
            killFlash = 0.35;
            sfxFanfare();
            candyBanner = { text: sixSoulsLine(), t: 4 };
          }
        }});
      } else {
        // all six collected: the souls send coins instead
        const v = Math.max(1, Math.round(30 * coinGainMult() * getDifficulty().coinMult * Math.max(currentCoinFactor(), endlessRound > 0 ? 0 : 1)));
        rewards.push({ label: t(`金币雨 ×${v}`, `Coin Rain ×${v}`), detail: t("本局金币立即入账", "Run coins, paid instantly"), color: "#ffd166", icon: ICONS.coin, apply: () => {
          if (endlessRound > 0) roundPendingCoins += v; else runCoins += v;
        }});
      }
    } else if (roll < 68) {
      // 觉醒骨: 宝箱的圣杯 — 三层逻辑永无死槽
      rewards.push({ label: t("觉醒骨", "Awakening Bone"), detail: t("进化或强化一件武器", "Evolves or boosts a weapon"), color: "#ffd93d", icon: ICONS.awakening, apply: () => {
        const ready = player.weapons.find((w) => canEvolve(w));
        if (ready) {
          ready.evolved = true; // 已攒够条件的武器当场觉醒 — 质变时刻
          const w = WEAPONS[ready.id];
          killFlash = 0.35;
          sfxFanfare();
          candyBanner = { text: t(`* 觉醒骨共鸣!${w.name} 觉醒为 ${w.evolve.name}!!`, `* Bone resonance! ${pick(w, "name")} awakens as ${pick(w.evolve, "name")}!!`), t: 3.5 };
          return;
        }
        const up = player.weapons.filter((w) => w.tier < 4);
        if (up.length) {
          const inst = up[Math.floor(Math.random() * up.length)];
          inst.tier = Math.min(4, inst.tier + 2); // 跳级,比卡片高一档
          candyBanner = { text: t(`* 觉醒骨低鸣。${WEAPONS[inst.id].name} 品阶连跳!`, `* The bone hums low. ${pick(WEAPONS[inst.id], "name")} jumps two tiers!`), t: 3 };
        } else {
          const ws = player.weapons;
          if (ws.length) ws[Math.floor(Math.random() * ws.length)].enhance += 2;
          candyBanner = { text: t("* 觉醒骨化作纯粹的力量,融入了武器。", "* The bone dissolves into pure power and joins your weapons."), t: 3 };
        }
      }});
    } else {
      const v = Math.max(1, Math.round((25 + Math.random() * 20) * coinGainMult() * getDifficulty().coinMult * Math.max(currentCoinFactor(), endlessRound > 0 ? 0 : 1)));
      rewards.push({ label: t(`金币雨 ×${v}`, `Coin Rain ×${v}`), detail: t("本局金币立即入账", "Run coins, paid instantly"), color: "#ffd166", icon: ICONS.coin, apply: () => {
        if (endlessRound > 0) roundPendingCoins += v; else runCoins += v;
      }});
    }
  }
  return rewards;
}

function openChest(forceCount = 0) {
  runChestsOpened += 1;
  let rewards = rollChestRewards();
  if (forceCount > 0) {
    while (rewards.length < forceCount) rewards = rewards.concat(rollChestRewards());
    rewards = rewards.slice(0, forceCount);
  }
  chestCeremony = {
    t: 0,
    phase: "drop", // drop (0.35s slam) -> spin (1.5s ticks) -> reveal
    rewards,
    lastTick: -1,
    shake: 0, // screen shake amount, decays
    flash: 0, // white burst at the moment of opening
    sparks: [], // golden fountain particles
    landed: false,
  };
  state = "chest";
}

function chestSpawnSparks(n, jackpot) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 - 110;
  const palette = jackpot >= 2
    ? ["#ffd93d", "#fff3b0", "#ff8fc7", "#7cf28a", "#8fd6ff"]
    : ["#ffd166", "#fff3b0", "#f2ead8"];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const sp = 260 + Math.random() * 380;
    chestCeremony.sparks.push({
      x: cx + (Math.random() - 0.5) * 30,
      y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 120, // harder upward kick
      t: 0,
      life: 1.1 + Math.random() * 0.7,
      size: 2 + Math.random() * 3,
      color: palette[Math.floor(Math.random() * palette.length)],
      spin: Math.random() * Math.PI * 2,
    });
  }
}

function chestAdvance() {
  if (!chestCeremony) return;
  if (chestCeremony.phase === "drop") {
    chestCeremony.phase = "spin"; // impatient tap: skip straight to the reel
    chestCeremony.t = 0;
    chestCeremony.landed = true;
  } else if (chestCeremony.phase === "spin") {
    chestCeremony.phase = "reveal";
    chestCeremony.t = 0;
    const jackpot = chestCeremony.rewards.length >= 5 ? 2 : chestCeremony.rewards.length >= 3 ? 1 : 0;
    chestCeremony.freeze = jackpot === 2 ? 0.18 : 0; // 五连只停一拍,不拖慢继续战斗
    // the burst: white flash, shake, and a golden fountain sized to the prize
    chestCeremony.flash = 0.22;
    chestCeremony.shake = jackpot === 2 ? 0.8 : jackpot === 1 ? 0.5 : 0.3;
    chestSpawnSparks(jackpot === 2 ? 72 : jackpot === 1 ? 48 : 26, jackpot);
    sfxChestOpen(jackpot);
    if (jackpot) killFlash = 0.3;
    if (jackpot === 2) sfxFanfare();
  } else {
    // collect and return to the fight
    for (const rw of chestCeremony.rewards) rw.apply();
    floatingTexts.push(new FloatingText(player.x, player.y - 30, t(`宝箱 ×${chestCeremony.rewards.length}`, `Chest ×${chestCeremony.rewards.length}`), "#ffd166"));
    chestCeremony = null;
    state = "playing";
    fireBark("chest");
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
  g.fillText(t("我做了一个Sans割草游戏.", "I made a Sans survivors game."), 360, 72);
  const oc =
    runOutcome === "victory" ? [t("通关成功！", "STAGE CLEAR!"), "#7cf28a"]
    : runOutcome === "endlessDeath" ? [t("无尽终局", "ENDLESS END"), "#ff8a5d"]
    : runOutcome === "retreat" ? [t("主动撤离", "EXTRACTED"), "#8fd6ff"]
    : ["GAME OVER", "#ff5d73"];
  g.fillStyle = oc[1];
  g.font = "bold 52px monospace";
  g.fillText(oc[0], 360, 140);
  g.fillStyle = "#9a93ab";
  g.font = "18px monospace";
  g.fillText(
    t(
      `${todayKey()} · ${currentCharacter().name} · ${getDifficulty().name}难度${wasDaily ? " · ✦每日挑战" : ""}`,
      `${todayKey()} · ${pick(currentCharacter(), "name")} · ${pick(getDifficulty(), "name")}${wasDaily ? " · ✦Daily" : ""}`
    ),
    360,
    176
  );
  // portrait with soul glow
  const spr = PLAYER_SPRITES[player.character] || PLAYER_SPRITES.sans;
  // fit every character into the same 240px-tall slot so the stats below
  // never collide with a taller sprite
  const scale = Math.max(4, Math.floor(240 / spr.height));
  g.save();
  g.imageSmoothingEnabled = false;
  const soul = equippedCosmetic();
  if (soul) { g.shadowColor = soul.color; g.shadowBlur = 34; }
  g.drawImage(spr, 360 - (spr.width * scale) / 2, 210, spr.width * scale, spr.height * scale);
  g.restore();
  const lines = [
    [`${t("得分", "Score")} ${lastScore}`, "#ffd166", "bold 40px monospace"],
    [
      t(
        `存活 ${Math.floor(bossDefeated ? stageClearTime : elapsed)} 秒 · 击杀 ${player.kills} · 最高连杀 ${runMaxStreak}`,
        `Survived ${Math.floor(bossDefeated ? stageClearTime : elapsed)}s · Kills ${player.kills} · Best streak ${runMaxStreak}`
      ),
      "#f2ead8",
      "22px monospace",
    ],
  ];
  if (endlessResult) lines.push([t(`无尽审判 ${endlessResult.rounds} 轮 · 无尽得分 ${endlessResult.score}`, `Judgement rounds ${endlessResult.rounds} · endless score ${endlessResult.score}`), "#ff8a5d", "22px monospace"]);
  lines.push([`${t("金币", "Coins")} +${lastRunCoins}`, "#ffd166", "22px monospace"]);
  if (nearMiss) lines.push([nearMiss, "#ff8a5d", "20px monospace"]);
  if (activeContract) lines.push([`${t("契约", "Pact")}「${pick(activeContract, "name")}」`, "#d9c47a", "22px monospace"]);
  if (bestTitle()) lines.push([`${t("称号", "Title")}「${pick(bestTitle(), "name")}」`, "#c59bff", "22px monospace"]);
  if (lastDeathBy && runOutcome !== "retreat") lines.push([`${t("死于", "Slain by")}:${lastDeathBy}`, "#c95d5d", "20px monospace"]);
  // narrative lines are capped so a busy endless card never spills past the deco
  if (deathKillerLine && lines.length < 9) lines.push([deathKillerLine, "#8fa8c9", "15px monospace"]);
  if (loveVerdict?.lines?.length && lines.length < 9) lines.push([loveVerdict.lines[0], "#c59bff", "15px monospace"]);
  else if (deathQuote && lines.length < 9) lines.push([deathQuote, "#8fa8c9", "20px monospace"]);
  let ly = 210 + spr.height * scale + 62; // always clear of the portrait
  for (const [text, color, font] of lines) {
    g.fillStyle = color;
    g.font = font;
    g.fillText(text, 360, ly);
    ly += font.startsWith("bold 40") ? 58 : font.startsWith("15") ? 30 : 40;
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
  // 裂缝外锐评: the community's one-line verdict, right where it belongs —
  // on the card that gets shared back to the community
  if (shareRoast) {
    g.fillStyle = "#8fa8c9";
    g.font = "16px monospace";
    g.fillText(shareRoast, 360, 900);
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
        ? t(`我在审判廊通关了审判,得分 ${lastScore}!`, `I cleared the Judgement Hall with ${lastScore} points!`)
        : t(`我在审判廊拿下 ${lastScore} 分!`, `I scored ${lastScore} in the Judgement Hall!`);
      if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text, title: t("Sans割草游戏", "Sans Survivors") }).catch(() => {});
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
// debug: ?evolve pre-maxes the starting weapon (tier 5 + 3 stacks) so the
// golden evolution card shows up on the very first choice screen
const DEBUG_EVOLVE = new URLSearchParams(location.search).get("evolve");
// debug: ?chest opens the slot ceremony immediately (?chest=3 / ?chest=5
// forces the jackpot sizes) — for tuning the show without farming elites
const DEBUG_CHEST = new URLSearchParams(location.search).get("chest");
const DEBUG_UNLOCKED = localStorage.getItem("debugUnlocked") === "1";
const RANKING_DEBUG_RUN = DEBUG_BOSS !== null || DEBUG_EVOLVE !== null || DEBUG_CHEST !== null || DEBUG_UNLOCKED;
// The public debug helpers must not leave a convincing local record card.
// Headless/offline harnesses keep their local ledger so deterministic legacy
// regressions can still assert normal-vs-endless score separation.
const PRODUCTION_DEBUG_RUN = RANKING_DEBUG_RUN && /(^|\.)sansgecao\.com$/.test(location.hostname || "");

function rankedRunRequest() {
  return {
    character: player.character,
    difficulty: getDifficulty().id,
    silence: activeContract?.id === "silence",
    daily: dailyMode,
    debug: RANKING_DEBUG_RUN,
  };
}

function rankedRunStats() {
  return { elapsed, kills: player.kills, rounds: dailyMode ? 0 : roundsCleared };
}

// ---- boss-clear choices ----------------------------------------------------

function bossClearLeave() {
  // victory settlement: coins, boss kill, difficulty clear and the normal
  // best all recorded by settleGame; title reads 通关成功, never GAME OVER
  settleGame("victory");
}

function startRound(n) {
  endlessRound = n;
  if (n === 1) fireBark("endless");
  roundTimer = ROUND_LENGTH;
  roundPendingCoins = 0;
  roundBossSpawned = false;
  roundBossDown = false;
  spawner.round = n;
  const rules = [
    "", // 1-based
    t("精英成群 · 金币收益 50%", "Elites swarm · coin yield 50%"),
    t("怪物移速 +15% · 金币收益 25%", "Monster speed +15% · coin yield 25%"),
    t("怪物伤害提升 · 治疗减半 · 远程怪增多 · 金币收益 10%", "More damage · healing halved · more ranged · coins 10%"),
    t("危险领域降临 · 金币不再掉落", "Hazard zones descend · coins stop dropping"),
    t("全部审判叠加，且仍在加深", "All judgements stack, and keep deepening"),
  ];
  roundBanner = { text: t(`⚖ 审判第 ${n} 轮`, `⚖ Judgement Round ${n}`), sub: rules[Math.min(n, 5)], t: 2.8 };
  sfxAlarm();
  nextChoiceAt = Math.max(nextChoiceAt, elapsed + 5); // no instant backlog
  state = "playing";
  bgmPlay();
}

function bossClearContinue() {
  // full boss reward, then the judgement continues in 90s rounds
  player.hp = player.maxHp;
  for (const eq of EQUIPMENT_TYPES) eq.apply(player); // every gem's effect(别用 t 命名——遮蔽 i18n)
  spawner.endless = true;
  nextChoiceAt = elapsed + choiceInterval; // no backlog of choice screens
  floatingTexts.push(new FloatingText(player.x, player.y - 26, t("决心！全属性提升", "DETERMINATION! All stats up"), "#ffffff"));
  unlockEchoToast("why");
  queueTipOnce("endless", t("什么是无尽审判？", "What is the endless judgement?"), [
    t("每 90 秒为一轮，轮末 15 秒会出现强化首领", "Rounds last 90s; a boosted boss spawns in the final 15s"),
    t("击杀首领完成本轮，可选择撤离结算，或进入更危险的下一轮", "Kill it to clear the round, then extract — or go deeper"),
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
  const endlessCut = endlessRound >= 6 ? 0.25 : endlessRound >= 3 ? 0.5 : 1;
  return endlessCut * (activeContract?.id === "silence" ? 0.5 : 1) * (relics.kind ? 1.15 : 1); // 平底锅
}

// ---- daily challenge -------------------------------------------------------
// One fixed-seed run per calendar day: same spawns/cards for everyone, a
// rotating character (locks bypassed — it doubles as a demo), local best kept.

let titleMenuOpen = false; // ☰ drawer on the title screen
let bookChar = 0; // 武器图鉴: active character tab
let bookSel = 0; // 武器图鉴: selected weapon row
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

let prevDifficultyId = 0; // player's own pick, restored when daily ends

function startDailyChallenge() {
  const seed = dailySeed();
  // 标准竞技: fixed difficulty for everyone (普通 — no meta, no revives, so
  // the floor is already high); the player's own setting comes back after
  prevDifficultyId = getDifficulty().id;
  setDifficulty(0);
  const dailyChars = CHARACTERS.map((c, i) => ({ c, i })).filter((x) => !x.c.cost);
  selectedChar = dailyChars[seed % dailyChars.length].i;
  // daily never hands out a support weapon as the solo starter
  const dailyPool = currentWeaponList()
    .map((w, i) => ({ w, i }))
    .filter((x) => !x.w.support && !x.w.choiceOnly);
  selectedWeapon = dailyPool[(seed >>> 3) % dailyPool.length].i;
  dailyMode = true;
  Math.random = mulberry32(seed); // whole run becomes deterministic
  startGame();
}

function exitDailyMode() {
  if (!dailyMode) return;
  dailyMode = false;
  Math.random = nativeRandom;
  setDifficulty(prevDifficultyId);
}

// ---- 塔防开局(2026-07-16): 复用 reset 的世界搭建,玩家本体退场 ---------------
function startTdRun() {
  exitDailyMode();
  cancelRankedRun(); // TD is local-only in Phase 1; discard any stale classic handle
  const lead = tdPickRoster[0];
  selectedChar = Math.max(0, CHARACTERS.findIndex((c) => c.id === lead.charId)); // BGM/皮肤跟队长
  reset(lead.weaponId); // reset 会清 tdMode——因此开关必须在 reset 之后立
  tdMode = true;
  timeScale = 1; // never inherit 2×/3× from the previous classic run
  introBlack = 1.5;
  // 玩家本体不上场: 无武器、隐形、永不受击——所有输出来自放置的 sans 塔,
  // 但数值字段保留(塔的 getter 代理+攻击/攻速卡+商店加成都写在 player 上)
  player.weapons = [];
  player.x = WIDTH / 2;
  player.y = HEIGHT / 2;
  player.invuln = 9e9;
  player.revives = 0;
  reviveArmed = 0;
  activeContract = null;
  tutorialStep = -1;
  Enemy.dmgDealt = 0; // TD Boss 标定只读取本局的有效伤害
  td = tdNewRun(tdBuildMap(WIDTH, HEIGHT, WALL_H), tdPickRoster.map((m) => ({ ...m, placedN: 0 })));
  tdHoverCell = null;
  funValue = 0; // 访客彩蛋绕着玩家转,塔防局关闭
  savepointNote = null;
  // 新 key 让已经看过旧版“边打边读”提示的玩家，也能看到一次新版确认框。
  if (!localStorage.getItem("tip_tdintro_confirm")) {
    localStorage.setItem("tip_tdintro_confirm", "1");
    td.introPending = true;
    introBlack = 0;
    activeTip = {
      title: t("塔防模式:守住左边的入口", "Tower defense: hold the gate"),
      lines: [
        t("点下方编队卡→点绿色地面放置 sans;击杀怪物攒经验,越放越贵", "Tap a squad card, then a green tile; kills earn XP, placing gets pricier"),
        t("第一座塔免费;第一位成员是队长,其团队加成会标在编队栏", "Your first tower is free; the first member is leader and their team bonus is shown"),
        t("入口只有100血,被破坏后再放进一只怪就输了", "The gate has 100 HP; once destroyed, one more leak loses the run"),
      ],
      t: Infinity,
      confirm: true,
    };
  }
  state = "playing";
  startBattleBgm();
}

function activateModeOption(index) {
  if (index === 0) {
    toCharSelect();
  } else if (index === 1) {
    state = "dailyintro";
    bossClearChoice = 1;
  } else if (index === 2) {
    tdPickSel = 0;
    tdPickRoster = [];
    tdKeyboardFocus = { zone: "char", index: 0 };
    state = "tdpick";
    announceTdFocus();
  }
  sfxClick();
}

function usableTdWeapons() {
  const c = CHARACTERS[tdPickSel];
  return c ? WEAPON_LISTS[c.id].filter(tdWeaponAllowed) : [];
}

function addTdRosterWeapon(index) {
  const c = CHARACTERS[tdPickSel];
  const weapon = usableTdWeapons()[index];
  if (!c || !weapon) return false;
  if (tdPickRoster.length >= 3 || tdPickRoster.some((member) => member.charId === c.id)) {
    sfxHurt();
    announceGame(t("这个 Sans 已在队伍中，或队伍已满。", "That Sans is already in the squad, or the squad is full."));
    return false;
  }
  tdPickRoster.push({
    char: c,
    weapon,
    charId: c.id,
    weaponId: weapon.id,
    cost: c.cost || 1000,
    teamDmgPct: Math.round((CHAR_NATURE[c.id]?.dmg || 0) * 100),
    placed: false,
  });
  sfxEquip();
  announceGame(t(`${pick(c, "name")}携带${pick(weapon, "name")}加入队伍，当前${tdPickRoster.length}人。`, `${pick(c, "name")} joins with ${pick(weapon, "name")}. Squad ${tdPickRoster.length} of 3.`));
  return true;
}

function moveTdCharacter(delta) {
  const locks = charLocksNow();
  for (let step = 1; step <= CHARACTERS.length; step++) {
    const next = (tdPickSel + delta * step + CHARACTERS.length) % CHARACTERS.length;
    if (!locks[CHARACTERS[next].id]) {
      tdPickSel = next;
      setTdKeyboardFocus("char", next);
      return;
    }
  }
}

function announceModeFocus() {
  const option = tdModeOptions()[Math.max(0, modeKeyboardFocus)];
  if (option) announceGame(`${option.name}。${option.hint}`);
}

function announceTdFocus() {
  if (!tdKeyboardFocus) return;
  const { zone, index } = tdKeyboardFocus;
  if (zone === "char") {
    const c = CHARACTERS[tdPickSel];
    const lock = charLocksNow()[c.id];
    announceGame(lock
      ? t(`${pick(c, "name")}，未解锁。${lock.hint}`, `${pick(c, "name")}, locked. ${lock.hint}`)
      : t(`${pick(c, "name")}，放置费用${c.cost || 1000}。`, `${pick(c, "name")}, placement cost ${c.cost || 1000}.`));
  } else if (zone === "weapon") {
    const weapon = usableTdWeapons()[index];
    if (weapon) announceGame(t(`${pick(weapon, "name")}，${pick(weapon, "tag")}。按 Enter 加入队伍。`, `${pick(weapon, "name")}, ${pick(weapon, "tag")}. Press Enter to add.`));
  } else if (zone === "roster") {
    const member = tdPickRoster[index];
    announceGame(member
      ? t(`队伍第${index + 1}位，${pick(member.char, "name")}，${pick(member.weapon, "name")}。按 Enter 移除。`, `Squad slot ${index + 1}, ${pick(member.char, "name")}, ${pick(member.weapon, "name")}. Press Enter to remove.`)
      : t(`队伍第${index + 1}位，空位。`, `Squad slot ${index + 1}, empty.`));
  } else {
    announceGame(t(`开始守门。当前队伍${tdPickRoster.length}人。`, `Hold the gate. Squad ${tdPickRoster.length} of 3.`));
  }
}

function setTdKeyboardFocus(zone, index = 0) {
  if (zone === "char") index = tdPickSel;
  else if (zone === "weapon") index = Math.max(0, Math.min(index, Math.max(0, usableTdWeapons().length - 1)));
  else if (zone === "roster") index = Math.max(0, Math.min(index, 2));
  else index = 0;
  tdKeyboardFocus = { zone, index };
  keyboardNavigation = true;
  announceTdFocus();
}

// 塔防失败: 破门后漏怪——借用死亡结算管线(player.hp=0 → death 结局)
function tdLose(e) {
  player.invuln = 0;
  player.hp = 0;
  lastHitBy = t(`${enemyDisplayName(e)}攻入了入口`, `${enemyDisplayName(e)} breached the gate`);
  lastHitKind = killerKindOf(e);
  settleGame();
}

function startGame() {
  reset(currentWeaponList()[selectedWeapon].id);
  if (DEBUG_BOSS !== null) {
    elapsed = bossAppearAt() - 2;
    nextChoiceAt = 99999; // skip the backlog of choice screens
    // simulate a 5-minute build so the tester isn't one-shot
    player.maxHp = 1600;
    player.hp = 1600;
    player.atk += 40;
    player.regen += 20;
    player.dmgReduction = 0.6; // survivable enough to watch the whole show
    if (DEBUG_BOSS === "weak") {
      // the flow-test route: near-unkillable dummy so automated runs and
      // manual flow checks never flake on phase-2 bullet luck
      player.dmgReduction = 0.75;
      player.revives = 3; // debug lives; consumeRevive() no-ops at 0 stock
    }
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
  player.revives = dailyMode || getDifficulty().id === 3 || reviveStock() <= 0 ? 0 : 1; // 每日零复活
  reviveArmed = player.revives; // telemetry: used = armed - remaining at settle
  // 行前整备: shop-bought loadout, granted before the first frame。
  // 之前静默发放——不登记构筑、无开局提示,玩家以为没生效(2026-07-14 用户反馈);
  // 现在登记进构筑栏+开局提示卡(浮字活不过开场黑幕,走tip管道)
  if (upgradeLevel("gear") > 0 && !dailyMode) { // 每日=标准竞技,局外整备不进场
    const granted = [];
    for (let i = 0; i < upgradeLevel("gear"); i++) {
      const type = rollEquipmentDrop();
      type.apply(player);
      runEquip[type.id] = (runEquip[type.id] || 0) + 1;
      granted.push(pick(type, "label"));
    }
    tipQueue.push({ title: t("行前整备已生效", "Provisions equipped"), lines: [granted.join(" · "), t("本局构筑可在暂停页与结算详情查看", "Check your build on the pause and results screens")], t: 6 });
  }
  // 局外强化开局回响(2026-07-15 用户"买了如何感知提升"): 只在战力构成
  // 变化后的第一局提示——刚买完的那局才是感知时刻,之后不刷屏。
  // 浮字活不过开场黑幕,走 tip 管道(前车之鉴见上)。
  if (!dailyMode) {
    const sig = `${player.metaDmg.toFixed(3)}|${player.hpAmp.toFixed(3)}|${upgradeLevel("bulwark")}`;
    let seen = null;
    try { seen = localStorage.getItem("metaPowerSeen"); } catch {}
    if (sig !== seen && (player.metaDmg > 1 || player.hpAmp > 1 || upgradeLevel("bulwark") > 0)) {
      const metaParts = [];
      if (player.metaDmg > 1) metaParts.push(`${t("伤害", "DMG")} ×${player.metaDmg.toFixed(2)}`);
      if (player.hpAmp > 1) metaParts.push(`${t("生命", "HP")} +${Math.round((player.hpAmp - 1) * 100)}%`);
      if (upgradeLevel("bulwark") > 0) metaParts.push(`${t("减伤", "DR")} ${3 * upgradeLevel("bulwark")}%`);
      tipQueue.push({
        title: t("⚒ 局外强化已就位", "⚒ Upgrades locked in"),
        lines: [metaParts.join(" · "), t(`战力指数 ${metaPowerIndex()}——这一局,亲手验货`, `Power index ${metaPowerIndex()} — go feel the difference`)],
        t: 6,
      });
      try { localStorage.setItem("metaPowerSeen", sig); } catch {}
    }
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
  if (DEBUG_EVOLVE !== null && player.weapons[0]) {
    player.weapons[0].tier = 4;
    player.weapons[0].enhance = 3;
  }
  timeScale = 1;
  state = "playing";
  introBlack = 1.5; // brief black screen while the battle music fades in
  if (DEBUG_CHEST !== null) {
    // debug ceremony must OPEN AFTER the state stomp above, or "chest" gets
    // overwritten back to "playing" and the ceremony never shows
    introBlack = 0;
    openChest(parseInt(DEBUG_CHEST, 10) || 0); // ?chest / ?chest=3 / ?chest=5
  }
  startBattleBgm();
  cancelRankedRun(); // drop any stale unsettled ranked handle before a new run
  // Ranked time starts with the run, not with the first upgrade card. The
  // client retries identity/run registration in the background if mobile
  // networking is briefly unavailable.
  if (!tdMode) beginRankedRun(rankedRunRequest(), rankedRunStats);
  funValue = 1 + Math.floor(Math.random() * 100); // fresh FUN roll each run
  // savepoint aphorism: typed out as the black intro lifts (UT save-star vibe)
  // 新手引导: 没看完教程且账号还很新时开启(首局死掉允许第二局重看)
  tutorialStep = localStorage.getItem("tutorialDone") !== "1" && getStats().runs < 2 && !dailyMode && DEBUG_BOSS === null ? 0 : -1;
  tutorialStepT = 0;
  tutorialMoved = 0;
  tutorialChoseCard = false;
  savepointNote = tutorialStep === 0 ? null : {
    text: pickSavepointQuote({
      charId: player.character,
      difficultyId: getDifficulty().id,
      isDaily: dailyMode,
      firstRun: getStats().runs === 0,
      deathStreak: narrativeDeathStreak(),
      bossCleared: getStats().bossKills > 0,
      echoCount: unlockedAllEchoCount(),
    }),
    t: 0,
  };
  // FUN 66: the savepoint speaks in entry seventeen
  if (funValue === 66) savepointNote.text = funGlitchSavepoint();
}

// ---- 15s buff choices -----------------------------------------------------

// ---- 塔防选卡池(2026-07-16 用户规格): 攻击类给塔,生存类给入口,
// 专属/技能强化标题前缀角色名 -------------------------------------------------
function buildTdChoicePool() {
  const pool = [
    {
      kind: "atk",
      weight: 16,
      make: () => {
        const gain = Math.max(4, Math.round(player.atk * 0.12));
        return {
          title: t(`全塔攻击 +${gain}`, `All towers ATK +${gain}`),
          desc: t(`所有 sans 塔共享攻击成长\n当前 ${player.atk} → ${player.atk + gain}`, `Every tower shares ATK growth\nNow ${player.atk} → ${player.atk + gain}`),
          color: "#ff6b6b",
          apply: () => { player.atk += gain; },
        };
      },
    },
    {
      kind: "fireRate",
      weight: 14,
      make: () => ({
        title: t("全塔攻速 +0.12", "All towers Rate +0.12"),
        desc: t(`出手更快\n当前 ${player.fireRate.toFixed(2)} → ${Math.min(50, player.fireRate + 0.12).toFixed(2)}`, `Faster attacks\nNow ${player.fireRate.toFixed(2)} → ${Math.min(50, player.fireRate + 0.12).toFixed(2)}`),
        color: "#7cf28a",
        apply: () => { player.fireRate = Math.min(50, player.fireRate + 0.12); },
      }),
    },
    {
      kind: "amp",
      weight: 12,
      make: () => ({
        title: t("全塔增伤 +12%", "All towers DMG +12%"),
        desc: t(`最终伤害乘区\n当前 +${Math.round((player.dmgAmp - 1) * 100)}% → +${Math.round((player.dmgAmp - 1) * 100) + 12}%`, `Final damage multiplier\nNow +${Math.round((player.dmgAmp - 1) * 100)}% → +${Math.round((player.dmgAmp - 1) * 100) + 12}%`),
        color: "#ff8a5d",
        apply: () => { player.dmgAmp += 0.12; },
      }),
    },
  ];
  const gate = td.entrance;
  if (!gate.destroyed) {
    // 入口卡: 血量/回血/减伤/闪避全部改喂入口(用户规格);门破后修不了
    pool.push({
      kind: "gateHp",
      weight: 14,
      make: () => ({
        title: t("入口加固 +30", "Gate Max HP +30"),
        desc: t(`上限提高并立刻回复30\n当前 ${Math.ceil(gate.hp)}/${gate.maxHp} → ${Math.min(gate.maxHp + 30, Math.ceil(gate.hp) + 30)}/${gate.maxHp + 30}`, `Raise the cap and heal 30\nNow ${Math.ceil(gate.hp)}/${gate.maxHp}`),
        color: "#ff8fc7",
        apply: () => { gate.maxHp += 30; gate.hp = Math.min(gate.maxHp, gate.hp + 30); },
      }),
    });
    pool.push({
      kind: "gateHeal",
      weight: 12,
      make: () => ({
        title: t("入口修复 +40", "Gate Repair +40"),
        desc: t(`立刻回复入口40点耐久\n当前 ${Math.ceil(gate.hp)}/${gate.maxHp}`, `Heal the gate for 40\nNow ${Math.ceil(gate.hp)}/${gate.maxHp}`),
        color: "#7cf28a",
        apply: () => { gate.hp = Math.min(gate.maxHp, gate.hp + 40); },
      }),
    });
    if (gate.regen < 3) {
      pool.push({
        kind: "gateRegen",
        weight: 10,
        make: () => ({
          title: t("入口自愈 +0.8/秒", "Gate Regen +0.8/s"),
          desc: t(`入口持续回血(上限3/秒)\n当前 ${gate.regen.toFixed(1)}/秒`, `The gate heals itself (cap 3/s)\nNow ${gate.regen.toFixed(1)}/s`),
          color: "#5ee6e6",
          apply: () => { gate.regen = Math.min(3, gate.regen + 0.8); },
        }),
      });
    }
    if (gate.dmgReduction < 0.6) {
      pool.push({
        kind: "gateTough",
        weight: 10,
        make: () => ({
          title: t("入口减伤 +8%", "Gate Damage Cut +8%"),
          desc: t(`入口受到的伤害降低(上限60%)\n当前 ${Math.round(gate.dmgReduction * 100)}%`, `The gate takes less damage (cap 60%)\nNow ${Math.round(gate.dmgReduction * 100)}%`),
          color: "#8fd6ff",
          apply: () => { gate.dmgReduction = Math.min(0.6, gate.dmgReduction + 0.08); },
        }),
      });
    }
    if (gate.dodge < 0.35) {
      pool.push({
        kind: "gateDodge",
        weight: 8,
        make: () => ({
          title: t("入口闪避 +5%", "Gate Dodge +5%"),
          desc: t(`怪物的攻击有概率落空(上限35%)\n当前 ${Math.round(gate.dodge * 100)}%`, `Attacks can whiff (cap 35%)\nNow ${Math.round(gate.dodge * 100)}%`),
          color: "#c59bff",
          apply: () => { gate.dodge = Math.min(0.35, gate.dodge + 0.05); },
        }),
      });
    }
  }
  // 已放塔的技能卡: 专属/品阶/进化/获得新武器,标题前面写角色名(用户规格)
  for (const tw of td.towers) {
    const charName = pick(CHARACTERS.find((c) => c.id === tw.charId) || CHARACTERS[0], "name");
    // 获得新武器(2026-07-26 用户规格): 从该角色可站桩武器里补一把,
    // 每塔最多 3 把——手机上四座满配塔也不超过经典单人武器量级
    if (tw.pp.weapons.length < 3) {
      const owned = new Set(tw.pp.weapons.map((i) => i.id));
      const options = (WEAPON_LISTS[tw.charId] || []).filter((w) => tdWeaponAllowed(w) && !owned.has(w.id));
      if (options.length) {
        pool.push({
          kind: "newWeapon",
          weight: 18,
          make: () => {
            const w = options[Math.floor(Math.random() * options.length)];
            return {
              title: `${charName}·${t("获得新武器", "New Weapon")}`,
              desc: `${pick(w, "name")}\n[${pick(w, "tag")}]`,
              color: w.color,
              apply: () => { tw.pp.weapons.push(createWeaponInstance(w.id)); },
            };
          },
        });
      }
    }
    for (const inst of tw.pp.weapons) {
    const w = WEAPONS[inst.id];
    if (w.enhance) {
      pool.push({
        kind: "enhance",
        weight: 16,
        make: () => {
          const stacks = inst.enhance;
          const evoHint = w.evolve && !inst.evolved && stacks < 3 ? t(" · 满阶+3层可进化", " · Lv5 + 3 stacks to evolve") : "";
          return {
            title: `${charName}·${t("专属强化", "Signature")}`,
            desc: `${pick(w.enhance, "desc")}\n(${stacks > 0 ? `${t("当前", "Now")} ${stacks} → ${stacks + 1} ${t("层", "stacks")}` : t("首层", "First stack")}${evoHint})`,
            color: w.color,
            apply: () => { inst.enhance += 1; },
          };
        },
      });
    }
    if (inst.tier < 4) {
      pool.push({
        kind: "tierUp",
        weight: 20,
        make: () => ({
          title: `${charName}·${t("品阶提升", "Tier Up")}`,
          desc: `${pick(w, "name")}\nLv${inst.tier + 1} → Lv${inst.tier + 2}`,
          color: w.color,
          apply: () => { inst.tier = Math.min(inst.tier + 1, 4); },
        }),
      });
    }
    if (canEvolve(inst)) {
      pool.push({
        kind: "evolve",
        weight: 60,
        make: () => ({
          title: `${charName}·${t("武器进化", "EVOLVE")}`,
          desc: currentLang() === "en" ? `${pick(w, "name")} awakens as ${pick(w.evolve, "name")}!\n${pick(w.evolve, "desc")}` : `${w.name} 觉醒为 ${w.evolve.name}！\n${w.evolve.desc}`,
          color: "#ffd166",
          fanfare: true,
          apply: () => { inst.evolved = true; },
        }),
      });
    }
    }
  }
  return pool;
}

function buildChoicePool() {
  if (tdMode && td) return buildTdChoicePool();
  const pool = [
    {
      kind: "atk",
      weight: 12,
      make: () => {
        // scales with current atk (8%, floor 4) so late picks still matter
        const gain = Math.max(4, Math.round(player.atk * 0.08));
        return {
          title: t(`攻击力 +${gain}`, `Attack +${gain}`),
          desc: t(`所有武器伤害提升(随攻击成长)\n当前 ${player.atk} → ${player.atk + gain}`, `All weapon damage scales with ATK\nNow ${player.atk} → ${player.atk + gain}`),
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
        const gain = Math.min(Math.max(25, Math.round(player.maxHp * 0.08)), PLAYER_MAX_HP - player.maxHp);
        const nextHp = player.maxHp + gain;
        return {
          title: t(`生命上限 +${gain}`, `Max HP +${gain}`),
          desc: t(`上限提升 8%(保底25) 并回复等量生命\n当前 ${player.maxHp} → ${nextHp}(上限 ${PLAYER_MAX_HP})`, `Max HP +8% (min 25), heals the same amount\nNow ${player.maxHp} → ${nextHp} (cap ${PLAYER_MAX_HP})`),
          color: "#ff8fc7",
          apply: () => {
            player.maxHp = Math.min(PLAYER_MAX_HP, player.maxHp + gain);
            player.hp = Math.min(player.maxHp, player.hp + Math.round(gain * healScale()));
          },
        };
      },
    },
    {
      kind: "speed",
      weight: 12,
      make: () => ({
        title: t("移动速度 +18", "Move Speed +18"),
        desc: `${t("跑得更快，风筝更稳", "Run faster, kite safer")}\n${t("当前", "Now")} ${Math.round(player.moveSpeed)} → ${Math.round(player.moveSpeed) + 18}`,
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
        title: t("攻速 +10%", "Attack Speed +10%"),
        desc: `${t("所有武器攻击更快", "All weapons fire faster")}\n${t("当前", "Now")} ${player.fireRate.toFixed(2)} → ${Math.min(PLAYER_FIRE_RATE_CAP, player.fireRate * 1.1).toFixed(2)} (${t("上限", "cap")} ${PLAYER_FIRE_RATE_CAP})`,
        color: "#5ee6e6",
        apply: () => {
          player.fireRate = Math.min(PLAYER_FIRE_RATE_CAP, player.fireRate * 1.1);
        },
      }),
    },
    {
      kind: "regen",
      // Every stack becomes rarer: 12, 9, 6, 4, 3, 2, 2, 1, 1, 1.
      // The player can still reach 10%, but it becomes a long-run chase.
      weight: Math.max(1, Math.round(12 * Math.pow(0.72, player.regenPct * 100))),
      make: () => ({
        title: t("每秒回血 +1%", "Regen +1%/s"),
        // scales with max hp so it never falls behind late game
        desc: `${t("每秒回复 1% 最大生命", "Restore 1% max HP per second")}\n(${t("当前", "Now")} ${(player.regen + player.maxHp * player.regenPct).toFixed(1)}/s, ${t("上限", "cap")} 10%)`,
        color: "#7cf28a",
        apply: () => {
          player.regenPct = Math.min(player.regenPct + 0.01, 0.1);
        },
      }),
    },
  ].filter((c) =>
    (c.kind !== "regen" || player.regenPct < 0.1) &&
    (c.kind !== "hp" || player.maxHp < PLAYER_MAX_HP) &&
    (c.kind !== "fireRate" || player.fireRate < PLAYER_FIRE_RATE_CAP)
  );

  // Regen caps at 10% of max HP and becomes rarer after every stack.
  pool.push({
    kind: "thorns",
    weight: 10,
    make: () => ({
      title: t("荆棘之躯", "Thorn Body"),
      desc: `${t("触碰你的敌人受到伤害", "Enemies that touch you take damage")}\n(${t("当前", "Now")} ${player.thorns} → ${player.thorns + 5})`,
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
      title: t("紧急治疗", "Emergency Heal"),
      // percentage-based so it never becomes chip healing late game
      desc: `${t("立即恢复 35% 最大生命", "Instantly restore 35% max HP")} (~${Math.max(50, Math.round(player.maxHp * 0.35))})`,
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
      title: t("增伤 +20%", "Damage +20%"),
      desc: `${t("所有武器最终伤害提升", "All weapons deal more damage")}\n(${t("当前", "Now")} ${Math.round(player.dmgAmp * 100)}%)`,
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
      title: t("毁灭强化 +100%", "DEVASTATION +100%"),
      desc: `${t("极稀有！最终伤害翻倍", "Ultra rare! Final damage doubled")}\n(${t("当前", "Now")} ${Math.round(player.dmgAmp * 100)}%)`,
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
        title: t("强化提速", "Faster Cards"),
        desc: t(`强化卡出现间隔 -1 秒\n(${choiceInterval}s -> ${choiceInterval - 1}s)`, `Card interval -1s\n(${choiceInterval}s -> ${choiceInterval - 1}s)`),
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
        title: t("闪避 +5%", "Dodge +5%"),
        desc: t(`有几率完全躲开攻击\n(当前 ${Math.round(player.dodge * 100)}%，上限 45%)`, `A chance to fully avoid hits\n(now ${Math.round(player.dodge * 100)}%, cap 45%)`),
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
        title: t("减伤 +10%", "Damage Cut +10%"),
        desc: t(`受到的伤害降低\n(当前 ${Math.round(player.dmgReduction * 100)}%，上限 90%)`, `Take less damage\n(now ${Math.round(player.dmgReduction * 100)}%, cap 90%)`),
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
          title: t("获得新武器", "New Weapon"),
          desc: `${pick(w, "name")}\n[${pick(w, "tag")}]`,
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
        // 普通卡最多两行效果(美术批): 机制细节看武器图鉴,这里只留
        // 效果一句 + 层数/进化路标一句
        const evoHint = w.evolve && !inst.evolved && stacks < 3 ? t(" · 满阶+3层可进化", " · Lv5 + 3 stacks to evolve") : "";
        return {
          title: `${t("专属强化", "Signature")}·${pick(w, "name")}`,
          desc: `${pick(w.enhance, "desc")}\n(${stacks > 0 ? `${t("当前", "Now")} ${stacks} → ${stacks + 1} ${t("层", "stacks")}` : t("首层", "First stack")}${evoHint})`,
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
          title: `${t("武器进化", "EVOLVE")}·${pick(w.evolve, "name")}`,
          desc: currentLang() === "en" ? `${pick(w, "name")} awakens as ${pick(w.evolve, "name")}!\n${pick(w.evolve, "desc")}` : `${w.name} 觉醒为 ${w.evolve.name}！\n${w.evolve.desc}`,
          color: "#ffd166",
          fanfare: true,
          apply: () => {
            inst.evolved = true;
            fireBark("evolve");
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
          title: t("武器品阶提升", "Weapon Tier Up"),
          desc: `${pick(w, "name")}\nLv${inst.tier + 1} → Lv${inst.tier + 2}`,
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
    // kind 跟着卡走: 选卡界面按 kind 配像素图标(美术批 backlog 第3项)
    picked.push(Object.assign(pool[idx].make(), { kind: pool[idx].kind }));
    pickedKinds.push(pool[idx].kind);
    pool.splice(idx, 1);
  }
  // first three choice screens guarantee at least one weapon-class card
  if (choiceScreens <= 3 && !pickedKinds.some((k) => WEAPON_KINDS.has(k))) {
    const weaponEntries = pool.filter((p) => WEAPON_KINDS.has(p.kind));
    if (weaponEntries.length) {
      const entry = weaponEntries[Math.floor(Math.random() * weaponEntries.length)];
      const slot = Math.floor(Math.random() * picked.length);
      picked[slot] = Object.assign(entry.make(), { kind: entry.kind });
    }
  }
  return picked;
}

function applyChoice(i) {
  const opt = choiceOptions[i];
  if (!opt) return;
  tutorialChoseCard = true; // 新手引导第4步
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
  // Also acts as an immediate retry point after a transient start failure.
  if (!tdMode) beginRankedRun(rankedRunRequest(), rankedRunStats);
}

// ---- input ---------------------------------------------------------------

function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

// ⚡去变强 on the defeat screen: centered between share (left) and home (right)
function upgradeJumpRect(w, h) {
  // 触屏加高到 60(≈38物理px): 上方紧贴详情按钮压不动更多,宽度补偿
  return IS_TOUCH ? { x: w / 2 - 96, y: h - 72, w: 192, h: 60 } : { x: w / 2 - 75, y: h - 62, w: 150, h: 44 };
}

function inRect(p, r) {
  // touch slop: phone canvas scale shrinks buttons to ~14pt effective — pad
  // every hit box (8px x / 4px y, below typical UI gaps so neighbors don't
  // swallow each other's taps)
  const hit = p.x >= r.x - 8 && p.x <= r.x + r.w + 8 && p.y >= r.y - 4 && p.y <= r.y + r.h + 4;
  // press feedback: whatever button a tap lands on flashes for a beat, so
  // "did I hit it?" never needs a second (accidental) tap
  if (hit) tapFlash = { x: r.x, y: r.y, w: r.w, h: r.h, t: 0.16 };
  return hit;
}

function handleCanvasTap(pos) {
  if (tdMode && td?.introPending) {
    confirmTdIntro();
    return;
  }
  if (tutorialStep >= 0 && state === "playing" && inRect(pos, tutorialSkipRect(WIDTH))) {
    endTutorial(); // 跳过=看懂了,别再打扰
    sfxClick();
    return;
  }
  if ((state === "playing" || state === "paused" || state === "choice") && inRect(pos, speedButtonRect(WIDTH))) {
    if (dailyMode) {
      // 明确拒绝而不是静默无视——玩家才知道是规则不是bug
      sfxHurt();
      floatingTexts.push(new FloatingText(player.x, player.y - 40, t("每日挑战锁定 1× 倍速", "Daily challenge locks 1× speed"), "#c59bff"));
      return;
    }
    cycleSpeed();
    sfxClick();
    return;
  }
  if ((state === "playing" || state === "paused") && inRect(pos, pauseButtonRect(WIDTH))) {
    sfxClick();
    if (state === "playing") {
      state = "paused";
      pauseTip = pickPauseTip();
      bgm.pause();
    } else {
      state = "playing";
      bgmPlay();
    }
    return;
  }
  // ---- 塔防局内点击: 编队卡 arm/取消 → 点绿格放置 ---------------------------
  if (state === "playing" && tdMode && td) {
    for (let i = 0; i < td.roster.length; i++) {
      if (inRect(pos, tdBarSlotRect(i, WIDTH, HEIGHT))) {
        // 同一角色可重复放置(2026-07-26 用户规格): 卡片不再一次性
        td.armedSlot = td.armedSlot === i ? -1 : i; // 再点=取消
        tdHoverCell = null;
        sfxClick();
        return;
      }
    }
    if (td.armedSlot >= 0) {
      const cell = tdCellAt(td.map, pos.x, pos.y);
      const occupied = cell && td.towers.some((tw) => tw.cell.c === cell.c && tw.cell.r === cell.r);
      if (cell && cell.kind === 0 && !occupied) {
        const m = td.roster[td.armedSlot];
        const cost = tdPlaceCost(m.cost, td.placedCount);
        if (td.xp >= cost) {
          td.xp -= cost;
          const at = tdCellCenter(td.map, cell.c, cell.r);
          const inst = createWeaponInstance(m.weaponId);
          td.towers.push({ slot: td.armedSlot, charId: m.charId, weaponId: m.weaponId, cell: { c: cell.c, r: cell.r }, pp: tdMakeTowerPP(at.x, at.y, m.charId, inst, player) });
          m.placedN = (m.placedN || 0) + 1;
          td.placedCount += 1;
          td.armedSlot = -1;
          floatingTexts.push(new FloatingText(at.x, at.y - 34, `-${cost} ${t("经验", "XP")}`, "#ffd166"));
          sfxEquip();
        } else {
          floatingTexts.push(new FloatingText(pos.x, pos.y - 20, t("经验不足", "Not enough XP"), "#c95d5d"));
          sfxHurt();
        }
        return;
      }
      // 点了不可放置的位置: 取消放置态
      td.armedSlot = -1;
      tdHoverCell = null;
      return;
    }
  }
  if (state === "title") {
    if (titleMenuOpen) {
      // null slots are the 成长/收藏 group headers — drawn, never clickable
      const targets = ["shop", "quests", "weaponbook", null, "codex", "echoes", "savecode", "debug", null];
      for (let i = 0; i < targets.length; i++) {
        if (targets[i] && inRect(pos, titleMenuItemRect(i, WIDTH, HEIGHT))) {
          if (targets[i] === "debug") openDebugUnlock();
          else state = targets[i];
          titleMenuOpen = false;
          sfxClick();
          return;
        }
      }
    }
    if (inRect(pos, langButtonRect(WIDTH))) {
      toggleLang();
      sfxClick();
      return;
    }
    if (inRect(pos, muteButtonRect(WIDTH))) {
      toggleAudioMuted();
      if (!audioMuted) sfxClick(); // 开声时"哒"一下作确认,静音时保持安静
      return;
    }
    if (inRect(pos, menuButtonRect(WIDTH, HEIGHT))) {
      titleMenuOpen = !titleMenuOpen;
      sfxClick();
    } else if (inRect(pos, creditsButtonRect(WIDTH, HEIGHT))) {
      state = "credits";
      titleMenuOpen = false;
      sfxClick();
    } else if (inRect(pos, leaderboardButtonRect(WIDTH, HEIGHT))) {
      state = "leaderboard";
      loadLeaderboard();
      titleMenuOpen = false;
      sfxClick();
    } else if (inRect(pos, startButtonRect(WIDTH, HEIGHT))) {
      state = "modeselect"; // 三模式集中在此(2026-07-16 塔防上线,主键改"选择模式")
      titleMenuOpen = false;
      sfxClick();
    } else {
      titleMenuOpen = false; // tap empty space: fold the drawer
    }
    return;
  }
  if (state === "modeselect") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
      return;
    }
    for (let i = 0; i < 3; i++) {
      if (inRect(pos, modeOptionRect(i, WIDTH, HEIGHT))) {
        activateModeOption(i);
        return;
      }
    }
    return;
  }
  if (state === "tdpick") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "modeselect";
      sfxClick();
      return;
    }
    const locks = charLocksNow();
    for (let i = 0; i < CHARACTERS.length; i++) {
      if (inRect(pos, tdPickCharRect(i, WIDTH))) {
        if (!locks[CHARACTERS[i].id]) tdPickSel = i; // 锁定角色不可选(去经典模式买断)
        sfxClick();
        return;
      }
    }
    const usable = usableTdWeapons();
    for (let i = 0; i < usable.length; i++) {
      if (inRect(pos, tdPickWeaponRect(i, WIDTH))) {
        addTdRosterWeapon(i);
        return;
      }
    }
    for (let i = 0; i < 3; i++) {
      if (inRect(pos, tdRosterSlotRect(i, WIDTH, HEIGHT)) && tdPickRoster[i]) {
        tdPickRoster.splice(i, 1);
        sfxClick();
        return;
      }
    }
    if (inRect(pos, tdStartRect(WIDTH, HEIGHT)) && tdPickRoster.length > 0) {
      startTdRun();
      sfxClick();
    }
    return;
  }
  if (state === "leaderboard") {
    if (leaderboardTap(pos.x, pos.y, WIDTH, HEIGHT) === "back") {
      state = "title";
      sfxClick();
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
  if (state === "savecode") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
    } else if (inRect(pos, bossClearLeaveRect(WIDTH, HEIGHT))) {
      sfxClick();
      exportSaveCode();
    } else if (inRect(pos, bossClearContinueRect(WIDTH, HEIGHT))) {
      sfxClick();
      importSaveCode();
    }
    return;
  }
  if (state === "weaponbook") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      sfxClick();
      return;
    }
    for (let i = 0; i < CHARACTERS.length; i++) {
      if (inRect(pos, bookCharPillRect(i, WIDTH, CHARACTERS.length))) {
        bookChar = i;
        bookSel = 0;
        sfxClick();
        return;
      }
    }
    const list = WEAPON_LISTS[CHARACTERS[bookChar].id];
    for (let i = 0; i < list.length; i++) {
      if (inRect(pos, bookRowRect(i, WIDTH, HEIGHT))) {
        bookSel = i;
        sfxClick();
        return;
      }
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
    const pageSize = 16;
    const pageCount = Math.ceil(codexListLength() / pageSize);
    const currentPage = Math.floor(codexSelected / pageSize);
    for (const direction of [-1, 1]) {
      if (pageCount > 1 && inRect(pos, codexPageRect(direction, WIDTH))) {
        const page = (currentPage + direction + pageCount) % pageCount;
        codexSelected = Math.min(page * pageSize, codexListLength() - 1);
        sfxClick();
        return;
      }
    }
    const pageStart = currentPage * pageSize;
    const pageEnd = Math.min(pageStart + pageSize, codexListLength());
    for (let i = pageStart; i < pageEnd; i++) {
      if (inRect(pos, codexEntryRect(i - pageStart, WIDTH))) {
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
        const idxBefore = metaPowerIndex();
        const ok = items[i].id === "reviveStock" ? buyReviveStock() : buyUpgrade(items[i].id);
        if (ok) {
          sfxEquip();
          shopFlash = { id: items[i].id, t: 0.6 }; // 数值短闪: 行内看到新值
          const delta = metaPowerIndex() - idxBefore;
          if (delta > 0) shopPowerPulse = { delta, t: 1.4 }; // 战力指数跳涨
        } else {
          sfxHurt(); // maxed or broke: denial buzz + a UT-style line
          const it = items[i];
          // 门槛原因不再常驻条目上,点击时在这里给完整解释(复用已定稿文案)
          shopMsg = {
            text: it.lvl >= it.max ? shopDenyLine("maxed") : it.gate ? t(`* 但什么都没有发生。(${it.gate})`, `* But nothing happened. (${it.gate})`) : shopDenyLine("broke"),
            t: 2.2,
          };
        }
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
    for (const direction of [-1, 1]) {
      if (inRect(pos, charPageArrowRect(direction, WIDTH))) {
        switchCharPage(direction);
        sfxClick();
        return;
      }
    }
    const pageChars = charPageList();
    for (let i = 0; i < pageChars.length; i++) {
      if (inRect(pos, charBoxRect(i, WIDTH, HEIGHT, pageChars.length))) {
        const gi = globalCharIndex(i);
        // 锁定角色: 已选中时再点卡片 = 预览武器库(种草入口,买前先看货)
        if (selectedChar === gi && charLocksNow()[CHARACTERS[gi].id]) {
          selectedWeapon = 0;
          state = "select";
          rollContracts();
          sfxClick();
          return;
        }
        selectedChar = gi;
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
      if (tryBuySelectedChar()) return; // 锁定角色: 确认键先走购买
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
      if (tryBuySelectedChar()) return; // 预览模式: 确认键=在武器库里直接买断
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
    if (inRect(pos, homeButtonRect(WIDTH, HEIGHT))) {
      pauseQuit(); // coins/stats banked exactly like a normal quit…
      goTitle(); // …but skip the ceremony and land on the title page
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
  } else if (state === "chapter") {
    chapterAdvance();
  } else if (state === "gameover") {
    if (inRect(pos, gameoverDetailRect(WIDTH, HEIGHT))) {
      gameoverDetail = !gameoverDetail;
      sfxClick();
      return;
    }
    if (inRect(pos, restartButtonRect(WIDTH, HEIGHT))) {
      sfxClick();
      if (gameoverCta?.act === "shop") state = "shop";
      else restartSameMode();
      return;
    }
    if (inRect(pos, homeButtonRect(WIDTH, HEIGHT))) {
      sfxClick();
      goTitle();
      return;
    }
    if (inRect(pos, shareButtonRect(WIDTH, HEIGHT))) {
      sfxClick();
      shareRun();
      return; // stay on the card
    }
    if (coachAdvice && inRect(pos, upgradeJumpRect(WIDTH, HEIGHT))) {
      sfxClick();
      exitDailyMode();
      reset(currentWeaponList()[0].id); // wipe the battlefield behind the shop
      bgm.pause();
      bgm.muted = true;
      state = "shop";
      return;
    }
    // 结算页点空白 = 无操作(2026-07-27 用户复现"塔防死后自动进普通模式"
    // 的真正根因: 旧兜底"点哪都进经典选人",手机上死亡瞬间的误触直接把
    // 塔防玩家丢进经典模式)。重开走大按钮/回车,两者都按模式回对入口。
  }
}

let lastPointerTapAt = 0;

canvas.addEventListener("pointerup", (e) => {
  initSfx(); // AudioContext may only start inside a user gesture
  if (e.isPrimary === false || (e.button !== undefined && e.button !== 0)) return;
  e.preventDefault();
  keyboardNavigation = false;
  modeKeyboardFocus = -1;
  tdKeyboardFocus = null;
  lastPointerTapAt = performance.now();
  handleCanvasTap(canvasCoords(e));
});

canvas.addEventListener("click", (e) => {
  initSfx();
  if (performance.now() - lastPointerTapAt < 500) return;
  keyboardNavigation = false;
  modeKeyboardFocus = -1;
  tdKeyboardFocus = null;
  handleCanvasTap(canvasCoords(e));
});

function cycleSpeed() {
  if (dailyMode) return; // 每日锁 1×:操作难度也是标准化的一部分
  timeScale = timeScale >= 3 ? 1 : timeScale + 1;
}

window.addEventListener("keydown", (e) => {
  initSfx(); // AudioContext may only start inside a user gesture
  const k = e.key.toLowerCase();
  if (tdMode && td?.introPending) {
    if (k === "enter" || k === " ") {
      e.preventDefault();
      confirmTdIntro();
    }
    return;
  }
  if (k === "z") {
    if (state === "playing") {
      state = "paused";
      pauseTip = pickPauseTip();
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
    if (k === "enter") {
      state = "modeselect";
      modeKeyboardFocus = 0;
      keyboardNavigation = true;
      announceModeFocus();
      sfxClick();
    } else if (k === " ") {
      e.preventDefault();
      toCharSelect(); // 空格直入经典: 保留老玩家肌肉记忆
      announceGame(t("经典割草。请选择角色。", "Classic survival. Choose a character."));
    }
    return;
  }
  if (state === "modeselect") {
    if (k === "escape") {
      state = "title";
      modeKeyboardFocus = -1;
      announceGame(t("返回主菜单。", "Back to the main menu."));
    } else if (k === "arrowup" || k === "arrowleft" || k === "arrowdown" || k === "arrowright") {
      e.preventDefault();
      const delta = k === "arrowup" || k === "arrowleft" ? -1 : 1;
      modeKeyboardFocus = (Math.max(0, modeKeyboardFocus) + delta + 3) % 3;
      keyboardNavigation = true;
      sfxClick();
      announceModeFocus();
    } else if (/^[1-3]$/.test(k)) {
      modeKeyboardFocus = Number(k) - 1;
      keyboardNavigation = true;
      announceModeFocus();
    } else if (k === "enter" || k === " ") {
      e.preventDefault();
      keyboardNavigation = true;
      if (modeKeyboardFocus < 0) modeKeyboardFocus = 0;
      activateModeOption(modeKeyboardFocus);
    }
    return;
  }
  if (state === "tdpick") {
    if (k === "escape") {
      state = "modeselect";
      modeKeyboardFocus = 2;
      tdKeyboardFocus = null;
      keyboardNavigation = true;
      announceModeFocus();
      return;
    }
    if (!tdKeyboardFocus) setTdKeyboardFocus("char", tdPickSel);
    const zone = tdKeyboardFocus.zone;
    const index = tdKeyboardFocus.index;
    const weapons = usableTdWeapons();
    if (k === "tab") {
      e.preventDefault();
      const zones = ["char", "weapon", "roster", "start"];
      const next = (zones.indexOf(zone) + (e.shiftKey ? -1 : 1) + zones.length) % zones.length;
      setTdKeyboardFocus(zones[next], zones[next] === "roster" ? 0 : 0);
    } else if (zone === "char") {
      if (k === "arrowleft" || k === "arrowup") {
        e.preventDefault();
        moveTdCharacter(-1);
      } else if (k === "arrowright") {
        e.preventDefault();
        moveTdCharacter(1);
      } else if (k === "arrowdown" || k === "enter" || k === " ") {
        e.preventDefault();
        setTdKeyboardFocus("weapon", 0);
      }
    } else if (zone === "weapon") {
      if (k === "arrowleft" || k === "arrowright") {
        e.preventDefault();
        const delta = k === "arrowleft" ? -1 : 1;
        setTdKeyboardFocus("weapon", (index + delta + weapons.length) % Math.max(1, weapons.length));
      } else if (k === "arrowup") {
        e.preventDefault();
        if (index >= 4) setTdKeyboardFocus("weapon", index - 4);
        else setTdKeyboardFocus("char", tdPickSel);
      } else if (k === "arrowdown") {
        e.preventDefault();
        if (index + 4 < weapons.length) setTdKeyboardFocus("weapon", index + 4);
        else setTdKeyboardFocus("roster", Math.min(index, 2));
      } else if (k === "enter" || k === " ") {
        e.preventDefault();
        if (addTdRosterWeapon(index)) setTdKeyboardFocus("char", tdPickSel);
      }
    } else if (zone === "roster") {
      if (k === "arrowleft" || k === "arrowright") {
        e.preventDefault();
        const delta = k === "arrowleft" ? -1 : 1;
        setTdKeyboardFocus("roster", (index + delta + 3) % 3);
      } else if (k === "arrowup") {
        e.preventDefault();
        setTdKeyboardFocus("weapon", Math.min(index, Math.max(0, weapons.length - 1)));
      } else if (k === "arrowdown") {
        e.preventDefault();
        setTdKeyboardFocus("start");
      } else if (k === "enter" || k === " ") {
        e.preventDefault();
        if (tdPickRoster[index]) {
          const removed = tdPickRoster.splice(index, 1)[0];
          sfxClick();
          announceGame(t(`已移除${pick(removed.char, "name")}。`, `${pick(removed.char, "name")} removed.`));
        } else {
          sfxHurt();
          announceTdFocus();
        }
      }
    } else if (zone === "start") {
      if (k === "arrowup") {
        e.preventDefault();
        setTdKeyboardFocus("roster", 0);
      } else if (k === "enter" || k === " ") {
        e.preventDefault();
        if (tdPickRoster.length > 0) {
          announceGame(t("塔防开始。守住左边入口。", "Tower defense started. Hold the left gate."));
          startTdRun();
          sfxClick();
        } else {
          sfxHurt();
          announceGame(t("先选择一名 Sans 和一个技能。", "Choose a Sans and one skill first."));
        }
      }
    }
    return;
  }
  if (state === "leaderboard") {
    if (k === "escape") state = "title";
    return;
  }
  if (state === "credits") {
    if (k === " " || k === "enter" || k === "escape") state = "title";
    return;
  }
  if (state === "shop" || state === "codex") {
    if (k === "escape") state = "title";
    else if (state === "codex" && (k === "arrowleft" || k === "arrowright")) {
      codexSelected = (codexSelected + (k === "arrowright" ? 1 : codexListLength() - 1)) % codexListLength();
      sfxClick();
    } else if (state === "codex" && (k === "arrowup" || k === "arrowdown")) {
      codexSelected = (codexSelected + (k === "arrowdown" ? 8 : codexListLength() - 8)) % codexListLength();
      sfxClick();
    }
    return;
  }
  if (state === "quests" || state === "echoes" || state === "savecode") {
    if (k === "escape") state = "title";
    return;
  }
  if (state === "weaponbook") {
    const list = WEAPON_LISTS[CHARACTERS[bookChar].id];
    if (k === "escape") state = "title";
    else if (k === "arrowleft") { bookChar = (bookChar + CHARACTERS.length - 1) % CHARACTERS.length; bookSel = 0; }
    else if (k === "arrowright") { bookChar = (bookChar + 1) % CHARACTERS.length; bookSel = 0; }
    else if (k === "arrowup") bookSel = (bookSel + list.length - 1) % list.length;
    else if (k === "arrowdown") bookSel = (bookSel + 1) % list.length;
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
    const pageChars = charPageList();
    const n = pageChars.length;
    const localSel = Math.max(0, pageChars.indexOf(CHARACTERS[selectedChar]));
    if (k === "arrowleft" || k === "arrowright") selectedChar = globalCharIndex((localSel + 1) % n);
    else if (k === "[" || k === "]") switchCharPage(k === "[" ? -1 : 1);
    else if (k >= "1" && k <= String(n)) selectedChar = globalCharIndex(Number(k) - 1);
    else if (k === " " || k === "enter") {
      if (tryBuySelectedChar()) return; // 锁定角色: 确认键先走购买
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
      if (tryBuySelectedChar()) return; // 预览模式: 确认键=在武器库里直接买断
      if (weaponLocks()[selectedWeapon]) {
        sfxHurt(); // locked weapon can't start a run
        return;
      }
      startGame();
    } else if (k === "escape") state = "charselect";
  } else if (state === "choice") {
    if (k >= "1" && k <= "3") applyChoice(Number(k) - 1);
  } else if (state === "leaderboard" && k === "escape") {
    state = "title";
  } else if (state === "gameover" && k === "escape") {
    goTitle();
  } else if (state === "gameover" && (k === " " || k === "enter")) {
    restartSameMode();
  } else if (state === "chapter" && (k === " " || k === "enter" || k === "escape")) {
    chapterAdvance();
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
  // endless: stat gems dry up round by round like everything else — the
  // elite flood must never be an infinite permanent-stat pump
  const gearFactor =
    endlessRound <= 1 ? 1 : endlessRound === 2 ? 0.5 : endlessRound === 3 ? 0.25 : 0.1;
  let equipmentDrops = enemy.championProfile
    ? 2
    : enemy.elite
      ? 1 + (eliteTier >= 3 ? 1 : eliteTier >= 2 && Math.random() < 0.35 ? 1 : 0)
      : Math.random() < 0.12
        ? 1
        : 0;
  if (endlessRound > 0 && !enemy.championProfile) {
    let kept = 0;
    for (let i = 0; i < equipmentDrops; i++) if (Math.random() < gearFactor) kept += 1;
    equipmentDrops = kept;
  }
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
    const base = (enemy.championProfile ? 6 + (enemy.championRound || 1) : enemy.elite ? 4 + eliteTier : 1) * // 精英+1补偿宝箱币收紧
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
    tdMode || activeContract?.id === "wind" ? 0 : player.hp < player.maxHp * 0.4 ? 0.015 : player.hp < player.maxHp * 0.85 ? 0.006 : 0;
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
    faceBurst: 1.05,
    curtainRise: 1.1,
    teamAttack: 1.15,
    ratingStage: 1.25,
    flexPressure: 1.1,
    orangeRush: 1.0,
    starBurst: 1.2,
    tailSketch: 1.15,
    memoryFaces: 1.2,
    everymanFlock: 1.25,
    rocketPack: 1.15,
    toothCage: 1.3,
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
  } else if (skill === "faceBurst") {
    const cy = clamp(player.y, WALL_H + 42, HEIGHT - 42);
    cast.marks = [
      { x: player.x, y: cy },
      { x: player.x - 58, y: cy },
      { x: player.x + 58, y: cy },
      { x: player.x, y: clamp(cy - 52, WALL_H + 32, HEIGHT - 32) },
      { x: player.x, y: clamp(cy + 52, WALL_H + 32, HEIGHT - 32) },
    ];
  } else if (skill === "curtainRise") {
    cast.safeX = player.x;
    cast.safeHalfWidth = 42;
  } else if (skill === "teamAttack") {
    cast.lanes = [-96, -32, 32, 96].map((dx) => player.x + dx);
    const parity = (e.championCastCount || 0) % 2;
    cast.dangerLanes = cast.lanes.filter((_, i) => i % 2 === parity);
  } else if (skill === "ratingStage") {
    const centerY = clamp(player.y, WALL_H + 72, HEIGHT - 72);
    const phase = (e.championCastCount || 0) % 2;
    cast.cells = [];
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        cast.cells.push({ x: player.x + col * 64, y: centerY + row * 48, w: 58, h: 42, danger: (row + col + phase + 4) % 2 === 0 });
      }
    }
  } else if (skill === "flexPressure") {
    cast.safeX = player.x;
    cast.safeHalfWidth = 58;
    cast.marks = [-1, 1].map((side, i) => ({
      x: cast.safeX + side * 34,
      y: clamp(player.y + (i === 0 ? -54 : 54), WALL_H + 30, HEIGHT - 30),
    }));
  } else if (skill === "orangeRush") {
    cast.dangerY = clamp(player.y, WALL_H + 32, HEIGHT - 32);
    cast.bandHalfHeight = 27;
  } else if (skill === "starBurst") {
    cast.rings = [54, 104, 154];
    cast.dangerRing = (e.championCastCount || 0) % cast.rings.length;
    cast.centerDanger = (e.championCastCount || 0) % 2 === 1;
  } else if (skill === "tailSketch") {
    cast.mode = (e.championCastCount || 0) % 2 === 0 ? "blue" : "orange";
    cast.dangerY = clamp(player.y, WALL_H + 34, HEIGHT - 34);
    cast.bandHalfHeight = 25;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.28;
      cast.marks.push({ x: player.x + Math.cos(a) * 82, y: clamp(player.y + Math.sin(a) * 66, WALL_H + 28, HEIGHT - 28) });
    }
  } else if (skill === "memoryFaces") {
    const phase = (e.id * 0.73 + (e.championCastCount || 0) * 1.17) % (Math.PI * 2);
    for (let i = 0; i < 5; i++) {
      const a = phase + (i / 5) * Math.PI * 2;
      const r = i % 2 === 0 ? 62 : 102;
      cast.marks.push({
        x: player.x + Math.cos(a) * r,
        y: clamp(player.y + Math.sin(a) * r * 0.72, WALL_H + 30, HEIGHT - 30),
      });
    }
  } else if (skill === "everymanFlock") {
    cast.safeEdge = clamp(player.x + 78, camX + 70, camX + WIDTH - 55);
    for (let i = 0; i < 5; i++) {
      cast.marks.push({
        x: player.x - 104 + i * 38,
        y: clamp(player.y + ((i % 2) * 2 - 1) * (34 + i * 6), WALL_H + 28, HEIGHT - 28),
      });
    }
  } else if (skill === "rocketPack") {
    cast.lanes = [-70, 0, 70].map((dy) => clamp(player.y + dy, WALL_H + 30, HEIGHT - 30));
    cast.dangerY = cast.lanes[(e.championCastCount || 0) % cast.lanes.length];
    cast.bandHalfHeight = 25;
  } else if (skill === "toothCage") {
    const offset = (e.championCastCount || 0) % 2 === 0 ? -58 : 58;
    cast.safeY = clamp(player.y + offset, WALL_H + 62, HEIGHT - 62);
    cast.safeHalfHeight = 36;
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
    lastHitBy = t(`${enemyDisplayName(e)}的${label}`, `${enemyDisplayName(e)}'s ${label}`);
    lastHitKind = killerKindOf(e);
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
    if (circleHit(e.x, e.y, 66, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.9 * tierPower, t("审判跃击", "Judgement Leap"), e.eliteProfile.color);
  } else if (cast.skill === "rush") {
    e.burstTimer = Math.max(e.burstTimer, e.eliteTier >= 3 ? 1.8 : 1.35);
    e.invulnTimer = Math.max(e.invulnTimer, 0.25);
  } else if (cast.skill === "gaze") {
    explosions.push(new Explosion(e.x, e.y, 190, e.eliteProfile.color, true));
    if (circleHit(e.x, e.y, 190, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.8 * tierPower, t("裁决凝视", "Verdict Gaze"), e.eliteProfile.color);
  } else if (cast.skill === "roots") {
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 44, e.eliteProfile.color));
      if (circleHit(mark.x, mark.y, 44, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.65 * tierPower, t("根须盛宴", "Root Feast"), e.eliteProfile.color);
    }
  } else if (cast.skill === "dogCharge") {
    e.x = cast.x;
    e.y = clamp(cast.y, WALL_H + e.radius, HEIGHT - e.radius);
    explosions.push(new Explosion(e.x, e.y, 62, e.eliteProfile.color, true));
    const inLane = pointSegmentDistance(player.x, player.y, cast.fromX, cast.fromY, e.x, e.y) <= 30;
    if (inLane && player.moving) eliteHitPlayer(e, e.dmg * 0.9 * tierPower, t("蓝枪冲锋", "Blue Spear Charge"), e.eliteProfile.color);
  } else if (cast.skill === "dummyVolley") {
    explosions.push(new Explosion(cast.x, cast.y, 76, e.eliteProfile.color));
    if (circleHit(cast.x, cast.y, 76, e.x, e.y, e.radius)) {
      const reflected = Math.max(1, Math.round(e.maxHp * 0.08));
      e.takeDamage(reflected);
      floatingTexts.push(new FloatingText(e.x, e.y - e.radius - 18, t(`反伤 ${reflected}`, `Reflected ${reflected}`), "#ffd166"));
    }
    if (circleHit(cast.x, cast.y, 76, player.x, player.y, player.radius)) eliteHitPlayer(e, e.dmg * 0.8 * tierPower, t("假人齐射", "Dummy Volley"), "#ffd166");
  } else if (cast.skill === "moonfall") {
    let hit = false;
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 48, e.eliteProfile.color));
      if (!hit && circleHit(mark.x, mark.y, 48, player.x, player.y, player.radius)) {
        hit = true;
        eliteHitPlayer(e, e.dmg * 0.85 * tierPower, t("月陨星落", "Moonfall"), e.eliteProfile.color);
      }
    }
  } else if (cast.skill === "webFeast") {
    explosions.push(new Explosion(player.x, cast.dangerY, 54, e.eliteProfile.color, true));
    if (Math.abs(player.y - cast.dangerY) <= 25) eliteHitPlayer(e, e.dmg * 0.75 * tierPower, t("蛛网宴席", "Web Banquet"), e.eliteProfile.color);
  } else if (cast.skill === "faceBurst") {
    let hit = false;
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 34, e.eliteProfile.color));
      if (!hit && circleHit(mark.x, mark.y, 34, player.x, player.y, player.radius)) {
        hit = true;
        eliteHitPlayer(e, e.dmg * 0.72 * tierPower, t("错位爆裂", "Face Burst"), e.eliteProfile.color);
      }
    }
  } else if (cast.skill === "curtainRise") {
    explosions.push(new Explosion(cast.safeX - cast.safeHalfWidth, player.y, 38, e.eliteProfile.color, true));
    explosions.push(new Explosion(cast.safeX + cast.safeHalfWidth, player.y, 38, e.eliteProfile.color, true));
    if (Math.abs(player.x - cast.safeX) > cast.safeHalfWidth) {
      eliteHitPlayer(e, e.dmg * 0.7 * tierPower, t("谢幕虫潮", "Curtain Call"), e.eliteProfile.color);
    }
  } else if (cast.skill === "teamAttack") {
    for (const lane of cast.dangerLanes) {
      for (let y = WALL_H + 42; y < HEIGHT; y += 74) explosions.push(new Explosion(lane, y, 28, e.eliteProfile.color));
    }
    if (cast.dangerLanes.some((lane) => Math.abs(player.x - lane) <= 23)) {
      eliteHitPlayer(e, e.dmg * 0.82 * tierPower, t("双向夹击", "Pincer Attack"), e.eliteProfile.color);
    }
  } else if (cast.skill === "ratingStage") {
    let hit = false;
    for (const cell of cast.cells) {
      if (!cell.danger) continue;
      explosions.push(new Explosion(cell.x, cell.y, 31, e.eliteProfile.color));
      if (!hit && Math.abs(player.x - cell.x) <= cell.w / 2 && Math.abs(player.y - cell.y) <= cell.h / 2) {
        hit = true;
        eliteHitPlayer(e, e.dmg * 0.88 * tierPower, t("黄金舞台", "Golden Stage"), e.eliteProfile.color);
      }
    }
  } else if (cast.skill === "flexPressure") {
    let hit = Math.abs(player.x - cast.safeX) > cast.safeHalfWidth;
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 28, e.eliteProfile.color));
      hit ||= circleHit(mark.x, mark.y, 28, player.x, player.y, player.radius);
    }
    if (hit) eliteHitPlayer(e, e.dmg * 0.78 * tierPower, t("肌肉压场", "Flex Pressure"), e.eliteProfile.color);
  } else if (cast.skill === "orangeRush") {
    for (let x = camX + 24; x < camX + WIDTH; x += 54) explosions.push(new Explosion(x, cast.dangerY, 24, e.eliteProfile.color));
    if (Math.abs(player.y - cast.dangerY) <= cast.bandHalfHeight && !player.moving) {
      eliteHitPlayer(e, e.dmg * 0.76 * tierPower, t("橙焰横扫", "Orange Sweep"), e.eliteProfile.color);
    }
  } else if (cast.skill === "starBurst") {
    const distance = Math.hypot(player.x - cast.x, player.y - cast.y);
    const ring = cast.rings[cast.dangerRing];
    const hit = Math.abs(distance - ring) <= 22 || (cast.centerDanger && distance <= 36);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      explosions.push(new Explosion(cast.x + Math.cos(a) * ring, cast.y + Math.sin(a) * ring, 22, e.eliteProfile.color));
    }
    if (cast.centerDanger) explosions.push(new Explosion(cast.x, cast.y, 36, e.eliteProfile.color, true));
    if (hit) eliteHitPlayer(e, e.dmg * 0.9 * tierPower, t("巨星爆场", "Star Burst"), e.eliteProfile.color);
  } else if (cast.skill === "tailSketch") {
    let hit = Math.abs(player.y - cast.dangerY) <= cast.bandHalfHeight &&
      (cast.mode === "blue" ? player.moving : !player.moving);
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 25, cast.mode === "blue" ? "#68bfff" : "#ff9f43"));
      hit ||= circleHit(mark.x, mark.y, 25, player.x, player.y, player.radius);
    }
    if (hit) eliteHitPlayer(e, e.dmg * 0.84 * tierPower, t("蓝橙速写", "Blue-Orange Sketch"), cast.mode === "blue" ? "#68bfff" : "#ff9f43");
  } else if (cast.skill === "memoryFaces") {
    let hit = false;
    for (const mark of cast.marks) {
      explosions.push(new Explosion(mark.x, mark.y, 31, e.eliteProfile.color));
      hit ||= circleHit(mark.x, mark.y, 31, player.x, player.y, player.radius);
    }
    if (hit) eliteHitPlayer(e, e.dmg * 0.82 * tierPower, t("故障增殖", "Glitch Bloom"), e.eliteProfile.color);
  } else if (cast.skill === "everymanFlock") {
    for (const mark of cast.marks) explosions.push(new Explosion(mark.x, mark.y, 24, e.eliteProfile.color));
    if (player.x < cast.safeEdge) eliteHitPlayer(e, e.dmg * 0.86 * tierPower, t("Everyman 蝶群", "Everyman Flock"), e.eliteProfile.color);
  } else if (cast.skill === "rocketPack") {
    for (let x = camX + 20; x < camX + WIDTH; x += 46) {
      explosions.push(new Explosion(x, cast.dangerY, 23, e.eliteProfile.color));
    }
    if (Math.abs(player.y - cast.dangerY) <= cast.bandHalfHeight) {
      eliteHitPlayer(e, e.dmg * 0.9 * tierPower, t("火箭犬群", "Rocket Pack"), e.eliteProfile.color);
    }
  } else if (cast.skill === "toothCage") {
    const top = cast.safeY - cast.safeHalfHeight;
    const bottom = cast.safeY + cast.safeHalfHeight;
    for (let x = camX + 22; x < camX + WIDTH; x += 44) {
      explosions.push(new Explosion(x, top, 22, e.eliteProfile.color));
      explosions.push(new Explosion(x, bottom, 22, e.eliteProfile.color));
    }
    if (player.y < top || player.y > bottom) {
      eliteHitPlayer(e, e.dmg * 0.96 * tierPower, t("巨齿牢笼", "Tooth Cage"), e.eliteProfile.color);
    }
  }
}

function updateEliteSkill(e, dt) {
  if (!e.eliteProfile || e.rootTimer > 0 || e.cannotAttack) return;
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
        ? Math.max(2.0, 3.8 - (e.championRound || 1) * 0.16) + Math.random() * 0.4
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
  // 首次塔防教学是确认框,不是边打边读的浮层。确认前不走任何局内计时,
  // 因而不会刷怪、移动、打门或提前触发选卡。
  if (tdMode && td?.introPending) return;
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
  // elite waves scale with difficulty: normal keeps them survivable
  const gentle = getDifficulty().id === 0;
  const ELITE_WAVES = [
    { warnAt: 192, at: 200, count: gentle ? 4 : 6 },
    { warnAt: 232, at: 240, count: gentle ? 6 : 8 },
  ];
  const waveIdx = Math.floor(eliteWave / 2);
  const wave = ELITE_WAVES[waveIdx];
  if (wave && !bossFight) {
    if (eliteWave % 2 === 0 && elapsed >= wave.warnAt) {
      eliteWave += 1;
      floatingTexts.push(new FloatingText(player.x, player.y - 60, t("※ 精英潮来袭！", "※ ELITE SURGE!"), "#ffd166"));
    } else if (eliteWave % 2 === 1 && elapsed >= wave.at) {
      eliteWave += 1;
      const namedProfiles = eliteProfilePool(getDifficulty().id, elapsed);
      const types = ["tank", "red", "orange", "blue", "purple", "ghost"];
      for (let i = 0; i < wave.count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const profile = namedProfiles?.[Math.floor(Math.random() * namedProfiles.length)] || null;
        const e = new Enemy(
          profile?.type || types[Math.floor(Math.random() * types.length)],
          camX + WIDTH / 2 + side * (WIDTH / 2 + 50),
          WALL_H + 30 + Math.random() * (HEIGHT - WALL_H - 60),
          spawner.scale(true, !!profile, profile?.key)
        );
        if (tdMode && td) {
          // TD 精英潮也必须完整走同一条归一化路线；若沿用经典模式的
          // 左右夹击坐标，宽屏会把一半精英直接生在门边。
          e.x = td.map.spawn.x + Math.random() * 60;
          e.y = td.map.spawn.y + (Math.random() - 0.5) * TD_CELL * 0.6;
          e.tdWp = 0;
        }
        enemies.push(e);
      }
    }
  }

  // boss warning siren beeps every 10s while the red pulse runs
  // (塔防 Phase 2 起同样有 5:00 Boss,预警音一并生效)
  if (bossWarnActive() && elapsed >= nextWarnBeep) {
    nextWarnBeep += 10;
    sfxAlarm();
  }

  // 塔防 Phase 2: TD 版天意侵蚀Sans——5:00 从走廊右端进场,沿路径慢速压门。
  // 不用 boss.js(那是决斗剧本);血量按全塔最近30秒实测DPS标定(自适应
  // 思路对齐经典Boss),打门攻速大幅削减,给修门/集火留反应窗。
  if (tdMode && td && !td.bossSpawned && !bossDefeated && elapsed >= bossAppearAt()) {
    td.bossSpawned = true;
    const bossLane = Math.floor(Math.random() * td.map.lanes.length);
    const laneSpawn = td.map.lanes[bossLane].spawn;
    const b = new Enemy("tank", laneSpawn.x, laneSpawn.y, spawner.scale(true, false));
    b.championProfile = CORRUPTED_SANS; // 名字/图鉴身份=天意侵蚀Sans
    b.eliteProfile = null;
    tdConfigureBoss(b, td.map, tdMeasuredDps(td), bossLane);
    enemies.push(b);
    bossFightStartedAt = elapsed;
    bossPhaseReached = 1;
    fireBark("boss");
    candyBanner = { text: bossAnthemLine(), t: 3.2 };
    roundBanner = { text: t("⚠ 天意侵蚀Sans 压向入口", "⚠ Corrupted Sans marches on the gate"), sub: t("拦不住它,门就没了", "Stop him before the gate falls"), t: 2.6 };
    sfxAlarm();
  }

  // 天意侵蚀Sans appears at 5:00: clear the field and stop spawning
  if (!tdMode && !bossFight && !bossDefeated && elapsed >= bossAppearAt()) {
    bossFight = createBossFight(player.x + WIDTH * 0.4, player.y, player.character, WIDTH, HEIGHT, WALL_H, getDifficulty().id);
    bossFightStartedAt = elapsed;
    bossPhaseReached = 1;
    hpAtBossPct = player.maxHp > 0 ? Math.round((Math.max(0, player.hp) / player.maxHp) * 100) : 0;
    fireBark("boss");
    candyBanner = { text: bossAnthemLine(), t: 3.2 }; // Megalovania = 国歌,B站条件反射;EN = bad time
    enemies.length = 0;
    pickups.length = 0;
    enemies.push(bossFight.boss);
    if (DEBUG_BOSS === "weak") {
      bossFight.boss.maxHp = 500;
      bossFight.boss.hp = 500;
    }
  }

  const bossCutscene = bossFight && (bossFight.state === "intro" || bossFight.state === "transition");
  // 塔防: 隐身本体不许移动——否则镜头跟着走,固定地图和怪物就错位了
  // (2026-07-26 用户反馈截图: 方向键/摇杆把视角推出地图)
  const moveVec = bossCutscene || tdMode ? { x: 0, y: 0 } : getMoveVector();
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
  if (tdMode) {
    // 双保险: 任何把本体推走的力(击退/彩蛋)都不许晃动塔防镜头
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
  }
  camX = tdMode ? 0 : player.x - WIDTH / 2;

  if (!bossCutscene) {
    const weaponWorld = {
      enemies,
      projectiles,
      spawnProjectile,
      spawnBomb,
      spawnSpike,
      spawnBlast,
      bounds: { top: WALL_H + 20, bottom: HEIGHT - 16 }, // playfield, excluding the column wall
      tdMidX: tdMode && td ? WIDTH / 2 : null, // 黑客甩掷的塔防规则开关(见 weapon.js hfling)
    };
    updateWeapons(player, dt, weaponWorld); // 塔防局 player.weapons=[] 自然空转
    if (tdMode && td) {
      for (const tw of td.towers) {
        updateWeapons(tw.pp, dt, weaponWorld); // 每座塔跑同一套武器系统
        // 塔面向攻击方向(2026-07-26 用户规格): 取射程内最近敌人定向,
        // 没有目标时保持上一朝向
        let near = null;
        let nd = 560;
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          const d = Math.hypot(e.x - tw.pp.x, e.y - tw.pp.y);
          if (d < nd) { nd = d; near = e; }
        }
        if (near) {
          const dx = near.x - tw.pp.x;
          const dy = near.y - tw.pp.y;
          tw.pp.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
        }
      }
      tdEntranceTick(td.entrance, dt);
      if (td.entrance.destroyed) td.entrance.warnT += dt;
      // 全塔DPS滚动采样(每秒一条累计快照,窗口≈30秒)——Boss血量标定数据源
      td.dmgLogT += dt;
      if (td.dmgLogT >= 1) {
        td.dmgLogT -= 1;
        td.dmgLog.push(Enemy.dmgDealt || 0);
        if (td.dmgLog.length > 31) td.dmgLog.shift();
      }
    }
  }

  // 新手引导推进: 完成条件满足且至少露脸1.2s → 下一步
  if (tutorialStep >= 0) {
    tutorialStepT += dt;
    if (tutorialStep === 0) {
      if (tutorialPX !== null) tutorialMoved += Math.min(20, Math.hypot(player.x - tutorialPX, player.y - tutorialPY));
      tutorialPX = player.x;
      tutorialPY = player.y;
    }
    const steps = tutorialSteps();
    if (tutorialStep < steps.length && steps[tutorialStep].done() && tutorialStepT > TUTORIAL_MIN_T) {
      tutorialStep += 1;
      tutorialStepT = 0;
      sfxClick();
      if (tutorialStep >= steps.length) endTutorial();
    }
  }

  if (!bossFight) {
    for (const e of spawner.update(dt, camX)) {
      if (enemies.length >= 220) break; // hard cap: keep phones alive in endless
      if (tdMode && td) {
        // 塔防: 出怪节奏原样复用,随机分配一条进攻车道,出生点重定位到
        // 该车道的走廊右端(带纵向抖动防叠罗汉)
        const laneIdx = Math.floor(Math.random() * td.map.lanes.length);
        const lane = td.map.lanes[laneIdx];
        e.x = lane.spawn.x + Math.random() * 60;
        e.y = lane.spawn.y + (Math.random() - 0.5) * TD_CELL * 0.6;
        e.tdLane = laneIdx;
        e.tdWp = 0;
      }
      enemies.push(e);
    }
  }

  // ---- endless judgement rounds -------------------------------------------
  if (endlessRound > 0) {
    if (roundTimer > 0) roundTimer -= dt;
    // T-15s: an Undertale round champion. R11+ rotates the ten-character roster
    // with the existing endless stat pressure layered on top.
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
      // Endless judgement is the post-clear endurance wall: champions carry a
      // true boss-sized pool instead of melting like another named elite.
      b.maxHp = Math.round(b.maxHp * (4 + endlessRound) * profile.hpFactor * 10);
      b.hp = b.maxHp;
      b.dmg = Math.round(b.dmg * 1.35 * profile.dmgFactor);
      b.radius = Math.round(b.radius * 1.5);
      b.attackRange = b.radius;
      b.xp = Math.round(b.xp * 6);
      b.invulnTimer = 3;
      b.eliteSkillTimer = 1.0;
      if (tdMode && td) {
        // 塔防无尽: 首领同样从随机车道右端入轨压门,打门伤害节制成
        // 可读的倒计时(身板 dmg 直怼门会一两下秒破)
        const laneIdx = Math.floor(Math.random() * td.map.lanes.length);
        b.x = td.map.lanes[laneIdx].spawn.x;
        b.y = td.map.lanes[laneIdx].spawn.y;
        b.tdLane = laneIdx;
        b.tdWp = 0;
        b.gateDmg = 12 + 2 * endlessRound;
        b.contactInterval = Math.max(b.contactInterval || 1, 1.6);
      }
      enemies.push(b);
      roundBanner = {
        text: t(`⚠ ${enemyDisplayName(b)} 接近`, `⚠ ${enemyDisplayName(b)} approaching`),
        sub: `${enemyDisplayName(b)} · ${t(`第 ${endlessRound} 轮审判`, `Judgement round ${endlessRound}`)}`,
        t: 2.2,
      };
      // champion entrance quote rides the UT narration box under the banner
      const entrance = championEntrance(profile.championId);
      if (entrance) candyBanner = { text: entrance, t: 3.6 };
      sfxAlarm();
    }
    // the round ends when the clock is out AND the champion is down
    if (roundTimer <= 0 && roundBossSpawned && roundBossDown) {
      roundsCleared = endlessRound;
      if (getDifficulty().id >= 1 && roundsCleared >= 8 && unlockTitle("abysswalker")) lastNewTitles.push(t("深渊行者", "Abysswalker"));
      if (getDifficulty().id >= 1 && roundsCleared >= 12 && unlockTitle("unjudged")) lastNewTitles.push(t("不可审判者", "The Unjudged"));
      questToasts(questEvent("round", roundsCleared));
      bossClearChoice = 0;
      state = "roundclear";
      saveSafeProgressCheckpoint(runCoins + roundPendingCoins);
    }
    // round 4+: periodic danger zones (existing telegraph + blast visuals)
    // 塔防没有本体可炸,领域压力交给 spawner 的轮次数值与首领——关闭
    if (endlessRound >= 4 && !tdMode) {
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
          if (player.takeDamage(12 + 4 * endlessRound)) {
            lastHitBy = t("审判领域", "the Judgement Zone");
            lastHitKind = "hazard";
          }
        }
      }
    }
    hazards = hazards.filter((hz) => hz.t > 0);
  }
  if (roundBanner && (roundBanner.t -= dt) <= 0) roundBanner = null;

  if (candyBanner && (candyBanner.t -= dt) <= 0) candyBanner = null;
  if (bark && (bark.t -= dt) <= 0) bark = null;
  if (hotdogCd > 0) hotdogCd -= dt;
  // 六魂遗物 per-frame effects (拳套/舞鞋/弹壳; 丝带在授予时设置, 锅在 healScale, 笔记本在拾取)
  player.relicAmp = relics.brave && streak >= 10 ? 1.08 : 1;
  player.relicDodge = relics.integrity && player.moving ? 0.04 : 0;
  Enemy.eliteAmp = relics.justice ? 1.1 : 1;
  // 🌭 无时限储备: at low HP a pocketed hot dog eats itself (one per second)
  if (hotdogStock > 0 && hotdogCd <= 0 && player.hp > 0 && player.hp < player.maxHp * 0.35) {
    hotdogStock -= 1;
    hotdogCd = 1;
    const dogHeal = Math.round(player.maxHp * 0.25 * healScale());
    player.hp = Math.min(player.maxHp, player.hp + dogHeal);
    healFlash = 0.45;
    sfxCandy();
    candyBanner = { text: t(`* 你想起了口袋里的热狗。HP 回复 ${dogHeal}!(还剩 ${hotdogStock} 根)`, `* You remember the hot dogs. HP +${dogHeal}! (${hotdogStock} left)`), t: 2.2 };
  }
  if (savepointNote && introBlack <= 0) {
    savepointNote.t += dt; // typewriter reveal + hold, then let the run breathe
    if (savepointNote.t > savepointNote.text.length / 24 + 4.2) savepointNote = null;
  }
  // 访客事件: after the opening minute, rare one-time drop-ins (never during
  // the boss, never in ?boss debug runs so the test routes stay deterministic)
  // 访客彩蛋全部围着本体转——塔防没有本体,狗/花/Temmie/信统统不来
  // (2026-07-26 用户截图: Temmie 与帕子的信出现在塔防局)
  if (state === "playing" && !DEBUG_BOSS && !dailyMode && !bossFight && !tdMode && elapsed > 60) {
    if (!visitorRolls.dog && Math.random() < dt / 150) {
      visitorRolls.dog = true;
      dogVisit = {
        x: camX - 60,
        y: WALL_H + 60 + Math.random() * (HEIGHT - WALL_H - 120),
        vx: 230,
        coined: false,
      };
      candyBanner = { text: pickDogLine(), t: 3.4 };
      sfxCandy();
    }
    if (!visitorRolls.flower && Math.random() < dt / 130) {
      visitorRolls.flower = true;
      flowerVisit = {
        x: clamp(player.x + (Math.random() - 0.5) * 560, camX + 40, camX + WIDTH - 40),
        y: clamp(player.y + (Math.random() - 0.5) * 360, WALL_H + 50, HEIGHT - 40),
        t: 0,
        line: funValue === 100 ? funFlowerLine() : pickFlowerLine(), // FUN 100
        heard: false,
      };
    }
    // 黄色饶恕: a lost monster wanders in; stand close and it is spared
    if (!visitorRolls.spare && elapsed > 45 && Math.random() < dt / 110) {
      visitorRolls.spare = true;
      const types = ["slime", "bat", "ghost", "tank", "red", "orange", "blue", "purple"];
      spareVisit = {
        type: types[Math.floor(Math.random() * types.length)],
        x: clamp(player.x + (Math.random() - 0.5) * 480, camX + 50, camX + WIDTH - 50),
        y: clamp(player.y + (Math.random() - 0.5) * 320, WALL_H + 60, HEIGHT - 50),
        t: 0,
        nearT: 0,
        state: "wander",
      };
    }
    // 帕子的信: the rarest visitor — a glowing envelope drifts onto the field
    if (!visitorRolls.letter && elapsed > 90 && Math.random() < dt / 200) {
      visitorRolls.letter = true;
      letterVisit = {
        x: clamp(player.x + (Math.random() - 0.5) * 460, camX + 40, camX + WIDTH - 40),
        y: clamp(player.y + (Math.random() - 0.5) * 300, WALL_H + 50, HEIGHT - 40),
        t: 0,
      };
    }
    if (!visitorRolls.tem && elapsed > 75 && Math.random() < dt / 160) {
      visitorRolls.tem = true;
      temVisit = {
        x: clamp(player.x + (Math.random() - 0.5) * 420, camX + 40, camX + WIDTH - 40),
        y: clamp(player.y + (Math.random() - 0.5) * 300, WALL_H + 50, HEIGHT - 40),
        t: 0,
      };
      candyBanner = { text: temLine(), t: 3.2 };
      sfxType();
    }
  }
  if (spareVisit) {
    const sv = spareVisit;
    sv.t += dt;
    if (sv.state === "wander") {
      if (Math.hypot(player.x - sv.x, player.y - sv.y) < 70) sv.nearT += dt;
      else sv.nearT = Math.max(0, sv.nearT - dt);
      if (sv.nearT >= 1.5) {
        sv.state = "bow"; // the SPARE lands: bow, gift, leave
        sv.bowT = 0;
        candyBanner = { text: spareNarration(enemyName(sv.type)), t: 3.2 };
        pickups.push(new Pickup(sv.x, sv.y, "candy", {}));
        sfxCandy();
      } else if (sv.t > 18) {
        spareVisit = null; // waited too long: it slips away, no hard feelings
      }
    } else if ((sv.bowT += dt) > 1.4) {
      spareVisit = null;
    }
  }
  if (temVisit && (temVisit.t += dt) > 5) temVisit = null;
  if (letterVisit) {
    letterVisit.t += dt;
    if (Math.hypot(player.x - letterVisit.x, player.y - letterVisit.y) < 38) {
      // read it where you stand; spaghetti included (usually)
      const letter = pickPapyrusLetter(player.character);
      candyBanner = { text: letter.text, t: 4.5 };
      if (letter.heal) {
        const heal = Math.round(player.maxHp * 0.08 * healScale());
        player.hp = Math.min(player.maxHp, player.hp + heal);
        floatingTexts.push(new FloatingText(player.x, player.y - 34, t("意大利面 HP++", "Spaghetti HP++"), "#7cf28a"));
        healFlash = 0.45;
        sfxCandy();
      } else {
        sfxType(); // the empty letter gets no fanfare
      }
      letterVisit = null;
    } else if (letterVisit.t > 25) {
      letterVisit = null; // unread mail returns to sender
    }
  }
  if (dogVisit) {
    dogVisit.x += dogVisit.vx * dt;
    if (!dogVisit.coined && dogVisit.x > player.x) {
      dogVisit.coined = true; // the dog's apology: one coin, dropped mid-cross
      pickups.push(new Pickup(dogVisit.x, dogVisit.y, "coin", { value: 1 }));
    }
    if (dogVisit.x > camX + WIDTH + 80) dogVisit = null;
  }
  if (flowerVisit) {
    flowerVisit.t += dt;
    if (!flowerVisit.heard && Math.hypot(player.x - flowerVisit.x, player.y - flowerVisit.y) < 84) {
      flowerVisit.heard = true;
      sfxType();
    }
    if (flowerVisit.t > 16) flowerVisit = null;
  }

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
  if (!tdMode) {
    for (const e of enemies) {
      if (e.boss) continue;
      const dx = e.x - player.x;
      if (Math.abs(dx) > WIDTH / 2 + 140) {
        e.x = player.x - Math.sign(dx) * (WIDTH / 2 + 60);
        e.y = WALL_H + Math.random() * (HEIGHT - WALL_H);
      }
    }
  }

  const shieldUp = player.shieldTimer > 0;
  for (const e of enemies) {
    if (e.boss) continue; // the boss is driven by its own controller
    if (tdMode && td) {
      // 塔防: 目标=当前路径点(icecap 的标记目标=前方路径格,由 tdTargetFor 提供)
      const wp = tdTargetFor(e, td.map);
      if (e.tdJumpPending !== undefined && e.mark) {
        // icecap 完成标记的瞬间锁定跳转索引,落地时 tdTargetFor 消费
        e.tdJumpTo = e.tdJumpPending;
        delete e.tdJumpPending;
      }
      if (tdAtGate(e, td.map)) {
        if (td.entrance.destroyed) {
          // 门已破: 再进来一只就算输(用户规格——破坏那一下只出警告)
          tdLose(e);
          return;
        }
        // 到门口: 不再位移,按接触节奏攻击入口
        e.update(dt, { x: e.x, y: e.y });
        if (e.contactTimer <= 0 && !e.cannotAttack && e.rootTimer <= 0) {
          e.contactTimer = e.contactInterval || 1;
          // Boss/无尽首领打门用节制过的 gateDmg——身板数值直怼门是秒破,
          // 守门玩法需要"看得见的倒计时"而不是一击判死
          const dealt = tdHitEntrance(td.entrance, e.gateDmg ?? e.dmg);
          if (dealt > 0) {
            floatingTexts.push(new FloatingText(td.entrance.x + 8, td.entrance.y - 30, `-${dealt}`, "#ff5d73"));
            sfxHurt();
          } else {
            floatingTexts.push(new FloatingText(td.entrance.x + 8, td.entrance.y - 30, "MISS!", "#7cf28a"));
          }
          if (td.entrance.destroyed) {
            // 破门冲击波: 门口的怪全部炸开(最后的喘息),之后新到达者判负
            explosions.push(new Explosion(td.entrance.x, td.entrance.y, TD_CELL * 2.2, "#ff3d5a"));
            for (const o of enemies) {
              if (!o.boss && tdAtGate(o, td.map)) o.hp = 0;
            }
            sfxAlarm();
            tipQueue.push({ title: t("⚠ 入口已被破坏!", "⚠ GATE DESTROYED!"), lines: [t("无法再回血——下一只怪物冲进来就输了", "No more healing — the next leak loses the run")], t: 6 });
          }
        }
      } else {
        e.update(dt, wp);
      }
    } else {
      e.update(dt, player);
    }
    if (!tdMode) updateEliteSkill(e, dt);
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
          lastHitBy = t(enemyDisplayName(e) + "的突袭", enemyDisplayName(e) + "'s ambush");
          lastHitKind = killerKindOf(e);
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
    // rooted or disarmed enemies can't attack
    if (e.rootTimer > 0 || e.cannotAttack) continue;
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
        floatingTexts.push(new FloatingText(e.x, e.y - 16, t(`反弹 ${e.dmg}`, `Thorns ${e.dmg}`), "#9a5df0"));
      } else {
        const hit = player.takeDamage(e.dmg);
        if (hit) {
          lastHitBy = enemyDisplayName(e);
          lastHitKind = killerKindOf(e);
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
    bossPhaseReached = Math.max(bossPhaseReached, Number(bossFight.phase) || 1);
    bossHpPctAtEnd = bossFight.boss.maxHp > 0 ? Math.max(0, Math.min(100, Math.round((bossFight.boss.hp / bossFight.boss.maxHp) * 100))) : 0;
    if (bossFight.done) enemies = enemies.filter((e) => !e.boss);
    // boss attacks apply damage inside bossFight.update — tag them here
    if (player.hp < hpBeforeBoss - 0.001) {
      lastHitBy = t("天意侵蚀Sans", "Corrupted Sans");
      lastHitKind = "boss";
    }
    // 竞技止血 (2026-07-12): stage score/kills/time freeze the frame the boss
    // dies — the old heart-pickup snapshot left an unbounded farming window
    // (kill the boss, don't take the heart, grind forever)
    if (!bossDeathSnapped && bossFight.state === "death") {
      bossDeathSnapped = true;
      player.kills += 50; // the boss counts as 50 kills
      runCoins += Math.round(50 * coinGainMult() * getDifficulty().coinMult); // boss bounty
      stageClearScore = currentScore();
      stageClearTime = elapsed;
      stageClearKills = player.kills;
    }
    // debug-only: ?boss=weak keeps phase 2 frail as well (the adaptive
    // formula reads BOSS_HP/p1Time, which explodes when phase 1 is weak)
    if (DEBUG_BOSS === "weak" && bossFight && bossFight.boss.maxHp > 600) {
      bossFight.boss.maxHp = 500;
      bossFight.boss.hp = Math.min(bossFight.boss.hp, 500);
    }
  }

  const dead = enemies.filter((e) => e.hp <= 0 && !e.boss);
  for (const e of dead) {
    player.kills += tdKillCredit(e);
    const codexKey = codexKeyForEnemy(e);
    runKillsByType[codexKey] = (runKillsByType[codexKey] || 0) + 1;
    if (tdMode && td) {
      // 塔防经济: 经验/金币直接入账(没有本体去捡)——蛙吉特5/杰瑞15,
      // 精英×10/冠军×30(见 tdXpFor);金币按简化期望直储
      const gain = tdXpFor(e, getDifficulty().xpMult);
      td.xp += gain;
      if (floatingTexts.length < 40) floatingTexts.push(new FloatingText(e.x, e.y - e.radius - 10, `+${gain}`, "#7cf28a"));
      // 无尽轮里金币进"本轮待结算"池(与经典同一风险规则);R4+断供
      const cf = currentCoinFactor();
      // TD 天意只拿下面的经典 Boss 赏金，不再额外叠一份冠军 8G。
      const coinGain = tdDirectCoinDrop(e, cf);
      if (endlessRound > 0) roundPendingCoins += coinGain;
      else runCoins += coinGain;
    } else if (!e.noXp) spawnDrops(e);
    if (e.tdBoss && td) {
      // TD 版天意倒下: 与经典同一竞技止血——阶段分当帧冻结,然后进
      // bossclear 选择(离开=通关结算 / 继续=90秒无尽审判轮)
      td.bossDown = true;
      runCoins += Math.round(50 * coinGainMult() * getDifficulty().coinMult);
      stageClearScore = currentScore();
      stageClearTime = elapsed;
      stageClearKills = player.kills;
      bossDefeated = true;
      bossClearChoice = 0;
      state = "bossclear";
      sfxFanfare();
    }
    if (e.roundBoss) {
      roundBossDown = true;
      floatingTexts.push(new FloatingText(e.x, e.y - 30, t(`${enemyDisplayName(e)}被击败！`, `${enemyDisplayName(e)} defeated!`), "#ffd166"));
    }
    if (e.elite) {
      // elites go out with a bang: shock ring + deep boom
      explosions.push(new Explosion(e.x, e.y, e.radius * 3.4, "#ffd166", true));
      sfxEliteDown();
      if (e.eliteProfile) unlockEchoToast("names"); // a NAMED resident fell
      // 谜之宝箱: champions always carry one, elites sometimes — but in
      // endless the chests dry up round by round just like the coins do,
      // otherwise the elite flood becomes an infinite power faucet
      // 频率对齐标杆(VS≈每3-4分钟一箱): 22%→12%,无尽R1 1→0.75
      const chestFactor =
        endlessRound === 0 ? 1 : endlessRound === 1 ? 0.75 : endlessRound === 2 ? 0.5 : endlessRound === 3 ? 0.25 : 0;
      const chestChance = e.roundBoss || e.championProfile
        ? endlessRound <= 3 ? 1 : 0.4 // deep-round champions: trophy, not salary
        : 0.12 * chestFactor;
      if (Math.random() < chestChance) {
        pickups.push(new Pickup(e.x, e.y, "chest", {}));
      }
    }
  }
  enemies = enemies.filter((e) => (e.hp > 0 || e.boss));
  if (dead.length > 0) {
    questToasts(questEvent("kills", dead.length));
    // TD 是多角色编队，不能把任务进度伪装成队长单人击杀。
    if (!tdMode) questToasts(questEvent("charKills", dead.length, { charId: player.character }));
    const eliteDead = dead.filter((e) => e.elite).length;
    if (eliteDead) {
      questToasts(questEvent("elites", eliteDead));
      fireBark("elite");
    }
    sfxKill(dead.length);
    // chained kills build the streak; milestones pop the screen
    streak += dead.length;
    runMaxStreak = Math.max(runMaxStreak, streak);
    questToasts(questEvent("streak", streak));
    streakTimer = 1.6;
    while (streak >= nextStreakAt) {
      killFlash = 0.22;
      floatingTexts.push(new FloatingText(player.x, player.y - 44, t(`${nextStreakAt} 连杀！`, `${nextStreakAt} STREAK!`), "#ffd166"));
      sfxStreak(streakTier);
      streakTier += 1;
      nextStreakAt = Math.max(nextStreakAt + 5, Math.round((nextStreakAt * 1.5) / 5) * 5);
    }
    if (streak >= 25) fireBark("streak25");
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
        const levels = player.addXp(Math.round(pu.data.amount * (relics.persev ? 1.08 : 1)));
        if (levels > 0) onLevelUp(levels);
      } else if (pu.kind === "bossheart") {
        // the stage result froze the frame the boss DIED (see the snapshot in
        // the boss update) — delaying this pickup farms nothing anymore
        bossDefeated = true;
        bossFight = null; // hand the field back to the spawner
        bossClearChoice = 0;
        state = "bossclear"; // world pauses behind the choice
        if (!dailyMode) recordRankedStageClear({ elapsed: stageClearTime, kills: stageClearKills });
        saveSafeProgressCheckpoint(runCoins);
        sfxFanfare();
      } else if (pu.kind === "chest") {
        sfxEquip();
        openChest(); // the world holds its breath for the slot ceremony
      } else if (pu.kind === "candy") {
        const heal = Math.round(Math.max(10, player.maxHp * 0.12) * healScale());
        player.hp = Math.min(player.maxHp, player.hp + heal);
        floatingTexts.push(new FloatingText(player.x, player.y - 34, "HP++", "#7cf28a"));
        candyBanner = { text: t(`* 你吃下了怪物糖。HP 回复了 ${heal} 点！`, `* You ate the Monster Candy. HP +${heal}!`), t: 1.8 };
        fireBark("candy");
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
          queueTipOnce("pending", t("本轮待结算金币", "Pending coins this round"), [
            t("无尽中拾取的金币先进入“待结算”池，完成本轮才真正入账", "Endless coins go to a pending pot; clear the round to bank them"),
            t("轮中死亡或暂停退出，将失去当前轮的待结算金币", "Dying or quitting mid-round forfeits the pending pot"),
          ]);
        } else {
          runCoins += pu.data.value;
        }
        sfxCoin();
      } else {
        pu.data.type.apply(player);
        runEquip[pu.data.type.id] = (runEquip[pu.data.type.id] || 0) + 1;
        sfxEquip();
        floatingTexts.push(new FloatingText(player.x, player.y - 26, pick(pu.data.type, "label"), pu.data.type.color));
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
    fireBark("lowhp");
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
      floatingTexts.push(new FloatingText(player.x, player.y - 40, t("决心重燃！", "DETERMINATION rekindled!"), "#ffffff"));
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
function drawColumn(x, baseY, wear = 0, seed = 0) {
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
  // 环境演变: each conquered difficulty leaves one more crack in the hall —
  // deterministic per column so the damage never flickers between frames
  if (wear > 0) {
    ctx.strokeStyle = "rgba(90, 80, 120, 0.5)";
    ctx.lineWidth = 1.5;
    for (let c = 0; c < wear; c++) {
      const h1 = Math.abs(Math.sin(seed * 12.9898 + c * 78.233)) % 1;
      const h2 = Math.abs(Math.sin(seed * 39.425 + c * 11.135)) % 1;
      let cx = x - w / 2 + 6 + h1 * (w - 12);
      let cy = 4 + h2 * (baseY - 60);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 4; s++) {
        cx += (Math.sin(seed + c * 3 + s * 7) > 0 ? 1 : -1) * (3 + ((h1 * 37 + s * 13) % 6));
        cy += 8 + ((h2 * 29 + s * 17) % 8);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  }
}

// 金色之花 wall bloom: tinted once, cached (owners of the hidden cosmetic)
let GOLD_BLOOM = null;
function goldenBloomSprite() {
  return (GOLD_BLOOM ||= tintSprite(ECHO_BLOOM, "#ffd93d", 0.55));
}

function drawBackground() {
  ctx.fillStyle = "#0e0b16";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // top wall band: unreachable, slightly raised tone
  ctx.fillStyle = "#131020";
  ctx.fillRect(0, 0, WIDTH, WALL_H);

  // giant columns move in lockstep with the world (no parallax)
  // 环境演变: boss kills crack the columns deeper with each conquered
  // difficulty; unlocked echoes bloom as flowers along the wall base
  const st = getStats();
  const wear = st.bossKills > 0 ? 1 + Math.min(3, Math.max(0, st.diffCleared)) : 0;
  const bloomCount = unlockedAllEchoCount();
  const golden = cosmeticOwned("goldenflower");
  const spacing = 240;
  const off = camX;
  const first = Math.floor((off - 120) / spacing) * spacing;
  for (let wx = first; wx < off + WIDTH + 120; wx += spacing) {
    drawColumn(wx - off, WALL_H, wear, wx / spacing);
    // one flower slot between each pair of columns, filled as echoes unlock
    const slots = ALL_ECHOES.length;
    const slot = (((wx / spacing) % slots) + slots) % slots;
    if (slot < bloomCount) {
      const sway = Math.sin(elapsed * 1.6 + slot) * 0.05;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.85;
      ctx.translate(wx - off + spacing / 2, WALL_H - 2);
      ctx.rotate(sway);
      const spr = golden && slot === 0 ? goldenBloomSprite() : ECHO_BLOOM;
      ctx.drawImage(spr, -10, -(ECHO_BLOOM.height / ECHO_BLOOM.width) * 20, 20, (ECHO_BLOOM.height / ECHO_BLOOM.width) * 20);
      ctx.restore();
    }
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
  if (sp.color === "#a01822" || sp.color === "#c93a5a" || sp.color === "#ff5d73") return PROJECTILE_BONE_CRIMSON;
  if (sp.root > 0) return PROJECTILE_BONE_BLUE;
  if (sp.wave || sp.color === "#c59bff") return PROJECTILE_BONE_PURPLE;
  return skinnedBone();
}

function draw() {
  syncCanvasA11y();
  drawBackground();

  ctx.save();
  ctx.translate(-camX, 0); // world space from here

  // 塔防场地垫底: 网格/走廊/障碍/红门,以及放置态的绿格提示(camX=0)
  if (tdMode && td && (state === "playing" || state === "paused" || state === "choice" || state === "chest" || state === "gameover")) {
    drawTdField(ctx, td.map, td.entrance, td.armedSlot >= 0, tdHoverCell, td.towers);
    // 塔本体: 各角色朝左站桩+角色色辉光
    for (const tw of td.towers) {
      ctx.save();
      const glow = CHAR_GLOWS[tw.charId];
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 14;
      }
      const set = WALK_SETS[tw.charId] || WALK_SETS.sans;
      drawSprite(ctx, (set[tw.pp.dir] || set.left || set.down)[0], tw.pp.x, tw.pp.y, 34);
      ctx.restore();
    }
  }

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
      // little pixel chest (lid + base sprites), gentle beacon glow
      ctx.save();
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 8 + 4 * Math.sin(elapsed * 5);
      ctx.imageSmoothingEnabled = false;
      const bob = Math.round(Math.sin(elapsed * 3) * 1.5);
      ctx.drawImage(CHEST_LID, pu.x - 11, pu.y - 12 + bob, 22, 7);
      ctx.drawImage(CHEST_BASE, pu.x - 11, pu.y - 6 + bob, 22, 9);
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
        // 底部锚定(2026-07-15 用户反馈"骨头要从底下伸上来"): 骨根钉在
        // 触发点,只有顶端随 pop 往上长——原来的中心缩放读作"原地冒出"
        drawBone(sp.x, sp.y - size * 0.5, size, -Math.PI / 2, spikeBoneSprite(sp));
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
    } else if (cast.skill === "faceBurst") {
      for (const mark of cast.marks) {
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 34 - p * 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mark.x - 10, mark.y - 7);
        ctx.lineTo(mark.x + 9, mark.y + 8);
        ctx.moveTo(mark.x + 10, mark.y - 7);
        ctx.lineTo(mark.x - 9, mark.y + 8);
        ctx.stroke();
      }
    } else if (cast.skill === "curtainRise") {
      const leftEdge = cast.safeX - cast.safeHalfWidth;
      const rightEdge = cast.safeX + cast.safeHalfWidth;
      ctx.globalAlpha = 0.08 + p * 0.18;
      ctx.fillRect(camX, WALL_H, Math.max(0, leftEdge - camX), HEIGHT - WALL_H);
      ctx.fillRect(rightEdge, WALL_H, Math.max(0, camX + WIDTH - rightEdge), HEIGHT - WALL_H);
      ctx.globalAlpha = 0.5 + p * 0.45;
      ctx.setLineDash([8, 6]);
      for (const x of [leftEdge, rightEdge]) {
        ctx.beginPath();
        ctx.moveTo(x, WALL_H);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else if (cast.skill === "teamAttack") {
      for (const lane of cast.lanes) {
        const danger = cast.dangerLanes.includes(lane);
        ctx.strokeStyle = danger ? (p > 0.58 ? "#ffffff" : e.eliteProfile.color) : "#5b4450";
        ctx.globalAlpha = danger ? 0.45 + p * 0.5 : 0.22;
        ctx.lineWidth = danger ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(lane, WALL_H);
        ctx.lineTo(lane, HEIGHT);
        ctx.stroke();
      }
    } else if (cast.skill === "ratingStage") {
      for (const cell of cast.cells) {
        ctx.globalAlpha = cell.danger ? 0.22 + p * 0.55 : 0.12;
        ctx.fillStyle = cell.danger ? e.eliteProfile.color : "#72e0ff";
        ctx.strokeStyle = cell.danger && p > 0.58 ? "#ffffff" : ctx.fillStyle;
        ctx.lineWidth = cell.danger ? 3 : 1;
        ctx.fillRect(cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h);
        ctx.strokeRect(cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h);
      }
    } else if (cast.skill === "flexPressure") {
      const leftEdge = cast.safeX - cast.safeHalfWidth;
      const rightEdge = cast.safeX + cast.safeHalfWidth;
      ctx.globalAlpha = 0.1 + p * 0.2;
      ctx.fillRect(camX, WALL_H, Math.max(0, leftEdge - camX), HEIGHT - WALL_H);
      ctx.fillRect(rightEdge, WALL_H, Math.max(0, camX + WIDTH - rightEdge), HEIGHT - WALL_H);
      ctx.globalAlpha = 0.5 + p * 0.45;
      ctx.lineWidth = 4;
      for (const x of [leftEdge, rightEdge]) {
        ctx.beginPath();
        ctx.moveTo(x, WALL_H);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (const mark of cast.marks) {
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 28 - p * 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mark.x, mark.y - 48);
        ctx.lineTo(mark.x, mark.y - 18);
        ctx.stroke();
      }
    } else if (cast.skill === "orangeRush") {
      ctx.strokeStyle = p > 0.62 ? "#fff0c2" : "#ff8a3d";
      ctx.fillStyle = "#ff8a3d";
      ctx.globalAlpha = 0.1 + p * 0.18;
      ctx.fillRect(camX, cast.dangerY - cast.bandHalfHeight, WIDTH, cast.bandHalfHeight * 2);
      ctx.globalAlpha = 0.55 + p * 0.4;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 8]);
      ctx.beginPath();
      ctx.moveTo(camX, cast.dangerY);
      ctx.lineTo(camX + WIDTH, cast.dangerY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (cast.skill === "starBurst") {
      for (let i = 0; i < cast.rings.length; i++) {
        const danger = i === cast.dangerRing;
        ctx.strokeStyle = danger && p > 0.58 ? "#ffffff" : danger ? e.eliteProfile.color : "#786f42";
        ctx.globalAlpha = danger ? 0.48 + p * 0.5 : 0.2;
        ctx.lineWidth = danger ? 5 : 2;
        ctx.beginPath();
        ctx.arc(cast.x, cast.y, cast.rings[i], 0, Math.PI * 2);
        ctx.stroke();
      }
      if (cast.centerDanger) {
        ctx.globalAlpha = 0.22 + p * 0.5;
        ctx.fillStyle = e.eliteProfile.color;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
          const r = i % 2 === 0 ? 36 : 15;
          const x = cast.x + Math.cos(a) * r;
          const y = cast.y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
    } else if (cast.skill === "tailSketch") {
      const attackColor = cast.mode === "blue" ? "#68bfff" : "#ff9f43";
      ctx.strokeStyle = p > 0.6 ? "#ffffff" : attackColor;
      ctx.fillStyle = attackColor;
      ctx.globalAlpha = 0.1 + p * 0.16;
      ctx.fillRect(camX, cast.dangerY - cast.bandHalfHeight, WIDTH, cast.bandHalfHeight * 2);
      ctx.globalAlpha = 0.5 + p * 0.45;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(camX, cast.dangerY);
      ctx.lineTo(camX + WIDTH, cast.dangerY);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (const mark of cast.marks) {
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 25 - p * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mark.x - 8, mark.y - 5);
        ctx.quadraticCurveTo(mark.x, mark.y + 9, mark.x + 8, mark.y - 5);
        ctx.stroke();
      }
    } else if (cast.skill === "memoryFaces") {
      for (const mark of cast.marks) {
        const radius = 5 + p * 26;
        ctx.globalAlpha = 0.35 + p * 0.58;
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        if (radius > 13) {
          ctx.fillRect(mark.x - 9, mark.y - 6, 4, 4);
          ctx.fillRect(mark.x + 5, mark.y - 6, 4, 4);
          ctx.beginPath();
          ctx.arc(mark.x, mark.y + 2, 10, 0.15, Math.PI - 0.15);
          ctx.stroke();
        }
      }
    } else if (cast.skill === "everymanFlock") {
      ctx.globalAlpha = 0.1 + p * 0.2;
      ctx.fillRect(camX, WALL_H, Math.max(0, cast.safeEdge - camX), HEIGHT - WALL_H);
      ctx.globalAlpha = 0.55 + p * 0.4;
      ctx.strokeStyle = p > 0.62 ? "#ffffff" : e.eliteProfile.color;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(cast.safeEdge, WALL_H);
      ctx.lineTo(cast.safeEdge, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      for (const mark of cast.marks) {
        ctx.beginPath();
        ctx.arc(mark.x, mark.y, 24 - p * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mark.x - 13, mark.y);
        ctx.quadraticCurveTo(mark.x - 5, mark.y - 11, mark.x, mark.y);
        ctx.quadraticCurveTo(mark.x + 5, mark.y - 11, mark.x + 13, mark.y);
        ctx.stroke();
      }
    } else if (cast.skill === "rocketPack") {
      for (const lane of cast.lanes) {
        const danger = lane === cast.dangerY;
        if (danger) {
          ctx.fillStyle = e.eliteProfile.color;
          ctx.globalAlpha = 0.08 + p * 0.16;
          ctx.fillRect(camX, lane - cast.bandHalfHeight, WIDTH, cast.bandHalfHeight * 2);
        }
        ctx.strokeStyle = danger ? (p > 0.58 ? "#ffffff" : e.eliteProfile.color) : "#52606a";
        ctx.globalAlpha = danger ? 0.5 + p * 0.45 : 0.22;
        ctx.lineWidth = danger ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(camX, lane);
        ctx.lineTo(camX + WIDTH, lane);
        ctx.stroke();
        if (danger) {
          for (let x = camX + 34; x < camX + WIDTH; x += 70) {
            ctx.beginPath();
            ctx.moveTo(x - 9, lane - 7);
            ctx.lineTo(x, lane);
            ctx.lineTo(x - 9, lane + 7);
            ctx.stroke();
          }
        }
      }
    } else if (cast.skill === "toothCage") {
      const top = cast.safeY - cast.safeHalfHeight;
      const bottom = cast.safeY + cast.safeHalfHeight;
      ctx.globalAlpha = 0.09 + p * 0.2;
      ctx.fillRect(camX, WALL_H, WIDTH, Math.max(0, top - WALL_H));
      ctx.fillRect(camX, bottom, WIDTH, Math.max(0, HEIGHT - bottom));
      ctx.globalAlpha = 0.5 + p * 0.45;
      ctx.strokeStyle = p > 0.62 ? "#ffffff" : e.eliteProfile.color;
      ctx.lineWidth = 3;
      for (let x = camX; x < camX + WIDTH; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, top - 24);
        ctx.lineTo(x + 16, top);
        ctx.lineTo(x + 32, top - 24);
        ctx.moveTo(x, bottom + 24);
        ctx.lineTo(x + 16, bottom);
        ctx.lineTo(x + 32, bottom + 24);
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
    const profileSprite = e.tdBoss
      ? TD_BOSS_FRAMES[Math.floor(performance.now() / 160) % TD_BOSS_FRAMES.length] // 走路版天意: 红染sans行军帧
      : CHAMPION_SPRITES[e.championProfile?.key || e.eliteProfile?.key];
    let enemySprite = profileSprite || ENEMY_SPRITES[e.sprite];
    // 缴械: 身体转黑白(灰阶精灵按原图缓存,不逐帧滤镜,保手机帧率)
    if (e.cannotAttack) enemySprite = grayscaleOf(enemySprite);
    const artBox = enemyArtLayout(e, enemySprite);
    drawEnemyRankAura(ctx, e, artBox);
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
    drawEnemyArt(ctx, enemySprite, artBox);
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
      drawEnemyArt(ctx, whiteSilhouetteOf(enemySprite), artBox, Math.min(0.92, e.hitFlash / 0.15));
    }
    if (e.hp < e.maxHp) {
      const w = Math.max(e.radius * 2, Math.min(artBox.w * 0.78, artBox.champion ? 104 : 72));
      const barY = artBox.y - 7;
      ctx.fillStyle = "#241f2b";
      ctx.fillRect(Math.round(e.x - w / 2), barY, Math.round(w), 3);
      ctx.fillStyle = "#7cf28a";
      ctx.fillRect(Math.round(e.x - w / 2), barY, Math.round(w * Math.max(0, e.hp / e.maxHp)), 3);
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
      } else if (inst.id === "iblaster") {
        const g = getIGBState(inst);
        if (g) {
          for (const b of g.blasters) {
            if (b.beam) {
              ctx.save();
              ctx.lineCap = "round";
              ctx.strokeStyle = "rgba(217, 37, 53, 0.4)";
              ctx.lineWidth = b.beam.width + 10;
              ctx.beginPath();
              ctx.moveTo(b.beam.x1, b.beam.y1);
              ctx.lineTo(b.beam.x2, b.beam.y2);
              ctx.stroke();
              ctx.strokeStyle = "#ffdade";
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
            ctx.rotate(b.angle - Math.PI / 2);
            ctx.imageSmoothingEnabled = false;
            const spr = b.beam ? GB_FIRE_CRIMSON : GB_IDLE_CRIMSON;
            const gw = 44;
            const gh = (spr.height / spr.width) * gw;
            ctx.drawImage(spr, -gw / 2, -gh / 2, gw, gh);
            ctx.restore();
          }
        }
      } else if (inst.id === "ihand") {
        for (const h of getHandFx(inst)) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          // 全红+半透明(2026-07-15 用户裁决): 幻影就该像幻影
          const spr = h.phase === "clench" ? IHAND_CLENCH_RED : IHAND_OPEN_RED;
          const hw = 52 * h.size;
          ctx.globalAlpha = h.phase === "clench" ? Math.max(0, 0.8 - (h.t / 0.35) * 0.8) : 0.55;
          ctx.drawImage(spr, h.x - hw / 2, h.y - hw / 2, hw, hw);
          ctx.restore();
        }
      } else if (inst.id === "ihook") {
        const h = getHookInfo(inst);
        if (h) {
          if (h.phase === "dart") {
            // 先行骨刺: 旋转的猩红骨,钉中目标才触发起跳
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            drawBone(h.x, h.y, 26, h.dartAngle, PROJECTILE_BONE_CRIMSON);
            ctx.restore();
          }
          for (const tr of h.trail) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - tr.t / 0.2) * 0.5;
            ctx.fillStyle = "#d92535";
            ctx.fillRect(tr.x - 8, tr.y - 8, 16, 16);
            ctx.restore();
          }
        }
      } else if (inst.id === "hscythe") {
        const sw = getScytheSwing(inst);
        if (sw) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - sw.t / 0.28) * 0.85;
          ctx.strokeStyle = "#f2ead8";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(sw.x ?? player.x, sw.y ?? player.y, sw.radius * Math.min(1, sw.t / 0.14), -0.6 + sw.t * 8, 1.2 + sw.t * 8);
          ctx.stroke();
          ctx.restore();
        }
      } else if (inst.id === "hslash") {
        for (const w of getSlashWaves(inst)) {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = "#f2ead8";
          ctx.lineWidth = 6;
          ctx.beginPath();
          const pa = Math.atan2(w.dirY, w.dirX);
          ctx.arc(w.x, w.y, w.width / 2, pa - 1.1, pa + 1.1);
          ctx.stroke();
          ctx.restore();
        }
      } else if (inst.id === "hride") {
        const r = getRideInfo(inst);
        if (r) {
          // 回程前0.3s = 开火瞬间: 光束+开火帧,之后滑回原位
          const firing = r.phase === "return" && r.t < 0.3 && r.beam;
          if (firing) {
            ctx.save();
            ctx.lineCap = "round";
            ctx.globalAlpha = Math.max(0, 1 - r.t / 0.3);
            ctx.strokeStyle = "rgba(242, 234, 216, 0.35)";
            ctx.lineWidth = r.beam.width + 10;
            ctx.beginPath();
            ctx.moveTo(r.beam.x1, r.beam.y1);
            ctx.lineTo(r.beam.x2, r.beam.y2);
            ctx.stroke();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = r.beam.width * 0.55;
            ctx.beginPath();
            ctx.moveTo(r.beam.x1, r.beam.y1);
            ctx.lineTo(r.beam.x2, r.beam.y2);
            ctx.stroke();
            ctx.restore();
          }
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(player.x, player.y + 14);
          ctx.rotate(Math.atan2(r.dirY, r.dirX) - Math.PI / 2);
          const spr = firing ? GB_FIRE : GB_IDLE;
          const gw = 52;
          ctx.drawImage(spr, -gw / 2, -gw / 2, gw, (spr.height / spr.width) * gw);
          ctx.restore();
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
  if (!flickerHidden && !tdMode) { // 塔防: 本体退场,输出全在塔上
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
    // 近敌警示环: whatever the effect soup looks like, a threat inside
    // 170px always shows through as a red pulsing ring (readability first)
    {
      let ringsDrawn = 0;
      for (const e of enemies) {
        if (e.boss || ringsDrawn >= 20) continue;
        const dxp = e.x - player.x;
        const dyp = e.y - player.y;
        const d2 = dxp * dxp + dyp * dyp;
        if (d2 > 170 * 170) continue;
        const near = 1 - Math.sqrt(d2) / 170;
        ctx.save();
        ctx.strokeStyle = "#ff4a4a";
        ctx.globalAlpha = (0.35 + near * 0.55) * (0.75 + 0.25 * Math.sin(elapsed * 10));
        ctx.lineWidth = 2 + near * 1.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ringsDrawn += 1;
      }
    }
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
      // 扑杀骑乘期间身体冒红光(用户原案),平时是普通角色辉光
      const pouncing = player.character === "insanity" && player.weapons.some((i) => getPounceInfo(i));
      ctx.shadowBlur = pouncing ? 26 + Math.sin(elapsed * 20) * 8 : 16;
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

  // 访客: the talking echo flower, swaying; whispers once the player leans in
  if (flowerVisit && (state === "playing" || state === "choice")) {
    const fv = flowerVisit;
    const fade = Math.min(1, fv.t / 0.5, Math.max(0, (16 - fv.t) / 0.8));
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(fv.x, fv.y);
    ctx.rotate(Math.sin(fv.t * 2.2) * 0.06);
    ctx.drawImage(ECHO_BLOOM, -16, -30, 32, (ECHO_BLOOM.height / ECHO_BLOOM.width) * 32);
    ctx.restore();
    if (fv.heard) {
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.textAlign = "center";
      ctx.font = "12px monospace";
      const fw = ctx.measureText(fv.line).width + 16;
      const fx = clamp(fv.x, camX + fw / 2 + 8, camX + WIDTH - fw / 2 - 8);
      const fy = Math.max(fv.y - 46, WALL_H + 26);
      ctx.fillStyle = "rgba(10, 8, 16, 0.82)";
      ctx.fillRect(fx - fw / 2, fy - 13, fw, 20);
      ctx.strokeStyle = "#6bd0ff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(fx - fw / 2, fy - 13, fw, 20);
      ctx.fillStyle = "#bfe8ff";
      ctx.fillText(fv.line, fx, fy + 2);
      ctx.restore();
      ctx.textAlign = "left";
    }
  }

  // 访客: the annoying dog trots across the battlefield, untouchable
  if (dogVisit && (state === "playing" || state === "choice")) {
    const d = dogVisit;
    const ph = Math.floor(elapsed * 8) % 2; // two-frame walk
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(d.x, d.y + Math.sin(elapsed * 10) * 1.5);
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(-10, -6, 15, 9); // body
    ctx.fillRect(3, -12, 9, 9); // head
    ctx.fillRect(4, -15, 3, 4); // ear
    ctx.fillRect(-14, -9 + (ph ? 1 : 0), 4, 4); // wagging tail
    ctx.fillRect(ph ? -8 : -5, 3, 3, 4); // legs
    ctx.fillRect(ph ? 0 : 3, 3, 3, 4);
    ctx.fillStyle = "#1a1626";
    ctx.fillRect(8, -10, 2, 2); // eye
    ctx.fillRect(11, -7, 2, 2); // nose
    ctx.restore();
  }

  // 访客: the yellow-name SPARE monster — UT players know the color on sight
  if (spareVisit && (state === "playing" || state === "choice")) {
    const sv = spareVisit;
    const fadeIn = Math.min(1, sv.t / 0.5);
    const fadeOut = sv.state === "bow" ? Math.max(0, 1 - Math.max(0, sv.bowT - 0.8) / 0.6) : 1;
    ctx.save();
    ctx.globalAlpha = fadeIn * fadeOut;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(sv.x, sv.y + Math.sin(sv.t * 3) * 2);
    if (sv.state === "bow") ctx.rotate(Math.min(0.35, sv.bowT * 0.6)); // the bow
    const spr = ENEMY_SPRITES[sv.type];
    if (spr) ctx.drawImage(spr, -19, -19, 38, 38);
    ctx.rotate(sv.state === "bow" ? -Math.min(0.35, sv.bowT * 0.6) : 0);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd93d"; // yellow name = sparable, since 2015
    ctx.font = "bold 12px monospace";
    ctx.fillText(`✳ ${enemyName(sv.type)}`, 0, -28);
    ctx.restore();
    ctx.textAlign = "left";
  }

  // 访客: 帕子的信 — a white envelope, glowing with GREATNESS
  if (letterVisit && (state === "playing" || state === "choice")) {
    const lv = letterVisit;
    const a = Math.min(1, lv.t / 0.5, Math.max(0, (25 - lv.t) / 0.8));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(lv.x, lv.y + Math.sin(lv.t * 2.4) * 3);
    ctx.shadowColor = "#ffd93d";
    ctx.shadowBlur = 10 + 5 * Math.sin(lv.t * 4);
    ctx.fillStyle = "#f4f0e2";
    ctx.fillRect(-11, -8, 22, 16); // envelope
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#b8503c";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); // the flap
    ctx.moveTo(-11, -8);
    ctx.lineTo(0, 2);
    ctx.lineTo(11, -8);
    ctx.stroke();
    ctx.fillStyle = "#b8503c";
    ctx.fillRect(-2, 3, 4, 4); // wax seal
    ctx.restore();
  }

  // 访客: Temmie, vibrating at a frequency science cannot explain
  if (temVisit && (state === "playing" || state === "choice")) {
    const tv = temVisit;
    const a = Math.min(1, tv.t / 0.4, Math.max(0, (5 - tv.t) / 0.5));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(tv.x + (Math.random() - 0.5) * 3, tv.y + (Math.random() - 0.5) * 3);
    const spr = CHAMPION_SPRITES.visitor_timmie;
    if (spr) ctx.drawImage(spr, -24, -22, 48, 43);
    ctx.restore();
  }

  // character bark: a one-liner speech bubble hovering over the player
  if (bark && (state === "playing" || state === "choice")) {
    const a = Math.min(1, bark.t / 0.4);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.font = "bold 13px monospace";
    const bw = ctx.measureText(bark.text).width + 18;
    // world space here: clamp against the camera window, not the raw canvas
    const bx = clamp(player.x, camX + bw / 2 + 8, camX + WIDTH - bw / 2 - 8);
    const by = Math.max(player.y - 64, WALL_H + 30);
    ctx.fillStyle = "rgba(10, 8, 16, 0.82)";
    ctx.fillRect(bx - bw / 2, by - 15, bw, 22);
    ctx.strokeStyle = currentCharacter().color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx - bw / 2, by - 15, bw, 22);
    ctx.fillStyle = "#f2ead8";
    ctx.fillText(bark.text, bx, by + 1);
    ctx.restore();
    ctx.textAlign = "left";
  }

  if (bossFight) {
    // 大招压暗(P0 美术止血): everything drawn so far (world, weapon fx,
    // particles) dips while the boss's big move is on stage — the beam and
    // giant bones are drawn after this layer, so danger stays bright.
    // Purely visual; damage code never reads this.
    if (bossFight.bigMove > 0.02) {
      ctx.fillStyle = `rgba(6, 5, 12, ${0.38 * bossFight.bigMove})`;
      ctx.fillRect(camX - 24, -24, WIDTH + 48, HEIGHT + 48);
    }
    bossFight.draw(ctx);
  }

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
    const a = activeTip.confirm ? 1 : Math.min(1, activeTip.t / 0.8);
    const w = 640;
    const h = 34 + activeTip.lines.length * 18 + (activeTip.confirm ? 28 : 0);
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
    drawIconLabel(ctx, ICONS.tip, activeTip.title, WIDTH / 2, y + 20, 16, 6);
    ctx.fillStyle = "#e8e2d4";
    ctx.font = "12px monospace";
    activeTip.lines.forEach((line, i) => {
      ctx.fillText(line, WIDTH / 2, y + 40 + i * 18);
    });
    if (activeTip.confirm) {
      ctx.fillStyle = "#7cf28a";
      ctx.font = "bold 13px monospace";
      ctx.fillText(t("点击画面 或 按 Enter 开始", "Tap or press Enter to start"), WIDTH / 2, y + h - 12);
    }
    ctx.restore();
    ctx.textAlign = "left";
  }

  // UT-style narration line when a candy is eaten
  if (candyBanner && (state === "playing" || state === "choice")) {
    const a = Math.min(1, candyBanner.t / 0.5);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = "bold 14px monospace";
    // EN lines run wider than CJK — grow the box like the savepoint frame does
    const bw = Math.max(480, Math.min(WIDTH - 24, ctx.measureText(candyBanner.text).width + 44));
    // 塔防底部被编队栏+队长行占用,叙事框上移一档防遮挡
    const by = tdMode ? HEIGHT - 148 : HEIGHT - 92;
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(WIDTH / 2 - bw / 2, by, bw, 34);
    ctx.strokeStyle = "#7cf28a";
    ctx.lineWidth = 2;
    ctx.strokeRect(WIDTH / 2 - bw / 2, by, bw, 34);
    ctx.textAlign = "center";
    ctx.fillStyle = "#7cf28a";
    ctx.font = "bold 14px monospace";
    ctx.fillText(candyBanner.text, WIDTH / 2, by + 22);
    ctx.restore();
    ctx.textAlign = "left";
  }

  // savepoint aphorism: UT-style typed narration in the opening seconds
  if (savepointNote && state === "playing" && introBlack <= 0 && !candyBanner) {
    const total = savepointNote.text.length;
    const shown = Math.min(total, Math.floor(savepointNote.t * 24));
    const end = total / 24 + 4.2;
    const a = Math.min(1, Math.max(0, (end - savepointNote.t) / 0.6));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = "bold 14px monospace";
    const tw = ctx.measureText(savepointNote.text).width;
    const bw = Math.max(480, tw + 44);
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(WIDTH / 2 - bw / 2, HEIGHT - 92, bw, 34);
    ctx.strokeStyle = "#ffd93d";
    ctx.lineWidth = 2;
    ctx.strokeRect(WIDTH / 2 - bw / 2, HEIGHT - 92, bw, 34);
    ctx.textAlign = "left"; // typewriter must not re-center on every new char
    ctx.fillStyle = "#f2ead8";
    ctx.fillText(savepointNote.text.slice(0, shown), WIDTH / 2 - bw / 2 + 22, HEIGHT - 70);
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
    ctx.fillText(t("※ 一股可怕的气息正在逼近……", "※ A terrible presence approaches..."), WIDTH / 2, WALL_H + 46);
    ctx.font = "bold 15px monospace";
    ctx.fillText(`${Math.max(1, Math.ceil(bossAppearAt() - elapsed))} 秒`, WIDTH / 2, WALL_H + 70);
    ctx.restore();
    ctx.textAlign = "left";
  }

  if (tdMode && td) {
    // 塔防HUD: 入口血条顶替玩家血条(左上),经验与编队栏在底部
    drawTdEntranceHud(ctx, td.entrance, WIDTH);
    if (state === "playing" || state === "paused" || state === "choice") drawTdBar(ctx, WIDTH, HEIGHT, td);
    // 计时器沿用(顶部中央;触屏加大一档保物理可读)
    ctx.textAlign = "center";
    ctx.fillStyle = "#f2ead8";
    ctx.font = `${IS_TOUCH ? "bold 20px" : "16px"} monospace`;
    ctx.fillText(`${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, "0")}`, WIDTH / 2, 32);
    ctx.textAlign = "left";
  } else {
    drawHud(ctx, WIDTH, player, elapsed, healFlash, !!bossFight, weaponSummary(player));
  }
  const activeRoundBoss = endlessRound > 0
    ? enemies.find((enemy) => enemy.roundBoss && enemy.hp > 0)
    : tdMode && td
      ? enemies.find((enemy) => enemy.tdBoss && enemy.hp > 0) // TD天意: 同一条独立血条
      : null;
  if (activeRoundBoss && (state === "playing" || state === "paused" || state === "choice")) {
    const bw = Math.min(480, WIDTH - 320);
    const bx = (WIDTH - bw) / 2;
    const by = 70;
    const hpPct = Math.max(0, Math.min(1, activeRoundBoss.hp / activeRoundBoss.maxHp));
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#f2ead8";
    ctx.font = "bold 12px monospace";
    ctx.fillText(enemyDisplayName(activeRoundBoss), WIDTH / 2, by - 7);
    ctx.fillStyle = "#1a1520";
    ctx.fillRect(bx, by, bw, 13);
    ctx.fillStyle = "#c72f56";
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * hpPct, 9);
    ctx.strokeStyle = activeRoundBoss.invulnTimer > 0 ? "#ffffff" : "#f2ead8";
    ctx.lineWidth = activeRoundBoss.invulnTimer > 0 ? 3 : 2;
    ctx.strokeRect(bx, by, bw, 13);
    if (activeRoundBoss.invulnTimer > 0) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.fillText(t("降临中 · 无敌", "ARRIVING · INVULNERABLE"), WIDTH / 2, by + 27);
    }
    ctx.restore();
    ctx.textAlign = "left";
  }
  // 右上只留金币(像素图标+数字);无尽轮压缩为短状态;契约/每日缩为小图标
  if (state === "playing" || state === "paused" || state === "choice") {
    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 15px monospace";
    ctx.fillText(`${runCoins}`, WIDTH - 16, 32);
    drawPixelIcon(ctx, ICONS.coin, WIDTH - 38 - ctx.measureText(`${runCoins}`).width, 19, 16);
    let hudY = 52;
    ctx.font = "12px monospace";
    if (endlessRound > 0) {
      const clock = roundTimer > 0 ? t(`剩 ${Math.ceil(roundTimer)}s`, `${Math.ceil(roundTimer)}s left`) : roundBossDown ? t("完成", "Done") : t("消灭首领！", "Kill the boss!");
      ctx.fillStyle = "#ff8a5d";
      ctx.fillText(`${t(`第 ${endlessRound} 轮`, `Round ${endlessRound}`)} · ${clock}`, WIDTH - 16, hudY);
      hudY += 18;
      const cf = currentCoinFactor();
      ctx.fillStyle = cf > 0 ? "#ffd166" : "#8d8798";
      ctx.fillText(cf > 0 ? `${t("待结算", "Pending")} +${roundPendingCoins}` : `${t("断供 · 待结算", "Cut off · pending")} +${roundPendingCoins}`, WIDTH - 16, hudY);
      hudY += 18;
    }
    // 契约/每日: 开局横幅已经交代过,战斗中只留 16px 像素图标占位
    let iconX = WIDTH - 32;
    if (dailyMode) {
      drawPixelIcon(ctx, ICONS.daily, iconX, hudY - 11, 16);
      iconX -= 22;
    }
    if (activeContract) drawPixelIcon(ctx, ICONS.pact, iconX, hudY - 11, 16);
    ctx.restore();
    ctx.textAlign = "left";
  }
  // 连杀常驻缩小实时计数;10/25/40…里程碑时借 killFlash 放大弹跳(评审共识)
  if (streak >= 5 && (state === "playing" || state === "choice")) {
    const pop = 1 + Math.max(0, streakTimer - 1.35) * 0.8 + Math.max(0, killFlash) * 4;
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = streakTier >= 3 ? "#ff8a5d" : "#ffd166";
    ctx.font = `bold ${Math.round((11 + Math.min(streak, 80) * 0.05) * pop)}px monospace`;
    ctx.fillText(t(`${streak} 连杀`, `${streak} STREAK`), WIDTH / 2, activeRoundBoss ? 108 : 78);
    ctx.restore();
    ctx.textAlign = "left";
  }
  // 结算页上别再画Boss血条/台词(死在Boss战时它们会压住结算文案)
  if (bossFight && state !== "gameover") bossFight.drawOverlay(ctx);
  if (state === "playing" || state === "paused" || state === "choice") {
    drawSpeedButton(ctx, WIDTH, timeScale, dailyMode);
    drawPauseButton(ctx, WIDTH, state === "paused");
  }
  // 新手引导横幅: 一行大白话+步数+跳过;只在战斗画面画
  if (tutorialStep >= 0 && state === "playing") {
    const steps = tutorialSteps();
    if (tutorialStep < steps.length) {
      const b = tutorialBannerRect(WIDTH);
      ctx.save();
      ctx.fillStyle = "rgba(10, 8, 16, 0.92)";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#ffd93d";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.textAlign = "left";
      ctx.fillStyle = "#9a93ab";
      ctx.font = `bold ${IS_TOUCH ? 13 : 12}px monospace`;
      ctx.fillText(`${tutorialStep + 1}/${steps.length}`, b.x + 12, b.y + b.h / 2 + 4);
      ctx.fillStyle = "#f2ead8";
      ctx.font = `bold ${IS_TOUCH ? 16 : 14}px monospace`;
      ctx.fillText(steps[tutorialStep].text, b.x + 48, b.y + b.h / 2 + 5);
      const s = tutorialSkipRect(WIDTH);
      ctx.textAlign = "center";
      ctx.fillStyle = "#6b6578";
      ctx.font = `${IS_TOUCH ? 13 : 12}px monospace`;
      ctx.fillText(t("跳过 ▸", "Skip ▸"), s.x + s.w / 2, s.y + s.h / 2 + 4);
      ctx.restore();
      ctx.textAlign = "left";
    }
  }
  if (state === "playing" && !tdMode) drawJoystick(ctx, getJoystick()); // 塔防没有本体可动,不画摇杆

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
      flowerGiftLine(),
      titleMenuOpen,
      questView().some((q) => !q.done) // gold dot: bounties waiting
    );
    drawMuteButton(ctx, WIDTH, audioMuted);
    drawLangButton(ctx, WIDTH);
    // 主线目标(2026-07-12 评审「玩家要知道现在最值得做什么」): one line,
    // evolves with account progress — everything else serves these three
    {
      const st = getStats();
      const dc = st.diffCleared ?? -1;
      const goal =
        st.bossKills === 0
          ? t("当前目标:击败普通难度 Boss(5:00 出现)", "Current goal: beat the NORMAL Boss (5:00)")
          : dc === 0
            ? t("当前目标:购买推荐强化,挑战狂暴难度", "Current goal: buy upgrades, challenge FURY")
            : dc === 1
              ? t("当前目标:提升角色专精,挑战地狱难度", "Current goal: raise mastery, challenge HELL")
              : dc === 2
                ? t("当前目标:挑战屠杀难度与无尽轮数", "Current goal: GENOCIDE and deeper endless rounds")
                : t("当前目标:刷新角色、难度与无尽榜名次", "Current goal: push characters, difficulties and the endless board");
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#d9c47a";
      ctx.font = "13px monospace";
      drawIconLabel(ctx, ICONS.star, goal, WIDTH / 2, HEIGHT / 2 + (IS_TOUCH ? 210 : 200), 14, 5);
      ctx.restore();
      ctx.textAlign = "left";
    }
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
      COSMETICS_SHOP_ENABLED,
      shopFlash?.id ?? null,
      metaPowerIndex(),
      shopPowerPulse
    );
    // UT-style denial narration for maxed / gated / broke purchases
    if (shopMsg) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, shopMsg.t / 0.4);
      ctx.textAlign = "center";
      ctx.fillStyle = "#8fa8c9";
      ctx.font = "bold 14px monospace";
      ctx.fillText(shopMsg.text, WIDTH / 2, HEIGHT - 30);
      ctx.restore();
      ctx.textAlign = "left";
    }
  } else if (state === "codex") {
    const st = getStats();
    const monsters = CODEX_MONSTERS.map((m) => ({
      ...m,
      sprite: m.boss ? WALK_SETS.sans.down[0] : CHAMPION_SPRITES[m.key] || ENEMY_SPRITES[m.type],
      kills: m.boss ? st.bossKills : st.killsByType[m.key] || 0,
      elite: m.key.startsWith("elite_") || m.key.startsWith("champion_"),
      champion: m.key.startsWith("champion_"),
      boss: !!m.boss,
      note: codexNote(m.key),
      check: codexCheck(m.key),
    }));
    // FUN 61-63: a seventeenth record that was never part of this codex
    if (funValue >= 61 && funValue <= 63) {
      monsters.push({
        key: "gaster",
        name: "■■■",
        english: "",
        kills: 0,
        color: "#3a3346",
        elite: false,
        champion: false,
        ghost: true,
        ghostLine: gasterGhostLine(),
        ghostSub: gasterGhostSub(),
      });
    }
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
  } else if (state === "leaderboard") {
    drawLeaderboard(ctx, WIDTH, HEIGHT);
  } else if (state === "modeselect") {
    drawModeSelect(ctx, WIDTH, HEIGHT, keyboardNavigation ? modeKeyboardFocus : -1);
    drawBackButton(ctx, WIDTH, HEIGHT);
  } else if (state === "tdpick") {
    {
      const locks = charLocksNow();
      const c = CHARACTERS[tdPickSel];
      drawTdPick(
        ctx,
        WIDTH,
        HEIGHT,
        CHARACTERS,
        tdPickSel,
        WEAPON_LISTS[c.id].filter(tdWeaponAllowed),
        tdPickRoster,
        locks,
        keyboardNavigation ? tdKeyboardFocus : null
      );
      drawBackButton(ctx, WIDTH, HEIGHT);
    }
  } else if (state === "charselect") {
    {
      const pageChars = charPageList();
      const localSel = Math.max(0, pageChars.indexOf(CHARACTERS[selectedChar]));
      drawCharSelect(
        ctx,
        WIDTH,
        HEIGHT,
        pageChars,
        localSel,
        PLAYER_SPRITES,
        Object.fromEntries(CHARACTERS.map((c) => [c.id, bestScoreOf(c.id)])),
        charLocksNow(), // 付费角色买断(黑客另需地狱通关)
        diffPills(),
        Object.fromEntries(
          CHARACTERS.map((c) => {
            const k = getStats().charKills[c.id] || 0;
            return [c.id, { lvl: masteryOf(k), kills: k, next: masteryNextAt(masteryOf(k)) }];
          })
        ),
        { page: charPage, pages: 2, label: CHAR_PAGE_LABELS()[charPage] }
      );
    }
  } else if (state === "select") {
    drawWeaponSelect(
      ctx,
      WIDTH,
      HEIGHT,
      currentWeaponList(),
      selectedWeapon,
      pick(currentCharacter(), "name"),
      weaponLocks(),
      (() => {
        // 预览: 确认键=买断;门槛未过/免费条件锁(-1)只看不卖
        const lk = charLocksNow()[currentCharacter().id];
        if (!lk) return null;
        if (lk.freeLock) return -1;
        return lk.gated ? null : lk.cost || null;
      })()
    );
    if (CONTRACTS_ENABLED) drawContractChips(ctx, WIDTH, HEIGHT, offeredContracts, selectedContract);
  } else if (state === "paused") {
    drawCenterText(
      ctx,
      WIDTH,
      HEIGHT,
      [
        { text: t("已 暂 停", "PAUSED"), font: "bold 32px monospace", color: "#8fd6ff" },
        { text: t("按 Z 继续", "Press Z to resume"), font: "16px monospace", color: "#ffd166" },
        {
          text: t(
            `本局 ${Math.floor(elapsed)}s · 击杀 ${player.kills} · 最高连杀 ${runMaxStreak} · 得分 ${currentScore()}`,
            `Run ${Math.floor(elapsed)}s · Kills ${player.kills} · Best streak ${runMaxStreak} · Score ${currentScore()}`
          ),
          font: "13px monospace",
          color: "#9a93ab",
        },
      ],
      -100 // keep clear of the volume control below
    );
    drawVolumeControl(ctx, WIDTH, HEIGHT, bgmVolume, sfxVolume);
    drawHomeButton(ctx, WIDTH, HEIGHT);
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
    ctx.fillText(t("本局属性", "Run Stats"), px0 + 14, py0 + 24);
    ctx.fillStyle = "#e8e2d4";
    ctx.font = "12px monospace";
    const regenNow = player.regen + player.maxHp * player.regenPct;
    [
      `${t("攻击", "ATK")} ${player.atk}  ${t("增伤", "DMG amp")} ${Math.round(player.dmgAmp * 100)}%`,
      `${t("生命", "HP")} ${Math.ceil(player.hp)}/${player.maxHp}`,
      `${t("回血", "Regen")} ${regenNow.toFixed(1)}${t("/秒", "/s")}`,
      `${t("移速", "Speed")} ${Math.round(player.moveSpeed)}  ${t("攻速", "Rate")} ${player.fireRate.toFixed(2)}`,
      `${t("减伤", "DR")} ${Math.round(player.dmgReduction * 100)}%  ${t("闪避", "Dodge")} ${Math.round(player.dodge * 100)}%`,
      `${t("荆棘", "Thorns")} ${player.thorns}  ${t("磁吸", "Magnet")} ${Math.round(player.magnetRadius)}`,
      `${t("射程", "Range")} ${Math.round(player.range)}  ${t("等级", "Level")} ${player.level}`,
      `${t("复活可用", "Revives")} ${player.revives}`,
      ...(Object.keys(relics).length ? [`${t("六魂遗物", "Soul relics")} ${Object.keys(relics).length}/6`] : []),
    ].forEach((line, i) => ctx.fillText(line, px0 + 14, py0 + 50 + i * 24));
    const qx0 = WIDTH - 276;
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(qx0, py0, 240, 130);
    ctx.strokeStyle = "#5a5468";
    ctx.strokeRect(qx0, py0, 240, 130);
    ctx.fillStyle = "#c59bff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(t("外观与称号", "Looks & Titles"), qx0 + 14, py0 + 24);
    ctx.font = "12px monospace";
    const soulNow = equippedCosmetic();
    ctx.fillStyle = soulNow ? soulNow.color : "#7d7690";
    ctx.fillText(`${t("灵魂加护", "Soul Aegis")}:${soulNow ? pick(soulNow, "name") : t("无(商店可购)", "none (see shop)")}`, qx0 + 14, py0 + 50);
    if (soulNow) drawSprite(ctx, soulHeartSprite(soulNow.color), qx0 + 216, py0 + 46, 12);
    const boneNow = equippedBoneSkin();
    ctx.fillStyle = boneNow ? boneNow.color : "#7d7690";
    ctx.fillText(`${t("骨之涂装", "Bone Skin")}:${boneNow ? pick(boneNow, "name") : t("默认白骨", "default white")}`, qx0 + 14, py0 + 76);
    ctx.fillStyle = "#c8c2d4";
    ctx.fillText(`${t("称号", "Title")}:${bestTitle() ? "「" + pick(bestTitle(), "name") + "」" : t("无", "none")}`, qx0 + 14, py0 + 102);
    // 武器和道具:不用“构筑”等设计术语,每件武器单独列出避免长串溢出
    const pauseWeapons = player.weapons.map((inst) => ({
      text: `${inst.evolved ? "★" + pick(WEAPONS[inst.id].evolve, "name") : pick(WEAPONS[inst.id], "name")} Lv${inst.tier + 1}`,
      evolved: inst.evolved,
    }));
    const pauseItems = [
      ...(runEquipSummary() ? [`${t("装备", "Gear")}:${runEquipSummary()}`] : []), // 含行前整备(2026-07-14 用户反馈"看不见")
      ...(activeContract ? [`${t("契约", "Pact")}:${pick(activeContract, "name")}`] : []),
      ...(hotdogStock > 0 ? [t(`热狗 ×${hotdogStock}:血少时自动吃`, `Hot dogs ×${hotdogStock}: auto-eaten at low HP`)] : []),
      ...(dailyMode ? [t("每日挑战进行中", "Daily challenge active")] : []),
    ];
    const weaponCols = pauseWeapons.length > 4 ? 2 : 1;
    const weaponRows = Math.ceil(pauseWeapons.length / weaponCols);
    const buildPanelH = 44 + weaponRows * 19 + pauseItems.length * 18 + 10;
    ctx.fillStyle = "rgba(10, 8, 16, 0.85)";
    ctx.fillRect(qx0, py0 + 142, 240, buildPanelH);
    ctx.strokeStyle = "#5a5468";
    ctx.strokeRect(qx0, py0 + 142, 240, buildPanelH);
    ctx.fillStyle = "#7ea8ff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(t("武器和道具", "Weapons & Items"), qx0 + 14, py0 + 166);
    pauseWeapons.forEach((weapon, i) => {
      const col = weaponCols === 2 ? i % 2 : 0;
      const row = weaponCols === 2 ? Math.floor(i / 2) : i;
      const maxW = weaponCols === 2 ? 100 : 210;
      let fontSize = weaponCols === 2 ? 10 : 12;
      ctx.font = `${fontSize}px monospace`;
      while (fontSize > 8 && ctx.measureText(weapon.text).width > maxW) {
        fontSize -= 1;
        ctx.font = `${fontSize}px monospace`;
      }
      ctx.fillStyle = weapon.evolved ? "#ffd166" : "#e8e2d4";
      ctx.fillText(weapon.text, qx0 + 14 + col * 108, py0 + 190 + row * 19);
    });
    ctx.font = "11px monospace";
    ctx.fillStyle = "#c8c2d4";
    const itemY = py0 + 190 + weaponRows * 19;
    pauseItems.forEach((line, i) => ctx.fillText(line, qx0 + 14, itemY + i * 18));
    // 小贴士: half mechanics, half memes — refreshed on every pause
    if (pauseTip) {
      ctx.fillStyle = "#9a93ab";
      ctx.font = "12px monospace";
      drawIconLabel(ctx, ICONS.tip, `${t("小贴士", "Tip")}:${pauseTip}`, WIDTH / 2, quitButtonRect(WIDTH, HEIGHT).y + quitButtonRect(WIDTH, HEIGHT).h + 26, 15, 5); // 锚定退出按钮下方,桌面/触屏都不再被压
    }
    ctx.restore();
    ctx.textAlign = "center";
    drawResumeButton(ctx, WIDTH, HEIGHT);
    drawQuitButton(ctx, WIDTH, HEIGHT);
  } else if (state === "choice") {
    drawChoiceScreen(ctx, WIDTH, HEIGHT, choiceOptions, choiceRerollsLeft);
  } else if (state === "quests") {
    drawQuestsScreen(ctx, WIDTH, HEIGHT, questView());
  } else if (state === "savecode") {
    drawCenterText(
      ctx,
      WIDTH,
      HEIGHT,
      [
        { text: t("存 档 码", "SAVE CODE"), font: "bold 30px monospace", color: "#8fd6ff" },
        { text: t("把进度带到另一台设备,或做个备份", "Move your progress to another device, or keep a backup"), font: "14px monospace", color: "#c8c2d4" },
        { text: t("导出:生成一串代码,复制保存", "Export: generates a code — copy and keep it"), font: "12px monospace", color: "#9a93ab" },
        { text: t("导入:粘贴代码,覆盖本机进度并刷新", "Import: paste a code — overwrites local progress and reloads"), font: "12px monospace", color: "#9a93ab" },
        { text: t("※ 请勿修改代码内容,改动会导致导入失败", "※ Don't edit the code — any change breaks the import"), font: "11px monospace", color: "#d9c47a" },
      ],
      -110
    );
    for (const [rect, icon, label, color] of [
      [bossClearLeaveRect(WIDTH, HEIGHT), ICONS.share, t("导出存档码", "Export save code"), "#7cf28a"],
      [bossClearContinueRect(WIDTH, HEIGHT), ICONS.save, t("导入存档码", "Import save code"), "#8fd6ff"],
    ]) {
      ctx.save();
      ctx.fillStyle = "#1d1828";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = color;
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      drawIconLabel(ctx, icon, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 7, 16, 6);
      ctx.restore();
    }
    ctx.textAlign = "left";
    drawBackButton(ctx, WIDTH, HEIGHT);
  } else if (state === "weaponbook") {
    drawWeaponBook(
      ctx,
      WIDTH,
      HEIGHT,
      CHARACTERS,
      bookChar,
      WEAPON_LISTS[CHARACTERS[bookChar].id],
      bookSel
    );
  } else if (state === "echoes") {
    drawEchoField(
      ctx,
      WIDTH,
      HEIGHT,
      ALL_ECHOES.map((e) => ({
        title: pick(e, "title"),
        hint: pick(e, "hint"),
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
        // 必须与 startDailyChallenge 同一套免费池取模——曾按全名单(含付费角色)
        // 取模,大厅宣布的角色和实际进场的对不上
        charName: pick(CHARACTERS.filter((c) => !c.cost)[seed % CHARACTERS.filter((c) => !c.cost).length], "name"),
        best: parseInt(localStorage.getItem("daily_" + todayKey()) || "0", 10) || 0,
      },
      bossClearChoice
    );
  } else if (state === "chest" && chestCeremony) {
    // ---- slot-machine chest ceremony (the show) ----
    const cc = chestCeremony;
    ctx.save();
    // screen shake rides the whole ceremony
    if (cc.shake > 0) {
      ctx.translate((Math.random() - 0.5) * cc.shake * 18, (Math.random() - 0.5) * cc.shake * 14);
    }
    ctx.fillStyle = "rgba(4, 3, 9, 0.92)"; // bg dimmed harder (P0 美术止血)
    ctx.fillRect(-24, -24, WIDTH + 48, HEIGHT + 48);
    ctx.textAlign = "center";
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2 - 110;
    const open = cc.phase === "reveal";
    const n = cc.rewards.length;
    const jackpot = n >= 5 ? 2 : n >= 3 ? 1 : 0;

    // rotating god-rays build up behind the chest
    const rayAlpha = cc.phase === "spin" ? 0.10 + Math.min(1, cc.t / 1.5) * 0.16 : open ? 0.3 : 0;
    if (rayAlpha > 0) {
      // sparse hard-edged gold sparkles instead of a giant sunburst — the
      // chest is the star, the room stays dark (P0 美术止血)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = jackpot === 2 && open ? "#ffd93d" : "#ffd166";
      for (let i = 0; i < 14; i++) {
        const a = (i * 2.39996) % (Math.PI * 2); // golden-angle spread, static
        const rr = 90 + ((i * 53) % 160);
        const tw = (Math.floor(elapsedWall() * 6) + i) % 4; // twinkle steps
        if (tw === 3) continue;
        ctx.globalAlpha = rayAlpha * 2.2 * (tw === 1 ? 1 : 0.5);
        const sz = tw === 1 ? 5 : 3;
        ctx.fillRect(Math.round(Math.cos(a) * rr) - (sz >> 1), Math.round(Math.sin(a) * rr * 0.72) - (sz >> 1), sz, sz);
      }
      ctx.restore();
    }

    // the chest: falls in, squashes on landing, rattles during the spin,
    // and HOPS with a squash-pop the instant it opens (开箱要有爆发力)
    let chestY = cy;
    let squash = 1;
    if (cc.phase === "drop") {
      const p = Math.min(1, cc.t / 0.35);
      chestY = cy - (1 - p * p) * 260; // ease-in fall
      if (cc.landed) squash = 1 + Math.max(0, 0.25 - (cc.t - 0.35) * 1.6);
    }
    if (open && cc.t < 0.4) {
      const hk = cc.t / 0.4;
      chestY = cy - Math.sin(hk * Math.PI) * 16; // pop-up hop
      squash = cc.t < 0.1 ? 0.86 : cc.t < 0.26 ? 1.14 : 1 + 0.05 * Math.sin(cc.t * 40);
    }
    let jitterX = 0;
    if (cc.phase === "spin") {
      const p = Math.min(1, cc.t / 1.5);
      // 悬念递进(老虎机技术): 奖越大颤得越狠 — 玩家会学会读这个信号
      const tierAmp = n >= 5 ? 1.9 : n >= 3 ? 1.35 : 1;
      jitterX = Math.sin(cc.t * 46) * 2.6 * p * tierAmp;
      if (n >= 5 && p > 0.5) {
        // 五连后半段: 彩色微光在箱角踏格闪烁 — "这次不对劲!"
        const flick = ["#ff8fc7", "#7cf28a", "#8fd6ff", "#ffd93d"][Math.floor(elapsedWall() * 10) % 4];
        ctx.save();
        ctx.fillStyle = flick;
        ctx.globalAlpha = 0.9;
        const fx2 = cx + (Math.floor(elapsedWall() * 10) % 2 ? 62 : -62);
        ctx.fillRect(fx2 - 3, chestY - 40, 6, 6);
        ctx.fillRect(cx - (fx2 - cx) - 3, chestY + 18, 6, 6);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(cx + jitterX, chestY);
    ctx.scale(1 * squash, 1 / squash);
    ctx.imageSmoothingEnabled = false;
    const S = 9; // chest ~2x bigger: it IS the show (P0 美术止血, no blur glow)
    const LW = 22 * S, LH = 7 * S, BW = 22 * S, BH = 9 * S;
    if (open) {
      const lt = Math.min(1, cc.t / 0.45);
      // 层次修正: 开盖(最远) → 光柱(从箱口内冲出,压在盖子前) →
      // 箱体(最前,遮住光柱根部)——光是从箱子里出来的,不是背后
      // ① the open lid, furthest back
      const OH = 9 * S;
      if (lt < 0.16) {
        ctx.drawImage(CHEST_LID, -LW / 2, -12 - LH + S, LW, LH); // frame 1: still closed
      } else if (lt < 0.32) {
        ctx.drawImage(CHEST_LID, -LW / 2, -12 - (LH >> 1) + S, LW, LH >> 1); // frame 2: mid flip
      } else {
        ctx.drawImage(CHEST_LID_OPEN, -LW / 2, -12 - OH + 2, LW, OH); // frame 3: inner face
      }
      // ② tier centerpiece — 光柱是五连专属;三连=四芒星闪;单奖=金光一噗
      if (jackpot === 0 && lt >= 0.16 && cc.t < 0.7) {
        // 单奖: a quick golden puff out of the mouth, done in half a beat
        const pt2 = Math.min(1, (cc.t - 0.16) / 0.5);
        ctx.save();
        ctx.fillStyle = "#ffd166";
        for (let i = 0; i < 6; i++) {
          const yy = -18 - pt2 * (26 + i * 9) - (i % 2) * 4;
          const xx = ((i % 3) - 1) * 12 + (i > 2 ? 5 : -3);
          ctx.globalAlpha = (1 - pt2) * (i < 2 ? 1 : 0.7);
          const sz2 = i < 2 ? 6 : 4;
          ctx.fillRect(Math.round(xx) - sz2 / 2, Math.round(yy), sz2, sz2);
        }
        ctx.restore();
      }
      if (jackpot === 1 && lt >= 0.16 && cc.t < 0.8) {
        // 三连: a four-point treasure glint snapping open at the mouth
        const st2 = Math.min(1, (cc.t - 0.16) / 0.4);
        const len2 = Math.round((26 + 128 * st2) / 4) * 4;
        const fade = 1 - st2 * st2;
        ctx.save();
        ctx.translate(0, -18);
        for (const [rot, scale2, col] of [
          [0, 1, "#fff3b0"],
          [Math.PI / 4, 0.55, "#ffd166"],
        ]) {
          ctx.save();
          ctx.rotate(rot);
          ctx.globalAlpha = fade * (rot === 0 ? 0.95 : 0.6);
          ctx.fillStyle = col;
          const L2 = Math.round(len2 * scale2);
          ctx.fillRect(-3, -L2 / 2, 6, L2);
          ctx.fillRect(-L2 / 2, -3, L2, 6);
          ctx.restore();
        }
        ctx.restore();
      }
      // 五连专属 LIGHT PILLAR: rooted INSIDE the box (bottom sinks 3S below
      // the mouth so the base plate covers it), blasting up IN FRONT of the lid
      if (jackpot === 2 && lt >= 0.16) {
        const pk = Math.min(1, Math.max(0, cc.t - 0.1) / 0.3);
        const shoot = 1 + 2.70158 * Math.pow(pk - 1, 3) + 1.70158 * Math.pow(pk - 1, 2); // easeOutBack
        // 三档演出: 单奖利落 / 三连更粗更高 / 五连全场戏
        const pillarH = (jackpot === 2 ? 430 : jackpot === 1 ? 330 : 230) * Math.max(0, shoot);
        const breathe = S * ((Math.floor(elapsedWall() * 8) % 2) ? 1 : 0); // stepped pulse
        const wCore = (jackpot === 2 ? 5 : jackpot === 1 ? 4 : 3) * S + breathe;
        const wMid = (jackpot === 2 ? 10 : jackpot === 1 ? 8 : 6) * S + breathe;
        const wOut = (jackpot === 2 ? 16 : jackpot === 1 ? 12 : 9) * S;
        const rootY = -12 + 3 * S; // inside the box mouth
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(-wOut / 2, rootY - pillarH, wOut, pillarH);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-wMid / 2, rootY - pillarH * 0.92, wMid, pillarH * 0.92);
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#fff3b0";
        ctx.fillRect(-wCore / 2, rootY - pillarH * 0.85, wCore, pillarH * 0.85);
        // rising motes inside the beam
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 6; i++) {
          const my = -20 - (((elapsedWall() * 130 + i * 47) % Math.max(60, pillarH * 0.8)));
          ctx.globalAlpha = 0.8 * (1 + my / Math.max(60, pillarH));
          ctx.fillRect(Math.round(((i % 3) - 1) * wCore * 0.3) - 2, Math.round(my), 4, 4);
        }
        ctx.restore();
      }
      // ③ the base in front — its rim eats the pillar's root
      ctx.drawImage(CHEST_BASE, -BW / 2, -12, BW, BH);
      ctx.fillStyle = "#fff3b0"; // glowing mouth strip
      ctx.fillRect(-BW / 2 + 2 * S, -12, BW - 4 * S, S);
      // ④ tier shockwaves: 三连一圈、五连双圈 — flattened pixel rings
      const ringsN = jackpot === 2 ? 2 : jackpot === 1 ? 1 : 0;
      for (let ri = 0; ri < ringsN; ri++) {
        const rt = cc.t - 0.16 - ri * 0.2;
        if (rt > 0 && rt < 0.55) {
          const rr = 30 + rt * 460;
          ctx.save();
          ctx.globalAlpha = (1 - rt / 0.55) * 0.85;
          ctx.fillStyle = ri === 0 ? "#ffd166" : "#fff3b0";
          const steps = Math.max(18, Math.round(rr / 5));
          for (let k2 = 0; k2 < steps; k2++) {
            const a2 = (k2 / steps) * Math.PI * 2;
            ctx.fillRect(Math.round(Math.cos(a2) * rr) - 2, Math.round(-6 + Math.sin(a2) * rr * 0.5) - 2, 4, 4);
          }
          ctx.restore();
        }
      }
    } else {
      ctx.drawImage(CHEST_BASE, -BW / 2, -12, BW, BH);
      ctx.drawImage(CHEST_LID, -LW / 2, -12 - LH + S, LW, LH);
    }
    ctx.restore();

    // golden fountain
    for (const sp of cc.sparks) {
      // axis-aligned snapped squares — confetti reads pixel, not glitter soup
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - sp.t / sp.life);
      ctx.fillStyle = sp.color;
      const ss = Math.max(2, Math.round(sp.size / 2) * 2);
      ctx.fillRect(Math.round(sp.x) - ss / 2, Math.round(sp.y) - ss / 2, ss, ss);
      ctx.restore();
    }

    if (cc.phase === "drop") {
      ctx.fillStyle = "#9a93ab";
      ctx.font = "13px monospace";
      ctx.fillText(t("谜之宝箱……", "A mysterious chest..."), cx, cy + 150);
    } else if (cc.phase === "spin") {
      const icons = [ICONS.coin, ICONS.relic, ICONS.heart, ICONS.daily, ICONS.awakening];
      const idx = ((cc.lastTick % icons.length) + icons.length) % icons.length;
      const p = Math.min(1, cc.t / 1.5);
      ctx.save();
      const spinSize = Math.round(48 + p * 18);
      ctx.fillStyle = "#14101c";
      ctx.fillRect(cx - spinSize / 2 + 3, cy + 84 + 3, spinSize, spinSize);
      drawPixelIcon(ctx, icons[idx], cx - spinSize / 2, cy + 84, spinSize);
      ctx.restore();
      ctx.fillStyle = "#9a93ab";
      ctx.font = "13px monospace";
      ctx.fillText(t("命运正在滚动……", "Fate is rolling..."), cx, cy + 170);
      ctx.fillStyle = "#6f697d";
      ctx.font = "11px monospace";
      ctx.fillText(t("点击跳过", "Tap to skip"), cx, cy + 190);
    } else {
      // reveal: restrained banner + staggered 3+2 pixel reward plaques
      ctx.save();
      if (jackpot === 2) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#ffd93d";
        ctx.fillRect(cx - 188, cy + 65, 376, 38);
        ctx.globalAlpha = 0.4;
        ctx.fillRect(cx - 164, cy + 61, 328, 3);
        ctx.fillRect(cx - 164, cy + 104, 328, 3);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = jackpot === 2 ? "#ffd93d" : jackpot === 1 ? "#ffd166" : "#f2ead8";
      ctx.font = `bold ${jackpot === 2 ? 36 : jackpot === 1 ? 30 : 24}px monospace`;
      ctx.fillText(jackpot === 2 ? t("五 连 大 奖", "5× JACKPOT") : jackpot === 1 ? t("三 连 奖", "3× PRIZE") : t("战 利 品", "LOOT"), cx, cy + 96);
      ctx.restore();
      const wide = WIDTH >= 1100;
      const w = wide ? 200 : 174;
      const gap = wide ? 16 : 14;
      const perRow = Math.min(3, n);
      const cardH = 96;
      const rowStep = 108;
      cc.rewards.forEach((rw, i) => {
        // staggered entrance with an overshoot bounce
        const local = Math.max(0, cc.t - 0.1 - i * 0.12);
        if (local <= 0) return;
        const k = Math.min(1, local / 0.3);
        const overshoot = 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.18;
        const row = Math.floor(i / perRow);
        const inRow = Math.min(perRow, n - row * perRow);
        const col = i % perRow;
        const rowTotal = inRow * w + (inRow - 1) * gap;
        const x = cx - rowTotal / 2 + col * (w + gap);
        const y = cy + 120 + row * rowStep;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.translate(x + w / 2, y + cardH / 2);
        ctx.scale(k * overshoot, k * overshoot);
        ctx.translate(-(w / 2), -cardH / 2);
        // double pixel frame: dark slab, inner plate, separate effect footer
        ctx.fillStyle = "#0c0914";
        ctx.fillRect(0, 0, w, cardH);
        ctx.fillStyle = "#1d1828";
        ctx.fillRect(3, 3, w - 6, cardH - 6);
        ctx.fillStyle = rw.color;
        ctx.fillRect(3, 3, w - 6, 2);
        ctx.fillRect(3, cardH - 5, w - 6, 2);
        ctx.fillRect(3, 3, 2, cardH - 6);
        ctx.fillRect(w - 5, 3, 2, cardH - 6);
        ctx.fillStyle = "#14101c"; // icon pixel drop shadow
        ctx.fillRect(w / 2 - 15 + 2, 9 + 2, 30, 30);
        drawPixelIcon(ctx, rw.icon, w / 2 - 15, 9, 30);
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = "#f2ead8";
        ctx.fillText(rw.label, w / 2, 58);
        ctx.fillStyle = "#100d18";
        ctx.fillRect(6, 67, w - 12, 23);
        ctx.fillStyle = rw.color;
        ctx.fillRect(6, 67, w - 12, 1);
        ctx.font = "11px monospace";
        ctx.fillStyle = "#d0cad8";
        ctx.fillText(rw.detail || "", w / 2, 83);
        ctx.restore();
      });
      if (cc.t > 0.1 + n * 0.12 + 0.3) {
        ctx.fillStyle = "#9a93ab";
        ctx.font = "13px monospace";
        ctx.fillText(t("点击收下,继续战斗", "Tap to claim and fight on"), cx, cy + (cc.rewards.length > 3 ? 350 : 240));
      }
    }

    // white burst at the instant of opening
    if (cc.flash > 0) {
      ctx.fillStyle = `rgba(255, 250, 230, ${(cc.flash / 0.22) * 0.5})`;
      ctx.fillRect(-24, -24, WIDTH + 48, HEIGHT + 48);
    }
    ctx.restore();
    ctx.textAlign = "left";
  } else if (state === "bossclear") {
    drawBossClearScreen(ctx, WIDTH, HEIGHT, bossClearChoice);
  } else if (state === "roundclear") {
    drawRoundClearScreen(ctx, WIDTH, HEIGHT, endlessRound, bossClearChoice, roundPendingCoins);
  } else if (state === "chapter" && chapterShow) {
    // 审判纪元 chapter cutscene: black room, gold title, lines typed in turn
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 24px monospace";
    const cLines = pick(chapterShow.chapter, "lines");
    const y0 = HEIGHT / 2 - 30 - cLines.length * 17;
    ctx.fillText(pick(chapterShow.chapter, "title"), WIDTH / 2, y0 - 44);
    ctx.font = "16px monospace";
    for (let i = 0; i <= chapterShow.line; i++) {
      const full = cLines[i];
      const text = i < chapterShow.line ? full : full.slice(0, Math.floor(chapterShow.t * 20));
      ctx.fillStyle = i === chapterShow.line ? "#f2ead8" : "#9a93ab";
      ctx.fillText(text, WIDTH / 2, y0 + i * 34);
    }
    if (chapterShow.t * 20 >= cLines[chapterShow.line].length && Math.floor(chapterShow.t * 2) % 2 === 0) {
      ctx.fillStyle = "#8fa8c9";
      ctx.font = "13px monospace";
      ctx.fillText(t("▼ 点击继续", "▼ Tap to continue"), WIDTH / 2, HEIGHT - 60);
    }
    ctx.textAlign = "left";
  } else if (state === "gameover") {
    const title =
      runOutcome === "victory"
        ? { text: t("通关成功！", "STAGE CLEAR!"), font: "bold 32px monospace", color: "#7cf28a" }
        : runOutcome === "endlessDeath"
          ? { text: t("无尽终局", "ENDLESS END"), font: "bold 32px monospace", color: "#ff8a5d" }
          : runOutcome === "retreat"
            ? { text: t("主动撤离", "EXTRACTED"), font: "bold 32px monospace", color: "#8fd6ff" }
            : { text: "GAME OVER", font: "bold 32px monospace", color: "#ff5d73" };
    // 结算两段式(2026-07-12 UX批次)+第一屏六行收敛(美术批): 第一屏只讲
    // "这局怎么样、下一步干嘛",最多六行;流水账折到第二屏并按
    // 构筑/永久成长/新发现 分区(评审共识:分区不拆页签)
    const rankState = rankedRunStatus();
    const rankResultLine =
      bossDefeated && rankState.phase !== "offline"
        ? {
            text:
              rankState.phase === "success"
                ? `${t("已上榜", "Ranked")} · ${rankState.message}`
                : rankState.message,
            font: "bold 14px monospace",
            color:
              rankState.phase === "success"
                ? "#7cf28a"
                : rankState.phase === "error"
                  ? "#ff5d73"
                  : rankState.phase === "disabled"
                    ? "#9a93ab"
                    : "#8fd6ff",
          }
        : null;
    const screenRows = gameoverDetail
      ? [
          { text: t("本 局 收 获", "RUN REWARDS"), font: "bold 26px monospace", color: "#ffd166" },
          ...(endlessResult
            ? [
                {
                  text: t(
                    `完成审判 ${endlessResult.rounds} 轮 · 无尽存活 ${endlessResult.time} 秒 · 新增击杀 ${endlessResult.kills}`,
                    `Judgement rounds ${endlessResult.rounds} · endless time ${endlessResult.time}s · extra kills ${endlessResult.kills}`
                  ),
                  font: "14px monospace",
                  color: "#ff8a5d",
                },
                {
                  text: `${t("最高审判轮数", "Best round")} ${endlessResult.bestRound}${endlessResult.newBestRound ? t(" 新纪录！", " NEW BEST!") : ""}`,
                  font: "14px monospace",
                  color: endlessResult.newBestRound ? "#7cf28a" : "#ff8a5d",
                },
              ]
            : []),
          ...(nearMiss ? [{ text: nearMiss, font: "bold 13px monospace", color: "#ff8a5d" }] : []),
          { text: t("—— 构 筑 ——", "—— BUILD ——"), font: "12px monospace", color: "#5a5468" },
          {
            text: tdMode && td
              ? weaponSummary({ weapons: td.towers.flatMap((tower) => tower.pp?.weapons || []) })
              : weaponSummary(player),
            font: "14px monospace",
            color: "#7ea8ff",
          },
          ...(runEquipSummary() ? [{ text: runEquipSummary(), font: "13px monospace", color: "#c8c2d4" }] : []),
          ...(activeContract ? [{ text: `${t("契约", "Pact")}「${pick(activeContract, "name")}」`, font: "13px monospace", color: "#d9c47a" }] : []),
          { text: t("—— 永久成长(死了也算数) ——", "—— PERMANENT GROWTH (kept even in death) ——"), font: "12px monospace", color: "#5a5468" },
          { text: `${t("金币", "Coins")} +${permaGrowth ? permaGrowth.coins : lastRunCoins}(${t("钱包", "Wallet")} ${getCoins()})`, font: "13px monospace", color: "#ffd166" },
          ...(permaGrowth?.masteryEnabled
            ? [
                {
                  text: `${t("角色专精", "Mastery")} ${permaGrowth.killsBefore} → ${permaGrowth.killsAfter} ${t("杀", "kills")}${permaGrowth.lvlAfter > permaGrowth.lvlBefore ? ` · ${t("升至", "up to")} Lv${permaGrowth.lvlAfter}!` : ` (Lv${permaGrowth.lvlAfter})`}`,
                  font: "13px monospace",
                  color: "#7cf28a",
                },
              ]
            : []),
          ...(bestTitle() ? [{ text: `${t("称号", "Title")}:「${pick(bestTitle(), "name")}」`, font: "13px monospace", color: "#c59bff" }] : []),
          ...(lastNewTitles.length || lastNewEchoes.length || lastNewQuests.length || lastGoldenFlower || lastMasteryUp || permaGrowth?.newCodex.length
            ? [
                { text: t("—— 新 发 现 ——", "—— DISCOVERIES ——"), font: "12px monospace", color: "#5a5468" },
                ...(lastNewTitles.length ? [{ text: `${t("新称号", "New title")}:${lastNewTitles.map((n) => `「${n}」`).join("")}`, font: "13px monospace", color: "#7cf28a" }] : []),
                ...(lastNewEchoes.length
                  ? [
                      {
                        text: `${t("回响解锁", "Echo unlocked")}:「${lastNewEchoes[0]}」${lastNewEchoes.length > 1 ? t(` 等 ${lastNewEchoes.length} 段`, ` +${lastNewEchoes.length - 1} more`) : ""}${t("(标题页聆听)", " (listen on the title screen)")}`,
                        font: "13px monospace",
                        color: "#6bd0ff",
                      },
                    ]
                  : []),
                ...(lastGoldenFlower ? [{ text: t("花田满开——「金色之花」已绽放", "The field is in full bloom — the Golden Flower has opened"), font: "bold 13px monospace", color: "#ffd93d" }] : []),
                ...(lastNewQuests.length ? [{ text: `${t("悬赏完成", "Bounties done")}:${lastNewQuests.join(t("、", ", "))}`, font: "13px monospace", color: "#ffd166" }] : []),
                ...(lastMasteryUp ? [{ text: lastMasteryUp, font: "13px monospace", color: "#7cf28a" }] : []),
                ...(permaGrowth?.newCodex.length
                  ? [
                      {
                        text: `${t("图鉴新发现", "New codex entries")}:${permaGrowth.newCodex.slice(0, 3).join(t("、", ", "))}${permaGrowth.newCodex.length > 3 ? t(` 等 ${permaGrowth.newCodex.length} 种`, ` +${permaGrowth.newCodex.length - 3} more`) : ""}`,
                        font: "13px monospace",
                        color: "#7ea8ff",
                      },
                    ]
                  : []),
              ]
            : []),
          ...(loveVerdict?.lines || []).map((t) => ({ text: t, font: "13px monospace", color: "#c59bff" })),
          ...(deathQuote ? [{ text: deathQuote, font: "13px monospace", color: "#8fa8c9" }] : []),
          ...(deathKillerLine ? [{ text: deathKillerLine, font: "13px monospace", color: "#8fa8c9" }] : []),
          ...(runOutcome === "victory" && getDifficulty().id < 3
            ? [{ text: t("觉得太简单？选人页可切换 狂暴/地狱 难度,金币加成更高", "Too easy? Switch to FURY/HELL on the character screen for bigger coin bonuses"), font: "13px monospace", color: "#ff8a5d" }]
            : []),
        ]
      : [
          title,
          ...(lastDeathBy && runOutcome !== "retreat"
            ? [{ text: `${t("死于", "Slain by")}:${lastDeathBy}`, font: "13px monospace", color: "#c95d5d" }]
            : []),
          endlessResult
            ? { text: `${t("无尽得分", "Endless score")} ${endlessResult.score} · ${endlessResult.newBest ? t("新纪录！", "NEW BEST!") : `${t("历史最佳", "Best")} ${endlessResult.best}`}`, font: "bold 22px monospace", color: "#ffd166" }
            : wasDaily
              ? { text: `${t("每日得分", "Daily score")} ${lastScore} · ${t("今日最佳", "Today best")} ${dailyBestToday}${dailyNewBest ? t(" 新纪录！", " NEW BEST!") : ""}`, font: "bold 22px monospace", color: "#ffd166" }
              : { text: `${bossDefeated ? t("通关得分", "Clear score") : t("得分", "Score")} ${lastScore} · ${newRecord ? t("新纪录！", "NEW BEST!") : `${t("历史最高", "Best")} ${lastBest}`}`, font: "bold 22px monospace", color: "#ffd166" },
          ...(rankResultLine ? [rankResultLine] : []),
          {
            text: `${endlessResult ? `${t("审判", "Round")} ${endlessResult.rounds} ${t("轮", "")} · ` : ""}${t("存活", "Survived")} ${Math.floor(bossDefeated ? stageClearTime : elapsed)}${t(" 秒", "s")} · ${t("击杀", "Kills")} ${player.kills} · ${t("连杀", "Streak")} ${runMaxStreak} · Lv${player.level}`,
            font: "15px monospace",
          },
          { text: `${t("金币", "Coins")} +${lastRunCoins}(${t("钱包", "Wallet")} ${getCoins()})`, font: "14px monospace", color: "#ffd166" },
          ...(coachAdvice
            ? [{ text: coachAdvice, font: "bold 13px monospace", color: "#7cf28a" }]
            : nearMiss
              ? [{ text: nearMiss, font: "bold 13px monospace", color: "#ff8a5d" }]
              : []),
        ];
    // 详情行数不定(5~20行):行距按"HUD之下、按钮之上"的安全带动态求值,
    // 整块居中在带内——行再多也不顶HUD、不钻按钮(治本版"-72px防重叠")
    const settleTop = 132;
    const settleBottom = HEIGHT - 192;
    const settleLineH = gameoverDetail
      ? Math.max(18, Math.min(28, Math.floor((settleBottom - settleTop) / Math.max(1, screenRows.length - 1))))
      : 34;
    const settleLift = gameoverDetail ? (settleTop + settleBottom) / 2 - HEIGHT / 2 : 0;
    // 结算页额外压暗一层:战场残留的伤害数字/怪物bark别透过来和文案打架
    ctx.fillStyle = "rgba(10, 8, 16, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawCenterText(ctx, WIDTH, HEIGHT, screenRows, settleLift, settleLineH);
    if (!gameoverDetail) {
      // 印章压在文字块上方,与标题同轴
      const stampKind =
        runOutcome === "victory" ? "victory" : runOutcome === "endlessDeath" || runOutcome === "retreat" ? "judgment" : "death";
      drawStamp(ctx, stampKind, WIDTH / 2, HEIGHT / 2 - (screenRows.length - 1) * 17 - 58, 4);
    }
    // primary action: one big gold button — everything else is secondary
    {
      const b = restartButtonRect(WIDTH, HEIGHT);
      ctx.save();
      ctx.fillStyle = "#2e2748";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 3;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText(gameoverCta?.label || t("⟳ 再 来 一 局", "⟳ Play Again"), b.x + b.w / 2, b.y + b.h / 2 + 7);
      ctx.restore();
      ctx.textAlign = "left";
    }
    // 收获页切换按钮: closed shows the count so nothing feels hidden
    {
      const b = gameoverDetailRect(WIDTH, HEIGHT);
      const gains =
        lastNewTitles.length + lastNewEchoes.length + lastNewQuests.length + (lastMasteryUp ? 1 : 0) + (lastGoldenFlower ? 1 : 0);
      ctx.save();
      ctx.fillStyle = "#1d1828";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = gains > 0 && !gameoverDetail ? "#7cf28a" : "#5a5468";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = gains > 0 && !gameoverDetail ? "#7cf28a" : "#9a93ab";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(gameoverDetail ? t("▾ 返回成绩", "▾ Back to results") : `${t("▸ 本局详情", "▸ Run details")}${gains ? ` · ${t("新收获", "new")}×${gains}` : ""}`, b.x + b.w / 2, b.y + b.h / 2 + 5);
      ctx.restore();
      ctx.textAlign = "left";
    }
    drawShareButton(ctx, WIDTH, HEIGHT);
    drawHomeButton(ctx, WIDTH, HEIGHT);
    // 去变强: one obvious next action after a defeat — straight to the shop
    // (hidden when the primary button already IS the shop CTA)
    if (coachAdvice && gameoverCta?.act !== "shop") {
      const b = upgradeJumpRect(WIDTH, HEIGHT);
      ctx.save();
      ctx.fillStyle = "#241a10";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      drawIconLabel(ctx, ICONS.attack, t("去变强", "POWER UP"), b.x + b.w / 2, b.y + b.h / 2 + 6, 16, 6);
      ctx.restore();
      ctx.textAlign = "left";
    }
  }
  // UT-style soul shatter: black cover, the upward-pointing monster soul
  // cracks, pieces fly, then fade out.
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
      ctx.save();
      ctx.translate(cx + jx, cy);
      drawSprite(ctx, heart, 0, 0, 46 + Math.sin(t * 6) * 2);
      ctx.restore();
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
        ctx.translate(px, py);
        ctx.rotate(ang * 0.15);
        drawSprite(ctx, heart, 0, 0, 13);
        ctx.restore();
      }
    }
    ctx.restore();
  }
  if (state === "credits") {
    drawCenterText(ctx, WIDTH, HEIGHT, [
      { text: t("制 作 名 单", "CREDITS"), font: "bold 30px monospace", color: "#7ea8ff" },
      { text: "", font: "10px monospace" },
      { text: t("贴图模版: Toby Fox", "Sprite templates: Toby Fox"), font: "16px monospace", color: "#f2ead8" },
      { text: t("音乐: Toby Fox / Soda Noodles / Franderman123", "Music: Toby Fox / Soda Noodles / Franderman123"), font: "16px monospace", color: "#f2ead8" },
      { text: t("游戏制作: 26", "Game by: 26"), font: "16px monospace", color: "#f2ead8" },
      { text: "", font: "10px monospace" },
      { text: t("点击画面 或 按空格 返回", "Click or press Space to go back"), font: "14px monospace", color: "#ffd166" },
    ]);
  }

  // press feedback: topmost layer, every screen — the tapped button pops white
  if (tapFlash) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (tapFlash.t / 0.16) * 0.35);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(tapFlash.x - 2, tapFlash.y - 2, tapFlash.w + 4, tapFlash.h + 4);
    ctx.restore();
  }
}

// debug probe (dev only)
window.__dbg = () => ({
  state,
  keyboard: {
    modeFocus: state === "modeselect" ? modeKeyboardFocus : null,
    tdFocus: state === "tdpick" ? tdKeyboardFocus : null,
  },
  tdPick: state === "tdpick"
    ? { selectedChar: tdPickSel, roster: tdPickRoster.length }
    : null,
  td: tdMode && td
    ? {
        gateHp: Math.ceil(td.entrance.hp),
        gateMax: td.entrance.maxHp,
        destroyed: td.entrance.destroyed,
        xp: Math.floor(td.xp),
        towers: td.towers.length,
        armed: td.armedSlot,
        roster: td.roster.length,
        introPending: td.introPending,
        leaderBonus: td.roster[0]?.teamDmgPct || 0,
        bossSpawned: td.bossSpawned,
        bossDown: td.bossDown,
        bossHp: (() => {
          const b = enemies.find((e) => e.tdBoss);
          return b ? Math.ceil(b.hp) : null;
        })(),
        // 随机地图下给测试一个确定的可放格中心
        freeCell: (() => {
          for (let r = 0; r < td.map.rows; r++)
            for (let c = 0; c < td.map.cols; c++)
              if (td.map.grid[r][c] === 0 && !td.towers.some((tw) => tw.cell.c === c && tw.cell.r === r))
                return tdCellCenter(td.map, c, r);
          return null;
        })(),
      }
    : null,
  elapsed: Math.round(elapsed * 10) / 10,
  timeScale,
  battleTrack: bgm.src || "",
  menuTrackPaused: menuBgm.paused,
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
  deathLine: deathKillerLine,
  loveVerdict: loveVerdict ? loveVerdict.lines : null,
  savepoint: savepointNote ? savepointNote.text : null,
  bark: bark ? bark.text : null,
  chapter: chapterShow ? chapterShow.chapter.id : null,
  chaptersQueued: chapterQueue.length,
  bossBlasters: bossFight ? bossFight.hazards.filter((hz) => hz.kind === "blaster").length : 0,
  bossBigDim: bossFight ? Math.round((bossFight.bigMove || 0) * 100) / 100 : 0,
  fun: funValue,
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
window.__tut = () => ({ step: tutorialStep, moved: Math.round(tutorialMoved), t: +tutorialStepT.toFixed(2), chose: tutorialChoseCard });
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
      collectBossHeart() {
        const heart = pickups.find((pickup) => pickup.kind === "bossheart");
        if (!heart || !player) return false;
        player.x = heart.x;
        player.y = heart.y;
        return true;
      },
      completeCurrentRound() {
        if (endlessRound <= 0) return false;
        roundTimer = 0;
        roundBossSpawned = true;
        roundBossDown = true;
        return true;
      },
    }
  : null;
// 塔防测试钩子只在无 hostname 的 headless、localhost 或已通过 DEBUG
// 验证的浏览器开放。正式玩家不能再用控制台刷本地金币/击杀/轮数。
window.__tdtest = tdTestHooksAllowed(location.hostname, DEBUG_UNLOCKED) ? {
  rushBoss() {
    if (!tdMode || !td || state !== "playing" || td.bossSpawned) return false;
    elapsed = Math.max(elapsed, bossAppearAt() - 0.5);
    nextWarnBeep = Math.max(nextWarnBeep, elapsed); // 别把积压的警报音一口气放完
    nextChoiceAt = Math.max(nextChoiceAt, elapsed + choiceInterval); // 也别积压选卡
    return true;
  },
  crushBoss() {
    const b = enemies.find((e) => e.tdBoss && e.hp > 0);
    if (!b) return false;
    b.invulnTimer = 0;
    b.hp = 0;
    return true;
  },
  completeRound() {
    if (!tdMode || endlessRound <= 0) return false;
    roundTimer = 0;
    roundBossSpawned = true;
    roundBossDown = true;
    return true;
  },
  healGate() {
    if (!tdMode || !td || td.entrance.destroyed) return false;
    td.entrance.hp = td.entrance.maxHp;
    return true;
  },
} : null;
window.addEventListener("error", (e) => { window.__lastErr = e.message + " @ " + e.filename + ":" + e.lineno; });

let lastTime = performance.now();
function loop(now) {
  const dt = Math.max(0, Math.min((now - lastTime) / 1000, 1 / 30)); // 时间倒流(工具驱动帧)不许把计时器越减越大
  lastTime = now;

  // crossfade the menu theme and the battle music
  const inMenu = MENU_STATES.has(state);
  fadeAudio(menuBgm, inMenu && !audioMuted ? bgmVolume : 0, dt, 0.9);
  if (state === "paused") {
    if (!bgm.paused) bgm.pause();
  } else if (bgm.src && (state === "playing" || state === "choice" || state === "chest")) {
    // the music ducks during the boss warning so the siren reads clearly
    fadeAudio(bgm, audioMuted ? 0 : gameVolTarget() * (bossWarnActive() ? 0.25 : 1), dt, 1.1);
  } else {
    fadeAudio(bgm, 0, dt, 1.5); // gameover / back to menu
  }

  if (deathShatter && state === "gameover") deathShatter.t += dt;
  if (chapterShow && state === "chapter") chapterShow.t += dt;
  if (shopMsg && (shopMsg.t -= dt) <= 0) shopMsg = null;
  if (shopPowerPulse && (shopPowerPulse.t -= dt) <= 0) shopPowerPulse = null;
  if (shopFlash && (shopFlash.t -= dt) <= 0) shopFlash = null;
  if (tapFlash && (tapFlash.t -= dt) <= 0) tapFlash = null;
  if (state === "chest" && chestCeremony) {
    const cc = chestCeremony;
    if (cc.phase === "reveal" && cc.freeze > 0) {
      cc.freeze -= dt; // held breath: clock stopped, glow held, then the burst
    } else {
      cc.t += dt;
    }
    if (cc.shake > 0) cc.shake = Math.max(0, cc.shake - dt * 2.2);
    if (cc.flash > 0) cc.flash -= dt;
    const sparkFloor = HEIGHT / 2 - 110 + 46; // the chest's foot line
    for (const s of cc.sparks) {
      s.t += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 620 * dt; // gravity
      // gold lands on the floor and hops — juice lives in the bounce
      if (s.y > sparkFloor + (s.floorJitter ??= Math.random() * 60) && s.vy > 0) {
        s.y = sparkFloor + s.floorJitter;
        s.vy *= -0.45;
        s.vx *= 0.65;
      }
      s.spin += dt * 9;
    }
    // 五连大奖: golden rain pours from the sky for the opening beat
    if (cc.phase === "reveal" && cc.rewards.length >= 5 && cc.t < 1.35 && Math.random() < 0.28) {
      cc.sparks.push({
        x: WIDTH / 2 + (Math.random() - 0.5) * WIDTH * 0.72,
        y: 16,
        vx: (Math.random() - 0.5) * 50,
        vy: 140 + Math.random() * 160,
        t: 0,
        life: 1.5 + Math.random() * 0.7,
        size: 2 + Math.random() * 3,
        color: ["#ffd166", "#fff3b0", "#ffd93d"][Math.floor(Math.random() * 3)],
        spin: 0,
      });
    }
    cc.sparks = cc.sparks.filter((s) => s.t < s.life);
    if (cc.phase === "drop") {
      if (cc.t >= 0.35 && !cc.landed) {
        cc.landed = true;
        cc.shake = 0.5;
        sfxChestLand();
      }
      if (cc.t >= 0.55) {
        cc.phase = "spin";
        cc.t = 0;
      }
    } else if (cc.phase === "spin") {
      // decelerating slot ticks: fast at first, sparse near the stop
      const p = Math.min(1, cc.t / 1.5);
      const step = Math.floor(16 * (1 - Math.pow(1 - p, 2)));
      if (step !== cc.lastTick) {
        cc.lastTick = step;
        sfxChestTick(p);
      }
      if (cc.t >= 1.5) chestAdvance(); // auto-open at full spin
    }
  }
  if (state === "echoread" && echoRead && !echoRead.done) {
    echoRead.t += dt;
    const want = Math.floor(echoRead.t * 26); // ~26 chars/sec, UT cadence
    if (want > echoRead.chars) {
      echoRead.chars = want;
      sfxType();
    }
    const total = pick(echoRead.echo, "lines").reduce((s, l) => s + l.length, 0);
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
initLeaderboard();
