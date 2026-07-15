// 叙事系统:开局存档点箴言 / 角色局内絮语 bark / 死亡台词按凶手 /
// 结算 LOVE 审判评语 / Boss对话按角色 / 审判纪元章节 / 访客事件台词。
// 纯文案与选取逻辑,不碰战斗状态;死亡计数与章节进度自己持久化。
// 第一批148条已用户过目批准;第二批(Boss对话/章节/访客/网感扩充池)
// 按用户"你设计的部分都可以做完+结合B站UT社群网感"授权实现。改措辞需过用户。
//
// 英文层(2026-07-14):不是翻译,是按英文UT社区语感的再创作——中文玩B站梗
// (弹幕/国歌/典中典),英文玩英文圈梗(bad time/get dunked on/Jerry/hOI)。
// 每个池都有 _EN 镜像,导出函数内部按 currentLang() 切换,调用方无感知。
// EN 文案改措辞同样需过用户。
import { currentLang } from "./i18n.js";

const EN = () => currentLang() === "en";
// pool/map/string switcher: zh stays the source of truth, en mirrors it
const L = (zh, en) => (EN() && en != null ? en : zh);

// ---- 开局存档点箴言 ---------------------------------------------------------

const SAVE_GENERIC = [
  "* 走廊里只剩你自己的脚步声。你充满了决心。",
  "* 骨头擦得发亮。你充满了决心。",
  "* 风从看不见的裂缝里吹进来。你充满了决心。",
  "* 你想起还没吃晚饭。饥饿使你充满了决心。",
  "* 灰尘在光柱里慢慢落下。你充满了决心。",
  "* 有人在很远的地方弹钢琴。也可能只是水滴声。你充满了决心。",
  "* 你检查了一遍口袋。什么都没有,但也什么都不缺。你充满了决心。",
  "* 空气里有雪的味道。你充满了决心。",
  "* 你深吸一口气。反正骨头没有肺。你充满了决心。",
  "* 星星形状的光在闪。它似乎一直在等你。你充满了决心。",
  "* 今天的地下世界格外安静。安静得不太对劲。你充满了决心。",
  "* 你练习了一下笑容。完美。反正也换不了别的表情。你充满了决心。",
  "* 又是充满怪物的一天。你充满了决心。",
  "* 你听见自己心跳的声音。等等,你没有心脏。你还是充满了决心。",
  "* 地上有一朵花的影子,却找不到花。你充满了决心。",
  "* 某个声音说:回去吧。你没有回去。你充满了决心。",
  "* 你数了数敌人的数量。放弃了。你充满了决心。",
  "* 世界在你脚下嗡嗡作响,像一台老旧的机器。你充满了决心。",
  "* 你把外套的领子竖了起来。仪式感使你充满了决心。",
  "* 无论重来多少次,这里都记得你。你充满了决心。",
];

// EN savepoints ride the canon "(... fills you with determination.)" form
const SAVE_GENERIC_EN = [
  "* (The hall is empty but for your footsteps. You're filled with determination.)",
  "* (Your bones are polished to a shine. You're filled with determination.)",
  "* (A draft blows in from a crack no one can see. Determination.)",
  "* (You skipped dinner again. Hunger fills you with determination.)",
  "* (Dust drifts slowly through a beam of light. You're filled with determination.)",
  "* (Someone, far away, is playing a piano. Or it's dripping water. Determination.)",
  "* (You check your pockets. Nothing there. Nothing missing. Determination.)",
  "* (The air smells like snow. You're filled with determination.)",
  "* (You take a deep breath. Skeletons don't have lungs. You do it anyway.)",
  "* (A star-shaped light flickers. It seems to have been waiting for you.)",
  "* (The underground is quiet tonight. Too quiet. You're filled with determination.)",
  "* (You practice your smile. Perfect. Not that you have another expression.)",
  "* (Another day full of monsters. You're filled with determination.)",
  "* (You hear your heartbeat. Wait. You don't have a heart. Still determined.)",
  "* (A flower's shadow lies on the floor. There is no flower. Determination.)",
  "* (A voice says: turn back. You don't. You're filled with determination.)",
  "* (You try counting the enemies. You give up. You're filled with determination.)",
  "* (The world hums under your feet like an old machine. Determination.)",
  "* (You pop your jacket collar. The ritual fills you with determination.)",
  "* (However many resets, this place remembers you. You're filled with determination.)",
];

const SAVE_CHAR = {
  sans: [
    "* 你打了个哈欠。今晚大概又没法偷懒了。你充满了决心。",
    "* 你想到一个绝妙的骨头笑话,决定活着讲给别人听。你充满了决心。",
    "* 老哥的围巾在风里飘的样子浮现在眼前。你充满了决心。",
    "* 裂缝外有人管这里叫『本家』。听起来,像个家。你充满了决心。",
  ],
  ukb: [
    "* 天平在你身后轻轻晃动。今晚有很多账要算。你充满了决心。",
    "* 业报不会迟到,只是排队。你负责叫号。你充满了决心。",
    "* 你不恨它们。你只是递送结果。你充满了决心。",
    "* 裂缝外的人叫你『业报』。你掂了掂骨头,没有反驳。你充满了决心。",
  ],
  horror: [
    "* 头骨里的洞今晚不太疼。是个好兆头。你充满了决心。",
    "* 好饿。但先来的是它们。你充满了决心。",
    "* 你想起还有人在等你带食物回去。你充满了决心。",
    "* 裂缝外有人喊了声『恐传』。你不认识这个词,但听起来像你的名字。你充满了决心。",
  ],
  hard: [
    "* 规则从今晚起变得更难。正合你意。你充满了决心。",
    "* 这个世界调高了难度,却忘了问你的意见。你充满了决心。",
    "* 蓝色的火花在指间跳动。够快,才够格。你充满了决心。",
    "* 裂缝外的人叫你『隐藏难度』。被记得的感觉,不坏。你充满了决心。",
  ],
};

const SAVE_CHAR_EN = {
  sans: [
    "* (You yawn. Probably no naps tonight. You're filled with determination.)",
    "* (You think of a great bone pun. You decide to live long enough to tell it.)",
    "* (You picture a red scarf waving in the wind. You're filled with determination.)",
    "* (Beyond the rift they call this timeline 'Classic'. Sounds like home.)",
  ],
  ukb: [
    "* (The scales sway gently behind you. Many debts come due tonight.)",
    "* (Karma is never late. It just takes a number. You call the numbers.)",
    "* (You don't hate them. You just deliver the results. Determination.)",
    "* (Beyond the rift they call you 'Karma'. You weigh the name. It holds.)",
  ],
  horror: [
    "* (The hole in your skull doesn't hurt tonight. That's a good sign.)",
    "* (So hungry. But they come first. You're filled with determination.)",
    "* (Someone is waiting for you to bring food home. Determination.)",
    "* (Someone beyond the rift said 'Horror'. Sounds right. Sounds like a name.)",
  ],
  hard: [
    "* (The rules get harder tonight. Good. You're filled with determination.)",
    "* (The world raised the difficulty without asking you. Determination.)",
    "* (Blue sparks jump between your fingers. Fast enough, or not at all.)",
    "* (Beyond the rift they call you 'Hard Mode'. Being remembered isn't bad.)",
  ],
};

// B站UT社区对四条时间线的圈内称呼,挂在选人页角色名上方
const AU_TAGS = {
  sans: "「本家」",
  ukb: "「业报线」",
  horror: "「恐传」",
  hard: "「官方隐藏难度」",
};

// EN community calls the timelines by their AU names, no brackets
const AU_TAGS_EN = {
  sans: "UNDERTALE",
  ukb: "KARMA",
  horror: "HORRORTALE",
  hard: "HARD MODE",
};

export function charAuTag(charId) {
  return L(AU_TAGS, AU_TAGS_EN)[charId] || null;
}

// Megalovania 在B站的名字只有一个:国歌。Boss进场即奏国歌。
// EN 圈的对应条件反射是那句 bad time。
const BOSS_ANTHEM_ZH = "* 国歌响起。裂缝外,全体起立。";
const BOSS_ANTHEM_EN = "* The opening notes play. You're gonna have a bad time.";

export function bossAnthemLine() {
  return L(BOSS_ANTHEM_ZH, BOSS_ANTHEM_EN);
}

// ---- 帕子的信: 第五访客,全社区的白月光 --------------------------------------
// 全大写热情文体是他的签名;恐传线只收到一封空信——B站玩家知道为什么

const PAPYRUS_LETTERS = [
  "* 「人类!!你挥骨头的姿势有进步!!——伟大的帕派瑞斯」",
  "* 「哥哥说你很努力。虽然他自己在睡觉!!——帕派瑞斯」",
  "* 「连我都做得到,你当然也可以!!——伟大的帕派瑞斯」",
];
const PAPYRUS_LETTER_HORROR = "* 信纸是空的。只有一行小字:『他还好吗?』";

const PAPYRUS_LETTERS_EN = [
  "* 'HUMAN!! YOUR FORM HAS IMPROVED!! — THE GREAT PAPYRUS'",
  "* 'MY BROTHER PRAISED YOU. WHILE NAPPING!! — PAPYRUS'",
  "* 'IF I CAN DO IT, SO CAN YOU!! — THE GREAT PAPYRUS'",
];
const PAPYRUS_LETTER_HORROR_EN = "* The page is blank. One small line: 'is he okay?'";

// -> {text, heal}: normal letters ship with spaghetti, the empty one doesn't
export function pickPapyrusLetter(charId) {
  if (charId === "horror") return { text: L(PAPYRUS_LETTER_HORROR, PAPYRUS_LETTER_HORROR_EN), heal: false };
  return { text: pickFrom(L(PAPYRUS_LETTERS, PAPYRUS_LETTERS_EN)), heal: true };
}

const SAVE_DIFFICULTY = [
  [
    "* 前方是废墟。废墟的阴影笼罩着你,你充满了决心。",
    "* 一切都是熟悉的配方。你充满了决心。",
    "* 今晚只要活下来就好。你充满了决心。",
  ],
  [
    "* 怪物们的眼神变了。它们也充满了决心。这可不妙。",
    "* 空气更沉了。你握紧武器,你充满了决心。",
    "* 这里的规矩:错一步,就少一半血。你充满了决心。",
  ],
  [
    "* 脚下的地面在发烫。回头的门已经焊死了。你充满了决心。",
    "* 在这里,勇气不值钱。活下来的才有资格谈决心。",
    "* 你听见地下深处传来笑声。你决定笑得比它更大声。你充满了决心。",
  ],
  [
    "* 走廊里一个怪物也没有。它们在更深的地方等你。你充满了决心。",
    "* 灰尘还没落下,你就已经在数下一个了。这就是屠杀。",
    "* 这条路上没有存档点欢迎你。这一个是例外,也是最后一个。",
    "* 你感觉不到害怕。这才是最该害怕的部分。你充满了……某种东西。",
  ],
];

const SAVE_DIFFICULTY_EN = [
  [
    "* (The ruins lie ahead. Their shadow looms, filling you with determination.)",
    "* (Same old recipe. You're filled with determination.)",
    "* (Tonight, just survive. You're filled with determination.)",
  ],
  [
    "* (The monsters' eyes have changed. They're determined too. That's bad.)",
    "* (The air hangs heavier. You grip your weapon, filled with determination.)",
    "* (House rules here: one mistake costs half your HP. Determination.)",
  ],
  [
    "* (The floor is hot underfoot. The way back has been welded shut.)",
    "* (Courage is cheap here. Survive first. Then talk about determination.)",
    "* (Laughter echoes from deep below. You decide to laugh louder.)",
  ],
  [
    "* (The corridor is empty. They're waiting deeper down. Determination.)",
    "* (You count the next dust before this dust settles. That is genocide.)",
    "* (No save point welcomes you on this route. This one is the exception. And the last.)",
    "* (You feel nothing. That's the part that should scare you. You're filled with... something.)",
  ],
];

const SAVE_FIRST_RUN = "* 很久很久以前,一个孩子爬上了埃伯特山。而你的故事,从这里开始。你充满了决心。";
const SAVE_FIRST_RUN_EN = "* (Long ago, a child climbed Mt. Ebott. Your story starts here. Determination.)";

const SAVE_DEATH_STREAK = [
  "* 你已经倒下很多次了。可你还是回来了。这本身就是决心。",
  "* 失败不算数。只要你还站在这里,它们就都只是练习。你充满了决心。",
  "* 那个声音又在劝你放弃。你把它按成了静音。你充满了决心。",
  "* 保持决心。这句话是说给现在的你听的。",
];

const SAVE_DEATH_STREAK_EN = [
  "* (You've fallen so many times. And yet, here you are. That IS determination.)",
  "* (Failures don't count. As long as you're standing here, they were practice.)",
  "* (That voice is telling you to give up again. You put it on mute.)",
  "* (Stay determined. That one's for you, right now.)",
];

const SAVE_BOSS_CLEARED = [
  "* 你曾让天意低头。怪物们都记得那一晚。你充满了决心。",
  "* 打败过Boss的人,走路都带风。你充满了决心。",
];

const SAVE_BOSS_CLEARED_EN = [
  "* (You made fate itself back down once. The monsters remember that night.)",
  "* (Boss-slayers walk different. You're filled with determination.)",
];

const SAVE_DAILY = [
  "* 今天的地下世界,和昨天的不一样。你充满了决心。",
  "* 全世界的挑战者,今天都在走同一条走廊。你充满了决心。",
  "* 命运今天掷了一把新骰子。你捡起来看了看,你充满了决心。",
];

const SAVE_DAILY_EN = [
  "* (Today's underground isn't yesterday's. You're filled with determination.)",
  "* (Every challenger in the world walks this same corridor today.)",
  "* (Fate rolled new dice today. You pick them up and look. Determination.)",
];

const SAVE_ECHO_RICH = [
  "* 回声花在你经过时轻轻晃动。它们认得你。你充满了决心。",
  "* 你听过太多故事,多到足以写完自己的这一篇。你充满了决心。",
];

const SAVE_ECHO_RICH_EN = [
  "* (The echo flowers sway as you pass. They know you. Determination.)",
  "* (You've heard enough stories to finish writing your own.)",
];

// B站UT社群网感池:弹幕/骨傲天/初见杀/热狗摊这一挂,低权重混入通用池,
// 玩梗但不抢UT的庄重感
const SAVE_MEME = [
  "* 裂缝外,有人正在画你。一帧一帧,画得很慢,但很认真。你充满了决心。",
  "* 裂缝外传来一段熟悉的旋律,是有人用你的故事重新填了词。你充满了决心。",
  "* 弹幕在很远的地方飘过:「爷的青春回来了」。你不知道那是什么,但你充满了决心。",
  "* 有个声音押了 10 金币赌你活不过五分钟。你充满了决心,顺便想赢下这一注。",
  "* 骨傲天的传说,今晚继续更新。你充满了决心。",
  "* 你听见有个声音喊「前方高能」。前方确实高能。你充满了决心。",
  "* 热狗摊今天休息。那就先上班吧。你充满了决心。",
  "* 初见杀只对初见有效。而你,已经不是初见了。你充满了决心。",
];

// EN meme pool: the 2015-and-forever fandom canon — sans undertale, bad time,
// megalovania hums, hot dogs. Same low weight, same rule: jokes never outrank awe.
const SAVE_MEME_EN = [
  "* (Beyond the rift, someone is drawing you. Frame by frame. Slowly. With care.)",
  "* (A familiar melody drifts in. Someone wrote new words over your story again.)",
  "* (A comment floats past, far away: 'this game made me cry in 2015'. Determination.)",
  "* (Someone bet 10G you won't last five minutes. You intend to collect.)",
  "* (The legend of sans undertale continues tonight. You're filled with determination.)",
  "* (Somewhere, someone hums nine familiar notes. You're filled with determination.)",
  "* (The hot dog stand is closed today. Fine. The shift starts now.)",
  "* (Blind runs die to that one. You're not blind anymore. Determination.)",
];

function pickFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ctx: {charId, difficultyId, isDaily, firstRun, deathStreak, bossCleared, echoCount}
export function pickSavepointQuote(ctx = {}) {
  if (ctx.firstRun) return L(SAVE_FIRST_RUN, SAVE_FIRST_RUN_EN);
  // weighted pool-of-pools: situational lines win often enough to feel seen,
  // the generic pool keeps repeat runs from going stale
  const pools = [
    [L(SAVE_GENERIC, SAVE_GENERIC_EN), 6],
    [L(SAVE_CHAR, SAVE_CHAR_EN)[ctx.charId] || [], 3],
    [L(SAVE_DIFFICULTY, SAVE_DIFFICULTY_EN)[ctx.difficultyId] || L(SAVE_DIFFICULTY, SAVE_DIFFICULTY_EN)[0], 3],
    [L(SAVE_MEME, SAVE_MEME_EN), 2.5],
  ];
  if (ctx.deathStreak >= 3) pools.push([L(SAVE_DEATH_STREAK, SAVE_DEATH_STREAK_EN), 6]);
  if (ctx.isDaily) pools.push([L(SAVE_DAILY, SAVE_DAILY_EN), 4]);
  if (ctx.bossCleared) pools.push([L(SAVE_BOSS_CLEARED, SAVE_BOSS_CLEARED_EN), 1.5]);
  if (ctx.echoCount >= 10) pools.push([L(SAVE_ECHO_RICH, SAVE_ECHO_RICH_EN), 1.5]);
  const usable = pools.filter(([pool]) => pool.length);
  let total = 0;
  for (const [, w] of usable) total += w;
  let roll = Math.random() * total;
  for (const [pool, w] of usable) {
    roll -= w;
    if (roll <= 0) return pickFrom(pool);
  }
  return pickFrom(L(SAVE_GENERIC, SAVE_GENERIC_EN));
}

// ---- 角色局内絮语 bark ------------------------------------------------------
// events: evolve / elite / lowhp / streak25 / boss / chest / candy / endless

const BARKS = {
  sans: {
    evolve: "* 哦,它还能这样?省事了。",
    elite: "* 块头大,骨头脆。",
    lowhp: "* 呃。也许……该认真了。就一下。",
    streak25: "* 我甚至还没用力。真的。",
    boss: "* 今晚就到这了?不,今晚才开始。",
    chest: "* 白拿的?我最喜欢白拿的。",
    candy: "* 不是热狗,凑合吧。",
    endless: "* 加班啊。行吧,工资翻倍就行。",
  },
  ukb: {
    evolve: "* 判决升级了。",
    elite: "* 再大的名头,天平也称得动。",
    lowhp: "* 业报是双向的……我记住了。",
    streak25: "* 二十五笔账,一次结清。",
    boss: "* 来了个自称『天意』的。正好,我管收天意的税。",
    chest: "* 这是预付的报酬。之后要还的。",
    candy: "* 甜的。罪不至死。",
    endless: "* 审判无休庭。继续。",
  },
  horror: {
    evolve: "* 更锋利了……嘿嘿。",
    elite: "* 大块头……够吃两顿。",
    lowhp: "* 疼……但饿更疼。",
    streak25: "* 停不下来……停不下来。",
    boss: "* 你的头……看起来很结实。我试试。",
    chest: "* 里面有吃的吗……没有?那也拿走。",
    candy: "* 好吃。再来。再来!",
    endless: "* 还有?……好。都留下。",
  },
  hard: {
    evolve: "* 武器跟上我的速度了。勉强。",
    elite: "* 精英?标准太低了。",
    lowhp: "* 极限边缘……才是我的主场。",
    streak25: "* 二十五。热身结束。",
    boss: "* 你就是最终考题?希望别太简单。",
    chest: "* 奖励不重要。但我收下了。",
    candy: "* 补给完毕。继续冲刺。",
    endless: "* 更难?这才像话。",
  },
};

// sans/horror keep canon lowercase; ukb reads like a court, hard like a system
const BARKS_EN = {
  sans: {
    evolve: "* oh, it does that now? neat.",
    elite: "* big guy. brittle bones.",
    lowhp: "* welp. maybe i try now. once.",
    streak25: "* i'm not even trying. really.",
    boss: "* calling it a night? nah. it just started.",
    chest: "* free stuff? my favorite price.",
    candy: "* not a hot dog. it'll do.",
    endless: "* overtime, huh. double pay, right?",
  },
  ukb: {
    evolve: "* The verdict has been upgraded.",
    elite: "* No name outweighs the scales.",
    lowhp: "* Karma cuts both ways... noted.",
    streak25: "* Twenty-five debts. One payment.",
    boss: "* 'Fate', it says. Fate pays taxes here.",
    chest: "* An advance. It will be collected.",
    candy: "* Sweet. Not a capital offense.",
    endless: "* The court does not adjourn.",
  },
  horror: {
    evolve: "* sharper now... heh. heh.",
    elite: "* big one... two meals, easy.",
    lowhp: "* hurts... hunger hurts more.",
    streak25: "* can't stop... can't stop.",
    boss: "* nice sturdy head... lemme check.",
    candy: "* good. more. MORE.",
    chest: "* food inside...? no? taking it anyway.",
    endless: "* more...? good. all of it stays.",
  },
  hard: {
    evolve: "* The weapon caught up to me. Barely.",
    elite: "* 'Elite'? The bar is low.",
    lowhp: "* The edge of the limit. My home turf.",
    streak25: "* Twenty-five. Warm-up complete.",
    boss: "* You're the final exam? Don't be easy.",
    chest: "* The reward is irrelevant. Accepted.",
    candy: "* Resupplied. Resume the sprint.",
    endless: "* Harder? Now we're talking.",
  },
};

export function barkFor(charId, event) {
  return L(BARKS, BARKS_EN)[charId]?.[event] || null;
}

// ---- 死亡台词按凶手 ---------------------------------------------------------
// kind: 基础怪 type(slime/bat/ghost/tank/red/orange/blue/purple),
// "elite"=命名精英/冠军, "boss", "hazard"=审判领域;普通精英回落到基础怪池

const DEATH_BY_KILLER = {
  slime: [
    "* 呱。(它似乎表达了哀悼。)",
    "* 你输给了废墟里最温和的怪物。它比你更过意不去。",
    "* 它试图告诉过你规则。你没听。",
  ],
  bat: [
    "* 它一边道歉,一边完成了击杀。",
    "* 被最胆小的怪物击倒。你们俩都很意外。",
    "* 它哭着飞走了。你躺着没动。",
  ],
  ghost: [
    "* 你没有好好吃蔬菜。现在蔬菜来吃你了。",
    "* 「多吃绿色食品。」这是它留给你的最后一句话。",
    "* 均衡饮食,战胜了你。",
  ],
  tank: [
    "* 死于杰瑞。这件事会跟着你一辈子。",
    "* 杰瑞。居然是杰瑞。",
    "* 大家都嫌弃它。但今晚,它赢了。",
    "* 死于杰瑞。典中典,建议裱起来。",
  ],
  red: [
    "* 别找茬。你偏偏找了。",
    "* 它只是想被好好看待。你用武器看它。",
    "* 它冲过来的时候,你确实看清了它。",
  ],
  orange: [
    "* 咒语念完了。你始终没能插上话。",
    "* 它鞠了一躬。观众只剩你的灰尘。",
    "* 魔术的秘密就是:它还有第三条命,而你只有一条。",
  ],
  blue: [
    "* 你被洗得很干净。灵魂也是。",
    "* 它看着地上的灰尘,叹了口气,又开始打扫。",
    "* 清洁完成。包括你。",
  ],
  purple: [
    "* 至少……夸夸人家的帽子啊。",
    "* 你到最后也没看它的帽子一眼。它很生气。",
    "* 帽子还在原地。你不在了。",
  ],
  boss: [
    "* 天意从不解释。它只是落下。",
    "* 它替某个更高的东西看了你一眼。然后你就倒下了。",
    "* 在那双白色的眼眶里,你看见了自己的结局。",
    "* 别难过。连它自己,也只是被选中的傀儡。",
    "* 你尝到苦头了。正如他所承诺的那样。",
    "* GET DUNKED ON——不,他现在已经不说这句了。",
  ],
  hazard: [
    "* 红圈亮起的时候,那里就不再属于你。",
    "* 审判不针对你。审判针对所有停下脚步的人。",
    "* 你站在了判决书上。",
  ],
  elite: [
    "* 它的名字会被记进档案。你的灰尘不会。",
    "* 强者对强者。今晚它更强。",
    "* 金色的光环还在闪。像是在敬礼。",
    "* 初见杀。下次,你就知道背板了。",
  ],
  // 命名精英专属(键=图鉴 profile key;没配到的回落 elite 泛用池)
  elite_final_froggit: ["* 呱。(懂的都懂。你显然还没懂。)"],
  elite_whimsalot: ["* 它终于不逃了。全体起立——除了你,你起不来了。"],
  elite_astigmatism: ["* 服从性测试,不合格。"],
  elite_parsnik: ["* 它给你画的饼,最后一口是真的。"],
  elite_moldessa: ["* 它五官都没拼对,你走位倒先拼错了。"],
  elite_migospel: ["* 小丑谢幕了。小丑,竟是你自己。"],
  elite_aaron: ["* 死因:十二块腹肌,和一个眨眼。;)"],
  elite_pyrope: ["* 它只是想蹭个热度。你,就是热度。"],
  elite_memoryhead: ["* 「邀请你加入群聊。」你已被拉入,且无法退出。"],
  elite_reaper_bird: ["* 死于缝合怪。但它缝住的,是三段没能实现的愿望。"],
  // 无尽轮首领专属
  champion_greater_dog: ["* 它只是想贴贴。你没能承受这份热情。"],
  champion_mad_dummy: ["* 它骂了你整整一轮。结果是你先破防的。"],
  champion_knight_knight: ["* 摇篮曲唱完了。你,晚安。"],
  champion_muffet: ["* 一杯蜘蛛茶,9999金币。你的命,抵扣成功。"],
  champion_royal_guards: ["* 它们当着你的面官宣了。你成了发糖现场的背景板。"],
  champion_mettaton_ex: ["* 收视率新高!感谢你贡献的下饭操作。"],
  champion_glyde: ["* 它拒绝透露伤害数值。反正,够用了。"],
  champion_so_sorry: ["* 「对不起对不起对不起——」道歉了,但没完全道歉。"],
  champion_endogeny: ["* 你想数清它有几只狗。数到一半,就并入了统计。"],
  champion_lemon_bread: ["* 欢迎来到特殊地狱。柠檬味,微甜,回口发苦。"],
};

const DEATH_BY_KILLER_EN = {
  slime: [
    "* Ribbit. (It seems to be expressing condolences.)",
    "* You lost to the gentlest monster in the ruins. It feels worse than you do.",
    "* It tried to tell you the rules. You didn't listen.",
  ],
  bat: [
    "* It apologized the entire time it was killing you.",
    "* Slain by the most timid monster underground. You're both surprised.",
    "* It flew away crying. You stayed down.",
  ],
  ghost: [
    "* You didn't eat your greens. So the greens ate you.",
    "* 'Eat your vegetables.' Its parting words to you.",
    "* A balanced diet has defeated you.",
  ],
  tank: [
    "* Jerry.",
    "* You died to Jerry. This will follow you forever.",
    "* Everyone ditches Jerry. Tonight, Jerry won.",
    "* Killed by Jerry. Screenshot it. Nobody will believe you.",
  ],
  red: [
    "* It asked you not to pick on it. You picked on it.",
    "* It just wanted to be treated nicely. You looked at it with a weapon.",
    "* When it charged, you finally got a good look at it.",
  ],
  orange: [
    "* The incantation finished. You never got a word in.",
    "* It took a bow. The only audience left was your dust.",
    "* The trick: it had a spare life. You didn't.",
  ],
  blue: [
    "* You have been thoroughly cleaned. Soul included.",
    "* It looked at the dust on the floor, sighed, and started sweeping again.",
    "* Cleaning complete. That included you.",
  ],
  purple: [
    "* You could have at least complimented the hat.",
    "* You never once looked at its hat. It noticed.",
    "* The hat is still here. You aren't.",
  ],
  boss: [
    "* Fate doesn't explain itself. It just falls.",
    "* It looked at you on behalf of something higher. Then you fell.",
    "* In those empty white sockets, you saw how this ends.",
    "* Don't take it hard. Even he is just a puppet that got chosen.",
    "* You had a bad time. Exactly as promised.",
    "* GET DUNKED ON — no. He doesn't say that anymore.",
  ],
  hazard: [
    "* When the red circle lights up, that ground stops being yours.",
    "* The judgement isn't about you. It's about everyone who stands still.",
    "* You were standing on the verdict.",
  ],
  elite: [
    "* Its name goes into the archive. Your dust doesn't.",
    "* Strong met strong. Tonight it was stronger.",
    "* The golden ring is still pulsing. Like a salute.",
    "* A blind-run kill. Next time, you'll know the pattern.",
  ],
  elite_final_froggit: ["* Ribbit. (It understands now. You clearly don't.)"],
  elite_whimsalot: ["* This time, it didn't close its eyes. You did."],
  elite_astigmatism: ["* Obedience test: failed."],
  elite_parsnik: ["* It promised you sweetness. The last bite was real."],
  elite_moldessa: ["* Its face is scrambled. Your dodge was worse."],
  elite_migospel: ["* The clown took its final bow. The clown was you all along."],
  elite_aaron: ["* Cause of death: twelve abs and a wink. ;)"],
  elite_pyrope: ["* It just wanted to ride some heat. You WERE the heat."],
  elite_memoryhead: ["* 'You have been added to the group chat.' There is no leave button."],
  elite_reaper_bird: ["* Stitched from three wishes that never came true. Yours made four."],
  champion_greater_dog: ["* It just wanted pets. You could not survive the affection."],
  champion_mad_dummy: ["* It screamed at you for a full round. You cracked first."],
  champion_knight_knight: ["* The lullaby is over. Good night."],
  champion_muffet: ["* One spider tea: 9999G. Your life: accepted as payment."],
  champion_royal_guards: ["* They confessed mid-battle. You died as the romantic backdrop."],
  champion_mettaton_ex: ["* RATINGS THROUGH THE ROOF! Thank you for that dramatic finish, darling."],
  champion_glyde: ["* It declined to reveal its damage numbers. They were sufficient."],
  champion_so_sorry: ["* 'Sorry! Sorry! So sorry—' It apologized. It did not stop."],
  champion_endogeny: ["* You tried counting the dogs. Halfway through, you joined the data."],
  champion_lemon_bread: ["* Welcome to your special hell. Lemon-scented. Faintly sweet."],
};

const DEATH_MILESTONES = {
  1: "* 你死了。但在这个世界,这从来不是结束。",
  3: "* 第三次了。有个声音开始帮你记笔记。",
  5: "* 你开始认得每一种倒下的姿势。这不完全是坏事。",
  10: "* 十次。花田里的花,替你各记了一朵。",
  20: "* 二十次死亡。换算成决心,已经够填满一颗灵魂。",
  50: "* 五十次。地下世界开始怀疑,到底谁在折磨谁。",
};

const DEATH_MILESTONES_EN = {
  1: "* You died. In this world, that has never been the end.",
  3: "* Third time. Somewhere, a voice starts taking notes.",
  5: "* You're learning every way there is to fall. That's not all bad.",
  10: "* Ten. The flowers in the field kept one bloom for each.",
  20: "* Twenty deaths. Enough determination, all told, to fill a soul.",
  50: "* Fifty. The underground is starting to wonder who's tormenting whom.",
};

export function pickDeathLine(kind, totalDeaths) {
  const milestone = L(DEATH_MILESTONES, DEATH_MILESTONES_EN)[totalDeaths] || null;
  // named elites/champions carry their codex key; unknown ones borrow the
  // generic elite pool so future codex batches never fall silent
  const named = (kind || "").startsWith("elite_") || (kind || "").startsWith("champion_");
  const killers = L(DEATH_BY_KILLER, DEATH_BY_KILLER_EN);
  const pool = killers[kind] || (named ? killers.elite : null);
  // a milestone death always tells you the number; otherwise the killer speaks
  if (milestone && (!pool || Math.random() < 0.5)) return milestone;
  return pool ? pickFrom(pool) : milestone;
}

// ---- 结算 LOVE 审判评语 -----------------------------------------------------

const LOVE_BRACKETS = [
  [150, [
    "* 你的 LOVE 几乎没有增长。在这样的夜晚,手下留情比挥出武器更难。",
    "* 击杀寥寥。也许你在寻找另一种通关方式。这里没有。但你找过,这很重要。",
  ]],
  [400, [
    "* 你的 LOVE 涨了一点。刚好够在这个世界活下去,还不至于忘记为什么活。",
    "* 一百多次挥击。你的手很稳,心也还热。保持这个平衡。",
  ]],
  [800, [
    "* LOVE 在稳定上升。你开始记不清每一张脸了。它们记得你。",
    "* 数百个怪物化成了尘。你告诉自己这是生存。今晚,这个理由还够用。",
  ]],
  [1500, [
    "* 你的 LOVE 很高了。伤害别人变得容易,被伤到变得很难。这不叫变强,这叫变远。",
    "* 走廊尽头的审判者会问的第一个问题:这些,都是必要的吗?",
  ]],
  [2500, [
    "* EXP,处决点数。LOVE,暴力等级。现在你知道这两个词真正的拼法了。",
    "* 上千的击杀。灰尘落满你的外套,你却越来越轻。因为有些东西正在离开你。",
  ]],
  [Infinity, [
    "* 你的 LOVE 高到审判者都沉默了。它翻完了记录,只说了一句:坐吧,我们谈谈。",
    "* 到了这个数字,怪物们看见你不再逃跑。逃跑需要希望。",
  ]],
];

const LOVE_BRACKETS_EN = [
  [150, [
    "* Your LOVE barely grew. On nights like these, mercy is harder than murder.",
    "* Barely any kills. Looking for a pacifist route? There isn't one here. But you looked. That matters.",
  ]],
  [400, [
    "* Your LOVE rose a little. Enough to survive this world. Not enough to forget why.",
    "* A hundred-some swings. Steady hands, warm heart. Keep that balance.",
  ]],
  [800, [
    "* LOVE is climbing steadily. You've stopped remembering their faces. They remember yours.",
    "* Hundreds of monsters turned to dust. You call it survival. Tonight, that still holds.",
  ]],
  [1500, [
    "* Your LOVE is high now. Hurting is easy. Being hurt is hard. That isn't strength. That's distance.",
    "* The judge at the end of the hall asks one question first: was all of it necessary?",
  ]],
  [2500, [
    "* EXP. Execution Points. LOVE. Level Of Violence. Now you know how they're really spelled.",
    "* A thousand kills. Dust settles on your coat, yet you feel lighter. Something is leaving you.",
  ]],
  [Infinity, [
    "* Your LOVE silenced even the judge. He closed the file and said: sit down. let's talk.",
    "* At this number, monsters stop running from you. Running takes hope.",
  ]],
];

const LOVE_GENOCIDE = [
  "* 这里没有评语。屠杀不需要观众。",
  "* 你数不清了。它们数得清。每一粒尘,都记得自己的名字。",
  "* 审判者本想列出你的罪状。纸不够长。它只写了两个字:回头。",
];

const LOVE_GENOCIDE_EN = [
  "* No comments here. A genocide doesn't need an audience.",
  "* You lost count. They didn't. Every grain of dust remembers its own name.",
  "* The judge meant to list your sins. The paper ran out. He wrote two words: turn back.",
];

const LOVE_VICTORY_CODA = [
  "* 但你赢了。天意也低下了头。愿这份胜利,配得上它的代价。",
  "* Boss化尘的地方,留下了一颗白色的心。它没有怪你。这最难。",
];

const LOVE_VICTORY_CODA_EN = [
  "* But you won. Even fate lowered its head. May the victory be worth its price.",
  "* Where he turned to dust, a white heart remained. It doesn't blame you. That's the hard part.",
];

const LOVE_ENDLESS_CODA = "* 审判进行到第五轮之后,已经没人记得最初的罪名。包括法庭自己。";
const LOVE_ENDLESS_CODA_EN = "* Past round five, nobody remembers the original charge. Not even the court.";

const LOVE_RETREAT = "* 你选择在还能选择的时候离开。地下世界很少有人懂这个道理。";
const LOVE_RETREAT_EN = "* You left while leaving was still a choice. Few down here ever learn that.";

// -> {lines: [...]}, 首行为主评语,后续为加缀
export function pickLoveJudgment({ kills = 0, difficultyId = 0, outcome = "death", rounds = 0 } = {}) {
  if (outcome === "retreat") return { lines: [L(LOVE_RETREAT, LOVE_RETREAT_EN)] };
  const lines = [];
  if (difficultyId >= 3) {
    lines.push(pickFrom(L(LOVE_GENOCIDE, LOVE_GENOCIDE_EN)));
  } else {
    const brackets = L(LOVE_BRACKETS, LOVE_BRACKETS_EN);
    const [, pool] = brackets.find(([cap]) => kills < cap) || brackets[brackets.length - 1];
    lines.push(pickFrom(pool));
  }
  if (outcome === "victory") lines.push(pickFrom(L(LOVE_VICTORY_CODA, LOVE_VICTORY_CODA_EN)));
  if (rounds >= 5) lines.push(L(LOVE_ENDLESS_CODA, LOVE_ENDLESS_CODA_EN));
  return { lines };
}

// ---- 死亡计数持久化(箴言连败池 + 死亡里程碑台词共用) ------------------------

const K_DEATHS = "narrLifeDeaths";
const K_STREAK = "narrDeathStreak";

function readInt(key) {
  try {
    return parseInt(localStorage.getItem(key) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function narrativeDeathStreak() {
  return readInt(K_STREAK);
}

export function recordNarrativeDeath() {
  const total = readInt(K_DEATHS) + 1;
  const streak = readInt(K_STREAK) + 1;
  try {
    localStorage.setItem(K_DEATHS, String(total));
    localStorage.setItem(K_STREAK, String(streak));
  } catch {}
  return { total, streak };
}

export function resetNarrativeDeathStreak() {
  try {
    localStorage.setItem(K_STREAK, "0");
  } catch {}
}

// ---- L2: Boss对话按角色×时刻(intro/mercy/p2/death,boss.js 字幕位) --------

const BOSS_LINES = {
  sans: {
    intro: "* 「今天天气真好。适合像你这样的家伙……化成灰。」",
    mercy: "* 「别用那种眼神看我。它不让我停下来。」",
    p2: "* 「接下来,你会过得非常、非常糟糕。」",
    death: "* 「呵……原来被闪避打败,是这种感觉。」",
    half: "* 「本家的我。……你过得比我幸福。」",
  },
  ukb: {
    intro: "* 「业报找上门了?不。这一次,我就是业报。」",
    mercy: "* 「天平不许我收下这份仁慈。」",
    p2: "* 「清算,翻到第二页。」",
    death: "* 「账……终于平了。」",
    half: "* 「业报线的我。你我手上的账,一样厚。」",
  },
  horror: {
    intro: "* 「你也饿了很多年吧。我闻得出来。」",
    mercy: "* 「仁慈?那东西……不顶饱。」",
    p2: "* 「那就,谁都别想吃饱!」",
    death: "* 「今晚……你们能吃顿好的了……」",
    half: "* 「恐传的我。……你也瘦了。」",
  },
  hard: {
    intro: "* 「规则加载完毕。初见杀,开始。」",
    mercy: "* 「读条完成。你的选项,已被禁用。」",
    p2: "* 「第二阶段。难度:地狱之上。」",
    death: "* 「挑战通过……存档,已为你保留。」",
    half: "* 「隐藏难度的我。我们都是没被写完的章节。」",
  },
};

// sans's intro riffs the judgement-hall speech; p2 is the bad time, verbatim mood
const BOSS_LINES_EN = {
  sans: {
    intro: "* 'beautiful day outside. perfect for turning to dust.'",
    mercy: "* 'don't look at me like that. it won't let me stop.'",
    p2: "* 'from here on out... you're gonna have a bad time.'",
    death: "* 'heh... so that's what getting dodged feels like.'",
    half: "* 'the classic me. ...you got the happier timeline.'",
  },
  ukb: {
    intro: "* 'Karma came knocking? No. Tonight, I AM karma.'",
    mercy: "* 'The scales will not let me accept that mercy.'",
    p2: "* 'The reckoning turns to page two.'",
    death: "* 'The books... finally balance.'",
    half: "* 'The Karma me. Your ledger is as heavy as mine.'",
  },
  horror: {
    intro: "* 'you've been hungry for years too. i can smell it.'",
    mercy: "* 'mercy? that stuff... doesn't fill you up.'",
    p2: "* 'then NOBODY eats tonight!'",
    death: "* 'tonight... you all finally eat well...'",
    half: "* 'the horror me. ...you got thin too.'",
  },
  hard: {
    intro: "* 'Rules loaded. Blind-run kill: begin.'",
    mercy: "* 'Loading complete. Your options have been disabled.'",
    p2: "* 'Phase two. Difficulty: beyond HELL.'",
    death: "* 'Challenge passed... your save file has been kept.'",
    half: "* 'The hidden-difficulty me. We're both unfinished chapters.'",
  },
};

export function bossLineFor(charId, moment) {
  return L(BOSS_LINES, BOSS_LINES_EN)[charId]?.[moment] || null;
}

// ---- L3: 审判纪元章节过场(里程碑首达时全屏逐行打字机) ----------------------
// titleEn/linesEn 由渲染处 pick(),保持数据导出形状不变

export const CHAPTERS = [
  {
    id: "ch1",
    title: "审判纪元 · 第一章 「白心」",
    titleEn: "The Judgement Era · Chapter I — The White Heart",
    lines: [
      "* 白色的心停在你手心,像一片不会融化的雪。",
      "* 它不挣扎,也不怨恨。它只是,终于可以休息了。",
      "* 你忽然明白:天意侵蚀的从来不是骨头,",
      "* 是「必须战斗」这件事本身。",
      "* ——第一纪元,就此闭卷。你充满了决心。",
    ],
    linesEn: [
      "* The white heart rests in your palm, like snow that won't melt.",
      "* It doesn't struggle. It doesn't resent. It finally gets to rest.",
      "* And suddenly you understand: fate never corrupted the bones —",
      "* it corrupted the idea that you MUST fight.",
      "* — Thus closes the First Era. You're filled with determination.",
    ],
  },
  {
    id: "ch2",
    title: "审判纪元 · 第二章 「裂缝」",
    titleEn: "The Judgement Era · Chapter II — The Rift",
    lines: [
      "* 第二次让天意低头,世界裂开了一道细小的缝。",
      "* 缝隙外传来无数飘过的声音:",
      "* 「前方高能」「初见杀警告」「就这?」",
      "* 你听不懂。但它们,好像一直在看着你。",
      "* 有观众的战斗,连尘埃都落得更慢一些。",
      "* ——第二纪元:被注视者。你充满了决心。",
    ],
    linesEn: [
      "* The second time fate bowed, a hairline crack opened in the world.",
      "* Countless voices drift in from beyond it:",
      "* 'GET DUNKED ON' 'bad time incoming' 'ez'",
      "* You can't understand them. But they've been watching all along.",
      "* With an audience, even dust falls a little slower.",
      "* — Second Era: The Watched. You're filled with determination.",
    ],
  },
  {
    id: "ch3",
    title: "审判纪元 · 第三章 「天平」",
    titleEn: "The Judgement Era · Chapter III — The Scales",
    lines: [
      "* 第三次。天平从云层里降下,悬在走廊正中央。",
      "* 一端,是你救不了的;另一端,是你杀掉的。",
      "* 它晃了很久很久,最后停在了正中间。",
      "* 审判者合上记录:「LV再高,今天也判不了你。」",
      "* ——第三纪元:平衡。你,还是你。",
    ],
    linesEn: [
      "* The third time. Scales descend from the clouds, mid-corridor.",
      "* One side: those you couldn't save. The other: those you killed.",
      "* They swayed for a long, long time. Then stopped dead center.",
      "* The judge closed the record: 'Whatever your LV, no sentence today.'",
      "* — Third Era: Balance. Despite everything, it's still you.",
    ],
  },
  {
    id: "ch4",
    title: "审判纪元 · 第四章 「尘」",
    titleEn: "The Judgement Era · Chapter IV — Dust",
    lines: [
      "* 没有欢呼。没有结算音乐。",
      "* 连裂缝外的声音,都安静了。",
      "* 走廊尽头的墙上,只有一句很旧的话:",
      "* 「在这个世界,杀,或者被杀。」",
      "* 你伸手把它擦掉了。灰尘沾了满手。",
      "* ——第四纪元:尘归尘。愿你还记得自己的名字。",
    ],
    linesEn: [
      "* No cheering. No victory music.",
      "* Even the voices beyond the rift have gone quiet.",
      "* On the wall at the corridor's end, one old sentence:",
      "* 'In this world, it's kill or be killed.'",
      "* You reach out and wipe it away. The dust coats your hand.",
      "* — Fourth Era: Dust to dust. May you still remember your name.",
    ],
  },
  {
    id: "ch5",
    title: "审判纪元 · 终章 「守望」",
    titleEn: "The Judgement Era · Finale — The Watcher",
    lines: [
      "* 图鉴的最后一页翻过去,背面还有一行小字:",
      "* 「谢谢你认真看完了每一个怪物。",
      "*   它们都有名字,也都有人记得。」",
      "* 一只小白狗不知从哪里冒出来,趴在书页上睡着了。",
      "* 你决定不叫醒它。传说,写下这一切的就是它。",
      "* ——终章:守望者。这个世界,交给你看管了。",
    ],
    linesEn: [
      "* The last page of the codex turns. On its back, a small line:",
      "* 'Thank you for really looking at every monster.",
      "*   Each one had a name. Each one is remembered.'",
      "* A little white dog appears from nowhere and sleeps on the page.",
      "* You decide not to wake it. Legend says it wrote all of this.",
      "* — Finale: The Watcher. This world is in your care now.",
    ],
  },
];

const K_CHAPTERS = "metaChapters";

function readChapters() {
  try {
    return JSON.parse(localStorage.getItem(K_CHAPTERS) || "{}");
  } catch {
    return {};
  }
}

// milestones reached this settlement but not yet shown, in story order
export function unseenChapters({ victory = false, difficultyId = 0, codexPct = 0 } = {}) {
  const seen = readChapters();
  const due = [];
  if (victory && !seen.ch1) due.push("ch1");
  if (victory && difficultyId >= 1 && !seen.ch2) due.push("ch2");
  if (victory && difficultyId >= 2 && !seen.ch3) due.push("ch3");
  if (victory && difficultyId >= 3 && !seen.ch4) due.push("ch4");
  if (codexPct >= 100 && !seen.ch5) due.push("ch5");
  return due.map((id) => CHAPTERS.find((c) => c.id === id));
}

export function markChapterSeen(id) {
  const seen = readChapters();
  if (seen[id]) return;
  seen[id] = true;
  try {
    localStorage.setItem(K_CHAPTERS, JSON.stringify(seen));
  } catch {}
}

// ---- L3: 访客事件台词(烦人狗乱入 / 会说话的回声花) --------------------------

const DOG_LINES = [
  "* 一只小白狗横穿了战场。所有攻击都自动给它让了路。",
  "* 烦人狗叼走了你的一根骨头,又觉得不好意思,还了你一枚金币。",
  "* 狗神路过,看了一眼战况,满意地打了个哈欠。",
];

const DOG_LINES_EN = [
  "* A small white dog crosses the battlefield. Every attack politely detours.",
  "* The Annoying Dog stole a bone, felt bad, and left you a coin.",
  "* The Dog God passed by, surveyed the battle, and yawned approvingly.",
];

export function pickDogLine() {
  return pickFrom(L(DOG_LINES, DOG_LINES_EN));
}

// 冠军出场宣言: shown in the UT narration box the moment a round champion
// spawns (keyed by championId); B站网感 rides on the canon catchphrases
const CHAMPION_ENTRANCES = {
  greaterDog: "* 大犬汪蹦蹦跳跳进场。裂缝外一片「awsl」。",
  madDummy: "* 「我!讨!厌!你!」愤怒假人气到原地起飞。",
  knightKnight: "* 骑士骑士开始唱摇篮曲。这里不是助眠区,快跑。",
  muffet: "* 「啊呼呼呼~」玛菲特提着茶壶登场。今日特惠:你的全部金币。",
  royalGuards: "* 皇家守卫01&02并肩入场。裂缝外齐喊:锁死!",
  endogeny: "* 无数条尾巴同时摇动。狗片浓度,严重超标。",
  lemonBread: "* 「欢迎来到,我的特殊地狱。」",
  mettatonEx: "* 「哦——耶耶耶!」黄金时段开播,礼物刷起来!",
  glyde: "* 格莱德闪亮登场,并对没有掌声表示不满。",
  soSorry: "* 「抱歉抱歉,借过——」抱歉怪撞进战场,画稿撒了一地。",
};

// EN entrances lean on canon catchphrases; 'ships it' is the fandom's 锁死
const CHAMPION_ENTRANCES_EN = {
  greaterDog: "* Greater Dog bounds in. The rift outside goes 'AWWW'.",
  madDummy: "* 'I! HATE! YOU!' Mad Dummy is levitating with rage.",
  knightKnight: "* Knight Knight hums a lullaby. Do NOT fall asleep.",
  muffet: "* 'Ahuhuhu~' Muffet arrives. Today's special: all your G.",
  royalGuards: "* RG 01 & 02 enter side by side. The rift ships it.",
  endogeny: "* Countless tails wag at once. Dog levels: critical.",
  lemonBread: "* 'Welcome to my special hell.'",
  mettatonEx: "* 'OHHH YES!' Prime time is LIVE, darlings!",
  glyde: "* Glyde enters, offended by the lack of applause.",
  soSorry: "* 'Sorry! Coming through—' So Sorry drops his art everywhere.",
};

export function championEntrance(championId) {
  return L(CHAMPION_ENTRANCES, CHAMPION_ENTRANCES_EN)[championId] || null;
}

// ---- 分享卡「裂缝外锐评」: one gray line of community judgement -------------
// priority chain: the juiciest angle wins; generic pools keep repeats fresh
// zh=弹幕锐评腔, en=chat verdict腔;分支逻辑两边共用,只换嘴皮子

export function pickShareRoast({ outcome, deathKind, survived = 0, clearTime = 0, maxStreak = 0, rounds = 0, hpPct = 0, kills = 0, difficultyId = 0 } = {}) {
  const R = (zh, en) => (EN() ? "* Chat verdict: " + en : "* 裂缝外锐评:" + zh);
  if (deathKind === "tank") return R("死于杰瑞。公开处刑。", "died to Jerry. Public execution.");
  if (outcome === "victory" && difficultyId >= 3) return R("打完这把,记得卸载保平安。", "maybe uninstall. For your own good.");
  if ((outcome === "death" || outcome === "quit") && kills === 0) return R("云玩家,实锤了。", "certified backseat gamer.");
  if ((outcome === "death" || outcome === "quit") && survived < 15) return R("开幕雷击。", "speedran the losing part.");
  if (outcome === "victory" && clearTime <= 350) return R("这手速,建议直播。", "hands. This player has hands.");
  if (outcome === "victory" && hpPct >= 0.99) return R("满血通关,手元警告。", "no-hit?! Clip it or it didn't happen.");
  if ((outcome === "death" || outcome === "quit") && survived < 60) return R("下饭,但下的是我。", "content. You are the content.");
  if (maxStreak >= 50) return R("割草机成精了。", "the lawnmower has become self-aware.");
  if (rounds >= 8) return R("建议直接投稿,标题我都想好了。", "touch grass. After one more round.");
  if (rounds >= 5) return R("肝帝认证,泪目。", "certified grinder. o7");
  if (outcome === "retreat") return R("见好就收,高手。", "knowing when to leave IS the skill.");
  if (outcome === "victory")
    return pickFrom([R("正常发挥,收藏了。", "clean run. Bookmarked."), R("爷的决心,回来了。", "determination levels restored.")]);
  return pickFrom([R("典。", "F."), R("差亿点点。", "SO close. Painfully close."), R("重开,这把有了。", "run it back. This one's yours.")]);
}

// ---- 图鉴「裂缝外批注」: one-line community graffiti per codex entry --------
// the serious lore stays untouched; this is the wiki hot-comment underneath

const CODEX_NOTES = {
  slime: "初学者之敌,毕业者之友。",
  bat: "它先道歉的。",
  ghost: "妈妈说的都对。",
  tank: "公认的。",
  red: "别盯着看,会长针眼。",
  orange: "谢幕之前,别鼓掌。",
  blue: "洗澡水温,刚刚好。",
  purple: "帽子真好看(违心)。",
  elite_final_froggit: "呱学十级学者。",
  elite_whimsalot: "全体起立。",
  elite_astigmatism: "服从性测试现场。",
  elite_parsnik: "画饼冠军。",
  elite_moldessa: "五官自由行动中。",
  elite_migospel: "小丑竟是……算了。",
  elite_aaron: ";)",
  elite_pyrope: "热度就是生命。",
  elite_memoryhead: "别接那个电话。",
  elite_reaper_bird: "缝合怪,但缝的是遗愿。",
  champion_greater_dog: "awsl(阵亡原因)。",
  champion_mad_dummy: "先动手的,但有理。",
  champion_knight_knight: "助眠区UP主,勿扰。",
  champion_muffet: "人均欠她9999G。",
  champion_royal_guards: "锁了,民政局连夜盖章。",
  champion_mettaton_ex: "腿是真的。",
  champion_glyde: "数值保密,自信公开。",
  champion_so_sorry: "他真的道歉了无数次。",
  champion_endogeny: "里面每一只,都是好狗。",
  champion_lemon_bread: "地狱也有柠檬味。",
  boss_corrupted_sans: "他不是回来。他从未离开。",
};

const CODEX_NOTES_EN = {
  slime: "Beginner's nightmare, veteran's warm-up.",
  bat: "It said sorry first.",
  ghost: "Mom was right.",
  tank: "Jerry.",
  red: "It asked nicely. Once.",
  orange: "Don't clap before the curtain.",
  blue: "Bath water: perfect temperature.",
  purple: "Nice hat (said under duress).",
  elite_final_froggit: "PhD in Ribbitology.",
  elite_whimsalot: "It stopped crying. We didn't.",
  elite_astigmatism: "Obedience test in progress.",
  elite_parsnik: "Champion of empty promises.",
  elite_moldessa: "Face parts roam freely.",
  elite_migospel: "The clown was... never mind.",
  elite_aaron: ";)",
  elite_pyrope: "Heat is life.",
  elite_memoryhead: "Do not answer that call.",
  elite_reaper_bird: "A patchwork of last wishes.",
  champion_greater_dog: "Cause of death: AWWW.",
  champion_mad_dummy: "Started it. Had a point though.",
  champion_knight_knight: "Sleep-aid streamer. Do not disturb.",
  champion_muffet: "Everyone owes her 9999G.",
  champion_royal_guards: "It's canon now. We all saw it.",
  champion_mettaton_ex: "The legs are real.",
  champion_glyde: "Stats private. Ego public.",
  champion_so_sorry: "He really did apologize every time.",
  champion_endogeny: "Every dog in there is a good dog.",
  champion_lemon_bread: "Hell has a lemon flavor.",
  boss_corrupted_sans: "He did not return. He never left.",
};

export function codexNote(key) {
  return L(CODEX_NOTES, CODEX_NOTES_EN)[key] || null;
}

// ---- 图鉴「检查」行: the ACT→Check ritual, UT's most recognizable text form --
// numbers are flavor (Jerry's canon ATK 0 DEF 30 included), not live stats

const CODEX_CHECKS = {
  slime: "* 蛙吉特 — ATK 4 DEF 5 — 呱。(这是它的全部台词,也是全部人生。)",
  bat: "* 忧郁虫虫 — ATK 5 DEF 0 — 碰它一下,它和你都会内疚。",
  ghost: "* 蔬菜兽 — ATK 6 DEF 6 — 营养均衡。攻守也均衡。",
  tank: "* 杰瑞 — ATK 0 DEF 30 — 弃之可惜。",
  red: "* 卢克眼 — ATK 6 DEF 6 — 别找茬。它先说的。",
  orange: "* 疯狂魔术师 — ATK 8 DEF 4 — 帽子里什么都有,除了退路。",
  blue: "* 约刷亚 — ATK 7 DEF 5 — 想把你洗干净,从灵魂开始。",
  purple: "* 冰帽盖 — ATK 7 DEF 7 — 摘掉帽子它就什么都不是。它知道。",
  elite_final_froggit: "* 终极蛙吉特 — ATK 10 DEF 10 — 呱到了人生的尽头,悟了。",
  elite_whimsalot: "* 忧伤虫爵士 — ATK 11 DEF 5 — 这一次,它不会再闭上眼睛。",
  elite_astigmatism: "* 散光眼 — ATK 12 DEF 6 — 请直视它。这是命令。",
  elite_parsnik: "* 欧防风兽 — ATK 12 DEF 8 — 甜的。剧毒的那种甜。",
  elite_moldessa: "* 霉塑怪 — ATK 11 DEF 9 — 脸是乱的,刀法是准的。",
  elite_migospel: "* 丑角福音虫 — ATK 12 DEF 7 — 笑到最后的不一定是它,但肯定不是你。",
  elite_aaron: "* 亚伦 — ATK 13 DEF 6 — 每块肌肉都会眨眼。;)",
  elite_pyrope: "* 焰绳怪 — ATK 14 DEF 5 — 沸点即卖点。",
  elite_memoryhead: "* 记忆头 — ATK ? DEF ? — 数据损坏。数据损坏。数据损坏。",
  elite_reaper_bird: "* 死神鸟 — ATK ?? DEF ?? — 检查失败:对象由三段记忆拼成,无法对焦。",
  champion_greater_dog: "* 大犬汪 — ATK 15 DEF 12 — 它想玩。它的『玩』重达两吨。",
  champion_mad_dummy: "* 愤怒假人 — ATK 16 DEF ? — 吵不赢的。别试。",
  champion_knight_knight: "* 骑士骑士 — ATK 18 DEF 15 — 摇篮曲是给你唱的。",
  champion_muffet: "* 玛菲特 — ATK 17 DEF 10 — 结账时间到,亲爱的~",
  champion_royal_guards: "* 皇家守卫01&02 — ATK 18 DEF 18 — 数值成双,心意成对。",
  champion_mettaton_ex: "* 镁塔顿EX — ATK 19 DEF 12 — 收视率越高,腿踢得越高。",
  champion_glyde: "* 格莱德 — ATK ?? DEF ?? — 它捂住了检查结果。",
  champion_so_sorry: "* 抱歉怪 — ATK 15 DEF 9 — 道歉的速度,赶不上闯祸的速度。",
  champion_endogeny: "* 犬神融合体 — ATK 20 DEF 14 — 检测到狗×N。N值持续增长。",
  champion_lemon_bread: "* 柠檬面包 — ATK 21 DEF 13 — 欢迎回家。这不是问候,是判决。",
  boss_corrupted_sans: "* 天意侵蚀Sans — ATK ?? DEF ?? — 这一次,检查你的是他。",
};

const CODEX_CHECKS_EN = {
  slime: "* Froggit — ATK 4 DEF 5 — Ribbit. (Its whole script. Its whole life.)",
  bat: "* Whimsun — ATK 5 DEF 0 — Touch it once and you'll both feel guilty.",
  ghost: "* Vegetoid — ATK 6 DEF 6 — Balanced nutrition. Balanced stats.",
  tank: "* Jerry — ATK 0 DEF 30 — Jerry.",
  red: "* Loox — ATK 6 DEF 6 — Don't pick on it. It asked first.",
  orange: "* Madjick — ATK 8 DEF 4 — Everything's in the hat, except a way out.",
  blue: "* Woshua — ATK 7 DEF 5 — Wants to clean you. Starting with your soul.",
  purple: "* Icecap — ATK 7 DEF 7 — Without the hat it's nothing. It knows.",
  elite_final_froggit: "* Final Froggit — ATK 10 DEF 10 — Ribbited to the end of the road. Enlightened.",
  elite_whimsalot: "* Whimsalot — ATK 11 DEF 5 — This time, it won't close its eyes.",
  elite_astigmatism: "* Astigmatism — ATK 12 DEF 6 — Look at it. That's an order.",
  elite_parsnik: "* Parsnik — ATK 12 DEF 8 — Sweet. The venomous kind of sweet.",
  elite_moldessa: "* Moldessa — ATK 11 DEF 9 — The face is a mess. The knifework isn't.",
  elite_migospel: "* Migospel — ATK 12 DEF 7 — Someone laughs last. It won't be you.",
  elite_aaron: "* Aaron — ATK 13 DEF 6 — Every muscle winks. ;)",
  elite_pyrope: "* Pyrope — ATK 14 DEF 5 — The boiling point is the selling point.",
  elite_memoryhead: "* Memoryhead — ATK ? DEF ? — DATA CORRUPTED. DATA CORRUPTED. DATA CORRUPTED.",
  elite_reaper_bird: "* Reaper Bird — ATK ?? DEF ?? — Check failed: subject is three memories. Can't focus.",
  champion_greater_dog: "* Greater Dog — ATK 15 DEF 12 — It wants to play. Its 'play' weighs two tons.",
  champion_mad_dummy: "* Mad Dummy — ATK 16 DEF ? — You cannot win the argument. Don't try.",
  champion_knight_knight: "* Knight Knight — ATK 18 DEF 15 — The lullaby is for you.",
  champion_muffet: "* Muffet — ATK 17 DEF 10 — Time to pay up, dearie~",
  champion_royal_guards: "* RG 01 & 02 — ATK 18 DEF 18 — Matching stats. Matching hearts.",
  champion_mettaton_ex: "* Mettaton EX — ATK 19 DEF 12 — Higher ratings, higher kicks.",
  champion_glyde: "* Glyde — ATK ?? DEF ?? — It covered up the Check results.",
  champion_so_sorry: "* So Sorry — ATK 15 DEF 9 — Apologizes slower than it wrecks things.",
  champion_endogeny: "* Endogeny — ATK 20 DEF 14 — Dog × N detected. N is still growing.",
  champion_lemon_bread: "* Lemon Bread — ATK 21 DEF 13 — 'Welcome home.' Not a greeting. A verdict.",
  boss_corrupted_sans: "* Corrupted Sans — ATK ?? DEF ?? — This time, he is checking you.",
};

export function codexCheck(key) {
  return L(CODEX_CHECKS, CODEX_CHECKS_EN)[key] || null;
}

// ---- FUN值 / Gaster 暗线: canon entry 17, zero memes, pure mystery ----------
// EN 直接引 canon 原文(DARK DARKER YET DARKER),两边圈子都秒懂

export function funGlitchSavepoint() {
  return L("* 黑暗,更黑,愈发黑暗。■■■■■■。", "* DARK. DARKER. YET DARKER. ■■■■■■.");
}
export function gasterGhostLine() {
  return L("* 他在你看到这行字之前,就已经走了。", "* He was gone before you finished reading this line.");
}
export function gasterGhostSub() {
  return L("(第十七号记录,不属于本图鉴。)", "(Entry number seventeen does not belong in this codex.)");
}
export function funFlowerLine() {
  return L("……不要回头。", "...do not turn around.");
}

// ---- 黄色饶恕 / Temmie / 商店空交互 -----------------------------------------

export function spareNarration(name) {
  return EN() ? `* You spared ${name}. EXP +0. But something went +1.` : `* 你饶恕了${name}。EXP +0。但有些东西 +1。`;
}

export function temLine() {
  return L("* 哦咿!!!我系Temmie!!!(Temmie在剧烈震动)", "* hOI!!! i'm tEMMIE!!! (Temmie is vibrating intensely.)");
}

export function shopDenyLine(reason) {
  if (reason === "maxed") return L("* 它已经尽力了。", "* It has already done its best.");
  if (reason === "gated") return L("* 但什么都没有发生。(前置未满足)", "* But nothing happened. (Requirements not met.)");
  return L("* 你的钱包空空如也。连灰尘都没有。", "* Your wallet is empty. Not even dust in there.");
}

// ---- 裂缝外攻略组: one actionable line after a pre-boss death ---------------
// the death screen already has feelings; this is the "now do THIS" coach

export function coachLine({ kind = null, survived = 0, kills = 0, moveSpeed = 0, shopGapName = null, shopGap = 0 } = {}) {
  // 死因分流(提交A): 操作死因给操作建议,数值死因才推属性——
  // 绝不让所有死亡都变成「继续刷攻击」
  let line;
  if (kind === "boss")
    line = L(
      "* 裂缝外攻略组:把「决心之心」买满再来,血厚才看得清 Boss 的出招。",
      "* Strat corner: max 'Heart of DT' — more HP, more time to read the boss."
    );
  else if (kind === "hazard")
    line = L(
      "* 裂缝外攻略组:审判领域只烧站着不动的人,红圈亮就走。",
      "* Strat corner: red zones only burn the standing-still. Light up? Leave."
    );
  else if ((kind || "").startsWith("elite_") || (kind || "").startsWith("champion_"))
    line = L(
      "* 裂缝外攻略组:精英的红圈亮起后必爆,先跑位,再输出。",
      "* Strat corner: elite red rings always detonate. Move first, shoot second."
    );
  else if (survived < 90)
    line = L(
      "* 裂缝外攻略组:开局贴边走,别扎怪堆;90 秒后才是真正的考试。",
      "* Strat corner: hug edges early, avoid packs; the real exam starts at 90s."
    );
  else if (survived >= 180 && kills < survived * 1.1)
    line = L(
      "* 裂缝外攻略组:输出跟不上刷怪节奏——卡优先攻击攻速,武器满阶记得凑觉醒。",
      "* Strat corner: DPS fell behind — attack/speed cards, awaken maxed weapons."
    );
  else if (moveSpeed > 0 && moveSpeed < 210)
    line = L(
      "* 裂缝外攻略组:是被贴脸磨死的——「疾行之靴」或选卡加移速,先跑得掉。",
      "* Strat corner: ground down point-blank — Swift Boots or speed cards first."
    );
  else
    line = L(
      "* 裂缝外攻略组:选卡优先攻速和移速——活着,才有输出。",
      "* Strat corner: attack speed and move speed first — alive IS the damage."
    );
  // 商店目标并入此处(评审裁决: 不在永久成长块单列,同屏只留一条指引)
  if (shopGapName && shopGap > 0 && shopGap <= 90)
    line += EN() ? ` (${shopGap}G short of '${shopGapName}')` : `(还差 ${shopGap} 金币就能拿下「${shopGapName}」)`;
  return line;
}

// ---- 暂停小贴士: half real mechanics, half memes grown on the mechanics -----

const PAUSE_TIPS = [
  "蓝色攻击,不要动。真的,别动。",
  "橙色火焰:保持移动。反着记,就死两次。",
  "宝箱歪了不怪你,保底在路上。",
  "杰瑞不强。但杰瑞,是杰瑞。",
  "残血别慌,怪物糖是甜的。",
  "连杀不断,经验不断。像极了不敢停下来的你。",
  "商店里的力量永不稀释。这是数学,不是鸡汤。",
  "无尽第4轮以后金币断供。再往深走,只有荣誉和刀。",
  "复活很贵。但决心无价。(真实验室对此有不同意见。)",
  "跑图口诀:贴墙走,看红圈,别贪糖。",
  "打不过就换难度,没人笑你。笑你的,都卡在同一关。",
  "今天也要,充满决心。",
  "云玩家看不到这条提示。",
  "右上角的倍速键不是鬼畜按钮。……但你可以试试。",
];

const PAUSE_TIPS_EN = [
  "Blue attacks: don't move. Really. Don't.",
  "Orange means keep moving. Memorize it backwards, die twice.",
  "Bad chest luck isn't your fault. Pity is on the way.",
  "Jerry isn't strong. But Jerry is Jerry.",
  "Low HP? Monster candy is sweet.",
  "Keep the streak, keep the XP. Just like you, afraid to stop.",
  "Shop power never dilutes. That's math, not a pep talk.",
  "Endless coins cut off after round 4. Past that, it's glory and knives.",
  "Revives are pricey. Determination is priceless. (The Lab disagrees.)",
  "Rules of the road: hug walls, watch red rings, don't greed the candy.",
  "Stuck? Lower the difficulty. The only ones laughing are stuck too.",
  "Today, too, stay determined.",
  "Backseat gamers can't see this tip.",
  "The speed button is not a meme button. ...Try it anyway.",
];

export function pickPauseTip() {
  return pickFrom(L(PAUSE_TIPS, PAUSE_TIPS_EN));
}

const FLOWER_LINES = [
  "……你充满了决心……你充满了决心……",
  "……三师傅,放过我……",
  "……就这?就这?……",
  "……骨傲天……骨傲天……",
  "……热狗,三十枚金币一根……",
  "……别买番茄酱,他会直接喝掉……",
  "……汪。……汪汪。",
  "……前方高能……前方高能……",
  "……存档点在你身后……骗你的……",
  "……谢谢你还在听……",
  "……蜘蛛茶,9999金币……不还价……",
  "……哦耶耶耶……(它学谁的,一目了然。)",
  "……羊妈的派……还是热的……",
  "……呐————!!……(它学得很像。)",
  "……本家的,恐传的……都是好骨头……",
];

// EN whispers: canon soundbites the fandom can finish from three words
const FLOWER_LINES_EN = [
  "...you're filled with determination... determination...",
  "...it's a beautiful day outside...",
  "...get dunked on... dunked on...",
  "...sans undertale... sans undertale...",
  "...hot dogs. 30G. water sausages...",
  "...don't give him the ketchup... he drinks it straight...",
  "...bark. ...bark bark.",
  "...nine notes... you know the ones...",
  "...the save point is right behind you... kidding...",
  "...thank you for still listening...",
  "...spider tea, 9999G... no refunds...",
  "...OHHH YES... (you can tell who it learned that from.)",
  "...butterscotch... or cinnamon...?",
  "...NYEH HEH HEH!!... (a very good impression.)",
  "...classic, horror... all good bones...",
];

export function pickFlowerLine() {
  return pickFrom(L(FLOWER_LINES, FLOWER_LINES_EN));
}

// ---- 六魂遗物: 宝箱专属机制物件(数值朴素是UT本命梗——玩具刀攻击+3) ------
// EN 名直接用 canon 物品名(Tough Glove/Ballet Shoes/Torn Notebook/Burnt Pan)

export const RELICS = [
  { id: "patience", name: "褪色丝带", nameEn: "Faded Ribbon", soul: "耐心", soulEn: "Patience", color: "#7fd8e8", desc: "受击无敌时间 +25%", descEn: "Hit invulnerability +25%", line: "* 系上它的人,总能等到下一个机会。", lineEn: "* Whoever wears it can always wait for the next chance." },
  { id: "brave", name: "拳套", nameEn: "Tough Glove", soul: "勇气", soulEn: "Bravery", color: "#ff8a3d", desc: "连杀≥10 时伤害 +8%", descEn: "Damage +8% at streak ≥ 10", line: "* 出拳之前,先相信自己打得中。", lineEn: "* Believe the punch lands before you throw it." },
  { id: "integrity", name: "芭蕾舞鞋", nameEn: "Ballet Shoes", soul: "正直", soulEn: "Integrity", color: "#5db9ff", desc: "移动中闪避 +4%", descEn: "Dodge +4% while moving", line: "* 舞步不会说谎。", lineEn: "* Dance steps don't lie." },
  { id: "persev", name: "旧笔记本", nameEn: "Torn Notebook", soul: "坚毅", soulEn: "Perseverance", color: "#c59bff", desc: "经验获取 +8%", descEn: "XP gain +8%", line: "* 记下来的,就不会白走。", lineEn: "* What's written down was never walked in vain." },
  { id: "kind", name: "平底锅", nameEn: "Burnt Pan", soul: "善良", soulEn: "Kindness", color: "#7cf28a", desc: "治疗效果 +15%", descEn: "Healing +15%", line: "* 用它做的饭,格外顶饿。", lineEn: "* Food from this pan sticks to your bones." },
  { id: "justice", name: "左轮空弹壳", nameEn: "Empty Casing", soul: "正义", soulEn: "Justice", color: "#ffd93d", desc: "对精英伤害 +10%", descEn: "Damage vs elites +10%", line: "* 正义,专门瞄准大个子。", lineEn: "* Justice aims for the big ones." },
];

export function pickRelic(owned) {
  const pool = RELICS.filter((r) => !owned[r.id]);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

export function sixSoulsLine() {
  return L("* 六魂共鸣!!人类的决心汇成一道审判,横扫了整个房间。", "* The SIX SOULS resonate!! One judgement sweeps the room.");
}
