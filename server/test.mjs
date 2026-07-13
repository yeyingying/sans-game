import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { dailyKey, expectedScore, randomNickname, runProgressError, validateNickname } from "./core.mjs";
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

// A leaderboard position belongs to a player, not to every run they submit.
// Two runs by player A plus one by B must render two rows, with A's best only.
const rankDb=new DatabaseSync(":memory:");
rankDb.exec("CREATE TABLE scores(player_id TEXT,mode TEXT,season TEXT,score INTEGER,rounds INTEGER,created_at INTEGER); INSERT INTO scores VALUES('a','normal','s1',100,0,1),('a','normal','s1',180,0,2),('b','normal','s1',150,0,3),('c','normal','old',999,0,4)");
const bestRows=rankDb.prepare("WITH filtered AS (SELECT s.*,ROW_NUMBER() OVER(PARTITION BY player_id ORDER BY rounds DESC,score DESC,created_at ASC) player_best FROM scores s WHERE mode=? AND season=?) SELECT player_id,score FROM filtered WHERE player_best=1 ORDER BY rounds DESC,score DESC,created_at ASC").all("normal","s1").map((row)=>({...row}));
assert.deepEqual(bestRows,[{player_id:"a",score:180},{player_id:"b",score:150}]);
console.log("server deterministic tests passed");
