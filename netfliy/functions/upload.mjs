import { json, validSession, requireEnv } from "./_auth.mjs";
const MAX_BYTES=4.5*1024*1024;
const TYPES={
 Model:{".rbxm":"model/x-rbxm",".rbxmx":"model/x-rbxm",".fbx":"model/fbx",".gltf":"model/gltf+json",".glb":"model/gltf-binary"},
 Audio:{".mp3":"audio/mpeg",".ogg":"audio/ogg",".wav":"audio/wav",".flac":"audio/flac"}
};
export default async (req)=>{
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 if(!validSession(req))return json({error:"Sesi login habis. Silakan masuk lagi."},401);
 const missing=requireEnv(["ROBLOX_API_KEY","ROBLOX_CREATOR_ID","ROBLOX_CREATOR_TYPE"]);
 if(missing.length)return json({error:"Konfigurasi Netlify belum lengkap: "+missing.join(", ")},500);
 if(!["user","group"].includes(process.env.ROBLOX_CREATOR_TYPE))return json({error:"ROBLOX_CREATOR_TYPE harus 'user' atau 'group'."},500);
 let form;try{form=await req.formData()}catch{return json({error:"Form upload tidak terbaca."},400)}
 const assetType=String(form.get("assetType")||"");
 const displayName=String(form.get("displayName")||"").trim();
 const description=String(form.get("description")||"").trim();
 const file=form.get("file");
 if(!["Model","Audio"].includes(assetType)||!displayName||!file||typeof file.arrayBuffer!=="function")return json({error:"Lengkapi tipe, nama, dan file."},400);
 if(file.size<1||file.size>MAX_BYTES)return json({error:"File harus lebih kecil dari 4.5 MB karena batas request Netlify Functions."},413);
 const filename=String(file.name||"asset.bin");const ext="."+filename.split(".").pop().toLowerCase();
 const contentType=TYPES[assetType]?.[ext];
 if(!contentType)return json({error:"Format file tidak sesuai tipe asset yang dipilih."},400);
 const creator=process.env.ROBLOX_CREATOR_TYPE==="group"?{groupId:process.env.ROBLOX_CREATOR_ID}:{userId:process.env.ROBLOX_CREATOR_ID};
 const metadata={assetType,displayName:displayName.slice(0,50),description:description.slice(0,1000),creationContext:{creator}};
 const upstream=new FormData();
 upstream.append("request",new Blob([JSON.stringify(metadata)],{type:"application/json"}));
 upstream.append("fileContent",new Blob([await file.arrayBuffer()],{type:contentType}),filename);
 let response;
 try{response=await fetch("https://apis.roblox.com/assets/v1/assets",{method:"POST",headers:{"x-api-key":process.env.ROBLOX_API_KEY},body:upstream})}
 catch{return json({error:"Tidak bisa terhubung ke Roblox Open Cloud. Coba lagi nanti."},502)}
 const raw=await response.text();let data;try{data=JSON.parse(raw)}catch{data={}}
 if(!response.ok){const detail=data?.message||data?.error||`Roblox API mengembalikan HTTP ${response.status}.`;return json({error:detail+" Periksa izin API key, Creator ID, format file, dan ketentuan Roblox."},response.status===429?429:502)}
 return json({ok:true,operationId:data.operationId||data.path||"",assetId:data.assetId||data.asset?.assetId||"",message:"Roblox menerima permintaan. Pemrosesan aset dapat berlangsung terpisah."});
};
