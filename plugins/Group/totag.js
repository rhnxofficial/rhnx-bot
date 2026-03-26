import fs from "fs";

export default {
  name: "totag",
  description: "Menandai semua member dengan pesan yang direply",
  access: { group: true, admin: true },

  run: async (m, { conn, setReply }) => {
    try {
      if (!m.quoted) return setReply("Reply pesan yang ingin di-tag semua member!");

      const metadata = await conn.groupMetadata(m.chat);
      const participants = metadata.participants || [];
      const mentions = participants.map((a) => a.id);

      let savedFile;
      if (m.quoted.msg && m.quoted.type !== "conversation") {
        savedFile = await m.quoted.downloadAndSave();
      }

      if (savedFile && fs.existsSync(savedFile)) {
        await conn.sendMessage(
          m.chat,
          {
            [m.quoted.type.replace("Message", "")]: { url: savedFile },
            caption: m.quoted.text || "",
            mentions
          },
          { quoted: m }
        );
        fs.unlinkSync(savedFile);
      } else {
        const teks = m.quoted.text || "Pesan kosong";
        await conn.sendMessage(
          m.chat,
          {
            text: teks,
            mentions
          },
          { quoted: m }
        );
      }
    } catch (e) {
      console.error(e);
      await setReply("❌ Gagal menandai semua anggota dengan pesan tersebut.");
    }
  }
};
