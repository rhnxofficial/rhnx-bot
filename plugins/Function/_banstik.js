export default {
  name: "antiBanstikHook",
  description: "Hook otomatis menghapus stiker yang dibanned di grup",
  type: "hook",

  before: async (m, { conn }) => {
    try {
      if (!m.isGroup) return;
      if (m.type !== "stickerMessage") return;

      const chat = global.db.data.chats[m.chat];
      if (!chat || typeof chat.banstik !== "object") return;

      const hash = m.message?.stickerMessage?.fileSha256?.toString("base64");
      if (!hash) return;

      if (chat.banstik[hash]) {
        await conn.sendMessage(
          m.chat,
          {
            text: styleSmallCaps(
              "乂 *B A N S T I K* \n\nStiker ini dibanned di grup ini dan telah dihapus."
            ),
            mentions: [m.sender]
          },
          { quoted: fkontak }
        );

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.id,
            participant: m.sender
          }
        });

        console.log(`Stiker dibanned terdeteksi & dihapus di ${m.chat}`);
      }
    } catch (e) {
      console.error("Error di antiBanstikHook:", e);
    }
  }
};
