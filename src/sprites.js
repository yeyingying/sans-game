// Low-res "pixel art" is drawn onto small offscreen canvases, then blitted at
// integer-ish scale with image smoothing disabled so it stays crisp/blocky.

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function drawRects(ctx, rects) {
  for (const [x, y, w, h, color] of rects) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
}

function sprite(w, h, rects) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  drawRects(ctx, rects);
  return c;
}

function diamondSprite(size, color, shadeColor) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const mid = size / 2;
  for (let y = 0; y < size; y++) {
    const distFromMid = Math.abs(y - mid + 0.5);
    const halfWidth = mid - distFromMid;
    if (halfWidth <= 0) continue;
    ctx.fillStyle = y < mid ? color : shadeColor;
    ctx.fillRect(Math.round(mid - halfWidth), y, Math.round(halfWidth * 2), 1);
  }
  return c;
}

// ---- Shared 12px UI icon language -----------------------------------------
// System emoji render differently on every phone and clash with the game's
// hard pixel edges. These tiny canvases are the single source of truth for
// menus, rewards, HUD markers and status labels.
function iconFromMap(rows, palette) {
  const h = rows.length;
  const w = Math.max(...rows.map((row) => row.length));
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const color = palette[rows[y][x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

const UI_INK = "#0a0810";
const UI_WHITE = "#f2ead8";
const UI_GOLD = "#ffd166";
const UI_GOLD_DARK = "#b77a2a";
const UI_BLUE = "#8fd6ff";
const UI_PURPLE = "#c59bff";
const UI_RED = "#ff5d73";
const UI_GREEN = "#7cf28a";

const uiIcon = (rows, colors = {}) => iconFromMap(rows, {
  K: UI_INK,
  W: UI_WHITE,
  G: UI_GOLD,
  g: UI_GOLD_DARK,
  B: UI_BLUE,
  P: UI_PURPLE,
  R: UI_RED,
  V: UI_GREEN,
  ...colors,
});

export const ICONS = Object.freeze({
  coin: uiIcon([
    "....KKKK....", "..KKGGGGKK..", ".KGGGGGGGGK.", "KGGGgGGgGGGK",
    "KGGgGGGGGGGK", "KGGGGGGgGGGK", "KGGGGGGgGGGK", "KGGgGGGgGGGK",
    "KGGGgggGGGGK", ".KGGGGGGGGK.", "..KKGGGGKK..", "....KKKK....",
  ]),
  lock: uiIcon([
    "............", "....KKKK....", "...KWWWWK...", "..KW....WK..",
    "..KW....WK..", ".KKKKKKKKKK.", ".KGGGGGGGGK.", ".KGGGKKGGGK.",
    ".KGGGKKGGGK.", ".KGGGGGGGGK.", ".KKKKKKKKKK.", "............",
  ]),
  pie: uiIcon([
    "............", "....RRRR....", "..RRGGGGRR..", ".RGGgGgGgGR.",
    "RGgGgGgGgGGR", "KGGGGGGGGGGK", ".KggggggggK.", "..KKggggKK..",
    "...KggggK...", "....KggK....", ".....KK.....", "............",
  ], { R: "#ff8fc7" }),
  hotdog: uiIcon([
    "............", "............", "..KKRRRRKK..", ".KggRRRRggK.",
    "KggRRGGRRggK", "KggRRGRRRggK", "KggRRGGRRggK", "KggRRRRRRggK",
    ".KggRRRRggK.", "..KKRRRRKK..", "............", "............",
  ], { R: "#d85b45", g: "#e6a158" }),
  tip: uiIcon([
    ".....GG.....", "..G..GG..G..", "...GGGGGG...", "..GGWWWWGG..",
    "..GWWWWWWG..", "..GGWWWWGG..", "...GGWWGG...", "....KWWK....",
    "....KGGK....", "....KGGK....", ".....KK.....", "............",
  ]),
  quest: uiIcon([
    "..KKKKKKKK..", ".KWWWWWWWWK.", ".KWKKKKKWWK.", ".KWWWWWWWWK.",
    ".KWKKKKWWWK.", ".KWWWWWWWWK.", ".KWKKKWWWWK.", ".KWWWWWWWWK.",
    ".KWWWWWWWWK.", "..KKKKKKKWK.", ".........KK.", "............",
  ]),
  weapon: uiIcon([
    // 剑身用奶白(深墨色贴深色卡面会隐形,2026-07-13 用户点名),护手保持金
    "W..........W", "WW........WW", ".WW......WW.", "..WW....WW..",
    "...WW..WW...", "....WWWW....", "....WWWW....", "...WW..WW...",
    "..WW....WW..", ".GW......WG.", "GG........GG", "G..........G",
  ]),
  flower: uiIcon([
    "....BB......", "...BWWB.....", ".BBWWWWBB...", "BWWWGGWWWB..",
    ".BWWGGWWB...", "..BBGGBB....", "....VV......", "....VV......",
    "..V.VV.V....", ".V..VV..V...", "....VV......", "............",
  ]),
  save: uiIcon([
    ".KKKKKKKKKK.", ".KBBBBBBBBK.", ".KBKKKKKBBK.", ".KBKWWWKBBK.",
    ".KBKKKKKBBK.", ".KBBBBBBBBK.", ".KBBKKKKBBK.", ".KBKWWWWKBK.",
    ".KBKWWWWKBK.", ".KBKWWWWKBK.", ".KKKKKKKKKK.", "............",
  ]),
  daily: uiIcon([
    ".....P......", ".....P......", "..P..P..P...", "...PPPPP....",
    ".PPPPWPPPPP.", "...PPWPP....", "..PPWWWPP...", ".PPWWWWWPP..",
    "...PPWPP....", "....PPP.....", ".....P......", "............",
  ]),
  leaderboard: uiIcon([
    ".....GG.....", "....GGGG....", "...GGGGGG...", "....KGGK....",
    "....KGGK....", "..KKKGGKKK..", "..KGGGGGGK..", "..KKKKKKKK..",
    "....KGGKKKK.", ".KKKKGGKGGK.", ".KGGGGGKGGK.", ".KKKKKKKKKK.",
  ]),
  edit: uiIcon([
    ".........KK.", "........KGGK", ".......KGGK.", "......KGGK..",
    ".....KGGK...", "....KGGK....", "...KGGK.....", "..KGGK......",
    ".KGGK.......", ".KGK........", ".KK.........", "............",
  ]),
  copy: uiIcon([
    "...KKKKKKK..", "...KWWWWWK..", "...KWKKKWK..", ".KKKKKKKWK..",
    ".KWWWWKKWK..", ".KWKKKWWKK..", ".KWWWWWWWK..", ".KWKKKKWWK..",
    ".KWWWWWWWK..", ".KWWWWWWWK..", ".KKKKKKKKK..", "............",
  ]),
  skull: uiIcon([
    "...KKKKKK...", "..KWWWWWWK..", ".KWWWWWWWWK.", ".KWKKWWKKWK.",
    ".KWKKWWKKWK.", ".KWWKKKKWWK.", "..KWWKKWWK..", "...KWWWWK...",
    "...KWKWK....", "...KKKKKK...", "............", "............",
  ]),
  relic: uiIcon([
    ".....P......", "....PPP.....", "...PPWPP....", "..PPWWWPP...",
    ".PPWWWWWPP..", "PPWWWWWWWPP.", ".PPWWWWWPP..", "..PPWWWPP...",
    "...PPWPP....", "....PPP.....", ".....P......", "............",
  ]),
  awakening: uiIcon([
    ".....G......", ".....G......", "..G..G..G...", "...G.G.G....",
    "GGGGGWGGGGG.", "....GWG.....", "...GWWWG....", "..GGGWGGG...",
    "....G.G.....", "...G...G....", "............", "............",
  ]),
  heart: uiIcon([
    "............", "..RR....RR..", ".RRRR..RRRR.", "RRRRRRRRRRRR",
    "RRRRRRRRRRRR", ".RRRRRRRRRR.", "..RRRRRRRR..", "...RRRRRR...",
    "....RRRR....", ".....RR.....", "............", "............",
  ]),
  shop: uiIcon([
    "...KKKKKK...", "..KG....GK..", "..KG....GK..", ".KKKKKKKKKK.",
    ".KGGGGGGGGK.", ".KGGKGGKGGK.", ".KGGKGGKGGK.", ".KGGGGGGGGK.",
    ".KGGKKKKGGK.", ".KGGK..KGGK.", ".KKKK..KKKK.", "............",
  ]),
  home: uiIcon([
    ".....BB.....", "....BBBB....", "...BBWWBB...", "..BBWWWWBB..",
    ".BBWWWWWWBB.", "BBWWWWWWWWBB", "..KWWWWWWK..", "..KWWKKWWK..",
    "..KWWKKWWK..", "..KWWKKWWK..", "..KKKKKKKK..", "............",
  ]),
  share: uiIcon([
    ".....BB.....", "....BBBB....", "...BBWWBB...", ".....BB.....",
    ".....BB.....", ".....BB.....", ".KKKKBBKKKK.", ".KWWWWWWWWK.",
    ".KWWWWWWWWK.", ".KWWWWWWWWK.", ".KKKKKKKKKK.", "............",
  ]),
  chest: uiIcon([
    "............", "...KKKKKK...", "..KGGGGGGK..", ".KGGggggGGK.",
    ".KKKKKKKKKK.", ".KGGGGGGGGK.", ".KGGGKKGGGK.", ".KGGGKGGGGK.",
    ".KGGGGGGGGK.", ".KKKKKKKKKK.", "............", "............",
  ]),
  refresh: uiIcon([
    "....BBBB....", "..BBBBBBBB..", ".BBB....BBB..", "BBB......BB..",
    "BB.......B..", "BB..........", "BB....BBB...", "BB......BB..",
    ".BB....BBB..", "..BBBBBBBB..", "....BBBB....", "............",
  ]),
  pact: uiIcon([
    ".....G......", "....GGG.....", ".....G......", "..KKKGKKK...",
    ".K...G...K..", "KK...G...KK.", ".GG..G..GG..", "..GG.G.GG...",
    "...GGGGG....", "....GGG.....", ".....G......", "............",
  ]),
  difficulty: uiIcon([
    "............", "....RRRR....", "...RWWWWR...", "..RW....WR..",
    ".RW...RR.WR.", ".RW..R...WR.", ".RW.R....WR.", "..RWWWWWWR..",
    "...RRRRRR...", "....R..R....", "....RRRR....", "............",
  ]),
  star: uiIcon([
    ".....G......", ".....G......", "....GGG.....", ".GGGGGGGGG..",
    "..GGGWGGG...", "...GWWWG....", "..GGGWGGG...", ".GGG...GGG..",
    "..G.....G...", "............", "............", "............",
  ]),
  menu: uiIcon([
    "............", ".BB......BB.", ".BB......BB.", "............",
    ".BB......BB.", ".BB......BB.", "............", ".BB......BB.",
    ".BB......BB.", "............", "............", "............",
  ]),
  warn: uiIcon([
    ".....R......", "....RRR.....", "...RRWRR....", "..RRRWRRR...",
    ".RRRRWRRRR..", "RRRRRWRRRRR.", "RRRRRWRRRRR.", "RRRRRRRRRRR.",
    "RRRRRWRRRRR.", ".RRRRRRRRR..", "..RRRRRRR...", "............",
  ]),
  codex: uiIcon([
    "..KK....KK..", ".KWWK..KWWK.", ".KWWWKKWWWK.", ".KWWWWWWWWK.",
    ".KWWWWWWWWK.", ".KWWWWWWWWK.", ".KWWWWWWWWK.", ".KWWWKKWWWK.",
    ".KWWK..KWWK.", "..KK....KK..", "............", "............",
  ]),
  magnet: uiIcon([
    ".RR......BB.", ".RR......BB.", ".RR......BB.", ".RR......BB.",
    ".RR......BB.", ".RR......BB.", ".RRR....BBB.", "..RRR..BBB..",
    "...RRRRBB...", "....RRBB....", ".....KK.....", "............",
  ]),
  speed: uiIcon([
    "............", "....BBBB....", "..BBBBBB....", "BBBBBBBBBB..",
    "..BBBBBBBBB.", "....BBBBBBBB", "..BBBBBBBBB.", "BBBBBBBBBB..",
    "..BBBBBB....", "....BBBB....", "............", "............",
  ]),
  attack: uiIcon([
    ".........WWK", "........WWK.", ".......WWK..", "......WWK...",
    ".....WWK....", "....WWK.....", "...WWK......", "..WWK.......",
    ".WWK........", "KKK.........", "KGK.........", "KKK.........",
  ]),
  // 武器攻击形态族(塔防编队页速记, 2026-07-27): 48 把武器按 tag 关键词
  // 归入 9 族——玩家不读文字也能扫出"这把怎么打"
  wshot: uiIcon([
    "............", "............", "....W.......", ".W..WW......",
    "....WWW.....", ".W..WWWW....", "....WWW.....", ".W..WW......",
    "....W.......", "............", "............", "............",
  ]),
  whoming: uiIcon([
    "............", "..RR........", ".RR.........", ".RR.........",
    ".RR.........", "..RRR.......", "...RRRR.....", ".....RRRR.W.",
    "........RRWW", ".......RWWWW", "..........WW", "...........W",
  ]),
  worbit: uiIcon([
    "............", "...BBBBBB...", "..B......B..", ".B........B.",
    ".B........B.", ".B...WW...B.", ".B...WW...B.", ".B........B.",
    "..B......B..", "...BBBBWW...", ".......WW...", "............",
  ]),
  wblast: uiIcon([
    ".....RR.....", ".W...RR...W.", "..W..RR..W..", "...W....W...",
    "RR....RR..RR", "RR...RRRR.RR", "....RRRR....", "...W.RR.W...",
    "..W...R..W..", ".W........W.", ".....RR.....", ".....RR.....",
  ]),
  wpierce: uiIcon([
    "............", "............", "..........WW", ".........WWW",
    "WWWWWWWWWWWW", "WWWWWWWWWWWW", ".........WWW", "..........WW",
    "............", "............", "............", "............",
  ]),
  wsummon: uiIcon([
    "............", ".....W......", ".....W......", ".W...WW.....",
    ".W...WW...W.", ".WW..WW...W.", ".WW.WWWW..W.", "WWW.WWWW.WW.",
    "WWWWWWWWWWWW", "KKKKKKKKKKKK", "KKKKKKKKKKKK", "............",
  ]),
  wbeam: uiIcon([
    "............", "............", "BB..........", "BBBBBBBBBBBB",
    "BBBBBBBBBBBB", "BB..........", "............", "WW..........",
    "WWWWWWWWWW..", "WW..........", "............", "............",
  ]),
  wcontrol: uiIcon([
    "............", "..BBB..BBB..", ".B...BB...B.", ".B...BB...B.",
    ".B...BB...B.", "..BBB..BBB..", "..B......B..", "..B......B..",
    "..BBB..BBB..", "....B..B....", "....BBBB....", "............",
  ]),
  wguard: uiIcon([
    "............", ".WWWWWWWWWW.", ".WGGGGGGGGW.", ".WGGGGGGGGW.",
    ".WGGWWWWGGW.", ".WGGWWWWGGW.", "..WGGGGGGW..", "..WGGGGGGW..",
    "...WGGGGW...", "....WGGW....", ".....WW.....", "............",
  ]),
});

export function drawPixelIcon(ctx, icon, x, y, size = 16, alpha = 1) {
  if (!icon) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(icon, Math.round(x), Math.round(y), Math.round(size), Math.round(size));
  ctx.restore();
}

export function drawIconLabel(ctx, icon, label, centerX, baselineY, size = 16, gap = 5) {
  const textW = ctx.measureText(label).width;
  const totalW = size + gap + textW;
  const left = Math.round(centerX - totalW / 2);
  drawPixelIcon(ctx, icon, left, baselineY - size + 3, size);
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillText(label, left + size + gap, baselineY);
  ctx.restore();
}

// ---- Player: Sans (based on the classic look: wide skull + huge grin,
// blue hoodie over white shirt, black shorts with white stripe, pink slippers)
const BONE = "#f0f0e6";
const DARK = "#101018";
const TOOTH = "#ffffff";
const HOOD = "#4782c9";
const HOOD_DARK = "#2a4f96";
const FUR = "#f5f5f5";
const SHIRT = "#e8e8e8";
const SHORTS = "#16161c";
const STRIPE = "#e8e8e8";
const SLIPPER = "#bdc0c9";
const SLIPPER_DARK = "#b9c0cc";

export const PLAYER_SPRITE = sprite(24, 27, [
  // skull
  [8, 0, 8, 1, BONE],
  [6, 1, 12, 1, BONE],
  [5, 2, 14, 1, BONE],
  [4, 3, 16, 7, BONE],
  [5, 10, 14, 1, BONE],
  [7, 11, 10, 1, BONE],
  // eye sockets + pupils
  [7, 4, 3, 3, DARK],
  [14, 4, 3, 3, DARK],
  [8, 5, 1, 1, TOOTH],
  [15, 5, 1, 1, TOOTH],
  // nose
  [11, 7, 2, 1, DARK],
  // wide grin, corners curling up
  [5, 7, 1, 2, DARK],
  [18, 7, 1, 2, DARK],
  [6, 8, 12, 1, DARK],
  [6, 9, 12, 1, TOOTH],
  [8, 9, 1, 1, DARK],
  [10, 9, 1, 1, DARK],
  [12, 9, 1, 1, DARK],
  [14, 9, 1, 1, DARK],
  [16, 9, 1, 1, DARK],
  // hood collar
  [5, 12, 14, 1, FUR],
  // jacket with hands stuffed in pockets
  [3, 13, 18, 8, HOOD],
  [16, 13, 5, 8, HOOD_DARK],
  [11, 14, 2, 6, SHIRT],
  [3, 19, 5, 2, HOOD_DARK],
  [16, 19, 5, 2, HOOD_DARK],
  [3, 20, 18, 1, FUR],
  // shorts with side stripes
  [4, 21, 16, 3, SHORTS],
  [5, 21, 1, 3, STRIPE],
  [18, 21, 1, 3, STRIPE],
  // slippers
  [3, 24, 7, 2, SLIPPER],
  [14, 24, 7, 2, SLIPPER],
  [3, 26, 7, 1, SLIPPER_DARK],
  [14, 26, 7, 1, SLIPPER_DARK],
]);

// Pixel-exact palette swap; falls back to the source sprite in headless tests
// where getImageData isn't available.
function recolorSprite(src, mapping) {
  try {
    const c = makeCanvas(src.width, src.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(src, 0, 0);
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const map = Object.entries(mapping).map(([from, to]) => [hexRgb(from), hexRgb(to)]);
    for (let i = 0; i < d.length; i += 4) {
      for (const [f, t] of map) {
        if (d[i] === f[0] && d[i + 1] === f[1] && d[i + 2] === f[2]) {
          d[i] = t[0];
          d[i + 1] = t[1];
          d[i + 2] = t[2];
          break;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  } catch {
    return src;
  }
}

// Overlays a translucent color onto the sprite's opaque pixels.
export function tintSprite(src, color, alpha = 0.6) {
  const c = makeCanvas(src.width, src.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(src, 0, 0);
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

// UKB: same skeleton, purple jacket
export const PLAYER_UKB = recolorSprite(PLAYER_SPRITE, {
  [HOOD]: "#8a4fd6",
  [HOOD_DARK]: "#5c2f9e",
  [SLIPPER]: "#c59bff",
  [SLIPPER_DARK]: "#8a5fd0",
});

// Horror: same skeleton, red jacket
export const PLAYER_HORROR = recolorSprite(PLAYER_SPRITE, {
  [HOOD]: "#d63a3a",
  [HOOD_DARK]: "#8e2323",
  [SLIPPER]: "#ff8f8f",
  [SLIPPER_DARK]: "#c05555",
});

// Horror's halberd-axe: crescent blade, diamond spear tip, gold collar,
// long black shaft (loosely after the reference photo)
export const PROJECTILE_AXE_MAP = [
  "...........AA...........",
  "..........AAAA..........",
  ".........AAaaAA.........",
  "..........AAAA..........",
  "...........AA...........",
  "...........XX...........",
  ".....AA....XX...........",
  "...AAAA....XX...........",
  "..AAAAAA...XX...........",
  ".AAAAAAAA..XXAAA........",
  ".AAAAAAAAA.XXAAAA.......",
  ".AAAAAAAAAAXXaAAAA......",
  ".AAAAAAAAAAXX..aAA......",
  ".AAAAAAAAA.XX...aA......",
  "..AAAAAA...GG...........",
  "...AAAA....GG...........",
  ".....Aa....GG...........",
  "...........XX...........",
  "...........XX...........",
  "...........XX...........",
  "...........XX...........",
  "...........XX...........",
  "...........XX...........",
  "...........XX...........",
];


// ---- 4-direction walk animation ------------------------------------------
// Frames are authored as pixel maps (1 char = 1 px), Undertale-overworld
// style: front / left / right (mirrored) / back, 3 frames each
// (stand, step A, step B).

const PAL = {
  O: "#f08f36", // UT button orange
  A: "#c7cdd8", // silver
  a: "#aab2c2", // silver shade
  G: "#c9a84c", // gold collar
  X: "#16161c", // black shaft
  W: "#ffffff",
  K: "#000000",
  L: "#dbdbdb", // horror: pale skull
  N: "#25456d", // horror: navy jacket
  M: "#7b92ae", // horror: mid blue-gray
  C: "#a2b8d2", // horror: light blue-gray
  R: "#ac5858", // horror: red eye
  r: "#ac5e60", // horror: red eye shade
  E: SLIPPER, // steel gray from the sheet (shoes/details)
  p: "#fddefe", // gaster blaster pink
  m: "#8a8a8a", // whimsun mid gray
  T: TOOTH,
  B: HOOD,
  D: HOOD_DARK,
  S: SHIRT,
  H: SHORTS,
  P: SLIPPER,
  Q: SLIPPER_DARK,
  F: FUR,
};

function spriteFromMap(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = PAL[rows[y][x]];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return c;
}

function mirrorSprite(src) {
  const c = makeCanvas(src.width, src.height);
  const ctx = c.getContext("2d");
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
}

// Extracted pixel-for-pixel from the user's sprite sheet (sanb.png)
const SHEET = {
  down: [
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWKWWKKKWWK...",
      "....KWWWWWKKKWWWWWK....",
      "...KKWKWWWWWWWWWKWKK...",
      "...KWWKKKKKKKKKKKWWK...",
      "...KWWWKWKWKWKWKWWWK...",
      "....KKWWKKKKKKKWWKK....",
      "...KKKKKWWWWWWWKKKKK...",
      "..KBKKKKKKKKKKKKKKKBK..",
      ".KKBKEEKWWWKWWWKEEKBKK.",
      ".KBBBKEEKKKWKKKEEKBBBK.",
      "KBBKKBKKKWWKWWKKKBKKBBK",
      "KBBBBKBBKWWWWWKBBKBBBBK",
      "KBBBBBKBKKWWWKKBKBBBBBK",
      ".KBBBKBBKWWWWWKBBKBBBK.",
      "..KKBKBBKKKKKKKBBKBKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "...KKKKKKKK.KKKKKKKK...",
      "....KKKKKK...KKKKKK....",
      "..KKKWWWWK...KWWWWKKK..",
      "..KWWWWWKK...KKWWWWWK..",
      "...KKKKK.......KKKKK...",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWKWWKKKWWK...",
      "....KWWWWWKKKWWWWWK....",
      "...KKWKWWWWWWWWWKWKK...",
      "...KWWKKKKKKKKKKKWWK...",
      "...KWWWKWKWKWKWKWWWK...",
      "....KKWWKKKKKKKWWKK....",
      "...KKKKKWWWWWWWKKKKK...",
      "..KBKKKKKKKKKKKKKKKBK..",
      ".KKBKEEKWWWKWWWKEEKBKK.",
      ".KBBBKEEKKKWKKKEEKBBBK.",
      "KBBKKBKKKWWKWWKKKBKKBBK",
      "KBBBBKBBKWWWWWKBBKBBBBK",
      "KBBBBBKBKKWWWKKBKBBBBBK",
      ".KBBBKBBKWWWWWKBBKBBBK.",
      "..KKBKBBKKKKKKKBBKBKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKK....",
      "....KKKKKKKKKKKKKKK....",
      ".....KKKKKKKKKKKKK.....",
      ".....KKKKKKKKEEEEK.....",
      ".....KWWWWK.KKEEEEK....",
      "....KWWWWWK..KKKKKK....",
      "....KKKKKKK............",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWKWWKKKWWK...",
      "....KWWWWWKKKWWWWWK....",
      "...KKWKWWWWWWWWWKWKK...",
      "...KWWKKKKKKKKKKKWWK...",
      "...KWWWKWKWKWKWKWWWK...",
      "....KKWWKKKKKKKWWKK....",
      "...KKKKKWWWWWWWKKKKK...",
      "..KBKKKKKKKKKKKKKKKBK..",
      ".KKBKEEKWWWKWWWKEEKBKK.",
      ".KBBBKEEKKKWKKKEEKBBBK.",
      "KBBKKBKKKWWKWWKKKBKKBBK",
      "KBBBBKBBKWWWWWKBBKBBBBK",
      "KBBBBBKBKKWWWKKBKBBBBBK",
      ".KBBBKBBKWWWWWKBBKBBBK.",
      "..KKBKBBKKKKKKKBBKBKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "...KKKKKKKK.KKKKKKKK...",
      "....KKKKKK...KKKKKK....",
      "..KKKWWWWK...KWWWWKKK..",
      "..KWWWWWKK...KKWWWWWK..",
      "...KKKKK.......KKKKK...",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWWWWKKKWWK...",
      "...KWWKKKWWKWWKKKWWK...",
      "....KWWWWWKKKWWWWWK....",
      "...KKWKWWWWWWWWWKWKK...",
      "...KWWKKKKKKKKKKKWWK...",
      "...KWWWKWKWKWKWKWWWK...",
      "....KKWWKKKKKKKWWKK....",
      "...KKKKKWWWWWWWKKKKK...",
      "..KBKKKKKKKKKKKKKKKBK..",
      ".KKBKEEKWWWKWWWKEEKBKK.",
      ".KBBBKEEKKKWKKKEEKBBBK.",
      "KBBKKBKKKWWKWWKKKBKKBBK",
      "KBBBBKBBKWWWWWKBBKBBBBK",
      "KBBBBBKBKKWWWKKBKBBBBBK",
      ".KBBBKBBKWWWWWKBBKBBBK.",
      "..KKBKBBKKKKKKKBBKBKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKK....",
      "....KKKKKKKKKKKKKKK....",
      ".....KKKKKKKKKKKKK.....",
      ".....KEEEEKKKKKKKK.....",
      "....KEEEEKK.KWWWWK.....",
      "....KKKKKK..KWWWWWK....",
      "............KKKKKKK....",
    ],
  ],
  left: [
    [
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KKWWKKKWWWWWWWWKK",
      ".KKWWWWWWWKKWWKK.",
      "KWWWWWWWKWWWKKWK.",
      "KKKKKKKKKKWWKWWK.",
      "KKWKWKWKWWWWKWK..",
      ".KKKKKKWWWWKKKK..",
      ".KWWWWWWWWKKEEEK.",
      ".KKKKKKKKKEEEEEEK",
      "...KKWKKEEEKKKKKK",
      "..KEKKKEEKKBBBKK.",
      "..KKWWKEKKBBBBBK.",
      "..KKWKKKBBKBBBBBK",
      "..KKWWWKBKBKBBBBK",
      "..KKKKKKBKBBBBBBK",
      "..KKKWWKBKBBBBBK.",
      "...KKKKKBBKKKKK..",
      "...KKKKKKBBBBBK..",
      "....KKKKKKKKKK...",
      "....KKKKKKKKK....",
      "....KKKKKKK......",
      "...KKKWWWWWK.....",
      "...KWWWWKKKK.....",
      "....KKKKK........",
    ],
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KKWWKKKWWWWWWWWKK",
      ".KKWWWWWWWKKWWKK.",
      "KWWWWWWWKWWWKKWK.",
      "KKKKKKKKKKWWKWWK.",
      "KKWKWKWKWWWWKWK..",
      ".KKKKKKWWWWKKKK..",
      ".KWWWWWWWWKKEEEK.",
      ".KKKKKKKKKEEEEEEK",
      "...KKWKKEEEKKKKKK",
      "..KEKKKEEKKBBBKK.",
      "..KKWWKEKKBBBBBK.",
      "..KKWKKKBBKBBBBBK",
      "..KKWWWKBKBKBBBBK",
      "..KKKKKKBKBBBBBBK",
      "...KKWWKBKBBBBBK.",
      "...KKKKKBBKKKKK..",
      ".KKKKKKKKBBBBBK..",
      ".KWWKKKKKKKKKKK..",
      ".KWWWKKKKKKKEEK..",
      "..KKWWKK..KKEEK..",
      "....KWWK.KEEKK...",
      ".....KK..KKKK....",
    ],
    [
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KKWWKKKWWWWWWWWKK",
      ".KKWWWWWWWKKWWKK.",
      "KWWWWWWWKWWWKKWK.",
      "KKKKKKKKKKWWKWWK.",
      "KKWKWKWKWWWWKWK..",
      ".KKKKKKWWWWKKKK..",
      ".KWWWWWWWWKKEEEK.",
      ".KKKKKKKKKEEEEEEK",
      "...KKWKKEEEKKKKKK",
      "..KEKKKEEKKBBBKK.",
      "..KKWWKEKKBBBBBK.",
      "..KKWKKKBBKBBBBBK",
      "..KKWWWKBKBKBBBBK",
      "..KKKKKKBKBBBBBBK",
      "..KKKWWKBKBBBBBK.",
      "...KKKKKBBKKKKK..",
      "...KKKKKKBBBBBK..",
      "....KKKKKKKKKK...",
      "....KKKKKKKKK....",
      "....KKKKKKK......",
      "...KKKWWWWWK.....",
      "...KWWWWKKKK.....",
      "....KKKKK........",
    ],
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KWWWKKKWWWWWWWWWK",
      "KKWWKKKWWWWWWWWKK",
      ".KKWWWWWWWKKWWKK.",
      "KWWWWWWWKWWWKKWK.",
      "KKKKKKKKKKWWKWWK.",
      "KKWKWKWKWWWWKWK..",
      ".KKKKKKWWWWKKKK..",
      ".KWWWWWWWWKKEEEK.",
      ".KKKKKKKKKEEEEEEK",
      "...KKWKKEEEKKKKKK",
      "..KEKKKEEKKBBBKK.",
      "..KKWWKEKKBBBBBK.",
      "..KKWKKKBBKBBBBBK",
      "..KKWWWKBKBKBBBBK",
      "..KKKKKKBKBBBBBBK",
      "...KKWWKBKBBBBBK.",
      "...KKKKKBBKKKKK..",
      ".KKKKKKKKBBBBBK..",
      ".KEEKKKKKKKKKKK..",
      ".KEEEKKKKKKKWWK..",
      "..KKEEKK..KKWWK..",
      "....KEEK.KWWKK...",
      ".....KK..KKKK....",
    ],
  ],
  right: [
    [
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KKWWWWWWWWKKKWWKK",
      ".KKWWKKWWWWWWWKK.",
      ".KWKKWWWKWWWWWWWK",
      ".KWWKWWKKKKKKKKKK",
      "..KWKWWWWKWKWKWKK",
      "..KKKKWWWWKKKKKK.",
      ".KEEEKKWWWWWWWWK.",
      "KEEEEEEKKKKKKKKK.",
      "KKKKKKEEEKKWKK...",
      ".KKBBBKKEEKKKEK..",
      ".KBBBBBKKEKWWKK..",
      "KBBBBBKBBKKKWKK..",
      "KBBBBKBKBKWWWKK..",
      "KBBBBBBKBKKKKKK..",
      ".KBBBBBKBKWWKKK..",
      "..KKKKKBBKKKKK...",
      "..KBBBBBKKKKKK...",
      "...KKKKKKKKKK....",
      "....KKKKKKKKK....",
      "......KKKKKKK....",
      ".....KWWWWWKKK...",
      ".....KKKKWWWWK...",
      "........KKKKK....",
    ],
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KKWWWWWWWWKKKWWKK",
      ".KKWWKKWWWWWWWKK.",
      ".KWKKWWWKWWWWWWWK",
      ".KWWKWWKKKKKKKKKK",
      "..KWKWWWWKWKWKWKK",
      "..KKKKWWWWKKKKKK.",
      ".KEEEKKWWWWWWWWK.",
      "KEEEEEEKKKKKKKKK.",
      "KKKKKKEEEKKWKK...",
      ".KKBBBKKEEKKKEK..",
      ".KBBBBBKKEKWWKK..",
      "KBBBBBKBBKKKWKK..",
      "KBBBBKBKBKWWWKK..",
      "KBBBBBBKBKKKKKK..",
      ".KBBBBBKBKWWKK...",
      "..KKKKKBBKKKKK...",
      "..KBBBBBKKKKKKKK.",
      "..KKKKKKKKKKKWWK.",
      "..KEEKKKKKKKWWWK.",
      "..KEEKK..KKWWKK..",
      "...KKEEK.KWWK....",
      "....KKKK..KK.....",
    ],
    [
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KKWWWWWWWWKKKWWKK",
      ".KKWWKKWWWWWWWKK.",
      ".KWKKWWWKWWWWWWWK",
      ".KWWKWWKKKKKKKKKK",
      "..KWKWWWWKWKWKWKK",
      "..KKKKWWWWKKKKKK.",
      ".KEEEKKWWWWWWWWK.",
      "KEEEEEEKKKKKKKKK.",
      "KKKKKKEEEKKWKK...",
      ".KKBBBKKEEKKKEK..",
      ".KBBBBBKKEKWWKK..",
      "KBBBBBKBBKKKWKK..",
      "KBBBBKBKBKWWWKK..",
      "KBBBBBBKBKKKKKK..",
      ".KBBBBBKBKWWKKK..",
      "..KKKKKBBKKKKK...",
      "..KBBBBBKKKKKK...",
      "...KKKKKKKKKK....",
      "....KKKKKKKKK....",
      "......KKKKKKK....",
      ".....KWWWWWKKK...",
      ".....KKKKWWWWK...",
      "........KKKKK....",
    ],
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKWWWWWWWWWKK..",
      ".KWWWWWWWWWWWWWK.",
      ".KWWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KWWWWWWWWWKKKWWWK",
      "KKWWWWWWWWKKKWWKK",
      ".KKWWKKWWWWWWWKK.",
      ".KWKKWWWKWWWWWWWK",
      ".KWWKWWKKKKKKKKKK",
      "..KWKWWWWKWKWKWKK",
      "..KKKKWWWWKKKKKK.",
      ".KEEEKKWWWWWWWWK.",
      "KEEEEEEKKKKKKKKK.",
      "KKKKKKEEEKKWKK...",
      ".KKBBBKKEEKKKEK..",
      ".KBBBBBKKEKWWKK..",
      "KBBBBBKBBKKKWKK..",
      "KBBBBKBKBKWWWKK..",
      "KBBBBBBKBKKKKKK..",
      ".KBBBBBKBKWWKK...",
      "..KKKKKBBKKKKK...",
      "..KBBBBBKKKKKKKK.",
      "..KKKKKKKKKKKEEK.",
      "..KWWKKKKKKKEEEK.",
      "..KWWKK..KKEEKK..",
      "...KKWWK.KEEK....",
      "....KKKK..KK.....",
    ],
  ],
  up: [
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "....KWWWWWWWWWWWWWK....",
      "...KKWWWWWWWWWWWWWKK...",
      "...KWWWWKKKKKKKWWWWK...",
      "...KWWWKKKWWWKKKWWWK...",
      "....KKWWWKKWKKWWWKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KBBKKEEEEEEEEEKKBBK..",
      ".KKBBBBKKEEEEEKKBBBBKK.",
      ".KBBBKBBBKKKKKBBBKBBBK.",
      "KBBBKKKBBBBBBBBBKKKBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      ".KBBKBBBBBBBBBBBBBKBBK.",
      "..KKKBBBBBBBBBBBBBKKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "...KKKKKKKK.KKKKKKKK...",
      "....KKKKKK...KKKKKK....",
      "..KKKWWWWK...KWWWWKKK..",
      "..KKKWWWWK...KWWWWKKK..",
      ".....KKKKK...KKKKK.....",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "....KWWWWWWWWWWWWWK....",
      "...KKWWWWWWWWWWWWWKK...",
      "...KWWWWKKKKKKKWWWWK...",
      "...KWWWKKKWWWKKKWWWK...",
      "....KKWWWKKWKKWWWKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KBBKKEEEEEEEEEKKBBK..",
      ".KKBBBBKKEEEEEKKBBBBKK.",
      ".KBBBKBBBKKKKKBBBKBBBK.",
      "KBBBKKKBBBBBBBBBKKKBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      ".KBBKBBBBBBBBBBBBBKBBK.",
      "..KKKBBBBBBBBBBBBBKKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "...KKKKKKKKKKKKKKKK....",
      "....KKKKKKKKKKKKKKK....",
      "....KKKKKKK.KKKKKK.....",
      "...KKKEEEEK.KWWWWK.....",
      "....KKEEEEK.KKKWWKKK...",
      ".....KKKKK..KKKKWWKK...",
      "............KKKKKK.....",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "....KWWWWWWWWWWWWWK....",
      "...KKWWWWWWWWWWWWWKK...",
      "...KWWWWKKKKKKKWWWWK...",
      "...KWWWKKKWWWKKKWWWK...",
      "....KKWWWKKWKKWWWKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KBBKKEEEEEEEEEKKBBK..",
      ".KKBBBBKKEEEEEKKBBBBKK.",
      ".KBBBKBBBKKKKKBBBKBBBK.",
      "KBBBKKKBBBBBBBBBKKKBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      ".KBBKBBBBBBBBBBBBBKBBK.",
      "..KKKBBBBBBBBBBBBBKKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "...KKKKKKKK.KKKKKKKK...",
      "....KKKKKK...KKKKKK....",
      "..KKKWWWWK...KWWWWKKK..",
      "..KKKWWWWK...KWWWWKKK..",
      ".....KKKKK...KKKKK.....",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKWWWWWWWWWKK.....",
      "....KWWWWWWWWWWWWWK....",
      "....KWWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "...KWWWWWWWWWWWWWWWK...",
      "....KWWWWWWWWWWWWWK....",
      "...KKWWWWWWWWWWWWWKK...",
      "...KWWWWKKKKKKKWWWWK...",
      "...KWWWKKKWWWKKKWWWK...",
      "....KKWWWKKWKKWWWKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KBBKKEEEEEEEEEKKBBK..",
      ".KKBBBBKKEEEEEKKBBBBKK.",
      ".KBBBKBBBKKKKKBBBKBBBK.",
      "KBBBKKKBBBBBBBBBKKKBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      "KBBBBKBBBBBBBBBBBKBBBBK",
      ".KBBKBBBBBBBBBBBBBKBBK.",
      "..KKKBBBBBBBBBBBBBKKK..",
      "...KKKBBKKKKKKKBBKKK...",
      "....KKKKKKKKKKKKKKKK...",
      "....KKKKKKKKKKKKKKK....",
      ".....KKKKKK.KKKKKKK....",
      ".....KWWWWK.KEEEEKKK...",
      "...KKKWWKKK.KEEEEKK....",
      "...KKWWKKKK..KKKKK.....",
      ".....KKKKKK............",
    ],
  ],
};

const SANS_WALK = {};
for (const dir of Object.keys(SHEET)) SANS_WALK[dir] = SHEET[dir].map(spriteFromMap);

// Extracted pixel-for-pixel from the user's horror.png
const HORROR_SHEET = {
  down: [
    [
      ".......KKKKKKKKK.......",
      ".....KKLLLLLLLLKKK.....",
      "....KLLLLLLLLLKKKKK....",
      "....KLLLLLLLLLLKLKK....",
      "...KLLLLLLLLLLLLLKLK...",
      "...KLLKKKLLLLLKKKLLK...",
      "...KLLKKKLLLLLKrKLLK...",
      "...KLLKKKLLKLLKKKLLK...",
      "....KLLLLLKKKLLLLLK....",
      "...KLKKLLLLLLLLLKKLK...",
      "...KLLKKKKKKKKKKKLLK...",
      "...KLLLKLKLKLKLKLLLK...",
      "....KKLLKKKKKKKLLKK....",
      "...KKKKKLLLLLLLKKKKK...",
      "..KNKKKKKKKKKKKKKKKNK..",
      ".KKNKMMKLLLKLLLKMMKNKK.",
      ".KNNNKMMKKKLKKKMMKNNNK.",
      "KNNKKNKKKLLKLLKKKNKKNNK",
      "KNNNNKNNKLRLRLKNNKNNNNK",
      "KNNNNNKNKKLRRKKNKNNNNNK",
      ".KNNNKNNKLLRLRKNNKNNNK.",
      "..KKNKNNKKKKKKKNNKNKK..",
      "...KKKNNKKKKKKKNNKKK...",
      "....KKKKKKKKKKKKKKK....",
      "....KKKKKKKKKKKKKKK....",
      ".....KKKKKKKKKKKKK.....",
      ".....KKKKKKKKMMMMK.....",
      ".....KCCCCK.KKMMMMK....",
      "....KCCCCCK..KKKKKK....",
      "....KKKKKKK............",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKLLLLLLLLKKK.....",
      "....KLLLLLLLLLKKKKK....",
      "....KLLLLLLLLLLKLKK....",
      "...KLLLLLLLLLLLLLKLK...",
      "...KLLKKKLLLLLKKKLLK...",
      "...KLLKKKLLLLLKrKLLK...",
      "...KLLKKKLLKLLKKKLLK...",
      "....KLLLLLKKKLLLLLK....",
      "...KLKKLLLLLLLLLKKLK...",
      "...KLLKKKKKKKKKKKLLK...",
      "...KLLLKLKLKLKLKLLLK...",
      "....KKLLKKKKKKKLLKK....",
      "...KKKKKLLLLLLLKKKKK...",
      "..KNKKKKKKKKKKKKKKKNK..",
      ".KKNKMMKLLLKLLLKMMKNKK.",
      ".KNNNKMMKKKLKKKMMKNNNK.",
      "KNNKKNKKKLLKLLKKKNKKNNK",
      "KNNNNKNNKLRLRLKNNKNNNNK",
      "KNNNNNKNKKLRRKKNKNNNNNK",
      ".KNNNKNNKLLRLRKNNKNNNK.",
      "..KKNKNNKKKKKKKNNKNKK..",
      "...KKKNNKKKKKKKNNKKK...",
      "....KKKKKKKKKKKKKKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "...KKKKKKKK.KKKKKKKK...",
      "....KKKKKK...KKKKKK....",
      "..KKKCCCCK...KCCCCKKK..",
      "..KCCCCCKK...KKCCCCCK..",
      "...KKKKK.......KKKKK...",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKLLLLLLLLKKK.....",
      "....KLLLLLLLLLKKKKK....",
      "....KLLLLLLLLLLKLKK....",
      "...KLLLLLLLLLLLLLKLK...",
      "...KLLKKKLLLLLKKKLLK...",
      "...KLLKKKLLLLLKrKLLK...",
      "...KLLKKKLLKLLKKKLLK...",
      "....KLLLLLKKKLLLLLK....",
      "...KLKKLLLLLLLLLKKLK...",
      "...KLLKKKKKKKKKKKLLK...",
      "...KLLLKLKLKLKLKLLLK...",
      "....KKLLKKKKKKKLLKK....",
      "...KKKKKLLLLLLLKKKKK...",
      "..KNKKKKKKKKKKKKKKKNK..",
      ".KKNKMMKLLLKLLLKMMKNKK.",
      ".KNNNKMMKKKLKKKMMKNNNK.",
      "KNNKKNKKKLLKLLKKKNKKNNK",
      "KNNNNKNNKLRLRLKNNKNNNNK",
      "KNNNNNKNKKLRRKKNKNNNNNK",
      ".KNNNKNNKLLRLRKNNKNNNK.",
      "..KKNKNNKKKKKKKNNKNKK..",
      "...KKKNNKKKKKKKNNKKK...",
      "....KKKKKKKKKKKKKKK....",
      "....KKKKKKKKKKKKKKK....",
      ".....KKKKKKKKKKKKK.....",
      ".....KMMMMKKKKKKKK.....",
      "....KMMMMKK.KCCCCK.....",
      "....KKKKKK..KCCCCCK....",
      "............KKKKKKK....",
    ],
  ],
  left: [
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKLLLLLLLKKKK..",
      ".KLLLLLLLLKKKKKK.",
      ".KLLLLLLLLLKLKKK.",
      "KLLLLLLLLLLLLKKKK",
      "KLLLKKKLLLLLLLKLK",
      "KLLLKrKLLLLLLLLLK",
      "KKLLKKKLLLLLLLLKK",
      ".KKLLLLLLLKKLLKK.",
      "KLLLLLLLKKLLKKLK.",
      "KKKKKKKKKLLLKLLK.",
      "KKLKLKLKLLLLKLK..",
      ".KKKKKKLLLLKKKK..",
      ".KLLLLLLLLKKMMMK.",
      ".KKKKKKKKKMMMMMMK",
      "...KKLKKMMMKKKKKK",
      "..KMKKKMMKKNNNKK.",
      "..KKLLKMKKNNNNNK.",
      "..KKLKKKNNKNNNNNK",
      "..KKRRLKNKNKNNNNK",
      "..KKKKKKNKNNNNNNK",
      "...KKRLKNKNNNNNK.",
      "...KKKKKNNKKKKK..",
      ".KKKKKKKKNNNNNK..",
      ".KCCKKKKKKKKKKK..",
      ".KCCCKKKKKKKMMK..",
      "..KKCCKK..KKMMK..",
      "....KCCK.KMMKK...",
      ".....KK..KKKK....",
    ],
    [
      "....KKKKKKKKK....",
      "..KKLLLLLLLKKKK..",
      ".KLLLLLLLLKKKKKK.",
      ".KLLLLLLLLLKLKKK.",
      "KLLLLLLLLLLLLKKKK",
      "KLLLKKKLLLLLLLKLK",
      "KLLLKrKLLLLLLLLLK",
      "KKLLKKKLLLLLLLLKK",
      ".KKLLLLLLLKKLLKK.",
      "KLLLLLLLKKLLKKLK.",
      "KKKKKKKKKLLLKLLK.",
      "KKLKLKLKLLLLKLK..",
      ".KKKKKKLLLLKKKK..",
      ".KLLLLLLLLKKMMMK.",
      ".KKKKKKKKKMMMMMMK",
      "...KKLKKMMMKKKKKK",
      "..KMKKKMMKKNNNKK.",
      "..KKLLKMKKNNNNNK.",
      "..KKLKKKNNKNNNNNK",
      "..KKRRLKNKNKNNNNK",
      "..KKKKKKNKNNNNNNK",
      "..KKKRLKNKNNNNNK.",
      "...KKKKKNNKKKKK..",
      "...KKKKKKNNNNNK..",
      "....KKKKKKKKKK...",
      "....KKKKKKKKK....",
      "....KKKKKKK......",
      "...KKKCCCCCK.....",
      "...KCCCCKKKK.....",
      "....KKKKK........",
    ],
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKLLLLLLLKKKK..",
      ".KLLLLLLLLKKKKKK.",
      ".KLLLLLLLLLKLKKK.",
      "KLLLLLLLLLLLLKKKK",
      "KLLLKKKLLLLLLLKLK",
      "KLLLKrKLLLLLLLLLK",
      "KKLLKKKLLLLLLLLKK",
      ".KKLLLLLLLKKLLKK.",
      "KLLLLLLLKKLLKKLK.",
      "KKKKKKKKKLLLKLLK.",
      "KKLKLKLKLLLLKLK..",
      ".KKKKKKLLLLKKKK..",
      ".KLLLLLLLLKKMMMK.",
      ".KKKKKKKKKMMMMMMK",
      "...KKLKKMMMKKKKKK",
      "..KMKKKMMKKNNNKK.",
      "..KKLLKMKKNNNNNK.",
      "..KKLKKKNNKNNNNNK",
      "..KKRRLKNKNKNNNNK",
      "..KKKKKKNKNNNNNNK",
      "...KKRLKNKNNNNNK.",
      "...KKKKKNNKKKKK..",
      ".KKKKKKKKNNNNNK..",
      ".KMMKKKKKKKKKKK..",
      ".KMMMKKKKKKKCCK..",
      "..KKMMKK..KKCCK..",
      "....KMMK.KCCKK...",
      ".....KK..KKKK....",
    ],
  ],
  right: [
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKLLLLLLLLLKK..",
      ".KLLLLLLLLLLLLLK.",
      ".KLLLLLLLLLLLLLK.",
      "KLLLLLLLLLLLLLLLK",
      "KLLLLLLLLLKKKLLLK",
      "KLLLLLLLLLKKKLLLK",
      "KKLLLLLLLLKKKLLKK",
      ".KKLLKKLLLLLLLKK.",
      ".KLKKLLLKLLLLLLLK",
      ".KLLKLLKKKKKKKKKK",
      "..KLKLLLLKLKLKLKK",
      "..KKKKLLLLKKKKKK.",
      ".KMMMKKLLLLLLLLK.",
      "KMMMMMMKKKKKKKKK.",
      "KKKKKKMMMKKLKK...",
      ".KKNNNKKMMKKKMK..",
      ".KNNNNNKKMKLLKK..",
      "KNNNNNKNNKKKLKK..",
      "KNNNNKNKNKLLRKK..",
      "KNNNNNNKNKKKKKK..",
      ".KNNNNNKNKLRKK...",
      "..KKKKKNNKKKKK...",
      "..KNNNNNKKKKKKKK.",
      "..KKKKKKKKKKKMMK.",
      "..KCCKKKKKKKMMMK.",
      "..KCCKK..KKMMKK..",
      "...KKCCK.KMMK....",
      "....KKKK..KK.....",
    ],
    [
      "....KKKKKKKKK....",
      "..KKLLLLLLLLLKK..",
      ".KLLLLLLLLLLLLLK.",
      ".KLLLLLLLLLLLLLK.",
      "KLLLLLLLLLLLLLLLK",
      "KLLLLLLLLLKKKLLLK",
      "KLLLLLLLLLKKKLLLK",
      "KKLLLLLLLLKKKLLKK",
      ".KKLLKKLLLLLLLKK.",
      ".KLKKLLLKLLLLLLLK",
      ".KLLKLLKKKKKKKKKK",
      "..KLKLLLLKLKLKLKK",
      "..KKKKLLLLKKKKKK.",
      ".KMMMKKLLLLLLLLK.",
      "KMMMMMMKKKKKKKKK.",
      "KKKKKKMMMKKLKK...",
      ".KKNNNKKMMKKKMK..",
      ".KNNNNNKKMKLLKK..",
      "KNNNNNKNNKKKLKK..",
      "KNNNNKNKNKLLRKK..",
      "KNNNNNNKNKKKKKK..",
      ".KNNNNNKNKLRKKK..",
      "..KKKKKNNKKKKK...",
      "..KNNNNNKKKKKK...",
      "...KKKKKKKKKK....",
      "....KKKKKKKKK....",
      "......KKKKKKK....",
      ".....KCCCCCKKK...",
      ".....KKKKCCCCK...",
      "........KKKKK....",
    ],
    [
      ".................",
      "....KKKKKKKKK....",
      "..KKLLLLLLLLLKK..",
      ".KLLLLLLLLLLLLLK.",
      ".KLLLLLLLLLLLLLK.",
      "KLLLLLLLLLLLLLLLK",
      "KLLLLLLLLLKKKLLLK",
      "KLLLLLLLLLKKKLLLK",
      "KKLLLLLLLLKKKLLKK",
      ".KKLLKKLLLLLLLKK.",
      ".KLKKLLLKLLLLLLLK",
      ".KLLKLLKKKKKKKKKK",
      "..KLKLLLLKLKLKLKK",
      "..KKKKLLLLKKKKKK.",
      ".KMMMKKLLLLLLLLK.",
      "KMMMMMMKKKKKKKKK.",
      "KKKKKKMMMKKLKK...",
      ".KKNNNKKMMKKKMK..",
      ".KNNNNNKKMKLLKK..",
      "KNNNNNKNNKKKLKK..",
      "KNNNNKNKNKLLRKK..",
      "KNNNNNNKNKKKKKK..",
      ".KNNNNNKNKLRKK...",
      "..KKKKKNNKKKKK...",
      "..KNNNNNKKKKKKKK.",
      "..KKKKKKKKKKKCCK.",
      "..KMMKKKKKKKCCCK.",
      "..KMMKK..KKCCKK..",
      "...KKMMK.KCCK....",
      "....KKKK..KK.....",
    ],
  ],
  up: [
    [
      ".......KKKKKKKKK.......",
      ".....KKKKLLLLLLLKK.....",
      "....KKKKKKLLLLLLLLK....",
      "....KKKLKLLLLLLLLLK....",
      "...KLKLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "....KLLLLLLLLLLLLLK....",
      "...KKLLLLLLLLLLLLLKK...",
      "...KLLLLKKKKKKKLLLLK...",
      "...KLLLKKKLLLKKKLLLK...",
      "....KKLLLKKLKKLLLKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KNNKKMMMMMMMMMKKNNK..",
      ".KKNNNNKKMMMMMKKNNNNKK.",
      ".KNNNKNNNKKKKKNNNKNNNK.",
      "KNNNKKKNNNNNNNNNKKKNNNK",
      "KNNNNKNNNNNNNNNNNKNNNNK",
      "KNNNNKNNNNNNNNNNNKNNNNK",
      ".KNNKNNNNNNNNNNNNNKNNK.",
      "..KKKNNNNNNNNNNNNNKKK..",
      "...KKKNNKKKKKKKNNKKK...",
      "...KKKKKKKKKKKKKKKK....",
      "....KKKKKKKKKKKKKKK....",
      "....KKKKKKK.KKKKKK.....",
      "...KKKMMMMK.KCCCCK.....",
      "....KKMMMMK.KKKCCKKK...",
      ".....KKKKK..KKKKCCKK...",
      "............KKKKKK.....",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKKKLLLLLLLKK.....",
      "....KKKKKKLLLLLLLLK....",
      "....KKKLKLLLLLLLLLK....",
      "...KLKLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "....KLLLLLLLLLLLLLK....",
      "...KKLLLLLLLLLLLLLKK...",
      "...KLLLLKKKKKKKLLLLK...",
      "...KLLLKKKLLLKKKLLLK...",
      "....KKLLLKKLKKLLLKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KNNKKMMMMMMMMMKKNNK..",
      ".KKNNNNKKMMMMMKKNNNNKK.",
      ".KNNNKNNNKKKKKNNNKNNNK.",
      "KNNNKKKNNNNNNNNNKKKNNNK",
      "KNNNNKNNNNNNNNNNNKNNNNK",
      "KNNNNKNNNNNNNNNNNKNNNNK",
      ".KNNKNNNNNNNNNNNNNKNNK.",
      "..KKKNNNNNNNNNNNNNKKK..",
      "...KKKNNKKKKKKKNNKKK...",
      "....KKKKKKKKKKKKKKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "...KKKKKKKK.KKKKKKKK...",
      "....KKKKKK...KKKKKK....",
      "..KKKCCCCK...KCCCCKKK..",
      "..KKKCCCCK...KCCCCKKK..",
      ".....KKKKK...KKKKK.....",
    ],
    [
      ".......KKKKKKKKK.......",
      ".....KKKKLLLLLLLKK.....",
      "....KKKKKKLLLLLLLLK....",
      "....KKKLKLLLLLLLLLK....",
      "...KLKLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "...KLLLLLLLLLLLLLLLK...",
      "....KLLLLLLLLLLLLLK....",
      "...KKLLLLLLLLLLLLLKK...",
      "...KLLLLKKKKKKKLLLLK...",
      "...KLLLKKKLLLKKKLLLK...",
      "....KKLLLKKLKKLLLKK....",
      "...KKKKKKKKKKKKKKKKK...",
      "..KNNKKMMMMMMMMMKKNNK..",
      ".KKNNNNKKMMMMMKKNNNNKK.",
      ".KNNNKNNNKKKKKNNNKNNNK.",
      "KNNNKKKNNNNNNNNNKKKNNNK",
      "KNNNNKNNNNNNNNNNNKNNNNK",
      "KNNNNKNNNNNNNNNNNKNNNNK",
      ".KNNKNNNNNNNNNNNNNKNNK.",
      "..KKKNNNNNNNNNNNNNKKK..",
      "...KKKNNKKKKKKKNNKKK...",
      "....KKKKKKKKKKKKKKKK...",
      "....KKKKKKKKKKKKKKK....",
      ".....KKKKKK.KKKKKKK....",
      ".....KCCCCK.KMMMMKKK...",
      "...KKKCCKKK.KMMMMKK....",
      "...KKCCKKKK..KKKKK.....",
      ".....KKKKKK............",
    ],
  ],
};

// horror.png has 3 frames per direction and the MIDDLE one is the idle
// stand; cycle as stand, stepA, stand, stepB (index 0 doubles as idle)
const HORROR_WALK = {};
for (const dir of Object.keys(HORROR_SHEET)) {
  const [stepA, stand, stepB] = HORROR_SHEET[dir].map(spriteFromMap);
  HORROR_WALK[dir] = [stand, stepA, stand, stepB];
}

export const PROJECTILE_AXE = spriteFromMap(PROJECTILE_AXE_MAP);

// FIGHT / MERCY buttons, extracted from the user's 战斗 仁慈.png
export const BTN_FIGHT = spriteFromMap([
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTT",
  "TTTTTTTTTTTTTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTT",
  "TTTTTTTTTTTTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTT",
  "TTTTTTTTTTTTTTOOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXOXXXXXXXXOOOOOOOOOOXXOOOOOOOOOXXOOOOOOOOOOXXOOXXXXXXOOXOOOOOOOOOOOOXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXOOXXXXXXXXOOOOOOOOOOXXOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXOOXOOOOOOOOOOOOXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXOOOXXXXXXXXOOOOOOOOOOXXOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXOOXOOOOOOOOOOOOXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXOOOXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOOXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXOOOOXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXOOOOXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXXXXXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXOOOXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXXXXXXOOOXXXXOOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXOOOOXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXOOOOOXXOOOOOOOOOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXOOOXXXXXXXXXXOOOOOOOOOOXXXXXOOOXXXXXOOOXXOOOOOXXOOOOOOOOOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXOOOOXXXXXXXXXXOOOOOOOOOOXXXXXOOOXXXXXOOOXXOOOOOXXOOOOOOOOOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXOOXOOOXXXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXOOOXXOOOXXXXOOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXOOOOOXXXXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXOOOOOXXXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXOOOOOXXXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXOOOOOOXXXXXXXXXXOOOOXXXXXXXXXXXOOOXXXXXOOOXXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXOOOXXXXXXXXXXXXXOOOOXXXXXXXXXXXOOOXXOXXOOOOXXXOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXOOXXXXXXXXXXXXXXOOOOXXXXXXXXOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXOOXXXXXXXXXXXXXXXOOOOXXXXXXXXOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXOOXXXXXXOOOXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXOOOOXXXXXXXXOOOOOOOOOXXOOOOOOOOOOXXOOXXXXXXOOXXXXXOOOOOXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTT",
  "TTTTTTTTTTTTTTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOOTT",
  "TTTTTTTTTTTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTT",
  "TTTTTTTTTTTTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTT",
  "TTTTTTTTTTTTTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
]);

export const BTN_MERCY = spriteFromMap([
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTTTTTTTTTTT",
  "TTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTTTTTTTTT",
  "TTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTTTTTTTT",
  "TTOOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXOOOOOXXXXXOOOOXXOOOOOOOOOOOXXOOOOOOOOOOXXXOOOOOOOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXOOOOOXXXXOOOOOXXOOOOOOOOOOOXXOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXOOXXXXOOOOOOOOOOOOOOXXOOOOOOOOOOOXXOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXOOXXXXXXXXXXOOOXXXXOOOOOOOOOOOOOOXXOOOOXXXXXXOXXOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXOOOXXXXXXXXOOXXXXXXOOOOOOOOOOOOOOXXOOOOXXXXXXOXXOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXOOXXXXXXXXOXXXXXXXOOOOOOOOOOOOOOXXOOOOXXXXXXXXXOOOOXXOOOOXXOOOXXXXOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXOXXXXXXXOOXXXXXXXOOOOOOOOOOOOOOXXOOOOXXXXXXXXXOOOXXXXOOOXXOOOXXXXOOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXOOXXXXXOOXXXXXXXXOOOOOOOOOOOOOOXXOOOOXXXXXXXXXOOOXXXXOOOXXOOOXXXXXOOXXOOOXXXOOOOXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXOOXXXOOXXXXXXXXXOOOOOOOOOXOOOOXXOOOOOXXXXXXXXOOOOXXOOOOXXOOOXXXXXXXXXXOOOOOOOXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXOXXOOXXXXXXXXXXOOOOXOOOOXOOOOXXOOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXXXXXXOOOOOOXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXOOOOXXXXXXXXXXXOOOOXOOOOXOOOOXXOOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXXXXXXXOOOOOXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXOOOXXXXXXXXXXXOOOOXXOOXXOOOOXXOOOOOOOOOOOXXOOOOOOOOOOXXOOOXXXXXXXXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXOOOXXXXXXXXXXXXOOOOXXXXXXOOOOXXOOOOOXXXXXXXXOOOOOOOOXXXXOOOXXXXXOXXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXOOXOOOXXXXXXXXXXOOOOXXXXXXOOOOXXOOOOXXXXXXXXXOOOOOOOOXXXXOOOXXXXOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXOOXXOOOXXXXXXXXXOOOOXXXXXXOOOOXXOOOOXXXXXXXXXOOOOOOOOOXXXOOOXXXXOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXOOXXXXXOOOXXXXXXXOOOOXXXXXXOOOOXXOOOOXXXXXXXXXOOOXXOOOOOXXOOOXXXXOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXOOOXXXXXXXOOOXXXXXXOOOOXXXXXXOOOOXXOOOOXXXXXXXXXOOOXXXOOOOXXOOOXXXXOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXOOOXXXXXXXXXXOOXXXXXOOOOXXXXXXOOOOXXOOOOXXXXXXXXXOOOXXXXOOOXXOOOXXXXOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOOOOXXXXXXXXXXXXOOOXXXOOOOXXXXXXOOOOXXOOOOXXXXXXXXXOOOXXXXOOOXXOOOOXOOOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXOOXXXOOOOXXXXXXOOOOXXOOOOOXXXXOOXXOOOXXXXOOOXXOOOOOOOOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXOOOOXXXXXXOOOOXXOOOOOOOOOOOXXOOOXXXXOOOXXOOOOOOOOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXOOOOXXXXXXOOOOXXOOOOOOOOOOOXXOOOXXXXOOOXXOOOOOOOOOOXXXXXOOOXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXOOOXXXXXXOOOXXXXOOOOOOOOOXXXOOOXXXXXOXXXXXOOOOOOOXXXXXXXOXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOTTTTTTTTTTTT",
  "TTOOOOOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOOOOTTTTTTTTTTTT",
  "TTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTTTTTTTT",
  "TTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTTTTTTTTT",
  "TTTTTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
]);



const GB_IDLE_MAP = [
  "...................KKK...................",
  "..................KKWKK..................",
  "..................KpWpK..................",
  "..................KpWpK..................",
  "..................KpWpK..................",
  ".................KKWWWKK.................",
  ".........KKKK....KpWWWpK....KKKK.........",
  "........KKWpK...KKWWWWWKK...KpWKK........",
  "........KpWpK..KKWWWWWWWKK..KpWpK........",
  ".......KKWWpK..KpWWWWWWWpK..KpWWKK.......",
  ".......KpWWpK.KKWWWWWWWWWKK.KpWWpK.......",
  "......KKWWWKKKKWWWWWWWWWWWKKKKWWWKK......",
  "......KWWWWKWKpWWWWWWWWWWWpKWKWWWWK......",
  ".....KKWWWWKKKWWWWWWWWWWWWWKKKWWWWKK.....",
  "....KKpWWWWpWWWWWWWWWWWWWWWWWpWWWWpKK....",
  "....KpWWWppWWWWWWWWWWWWWWWWWWWppWWWpK....",
  "...KKpWWWppWWWWWWWWWpWWWWWWWWWppWWWpKK...",
  "...KppWWWWWWWWWWWWWWpWWWWWWWWWWWWWWppK...",
  "..KKWWWWWWWWWWWWWWWWpWWWWWWWWWWWWWWWWKK..",
  "..KpWWWpWWWWWWWWWWWWpWWWWWWWWWWWWpWWWpK..",
  "..KWWWWpWWKKKKpWWWWWKWWWWWpKKKKWWpWWWWK..",
  "..KWWWWKWKKKKKKpWWWWKWWWWpKKKKKKWKWWWWK..",
  "..KWWWKpWKKKKKKKWWWWKWWWWKKKKKKKWpKWWWK..",
  "..KpWWKWWKKKKKKKpWWWKWWWpKKKKKKKWWKWWpK..",
  "..KKWWKWWKKKKKKKpWWWKWWWpKKKKKKKWWKWWKK..",
  "...KWWKWWKKKpppKKWWWKWWWKKpppKKKWWKWWK...",
  "...KWWKWWKKKpKKpKpWWKWWpKpKKpKKKWWKWWK...",
  "KKKKpWKpWpKKWKKKpKWWKWWKpKKKWKKpWpKWpKKKK",
  "KpKKpWpKWWKKWWKKWKpWKWpKWKKWWKKWWKpWpKKpK",
  "KpWKpWpKWWWKKKWWWKpWKWpKWWWKKKWWWKpWpKWpK",
  "KKWKpWWKKWWppKKKKKpWKWpKKKKKppWWKKWWpKWKK",
  ".KpWppWKKWWWWWWpppWpKpWpppWWWWWWKKWppWpK.",
  ".KKWppWKKpWWWWWWWWWpKpWWWWWWWWWpKKWppWKK.",
  "..KWWWWKKpWWWWWWWWWKKKWWWWWWWWWpKKWWWWK..",
  "..KKWWWpKKWWWWWWWWpKKKpWWWWWWWWKKpWWWKK..",
  "...KKpWWKKKWKKWpWWpKKKpWWpWKKWKKKWWpKK...",
  "....KKpWpKKpKKWKWWWpWpWWWKWKKpKKpWpKK....",
  ".....KKWWKKpKKKKWWWWWWWWWKKKKpKKWWKK.....",
  "......KKWWKpKKKKKWWpKpWWKKKKKpKWWKK......",
  ".......KpWWpKKKKKWWKKKWWKKKKKpWWpK.......",
  ".......KKWWpWKKKKWKKKKKWKKKKWpWWKK.......",
  "........KKWWWKWKKpKKKKKpKKWKWWWKK........",
  ".........KKWWpWKKKKpKpKKKKWpWWKK.........",
  "..........KKpWWpKKKpKpKKKpWWpKK..........",
  "...........KKpp...ppKpp...ppKK...........",
  "............KKKp...pKp...pKKK............",
  "..............KKp..KKK..pKK..............",
];
const GB_FIRE_MAP = [
  "..................KKK.KKK..................",
  "..................KpK.KpK..................",
  "..................KpK.KpK..................",
  "..................KpK.KpK..................",
  "..................KpK.KpK..................",
  ".................KKWK.KWKK.................",
  ".........KKKK....KpWK.KWpK....KKKK.........",
  "........KKWpK...KKWWK.KWWKK...KpWKK........",
  "........KpWpK..KKWWWK.KWWWKK..KpWpK........",
  ".......KKWWpK..KpWWWK.KWWWpK..KpWWKK.......",
  ".......KpWWpK.KKWWWWK.KWWWWKK.KpWWpK.......",
  "......KKWWWKKKKWWWWWK.KWWWWWKKKKWWWKK......",
  "......KWWWWKWKpWWWWWK.KWWWWWpKWKWWWWK......",
  ".....KKWWWWKKKWWWWWWK.KWWWWWWKKKWWWWKK.....",
  "....KKpWWWWpWWWWWWWWK.KWWWWWWWWpWWWWpKK....",
  "....KpWWWppWWWWWWWWWK.KWWWWWWWWWppWWWpK....",
  "...KKpWWWppWWWWWWWWWK.KWWWWWWWWWppWWWpKK...",
  "...KppWWWWWWWWWWWWWWK.KWWWWWWWWWWWWWWppK...",
  "..KKWWWWWWWWWWWWWWWWK.KWWWWWWWWWWWWWWWWKK..",
  "..KpWWWpWWWWWWWWWWWWK.KWWWWWWWWWWWWpWWWpK..",
  "..KWWWWpWWKKKKpWWWWWK.KWWWWWpKKKKWWpWWWWK..",
  "..KWWWWKWKKKKKKpWWWWK.KWWWWpKKKKKKWKWWWWK..",
  "..KWWWKpWKKKKKKKWWWWK.KWWWWKKKKKKKWpKWWWK..",
  "..KpWWKWWKKKKKKKpWWWK.KWWWpKKKKKKKWWKWWpK..",
  "..KKWWKWWKKKKKKKpWWWK.KWWWpKKKKKKKWWKWWKK..",
  "...KWWKWWKKKpppKKWWWK.KWWWKKpppKKKWWKWWK...",
  "...KWWKWWKKKWWWpKpWWK.KWWpKpWWWKKKWWKWWK...",
  "KKKKpWKpWpKKWWWWpKWWK.KWWKpWWWWKKpWpKWpKKKK",
  "KpKKpWpKWWKKWWWWWKpWK.KWpKWWWWWKKWWKpWpKKpK",
  "KpWKpWpKWWWKKKWWWKpWK.KWpKWWWKKKWWWKpWpKWpK",
  "KKWKpWWKKWWppKKKKKpWK.KWpKKKKKppWWKKWWpKWKK",
  ".KpWppWKKWWWWWWpppWpK.KpWpppWWWWWWKKWppWpK.",
  ".KKWppWKKpWWWWWWWWWpK.KpWWWWWWWWWpKKWppWKK.",
  "..KWWWWKKpWWWWWWWWWKK.KKWWWWWWWWWpKKWWWWK..",
  "..KKWWWpKKWWWWWWWWpKK.KKpWWWWWWWWKKpWWWKK..",
  "...KKpWWKKKWKKWpWWpKK.KKpWWpWKKWKKKWWpKK...",
  "....KKpWpKKpKKWKWWWpK.KpWWWKWKKpKKpWpKK....",
  ".....KKWWKKpKKKKWWWWK.KWWWWKKKKpKKWWKK.....",
  "......KKWWKpK..KKWWpK.KpWWKK..KpKWWKK......",
  ".......KpWWpK..KWWpKK.KKpWWK..KpWWpK.......",
  ".......KKWWKK..KWKKK...KKKWK..KKWWKK.......",
  "........KpWpK..KpK.......KpK..KpWWK........",
  "........KpWpK..KKK.......KKK..KpWpK........",
  "....KKKKKpWWK.................KWWpKKKKK....",
  "....KpWKWpWWK.................KWWpWKWpK....",
  "....KKWKWpWWK.................KWWpWKWKK....",
  ".....KWWWpWWK.................KWWpWWWK.....",
  ".....KKWWWWWK.................KWWWWWKK.....",
  "......KpWWWpK.................KpWWWpK......",
  "......KKppppK.................KppppKK......",
  ".......KKKKKK.................KKKKKK.......",
];

// Gaster Blaster (extracted from the user's gb.jpg): idle + firing frames
export const GB_IDLE = spriteFromMap(GB_IDLE_MAP);
export const GB_FIRE = spriteFromMap(GB_FIRE_MAP);

// Insanity: 夹克染成深红(决心的颜色)——AU 起源是 Gaster 的决心注入实验
const INSANITY_WALK = {};
for (const dir of Object.keys(SANS_WALK)) {
  INSANITY_WALK[dir] = SANS_WALK[dir].map((f) =>
    recolorSprite(f, {
      [HOOD]: "#a01822",
      [HOOD_DARK]: "#5e0c12",
      [SLIPPER]: "#e08585",
      [SLIPPER_DARK]: "#a04848",
    }),
  );
}

// 黑客结局: 衣色暗淡的 sans(黑屋守门人),眼里红光在绘制时用红辉光近似
const HACKER_WALK = {};
for (const dir of Object.keys(SANS_WALK)) {
  HACKER_WALK[dir] = SANS_WALK[dir].map((f) =>
    recolorSprite(f, {
      [HOOD]: "#3a4356",
      [HOOD_DARK]: "#232a3a",
      [SLIPPER]: "#8a8f9c",
      [SLIPPER_DARK]: "#5c616e",
    }),
  );
}

export const WALK_SETS = {
  sans: SANS_WALK,
  ukb: SANS_WALK, // same look as sans; a purple glow is added at draw time
  horror: HORROR_WALK,
  hard: SANS_WALK, // hard mode: sans look with a blue glow at draw time
  insanity: INSANITY_WALK,
  hacker: HACKER_WALK,
};

// ---- Enemies ------------------------------------------------------------
export const ENEMY_SLIME = sprite(16, 16, [
  [5, 6, 6, 1, "#4caf50"],
  [3, 7, 10, 1, "#4caf50"],
  [2, 8, 12, 5, "#4caf50"],
  [4, 13, 8, 1, "#4caf50"],
  [6, 14, 4, 1, "#357a38"],
  [4, 7, 2, 1, "#8de08f"],
  [5, 9, 2, 2, "#123314"],
  [9, 9, 2, 2, "#123314"],
]);

// Froggit: upright head with big eye lobes + a small droopy body below
// Froggit, extracted from the user's froggit.jpeg (downsampled to native res)
export const ENEMY_FROGGIT = spriteFromMap([
  ".....WWWWW......WWWWW....",
  "....WWWWWWW....WWWWWWW...",
  "....WWKKKWWW...WWWKKWWW..",
  "...WWKKKKKWW..WWWWKKWWW..",
  "...WWKKKKKWW..WWKKKKKWW..",
  "...WWKKKWWWKWWKWWKKKKWW..",
  "...WWWWWWWWKWWKWWWWWKWW..",
  "..WWWWWWWWWWWWWWWWWWWWW..",
  ".WWWWWWWKKKKWWKKKKWWWWWW.",
  "WWWWWKKKKKKKKKKKKKKWWWWWW",
  "WWWWWKKWWWWWWWWWWWKKKWWWW",
  "WWWWWWWWWWWWWWWWWWWWWWWWW",
  ".WWWWWWWWWWWWWWWWWWWWWWW.",
  "...WWWWWWWWWWWWWWWWWW....",
  ".........................",
  "......WW........W........",
  ".....WWWWWWWWWWWWWW......",
  "....WWWWWWKKWWWWWWWW.....",
  "....WWWWKKKKKWKWWWWW.....",
  "....WWWWKWWWWWKWWWWW.....",
  "....WWWWWWWWWWWWWWWW.....",
  "....WWW..W...W..WWWW.....",
  "....WWW.WKW..KK..WWW.....",
  "....WWW.WW...WW..WWWW....",
  "..WWWWW.W..W..W...WWWW...",
  ".WWWWWW...W.W.....WWWWW..",
  ".WWWWW.............WWWW..",
]);

// Whimsun, extracted from the user's whimsun.png
export const ENEMY_WHIMSUN = spriteFromMap([
  ".........Kmm...........mm.........",
  "........KmmKKL........KLKK........",
  ".......KLK..Lm........KKKmm.......",
  ".......LLm..mL.mKLLLLKKK.Lm.......",
  "............mLKKLLLLLLmK.LK.......",
  "mK..........mLLLmLL.LLLm.LLm.....m",
  "mLK.........KLLLmLLLLLLK.LL.....KL",
  "mKLKm.....LKLLKKLLLKLLL.m....mm.LL",
  "mKKLLKm...mL.LKLLLLKK.LLm...mKLKLm",
  ".LLKKLL...LLLKLLLLLLLKLLm..KLKLKKm",
  ".mLKKKLmK.LLLLLLmLLLLLLLLLLm.K.Lm.",
  "..KKKLLLK.LLLLLLKKLLLLLLLKKLLLKm..",
  "....KKKKm.LLLLLKKKmLLLLLL.mKKK....",
  "..........LLLLKKKKK.LLLLL.........",
  ".........KLLLLLLmKLLLLLLL.........",
  ".........KLLLLLLLLLLLLLLL.........",
  "......mmKLLLLLLLLLLLLLLLLLm.......",
  ".....KLmKLLLKKLLLLKLLLLLm.LK......",
  ".....Lm.LLLKKKLLLKKKLLLLm.Km......",
  ".....LKK.mKLLKLLLKLK.LLLm.Km......",
  ".....mKKLLLLLLLLLLLLLmLLm.LK......",
  ".......LLLLLLLLLLLLLLLKKLLm.......",
  ".......LLLLLLLLLLLLLLLLmm.........",
  ".......LKKLLKKLLKKLLLLLK..........",
  "..........mm..Lm.KLK.LL...........",
  ".............mm...mm..............",
  ".............KK...mK..............",
  ".............KK...mK..............",
  "............KKK...mK..............",
  "...........KLLK...mLL.............",
  "..........mKLL....m.LK............",
  "..........mLKm.....KLK............",
]);

// Woshua / Loox / Ice Cap / Madjick, extracted from the user's images
export const ENEMY_WOSHUA = spriteFromMap([
  "...........mmmmmmmmWm........",
  "..........W.........mW.......",
  ".........W......mW....W......",
  "........mm.....mWmW...Wm.....",
  "........W....m..WWWm..mW.....",
  "........Wm...WWWWWm...mW.....",
  "........Wm....WWWWW...mW.....",
  "........W......mmm....mW.....",
  "........mW..m......m..mW.....",
  "....mWWm.WWm.mm..mm.mmWmm....",
  "..mWWWWWW.m..........Wm.m....",
  ".mWWWWWWWW...........mm.m....",
  ".WWWWWWWWWW..........mm.m....",
  "WmmWWWWWWWWm.........Wm.m....",
  "Wm.WWWWmWWWmm.......mW..m.mWm",
  "WmmWWWm.WWWmWm....mWW...m.WWW",
  "WWWWmWmmWWWm.WWWWWWm....m.mWm",
  "mWWmWmWWWWW...mmmm......m..m.",
  ".WWmmmWWWW..............m..m.",
  "..WWWWWWW...............mmmm.",
  "...mWWWm................m....",
  "........................m....",
  "........m...............m....",
  ".........m.............m.....",
  ".......mm.m...........m......",
  ".......mWm.mm......mmmmW.....",
  "........WWm..mmmmmm..mWm.....",
  "........WWm.........mWW......",
  "......WWWWW........WWWWm.....",
  ".....mm...W.......mm...W.....",
]);

export const ENEMY_LOOX = spriteFromMap([
  ".W.....................W.",
  "Wm.....................mW",
  "WW........mWWWm........WW",
  "WWm....mWWWWWWWWWm....mWW",
  "mWWWmmWWWWWWWWWWWWWmmWWWm",
  ".WWWWWWWWWWWWWWWWWWWWWWW.",
  "..WWWWWWWWW...WWWWWWWWW..",
  "...mWWWWWWW...WWWWWWWm...",
  "....WWW.mWW...WWm.WWW....",
  "W..WWWW..WWm.mWW..WWWW..W",
  "mWWWWWWm.WWW.WWW.mWWWWWWm",
  ".mWWWWWW.WWm.mWm.WWWWWWm.",
  "...WWWWWm.......mWWWWW...",
  "...WWWmmm.......mmmWWW...",
  "...WWmWW.........WWmWW...",
  "...WWWWm.........mWWWW...",
  "...mWWmW.........WmWWm...",
  "....WWWm.........mWWW....",
  ".....WWWm.......mWWW.....",
  "...WmmWWWWWmmmWWWWWmmW...",
  "...WW.mWWWWWWWWWWWm.WW...",
  "...WW...mWWWWWWWm...WW...",
  "..mWW..m.........m..WWm..",
  "..Wmm..WWmm...mmWW..mWW..",
  "..m....mWWW...WWWm....W..",
  ".......mWWm...mWWm.......",
  "........WW.....WW........",
  "........WW.....WW........",
  "........mW.....Wm........",
  ".........m.....m.........",
]);

export const ENEMY_ICECAP = spriteFromMap([
  ".........m.........",
  ".........mm........",
  "........mmm........",
  "........mmm........",
  "........mWWm.......",
  ".......KWmmm.......",
  ".......mWmKW.......",
  ".......mWmKW.......",
  ".......WWmKmm......",
  "......KWWKKmm......",
  "......mWWKKKW....mm",
  "K....KmWWKKKW...mWm",
  "mm...mWWWKKKmm.mmm.",
  "mmm..mWWWmKKmmmWmm.",
  ".mKmKmWWmmKKmWWKm..",
  ".mKmmWWWmKmKKWmmm..",
  ".mmKmWWWWKmKKmKW...",
  ".mmmWWWWmmWmmKWW...",
  ".mmWWWWWmWmmWWWm...",
  ".mWWWWWmmmmmmmKK...",
  ".mWWWWWWWWWWWW.....",
  ".KWWWWWWWWWWWWK....",
  "..WWWWWWWWWWWmmWmm.",
  "..mWWWWmWWmWWmWmm..",
  "...mWWWmmmWWWm.....",
  "....mWWWWWWWmm.....",
  "......mmWWmm.......",
  "......mmWWmK.......",
  "......mmmmK........",
  ".......KKmm........",
]);

export const ENEMY_MADJICK = spriteFromMap([
  "...mmmm................",
  "..mKKKKm...............",
  ".mKKKKKKm..............",
  ".mKmmKKKm..............",
  ".mKmmKKKKm.............",
  ".mKmKKKmWWm............",
  "..mKKKmWWWWm...........",
  "..mKWWWWWWWWmm.........",
  "..mmmWWWmKKmmmm........",
  "...mKmmKKKKmmK.........",
  "....mKmKKmKKKKK........",
  "...mmKmmKKmWWWWm.......",
  "...KmmKmmmWWWmm........",
  ".......mWmmmmmK........",
  "........mWWWWm.........",
  ".......mmKKmKmm........",
  ".......mWmKKmWm........",
  "........mWmKWm.........",
  "........mWmmmm.........",
  "........mWWKWm.........",
  "........mWmmWm.........",
  "........WWWKWWK........",
  ".......mWWWmWWm........",
  "......mWWWmKWWWm.......",
  ".....mWWWm...mWWm......",
  "......Kmm.....mm.......",
  ".....mm.........mmm....",
  ".mmmmKKm.......mKKmmmm.",
  "mmKKmKKm.......mKKmKKKm",
  "mmmKKKmm........mKKKKmm",
  ".mmmmmm..........mmmmm.",
  "...mmm............mm...",
]);

// Jerry & Vegetoid, extracted from the user's jerry.webp / vegatoid.png
export const ENEMY_JERRY = spriteFromMap([
  ".........................KK...........................",
  "........................KLK...........................",
  ".................KLK....KLK...........................",
  ".................KLLKKLLLLLLK.KKK.....................",
  ".................KKLKLLLLLLLLKKLK.....................",
  "...................LLLLLLLKLLLLLK.....................",
  "..................KLLLKLLKLLLLK.......................",
  ".................KLLLLLLLLLLLLK.......................",
  ".................KLLLLLLLLLLLLLK......................",
  ".................KLLLLLLLLLLLLLK......................",
  ".................KLLLLLLLLLLLLLK......................",
  ".................KLLLLLLLLLLLLLK......................",
  ".................LLLLLLLLLLLLLLK......................",
  "................KLLLLLLLLLLLLLLLK.................KKKK",
  "..............KKLLLLLLLKLKLLLLLLLKK..............KKLKK",
  ".......KKKLLLLLLLLLLLLLLLLLLLLLLLLLLLLLKKK.......KLLKK",
  "......KLLLLLLLLLLLLLLLKLLKLLLLLLLLLLLLLLLLK.....KLLKK.",
  "KKK...KLLLKLKKKLLLLLLKKKKKKLLLLLLKKKKKKLLLK.....LLK...",
  "KLK...KLLLKKKKKLLLLLLKLKKLKLLLLLLKKKKKKLLLK.....LLK...",
  "KKL...KLLLLLLLLLLLLLLLLLLKLLLLLLLLLLLLLLLLK....KLK....",
  "KKLK...KKLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLKKK.....LLK....",
  "..KLK..KLL.......LK.KLK..KLK.KK........KLLK..KKLK.....",
  "..KLLKKKLK......KLK.KLK..KLK.KKK.......KLLKKKKLLK.....",
  "...KKLLLK......KLK.KLK....LLK.KLK.......KKLLLLKK......",
  "..............KLK..KL.....KLK..KLK....................",
  ".............KLL.KLKK......KKL.KLLK...................",
]);

export const ENEMY_VEGETOID = spriteFromMap([
  "............Km............",
  ".........mm.K..mmL........",
  "......mKKK.K.LK..KKKm.....",
  "......KKKLmLKLKKKLKKm.....",
  "....mKLLLKKKKLKKLKLLLKm...",
  "....KmmmKmmKKLKKmKKmmmm...",
  "...mLmKKLKLKKLKKKLLKKLLm..",
  "...mK...mLLKKLmLmK....Km..",
  ".........KLKLKLKLK....mK..",
  "..........LKLKLKLL........",
  ".....KLLKKKKKKKKKKKLL.....",
  "..KLLLLLLLKKKKKKKLLLLLLKK.",
  ".mLLLLLLLLLLLLLLLLLLLLLLL.",
  ".LLLLLLLLLLLLLLLLLLLLLLLLK",
  "KLLLLLLLLLLLLLLLLLLLLLLLLL",
  "KLLLLLLKKKLLLLLLLKKLLLLLLL",
  "KLLLLLKKKKmLLLLLmKKKmLLLLL",
  "KLLLLLKKKKKLLLLLKKKKKLLLLL",
  "KLLLKLKKLKKLLLLLKKLKKLKLLL",
  ".LLLKmLLL.KLLLLLKLLLLLKLLK",
  ".LLLLmLLLLKLLLLLKLLLLmKLL.",
  ".mLLLKLLLLLLLLLLLLLLLKLLK.",
  ".mLLLLKLLLLLLLLLLLLLKKLLK.",
  ".mKLLLKmLLLLLLLLLLLKKLLLK.",
  "..KLLLKKLLLLKLmKLLLKKLLmm.",
  "...mLLmKmLLmmLLKmLLKLLLK..",
  "...mLLLKKKLLLLLLLLKLLLL...",
  "....mLLLKKLLLLLLLKKLLLm...",
  "....KmLLLKLLLLLLLKLLLKm...",
  ".....KLLLKKLLLLLLKLLLK....",
  "......LLLLKKLLKKKLLLK.....",
  "......K.LLKKKKKKmLL.m.....",
  ".......KLLLLKKmLLLLK......",
  ".......mLLLLLLLLLLLm......",
  "........mmLLLLLLLKm.......",
  ".........KLLLLLLLK........",
  "..........mmmmmK..........",
]);

export const ENEMY_BAT = sprite(16, 16, [
  [0, 8, 4, 2, "#4f2f7d"],
  [1, 7, 5, 3, "#7a4fb5"],
  [12, 7, 5, 3, "#7a4fb5"],
  [12, 8, 4, 2, "#4f2f7d"],
  [6, 6, 1, 2, "#9a6fd0"],
  [9, 6, 1, 2, "#9a6fd0"],
  [6, 7, 4, 5, "#9a6fd0"],
  [6, 9, 1, 1, "#ffe066"],
  [9, 9, 1, 1, "#ffe066"],
]);

export const ENEMY_GHOST = sprite(16, 16, [
  [6, 3, 4, 1, "#e6e6fa"],
  [4, 4, 8, 1, "#e6e6fa"],
  [3, 5, 10, 6, "#e6e6fa"],
  [3, 11, 2, 1, "#e6e6fa"],
  [7, 11, 2, 1, "#e6e6fa"],
  [11, 11, 2, 1, "#e6e6fa"],
  [5, 7, 2, 2, "#2b2b3d"],
  [9, 7, 2, 2, "#2b2b3d"],
]);

export const ENEMY_RED = sprite(16, 16, [
  [5, 6, 6, 1, "#e85050"],
  [3, 7, 10, 1, "#e85050"],
  [2, 8, 12, 5, "#e85050"],
  [4, 13, 8, 1, "#e85050"],
  [6, 14, 4, 1, "#8f1d1d"],
  [4, 7, 2, 1, "#ff9a8a"],
  [5, 9, 2, 2, "#3d0808"],
  [9, 9, 2, 2, "#3d0808"],
]);

export const ENEMY_ORANGE = sprite(16, 16, [
  [5, 3, 6, 1, "#ff9a3c"],
  [3, 4, 10, 1, "#ff9a3c"],
  [2, 5, 12, 6, "#ff9a3c"],
  [2, 10, 12, 2, "#b3641a"],
  [3, 12, 10, 1, "#b3641a"],
  [5, 13, 6, 1, "#7a4210"],
  [4, 6, 8, 1, "#b3641a"],
  [5, 7, 2, 2, "#4a2404"],
  [9, 7, 2, 2, "#4a2404"],
]);

export const ENEMY_BLUE = sprite(16, 16, [
  // spikes
  [7, 0, 2, 2, "#7cc4ff"],
  [0, 7, 2, 2, "#7cc4ff"],
  [14, 7, 2, 2, "#7cc4ff"],
  [7, 14, 2, 2, "#7cc4ff"],
  [2, 2, 2, 2, "#7cc4ff"],
  [12, 2, 2, 2, "#7cc4ff"],
  [2, 12, 2, 2, "#7cc4ff"],
  [12, 12, 2, 2, "#7cc4ff"],
  // body
  [5, 3, 6, 10, "#3f8fe0"],
  [3, 5, 10, 6, "#3f8fe0"],
  [6, 7, 1, 2, "#08243d"],
  [9, 7, 1, 2, "#08243d"],
]);

export const ENEMY_PURPLE = sprite(16, 16, [
  [6, 2, 4, 1, "#b45de8"],
  [5, 3, 6, 2, "#b45de8"],
  [4, 5, 8, 4, "#b45de8"],
  [3, 9, 10, 3, "#b45de8"],
  [2, 12, 12, 1, "#b45de8"],
  [6, 5, 4, 3, "#3a1152"],
  [6, 6, 1, 1, "#ff5df0"],
  [9, 6, 1, 1, "#ff5df0"],
  [3, 13, 2, 1, "#b45de8"],
  [7, 13, 2, 1, "#b45de8"],
  [11, 13, 2, 1, "#b45de8"],
]);

export const ENEMY_TANK = sprite(16, 16, [
  [5, 1, 6, 1, "#ffd54a"],
  [3, 2, 10, 1, "#ffd54a"],
  [2, 3, 12, 8, "#ffd54a"],
  [2, 9, 12, 2, "#c79a2e"],
  [3, 11, 10, 1, "#c79a2e"],
  [4, 12, 8, 1, "#8f6d1d"],
  // shell studs
  [4, 3, 2, 1, "#c79a2e"],
  [10, 3, 2, 1, "#c79a2e"],
  [7, 2, 2, 1, "#c79a2e"],
  // eyes
  [5, 5, 2, 3, "#3d2e08"],
  [9, 5, 2, 3, "#3d2e08"],
  [5, 5, 1, 1, "#ffffff"],
  [9, 5, 1, 1, "#ffffff"],
]);

// ---- Projectile ----------------------------------------------------------
export const PROJECTILE_BONE = sprite(8, 8, [
  [1, 3, 6, 2, "#f2ead8"],
  [0, 2, 2, 4, "#f2ead8"],
  [6, 2, 2, 4, "#f2ead8"],
  [0, 2, 2, 1, "#c9bd9a"],
  [6, 2, 2, 1, "#c9bd9a"],
]);

export const PROJECTILE_BONE_BLUE = tintSprite(PROJECTILE_BONE, "#4f9dff");
export const PROJECTILE_BONE_PURPLE = tintSprite(PROJECTILE_BONE, "#9a5df0");
export const PROJECTILE_BONE_RED = tintSprite(PROJECTILE_BONE, "#e04545");
// Insanity(血疯线): 深红=决心过量的颜色,比恐惧传说的亮红更沉
export const PROJECTILE_BONE_CRIMSON = tintSprite(PROJECTILE_BONE, "#b31226", 0.72);

// Insanity 的手掌幻影(加斯特之手系):张开→握合两帧,洞孔是 Gaster 的正史特征
const IHAND_OPEN_MAP = [
  "..C..C..C..",
  ".CWC.CWC.CW",
  ".CWCCCWCCCW",
  "..CWWWWWWC.",
  "C.CWWKKWWC.",
  "CWCWWKKWWC.",
  ".CWWWWWWWC.",
  "..CWWWWWC..",
  "...CWWWC...",
  "....CWC....",
  "....CWC....",
];
const IHAND_CLENCH_MAP = [
  "...........",
  "...CCCCC...",
  "..CWWWWWC..",
  ".CWWWWWWWC.",
  ".CWWKKWWWC.",
  ".CWWKKWWWC.",
  ".CWWWWWWWC.",
  "..CWWWWWC..",
  "...CWWWC...",
  "....CWC....",
  "....CWC....",
];
const ihandPalette = { C: "#b31226", W: "#f2ead8", K: "#0a0810" };
export const IHAND_OPEN = iconFromMap(IHAND_OPEN_MAP, ihandPalette);
export const IHAND_CLENCH = iconFromMap(IHAND_CLENCH_MAP, ihandPalette);
// 深红龙骨炮:复用 GB 帧,决心红覆膜
export const GB_IDLE_CRIMSON = tintSprite(GB_IDLE, "#b31226", 0.38);
export const GB_FIRE_CRIMSON = tintSprite(GB_FIRE, "#b31226", 0.38);

// ---- Pickups ---------------------------------------------------------
// Inverted hearts (monster-soul style): point at the top, lobes below.
// Drawn with anti-aliased vector shapes on a 16px canvas so they stay smooth.
function heartSprite(color) {
  const c = makeCanvas(16, 16);
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(8, 1.5);
  ctx.lineTo(14.4, 10);
  ctx.lineTo(1.6, 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4.9, 10.4, 3.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(11.1, 10.4, 3.3, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

export const PICKUP_XP = heartSprite("#ffffff");
// equipment hearts use muted tones so they don't outshine the soul drops
export const PICKUP_ATK = heartSprite("#c25454");
export const PICKUP_RANGE = heartSprite("#c2a04e");
export const PICKUP_RAPID = heartSprite("#5eb96a"); // 攻速: green
export const PICKUP_SPEED = heartSprite("#6da3c4");
export const PICKUP_HEART = heartSprite("#c26e98");
export const PICKUP_CORE = heartSprite("#6182c4");

export function drawSprite(ctx, canvas, cx, cy, drawSize) {
  ctx.imageSmoothingEnabled = false;
  const scale = drawSize / Math.max(canvas.width, canvas.height);
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  ctx.drawImage(canvas, cx - w / 2, cy - h / 2, w, h);
}
