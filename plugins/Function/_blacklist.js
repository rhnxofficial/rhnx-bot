export default {
  name: "antiBlacklistHook",
  description: "Hook otomatis menghapus pesan dari user yang diblacklist di grup",
  type: "hook",

  before: async (m, { conn }) => {
    try {
      if (!m.isGroup) return;

      const chatData = global.db.data.chats[m.chat];
      if (!chatData || !Array.isArray(chatData.blacklist)) return;

      const blacklist = chatData.blacklist;
      const sender = m.sender;

      if (blacklist.includes(sender)) {
        await conn.sendMessage(m.chat, {
          delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }
        });
      }
    } catch (e) {
      console.error("Error di antiBlacklistHook:", e);
    }
  }
};
