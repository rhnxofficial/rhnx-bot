export default {
  name: "kurangmoney",
  description: "Kurangi money user (owner only)",

  async run(m, { conn, isOwner }) {
    const text = m.text;
    let target = m.mentionByTag()[0] || m.quoted?.sender;

    if (!target) {
      return m.reply(
        "Tag atau reply pengguna!\n\nContoh:\n.kurangmoney @user 5000\natau reply pesan lalu:\n.kurangmoney 5000"
      );
    }

    let amount = parseInt(text.match(/\d+$/)?.[0]);
    if (!amount || amount <= 0) {
      return m.reply("𝖭𝗈𝗆𝗂𝗇𝖺𝗅 𝗍𝗂𝖽𝖺𝗄 𝗏𝖺𝗅𝗂𝖽!\n𝖢𝗈𝗇𝗍𝗈𝗁:\n.kurangmoney @user 5000");
    }

    let targetUser = db.data.users[target];

    if (!targetUser) return m.reply("User tidak ditemukan di database!");

    if (isOwner) {
      if (targetUser.money < amount) amount = targetUser.money;
      targetUser.money -= amount;

      return conn.sendMessage(
        m.chat,
        {
          text: styleText(
            `💸 *Kurang Money Sukses (Owner)*

• Target: @${target.split("@")[0]}
• Dikurangi: *${amount}*
• Sisa sekarang: *${targetUser.money}*`
          ),
          mentions: [target]
        },
        { quoted: m }
      );
    }

    return m.reply("Kamu bukan owner, tidak bisa mengurangi saldo orang lain 😭");
  }
};
