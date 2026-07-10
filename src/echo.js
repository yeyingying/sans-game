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

// ---- 角色残响: two per character, unlocked by mastery (Lv1 / Lv3) ----------
// Each Sans is a different timeline (AU); these are their private echoes.
export const CHAR_ECHOES = [
  {
    id: "sans1",
    charId: "sans",
    lvl: 1,
    color: "#8fd6ff",
    title: "懒骨头的守则",
    hint: "「传说之下」专精 Lv1",
    quote: "* 有些承诺,时间线崩塌也拦不住。",
    lines: ["* 他看起来什么都不在乎。", "* 番茄酱、冷笑话、打瞌睡。", "* 可走廊尽头的审判位,他一次都没有迟到过。", "* ……有些承诺,连时间线崩塌都拦不住。"],
  },
  {
    id: "sans2",
    charId: "sans",
    lvl: 3,
    color: "#8fd6ff",
    title: "给帕派瑞斯",
    hint: "「传说之下」专精 Lv3",
    quote: "* 嘿,老弟。",
    lines: ["* 花听见他在无人时说话。", "* 『嘿,老弟。今天也有人闯过来了。』", "* 『……放心,我给他讲了你最爱的那个笑话。』", "* 『他没笑。你肯定会说他没有幽默感。』", "* 走廊里没有回答。从来没有。"],
  },
  {
    id: "ukb1",
    charId: "ukb",
    lvl: 1,
    color: "#a55dff",
    title: "业报",
    hint: "「因果报应」专精 Lv1",
    quote: "* 审判者只是递送业报。",
    lines: ["* 他的骨头淬着看不见的毒。", "* 那不是魔法——是账。", "* 每一笔被亏欠的正义,都记在上面。", "* 审判者不制造业报。他只是……递送它。"],
  },
  {
    id: "ukb2",
    charId: "ukb",
    lvl: 3,
    color: "#a55dff",
    title: "疲惫的天平",
    hint: "「因果报应」专精 Lv3",
    quote: "* 想找一个不用举起天平的明天。",
    lines: ["* 花问他:审判了这么多次,你恨过吗?", "* 他想了很久。", "* 『恨太重了。我只是……想找一个』", "* 『不用再举起天平的明天。』"],
  },
  {
    id: "horror1",
    charId: "horror",
    lvl: 1,
    color: "#ff5d5d",
    title: "饥饿的雪镇",
    hint: "「恐惧传说」专精 Lv1",
    quote: "* 食物比希望先耗尽。",
    lines: ["* 那条时间线里,女王封锁了核心。", "* 食物,比希望先耗尽。", "* 他头上的洞,是排队领口粮那天留下的。", "* 从那以后,他数东西总是从『一顿』开始数。"],
  },
  {
    id: "horror2",
    charId: "horror",
    lvl: 3,
    color: "#ff5d5d",
    title: "他还记得的事",
    hint: "「恐惧传说」专精 Lv3",
    quote: "* 要保护比我饿的人。",
    lines: ["* 记忆漏得像破了的碗。", "* 弟弟的围巾。烤焦的意面。某个约定。", "* 名字忘了,脸也忘了。", "* 但斧头挥向怪物时,他还记得——", "* 『要保护比我饿的人。』"],
  },
  {
    id: "hard1",
    charId: "hard",
    lvl: 1,
    color: "#5db9ff",
    title: "未完成的世界",
    hint: "「困难模式」专精 Lv1",
    quote: "* 连出场的机会都没等到。",
    lines: ["* 这条时间线,在废墟尽头就被停下了。", "* 制作者说:『难度演示到此为止,谢谢游玩。』", "* 世界另一头的他们,连出场的机会都没等到。", "* ……直到这条走廊,把门重新打开。"],
  },
  {
    id: "hard2",
    charId: "hard",
    lvl: 3,
    color: "#5db9ff",
    title: "蓝色的执念",
    hint: "「困难模式」专精 Lv3",
    quote: "* 让这一小段,谁都忘不掉。",
    lines: ["* 既然世界只给了他半章剧本,", "* 他就把每一招都练到最狠。", "* 蓝骨、重力、龙骨炮——全都超出了『演示』该有的强度。", "* 『如果只能存在一小段……』", "* 『那就让这一小段,谁都忘不掉。』"],
  },
];

export const ALL_ECHOES = [...ECHOES, ...CHAR_ECHOES];

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
  if (unlocked[id] || !ALL_ECHOES.some((e) => e.id === id)) return false;
  unlocked[id] = true;
  store.setItem("metaEchoes", JSON.stringify(unlocked));
  return true;
}

// a remembered line for the game-over screen; null until something is heard
export function unlockedAllEchoCount() {
  return ALL_ECHOES.filter((e) => unlocked[e.id]).length;
}

export function randomEchoQuote() {
  const pool = ALL_ECHOES.filter((e) => unlocked[e.id]);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].quote;
}
