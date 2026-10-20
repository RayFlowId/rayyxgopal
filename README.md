# Rayy DevHub — Roblox Developer Asset Manager

Private dashboard berbahasa Indonesia untuk menyimpan Place ID/Music ID dan mengirim file model/audio ke Roblox Open Cloud Assets API.

## Fitur
- Login tim dengan satu kode akses (server-side, cookie HttpOnly + HMAC).
- Simpan/cari/hapus/copy Place ID dan Music ID; export JSON.
- Upload model (`.rbxm`, `.rbxmx`, `.fbx`, `.gltf`, `.glb`) dan audio (`.mp3`, `.ogg`, `.wav`, `.flac`) melalui Roblox Assets API.
- API key disimpan di environment variables Netlify, tidak dikirim ke browser.
- Responsive dark premium UI.

## Penting sebelum deploy
- Assets API Roblox saat ini berstatus **Beta**. API key perlu izin `asset:write` dan konfigurasi creator yang tepat.
- Creator harus user atau group yang memang kamu kelola/berhak mengunggah asetnya.
- Roblox menerapkan moderasi, kebijakan, dan kuota upload.
- Netlify Functions memiliki batas payload request. Versi ini membatasi file sampai **4.5 MB** agar tidak mendekati batas request Netlify. Roblox sendiri mendokumentasikan batas aset 20 MB, tetapi batas Netlify di sini lebih kecil.
- Library ID disimpan di `localStorage` browser/perangkat ini, tidak sinkron antar-device dan bisa hilang jika data browser dibersihkan.
- Login ini adalah satu shared passcode untuk tim kecil, bukan sistem akun individual. Bagikan kode akses hanya kepada developer tepercaya. Untuk penggunaan publik/lebih besar, ganti dengan sistem autentikasi per pengguna.
- Ini bukan uploader Place/game experience. `Place ID` hanya disimpan sebagai catatan; upload endpoint mengunggah file **model** atau **audio** sebagai Roblox asset.

## 1. Siapkan Roblox Open Cloud
1. Buka Creator Dashboard dan buat API key Open Cloud.
2. Berikan izin asset yang diperlukan, minimal `asset:write` untuk upload; batasi akses sesuai pilihan Roblox dan creator yang benar.
3. Tentukan creator target:
   - `ROBLOX_CREATOR_TYPE=user`, `ROBLOX_CREATOR_ID` adalah User ID; atau
   - `ROBLOX_CREATOR_TYPE=group`, `ROBLOX_CREATOR_ID` adalah Group ID.
4. Jangan pernah masukkan API key ke `app.js`, HTML, atau repository GitHub.

Dokumentasi resmi:
- Assets API usage: https://create.roblox.com/docs/cloud/guides/usage-assets
- Cloud API reference: https://create.roblox.com/docs/cloud/reference/features/assets
- Netlify environment variables: https://docs.netlify.com/build/functions/environment-variables/

## 2. Deploy via GitHub + Netlify
1. Download ZIP ini lalu ekstrak.
2. Buat repository GitHub baru, upload seluruh isi folder (file `index.html` harus di root repository).
3. Di Netlify pilih **Add new site → Import an existing project** lalu pilih repository tersebut.
4. Build settings:
   - Build command: kosongkan
   - Publish directory: `.`
   - Functions directory diatur oleh `netlify.toml` menjadi `netlify/functions`.
5. Di Netlify buka **Site configuration → Environment variables** (atau Build & deploy → Environment, tergantung tampilan dashboard) dan tambahkan:
   - `DASHBOARD_PASSWORD` — kode akses kuat yang kamu dan teman developer sepakati.
   - `SESSION_SECRET` — string acak panjang, minimal 32 karakter.
   - `ROBLOX_API_KEY` — API key Roblox Open Cloud (secret).
   - `ROBLOX_CREATOR_TYPE` — `user` atau `group`.
   - `ROBLOX_CREATOR_ID` — User ID atau Group ID target.
6. Pastikan variable tersedia untuk Functions/runtime, lalu trigger deploy ulang.
7. Buka domain Netlify, login, lalu coba upload file kecil yang memang kamu punya haknya.
8. Domain custom dapat disambungkan dari pengaturan Domain management Netlify.

## 3. Membuat SESSION_SECRET
Gunakan password manager untuk membuat nilai acak panjang. Jangan pakai API key Roblox sebagai session secret dan jangan commit nilai rahasia ke GitHub.

## Troubleshooting
- **Admin belum mengatur environment variable**: periksa semua nama env variable persis sama dan redeploy.
- **401 dari Roblox**: periksa API key dan izin `asset:write`.
- **403 dari Roblox**: API key/creator tidak punya izin pada aset/creator tersebut.
- **400 dari Roblox**: periksa format, metadata, creator ID, atau file.
- **429**: kuota/rate limit Roblox mungkin tercapai.
- **File terlalu besar**: gunakan file di bawah 4.5 MB pada versi Netlify Functions ini.
- **Login gagal setelah deploy**: pastikan `DASHBOARD_PASSWORD` dan `SESSION_SECRET` terisi, lalu deploy ulang.

## Security notes
- Endpoint upload mewajibkan sesi yang valid.
- Cookie sesi HttpOnly, Secure, SameSite=Strict dan berlaku 12 jam.
- Gunakan HTTPS Netlify. Jangan bagikan API key atau passcode di chat publik.
- Untuk melindungi aset dari penggunaan yang tidak sah, jangan izinkan orang mengunggah konten yang tidak mereka miliki atau tidak punya izin untuk menggunakannya.
