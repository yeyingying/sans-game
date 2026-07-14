import {
  PICKUP_ATK,
  PICKUP_RANGE,
  PICKUP_RAPID,
  PICKUP_SPEED,
  PICKUP_HEART,
  PICKUP_CORE,
} from "./sprites.js";
import { pickWeighted } from "./utils.js";

// Equipment drops: picked up instantly, no inventory UI, they just buff the
// player's stats in place. "core" drops upgrade the weapon tier itself.
export const EQUIPMENT_TYPES = [
  {
    id: "atk",
    label: "攻击 +2",
    labelEn: "ATK +2",
    color: "#ff6b6b",
    sprite: PICKUP_ATK,
    weight: 30,
    apply(player) {
      player.atk += 2;
    },
  },
  {
    id: "range",
    label: "射程+12 弹速+18",
    labelEn: "Range +12 · Shot speed +18",
    color: "#ffd166",
    sprite: PICKUP_RANGE,
    weight: 24,
    apply(player) {
      player.range += 12;
      player.projectileSpeed += 18;
    },
  },
  {
    id: "rapid",
    label: "攻速 +0.1",
    labelEn: "Attack rate +0.1",
    color: "#7cf28a",
    sprite: PICKUP_RAPID,
    weight: 22,
    apply(player) {
      player.fireRate += 0.1;
    },
  },
  {
    id: "boots",
    label: "移速 +10",
    labelEn: "Move speed +10",
    color: "#8fd6ff",
    sprite: PICKUP_SPEED,
    weight: 16,
    apply(player) {
      player.moveSpeed += 10;
    },
  },
  {
    id: "heart",
    label: "生命上限 +12",
    labelEn: "Max HP +12",
    color: "#ff8fc7",
    sprite: PICKUP_HEART,
    weight: 20,
    apply(player) {
      player.maxHp += 12;
      player.hp = Math.min(player.maxHp, player.hp + 12);
    },
  },
  {
    id: "core",
    label: "随机武器品阶 +1",
    labelEn: "Random weapon tier +1",
    color: "#7ea8ff",
    sprite: PICKUP_CORE,
    weight: 2, // rarer than before (was 6)
    apply(player) {
      // upgrade a random weapon that still has room to level up
      const upgradable = player.weapons.filter((w) => w.tier < 4);
      if (upgradable.length) {
        upgradable[Math.floor(Math.random() * upgradable.length)].tier += 1;
      } else {
        player.atk += 3; // all weapons maxed: fall back to a small atk boost
      }
    },
  },
];

export function rollEquipmentDrop() {
  return pickWeighted(EQUIPMENT_TYPES.map((t) => ({ weight: t.weight, value: t })));
}
