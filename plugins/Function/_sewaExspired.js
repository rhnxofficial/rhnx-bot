import moment from "moment-timezone";

export default {
  name: "sewaExpiredHook",
  description: "Hook untuk cek & proses habis sewa group",
  type: "hook",

  after: async (m, { conn }) => {
    const chats = global.db.data.chats;
    if (!chats) return;

    const now = moment();

    for (let chatId in chats) {
      const chat = chats[chatId];

      if (chat.type !== "group" || !chat.sewa) continue;
      if (!chat.sewaends) continue;
      if (now.isAfter(moment(chat.sewaends))) {
        chat.sewa = false;
        chat.sewasince = "";
        chat.sewaends = "";

        try {
          await conn.sendMessage(chatId, {
            text: `⚠️ Sewa group telah berakhir.\nBot akan keluar dari group ini.`
          });
        } catch (err) {
          console.error(err);
        }

        try {
          if (m.groupMembers) {
            const admins = m.groupMembers.filter((u) => u.admin === "admin").map((u) => u.id);

            for (let adminId of admins) {
              await conn.sendMessage(adminId, {
                text: `⚠️ Sewa group *${chat.name}* telah berakhir.\nBot akan keluar dari group.`
              });
            }
          }
        } catch (err) {
          console.error(err);
        }
        try {
          if (owner.contact + "@s.whatsapp.net") {
            await conn.sendMessage(+"@s.whatsapp.net", {
              text: `⚠️ [CC] Sewa group *${chat.name}* telah berakhir.\nAdmin yang menerima notif: ${m.groupMembers
                ?.filter((u) => u.admin === "admin")
                .map((u) => u.id)
                .join(", ")}`
            });
          }
        } catch (err) {
          console.error(err);
        }

        try {
          await conn.groupLeave(chatId);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};
