export default {
  name: "setmenu",
  alias: ["setmenustyle"],
  description: "Ubah tampilan menu utama bot (thumbnail / button)",
  access: { owner: true },
  async run(m, { args }) {
    const pilihan = (args[0] || "").toLowerCase();
    const valid = ["thumbnail", "button"];

    if (!pilihan)
      return m.reply(
        `📋 *Setelan menu saat ini:* ${db.data.settings.setmenu || "thumbnail"}\n\n` +
          `Gunakan:\n• ${m.prefix}setmenu thumbnail\n• ${m.prefix}setmenu button`
      );

    if (!valid.includes(pilihan))
      return m.reply(`❌ Pilihan tidak valid!\n\nGunakan salah satu:\n- thumbnail\n- button`);

    db.data.settings.setmenu = pilihan;
    await m.reply(`✅ Berhasil mengubah tampilan menu ke *${pilihan.toUpperCase()}*`);
  }
};
