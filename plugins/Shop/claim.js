export default {
  name: "claim",
  alias: ["daily"],
  description: "Claim hadiah harian (1x setiap 24 jam)",
  access: { group: true },
  run: async (m, { conn, setReply }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return m.reply("Data user tidak ditemukan!");

    const cooldown = 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (!user.lastclaim) user.lastclaim = 0;

    let remaining = cooldown - (now - user.lastclaim);

    if (remaining > 0) {
      let time = clockString(remaining);
      return m.reply(`⏳ Kamu sudah claim hari ini!\nSilakan claim lagi dalam *${time}*`);
    }

    const reward = {
      money: 3000,
      exp: 150,
      limit: 2,
      limitgame: 5
    };

    user.money += reward.money;
    user.exp += reward.exp;
    user.limit += reward.limit;
    user.limitgame += reward.limitgame;
    user.lastclaim = now;

    let msg = `
🎉 *CLAIM HARIAN BERHASIL!*

Hadiah yang kamu dapat:
💰 Money: +${reward.money}
⭐ Exp: +${reward.exp}
📦 Limit: +${reward.limit}
🎮 Limit Game: +${reward.limitgame}

Datang lagi besok buat claim lagi ya! 🔥
`;

    await setReply(msg);
  }
};

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor((ms % 3600000) / 60000);
  let s = Math.floor((ms % 60000) / 1000);
  return [h, "Jam", m, "Menit", s, "Detik"].join(" ");
}
