import http from "node:http";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { SEASON, dailyKey, expectedScore, isValidCharacter, randomNickname, runProgressError, signToken, validateNickname } from "./core.mjs";
import { adminAuthorized, adminCookie, adminOverview, adminPage, clearAdminCookie, emptyGuestCutoff, emptyGuestWhere, passwordMatchesHash, uniqueNickname } from "./admin.mjs";
import { clientIp, requestNetwork } from "./geo.mjs";

const PORT=Number(process.env.PORT||3000), DB_PATH=process.env.DB_PATH||new URL("./leaderboard.sqlite",import.meta.url).pathname;
const SECRET=process.env.SESSION_SECRET||crypto.randomBytes(32).toString("hex");
// Prefer a one-way SHA-256 verifier so the plaintext admin password never
// needs to live in service configuration. Plaintext remains a migration-only
// fallback for older deployments.
const ADMIN_PASSWORD_HASH=(process.env.ADMIN_PASSWORD_SHA256||"").toLowerCase()||(
  process.env.ADMIN_PASSWORD?crypto.createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex"):""
);
const ORIGINS=new Set((process.env.ALLOWED_ORIGINS||"https://www.sansgecao.com,https://sansgecao.com").split(","));
const db=new DatabaseSync(DB_PATH);
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,nickname TEXT UNIQUE NOT NULL,renamed_at INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,player_id TEXT NOT NULL,token_hash TEXT NOT NULL,character TEXT NOT NULL,difficulty INTEGER NOT NULL,silence INTEGER NOT NULL,started_at INTEGER NOT NULL,last_at INTEGER NOT NULL,last_elapsed REAL NOT NULL DEFAULT 0,last_kills INTEGER NOT NULL DEFAULT 0,last_rounds INTEGER NOT NULL DEFAULT 0,checkpoints INTEGER NOT NULL DEFAULT 0,settled INTEGER NOT NULL DEFAULT 0,daily_key TEXT NOT NULL DEFAULT ''); CREATE TABLE IF NOT EXISTS scores(id INTEGER PRIMARY KEY,player_id TEXT NOT NULL,run_id TEXT UNIQUE NOT NULL,mode TEXT NOT NULL,character TEXT NOT NULL,difficulty INTEGER NOT NULL,score INTEGER NOT NULL,rounds INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,daily_key TEXT NOT NULL DEFAULT ''); CREATE INDEX IF NOT EXISTS score_board ON scores(mode,daily_key,rounds DESC,score DESC,created_at);`);
for(const [t,c,type] of [
 ["runs","daily_key","TEXT NOT NULL DEFAULT ''"],["scores","daily_key","TEXT NOT NULL DEFAULT ''"],["scores","season","TEXT NOT NULL DEFAULT ''"],["runs","report","TEXT NOT NULL DEFAULT ''"],
 ["scores","hidden","INTEGER NOT NULL DEFAULT 0"],
 ["players","is_test","INTEGER NOT NULL DEFAULT 0"],
 ["players","last_seen_at","INTEGER NOT NULL DEFAULT 0"],["players","last_ip_masked","TEXT NOT NULL DEFAULT ''"],["players","last_network_tag","TEXT NOT NULL DEFAULT ''"],["players","last_device","TEXT NOT NULL DEFAULT ''"],["players","last_region","TEXT NOT NULL DEFAULT ''"],["players","last_isp","TEXT NOT NULL DEFAULT ''"],
 ["runs","ip_masked","TEXT NOT NULL DEFAULT ''"],["runs","network_tag","TEXT NOT NULL DEFAULT ''"],["runs","device","TEXT NOT NULL DEFAULT ''"],["runs","region","TEXT NOT NULL DEFAULT ''"],["runs","isp","TEXT NOT NULL DEFAULT ''"]
])try{db.exec(`ALTER TABLE ${t} ADD COLUMN ${c} ${type}`)}catch{}
// season gate: '' = pre-season legacy rows (kept, never shown); the current
// value lives in core.mjs so production and deterministic tests cannot drift.
for(const [c,type] of [["recovery_hash","TEXT NOT NULL DEFAULT ''"],["recovery_created","INTEGER NOT NULL DEFAULT 0"]])try{db.exec(`ALTER TABLE players ADD COLUMN ${c} ${type}`)}catch{}
const stmt={
 player:db.prepare("SELECT * FROM players WHERE id=?"), nick:db.prepare("SELECT 1 FROM players WHERE nickname=?"),
 rename:db.prepare("UPDATE players SET nickname=?,renamed_at=? WHERE id=?"),
 recovery:db.prepare("UPDATE players SET recovery_hash=?,recovery_created=? WHERE id=?"),
 recoverPlayer:db.prepare("SELECT * FROM players WHERE recovery_hash=?"),
 run:db.prepare("SELECT * FROM runs WHERE id=? AND player_id=?"),
 addRun:db.prepare("INSERT INTO runs(id,player_id,token_hash,character,difficulty,silence,started_at,last_at,daily_key) VALUES(?,?,?,?,?,?,?,?,?)"),
 checkpoint:db.prepare("UPDATE runs SET last_at=?,last_elapsed=?,last_kills=?,last_rounds=?,checkpoints=checkpoints+1 WHERE id=?"),
 settled:db.prepare("UPDATE runs SET settled=1 WHERE id=?"),
 report:db.prepare("UPDATE runs SET report=? WHERE id=?"),
 score:db.prepare("INSERT INTO scores(player_id,run_id,mode,character,difficulty,score,rounds,created_at,daily_key,season) VALUES(?,?,?,?,?,?,?,?,?,?)"),
 touchPlayer:db.prepare("UPDATE players SET last_seen_at=?,last_ip_masked=?,last_network_tag=?,last_device=?,last_region=?,last_isp=? WHERE id=?"),
 runNetwork:db.prepare("UPDATE runs SET ip_masked=?,network_tag=?,device=?,region=?,isp=? WHERE id=?")
};
const cookies=req=>Object.fromEntries((req.headers.cookie||"").split(";").map(x=>x.trim().split("=")).filter(x=>x[0]));
function session(req){const raw=cookies(req).sg_session;if(!raw)return null;const [id,sig]=raw.split("."),want=id&&signToken(SECRET,id);return sig&&want&&sig.length===want.length&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(want))?stmt.player.get(id):null}
function send(res,status,data,origin,headers={}){res.writeHead(status,{"content-type":"application/json; charset=utf-8","access-control-allow-origin":origin,"access-control-allow-credentials":"true",...headers});res.end(JSON.stringify(data))}
function sendHtml(res,html){res.writeHead(200,{"content-type":"text/html; charset=utf-8","content-security-policy":"default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'","x-content-type-options":"nosniff","referrer-policy":"no-referrer","cache-control":"no-store"});res.end(html)}
async function read(req){let s="";for await(const c of req){s+=c;if(s.length>16384)throw err("请求过大",413)}return s?JSON.parse(s):{}}
function err(message,status=400){return Object.assign(new Error(message),{status})}
function nickname(){for(let i=0;i<500;i++){const n=randomNickname();if(!stmt.nick.get(n))return n}throw err("昵称池暂时繁忙",503)}
async function touchPlayer(req,id){const n=await requestNetwork(req,SECRET),now=Date.now();stmt.touchPlayer.run(now,n.ipMasked,n.networkTag,n.device,n.region,n.isp,id);return n}
async function guest(req,res,origin){const id=crypto.randomUUID(),name=nickname(),now=Date.now(),n=await requestNetwork(req,SECRET);db.prepare("INSERT INTO players(id,nickname,renamed_at,created_at,last_seen_at,last_ip_masked,last_network_tag,last_device,last_region,last_isp) VALUES(?,?,0,?,?,?,?,?,?,?)").run(id,name,now,now,n.ipMasked,n.networkTag,n.device,n.region,n.isp);send(res,201,{player:{nickname:name,canRenameAt:0}},origin,{"set-cookie":`sg_session=${id}.${signToken(SECRET,id)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=31536000`})}
const recoveryAttempts=new Map();
function recoveryHash(code){return signToken(SECRET,`recovery:${String(code).replace(/[^A-Z2-9]/gi,"").toUpperCase()}`)}
function recoveryCode(){const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",bytes=crypto.randomBytes(20);let raw="";for(const b of bytes)raw+=alphabet[b%alphabet.length];return raw.match(/.{1,5}/g).join("-")}
function sessionCookie(id){return `sg_session=${id}.${signToken(SECRET,id)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=31536000`}
// Rank players, not score rows: one person can submit many runs but should
// occupy only one leaderboard position (their best run under this board).
function rank(mode,playerId,day){const daily=mode==="daily"?"AND s.daily_key=?":"",args=[mode,SEASON,...(mode==="daily"?[day]:[])];return db.prepare(`WITH filtered AS (SELECT s.*,ROW_NUMBER() OVER(PARTITION BY s.player_id ORDER BY s.rounds DESC,s.score DESC,s.created_at ASC) player_best FROM scores s JOIN players p ON p.id=s.player_id WHERE s.mode=? AND s.season=? AND s.hidden=0 AND p.is_test=0 ${daily}),best AS (SELECT * FROM filtered WHERE player_best=1),mine AS (SELECT * FROM best WHERE player_id=?) SELECT 1+(SELECT COUNT(*) FROM best b,mine m WHERE b.rounds>m.rounds OR (b.rounds=m.rounds AND b.score>m.score) OR (b.rounds=m.rounds AND b.score=m.score AND b.created_at<m.created_at)) rank FROM mine`).get(...args,playerId)?.rank||null}

const adminAttempts=new Map();

const server=http.createServer(async(req,res)=>{const origin=ORIGINS.has(req.headers.origin)?req.headers.origin:[...ORIGINS][0];try{
 if(req.method==="OPTIONS"){res.writeHead(204,{"access-control-allow-origin":origin,"access-control-allow-credentials":"true","access-control-allow-methods":"GET,POST","access-control-allow-headers":"content-type"});return res.end()}
 const u=new URL(req.url,"http://local"); if(u.pathname==="/health")return send(res,200,{ok:true},origin);
 if(u.pathname==="/admin"&&req.method==="GET")return sendHtml(res,adminPage());
 if(u.pathname==="/v1/admin/login"&&req.method==="POST"){
  if(!ADMIN_PASSWORD_HASH)throw err("后台尚未配置",503);
  const key=clientIp(req)||"unknown",now=Date.now(),attempts=(adminAttempts.get(key)||[]).filter(x=>now-x<900000);
  if(attempts.length>=8)throw err("尝试次数过多，请 15 分钟后再试",429);
  const b=await read(req);if(!passwordMatchesHash(b.password,ADMIN_PASSWORD_HASH)){attempts.push(now);adminAttempts.set(key,attempts);throw err("密码错误",401)}
  adminAttempts.delete(key);return send(res,200,{ok:true},origin,{"set-cookie":adminCookie(SECRET,ADMIN_PASSWORD_HASH)});
 }
 if(u.pathname==="/v1/admin/logout"&&req.method==="POST")return send(res,200,{ok:true},origin,{"set-cookie":clearAdminCookie()});
 if(u.pathname.startsWith("/v1/admin/")){
  if(!adminAuthorized(req,SECRET,ADMIN_PASSWORD_HASH,cookies))throw err("请先登录后台",401);
  if(u.pathname==="/v1/admin/overview"&&req.method==="GET")return send(res,200,adminOverview(db),origin);
  if(u.pathname==="/v1/admin/cleanup/empty-guests"&&req.method==="POST"){const deleted=db.prepare(`DELETE FROM players WHERE ${emptyGuestWhere}`).run(emptyGuestCutoff(Date.now())).changes;return send(res,200,{ok:true,deleted},origin)}
  const reset=u.pathname.match(/^\/v1\/admin\/players\/([^/]+)\/reset-name$/);
  if(reset&&req.method==="POST"){const player=stmt.player.get(reset[1]);if(!player)throw err("玩家不存在",404);const name=uniqueNickname(db);db.prepare("UPDATE players SET nickname=?,renamed_at=0 WHERE id=?").run(name,player.id);return send(res,200,{ok:true,nickname:name},origin)}
  const testPlayer=u.pathname.match(/^\/v1\/admin\/players\/([^/]+)\/test$/);
  if(testPlayer&&req.method==="POST"){const isTest=Number((await read(req)).isTest)?1:0;const changed=db.prepare("UPDATE players SET is_test=? WHERE id=?").run(isTest,testPlayer[1]).changes;if(!changed)throw err("玩家不存在",404);return send(res,200,{ok:true,isTest:!!isTest},origin)}
  const visibility=u.pathname.match(/^\/v1\/admin\/scores\/(\d+)\/visibility$/);
  if(visibility&&req.method==="POST"){const hidden=Number((await read(req)).hidden)?1:0;const changed=db.prepare("UPDATE scores SET hidden=? WHERE id=?").run(hidden,Number(visibility[1])).changes;if(!changed)throw err("成绩不存在",404);return send(res,200,{ok:true,hidden:!!hidden},origin)}
  return send(res,404,{error:"not found"},origin);
 }
 const p=session(req); if(u.pathname==="/v1/me"&&req.method==="GET"){if(!p)return guest(req,res,origin);await touchPlayer(req,p.id);return send(res,200,{player:{nickname:p.nickname,canRenameAt:p.renamed_at+604800000,bound:!!p.recovery_hash}},origin)}
 if(u.pathname==="/v1/account/restore"&&req.method==="POST"){const key=clientIp(req)||"unknown",now=Date.now(),attempts=(recoveryAttempts.get(key)||[]).filter(x=>now-x<900000);if(attempts.length>=8)throw err("尝试次数过多，请稍后再试",429);attempts.push(now);recoveryAttempts.set(key,attempts);const b=await read(req),found=stmt.recoverPlayer.get(recoveryHash(b.code));if(!found)throw err("恢复码无效",401);recoveryAttempts.delete(key);await touchPlayer(req,found.id);return send(res,200,{player:{nickname:found.nickname,bound:true}},origin,{"set-cookie":sessionCookie(found.id)})}
 if(!p)return send(res,401,{error:"请先初始化游客身份"},origin);
 if(u.pathname==="/v1/me/name"&&req.method==="POST"){const name=validateNickname((await read(req)).nickname),now=Date.now();if(p.renamed_at&&now<p.renamed_at+604800000)throw err("每 7 天只能改名一次",429);try{stmt.rename.run(name,now,p.id)}catch{throw err("昵称已被使用",409)}return send(res,200,{player:{nickname:name,canRenameAt:now+604800000}},origin)}
 if(u.pathname==="/v1/account/recovery"&&req.method==="POST"){const code=recoveryCode(),now=Date.now();stmt.recovery.run(recoveryHash(code),now,p.id);return send(res,200,{code,createdAt:now,warning:"恢复码只显示一次，请立即保存"},origin)}
 if(u.pathname==="/v1/runs"&&req.method==="POST"){const b=await read(req);if(!isValidCharacter(b.character)||![0,1,2,3].includes(b.difficulty)||b.debug)throw err("无效开局");const id=crypto.randomUUID(),token=crypto.randomBytes(24).toString("base64url"),now=Date.now(),n=await touchPlayer(req,p.id);stmt.addRun.run(id,p.id,signToken(SECRET,token),b.character,b.difficulty,b.silence?1:0,now,now,b.daily?dailyKey(now):"");stmt.runNetwork.run(n.ipMasked,n.networkTag,n.device,n.region,n.isp,id);return send(res,201,{runId:id,token},origin)}
 // 匿名 run 汇总: one whitelisted stats blob per run (win or loss); token-
 // gated, write-once, values clamped — the balance loop's production data
 const mr=u.pathname.match(/^\/v1\/runs\/([^/]+)\/report$/); if(mr&&req.method==="POST"){const b=await read(req),r=stmt.run.get(mr[1],p.id);if(!r||signToken(SECRET,String(b.token||""))!==r.token_hash)throw err("无效 run",409);if(r.report)throw err("已上报",409);const s=b.stats&&typeof b.stats==="object"?b.stats:{};const pick={};for(const k of ["version","mode","outcome","elapsed","kills","score","bossReached","bossDefeated","rounds","hpPct","damageTaken","revivesUsed","weapons","contract","speed","metaPower","deathBy","chests","relics","wallet","up"]){const v=s[k];if(v===undefined)continue;pick[k]=Array.isArray(v)?v.slice(0,8).map(x=>String(x).slice(0,32)):typeof v==="boolean"?v:typeof v==="number"&&Number.isFinite(v)?v:String(v).slice(0,32)}stmt.report.run(JSON.stringify(pick),r.id);return send(res,200,{ok:true},origin)}
 const m=u.pathname.match(/^\/v1\/runs\/([^/]+)\/(checkpoint|settle)$/); if(m&&req.method==="POST"){const b=await read(req),r=stmt.run.get(m[1],p.id);if(!r||r.settled||signToken(SECRET,String(b.token||""))!==r.token_hash)throw err("无效或已结算的 run",409);const now=Date.now(),elapsed=Number(b.elapsed),kills=Number(b.kills),rounds=Number(b.rounds||0),progressError=runProgressError({elapsed,kills,rounds,lastElapsed:r.last_elapsed,lastKills:r.last_kills,lastRounds:r.last_rounds,wallElapsed:(now-r.started_at)/1000});if(progressError){console.warn("run progress rejected",progressError,r.id);throw err("成绩校验失败",422)}if(m[2]==="checkpoint"){if(r.checkpoints&&now-r.last_at<10000)throw err("提交过于频繁",429);stmt.checkpoint.run(now,elapsed,kills,rounds,r.id);return send(res,200,{ok:true},origin)}
 const stageKills=Number(b.stageKills),stageElapsed=Number(b.stageElapsed);if(!Number.isInteger(stageKills)||stageKills<0||stageKills>kills||!Number.isFinite(stageElapsed)||stageElapsed<0||stageElapsed>elapsed)throw err("结算组成无效",422);const mode=r.daily_key?"daily":b.mode==="endless"?"endless":"normal";if(mode!=="endless"&&rounds!==0)throw err("结算组成无效",422);const total=expectedScore({kills,elapsed,difficulty:r.difficulty,silence:!!r.silence}),stage=expectedScore({kills:stageKills,elapsed:stageElapsed,difficulty:r.difficulty,silence:!!r.silence}),score=mode==="endless"?Math.max(0,total-stage):stage,boardRounds=mode==="endless"?rounds:0;db.exec("BEGIN IMMEDIATE");try{stmt.settled.run(r.id);stmt.score.run(p.id,r.id,mode,r.character,r.difficulty,score,boardRounds,now,r.daily_key,SEASON);db.exec("COMMIT")}catch(e){db.exec("ROLLBACK");throw e}return send(res,200,{score,rank:rank(mode,p.id,r.daily_key),date:r.daily_key||null},origin)}
 if(u.pathname==="/v1/leaderboard"&&req.method==="GET"){const asked=u.searchParams.get("mode"),mode=asked==="endless"?"endless":asked==="daily"?"daily":"normal",ch=u.searchParams.get("character"),df=u.searchParams.get("difficulty"),diff=["0","1","2","3"].includes(df)?Number(df):null,day=mode==="daily"?dailyKey():"";
  const where=`s.mode=? AND s.season=? AND s.hidden=0 AND EXISTS(SELECT 1 FROM players allowed WHERE allowed.id=s.player_id AND allowed.is_test=0) ${mode==="daily"?"AND s.daily_key=?":""} ${ch?"AND s.character=?":""} ${diff!==null?"AND s.difficulty=?":""}`;
  const args=[mode,SEASON,...(day?[day]:[]),...(ch?[ch]:[]),...(diff!==null?[diff]:[])];
  const filtered=`SELECT s.*,ROW_NUMBER() OVER(PARTITION BY s.player_id ORDER BY s.rounds DESC,s.score DESC,s.created_at ASC) player_best FROM scores s WHERE ${where}`;
  const rows=db.prepare(`WITH filtered AS (${filtered}) SELECT p.nickname,f.character,f.difficulty,f.score,f.rounds,f.created_at,f.daily_key FROM filtered f JOIN players p ON p.id=f.player_id WHERE f.player_best=1 ORDER BY f.rounds DESC,f.score DESC,f.created_at ASC LIMIT 100`).all(...args);
  // 你的名次: compare every player's single best entry under the same filters
  const mine=db.prepare(`WITH filtered AS (${filtered}),best AS (SELECT * FROM filtered WHERE player_best=1),mine AS (SELECT * FROM best WHERE player_id=?) SELECT m.score,m.rounds,1+(SELECT COUNT(*) FROM best b WHERE b.rounds>m.rounds OR (b.rounds=m.rounds AND b.score>m.score) OR (b.rounds=m.rounds AND b.score=m.score AND b.created_at<m.created_at)) rank FROM mine m`).get(...args,p.id)||null;
  return send(res,200,{mode,date:day||null,rows,me:mine},origin)}
 return send(res,404,{error:"not found"},origin)
}catch(e){send(res,e.status||500,{error:e.status?e.message:"服务器错误"},origin)}});
server.listen(PORT,"127.0.0.1",()=>console.log(`sansgecao api :${PORT}`));
