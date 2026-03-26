export default {
  name: "setprefix",
  alias: ["prefix"],
  description:
    "Ubah prefix command bot (boleh emoji atau karakter bebas), hanya jika Multi Prefix nonaktif",
  access: { owner: true },

  async run(m, { args, setReply, prefix }) {
    const newPrefix = args[0];
    const multi = db.data.settings.multi;

    if (multi) {
      return m.reply(
        "❌ Setprefix hanya dapat digunakan saat Multi Prefix aktif. Matikan Multi Prefix terlebih dahulu."
      );
    }

    if (!newPrefix) {
      return m.reply(
        `📋 *Prefix saat ini:* ${db.data.settings.prefix || "!"}\n\n` +
          `Gunakan:\n• ${prefix}setprefix [prefix baru]\nContoh: ${prefix}setprefix 🔥`
      );
    }

    db.data.settings.prefix = newPrefix;
    await setReply(`✅ Berhasil mengubah prefix menjadi: *${newPrefix}*`);
  }
};
