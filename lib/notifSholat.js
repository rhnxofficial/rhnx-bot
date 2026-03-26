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
      sahur: null,
      imsak: null,
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

  const img = {
    sahur: "https://files.catbox.moe/i5eqb0.jpg",
    imsak: "https://files.catbox.moe/i5eqb0.jpg",
    subuh: "https://pomf2.lain.la/f/a8kx7qr5.jpg",
    dzuhur: "https://pomf2.lain.la/f/t7m10ph5.jpg",
    ashar: "https://pomf2.lain.la/f/dn8n9y5s.jpg",
    maghrib: "https://pomf2.lain.la/f/gql8sri.jpg",
    isya: "https://pomf2.lain.la/f/b46jiomf.jpg"
  };

  const sound = {
    sahur: "https://files.catbox.moe/8y169y.opus",
    imsak: "https://files.catbox.moe/697hev.opus",
    subuh: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-wrj7.opus",
    dzuhur: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RC72.opus",
    ashar: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RC72.opus",
    maghrib: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RC72.opus",
    isya: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RC72.opus"
  };

  let mention = [];

  if (waktu === "sahur") {
    if (cid.endsWith("@g.us")) {
      try {
        const meta = await conn.groupMetadata(cid);
        mention = meta.participants.map(v => v.id);
      } catch {
        mention = [];
      }
    } else {
      mention = [cid];
    }
  }

  const jam =
    waktu === "sahur"
      ? "03:15"
      : waktu === "imsak"
      ? jadwal.imsak
      : jadwal[waktu];

  let title = "";
  let pesan = "";

  if (waktu === "sahur") {
    title = "Waktu Sahur";
    pesan = "🌙 Waktu sahur telah tiba, selamat makan sahur!";
  } else if (waktu === "imsak") {
    title = "Waktu Imsak";
    pesan = "⏰ Waktu imsak telah tiba, persiapkan untuk sholat Subuh";
  } else {
    title = `Waktu Sholat ${waktu}`;
    pesan = "🕌 Jangan lupa sholat tepat waktu";
  }

  await conn.sendMessage(cid, {
    audio: { url: sound[waktu] },
    ptt: true,
    mimetype: "audio/mp4",

    contextInfo: {
      mentionedJid: mention,

      externalAdReply: {
        showAdAttribution: false,
        renderLargerThumbnail: true,

        title: title,
        body: `${jadwal.lokasi}, ${jadwal.daerah}`,

        mediaType: 1,
        thumbnailUrl: img[waktu],
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
      sahur: "03:15",
      imsak: jadwal.imsak,
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

        if (!chats[cid]?.notifsholat) continue;

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
