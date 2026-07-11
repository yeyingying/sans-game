// 8-bit style sound effects, synthesized with WebAudio — no audio assets.
// Browsers only allow an AudioContext to start inside a user gesture, so
// initSfx() is called from the pointer/keyboard handlers in main.js; every
// play function silently no-ops until then (and in headless test runs).

let ac = null;
let master = null;
let volume = 0.7;

export function initSfx() {
  if (ac) {
    if (ac.state === "suspended") ac.resume().catch(() => {});
    return;
  }
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = volume;
  master.connect(ac.destination);
}

export function setSfxVolume(v) {
  volume = Math.min(1, Math.max(0, v));
  if (master) master.gain.value = volume;
}

// per-key rate limit so rapid-fire weapons don't stack into white noise
const lastAt = {};
function throttled(key, gap) {
  if (!ac) return true;
  const now = ac.currentTime;
  if (lastAt[key] !== undefined && now - lastAt[key] < gap) return true;
  lastAt[key] = now;
  return false;
}

// one oscillator blip with a pitch slide and an exponential fade-out
function blip({ type = "square", from = 440, to = from, dur = 0.08, gain = 0.2, delay = 0 }) {
  if (!ac || volume <= 0) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(from, 1), t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// short white-noise burst for impact texture
function noiseBurst({ dur = 0.12, gain = 0.2, delay = 0 } = {}) {
  if (!ac || volume <= 0) return;
  const t0 = ac.currentTime + delay;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(g);
  g.connect(master);
  src.start(t0);
}

// menu button tap: single soft tick
export function sfxClick() {
  blip({ type: "triangle", from: 840, dur: 0.05, gain: 0.12 });
}

// weapon lands on an enemy: tiny quiet tick, heavily throttled
export function sfxHit() {
  if (throttled("hit", 0.055)) return;
  blip({ from: 480 + Math.random() * 120, to: 260, dur: 0.045, gain: 0.045 });
}

// enemy dies: satisfying downward pop; bigger batches get a second layer
export function sfxKill(count = 1) {
  if (throttled("kill", 0.05)) return;
  blip({ from: 720 + Math.random() * 80, to: 160, dur: 0.08, gain: 0.1 });
  if (count >= 3) blip({ type: "triangle", from: 340, to: 90, dur: 0.12, gain: 0.11, delay: 0.02 });
}

// xp soul absorbed: soft rising tick whose pitch climbs while souls
// keep streaming in (coin-cascade feel), resetting after a quiet beat
let pickupCombo = 0;
let lastPickupAt = -10;
export function sfxPickup() {
  if (!ac) return;
  const now = ac.currentTime;
  pickupCombo = now - lastPickupAt > 0.8 ? 0 : Math.min(pickupCombo + 1, 20);
  lastPickupAt = now;
  if (throttled("pickup", 0.045)) return;
  const f = 880 * Math.pow(1.045, pickupCombo);
  blip({ type: "triangle", from: f, to: f * 1.6, dur: 0.05, gain: 0.055 });
}

// coin collected: bright little ching
export function sfxCoin() {
  if (throttled("coin", 0.05)) return;
  blip({ from: 1319, dur: 0.05, gain: 0.07 });
  blip({ from: 1760, dur: 0.09, gain: 0.06, delay: 0.05 });
}

// Undertale typewriter voice blip
export function sfxType() {
  if (throttled("type", 0.03)) return;
  blip({ type: "square", from: 520 + Math.random() * 240, dur: 0.022, gain: 0.045 });
}

// mystery chest: slot-reel tick, pitch follows the spin
export function sfxChestTick(progress = 0) {
  blip({ type: "square", from: 300 + progress * 500, dur: 0.03, gain: 0.08 });
}

// chest slams down: heavy thump
export function sfxChestLand() {
  blip({ type: "sine", from: 120, to: 45, dur: 0.18, gain: 0.3 });
  noiseBurst({ dur: 0.12, gain: 0.14 });
}

// chest opens: bright unlatch
export function sfxChestOpen(jackpot = 0) {
  blip({ from: 660, dur: 0.08, gain: 0.16 });
  blip({ from: 990, dur: 0.12, gain: 0.15, delay: 0.08 });
  if (jackpot >= 1) blip({ type: "triangle", from: 1320, dur: 0.2, gain: 0.16, delay: 0.18 });
}

// monster candy: soft sweet chime
export function sfxCandy() {
  blip({ type: "triangle", from: 740, dur: 0.06, gain: 0.12 });
  blip({ type: "triangle", from: 1108, dur: 0.14, gain: 0.1, delay: 0.06 });
}

// elite goes down: deep two-layer boom
export function sfxEliteDown() {
  blip({ type: "sawtooth", from: 200, to: 40, dur: 0.25, gain: 0.2 });
  noiseBurst({ dur: 0.16, gain: 0.11 });
  blip({ type: "triangle", from: 500, to: 120, dur: 0.18, gain: 0.13, delay: 0.03 });
}

// low-hp heartbeat: lub-dub
export function sfxHeartbeat() {
  blip({ type: "sine", from: 72, to: 50, dur: 0.11, gain: 0.34 });
  blip({ type: "sine", from: 62, to: 44, dur: 0.13, gain: 0.28, delay: 0.16 });
}

// equipment gem: classic two-note coin
export function sfxEquip() {
  blip({ from: 988, dur: 0.06, gain: 0.16 });
  blip({ from: 1319, dur: 0.16, gain: 0.16, delay: 0.06 });
}

// level up: quick major arpeggio
export function sfxLevelUp() {
  if (throttled("levelup", 0.3)) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => blip({ type: "triangle", from: f, dur: 0.1, gain: 0.16, delay: i * 0.055 }));
}

// upgrade card confirmed: two-tone accept
export function sfxChoice() {
  blip({ from: 660, dur: 0.07, gain: 0.15 });
  blip({ from: 990, dur: 0.12, gain: 0.15, delay: 0.07 });
}

// player takes damage: low crunch + noise
export function sfxHurt() {
  if (throttled("hurt", 0.18)) return;
  blip({ from: 140, to: 60, dur: 0.16, gain: 0.24 });
  noiseBurst({ dur: 0.1, gain: 0.13 });
}

// kill-streak milestone: pitch climbs with each tier reached
export function sfxStreak(tier = 0) {
  const base = 520 * Math.pow(1.13, Math.min(tier, 10));
  blip({ type: "triangle", from: base, to: base * 1.5, dur: 0.12, gain: 0.16 });
  blip({ type: "square", from: base * 2, dur: 0.05, gain: 0.08, delay: 0.1 });
}

// boss incoming: ominous two-tone siren
export function sfxAlarm() {
  blip({ type: "sawtooth", from: 220, dur: 0.28, gain: 0.16 });
  blip({ type: "sawtooth", from: 174, dur: 0.32, gain: 0.16, delay: 0.3 });
}

// UT death: the soul cracks, then shatters
export function sfxShatter() {
  blip({ type: "square", from: 880, to: 640, dur: 0.09, gain: 0.22 }); // crack
  blip({ type: "square", from: 620, to: 180, dur: 0.5, gain: 0.2, delay: 0.55 }); // shatter fall
  noiseBurst({ dur: 0.22, gain: 0.14, delay: 0.55 });
}

// boss heart taken: victory fanfare
export function sfxFanfare() {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => blip({ type: "triangle", from: f, dur: 0.16, gain: 0.18, delay: i * 0.09 }));
  blip({ type: "square", from: 1568, dur: 0.4, gain: 0.12, delay: 0.45 });
}
