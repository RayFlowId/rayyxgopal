import { json, validSession } from "./_auth.mjs";
export default async (req)=> validSession(req)?json({ok:true}):json({error:"Login diperlukan."},401);
