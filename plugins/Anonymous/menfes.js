import fs from "fs";
import { uploadToGithub } from "../../lib/uploader.js";

const MENFES_FILE = "./database/private/menfes.json";

function readDB() {
  if (!fs.existsSync(MENFES_FILE)) return {};
  return JSON.parse(fs.readFileSync(MENFES_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(MENFES_FILE, JSON.stringify(data, null, 2));
}

export default {
  name: "menfes",
  alias: ["menfess", "kirimmenfes"],
  description: "Kirim pesan anonim (teks/gambar/video) ke seseorang via bot",
  access: { private: true },

  run: async (m, { conn, prefix, command }) => {
    const text = m.text?.trim();

    const isMedia =
      m.type?.startsWith("image") ||
      m.type?.startsWith("video") ||
      m.quoted?.type?.startsWith("image") ||
      m.quoted?.type?.startsWith("video");

    if (!text && !isMedia)
      return m.reply(
        `📮 *Cara penggunaan:*\n\n${prefix + command} nomor|nama pengirim|pesan\n\n📌 *Contoh:*\n${prefix + command} 6281234567890|Anonymous|Halo! Bisa juga reply atau kirim gambar/video langsung.`
      );

    let [jid, name, pesan] = text ? text.split("|") : ["", "", ""];
    if (!jid) return m.reply("⚠️ Nomor penerima tidak ditemukan.");
    if (!name) name = "Anonymous";
    if (!pesan && !isMedia)
      return m.reply(
        `📮 *Cara penggunaan:*\n\n${prefix + command} nomor|nama pengirim|pesan\n\n📌 *Contoh:*\n${prefix + command} 6281234567890|Anonymous|Halo! Bisa juga kirim media.`
      );

    jid = jid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    const data = (await conn.onWhatsApp(jid))[0] || {};
    if (!data.exists) return m.reply("❌ Nomor tidak terdaftar di WhatsApp.");
    if (jid === m.sender) return m.reply("😅 Gak bisa kirim ke diri sendiri.");

    const penerimaLid = data?.lid || data?.idLid || m.key?.participantLid;
    const menfesDB = readDB();
    let mediaUrl = "";

    if (isMedia) {
      const media = m.quoted || m;
      const savedFile = await media.downloadAndSave();
      if (!savedFile) return m.reply("❌ Tidak ada media untuk diupload.");

      const buffer = fs.readFileSync(savedFile);
      mediaUrl = await uploadToGithub(buffer);
      fs.unlinkSync(savedFile);
    }

    const id = Date.now();

    menfesDB[id] = {
      id,
      dari: m.sender,
      nama: name,
      penerima: jid,
      pesan: pesan || "",
      mediaUrl,
      balasan: [],
      status: false,
      lastChat: m.sender,
      waktu: new Date().toISOString()
    };
    saveDB(menfesDB);

    const teksPesan =
      `💌 *Hai!* Kamu dapat pesan anonim!\n\n` +
      `📝 *Dari*: ${name}\n\n` +
      `${pesan ? `"${pesan}"\n\n` : ""}` +
      `${mediaUrl ? "📎 Ada media dilampirkan.\n\n" : ""}` +
      `💬 Mau bales? Balas pesan ini langsung ya 😉`;

    await conn.sendMessage(
      penerimaLid,
      mediaUrl
        ? {
            ...(m.quoted?.type?.startsWith("image") || m.type?.startsWith("image")
              ? { image: { url: mediaUrl } }
              : { video: { url: mediaUrl } }),
            caption: teksPesan
          }
        : { text: teksPesan }
    );

    return m.reply(`✅ *Menfes berhasil dikirim!* ke @${jid.split("@")[0]}`);
  }
};
