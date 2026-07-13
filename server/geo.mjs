import crypto from "node:crypto";
import { existsSync } from "node:fs";

const DB_PATH=process.env.IP2REGION_DB||"";
let searcher=null;

if(DB_PATH&&existsSync(DB_PATH)){
  try{
    const ip2=await import("ip2region.js");
    searcher=ip2.newWithBuffer(ip2.IPv4,ip2.loadContentFromFile(DB_PATH));
  }catch(e){
    console.warn("ip2region unavailable",e.message);
  }
}

export function clientIp(req){
  const forwarded=String(req.headers["x-forwarded-for"]||"").split(",")[0].trim();
  let ip=forwarded||req.socket.remoteAddress||"";
  if(ip.startsWith("::ffff:"))ip=ip.slice(7);
  return ip;
}

export function maskIp(ip){
  ip=String(ip||"");
  if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)){
    const p=ip.split(".");return `${p[0]}.${p[1]}.${p[2]}.*`;
  }
  if(ip.includes(":")){
    const p=ip.split(":").filter(Boolean);
    return `${p.slice(0,3).join(":")||"IPv6"}:*`;
  }
  return "未知";
}

export function networkTag(secret,ip){
  return ip?crypto.createHmac("sha256",secret).update(`network:${ip}`).digest("hex").slice(0,12):"";
}

export function deviceSummary(ua){
  ua=String(ua||"");
  let device="电脑",os="未知系统",browser="浏览器";
  if(/iPhone/i.test(ua)){device="iPhone";os="iOS"}
  else if(/iPad/i.test(ua)){device="iPad";os="iPadOS"}
  else if(/Android/i.test(ua)){device=/Mobile/i.test(ua)?"安卓手机":"安卓平板";os="Android"}
  else if(/Windows/i.test(ua))os="Windows";
  else if(/Macintosh|Mac OS X/i.test(ua))os="macOS";
  else if(/Linux/i.test(ua))os="Linux";
  if(/Edg\//i.test(ua))browser="Edge";
  else if(/OPR\//i.test(ua))browser="Opera";
  else if(/CriOS|Chrome\//i.test(ua))browser="Chrome";
  else if(/FxiOS|Firefox\//i.test(ua))browser="Firefox";
  else if(/Safari\//i.test(ua))browser="Safari";
  return `${device} · ${os} · ${browser}`;
}

export function parseRegion(raw){
  const [country,province,city,isp]=String(raw||"").split("|").map(x=>x&&x!=="0"?x:"");
  const place=[country,province,city].filter(Boolean).join(" · ")||"未知地区";
  return {place,isp:isp||"未知网络"};
}

export async function requestNetwork(req,secret){
  const ip=clientIp(req);let region={place:"未知地区",isp:"未知网络"};
  if(searcher&&/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)){
    try{region=parseRegion(await searcher.search(ip))}catch{}
  }
  return {ipMasked:maskIp(ip),networkTag:networkTag(secret,ip),device:deviceSummary(req.headers["user-agent"]),region:region.place,isp:region.isp};
}
