export default {
  name: "tolak",
  description: "Tolak tembakan 😭",
  access: { group: true },
  async run(m, { conn }) {
    if (!conn._tembak) conn._tembak = {};
    const penembak = conn._tembak[m.sender];
    if (!penembak) return m.reply("Gak ada yang nembak kamu.");

    delete conn._tembak[m.sender];

    await conn.sendMessage(
      m.chat,
      {
        text: `💔 Yahh... @${m.sender.split("@")[0]} menolak cinta dari @${penembak.split("@")[0]} 😭`,
        mentions: [penembak, m.sender]
      },
      { quoted: m }
    );
  }
};
