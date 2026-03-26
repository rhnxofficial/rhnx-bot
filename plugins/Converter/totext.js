"use strict";

export default {
  name: "totext",
  description: "Baca isi dokumen teks dari pesan yang direply",
  async run(m, { conn }) {
    if (!m.quoted) return m.reply("📎 Reply ke dokumen teks dulu!");

    const quotedType = m.quoted?.type || "";
    if (!/document/i.test(quotedType)) return m.reply("❌ Pesan yang direply bukan dokumen!");

    const text = await m.quoted.getFileContent?.();
    if (!text) return m.reply("⚠️ Gagal membaca isi file atau bukan file teks.");

    await m.reply(text);
  }
};
