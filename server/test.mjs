import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { SEASON, dailyKey, expectedScore, isValidCharacter, legacyEndlessStageScore, randomNickname, runProgressError, scoreEntryRunId, settlementScoreEntries, validateNickname } from "./core.mjs";
import { adminAuthorized, adminBalance, adminOverview, adminPage, deletePlayerData, displayWeapons, passwordMatches, passwordMatchesHash, playerCharacters } from "./admin.mjs";
import { deviceSummary, maskIp, networkTag, parseRegion } from "./geo.mjs";
assert.equal(expectedScore({kills:10,elapsed:61.9,difficulty:0,silence:false}),202);
assert.equal(expectedScore({kills:10,elapsed:61.9,difficulty:1,silence:true}),492);
assert.equal(scoreEntryRunId("run-1","normal"),"run-1:normal");
assert.deepEqual(settlementScoreEntries({runId:"run-1",mode:"endless",totalScore:1275,stageScore:1000,rounds:2}),[
 {runId:"run-1:normal",mode:"normal",score:1000,rounds:0},
 {runId:"run-1:endless",mode:"endless",score:275,rounds:2}
]);
assert.deepEqual(settlementScoreEntries({runId:"run-2",mode:"normal",totalScore:1000,stageScore:1000,rounds:0}),[
 {runId:"run-2:normal",mode:"normal",score:1000,rounds:0}
]);
assert.equal(legacyEndlessStageScore({report:{bossDefeated:true,kills:100,elapsed:310},endlessScore:275,difficulty:0,silence:false}),1000);
assert.equal(legacyEndlessStageScore({report:{bossDefeated:false,kills:100,elapsed:310},endlessScore:275,difficulty:0,silence:false}),null);
assert.equal(randomNickname(()=>0),"决心摆烂怪");
assert.equal(validateNickname("  骨感摸鱼  "),"骨感摸鱼");
assert.equal(dailyKey(Date.UTC(2026,6,11,15,59,59)),"2026-07-11");
assert.equal(dailyKey(Date.UTC(2026,6,11,16,0,0)),"2026-07-12");
for(const bad of ["官", "官方小花", "加我微信", "123456", "a@b.com"]) assert.throws(()=>validateNickname(bad));
const progress={elapsed:10,kills:350,rounds:0,lastElapsed:9,lastKills:120,lastRounds:0,wallElapsed:10};
assert.equal(runProgressError(progress),""); // area burst + 50-kill Boss reward is legitimate
assert.equal(runProgressError({...progress,kills:401}),"kills");
assert.equal(runProgressError({...progress,elapsed:8}),"rollback");
assert.equal(maskIp("113.118.113.77"),"113.118.113.*");
assert.equal(maskIp("240e:3b7:3272:d8d0::1"),"240e:3b7:3272:*");
assert.equal(deviceSummary("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1"),"iPhone · iOS · Safari");
assert.equal(deviceSummary("Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 Chrome/131.0 Mobile"),"安卓手机 · Android · Chrome");
assert.deepEqual(parseRegion("中国|广东省|深圳市|电信|CN"),{place:"中国 · 广东省 · 深圳市",isp:"电信"});
assert.equal(networkTag("secret","113.118.113.77"),networkTag("secret","113.118.113.77"));
assert.notEqual(networkTag("secret","113.118.113.77"),networkTag("secret","113.118.113.78"));
assert.equal(passwordMatches("right","right"),true);
assert.equal(passwordMatches("wrong","right"),false);
assert.equal(passwordMatchesHash("right","27042f4e6eca7d0b2a7ee4026df2ecfa51d3339e6d122aa099118ecd8563bad9"),true);
assert.equal(passwordMatchesHash("wrong","27042f4e6eca7d0b2a7ee4026df2ecfa51d3339e6d122aa099118ecd8563bad9"),false);
assert.equal(passwordMatchesHash("right","not-a-hash"),false);
assert.deepEqual(displayWeapons(["bone:2","gaster*:4"]),["碎骨投掷 Lv3","龙骨炮（进化） Lv5"]);
assert.deepEqual(displayWeapons(["ifist:0","ispike*:4"]),["血色重拳 Lv1","分裂骨刺（进化） Lv5"]);
assert.deepEqual(playerCharacters("sans,horror,ukb","horror"),["horror","sans","ukb"]);
assert.deepEqual(playerCharacters("",null),[]);
assert.equal(SEASON,"s2");
assert.equal(isValidCharacter("insanity"),true);
assert.equal(isValidCharacter("hacker"),true);
assert.equal(isValidCharacter("unknown"),false);
assert.match(adminPage(),/hacker:'黑客结局'/);
assert.match(adminPage(),/玩过的角色/);
const cookieReq={headers:{cookie:"sg_admin=token"}};
assert.equal(adminAuthorized(cookieReq,"secret","password",req=>Object.fromEntries(req.headers.cookie.split(";").map(x=>x.trim().split("=")))),false);

const adminDb=new DatabaseSync(":memory:");
adminDb.exec(`CREATE TABLE players(id TEXT PRIMARY KEY,nickname TEXT,created_at INTEGER,last_seen_at INTEGER,last_ip_masked TEXT,last_network_tag TEXT,last_device TEXT,last_region TEXT,last_isp TEXT,is_test INTEGER,recovery_hash TEXT);
CREATE TABLE runs(id TEXT PRIMARY KEY,player_id TEXT,character TEXT,difficulty INTEGER,started_at INTEGER,last_at INTEGER,last_elapsed REAL,last_kills INTEGER,last_rounds INTEGER,checkpoints INTEGER,settled INTEGER,report TEXT,ip_masked TEXT,network_tag TEXT,device TEXT,region TEXT,isp TEXT);
CREATE TABLE scores(id INTEGER PRIMARY KEY,player_id TEXT,run_id TEXT,mode TEXT,character TEXT,difficulty INTEGER,score INTEGER,rounds INTEGER,created_at INTEGER,hidden INTEGER);
INSERT INTO players VALUES('p1','玩家甲',1,30,'','','','','',0,''),('p2','玩家乙',2,2,'','','','','',0,''),('p3','测试号',3,3,'','','','','',1,'');
INSERT INTO runs VALUES('r1','p1','sans',0,10,10,0,0,0,0,0,'','','','','',''),('r2','p1','horror',0,20,20,0,0,0,0,0,'','','','','',''),('r3','p1','sans',0,30,30,61,0,0,0,0,'','','','','',''),('r4','p3','insanity',0,30,30,90,30,0,2,1,'','','','','','');
INSERT INTO scores VALUES(1,'p3','r4','normal','insanity',0,9999,0,30,0);`);
const adminData=adminOverview(adminDb,8*86400000),adminPlayers=adminData.players;
assert.deepEqual(adminPlayers.find(x=>x.id==="p1").characters,["sans","horror"]);
assert.deepEqual(adminPlayers.find(x=>x.id==="p2").characters,[]);
assert.equal(adminPlayers.find(x=>x.id==="p1").effective,true);
assert.equal(adminPlayers.find(x=>x.id==="p3").is_test,true);
assert.equal(adminData.metrics.effectivePlayers,1);
assert.equal(adminData.metrics.testPlayers,1);
assert.equal(adminData.metrics.emptyGuests,1);
assert.throws(()=>deletePlayerData(adminDb,"p3","错误昵称"),/昵称确认不一致/);
assert.equal(adminDb.prepare("SELECT COUNT(*) n FROM players WHERE id='p3'").get().n,1);
assert.deepEqual(deletePlayerData(adminDb,"p3","测试号"),{nickname:"测试号",players:1,runs:1,scores:1});
assert.equal(adminDb.prepare("SELECT COUNT(*) n FROM players WHERE id='p3'").get().n,0);
assert.equal(adminDb.prepare("SELECT COUNT(*) n FROM runs WHERE player_id='p3'").get().n,0);
assert.equal(adminDb.prepare("SELECT COUNT(*) n FROM scores WHERE player_id='p3'").get().n,0);
assert.equal(adminDb.prepare("SELECT COUNT(*) n FROM players").get().n,2);
assert.match(adminPage(),/data-delete/);
assert.match(adminPage(),/难度分析/);
assert.doesNotThrow(()=>new Function(adminPage().match(/<script>([\s\S]*)<\/script>/)[1]));

const balanceDb=new DatabaseSync(":memory:");
balanceDb.exec(`CREATE TABLE players(id TEXT PRIMARY KEY,is_test INTEGER);
CREATE TABLE runs(id TEXT PRIMARY KEY,player_id TEXT,character TEXT,difficulty INTEGER,started_at INTEGER,last_elapsed REAL,last_rounds INTEGER,report TEXT,device TEXT);
CREATE TABLE scores(player_id TEXT,run_id TEXT,mode TEXT);
INSERT INTO players VALUES('a',0),('b',0),('c',0),('test',1);
INSERT INTO runs VALUES
 ('a1','a','sans',0,10,100,0,'{"version":"v1","elapsed":100,"outcome":"death","bossReached":false}','iPhone · iOS · Safari'),
 ('a2','a','sans',0,20,390,0,'{"version":"v1","elapsed":390,"outcome":"victory","bossReached":true,"bossDefeated":true,"bossPhaseReached":2,"bossFightSeconds":82}','iPhone · iOS · Safari'),
 ('b1','b','sans',0,30,340,0,'{"version":"v1","elapsed":340,"outcome":"death","bossReached":true,"bossDefeated":false,"deathSkill":"光炮"}','电脑 · macOS · Safari'),
 ('c1','c','horror',1,35,620,3,'{"version":"v1","elapsed":620,"outcome":"endlessDeath","bossReached":true,"bossDefeated":true,"enteredEndless":true,"rounds":3}','电脑 · macOS · Safari'),
 ('t1','test','sans',0,40,360,0,'{"version":"v1","elapsed":360,"outcome":"victory","bossReached":true,"bossDefeated":true}','电脑 · macOS · Safari');
INSERT INTO scores VALUES('a','a2:normal','normal'),('c','c1:normal','normal'),('c','c1:endless','endless'),('test','t1:normal','normal');`);
const balanceFirst=adminBalance(balanceDb,{now:1000000,days:7,version:"v1"});
assert.equal(balanceFirst.filters.difficulty,null);
assert.equal(balanceFirst.metrics.attempts,3);
assert.equal(balanceFirst.metrics.players,3);
assert.equal(balanceFirst.metrics.reached,2);
assert.equal(balanceFirst.metrics.cleared,1);
assert.equal(balanceFirst.metrics.bossDeaths,1);
assert.equal(balanceFirst.metrics.endless,1);
assert.equal(balanceFirst.metrics.maxRound,3);
assert.equal(balanceFirst.deaths[0].cause,"光炮");
const balanceAll=adminBalance(balanceDb,{now:1000000,days:7,version:"v1",sample:"all"});
assert.equal(balanceAll.metrics.attempts,4);
assert.equal(balanceAll.metrics.reached,3);
assert.equal(balanceAll.metrics.cleared,2);
assert.equal(balanceAll.metrics.medianBossSeconds,82);
assert.deepEqual(balanceAll.options.versions,["v1"]);
assert.equal(balanceAll.difficultyFunnels[0].bossDeaths,1);
assert.equal(balanceAll.difficultyFunnels[1].endless,1);
assert.deepEqual(balanceAll.difficultyFunnels[1].rounds.map(x=>x.count),[1,1,1]);
assert.match(adminPage(),/完整进度漏斗/);

// A leaderboard position belongs to a player, not to every run they submit.
// Two runs by player A plus one by B must render two rows, with A's best only.
const rankDb=new DatabaseSync(":memory:");
rankDb.exec(`CREATE TABLE players(id TEXT,is_test INTEGER); CREATE TABLE scores(player_id TEXT,mode TEXT,season TEXT,score INTEGER,rounds INTEGER,created_at INTEGER,hidden INTEGER); INSERT INTO players VALUES('a',0),('b',0),('c',0),('d',0),('e',1); INSERT INTO scores VALUES('a','normal','s1',100,0,1,0),('a','normal','${SEASON}',180,0,2,0),('b','normal','s1',150,0,3,0),('c','normal','',999,0,4,0),('d','normal','${SEASON}',999,0,5,1),('e','normal','${SEASON}',9999,0,6,0)`);
const bestRows=rankDb.prepare("WITH filtered AS (SELECT s.*,ROW_NUMBER() OVER(PARTITION BY player_id ORDER BY rounds DESC,score DESC,created_at ASC) player_best FROM scores s WHERE mode=? AND season<>'' AND hidden=0 AND EXISTS(SELECT 1 FROM players allowed WHERE allowed.id=s.player_id AND allowed.is_test=0)) SELECT player_id,score FROM filtered WHERE player_best=1 ORDER BY rounds DESC,score DESC,created_at ASC").all("normal").map((row)=>({...row}));
assert.deepEqual(bestRows,[{player_id:"a",score:180},{player_id:"b",score:150}]);
console.log("server deterministic tests passed");
