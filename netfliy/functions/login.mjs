import { json, sessionCookie, requireEnv } from "./_auth.mjs";
export default async (req) => {
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const missing=requireEnv(["DASHBOARD_PASSWORD","SESSION_SECRET"]);
 if(missing.length)return json({error:"Admin belum mengatur environment variable: "+missing.join(", ")},500);
 let body;try{body=await req.json()}catch{return json({error:"Request tidak valid."},400)}
 const supplied=String(body.password||"");
 if(supplied.length<1||supplied!==process.env.DASHBOARD_PASSWORD)return json({error:"Kode akses salah."},401);
 return json({ok:true},200,{"Set-Cookie":sessionCookie()});
};
