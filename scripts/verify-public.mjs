const expected=String(process.env.DEPLOY_SHA||process.argv[2]||"").trim();
if(!/^[a-f0-9]{7,40}$/i.test(expected))throw new Error("缺少待验证的 DEPLOY_SHA");

const targets=[
  ["Caddy 静态站",process.env.PUBLIC_MANIFEST_URL||"https://www.sansgecao.com/deploy-manifest.json","commit"],
  ["OSS 静态站",process.env.OSS_MANIFEST_URL||"https://sanssurvivor.oss-cn-hongkong.aliyuncs.com/deploy-manifest.json","commit"],
  ["排行榜 API",process.env.API_HEALTH_URL||"https://api.sansgecao.com/health","deploy"]
];

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function readJson(url){
  const join=url.includes("?")?"&":"?",response=await fetch(`${url}${join}verify=${Date.now()}`,{headers:{"cache-control":"no-cache"}});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return response.json();
}

for(let attempt=1;attempt<=12;attempt++){
  const failures=[];
  for(const [label,url,key] of targets){
    try{
      const data=await readJson(url),got=String(data[key]||"");
      if(got!==expected)failures.push(`${label}: ${got||"无版本号"}`);
    }catch(error){failures.push(`${label}: ${error.message}`)}
  }
  if(!failures.length){console.log(`public deploy verified: ${expected}`);process.exit(0)}
  if(attempt===12)throw new Error(`公网版本未一致：\n- ${failures.join("\n- ")}`);
  console.log(`公网尚未全部刷新 (${attempt}/12)，5 秒后重试`);
  await sleep(5000);
}
