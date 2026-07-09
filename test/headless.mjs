// Headless integration test for the Sans survivor game.
// Stubs the DOM/Audio just enough to import src/main.js and drive real
// frames through the captured requestAnimationFrame callback.
// Usage: node test/headless.mjs [boss]   — "boss" runs the ?boss debug route.

const MODE = process.argv[2] || "normal";

// universal callable proxy: answers any property/call chain, numbers coerce to 0
const universal = new Proxy(function () {}, {
  get: (t, p) => (p === Symbol.toPrimitive ? () => 0 : universal),
  apply: () => universal,
  set: () => true,
  construct: () => universal,
});

const listeners = { window: {}, canvas: {} };
function record(map) {
  return (type, fn) => {
    (map[type] ||= []).push(fn);
  };
}

const canvas = {
  width: 0,
  height: 0,
  getContext: () => universal,
  addEventListener: record(listeners.canvas),
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }),
  style: {},
  setPointerCapture: () => {},
  releasePointerCapture: () => {},
};

globalThis.document = {
  getElementById: () => canvas,
  createElement: () => ({ width: 0, height: 0, getContext: () => universal }),
  addEventListener: () => {},
  visibilityState: "visible",
};

let rafCb = null;
const storage = {};
globalThis.window = {
  addEventListener: record(listeners.window),
  screen: { width: 1440, height: 900 },
  innerWidth: 1440,
  innerHeight: 900,
};
globalThis.localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => {
    storage[k] = String(v);
  },
  removeItem: (k) => delete storage[k],
};
globalThis.location = { search: MODE === "boss" ? "?boss" : "" };
globalThis.performance = { now: () => simNow };
globalThis.requestAnimationFrame = (cb) => {
  rafCb = cb;
};
globalThis.Audio = class {
  constructor(src) {
    this.src = src || "";
    this.volume = 1;
    this.loop = false;
    this.paused = true;
    this.currentTime = 0;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  addEventListener() {}
};
try {
  Object.defineProperty(globalThis, "navigator", { value: { maxTouchPoints: 0 }, configurable: true });
} catch {}

let simNow = 0;

let failures = 0;
function check(name, cond, detail = "") {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

await import(new URL("../src/main.js", import.meta.url));

const dbg = () => window.__dbg();
function key(k) {
  for (const fn of listeners.window.keydown || []) fn({ key: k, preventDefault: () => {} });
}
function keyUp(k) {
  for (const fn of listeners.window.keyup || []) fn({ key: k, preventDefault: () => {} });
}
function frame(ms = 1000 / 30) {
  simNow += ms;
  const cb = rafCb;
  rafCb = null;
  cb(simNow);
}
// run n seconds of game, auto-picking card 1 whenever a choice screen opens
function run(seconds, onFrame) {
  const frames = Math.ceil(seconds * 30);
  for (let i = 0; i < frames; i++) {
    frame();
    if (dbg().state === "choice") key("1");
    if (onFrame && onFrame(dbg())) return;
  }
}

// weapon-module unit checks (evolution rules)
{
  const W = await import(new URL("../src/weapon.js", import.meta.url));
  for (const [id, field, want] of [
    ["bone", "projectiles", 8],
    ["orbit", "count", 12],
    ["axes", "count", 8],
  ]) {
    const inst = W.createWeaponInstance(id);
    check(`${id}: not evolvable at start`, !W.canEvolve(inst));
    inst.tier = 4;
    inst.enhance = 3;
    check(`${id}: evolvable at max tier + 3 stacks`, W.canEvolve(inst));
    inst.evolved = true;
    check(`${id}: evolved tier active`, W.instTier(inst)[field] === want, JSON.stringify(W.instTier(inst)));
    check(`${id}: no longer evolvable`, !W.canEvolve(inst));
    check(`${id}: summary shows evolved name`, W.weaponSummary({ weapons: [inst] }).startsWith("★"));
  }
}

console.log(`--- mode: ${MODE} ---`);
frame(); // first frame after module load

check("boots to title", dbg().state === "title");
key(" "); // title -> charselect
check("charselect", dbg().state === "charselect");
key("Enter"); // -> weapon select
check("weapon select", dbg().state === "select");
key("Enter"); // -> startGame
check("playing", dbg().state === "playing");

if (MODE === "normal") {
  run(2); // intro black 1.5s
  check("intro passed", dbg().introBlack <= 0);
  check("warm-up ring spawned (>=8 enemies)", dbg().enemies >= 8, `got ${dbg().enemies}`);

  // the AFK player dies fast, so verify the early-screen weapon-card
  // guarantee across several fresh runs (screens 1..N of each run count)
  const WEAPON_TITLES = ["获得新武器", "武器品阶提升"];
  const isWeaponCard = (t) => WEAPON_TITLES.includes(t) || t.startsWith("专属强化");
  let checkedScreens = 0;
  let firstDeath = null;
  let bestKills = 0;
  for (let runNo = 1; runNo <= 6 && checkedScreens < 3; runNo++) {
    if (runNo > 1) {
      // gameover -> charselect -> select -> playing
      key(" ");
      key("Enter");
      key("Enter");
    }
    key("ArrowRight"); // hold right: kite instead of standing in the horde
    for (let i = 0; i < 30 * 120; i++) {
      frame();
      const d = dbg();
      if (d.state === "choice") {
        checkedScreens++;
        check(`run${runNo} choice screen has weapon card [${d.choices.join(" | ")}]`, d.choices.some(isWeaponCard));
        key("1");
        if (checkedScreens >= 3) { /* keep playing until death below */ }
      }
      if (d.state === "gameover") {
        if (!firstDeath || !firstDeath.deathBy) firstDeath = dbg();
        bestKills = Math.max(bestKills, d.kills);
        break;
      }
    }
    keyUp("ArrowRight");
  }
  check("checked 3+ early choice screens", checkedScreens >= 3, `got ${checkedScreens}`);
  check("death recap present", firstDeath && typeof firstDeath.deathBy === "string" && firstDeath.deathBy.length > 0, `deathBy=${firstDeath && firstDeath.deathBy}`);
  if (firstDeath) console.log(`      死于:${firstDeath.deathBy}, kills=${firstDeath.kills}, elapsed=${firstDeath.elapsed}s`);
  check("kills accumulated (mowing works)", bestKills > 15, `bestKills=${bestKills}`);
} else {
  // ?boss route: starts 2s before the boss with a survival kit
  run(1);
  check("debug start near boss", dbg().elapsed >= 297, `elapsed=${dbg().elapsed}`);
  check("boss warning active before arrival", dbg().warn === true, `warn=${dbg().warn}`);
  let sawBoss = false;
  let phases = new Set();
  run(200, (d) => {
    if (d.boss) {
      sawBoss = true;
      phases.add(d.boss.split("/")[0]);
    }
    return d.state === "gameover";
  });
  check("boss spawned", sawBoss);
  check("boss progressed past intro", [...phases].some((p) => p !== "intro"), [...phases].join(","));
  console.log(`      boss states seen: ${[...phases].join(", ")}; final=${JSON.stringify(dbg())}`);
}

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
