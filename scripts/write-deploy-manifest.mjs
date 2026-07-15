import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,".."),commit=String(process.env.DEPLOY_SHA||process.argv[2]||"").trim();
if(!/^[a-f0-9]{7,40}$/i.test(commit))throw new Error("DEPLOY_SHA 必须是 Git 提交号");
const manifest={commit,deployedAt:new Date().toISOString(),source:"github-actions"};
fs.writeFileSync(path.join(root,"deploy","deploy-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
fs.writeFileSync(path.join(root,"server","DEPLOY_SHA"),commit+"\n");
console.log(`release manifest written for ${commit}`);
