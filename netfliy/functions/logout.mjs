import { json } from "./_auth.mjs";
export default async (req)=>json({ok:true},200,{"Set-Cookie":"rdh_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"});
