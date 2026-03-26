export default {
  name: "blockgc",
  alias: ["blgc", "blockgc"],
  description: "Block / unblock bot di grup (GC)",
  access: { owner: true },
  run: async (m, { q }) => {
    const chatId = m.chat
    const chat = global.db.data.chats[chatId]

    if (!q)
      return m.reply("❗ Masukin query: `on` buat block, `off` buat unblock")

    const status = q.toLowerCase()

    if (status === "on") {
      if (chat.blockgc)
        return m.reply("🤡 GC ini udah di-block!")

      chat.blockgc = true
      m.reply("🚫 GC berhasil di-block. Bot nggak bakal respon di sini 😎")

    } else if (status === "off") {
      if (!chat.blockgc)
        return m.reply("😅 GC ini belum di-block kok!")

      chat.blockgc = false
      m.reply("✅ GC berhasil di-unblock. Bot aktif lagi 🚀")

    } else {
      m.reply("❗ Query nggak valid. Gunakan `on` atau `off`.")
    }
  }
}