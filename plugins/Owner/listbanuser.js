export default {
  name: "listban",
  alias: ["listbanuser", "bannedlist"],
  description: "Menampilkan daftar user yang sedang dibanned",
  tags: ["owner"],
  access: { owner: true },
  run: async (m, { conn }) => {
    try {
      const banned = Array.isArray(global.db.data.banned)
        ? global.db.data.banned.filter((b) => b && b.id)
        : [];

      if (banned.length === 0)
        return await conn.sendMessage(
          m.chat,
          { text: "✅ Tidak ada user yang sedang dibanned." },
          { quoted: m }
        );

      let teks = "乂  *L I S T  B A N N E D*\n\n";
      teks += banned
        .map((b, i) => {
          const waktu = b.time ? new Date(b.time).toLocaleString("id-ID") : "Tidak diketahui";
          return `◦ ${i + 1}. @${b.id}\n   Waktu: ${waktu}`;
        })
        .join("\n\n");

      const mentions = banned
        .filter((b) => typeof b.id === "string" && b.id.length > 5)
        .map((b) => `${b.id.replace(/[^0-9]/g, "")}@s.whatsapp.net`);

      await conn.sendMessage(
        m.chat,
        {
          text: teks,
          mentions
        },
        { quoted: m }
      );
    } catch (e) {
      console.error("❌ listban error:", e);
      await conn.sendMessage(
        m.chat,
        { text: "⚠️ Terjadi kesalahan saat menampilkan daftar banned." },
        { quoted: m }
      );
    }
  }
};
