// 在线排行榜客户端:API 通信 + 全屏榜单界面。
// 后端见 server/app.mjs(Codex 部署);排行榜只在 sansgecao.com 域名激活,
// GitHub Pages 镜像不发任何请求。UI 约定与全游戏一致:深色卡片+彩边+等宽字。
import { backButtonRect, drawBackButton } from "./ui.js";
import { utPrompt } from "./dialog.js";
import { ICONS, drawIconLabel } from "./sprites.js";

const API = "https://api.sansgecao.com/v1";
// names must mirror weapon.js CHARACTERS — the board and the game must agree
const CHARACTER_NAMES = { sans: "传说之下", ukb: "因果报应", horror: "恐惧传说", hard: "困难模式", insanity: "Insanity", hacker: "黑客结局" };
const CHARACTER_COLORS = { sans: "#7ea8ff", ukb: "#c59bff", horror: "#ff5d5d", hard: "#5db9ff", insanity: "#d92535", hacker: "#e8ecf4" };
const DIFF_NAMES = ["普通", "狂暴", "地狱", "屠杀"];
const DIFF_COLORS = ["#c8c2d4", "#ff8a5d", "#ff5d73", "#c59bff"];
// 三个榜衡量三种实力,明说,不假装是同一种(2026-07-12 评审)
const MODES = [
  { id: "normal", label: "通关榜", hint: "养成榜:局外强化与构筑成果一起算数", mobileHint: "比较通关分，包含局外成长" },
  { id: "endless", label: "无尽榜", hint: "后期构筑与生存能力 · 轮数优先", mobileHint: "先比完成轮数，再比无尽分" },
  { id: "daily", label: "每日榜", hint: "全员同一起跑线 · 禁局外强化 · 纯竞技", mobileHint: "固定条件，所有人同一起点" },
];
const CHAR_FILTERS = [null, "sans", "ukb", "horror", "hard", "insanity", "hacker"];

export const leaderboardOnline =
  typeof location !== "undefined" &&
  (/(^|\.)sansgecao\.com$/.test(location.hostname || "") || /[?&]lb=1/.test(location.search || "")); // ?lb=1: 本地调试榜单布局(请求会失败,只看排版)
let me = null, run = null, timer = null, retryTimer = null, result = "", rows = [], mode = "normal", character = "", boardDate = "";
let loading = false, error = "", difficulty = "", myRank = null;
let identityPromise = null, registrationPromise = null, registrationData = null, registrationStats = null, runGeneration = 0;
let checkpointFailures = 0;
let rankedStatus = {
  phase: leaderboardOnline ? "idle" : "offline",
  message: leaderboardOnline ? "尚未开局" : "当前版本不连接排行榜",
  rank: null,
  score: null,
};
const DIFF_FILTERS = ["", "0", "1", "2", "3"]; // 全部 + 四难度(账号榜按难度拆看)

async function call(path, options = {}) {
  const r = await fetch(API + path, { credentials: "include", ...options, headers: { "content-type": "application/json", ...(options.headers || {}) } });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "网络错误");
  return data;
}

async function ensureIdentity() {
  if (!leaderboardOnline) return null;
  if (me) return me;
  if (identityPromise) return identityPromise;
  identityPromise = call("/me")
    .then((data) => {
      me = data.player;
      return me;
    })
    .finally(() => {
      identityPromise = null;
    });
  return identityPromise;
}

export async function initLeaderboard() {
  if (!leaderboardOnline) return;
  try {
    await ensureIdentity();
  } catch (e) {
    error = e.message;
  }
}

export function leaderboardProfile() {
  return me;
}

export function rankedRunStatus() {
  return { ...rankedStatus };
}


export async function renameLeaderboard() {
  if (!leaderboardOnline || !me) return;
  if (me.canRenameAt && Date.now() < me.canRenameAt) {
    result = `改名冷却中:还需 ${Math.ceil((me.canRenameAt - Date.now()) / 86400000)} 天`;
    return;
  }
  const name = await utPrompt({
    title: "* 26说:",
    hint: "输入新昵称(2-8字;7天内只能改一次)\n⚠ 不要使用真实姓名、QQ、微信等个人信息",
    value: me?.nickname || "",
  });
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
    // Mobile Safari can open the board before the boot-time identity request
    // finishes. Always establish the anonymous session here as well, otherwise
    // the first leaderboard request races into a 401 and renders an empty page.
    await ensureIdentity();
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

function scheduleRegistrationRetry(generation) {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    if (generation === runGeneration && registrationData && !run) {
      beginRankedRun(registrationData, registrationStats);
    }
  }, 5000);
}

// One server run per game, requested at the actual start of play. Identity is
// ensured here as well as at page boot: a transient /me failure must never
// silently turn a full clear into a local-only score.
export async function beginRankedRun(data, getStats) {
  if (!leaderboardOnline) return false;
  if (data.debug) {
    rankedStatus = { phase: "disabled", message: "测试入口不上传成绩", rank: null, score: null };
    return false;
  }
  registrationData = data;
  registrationStats = getStats;
  if (run) return true;
  if (registrationPromise) return registrationPromise;
  const generation = runGeneration;
  rankedStatus = { phase: "connecting", message: "正在连接全球排行榜…", rank: null, score: null };
  const attempt = (async () => {
    try {
      await ensureIdentity();
      const created = await call("/runs", { method: "POST", body: JSON.stringify(data) });
      if (generation !== runGeneration) return false;
      run = created;
      checkpointFailures = 0;
      clearTimeout(retryTimer);
      clearInterval(timer);
      timer = setInterval(() => checkpointRankedRun(getStats), 30000);
      rankedStatus = { phase: "active", message: "本局已进入全球排行榜", rank: null, score: null };
      return true;
    } catch (e) {
      if (generation === runGeneration) {
        run = null;
        rankedStatus = { phase: "retrying", message: `排行榜重连中：${e.message}`, rank: null, score: null };
        scheduleRegistrationRetry(generation);
      }
      return false;
    }
  })();
  registrationPromise = attempt;
  try {
    return await attempt;
  } finally {
    if (registrationPromise === attempt) registrationPromise = null;
  }
}

// abandoned runs (death before the boss, back to title) never settle — drop
// the handle so the next game can register cleanly
export function cancelRankedRun() {
  clearInterval(timer);
  clearTimeout(retryTimer);
  timer = null;
  retryTimer = null;
  run = null;
  registrationPromise = null;
  registrationData = null;
  registrationStats = null;
  runGeneration += 1;
  if (rankedStatus.phase !== "disabled") {
    rankedStatus = {
      phase: leaderboardOnline ? "idle" : "offline",
      message: leaderboardOnline ? "尚未开局" : "当前版本不连接排行榜",
      rank: null,
      score: null,
    };
  }
}

// 匿名 run 汇总: one whitelisted stats blob per run (win OR loss), fired at
// settlement before the run handle is settled/cancelled. No PII, no替文本.
export async function reportRankedRun(stats) {
  if (!run) return;
  try {
    await call(`/runs/${run.runId}/report`, { method: "POST", body: JSON.stringify({ token: run.token, stats }) });
  } catch {}
}

export async function checkpointRankedRun(getStats) {
  if (!run) return;
  try {
    await call(`/runs/${run.runId}/checkpoint`, { method: "POST", body: JSON.stringify({ ...getStats(), token: run.token }) });
    checkpointFailures = 0;
    rankedStatus = { phase: "active", message: "本局已进入全球排行榜", rank: null, score: null };
  } catch (e) {
    checkpointFailures += 1;
    rankedStatus = {
      phase: "warning",
      message: `检查点重试中(${checkpointFailures})：${e.message}`,
      rank: null,
      score: null,
    };
  }
}

export async function finishRankedRun(data) {
  clearTimeout(retryTimer);
  retryTimer = null;
  registrationData = null;
  registrationStats = null;
  if (!run) {
    const disabled = rankedStatus.phase === "disabled";
    rankedStatus = {
      phase: disabled ? "disabled" : "error",
      message: disabled ? rankedStatus.message : "未上榜：本局未连接到排行榜服务器",
      rank: null,
      score: null,
    };
    result = rankedStatus.message;
    return null;
  }
  clearInterval(timer);
  timer = null;
  rankedStatus = { phase: "settling", message: "正在校验并上传成绩…", rank: null, score: null };
  try {
    const x = await call(`/runs/${run.runId}/settle`, { method: "POST", body: JSON.stringify({ ...data, token: run.token }) });
    result = `你的最近成绩:全球第 ${x.rank} 名 · ${x.score} 分`;
    rankedStatus = { phase: "success", message: `全球第 ${x.rank} 名 · ${x.score} 分`, rank: x.rank, score: x.score };
    return x;
  } catch (e) {
    result = `未上榜：${e.message}`;
    rankedStatus = { phase: "error", message: result, rank: null, score: null };
    return null;
  } finally {
    run = null;
  }
}

// ---- layout -----------------------------------------------------------------
// 手机专版(2026-07-12 评审): phone canvas is 1080-1400 logical px shown on a
// ~390pt screen — desktop-sized controls land at ~20pt touch targets. Phone
// mode scales every control ~2×, folds the filter chips behind one toggle,
// and pins your own rank as a card. Desktop (960) keeps the dense layout.

const isPhone = (w) => w >= 1000;
let filtersOpen = false; // phone: chips fold behind the 筛选 toggle

function tabRect(i, w) {
  const m = isPhone(w) ? 2 : 1;
  const bw = 124 * m;
  const gap = 12 * m;
  const x0 = w / 2 - (3 * bw + 2 * gap) / 2;
  return { x: x0 + i * (bw + gap), y: isPhone(w) ? 104 : 96, w: bw, h: 34 * m };
}
function filterToggleRect(w) {
  const width = Math.min(620, w - 200);
  return { x: w / 2 - width / 2, y: 206, w: width, h: 48 }; // phone only(2026-07-14 拥挤专项下移)
}
function charChipRect(i, w) {
  const ph = isPhone(w);
  if (ph) {
    const cols = 4, gap = 12, total = Math.min(920, w - 140), cw = (total - gap * (cols - 1)) / cols;
    const x0 = w / 2 - total / 2;
    return { x: x0 + (i % cols) * (cw + gap), y: 284 + Math.floor(i / cols) * 54, w: cw, h: 44 };
  }
  const m = ph ? 1.75 : 1;
  const cw = 88 * m;
  const gap = 8 * m;
  const x0 = w / 2 - (CHAR_FILTERS.length * cw + (CHAR_FILTERS.length - 1) * gap) / 2;
  return { x: x0 + i * (cw + gap), y: ph ? 274 : 138, w: cw, h: 28 * m };
}
function diffChipRect(i, w) {
  const ph = isPhone(w);
  if (ph) {
    const cols = 5, gap = 12, total = Math.min(920, w - 140), cw = (total - gap * (cols - 1)) / cols;
    const x0 = w / 2 - total / 2;
    return { x: x0 + i * (cw + gap), y: 420, w: cw, h: 44 };
  }
  const m = ph ? 1.9 : 1;
  const cw = 72 * m;
  const gap = 8 * m;
  const x0 = w / 2 - (5 * cw + 4 * gap) / 2;
  return { x: x0 + i * (cw + gap), y: ph ? 338 : 172, w: cw, h: 28 * m };
}
function identityRect(w) {
  const width = isPhone(w) ? Math.min(640, w - 240) : 520;
  return { x: w / 2 - width / 2, y: 48, w: width, h: 44 };
}
function renameRect(w) {
  const ph = isPhone(w);
  if (ph) {
    const identity = identityRect(w);
    return { x: identity.x + identity.w - 126, y: identity.y, w: 126, h: identity.h };
  }
  return { x: w / 2 + 128, y: 58, w: 88, h: 28 };
}
function retryRect(w, h) {
  const m = isPhone(w) ? 1.6 : 1;
  return { x: w / 2 - 70 * m, y: h / 2 + 24, w: 140 * m, h: 40 * m };
}
function myCardRect(w, h) {
  if (isPhone(w)) {
    const width = Math.min(650, w - 360);
    return { x: w / 2 - width / 2, y: h - 62, w: width, h: 48 };
  }
  const m = 1;
  return { x: w / 2 - 230 * m, y: h - (isPhone(w) ? 132 : 114), w: 460 * m, h: 34 * (isPhone(w) ? 1.6 : 1) };
}
// touch slop mirrors main.js inRect: phone scale shrinks these controls hard
const inRect = (x, y, r) => x >= r.x - 8 && x <= r.x + r.w + 8 && y >= r.y - 4 && y <= r.y + r.h + 4;

function button(ctx, r, label, color, active = false, icon = null) {
  ctx.fillStyle = active ? "#2e2748" : "#1d1828";
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = active ? color : "#3a2f4a";
  ctx.lineWidth = active ? 3 : 1.5;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  if (active) {
    // selected state is more than a color: a filled tick corner
    ctx.fillStyle = color;
    ctx.fillRect(r.x, r.y, 8, 8);
  }
  ctx.fillStyle = active ? color : "#9a93ab";
  const fs = r.h >= 60 ? 24 : r.h >= 46 ? 19 : r.h >= 34 ? 15 : 12;
  ctx.font = `bold ${fs}px monospace`;
  ctx.textAlign = "center";
  if (icon) drawIconLabel(ctx, icon, label, r.x + r.w / 2, r.y + r.h / 2 + fs * 0.36, Math.min(18, fs), 5);
  else ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + fs * 0.36);
}

export function drawLeaderboard(ctx, w, h) {
  const ph = isPhone(w);
  const F = ph ? 1.55 : 1; // font scale
  ctx.save();
  ctx.fillStyle = "#0a0810";
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = `bold ${Math.round(30 * F)}px monospace`;
  ctx.fillText("审判排行榜", w / 2, ph ? 40 : 40);

  if (!leaderboardOnline) {
    ctx.fillStyle = "#c8c2d4";
    ctx.font = `bold ${Math.round(16 * F)}px monospace`;
    ctx.fillText("* 排行榜在正式服开放:sansgecao.com", w / 2, h / 2 - 20);
    ctx.fillStyle = "#7d7690";
    ctx.font = `${Math.round(13 * F)}px monospace`;
    ctx.fillText("(当前是镜像版,成绩不联网。)", w / 2, h / 2 + 12);
    drawBackButton(ctx, w, h);
    ctx.restore();
    ctx.textAlign = "left";
    return;
  }

  // identity bar: on phone this owns a full row, so nickname, title and tabs
  // never compete for the same narrow strip of vertical space.
  if (ph) {
    const identity = identityRect(w);
    ctx.fillStyle = "#121522";
    ctx.fillRect(identity.x, identity.y, identity.w, identity.h);
    ctx.strokeStyle = "#34475c";
    ctx.lineWidth = 2;
    ctx.strokeRect(identity.x, identity.y, identity.w, identity.h);
    ctx.fillStyle = "#8fd6ff";
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`昵称：${me?.nickname || "连接中……"}`, identity.x + 18, identity.y + 29);
    ctx.textAlign = "center";
  } else {
    ctx.fillStyle = "#8fd6ff";
    ctx.font = `bold ${Math.round(15 * F)}px monospace`;
    ctx.fillText(`你是:${me?.nickname || "游客身份连接中……"}`, w / 2 - 40, 77);
  }
  if (me) {
    const cooling = me.canRenameAt && Date.now() < me.canRenameAt;
    button(ctx, renameRect(w), cooling ? "冷却中" : "改名", cooling ? "#7d7690" : "#8fd6ff", !cooling, cooling ? null : ICONS.edit);
  }

  // three explicit board tabs — what you're on is never a mystery
  MODES.forEach((m2, i) => button(ctx, tabRect(i, w), m2.label, "#ffd166", m2.id === mode));

  // filters: desktop shows both chip rows; phone folds them behind a toggle
  let listTop;
  if (ph) {
    const fLabel = `筛选 · ${character ? CHARACTER_NAMES[character] : "全部角色"} · ${
      mode === "daily" ? "每日固定" : difficulty === "" ? "全难度" : DIFF_NAMES[+difficulty]
    } · ${loading ? "加载中" : `${rows.length}人`} ${filtersOpen ? "▴" : "▾"}`;
    // Phone gets a short, purpose-specific sentence. The desktop explanation
    // is too long once the 1200px canvas is scaled into a real phone viewport.
    ctx.fillStyle = "#7d7690";
    ctx.font = "18px monospace";
    const modeInfo = MODES.find((m2) => m2.id === mode);
    ctx.fillText(`${modeInfo.mobileHint}${mode === "daily" && boardDate ? ` · ${boardDate}` : ""}`, w / 2, 192);
    button(ctx, filterToggleRect(w), fLabel, "#c8c2d4", filtersOpen);
    if (filtersOpen) {
      const firstChar = charChipRect(0, w);
      ctx.textAlign = "left";
      ctx.fillStyle = "#9a93ab";
      ctx.font = "bold 18px monospace";
      ctx.fillText("选择角色", firstChar.x, 274);
      ctx.textAlign = "center";
      CHAR_FILTERS.forEach((c, i) =>
        button(ctx, charChipRect(i, w), c ? CHARACTER_NAMES[c] : "全部", c ? CHARACTER_COLORS[c] : "#f2ead8", (c || "") === character)
      );
      if (mode !== "daily") {
        const firstDiff = diffChipRect(0, w);
        ctx.textAlign = "left";
        ctx.fillStyle = "#9a93ab";
        ctx.font = "bold 18px monospace";
        ctx.fillText("选择难度", firstDiff.x, 410);
        ctx.textAlign = "center";
        DIFF_FILTERS.forEach((d, i) =>
          button(ctx, diffChipRect(i, w), d === "" ? "全难度" : DIFF_NAMES[+d], d === "" ? "#f2ead8" : DIFF_COLORS[+d], d === difficulty)
        );
      }
      ctx.fillStyle = "#7d7690";
      ctx.font = "16px monospace";
      ctx.fillText("选择后自动收起并刷新榜单", w / 2, mode === "daily" ? 402 : 492);
      drawBackButton(ctx, w, h);
      ctx.restore();
      ctx.textAlign = "left";
      return;
    } else {
      listTop = 270;
    }
  } else {
    CHAR_FILTERS.forEach((c, i) =>
      button(ctx, charChipRect(i, w), c ? CHARACTER_NAMES[c] : "全部", c ? CHARACTER_COLORS[c] : "#f2ead8", (c || "") === character)
    );
    if (mode !== "daily")
      DIFF_FILTERS.forEach((d, i) =>
        button(ctx, diffChipRect(i, w), d === "" ? "全难度" : DIFF_NAMES[+d], d === "" ? "#f2ead8" : DIFF_COLORS[+d], d === difficulty)
      );
    ctx.fillStyle = "#7d7690";
    ctx.font = "12px monospace";
    const modeInfo = MODES.find((m2) => m2.id === mode);
    ctx.fillText(`${modeInfo.hint}${mode === "daily" && boardDate ? ` · ${boardDate}` : ""}`, w / 2, 216);
    listTop = 232;
  }

  // board body
  const top = listTop;
  if (loading) {
    ctx.fillStyle = "#9a93ab";
    ctx.font = `bold ${Math.round(14 * F)}px monospace`;
    ctx.fillText("* 正在连线裂缝外……", w / 2, h / 2);
  } else if (error) {
    ctx.fillStyle = "#ff8a5d";
    ctx.font = `bold ${Math.round(14 * F)}px monospace`;
    ctx.fillText(`* 连接失败:${error}`, w / 2, h / 2 - 20);
    button(ctx, retryRect(w, h), "重试", "#8fd6ff", true, ICONS.refresh);
  } else if (!rows.length) {
    ctx.fillStyle = "#9a93ab";
    ctx.font = `bold ${Math.round(14 * F)}px monospace`;
    ctx.fillText(mode === "daily" ? "* 今天还没有挑战成绩" : "* 当前筛选还没有通关成绩", w / 2, h / 2 - 20);
    ctx.font = `${Math.round(13 * F)}px monospace`;
    ctx.fillText("点上方筛选查看其他榜，或击败一次 Boss 留名。", w / 2, h / 2 + 14);
  } else {
    const cx = w / 2;
    const rowH = ph ? 38 : 26;
    const maxRows = ph ? 6 : 10;
    const rankX = ph ? 72 : cx - 320;
    const nameX = ph ? 132 : cx - 272;
    const charX = ph ? w * 0.57 : cx + 60;
    const diffX = ph ? w * 0.73 : cx + 170;
    const scoreX = ph ? w - 70 : cx + 320;
    ctx.font = `${Math.round(11 * F)}px monospace`;
    ctx.fillStyle = "#5a5468";
    ctx.textAlign = "left";
    ctx.fillText("名次  昵称", rankX, top);
    ctx.fillText("角色", charX, top);
    drawIconLabel(ctx, ICONS.difficulty, "难度", diffX, top, Math.round(12 * F), 4);
    ctx.textAlign = "right";
    ctx.fillText(mode === "endless" ? "轮数 · 无尽分" : "分数", scoreX, top);
    const medals = ["#ffd166", "#c9d4e0", "#cd9a62"];
    rows.slice(0, maxRows).forEach((r, i) => {
      const y = top + rowH - 4 + i * rowH;
      const mine = me && r.nickname === me.nickname;
      if (mine) {
        ctx.fillStyle = "rgba(143, 214, 255, 0.10)"; // your row glows faintly
        ctx.fillRect(ph ? 56 : cx - 332, y - rowH * 0.65, ph ? w - 112 : 664, rowH - 2);
      }
      ctx.textAlign = "left";
      ctx.fillStyle = medals[i] || "#7d7690";
      ctx.font = i < 3 ? `bold ${Math.round(15 * F)}px monospace` : `${Math.round(13 * F)}px monospace`;
      ctx.fillText(String(i + 1), rankX, y);
      ctx.fillStyle = mine ? "#8fd6ff" : i < 3 ? "#f2ead8" : "#c8c2d4";
      ctx.font = i < 3 ? `bold ${Math.round(14 * F)}px monospace` : `${Math.round(13 * F)}px monospace`;
      ctx.fillText(r.nickname, nameX, y);
      ctx.fillStyle = CHARACTER_COLORS[r.character] || "#9a93ab";
      ctx.font = `${Math.round(12 * F)}px monospace`;
      ctx.fillText(CHARACTER_NAMES[r.character] || r.character, charX, y);
      ctx.fillStyle = DIFF_COLORS[r.difficulty] || "#c8c2d4";
      ctx.fillText(DIFF_NAMES[r.difficulty] ?? `难度${r.difficulty}`, diffX, y);
      ctx.textAlign = "right";
      ctx.fillStyle = mine ? "#8fd6ff" : "#ffd166";
      ctx.font = i < 3 ? `bold ${Math.round(14 * F)}px monospace` : `${Math.round(13 * F)}px monospace`;
      ctx.fillText(mode === "endless" ? `${r.rounds} 轮 · ${r.score}` : String(r.score), scoreX, y);
    });
  }

  // 你的名次: a PINNED CARD, visible even when you are nowhere near the top —
  // a board you never appear on is a board that isn't about you
  if (!loading && !error) {
    const r = myCardRect(w, h);
    ctx.fillStyle = "#0f1a26";
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = "#8fd6ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.textAlign = "center";
    ctx.fillStyle = "#8fd6ff";
    ctx.font = `bold ${Math.round(13 * F)}px monospace`;
    const text = myRank
      ? `你:第 ${myRank.rank} 名 · ${mode === "endless" ? `${myRank.rounds} 轮 · ` : ""}${myRank.score} 分`
      : "尚未上榜——击败一次 Boss 即可留名";
    if (myRank) drawIconLabel(ctx, ICONS.star, text, r.x + r.w / 2, r.y + r.h / 2 + 5 * F, Math.round(14 * F), 5);
    else ctx.fillText(text, r.x + r.w / 2, r.y + r.h / 2 + 5 * F);
  }
  // footer: your latest settle result / status line
  if (result) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#7cf28a";
    ctx.font = `bold ${Math.round(12 * F)}px monospace`;
    ctx.fillText(`* ${result}`, w / 2, h - (ph ? 76 : 130));
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
  const ph = isPhone(w);
  if (ph && inRect(x, y, filterToggleRect(w))) {
    filtersOpen = !filtersOpen;
    return "stay";
  }
  const chipsVisible = !ph || filtersOpen;
  if (chipsVisible) {
    for (let i = 0; i < CHAR_FILTERS.length; i++) {
      if (inRect(x, y, charChipRect(i, w))) {
        if (ph) filtersOpen = false;
        loadLeaderboard(mode, CHAR_FILTERS[i] || "");
        return "stay";
      }
    }
    if (mode !== "daily") {
      for (let i = 0; i < DIFF_FILTERS.length; i++) {
        if (inRect(x, y, diffChipRect(i, w))) {
          if (ph) filtersOpen = false;
          loadLeaderboard(mode, character, DIFF_FILTERS[i]);
          return "stay";
        }
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
