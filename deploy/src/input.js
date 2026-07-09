const keys = new Set();

const MOVE_KEYS = new Set([
  "w", "a", "s", "d",
  "arrowup", "arrowdown", "arrowleft", "arrowright",
]);

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (MOVE_KEYS.has(k)) e.preventDefault();
  keys.add(k);
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

// ---- touch: floating virtual joystick on the left half of the canvas -------

export const JOY_MAX_R = 90; // in canvas-internal units
let canvasEl = null;
let movementEnabled = false; // only capture the joystick while actually playing
let joystick = null; // { id, ox, oy, x, y } in canvas-internal coords

export function setMovementEnabled(v) {
  movementEnabled = v;
  if (!v) joystick = null;
}

export function getJoystick() {
  return joystick;
}

function toCanvas(touch) {
  const rect = canvasEl.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * (canvasEl.width / rect.width),
    y: (touch.clientY - rect.top) * (canvasEl.height / rect.height),
  };
}

export function initTouch(canvas) {
  canvasEl = canvas;

  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (!movementEnabled || joystick) return;
      for (const t of e.changedTouches) {
        const p = toCanvas(t);
        // only the left ~55% is the movement zone; the right side stays free
        // for tapping the pause / speed buttons
        if (p.x < canvasEl.width * 0.55) {
          joystick = { id: t.identifier, ox: p.x, oy: p.y, x: p.x, y: p.y };
          e.preventDefault();
          break;
        }
      }
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!joystick) return;
      for (const t of e.changedTouches) {
        if (t.identifier !== joystick.id) continue;
        const p = toCanvas(t);
        joystick.x = p.x;
        joystick.y = p.y;
        // floating base: if the finger pulls past the max radius, drag the
        // base along so the stick keeps responding
        const dx = joystick.x - joystick.ox;
        const dy = joystick.y - joystick.oy;
        const d = Math.hypot(dx, dy);
        if (d > JOY_MAX_R) {
          joystick.ox = joystick.x - (dx / d) * JOY_MAX_R;
          joystick.oy = joystick.y - (dy / d) * JOY_MAX_R;
        }
        e.preventDefault();
      }
    },
    { passive: false }
  );

  const end = (e) => {
    if (!joystick) return;
    for (const t of e.changedTouches) {
      if (t.identifier === joystick.id) joystick = null;
    }
  };
  canvas.addEventListener("touchend", end);
  canvas.addEventListener("touchcancel", end);
}

export function getMoveVector() {
  let x = 0;
  let y = 0;
  if (keys.has("w") || keys.has("arrowup")) y -= 1;
  if (keys.has("s") || keys.has("arrowdown")) y += 1;
  if (keys.has("a") || keys.has("arrowleft")) x -= 1;
  if (keys.has("d") || keys.has("arrowright")) x += 1;
  if (x !== 0 || y !== 0) {
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }
  // analog joystick: magnitude scales with how far the stick is pushed
  if (joystick) {
    const dx = joystick.x - joystick.ox;
    const dy = joystick.y - joystick.oy;
    const d = Math.hypot(dx, dy);
    const dead = 10;
    if (d > dead) {
      const m = Math.min(d, JOY_MAX_R) / JOY_MAX_R;
      return { x: (dx / d) * m, y: (dy / d) * m };
    }
  }
  return { x: 0, y: 0 };
}
