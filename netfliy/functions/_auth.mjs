import { createHmac, timingSafeEqual } from "node:crypto";
export function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers}})}
function sign(value){return createHmac("sha256",process.env.SESSION_SECRET||"").update(value).digest("hex")}
export function sessionCookie(){const value=String(Date.now()+12*60*60*1000);return `rdh_session=${value}.${sign(value)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`}
export function validSession(req){const cookie=req.headers.get("cookie")||"";const raw=cookie.split(";").map(x=>x.trim()).find(x=>x.startsWith("rdh_session="))?.slice("rdh_session=".length);if(!raw||!process.env.SESSION_SECRET)return false;const [value,mac]=raw.split(".");if(!value||!mac||!/^\\d+$/.test(value)||Number(value)<Date.now())return false;const expected=sign(value);try{return timingSafeEqual(Buffer.from(mac,"hex"),Buffer.from(expected,"hex"))}catch{return false}}
export function requireEnv(names){return names.filter(n=>!process.env[n])}
