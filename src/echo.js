// 回响 (Echoes) — Undertale-flavored story fragments. The echo flowers of the
// judgement hall remember every loop; milestones let you hear them again.
// Pixel art here is hand-authored (additive asset — the extracted sprite data
// in sprites.js stays untouched, per the project's frozen-asset rule).
// EN fields (titleEn/hintEn/quoteEn/linesEn) are re-creations in the English
// fandom's voice, not translations; renderers pick() them by language.

import { currentLang } from "./i18n.js";

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
    titleEn: "Stay Determined",
    hint: "第一次倒下",
    hintEn: "Fall for the first time",
    quote: "* 保持决心。",
    quoteEn: "* Stay determined.",
    lines: ["* 你倒下了。", "* 但走廊尽头的花,替你记住了这一步。", "* ……孩子,失败从来不是终点。", "* 保持决心。"],
    linesEn: [
      "* You fell down.",
      "* But the flower at the hall's end remembered this step.",
      "* ...Child, falling was never the end.",
      "* Stay determined.",
    ],
  },
  {
    id: "after",
    title: "审判之后",
    titleEn: "After the Judgement",
    hint: "第一次击败天意侵蚀Sans",
    hintEn: "Defeat Corrupted Sans for the first time",
    quote: "* 连天意也会化尘。",
    quoteEn: "* Even fate turns to dust.",
    lines: [
      "* 它化成尘的时候,脸上带着笑。",
      "* 和他每次讲完冷笑话时,一模一样。",
      "* ……如果连天意都可以被打倒,",
      "* 那所谓命运,或许只是一段可以改写的台词。",
    ],
    linesEn: [
      "* When he turned to dust, he was smiling.",
      "* The same smile as after every bad joke he ever told.",
      "* ...If even fate can be struck down,",
      "* then destiny is just a line that can be rewritten.",
    ],
  },
  {
    id: "why",
    title: "你为什么留下",
    titleEn: "Why You Stayed",
    hint: "第一次选择『继续接受审判』",
    hintEn: "Choose 'continue the judgement' once",
    quote: "* 门明明开着。",
    quoteEn: "* The door was open.",
    lines: ["* 门开着。战利品是你的,没有人拦你。", "* 可你转身,走回了走廊深处。", "* 回声花轻轻晃了晃:", "* ……你和他,越来越像了。"],
    linesEn: [
      "* The door stood open. The prize was yours to take.",
      "* And you turned around, back into the deep corridor.",
      "* The echo flower swayed gently:",
      "* ...You're getting more and more like him.",
    ],
  },
  {
    id: "deeper",
    title: "更深处的声音",
    titleEn: "A Voice, Deeper Down",
    hint: "无尽审判完成 5 轮",
    hintEn: "Clear 5 rounds of the endless judgement",
    quote: "* 有个声音在数数。",
    quoteEn: "* Something is counting.",
    lines: ["* 第五轮了。", "* 走廊尽头,有个声音在数数。", "* 不是数怪物,也不是数金币。", "* 它在数——你还愿意回来几次。"],
    linesEn: [
      "* Round five.",
      "* At the corridor's end, something is counting.",
      "* Not monsters. Not coins.",
      "* It counts how many times you'll still come back.",
    ],
  },
  {
    id: "back",
    title: "你又回来了。",
    titleEn: "You're Back.",
    hint: "累计进行 20 局",
    hintEn: "Play 20 runs in total",
    quote: "* 你又回来了。",
    quoteEn: "* You're back.",
    lines: ["* 你又回来了。", "* 花已经不再惊讶。", "* 每一次『重新开始』,这里的一切都会忘记你。", "* ……除了我们。"],
    linesEn: [
      "* You're back.",
      "* The flowers aren't surprised anymore.",
      "* Every reset makes this whole world forget you.",
      "* ...Except us.",
    ],
  },
  {
    id: "names",
    title: "它们也有名字",
    titleEn: "They Had Names",
    hint: "击败一名命名精英",
    hintEn: "Defeat a named elite",
    quote: "* 它们都不是『怪物』。",
    quoteEn: "* None of them were 'monsters'.",
    lines: ["* 那个大个子,曾经守过雪镇的门。", "* 那只蝴蝶,在瀑布替迷路的人指过方向。", "* 在天意侵蚀走廊之前——", "* 它们都不是『怪物』。"],
    linesEn: [
      "* That big one once guarded the gate of Snowdin.",
      "* That butterfly guided lost souls through Waterfall.",
      "* Before fate corrupted this corridor —",
      "* none of them were 'monsters'.",
    ],
  },
  {
    id: "wd",
    title: "W.D.",
    titleEn: "W.D.",
    hint: "地狱难度通关",
    hintEn: "Clear HELL difficulty",
    quote: "* 别忘记我。",
    quoteEn: "* Don't forget me.",
    lines: ["* 走廊的裂缝里,有人隔着虚空看了你一眼。", "* 他说的话,碎成了没人认得的符号。", "* 你只听清了最后一句:", "* 『 别  忘  记  我 。』"],
    linesEn: [
      "* Through a crack, someone watched you from the void.",
      "* His words shattered into symbols nobody reads.",
      "* You only caught the last of it:",
      "* 'D O N ' T   F O R G E T   M E .'",
    ],
  },
  {
    id: "gift",
    title: "被遗忘者的礼物",
    titleEn: "A Gift from the Forgotten",
    hint: "32 把武器全部完成进化",
    hintEn: "Evolve all 32 weapons",
    quote: "* 落款只有两个字母。",
    quoteEn: "* Signed with two letters.",
    lines: ["* 三十二种武器,三十二次觉醒。", "* 这些形态,不该存在于任何一条时间线。", "* 是谁把图纸塞进了轮回的缝隙?", "* 落款只有两个字母:W.D."],
    linesEn: [
      "* Thirty-two weapons. Thirty-two awakenings.",
      "* These forms shouldn't exist in any timeline.",
      "* Who slipped the blueprints into the loop?",
      "* The signature is two letters: W.D.",
    ],
  },
  {
    id: "dust",
    title: "尘归尘",
    titleEn: "Dust to Dust",
    hint: "屠杀难度通关",
    hintEn: "Clear GENOCIDE difficulty",
    quote: "* 值得吗?",
    quoteEn: "* Was it worth it?",
    lines: ["* 屠杀线的尽头,走廊安静得可怕。", "* 花问:『值得吗?』", "* 你数了数手里的金币。", "* 花,再也没有说过话。"],
    linesEn: [
      "* At the end of the genocide route, the hall is silent.",
      "* The flower asked: 'Was it worth it?'",
      "* You counted the coins in your hand.",
      "* The flower never spoke again.",
    ],
  },
  {
    id: "end",
    title: "回响的尽头",
    titleEn: "Where Echoes End",
    hint: "图鉴收集度 100%",
    hintEn: "Reach 100% codex completion",
    quote: "* 谢谢你陪我们到最后。",
    quoteEn: "* Thank you for staying to the end.",
    lines: [
      "* 你集齐了所有记忆。",
      "* 于是花终于开口,说出第一句不是回声的话:",
      "* 『天意』不在走廊里。",
      "* 它在屏幕的另一侧,握着方向键。",
      "* ……谢谢你,陪我们到最后。",
    ],
    linesEn: [
      "* You gathered every memory.",
      "* So the flower finally spoke its first un-echoed words:",
      "* 'Fate' is not in this corridor.",
      "* It's on the other side of the screen, at the keys.",
      "* ...Thank you for staying with us to the end.",
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
    titleEn: "The Lazybones Code",
    hint: "「传说之下」专精 Lv1",
    hintEn: "'Classic' Mastery Lv1",
    quote: "* 有些承诺,时间线崩塌也拦不住。",
    quoteEn: "* Some promises outlast collapsing timelines.",
    lines: ["* 他看起来什么都不在乎。", "* 番茄酱、冷笑话、打瞌睡。", "* 可走廊尽头的审判位,他一次都没有迟到过。", "* ……有些承诺,连时间线崩塌都拦不住。"],
    linesEn: [
      "* He looks like he cares about nothing.",
      "* Ketchup. Bad jokes. Naps.",
      "* But the judge's post at the hall's end —",
      "* he has never once been late.",
      "* ...Some promises outlast collapsing timelines.",
    ],
  },
  {
    id: "sans2",
    charId: "sans",
    lvl: 3,
    color: "#8fd6ff",
    title: "给帕派瑞斯",
    titleEn: "For Papyrus",
    hint: "「传说之下」专精 Lv3",
    hintEn: "'Classic' Mastery Lv3",
    quote: "* 嘿,老弟。",
    quoteEn: "* hey, bro.",
    lines: ["* 花听见他在无人时说话。", "* 『嘿,老弟。今天也有人闯过来了。』", "* 『……放心,我给他讲了你最爱的那个笑话。』", "* 『他没笑。你肯定会说他没有幽默感。』", "* 走廊里没有回答。从来没有。"],
    linesEn: [
      "* The flower heard him talk when nobody's around.",
      "* 'hey, bro. another one got through today.'",
      "* '...don't worry. i told them your favorite joke.'",
      "* 'no laugh. you'd say they got no funny bone.'",
      "* The corridor gave no answer. It never does.",
    ],
  },
  {
    id: "ukb1",
    charId: "ukb",
    lvl: 1,
    color: "#a55dff",
    title: "业报",
    titleEn: "Karma",
    hint: "「因果报应」专精 Lv1",
    hintEn: "'Karma' Mastery Lv1",
    quote: "* 审判者只是递送业报。",
    quoteEn: "* The judge only delivers karma.",
    lines: ["* 他的骨头淬着看不见的毒。", "* 那不是魔法——是账。", "* 每一笔被亏欠的正义,都记在上面。", "* 审判者不制造业报。他只是……递送它。"],
    linesEn: [
      "* His bones are steeped in an invisible poison.",
      "* It isn't magic — it's a ledger.",
      "* Every debt owed to justice is written there.",
      "* The judge doesn't make karma. He just... delivers it.",
    ],
  },
  {
    id: "ukb2",
    charId: "ukb",
    lvl: 3,
    color: "#a55dff",
    title: "疲惫的天平",
    titleEn: "The Tired Scales",
    hint: "「因果报应」专精 Lv3",
    hintEn: "'Karma' Mastery Lv3",
    quote: "* 想找一个不用举起天平的明天。",
    quoteEn: "* A tomorrow without the scales.",
    lines: ["* 花问他:审判了这么多次,你恨过吗?", "* 他想了很久。", "* 『恨太重了。我只是……想找一个』", "* 『不用再举起天平的明天。』"],
    linesEn: [
      "* The flower asked him: did you ever learn to hate?",
      "* He thought about it for a long time.",
      "* 'hate is too heavy. i just want to find'",
      "* 'a tomorrow where i don't lift these scales.'",
    ],
  },
  {
    id: "horror1",
    charId: "horror",
    lvl: 1,
    color: "#ff5d5d",
    title: "饥饿的雪镇",
    titleEn: "Hungry Snowdin",
    hint: "「恐惧传说」专精 Lv1",
    hintEn: "'Horror' Mastery Lv1",
    quote: "* 食物比希望先耗尽。",
    quoteEn: "* Food ran out before hope did.",
    lines: ["* 那条时间线里,女王封锁了核心。", "* 食物,比希望先耗尽。", "* 他头上的洞,是排队领口粮那天留下的。", "* 从那以后,他数东西总是从『一顿』开始数。"],
    linesEn: [
      "* In that timeline, the Queen sealed off the CORE.",
      "* Food ran out before hope did.",
      "* The hole in his head is from ration day.",
      "* Ever since, he counts everything in meals.",
    ],
  },
  {
    id: "horror2",
    charId: "horror",
    lvl: 3,
    color: "#ff5d5d",
    title: "他还记得的事",
    titleEn: "What He Still Remembers",
    hint: "「恐惧传说」专精 Lv3",
    hintEn: "'Horror' Mastery Lv3",
    quote: "* 要保护比我饿的人。",
    quoteEn: "* protect the ones hungrier than me.",
    lines: ["* 记忆漏得像破了的碗。", "* 弟弟的围巾。烤焦的意面。某个约定。", "* 名字忘了,脸也忘了。", "* 但斧头挥向怪物时,他还记得——", "* 『要保护比我饿的人。』"],
    linesEn: [
      "* His memory leaks like a cracked bowl.",
      "* A scarf. Burnt spaghetti. Some promise.",
      "* The names are gone. The faces too.",
      "* But when the axe swings, he still remembers —",
      "* 'protect the ones hungrier than me.'",
    ],
  },
  {
    id: "hard1",
    charId: "hard",
    lvl: 1,
    color: "#5db9ff",
    title: "未完成的世界",
    titleEn: "The Unfinished World",
    hint: "「困难模式」专精 Lv1",
    hintEn: "'Hard Mode' Mastery Lv1",
    quote: "* 连出场的机会都没等到。",
    quoteEn: "* They never got their turn on stage.",
    lines: ["* 这条时间线,在废墟尽头就被停下了。", "* 制作者说:『难度演示到此为止,谢谢游玩。』", "* 世界另一头的他们,连出场的机会都没等到。", "* ……直到这条走廊,把门重新打开。"],
    linesEn: [
      "* That timeline was stopped at the end of the Ruins.",
      "* The maker said: 'demo's over. thanks for playing.'",
      "* Everyone past that point never got their turn.",
      "* ...Until this corridor opened the door again.",
    ],
  },
  {
    id: "hard2",
    charId: "hard",
    lvl: 3,
    color: "#5db9ff",
    title: "蓝色的执念",
    titleEn: "A Blue Obsession",
    hint: "「困难模式」专精 Lv3",
    hintEn: "'Hard Mode' Mastery Lv3",
    quote: "* 让这一小段,谁都忘不掉。",
    quoteEn: "* Make this one short chapter unforgettable.",
    lines: ["* 既然世界只给了他半章剧本,", "* 他就把每一招都练到最狠。", "* 蓝骨、重力、龙骨炮——全都超出了『演示』该有的强度。", "* 『如果只能存在一小段……』", "* 『那就让这一小段,谁都忘不掉。』"],
    linesEn: [
      "* The world gave him half a script,",
      "* so he drilled every move to its cruelest edge.",
      "* Blue bones, gravity, blasters — past 'demo' strength.",
      "* 'If I only get to exist for a moment...'",
      "* 'then nobody gets to forget that moment.'",
    ],
  },
  // Insanity(血疯线): AU 起源=Gaster 的决心注入实验——与真实验室暗线同源
  {
    id: "insanity1",
    charId: "insanity",
    lvl: 1,
    color: "#d92535",
    title: "第七号记录",
    titleEn: "Entry Number Seven",
    hint: "「精神错乱」专精 Lv1",
    hintEn: "'Insanity' Mastery Lv1",
    quote: "* 决心没有改变他的身体。",
    quoteEn: "* The determination didn't change his body.",
    lines: ["* 真实验室的记录残页,编号七。", "* 『决心注入后,受试体机能正常。』", "* 『没有融化。没有异变。一切正常。』", "* 『只是他看着我们的眼神……』", "* 记录到这里,被一个红色的指印盖住了。"],
    linesEn: [
      "* A torn page from the True Lab. Entry seven.",
      "* 'Post-injection, the subject functions normally.'",
      "* 'No melting. No mutation. All normal.'",
      "* 'Except the way he looks at us now...'",
      "* The rest is covered by a red thumbprint.",
    ],
  },
  // 黑客结局: 本体彩蛋——黑屋守门人
  {
    id: "hacker1",
    charId: "hacker",
    lvl: 1,
    color: "#e8ecf4",
    title: "黑屋",
    titleEn: "The Dark Room",
    hint: "「黑客结局」专精 Lv1",
    hintEn: "'Hacker Ending' Mastery Lv1",
    quote: "* 你是怎么到这里的?",
    quoteEn: "* How did you get here?",
    lines: ["* 一间不该被到达的房间。", "* 他坐在黑暗里,眼里有一点红光。", "* 『你是怎么到这里的?』", "* 『……算了。反正你已经看到了。』"],
    linesEn: [
      "* A room that was never meant to be reached.",
      "* He sits in the dark, a point of red light in his eye.",
      "* 'How did you get here?'",
      "* '...Whatever. You've already seen it.'",
    ],
  },
  {
    id: "hacker2",
    charId: "hacker",
    lvl: 3,
    color: "#e8ecf4",
    title: "肮脏的守则",
    titleEn: "A Dirty Code of Honor",
    hint: "「黑客结局」专精 Lv3",
    hintEn: "'Hacker Ending' Mastery Lv3",
    quote: "* 想改写世界,先看住门。",
    quoteEn: "* To rewrite the world, first guard the door.",
    lines: ["* 他守了那扇门很多年。", "* 见过每一个想改写世界的『肮脏黑客』。", "* 直到有一天他明白——", "* 想守住这扇门,就得比他们更懂怎么改。"],
    linesEn: [
      "* He guarded that door for years.",
      "* Saw every 'dirty hacker' out to rewrite the world.",
      "* Until one day he understood —",
      "* to guard the door, you must out-hack them all.",
    ],
  },
  {
    id: "insanity2",
    charId: "insanity",
    lvl: 3,
    color: "#d92535",
    title: "还在笑的理由",
    titleEn: "A Reason to Keep Smiling",
    hint: "「精神错乱」专精 Lv3",
    hintEn: "'Insanity' Mastery Lv3",
    quote: "* 笑是最后没被烧掉的东西。",
    quoteEn: "* The smile is what didn't burn away.",
    lines: ["* 花不敢靠近这条时间线的他。", "* 快乐被烧掉了。共情被烧掉了。", "* 可他还在笑。", "* 花终于明白——", "* 那个笑,是决心烧到最后,唯一剩下的形状。"],
    linesEn: [
      "* The flower won't go near this timeline's him.",
      "* Joy burned away. Empathy burned away.",
      "* And still, he smiles.",
      "* At last the flower understood —",
      "* it's the last shape determination leaves behind.",
    ],
  },
];

// 真实验室暗线「白色的门」: the amalgamate fights feed a hidden lore thread —
// the player's 重燃决心 revive and the fused monsters share the same source
export const LAB_ECHOES = [
  {
    id: "noise",
    color: "#a8f0d0",
    title: "杂音",
    titleEn: "Static",
    hint: "击败一次「记忆头」",
    hintEn: "Defeat a Memoryhead",
    quote: "* 快来吧。",
    quoteEn: "* Come join the fun.",
    lines: [
      "* 电话线路早就断了。",
      "* 但杂音还在,一遍一遍,拨向同一个号码。",
      "* 来电显示:未知。接通后只有一句——",
      "* 『我们玩得很开心。快来吧。』",
      "* 你听懂的那一刻,决定假装没听懂。",
    ],
    linesEn: [
      "* The phone lines went dead long ago.",
      "* But the static keeps dialing the same number.",
      "* Caller ID: unknown. On pickup, one sentence —",
      "* 'We're having so much fun. Come join us.'",
      "* The moment you understand it, you pretend you don't.",
    ],
  },
  {
    id: "wishes",
    color: "#e8d8ff",
    title: "三个愿望",
    titleEn: "Three Wishes",
    hint: "击败一次「死神鸟」",
    hintEn: "Defeat a Reaper Bird",
    quote: "* 往光亮的地方飞。",
    quoteEn: "* Fly toward the light.",
    lines: [
      "* 一个想变强。一个想道歉。一个只想被看见。",
      "* 三个愿望熔在一起,长出了翅膀。",
      "* 有人管这叫缝合。它们管这叫,互相搀扶。",
      "* 翅膀记不清自己属于谁,",
      "* 只记得要往光亮的地方飞。",
    ],
    linesEn: [
      "* One wished for strength. One, to say sorry.",
      "* One only wished to be seen.",
      "* Three wishes melted together and grew wings.",
      "* Some call it an amalgamate. They call it holding on.",
      "* The wings only remember: fly toward the light.",
    ],
  },
  {
    id: "whitedoor",
    color: "#f4f4f4",
    title: "白色的门",
    titleEn: "The White Door",
    hint: "无尽审判通过第 7 轮",
    hintEn: "Pass round 7 of the endless judgement",
    quote: "* 门铃至今没响。",
    quoteEn: "* The doorbell never rang.",
    lines: [
      "* 地下最深处有一间白屋子。",
      "* 进去的怪物都『回家』了——只是以另一种方式。",
      "* 它们至今仍在等门铃响。",
      "* 而你口袋里那颗重燃的决心,",
      "* 和它们体内的,是同一种东西。",
    ],
    linesEn: [
      "* At the very bottom, there is a white room.",
      "* Every monster that entered 'went home' — another way.",
      "* They are still waiting for the doorbell.",
      "* And the rekindled determination in your pocket",
      "* is the same thing that runs in their veins.",
    ],
  },
];

export const ALL_ECHOES = [...ECHOES, ...CHAR_ECHOES, ...LAB_ECHOES];

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
  const e = pool[Math.floor(Math.random() * pool.length)];
  return currentLang() === "en" && e.quoteEn != null ? e.quoteEn : e.quote;
}
