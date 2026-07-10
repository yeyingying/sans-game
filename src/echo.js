// 回响 (Echoes) — Undertale-flavored story fragments. The echo flowers of the
// judgement hall remember every loop; milestones let you hear them again.
// Pixel art here is hand-authored (additive asset — the extracted sprite data
// in sprites.js stays untouched, per the project's frozen-asset rule).

const store =
  typeof localStorage !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {} };

// tiny palette + builder, same technique as sprites.js
const PAL = {
  S: "#3f6d52", // stem
  s: "#2c4f3a", // stem shadow
  B: "#2f6ea8", // deep petal
  L: "#6bd0ff", // bright petal
  W: "#e8f4ff", // core
};

function build(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = PAL[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

// blooming echo flower (unlocked)
export const ECHO_BLOOM = build([
  ".....LL.LL.....",
  "....LWWLWWL....",
  "....LWLLLWL....",
  ".LL.BLWWWLB.LL.",
  "LWWLBLWLWLBLWWL",
  ".LLBBWWWWWBBLL.",
  "...BLWWWWWLB...",
  "....LWWWWWL....",
  ".....BLLLB.....",
  "......S.S......",
  "......SS.......",
  ".....sS........",
  "......Ss.......",
  ".....sS........",
  "......S........",
]);

// closed bud (still waiting to be heard)
export const ECHO_BUD = build([
  "......LL......",
  ".....LWWL.....",
  ".....LBBL.....",
  "......BB......",
  "......LL......",
  "......S.......",
  "......SS......",
  ".....sS.......",
  "......Ss......",
  ".....sS.......",
  "......S.......",
]);

// the ten fragments; lines use Undertale's asterisk dialogue voice
export const ECHOES = [
  {
    id: "stay",
    title: "保持决心",
    hint: "第一次倒下",
    quote: "* 保持决心。",
    lines: ["* 你倒下了。", "* 但走廊尽头的花,替你记住了这一步。", "* ……孩子,失败从来不是终点。", "* 保持决心。"],
  },
  {
    id: "after",
    title: "审判之后",
    hint: "第一次击败天意侵蚀Sans",
    quote: "* 连天意也会化尘。",
    lines: [
      "* 它化成尘的时候,脸上带着笑。",
      "* 和他每次讲完冷笑话时,一模一样。",
      "* ……如果连天意都可以被打倒,",
      "* 那所谓命运,或许只是一段可以改写的台词。",
    ],
  },
  {
    id: "why",
    title: "你为什么留下",
    hint: "第一次选择『继续接受审判』",
    quote: "* 门明明开着。",
    lines: ["* 门开着。战利品是你的,没有人拦你。", "* 可你转身,走回了走廊深处。", "* 回声花轻轻晃了晃:", "* ……你和他,越来越像了。"],
  },
  {
    id: "deeper",
    title: "更深处的声音",
    hint: "无尽审判完成 5 轮",
    quote: "* 有个声音在数数。",
    lines: ["* 第五轮了。", "* 走廊尽头,有个声音在数数。", "* 不是数怪物,也不是数金币。", "* 它在数——你还愿意回来几次。"],
  },
  {
    id: "back",
    title: "你又回来了。",
    hint: "累计进行 20 局",
    quote: "* 你又回来了。",
    lines: ["* 你又回来了。", "* 花已经不再惊讶。", "* 每一次『重新开始』,这里的一切都会忘记你。", "* ……除了我们。"],
  },
  {
    id: "names",
    title: "它们也有名字",
    hint: "击败一名命名精英",
    quote: "* 它们都不是『怪物』。",
    lines: ["* 那个大个子,曾经守过雪镇的门。", "* 那只蝴蝶,在瀑布替迷路的人指过方向。", "* 在天意侵蚀走廊之前——", "* 它们都不是『怪物』。"],
  },
  {
    id: "wd",
    title: "W.D.",
    hint: "地狱难度通关",
    quote: "* 别忘记我。",
    lines: ["* 走廊的裂缝里,有人隔着虚空看了你一眼。", "* 他说的话,碎成了没人认得的符号。", "* 你只听清了最后一句:", "* 『 别  忘  记  我 。』"],
  },
  {
    id: "gift",
    title: "被遗忘者的礼物",
    hint: "32 把武器全部完成进化",
    quote: "* 落款只有两个字母。",
    lines: ["* 三十二种武器,三十二次觉醒。", "* 这些形态,不该存在于任何一条时间线。", "* 是谁把图纸塞进了轮回的缝隙?", "* 落款只有两个字母:W.D."],
  },
  {
    id: "dust",
    title: "尘归尘",
    hint: "屠杀难度通关",
    quote: "* 值得吗?",
    lines: ["* 屠杀线的尽头,走廊安静得可怕。", "* 花问:『值得吗?』", "* 你数了数手里的金币。", "* 花,再也没有说过话。"],
  },
  {
    id: "end",
    title: "回响的尽头",
    hint: "图鉴收集度 100%",
    quote: "* 谢谢你陪我们到最后。",
    lines: [
      "* 你集齐了所有记忆。",
      "* 于是花终于开口,说出第一句不是回声的话:",
      "* 『天意』不在走廊里。",
      "* 它在屏幕的另一侧,握着方向键。",
      "* ……谢谢你,陪我们到最后。",
    ],
  },
];

let unlocked = (() => {
  try {
    const v = JSON.parse(store.getItem("metaEchoes"));
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
})();

export function echoUnlocked(id) {
  return !!unlocked[id];
}

export function unlockedEchoCount() {
  return ECHOES.filter((e) => unlocked[e.id]).length;
}

// true only the first time — callers hang the toast on it
export function unlockEcho(id) {
  if (unlocked[id] || !ECHOES.some((e) => e.id === id)) return false;
  unlocked[id] = true;
  store.setItem("metaEchoes", JSON.stringify(unlocked));
  return true;
}

// a remembered line for the game-over screen; null until something is heard
export function randomEchoQuote() {
  const pool = ECHOES.filter((e) => unlocked[e.id]);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].quote;
}
