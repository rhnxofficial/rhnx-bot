export default {
  name: "profile",
  alias: ["profil"],
  description: "Menampilkan profil pengguna dengan tema biru elegan",
  access: { group: false },
  run: async (m, { conn }) => {
    try {
      const user = global.db.data.users[m.sender];
      if (!user) return m.reply("❌ Data kamu belum terdaftar!");

      const { name, exp, level, premium, limit, limitgame, balance, pasangan, registered } = user;

      const requiredExp = (level || 1) * 100;

      const ppUrl =
        (await conn.profilePictureUrl(m.sender, "image").catch(() => null)) ||
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

      const teks = `
乂  *P R O F I L*

👤 *Nama:* ${name || m.pushName}
🆔 *ID:* ${m.sender.split("@")[0]}
⭐ *Level:* ${level || 1}
⚡ *Exp:* ${exp || 0}/${requiredExp}
💰 *Balance:* ${balance || 0}
📦 *Limit:* ${limit || 0}
🎮 *Limit Game:* ${limitgame || 0}
💍 *Pasangan:* ${pasangan?.length ? pasangan[0] : "-"}
🎟️ *Premium:* ${premium ? "✅ Aktif" : "❌ Tidak"}
📋 *Registered:* ${registered ? "✅" : "❌"}

`.trim();

      await conn.sendMessageModify(m.chat, teks, m, {
        title: "👤 𝖸𝗈𝗎𝗋 𝖯𝗋𝗈𝖿𝗂𝗅𝖾",
        largeThumb: false,
        thumbnail: ppUrl,
        url: "",
        mentions: [m.sender]
      });
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat membuat profil.\n" + e.message);
    }
  }
};
