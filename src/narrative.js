// 叙事系统:开局存档点箴言 / 角色局内絮语 bark / 死亡台词按凶手 /
// 结算 LOVE 审判评语 / Boss对话按角色 / 审判纪元章节 / 访客事件台词。
// 纯文案与选取逻辑,不碰战斗状态;死亡计数与章节进度自己持久化。
// 第一批148条已用户过目批准;第二批(Boss对话/章节/访客/网感扩充池)
// 按用户"你设计的部分都可以做完+结合B站UT社群网感"授权实现。改措辞需过用户。

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

const SAVE_CHAR = {
  sans: [
    "* 你打了个哈欠。今晚大概又没法偷懒了。你充满了决心。",
    "* 你想到一个绝妙的骨头笑话,决定活着讲给别人听。你充满了决心。",
    "* 老哥的围巾在风里飘的样子浮现在眼前。你充满了决心。",
  ],
  ukb: [
    "* 天平在你身后轻轻晃动。今晚有很多账要算。你充满了决心。",
    "* 业报不会迟到,只是排队。你负责叫号。你充满了决心。",
    "* 你不恨它们。你只是递送结果。你充满了决心。",
  ],
  horror: [
    "* 头骨里的洞今晚不太疼。是个好兆头。你充满了决心。",
    "* 好饿。但先来的是它们。你充满了决心。",
    "* 你想起还有人在等你带食物回去。你充满了决心。",
  ],
  hard: [
    "* 规则从今晚起变得更难。正合你意。你充满了决心。",
    "* 这个世界调高了难度,却忘了问你的意见。你充满了决心。",
    "* 蓝色的火花在指间跳动。够快,才够格。你充满了决心。",
  ],
};

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

const SAVE_FIRST_RUN = "* 很久很久以前,一个孩子爬上了埃伯特山。而你的故事,从这里开始。你充满了决心。";

const SAVE_DEATH_STREAK = [
  "* 你已经倒下很多次了。可你还是回来了。这本身就是决心。",
  "* 失败不算数。只要你还站在这里,它们就都只是练习。你充满了决心。",
  "* 那个声音又在劝你放弃。你把它按成了静音。你充满了决心。",
  "* 保持决心。这句话是说给现在的你听的。",
];

const SAVE_BOSS_CLEARED = [
  "* 你曾让天意低头。怪物们都记得那一晚。你充满了决心。",
  "* 打败过Boss的人,走路都带风。你充满了决心。",
];

const SAVE_DAILY = [
  "* 今天的地下世界,和昨天的不一样。你充满了决心。",
  "* 全世界的挑战者,今天都在走同一条走廊。你充满了决心。",
  "* 命运今天掷了一把新骰子。你捡起来看了看,你充满了决心。",
];

const SAVE_ECHO_RICH = [
  "* 回声花在你经过时轻轻晃动。它们认得你。你充满了决心。",
  "* 你听过太多故事,多到足以写完自己的这一篇。你充满了决心。",
];

// B站UT社群网感池:弹幕/骨傲天/初见杀/热狗摊这一挂,低权重混入通用池,
// 玩梗但不抢UT的庄重感
const SAVE_MEME = [
  "* 弹幕在很远的地方飘过:「爷的青春回来了」。你不知道那是什么,但你充满了决心。",
  "* 有个声音押了 10 金币赌你活不过五分钟。你充满了决心,顺便想赢下这一注。",
  "* 骨傲天的传说,今晚继续更新。你充满了决心。",
  "* 你听见有个声音喊「前方高能」。前方确实高能。你充满了决心。",
  "* 热狗摊今天休息。那就先上班吧。你充满了决心。",
  "* 初见杀只对初见有效。而你,已经不是初见了。你充满了决心。",
];

function pickFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ctx: {charId, difficultyId, isDaily, firstRun, deathStreak, bossCleared, echoCount}
export function pickSavepointQuote(ctx = {}) {
  if (ctx.firstRun) return SAVE_FIRST_RUN;
  // weighted pool-of-pools: situational lines win often enough to feel seen,
  // the generic pool keeps repeat runs from going stale
  const pools = [
    [SAVE_GENERIC, 6],
    [SAVE_CHAR[ctx.charId] || [], 3],
    [SAVE_DIFFICULTY[ctx.difficultyId] || SAVE_DIFFICULTY[0], 3],
    [SAVE_MEME, 2.5],
  ];
  if (ctx.deathStreak >= 3) pools.push([SAVE_DEATH_STREAK, 6]);
  if (ctx.isDaily) pools.push([SAVE_DAILY, 4]);
  if (ctx.bossCleared) pools.push([SAVE_BOSS_CLEARED, 1.5]);
  if (ctx.echoCount >= 10) pools.push([SAVE_ECHO_RICH, 1.5]);
  const usable = pools.filter(([pool]) => pool.length);
  let total = 0;
  for (const [, w] of usable) total += w;
  let roll = Math.random() * total;
  for (const [pool, w] of usable) {
    roll -= w;
    if (roll <= 0) return pickFrom(pool);
  }
  return pickFrom(SAVE_GENERIC);
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

export function barkFor(charId, event) {
  return BARKS[charId]?.[event] || null;
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

const DEATH_MILESTONES = {
  1: "* 你死了。但在这个世界,这从来不是结束。",
  3: "* 第三次了。有个声音开始帮你记笔记。",
  5: "* 你开始认得每一种倒下的姿势。这不完全是坏事。",
  10: "* 十次。花田里的花,替你各记了一朵。",
  20: "* 二十次死亡。换算成决心,已经够填满一颗灵魂。",
  50: "* 五十次。地下世界开始怀疑,到底谁在折磨谁。",
};

export function pickDeathLine(kind, totalDeaths) {
  const milestone = DEATH_MILESTONES[totalDeaths] || null;
  // named elites/champions carry their codex key; unknown ones borrow the
  // generic elite pool so future codex batches never fall silent
  const named = (kind || "").startsWith("elite_") || (kind || "").startsWith("champion_");
  const pool = DEATH_BY_KILLER[kind] || (named ? DEATH_BY_KILLER.elite : null);
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

const LOVE_GENOCIDE = [
  "* 这里没有评语。屠杀不需要观众。",
  "* 你数不清了。它们数得清。每一粒尘,都记得自己的名字。",
  "* 审判者本想列出你的罪状。纸不够长。它只写了两个字:回头。",
];

const LOVE_VICTORY_CODA = [
  "* 但你赢了。天意也低下了头。愿这份胜利,配得上它的代价。",
  "* Boss化尘的地方,留下了一颗白色的心。它没有怪你。这最难。",
];

const LOVE_ENDLESS_CODA = "* 审判进行到第五轮之后,已经没人记得最初的罪名。包括法庭自己。";

const LOVE_RETREAT = "* 你选择在还能选择的时候离开。地下世界很少有人懂这个道理。";

// -> {lines: [...]}, 首行为主评语,后续为加缀
export function pickLoveJudgment({ kills = 0, difficultyId = 0, outcome = "death", rounds = 0 } = {}) {
  if (outcome === "retreat") return { lines: [LOVE_RETREAT] };
  const lines = [];
  if (difficultyId >= 3) {
    lines.push(pickFrom(LOVE_GENOCIDE));
  } else {
    const [, pool] = LOVE_BRACKETS.find(([cap]) => kills < cap) || LOVE_BRACKETS[LOVE_BRACKETS.length - 1];
    lines.push(pickFrom(pool));
  }
  if (outcome === "victory") lines.push(pickFrom(LOVE_VICTORY_CODA));
  if (rounds >= 5) lines.push(LOVE_ENDLESS_CODA);
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
  },
  ukb: {
    intro: "* 「业报找上门了?不。这一次,我就是业报。」",
    mercy: "* 「天平不许我收下这份仁慈。」",
    p2: "* 「清算,翻到第二页。」",
    death: "* 「账……终于平了。」",
  },
  horror: {
    intro: "* 「你也饿了很多年吧。我闻得出来。」",
    mercy: "* 「仁慈?那东西……不顶饱。」",
    p2: "* 「那就,谁都别想吃饱!」",
    death: "* 「今晚……你们能吃顿好的了……」",
  },
  hard: {
    intro: "* 「规则加载完毕。初见杀,开始。」",
    mercy: "* 「读条完成。你的选项,已被禁用。」",
    p2: "* 「第二阶段。难度:地狱之上。」",
    death: "* 「挑战通过……存档,已为你保留。」",
  },
};

export function bossLineFor(charId, moment) {
  return BOSS_LINES[charId]?.[moment] || null;
}

// ---- L3: 审判纪元章节过场(里程碑首达时全屏逐行打字机) ----------------------

export const CHAPTERS = [
  {
    id: "ch1",
    title: "审判纪元 · 第一章 「白心」",
    lines: [
      "* 白色的心停在你手心,像一片不会融化的雪。",
      "* 它不挣扎,也不怨恨。它只是,终于可以休息了。",
      "* 你忽然明白:天意侵蚀的从来不是骨头,",
      "* 是「必须战斗」这件事本身。",
      "* ——第一纪元,就此闭卷。你充满了决心。",
    ],
  },
  {
    id: "ch2",
    title: "审判纪元 · 第二章 「裂缝」",
    lines: [
      "* 第二次让天意低头,世界裂开了一道细小的缝。",
      "* 缝隙外传来无数飘过的声音:",
      "* 「前方高能」「初见杀警告」「就这?」",
      "* 你听不懂。但它们,好像一直在看着你。",
      "* 有观众的战斗,连尘埃都落得更慢一些。",
      "* ——第二纪元:被注视者。你充满了决心。",
    ],
  },
  {
    id: "ch3",
    title: "审判纪元 · 第三章 「天平」",
    lines: [
      "* 第三次。天平从云层里降下,悬在走廊正中央。",
      "* 一端,是你救不了的;另一端,是你杀掉的。",
      "* 它晃了很久很久,最后停在了正中间。",
      "* 审判者合上记录:「LV再高,今天也判不了你。」",
      "* ——第三纪元:平衡。你,还是你。",
    ],
  },
  {
    id: "ch4",
    title: "审判纪元 · 第四章 「尘」",
    lines: [
      "* 没有欢呼。没有结算音乐。",
      "* 连裂缝外的声音,都安静了。",
      "* 走廊尽头的墙上,只有一句很旧的话:",
      "* 「在这个世界,杀,或者被杀。」",
      "* 你伸手把它擦掉了。灰尘沾了满手。",
      "* ——第四纪元:尘归尘。愿你还记得自己的名字。",
    ],
  },
  {
    id: "ch5",
    title: "审判纪元 · 终章 「守望」",
    lines: [
      "* 图鉴的最后一页翻过去,背面还有一行小字:",
      "* 「谢谢你认真看完了每一个怪物。",
      "*   它们都有名字,也都有人记得。」",
      "* 一只小白狗不知从哪里冒出来,趴在书页上睡着了。",
      "* 你决定不叫醒它。传说,写下这一切的就是它。",
      "* ——终章:守望者。这个世界,交给你看管了。",
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

export function pickDogLine() {
  return pickFrom(DOG_LINES);
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

export function championEntrance(championId) {
  return CHAMPION_ENTRANCES[championId] || null;
}

// ---- 分享卡「裂缝外锐评」: one gray line of community judgement -------------
// priority chain: the juiciest angle wins; generic pools keep repeats fresh

export function pickShareRoast({ outcome, deathKind, survived = 0, clearTime = 0, maxStreak = 0, rounds = 0, hpPct = 0 } = {}) {
  if (deathKind === "tank") return "* 裂缝外锐评:死于杰瑞。公开处刑。";
  if (outcome === "victory" && clearTime <= 350) return "* 裂缝外锐评:这手速,建议直播。";
  if (outcome === "victory" && hpPct >= 0.99) return "* 裂缝外锐评:满血通关,手元警告。";
  if ((outcome === "death" || outcome === "quit") && survived < 60) return "* 裂缝外锐评:下饭,但下的是我。";
  if (maxStreak >= 50) return "* 裂缝外锐评:割草机成精了。";
  if (rounds >= 5) return "* 裂缝外锐评:肝帝认证,泪目。";
  if (outcome === "retreat") return "* 裂缝外锐评:见好就收,高手。";
  if (outcome === "victory")
    return pickFrom(["* 裂缝外锐评:正常发挥,收藏了。", "* 裂缝外锐评:爷的决心,回来了。"]);
  return pickFrom(["* 裂缝外锐评:典。", "* 裂缝外锐评:差亿点点。", "* 裂缝外锐评:重开,这把有了。"]);
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
};

export function codexNote(key) {
  return CODEX_NOTES[key] || null;
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
];

export function pickPauseTip() {
  return pickFrom(PAUSE_TIPS);
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
];

export function pickFlowerLine() {
  return pickFrom(FLOWER_LINES);
}
