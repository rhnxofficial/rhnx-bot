import fs from "fs";

export default {
  name: "hidetag",
  description: "Mention semua member tanpa terlihat di pesan (support media & quoted)",
  access: { group: true, admin: true },

  run: async (m, { conn, q }) => {
    const text = q;
    if (!m.isGroup) return m.reply("❌ Fitur ini hanya bisa digunakan di grup.");

    const metadata = await conn.groupMetadata(m.chat);
    const members = metadata.participants.map((v) => v.id);
    if (!members.length) return m.reply("⚠️ Tidak ada anggota di grup ini.");

    let savedFile;
    let caption = text || m.quoted?.text || "";
    if (m.quoted) {
      savedFile = await m.quoted.downloadAndSave();
    } else {
      savedFile = await m.downloadAndSave();
    }
    if (savedFile && fs.existsSync(savedFile)) {
      const buffer = fs.readFileSync(savedFile);
      const mime = m.type || m.quoted?.type || "";
      const type = mime.includes("video")
        ? "video"
        : mime.includes("audio")
          ? "audio"
          : mime.includes("document")
            ? "document"
            : mime.includes("sticker")
              ? "sticker"
              : "image";

      await conn.sendMessage(
        m.chat,
        {
          [type]: buffer,
          caption,
          mentions: members
        },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: caption || "👋 Halo semuanya!",
          mentions: members
        },
        { quoted: m }
      );
    }
  }
};
