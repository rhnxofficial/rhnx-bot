export default {
  name: "buypremium",
  description: "Informasi pembelian premium (real money)",
  async run(m, { conn }) {
    const harga = {
      minggu: "Rp 10.000",
      bulan: "Rp 25.000",
      tahun: "Rp 200.000"
    };

    const owner = global.owner.contact + "@s.whatsapp.net";

    let text = styleText(`
✨ *PREMIUM STORE BOT* ✨
Dapatkan fitur spesial dan limit tanpa batas!

💰 *Harga Premium:*
• 1 Minggu  : *${harga.minggu}*
• 1 Bulan   : *${harga.bulan}*
• 1 Tahun   : *${harga.tahun}*

📞 *Cara Beli:*
Silakan hubungi owner untuk proses pembayaran:
@${owner.split("@")[0]}

Metode pembayaran:
• Dana / Gopay / OVO / QRIS
• Transfer Bank

Premium akan diaktifkan setelah pembayaran terverifikasi.
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
