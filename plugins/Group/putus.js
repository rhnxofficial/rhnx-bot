export default {
  name: "putus",
  alias: ["iyaputus", "tidak"],
  description: "Putus atau respon permintaan putus 😢",
  async run(m, { conn, command }) {
    const user = global.db.data.users[m.sender] || {};
    const chat = m.chat;
    const isGroup = chat.endsWith("@g.us");
    if (command === "putus") {
      if (!user.pasangan || !user.pasangan.length) return m.reply("Kamu belum punya pasangan 😅");

      const pasangan = user.pasangan[0];
      const pasanganData = global.db.data.users[pasangan];
      if (!pasanganData) return m.reply("Data pasangan kamu tidak ditemukan 😕");

      if (user.putusPending && Date.now() - user.putusTime < 60000)
        return m.reply("Kamu sudah mengirim permintaan putus, tunggu respon pasanganmu 😔");

      user.putusPending = pasangan;
      user.putusTime = Date.now();

      const text =
        `💔 @${m.sender.split("@")[0]} ingin putus dengan @${pasangan.split("@")[0]} 😢\n\n` +
        `@${pasangan.split("@")[0]}, balas pesan ini dengan *.iyaputus* untuk menyetujui atau *.tidak* untuk menolak.`;

      let msg;
      if (isGroup) {
        const pasanganAda = m.groupMembers?.some((v) => v.id === pasangan);
        if (pasanganAda) {
          msg = await conn.sendMessage(
            chat,
            {
              text,
              mentions: [m.sender, pasangan]
            },
            { quoted: m }
          );
        } else {
          await conn.sendMessage(
            pasangan,
            {
              text: `💔 @${m.sender.split("@")[0]} ingin putus darimu 😢\n\nBalas dengan *.iyaputus* atau *.tidak*`,
              mentions: [m.sender]
            },
            { quoted: m }
          );

          msg = await conn.sendMessage(
            chat,
            {
              text: `📩 Pasanganmu tidak ada di grup, pesan dikirim lewat chat pribadi.`
            },
            { quoted: m }
          );
        }
      } else {
        msg = await conn.sendMessage(
          pasangan,
          {
            text,
            mentions: [m.sender, pasangan]
          },
          { quoted: m }
        );

        await conn.sendMessage(
          chat,
          {
            text: `📩 Permintaan putus sudah dikirim ke pasanganmu.`
          },
          { quoted: m }
        );
      }

      if (msg?.key?.id) user.putusQuoted = msg.key.id;
      await global.db.write();
      setTimeout(async () => {
        if (user.putusPending === pasangan) {
          delete user.putusPending;
          delete user.putusTime;
          delete user.putusQuoted;
          await global.db.write();

          await conn.sendMessage(chat, {
            text: `⏳ Permintaan putus antara @${m.sender.split("@")[0]} dan @${pasangan.split("@")[0]} dibatalkan karena tidak ada respon.`,
            mentions: [m.sender, pasangan]
          });
        }
      }, 60000);
      return;
    }

    if (command === "iyaputus") {
      const pasanganUser = Object.entries(global.db.data.users).find(
        ([jid, u]) => u.putusPending === m.sender
      );
      if (!pasanganUser)
        return conn.sendMessage(
          chat,
          { text: "Tidak ada permintaan putus yang ditujukan untukmu 😅" },
          { quoted: m }
        );

      const [pengajuJid, pengajuData] = pasanganUser;
      const pasanganData = global.db.data.users[m.sender];

      if (pengajuData.pasangan?.[0] !== m.sender)
        return conn.sendMessage(chat, { text: "Kamu bukan pasangan sah dari pengaju 😅" });

      pengajuData.pasangan = [];
      pasanganData.pasangan = [];
      delete pengajuData.putusPending;
      delete pengajuData.putusTime;
      delete pengajuData.putusQuoted;
      await global.db.write();

      await conn.sendMessage(
        chat,
        {
          text: `💔 @${pengajuJid.split("@")[0]} dan @${m.sender.split("@")[0]} resmi putus 😭`,
          mentions: [pengajuJid, m.sender]
        },
        { quoted: m }
      );
      return;
    }

    if (command === "tidak") {
      const pasanganUser = Object.entries(global.db.data.users).find(
        ([jid, u]) => u.putusPending === m.sender
      );
      if (!pasanganUser)
        return conn.sendMessage(
          chat,
          { text: "Tidak ada permintaan putus yang bisa kamu tolak 😅" },
          { quoted: m }
        );

      const [pengajuJid, pengajuData] = pasanganUser;
      delete pengajuData.putusPending;
      delete pengajuData.putusTime;
      delete pengajuData.putusQuoted;
      await global.db.write();

      await conn.sendMessage(
        chat,
        {
          text: `❤️ @${m.sender.split("@")[0]} menolak permintaan putus dari @${pengajuJid.split("@")[0]} 😍`,
          mentions: [m.sender, pengajuJid]
        },
        { quoted: m }
      );
      return;
    }
  }
};
