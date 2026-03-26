// creator by RHNX

import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { uploadToGithub } from "../../lib/uploader.js";

const dbPath = "./database/group/notification/tugas.json";
const TIMEZONE = "Asia/Jakarta";

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export default {
  name: "addtugas",
  alias: ["settugas"],
  description: "Menambahkan tugas (teks / media)",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { args }) => {
    try {
      const text = args.join(" ");
      const [jam, title, message] = text.split("|");

      if (!jam || !title || !message) {
        return m.reply(
          "❗ Format salah\n\n" +
            "Format:\n.addtugas jam|judul|pesan\n\n" +
            "Contoh:\n.addtugas 12:00|Belajar|Kerjakan halaman 10"
        );
      }

      const time = moment.tz(jam.trim(), "HH:mm", TIMEZONE);
      if (!time.isValid()) {
        return m.reply("❗ Format jam harus HH:mm");
      }

      const isMediaMessage = (msg) =>
        msg &&
        [
          "imageMessage",
          "videoMessage",
          "audioMessage",
          "documentMessage",
          "stickerMessage"
        ].includes(msg.type);

      const target = isMediaMessage(m.quoted) ? m.quoted : isMediaMessage(m) ? m : null;

      let media = null;

      if (target) {
        const savedFile = await target.downloadAndSave();

        if (savedFile) {
          const buffer = fs.readFileSync(savedFile);
          const url = await uploadToGithub(buffer);

          let mediaType = "document";
          if (target.type === "imageMessage") mediaType = "image";
          else if (target.type === "videoMessage") mediaType = "video";
          else if (target.type === "audioMessage") mediaType = "audio";
          else if (target.type === "stickerMessage") mediaType = "sticker";

          media = {
            url,
            type: mediaType
          };

          fs.unlinkSync(savedFile);
        }
      }

      let data = [];
      if (fs.existsSync(dbPath)) {
        data = JSON.parse(fs.readFileSync(dbPath));
      }

      const newId = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1;

      data.push({
        id: newId,
        groupId: m.chat,
        time: time.format("HH:mm"),
        title: title.trim(),
        message: message.trim(),
        media,
        createdAt: moment.tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss"),
        lastTrigger: null
      });

      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

      m.reply(
        `✅ *Tugas Berhasil Ditambahkan*\n\n` +
          `◦ ID     : ${newId}\n` +
          `◦ Jam    : ${time.format("HH:mm")}\n` +
          `◦ Judul  : ${title.trim()}\n` +
          `◦ Media  : ${media ? media.type : "Tidak ada"}`
      );
    } catch (err) {
      console.error("❌ addtugas error:", err);
      m.reply("❗ Terjadi error saat menambahkan tugas.");
    }
  }
};
