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
import { Spawner } from "./spawner.js";
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
} from "./weapon.js";
import { rollEquipmentDrop, EQUIPMENT_TYPES } from "./items.js";
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
  drawJoystick,
  quitButtonRect,
  drawQuitButton,
  resumeButtonRect,
  drawResumeButton,
  startButtonRect,
  creditsButtonRect,
  drawTitleScreen,
  volumeMinusRect,
  volumePlusRect,
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

let state = "title"; // title | charselect | select | playing | paused | choice | gameover
let selectedChar = 0;
let selectedWeapon = 0;
let timeScale = 1; // 1x -> 2x -> 3x, applies to the whole simulation
let choiceOptions = [];
let choiceRerollAvailable = false; // one reroll per choice screen
let nextChoiceAt = CHOICE_INTERVAL;
let choiceInterval = CHOICE_INTERVAL;
let player, spawner, enemies, projectiles, bombs, explosions, spikes, pickups, floatingTexts, elapsed;
let healFlash = 0; // hp-bar whitening after a heal
// score: kills and survival time both count; bests persist per character
let lastScore = 0;
let lastBest = 0;
let newRecord = false;
function currentScore() {
  return Math.floor(player.kills * 5 + Math.floor(elapsed) * 2.5);
}
function bestScoreOf(charId) {
  return parseInt(localStorage.getItem("best_" + charId) || "0", 10) || 0;
}
let hurtFlash = 0; // Horror: brief red screen tint when hurt (15% chance)

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
const MENU_STATES = new Set(["title", "charselect", "select", "credits"]);
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

function currentCharacter() {
  return CHARACTERS[selectedChar];
}

function currentWeaponList() {
  return WEAPON_LISTS[currentCharacter().id];
}

function reset(weaponId) {
  player = new Player(WIDTH / 2, HEIGHT / 2);
  player.character = currentCharacter().id;
  player.weapons = [createWeaponInstance(weaponId)];
  spawner = new Spawner(WIDTH, HEIGHT, WALL_H);
  enemies = [];
  projectiles = [];
  bombs = [];
  explosions = [];
  spikes = [];
  pickups = [];
  floatingTexts = [];
  elapsed = 0;
  bossFight = null;
  camX = player.x - WIDTH / 2;
  choiceInterval = CHOICE_INTERVAL;
  nextChoiceAt = choiceInterval;
  choiceOptions = [];
}

reset(currentWeaponList()[0].id);

function settleGame() {
  // score settlement shown for both death and quitting from pause
  state = "gameover";
  bgm.pause();
  lastScore = currentScore();
  lastBest = bestScoreOf(player.character);
  newRecord = lastScore > lastBest;
  if (newRecord) localStorage.setItem("best_" + player.character, String(lastScore));
}
function toCharSelect() {
  // wipe the world so the old battlefield doesn't show behind the menu
  reset(currentWeaponList()[0].id);
  bgm.pause();
  bgm.currentTime = 0;
  state = "charselect";
}

// debug: open the page with ?boss to skip to the boss, ?boss=weak for a frail one
const DEBUG_BOSS = new URLSearchParams(location.search).get("boss");

function startGame() {
  reset(currentWeaponList()[selectedWeapon].id);
  if (DEBUG_BOSS !== null) {
    elapsed = BOSS_APPEAR_TIME - 2;
    nextChoiceAt = 99999; // skip the backlog of choice screens
  }
  timeScale = 1;
  state = "playing";
  introBlack = 1.5; // brief black screen while the music crossfades
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
      weight: 25,
      make: () => ({
        title: "攻击力 +4",
        desc: "所有武器伤害提升",
        color: "#ff6b6b",
        apply: () => {
          player.atk += 4;
        },
      }),
    },
    {
      kind: "hp",
      weight: 25,
      make: () => ({
        title: "生命上限 +25",
        desc: "并立刻回复 25 点生命",
        color: "#ff8fc7",
        apply: () => {
          player.maxHp += 25;
          player.hp = Math.min(player.maxHp, player.hp + 25);
        },
      }),
    },
    {
      kind: "speed",
      weight: 25,
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
      weight: 20,
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
      weight: 20,
      make: () => ({
        title: "每秒回血 +2",
        desc: `持续恢复生命 (当前 ${player.regen}/秒)`,
        color: "#7cf28a",
        apply: () => {
          player.regen += 2;
        },
      }),
    },
  ];

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
      desc: "立即恢复 50 点生命",
      color: "#7cf28a",
      apply: () => {
        player.hp = Math.min(player.maxHp, player.hp + 50);
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

  const unowned = currentWeaponList().filter((w) => !player.weapons.some((i) => i.id === w.id));
  if (unowned.length) {
    pool.push({
      kind: "newWeapon",
      weight: 8,
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
      weight: 15,
      make: () => {
        const inst = enhanceable[Math.floor(Math.random() * enhanceable.length)];
        const w = WEAPONS[inst.id];
        const stacks = inst.enhance;
        return {
          title: `专属强化·${w.name}`,
          desc: `${w.enhance.desc}\n${w.enhance.detail}${stacks > 0 ? `\n(当前 ${stacks} 层)` : ""}`,
          color: w.color,
          apply: () => {
            inst.enhance += 1;
          },
        };
      },
    });
  }

  const upgradable = player.weapons.filter((i) => i.tier < 4);
  if (upgradable.length) {
    pool.push({
      kind: "tierUp",
      weight: 18,
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

function rollChoices() {
  const pool = buildChoicePool();
  const picked = [];
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
    pool.splice(idx, 1);
  }
  return picked;
}

function applyChoice(i) {
  const opt = choiceOptions[i];
  if (!opt) return;
  opt.apply();
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
    return;
  }
  if ((state === "playing" || state === "paused") && inRect(pos, pauseButtonRect(WIDTH))) {
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
    if (inRect(pos, creditsButtonRect(WIDTH, HEIGHT))) state = "credits";
    else if (inRect(pos, startButtonRect(WIDTH, HEIGHT))) toCharSelect();
    return;
  }
  if (state === "credits") {
    state = "title";
    return;
  }
  if (state === "charselect") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "title";
      return;
    }
    for (let i = 0; i < CHARACTERS.length; i++) {
      if (inRect(pos, charBoxRect(i, WIDTH, HEIGHT, CHARACTERS.length))) {
        selectedChar = i;
        return;
      }
    }
    if (inRect(pos, confirmButtonRect(WIDTH, HEIGHT))) {
      selectedWeapon = 0;
      state = "select";
    }
  } else if (state === "select") {
    if (inRect(pos, backButtonRect(WIDTH, HEIGHT))) {
      state = "charselect";
      return;
    }
    for (let i = 0; i < currentWeaponList().length; i++) {
      if (inRect(pos, weaponBoxRect(i, WIDTH))) {
        selectedWeapon = i;
        return;
      }
    }
    if (inRect(pos, confirmButtonRect(WIDTH, HEIGHT))) startGame();
  } else if (state === "paused") {
    if (inRect(pos, volumeMinusRect(WIDTH, HEIGHT))) {
      setBgmVolume(bgmVolume - 0.1);
      return;
    }
    if (inRect(pos, volumePlusRect(WIDTH, HEIGHT))) {
      setBgmVolume(bgmVolume + 0.1);
      return;
    }
    if (inRect(pos, resumeButtonRect(WIDTH, HEIGHT))) {
      state = "playing";
      bgmPlay();
    } else if (inRect(pos, quitButtonRect(WIDTH, HEIGHT))) {
      settleGame(); // show the score settlement before leaving
    }
  } else if (state === "choice") {
    if (choiceRerollAvailable && inRect(pos, rerollButtonRect(WIDTH, HEIGHT))) {
      choiceOptions = rollChoices();
      choiceRerollAvailable = false;
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
  if (e.isPrimary === false || (e.button !== undefined && e.button !== 0)) return;
  e.preventDefault();
  lastPointerTapAt = performance.now();
  handleCanvasTap(canvasCoords(e));
});

canvas.addEventListener("click", (e) => {
  if (performance.now() - lastPointerTapAt < 500) return;
  handleCanvasTap(canvasCoords(e));
});

function cycleSpeed() {
  timeScale = timeScale >= 3 ? 1 : timeScale + 1;
}

window.addEventListener("keydown", (e) => {
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
  if (state === "charselect") {
    const n = CHARACTERS.length;
    if (k === "arrowleft" || k === "arrowright") selectedChar = (selectedChar + 1) % n;
    else if (k >= "1" && k <= String(n)) selectedChar = Number(k) - 1;
    else if (k === " " || k === "enter") {
      selectedWeapon = 0;
      state = "select";
    }
  } else if (state === "select") {
    const n = currentWeaponList().length;
    if (k === "arrowup") selectedWeapon = (selectedWeapon + n - 1) % n;
    else if (k === "arrowdown") selectedWeapon = (selectedWeapon + 1) % n;
    else if (k === "arrowleft" || k === "arrowright") selectedWeapon = (selectedWeapon + 4) % n;
    else if (k >= "1" && k <= String(n)) selectedWeapon = Number(k) - 1;
    else if (k === " " || k === "enter") startGame();
    else if (k === "escape") state = "charselect";
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
      if (root > 0) e.rootTimer = Math.max(e.rootTimer, root);
      e.takeDamage(dmg);
    }
  }
}

function explodeBomb(b) {
  explosions.push(new Explosion(b.x, b.y, b.blast, "#ffffff"));
  for (const e of enemies) {
    if (circleHit(b.x, b.y, b.blast, e.x, e.y, e.radius)) {
      e.takeDamage(b.dmg);
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
}

function onLevelUp(levels) {
  floatingTexts.push(new FloatingText(player.x, player.y - 26, "LEVEL UP!", "#ffd166"));
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
    choiceOptions = rollChoices();
    choiceRerollAvailable = true;
    state = "choice";
  }

  // 天意侵蚀Sans appears at 5:00: clear the field and stop spawning
  if (!bossFight && elapsed >= BOSS_APPEAR_TIME) {
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
  player.moveSpeed *= shieldBuff;
  player.regen *= shieldBuff;
  player.update(dt, moveVec, bounds);
  player.moveSpeed = baseMove;
  player.regen = baseRegen;
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

  if (!bossFight) for (const e of spawner.update(dt, camX)) enemies.push(e);

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
    // teleporter arrival strike (fixed 30 dmg in a small zone)
    if (e.strike) {
      const STRIKE_DMG = 20;
      if (!shieldUp && circleHit(e.strike.x, e.strike.y, 30, player.x, player.y, player.radius)) {
        if (player.takeDamage(STRIKE_DMG)) {
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
        // 追踪骨弹强化: hits pin the enemy in place
        if (p.rootOnHit > 0) e.rootTimer = Math.max(e.rootTimer, p.rootOnHit);
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

  for (const sp of spikes) {
    sp.update(dt);
    if (sp.erupting && !sp.hasHit) {
      sp.hasHit = true;
      const radius = sp.wave || 24;
      for (const e of enemies) {
        if (circleHit(sp.x, sp.y, radius, e.x, e.y, e.radius)) {
          if (sp.root > 0) e.rootTimer = Math.max(e.rootTimer, sp.root);
          const hit = e.takeDamage(sp.dmg);
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
  }

  const dead = enemies.filter((e) => e.hp <= 0 && !e.boss);
  for (const e of dead) {
    player.kills += 1;
    if (!e.noXp) spawnDrops(e);
  }
  enemies = enemies.filter((e) => (e.hp > 0 || e.boss));

  for (const pu of pickups) {
    pu.update(dt, player, player.magnetRadius);
    if (circleHit(pu.x, pu.y, pu.radius, player.x, player.y, player.radius)) {
      pu.collected = true;
      if (pu.kind === "xp") {
        const levels = player.addXp(pu.data.amount);
        if (levels > 0) onLevelUp(levels);
      } else if (pu.kind === "bossheart") {
        player.hp = player.maxHp; // full heal
        for (const t of EQUIPMENT_TYPES) t.apply(player); // every gem's effect
        player.kills += 50; // the boss counts as 50 kills
        floatingTexts.push(new FloatingText(player.x, player.y - 26, "决心！全属性提升", "#ffffff"));
        settleGame();
      } else {
        pu.data.type.apply(player);
        floatingTexts.push(new FloatingText(player.x, player.y - 26, pu.data.type.label, pu.data.type.color));
      }
    }
  }
  pickups = pickups.filter((pu) => !pu.collected);

  for (const ft of floatingTexts) ft.update(dt);
  floatingTexts = floatingTexts.filter((ft) => !ft.expired);

  if (player.hp - hpBefore > 0.9) healFlash = 0.45;
  if (healFlash > 0) healFlash -= dt;
  // Horror's rage: taking a hit sometimes tints the whole screen red
  if (player.character === "horror" && hpBefore - player.hp > 0.5 && Math.random() < 0.15) {
    hurtFlash = 0.5;
  }
  if (hurtFlash > 0) hurtFlash -= dt;

  if (player.hp <= 0) settleGame();
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

function drawBone(cx, cy, size, angle, sprite = PROJECTILE_BONE) {
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
  return PROJECTILE_BONE;
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
        ctx.save();
        ctx.fillStyle = "#e8f4ff";
        ctx.shadowColor = "#9bd7ff";
        ctx.shadowBlur = 9;
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
      ctx.drawImage(PROJECTILE_BONE, -p.size * 1.8, -p.size / 2, p.size * 3.6, p.size);
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
          drawBone(m.x, m.y, m.size, -Math.PI / 2, PROJECTILE_BONE);
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
          drawBone(b.x, b.y, 22, b.angle, PROJECTILE_BONE);
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
    ctx.save();
    if (CHAR_GLOWS[player.character]) {
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

  drawHud(ctx, WIDTH, player, elapsed, weaponSummary(player), healFlash);
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
    drawTitleScreen(ctx, WIDTH, HEIGHT, [PLAYER_SPRITES.sans]);
  } else if (state === "charselect") {
    drawCharSelect(
      ctx,
      WIDTH,
      HEIGHT,
      CHARACTERS,
      selectedChar,
      PLAYER_SPRITES,
      Object.fromEntries(CHARACTERS.map((c) => [c.id, bestScoreOf(c.id)]))
    );
  } else if (state === "select") {
    drawWeaponSelect(ctx, WIDTH, HEIGHT, currentWeaponList(), selectedWeapon, currentCharacter().name);
  } else if (state === "paused") {
    drawCenterText(
      ctx,
      WIDTH,
      HEIGHT,
      [
        { text: "已 暂 停", font: "bold 32px monospace", color: "#8fd6ff" },
        { text: "按 Z 继续", font: "16px monospace", color: "#ffd166" },
      ],
      -100 // keep clear of the volume control below
    );
    drawVolumeControl(ctx, WIDTH, HEIGHT, bgmVolume);
    drawResumeButton(ctx, WIDTH, HEIGHT);
    drawQuitButton(ctx, WIDTH, HEIGHT);
  } else if (state === "choice") {
    drawChoiceScreen(ctx, WIDTH, HEIGHT, choiceOptions, choiceRerollAvailable);
  } else if (state === "gameover") {
    drawCenterText(ctx, WIDTH, HEIGHT, [
      { text: "GAME OVER", font: "bold 32px monospace", color: "#ff5d73" },
      { text: `得分 ${lastScore}`, font: "bold 24px monospace", color: "#ffd166" },
      {
        text: newRecord ? "★ 新纪录！" : `历史最高 ${lastBest}`,
        font: "14px monospace",
        color: newRecord ? "#7cf28a" : "#9a93ab",
      },
      { text: `存活时间 ${Math.floor(elapsed)} 秒`, font: "16px monospace" },
      { text: `击杀数 ${player.kills}  等级 ${player.level}`, font: "16px monospace" },
      { text: weaponSummary(player), font: "14px monospace", color: "#7ea8ff" },
      { text: "点击画面 或 按空格 返回角色选择", font: "16px monospace", color: "#ffd166" },
    ]);
  } else if (state === "credits") {
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
  hp: player ? Math.round(player.hp) : null,
  px: player ? Math.round(player.x) : null,
  camX: Math.round(camX),
});
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
    fadeAudio(bgm, gameVolTarget(), dt, 1.1);
  } else {
    fadeAudio(bgm, 0, dt, 1.5); // gameover / back to menu
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
