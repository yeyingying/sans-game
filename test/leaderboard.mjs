// Deterministic ranked-client test: a failed boot identity request must be
// retried at run start, and a successful settlement must expose the global
// rank to the game-over UI.
const universal = new Proxy(function () {}, {
  get: (target, prop) => (prop === Symbol.toPrimitive ? () => 0 : universal),
  apply: () => universal,
  set: () => true,
  construct: () => universal,
});

globalThis.document = {
  createElement: (tag) =>
    tag === "canvas"
      ? { width: 0, height: 0, getContext: () => universal }
      : { style: {}, append: () => {}, appendChild: () => {}, remove: () => {}, focus: () => {}, select: () => {} },
  body: { appendChild: () => {} },
};
globalThis.location = { hostname: "www.sansgecao.com", search: "" };

const calls = [];
let meAttempts = 0;
const reply = (ok, data, status = ok ? 200 : 503) => ({ ok, status, json: async () => data });
globalThis.fetch = async (url, options = {}) => {
  const path = new URL(url).pathname;
  calls.push({ path, method: options.method || "GET" });
  if (path === "/v1/me") {
    meAttempts += 1;
    if (meAttempts === 1) return reply(false, { error: "临时断线" });
    return reply(true, { player: { nickname: "审判测试骨", canRenameAt: 0 } });
  }
  if (path === "/v1/runs") return reply(true, { runId: "run-1", token: "token-1" }, 201);
  if (path === "/v1/runs/run-1/settle") return reply(true, { rank: 7, score: 12345 });
  throw new Error(`unexpected request ${path}`);
};

const ranked = await import(new URL("../src/leaderboard.js?deterministic-ranked-test", import.meta.url));
let failures = 0;
function check(name, condition) {
  if (condition) console.log(`  ok  ${name}`);
  else {
    failures += 1;
    console.log(`FAIL  ${name}`);
  }
}

await ranked.initLeaderboard();
check("boot identity failure is contained", ranked.leaderboardProfile() === null);

const started = await ranked.beginRankedRun(
  { character: "horror", difficulty: 0, silence: false, daily: false, debug: false },
  () => ({ elapsed: 0, kills: 0, rounds: 0 })
);
check("run start retries identity", started && meAttempts === 2);
check("run becomes globally active", ranked.rankedRunStatus().phase === "active");
check("server run is requested exactly once", calls.filter((x) => x.path === "/v1/runs").length === 1);

const settled = await ranked.finishRankedRun({
  mode: "normal",
  elapsed: 310,
  kills: 2000,
  rounds: 0,
  stageElapsed: 310,
  stageKills: 2000,
});
const status = ranked.rankedRunStatus();
check("settlement returns server rank", settled?.rank === 7 && settled?.score === 12345);
check("global rank is exposed to result UI", status.phase === "success" && status.rank === 7 && status.message.includes("全球第 7 名"));

const callCount = calls.length;
ranked.cancelRankedRun();
const debugStarted = await ranked.beginRankedRun(
  { character: "horror", difficulty: 0, silence: false, daily: false, debug: true },
  () => ({ elapsed: 0, kills: 0, rounds: 0 })
);
check("debug runs never contact ranking API", debugStarted === false && calls.length === callCount);
check("debug status is explicit", ranked.rankedRunStatus().phase === "disabled");
await ranked.finishRankedRun({ mode: "normal", elapsed: 0, kills: 0, rounds: 0, stageElapsed: 0, stageKills: 0 });
check("debug settlement stays disabled, not a red network error", ranked.rankedRunStatus().phase === "disabled");

if (failures) process.exitCode = 1;
else console.log("ranked client deterministic tests passed");
