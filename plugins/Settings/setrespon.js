export default {
  name: "setrespon",
  alias: ["setresponstyle"],
  description: "Ubah tipe respon otomatis bot (auto / sticker / vn / text)",
  access: { owner: true },

  async run(m, { args, prefix }) {
    const pilihan = (args[0] || "").toLowerCase();
    const valid = ["auto", "sticker", "vn", "text"];

    if (!pilihan)
      return m.reply(
        `📋 *Tipe respon saat ini:* ${db.data.settings.respontype || "auto"}\n\n` +
          `Gunakan:\n• ${prefix}setrespon auto\n• ${prefix}setrespon sticker\n• ${prefix}setrespon vn\n• ${prefix}setrespon text`
      );

    if (!valid.includes(pilihan))
      return m.reply(
        `❌ Pilihan tidak valid!\n\nGunakan salah satu:\n- auto\n- sticker\n- vn\n- text`
      );

    db.data.settings.respontype = pilihan;
    await m.reply(`✅ Berhasil mengubah tipe respon ke *${pilihan.toUpperCase()}*`);
  }
};
