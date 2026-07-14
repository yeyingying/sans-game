import crypto from "node:crypto";
import { randomNickname, signToken } from "./core.mjs";

export const ADMIN_COOKIE="sg_admin";
export const adminCookie=(secret,verifier)=>`${ADMIN_COOKIE}=${signToken(secret,`admin:${verifier}`)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
export const clearAdminCookie=()=>`${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function adminAuthorized(req,secret,verifier,cookies){
  if(!verifier)return false;
  const got=cookies(req)[ADMIN_COOKIE]||"",want=signToken(secret,`admin:${verifier}`);
  return got.length===want.length&&crypto.timingSafeEqual(Buffer.from(got),Buffer.from(want));
}

export function passwordMatches(got,want){
  const a=crypto.createHash("sha256").update(String(got||"")).digest();
  const b=crypto.createHash("sha256").update(String(want||"")).digest();
  return !!want&&crypto.timingSafeEqual(a,b);
}

export function passwordMatchesHash(got,wantHash){
  if(!/^[a-f0-9]{64}$/i.test(String(wantHash||"")))return false;
  const gotHash=crypto.createHash("sha256").update(String(got||"")).digest();
  const want=Buffer.from(String(wantHash),"hex");
  return gotHash.length===want.length&&crypto.timingSafeEqual(gotHash,want);
}

export function uniqueNickname(db){
  const exists=db.prepare("SELECT 1 FROM players WHERE nickname=?");
  for(let i=0;i<500;i++){const n=randomNickname();if(!exists.get(n))return n}
  throw Object.assign(new Error("昵称池暂时繁忙"),{status:503});
}

export function parseReport(value){try{return JSON.parse(value||"{}")||{}}catch{return {}}}

const weaponNames={bone:"碎骨投掷",orbit:"骨之环",homing:"追踪骨弹",bomb:"骨雷",beam:"贯穿骨矛",spike:"地刺骨牢",laser:"风车激光",boomerang:"回旋骨镖",bluebind:"蓝骨禁锢",wave:"骨之浪潮",cross:"十字骨射",orbitburst:"环绕骨雷",shield:"紫魂护盾",soundwave:"音波骨降",chain:"缚魂锁链",plaser:"紫透激光",sweep:"横扫之骨",feast:"噬骨归宗",slam:"重砸",axes:"穿透飞斧",quake:"崩地巨骨",lasso:"斧旋捕猎",cleave:"幻影重劈",boneringH:"震地骨阵",dash:"极限突刺",splitbone:"裂变骨雨",bonemark:"蓝骨降罚",megabone:"天坠巨骨",orb:"蓝魂光球",gaster:"龙骨炮",ringlaser:"环阵闪射",turret:"旋地骨桩",ifist:"血色重拳",ipounce:"扑杀",iblaster:"龙骨狂轰",ihook:"骨刺跳跃",ipull:"拉近爆破",ihand:"手掌幻影",irain:"骨雨",ispike:"分裂骨刺"};
export function displayWeapons(items){return (Array.isArray(items)?items:[]).map(raw=>{const m=String(raw).match(/^([^:*]+)(\*)?:(\d+)$/);if(!m)return String(raw);return `${weaponNames[m[1]]||m[1]}${m[2]?"（进化）":""} Lv${Number(m[3])+1}`})}

export function playerCharacters(value,last){
  return [last,...String(value||"").split(",")].filter((x,i,a)=>x&&a.indexOf(x)===i);
}

const EFFECTIVE_PLAYER_SQL=`EXISTS(SELECT 1 FROM scores es WHERE es.player_id=p.id) OR EXISTS(SELECT 1 FROM runs er WHERE er.player_id=p.id AND (er.settled=1 OR er.last_elapsed>=60 OR er.last_kills>=20 OR er.checkpoints>=2 OR CASE WHEN json_valid(er.report) THEN COALESCE(json_extract(er.report,'$.elapsed'),0)>=60 OR COALESCE(json_extract(er.report,'$.kills'),0)>=20 OR COALESCE(json_extract(er.report,'$.bossReached'),0)=1 OR COALESCE(json_extract(er.report,'$.bossDefeated'),0)=1 ELSE 0 END))`;
export const EMPTY_GUEST_DAYS=7;
export const emptyGuestCutoff=now=>now-EMPTY_GUEST_DAYS*86400000;
export const emptyGuestWhere=`is_test=0 AND COALESCE(recovery_hash,'')='' AND created_at<? AND NOT EXISTS(SELECT 1 FROM runs WHERE runs.player_id=players.id) AND NOT EXISTS(SELECT 1 FROM scores WHERE scores.player_id=players.id)`;

function progressFor(run,report,score){
  if(score?.mode==="endless")return `无尽 ${score.rounds} 轮`;
  if(score)return "击败 Boss 并上榜";
  if(report.bossDefeated)return "击败 Boss，未上榜";
  if(report.bossReached)return report.outcome==="death"?"Boss 战阵亡":"到达 Boss 战";
  if(report.outcome==="death")return "途中阵亡";
  if(run.settled)return "已结算，未记分";
  if(run.checkpoints)return "对局进行过，未结算";
  return "只开局";
}

export function adminOverview(db,now=Date.now()){
  const cleanupCutoff=emptyGuestCutoff(now);
  const metrics={
    effectivePlayers:db.prepare(`SELECT COUNT(*) n FROM players p WHERE p.is_test=0 AND (${EFFECTIVE_PLAYER_SQL})`).get().n,
    scoringPlayers:db.prepare("SELECT COUNT(DISTINCT s.player_id) n FROM scores s JOIN players p ON p.id=s.player_id WHERE s.hidden=0 AND p.is_test=0").get().n,
    testPlayers:db.prepare("SELECT COUNT(*) n FROM players WHERE is_test=1").get().n,
    emptyGuests:db.prepare(`SELECT COUNT(*) n FROM players WHERE ${emptyGuestWhere}`).get(cleanupCutoff).n,
    runs:db.prepare("SELECT COUNT(*) n FROM runs r JOIN players p ON p.id=r.player_id WHERE p.is_test=0").get().n,
    scores:db.prepare("SELECT COUNT(*) n FROM scores s JOIN players p ON p.id=s.player_id WHERE s.hidden=0 AND p.is_test=0").get().n
  };
  const players=db.prepare(`SELECT p.id,p.nickname,p.created_at,p.last_seen_at,p.last_ip_masked,p.last_network_tag,p.last_device,p.last_region,p.last_isp,p.is_test,CASE WHEN COALESCE(p.recovery_hash,'')<>'' THEN 1 ELSE 0 END bound,CASE WHEN (${EFFECTIVE_PLAYER_SQL}) THEN 1 ELSE 0 END effective,COUNT(DISTINCT r.id) run_count,COUNT(DISTINCT s.id) score_count,MAX(s.score) best_score,GROUP_CONCAT(DISTINCT r.character) character_list,(SELECT rr.character FROM runs rr WHERE rr.player_id=p.id ORDER BY rr.started_at DESC,rr.id DESC LIMIT 1) last_character FROM players p LEFT JOIN runs r ON r.player_id=p.id LEFT JOIN scores s ON s.player_id=p.id AND s.hidden=0 GROUP BY p.id ORDER BY p.last_seen_at DESC,p.created_at DESC LIMIT 200`).all().map(x=>({...x,is_test:!!x.is_test,bound:!!x.bound,effective:!!x.effective,cleanupEligible:!x.is_test&&!x.bound&&!x.run_count&&x.created_at<cleanupCutoff,characters:playerCharacters(x.character_list,x.last_character)}));
  const scoreByRun=new Map(db.prepare("SELECT id,run_id,mode,score,rounds,hidden FROM scores").all().map(x=>[x.run_id,{...x}]));
  const runs=db.prepare(`SELECT r.*,p.nickname,p.is_test FROM runs r JOIN players p ON p.id=r.player_id ORDER BY r.started_at DESC LIMIT 300`).all().map(row=>{
    const r={...row},report=parseReport(r.report),score=scoreByRun.get(r.id)||null;
    return {id:r.id,nickname:r.nickname,isTest:!!r.is_test,startedAt:r.started_at,lastAt:r.last_at,character:r.character,difficulty:r.difficulty,settled:!!r.settled,checkpoints:r.checkpoints,elapsed:Number(report.elapsed??r.last_elapsed??0),kills:Number(report.kills??r.last_kills??0),rounds:Number(report.rounds??r.last_rounds??0),outcome:report.outcome||"",deathBy:report.deathBy||"",progress:progressFor(r,report,score),weapons:displayWeapons(report.weapons),mode:report.mode||score?.mode||"normal",score,ipMasked:r.ip_masked||"未知",networkTag:r.network_tag||"",device:r.device||"未知设备",region:r.region||"未知地区",isp:r.isp||"未知网络"};
  });
  const scores=db.prepare(`SELECT s.id,s.mode,s.character,s.difficulty,s.score,s.rounds,s.created_at,s.hidden,p.nickname,p.is_test FROM scores s JOIN players p ON p.id=s.player_id ORDER BY s.created_at DESC LIMIT 300`).all().map(x=>({...x,hidden:!!x.hidden,isTest:!!x.is_test}));
  return {metrics,players,runs,scores,notice:"地域为 IP 推测，VPN、蜂窝网络和运营商出口可能导致偏差。系统不保存完整 IP。"};
}

export function adminPage(){return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sans 割草 · 玩家后台</title><style>
:root{--bg:#07060d;--panel:#12101c;--line:#423b57;--text:#f4f0ff;--muted:#a59bb7;--gold:#ffd36b;--blue:#75d6ff;--red:#ff627c;--green:#7cf29a}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:ui-monospace,"SFMono-Regular","PingFang SC",monospace;font-size:14px}button,input,select{font:inherit}.top{position:sticky;top:0;z-index:4;background:#090811f2;border-bottom:2px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:14px 20px}.brand{font-size:18px;color:var(--gold)}button{color:var(--text);background:#191624;border:2px solid var(--line);padding:9px 14px;cursor:pointer}button:hover{border-color:var(--blue)}button.danger{color:#ffc1cb;border-color:#823549}.wrap{max-width:1480px;margin:auto;padding:20px}.notice{color:var(--muted);margin-bottom:16px}.metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.metric,.panel{background:var(--panel);border:2px solid var(--line)}.metric{padding:14px}.metric b{display:block;color:var(--gold);font-size:27px;margin-top:7px}.tabs{display:flex;gap:8px;margin:18px 0}.tabs button.active{border-color:var(--gold);color:var(--gold)}.tools{display:flex;gap:8px;margin:0 0 12px}.tools input,.tools select{background:#0b0912;border:2px solid var(--line);color:var(--text);padding:9px 11px}.tools input{min-width:260px}.panel{overflow:auto}.view{display:none}.view.active{display:block}table{width:100%;border-collapse:collapse;min-width:950px}th,td{text-align:left;border-bottom:1px solid #2c273a;padding:10px;vertical-align:top}th{position:sticky;top:0;background:#191624;color:var(--gold);white-space:nowrap}.muted{color:var(--muted)}.good{color:var(--green)}.warn{color:var(--gold)}.bad{color:var(--red)}.tag{display:inline-block;border:1px solid var(--line);padding:2px 5px;margin:1px 3px 1px 0}.login{max-width:420px;margin:14vh auto;background:var(--panel);border:2px solid var(--line);padding:26px}.login h1{font-size:22px;color:var(--gold)}.login input{width:100%;background:#090811;border:2px solid var(--line);color:white;padding:12px;margin:12px 0}.login button{width:100%;border-color:var(--gold)}#error{color:var(--red);min-height:20px}.hide{display:none}@media(max-width:900px){.metrics{grid-template-columns:repeat(2,1fr)}.wrap{padding:12px}.top{padding:12px}.tools{flex-wrap:wrap}.tools input{min-width:100%}.metric b{font-size:23px}}
</style></head><body><section id="login" class="login"><h1>Sans 割草 · 玩家后台</h1><p class="muted">仅站长可访问。登录状态 8 小时后失效。</p><form id="loginForm"><input id="password" type="password" autocomplete="current-password" placeholder="后台密码" required><button>进入后台</button><p id="error"></p></form></section><main id="app" class="hide"><header class="top"><div class="brand">SANS 割草 · 玩家后台</div><div><button id="refresh">刷新</button> <button id="logout">退出</button></div></header><div class="wrap"><p id="notice" class="notice"></p><div id="metrics" class="metrics"></div><nav class="tabs"><button data-view="players" class="active">玩家</button><button data-view="runs">对局</button><button data-view="scores">成绩管理</button></nav><div class="tools"><input id="search" placeholder="搜索昵称、角色、地域、设备、网络标记"><select id="playerFilter"><option value="">全部玩家</option><option value="real">真实玩家</option><option value="effective">有效玩家</option><option value="test">测试账号</option><option value="empty">未开局账号</option></select><select id="filter"><option value="">全部状态</option><option value="只开局">只开局</option><option value="未结算">未结算</option><option value="途中阵亡">途中阵亡</option><option value="Boss">Boss</option><option value="上榜">上榜</option></select><button id="cleanup" class="danger"></button></div><section id="players" class="view active panel"></section><section id="runs" class="view panel"></section><section id="scores" class="view panel"></section></div></main><script>
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let data=null,view='players';
const names={sans:'传说之下',ukb:'因果报应',horror:'恐惧传说',hard:'困难模式',insanity:'Insanity',hacker:'黑客结局'},diff=['普通','狂暴','地狱','屠杀'],mode={normal:'通关',endless:'无尽',daily:'每日'};
function time(ms){return ms?new Date(ms).toLocaleString('zh-CN',{hour12:false}):'无'}function duration(v){v=Math.max(0,Math.round(Number(v)||0));return v>=60?Math.floor(v/60)+'分'+v%60+'秒':v+'秒'}
function table(head,rows){return '<table><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>'}
function filtered(list,useStatus=false){const q=$('#search').value.trim().toLowerCase(),f=useStatus?$('#filter').value:'',pf=view==='players'?$('#playerFilter').value:'';return list.filter(x=>{const s=JSON.stringify(x).toLowerCase(),okPlayer=!pf||(pf==='real'&&!x.is_test)||(pf==='effective'&&x.effective&&!x.is_test)||(pf==='test'&&x.is_test)||(pf==='empty'&&!x.is_test&&!x.run_count);return(!q||s.includes(q))&&(!f||s.includes(f))&&okPlayer})}
function controls(){const players=view==='players',runs=view==='runs';$('#playerFilter').style.display=players?'':'none';$('#filter').style.display=runs?'':'none';$('#cleanup').style.display=players?'':'none';if(data){$('#cleanup').textContent='清理空游客（'+data.metrics.emptyGuests+'）';$('#cleanup').disabled=!data.metrics.emptyGuests}}
function render(){if(!data)return;const m=data.metrics;$('#notice').textContent=data.notice;$('#metrics').innerHTML=[['有效玩家',m.effectivePlayers],['成功上榜玩家',m.scoringPlayers],['真实账号对局',m.runs],['有效成绩',m.scores],['测试账号',m.testPlayers],['可清理空游客',m.emptyGuests]].map(x=>'<div class="metric"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');controls();
const ps=filtered(data.players).map(p=>{const chars=p.characters||[],state=p.is_test?'<span class="tag bad">测试账号</span>':p.effective?'<span class="tag good">有效玩家</span>':'<span class="tag muted">未形成有效对局</span>';return '<tr><td><b>'+esc(p.nickname)+'</b> '+state+'<br><span class="muted">首次 '+time(p.created_at)+'</span></td><td>'+time(p.last_seen_at)+'</td><td>'+esc(p.last_region||'未知地区')+'<br><span class="muted">'+esc(p.last_ip_masked||'未知')+' · '+esc(p.last_isp||'')+'</span></td><td>'+esc(p.last_device||'未知设备')+'<br><span class="muted">网络 '+esc(p.last_network_tag||'无')+'</span></td><td>'+(chars.length?'<span class="muted">最近：</span><b>'+esc(names[chars[0]]||chars[0])+'</b><br>'+chars.map(x=>'<span class="tag">'+esc(names[x]||x)+'</span>').join(''):'<span class="muted">尚未开局</span>')+'</td><td>'+p.run_count+' 局 / '+p.score_count+' 次上榜<br><span class="muted">最高 '+(p.best_score??'无')+(p.cleanupEligible?' · 可清理':'')+'</span></td><td><button data-test="'+esc(p.id)+'" data-value="'+(p.is_test?0:1)+'">'+(p.is_test?'恢复为真实玩家':'标为测试')+'</button> <button class="danger" data-reset="'+esc(p.id)+'">重置昵称</button></td></tr>'});$('#players').innerHTML=table(['玩家','最近出现','IP 推测地域','设备与匿名网络','玩过的角色','游戏记录','管理'],ps);
const rs=filtered(data.runs,true).map(r=>'<tr><td><b>'+esc(r.nickname)+'</b>'+(r.isTest?' <span class="tag bad">测试</span>':'')+'<br><span class="muted">'+time(r.startedAt)+'</span></td><td><span class="tag">'+esc(mode[r.mode]||r.mode)+'</span><span class="tag">'+esc(names[r.character]||r.character)+'</span><span class="tag">'+esc(diff[r.difficulty]||r.difficulty)+'</span></td><td class="'+(r.score?'good':r.settled?'warn':'muted')+'">'+esc(r.progress)+'</td><td>'+duration(r.elapsed)+'<br>'+r.kills+' 击杀 · '+r.rounds+' 轮</td><td>'+(r.weapons.length?r.weapons.map(x=>'<span class="tag">'+esc(x)+'</span>').join(''):'<span class="muted">无上报</span>')+'</td><td>'+esc(r.region)+'<br><span class="muted">'+esc(r.ipMasked)+' · '+esc(r.isp)+'<br>'+esc(r.device)+'<br>网络 '+esc(r.networkTag||'无')+'</span></td><td>'+(r.score?esc(r.score.score)+(r.score.hidden?'（已隐藏）':''):'无')+'</td></tr>');$('#runs').innerHTML=table(['玩家与时间','模式','打到哪里','时长与进度','武器','地域与设备','成绩'],rs);
const ss=filtered(data.scores).map(s=>'<tr><td>'+time(s.created_at)+'</td><td><b>'+esc(s.nickname)+'</b>'+(s.isTest?' <span class="tag bad">测试</span>':'')+'</td><td>'+esc(mode[s.mode]||s.mode)+' · '+esc(names[s.character]||s.character)+' · '+esc(diff[s.difficulty]||s.difficulty)+'</td><td>'+s.score+(s.mode==='endless'?' · '+s.rounds+'轮':'')+'</td><td class="'+(s.hidden||s.isTest?'bad':'good')+'">'+(s.isTest?'测试号，不公开':s.hidden?'已从榜单隐藏':'公开')+'</td><td><button data-score="'+s.id+'" data-hidden="'+(s.hidden?0:1)+'">'+(s.hidden?'恢复成绩':'隐藏成绩')+'</button></td></tr>');$('#scores').innerHTML=table(['提交时间','玩家','榜单','成绩','状态','管理'],ss)}
async function api(path,opt={}){const r=await fetch(path,{...opt,headers:{'content-type':'application/json',...(opt.headers||{})}});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'请求失败');return j}
async function load(){try{data=await api('/v1/admin/overview');$('#login').classList.add('hide');$('#app').classList.remove('hide');render()}catch(e){$('#app').classList.add('hide');$('#login').classList.remove('hide')}}
$('#loginForm').onsubmit=async e=>{e.preventDefault();$('#error').textContent='';try{await api('/v1/admin/login',{method:'POST',body:JSON.stringify({password:$('#password').value})});$('#password').value='';await load()}catch(x){$('#error').textContent=x.message}};$('#refresh').onclick=load;$('#logout').onclick=async()=>{await api('/v1/admin/logout',{method:'POST'});location.reload()};
document.querySelector('.tabs').onclick=e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;document.querySelectorAll('.tabs button,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+view).classList.add('active');render()};$('#search').oninput=render;$('#filter').onchange=render;$('#playerFilter').onchange=render;
document.body.onclick=async e=>{const reset=e.target.closest('[data-reset]'),score=e.target.closest('[data-score]'),test=e.target.closest('[data-test]');try{if(reset&&confirm('确定重置这个昵称？玩家可立即重新改名。')){await api('/v1/admin/players/'+reset.dataset.reset+'/reset-name',{method:'POST'});await load()}if(test&&confirm(Number(test.dataset.value)?'标为测试账号后，将从公开排行榜和真实数据统计中排除。继续？':'恢复为真实玩家并重新计入排行榜和统计？')){await api('/v1/admin/players/'+test.dataset.test+'/test',{method:'POST',body:JSON.stringify({isTest:Number(test.dataset.value)})});await load()}if(score){await api('/v1/admin/scores/'+score.dataset.score+'/visibility',{method:'POST',body:JSON.stringify({hidden:Number(score.dataset.hidden)})});await load()}}catch(x){alert(x.message)}};
$('#cleanup').onclick=async()=>{const n=data?.metrics?.emptyGuests||0;if(!n||!confirm('将永久删除 '+n+' 个超过 7 天、从未开局且没有恢复码的空游客账号。有效玩家、测试账号和成绩不会删除。继续？'))return;try{const r=await api('/v1/admin/cleanup/empty-guests',{method:'POST'});alert('已清理 '+r.deleted+' 个空游客账号');await load()}catch(x){alert(x.message)}};controls();load();
</script></body></html>`}
