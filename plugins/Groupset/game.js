// Created by Raihan
export default {
  name: "game",
  access: { group: true, admin: true },
  description: "Aktifkan / Nonaktifkan fitur game di grup",

  run: async (m, { args, conn }) => {
    let chat = global.db.data.chats[m.chat];

    if (!chat) {
      global.db.data.chats[m.chat] = { game: false };
      chat = global.db.data.chats[m.chat];
    }

    if (!args[0])
      return m.reply(
        `🎮 *Status Game saat ini:* ${chat.game ? "AKTIF" : "NONAKTIF"}\n\n` +
          `Gunakan:\n• *.game on* — untuk mengaktifkan\n• *.game off* — untuk menonaktifkan`
      );

    const input = args[0].toLowerCase();

    if (["on", "aktif", "enable"].includes(input)) {
      if (chat.game) return m.reply("🎮 Game sudah aktif dari tadi bego.");

      chat.game = true;
      return m.reply("✅ *Game berhasil diaktifkan!*");
    }

    if (["off", "nonaktif", "disable"].includes(input)) {
      if (!chat.game) return m.reply("🎮 Game sudah nonaktif, goblok.");

      chat.game = false;
      return m.reply("❌ *Game berhasil dinonaktifkan.*");
    }

    return m.reply("Format salah!\nGunakan *.game on* atau *.game off*");
  }
};
