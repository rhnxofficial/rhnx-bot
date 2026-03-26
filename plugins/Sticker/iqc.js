import fetch from "node-fetch";
import moment from "moment-timezone";

export default {
  name: "iqc",
  description: "Generate iPhone quoted text image (pakai waktu sekarang)",
  access: { public: true },

  async run(m, { conn, args }) {
    try {
      const text = args.join(" ").trim();
      if (!text) return m.reply("⚠️ Masukkan teks!\nContoh: .iqc Halo dunia");

      const timeNow = moment().tz("Asia/Jakarta").format("HH:mm");

      const url = `https://brat.siputzx.my.id/iphone-quoted?time=${timeNow}&batteryPercentage=90&carrierName=AXIS&messageText=${encodeURIComponent(
        text
      )}&emojiStyle=apple`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Gagal fetch: ${res.statusText}`);

      const buffer = await res.arrayBuffer();

      await conn.sendMessage(
        m.chat,
        {
          image: Buffer.from(buffer),
          caption: `🕒 ${timeNow} WIB\n💬 Pesan: ${text}`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error("❌ Error iqc:", e);
      m.reply("❌ Gagal generate IQC.");
    }
  }
};
