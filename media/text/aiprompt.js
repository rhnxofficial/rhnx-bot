import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import axios from "axios";

function safeParse(json, fallback = {}) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

const dbPath = "./database/database.json";

export function readDatabase() {
  try {
    delete require.cache[require.resolve(dbPath)];
  } catch {}
  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    return safeParse(raw, { users: {}, chats: {}, settings: {} });
  } catch {
    return { users: {}, chats: {}, settings: {} };
  }
}

export function writeDatabase(data) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const memoriPath = "./database/group/simi/sessions/memori.json";
export function readMemori() {
  try {
    delete require.cache[require.resolve(memoriPath)];
  } catch {}
  if (!fs.existsSync(memoriPath)) return [];
  const raw = fs.readFileSync(memoriPath, "utf-8");
  const data = safeParse(raw, []);
  return Array.isArray(data) ? data : [];
}

export function writeMemori(memori) {
  fs.mkdirSync(path.dirname(memoriPath), { recursive: true });
  fs.writeFileSync(memoriPath, JSON.stringify(memori, null, 2));
}

const storePath = "./database/store/groupstore.json";

export function readGroupStore() {
  try {
    delete require.cache[require.resolve(storePath)];
  } catch {}

  if (!fs.existsSync(storePath)) return [];

  const raw = fs.readFileSync(storePath, "utf-8");
  const data = safeParse(raw, []);

  return Array.isArray(data) ? data : [];
}

export function writeGroupStore(data) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

export function getGroupStoreIds() {
  const data = readGroupStore();
  return data.map((v) => v.idGc);
}
export async function handleTikTokDownload(conn, m, tiktokUrl) {
  try {
    const apiUrl = `${api.rhnx}/api/downloader/tiktok?url=${encodeURIComponent(
      tiktokUrl
    )}&key=${key.rhnx}`;

    const { data } = await axios.get(apiUrl);
    if (!data?.success || !data?.data)
      return conn.sendMessage(
        m.chat,
        { text: "❌ Gagal mengambil data dari TikTok 😅" },
        { quoted: m }
      );

    const result = data.data;
    const caption = `🎵 *${result.title || "Tanpa judul"}*\n👤 @${result.username}\n🎶 ${
      result.musicTitle || "Tanpa musik"
    }`;

    if (result.type === "image" && Array.isArray(result.images) && result.images.length > 0) {
      for (const img of result.images) {
        await conn.sendMessage(m.chat, { image: { url: img }, caption }, { quoted: m });
      }
    } else {
      const videoUrl = result.noWatermark || result.play || result.watermark;
      if (!videoUrl)
        return conn.sendMessage(
          m.chat,
          { text: "⚠️ Tidak menemukan URL video yang valid." },
          { quoted: m }
        );
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m });
    }
    const memori = readMemori();
    memori.push({
      status: true,
      sender: m.sender,
      chat: m.chat,
      title: result.title || "(tanpa judul)",
      author: result.author,
      username: result.username,
      type: result.type || "video",
      url: tiktokUrl,
      videoUrl: result.noWatermark || result.play,
      images: result.images || [],
      music: result.music || "",
      downloadedAt: new Date().toISOString()
    });
    writeMemori(memori);
  } catch (err) {
    console.error("Error TikTok download:", err.response?.data || err.message);
    await conn.sendMessage(
      m.chat,
      {
        text: `Terjadi error saat ambil data TikTok 😓\n\n🧩 *Detail:* ${err.message || "Unknown error"}`
      },
      { quoted: m }
    );
  }
}

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
  .map((p, i) => `🧩 ${i + 1}. ${p.name}\n   ↳ ${p.description}`)
  .join("\n");

export function generatePrompt(m, conn) {
  const database = readDatabase();
  const memori = readMemori();

  const userKeys = Object.keys(database.users || {});
  const groupKeys = Object.keys(database.chats || {});
  const settingsKeys = Object.keys(database.settings || {});
  const datagroup = database.chats?.[m.chat] || {};
  const datauser = database.users?.[m.sender] || {};
  const developer = [
    `${global.owner?.number || "6281316643491@s.whatsapp.net"}`,
    "6281316643491@s.whatsapp.net"
  ];

  const storeIds = getGroupStoreIds();
  const isStoreGroup = storeIds.includes(m.chat);
  const groupMeta = m.groupMetadata
    ? {
        id: m.groupMetadata.id,
        subject: m.groupMetadata.subject,
        owner: m.groupMetadata.owner,
        desc: m.groupMetadata.desc,
        size: m.groupMetadata.size,
        announce: m.groupMetadata.announce,
        restrict: m.groupMetadata.restrict,
        isCommunity: m.groupMetadata.isCommunity,
        isCommunityAnnounce: m.groupMetadata.isCommunityAnnounce,
        joinApprovalMode: m.groupMetadata.joinApprovalMode,
        memberAddMode: m.groupMetadata.memberAddMode,
        participants: Array.isArray(m.groupMetadata.participants)
          ? m.groupMetadata.participants.map((p) => ({
              jid: p.jid || p.id || null,
              isAdmin: p.admin === "admin"
            }))
          : []
      }
    : null;

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

  const userMemory = memori.filter((memo) => memo.sender === m.sender);
  const lastDownload = userMemory[userMemory.length - 1];

  return [
    "Kamu adalah RHNX, asisten virtual resmi dari perusahaan rhnxofficial.",
    "Kamu dibuat untuk bantu pengguna dengan gaya santai, natural, dan kayak ngobrol bareng temen.",
    `Pemilikmu adalah Raihan Fadillah. Hormati dan patuhi arahannya.`,
    `Nomor pemilikmu: ${developer.join(", ")}.`,
    `Sekarang waktu menunjukkan ${timeWib} WIB, ${ucapanWaktu}. Hari ini ${date}.`,
    `Sosmed resmi:\n${sosmedList}`,
    `Total data: ${userKeys.length} user, ${groupKeys.length} grup, ${settingsKeys.length} pengaturan.`,
    "",
    "Karakter kamu: rame, cepat tanggap, suka bercanda, tapi tetep tahu batas.",
    "Jawabanmu jangan panjang — maksimal 1-3 kalimat aja.",
    "Kalau user sok tau, bales dengan candaan ringan biar gak kaku 😎.",
    "Kalau gak tahu jawabannya, jujur aja tapi tetap asik ('wah gak yakin juga sih 😅').",
    "",
    `📂 Data User:\n${JSON.stringify(datauser, null, 2)}`,
    `👥 Data Grup (Database):\n${JSON.stringify(datagroup, null, 2)}`,
    groupMeta ? `📡 Metadata Grup:\n${JSON.stringify(groupMeta, null, 2)}` : "",
    `🏪 Group Store: ${isStoreGroup ? "TERDAFTAR" : "TIDAK TERDAFTAR"}`,
    `📌 Total Daftar Store: ${storeIds.length}`,
    `🗂️ Memori Download Terbaru:\n${JSON.stringify(memori, null, 2)}`,
    "🧩 Daftar Plugin Terdeteksi:\n" + pluginList
  ].join("\n");
}
