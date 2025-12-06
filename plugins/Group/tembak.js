export default {
  name: "tembak",
  description: "Tembak pasangan 😳",
  access: { group: true },
  async run(m, { conn, q }) {
    if (!conn._tembak) conn._tembak = {};

    const args = q ? q.split(" ") : [];
    const mentions = m.mentionByTag ? m.mentionByTag() : [];
    const mentioned =
      m.quoted?.sender ||
      (mentions.length ? mentions[0] : null) ||
      (args[0] && args[0].startsWith("62") ? args[0] + "@s.whatsapp.net" : null);

    if (!mentioned)
      return m.reply("Tag / balas / atau ketik nomor target (awalan 62) yang mau kamu tembak!");

    if (mentioned === m.sender) return m.reply("😅 Gak bisa nembak diri sendiri dong!");

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { pasangan: [] };
    if (!global.db.data.users[mentioned]) global.db.data.users[mentioned] = { pasangan: [] };

    const user = global.db.data.users[m.sender];
    const target = global.db.data.users[mentioned];

    if (user.pasangan.length) return m.reply("Kamu sudah punya pasangan, setia dong 😅");

    if (target.pasangan.length)
      return conn.sendMessage(m.chat, { text: "Target sudah punya pasangan 😅", quoted: m });

    const pantun = [
      "🌹 Bunga mawar harum mewangi, cintaku padamu takkan terganti.",
      "💖 Burung merpati terbang tinggi, hati ini cuma buat kamu sendiri.",
      "☀️ Mentari pagi menyapa indah, semoga cinta kita takkan berubah.",
      "😳 Ke pasar beli tomat dan lada, mau gak kamu jadi pacarku sekarang juga?",
      "💘 Air beriak tanda tak dalam, aku nembak kamu dengan hati yang dalam.",
      "☕ Kopi pahit gula aren, kalo kamu nerima aku, hidupku makin keren!",
      "💞 Malam indah bintang bertabur, cintaku tulus tak akan kabur.",
      "🌷 Jatuh cinta itu sederhana, tiap liat kamu hati ini berbunga-bunga."
    ];
    const randomPantun = pantun[Math.floor(Math.random() * pantun.length)];

    conn._tembak[mentioned] = m.sender;

    await conn.sendMessage(
      m.chat,
      {
        text: styleText(randomPantun)
      },
      { quoted: fkontak }
    );

    await conn.sendMessage(
      m.chat,
      {
        text: styleText(
          `💌 *Tembakan Cinta Datang!* 💞\n\n@${m.sender.split("@")[0]} menembak @${mentioned.split("@")[0]} 😳\n\n@${mentioned.split("@")[0]}, silakan ketik *.terima* atau *.tolak*!`
        ),
        mentions: [m.sender, mentioned]
      },
      { quoted: fkontak }
    );
  }
};
