import assert from "node:assert/strict";
import { expectedScore, randomNickname, validateNickname } from "./core.mjs";
assert.equal(expectedScore({kills:10,elapsed:61.9,difficulty:0,silence:false}),202);
assert.equal(expectedScore({kills:10,elapsed:61.9,difficulty:1,silence:true}),341);
assert.equal(randomNickname(()=>0),"决心摆烂");
assert.equal(validateNickname("  骨感摸鱼  "),"骨感摸鱼");
for(const bad of ["官", "官方小花", "加我微信", "123456", "a@b.com"]) assert.throws(()=>validateNickname(bad));
console.log("server deterministic tests passed");
