// Original-inspired redraws for endless champions and named elites. These live in a
// separate module so the hand-tuned legacy pixel data in sprites.js stays
// untouched. Each character is built from a tiny palette and hard pixel rows.

function pixelSprite(rows, palette) {
  const width = Math.max(...rows.map((row) => row.length));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = rows.length;
  const ctx = canvas.getContext("2d");
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const color = palette[rows[y][x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

const GREATER_DOG = pixelSprite(
  [
    "        WWWW            ",
    "       WDDDDW       S    ",
    "      WDWDDWDW      S    ",
    "      WDDWWDDW      S    ",
    "       WDDDDW       S    ",
    "        WBBW        S    ",
    "      WWWWWWWW      S    ",
    "     WBBBBBBBBW    SSS   ",
    "    WBBWWWWWWBBW    S    ",
    "   WBBWBBBBWBBBW    S    ",
    "   WBBWBBBBWBBBW    S    ",
    "   WBBBBBBBBBBBW    S    ",
    "    WBBWWWWBBBW     S    ",
    "     WBBBBBBW       S    ",
    "      WBBBBW       SSS   ",
    "      WBBBBW        S    ",
    "     WWW  WWW       S    ",
    "    WBBW  WBBW      S    ",
    "    WWWW  WWWW      S    ",
  ],
  { W: "#f4f5ef", D: "#24212d", B: "#8fa9c8", S: "#d9ecff" }
);

const MAD_DUMMY = pixelSprite(
  [
    "       YYYYYY       ",
    "     YYOOOOOOYY     ",
    "    YOODDOODDOOY    ",
    "    YODWDOODWDOY    ",
    "    YOODDOODDOOY    ",
    "     YOOODOOOY      ",
    "      YYDDYY        ",
    "       YOOY         ",
    "     YYYYYYYY       ",
    "    YYOOOOOOYY      ",
    "   YYODODODODOYY    ",
    "   YOOODODODOOOY    ",
    "   YOOOOOOOOOOOY    ",
    "    YOOOOOOOOOY     ",
    "     YOOOOOOY       ",
    "      YOOOOY        ",
    "       YOOY         ",
    "      YYYYYY        ",
  ],
  { Y: "#ffd166", O: "#d8893f", D: "#2a1f2d", W: "#fff7df" }
);

const KNIGHT_KNIGHT = pixelSprite(
  [
    "          CCCC       ",
    "        CCPPPC       ",
    "       CPPPPC        ",
    "      CPPPPC         ",
    "      CPPPCCCC       ",
    "     CPPDDDDPPC      ",
    "     CPDWWDDPPC      ",
    "     CPPDDPPPPC      ",
    "      CPPPPPPC       ",
    "      CDDDDDCC       ",
    "     CCPPPPPPCC      ",
    "    CPPPPPPPPPPC     ",
    "    CPPDPPPPDPPC     ",
    "    CPPPPPPPPPPC     ",
    "     CPPPPPPPPC      ",
    "      CPPPPPPC       ",
    "      CPPPPPC        ",
    "     CCPP CPPCC      ",
    "    CPPPC CPPPPC     ",
    "    CCCCC CCCCC      ",
  ],
  { C: "#e8e1ff", P: "#7463a8", D: "#211c2d", W: "#9ff4ff" }
);

const MUFFET = pixelSprite(
  [
    "    RR       RR      ",
    "   RPRR     RRPR     ",
    "    PPPPPPPPP        ",
    "   PPDPPPPPDPP       ",
    "   PPWPPDPPWPP       ",
    "    PPPPPPPPP        ",
    "     PPRRRPP         ",
    "      PRRRP          ",
    "   PP  RRR  PP       ",
    "  PP PPRRRPP PP      ",
    " PP   RRRRR   PP     ",
    "P    RRRRRRR    P    ",
    " PP  RRRRRRR  PP     ",
    "   PPRRRRRRRPP       ",
    "    RRRRRRRRR        ",
    "     RR   RR         ",
    "    PP     PP        ",
    "   PPP     PPP       ",
  ],
  { P: "#d7a0ff", R: "#b93d68", D: "#2a182f", W: "#fff2ff" }
);

const MOLDESSA = pixelSprite(
  [
    "      GGGGGG      ",
    "    GGGLLLGGG     ",
    "   GGLLLLLLLGG    ",
    "  GGLLGLLGLLLGG   ",
    "  GLLLWLLLWLLLLG  ",
    " GGLLLLDLLLLLLLGG ",
    " GLLDLLLLLLLDLLLG ",
    " GLLLLWWWWWLLLLLG ",
    " GGLLLLLLLLLLLLGG ",
    "  GLLLLLLLLLLLLG  ",
    "  GGLLLGGLLLLGG   ",
    "   GGGG  GGGG     ",
    "   GG      GG      ",
  ],
  { G: "#4b8f58", L: "#9fe08d", D: "#26372a", W: "#f4f5ef" }
);

const MIGOSPEL = pixelSprite(
  [
    "      P   P       ",
    "     PP   PP      ",
    "   WWPPPPPWW      ",
    "  WWPPPPPPPWW     ",
    "  WPPDPPPDPPW     ",
    "   PPPWPPPPP      ",
    "    PPPDPPP       ",
    " WWPPPPPPPPPWW    ",
    "W WPPPPPPPPPW W   ",
    " WWPPPPPPPPPWW    ",
    "   PPPPPPPPP      ",
    "    PP   PP       ",
    "   PPP   PPP      ",
  ],
  { P: "#ff8fbf", W: "#f8f0dc", D: "#2b2030" }
);

const ROYAL_GUARDS = pixelSprite(
  [
    "   O            R      ",
    "  ODD          DDR     ",
    " ODDDD        DDDDR    ",
    "ODWDDD        DDDWDR   ",
    " ODDDD        DDDDR    ",
    "  ODDO        RDDR     ",
    " OOOOOO      RRRRRR    ",
    "ODDDDDDO    RDDDDDDR   ",
    "ODWDDWDO    RDWDDWDR   ",
    "ODDDDDDO    RDDDDDDR   ",
    " ODDDDO      RDDDDR    ",
    "  ODDO        RDDR     ",
    "  O  O        R  R     ",
    " OO  OO      RR  RR    ",
  ],
  { O: "#ff9f6e", R: "#ef6d6d", D: "#25232b", W: "#f5f2e8" }
);

const METTATON_EX = pixelSprite(
  [
    "       PPPP        ",
    "      PWWWWP       ",
    "      PWDDWP       ",
    "       PDDP        ",
    "     PPPPPPPP      ",
    "    PPDDPPDDPP     ",
    "   PP DPPPPD PP    ",
    "      DPPPPD       ",
    "      DPPPPD       ",
    "       PPPP        ",
    "       P  P        ",
    "      PP  PP       ",
    "     PP    PP      ",
    "    PP      PP     ",
    "   WWW      WWW    ",
  ],
  { P: "#ff78b8", D: "#27222e", W: "#f8f0f5" }
);

const AARON = pixelSprite(
  [
    "       TTTT          ",
    "      TWWWWT         ",
    "     TTWDDWTT        ",
    "      TWWWWT         ",
    "       TTTT          ",
    "   TT TCCCCCT TT     ",
    "  TCCCTCCCCCTCCCT    ",
    " TCCCCCCCCCCCCCCCT   ",
    " TCCTCCCCCCCTCCCT    ",
    "  TT TCCCCCT TT      ",
    "     TCCCCCCT        ",
    "     TCCTCCCT        ",
    "     TCCCCCCT        ",
    "      TCCCCCT        ",
    "      TT  TT         ",
    "     TTT  TTT        ",
  ],
  { T: "#266d72", C: "#62d5d0", W: "#eefbf8", D: "#20272d" }
);

const PYROPE = pixelSprite(
  [
    "       YYYY          ",
    "      YOOOY          ",
    "     YORROY          ",
    "    YORWWROY         ",
    "    YORRRROY         ",
    "     YOOOY           ",
    "    YYOROYY          ",
    "   YORRRRROY         ",
    "  YOROYYOROY         ",
    " YOROY  YOROY        ",
    "YOROY    YOROY       ",
    " YOOY    YOOY        ",
    "  YY      YY         ",
  ],
  { Y: "#ffd166", O: "#ff8a3d", R: "#b83b28", W: "#fff4d8" }
);

const GLYDE = pixelSprite(
  [
    "        YYYY          ",
    "      YYWWWWYY        ",
    "    YYWWWWWWWWYY      ",
    "   YWWDWWWWWWDWWY     ",
    "  YWWWWWWWWWWWWWWY    ",
    " YYWWWWDDDDWWWWWWYY   ",
    "YFFWWWDWWWWDWWWFFFWY  ",
    " YYWWWWDDDDWWWWWWYY   ",
    "   YWWWWWWWWWWWWY     ",
    "    YYWWWWWWWWYY      ",
    "      YYY  YYY        ",
    "       Y    Y         ",
  ],
  { Y: "#e2bd42", W: "#fff0a8", D: "#30283a", F: "#f7d85c" }
);

const SO_SORRY = pixelSprite(
  [
    "        BBBB          ",
    "      BBPPPPBB        ",
    "     BPWWWWWWPB       ",
    "    BPWDBBBDWPB       ",
    "    BPWWWWWWWPB       ",
    "     BPPDDPPPB        ",
    "      BPPPPPB         ",
    "     BBBBBBBBB        ",
    "    BPPPPPPPPPB       ",
    "   BPBPPPPPPPBPB      ",
    "   BBPPPPPPPPPBB  BBB ",
    "    BPPPPPPPPPB BBPBB ",
    "     BPPPPPPPB BBPBB  ",
    "      BBPBPBB   BBB   ",
    "      BB   BB         ",
    "     BBB   BBB        ",
  ],
  { B: "#416ea8", P: "#9abfff", W: "#f7f1e5", D: "#30283a" }
);

const MEMORYHEAD = pixelSprite(
  [
    "      GGGGGGGG       ",
    "    GGWWWWWWWWGG     ",
    "   GWWDWWDDWWDWWG    ",
    "  GWWWWWWWWWWWWWWG   ",
    " GWWDWWDDWWDWWDDWWG  ",
    " GWWWWWWWWWWWWWWWWG  ",
    " GWWDDWWDWWDDWWDWWG  ",
    "  GWWWWWWWWWWWWWWG   ",
    "   GWWDDWWDDWWWWG    ",
    "    GGWWWWWWWWGG     ",
    "      GGGGGGGG       ",
    "        GGG          ",
    "       G   GG        ",
  ],
  { G: "#789b92", W: "#dff8ed", D: "#252a2d" }
);

const REAPER_BIRD = pixelSprite(
  [
    "        WWW          ",
    "      WWWDWW         ",
    "   WWWWWWWWWWWW      ",
    "  WWGWWWWWWWGWWW     ",
    " WWWWWDWWWDWWWWWW    ",
    "WPPWWWWWWWWWWWPPW    ",
    " WPPWWWWWWWWWPPW     ",
    "  WWWWWWWWWWWWW      ",
    "    WWWWWWWWW        ",
    "      WWWWW          ",
    "      WW WW          ",
    "     WW   WW         ",
    "    WW     WW        ",
    "   W         W       ",
  ],
  { W: "#eee8f5", D: "#29232f", G: "#a8f0d0", P: "#c9a8ee" }
);

const ENDOGENY = pixelSprite(
  [
    "   WW      WW        ",
    "  WDDW WW WDDW       ",
    " WWWWWWWWWWWWWW      ",
    "WWDWWWWDDWWWWDWW     ",
    "WWWWWWWWWWWWWWWW     ",
    " WWWWDDDDDDWWWW      ",
    "  WWWWWWWWWWWW       ",
    " WWWWWWWWWWWWWW      ",
    "WWWWWWWWWWWWWWWW     ",
    "WDDWWWWWWWWWWDDW     ",
    " WWWWWWWWWWWWWW      ",
    "   WW      WW        ",
    "  WWWW    WWWW       ",
  ],
  { W: "#e9f5f7", D: "#282b31" }
);

const LEMON_BREAD = pixelSprite(
  [
    "    YYY      YYY     ",
    "   YYDYY    YYDYY    ",
    "  YYYYYYYYYYYYYYYY   ",
    " YYWYWYWYWYWYWYWYY  ",
    " YYYDDDDDDDDDDYYYY  ",
    "  YYYWYWYWYWYWYYY   ",
    "    YYYYYYYYYY      ",
    "   YYYDDDDDDYYY     ",
    "  YYWYWYWYWYWYY     ",
    "  YYYDDDDDDYYYY     ",
    "   YYWYWYWYWYY      ",
    "    YYYYYYYY        ",
    "     YY  YY         ",
    "    YY    YY        ",
  ],
  { Y: "#fff1a8", W: "#fffdf0", D: "#332d31" }
);

// User-supplied canon-style sprite replacements. Source files mix black,
// white and checkerboard backgrounds, so strip only background pixels that
// are connected to an outer edge; enclosed black/white character detail is
// preserved. The generated canvas remains the synchronous fallback for tests
// and for the first frame while the PNG loads.
function externalSprite(file, fallback, background = "dark") {
  if (typeof Image !== "function") return fallback;
  const out = document.createElement("canvas");
  out.width = fallback.width;
  out.height = fallback.height;
  out.getContext("2d").drawImage(fallback, 0, 0);
  const image = new Image();
  image.addEventListener("load", () => {
    const work = document.createElement("canvas");
    work.width = image.naturalWidth || image.width;
    work.height = image.naturalHeight || image.height;
    const workCtx = work.getContext("2d", { willReadFrequently: true });
    workCtx.drawImage(image, 0, 0);
    const frame = workCtx.getImageData(0, 0, work.width, work.height);
    const pixels = frame.data;
    const seen = new Uint8Array(work.width * work.height);
    const queue = [];
    const isBackground = (index) => {
      const at = index * 4;
      if (pixels[at + 3] === 0) return true;
      const red = pixels[at];
      const green = pixels[at + 1];
      const blue = pixels[at + 2];
      if (background === "dark") return red < 86 && green < 86 && blue < 86;
      return red > 174 && green > 174 && blue > 174 && Math.max(red, green, blue) - Math.min(red, green, blue) < 38;
    };
    const enqueue = (x, y) => {
      const index = y * work.width + x;
      if (seen[index] || !isBackground(index)) return;
      seen[index] = 1;
      queue.push(index);
    };
    for (let x = 0; x < work.width; x++) {
      enqueue(x, 0);
      enqueue(x, work.height - 1);
    }
    for (let y = 0; y < work.height; y++) {
      enqueue(0, y);
      enqueue(work.width - 1, y);
    }
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const index = queue[cursor];
      const x = index % work.width;
      const y = Math.floor(index / work.width);
      pixels[index * 4 + 3] = 0;
      if (x > 0) enqueue(x - 1, y);
      if (x + 1 < work.width) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y + 1 < work.height) enqueue(x, y + 1);
    }
    workCtx.putImageData(frame, 0, 0);
    let left = work.width;
    let right = -1;
    let top = work.height;
    let bottom = -1;
    for (let y = 0; y < work.height; y++) {
      for (let x = 0; x < work.width; x++) {
        if (pixels[(y * work.width + x) * 4 + 3] <= 8) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < left || bottom < top) return;
    const pad = 2;
    left = Math.max(0, left - pad);
    top = Math.max(0, top - pad);
    right = Math.min(work.width - 1, right + pad);
    bottom = Math.min(work.height - 1, bottom + pad);
    out.width = right - left + 1;
    out.height = bottom - top + 1;
    out.getContext("2d").drawImage(work, left, top, out.width, out.height, 0, 0, out.width, out.height);
  });
  image.src = new URL(`./assets/monsters/${file}`, import.meta.url).href;
  return out;
}

export const CHAMPION_SPRITES = {
  elite_final_froggit: externalSprite("final_froggit.png", MOLDESSA, "light"),
  elite_whimsalot: externalSprite("whimsalot.png", MIGOSPEL),
  elite_astigmatism: externalSprite("astigmatism.png", GLYDE),
  elite_parsnik: externalSprite("parsnik.png", LEMON_BREAD),
  champion_greater_dog: externalSprite("greater_dog.png", GREATER_DOG),
  champion_mad_dummy: externalSprite("mad_dummy.png", MAD_DUMMY),
  champion_knight_knight: externalSprite("knight_knight.png", KNIGHT_KNIGHT, "light"),
  champion_muffet: externalSprite("muffet.png", MUFFET, "light"),
  elite_moldessa: externalSprite("moldessa.png", MOLDESSA, "light"),
  elite_migospel: externalSprite("migospel.png", MIGOSPEL),
  champion_royal_guards: externalSprite("royal_guards.png", ROYAL_GUARDS),
  champion_mettaton_ex: externalSprite("mettaton_ex.png", METTATON_EX),
  elite_aaron: externalSprite("aaron.png", AARON),
  elite_pyrope: PYROPE,
  champion_glyde: externalSprite("glyde.png", GLYDE),
  champion_so_sorry: SO_SORRY,
  elite_memoryhead: externalSprite("memoryhead.png", MEMORYHEAD),
  elite_reaper_bird: externalSprite("reaper_bird.png", REAPER_BIRD, "light"),
  champion_endogeny: externalSprite("endogeny.png", ENDOGENY),
  champion_lemon_bread: externalSprite("lemon_bread.png", LEMON_BREAD, "light"),
};
