// Monster identity lives here so combat labels, unlock rules and the codex
// cannot drift apart. Chinese names follow the commonly used Undertale Wiki
// translations; gameplay descriptions are specific to this survivor game.

export const BASE_MONSTERS = [
  {
    key: "slime",
    type: "slime",
    name: "蛙吉特",
    english: "Froggit",
    region: "废墟",
    title: "会说呱语的引路者",
    lore: "废墟里最早遇见的怪物。性情温和，也常把地下世界的规则告诉迷路的人类。",
    skill: "稳步追近；数量多时会从四面压缩走位空间。",
    color: "#76d275",
  },
  {
    key: "bat",
    type: "bat",
    name: "忧郁虫虫",
    english: "Whimsun",
    region: "废墟",
    title: "连道歉都小声的飞虫",
    lore: "胆怯得几乎不敢战斗，总像下一秒就会哭着逃走。",
    skill: "高速蛇形飞行；血量低，但很容易穿过火力空隙。",
    color: "#c39ae0",
  },
  {
    key: "ghost",
    type: "ghost",
    name: "蔬菜兽",
    english: "Vegetoid",
    region: "废墟",
    title: "地下沙拉协会成员",
    lore: "执着地劝所有人多吃蔬菜。笑容热情，推销方式却有一点强硬。",
    skill: "缓慢压阵并承受更多伤害，常藏在快速怪物后方推进。",
    color: "#9fdc8f",
  },
  {
    key: "tank",
    type: "tank",
    name: "杰瑞",
    english: "Jerry",
    region: "雪镇",
    title: "谁也不想同行的家伙",
    lore: "总能把气氛变得尴尬。大家嘴上嫌弃它，最后却还是会等它跟上。",
    skill: "生命很高、移动缓慢、碰撞伤害重，是怪群中的肉盾。",
    color: "#e6c84e",
  },
  {
    key: "red",
    type: "red",
    name: "卢克眼",
    english: "Loox",
    region: "废墟",
    title: "讨厌被人找茬的独眼",
    lore: "名字和外形都在提醒你看着它，但它最讨厌别人欺负弱小。",
    skill: "登场后短暂免伤并双倍冲刺，必须避开第一轮突袭。",
    color: "#e05555",
  },
  {
    key: "orange",
    type: "orange",
    name: "疯狂魔术师",
    english: "Madjick",
    region: "核心",
    title: "自我陶醉的核心佣兵",
    lore: "戴着弯曲尖帽、操纵两颗魔法球，念咒时从不给别人插话的机会。",
    skill: "拥有三条命；每次复生会短暂无敌，环绕光球显示剩余命数。",
    color: "#f09a4a",
  },
  {
    key: "blue",
    type: "blue",
    name: "约刷亚",
    english: "Woshua",
    region: "瀑布",
    title: "洁癖过头的清洁狂",
    lore: "把清洁当成使命，恨不得连战场和对手一起洗得闪闪发亮。",
    skill: "攻击距离远于身体碰撞圈，浅蓝范围环就是危险边界。",
    color: "#5aa8e0",
  },
  {
    key: "purple",
    type: "purple",
    name: "冰帽盖",
    english: "Ice Cap",
    region: "雪镇",
    title: "只想让你夸帽子的少年",
    lore: "最珍惜头顶那顶冰帽。只要有人认真欣赏，它就会立刻神气起来。",
    skill: "标记玩家脚下，1 秒后瞬移突袭；紫色叉号会提前预警。",
    color: "#9a86e8",
  },
];

export const ELITE_MONSTERS = [
  {
    key: "elite_final_froggit",
    type: "slime",
    name: "终极蛙吉特",
    english: "Final Froggit",
    region: "困难模式 / 核心",
    title: "看透人生的蛙之贤者",
    lore: "蛙吉特的强大同族。原作中会在困难模式与核心现身，态度比外表更从容。",
    skill: "审判跃击：锁定脚下后跃迁重砸，绿色圆环收缩完毕时爆发。",
    color: "#7cf28a",
    minDifficulty: 1,
    debutTime: 90,
    unlock: "狂暴难度 1:30 后出现",
    skillId: "leap",
  },
  {
    key: "elite_whimsalot",
    type: "bat",
    name: "忧伤虫爵士",
    english: "Whimsalot",
    region: "困难模式 / 核心",
    title: "为荣誉而战的悲伤骑士",
    lore: "忧郁虫虫不再逃避后的姿态。仍然悲伤，却终于鼓起勇气正面战斗。",
    skill: "蝶翼冲锋：短暂蓄力后进入高速追击，沿途留下紫色残影。",
    color: "#d5a6ff",
    minDifficulty: 1,
    debutTime: 135,
    unlock: "狂暴难度 2:15 后出现",
    skillId: "rush",
  },
  {
    key: "elite_astigmatism",
    type: "red",
    name: "散光眼",
    english: "Astigmatism",
    region: "困难模式 / 核心",
    title: "要求你服从命令的凝视者",
    lore: "卢克眼更危险的同族。它在意的不是注视本身，而是你有没有照它说的做。",
    skill: "裁决凝视：红色视界扩张后，对范围内目标造成一次远程伤害。",
    color: "#ff6464",
    minDifficulty: 2,
    debutTime: 180,
    unlock: "地狱难度 3:00 后出现",
    skillId: "gaze",
  },
  {
    key: "elite_parsnik",
    type: "ghost",
    name: "欧防风兽",
    english: "Parsnik",
    region: "困难模式废墟",
    title: "甜言蜜语的根茎诱惑者",
    lore: "蔬菜兽在困难模式中的对应怪物，说话更甜，地下根须也更加危险。",
    skill: "根须盛宴：在玩家周围种下三枚橙色危险区，依次破土爆发。",
    color: "#ffb15d",
    minDifficulty: 2,
    debutTime: 225,
    unlock: "地狱难度 3:45 后出现",
    skillId: "roots",
  },
];

export const ROUND_CHAMPIONS = [
  {
    key: "champion_greater_dog",
    championId: "greaterDog",
    baseType: "tank",
    type: "champion",
    name: "大犬汪",
    english: "Greater Dog",
    region: "雪镇",
    title: "把战斗当成游戏的皇家守卫犬",
    lore: "盔甲看起来威风凛凛，里面却是一只渴望玩耍和摸头的大狗。",
    skill: "蓝枪冲锋：锁定直线后猛冲；蓝色长枪只会伤害仍在移动的目标。",
    color: "#8fd6ff",
    unlock: "无尽审判第 1 轮首领",
    skillId: "dogCharge",
    hpFactor: 0.9,
    dmgFactor: 1,
  },
  {
    key: "champion_mad_dummy",
    championId: "madDummy",
    baseType: "ghost",
    type: "champion",
    name: "愤怒假人",
    english: "Mad Dummy",
    region: "瀑布垃圾场",
    title: "气到和假人身体融为一体的幽灵",
    lore: "普通攻击无法让它冷静。最好的办法，是让它召来的火力打回自己身上。",
    skill: "假人齐射：锁定玩家位置轰炸；把锁定圈引到首领脚下可以造成反伤。",
    color: "#ffd166",
    unlock: "无尽审判第 2 轮首领",
    skillId: "dummyVolley",
    hpFactor: 1.35,
    dmgFactor: 0.95,
  },
  {
    key: "champion_knight_knight",
    championId: "knightKnight",
    baseType: "tank",
    type: "champion",
    name: "骑士骑士",
    english: "Knight Knight",
    region: "核心",
    title: "在日月魔法中沉睡的重甲骑士",
    lore: "核心的佣兵战士。低声吟唱古老歌谣，让太阳与月亮替她作战。",
    skill: "月陨星落：连续标记五片区域，月光按标记顺序坠落爆炸。",
    color: "#c9b6ff",
    unlock: "无尽审判第 3 轮首领",
    skillId: "moonfall",
    hpFactor: 1.25,
    dmgFactor: 1.1,
  },
  {
    key: "champion_muffet",
    championId: "muffet",
    baseType: "red",
    type: "champion",
    name: "玛菲特",
    english: "Muffet",
    region: "热域",
    title: "为蜘蛛家族筹款的甜点老板",
    lore: "笑容甜美，蛛网和点心却一点也不温柔。她会把猎物固定在紫色丝线上。",
    skill: "蛛网宴席：铺开三条紫色轨道，其中一条亮起后会被蜘蛛群横扫。",
    color: "#d67cff",
    unlock: "无尽审判第 4 轮首领",
    skillId: "webFeast",
    hpFactor: 1.8,
    dmgFactor: 1.05,
  },
];

export const CODEX_MONSTERS = [...BASE_MONSTERS, ...ELITE_MONSTERS, ...ROUND_CHAMPIONS];
export const MONSTER_BY_TYPE = Object.fromEntries(BASE_MONSTERS.map((m) => [m.type, m]));

const ELITE_BY_TYPE = Object.fromEntries(ELITE_MONSTERS.map((m) => [m.type, m]));

export function eliteProfileFor(type, difficultyId) {
  const profile = ELITE_BY_TYPE[type];
  return profile && difficultyId >= profile.minDifficulty ? profile : null;
}

export function eliteTypePool(difficultyId, elapsed = Infinity) {
  const genocideLead = difficultyId >= 3 ? 30 : 0;
  const pool = ELITE_MONSTERS.filter(
    (m) => difficultyId >= m.minDifficulty && elapsed >= Math.max(60, m.debutTime - genocideLead)
  ).map((m) => m.type);
  return pool.length ? pool : null;
}

export function codexKeyForEnemy(enemy) {
  return enemy.championProfile?.key || enemy.eliteProfile?.key || enemy.type;
}

export function championForRound(round) {
  return ROUND_CHAMPIONS[(Math.max(1, round) - 1) % ROUND_CHAMPIONS.length];
}
