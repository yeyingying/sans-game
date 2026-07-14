import crypto from "node:crypto";

// Keep the season tag for analytics and future ruleset resets. During early
// access the public board aggregates all non-legacy seasons: splitting a very
// small player pool made the board look broken immediately after S2 launched.
export const SEASON = "s2";
const VALID_CHARACTERS = new Set(["sans", "ukb", "horror", "hard", "insanity", "hacker"]);
export const isValidCharacter = (character) => VALID_CHARACTERS.has(character);

// mirrors the client's DIFFICULTIES.scoreMult exactly — the board must show
// the same number the player saw in-game (boards are difficulty-filterable
// since s1, so the multiplier is display fidelity, not fairness policy)
export const SCORE_MULT = { 0: 1, 1: 1.8, 2: 3.0, 3: 4.5 };
const BLOCKED = /(官方|管理员|客服|系统|站长|微信|薇信|vx|v信|qq|企鹅|电话|手机|邮箱|@|操你|草你|傻[逼屌]|妈的|死全家)/i;
const A = ["决心", "骨感", "审判", "地底", "瀑布", "热域", "羊爸", "羊妈", "小花", "帕派", "衫斯", "福福", "猹", "狗剩", "六魂", "番茄"];
const B = ["摆烂", "摸鱼", "速通", "重开", "吃派", "躺平", "迷路", "加班", "卖萌", "挨打", "逃课", "存档", "读档", "骨折"];
const C = ["怪", "王", "魂", "人", "侠", "狗", "花", "骨", "星", "派", "厨", "神"];
export function randomNickname(random = Math.random) {
  const nick = A[Math.floor(random() * A.length)] + B[Math.floor(random() * B.length)] + (random() < 0.75 ? C[Math.floor(random() * C.length)] : "");
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
export const scoreEntryRunId=(runId,mode)=>`${runId}:${mode}`;
export function settlementScoreEntries({runId,mode,totalScore,stageScore,rounds=0}){
  if(mode==="endless")return [
    {runId:scoreEntryRunId(runId,"normal"),mode:"normal",score:stageScore,rounds:0},
    {runId:scoreEntryRunId(runId,"endless"),mode:"endless",score:Math.max(0,totalScore-stageScore),rounds}
  ];
  const boardMode=mode==="daily"?"daily":"normal";
  return [{runId:scoreEntryRunId(runId,boardMode),mode:boardMode,score:stageScore,rounds:0}];
}
export function legacyEndlessStageScore({report,endlessScore,difficulty,silence}){
  let stats;
  try{stats=typeof report==="string"?JSON.parse(report):report}catch{return null}
  const kills=Number(stats?.kills),elapsed=Number(stats?.elapsed),endless=Number(endlessScore);
  if(!stats?.bossDefeated||![kills,elapsed,endless].every(Number.isFinite))return null;
  const stage=expectedScore({kills,elapsed,difficulty,silence})-endless;
  return Number.isInteger(stage)&&stage>=0?stage:null;
}
// Broad plausibility guard, not a balance cap. Legitimate area weapons can
// remove large spawn packs in one frame and the Boss grants 50 kills, so the
// old 12 kills/s limit rejected real clears. Checkpoint monotonicity and score
// recomputation remain the primary protections.
export function runProgressError({ elapsed, kills, rounds, lastElapsed, lastKills, lastRounds, wallElapsed }) {
  if (![elapsed, kills, rounds].every(Number.isFinite)) return "nonfinite";
  if (elapsed < lastElapsed || kills < lastKills || rounds < lastRounds) return "rollback";
  if (kills > elapsed * 30 + 100) return "kills";
  if (rounds > Math.floor(Math.max(0, elapsed - 300) / 70) + 1) return "rounds";
  if (elapsed > wallElapsed * 3.25 + 30) return "time";
  return "";
}
export function signToken(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}
export function dailyKey(now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
