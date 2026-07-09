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
    label: "+ATK",
    color: "#ff6b6b",
    sprite: PICKUP_ATK,
    weight: 30,
    apply(player) {
      player.atk += 2;
    },
  },
  {
    id: "range",
    label: "+RANGE",
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
    label: "+SPEED",
    color: "#7cf28a",
    sprite: PICKUP_RAPID,
    weight: 22,
    apply(player) {
      player.fireRate += 0.1;
    },
  },
  {
    id: "boots",
    label: "+MOVE",
    color: "#8fd6ff",
    sprite: PICKUP_SPEED,
    weight: 16,
    apply(player) {
      player.moveSpeed += 10;
    },
  },
  {
    id: "heart",
    label: "+HP",
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
    label: "WEAPON UP!",
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
