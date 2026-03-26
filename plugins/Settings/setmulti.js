export default {
  name: "setmulti",
  alias: ["multi"],
  description: "Aktifkan atau nonaktifkan Multi Prefix",
  access: { owner: true },
  async run(m, { args, setReply, prefix }) {
    const pilihan = (args[0] || "").toLowerCase();
    const valid = ["on", "off"];

    if (!pilihan || !valid.includes(pilihan)) {
      return m.reply(
        `📋 Status Multi Prefix saat ini: ${db.data.settings.multi ? "ON" : "OFF"}\n\n` +
          `Gunakan:\n• ${prefix}setmulti on  → Mengaktifkan Multi Prefix\n` +
          `• ${prefix}setmulti off → Menonaktifkan Multi Prefix`
      );
    }

    db.data.settings.multi = pilihan === "on";
    await setReply(`✅ Multi Prefix berhasil diubah menjadi: ${pilihan.toUpperCase()}`);
  }
};
