// 在线排行榜客户端:API 通信 + 全屏榜单界面。
// 后端见 server/app.mjs(Codex 部署);排行榜只在 sansgecao.com 域名激活,
// GitHub Pages 镜像不发任何请求。UI 约定与全游戏一致:深色卡片+彩边+等宽字。
import { backButtonRect, drawBackButton } from "./ui.js";

const API = "https://api.sansgecao.com/v1";
// names must mirror weapon.js CHARACTERS — the board and the game must agree
const CHARACTER_NAMES = { sans: "传说之下", ukb: "因果报应", horror: "恐惧传说", hard: "困难模式" };
const CHARACTER_COLORS = { sans: "#7ea8ff", ukb: "#c59bff", horror: "#ff5d5d", hard: "#5db9ff" };
const DIFF_NAMES = ["普通", "狂暴", "地狱", "屠杀"];
const DIFF_COLORS = ["#c8c2d4", "#ff8a5d", "#ff5d73", "#c59bff"];
const MODES = [
  { id: "normal", label: "普通榜", hint: "Boss 通关分 · 按分数排序" },
  { id: "endless", label: "无尽榜", hint: "完成轮数优先 · 同轮比无尽分" },
  { id: "daily", label: "每日榜", hint: "今日同一种子 · 每天 0 点重开" },
];
const CHAR_FILTERS = [null, "sans", "ukb", "horror", "hard"];

export const leaderboardOnline = typeof location !== "undefined" && /(^|\.)sansgecao\.com$/.test(location.hostname || "");
let me = null, run = null, timer = null, result = "", rows = [], mode = "normal", character = "", boardDate = "";
let loading = false, error = "", difficulty = "", myRank = null;
const DIFF_FILTERS = ["", "0", "1", "2", "3"]; // 全部 + 四难度(账号榜按难度拆看)

async function call(path, options = {}) {
  const r = await fetch(API + path, { credentials: "include", ...options, headers: { "content-type": "application/json", ...(options.headers || {}) } });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "网络错误");
  return data;
}

export async function initLeaderboard() {
  if (!leaderboardOnline) return;
  try {
    me = (await call("/me")).player;
  } catch (e) {
    error = e.message;
  }
}

export function leaderboardProfile() {
  return me;
}

export async function renameLeaderboard() {
  if (!leaderboardOnline || !me) return;
  if (me.canRenameAt && Date.now() < me.canRenameAt) {
    result = `改名冷却中:还需 ${Math.ceil((me.canRenameAt - Date.now()) / 86400000)} 天`;
    return;
  }
  const name = prompt("输入新昵称(2-8字;7天内只能改一次)\n⚠ 不要使用真实姓名、QQ、微信等个人信息", me?.nickname || "");
  if (!name) return;
  try {
    me = (await call("/me/name", { method: "POST", body: JSON.stringify({ nickname: name }) })).player;
    result = "改名成功";
    loadLeaderboard(); // rows carry nicknames — refresh so the board agrees
  } catch (e) {
    result = e.message;
  }
}

export async function loadLeaderboard(nextMode = mode, nextChar = character, nextDiff = difficulty) {
  mode = nextMode;
  character = nextChar;
  difficulty = mode === "daily" ? "" : nextDiff; // daily is one fixed difficulty
  loading = true;
  error = "";
  try {
    const data = await call(
      `/leaderboard?mode=${mode}${character ? `&character=${character}` : ""}${difficulty !== "" ? `&difficulty=${difficulty}` : ""}`
    );
    rows = data.rows;
    boardDate = data.date || "";
    myRank = data.me || null; // old server: absent — degrade gracefully
  } catch (e) {
    error = e.message;
    rows = [];
    myRank = null;
  } finally {
    loading = false;
  }
}

// one server run per game: applyChoice fires this every card, so the guard
// keeps the first registration (its started_at anchors the anti-cheat clock)
export async function beginRankedRun(data, getStats) {
  if (!leaderboardOnline || data.debug || run) return;
  try {
    run = await call("/runs", { method: "POST", body: JSON.stringify(data) });
    clearInterval(timer);
    timer = setInterval(() => checkpointRankedRun(getStats), 30000);
  } catch {
    run = null;
  }
}

// abandoned runs (death before the boss, back to title) never settle — drop
// the handle so the next game can register cleanly
export function cancelRankedRun() {
  clearInterval(timer);
  timer = null;
  run = null;
}

export async function checkpointRankedRun(getStats) {
  if (!run) return;
  try {
    await call(`/runs/${run.runId}/checkpoint`, { method: "POST", body: JSON.stringify({ ...getStats(), token: run.token }) });
  } catch {}
}

export async function finishRankedRun(data) {
  if (!run) return;
  clearInterval(timer);
  try {
    const x = await call(`/runs/${run.runId}/settle`, { method: "POST", body: JSON.stringify({ ...data, token: run.token }) });
    result = `你的最近成绩:全球第 ${x.rank} 名 · ${x.score} 分`;
  } catch (e) {
    result = e.message;
  } finally {
    run = null;
  }
}

// ---- layout ----------------------------------------------------------------

function tabRect(i, w) {
  return { x: w / 2 - 198 + i * 136, y: 96, w: 124, h: 34 };
}
function charChipRect(i, w) {
  return { x: w / 2 - 235 + i * 96, y: 138, w: 88, h: 28 };
}
function diffChipRect(i, w) {
  return { x: w / 2 - 195 + i * 80, y: 172, w: 72, h: 28 };
}
function renameRect(w) {
  return { x: w / 2 + 128, y: 58, w: 88, h: 28 };
}
function retryRect(w, h) {
  return { x: w / 2 - 70, y: h / 2 + 24, w: 140, h: 40 };
}
// touch slop mirrors main.js inRect: phone scale shrinks these controls hard
const inRect = (x, y, r) => x >= r.x - 8 && x <= r.x + r.w + 8 && y >= r.y - 4 && y <= r.y + r.h + 4;

function button(ctx, r, label, color, active = false) {
  ctx.fillStyle = active ? "#2e2748" : "#1d1828";
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = active ? color : "#3a2f4a";
  ctx.lineWidth = active ? 2.5 : 1.5;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = active ? color : "#9a93ab";
  ctx.font = `bold ${r.h >= 34 ? 15 : 12}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 5);
}

export function drawLeaderboard(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = "#0a0810";
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px monospace";
  ctx.fillText("审 判 排 行 榜", w / 2, 40);

  if (!leaderboardOnline) {
    ctx.fillStyle = "#c8c2d4";
    ctx.font = "bold 16px monospace";
    ctx.fillText("* 排行榜在正式服开放:sansgecao.com", w / 2, h / 2 - 20);
    ctx.fillStyle = "#7d7690";
    ctx.font = "13px monospace";
    ctx.fillText("(当前是镜像版,成绩不联网。)", w / 2, h / 2 + 8);
    drawBackButton(ctx, w, h);
    ctx.restore();
    ctx.textAlign = "left";
    return;
  }

  // identity bar: who you are + a visible, honest rename button
  ctx.fillStyle = "#8fd6ff";
  ctx.font = "bold 15px monospace";
  ctx.fillText(`你是:${me?.nickname || "游客身份连接中……"}`, w / 2 - 40, 77);
  if (me) {
    const cooling = me.canRenameAt && Date.now() < me.canRenameAt;
    button(ctx, renameRect(w), cooling ? "冷却中" : "✎ 改名", cooling ? "#7d7690" : "#8fd6ff", !cooling);
  }

  // three explicit board tabs — what you're on is never a mystery
  MODES.forEach((m, i) => button(ctx, tabRect(i, w), m.label, "#ffd166", m.id === mode));
  ctx.fillStyle = "#7d7690";
  ctx.font = "12px monospace";
  const modeInfo = MODES.find((m) => m.id === mode);
  ctx.fillText(`${modeInfo.hint}${mode === "daily" && boardDate ? ` · ${boardDate}` : ""}`, w / 2, 216);

  // character filter chips
  CHAR_FILTERS.forEach((c, i) =>
    button(ctx, charChipRect(i, w), c ? CHARACTER_NAMES[c] : "全部", c ? CHARACTER_COLORS[c] : "#f2ead8", (c || "") === character)
  );
  // difficulty filter chips (daily is one fixed difficulty — no chips there)
  if (mode !== "daily") {
    DIFF_FILTERS.forEach((d, i) =>
      button(ctx, diffChipRect(i, w), d === "" ? "全难度" : DIFF_NAMES[+d], d === "" ? "#f2ead8" : DIFF_COLORS[+d], d === difficulty)
    );
  }

  // board body
  const top = 232;
  if (loading) {
    ctx.fillStyle = "#9a93ab";
    ctx.font = "bold 14px monospace";
    ctx.fillText("* 正在连线裂缝外……", w / 2, h / 2);
  } else if (error) {
    ctx.fillStyle = "#ff8a5d";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`* 连接失败:${error}`, w / 2, h / 2 - 16);
    button(ctx, retryRect(w, h), "↻ 重试", "#8fd6ff", true);
  } else if (!rows.length) {
    ctx.fillStyle = "#9a93ab";
    ctx.font = "bold 14px monospace";
    ctx.fillText("* 这个榜还空着。", w / 2, h / 2 - 16);
    ctx.font = "13px monospace";
    ctx.fillText("第一个登上审判台的人,会被记住很久。", w / 2, h / 2 + 10);
  } else {
    const cx = w / 2;
    ctx.font = "11px monospace";
    ctx.fillStyle = "#5a5468";
    ctx.textAlign = "left";
    ctx.fillText("名次  昵称", cx - 320, top);
    ctx.fillText("角色", cx + 60, top);
    ctx.fillText("难度", cx + 170, top);
    ctx.textAlign = "right";
    ctx.fillText(mode === "endless" ? "轮数 · 无尽分" : "分数", cx + 320, top);
    const medals = ["#ffd166", "#c9d4e0", "#cd9a62"];
    rows.slice(0, 10).forEach((r, i) => {
      const y = top + 22 + i * 26;
      const mine = me && r.nickname === me.nickname;
      if (mine) {
        ctx.fillStyle = "rgba(143, 214, 255, 0.10)"; // your row glows faintly
        ctx.fillRect(cx - 332, y - 17, 664, 24);
      }
      ctx.textAlign = "left";
      ctx.fillStyle = medals[i] || "#7d7690";
      ctx.font = i < 3 ? "bold 15px monospace" : "13px monospace";
      ctx.fillText(String(i + 1), cx - 320, y);
      ctx.fillStyle = mine ? "#8fd6ff" : i < 3 ? "#f2ead8" : "#c8c2d4";
      ctx.font = i < 3 ? "bold 14px monospace" : "13px monospace";
      ctx.fillText(r.nickname, cx - 272, y);
      ctx.fillStyle = CHARACTER_COLORS[r.character] || "#9a93ab";
      ctx.font = "12px monospace";
      ctx.fillText(CHARACTER_NAMES[r.character] || r.character, cx + 60, y);
      ctx.fillStyle = DIFF_COLORS[r.difficulty] || "#c8c2d4";
      ctx.fillText(DIFF_NAMES[r.difficulty] ?? `难度${r.difficulty}`, cx + 170, y);
      ctx.textAlign = "right";
      ctx.fillStyle = mine ? "#8fd6ff" : "#ffd166";
      ctx.font = i < 3 ? "bold 14px monospace" : "13px monospace";
      ctx.fillText(mode === "endless" ? `${r.rounds} 轮 · ${r.score}` : String(r.score), cx + 320, y);
    });
  }

  // 你的名次: visible even when you're nowhere near the top ten — a board
  // you never appear on is a board that isn't about you
  if (myRank && !loading && !error) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#8fd6ff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(
      `你:第 ${myRank.rank} 名 · ${mode === "endless" ? `${myRank.rounds} 轮 · ` : ""}${myRank.score} 分`,
      w / 2,
      h - 96
    );
  }
  // footer: your latest settle result / status line
  if (result) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#7cf28a";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`* ${result}`, w / 2, h - 76);
  }
  drawBackButton(ctx, w, h);
  ctx.restore();
  ctx.textAlign = "left";
}

// returns "back" to leave, "stay" otherwise — main owns the state machine
export function leaderboardTap(x, y, w, h) {
  if (inRect(x, y, backButtonRect(w, h))) return "back";
  if (!leaderboardOnline) return "stay";
  for (let i = 0; i < MODES.length; i++) {
    if (inRect(x, y, tabRect(i, w))) {
      if (MODES[i].id !== mode) loadLeaderboard(MODES[i].id, character);
      return "stay";
    }
  }
  for (let i = 0; i < CHAR_FILTERS.length; i++) {
    if (inRect(x, y, charChipRect(i, w))) {
      loadLeaderboard(mode, CHAR_FILTERS[i] || "");
      return "stay";
    }
  }
  if (mode !== "daily") {
    for (let i = 0; i < DIFF_FILTERS.length; i++) {
      if (inRect(x, y, diffChipRect(i, w))) {
        loadLeaderboard(mode, character, DIFF_FILTERS[i]);
        return "stay";
      }
    }
  }
  if (me && inRect(x, y, renameRect(w))) {
    renameLeaderboard();
    return "stay";
  }
  if (error && inRect(x, y, retryRect(w, h))) {
    loadLeaderboard();
    return "stay";
  }
  return "stay";
}
