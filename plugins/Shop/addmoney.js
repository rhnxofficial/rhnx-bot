export default {
  name: "addmoney",
  description: "Transfer money ke user lain / owner bebas memberi money",
  async run(m, { conn, isOwner }) {
    let target = m.mentionByTag()[0] || m.quoted?.sender;

    if (!target) {
      return m.reply(
        "Tag atau reply pengguna!\n\nContoh:\n.addmoney @user 5000\natau reply pesan lalu:\n.addmoney 5000"
      );
    }
    const text = m.text;
    let amount = parseInt(text.match(/\d+$/)?.[0]);
    if (!amount || amount <= 0) {
      return m.reply("𝖭𝗈𝗆𝗂𝗇𝖺𝗅 𝗍𝗂𝖽𝖺𝗄 𝗏𝖺𝗅𝗂𝖽!\n𝖢𝗈𝗇𝗍𝗈𝗁:\n.addmoney @user 5000");
    }

    let senderUser = db.data.users[m.sender];
    let targetUser = db.data.users[target];

    if (!targetUser) return m.reply("User tidak ditemukan di database!");

    if (isOwner) {
      targetUser.money += amount;
      return conn.sendMessage(
        m.chat,
        {
          text: styleText(
            `💰 *Add Money Sukses (Owner)*

• Target: @${target.split("@")[0]}
• Ditambah: *${amount}*
• Total sekarang: *${targetUser.money}*`
          ),
          mentions: [target]
        },
        { quoted: m }
      );
    }

    if (m.sender === target) return m.reply("Tidak bisa transfer ke diri sendiri 😂");

    if (senderUser.money < amount)
      return m.reply(`💸 Uang kamu tidak cukup!\nSaldo kamu: *${senderUser.money}*`);

    senderUser.money -= amount;
    targetUser.money += amount;

    return conn.sendMessage(
      m.chat,
      {
        text: styleText(`🔁 *Transfer Berhasil!*

👤 Pengirim: @${m.sender.split("@")[0]}
🎯 Penerima: @${target.split("@")[0]}
💰 Jumlah: *${amount}*

💳 Saldo kamu sekarang: *${senderUser.money}*`),
        mentions: [m.sender, target]
      },
      { quoted: m }
    );
  }
};
