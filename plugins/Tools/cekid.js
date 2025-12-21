export default {
  name: "cekid",
  alias: ["cekidgc", "cekidch", "ceklink"],
  description: "Cek ID Group atau Channel WhatsApp dari link",
  access: { group: false },

  run: async (m, { conn, args }) => {
    try {
      if (!args[0]) {
        return m.reply(
          "❗ Contoh penggunaan:\n\n" +
            ".cekid https://chat.whatsapp.com/xxxxx\n" +
            ".cekid https://whatsapp.com/channel/xxxxx"
        );
      }

      const input = args[0].trim();

      if (input.includes("whatsapp.com/channel/")) {
        const invite = input.split("channel/")[1]?.split("?")[0];
        if (!invite) return m.reply("❗ Link channel tidak valid.");

        const data = await conn.newsletterMetadata("invite", invite);
        const meta = data.thread_metadata;

        return m.reply(
          `乂 *CHANNEL DITEMUKAN*\n\n` +
            `◦ ID Channel:\n${data.id}\n\n` +
            `◦ Nama: ${meta.name?.text || "-"}\n` +
            `◦ Subscribers: ${meta.subscribers_count || "0"}\n` +
            `◦ Status: ${data.state?.type || "-"}\n` +
            `◦ Verifikasi: ${meta.verification || "UNVERIFIED"}\n\n` +
            `◦ Deskripsi:\n${meta.description?.text || "-"}`
        );
      }

      if (input.includes("chat.whatsapp.com/")) {
        const invite = input.split("chat.whatsapp.com/")[1]?.split("?")[0];
        if (!invite) return m.reply("❗ Link grup tidak valid.");

        const data = await conn.groupGetInviteInfo(invite);

        return m.reply(
          `乂 *GROUP DITEMUKAN*\n\n` +
            `◦ ID Group:\n${data.id}\n\n` +
            `◦ Nama: ${data.subject}\n` +
            `◦ Member: ${data.size}\n` +
            `◦ Admin: ${data.participants?.filter((p) => p.admin).length || 0}\n` +
            `◦ Deskripsi:\n${data.desc || "-"}`
        );
      }

      return m.reply("❗ Link tidak dikenali. Gunakan link Group atau Channel WhatsApp.");
    } catch (err) {
      console.error(err);
      m.reply("❗ Gagal mengambil data. Pastikan link valid & bot tidak diblokir.");
    }
  }
};
