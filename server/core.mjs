import crypto from "node:crypto";

export const SCORE_MULT = { 0: 1, 1: 1.25, 2: 1.55, 3: 2 };
const BLOCKED = /(官方|管理员|客服|系统|站长|微信|薇信|vx|v信|qq|企鹅|电话|手机|邮箱|@|操你|草你|傻[逼屌]|妈的|死全家)/i;
const A = ["决心", "骨感", "审判", "地底", "瀑布", "热域", "羊爸", "羊妈", "小花", "帕派", "衫斯", "福福", "猹", "狗剩", "六魂", "番茄"];
const B = ["摆烂", "摸鱼", "速通", "重开", "吃派", "躺平", "迷路", "加班", "卖萌", "挨打", "逃课", "存档", "读档", "骨折"];
export function randomNickname(random = Math.random) {
  const nick = A[Math.floor(random() * A.length)] + B[Math.floor(random() * B.length)];
  return [...nick].slice(0, 6).join("");
}
export function validateNickname(name) {
  const n = String(name || "").normalize("NFKC").trim();
  const len = [...n].length;
  if (len < 2 || len > 8) throw Object.assign(new Error("昵称须为 2-8 个字"), { status: 400 });
  if (BLOCKED.test(n) || /\d{5,}/.test(n) || /https?:|[a-z0-9_.-]+\.(com|cn|net)/i.test(n)) throw Object.assign(new Error("这个昵称不能使用"), { status: 400 });
  return n;
}
export function expectedScore({ kills, elapsed, difficulty, silence }) {
  const mult = SCORE_MULT[difficulty];
  if (!mult) throw Object.assign(new Error("无效难度"), { status: 400 });
  return Math.floor((kills * 5 + Math.floor(elapsed) * 2.5) * mult * (silence ? 1.35 : 1));
}
export function signToken(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}
