export default {
  name: "sewabot",
  description: "Informasi penyewaan bot",
  async run(m, { conn }) {
    const harga = {
      minggu: "Rp 5.000",
      bulan: "Rp 15.000",
      permanen: "Rp 50.000"
    };

    const owner = global.owner.contact + "@s.whatsapp.net";

    let text = styleText(`
🤖 *SEWA BOT WHATSAPP* 🤖

Ingin bot standby 24 jam di grup kamu?

💰 *Harga Sewa Bot:*
• 1 Minggu   : *${harga.minggu}*
• 1 Bulan    : *${harga.bulan}*
• Permanen   : *${harga.permanen}*

📞 *Cara Sewa:*
Silakan hubungi owner:
@${owner.split("@")[0]}

Metode pembayaran:
• Dana / OVO / Gopay / QRIS
• Transfer Bank

Bot akan langsung masuk setelah pembayaran & invite link diberikan.
        `).trim();

    return conn.sendMessage(
      m.chat,
      {
        text,
        mentions: [owner]
      },
      { quoted: m }
    );
  }
};
