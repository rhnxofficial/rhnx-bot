export default {
  name: "top",
  description: "Menampilkan top money, limit, atau level",

  async run(m, { conn, args }) {
    if (!args[0]) {
      return m.reply(
        "Pilih kategori!\n\n" + "Contoh:\n" + "• .top money\n" + "• .top limit\n" + "• .top level"
      );
    }

    let mode = args[0].toLowerCase();

    const valid = {
      money: "money",
      limit: "limit",
      level: "level"
    };

    if (!valid[mode]) {
      return m.reply(
        "Mode tidak valid!\n\n" +
          "Gunakan:\n" +
          "• .top money\n" +
          "• .top limit\n" +
          "• .top level"
      );
    }

    let key = valid[mode];
    let users = db.data.users;

    let list = Object.entries(users)
      .filter(([id, data]) => typeof data[key] === "number")
      .sort((a, b) => b[1][key] - a[1][key])
      .slice(0, 10);

    if (!list.length) return m.reply("Belum ada data user.");

    const title = {
      money: "💰 *TOP 10 KAYA RAYA*",
      limit: "📦 *TOP 10 LIMIT TERBANYAK*",
      level: "📶 *TOP 10 LEVEL TERTINGGI*"
    }[mode];

    let teks = `${title}\n\n`;

    let rank = 1;
    for (let [id, data] of list) {
      teks += `${rank}. @${id.split("@")[0]} — *${data[key]}*\n`;
      rank++;
    }

    return conn.sendMessage(
      m.chat,
      {
        text: teks,
        mentions: list.map(([id]) => id)
      },
      { quoted: m }
    );
  }
};
