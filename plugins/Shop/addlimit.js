export default {
  name: "addlimit",
  description: "Transfer limit ke user lain / owner bebas memberi limit",
  async run(m, { conn, isOwner }) {
    const text = m.text;
    let target = m.mentionByTag()[0] || m.quoted?.sender;
    if (!target) {
      return m.reply(
        "Tag atau reply pengguna!\n\nContoh:\n.addlimit @user 10\natau reply lalu:\n.addlimit 10"
      );
    }

    let amount = parseInt(text.match(/\d+$/)?.[0]);
    if (!amount || amount <= 0) {
      return m.reply("Nominal tidak valid!\nContoh:\n.addlimit @user 10");
    }

    let senderUser = db.data.users[m.sender];
    let targetUser = db.data.users[target];

    if (!targetUser) return m.reply("User tidak ditemukan di database!");

    if (isOwner) {
      targetUser.limit += amount;

      return conn.sendMessage(
        m.chat,
        {
          text: styleText(
            `⚡ *Add Limit Sukses (Owner)*

• Target: @${target.split("@")[0]}
• Ditambah: *${amount}*
• Total sekarang: *${targetUser.limit}*`
          ),
          mentions: [target]
        },
        { quoted: m }
      );
    }

    if (m.sender === target) return m.reply("Tidak bisa transfer limit ke diri sendiri 😭");

    if (senderUser.limit < amount)
      return m.reply(`Limit kamu tidak cukup!\nSisa: *${senderUser.limit}*`);

    senderUser.limit -= amount;
    targetUser.limit += amount;

    return conn.sendMessage(
      m.chat,
      {
        text: styleText(
          `🔁 *Transfer Limit Berhasil!*

👤 Pengirim: @${m.sender.split("@")[0]}
🎯 Penerima: @${target.split("@")[0]}
⚡ Jumlah: *${amount}*

Sisa limit kamu: *${senderUser.limit}*`
        ),
        mentions: [m.sender, target]
      },
      { quoted: m }
    );
  }
};
