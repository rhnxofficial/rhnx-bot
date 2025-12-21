// notifSholat.js — FINAL VERSION
import fetch from "node-fetch";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";

const FILE_PATH = "./database/group/notification/notifsholat.json";
const FILE_DIR = path.dirname(FILE_PATH);
const TZ = "Asia/Jakarta";

function ensureDir() {
  if (!fs.existsSync(FILE_DIR)) fs.mkdirSync(FILE_DIR, { recursive: true });
}

function defaultData() {
  return {
    jadwal: null,
    sudahKirimTanggal: {
      subuh: null,
      dzuhur: null,
      ashar: null,
      maghrib: null,
      isya: null
    },
    meta: { lastFetch: null, lastFetchStatus: null }
  };
}

export function loadData() {
  ensureDir();
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(defaultData(), null, 2));
    return defaultData();
  }

  try {
    return {
      ...defaultData(),
      ...JSON.parse(fs.readFileSync(FILE_PATH, "utf8"))
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data) {
  ensureDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

export function msToMidnight() {
  const now = moment().tz(TZ);
  const next = now.clone().add(1, "day").startOf("day");
  return next.diff(now);
}

function minuteDiff(t1, t2) {
  const a = moment.tz(t1, "HH:mm", TZ);
  const b = moment.tz(t2, "HH:mm", TZ);
  return a.diff(b, "minutes");
}

export async function ambilJadwal() {
  const tanggal = moment().tz(TZ).format("YYYY-MM-DD");
  const url = `https://api.myquran.com/v2/sholat/jadwal/1301/${tanggal}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.data?.jadwal) return false;

    const data = loadData();
    data.jadwal = {
      ...json.data.jadwal,
      lokasi: json.data.lokasi,
      daerah: json.data.daerah
    };
    data.meta.lastFetch = moment().tz(TZ).format();
    data.meta.lastFetchStatus = "ok";
    saveData(data);

    return true;
  } catch {
    return false;
  }
}

async function kirimNotif(conn, cid, waktu) {
  const data = loadData();
  const jadwal = data.jadwal;
  if (!jadwal) return;
  const imgSholat = {
    subuh: "https://pomf2.lain.la/f/a8kx7qr5.jpg",
    dzuhur: "https://pomf2.lain.la/f/t7m10ph5.jpg",
    ashar: "https://pomf2.lain.la/f/dn8n9y5s.jpg",
    maghrib: "https://pomf2.lain.la/f/gql8sri.jpg",
    isya: "https://pomf2.lain.la/f/b46jiomf.jpg"
  };
  const adzanUrl =
    waktu === "subuh"
      ? "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-wrj7.opus"
      : "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RC72.opus";

  let mention = [];

  if (cid.endsWith("@g.us")) {
    try {
      const meta = await conn.groupMetadata(cid);
      mention = meta.participants.map((x) => x.id);
    } catch {
      mention = [cid];
    }
  } else {
    mention = [cid];
  }

  const hariIni = moment().tz(TZ).format("dddd");
  const isJumat = hariIni === "Jumat";

  const caption = `
🕌 *Waktunya Sholat ${waktu.toUpperCase()}*
📅 ${jadwal.tanggal}
🕒 ${jadwal[waktu]} WIB
📍 ${jadwal.lokasi}, ${jadwal.daerah}

${
  isJumat
    ? "🌙 *Selamat Hari Jumat!* Jangan lupa baca Al-Kahfi 🤲🏻"
    : "✨ Yuk sholat tepat waktu, semoga harimu berkah 🙏🏻"
}
`.trim();

  await conn.sendMessage(cid, {
    audio: { url: adzanUrl },
    ptt: true,
    mimetype: "audio/mp4",
    contextInfo: {
      mentionedJid: null,
      externalAdReply: {
        showAdAttribution: false,
        renderLargerThumbnail: true,
        title: `Pengingat Sholat ${waktu}`,
        body: `${jadwal.lokasi}, ${jadwal.daerah}`,
        mediaType: 1,
        thumbnailUrl: imgSholat[waktu] || imgSholat.subuh,
        mediaUrl: "https://www.youtube.com/@rangelbot"
      }
    }
  });
}

let lock = false;

export async function cekSholat(conn) {
  if (lock) return;
  lock = true;

  try {
    const data = loadData();
    const jadwal = data.jadwal;
    if (!jadwal) return;

    const now = moment().tz(TZ);
    const nowHH = now.format("HH:mm");
    const today = now.format("YYYY-MM-DD");

    const times = {
      subuh: jadwal.subuh,
      dzuhur: jadwal.dzuhur,
      ashar: jadwal.ashar,
      maghrib: jadwal.maghrib,
      isya: jadwal.isya
    };

    for (const [nama, jam] of Object.entries(times)) {
      if (!jam) continue;

      const diff = minuteDiff(nowHH, jam);
      if (diff !== 0) continue;

      if (data.sudahKirimTanggal[nama] === today) continue;

      const chats = db.data.chats || {};
      for (const cid in chats) {
        if (chats[cid]?.notifsholat !== true) continue;

        const isGroup = cid.endsWith("@g.us");

        if (isGroup) {
          const botStatus = await conn.isBotInGroup(cid);

          if (!botStatus.inGroup) {
            console.log(`⚠️ Skip notif sholat — bot tidak ada di grup ${cid}`);
            continue;
          }

          // (Optional) ❌ Bot bukan admin → skip audio (karena beberapa grup butuh admin)
          // if (!botStatus.isAdmin) {
          //   console.log(`⚠️ Skip — bot bukan admin di grup ${cid}`);
          //   continue;
          // }
        }

        await kirimNotif(conn, cid, nama);
      }

      data.sudahKirimTanggal[nama] = today;
      saveData(data);
    }
  } finally {
    lock = false;
  }
}

export default {
  ambilJadwal,
  cekSholat,
  loadData,
  saveData,
  msToMidnight
};
