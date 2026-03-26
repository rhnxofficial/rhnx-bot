export default {
  name: "kuranglimit",
  description: "Kurangi limit user (owner only)",

  async run(m, { conn, isOwner }) {
    const text = m.text;
    let target = m.mentionByTag()[0] || m.quoted?.sender;
    if (!target) {
      return m.reply(
        "Tag atau reply pengguna!\n\nContoh:\n.kuranglimit @user 10\natau reply lalu:\n.kuranglimit 10"
      );
    }

    let amount = parseInt(text.match(/\d+$/)?.[0]);
    if (!amount || amount <= 0) {
      return m.reply("Nominal tidak valid!\nContoh:\n.kuranglimit @user 10");
    }

    let targetUser = db.data.users[target];
    if (!targetUser) return m.reply("User tidak ditemukan di database!");

    if (!isOwner) return m.reply("Hanya owner yang bisa mengurangi limit!");

    if (targetUser.limit < amount) amount = targetUser.limit;

    targetUser.limit -= amount;

    return conn.sendMessage(
      m.chat,
      {
        text: styleText(
          `🔻 *Kurang Limit Sukses (Owner)*

• Target: @${target.split("@")[0]}
• Dikurangi: *${amount}*
• Sisa sekarang: *${targetUser.limit}*`
        ),
        mentions: [target]
      },
      { quoted: m }
    );
  }
};
