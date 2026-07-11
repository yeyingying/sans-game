import { circleHit } from "./utils.js";

export const WEAPONS = {
  bone: {
    id: "bone",
    name: "碎骨投掷",
    tag: "远程单发",
    desc: "向最近的敌人投出骨头，升级后扇形多发",
    color: "#f2ead8",
    enhance: { desc: "骨头穿透 +2", detail: "重复选择穿透 +1/层" },
    // evolution: max tier + 3 enhance stacks unlocks the awakened form
    evolve: {
      name: "灭骨风暴",
      desc: "8连赤骨齐射，穿透与攻速全面觉醒",
      tier: { projectiles: 8, spread: 36, pierce: 6, dmgMult: 3.2, rateMult: 1.4, size: 14 },
    },
    tiers: [
      { projectiles: 1, spread: 0, pierce: 1, dmgMult: 1.0, rateMult: 1.0, size: 8 },
      { projectiles: 2, spread: 12, pierce: 1, dmgMult: 1.15, rateMult: 1.05, size: 8 },
      { projectiles: 3, spread: 16, pierce: 2, dmgMult: 1.3, rateMult: 1.1, size: 9 },
      { projectiles: 4, spread: 22, pierce: 3, dmgMult: 1.6, rateMult: 1.1, size: 10 },
      { projectiles: 5, spread: 26, pierce: 4, dmgMult: 2.0, rateMult: 1.15, size: 12 },
    ],
  },
  orbit: {
    id: "orbit",
    name: "骨之环",
    tag: "近战环绕",
    desc: "骨头环绕自身旋转，把靠近的敌人撞飞出去",
    color: "#8fd6ff",
    enhance: { desc: "骨环固定大小，击退 +50%", detail: "重复选择击退 +10%/层" },
    evolve: {
      name: "白骨领域",
      desc: "12根巨骨织成绞杀领域，靠近者皆碎",
      tier: { count: 12, radius: 98, spin: 5.2, dmgMult: 5.0, size: 24 },
    },
    tiers: [
      { count: 3, radius: 44, spin: 2.6, dmgMult: 1.5, size: 16 },
      { count: 4, radius: 50, spin: 2.9, dmgMult: 1.7, size: 16 },
      { count: 5, radius: 56, spin: 3.2, dmgMult: 2.0, size: 18 },
      { count: 6, radius: 64, spin: 3.5, dmgMult: 2.4, size: 18 },
      { count: 8, radius: 72, spin: 3.9, dmgMult: 3.0, size: 20 },
    ],
  },
  homing: {
    id: "homing",
    name: "追踪骨弹",
    tag: "远程追踪",
    desc: "骨弹自动转向，追着敌人打",
    color: "#ff9e6b",
    enhance: { desc: "命中禁锢 0.5 秒", detail: "重复选择 +0.25s/层" },
    evolve: {
      name: "万骨归宗",
      desc: "7发追魂骨弹，转向如影随形",
      tier: { projectiles: 7, pierce: 5, dmgMult: 3.6, rateMult: 1.15, turn: 9, size: 14 },
    },
    tiers: [
      { projectiles: 1, pierce: 1, dmgMult: 1.25, rateMult: 0.9, turn: 4.5, size: 9 },
      { projectiles: 2, pierce: 1, dmgMult: 1.35, rateMult: 0.95, turn: 5, size: 9 },
      { projectiles: 2, pierce: 2, dmgMult: 1.55, rateMult: 1.0, turn: 5.5, size: 10 },
      { projectiles: 3, pierce: 2, dmgMult: 1.8, rateMult: 1.0, turn: 6, size: 11 },
      { projectiles: 4, pierce: 3, dmgMult: 2.2, rateMult: 1.05, turn: 7, size: 12 },
    ],
  },
  bomb: {
    id: "bomb",
    name: "骨雷",
    tag: "投掷范围",
    desc: "抛出骨雷，爆炸造成大范围伤害",
    color: "#ffd166",
    enhance: { desc: "爆炸次数 +2", detail: "重复选择爆炸次数 +1/层" },
    evolve: {
      name: "歼灭轰炸",
      desc: "5连骨雷地毯式覆盖，半径暴涨",
      tier: { bombs: 5, blast: 150, dmgMult: 5.5, rateMult: 0.65 },
    },
    tiers: [
      { bombs: 1, blast: 64, dmgMult: 1.8, rateMult: 0.45 },
      { bombs: 1, blast: 76, dmgMult: 2.1, rateMult: 0.5 },
      { bombs: 2, blast: 84, dmgMult: 2.4, rateMult: 0.5 },
      { bombs: 2, blast: 96, dmgMult: 2.9, rateMult: 0.55 },
      { bombs: 3, blast: 110, dmgMult: 3.5, rateMult: 0.55 },
    ],
  },
  beam: {
    id: "beam",
    name: "贯穿骨矛",
    tag: "直线穿透",
    desc: "笔直飞行，无限穿透路径上所有敌人",
    color: "#c59bff",
    enhance: { desc: "每穿透一个敌人引发小爆炸", detail: "重复选择扩大爆炸范围" },
    evolve: {
      name: "审判之枪",
      desc: "5道巨型骨矛，贯穿一切的白色审判",
      tier: { projectiles: 5, spread: 24, dmgMult: 4.0, rateMult: 1.0, size: 17 },
    },
    tiers: [
      { projectiles: 1, spread: 0, dmgMult: 1.1, rateMult: 0.7, size: 10 },
      { projectiles: 1, spread: 0, dmgMult: 1.4, rateMult: 0.75, size: 11 },
      { projectiles: 2, spread: 10, dmgMult: 1.6, rateMult: 0.8, size: 12 },
      { projectiles: 2, spread: 14, dmgMult: 2.0, rateMult: 0.85, size: 13 },
      { projectiles: 3, spread: 18, dmgMult: 2.5, rateMult: 0.9, size: 14 },
    ],
  },
  spike: {
    id: "spike",
    name: "地刺骨牢",
    tag: "地面召唤",
    desc: "从地下召唤骨刺刺穿敌人，升级后骨刺和目标更多",
    color: "#d9c47a",
    enhance: { desc: "攻击时在身边召唤骨牢环", detail: "重复选择增加环上骨头数" },
    evolve: {
      name: "白骨刑场",
      desc: "16根骨刺同时贯穿7个目标",
      tier: { targets: 7, spikes: 16, dmgMult: 4.0, rateMult: 0.75 },
    },
    tiers: [
      { targets: 1, spikes: 2, dmgMult: 1.4, rateMult: 0.55 },
      { targets: 2, spikes: 3, dmgMult: 1.55, rateMult: 0.55 },
      { targets: 2, spikes: 5, dmgMult: 1.8, rateMult: 0.6 },
      { targets: 3, spikes: 7, dmgMult: 2.1, rateMult: 0.6 },
      { targets: 4, spikes: 10, dmgMult: 2.5, rateMult: 0.65 },
    ],
  },
  laser: {
    id: "laser",
    name: "风车激光",
    tag: "旋转光束",
    desc: "低频率召唤旋转一整圈的激光风车，触碰持续掉血",
    color: "#9bd7ff",
    enhance: { desc: "激光待机时 +50% 减伤", detail: "每层 +10%，上限 90%" },
    evolve: {
      name: "湮灭风车",
      desc: "7叶巨型光轮，触者皆熔",
      tier: { beams: 7, dmgMult: 12, rateMult: 0.36, duration: 3.4, width: 20 },
    },
    tiers: [
      { beams: 1, dmgMult: 4.5, rateMult: 0.28, duration: 2.6, width: 14 },
      { beams: 2, dmgMult: 5.2, rateMult: 0.28, duration: 2.6, width: 14 },
      { beams: 3, dmgMult: 6.0, rateMult: 0.3, duration: 2.8, width: 15 },
      { beams: 4, dmgMult: 7.0, rateMult: 0.3, duration: 2.8, width: 16 },
      { beams: 5, dmgMult: 8.0, rateMult: 0.32, duration: 3.0, width: 17 },
    ],
  },
  boomerang: {
    id: "boomerang",
    name: "回旋骨镖",
    tag: "回旋折返",
    desc: "扔出后折返回手，去程回程各伤一次",
    color: "#7ce8a8",
    enhance: { desc: "回程伤害 +100%", detail: "重复选择 +20%/层" },
    evolve: {
      name: "无归之镖",
      desc: "6把巨镖织成往返绞杀网",
      tier: { boomerangs: 6, dmgMult: 3.2, rateMult: 0.95, size: 16 },
    },
    tiers: [
      { boomerangs: 1, dmgMult: 1.3, rateMult: 0.8, size: 12 },
      { boomerangs: 2, dmgMult: 1.45, rateMult: 0.8, size: 12 },
      { boomerangs: 3, dmgMult: 1.6, rateMult: 0.85, size: 13 },
      { boomerangs: 4, dmgMult: 1.9, rateMult: 0.85, size: 13 },
      { boomerangs: 5, dmgMult: 2.3, rateMult: 0.9, size: 14 },
    ],
  },
  // ---- UKB weapons ---------------------------------------------------------
  bluebind: {
    id: "bluebind",
    name: "蓝骨禁锢",
    tag: "地面禁锢",
    desc: "地下伸出蓝骨伤害并禁锢敌人，升级加目标和禁锢时长",
    color: "#4f9dff",
    enhance: { desc: "攻击附带小爆炸", detail: "爆炸波及的敌人禁锢 0.25s/层" },
    evolve: {
      name: "蓝色审判",
      desc: "蓝骨天降：这次轮到你们不许动了(禁锢4秒)",
      tier: { targets: 12, root: 4.0, dmgMult: 4.0, rateMult: 0.7 },
    },
    tiers: [
      { targets: 3, root: 1.0, dmgMult: 1.4, rateMult: 0.5 },
      { targets: 4, root: 1.5, dmgMult: 1.6, rateMult: 0.5 },
      { targets: 5, root: 2.0, dmgMult: 1.8, rateMult: 0.55 },
      { targets: 6, root: 2.5, dmgMult: 2.0, rateMult: 0.55 },
      { targets: 7, root: 3.0, dmgMult: 2.3, rateMult: 0.6 },
    ],
  },
  wave: {
    id: "wave",
    name: "骨之浪潮",
    tag: "扇形浪涌",
    desc: "地下涌出层层骨浪扇形推进，升级加浪数和骨头数",
    color: "#c59bff",
    enhance: { desc: "骨浪附带击退", detail: "重复选择击退 +10%/层" },
    evolve: {
      name: "审判长廊",
      desc: "9波白骨海啸淹没长廊，无处落脚",
      tier: { waves: 9, bones: 14, dmgMult: 3.2, rateMult: 0.7 },
    },
    tiers: [
      { waves: 2, bones: 4, dmgMult: 1.2, rateMult: 0.5 },
      { waves: 3, bones: 6, dmgMult: 1.3, rateMult: 0.5 },
      { waves: 4, bones: 7, dmgMult: 1.45, rateMult: 0.55 },
      { waves: 5, bones: 8, dmgMult: 1.6, rateMult: 0.55 },
      { waves: 6, bones: 10, dmgMult: 1.8, rateMult: 0.6 },
    ],
  },
  cross: {
    id: "cross",
    name: "十字骨射",
    tag: "定向弹幕",
    desc: "向固定方向同时射出骨头，每级 +2 根",
    color: "#f2ead8",
    enhance: { desc: "延长敌人的禁锢", detail: "命中禁锢中的敌人 +1s，每层再 +0.5s" },
    evolve: {
      name: "业报乱刺·KR",
      desc: "20根业骨十六向穿刺，伤口不会愈合",
      tier: { bones: 20, pierce: 5, dmgMult: 3.8, rateMult: 1.35, size: 16 },
    },
    tiers: [
      { bones: 4, pierce: 2, dmgMult: 1.2, rateMult: 1.1, size: 12 },
      { bones: 6, pierce: 2, dmgMult: 1.4, rateMult: 1.1, size: 12 },
      { bones: 8, pierce: 2, dmgMult: 1.6, rateMult: 1.15, size: 13 },
      { bones: 10, pierce: 3, dmgMult: 1.9, rateMult: 1.15, size: 13 },
      { bones: 12, pierce: 3, dmgMult: 2.2, rateMult: 1.2, size: 14 },
    ],
  },
  orbitburst: {
    id: "orbitburst",
    name: "环绕骨雷",
    tag: "环绕爆破",
    desc: "骨雷绕身一周后掷向敌人爆炸，升级加骨雷数和爆炸半径",
    color: "#ffd166",
    enhance: { desc: "环绕时周期小爆炸", detail: "每 0.5s 一次，每层提高频率" },
    evolve: {
      name: "审判日轮",
      desc: "9颗骨雷绕身引爆，半径140",
      tier: { count: 9, blast: 140, dmgMult: 4.5, rateMult: 0.65, size: 24 },
    },
    tiers: [
      { count: 1, blast: 60, dmgMult: 1.6, rateMult: 0.45, size: 16 },
      { count: 2, blast: 70, dmgMult: 1.8, rateMult: 0.45, size: 16 },
      { count: 3, blast: 80, dmgMult: 2.0, rateMult: 0.5, size: 18 },
      { count: 4, blast: 90, dmgMult: 2.3, rateMult: 0.5, size: 18 },
      { count: 6, blast: 100, dmgMult: 2.6, rateMult: 0.55, size: 20 },
    ],
  },
  shield: {
    id: "shield",
    // reactive-only weapon (damages nothing on its own): never a viable
    // solo starter, so it is in-run only — the card pool still offers it
    support: true,
    name: "紫魂护盾",
    tag: "反弹护体",
    desc: "每 4.5 秒开盾，全额反弹伤害并击退，升级加持续时间",
    color: "#9a5df0",
    enhance: { desc: "开盾时狂化", detail: "+100% 移速和回血，每层 +25%" },
    evolve: {
      name: "紫魂蛛网",
      desc: "6秒紫网庇护，反弹一切恶意",
      tier: { duration: 6.0 },
    },
    tiers: [
      { duration: 2.0 },
      { duration: 2.5 },
      { duration: 3.0 },
      { duration: 3.5 },
      { duration: 4.0 },
    ],
  },
  soundwave: {
    id: "soundwave",
    name: "音波骨降",
    tag: "天降音波",
    desc: "骨头从天而降释放紫色音波，伤害并击退，升级加骨数和半径",
    color: "#e08fff",
    enhance: { desc: "巨大骨伤害 +100%", detail: "音波范围不变，每层再 +20%" },
    evolve: {
      name: "MEGALOVANIA",
      desc: "6根天骨奏响灭世强音，半径180音爆",
      tier: { bones: 6, radius: 180, dmgMult: 8.0, rateMult: 0.65 },
    },
    tiers: [
      { bones: 1, radius: 70, dmgMult: 3.0, rateMult: 0.45 },
      { bones: 2, radius: 85, dmgMult: 3.4, rateMult: 0.45 },
      { bones: 2, radius: 95, dmgMult: 3.8, rateMult: 0.5 },
      { bones: 3, radius: 110, dmgMult: 4.4, rateMult: 0.5 },
      { bones: 3, radius: 130, dmgMult: 5.0, rateMult: 0.55 },
    ],
  },
  chain: {
    id: "chain",
    name: "缚魂锁链",
    tag: "锁链牵引",
    desc: "锁链拖敌到面前，途中掉血，到达重击禁锢并小范围爆炸",
    color: "#b8a5d0",
    enhance: { desc: "到达爆炸附带禁锢", detail: "波及的敌人禁锢 0.25s/层" },
    evolve: {
      name: "蓝魂操纵",
      desc: "9条魂链拖拽灵魂，傀儡任凭摆布",
      tier: { chains: 9, root: 2.5, dmgMult: 5.0, rateMult: 0.65 },
    },
    tiers: [
      { chains: 1, root: 0.5, dmgMult: 2.0, rateMult: 0.45 },
      { chains: 2, root: 0.75, dmgMult: 2.2, rateMult: 0.45 },
      { chains: 3, root: 1.0, dmgMult: 2.4, rateMult: 0.5 },
      { chains: 4, root: 1.25, dmgMult: 2.7, rateMult: 0.5 },
      { chains: 5, root: 1.5, dmgMult: 3.0, rateMult: 0.55 },
    ],
  },
  plaser: {
    id: "plaser",
    name: "紫透激光",
    tag: "穿透灼烧",
    desc: "瞬间闪射贯穿全屏的激光，一次性伤害并减速，升级加锁定目标数",
    color: "#c95df0",
    enhance: { desc: "减速效果 +100%", detail: "重复选择每层再 +20%" },
    evolve: {
      name: "加斯特余响",
      desc: "9道紫光洪流——来自虚空的注视",
      tier: { beams: 9, dmgMult: 6.0, width: 26, duration: 0.15, rateMult: 0.5 },
    },
    tiers: [
      { beams: 1, dmgMult: 2.0, width: 12, duration: 0.15, rateMult: 0.35 },
      { beams: 2, dmgMult: 2.3, width: 13, duration: 0.15, rateMult: 0.35 },
      { beams: 3, dmgMult: 2.7, width: 14, duration: 0.15, rateMult: 0.37 },
      { beams: 4, dmgMult: 3.1, width: 16, duration: 0.15, rateMult: 0.37 },
      { beams: 5, dmgMult: 3.5, width: 18, duration: 0.15, rateMult: 0.4 },
    ],
  },
  // ---- Horror weapons -------------------------------------------------------
  sweep: {
    id: "sweep",
    name: "横扫之骨",
    tag: "近战横扫",
    desc: "巨骨扫向最近的敌人，范围伤害并持续推挤，升级加范围次数",
    color: "#ff5d5d",
    enhance: { desc: "击退 +50%", detail: "重复选择 +10%/层" },
    evolve: {
      name: "猎杀时刻",
      desc: "半径170的四连横扫，猎物无处可逃",
      tier: { radius: 170, swings: 4, dmgMult: 4.2, rateMult: 0.85 },
    },
    tiers: [
      { radius: 95, swings: 1, dmgMult: 1.5, rateMult: 0.6 },
      { radius: 110, swings: 1, dmgMult: 1.7, rateMult: 0.6 },
      { radius: 120, swings: 2, dmgMult: 1.9, rateMult: 0.65 },
      { radius: 135, swings: 2, dmgMult: 2.2, rateMult: 0.65 },
      { radius: 150, swings: 3, dmgMult: 2.6, rateMult: 0.7 },
    ],
  },
  feast: {
    id: "feast",
    name: "噬骨归宗",
    tag: "吸血骨弹",
    desc: "敌人背后召唤骨头飞回，沿途伤敌，回收时概率回血",
    color: "#ff8f8f",
    enhance: { desc: "回血概率 +10%", detail: "重复选择 +5%/层" },
    evolve: {
      name: "雪镇飨宴",
      desc: "7目标必定吸血——今晚不会挨饿",
      tier: { targets: 7, bonesPer: 3, healChance: 1.0, dmgMult: 3.2, rateMult: 0.85, size: 14 },
    },
    tiers: [
      { targets: 2, bonesPer: 1, healChance: 0.2, dmgMult: 1.2, rateMult: 0.6, size: 10 },
      { targets: 3, bonesPer: 1, healChance: 0.3, dmgMult: 1.35, rateMult: 0.6, size: 10 },
      { targets: 3, bonesPer: 2, healChance: 0.4, dmgMult: 1.5, rateMult: 0.65, size: 11 },
      { targets: 4, bonesPer: 2, healChance: 0.5, dmgMult: 1.7, rateMult: 0.65, size: 11 },
      { targets: 5, bonesPer: 2, healChance: 0.6, dmgMult: 2.0, rateMult: 0.7, size: 12 },
    ],
  },
  slam: {
    id: "slam",
    name: "重砸",
    tag: "禁锢重击",
    desc: "周身连续砸击，高伤害并禁锢，升级加次数和禁锢",
    color: "#d63a3a",
    enhance: { desc: "每砸中一个敌人获得 0.15s 无敌", detail: "重复选择 +0.1s/层，累计上限 1.5s" },
    evolve: {
      name: "开颅重锤",
      desc: "10连重砸+禁锢2.5秒，给他们也开个洞",
      tier: { smashes: 10, root: 2.5, dmgMult: 5.5, rateMult: 0.6 },
    },
    tiers: [
      { smashes: 3, root: 0.5, dmgMult: 2.2, rateMult: 0.4 },
      { smashes: 4, root: 0.75, dmgMult: 2.4, rateMult: 0.4 },
      { smashes: 5, root: 1.0, dmgMult: 2.7, rateMult: 0.45 },
      { smashes: 6, root: 1.25, dmgMult: 3.0, rateMult: 0.45 },
      { smashes: 7, root: 1.5, dmgMult: 3.4, rateMult: 0.5 },
    ],
  },
  axes: {
    id: "axes",
    name: "穿透飞斧",
    tag: "穿透投掷",
    desc: "掷出穿透一切的飞斧，升级加飞斧数量",
    color: "#c7cdd8",
    enhance: { desc: "飞斧变为回旋镖，去而复返", detail: "重复选择 +1 次回旋" },
    evolve: {
      name: "千斧断魂",
      desc: "8把巨斧撕裂全场，伤害翻倍",
      tier: { count: 8, dmgMult: 4.0, rateMult: 0.95, size: 24 },
    },
    tiers: [
      { count: 2, dmgMult: 1.5, rateMult: 0.75, size: 14 },
      { count: 3, dmgMult: 1.65, rateMult: 0.75, size: 14 },
      { count: 4, dmgMult: 1.8, rateMult: 0.8, size: 15 },
      { count: 5, dmgMult: 2.1, rateMult: 0.8, size: 15 },
      { count: 6, dmgMult: 2.4, rateMult: 0.85, size: 16 },
    ],
  },
  quake: {
    id: "quake",
    name: "崩地巨骨",
    tag: "震荡击退",
    desc: "脚下召出巨骨掀起击退波，升级加波数和巨骨大小",
    color: "#ff5d5d",
    enhance: { desc: "被震波杀死的敌人爆炸", detail: "重复选择扩大爆炸半径" },
    evolve: {
      name: "雪镇崩塌",
      desc: "5波半径200的塌方震荡",
      tier: { waves: 5, radius: 200, boneSize: 80, dmgMult: 4.5, rateMult: 0.55 },
    },
    tiers: [
      { waves: 1, radius: 95, boneSize: 40, dmgMult: 1.8, rateMult: 0.35 },
      { waves: 2, radius: 105, boneSize: 46, dmgMult: 2.0, rateMult: 0.35 },
      { waves: 2, radius: 115, boneSize: 52, dmgMult: 2.3, rateMult: 0.4 },
      { waves: 3, radius: 125, boneSize: 58, dmgMult: 2.5, rateMult: 0.4 },
      { waves: 3, radius: 140, boneSize: 64, dmgMult: 2.8, rateMult: 0.45 },
    ],
  },
  lasso: {
    id: "lasso",
    name: "斧旋捕猎",
    tag: "环绕捕掷",
    desc: "斧子绕身两圈粘住敌人后连人掷出，升级加斧子大小",
    color: "#aab2c2",
    enhance: { desc: "每粘住一个敌人回复 1 血", detail: "重复选择 +1 回血/层" },
    evolve: {
      name: "屠夫巨斧",
      desc: "斧刃尺寸翻倍，绞碎猎物",
      tier: { size: 52, dmgMult: 5.0, rateMult: 0.55 },
    },
    tiers: [
      { size: 18, dmgMult: 2.0, rateMult: 0.35 },
      { size: 22, dmgMult: 2.2, rateMult: 0.35 },
      { size: 26, dmgMult: 2.4, rateMult: 0.4 },
      { size: 30, dmgMult: 2.7, rateMult: 0.4 },
      { size: 34, dmgMult: 3.0, rateMult: 0.45 },
    ],
  },
  cleave: {
    id: "cleave",
    name: "幻影重劈",
    tag: "二段劈砍",
    desc: "斧头轻砸后，大斧虚影劈向同处造成大额伤害，升级加砸击次数",
    color: "#e8ecf4",
    enhance: { desc: "每次砸击分裂 2 个额外幻影", detail: "重复选择 +1 幻影" },
    evolve: {
      name: "断头幻影",
      desc: "6连劈斩首风暴",
      tier: { combos: 6, dmgMult: 2.6, rateMult: 0.75 },
    },
    tiers: [
      { combos: 1, dmgMult: 1.0, rateMult: 0.5 },
      { combos: 2, dmgMult: 1.1, rateMult: 0.5 },
      { combos: 2, dmgMult: 1.25, rateMult: 0.55 },
      { combos: 3, dmgMult: 1.4, rateMult: 0.55 },
      { combos: 3, dmgMult: 1.6, rateMult: 0.6 },
    ],
  },
  boneringH: {
    id: "boneringH",
    name: "震地骨阵",
    tag: "地阵爆发",
    desc: "原地重砸一击，随后在四周立起一圈骨头，升级加骨头数量",
    color: "#e8dcc0",
    enhance: { desc: "骨头圈数 +2", detail: "重复选择 +1 圈" },
    evolve: {
      name: "白骨猎场",
      desc: "32根巨骨圈出死亡猎场",
      tier: { bones: 32, ring: 150, dmgMult: 4.0, rateMult: 0.7 },
    },
    tiers: [
      { bones: 12, ring: 80, dmgMult: 1.6, rateMult: 0.45 },
      { bones: 14, ring: 85, dmgMult: 1.8, rateMult: 0.45 },
      { bones: 16, ring: 92, dmgMult: 2.0, rateMult: 0.5 },
      { bones: 18, ring: 100, dmgMult: 2.2, rateMult: 0.5 },
      { bones: 20, ring: 110, dmgMult: 2.4, rateMult: 0.55 },
    ],
  },
  // ---- Hard-mode weapons ----------------------------------------------------
  dash: {
    id: "dash",
    name: "极限突刺",
    tag: "突进穿透",
    desc: "向目标突刺并穿透路径，返回原位时爆炸，升级加突刺次数",
    color: "#5db9ff",
    enhance: { desc: "突刺时减伤 +10%", detail: "重复选择 +5%/层" },
    evolve: {
      name: "橙魂疾冲",
      desc: "9连突刺——橙色攻击，永不停步",
      tier: { dashes: 9, dmgMult: 4.0, rateMult: 0.75 },
    },
    tiers: [
      { dashes: 1, dmgMult: 1.6, rateMult: 0.5 },
      { dashes: 2, dmgMult: 1.8, rateMult: 0.5 },
      { dashes: 3, dmgMult: 2.0, rateMult: 0.55 },
      { dashes: 4, dmgMult: 2.2, rateMult: 0.55 },
      { dashes: 5, dmgMult: 2.4, rateMult: 0.6 },
    ],
  },
  splitbone: {
    id: "splitbone",
    name: "裂变骨雨",
    tag: "空中分裂",
    desc: "射出 6 根骨头，悬停后各自裂成子骨，升级加分裂数量",
    color: "#f2ead8",
    enhance: { desc: "子骨再裂出 4 个子子骨", detail: "重复选择增加分裂数量" },
    evolve: {
      name: "蓝橙骤雨",
      desc: "14裂变蓝橙弹幕铺天盖地",
      tier: { split: 14, dmgMult: 3.0, rateMult: 0.8, size: 14 },
    },
    tiers: [
      { split: 4, dmgMult: 1.2, rateMult: 0.55, size: 10 },
      { split: 5, dmgMult: 1.35, rateMult: 0.55, size: 10 },
      { split: 6, dmgMult: 1.5, rateMult: 0.6, size: 11 },
      { split: 7, dmgMult: 1.65, rateMult: 0.6, size: 11 },
      { split: 8, dmgMult: 1.8, rateMult: 0.65, size: 12 },
    ],
  },
  bonemark: {
    id: "bonemark",
    name: "蓝骨降罚",
    tag: "标记爆破",
    desc: "在目标身上召唤蓝骨爆炸并环出骨圈，升级加爆炸、目标与骨数",
    color: "#4f9dff",
    enhance: { desc: "骨圈变蓝并禁锢 1 秒", detail: "重复选择禁锢 +0.5s/层" },
    evolve: {
      name: "静止蓝罚",
      desc: "8目标蓝骨降罚+半径100爆环",
      tier: { targets: 8, blast: 100, ringBones: 14, dmgMult: 3.8, rateMult: 0.75 },
    },
    tiers: [
      { targets: 3, blast: 40, ringBones: 6, dmgMult: 1.4, rateMult: 0.5 },
      { targets: 3, blast: 48, ringBones: 7, dmgMult: 1.6, rateMult: 0.5 },
      { targets: 4, blast: 54, ringBones: 8, dmgMult: 1.8, rateMult: 0.55 },
      { targets: 4, blast: 60, ringBones: 9, dmgMult: 2.0, rateMult: 0.55 },
      { targets: 5, blast: 68, ringBones: 10, dmgMult: 2.2, rateMult: 0.6 },
    ],
  },
  megabone: {
    id: "megabone",
    name: "天坠巨骨",
    tag: "坠地分裂",
    desc: "头顶巨骨砸地爆炸，裂成小骨四射，升级多一圈骨头",
    color: "#ffd166",
    enhance: { desc: "碎骨 3 层穿透且不消失", detail: "重复选择穿透 +2/层" },
    evolve: {
      name: "终焉之骨",
      desc: "8环弹幕+半径160巨爆——这是最后一根骨头",
      tier: { shards: 36, rings: 8, dmgMult: 5.5, rateMult: 0.42, blast: 160 },
    },
    tiers: [
      { shards: 36, rings: 1, dmgMult: 2.2, rateMult: 0.3, blast: 90 },
      { shards: 36, rings: 2, dmgMult: 2.4, rateMult: 0.3, blast: 96 },
      { shards: 36, rings: 3, dmgMult: 2.7, rateMult: 0.32, blast: 102 },
      { shards: 36, rings: 4, dmgMult: 3.0, rateMult: 0.32, blast: 108 },
      { shards: 36, rings: 5, dmgMult: 3.2, rateMult: 0.34, blast: 116 },
    ],
  },
  orb: {
    id: "orb",
    name: "蓝魂光球",
    tag: "缓速禁锢",
    desc: "缓慢前进的暗蓝光环，触碰持续伤害并禁锢，升级加索敌目标",
    color: "#2f6ea8",
    enhance: { desc: "敌人粘在光球上(上限 5)", detail: "重复选择上限 +3/层" },
    evolve: {
      name: "蓝魂引力",
      desc: "9颗引力光球拖拽灵魂",
      tier: { orbs: 9, dmgMult: 3.6, rateMult: 0.62 },
    },
    tiers: [
      { orbs: 1, dmgMult: 1.2, rateMult: 0.4 },
      { orbs: 2, dmgMult: 1.4, rateMult: 0.4 },
      { orbs: 3, dmgMult: 1.6, rateMult: 0.45 },
      { orbs: 4, dmgMult: 1.8, rateMult: 0.45 },
      { orbs: 5, dmgMult: 2.0, rateMult: 0.5 },
    ],
  },
  gaster: {
    id: "gaster",
    name: "龙骨炮",
    tag: "头顶轰击",
    desc: "头顶召唤龙骨炮向目标轰出巨大光束，升级加数量(同向齐射)",
    color: "#fddefe",
    enhance: { desc: "龙骨炮体积 +50%", detail: "重复选择 +20%/层" },
    evolve: {
      name: "W.D.加斯特炮阵",
      desc: "9门龙骨炮齐轰——记得那个被遗忘的人",
      tier: { count: 9, dmgMult: 8.0, rateMult: 0.65 },
    },
    tiers: [
      { count: 1, dmgMult: 3.0, rateMult: 0.45 },
      { count: 2, dmgMult: 3.4, rateMult: 0.45 },
      { count: 3, dmgMult: 3.8, rateMult: 0.48 },
      { count: 4, dmgMult: 4.2, rateMult: 0.48 },
      { count: 5, dmgMult: 4.6, rateMult: 0.52 },
    ],
  },
  ringlaser: {
    id: "ringlaser",
    name: "环阵闪射",
    tag: "环状激光",
    desc: "36 根短激光绕圈依次闪射，命中禁锢，升级加激光数",
    color: "#8fd6ff",
    enhance: { desc: "激光命中处小爆炸", detail: "重复选择扩大爆炸半径" },
    evolve: {
      name: "最终审判环",
      desc: "120道环射光刃，无处可躲",
      tier: { lasers: 120, dmgMult: 3.0, rateMult: 0.36 },
    },
    tiers: [
      { lasers: 36, dmgMult: 1.1, rateMult: 0.25 },
      { lasers: 44, dmgMult: 1.25, rateMult: 0.25 },
      { lasers: 52, dmgMult: 1.4, rateMult: 0.27 },
      { lasers: 60, dmgMult: 1.55, rateMult: 0.27 },
      { lasers: 68, dmgMult: 1.7, rateMult: 0.29 },
    ],
  },
  turret: {
    id: "turret",
    name: "旋地骨桩",
    tag: "旋转炮台",
    desc: "骨桩插地环转，撞击碾过的敌人，升级 +2 根",
    color: "#9be8a8",
    enhance: { desc: "撞击附带击退", detail: "重复选择提高击退力度" },
    evolve: {
      name: "白骨丛林",
      desc: "20根骨桩拔地绞杀",
      tier: { bones: 20, dmgMult: 4.2, rateMult: 0.7 },
    },
    tiers: [
      { bones: 4, dmgMult: 1.5, rateMult: 0.5 },
      { bones: 6, dmgMult: 1.7, rateMult: 0.5 },
      { bones: 8, dmgMult: 1.9, rateMult: 0.55 },
      { bones: 10, dmgMult: 2.2, rateMult: 0.55 },
      { bones: 12, dmgMult: 2.5, rateMult: 0.6 },
    ],
  },
};

export const CHARACTERS = [
  { id: "sans", name: "传说之下", color: "#7ea8ff", desc: "经典骨骼战士，八种正统骨系武器" },
  { id: "ukb", name: "因果报应", color: "#c59bff", desc: "紫光神秘骷髅，禁锢与反震的掌控者" },
  { id: "horror", name: "恐惧传说", color: "#ff5d5d", desc: "猎手骷髅，巨骨与飞斧的狂宴" },
  { id: "hard", name: "困难模式", color: "#5db9ff", desc: "蓝光缠身，极限攻势的化身" },
];

export const WEAPON_LISTS = {
  sans: [
    WEAPONS.bone,
    WEAPONS.orbit,
    WEAPONS.homing,
    WEAPONS.bomb,
    WEAPONS.beam,
    WEAPONS.spike,
    WEAPONS.laser,
    WEAPONS.boomerang,
  ],
  ukb: [
    WEAPONS.bluebind,
    WEAPONS.wave,
    WEAPONS.cross,
    WEAPONS.orbitburst,
    WEAPONS.shield,
    WEAPONS.soundwave,
    WEAPONS.chain,
    WEAPONS.plaser,
  ],
  horror: [
    WEAPONS.sweep,
    WEAPONS.feast,
    WEAPONS.slam,
    WEAPONS.axes,
    WEAPONS.quake,
    WEAPONS.lasso,
    WEAPONS.cleave,
    WEAPONS.boneringH,
  ],
  hard: [
    WEAPONS.dash,
    WEAPONS.splitbone,
    WEAPONS.bonemark,
    WEAPONS.megabone,
    WEAPONS.orb,
    WEAPONS.gaster,
    WEAPONS.ringlaser,
    WEAPONS.turret,
  ],
};

export const WEAPON_LIST = WEAPON_LISTS.sans;

export const MAX_TIER = 4;

// 2026-07-11 user tuning: awakened forms hit ~35% harder across the board
for (const w of Object.values(WEAPONS)) {
  if (w.evolve && w.evolve.tier && w.evolve.tier.dmgMult) {
    w.evolve.tier.dmgMult = Math.round(w.evolve.tier.dmgMult * 1.35 * 10) / 10;
  }
}

// A weapon the player owns. bonus* fields grow on player level-up:
// ranged weapons gain range, the orbit weapon gains bones and spin.
export function createWeaponInstance(id) {
  return {
    id,
    tier: 0,
    cooldown: 0,
    orbitAngle: Math.random() * Math.PI * 2,
    laserState: null,
    sweep: null, // Horror sweep swing state
    lassoState: null, // Horror axe-lasso state
    cleaves: [], // Horror phantom-cleave swings in flight
    dashState: null, // hard: dash chain in progress
    mega: null, // hard: falling giant bone
    gb: null, // hard: gaster blaster volley
    ring: null, // hard: ring-laser barrage
    ringFx: [], // hard: recently fired ring lasers (for drawing)
    burst: null, // orbitburst revolution state
    plaser: null, // purple laser state
    shieldT: 0, // remaining shield uptime
    chainTargets: [], // enemies currently being dragged in
    enhance: 0, // stacks of the weapon's exclusive enhancement card
    evolved: false, // awakened form (max tier + 3 enhance stacks required)
    enhanceTick: 0,
    bonusRange: 0,
    bonusProjectiles: 0,
    bonusBones: 0,
    bonusSpin: 0,
    bonusBlast: 0,
    bonusWidth: 0,
    bonusShield: 0,
  };
}

export function instTier(inst) {
  const w = WEAPONS[inst.id];
  // awakened form inherits every Lv5 stat it doesn't explicitly override
  if (inst.evolved && w.evolve) return { ...w.tiers[w.tiers.length - 1], ...w.evolve.tier };
  return w.tiers[inst.tier];
}

// evolution unlock check shared by the card pool
export function canEvolve(inst) {
  return !!WEAPONS[inst.id].evolve && !inst.evolved && inst.tier >= MAX_TIER && inst.enhance >= 3;
}

export function applyLevelUpBonus(inst) {
  if (inst.id === "orbit") {
    inst.bonusBones = Math.min(inst.bonusBones + 1, 8);
    inst.bonusSpin = Math.min(inst.bonusSpin + 0.15, 2.4);
    return;
  }
  if (inst.id === "laser" || inst.id === "plaser") {
    // lasers grow longer; other stats come from tier upgrades
    inst.bonusRange = Math.min(inst.bonusRange + 12, 180);
    return;
  }
  if (inst.id === "shield") {
    inst.bonusShield = Math.min(inst.bonusShield + 0.1, 1);
    return;
  }
  if (inst.id === "orbitburst") {
    inst.bonusRange = Math.min(inst.bonusRange + 10, 180);
    inst.bonusBlast = Math.min(inst.bonusBlast + 6, 90);
    return;
  }
  // ranged: range plus ammo (+1 projectile every 2 level-ups)
  inst.bonusRange = Math.min(inst.bonusRange + 10, 180);
  inst.bonusProjectiles = Math.min(inst.bonusProjectiles + 0.5, 5);
  if (inst.id === "bomb") inst.bonusBlast = Math.min(inst.bonusBlast + 6, 90);
  if (inst.id === "beam") inst.bonusWidth = Math.min(inst.bonusWidth + 1.5, 12);
}

export function weaponSummary(player, sep = " · ") {
  return player.weapons
    .map((i) => (i.evolved ? `★${WEAPONS[i.id].evolve.name}` : `${WEAPONS[i.id].name} Lv${i.tier + 1}`))
    .join(sep);
}

// all weapon damage funnels through this so 增伤 cards affect everything
export function weaponDmg(player, mult) {
  return Math.max(1, Math.round(player.atk * mult * (player.dmgAmp || 1)));
}

export function findNearestEnemy(x, y, range, enemies) {
  let best = null;
  let bestDist = range;
  for (const e of enemies) {
    const d = Math.hypot(e.x - x, e.y - y);
    if (d <= bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}

export function getOrbitBones(player, inst) {
  const tier = instTier(inst);
  const count = tier.count + inst.bonusBones;
  const radius = inst.enhance > 0 ? tier.radius : tier.radius + (player.range - 130) * 0.35;
  const bones = [];
  for (let i = 0; i < count; i++) {
    const a = inst.orbitAngle + (i / count) * Math.PI * 2;
    bones.push({
      x: player.x + Math.cos(a) * radius,
      y: player.y + Math.sin(a) * radius,
      size: tier.size,
      angle: a,
    });
  }
  return bones;
}

function distPointSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function getLaserBeams(player, inst) {
  if (inst.id !== "laser" || !inst.laserState) return [];
  const tier = instTier(inst);
  const len = player.range + inst.bonusRange + 80;
  const s = inst.laserState;
  const rot = s.baseAngle + (s.t / tier.duration) * Math.PI * 2;
  const beams = [];
  for (let i = 0; i < tier.beams; i++) {
    const a = rot + (i / tier.beams) * Math.PI * 2;
    beams.push({
      x1: player.x,
      y1: player.y,
      x2: player.x + Math.cos(a) * len,
      y2: player.y + Math.sin(a) * len,
      width: tier.width,
    });
  }
  return beams;
}

// orbitburst: bones spiral outward while completing one revolution
export function getBurstBones(player, inst) {
  if (inst.id !== "orbitburst" || !inst.burst) return [];
  const tier = instTier(inst);
  const prog = Math.min(inst.burst.t / BURST_REVOLUTION, 1);
  // spiral out from point-blank (16) so enemies hugging the player get clipped
  const radius = 16 + prog * 48;
  const bones = [];
  for (let i = 0; i < tier.count; i++) {
    const a = inst.burst.angle0 + prog * Math.PI * 2 + (i / tier.count) * Math.PI * 2;
    bones.push({
      x: player.x + Math.cos(a) * radius,
      y: player.y + Math.sin(a) * radius,
      size: tier.size,
      angle: a,
    });
  }
  return bones;
}

const BURST_REVOLUTION = 1.1;

export function getPlaserBeams(player, inst) {
  if (inst.id !== "plaser" || !inst.plaser) return [];
  const tier = instTier(inst);
  const len = 1300; // always reaches past the screen edge
  return inst.plaser.angles.map((a) => ({
    x1: player.x,
    y1: player.y,
    x2: player.x + Math.cos(a) * len,
    y2: player.y + Math.sin(a) * len,
    width: tier.width,
  }));
}

export function getSweepBone(player, inst) {
  if (inst.id !== "sweep" || !inst.sweep) return null;
  const tier = instTier(inst);
  const s = inst.sweep;
  const radius = tier.radius + inst.bonusRange * 0.5;
  const a = s.currentAngle ?? s.angle;
  const swingDur = 0.35;
  const total = s.swings * swingDur;
  // fade in at the start of the combo, fade out at its end
  const alpha = Math.min(s.t / 0.1, 1) * Math.max(0, Math.min((total - s.t) / 0.12, 1));
  const idx = Math.min(Math.floor(s.t / swingDur), s.swings - 1);
  return {
    x: player.x + Math.cos(a) * radius * 0.75,
    y: player.y + Math.sin(a) * radius * 0.75,
    size: 32,
    angle: a,
    radius,
    alpha,
    dir: idx % 2 === 0 ? 1 : -1, // current swing direction, for the trail
  };
}

export function getLassoAxe(inst) {
  if (inst.id !== "lasso" || !inst.lassoState) return null;
  const tier = instTier(inst);
  const s = inst.lassoState;
  return { x: s.x, y: s.y, size: tier.size * 2, angle: s.angle || 0 };
}

// cleave swings for drawing: quick chop then a huge phantom axe
export function getCleaveSwings(player, inst) {
  if (inst.id !== "cleave") return [];
  const out = [];
  for (const c of inst.cleaves) {
    // start above the player and chop DOWN toward the target
    const side = Math.cos(c.angle) >= 0 ? -1 : 1;
    // both axes fade out together at the very end
    const fadeOut = c.t > 0.8 ? Math.max(0, 1 - (c.t - 0.8) / 0.15) : 1;
    if (!c.phantomOnly && c.t >= 0 && c.t < 0.95) {
      // small axe: swings down, then stays planted until the phantom is done
      const prog = Math.min(c.t / 0.22, 1);
      const ang = c.angle + side * 1.5 * (1 - prog);
      const fadeIn = Math.min(c.t / 0.08, 1);
      const r = 34 + (c.dist - 34) * prog; // lands exactly on the target
      out.push({
        x: player.x + Math.cos(ang) * r,
        y: player.y + Math.sin(ang) * r,
        rot: ang + Math.PI / 2, // rotates with the swing
        flip: side === -1, // right-side chop: mirror so the blade leads
        size: 26,
        alpha: fadeIn * fadeOut,
      });
    }
    if (c.t >= 0.3 && c.t < 0.95) {
      // phantom: fades in, chops, stays, then fades with the small axe
      const prog = Math.min((c.t - 0.3) / 0.4, 1);
      const ang = c.angle + side * 1.7 * (1 - prog);
      const fadeIn = Math.min((c.t - 0.3) / 0.12, 1);
      const r = 20 + (c.dist - 20) * prog; // lands exactly on the target
      out.push({
        x: player.x + Math.cos(ang) * r,
        y: player.y + Math.sin(ang) * r,
        rot: ang + Math.PI / 2, // rotates with the swing
        flip: side === -1, // right-side chop: mirror so the blade leads
        size: Math.min(48 + c.dist * 0.35, 150) * (c.phantomOnly ? 0.7 : 1),
        alpha: 0.55 * fadeIn * fadeOut,
      });
    }
  }
  return out;
}

export function getDashInfo(inst) {
  if (inst.id !== "dash" || !inst.dashState) return null;
  return inst.dashState;
}

export function getMegaBone(player, inst) {
  if (inst.id !== "megabone" || !inst.mega) return null;
  const t = inst.mega.t;
  if (t < 0.35) {
    // materializes right above the head (fade in)
    return { x: player.x, y: player.y - 90, size: 64, alpha: Math.min(t / 0.15, 1) };
  }
  if (t < 0.5) {
    // slams down
    const prog = (t - 0.35) / 0.15;
    return { x: player.x, y: player.y - 90 + prog * 90, size: 64, alpha: 1 };
  }
  // grounded: rattles side to side, then fades out
  const k = t - 0.5;
  const shake = Math.sin(k * 48) * 6 * Math.max(0, 1 - k / 0.25);
  return { x: player.x + shake, y: player.y, size: 64, alpha: Math.max(0, 1 - k / 0.3) };
}

export function getGBState(player, inst) {
  if (inst.id !== "gaster" || !inst.gb) return null;
  const tier = instTier(inst);
  const g = inst.gb;
  const firing = g.t >= 0.45 && g.t < 0.9;
  // spin-in from far away, kick back on firing, recoil + fade on the way out
  let extraRot = 0;
  let alpha = 1;
  let kick = 0;
  if (g.t < 0.3) {
    const k = g.t / 0.3;
    const ease = 1 - Math.pow(1 - k, 3); // decelerating approach
    extraRot = (1 - ease) * Math.PI * 4;
    alpha = Math.min(k * 2, 1);
    kick = (1 - ease) * 260; // starts 260px behind its slot and swoops in
  } else if (firing) {
    // muzzle recoil: sharp jolt backwards, easing back into place
    const k = g.t - 0.45;
    kick = 24 * Math.exp(-k * 7);
  } else if (g.t >= 0.9) {
    const k = Math.min((g.t - 0.9) / 0.35, 1);
    kick = k * 46; // shoved backwards by the blast
    alpha = 1 - k;
  }
  // enhancement: bigger blaster (+50%, +20%/extra layer)
  const sizeMult = inst.enhance > 0 ? 1.5 + 0.2 * (inst.enhance - 1) : 1;
  const px2 = Math.cos(g.angle + Math.PI / 2);
  const py2 = Math.sin(g.angle + Math.PI / 2);
  const spacing = 56 * sizeMult;
  const blasters = [];
  for (let i = 0; i < tier.count; i++) {
    const off = (i - (tier.count - 1) / 2) * spacing;
    const bx = g.ox + px2 * off - Math.cos(g.angle) * kick;
    const by = g.oy + py2 * off - Math.sin(g.angle) * kick;
    blasters.push({
      x: bx,
      y: by,
      angle: g.angle,
      extraRot,
      alpha,
      firing,
      sizeMult,
      beam: firing
        ? { x1: bx, y1: by, x2: bx + Math.cos(g.angle) * 760, y2: by + Math.sin(g.angle) * 760, width: 30 * sizeMult }
        : null,
    });
  }
  return { blasters, t: g.t };
}

export function getRingFx(inst) {
  return inst.ringFx || [];
}

export function getTurretBones(player, inst) {
  if (inst.id !== "turret") return [];
  const tier = instTier(inst);
  const count = tier.bones + Math.floor(inst.bonusProjectiles);
  // the ring breathes in and out (30..84) so it also rakes point-blank enemies
  const r = 57 + Math.sin(inst.orbitAngle * 2.6) * 27; // faster breathing
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = inst.orbitAngle + (i / count) * Math.PI * 2;
    out.push({ x: player.x + Math.cos(a) * r, y: player.y + Math.sin(a) * r, angle: a });
  }
  return out;
}

export function getShieldInfo(player) {
  const inst = player.weapons.find((i) => i.id === "shield");
  if (!inst) return null;
  return { active: inst.shieldT > 0, remaining: inst.shieldT };
}

function fireSpread(player, inst, tier, baseAngle, effRange, extra) {
  const shots = [];
  const count = tier.projectiles + Math.floor(inst.bonusProjectiles);
  const spreadRad = ((tier.spread || 0) * Math.PI) / 180 + Math.floor(inst.bonusProjectiles) * 0.06;
  const dmg = weaponDmg(player, tier.dmgMult);
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    const angle = baseAngle + t * spreadRad;
    shots.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * player.projectileSpeed,
      vy: Math.sin(angle) * player.projectileSpeed,
      dmg,
      pierce: tier.pierce ?? 1,
      size: tier.size,
      maxRange: effRange * 1.3,
      traveled: 0,
      ...extra,
    });
  }
  return shots;
}

function updateInstance(player, inst, dt, world) {
  const weapon = WEAPONS[inst.id];
  const tier = instTier(inst);
  const { enemies } = world;
  const effRange = player.range + inst.bonusRange;

  if (weapon.id === "orbit") {
    const spin = tier.spin + inst.bonusSpin + (player.fireRate - 1.3) * 0.8;
    inst.orbitAngle += spin * dt;
    const dmg = weaponDmg(player, tier.dmgMult);
    // enhanced: ring size is frozen, knockback is 1.5x (+0.1/extra stack)
    const ringRadius = inst.enhance > 0 ? tier.radius : tier.radius + (player.range - 130) * 0.35;
    const pushFactor = inst.enhance > 0 ? Math.min(0.5 * (1.5 + 0.1 * (inst.enhance - 1)), 1) : 0.5;
    for (const bone of getOrbitBones(player, inst)) {
      for (const e of enemies) {
        if (e.orbitTimer > 0) continue;
        if (circleHit(bone.x, bone.y, bone.size / 2 + 3, e.x, e.y, e.radius)) {
          if (!e.takeDamage(dmg)) continue;
          e.orbitTimer = 0.45;
          // knock the enemy back toward the ring edge
          const d = Math.hypot(e.x - player.x, e.y - player.y) || 1;
          const target = ringRadius + e.radius + 18;
          if (d < target) {
            const push = d + (target - d) * pushFactor;
            e.x = player.x + ((e.x - player.x) / d) * push;
            e.y = player.y + ((e.y - player.y) / d) * push;
          }
        }
      }
    }
    return;
  }

  if (weapon.id === "laser") {
    if (inst.laserState) {
      const s = inst.laserState;
      s.t += dt;
      // contact damage ticks every 0.02s per enemy; one sweep past a small
      // enemy lands ~3 ticks, which must be lethal early game
      const tickDmg = Math.max(2, weaponDmg(player, tier.dmgMult / 10));
      for (const beam of getLaserBeams(player, inst)) {
        for (const e of enemies) {
          if (e.laserTick > 0) continue;
          if (distPointSegment(e.x, e.y, beam.x1, beam.y1, beam.x2, beam.y2) < beam.width / 2 + e.radius) {
            if (e.takeDamage(tickDmg)) e.laserTick = 0.02;
          }
        }
      }
      if (s.t >= tier.duration) {
        inst.laserState = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, effRange + 120, enemies)) return;
    inst.laserState = { t: 0, baseAngle: Math.random() * Math.PI * 2 };
    return;
  }

  if (weapon.id === "dash") {
    const DASH_DIST = 160; // every dash covers the same fixed distance
    if (inst.dashState) {
      const d = inst.dashState;
      d.t += dt;
      // 50% damage reduction while dashing (enhance adds more, capped 90%)
      const dashGuard = Math.min(0.5 + (inst.enhance > 0 ? 0.1 + 0.05 * (inst.enhance - 1) : 0), 0.9);
      player.guardBonus = Math.max(player.guardBonus, dashGuard);
      const dur = 0.3; // slow enough to read as a dash, not a teleport
      const prog = Math.min(d.t / dur, 1);
      const px0 = player.x;
      const py0 = player.y;
      player.x = d.fx + (d.tx - d.fx) * prog;
      player.y = d.fy + (d.ty - d.fy) * prog;
      // face where we're going, and leave afterimages behind
      d.dirX = player.x - px0;
      d.dirY = player.y - py0;
      if (d.dirX !== 0 || d.dirY !== 0) {
        player.dir =
          Math.abs(d.dirX) >= Math.abs(d.dirY)
            ? d.dirX > 0
              ? "right"
              : "left"
            : d.dirY > 0
              ? "down"
              : "up";
        player.moving = true; // keep the walk cycle running mid-dash
        player.walkTime += dt;
      }
      d.trail.push({ x: player.x, y: player.y, t: 0 });
      for (const tr of d.trail) tr.t += dt;
      d.trail = d.trail.filter((tr) => tr.t < 0.22);
      if (!d.returning) {
        const dmg = weaponDmg(player, tier.dmgMult);
        const firstDash = d.dashesLeft === tier.dashes;
        for (const e of enemies) {
          if (d.hitSet.has(e.id)) continue;
          if (circleHit(player.x, player.y, 26, e.x, e.y, e.radius)) {
            if (e.takeDamage(dmg)) {
              d.hitSet.add(e.id);
              // the opening dash shoves enemies out of the way
              if (firstDash) {
                const dx = e.x - player.x;
                const dy = e.y - player.y;
                const dd = Math.hypot(dx, dy) || 1;
                e.x += (dx / dd) * 42;
                e.y += (dy / dd) * 42;
              }
            }
          }
        }
      }
      if (prog >= 1) {
        if (d.returning) {
          // arrived home: detonate
          world.spawnBlast({
            x: d.ox,
            y: d.oy,
            dmg: weaponDmg(player, tier.dmgMult * 0.8),
            blast: 44,
            color: "#5db9ff",
          });
          inst.dashState = null;
          inst.cooldown = 1 / (player.fireRate * tier.rateMult);
          return;
        }
        d.dashesLeft -= 1;
        const next = d.dashesLeft > 0 ? findNearestEnemy(player.x, player.y, effRange + 120, enemies) : null;
        if (next) {
          const ang = Math.atan2(next.y - player.y, next.x - player.x);
          d.fx = player.x;
          d.fy = player.y;
          d.tx = player.x + Math.cos(ang) * DASH_DIST;
          d.ty = player.y + Math.sin(ang) * DASH_DIST;
          d.t = 0;
          d.hitSet.clear();
        } else {
          // sprint back home instead of teleporting
          d.returning = true;
          d.fx = player.x;
          d.fy = player.y;
          d.tx = d.ox;
          d.ty = d.oy;
          d.t = 0;
        }
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, effRange + 80, enemies);
    if (!t) return;
    const ang0 = Math.atan2(t.y - player.y, t.x - player.x);
    inst.dashState = {
      t: 0,
      ox: player.x,
      oy: player.y,
      fx: player.x,
      fy: player.y,
      tx: player.x + Math.cos(ang0) * DASH_DIST,
      ty: player.y + Math.sin(ang0) * DASH_DIST,
      dashesLeft: tier.dashes,
      hitSet: new Set(),
      trail: [],
      returning: false,
      dirX: t.x - player.x,
      dirY: t.y - player.y,
    };
    return;
  }

  if (weapon.id === "megabone") {
    if (inst.mega) {
      inst.mega.t += dt;
      if (inst.mega.t >= 0.8) {
        inst.mega = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
        return;
      }
      if (inst.mega.t >= 0.5 && !inst.mega.boomed) {
        inst.mega.boomed = true;
        const dmg = weaponDmg(player, tier.dmgMult);
        world.spawnBlast({ x: player.x, y: player.y, dmg, blast: tier.blast, color: "#5db9ff" });
        const shards = tier.shards + Math.floor(inst.bonusProjectiles) * 4;
        const shardDmg = weaponDmg(player, tier.dmgMult * 0.45);
        // each tier level adds one more concentric ring of shards
        for (let k = 0; k < tier.rings; k++) {
          const speed = Math.max(150, 320 - k * 40);
          const off = k * (Math.PI / shards); // interleave successive rings
          for (let i = 0; i < shards; i++) {
            const a = (i / shards) * Math.PI * 2 + off;
            world.spawnProjectile({
              x: player.x,
              y: player.y,
              vx: Math.cos(a) * speed,
              vy: Math.sin(a) * speed,
              dmg: shardDmg,
              pierce: inst.enhance > 0 ? 3 + 2 * (inst.enhance - 1) : 1,
              size: 9,
              maxRange: inst.enhance > 0 ? Infinity : 420, // no self-expire when enhanced
              traveled: 0,
            });
          }
        }
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, effRange + 100, enemies)) return;
    inst.mega = { t: 0 };
    return;
  }

  if (weapon.id === "gaster") {
    if (inst.gb) {
      const g = inst.gb;
      g.t += dt;
      // while charging, hover over the player and keep tracking the CURRENT
      // nearest enemy; the aim only locks when the beam fires
      if (g.t < 0.45) {
        // charging: hover over the player; pick the direction that catches the
        // most enemies, tie-breaking toward the one nearest to the player.
        // Once the beam fires the angle is locked for good.
        g.ox = player.x;
        g.oy = player.y - 74;
        const nearest = findNearestEnemy(player.x, player.y, effRange + 260, enemies);
        if (nearest) {
          let bestAngle = Math.atan2(nearest.y - g.oy, nearest.x - g.ox);
          let bestScore = -1;
          for (const cand of enemies) {
            const d0 = Math.hypot(cand.x - player.x, cand.y - player.y);
            if (d0 > effRange + 260) continue;
            const a = Math.atan2(cand.y - g.oy, cand.x - g.ox);
            const x2 = g.ox + Math.cos(a) * 760;
            const y2 = g.oy + Math.sin(a) * 760;
            let score = 0;
            for (const e of enemies) {
              if (distPointSegment(e.x, e.y, g.ox, g.oy, x2, y2) < 15 + e.radius) score += 1;
            }
            // tie-break: prefer aiming at the nearest enemy
            if (score > bestScore || (score === bestScore && cand === nearest)) {
              bestScore = score;
              bestAngle = a;
            }
          }
          g.angle = bestAngle;
        }
      }
      if (g.t >= 0.45 && g.t < 0.9) {
        const dmg = weaponDmg(player, tier.dmgMult);
        const state = getGBState(player, inst);
        for (const b of state.blasters) {
          if (!b.beam) continue;
          for (const e of enemies) {
            if (g.hitSet.has(e.id)) continue;
            if (distPointSegment(e.x, e.y, b.beam.x1, b.beam.y1, b.beam.x2, b.beam.y2) < b.beam.width / 2 + e.radius) {
              if (e.takeDamage(dmg)) g.hitSet.add(e.id);
            }
          }
        }
      }
      if (g.t >= 1.25) {
        inst.gb = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, effRange + 260, enemies);
    if (!t) return;
    inst.gb = {
      t: 0,
      ox: player.x,
      oy: player.y - 74,
      angle: Math.atan2(t.y - (player.y - 74), t.x - player.x),
      hitSet: new Set(),
    };
    return;
  }

  if (weapon.id === "ringlaser") {
    // fade out the recently flashed lasers
    for (const fx of inst.ringFx) fx.t += dt;
    inst.ringFx = inst.ringFx.filter((fx) => fx.t < 0.14);
    if (inst.ring) {
      const r = inst.ring;
      r.t += dt;
      const total = tier.lasers + Math.floor(inst.bonusProjectiles) * 4;
      const dur = 0.9;
      const expected = Math.min(total, Math.floor((r.t / dur) * total));
      const dmg = weaponDmg(player, tier.dmgMult);
      // lasers flash one after another, marching around the circle
      while (r.fired < expected) {
        const a = r.angle0 + (r.fired / total) * Math.PI * 2;
        const x1 = player.x + Math.cos(a) * 18;
        const y1 = player.y + Math.sin(a) * 18;
        // long enough to always reach past the screen edge
        const x2 = player.x + Math.cos(a) * 1300;
        const y2 = player.y + Math.sin(a) * 1300;
        const blastR = inst.enhance > 0 ? 26 + 8 * (inst.enhance - 1) : 0;
        for (const e of enemies) {
          if (distPointSegment(e.x, e.y, x1, y1, x2, y2) < 11 + e.radius) {
            if (e.takeDamage(dmg)) {
              e.applyRoot(1);
              if (blastR > 0) {
                world.spawnBlast({
                  x: e.x,
                  y: e.y,
                  dmg: Math.max(1, Math.round(dmg * 0.5)),
                  blast: blastR,
                  color: "#8fd6ff",
                });
              }
            }
          }
        }
        inst.ringFx.push({ x1, y1, x2, y2, t: 0 });
        r.fired += 1;
      }
      if (r.t >= dur) {
        inst.ring = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, 600, enemies)) return;
    inst.ring = { t: 0, fired: 0, angle0: Math.random() * Math.PI * 2 };
    return;
  }

  if (weapon.id === "turret") {
    inst.orbitAngle += 0.8 * dt; // stakes slowly wheel around the player
    // the planted bones themselves batter anything they touch
    const contactDmg = weaponDmg(player, tier.dmgMult);
    for (const b of getTurretBones(player, inst)) {
      for (const e of enemies) {
        if (e.orbitTimer > 0) continue;
        if (circleHit(b.x, b.y, 18, e.x, e.y, e.radius)) {
          if (e.takeDamage(contactDmg)) {
            e.orbitTimer = 0.45;
            if (inst.enhance > 0) {
              const force = 14 + 6 * (inst.enhance - 1);
              const dx = e.x - b.x;
              const dy = e.y - b.y;
              const d = Math.hypot(dx, dy) || 1;
              e.x += (dx / d) * force;
              e.y += (dy / d) * force;
            }
          }
        }
      }
    }
    return; // pure melee stakes: no projectiles
  }

  if (weapon.id === "sweep") {
    if (inst.sweep) {
      const s = inst.sweep;
      s.t += dt;
      s.pushTimer -= dt;
      const swingDur = 0.35;
      const idx = Math.min(Math.floor(s.t / swingDur), s.swings - 1);
      if (idx !== s.idx) {
        s.idx = idx;
        s.hitSet.clear(); // each swing can damage everyone once more
      }
      const prog = Math.min((s.t - idx * swingDur) / swingDur, 1);
      const dir = idx % 2 === 0 ? 1 : -1; // alternate swing direction
      const arc = 2.4;
      const a = s.angle - (dir * arc) / 2 + dir * arc * prog;
      s.currentAngle = a;
      const radius = tier.radius + inst.bonusRange * 0.5;
      const dmg = weaponDmg(player, tier.dmgMult);
      const doPush = s.pushTimer <= 0;
      if (doPush) s.pushTimer = 0.1; // gentle shove every 0.1s, not one big knock
      for (const e of enemies) {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d > radius + e.radius) continue;
        let diff = Math.atan2(e.y - player.y, e.x - player.x) - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) > 0.6) continue;
        if (!s.hitSet.has(e.id) && e.takeDamage(dmg)) s.hitSet.add(e.id);
        if (doPush && d > 1) {
          const push = 9 * (inst.enhance > 0 ? 1.5 + 0.1 * (inst.enhance - 1) : 1);
          e.x += ((e.x - player.x) / d) * push;
          e.y += ((e.y - player.y) / d) * push;
        }
      }
      if (s.t >= s.swings * swingDur) {
        inst.sweep = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, tier.radius + inst.bonusRange * 0.5 + 60, enemies);
    if (!t) return;
    inst.sweep = {
      t: 0,
      idx: 0,
      angle: Math.atan2(t.y - player.y, t.x - player.x),
      swings: tier.swings,
      hitSet: new Set(),
      pushTimer: 0,
    };
    return;
  }

  if (weapon.id === "lasso") {
    if (inst.lassoState) {
      const s = inst.lassoState;
      s.t += dt;
      s.stuck = s.stuck.filter((e) => e.hp > 0);
      const spinDur = 1.0; // two quick revolutions
      if (s.t < spinDur) {
        s.angle = s.angle0 + (s.t / spinDur) * Math.PI * 4;
        // both revolutions identical: fixed radius, constant speed
        const r = 38;
        s.x = player.x + Math.cos(s.angle) * r;
        s.y = player.y + Math.sin(s.angle) * r;
        const dmg = weaponDmg(player, tier.dmgMult * 0.4);
        for (const e of enemies) {
          if (s.stuck.includes(e)) continue;
          if (circleHit(s.x, s.y, tier.size + 12, e.x, e.y, e.radius)) {
            if (e.takeDamage(dmg)) {
              s.stuck.push(e); // stuck to the axe
              if (inst.enhance > 0) {
                player.hp = Math.min(player.maxHp, player.hp + inst.enhance);
              }
            }
          }
        }
      } else if (s.t < spinDur + 0.45) {
        if (!s.thrown) {
          s.thrown = true;
          s.dir = s.angle + Math.PI / 2; // fly off along the tangent
        }
        s.x += Math.cos(s.dir) * 480 * dt;
        s.y += Math.sin(s.dir) * 480 * dt;
        // never fling the bundle into the column wall or below the arena
        if (world.bounds) {
          s.y = Math.max(world.bounds.top, Math.min(world.bounds.bottom, s.y));
        }
      } else {
        const dmg = weaponDmg(player, tier.dmgMult);
        for (const e of s.stuck) e.takeDamage(dmg);
        // one blast per hooked enemy, scattered around the landing spot
        for (const e of s.stuck) {
          world.spawnBlast({
            x: e.x + (Math.random() - 0.5) * 36,
            y: e.y + (Math.random() - 0.5) * 36,
            dmg: weaponDmg(player, tier.dmgMult * 0.8),
            blast: 42,
            color: "#ff5d5d",
          });
        }
        inst.lassoState = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
        return;
      }
      // pin stuck enemies to the axe through spin and throw
      for (const e of s.stuck) {
        e.x = s.x;
        e.y = s.y;
        e.rootTimer = Math.max(e.rootTimer, 0.15);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, effRange + 60, enemies)) return;
    inst.lassoState = {
      t: 0,
      angle0: Math.random() * Math.PI * 2,
      angle: 0,
      x: player.x,
      y: player.y,
      stuck: [],
      thrown: false,
    };
    return;
  }

  if (weapon.id === "cleave") {
    // advance active swings; blasts land where each swing ends
    for (const c of inst.cleaves) {
      c.t += dt;
      if (!c.hit1 && c.t >= 0.22) {
        c.hit1 = true;
        world.spawnBlast({
          x: c.tx,
          y: c.ty,
          dmg: weaponDmg(player, tier.dmgMult * 0.8),
          blast: 36,
          color: "#ff5d5d",
        });
      }
      if (!c.hit2 && c.t >= 0.7) {
        c.hit2 = true;
        world.spawnBlast({
          x: c.tx,
          y: c.ty,
          dmg: weaponDmg(player, tier.dmgMult * (c.phantomOnly ? 1.6 : 2.6)),
          blast: c.phantomOnly ? 48 : 64,
          color: "#ff8a8a",
        });
      }
    }
    inst.cleaves = inst.cleaves.filter((c) => c.t < 1.0);
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const combos = tier.combos + Math.floor(Math.floor(inst.bonusProjectiles) / 2);
    const targets = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.3)
      .sort((a, b) => a.d - b.d)
      .slice(0, combos)
      .map((o) => o.e);
    if (!targets.length) return;
    targets.forEach((t, ti) => {
      inst.cleaves.push({
        tx: t.x,
        ty: t.y,
        t: -ti * 0.15,
        hit1: false,
        hit2: false,
        angle: Math.atan2(t.y - player.y, t.x - player.x),
        dist: Math.hypot(t.x - player.x, t.y - player.y),
      });
      // enhancement: extra phantoms split off around the target
      const extras = inst.enhance > 0 ? 2 + (inst.enhance - 1) : 0;
      for (let k = 0; k < extras; k++) {
        const oa = Math.random() * Math.PI * 2;
        const or_ = 34 + Math.random() * 34;
        const ex = t.x + Math.cos(oa) * or_;
        const ey = t.y + Math.sin(oa) * or_;
        inst.cleaves.push({
          tx: ex,
          ty: ey,
          t: -ti * 0.15 - 0.12 - k * 0.06,
          hit1: true, // phantom only: no light chop
          hit2: false,
          phantomOnly: true,
          angle: Math.atan2(ey - player.y, ex - player.x),
          dist: Math.hypot(ex - player.x, ey - player.y),
        });
      }
    });
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "shield") {
    if (inst.shieldT > 0) {
      inst.shieldT -= dt;
      player.shieldTimer = Math.max(inst.shieldT, player.shieldTimer);
      return;
    }
    inst.cooldown -= dt;
    if (inst.cooldown <= 0) {
      inst.shieldT = tier.duration + inst.bonusShield;
      // base 4.5s, reduced by fire-rate bonuses, never below 1s
      inst.cooldown = Math.max((4.5 * 1.3) / player.fireRate, 1);
      player.shieldTimer = Math.max(inst.shieldT, player.shieldTimer);
    }
    return;
  }

  if (weapon.id === "orbitburst") {
    if (inst.burst) {
      inst.burst.t += dt;
      const dmg = weaponDmg(player, tier.dmgMult);
      for (const bone of getBurstBones(player, inst)) {
        for (const e of enemies) {
          if (e.orbitTimer > 0) continue;
          if (circleHit(bone.x, bone.y, bone.size / 2 + 3, e.x, e.y, e.radius)) {
            if (e.takeDamage(dmg)) e.orbitTimer = 0.45;
          }
        }
      }
      // enhancement: periodic mini-blasts along the orbit
      if (inst.enhance > 0) {
        inst.enhanceTick -= dt;
        if (inst.enhanceTick <= 0) {
          inst.enhanceTick = 0.5 * Math.pow(0.8, inst.enhance - 1);
          for (const bone of getBurstBones(player, inst)) {
            world.spawnBlast({
              x: bone.x,
              y: bone.y,
              dmg: Math.round(dmg * 0.4),
              blast: 30,
              color: "#9a5df0",
            });
          }
        }
      }
      if (inst.burst.t >= BURST_REVOLUTION) {
        // launch each bone flat at a nearby enemy (round-robin over the
        // closest ones); flies outward only when nothing is in range
        const targets = enemies
          .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
          .filter((o) => o.d <= effRange * 1.8)
          .sort((a, b) => a.d - b.d)
          .map((o) => o.e);
        const bones = getBurstBones(player, inst);
        bones.forEach((bone, i) => {
          let angle = bone.angle;
          let range = 260;
          if (targets.length) {
            const t = targets[i % targets.length];
            angle = Math.atan2(t.y - bone.y, t.x - bone.x);
            range = Math.min(Math.hypot(t.x - bone.x, t.y - bone.y) + 50, 420);
          }
          world.spawnProjectile({
            x: bone.x,
            y: bone.y,
            vx: Math.cos(angle) * 360,
            vy: Math.sin(angle) * 360,
            dmg,
            pierce: 1,
            size: tier.size,
            maxRange: range,
            traveled: 0,
            purple: true,
            explode: { blast: tier.blast + inst.bonusBlast, dmg, color: "#9a5df0" },
          });
        });
        inst.burst = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    // spins up even with nothing around; bones just fly outward then
    inst.burst = { t: 0, angle0: Math.random() * Math.PI * 2 };
    return;
  }

  if (weapon.id === "plaser") {
    if (inst.plaser) {
      inst.plaser.t += dt;
      // one-time contact damage per activation, plus slow
      const dmg = weaponDmg(player, tier.dmgMult);
      const slowDur = 0.5 * (inst.enhance > 0 ? 2 + 0.2 * (inst.enhance - 1) : 1);
      for (const beam of getPlaserBeams(player, inst)) {
        for (const e of enemies) {
          if (inst.plaser.hitSet.has(e.id)) continue;
          if (distPointSegment(e.x, e.y, beam.x1, beam.y1, beam.x2, beam.y2) < beam.width / 2 + e.radius) {
            inst.plaser.hitSet.add(e.id);
            if (e.takeDamage(dmg)) e.slowTimer = Math.max(e.slowTimer, slowDur);
          }
        }
      }
      if (inst.plaser.t >= tier.duration) {
        inst.plaser = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    // lock one beam per target: up to `beams` distinct nearest enemies
    const locked = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange + 200)
      .sort((a, b) => a.d - b.d)
      .slice(0, tier.beams)
      .map((o) => Math.atan2(o.e.y - player.y, o.e.x - player.x));
    if (!locked.length) return;
    inst.plaser = { t: 0, angles: locked, hitSet: new Set() };
    return;
  }

  if (weapon.id === "chain") {
    // drag active targets toward the player
    inst.chainTargets = inst.chainTargets.filter((c) => c.e.hp > 0);
    const tickDps = player.atk * 1.2 * (player.dmgAmp || 1);
    for (const c of inst.chainTargets) {
      const e = c.e;
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const arrive = player.radius + e.radius + 16;
      const step = 340 * dt;
      if (d - step <= arrive) {
        e.x = player.x - (dx / d) * arrive;
        e.y = player.y - (dy / d) * arrive;
        e.takeDamage(weaponDmg(player, tier.dmgMult));
        e.applyRoot(tier.root);
        c.done = true;
      } else {
        e.x += (dx / d) * step;
        e.y += (dy / d) * step;
        e.takeDamage(tickDps * dt);
      }
    }
    inst.chainTargets = inst.chainTargets.filter((c) => !c.done);
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (inst.chainTargets.length) return; // wait until current pulls finish
    const count = tier.chains + Math.floor(Math.floor(inst.bonusProjectiles) / 2);
    // point-blank enemies count too: the pull resolves instantly as a melee slam
    const picks = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.6)
      .sort((a, b) => a.d - b.d)
      .slice(0, count)
      .map((o) => ({ e: o.e }));
    if (!picks.length) return;
    // the hook itself detonates on contact (enhance root applies here too)
    for (const c of picks) {
      world.spawnBlast({
        x: c.e.x,
        y: c.e.y,
        dmg: weaponDmg(player, tier.dmgMult * 0.6),
        blast: 34,
        color: "#9a5df0",
        root: inst.enhance > 0 ? 0.25 * inst.enhance : 0,
      });
    }
    inst.chainTargets = picks;
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (inst.cooldown > 0) {
    inst.cooldown -= dt;
    return;
  }
  const searchRange =
    weapon.id === "beam" || weapon.id === "cross" ? Math.max(effRange, 320) : effRange;
  const target = findNearestEnemy(player.x, player.y, searchRange, enemies);
  if (!target) return;
  const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
  const extraAmmo = Math.floor(inst.bonusProjectiles);

  if (weapon.id === "bone") {
    const extraPierce = inst.enhance > 0 ? inst.enhance + 1 : 0;
    for (const s of fireSpread(player, inst, tier, baseAngle, effRange, { pierce: tier.pierce + extraPierce })) {
      if (inst.evolved) s.red = true; // awakened bones burn red
      world.spawnProjectile(s);
    }
  } else if (weapon.id === "homing") {
    const rootOnHit = inst.enhance > 0 ? 0.5 + 0.25 * (inst.enhance - 1) : 0;
    for (const s of fireSpread(player, inst, tier, baseAngle, effRange, { turn: tier.turn, rootOnHit })) {
      // homing shots launch slower and curve back toward targets
      s.vx *= 0.75;
      s.vy *= 0.75;
      s.maxRange = effRange * 2.2;
      world.spawnProjectile(s);
    }
  } else if (weapon.id === "beam") {
    const hitBlast =
      inst.enhance > 0
        ? { radius: 24 + 8 * (inst.enhance - 1), dmg: weaponDmg(player, tier.dmgMult * 0.4) }
        : null;
    for (const s of fireSpread(player, inst, tier, baseAngle, effRange, { beam: true, hitBlast })) {
      s.pierce = Infinity;
      s.maxRange = 1300;
      s.size = tier.size + inst.bonusWidth;
      world.spawnProjectile(s);
    }
  } else if (weapon.id === "boomerang") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const count = tier.boomerangs + extraAmmo;
    const spreadRad = count > 1 ? 0.7 + count * 0.08 : 0;
    const speed0 = player.projectileSpeed * 1.1;
    const decel = (speed0 * speed0) / (2 * effRange * 1.1);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1) - 0.5;
      const angle = baseAngle + t * spreadRad;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      world.spawnProjectile({
        x: player.x,
        y: player.y,
        vx: dirX * speed0,
        vy: dirY * speed0,
        dmg,
        pierce: Infinity,
        size: tier.size,
        maxRange: Infinity,
        traveled: 0,
        boom: true,
        returning: false,
        returnMult: inst.enhance > 0 ? 2 + 0.2 * (inst.enhance - 1) : 1,
        dirX,
        dirY,
        speed0,
        decel,
      });
    }
  } else if (weapon.id === "bomb") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const candidates = enemies.filter(
      (e) => Math.hypot(e.x - player.x, e.y - player.y) <= effRange * 1.4
    );
    const bombCount = tier.bombs + Math.floor(extraAmmo / 2);
    for (let i = 0; i < bombCount; i++) {
      const pick = candidates.length
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : target;
      world.spawnBomb({
        x: player.x,
        y: player.y,
        tx: pick.x,
        ty: pick.y,
        dmg,
        blast: tier.blast + inst.bonusBlast,
        echo: inst.enhance > 0 ? inst.enhance + 1 : 0,
      });
    }
  } else if (weapon.id === "spike") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const inRange = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.2)
      .sort((a, b) => a.d - b.d)
      .slice(0, tier.targets)
      .map((o) => o.e);
    if (inRange.length) {
      const total = tier.spikes + extraAmmo;
      for (let i = 0; i < total; i++) {
        const t = inRange[i % inRange.length];
        const jitter = i < inRange.length ? 0 : 36;
        world.spawnSpike({
          x: t.x + (Math.random() - 0.5) * jitter,
          y: t.y + (Math.random() - 0.5) * jitter,
          dmg,
        });
      }
      // enhanced: a defensive ring of spikes erupts around the player
      if (inst.enhance > 0) {
        const ringCount = 6 + 2 * (inst.enhance - 1);
        for (let i = 0; i < ringCount; i++) {
          const a = (i / ringCount) * Math.PI * 2;
          world.spawnSpike({
            x: player.x + Math.cos(a) * 55,
            y: player.y + Math.sin(a) * 55,
            dmg,
          });
        }
      }
    }
  } else if (weapon.id === "bluebind") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const targets = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.3)
      .sort((a, b) => a.d - b.d)
      .slice(0, tier.targets + Math.floor(Math.floor(inst.bonusProjectiles) / 2))
      .map((o) => o.e);
    for (const t of targets) {
      world.spawnSpike({
        x: t.x,
        y: t.y,
        dmg,
        root: tier.root,
        color: "#4f9dff",
        blast:
          inst.enhance > 0
            ? { radius: 40, dmg: Math.round(dmg * 0.4), root: 0.25 * inst.enhance, color: "#4f9dff" }
            : null,
      });
    }
  } else if (weapon.id === "wave") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const bones = tier.bones + extraAmmo;
    for (let w = 0; w < tier.waves; w++) {
      // rings erupt one after another, travelling outward like a tide
      const r = 30 + w * 48;
      const halfArc = Math.PI / 5 + w * 0.07;
      for (let i = 0; i < bones; i++) {
        const frac = bones === 1 ? 0 : i / (bones - 1) - 0.5;
        const a = baseAngle + frac * 2 * halfArc;
        world.spawnSpike({
          x: player.x + Math.cos(a) * r,
          y: player.y + Math.sin(a) * r,
          dmg,
          delay: w * 0.22,
          color: "#c59bff",
          knockback: inst.enhance > 0 ? 30 * (1 + 0.1 * (inst.enhance - 1)) : 0,
        });
      }
    }
  } else if (weapon.id === "cross") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const count = tier.bones + extraAmmo;
    for (let i = 0; i < count; i++) {
      // fixed directions: starts at up/down/left/right, extra bones fill evenly
      const a = (i / count) * Math.PI * 2;
      // infinite pierce; removed when it leaves the screen (culled in main)
      world.spawnProjectile({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * player.projectileSpeed,
        vy: Math.sin(a) * player.projectileSpeed,
        dmg,
        pierce: Infinity,
        size: tier.size,
        maxRange: Infinity,
        traveled: 0,
        extendRoot: inst.enhance > 0 ? 1 + 0.5 * (inst.enhance - 1) : 0,
      });
    }
  } else if (weapon.id === "soundwave") {
    const dmgMult = inst.enhance > 0 ? 2 + 0.2 * (inst.enhance - 1) : 1;
    const dmg = weaponDmg(player, tier.dmgMult * dmgMult);
    const bones = tier.bones + Math.floor(extraAmmo / 2);
    // bones drop on the closest enemies, one per target
    const candidates = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.4)
      .sort((a, b) => a.d - b.d)
      .map((o) => o.e);
    for (let i = 0; i < bones; i++) {
      const pick = candidates.length ? candidates[i % candidates.length] : target;
      world.spawnSpike({
        x: pick.x,
        y: pick.y,
        dmg,
        delay: 0.22,
        fall: true,
        wave: tier.radius,
        knockback: 30,
        color: "#e08fff",
        boneSize: inst.enhance > 0 ? 32 : 22,
      });
    }
  } else if (weapon.id === "feast") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const targets = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.4)
      .sort((a, b) => a.d - b.d)
      .slice(0, tier.targets + Math.floor(extraAmmo / 2))
      .map((o) => o.e);
    for (const t of targets) {
      const dx = t.x - player.x;
      const dy = t.y - player.y;
      const d = Math.hypot(dx, dy) || 1;
      let ux = dx / d;
      let uy = dy / d;
      if (d < 24) {
        // enemy is on top of the player: pick a random approach direction
        const ra = Math.random() * Math.PI * 2;
        ux = Math.cos(ra);
        uy = Math.sin(ra);
      }
      for (let i = 0; i < tier.bonesPer; i++) {
        // spawn behind the enemy, fly home through it
        world.spawnProjectile({
          x: t.x + ux * 60 + (Math.random() - 0.5) * 24,
          y: t.y + uy * 60 + (Math.random() - 0.5) * 24,
          vx: -ux * 280,
          vy: -uy * 280,
          dmg,
          pierce: Infinity,
          size: tier.size,
          maxRange: Infinity,
          traveled: 0,
          red: true,
          toPlayer: true, // may heal 1 hp when it returns
          healChance:
            tier.healChance + (inst.enhance > 0 ? 0.1 + 0.05 * (inst.enhance - 1) : 0),
        });
      }
    }
  } else if (weapon.id === "slam") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const count = tier.smashes + extraAmmo;
    // fists only reach so far — cap the strike range near the player
    const SLAM_RANGE = 120;
    const picks = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= SLAM_RANGE)
      .sort((a, b) => a.d - b.d)
      .map((o) => o.e);
    for (let i = 0; i < count; i++) {
      const pick = picks[i % Math.max(picks.length, 1)];
      const a = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 80;
      world.spawnSpike({
        x: pick ? pick.x + (Math.random() - 0.5) * 18 : player.x + Math.cos(a) * r,
        y: pick ? pick.y + (Math.random() - 0.5) * 18 : player.y + Math.sin(a) * r,
        dmg,
        delay: i * 0.16,
        wave: 46,
        knockback: 0,
        root: tier.root,
        color: "#ff5d5d",
        noBone: true, // pure shockwave, no bone pop
        invulnPerHit: inst.enhance > 0 ? 0.15 + 0.1 * (inst.enhance - 1) : 0,
      });
    }
  } else if (weapon.id === "axes") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const count = Math.min(tier.count + extraAmmo, inst.evolved ? 9 : 5); // axe cap lifts when awakened
    const spreadRad = 0.5 + count * 0.07;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1) - 0.5;
      const a = baseAngle + t * spreadRad;
      const speed0 = player.projectileSpeed * 1.05;
      const shot = {
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * speed0,
        vy: Math.sin(a) * speed0,
        dmg,
        pierce: Infinity,
        size: tier.size,
        maxRange: effRange * 1.7,
        traveled: 0,
        axe: true,
        hitR: tier.size * 1.4, // hit circle matches the drawn axe, no gaps
      };
      if (inst.enhance > 0) {
        // enhancement: axes fly back like boomerangs (+1 pass per stack)
        shot.boom = true;
        shot.returning = false;
        shot.dirX = Math.cos(a);
        shot.dirY = Math.sin(a);
        shot.speed0 = speed0;
        shot.decel = (speed0 * speed0) / (2 * effRange * 1.4);
        shot.maxRange = Infinity;
        shot.bounces = inst.enhance - 1;
        // 3+ stacks: pause in front of the body on each return, then relaunch
        shot.frontHover = inst.enhance > 2;
      }
      world.spawnProjectile(shot);
    }
  } else if (weapon.id === "quake") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const waves = tier.waves + Math.floor(extraAmmo / 2);
    for (let i = 0; i < waves; i++) {
      world.spawnSpike({
        x: player.x,
        y: player.y,
        dmg: i === 0 ? dmg : Math.round(dmg * 0.7),
        delay: i * 0.25,
        wave: tier.radius + i * 30,
        knockback: 46,
        color: "#ff5d5d",
        boneSize: tier.boneSize,
        hollow: true, // shockwaves render as hollow rings
        deathBlast:
          inst.enhance > 0
            ? { dmg: Math.round(dmg * 0.4), radius: 30 + 8 * (inst.enhance - 1) }
            : null,
      });
    }
  } else if (weapon.id === "splitbone") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const count = 6 + Math.floor(inst.bonusProjectiles);
    for (let i = 0; i < count; i++) {
      const a = baseAngle + (i / count) * Math.PI * 2;
      world.spawnProjectile({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * 240,
        vy: Math.sin(a) * 240,
        dmg: 0,
        pierce: Infinity,
        noHit: true, // the mother bone is harmless; only the children hit
        size: tier.size,
        maxRange: Infinity,
        traveled: 0,
        splitInfo: {
          count: tier.split,
          dmg: Math.max(1, Math.round(dmg * 0.8)),
          grand: inst.enhance > 0 ? 4 + 2 * (inst.enhance - 1) : 0,
        },
      });
    }
  } else if (weapon.id === "bonemark") {
    const dmg = weaponDmg(player, tier.dmgMult);
    const marks = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.4)
      .sort((a, b) => a.d - b.d)
      .slice(0, tier.targets + Math.floor(extraAmmo / 2))
      .map((o) => o.e);
    for (const t of marks) {
      // blue bone pops on the target (roots 1s), then a blast, then a circle
      world.spawnSpike({ x: t.x, y: t.y, dmg, delay: 0.1, root: 1, color: "#6fc0ff" });
      world.spawnSpike({
        x: t.x,
        y: t.y,
        dmg: Math.max(1, Math.round(dmg * 0.8)),
        delay: 0.32,
        wave: tier.blast,
        knockback: 0,
        color: "#6fc0ff",
        noBone: true,
      });
      const ring = tier.ringBones;
      for (let i = 0; i < ring; i++) {
        const a = (i / ring) * Math.PI * 2;
        world.spawnSpike({
          x: t.x + Math.cos(a) * 44,
          y: t.y + Math.sin(a) * 44,
          dmg: Math.max(1, Math.round(dmg * 0.7)),
          delay: 0.46,
          color: "#6fc0ff",
          root: inst.enhance > 0 ? 1 + 0.5 * (inst.enhance - 1) : 0,
        });
      }
    }
  } else if (weapon.id === "orb") {
    const tick = Math.max(1, Math.round(weaponDmg(player, tier.dmgMult) / 20));
    // one orb per locked target: up to `orbs` distinct nearest enemies
    const locked = enemies
      .map((e) => ({ e, d: Math.hypot(e.x - player.x, e.y - player.y) }))
      .filter((o) => o.d <= effRange * 1.6)
      .sort((a, b) => a.d - b.d)
      .slice(0, tier.orbs + Math.floor(extraAmmo / 2))
      .map((o) => o.e);
    for (const t2 of locked) {
      const a = Math.atan2(t2.y - player.y, t2.x - player.x);
      world.spawnProjectile({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * 85,
        vy: Math.sin(a) * 85,
        dmg: 0, // damage comes from contact ticks, not impact
        pierce: Infinity,
        size: 24,
        maxRange: Infinity, // never expires on its own; culled off-screen
        traveled: 0,
        orb: true,
        orbTick: tick,
        stickCap: inst.enhance > 0 ? 5 + 3 * (inst.enhance - 1) : 0,
        stuck: [],
      });
    }
  } else if (weapon.id === "boneringH") {
    const dmg = weaponDmg(player, tier.dmgMult);
    // ground smash first...
    // the opening smash also scales with attack range (capped at it)
    const smashR = Math.min(84 + Math.max(0, effRange - 130), effRange);
    world.spawnBlast({ x: player.x, y: player.y, dmg, blast: smashR, color: "#ff5d5d" });
    // ...then a ring of bones erupts around the player; the ring widens with
    // attack range, capped at attack range itself
    const bones = tier.bones + extraAmmo;
    const ringR = Math.min(tier.ring + Math.max(0, effRange - 130), effRange);
    // enhancement: +2 extra rings (then +1 per stack), expanding outward
    const rings = 1 + (inst.enhance > 0 ? 2 + (inst.enhance - 1) : 0);
    for (let k = 0; k < rings; k++) {
      const rr = ringR + k * 45;
      for (let i = 0; i < bones; i++) {
        const a = (i / bones) * Math.PI * 2 + k * 0.3;
        world.spawnSpike({
          x: player.x + Math.cos(a) * rr,
          y: player.y + Math.sin(a) * rr,
          dmg,
          delay: 0.15 + k * 0.12,
          color: "#ff5d5d",
        });
      }
    }
  }

  inst.cooldown = 1 / (player.fireRate * tier.rateMult);
}

// world: { enemies, projectiles, spawnProjectile, spawnBomb, spawnSpike, spawnBlast }
export function updateWeapons(player, dt, world) {
  player.shieldTimer = 0; // re-asserted below by an active shield weapon
  // 风车激光强化: extra damage reduction while the laser is on standby
  player.guardBonus = 0;
  for (const inst of player.weapons) {
    if (inst.id === "laser" && inst.enhance > 0 && !inst.laserState) {
      player.guardBonus = Math.min(0.5 + 0.1 * (inst.enhance - 1), 0.9);
    }
  }
  // boomerang flight: decelerate outward, then fly back to the player
  const relaunch = (p) => {
    p.returning = false;
    const t = findNearestEnemy(player.x, player.y, 500, world.enemies);
    const ang = t ? Math.atan2(t.y - player.y, t.x - player.x) : Math.atan2(p.vy, p.vx);
    p.dirX = Math.cos(ang);
    p.dirY = Math.sin(ang);
    p.vx = p.dirX * p.speed0;
    p.vy = p.dirY * p.speed0;
    p.hitSet.clear();
  };
  for (const p of world.projectiles) {
    if (!p.boom) continue;
    // paused in front of the body, then thrown out again
    if (p.hoverTimer > 0) {
      p.hoverTimer -= dt;
      p.vx = 0;
      p.vy = 0;
      if (p.hoverTimer <= 0) relaunch(p);
      continue;
    }
    if (!p.returning) {
      p.vx -= p.dirX * p.decel * dt;
      p.vy -= p.dirY * p.decel * dt;
      if (p.vx * p.dirX + p.vy * p.dirY <= 0) {
        p.returning = true;
        p.hitSet.clear(); // can hit each enemy again on the way back
        if (p.returnMult > 1) p.dmg = Math.round(p.dmg * p.returnMult);
      }
    } else {
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      // front-hover axes stop ~44px short of the body instead of touching it
      const arrive = p.frontHover ? 44 : player.radius + 12;
      p.vx = (dx / d) * p.speed0;
      p.vy = (dy / d) * p.speed0;
      if (d < arrive) {
        if (p.bounces > 0) {
          p.bounces -= 1;
          if (p.frontHover) p.hoverTimer = 0.18; // pause in front, then relaunch
          else relaunch(p);
        } else {
          p.pierce = 0; // caught
        }
      }
    }
  }

  // splitting bones: fly, hover, then burst into child bones
  for (const p of world.projectiles) {
    if (!p.splitInfo || p.didSplit) continue;
    if (p.age >= 0.25 && !p.hovering) {
      p.hovering = true;
      p.vx = 0;
      p.vy = 0;
    }
    if (p.age >= 0.75) {
      p.didSplit = true;
      p.pierce = 0;
      const n = p.splitInfo.count;
      const grand = p.splitInfo.grand || 0;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
        const child = {
          x: p.x,
          y: p.y,
          vx: Math.cos(a) * 300,
          vy: Math.sin(a) * 300,
          dmg: p.splitInfo.dmg,
          pierce: 1,
          size: 8,
          maxRange: Infinity, // flies until it hits something or leaves the screen
          traveled: 0,
        };
        // enhancement: children split once more into grandchildren
        if (grand > 0) {
          child.splitInfo = { count: grand, dmg: Math.max(1, Math.round(p.splitInfo.dmg * 0.7)), grand: 0 };
        }
        world.spawnProjectile(child);
      }
    }
  }

  // blue orbs: contact ticks that damage and briefly root; enhanced orbs
  // also snare enemies onto the orb up to a cap
  for (const p of world.projectiles) {
    if (!p.orb) continue;
    if (p.stuck) p.stuck = p.stuck.filter((e) => e.hp > 0);
    for (const e of world.enemies) {
      if (e.laserTick > 0) continue;
      if (circleHit(p.x, p.y, p.size / 2 + 2, e.x, e.y, e.radius)) {
        if (e.takeDamage(p.orbTick)) {
          e.laserTick = 0.02;
          e.rootTimer = Math.max(e.rootTimer, 0.06);
          if (p.stickCap > 0 && !p.stuck.includes(e) && p.stuck.length < p.stickCap) {
            p.stuck.push(e);
          }
        }
      }
    }
    // drag snared enemies along with the orb
    if (p.stuck) {
      for (const e of p.stuck) {
        e.x = p.x;
        e.y = p.y;
        e.rootTimer = Math.max(e.rootTimer, 0.1);
      }
    }
  }

  // feast bones fly back to the player and heal 1 hp on return
  for (const p of world.projectiles) {
    if (!p.toPlayer) continue;
    const dx = player.x - p.x;
    const dy = player.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    p.vx = (dx / d) * 280;
    p.vy = (dy / d) * 280;
    // collect only at the very center so bones still hit enemies
    // standing right on top of the player
    if (d < 6) {
      p.pierce = 0;
      if (Math.random() < (p.healChance || 0)) {
        player.hp = Math.min(player.maxHp, player.hp + 1);
      }
    }
  }

  // steer any live homing projectiles
  for (const p of world.projectiles) {
    if (!p.turn) continue;
    const target = findNearestEnemy(p.x, p.y, 400, world.enemies);
    if (!target) continue;
    const speed = Math.hypot(p.vx, p.vy);
    const current = Math.atan2(p.vy, p.vx);
    const desired = Math.atan2(target.y - p.y, target.x - p.x);
    let diff = desired - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const maxTurn = p.turn * dt;
    const angle = current + Math.max(-maxTurn, Math.min(maxTurn, diff));
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
  }

  for (const inst of player.weapons) updateInstance(player, inst, dt, world);
}
