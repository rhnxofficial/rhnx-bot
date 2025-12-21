export default {
  name: "limit",
  alias: ["ceklimit", "sisalimit"],
  description: "Cek sisa limit user",
  access: { limit: false, register: true },

  run: async (m, { conn }) => {
    let target = m.quoted ? m.quoted.sender : m.sender;
    let user = global.db.data.users[target];

    if (!user) {
      return m.reply("❌ Data user tidak ditemukan.");
    }

    let text = styleText(`
◦ *User*: ${user.name}
◦ *Sisa Limit*: ${user.limit}
◦ *Hit*: ${user.hit}
◦ *Limit Game*: ${user.limitgame || 0}
◦ *Status*: ${user.premium ? `Premium (aktif sampai: ${user.premiumend || "-"} )` : "Free User"}

➤ Anda dapat *menukar Balance untuk membeli Limit*  
Ketik: *buy*`);

    await conn.sendMessage(m.chat, { text }, { quoted: fkontak });
  }
};
