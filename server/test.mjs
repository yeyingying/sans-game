import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { dailyKey, expectedScore, randomNickname, runProgressError, validateNickname } from "./core.mjs";
import { adminAuthorized, displayWeapons, passwordMatches } from "./admin.mjs";
import { deviceSummary, maskIp, networkTag, parseRegion } from "./geo.mjs";
assert.equal(expectedScore({kills:10,elapsed:61.9,difficulty:0,silence:false}),202);
assert.equal(expectedScore({kills:10,elapsed:61.9,difficulty:1,silence:true}),492);
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
assert.deepEqual(displayWeapons(["bone:2","gaster*:4"]),["碎骨投掷 Lv3","龙骨炮（进化） Lv5"]);
const cookieReq={headers:{cookie:"sg_admin=token"}};
assert.equal(adminAuthorized(cookieReq,"secret","password",req=>Object.fromEntries(req.headers.cookie.split(";").map(x=>x.trim().split("=")))),false);

// A leaderboard position belongs to a player, not to every run they submit.
// Two runs by player A plus one by B must render two rows, with A's best only.
const rankDb=new DatabaseSync(":memory:");
rankDb.exec("CREATE TABLE scores(player_id TEXT,mode TEXT,season TEXT,score INTEGER,rounds INTEGER,created_at INTEGER,hidden INTEGER); INSERT INTO scores VALUES('a','normal','s1',100,0,1,0),('a','normal','s1',180,0,2,0),('b','normal','s1',150,0,3,0),('c','normal','old',999,0,4,0),('d','normal','s1',999,0,5,1)");
const bestRows=rankDb.prepare("WITH filtered AS (SELECT s.*,ROW_NUMBER() OVER(PARTITION BY player_id ORDER BY rounds DESC,score DESC,created_at ASC) player_best FROM scores s WHERE mode=? AND season=? AND hidden=0) SELECT player_id,score FROM filtered WHERE player_best=1 ORDER BY rounds DESC,score DESC,created_at ASC").all("normal","s1").map((row)=>({...row}));
assert.deepEqual(bestRows,[{player_id:"a",score:180},{player_id:"b",score:150}]);
console.log("server deterministic tests passed");
