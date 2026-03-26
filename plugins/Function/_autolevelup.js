export default {
  name: "levelupHook",
  type: "hook",
  description: "Sistem leveling otomatis berdasarkan EXP user",

  async before(m, { conn, prefix }) {
    try {
      const isCmd = m.budy?.startsWith(prefix);
      if (!isCmd) return;
      if (!m.isGroup) return;
      const user = global.db.data.users[m.sender];
      if (!user) return;
      if (!user.registered) return;
      if (typeof user.level !== "number") user.level = 0;
      if (typeof user.exp !== "number") user.exp = 0;
      if (!user.lastLevelNotify) user.lastLevelNotify = 0;

      const gainExp = Math.floor(Math.random() * 8) + 3;

      if (user.level === 0) {
        user.exp += gainExp;

        let needed = 200 - user.exp;
        if (needed < 0) needed = 0;

        await conn.sendMessage(
          m.chat,
          {
            text: styleText(
              `🌱 *Awal Perjalanan Dimulai!*
Kamu mendapatkan *+${gainExp} EXP*.
Gunakan bot untuk mencapai level berikutnya.

EXP menuju *Level 1*: ${needed}`
            )
          },
          { quoted: m }
        );

        user.level = 1;
        return;
      }

      user.exp += gainExp;
      const now = Date.now();
      const requiredExp = 200 + user.level * user.level * 50;
      const diff = requiredExp - user.exp;

      if (diff <= 50 && diff > 0 && now - user.lastLevelNotify > 10000) {
        user.lastLevelNotify = now;
        await m.reply(`📈 *Dikit lagi naik level!*\nTinggal ${diff} EXP lagi.`);
      }

      if (user.exp >= requiredExp) {
        const before = user.level;

        user.exp -= requiredExp;
        user.level += 1;

        const moneyReward = user.level * 1000;
        const balanceReward = user.level * 5;

        user.money = (user.money || 0) + moneyReward;
        user.balance = (user.balance || 0) + balanceReward;

        try {
          const { userLeveling } = await import("../../lib/user.js");
          user.grade = userLeveling(String(user.level));
        } catch {
          user.grade = "Newbie";
        }

        await conn.sendMessage(
          m.chat,
          {
            text: styleText(
              `🎉 *LEVEL UP!*

📈 Level: ${before} → ${user.level}
🏅 Rank: ${user.grade}

💰 Uang: +${moneyReward}
💳 Balance: +${balanceReward}`
            )
          },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("Level Hook Error:", err);
    }
  }
};
