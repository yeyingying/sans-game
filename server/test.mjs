import assert from "node:assert/strict";
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
console.log("server deterministic tests passed");
