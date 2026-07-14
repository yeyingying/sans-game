import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root=mkdtempSync(join(tmpdir(),"sansgecao-http-test-"));
const dbPath=join(root,"leaderboard.sqlite"),port=32147,origin="https://www.sansgecao.com";
const appPath=fileURLToPath(new URL("./app.mjs",import.meta.url));
const child=spawn(process.execPath,[appPath],{env:{...process.env,PORT:String(port),DB_PATH:dbPath,SESSION_SECRET:"deterministic-http-test",ALLOWED_ORIGINS:origin},stdio:["ignore","pipe","pipe"]});
let logs="";child.stdout.on("data",x=>logs+=x);child.stderr.on("data",x=>logs+=x);
const base=`http://127.0.0.1:${port}/v1`;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let cookie="";
async function request(path,opt={}){
  const response=await fetch(base+path,{...opt,headers:{origin,"content-type":"application/json",...(cookie?{cookie}:{}),...(opt.headers||{})}});
  const setCookie=response.headers.get("set-cookie");if(setCookie)cookie=setCookie.split(";")[0];
  const body=await response.json();return {response,body};
}

try{
  let ready=false;
  for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${port}/health`);if(r.ok){ready=true;break}}catch{}await wait(50)}
  assert.equal(ready,true,logs);
  assert.equal((await request("/me")).response.status,201);
  const created=await request("/runs",{method:"POST",body:JSON.stringify({character:"sans",difficulty:0,silence:false,daily:false,debug:false})});
  assert.equal(created.response.status,201);
  const {runId,token}=created.body;
  const stage=await request(`/runs/${runId}/stage-clear`,{method:"POST",body:JSON.stringify({token,elapsed:10,kills:10})});
  assert.deepEqual(stage.body,{score:75,rank:1});
  const settled=await request(`/runs/${runId}/settle`,{method:"POST",body:JSON.stringify({token,mode:"endless",elapsed:20,kills:20,rounds:1,stageElapsed:10,stageKills:10})});
  assert.equal(settled.response.status,200);
  assert.deepEqual({...settled.body,date:null},{score:75,rank:1,date:null});
  const normal=(await request("/leaderboard?mode=normal")).body,endless=(await request("/leaderboard?mode=endless")).body;
  assert.equal(normal.rows.length,1);assert.equal(normal.rows[0].score,75);
  assert.equal(endless.rows.length,1);assert.equal(endless.rows[0].score,75);assert.equal(endless.rows[0].rounds,1);
  const repeated=await request(`/runs/${runId}/settle`,{method:"POST",body:JSON.stringify({token,mode:"endless",elapsed:20,kills:20,rounds:1,stageElapsed:10,stageKills:10})});
  assert.equal(repeated.response.status,409);
  const db=new DatabaseSync(dbPath),scores=db.prepare("SELECT run_id,mode FROM scores ORDER BY mode").all().map(x=>({...x}));db.close();
  assert.deepEqual(scores,[{run_id:`${runId}:endless`,mode:"endless"},{run_id:`${runId}:normal`,mode:"normal"}]);
  console.log("server HTTP dual-board test passed");
}finally{
  child.kill("SIGTERM");
  await Promise.race([new Promise(resolve=>child.once("exit",resolve)),wait(1000)]);
  rmSync(root,{recursive:true,force:true});
}
