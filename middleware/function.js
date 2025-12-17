// created ny RHNX

import fs from "fs";
import moment from "moment-timezone";

const alarmPath = "./database/group/notification/alarm.json";
const TIMEZONE = "Asia/Jakarta";

export const notifGcAlarm = async (conn) => {
  try {
    if (!fs.existsSync(alarmPath)) return;

    const alarms = JSON.parse(fs.readFileSync(alarmPath, "utf8"));
    if (!alarms.length) return;

    const now = moment.tz(TIMEZONE);
    const currentTime = now.format("HH:mm");
    const today = now.format("YYYY-MM-DD");

    for (const alarm of alarms) {
      if (alarm.time !== currentTime) continue;
      if (alarm.lastTrigger === today) continue;

      const botCheck = await conn.isBotInGroup(alarm.groupId);
      if (!botCheck.inGroup) continue;

      let mems = [];
      try {
        const meta = await conn.groupMetadata(alarm.groupId);
        mems = meta?.participants?.map((p) => p.id) || [];
      } catch (e) {
        console.error("Gagal ambil member grup:", e?.message || e);
      }

      let teksAlarm = styleText(`*🔔 ALARM TIBA!*  

◦ *Waktu:* ${alarm.time}  
◦ *Nama Alarm:* ${alarm.name}  
◦ *Pesan Alarm:* "${alarm.message}"\n

⏰ *Segera siapkan diri untuk aktivitas berikutnya!`);

      await conn.sendMessage(alarm.groupId, {
        image: { url: "https://files.catbox.moe/q97x4s.jpeg" },
        caption: teksAlarm,
        contextInfo: { mentionedJid: mems }
      });

      await conn.sendMessage(alarm.groupId, {
        audio: {
          url: "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-59bl.opus"
        },
        mimetype: "audio/mp4",
        ptt: true
      });

      alarm.lastTrigger = today;
    }

    fs.writeFileSync(alarmPath, JSON.stringify(alarms, null, 2));
  } catch (err) {
    console.error("Alarm Runner Error:", err?.message || err);
  }
};

export async function notifGcOpenClose(conn) {
  try {
    const dbPath = "./database/group/notification/openclose.json";
    if (!fs.existsSync(dbPath)) return;

    let data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (!Array.isArray(data) || !data.length) return;

    const now = moment.tz(TIMEZONE);
    const currentTime = now.format("HH:mm");
    const today = now.format("YYYY-MM-DD");

    let updated = false;
    for (const item of data) {
      if (item.time !== currentTime) continue;

      if (item.lastTrigger === today) continue;

      const botCheck = await conn.isBotInGroup(item.groupId);
      if (!botCheck.inGroup || !botCheck.isAdmin) continue;

      const groupMetadata = await conn.groupMetadata(item.groupId).catch(() => null);
      if (!groupMetadata) continue;

      let mems = groupMetadata.participants.map((p) => p.id);

      if (item.type === "close") {
        await conn.groupSettingUpdate(item.groupId, "announcement");

        let teksTutup = `🔒 Grup telah *ditutup* pada waktu yang dijadwalkan (${item.time}). Hanya admin yang dapat mengirim pesan.\n\n📄 *Alasan:* ${item.reason || "Tidak ada alasan yang diberikan."}`;
        await conn.sendMessage(item.groupId, {
          text: styleText(teksTutup),
          mentions: mems
        });
      }

      if (item.type === "open") {
        await conn.groupSettingUpdate(item.groupId, "not_announcement");

        let teksBuka = `🔓 Grup telah *dibuka* pada waktu yang dijadwalkan (${item.time}). Anggota kini dapat mengirim pesan.\n\n📄 *Alasan:* ${item.reason || "Tidak ada alasan yang diberikan."}`;

        await conn.sendMessage(item.groupId, {
          text: styleText(teksBuka),
          mentions: mems
        });
      }

      item.lastTrigger = today;
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("❌ notifGcOpenClose error:", err);
  }
}

export async function notifGcTugas(conn) {
  try {
    const DB_PATH = "./database/group/notification/tugas.json";
    if (!fs.existsSync(DB_PATH)) return;

    let data = JSON.parse(fs.readFileSync(DB_PATH));
    if (!Array.isArray(data) || !data.length) return;

    const now = moment.tz(TIMEZONE);
    const today = now.format("YYYY-MM-DD");
    const currentTime = now.format("HH:mm");

    let updated = false;

    for (const task of data) {
      if (!task.groupId || !task.time) continue;
      if (task.time !== currentTime) continue;
      if (task.lastTrigger === today) continue;

      const check = await conn.isBotInGroup(task.groupId);
      if (!check.inGroup) continue;

      let meta;
      try {
        meta = await conn.groupMetadata(task.groupId);
      } catch {
        continue;
      }

      const mems = meta?.participants?.map((p) => p.id) || [];

      const text =
        `📚 *TUGAS HARI INI*\n\n` +
        `◦ Jam   : ${task.time}\n` +
        `◦ Judul : ${task.title}\n\n` +
        `${task.message}`;

      try {
        if (task.media?.type === "audio" && task.media.url) {
          await conn.sendMessage(task.groupId, {
            audio: { url: task.media.url },
            mimetype: "audio/mpeg",
            ptt: false
          });

          await conn.sendMessage(task.groupId, {
            text,
            mentions: mems
          });
        } else if (task.media?.type === "video" && task.media.url) {
          await conn.sendMessage(task.groupId, {
            video: { url: task.media.url },
            caption: text,
            mentions: mems
          });
        } else if (task.media?.type === "image" && task.media.url) {
          await conn.sendMessage(task.groupId, {
            image: { url: task.media.url },
            caption: text,
            mentions: mems
          });
        } else if (task.media?.type === "document" && task.media.url) {
          await conn.sendMessage(task.groupId, {
            document: { url: task.media.url },
            caption: text,
            mentions: mems
          });
        } else {
          await conn.sendMessage(task.groupId, {
            text,
            mentions: mems
          });
        }

        task.lastTrigger = today;
        updated = true;
      } catch (err) {
        console.error("❌ Gagal kirim tugas:", err?.message || err);
      }
    }

    if (updated) {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("❌ notifGcTugas error:", err?.message || err);
  }
  }
