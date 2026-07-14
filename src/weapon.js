import { circleHit } from "./utils.js";
import { pick } from "./i18n.js";

export const WEAPONS = {
  bone: {
    id: "bone",
    name: "碎骨投掷",
    nameEn: "Bone Toss",
    tag: "远程单发",
    tagEn: "Ranged",
    desc: "向最近的敌人投出骨头，升级后扇形多发",
    descEn: "Throws a bone at the nearest enemy; upgrades add a spread of extra bones",
    color: "#f2ead8",
    enhance: { desc: "骨头穿透 +2", descEn: "Bone pierce +2", detail: "重复选择穿透 +1/层", detailEn: "Repeat: +1 pierce" },
    // evolution: max tier + 3 enhance stacks unlocks the awakened form
    evolve: {
      name: "灭骨风暴",
      nameEn: "Bone Storm",
      desc: "8连赤骨齐射，穿透与攻速全面觉醒",
      descEn: "A relentless fan of piercing bones",
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
    nameEn: "Bone Cyclone",
    tag: "近战环绕",
    tagEn: "Melee Orbit",
    desc: "骨头环绕自身旋转，把靠近的敌人撞飞出去",
    descEn: "Bones circle your body and knock nearby enemies away",
    color: "#8fd6ff",
    enhance: { desc: "骨环固定大小，击退 +50%", descEn: "Ring size locks, knockback 1.5x", detail: "重复选择击退 +10%/层", detailEn: "Repeat: +0.1x knockback" },
    evolve: {
      name: "白骨领域",
      nameEn: "Judgement Ring",
      desc: "12根巨骨织成绞杀领域，靠近者皆碎",
      descEn: "A frozen ring of maximum knockback",
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
    nameEn: "Homing Bone",
    tag: "远程追踪",
    tagEn: "Seeker",
    desc: "骨弹自动转向，追着敌人打",
    descEn: "Bones steer themselves toward enemies",
    color: "#ff9e6b",
    enhance: { desc: "命中禁锢 0.5 秒", descEn: "Projectiles +1", detail: "重复选择 +0.25s/层", detailEn: "Repeat: +1 projectile" },
    evolve: {
      name: "万骨归宗",
      nameEn: "True Seeker",
      desc: "7发追魂骨弹，转向如影随形",
      descEn: "Never misses, never stops",
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
    nameEn: "Bone Bomb",
    tag: "投掷范围",
    tagEn: "Area Burst",
    desc: "抛出骨雷，爆炸造成大范围伤害",
    descEn: "Lobbed bombs deal wide blast damage",
    color: "#ffd166",
    enhance: { desc: "爆炸次数 +2", descEn: "Echo blast +1", detail: "重复选择爆炸次数 +1/层", detailEn: "Repeat: +1 echo" },
    evolve: {
      name: "歼灭轰炸",
      nameEn: "Mega Detonation",
      desc: "5连骨雷地毯式覆盖，半径暴涨",
      descEn: "Every blast echoes into shockwaves",
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
    nameEn: "Piercing Spear",
    tag: "直线穿透",
    tagEn: "Line Pierce",
    desc: "笔直飞行，无限穿透路径上所有敌人",
    descEn: "Flies straight, piercing every enemy in its path",
    color: "#c59bff",
    enhance: { desc: "每穿透一个敌人引发小爆炸", descEn: "Width +50%", detail: "重复选择扩大爆炸范围", detailEn: "Repeat: +20% width" },
    evolve: {
      name: "审判之枪",
      nameEn: "Judgement Lance",
      desc: "5道巨型骨矛，贯穿一切的白色审判",
      descEn: "A wall-wide piercing volley",
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
    nameEn: "Floor Spikes",
    tag: "地面召唤",
    tagEn: "Ground Trap",
    desc: "从地下召唤骨刺刺穿敌人，升级后骨刺和目标更多",
    descEn: "Bone spikes erupt under enemies; upgrades add spikes and targets",
    color: "#d9c47a",
    enhance: { desc: "攻击时在身边召唤骨牢环", descEn: "Spikes echo, +1 wave", detail: "重复选择增加环上骨头数", detailEn: "Repeat: +1 wave" },
    evolve: {
      name: "白骨刑场",
      nameEn: "Spike Field",
      desc: "16根骨刺同时贯穿7个目标",
      descEn: "The floor itself turns hostile",
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
    nameEn: "Windmill Laser",
    tag: "旋转光束",
    tagEn: "Sweep Beam",
    desc: "低频率召唤旋转一整圈的激光风车，触碰持续掉血",
    descEn: "A rotating laser rig that shreds anything it touches",
    color: "#9bd7ff",
    enhance: { desc: "激光待机时 +50% 减伤", descEn: "Standby damage reduction", detail: "每层 +10%，上限 90%", detailEn: "Repeat: +5%/stack" },
    evolve: {
      name: "湮灭风车",
      nameEn: "Gamma Windmill",
      desc: "7叶巨型光轮，触者皆熔",
      descEn: "Twin beams, double sweep",
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
    nameEn: "Bone Boomerang",
    tag: "回旋折返",
    tagEn: "Return Cut",
    desc: "扔出后折返回手，去程回程各伤一次",
    descEn: "Hits on the way out and on the way home",
    color: "#7ce8a8",
    enhance: { desc: "回程伤害 +100%", descEn: "Rethrow +1", detail: "重复选择 +20%/层", detailEn: "Repeat: +1 rethrow" },
    evolve: {
      name: "无归之镖",
      nameEn: "Infinity Arc",
      desc: "6把巨镖织成往返绞杀网",
      descEn: "It simply refuses to land",
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
    nameEn: "Blue Bind",
    tag: "地面禁锢",
    tagEn: "Ground Root",
    desc: "地下伸出蓝骨伤害并禁锢敌人，升级加目标和禁锢时长",
    descEn: "Blue bones that root everything they touch",
    color: "#4f9dff",
    enhance: { desc: "攻击附带小爆炸", descEn: "Root duration +", detail: "爆炸波及的敌人禁锢 0.25s/层", detailEn: "Repeat: +duration" },
    evolve: {
      name: "蓝色审判",
      nameEn: "Still Judgement",
      desc: "蓝骨天降：这次轮到你们不许动了(禁锢4秒)",
      descEn: "Blue attack. Don't move.",
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
    nameEn: "Purple Wave",
    tag: "扇形浪涌",
    tagEn: "Zone Denial",
    desc: "地下涌出层层骨浪扇形推进，升级加浪数和骨头数",
    descEn: "Waves of purple bones wash over the field",
    color: "#c59bff",
    enhance: { desc: "骨浪附带击退", descEn: "Wave width +", detail: "重复选择击退 +10%/层", detailEn: "Repeat: wider still" },
    evolve: {
      name: "审判长廊",
      nameEn: "Tide of Judgement",
      desc: "9波白骨海啸淹没长廊，无处落脚",
      descEn: "The whole lane becomes a wave",
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
    nameEn: "Cross Volley",
    tag: "定向弹幕",
    tagEn: "Aimed Barrage",
    desc: "向固定方向同时射出骨头，每级 +2 根",
    descEn: "Fires bone volleys along crossing lanes",
    color: "#f2ead8",
    enhance: { desc: "延长敌人的禁锢", descEn: "Volley +1", detail: "命中禁锢中的敌人 +1s，每层再 +0.5s", detailEn: "Repeat: +1 volley" },
    evolve: {
      name: "业报乱刺·KR",
      nameEn: "Cross Requiem",
      desc: "20根业骨十六向穿刺，伤口不会愈合",
      descEn: "Every lane is a firing line",
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
    nameEn: "Orbit Burst",
    tag: "环绕爆破",
    tagEn: "Spin Burst",
    desc: "骨雷绕身一周后掷向敌人爆炸，升级加骨雷数和爆炸半径",
    descEn: "Orbiting bones fling outward in bursts",
    color: "#ffd166",
    enhance: { desc: "环绕时周期小爆炸", descEn: "Burst shards +", detail: "每 0.5s 一次，每层提高频率", detailEn: "Repeat: +shards" },
    evolve: {
      name: "审判日轮",
      nameEn: "Nova Revolution",
      desc: "9颗骨雷绕身引爆，半径140",
      descEn: "Every revolution detonates",
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
    nameEn: "Bone Ward",
    tag: "反弹护体",
    tagEn: "Guard",
    desc: "每 4.5 秒开盾，全额反弹伤害并击退，升级加持续时间",
    descEn: "Raises a damage-blocking ward",
    color: "#9a5df0",
    enhance: { desc: "开盾时狂化", descEn: "Uptime +", detail: "+100% 移速和回血，每层 +25%", detailEn: "Repeat: +uptime" },
    evolve: {
      name: "紫魂蛛网",
      nameEn: "Aegis of Bone",
      desc: "6秒紫网庇护，反弹一切恶意",
      descEn: "A ward that barely rests",
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
    nameEn: "Sound Crash",
    tag: "天降音波",
    tagEn: "Sky Waves",
    desc: "骨头从天而降释放紫色音波，伤害并击退，升级加骨数和半径",
    descEn: "Sonic bones drop from above in waves",
    color: "#e08fff",
    enhance: { desc: "巨大骨伤害 +100%", descEn: "Waves +", detail: "音波范围不变，每层再 +20%", detailEn: "Repeat: +waves" },
    evolve: {
      name: "MEGALOVANIA",
      nameEn: "Requiem Fall",
      desc: "6根天骨奏响灭世强音，半径180音爆",
      descEn: "The sky sings, everything falls",
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
    nameEn: "Soul Chain",
    tag: "锁链牵引",
    tagEn: "Drag & Bind",
    desc: "锁链拖敌到面前，途中掉血，到达重击禁锢并小范围爆炸",
    descEn: "Chains drag enemies toward you and bind them",
    color: "#b8a5d0",
    enhance: { desc: "到达爆炸附带禁锢", descEn: "Chain targets +1", detail: "波及的敌人禁锢 0.25s/层", detailEn: "Repeat: +1 target" },
    evolve: {
      name: "蓝魂操纵",
      nameEn: "Gallows Chain",
      desc: "9条魂链拖拽灵魂，傀儡任凭摆布",
      descEn: "Everyone answers the summons",
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
    nameEn: "Purple Laser",
    tag: "穿透灼烧",
    tagEn: "Charge Beam",
    desc: "瞬间闪射贯穿全屏的激光，一次性伤害并减速，升级加锁定目标数",
    descEn: "A charged beam that punishes straight lines",
    color: "#c95df0",
    enhance: { desc: "减速效果 +100%", descEn: "Beam width +", detail: "重复选择每层再 +20%", detailEn: "Repeat: wider" },
    evolve: {
      name: "加斯特余响",
      nameEn: "Royal Cannon",
      desc: "9道紫光洪流——来自虚空的注视",
      descEn: "The corridor becomes the weapon",
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
    nameEn: "Great Sweep",
    tag: "近战横扫",
    tagEn: "Arc Slash",
    desc: "巨骨扫向最近的敌人，范围伤害并持续推挤，升级加范围次数",
    descEn: "A huge bone sweeps a half-circle",
    color: "#ff5d5d",
    enhance: { desc: "击退 +50%", descEn: "Sweep arc +", detail: "重复选择 +10%/层", detailEn: "Repeat: wider arc" },
    evolve: {
      name: "猎杀时刻",
      nameEn: "Full Moon Sweep",
      desc: "半径170的四连横扫，猎物无处可逃",
      descEn: "A complete circle of pain",
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
    nameEn: "Bone Feast",
    tag: "吸血骨弹",
    tagEn: "Lifesteal Shot",
    desc: "敌人背后召唤骨头飞回，沿途伤敌，回收时概率回血",
    descEn: "Bone shots that feed HP back to you",
    color: "#ff8f8f",
    enhance: { desc: "回血概率 +10%", descEn: "Lifesteal +", detail: "重复选择 +5%/层", detailEn: "Repeat: +lifesteal" },
    evolve: {
      name: "雪镇飨宴",
      nameEn: "Devourer's Rite",
      desc: "7目标必定吸血——今晚不会挨饿",
      descEn: "The feast never ends",
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
    nameEn: "Heavy Slam",
    tag: "禁锢重击",
    tagEn: "Root Smash",
    desc: "周身连续砸击，高伤害并禁锢，升级加次数和禁锢",
    descEn: "A crushing blow that roots its victims",
    color: "#d63a3a",
    enhance: { desc: "每砸中一个敌人获得 0.15s 无敌", descEn: "i-frames per hit", detail: "重复选择 +0.1s/层，累计上限 1.5s", detailEn: "Repeat: +i-frames" },
    evolve: {
      name: "开颅重锤",
      nameEn: "Seismic Verdict",
      desc: "10连重砸+禁锢2.5秒，给他们也开个洞",
      descEn: "The ground remembers every hit",
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
    nameEn: "Piercing Axe",
    tag: "穿透投掷",
    tagEn: "Pierce Throw",
    desc: "掷出穿透一切的飞斧，升级加飞斧数量",
    descEn: "Thrown axes that punch through lines",
    color: "#c7cdd8",
    enhance: { desc: "飞斧变为回旋镖，去而复返", descEn: "Axes +", detail: "重复选择 +1 次回旋", detailEn: "Repeat: +axes" },
    evolve: {
      name: "千斧断魂",
      nameEn: "Butcher Volley",
      desc: "8把巨斧撕裂全场，伤害翻倍",
      descEn: "A storm of spinning steel",
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
    nameEn: "Quake Bone",
    tag: "震荡击退",
    tagEn: "Shock Knock",
    desc: "脚下召出巨骨掀起击退波，升级加波数和巨骨大小",
    descEn: "A ground-shaking bone that batters and repels",
    color: "#ff5d5d",
    enhance: { desc: "被震波杀死的敌人爆炸", descEn: "Kills explode", detail: "重复选择扩大爆炸半径", detailEn: "Repeat: bigger blasts" },
    evolve: {
      name: "雪镇崩塌",
      nameEn: "Fault Line",
      desc: "5波半径200的塌方震荡",
      descEn: "The arena itself cracks",
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
    nameEn: "Axe Lasso",
    tag: "环绕捕掷",
    tagEn: "Grab & Slam",
    desc: "斧子绕身两圈粘住敌人后连人掷出，升级加斧子大小",
    descEn: "Hooks an enemy and slams it down",
    color: "#aab2c2",
    enhance: { desc: "每粘住一个敌人回复 1 血", descEn: "Slam blast +", detail: "重复选择 +1 回血/层", detailEn: "Repeat: bigger blast" },
    evolve: {
      name: "屠夫巨斧",
      nameEn: "Gallows Hook",
      desc: "斧刃尺寸翻倍，绞碎猎物",
      descEn: "The hook comes back heavier",
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
    nameEn: "Phantom Cleave",
    tag: "二段劈砍",
    tagEn: "Echo Chop",
    desc: "斧头轻砸后，大斧虚影劈向同处造成大额伤害，升级加砸击次数",
    descEn: "A phantom axe repeats your chop for massive damage",
    color: "#e8ecf4",
    enhance: { desc: "每次砸击分裂 2 个额外幻影", descEn: "Split phantoms +2", detail: "重复选择 +1 幻影", detailEn: "Repeat: +1 phantom" },
    evolve: {
      name: "断头幻影",
      nameEn: "Headsman Phantom",
      desc: "6连劈斩首风暴",
      descEn: "A six-fold beheading storm",
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
    nameEn: "Quake Bone Ring",
    tag: "地阵爆发",
    tagEn: "Ground Burst",
    desc: "原地重砸一击，随后在四周立起一圈骨头，升级加骨头数量",
    descEn: "Slam the ground and raise a ring of bones",
    color: "#e8dcc0",
    enhance: { desc: "骨头圈数 +2", descEn: "Bone rings +2", detail: "重复选择 +1 圈", detailEn: "Repeat: +1 ring" },
    evolve: {
      name: "白骨猎场",
      nameEn: "White Hunting Ground",
      desc: "32根巨骨圈出死亡猎场",
      descEn: "32 great bones fence the kill zone",
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
  // ---- Insanity(血疯线)weapons ----------------------------------------------
  // 深红=决心过量;八把全部围绕"禁锢/处刑"的疯狂节奏
  ifist: {
    id: "ifist",
    name: "血色重拳",
    nameEn: "Crimson Fist",
    tag: "爆发击飞",
    tagEn: "Burst Knock",
    desc: "重拳轰出小型爆炸,击飞范围内敌人,落地禁锢3秒,升级加拳围和击飞距离",
    descEn: "A blasting punch that flings enemies; landing binds them",
    color: "#ff4d5e",
    enhance: { desc: "被击飞的敌人撞到敌人时爆炸", descEn: "Mid-flight collisions explode", detail: "重复选择增加爆炸半径", detailEn: "Repeat: bigger blasts" },
    evolve: {
      name: "血色扣杀",
      nameEn: "Crimson Dunk",
      desc: "GET DUNKED ON——撞墙撞怪必爆",
      descEn: "GET DUNKED ON, walls included",
      tier: { dmgMult: 5.0, rateMult: 0.65, blast: 140, fling: 260, bind: 4 },
    },
    tiers: [
      { blast: 70, fling: 160, bind: 3, dmgMult: 2.15, rateMult: 0.4 },
      { blast: 76, fling: 180, bind: 3, dmgMult: 2.4, rateMult: 0.42 },
      { blast: 84, fling: 200, bind: 3, dmgMult: 2.65, rateMult: 0.45 },
      { blast: 92, fling: 220, bind: 3, dmgMult: 3.0, rateMult: 0.48 },
      { blast: 100, fling: 240, bind: 3, dmgMult: 3.35, rateMult: 0.5 },
    ],
  },
  ipounce: {
    id: "ipounce",
    name: "扑杀",
    nameEn: "Pounce",
    tag: "锁定骑乘",
    tagEn: "Lock & Maul",
    desc: "扑住敌人连续撕咬,期间减伤90%,敌人死亡才罢休,升级加撕咬频率",
    descEn: "Leap onto an enemy and maul it; 90% damage cut while riding",
    color: "#d92535",
    enhance: { desc: "起跳时拖最多3个近身敌人一起禁锢", descEn: "Drag up to 3 neighbors in", detail: "重复选择 +1 敌人上限", detailEn: "Repeat: +1 victim" },
    evolve: {
      name: "轮回噬咬",
      nameEn: "Cycle Bite",
      desc: "目标死亡立即锁定下一只,最多3连扑",
      descEn: "Kill, lock the next, chain of 3",
      tier: { tick: 1.9, interval: 0.45, guard: 0.95, chain: 3, rateMult: 0.34 },
    },
    tiers: [
      { tick: 1.1, interval: 0.6, guard: 0.9, chain: 1, rateMult: 0.22 },
      { tick: 1.2, interval: 0.56, guard: 0.9, chain: 1, rateMult: 0.24 },
      { tick: 1.3, interval: 0.52, guard: 0.9, chain: 1, rateMult: 0.26 },
      { tick: 1.5, interval: 0.48, guard: 0.9, chain: 1, rateMult: 0.28 },
      { tick: 1.7, interval: 0.45, guard: 0.9, chain: 1, rateMult: 0.3 },
    ],
  },
  iblaster: {
    id: "iblaster",
    name: "龙骨狂轰",
    nameEn: "Blaster Frenzy",
    tag: "随机炮阵",
    tagEn: "Random Volley",
    desc: "头顶召唤龙骨炮轰向随机方向,不索敌,升级加炮数",
    descEn: "Skull cannons above fire in random directions",
    color: "#b31226",
    enhance: { desc: "每门龙骨炮轰击次数 +1", descEn: "Shots per cannon +1", detail: "重复选择再 +1 次", detailEn: "Repeat: +1 shot" },
    evolve: {
      name: "乱码狂轰",
      nameEn: "Glitch Barrage",
      desc: "W.D.的符文尖啸——10门齐鸣,每门连轰两次",
      descEn: "Ten cannons, two volleys, no aim",
      tier: { count: 10, volleys: 2, dmgMult: 4.3, rateMult: 0.6 },
    },
    tiers: [
      { count: 5, volleys: 1, dmgMult: 2.65, rateMult: 0.35 },
      { count: 6, volleys: 1, dmgMult: 2.9, rateMult: 0.38 },
      { count: 7, volleys: 1, dmgMult: 3.1, rateMult: 0.4 },
      { count: 8, volleys: 1, dmgMult: 3.35, rateMult: 0.42 },
      { count: 9, volleys: 1, dmgMult: 3.6, rateMult: 0.45 },
    ],
  },
  ihook: {
    id: "ihook",
    name: "骨刺跳跃",
    nameEn: "Spike Leap",
    tag: "突进爆破",
    tagEn: "Hook & Blast",
    desc: "骨刺钉住最近的敌人,借力跃过去引爆,跳跃全程无敌,升级加爆炸次数",
    descEn: "Pin the nearest enemy, leap over, detonate; invincible mid-leap",
    color: "#c93a5a",
    enhance: { desc: "落点随机竖起骨头", descEn: "Bones sprout at the landing", detail: "重复选择增加骨头数量", detailEn: "Repeat: +bones" },
    evolve: {
      name: "猩红捷径",
      nameEn: "Crimson Shortcut",
      desc: "sans的捷径,染了色——连跳3段,落点连环爆",
      descEn: "Three chained leaps, double blasts",
      tier: { jumps: 3, blasts: 2, dmgMult: 4.55, rateMult: 0.6 },
    },
    tiers: [
      { jumps: 1, blasts: 1, dmgMult: 2.4, rateMult: 0.4 },
      { jumps: 1, blasts: 1, dmgMult: 2.65, rateMult: 0.42 },
      { jumps: 1, blasts: 2, dmgMult: 2.9, rateMult: 0.45 },
      { jumps: 1, blasts: 2, dmgMult: 3.1, rateMult: 0.48 },
      { jumps: 1, blasts: 3, dmgMult: 3.35, rateMult: 0.5 },
    ],
  },
  ipull: {
    id: "ipull",
    name: "拉近爆破",
    nameEn: "Execution Pull",
    tag: "处刑连爆",
    tagEn: "Drag & Burst",
    desc: "把最近的敌人拽到面前,在它身上连环起爆,升级加爆炸次数",
    descEn: "Drags the nearest enemy in and detonates it repeatedly",
    color: "#e01030",
    enhance: { desc: "爆炸附带轻微击退", descEn: "Blasts knock back", detail: "重复选择增加击退力度", detailEn: "Repeat: stronger knockback" },
    evolve: {
      name: "决心灼烧",
      nameEn: "DT Burn",
      desc: "过量的决心在体内点燃——6连爆+灼烧",
      descEn: "Six blasts, then the burning",
      tier: { blasts: 6, burn: 2, dmgMult: 3.85, rateMult: 0.58 },
    },
    tiers: [
      { blasts: 2, burn: 0, dmgMult: 1.8, rateMult: 0.45 },
      { blasts: 2, burn: 0, dmgMult: 2.0, rateMult: 0.48 },
      { blasts: 3, burn: 0, dmgMult: 2.15, rateMult: 0.5 },
      { blasts: 3, burn: 0, dmgMult: 2.35, rateMult: 0.52 },
      { blasts: 4, burn: 0, dmgMult: 2.5, rateMult: 0.55 },
    ],
  },
  ihand: {
    id: "ihand",
    name: "手掌幻影",
    nameEn: "Phantom Grip",
    tag: "握合禁锢",
    tagEn: "Clench Bind",
    desc: "掷出手掌幻影,飞行后猛然握合,高额伤害并禁锢,升级略增幻影体型",
    descEn: "A phantom hand flies out, then clenches for huge damage and bind",
    color: "#ff7a6b",
    enhance: { desc: "脚下同时伸出一只幻影手", descEn: "A second hand under your feet", detail: "重复选择增加体型", detailEn: "Repeat: bigger hands" },
    evolve: {
      name: "加斯特之手",
      nameEn: "Gaster's Hands",
      desc: "洞穿的手掌自虚空合围——前后双手",
      descEn: "Two holed hands close from both sides",
      tier: { size: 2.0, bind: 2.5, twin: true, dmgMult: 6.0, rateMult: 0.55 },
    },
    tiers: [
      { size: 1.2, bind: 1.5, twin: false, dmgMult: 3.6, rateMult: 0.3 },
      { size: 1.35, bind: 1.5, twin: false, dmgMult: 3.95, rateMult: 0.32 },
      { size: 1.5, bind: 1.5, twin: false, dmgMult: 4.3, rateMult: 0.35 },
      { size: 1.65, bind: 1.5, twin: false, dmgMult: 4.7, rateMult: 0.38 },
      { size: 1.8, bind: 1.5, twin: false, dmgMult: 5.05, rateMult: 0.4 },
    ],
  },
  irain: {
    id: "irain",
    name: "骨雨",
    nameEn: "Bone Rain",
    tag: "范围压制",
    tagEn: "Area Barrage",
    desc: "在四周随机砸下50根骨头,升级增加骨头数量",
    descEn: "Fifty bones crash down around you",
    color: "#a01822",
    enhance: { desc: "骨头体积 +100%", descEn: "Bone size +100%", detail: "重复选择再 +20%", detailEn: "Repeat: +20% size" },
    evolve: {
      name: "糟糕时光",
      nameEn: "Bad Time",
      desc: "you're gonna have a bad time——3秒骨幕不停歇",
      descEn: "3 seconds of unbroken downpour",
      tier: { bones: 140, duration: 3, dmgMult: 1.8, rateMult: 0.5 },
    },
    tiers: [
      { bones: 50, duration: 0.9, dmgMult: 0.95, rateMult: 0.28 },
      { bones: 58, duration: 0.9, dmgMult: 1.1, rateMult: 0.3 },
      { bones: 68, duration: 1.0, dmgMult: 1.2, rateMult: 0.32 },
      { bones: 78, duration: 1.0, dmgMult: 1.3, rateMult: 0.34 },
      { bones: 90, duration: 1.1, dmgMult: 1.45, rateMult: 0.36 },
    ],
  },
  ispike: {
    id: "ispike",
    name: "分裂骨刺",
    nameEn: "Splitting Spike",
    tag: "点名分裂",
    tagEn: "Marked Split",
    desc: "怪物脚下刺出骨刺,命中后炸裂成小骨刺,升级加目标和分裂数",
    descEn: "Spikes under enemies burst into smaller spikes",
    color: "#ff5d73",
    enhance: { desc: "分裂骨命中后追加小爆炸", descEn: "Child spikes explode", detail: "重复选择增加半径,上限=主爆", detailEn: "Repeat: bigger, capped at parent" },
    evolve: {
      name: "审判乱葬",
      nameEn: "Judgement Graves",
      desc: "审判厅的地板下,埋着所有失败的时间线",
      descEn: "The hall floor buries its failures",
      tier: { targets: 6, splits: 8, dmgMult: 3.6, rateMult: 0.62 },
    },
    tiers: [
      { targets: 2, splits: 4, dmgMult: 1.7, rateMult: 0.42 },
      { targets: 2, splits: 4, dmgMult: 1.85, rateMult: 0.45 },
      { targets: 3, splits: 5, dmgMult: 2.05, rateMult: 0.48 },
      { targets: 3, splits: 5, dmgMult: 2.2, rateMult: 0.5 },
      { targets: 4, splits: 6, dmgMult: 2.4, rateMult: 0.52 },
    ],
  },
  // ---- Hacker-ending(黑客结局)weapons ----------------------------------------
  // 白骨=未渲染线框;全套围绕"改写代码":缴械/百分比/宏/物理滥用
  hfling: {
    id: "hfling",
    name: "越界甩掷",
    nameEn: "Boundary Toss",
    tag: "全屏清场",
    tagEn: "Screen Clear",
    desc: "把随机一侧的全部敌人甩向屏幕边缘,落点小爆炸,升级加爆炸半径",
    descEn: "Hurls one whole side of enemies to the screen edge; landing blasts",
    color: "#e8ecf4",
    enhance: { desc: "敌人飞行途中也会爆炸", descEn: "Explosions mid-flight", detail: "重复选择提升爆炸频率", detailEn: "Repeat: faster ticks" },
    evolve: {
      name: "越界删除",
      nameEn: "Out of Bounds",
      desc: "OUT OF BOUNDS——边缘爆径翻倍,并反弹回场造成路径伤害",
      descEn: "Edge blasts double, and they bounce back",
      tier: { blast: 52, edgeMult: 2, bounce: true, dmgMult: 5.4, rateMult: 0.5 },
    },
    tiers: [
      { blast: 40, edgeMult: 1, bounce: false, dmgMult: 2.3, rateMult: 0.4 },
      { blast: 43, edgeMult: 1, bounce: false, dmgMult: 2.6, rateMult: 0.42 },
      { blast: 46, edgeMult: 1, bounce: false, dmgMult: 2.9, rateMult: 0.45 },
      { blast: 49, edgeMult: 1, bounce: false, dmgMult: 3.25, rateMult: 0.48 },
      { blast: 52, edgeMult: 1, bounce: false, dmgMult: 3.6, rateMult: 0.5 },
    ],
  },
  hgrab: {
    id: "hgrab",
    name: "权限抓取",
    nameEn: "Permission Grab",
    tag: "缴械爆破",
    tagEn: "Disarm Blast",
    desc: "抓住最近的敌人甩出,落地爆炸并永久缴械受波及者,升级加抓取数和爆径",
    descEn: "Grab and throw the nearest enemies; the blast disarms permanently",
    color: "#c8d2e8",
    enhance: { desc: "爆炸额外附带 2 秒禁锢", descEn: "Blast adds a 2s root", detail: "重复选择 +0.5 秒", detailEn: "Repeat: +0.5s" },
    evolve: {
      name: "权限回收",
      nameEn: "Access Revoked",
      desc: "他们的攻击函数,被注释掉了——抓3只,爆径+50%,另附1s禁锢",
      descEn: "Grab three; their attacks get commented out",
      tier: { grabs: 3, blast: 120, bonusRoot: 1, dmgMult: 5.8, rateMult: 0.52 },
    },
    tiers: [
      { grabs: 1, blast: 56, bonusRoot: 0, dmgMult: 2.6, rateMult: 0.35 },
      { grabs: 1, blast: 62, bonusRoot: 0, dmgMult: 2.95, rateMult: 0.38 },
      { grabs: 2, blast: 68, bonusRoot: 0, dmgMult: 3.3, rateMult: 0.4 },
      { grabs: 2, blast: 74, bonusRoot: 0, dmgMult: 3.65, rateMult: 0.42 },
      { grabs: 3, blast: 80, bonusRoot: 0, dmgMult: 4.0, rateMult: 0.45 },
    ],
  },
  hmacro: {
    id: "hmacro",
    name: "宏",
    nameEn: "Macro",
    tag: "脚本连发",
    tagEn: "Script Combo",
    desc: "立刻连续释放你已获得的全部其他技能,升级加释放次数",
    descEn: "Instantly re-fires every other skill you own",
    color: "#9adcff",
    choiceOnly: true, // 不可开局携带,只在局内选卡出现(用户原案)
    enhance: { desc: "宏期间全部伤害 +50%", descEn: "All damage +50% during macro", detail: "重复选择 +20%", detailEn: "Repeat: +20%" },
    evolve: {
      name: "宏",
      nameEn: "Macro",
      desc: "全部技能,连续五轮齐射",
      descEn: "Every skill, five volleys straight",
      tier: { casts: 5, haste: 0.3, rateMult: 0.22 },
    },
    tiers: [
      { casts: 3, haste: 0, rateMult: 0.16 },
      { casts: 4, haste: 0, rateMult: 0.17 },
      { casts: 5, haste: 0, rateMult: 0.18 },
      { casts: 6, haste: 0, rateMult: 0.2 },
      { casts: 7, haste: 0, rateMult: 0.22 },
    ],
  },
  hscythe: {
    id: "hscythe",
    name: "删除镰刀",
    nameEn: "Delete Scythe",
    tag: "百分比斩",
    tagEn: "Percent Cut",
    desc: "挥镰按目标最大生命比例结算:普通100%/精英50%/首领20%/天意5%,升级加刀径",
    descEn: "Swings deal % of max HP: mob 100 / elite 50 / boss 20 / GOD 5",
    color: "#f2ead8",
    enhance: { desc: "全部比例 +2.5%", descEn: "All ratios +2.5%", detail: "最多叠加 10 次", detailEn: "Max 10 stacks" },
    evolve: {
      name: "血镰处刑",
      nameEn: "Blood Harvest",
      desc: "一刀更深——精英75%/首领30%/天意8%",
      descEn: "Deeper cuts: elite 75 / boss 30 / GOD 8",
      tier: { blade: 195, p1: 0.75, p2: 0.3, p3: 0.08, rateMult: 0.52 },
    },
    tiers: [
      { blade: 90, p1: 0.5, p2: 0.2, p3: 0.05, rateMult: 0.42 },
      { blade: 100, p1: 0.5, p2: 0.2, p3: 0.05, rateMult: 0.45 },
      { blade: 110, p1: 0.5, p2: 0.2, p3: 0.05, rateMult: 0.48 },
      { blade: 120, p1: 0.5, p2: 0.2, p3: 0.05, rateMult: 0.5 },
      { blade: 130, p1: 0.5, p2: 0.2, p3: 0.05, rateMult: 0.52 },
    ],
  },
  hshock: {
    id: "hshock",
    name: "系统震荡",
    nameEn: "System Shock",
    tag: "控场处决",
    tagEn: "Crowd Execute",
    desc: "以自身为心的无伤震荡:击退+禁锢+永久缴械;低血的普通/精英被永久禁锢",
    descEn: "A no-damage shockwave: knockback, root, permanent disarm; low-HP mobs get sealed",
    color: "#dfe6f2",
    enhance: { desc: "永久禁锢改为直接斩杀,斩杀线 +5%", descEn: "Seal becomes execution, +5% line", detail: "最多叠加 5 次", detailEn: "Max 5 stacks" },
    evolve: {
      name: "物理震荡",
      nameEn: "Physical Shock",
      desc: "范围×1.6,击退×1.5,缴械必附2秒禁锢",
      descEn: "1.6x radius, 1.5x knockback, bonus root",
      tier: { radius: 304, push: 300, bonusRoot: 2, rateMult: 0.38 },
    },
    tiers: [
      { radius: 120, push: 120, bonusRoot: 0, rateMult: 0.3 },
      { radius: 138, push: 140, bonusRoot: 0, rateMult: 0.32 },
      { radius: 155, push: 160, bonusRoot: 0, rateMult: 0.34 },
      { radius: 172, push: 180, bonusRoot: 0, rateMult: 0.36 },
      { radius: 190, push: 200, bonusRoot: 0, rateMult: 0.38 },
    ],
  },
  hride: {
    id: "hride",
    name: "龙骨骑乘",
    nameEn: "Blaster Ride",
    tag: "冲锋后座",
    tagEn: "Charge & Recoil",
    desc: "骑上脚下召唤的龙骨炮冲锋撞开敌人,随后炮击并借后坐力弹回原地,升级加炮体",
    descEn: "Ride a skull cannon forward, then its blast recoils you home",
    color: "#dce8f0",
    enhance: { desc: "被撞到的敌人缴械 5 秒", descEn: "Rammed enemies disarmed 5s", detail: "重复选择 +2 秒", detailEn: "Repeat: +2s" },
    evolve: {
      name: "龙骨决裁",
      nameEn: "Bone Verdict",
      desc: "去程回程双撞,炮体+40%,炮击翻倍",
      descEn: "Both passes hit, bigger cannon, double blast",
      tier: { size: 90, chargeDmg: 4.3, fireDmg: 9.2, doublePass: true, rateMult: 0.4 },
    },
    tiers: [
      { size: 46, chargeDmg: 2.4, fireDmg: 3.2, doublePass: false, rateMult: 0.32 },
      { size: 50, chargeDmg: 2.7, fireDmg: 3.55, doublePass: false, rateMult: 0.34 },
      { size: 55, chargeDmg: 3.0, fireDmg: 3.9, doublePass: false, rateMult: 0.36 },
      { size: 59, chargeDmg: 3.3, fireDmg: 4.25, doublePass: false, rateMult: 0.38 },
      { size: 64, chargeDmg: 3.6, fireDmg: 4.6, doublePass: false, rateMult: 0.4 },
    ],
  },
  hslash: {
    id: "hslash",
    name: "半月斩",
    nameEn: "Crescent Slash",
    tag: "穿透减速",
    tagEn: "Pierce Slow",
    desc: "镰刀斩出快速飞行的剑气,命中减速5秒,升级加剑气宽度和射程",
    descEn: "A flying crescent that slows everything it cuts",
    color: "#f2ead8",
    enhance: { desc: "额外挥舞 2 次", descEn: "Two extra swings", detail: "重复选择 +1 次", detailEn: "Repeat: +1 swing" },
    evolve: {
      name: "降频斩",
      nameEn: "Downclock Slash",
      desc: "把他们的帧率砍到5——三道扇形,命中先冻结0.5秒再减速",
      descEn: "A three-blade fan that freezes first",
      tier: { width: 120, fan: 3, freeze: 0.5, dmgMult: 4.6, rateMult: 0.55 },
    },
    tiers: [
      { width: 70, fan: 1, freeze: 0, dmgMult: 2.2, rateMult: 0.45 },
      { width: 82, fan: 1, freeze: 0, dmgMult: 2.5, rateMult: 0.48 },
      { width: 95, fan: 1, freeze: 0, dmgMult: 2.8, rateMult: 0.5 },
      { width: 108, fan: 1, freeze: 0, dmgMult: 3.1, rateMult: 0.52 },
      { width: 120, fan: 1, freeze: 0, dmgMult: 3.4, rateMult: 0.55 },
    ],
  },
  htrojan: {
    id: "htrojan",
    name: "木马爆破",
    nameEn: "Trojan Blast",
    tag: "宿主免伤",
    tagEn: "Host Spared",
    desc: "在敌人身上引爆,宿主本身无伤,爆炸伤害其他敌人并缴械,升级加目标和爆径",
    descEn: "Detonates on an enemy: the host is spared, neighbors are hit and disarmed",
    color: "#d8e2f0",
    enhance: { desc: "宿主也吃 200% 伤害与缴械", descEn: "Host takes 200% too", detail: "重复选择 +50%", detailEn: "Repeat: +50%" },
    evolve: {
      name: "超载引爆",
      nameEn: "Overload Blast",
      desc: "被缴械者也会连锁殉爆一次",
      descEn: "Disarmed victims chain-detonate",
      tier: { targets: 6, blast: 86, chain: true, dmgMult: 5.2, rateMult: 0.52 },
    },
    tiers: [
      { targets: 2, blast: 60, chain: false, dmgMult: 2.5, rateMult: 0.42 },
      { targets: 2, blast: 66, chain: false, dmgMult: 2.8, rateMult: 0.45 },
      { targets: 3, blast: 72, chain: false, dmgMult: 3.15, rateMult: 0.48 },
      { targets: 3, blast: 79, chain: false, dmgMult: 3.5, rateMult: 0.5 },
      { targets: 4, blast: 86, chain: false, dmgMult: 3.8, rateMult: 0.52 },
    ],
  },
  // ---- Hard-mode weapons ----------------------------------------------------
  dash: {
    id: "dash",
    name: "极限突刺",
    nameEn: "Limit Dash",
    tag: "突进穿透",
    tagEn: "Pierce Rush",
    desc: "向目标突刺并穿透路径，返回原位时爆炸，升级加突刺次数",
    descEn: "Dash through enemies and detonate on return",
    color: "#5db9ff",
    enhance: { desc: "突刺时减伤 +10%", descEn: "Dash guard +10%", detail: "重复选择 +5%/层", detailEn: "Repeat: +5%/stack" },
    evolve: {
      name: "橙魂疾冲",
      nameEn: "Orange Rush",
      desc: "9连突刺——橙色攻击，永不停步",
      descEn: "Nine dashes, never stop moving",
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
    nameEn: "Splitting Rain",
    tag: "空中分裂",
    tagEn: "Air Split",
    desc: "射出 6 根骨头，悬停后各自裂成子骨，升级加分裂数量",
    descEn: "Bones split apart mid-air",
    color: "#f2ead8",
    enhance: { desc: "子骨再裂出 4 个子子骨", descEn: "Splits +", detail: "重复选择增加分裂数量", detailEn: "Repeat: +splits" },
    evolve: {
      name: "蓝橙骤雨",
      nameEn: "Cluster Rain",
      desc: "14裂变蓝橙弹幕铺天盖地",
      descEn: "The rain divides, and divides",
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
    nameEn: "Bone Sigil",
    tag: "标记爆破",
    tagEn: "Marked Blast",
    desc: "在目标身上召唤蓝骨爆炸并环出骨圈，升级加爆炸、目标与骨数",
    descEn: "Marks enemies, then detonates the marks",
    color: "#4f9dff",
    enhance: { desc: "骨圈变蓝并禁锢 1 秒", descEn: "Mark radius +", detail: "重复选择禁锢 +0.5s/层", detailEn: "Repeat: wider" },
    evolve: {
      name: "静止蓝罚",
      nameEn: "Sigil of Ruin",
      desc: "8目标蓝骨降罚+半径100爆环",
      descEn: "Every mark is a promise",
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
    nameEn: "Mega Bone",
    tag: "坠地分裂",
    tagEn: "Sky Drop",
    desc: "头顶巨骨砸地爆炸，裂成小骨四射，升级多一圈骨头",
    descEn: "A giant bone falls from above",
    color: "#ffd166",
    enhance: { desc: "碎骨 3 层穿透且不消失", descEn: "Drop shards", detail: "重复选择穿透 +2/层", detailEn: "Repeat: +shards" },
    evolve: {
      name: "终焉之骨",
      nameEn: "Titan Bone",
      desc: "8环弹幕+半径160巨爆——这是最后一根骨头",
      descEn: "The sky itself takes a swing",
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
    nameEn: "Gravity Orb",
    tag: "缓速禁锢",
    tagEn: "Pull Field",
    desc: "缓慢前进的暗蓝光环，触碰持续伤害并禁锢，升级加索敌目标",
    descEn: "An orb that drags enemies inward",
    color: "#2f6ea8",
    enhance: { desc: "敌人粘在光球上(上限 5)", descEn: "Pull strength +", detail: "重复选择上限 +3/层", detailEn: "Repeat: stronger" },
    evolve: {
      name: "蓝魂引力",
      nameEn: "Event Horizon",
      desc: "9颗引力光球拖拽灵魂",
      descEn: "Nothing leaves the orbit",
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
    nameEn: "Gaster Blaster",
    tag: "头顶轰击",
    tagEn: "Beam Volley",
    desc: "头顶召唤龙骨炮向目标轰出巨大光束，升级加数量(同向齐射)",
    descEn: "Skull cannons fire aligned beams",
    color: "#fddefe",
    enhance: { desc: "龙骨炮体积 +50%", descEn: "Blaster size +50%", detail: "重复选择 +20%/层", detailEn: "Repeat: +20%" },
    evolve: {
      name: "W.D.加斯特炮阵",
      nameEn: "W.D. Special",
      desc: "9门龙骨炮齐轰——记得那个被遗忘的人",
      descEn: "The signature volley, unabridged",
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
    nameEn: "Ring Laser",
    tag: "环状激光",
    tagEn: "Radial Beams",
    desc: "36 根短激光绕圈依次闪射，命中禁锢，升级加激光数",
    descEn: "Lasers flash outward in a ring",
    color: "#8fd6ff",
    enhance: { desc: "激光命中处小爆炸", descEn: "Beams +", detail: "重复选择扩大爆炸半径", detailEn: "Repeat: +beams" },
    evolve: {
      name: "最终审判环",
      nameEn: "Halo of Ruin",
      desc: "120道环射光刃，无处可躲",
      descEn: "A full circle of light",
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
    nameEn: "Bone Turret",
    tag: "旋转炮台",
    tagEn: "Sentry Ring",
    desc: "骨桩插地环转，撞击碾过的敌人，升级 +2 根",
    descEn: "A breathing ring of sentry bones",
    color: "#9be8a8",
    enhance: { desc: "撞击附带击退", descEn: "Bones +", detail: "重复选择提高击退力度", detailEn: "Repeat: +bones" },
    evolve: {
      name: "白骨丛林",
      nameEn: "Bone Bastion",
      desc: "20根骨桩拔地绞杀",
      descEn: "The ring becomes a fortress",
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
  // tags = 选人卡面的两个玩法标签(backlog 第6项: 卡面只留名/标签/专精,长描述渐进披露)
  { id: "sans", name: "传说之下", color: "#7ea8ff", tags: ["正统骨系", "均衡"], nameEn: "Classic", tagsEn: ["Orthodox bones", "Balanced"], desc: "经典骨骼战士，八种正统骨系武器", descEn: "The classic skeleton warrior with eight orthodox bone weapons" },
  { id: "ukb", name: "因果报应", color: "#c59bff", tags: ["禁锢", "反震"], nameEn: "Karma", tagsEn: ["Bind", "Payback"], desc: "紫光神秘骷髅，禁锢与反震的掌控者", descEn: "A violet-lit skeleton who masters binds and retribution" },
  { id: "horror", name: "恐惧传说", color: "#ff5d5d", tags: ["巨骨", "飞斧"], nameEn: "Horror", tagsEn: ["Great bones", "Axes"], desc: "猎手骷髅，巨骨与飞斧的狂宴", descEn: "A hunter skeleton feasting on great bones and flying axes" },
  { id: "hard", name: "困难模式", color: "#5db9ff", tags: ["蓝光", "极限攻势"], nameEn: "Hard Mode", tagsEn: ["Blue light", "All-out"], desc: "蓝光缠身，极限攻势的化身", descEn: "Wreathed in blue light, the embodiment of extreme offense" },
  // 血疯线:决心过量实验体——解锁价与商店总价同级,是账号的长线目标
  { id: "insanity", name: "Insanity", color: "#d92535", tags: ["禁锢", "处刑"], nameEn: "Insanity", tagsEn: ["Bind", "Execution"], desc: "决心过量实验体，天性增伤与生命+15%", descEn: "A DT-overdosed subject; +15% damage and HP by nature", cost: 10000 },
  // 黑客结局:本体彩蛋黑屋守门人;付费天性梯度 15/15 → 20/20;需通关地狱
  { id: "hacker", name: "黑客结局", color: "#e8ecf4", tags: ["缴械", "处决"], nameEn: "Hacker Ending", tagsEn: ["Disarm", "Execute"], desc: "黑屋的守门人，天性增伤与生命+20%", descEn: "The dark room's gatekeeper; +20% damage and HP by nature", cost: 15000, gate: "hell" },
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
  insanity: [
    WEAPONS.ifist,
    WEAPONS.ipounce,
    WEAPONS.iblaster,
    WEAPONS.ihook,
    WEAPONS.ipull,
    WEAPONS.ihand,
    WEAPONS.irain,
    WEAPONS.ispike,
  ],
  hacker: [
    WEAPONS.hfling,
    WEAPONS.hgrab,
    WEAPONS.hmacro,
    WEAPONS.hscythe,
    WEAPONS.hshock,
    WEAPONS.hride,
    WEAPONS.hslash,
    WEAPONS.htrojan,
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
    flings: [], // insanity 血色重拳: enemies mid-flight
    pounce: null, // insanity 扑杀: leap/ride state (locks the player)
    igb: null, // insanity 龙骨炮 volley
    hook: null, // insanity 骨刺跳跃 state (locks the player)
    ipullBurst: null, // insanity 拉近爆破 scheduled blasts
    hands: [], // insanity 手掌幻影 in flight
    ipending: [], // insanity 分裂骨刺 scheduled child spikes
    hflings: [], // hacker 甩飞体
    hmacroState: null, // hacker 宏释放窗口
    hswing: null, // hacker 镰刀挥舞动画
    hrideState: null, // hacker 骑炮冲锋(锁定玩家)
    hwaves: [], // hacker 半月斩剑气
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
    .map((i) => (i.evolved ? `★${pick(WEAPONS[i.id].evolve, "name")}` : `${pick(WEAPONS[i.id], "name")} Lv${i.tier + 1}`))
    .join(sep);
}

// all weapon damage funnels through this so 增伤 cards affect everything
export function weaponDmg(player, mult) {
  // the single damage funnel: in-run amp cards AND the shop's independent
  // meta multiplier both live here so nothing ever bypasses either
  return Math.max(1, Math.round(player.atk * mult * (player.dmgAmp || 1) * (player.metaDmg || 1) * (player.relicAmp || 1) * (player.macroBoost || 1)));
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

// ---- Insanity helpers -------------------------------------------------------
// 扑杀与骨刺跳跃都会锁定玩家本体,二者互斥(用户原案裁定)
export function insanityBusy(player) {
  for (const i of player.weapons) {
    if (i.id === "ipounce" && i.pounce) return "ipounce";
    if (i.id === "ihook" && i.hook) return "ihook";
  }
  return null;
}

export function getPounceInfo(inst) {
  if (inst.id !== "ipounce" || !inst.pounce) return null;
  return inst.pounce;
}

export function getHookInfo(inst) {
  if (inst.id !== "ihook" || !inst.hook) return null;
  return inst.hook;
}

export function getIGBState(inst) {
  if (inst.id !== "iblaster" || !inst.igb) return null;
  const g = inst.igb;
  const firing = g.t >= 0.45 && g.t < 0.9;
  return {
    t: g.t,
    firing,
    blasters: g.blasters.map((b) => ({
      x: b.ox,
      y: b.oy,
      angle: b.angle,
      alpha: g.t < 0.2 ? g.t / 0.2 : g.t >= 0.95 ? Math.max(0, 1 - (g.t - 0.95) / 0.3) : 1,
      beam: firing
        ? { x1: b.ox, y1: b.oy, x2: b.ox + Math.cos(b.angle) * 760, y2: b.oy + Math.sin(b.angle) * 760, width: 26 }
        : null,
    })),
  };
}

export function getHandFx(inst) {
  if (inst.id !== "ihand") return [];
  return inst.hands;
}

// ---- Hacker render helpers ---------------------------------------------------
export function getScytheSwing(inst) {
  if (inst.id !== "hscythe" || !inst.hswing) return null;
  return inst.hswing;
}

export function getSlashWaves(inst) {
  if (inst.id !== "hslash") return [];
  return inst.hwaves.filter((w) => w.delay <= 0);
}

export function getRideInfo(inst) {
  if (inst.id !== "hride" || !inst.hrideState) return null;
  return inst.hrideState;
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

  // ---- Hacker-ending weapons --------------------------------------------------
  if (weapon.id === "hfling") {
    if (inst.hflings.length) {
      const alive = [];
      for (const f of inst.hflings) {
        f.t += dt;
        const prog = Math.min(f.t / f.dur, 1);
        f.e.x = f.fx + (f.tx - f.fx) * prog;
        f.e.y = Math.min(Math.max(f.fy + (f.ty - f.fy) * prog, world.bounds.top), world.bounds.bottom);
        f.e.rootTimer = Math.max(f.e.rootTimer, 0.1);
        // 强化: 飞行途中周期爆炸
        if (inst.enhance > 0) {
          f.bombT = (f.bombT || 0) + dt;
          const interval = Math.max(0.12, 0.26 - 0.04 * (inst.enhance - 1));
          if (f.bombT >= interval) {
            f.bombT = 0;
            world.spawnBlast({ x: f.e.x, y: f.e.y, dmg: weaponDmg(player, tier.dmgMult * 0.4), blast: 30, color: "#f2ead8" });
          }
        }
        if (prog >= 1) {
          if (f.leg === "out") {
            world.spawnBlast({
              x: f.e.x,
              y: f.e.y,
              dmg: weaponDmg(player, tier.dmgMult),
              blast: tier.blast * (inst.evolved ? tier.edgeMult : 1),
              color: "#f2ead8",
            });
            if (inst.evolved && tier.bounce) {
              // 越界删除: 反弹回场,回程作路径伤害
              f.leg = "back";
              f.fx = f.e.x;
              f.fy = f.e.y;
              f.tx = f.ox;
              f.ty = f.oy;
              f.t = 0;
              f.hitSet = new Set();
              alive.push(f);
            }
          }
        } else {
          if (f.leg === "back") {
            for (const o of enemies) {
              if (o === f.e || o.boss || f.hitSet.has(o.id)) continue;
              if (circleHit(f.e.x, f.e.y, 22, o.x, o.y, o.radius)) {
                if (o.takeDamage(weaponDmg(player, tier.dmgMult * 0.5))) f.hitSet.add(o.id);
              }
            }
          }
          alive.push(f);
        }
      }
      inst.hflings = alive;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    // 随机一侧: 该侧全部敌人甩向对应屏幕边缘
    const side = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
    const picked = enemies.filter((e) => {
      if (e.boss) return false;
      if (side === "up") return e.y < player.y;
      if (side === "down") return e.y > player.y;
      if (side === "left") return e.x < player.x;
      return e.x > player.x;
    });
    if (!picked.length) return;
    for (const e of picked) {
      const tx = side === "left" ? player.x - 470 : side === "right" ? player.x + 470 : e.x;
      const ty = side === "up" ? world.bounds.top : side === "down" ? world.bounds.bottom : e.y;
      inst.hflings.push({ e, ox: e.x, oy: e.y, fx: e.x, fy: e.y, tx, ty, t: 0, dur: 0.3, leg: "out" });
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "hgrab") {
    if (inst.hflings.length) {
      const alive = [];
      for (const f of inst.hflings) {
        f.t += dt;
        const prog = Math.min(f.t / f.dur, 1);
        f.e.x = f.fx + (f.tx - f.fx) * prog;
        f.e.y = Math.min(Math.max(f.fy + (f.ty - f.fy) * prog, world.bounds.top), world.bounds.bottom);
        f.e.rootTimer = Math.max(f.e.rootTimer, 0.1);
        if (prog >= 1) {
          // 落地爆炸: 伤害+永久缴械(冠军3s/天意免疫在applyDisarm里裁决)
          const dmg = weaponDmg(player, tier.dmgMult);
          world.spawnBlast({ x: f.e.x, y: f.e.y, dmg, blast: tier.blast, color: "#c8d2e8" });
          for (const o of enemies) {
            if (circleHit(f.e.x, f.e.y, tier.blast, o.x, o.y, o.radius)) {
              o.applyDisarm?.(Infinity);
              if (inst.enhance > 0) o.applyRoot(2 + 0.5 * (inst.enhance - 1));
              if (inst.evolved && tier.bonusRoot) o.applyRoot(tier.bonusRoot);
            }
          }
        } else alive.push(f);
      }
      inst.hflings = alive;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const grabs = enemies
      .filter((e) => !e.boss)
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))
      .slice(0, tier.grabs)
      .filter((e) => Math.hypot(e.x - player.x, e.y - player.y) < effRange + 120);
    if (!grabs.length) return;
    for (const e of grabs) {
      const a = Math.random() * Math.PI * 2;
      inst.hflings.push({
        e,
        fx: e.x,
        fy: e.y,
        tx: player.x + Math.cos(a) * 230,
        ty: Math.min(Math.max(player.y + Math.sin(a) * 230, world.bounds.top), world.bounds.bottom),
        t: 0,
        dur: 0.28,
      });
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "hmacro") {
    if (inst.hmacroState) {
      const m = inst.hmacroState;
      m.t += dt;
      // 宏窗口: 全部伤害吃增幅(唯一伤害漏斗里生效)
      player.macroBoost = Math.max(player.macroBoost || 1, 1 + (inst.enhance > 0 ? 0.5 + 0.2 * (inst.enhance - 1) : 0));
      if (m.t >= 0.35) {
        m.t = 0;
        m.wavesLeft -= 1;
        for (const other of player.weapons) {
          if (other === inst || other.id === "hmacro") continue; // 防递归(用户裁决3)
          other.cooldown = 0; // 强制就绪,下一帧各自开火
        }
      }
      if (m.wavesLeft <= 0) {
        inst.hmacroState = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (player.weapons.length <= 1) return; // 没有其他技能可放
    if (!findNearestEnemy(player.x, player.y, effRange + 200, enemies)) return;
    inst.hmacroState = { t: 0.35, wavesLeft: tier.casts };
    return;
  }

  if (weapon.id === "hscythe") {
    // Boss/冠军百分比节流计时(用户裁决2: 每2.5s至多结算一次)
    for (const e of enemies) if (e.hackPct > 0) e.hackPct -= dt;
    if (inst.hswing) {
      inst.hswing.t += dt;
      if (inst.hswing.t >= 0.28) inst.hswing = null;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, tier.blade + 40, enemies)) return;
    const bonus = 0.025 * Math.min(inst.enhance, 10); // 强化上限10次(用户原案)
    for (const e of enemies) {
      if (!circleHit(player.x, player.y, tier.blade, e.x, e.y, e.radius)) continue;
      const throttled = e.boss || e.championProfile;
      if (throttled && e.hackPct > 0) continue;
      const pct = (e.boss ? tier.p3 : e.championProfile ? tier.p2 : e.elite ? tier.p1 : 1.0) + bonus;
      if (e.takeDamage(Math.max(1, Math.round(e.maxHp * pct))) && throttled) e.hackPct = 2.5;
    }
    inst.hswing = { t: 0, radius: tier.blade };
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "hshock") {
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, tier.radius, enemies)) return;
    world.spawnBlast({ x: player.x, y: player.y, dmg: 0, blast: tier.radius, color: "#dfe6f2" }); // 无伤,纯冲击视觉
    const execBonus = 0.05 * Math.min(inst.enhance, 5); // 强化上限5次(用户原案)
    for (const e of enemies) {
      if (!circleHit(player.x, player.y, tier.radius, e.x, e.y, e.radius)) continue;
      // 击退
      const d = Math.hypot(e.x - player.x, e.y - player.y) || 1;
      e.x += ((e.x - player.x) / d) * tier.push;
      e.y = Math.min(Math.max(e.y + ((e.y - player.y) / d) * tier.push, world.bounds.top), world.bounds.bottom);
      e.applyRoot(1.2 + (inst.evolved ? tier.bonusRoot : 0));
      e.applyDisarm?.(Infinity);
      if (e.boss || e.championProfile) continue; // 处决只对普通/精英
      const line = (e.elite ? 0.2 : 0.5) + execBonus;
      if (e.hp / e.maxHp < line) {
        if (inst.enhance > 0) e.takeDamage(e.hp + 99999); // 斩杀线
        else e.applyRoot(0, true); // 永久禁锢
      }
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "hride") {
    if (inst.hrideState) {
      const r = inst.hrideState;
      r.t += dt;
      player.guardBonus = Math.max(player.guardBonus, 0.6);
      const dur = r.phase === "charge" ? 0.45 : 0.3;
      const prog = Math.min(r.t / dur, 1);
      player.x = r.fx + (r.tx - r.fx) * prog;
      player.y = Math.min(Math.max(r.fy + (r.ty - r.fy) * prog, world.bounds.top), world.bounds.bottom);
      // 冲锋撞开+撞击伤害(回程仅进化)
      if (r.phase === "charge" || (inst.evolved && tier.doublePass)) {
        for (const e of enemies) {
          if (e.boss || r.hitSet.has(e.id)) continue;
          if (circleHit(player.x, player.y, tier.size * 0.8, e.x, e.y, e.radius)) {
            if (e.takeDamage(weaponDmg(player, tier.chargeDmg))) {
              r.hitSet.add(e.id);
              const d = Math.hypot(e.x - player.x, e.y - player.y) || 1;
              e.x += ((e.x - player.x) / d) * 60;
              e.y = Math.min(Math.max(e.y + ((e.y - player.y) / d) * 60, world.bounds.top), world.bounds.bottom);
              if (inst.enhance > 0) e.applyDisarm?.(5 + 2 * (inst.enhance - 1));
            }
          }
        }
      }
      if (prog >= 1) {
        if (r.phase === "charge") {
          // 炮击(2026-07-14 用户定稿): 冲锋到头,龙骨炮朝前方发射一道光束,
          // 后坐力把骑着炮的 sans 弹回原地——伤害是射线,不是终点爆圈
          const beamLen = 560;
          const bx1 = player.x + r.dirX * 30;
          const by1 = player.y + r.dirY * 30;
          const bx2 = bx1 + r.dirX * beamLen;
          const by2 = by1 + r.dirY * beamLen;
          const beamDmg = weaponDmg(player, tier.fireDmg);
          for (const e of enemies) {
            if (distPointSegment(e.x, e.y, bx1, by1, bx2, by2) < tier.size * 0.45 + e.radius) {
              e.takeDamage(beamDmg);
            }
          }
          world.spawnBlast({ x: bx1, y: by1, dmg: 0, blast: tier.size * 0.7, color: "#f2ead8" }); // 炮口冲击(纯视觉)
          r.beam = { x1: bx1, y1: by1, x2: bx2, y2: by2, width: tier.size * 0.9 };
          r.phase = "return";
          r.fx = player.x;
          r.fy = player.y;
          r.tx = r.ox;
          r.ty = r.oy;
          r.t = 0;
          r.hitSet = inst.evolved && tier.doublePass ? new Set() : r.hitSet;
        } else {
          inst.hrideState = null;
          inst.cooldown = 1 / (player.fireRate * tier.rateMult);
        }
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t0 = findNearestEnemy(player.x, player.y, effRange + 200, enemies);
    if (!t0) return;
    // 始终朝索到的敌人冲锋(2026-07-15 用户反馈:原先移动中按朝向冲,
    // 变成锁了A却撞向别处——索敌即冲锋方向,炮击射线也沿同方向)
    const d = Math.hypot(t0.x - player.x, t0.y - player.y) || 1;
    const dx = (t0.x - player.x) / d;
    const dy = (t0.y - player.y) / d;
    inst.hrideState = {
      phase: "charge",
      t: 0,
      ox: player.x,
      oy: player.y,
      fx: player.x,
      fy: player.y,
      tx: player.x + dx * 300,
      ty: player.y + dy * 300,
      dirX: dx,
      dirY: dy,
      hitSet: new Set(),
    };
    return;
  }

  if (weapon.id === "hslash") {
    if (inst.hwaves.length) {
      const alive = [];
      for (const w of inst.hwaves) {
        if (w.delay > 0) {
          w.delay -= dt;
          alive.push(w);
          continue;
        }
        w.x += w.dirX * 430 * dt;
        w.y += w.dirY * 430 * dt;
        w.traveled += 430 * dt;
        for (const e of enemies) {
          if (w.hitSet.has(e.id)) continue;
          if (circleHit(w.x, w.y, w.width / 2, e.x, e.y, e.radius)) {
            if (e.takeDamage(weaponDmg(player, tier.dmgMult))) {
              w.hitSet.add(e.id);
              e.slowTimer = Math.max(e.slowTimer, 5);
              if (inst.evolved && tier.freeze > 0) e.applyRoot(tier.freeze);
            }
          }
        }
        if (w.traveled < 520) alive.push(w);
      }
      inst.hwaves = alive;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, effRange + 180, enemies);
    if (!t) return;
    const baseA = Math.atan2(t.y - player.y, t.x - player.x);
    const swings = 1 + (inst.enhance > 0 ? 2 + (inst.enhance - 1) : 0);
    const fan = inst.evolved ? tier.fan : 1;
    for (let s = 0; s < swings; s++) {
      for (let f = 0; f < fan; f++) {
        const a = baseA + (fan > 1 ? (f - (fan - 1) / 2) * 0.35 : 0);
        inst.hwaves.push({
          x: player.x + Math.cos(a) * 26,
          y: player.y + Math.sin(a) * 26,
          dirX: Math.cos(a),
          dirY: Math.sin(a),
          width: tier.width,
          traveled: 0,
          delay: s * 0.18,
          hitSet: new Set(),
        });
      }
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "htrojan") {
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const hosts = enemies
      .filter((e) => !e.boss && Math.hypot(e.x - player.x, e.y - player.y) < effRange + 170) // Boss不当免伤宿主,但吃邻近炸点的溅射
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))
      .slice(0, tier.targets);
    if (!hosts.length) return;
    const dmg = weaponDmg(player, tier.dmgMult);
    const blastAt = (cx, cy, host, mult) => {
      world.spawnBlast({ x: cx, y: cy, dmg: 0, blast: tier.blast, color: "#d8e2f0" }); // 视觉
      let chained = null;
      for (const o of enemies) {
        if (!circleHit(cx, cy, tier.blast, o.x, o.y, o.radius)) continue;
        if (o === host) {
          // 宿主免伤——强化后反而吃 200%+效果(用户原案)
          if (inst.enhance > 0) {
            o.takeDamage(Math.round(dmg * mult * (2 + 0.5 * (inst.enhance - 1))));
            o.applyDisarm?.(Infinity);
          }
          continue;
        }
        o.takeDamage(Math.round(dmg * mult));
        o.applyDisarm?.(Infinity);
        if (!chained && o !== host) chained = o;
      }
      return chained;
    };
    for (const host of hosts) {
      const c = blastAt(host.x, host.y, host, 1);
      if (inst.evolved && tier.chain && c) blastAt(c.x, c.y, c, 0.6); // 二级炸点,只连锁一次
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  // ---- Insanity weapons -----------------------------------------------------
  if (weapon.id === "ifist") {
    // 在途击飞体推进(独立于冷却)
    if (inst.flings.length) {
      const stillFlying = [];
      for (const f of inst.flings) {
        f.t += dt;
        const prog = Math.min(f.t / f.dur, 1);
        f.e.x = f.fx + f.dx * f.dist * prog;
        f.e.y = Math.min(Math.max(f.fy + f.dy * f.dist * prog, world.bounds.top), world.bounds.bottom);
        f.e.rootTimer = Math.max(f.e.rootTimer, 0.1); // 飞行中不许行动
        // 强化: 撞上其他敌人时爆炸(每个飞行体只炸一次)
        if (!f.exploded && (inst.enhance > 0 || inst.evolved)) {
          for (const o of enemies) {
            if (o === f.e || o.boss) continue;
            if (circleHit(f.e.x, f.e.y, 20, o.x, o.y, o.radius)) {
              const r = inst.evolved ? 56 : 40 + 14 * Math.max(0, inst.enhance - 1);
              world.spawnBlast({ x: f.e.x, y: f.e.y, dmg: weaponDmg(player, tier.dmgMult * 0.6), blast: r, color: "#ff4d5e" });
              f.exploded = true;
              break;
            }
          }
        }
        if (prog >= 1) {
          // 撞墙(上下边界)必爆——进化限定
          if (inst.evolved && !f.exploded && (f.e.y <= world.bounds.top + 2 || f.e.y >= world.bounds.bottom - 2)) {
            world.spawnBlast({ x: f.e.x, y: f.e.y, dmg: weaponDmg(player, tier.dmgMult * 0.6), blast: 56, color: "#ff4d5e" });
          }
          f.e.applyRoot(tier.bind); // 落地禁锢
        } else stillFlying.push(f);
      }
      inst.flings = stillFlying;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, Math.min(effRange, 170), enemies);
    if (!t) return;
    const ang = Math.atan2(t.y - player.y, t.x - player.x);
    const px = player.x + Math.cos(ang) * 34;
    const py = player.y + Math.sin(ang) * 34;
    world.spawnBlast({ x: px, y: py, dmg: weaponDmg(player, tier.dmgMult), blast: tier.blast, color: "#ff4d5e" });
    for (const e of enemies) {
      if (e.boss) continue;
      if (circleHit(px, py, tier.blast, e.x, e.y, e.radius)) {
        const d = Math.hypot(e.x - px, e.y - py) || 1;
        inst.flings.push({
          e,
          fx: e.x,
          fy: e.y,
          dx: (e.x - px) / d,
          dy: (e.y - py) / d,
          dist: tier.fling,
          t: 0,
          dur: 0.26, // 快速向后飞出
          exploded: false,
        });
      }
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "ipounce") {
    if (inst.pounce) {
      const p = inst.pounce;
      const e = p.e;
      // 目标已消失/死亡
      if (!e || e.hp <= 0) {
        if (inst.evolved && p.chainLeft > 0) {
          const next = findNearestEnemy(player.x, player.y, 260, enemies.filter((x) => !x.boss));
          if (next) {
            inst.pounce = { phase: "leap", e: next, t: 0, fx: player.x, fy: player.y, chainLeft: p.chainLeft - 1, tickT: 0, rideT: 0 };
            return;
          }
        }
        inst.pounce = null;
        inst.cooldown = Math.max(1.5, 1 / (player.fireRate * tier.rateMult));
        return;
      }
      player.guardBonus = Math.max(player.guardBonus, tier.guard); // 90%/95% 减伤
      if (p.phase === "leap") {
        p.t += dt;
        const prog = Math.min(p.t / 0.22, 1);
        player.x = p.fx + (e.x - p.fx) * prog;
        player.y = p.fy + (e.y - p.fy) * prog;
        e.rootTimer = Math.max(e.rootTimer, 0.3);
        if (prog >= 1) {
          p.phase = "ride";
          // 强化: 起跳落定时拖近身敌人一起禁锢
          if (inst.enhance > 0) {
            const cap = 3 + (inst.enhance - 1);
            const near = enemies
              .filter((o) => o !== e && !o.boss && Math.hypot(o.x - e.x, o.y - e.y) < 190)
              .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))
              .slice(0, cap);
            near.forEach((o, i) => {
              const a = (i / Math.max(1, near.length)) * Math.PI * 2;
              o.x = e.x + Math.cos(a) * (e.radius + o.radius + 10);
              o.y = Math.min(Math.max(e.y + Math.sin(a) * (e.radius + o.radius + 10), world.bounds.top), world.bounds.bottom);
              o.applyRoot(1.5);
              p.extras = p.extras || [];
              p.extras.push(o);
            });
          }
        }
        return;
      }
      // ride: 骑在目标身上连续撕咬
      p.rideT += dt;
      p.tickT += dt;
      player.x = e.x;
      player.y = e.y - e.radius - 8;
      e.rootTimer = Math.max(e.rootTimer, 0.2);
      if (p.tickT >= tier.interval) {
        p.tickT = 0;
        e.takeDamage(weaponDmg(player, tier.tick));
        for (const o of p.extras || []) if (o.hp > 0) o.takeDamage(weaponDmg(player, tier.tick * 0.6));
      }
      if (p.rideT >= 4) {
        // 骑乘上限: 血厚精英骑不死就下来,防无敌拖延
        inst.pounce = null;
        inst.cooldown = Math.max(1.5, 1 / (player.fireRate * tier.rateMult));
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (insanityBusy(player)) return; // 骨刺跳跃进行中不可扑
    const t = findNearestEnemy(player.x, player.y, effRange + 90, enemies.filter((e) => !e.boss));
    if (!t) return;
    inst.pounce = { phase: "leap", e: t, t: 0, fx: player.x, fy: player.y, chainLeft: inst.evolved ? tier.chain - 1 : 0, tickT: 0, rideT: 0 };
    return;
  }

  if (weapon.id === "iblaster") {
    if (inst.igb) {
      const g = inst.igb;
      g.t += dt;
      for (const b of g.blasters) {
        b.ox = player.x + b.offX; // 炮阵跟随头顶
        b.oy = player.y - 84 + b.offY;
      }
      if (g.t >= 0.45 && g.t < 0.9) {
        const dmg = weaponDmg(player, tier.dmgMult);
        for (const b of g.blasters) {
          const x2 = b.ox + Math.cos(b.angle) * 760;
          const y2 = b.oy + Math.sin(b.angle) * 760;
          for (const e of enemies) {
            if (g.hitSet.has(e.id)) continue;
            if (distPointSegment(e.x, e.y, b.ox, b.oy, x2, y2) < 14 + e.radius) {
              if (e.takeDamage(dmg)) g.hitSet.add(e.id);
            }
          }
        }
      }
      if (g.t >= 1.1) {
        const totalVolleys = tier.volleys + (inst.enhance > 0 ? inst.enhance : 0);
        if (g.volley + 1 < totalVolleys) {
          // 下一轮齐射: 方向重掷,跳过长前摇
          g.volley += 1;
          g.t = 0.2;
          g.hitSet.clear();
          for (const b of g.blasters) b.angle = Math.random() * Math.PI * 2;
        } else {
          inst.igb = null;
          inst.cooldown = 1 / (player.fireRate * tier.rateMult);
        }
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, effRange + 260, enemies)) return;
    const blasters = [];
    for (let i = 0; i < tier.count; i++) {
      blasters.push({
        offX: (i - (tier.count - 1) / 2) * 42,
        offY: -Math.abs(i - (tier.count - 1) / 2) * 8, // 头顶弧形排开
        ox: player.x,
        oy: player.y - 84,
        angle: Math.random() * Math.PI * 2, // 不索敌,方向由疯狂决定
      });
    }
    inst.igb = { t: 0, volley: 0, blasters, hitSet: new Set() };
    return;
  }

  if (weapon.id === "ihook") {
    if (inst.hook) {
      const h = inst.hook;
      h.t += dt;
      player.invuln = Math.max(player.invuln, 0.1); // 跳跃全程无敌
      const prog = Math.min(h.t / 0.24, 1);
      player.x = h.fx + (h.tx - h.fx) * prog;
      player.y = h.fy + (h.ty - h.fy) * prog;
      h.trail.push({ x: player.x, y: player.y, t: 0 });
      for (const tr of h.trail) tr.t += dt;
      h.trail = h.trail.filter((tr) => tr.t < 0.2);
      if (prog >= 1) {
        const dmg = weaponDmg(player, tier.dmgMult);
        for (let i = 0; i < tier.blasts; i++) {
          world.spawnSpike({ x: h.tx, y: h.ty, dmg, delay: 0.08 + i * 0.16, wave: 64, knockback: 90, noBone: true, color: "#c93a5a" });
        }
        // 强化: 落点随机竖起骨头
        if (inst.enhance > 0) {
          const bones = 2 + (inst.enhance - 1);
          for (let i = 0; i < bones; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 26 + Math.random() * 44;
            world.spawnSpike({ x: h.tx + Math.cos(a) * r, y: h.ty + Math.sin(a) * r, dmg: dmg * 0.6, delay: 0.2 + Math.random() * 0.2, color: "#c93a5a" });
          }
        }
        h.jumpsLeft -= 1;
        const next = h.jumpsLeft > 0 ? findNearestEnemy(player.x, player.y, 240, enemies.filter((e) => !e.boss)) : null;
        if (next) {
          h.fx = player.x;
          h.fy = player.y;
          h.tx = next.x;
          h.ty = next.y;
          h.t = 0;
        } else {
          inst.hook = null;
          inst.cooldown = 1 / (player.fireRate * tier.rateMult);
        }
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (insanityBusy(player)) return; // 扑杀进行中不可跳
    const t = findNearestEnemy(player.x, player.y, 240, enemies.filter((e) => !e.boss)); // 索敌上限240,别太远
    if (!t) return;
    inst.hook = { t: 0, fx: player.x, fy: player.y, tx: t.x, ty: t.y, jumpsLeft: inst.evolved ? tier.jumps : 1, trail: [] };
    return;
  }

  if (weapon.id === "ipull") {
    if (inst.ipullBurst) {
      const b = inst.ipullBurst;
      b.t += dt;
      // 拉拽阶段
      if (b.t < 0.18 && b.e.hp > 0) {
        const prog = b.t / 0.18;
        b.e.x = b.ex + (player.x + b.dirX * 42 - b.ex) * prog;
        b.e.y = Math.min(Math.max(b.ey + (player.y + b.dirY * 42 - b.ey) * prog, world.bounds.top), world.bounds.bottom);
        b.e.rootTimer = Math.max(b.e.rootTimer, 0.15);
        return;
      }
      // 连环起爆(跟着目标走)
      if (b.fired < tier.blasts && b.t >= 0.18 + b.fired * 0.17) {
        const bx = b.e.hp > 0 ? b.e.x : b.lx;
        const by = b.e.hp > 0 ? b.e.y : b.ly;
        b.lx = bx;
        b.ly = by;
        world.spawnBlast({ x: bx, y: by, dmg: weaponDmg(player, tier.dmgMult), blast: 52, color: "#e01030" });
        // 强化: 爆炸附带轻微击退
        if (inst.enhance > 0) {
          const push = 26 + 12 * (inst.enhance - 1);
          for (const o of enemies) {
            if (circleHit(bx, by, 52, o.x, o.y, o.radius) && !o.boss) {
              const d = Math.hypot(o.x - bx, o.y - by) || 1;
              o.x += ((o.x - bx) / d) * push;
              o.y = Math.min(Math.max(o.y + ((o.y - by) / d) * push, world.bounds.top), world.bounds.bottom);
            }
          }
        }
        b.fired += 1;
        return;
      }
      if (b.fired >= tier.blasts) {
        // 进化: 决心灼烧余伤
        if (inst.evolved && tier.burn > 0 && b.e.hp > 0) {
          b.burnT = (b.burnT || 0) + dt;
          if (b.burnT < tier.burn) {
            b.burnTick = (b.burnTick || 0) + dt;
            if (b.burnTick >= 0.4) {
              b.burnTick = 0;
              b.e.takeDamage(weaponDmg(player, tier.dmgMult * 0.25));
            }
            return;
          }
        }
        inst.ipullBurst = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, effRange + 150, enemies.filter((e) => !e.boss));
    if (!t) return;
    const d = Math.hypot(t.x - player.x, t.y - player.y) || 1;
    inst.ipullBurst = { t: 0, e: t, ex: t.x, ey: t.y, lx: t.x, ly: t.y, dirX: (t.x - player.x) / d, dirY: (t.y - player.y) / d, fired: 0 };
    return;
  }

  if (weapon.id === "ihand") {
    if (inst.hands.length) {
      const alive = [];
      for (const h of inst.hands) {
        h.t += dt;
        if (h.phase === "fly") {
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          if (h.t >= h.flyT) {
            h.phase = "clench";
            h.t = 0;
            const r = 26 * h.size;
            const dmg = weaponDmg(player, tier.dmgMult);
            for (const e of enemies) {
              if (circleHit(h.x, h.y, r, e.x, e.y, e.radius)) {
                e.takeDamage(dmg);
                e.applyRoot(tier.bind);
              }
            }
            world.spawnBlast({ x: h.x, y: h.y, dmg: 0, blast: r, color: "#ff7a6b" }); // 纯视觉冲击圈
          }
          alive.push(h);
        } else if (h.t < 0.35) alive.push(h); // 握合定格 0.35s 后消失
      }
      inst.hands = alive;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const t = findNearestEnemy(player.x, player.y, effRange + 120, enemies);
    if (!t) return;
    const ang = Math.atan2(t.y - player.y, t.x - player.x);
    const speed = 300;
    const dist = Math.min(Math.hypot(t.x - player.x, t.y - player.y) + 20, effRange + 120);
    inst.hands.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      t: 0,
      flyT: dist / speed, // 快速飞行一会后握住
      size: tier.size,
      phase: "fly",
    });
    // 进化: 前后双手合围
    if (inst.evolved && tier.twin) {
      inst.hands.push({
        x: t.x + Math.cos(ang) * 90,
        y: t.y + Math.sin(ang) * 90,
        vx: -Math.cos(ang) * speed,
        vy: -Math.sin(ang) * speed,
        t: 0,
        flyT: 90 / speed,
        size: tier.size,
        phase: "fly",
      });
    }
    // 强化: 脚下伸出幻影手
    if (inst.enhance > 0) {
      inst.hands.push({
        x: player.x,
        y: player.y + 10,
        vx: 0,
        vy: 0,
        t: 0,
        flyT: 0.18,
        size: 1.0 + 0.25 * (inst.enhance - 1),
        phase: "fly",
        foot: true,
      });
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
    return;
  }

  if (weapon.id === "irain") {
    if (inst.irainState) {
      const r = inst.irainState;
      r.t += dt;
      const shouldHave = Math.min(r.bones, Math.floor((r.t / r.dur) * r.bones));
      const dmg = weaponDmg(player, tier.dmgMult);
      while (r.spawned < shouldHave) {
        r.spawned += 1;
        const a = Math.random() * Math.PI * 2;
        const rr = 60 + Math.random() * 280;
        world.spawnSpike({
          x: player.x + Math.cos(a) * rr,
          y: Math.min(Math.max(player.y + Math.sin(a) * rr, world.bounds.top), world.bounds.bottom),
          dmg,
          delay: 0.3,
          fall: true, // 从天而降
          boneSize: Math.round(22 * r.sizeMult),
          color: "#a01822",
        });
      }
      if (r.t >= r.dur) {
        inst.irainState = null;
        inst.cooldown = 1 / (player.fireRate * tier.rateMult);
      }
      return;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    if (!findNearestEnemy(player.x, player.y, effRange + 240, enemies)) return;
    inst.irainState = {
      t: 0,
      dur: tier.duration,
      bones: tier.bones,
      spawned: 0,
      sizeMult: inst.enhance > 0 ? 2 + 0.2 * (inst.enhance - 1) : 1,
    };
    return;
  }

  if (weapon.id === "ispike") {
    // 已排程的分裂骨刺
    if (inst.ipending.length) {
      const later = [];
      for (const s of inst.ipending) {
        s.t -= dt;
        if (s.t <= 0) {
          world.spawnSpike(s.opts);
        } else later.push(s);
      }
      inst.ipending = later;
    }
    if (inst.cooldown > 0) {
      inst.cooldown -= dt;
      return;
    }
    const targets = enemies
      .filter((e) => Math.hypot(e.x - player.x, e.y - player.y) < effRange + 170)
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))
      .slice(0, tier.targets);
    if (!targets.length) return;
    const dmg = weaponDmg(player, tier.dmgMult);
    const mainBlastR = 48;
    for (const t of targets) {
      world.spawnSpike({
        x: t.x,
        y: t.y,
        dmg,
        delay: 0.14,
        color: "#ff5d73",
        blast: { radius: mainBlastR, dmg: dmg * 0.7, color: "#ff5d73" }, // 命中后爆炸
      });
      // 分裂成小骨刺(强化: 命中追加小爆,上限=主爆)
      const childBlast =
        inst.enhance > 0
          ? { radius: Math.min(30 + 10 * (inst.enhance - 1), mainBlastR), dmg: dmg * 0.4, color: "#ff5d73" }
          : null;
      for (let i = 0; i < tier.splits; i++) {
        const a = (i / tier.splits) * Math.PI * 2 + Math.random() * 0.6;
        const rr = 34 + Math.random() * 30;
        inst.ipending.push({
          t: 0.34 + Math.random() * 0.12,
          opts: {
            x: t.x + Math.cos(a) * rr,
            y: Math.min(Math.max(t.y + Math.sin(a) * rr, world.bounds.top), world.bounds.bottom),
            dmg: dmg * 0.5,
            delay: 0.12,
            boneSize: 14,
            color: "#ff5d73",
            ...(childBlast ? { blast: childBlast } : {}),
          },
        });
      }
    }
    inst.cooldown = 1 / (player.fireRate * tier.rateMult);
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
    // 阵地最大半径(2026-07-13 用户点名): 圈数×45px+射程无上限时,
    // 后期红骨阵铺满全屏闪眼——半径封顶,超出的外圈折回顶在上限处,
    // 骨头根数与伤害不变,只约束覆盖范围
    const FIELD_MAX = 260;
    const ringR = Math.min(tier.ring + Math.max(0, effRange - 130), effRange, FIELD_MAX);
    // enhancement: +2 extra rings (then +1 per stack), expanding outward
    const rings = 1 + (inst.enhance > 0 ? 2 + (inst.enhance - 1) : 0);
    for (let k = 0; k < rings; k++) {
      const rr = Math.min(ringR + k * 45, FIELD_MAX);
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
  player.macroBoost = 1; // 黑客宏窗口内由 hmacro 分支重设
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
