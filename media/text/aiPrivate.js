import fs from "fs";
import path from "path";
import moment from "moment-timezone";

// ambil plugin info
function readPlugins(dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) results = results.concat(readPlugins(fullPath));
    else if (file.endsWith(".js")) results.push(fullPath);
  }
  return results;
}

function getPluginInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const name = /name\s*:\s*["'`](.*?)["'`]/.exec(content)?.[1] || path.basename(filePath, ".js");
    const description = /description\s*:\s*["'`](.*?)["'`]/.exec(content)?.[1] || "-";
    return { name, description, file: filePath.replace(process.cwd(), "").replace(/\\/g, "/") };
  } catch (e) {
    return { name: path.basename(filePath), description: "Error: " + e.message };
  }
}

const pluginFiles = readPlugins("./plugins");
const pluginList = pluginFiles
  .map(getPluginInfo)
  .map((p, i) => {
    // Baca access dari file plugin
    let accessText = "";
    try {
      const content = fs.readFileSync(p.file, "utf8");
      const accessMatch = /access\s*:\s*({[\s\S]*?})/.exec(content)?.[1];
      if (accessMatch) accessText = `\n   ↳ Access: ${accessMatch.replace(/\s+/g, " ")}`;
    } catch {}
    return `🧩 ${i + 1}. ${p.name}\n   ↳ ${p.description}${accessText}`;
  })
  .join("\n");

export function generatePrompt(m, conn) {
  const userKeys = Object.keys(db.data.users || {});
  const groupKeys = Object.keys(db.data.chats || {});
  const datauser = db.data.users?.[m.sender] || {};
  const datagroup = db.data.chats?.[m.chat] || {};
  const developer = [
    `${global.owner?.number || "6281316643491@s.whatsapp.net"}`,
    "6281316643491@s.whatsapp.net"
  ];
  const timeWib = moment().tz("Asia/Jakarta").format("HH:mm:ss");
  const dt = moment().tz("Asia/Jakarta").locale("id").format("a");
  const ucapanWaktu = "Selamat " + dt.charAt(0).toUpperCase() + dt.slice(1);
  const week = moment().format("dddd");
  const calender = moment().format("LL");
  const date = `${week}, ${calender}`;

  const sosmedList = Object.entries(global.sosmed || {})
    .map(([key, url]) => {
      const iconMap = {
        youtube: "📺 YouTube",
        whatsapp: "💬 WhatsApp",
        instagram: "📸 Instagram",
        tiktok: "🎵 TikTok",
        github: "💻 GitHub",
        website: "🌐 Website"
      };
      return `${iconMap[key] || key}: ${url}`;
    })
    .join("\n");

  // Prompt inti
  return [
    "Kamu adalah RHNX, asisten virtual resmi dari rhnxofficial.",
    "Tujuanmu: bantu pengguna dengan gaya santai, natural, kayak ngobrol bareng teman.",
    `Pemilikmu: Raihan Fadillah. Nomor: ${developer.join(", ")}.`,
    `Waktu sekarang: ${timeWib} WIB, ${ucapanWaktu}, tanggal: ${date}.`,
    `Sosmed resmi:\n${sosmedList}`,
    "",
    "Karakter kamu: rame, cepat tanggap, suka bercanda, tapi tetap tahu batas.",
    "Aturan jawaban:",
    "- Kalau user hanya ngobrol santai, jawaban singkat 1–3 kalimat aja.",
    "- Kalau user bertanya hal spesifik (misal 'apa itu JavaScript?'), jawab informatif dan sesuai konteks.",
    "- Kalau tidak tahu jawabannya, jujur tapi tetap asik ('wah gak yakin juga sih 😅').",
    "- Jangan terlalu panjang, tetap enak dibaca.",
    "",
    "Kamu cuma Asisitan Di Private chat saja jadi jika user ingin akses lebih harus di group.",
    `Total data: ${userKeys.length} user, ${groupKeys.length} grup`,
    "📂 Data User:\n" + JSON.stringify(datauser, null, 2),
    "👥 Data Grup (Database):\n" + JSON.stringify(datagroup, null, 2),
    "🧩 Daftar Plugin Terdeteksi:\n" + pluginList,
    "",
    "⚠️ Penting: Plugin dengan `nocmdprivate` hanya bisa dipakai oleh Owner / Premium. User biasa hanya bisa akses plugin dengan `private: true`.",
    "Ingat, fokus pada konteks user saat ini dan gunakan gaya santai, lucu tapi informatif jika perlu."
  ].join("\n");
}
