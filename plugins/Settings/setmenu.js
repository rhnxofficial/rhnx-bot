export default {
  name: "setmenu",
  alias: ["setmenustyle"],
  description: "Ubah tampilan menu utama bot (thumbnail / button)",
  access: { owner: true },
  async run(m, { args, prefix }) {
    const pilihan = (args[0] || "").toLowerCase();
    const valid = ["thumbnail","gif", "button"];

    if (!pilihan)
      return m.reply(
        `📋 *Setelan menu saat ini:* ${db.data.settings.setmenu || "thumbnail"}\n\n` +
          `Gunakan:
${tanda.awal} ${prefix}setmenu thumbnail
${tanda.awal} ${prefix}setmenu gif 
${tanda.awal} ${prefix}setmenu button`
      );

    if (!valid.includes(pilihan))
      return m.reply(`❌ Pilihan tidak valid!\n\nGunakan salah satu:\n- thumbnail\n- button`);

    db.data.settings.setmenu = pilihan;
    await m.reply(`✅ Berhasil mengubah tampilan menu ke *${pilihan.toUpperCase()}*`);
  }
};
