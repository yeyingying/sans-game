import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const mismatches=[];

function files(dir,base=dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?files(full,base):[path.relative(base,full)];
  }).sort();
}

function compareFile(source,target,label){
  if(!fs.existsSync(target)){mismatches.push(`${label}: deploy 中缺失`);return}
  if(!fs.readFileSync(source).equals(fs.readFileSync(target)))mismatches.push(`${label}: 内容不同步`);
}

const sourceDir=path.join(root,"src"),deployDir=path.join(root,"deploy","src");
const sourceFiles=files(sourceDir),deployFiles=files(deployDir);
for(const file of new Set([...sourceFiles,...deployFiles])){
  if(!sourceFiles.includes(file))mismatches.push(`src/${file}: 只存在于 deploy`);
  else if(!deployFiles.includes(file))mismatches.push(`src/${file}: deploy 中缺失`);
  else compareFile(path.join(sourceDir,file),path.join(deployDir,file),`src/${file}`);
}
for(const file of ["index.html","style.css"]){
  compareFile(path.join(root,file),path.join(root,"deploy",file),file);
}

if(mismatches.length){
  console.error("静态发布目录与源码不一致：\n- "+mismatches.join("\n- "));
  process.exit(1);
}
console.log(`deploy sync check passed (${sourceFiles.length+2} files)`);
