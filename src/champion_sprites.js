// Original-inspired redraws for the endless round champions. These live in a
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

export const CHAMPION_SPRITES = {
  champion_greater_dog: GREATER_DOG,
  champion_mad_dummy: MAD_DUMMY,
  champion_knight_knight: KNIGHT_KNIGHT,
  champion_muffet: MUFFET,
  elite_moldessa: MOLDESSA,
  elite_migospel: MIGOSPEL,
  champion_royal_guards: ROYAL_GUARDS,
  champion_mettaton_ex: METTATON_EX,
};
