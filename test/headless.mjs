// Headless integration test for the Sans survivor game.
// Stubs the DOM/Audio just enough to import src/main.js and drive real
// frames through the captured requestAnimationFrame callback.
// Usage: node test/headless.mjs [boss|clear]
//   boss  — ?boss debug route (boss spawn/warning regression)
//   clear — ?boss=weak route: full boss clear, bossclear choice, rounds

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
globalThis.location = { search: MODE === "boss" ? "?boss" : MODE === "clear" ? "?boss=weak" : "" };
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
    if (dbg().state === "chest") { key("Enter"); key("Enter"); }
    if (dbg().state === "chapter") key("Enter");
    if (onFrame && onFrame(dbg())) return;
  }
}

// endless round coin decay (pure function; round 4+ never pays out)
{
  const S = await import(new URL("../src/spawner.js", import.meta.url));
  check("coin factor round1 = 50%", S.roundCoinFactor(1) === 0.5);
  check("coin factor round2 = 25%", S.roundCoinFactor(2) === 0.25);
  check("coin factor round3 = 10%", S.roundCoinFactor(3) === 0.1);
  check("coin factor round4+ = 0", S.roundCoinFactor(4) === 0 && S.roundCoinFactor(9) === 0);
}

// Canon monster identities and named-elite pacing are pure, deterministic
// rules. The first special elite arrives after six 15s choice screens.
{
  const C = await import(new URL("../src/codex.js", import.meta.url));
  const keys = C.CODEX_MONSTERS.map((m) => m.key);
  const names = C.CODEX_MONSTERS.map((m) => m.name);
  check(
    "codex has 8 base + 10 named elites + 10 round champions",
    C.BASE_MONSTERS.length === 8 && C.ELITE_MONSTERS.length === 10 && C.ROUND_CHAMPIONS.length === 10
  );
  check("codex keys and names are unique", new Set(keys).size === C.CODEX_MONSTERS.length && new Set(names).size === C.CODEX_MONSTERS.length);
  check("狂暴 named elite waits until 1:30", C.eliteTypePool(1, 89) === null && C.eliteTypePool(1, 90).join(",") === "slime");
  check("狂暴 second elite waits until 2:15", C.eliteTypePool(1, 134).length === 1 && C.eliteTypePool(1, 135).join(",") === "slime,bat");
  check("地狱 elites phase in at 3:00 / 3:45", !C.eliteTypePool(2, 179).includes("red") && C.eliteTypePool(2, 180).includes("red") && C.eliteTypePool(2, 225).includes("ghost"));
  check("困难模式余党在 3:00 / 3:45 加入狂暴", !C.eliteTypePool(1, 179).includes("tank") && C.eliteTypePool(1, 180).includes("tank") && C.eliteTypePool(1, 225).includes("orange"));
  check("瀑布与热域精英在地狱 2:30 / 3:30 加入", !C.eliteTypePool(2, 149).includes("blue") && C.eliteTypePool(2, 150).includes("blue") && !C.eliteTypePool(2, 209).includes("purple") && C.eliteTypePool(2, 210).includes("purple"));
  check("无尽第 5 轮仍是皇家守卫", C.championForRound(5).championId === "royalGuards");
  check("无尽第 6/7 轮接犬神融合体与柠檬面包", C.championForRound(6).championId === "endogeny" && C.championForRound(6).hpFactor === 2.3 && C.championForRound(7).championId === "lemonBread" && C.championForRound(7).hpFactor === 2.5);
  check("无尽第 8/9/10 轮顺延旧首领", C.championForRound(8).championId === "mettatonEx" && C.championForRound(9).championId === "glyde" && C.championForRound(10).championId === "soSorry" && C.championForRound(11).championId === "greaterDog");
  check("屠杀 schedule is 30s earlier but never before 1:00", C.eliteTypePool(3, 59) === null && C.eliteTypePool(3, 60).join(",") === "slime" && C.eliteTypePool(3, 195).length === 9);
  check("记忆头在地狱 3:45 / 屠杀 3:15 加入", !C.eliteProfilePool(2, 224).some((m) => m.key === "elite_memoryhead") && C.eliteProfilePool(2, 225).some((m) => m.key === "elite_memoryhead") && C.eliteProfilePool(3, 195).some((m) => m.key === "elite_memoryhead"));
  check("死神鸟在屠杀 4:00 加入", !C.eliteProfilePool(3, 239).some((m) => m.key === "elite_reaper_bird") && C.eliteProfilePool(3, 240).some((m) => m.key === "elite_reaper_bird"));

  const { Enemy } = await import(new URL("../src/entities.js", import.meta.url));
  const scale = { hpMult: 2.8, dmgMult: 2.2, speedMult: 1, xpMult: 1, elite: true, difficultyId: 1 };
  const generic = new Enemy("slime", 0, 0, { ...scale, namedElite: false });
  const named = new Enemy("slime", 0, 0, { ...scale, namedElite: true });
  check("pre-debut gold elite has no named skill", generic.eliteProfile === null && generic.eliteSkillTimer === 0);
  check("named elite gains identity, skill and extra bulk", named.eliteProfile?.key === "elite_final_froggit" && named.eliteSkillTimer > 0 && named.maxHp > generic.maxHp);
  const trueLab = new Enemy("ghost", 0, 0, { ...scale, difficultyId: 3, namedElite: true, eliteProfileKey: "elite_memoryhead" });
  check("duplicate archetype selects explicit elite profile", trueLab.eliteProfile?.key === "elite_memoryhead" && C.eliteProfileFor("ghost", 3).key === "elite_parsnik");
}

// meta-progression unit checks (coins / upgrades / unlocks)
{
  // Use a separate module instance and restore storage afterwards so shop
  // purchases, unlocks and revives never leak into the game-flow tests.
  const storageBeforeMetaTests = { ...storage };
  // the login flower gifted coins at main.js boot — zero the unit instance's
  // starting keys so the absolute assertions below stay meaningful
  storage.coins = "0";
  delete storage.loginFlower;
  delete storage.dailyQuests;
  const M = await import(new URL(`../src/meta.js?unit=${MODE}`, import.meta.url));
  check("wallet starts empty", M.getCoins() === 0);
  const permanentShopTotal = M.UPGRADES.reduce((sum, u) => sum + u.base * ((u.max * (u.max + 1)) / 2), 0);
  const geoTotal = M.UPGRADES.reduce((sum, u) => {
    let tt = 0;
    for (let l = 0; l < u.max; l++) tt += u.base * Math.pow(2, l);
    return sum + tt;
  }, 0);
  check("geometric shop curve totals 13855", geoTotal === 13855, `total=${geoTotal}`);
  M.addCoins(300);
  check("coins added", M.getCoins() === 300);
  check("upgrade cost scales", M.upgradeCost("atk") === 90);
  check("buy succeeds", M.buyUpgrade("atk") && M.upgradeLevel("atk") === 1 && M.getCoins() === 210);
  check("next level costs more", M.upgradeCost("atk") === 180);
  check("cannot overspend", !M.buyUpgrade("reroll") && M.getCoins() === 210);
  const p = { atk: 6, maxHp: 100, hp: 100, moveSpeed: 165, magnetRadius: 90, dmgAmp: 1 };
  M.applyMetaUpgrades(p);
  check("power = independent meta multiplier", Math.abs(p.metaDmg - 1.06) < 1e-9, `metaDmg=${p.metaDmg}`);
  check("hp shop is percentage bulk", p.hpAmp === 1 && p.maxHp === 100); // hp not bought yet in this sequence
  check("sans always unlocked", M.isCharUnlocked("sans"));
  check("ukb locked at zero kills", !M.isCharUnlocked("ukb"));
  check("grandfathered by best score", M.isCharUnlocked("ukb", 500));
  M.recordRun({ kills: 1500, bossKilled: true });
  check("ukb unlocks via kills", M.isCharUnlocked("ukb"));
  check("horror unlocks via boss", M.isCharUnlocked("horror"));
  check("hard still locked", !M.isCharUnlocked("hard"));
  const info = M.charUnlockInfo("hard");
  check("unlock info present", !!info && info.hint.length > 0 && info.progress.length > 0);
  // weapon unlocks (per-character kills)
  check("weapon slots 0-2 free", M.isWeaponUnlocked("sans", 0) && M.isWeaponUnlocked("sans", 2));
  check("weapon slot 3 locked at 0 kills", !M.isWeaponUnlocked("sans", 3));
  M.recordRun({ kills: 300, charId: "sans" });
  check("weapon slot 3 unlocks at 300 char kills", M.isWeaponUnlocked("sans", 3));
  check("weapon slot 4 still locked", !M.isWeaponUnlocked("sans", 4));
  const winfo = M.weaponUnlockInfo("sans", 4);
  check("weapon unlock info present", !!winfo && winfo.progress === "300 / 800", winfo && winfo.progress);
  // difficulty tiers
  check("狂暴 unlocked after first boss", M.isDifficultyUnlocked(1));
  check("地狱 locked until 狂暴 cleared", !M.isDifficultyUnlocked(2));
  check("set difficulty works", M.setDifficulty(1) && M.getDifficulty().id === 1);
  check("difficulty multipliers wired", M.getDifficulty().hpMult === 2.8 && M.getDifficulty().coinMult === 1.6 && M.getDifficulty().xpMult === 1.5);
  check("cannot set locked difficulty", !M.setDifficulty(2));
  M.setDifficulty(0); // restore for the game-flow run below
  // 力量门槛滞后一级: the tier that beats your current wall is always
  // grindable; two tiers ahead never is
  M.addCoins(2000);
  M.buyUpgrade("atk"); // -> Lv2 (Lv1 bought earlier)
  check("Lv3 open after normal clear (grind path)", M.upgradeGate("atk") === null && M.buyUpgrade("atk") && M.upgradeLevel("atk") === 3);
  check("Lv4 gated behind 狂暴 clear", M.upgradeGate("atk") !== null && !M.buyUpgrade("atk"));
  check("QoL upgrades never gated", M.upgradeGate("magnet") === null);
  M.recordRun({ bossKilled: true, difficulty: 1 }); // 狂暴 cleared
  check("Lv4 opens, Lv5 still gated", M.buyUpgrade("atk") && M.upgradeLevel("atk") === 4 && M.upgradeGate("atk") !== null);
  M.spendCoins(2000 - 180 - 360 - 720); // burn surplus: 屠杀-threshold checks below assume poverty
  // new shop items: 行前整备 (start gear) and 重燃决心 (revive)
  M.addCoins(1400); // gear 320 + revives 3×300
  check("gear upgrade buyable", M.buyUpgrade("gear") && M.upgradeLevel("gear") === 1);
  check("revive consumable buyable", M.buyReviveStock() && M.reviveStock() === 1);
  M.buyReviveStock();
  M.buyReviveStock();
  check("revive stock caps at 3", M.reviveCost() === null && !M.buyReviveStock() && M.reviveStock() === 3);
  check("revive consumes one", M.consumeRevive() && M.reviveStock() === 2);
  // cosmetics: 灵魂加护 (buy once, equip toggle, no stats)
  M.addCoins(900);
  check("soul cosmetic buyable", M.buyCosmetic("bravery") && M.cosmeticOwned("bravery"));
  check("bought soul auto-equipped", M.equippedCosmetic()?.id === "bravery");
  check("cannot rebuy owned soul", !M.buyCosmetic("bravery"));
  check("unequip works", M.equipCosmetic(null, "soul") && M.equippedCosmetic() === null);
  check("cannot equip unowned", !M.equipCosmetic("determination"));
  check("secret flower cannot be bought", !M.buyCosmetic("goldenflower"));
  check("secret flower grantable once", M.grantCosmetic("goldenflower") && !M.grantCosmetic("goldenflower"));
  check("granted flower equipped", M.equippedCosmetic()?.id === "goldenflower");
  M.equipCosmetic(null, "soul"); // clear the slot for the independence checks below
  M.addCoins(800);
  check("bone skin buyable into its own slot", M.buyCosmetic("snowdin") && M.equippedBoneSkin()?.id === "snowdin");
  check("bone slot independent of soul slot", M.equippedCosmetic() === null);
  check("title unlocks once", M.unlockTitle("judge") === true && M.unlockTitle("judge") === false);
  check("best title resolves", M.bestTitle()?.id === "judge");
  // 屠杀 (GENOCIDE) gate: hell clear + 2000 banked, then sticky
  check("屠杀 locked before hell clear", !M.isDifficultyUnlocked(3));
  M.recordRun({ bossKilled: true, difficulty: 2 });
  check("屠杀 still locked while poor", !M.isDifficultyUnlocked(3));
  M.addCoins(2500);
  check("屠杀 unlocks with hell clear + 2000 coins", M.isDifficultyUnlocked(3));
  M.spendCoins(2400);
  check("屠杀 unlock sticky after spending", M.isDifficultyUnlocked(3) && M.setDifficulty(3));
  M.setDifficulty(0);
  // 每日悬赏 / 专精 / 连日之花
  const qs = M.getDailyQuests("2099-01-01", ["sans", "ukb"]);
  check("three deterministic quests", qs.length === 3 && JSON.stringify(qs) === JSON.stringify(M.getDailyQuests("2099-01-01", ["sans"])));
  const killsQuest = qs.find((q) => q.kind === "kills" || q.kind === "charKills" || q.kind === "coins");
  const wBeforeQuest = M.getCoins();
  if (killsQuest) {
    const done = M.questEvent(killsQuest.kind, killsQuest.target, { charId: killsQuest.charId || "sans" });
    check("quest completes and pays", done.length >= 1 && M.getCoins() === wBeforeQuest + done.reduce((t, q) => t + q.reward, 0));
    check("quest completes only once", M.questEvent(killsQuest.kind, killsQuest.target, { charId: killsQuest.charId || "sans" }).length === 0);
  }
  check("mastery thresholds", M.masteryOf(119) === 0 && M.masteryOf(120) === 1 && M.masteryOf(480) === 2);
  const f1 = M.claimDailyFlower("2099-01-01", "2098-12-31");
  const f2 = M.claimDailyFlower("2099-01-01", "2098-12-31");
  const f3 = M.claimDailyFlower("2099-01-02", "2099-01-01");
  check("flower gift once per day", f1.coins === 20 && f2.already === true && f2.coins === 0);
  check("flower streak grows next day", f3.days === 2 && f3.coins === 25);
  // codex collection tracking
  M.recordRun({ killsByType: { slime: 10, bat: 3 }, weaponsUsed: ["bone", "orbit"], evolvedIds: ["bone"] });
  const st = M.getStats();
  check("bestiary counts", st.killsByType.slime === 10 && st.killsByType.bat === 3);
  check("weapon codex tracked", st.weaponsUsed.bone === true && st.weaponsUsed.orbit === true);
  check("evolution codex tracked", st.evolved.bone === true && !st.evolved.orbit);

  // Safe-run checkpoint: apply an absolute floor, replay the exact same stale
  // checkpoint, and prove neither coins nor lifetime stats can double.
  const walletBeforeRecovery = M.getCoins();
  const statsBeforeRecovery = JSON.parse(JSON.stringify(M.getStats()));
  const checkpoint = M.saveSafeRunCheckpoint({
    id: `checkpoint-test-${MODE}`,
    coins: 37,
    stageScore: 4321,
    endlessRounds: 2,
    kills: 12,
    bossKilled: true,
    charId: "sans",
    difficulty: 1,
    killsByType: { slime: 7 },
    weaponsUsed: ["bone"],
    evolvedIds: ["bone"],
  });
  const serializedCheckpoint = storage.safeRunCheckpoint_v1;
  check("checkpoint saved", !!checkpoint && !!serializedCheckpoint);
  const MReload = await import(new URL(`../src/meta.js?reload=${MODE}`, import.meta.url));
  check("checkpoint auto-recovers on reload", storage.safeRunCheckpoint_v1 === undefined);
  check("checkpoint restores safe coins", MReload.getCoins() === walletBeforeRecovery + 37);
  check("checkpoint restores boss exactly once", MReload.getStats().bossKills === statsBeforeRecovery.bossKills + 1);
  check("checkpoint restores kills exactly once", MReload.getStats().totalKills === statsBeforeRecovery.totalKills + 12);
  check("checkpoint restores normal best", storage.best_sans === "4321");
  check("checkpoint restores highest round", storage.best_endless_round_sans === "2");
  const onceWallet = MReload.getCoins();
  const onceStats = JSON.stringify(MReload.getStats());
  storage.safeRunCheckpoint_v1 = serializedCheckpoint; // simulate interrupted cleanup
  check("stale checkpoint can be replayed", !!MReload.recoverSafeRunCheckpoint());
  check("checkpoint replay does not duplicate coins", MReload.getCoins() === onceWallet);
  check("checkpoint replay does not duplicate stats", JSON.stringify(MReload.getStats()) === onceStats);
  check("checkpoint removed after recovery", storage.safeRunCheckpoint_v1 === undefined);

  for (const key of Object.keys(storage)) delete storage[key];
  Object.assign(storage, storageBeforeMetaTests);
}

// weapon-module unit checks (evolution rules)
{
  const W = await import(new URL("../src/weapon.js", import.meta.url));
  for (const [id, field, want] of [
    ["bone", "projectiles", 8],
    ["orbit", "count", 12],
    ["axes", "count", 8],
    ["homing", "projectiles", 7],
    ["bomb", "bombs", 5],
    ["beam", "projectiles", 5],
    ["spike", "targets", 7],
    ["laser", "beams", 7],
    ["boomerang", "boomerangs", 6],
    ["bluebind", "targets", 12],
    ["wave", "waves", 9],
    ["cross", "bones", 20],
    ["orbitburst", "count", 9],
    ["shield", "duration", 6.0],
    ["soundwave", "radius", 180],
    ["chain", "chains", 9],
    ["plaser", "beams", 9],
    ["sweep", "radius", 170],
    ["feast", "targets", 7],
    ["slam", "smashes", 10],
    ["quake", "waves", 5],
    ["lasso", "size", 52],
    ["cleave", "combos", 6],
    ["boneringH", "bones", 32],
    ["dash", "dashes", 9],
    ["splitbone", "split", 14],
    ["bonemark", "targets", 8],
    ["megabone", "rings", 8],
    ["orb", "orbs", 9],
    ["gaster", "count", 9],
    ["ringlaser", "lasers", 120],
    ["turret", "bones", 20],
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
check("game-flow storage isolated (only day-1 flower gift banked)", dbg().wallet === 20, `wallet=${dbg().wallet}`);

// UI smoke: tap into the codex and the shop, render a frame in each, tap back
function tap(x, y) {
  for (const fn of listeners.canvas.pointerup || [])
    fn({ clientX: x, clientY: y, isPrimary: true, button: 0, preventDefault: () => {} });
}
tap(71, 565); // ☰ 菜单
tap(134, 338); // ⚔ 武器图鉴 (drawer item 4)
check("weapon book opens", dbg().state === "weaponbook");
frame(); // render list + detail table (catches formatting errors)
key("ArrowRight"); // switch character tab
key("ArrowDown"); // move selection
frame();
tap(84, 560); // back
check("weapon book closes", dbg().state === "title");
tap(71, 565); // ☰ 菜单
tap(134, 476); // 图鉴 (drawer item 1)
check("codex opens", dbg().state === "codex");
frame(); // draws the codex screen (catches reference errors)
tap(84, 560); // back
check("codex closes", dbg().state === "title");
tap(71, 565); // ☰ 菜单
tap(134, 384); // 📜 悬赏 (drawer item 3)
check("quests screen opens", dbg().state === "quests");
frame(); // render it once
tap(84, 560); // back
check("quests screen closes", dbg().state === "title");
tap(71, 565); // ☰ 菜单
tap(134, 430); // ❀ 回响 (drawer item 2)
check("echo field opens", dbg().state === "echoes");
frame(); // render the flower field once
tap(84, 560); // back
check("echo field closes", dbg().state === "title");
tap(71, 565); // ☰ 菜单
tap(134, 522); // 强化商店 (drawer item 0)
check("shop opens", dbg().state === "shop");
frame();
tap(84, 560); // back
check("shop closes", dbg().state === "title");
frame();
key(" "); // title -> charselect
check("charselect", dbg().state === "charselect");
key("Enter"); // -> weapon select
check("weapon select", dbg().state === "select");
key("Enter"); // -> startGame
check("playing", dbg().state === "playing");

if (MODE === "normal") {
  run(2); // intro black 1.5s
  check("intro passed", dbg().introBlack <= 0);
  check("warm-up party spawned (>=6 enemies)", dbg().enemies >= 6, `got ${dbg().enemies}`);

  // the AFK player dies fast, so verify the early-screen weapon-card
  // guarantee across several fresh runs (screens 1..N of each run count)
  const WEAPON_TITLES = ["获得新武器", "武器品阶提升"];
  const isWeaponCard = (t) => WEAPON_TITLES.includes(t) || t.startsWith("专属强化");
  let checkedScreens = 0;
  let firstDeath = null;
  let bestKills = 0;
  let sawSavepoint = false; // 开局存档点箴言 should type out in the opening seconds
  for (let runNo = 1; runNo <= 6 && checkedScreens < 3; runNo++) {
    if (runNo > 1) {
      // gameover -> charselect -> select -> playing
      key(" ");
      key("Enter");
      key("Enter");
    }
    key("ArrowRight"); // hold right: kite instead of standing in the horde
    let runScreens = 0;
    let kiting = true;
    for (let i = 0; i < 30 * 180; i++) {
      frame();
      const d = dbg();
      if (d.savepoint) sawSavepoint = true;
      // once the guarantee screens are checked, stop kiting so the AFK
      // player actually dies (meta upgrades made the kiter near-immortal)
      if (kiting && (runScreens >= 3 || i > 30 * 50)) {
        keyUp("ArrowRight");
        kiting = false;
      }
      if (d.state === "chest") { key("Enter"); key("Enter"); }
      if (d.state === "choice") {
        runScreens++;
        // the weapon-card guarantee only covers the first 3 screens of a run
        if (runScreens <= 3) {
          checkedScreens++;
          check(`run${runNo} screen${runScreens} has weapon card [${d.choices.join(" | ")}]`, d.choices.some(isWeaponCard));
        }
        key("1");
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
  check("savepoint aphorism shown at run start", sawSavepoint);
  check(
    "killer death line present",
    firstDeath && typeof firstDeath.deathLine === "string" && firstDeath.deathLine.startsWith("* "),
    `deathLine=${firstDeath && firstDeath.deathLine}`,
  );
  check(
    "LOVE verdict present at settlement",
    firstDeath && Array.isArray(firstDeath.loveVerdict) && firstDeath.loveVerdict.length >= 1,
    `loveVerdict=${firstDeath && JSON.stringify(firstDeath.loveVerdict)}`,
  );
  check("kills accumulated (mowing works)", bestKills > 15, `bestKills=${bestKills}`);
  check("first-death echo unlocked", (JSON.parse(storage.metaEchoes || "{}").stay || false) === true, storage.metaEchoes);
  // share button: tapping it must not leave the gameover card nor crash
  tap(99, 560); // 分享战绩
  check("share tap stays on gameover", dbg().state === "gameover");
  {
    // character echoes: 8 entries, unique ids, mastery-gated unlock works
    const E = await import(new URL(`../src/echo.js?unit=${MODE}`, import.meta.url));
    check("18 echoes total, ids unique", E.ALL_ECHOES.length === 18 && new Set(E.ALL_ECHOES.map((e) => e.id)).size === 18);
    check("char echo unlockable once", E.unlockEcho("horror1") === true && E.unlockEcho("horror1") === false);
    check("char echo joins quote pool", typeof E.randomEchoQuote() === "string");
  }
  const dEnd = dbg();
  check("coins earned and banked", dEnd.lastRunCoins > 0 && dEnd.wallet > 0, `last=${dEnd.lastRunCoins} wallet=${dEnd.wallet}`);

  // 🏠 direct home from the settlement card
  tap(861, 560); // home button (bottom-right)
  check("home button returns to title", dbg().state === "title");
  tap(221, 565); // ✦ 每日挑战 button
  check("daily intro shows first", dbg().state === "dailyintro", dbg().state);
  frame(); // render the intro screen once (catches reference errors)
  tap(610, 371); // 开始挑战
  check("daily run starts", dbg().state === "playing" && dbg().daily === true, JSON.stringify(dbg()));
  key("ArrowRight");
  run(30); // play a slice of the daily run…
  keyUp("ArrowRight");
  key("z"); // …then settle deterministically: pause -> quit
  tap(480, 423); // quit button (works no matter how strong the build is)
  check("daily settled", dbg().state === "gameover" && dbg().daily === false);
  check("daily best stored", Object.keys(storage).some((k) => k.startsWith("daily_")));
} else if (MODE === "clear") {
  // ?boss=weak route: actually beat the boss, then exercise the boss-clear
  // choice, the 90s judgement rounds and every settlement outcome.
  const held = new Set();
  const hold = (k) => { if (!held.has(k)) { held.add(k); key(k); } };
  const release = (k) => { if (held.has(k)) { held.delete(k); keyUp(k); } };
  const releaseAll = () => { for (const k of [...held]) release(k); };
  function steer(tx, ty, px, py) {
    if (tx > px + 10) { hold("ArrowRight"); release("ArrowLeft"); }
    else if (tx < px - 10) { hold("ArrowLeft"); release("ArrowRight"); }
    else { release("ArrowRight"); release("ArrowLeft"); }
    if (ty > py + 10) { hold("ArrowDown"); release("ArrowUp"); }
    else if (ty < py - 10) { hold("ArrowUp"); release("ArrowDown"); }
    else { release("ArrowDown"); release("ArrowUp"); }
  }
  // play until the heart is taken and the bossclear screen appears
  function reachBossClear(capSec = 360) {
    for (let i = 0; i < 30 * capSec; i++) {
      frame();
      const d = dbg();
      if (d.state === "choice") key("1");
      if (d.state === "chest") { key("Enter"); key("Enter"); }
      // chase the heart once it drops; otherwise hug the boss so weapons
      // target it instead of the summons
      if (d.heart) steer(d.heart.x, d.heart.y, d.px, d.py);
      else if (d.bossX !== null) {
        // hug the boss horizontally but stay off the walls vertically —
        // getting pinned in a corner is what kills the runner in phase 2
        const ty = Math.max(230, Math.min(470, d.bossY));
        steer(d.bossX, ty, d.px, d.py);
      }
      else releaseAll();
      if (d.state === "bossclear") { releaseAll(); return true; }
      if (d.state === "gameover") { releaseAll(); return false; }
    }
    releaseAll();
    return false;
  }
  function restart() {
    key(" "); // gameover -> charselect
    key("Enter");
    key("Enter"); // -> playing (?boss=weak re-applies)
  }

  const stageScores = [];

  // ---- run A: clear the boss, leave with the loot (victory) ----------------
  check("run A reaches bossclear (not auto-endless)", reachBossClear(), JSON.stringify(dbg()));
  let d = dbg();
  check("bossclear: endless NOT started", d.endless === false && d.round === 0, JSON.stringify(d));
  check("bossclear: stage snapshot taken", d.stageScore > 0 && d.bossDefeated === true);
  check("bossclear: safe checkpoint written", !!storage.safeRunCheckpoint_v1);
  stageScores.push(d.stageScore);
  tap(350, 371); // “带着战利品离开”
  d = dbg();
  // 审判纪元: the first victory ever opens chapter ch1 before the results
  check("A: first victory opens chapter ch1", d.state === "chapter" && d.chapter === "ch1", JSON.stringify({ state: d.state, chapter: d.chapter }));
  for (let i = 0; i < 40 && dbg().state === "chapter"; i++) key("Enter"); // type out + advance every line
  check("A: chapter marked seen", JSON.parse(storage.metaChapters || "{}").ch1 === true, storage.metaChapters);
  d = dbg();
  check("A: victory settlement", d.state === "gameover" && d.outcome === "victory", d.outcome);
  check("A: no death cause on victory", d.deathBy === null);
  check("A: normal best = stage score", storage.best_sans === String(stageScores[0]), storage.best_sans);
  check("A: no endless best written", storage.best_endless_sans === undefined);
  check("A: coins banked", d.lastRunCoins > 0 && d.wallet > 0, `last=${d.lastRunCoins}`);
  check("A: normal settlement clears checkpoint", storage.safeRunCheckpoint_v1 === undefined);

  // ---- run B: continue into rounds, clear round 1, enter round 2, quit -----
  restart();
  check("run B reaches bossclear", reachBossClear(), JSON.stringify(dbg()));
  stageScores.push(dbg().stageScore);
  key("ArrowRight"); // select “继续接受审判”
  key("Enter");
  d = dbg();
  check("B: endless starts only after choosing continue", d.state === "playing" && d.endless === true && d.round === 1, JSON.stringify(d));
  check("B: round1 coin factor 50%", d.coinFactor === 0.5);
  frame(); // one tick so the queued onboarding tip becomes active
  check("B: endless onboarding tip shown once", storage.tip_endless === "1" && dbg().tip === "什么是无尽审判？", `tip=${dbg().tip}`);
  // survive round 1 by kiting right; the wrapped-ahead champion gets mowed
  hold("ArrowRight");
  let sawBossAlive = false;
  for (let i = 0; i < 30 * 300 && dbg().state !== "roundclear"; i++) {
    frame();
    const dd = dbg();
    if (dd.state === "choice") key("1");
    if (dd.state === "chest") { key("Enter"); key("Enter"); }
    if (dd.roundBossAlive) sawBossAlive = true;
    if (dd.state === "gameover") break;
  }
  releaseAll();
  d = dbg();
  check("B: round champion spawned", sawBossAlive);
  check("B: roundclear reached (champion down + time up)", d.state === "roundclear", JSON.stringify(d));
  const coinsBeforeBank = d.runCoins;
  const pending1 = d.pending;
  key("ArrowRight"); // select “进入下一轮”
  key("Enter");
  d = dbg();
  check("B: round 2 begins", d.state === "playing" && d.round === 2, JSON.stringify(d));
  check("B: round1 pending banked", d.runCoins === coinsBeforeBank + pending1 && d.pending === 0, `runCoins=${d.runCoins}`);
  check("B: round2 coin factor 25%", d.coinFactor === 0.25);
  window.__test.grantPendingCoins(17);
  d = dbg();
  const safeBeforePauseQuit = d.runCoins;
  check("B: deterministic pending pot prepared", d.pending === 17, `pending=${d.pending}`);
  const savedRoundCheckpoint = JSON.parse(storage.safeRunCheckpoint_v1);
  // the checkpoint is written at the instant the round completes; a coin
  // magneted in that same frame may land just after it, so assert bounds:
  // never above the banked total (the fresh 17-pending must be excluded)
  check(
    "B: checkpoint excludes unfinished-round pending",
    savedRoundCheckpoint.walletFloor <= d.wallet + safeBeforePauseQuit &&
      savedRoundCheckpoint.walletFloor > d.wallet,
    `floor=${savedRoundCheckpoint.walletFloor} wallet=${d.wallet} safe=${safeBeforePauseQuit} pending=${d.pending}`
  );
  key("z"); // pause mid-round…
  tap(480, 423); // …and quit: voluntary extraction
  d = dbg();
  check("B: mid-round quit = retreat", d.state === "gameover" && d.outcome === "retreat", d.outcome);
  check("B: retreat shows no death cause", d.deathBy === null);
  check("B: pause retreat forfeits unfinished pending", d.lastRunCoins === safeBeforePauseQuit, `last=${d.lastRunCoins}`);
  check("B: rounds cleared recorded", d.roundsCleared === 1, `cleared=${d.roundsCleared}`);
  check("B: endless best written", storage.best_endless_sans !== undefined, storage.best_endless_sans);
  check("B: highest endless round written", storage.best_endless_round_sans === "1", storage.best_endless_round_sans);
  check("B: retreat settlement clears checkpoint", storage.safeRunCheckpoint_v1 === undefined);

  // ---- run C: continue, then stand still and die (endlessDeath) ------------
  restart();
  check("run C reaches bossclear", reachBossClear(), JSON.stringify(dbg()));
  stageScores.push(dbg().stageScore);
  const coinsAtClear = dbg().runCoins; // pre-boss coins + bounty: always safe
  key("ArrowRight");
  key("Enter"); // continue into round 1
  window.__test.grantPendingCoins(23);
  const safeBeforeDeath = dbg().runCoins;
  check("C: deterministic pending pot prepared", dbg().pending === 23);
  window.__test.forceDeath();
  frame();
  d = dbg();
  check("C: died in endless = endlessDeath", d.state === "gameover" && d.outcome === "endlessDeath", d.outcome);
  check("C: death cause shown", d.deathBy === "测试伤害", `deathBy=${d.deathBy}`);
  check(
    "C: death keeps safe coins and forfeits pending pot",
    d.lastRunCoins === safeBeforeDeath && d.lastRunCoins >= coinsAtClear,
    `last=${d.lastRunCoins} safe=${safeBeforeDeath} safeBase=${coinsAtClear}`
  );
  check("C: death settlement clears checkpoint", storage.safeRunCheckpoint_v1 === undefined);

  // ---- run D: a completed-round retreat keeps that round's pot -------------
  restart();
  check("run D reaches bossclear", reachBossClear(), JSON.stringify(dbg()));
  stageScores.push(dbg().stageScore);
  key("ArrowRight");
  key("Enter");
  hold("ArrowRight");
  for (let i = 0; i < 30 * 300 && dbg().state !== "roundclear"; i++) {
    frame();
    if (dbg().state === "choice") key("1");
    if (dbg().state === "chest") { key("Enter"); key("Enter"); }
    if (dbg().state === "gameover") break;
  }
  releaseAll();
  check("D: completed round reaches retreat choice", dbg().state === "roundclear", JSON.stringify(dbg()));
  window.__test.grantPendingCoins(19);
  const safeBeforeRoundRetreat = dbg().runCoins;
  const completedRoundPot = dbg().pending;
  tap(350, 371); // “撤离并结算”
  d = dbg();
  check("D: round-end retreat keeps completed pot", d.lastRunCoins === safeBeforeRoundRetreat + completedRoundPot);
  check("D: round-end retreat has no death cause", d.outcome === "retreat" && d.deathBy === null);
  check("D: round-end settlement clears checkpoint", storage.safeRunCheckpoint_v1 === undefined);

  check(
    "normal best never inflated by endless",
    parseInt(storage.best_sans, 10) === Math.max(...stageScores),
    `best=${storage.best_sans} stages=${stageScores.join(",")}`
  );
  console.log(`      stages=${stageScores.join(",")} endlessBest=${storage.best_endless_sans}`);
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
