import moment from "moment-timezone";

export default {
  name: "delsewa",
  alias: ["hapussewa", "unsewa"],
  description: "Hapus sewa group",
  access: { limit: false },
  run: async (m, { conn, q }) => {
    let chatId;

    if (m.isGroup) {
      chatId = m.chat;
    } else {
      const args = q?.split(",");
      if (!args || !args[0]) return m.reply("❌ Masukkan link group atau ID!");

      const link = args[0];
      if (link.startsWith("https://chat.whatsapp.com/")) {
        chatId = await getChatIdFromLink(link, conn);
        if (!chatId) return m.reply("❌ Link group tidak valid atau bot belum join.");
      } else {
        chatId = args[0];
      }
    }

    const chat = global.db.data.chats[chatId];
    if (!chat || !chat.sewa) return m.reply("❌ Group ini tidak sedang disewa.");

    global.db.data.chats[chatId].sewa = false;
    global.db.data.chats[chatId].sewasince = "";
    global.db.data.chats[chatId].sewaends = "";

    let metadata;
    try {
      metadata = await conn.groupMetadata(chatId);
    } catch (e) {
      metadata = { id: chatId, subject: chat.name || "Unknown Group", participants: [] };
    }
    try {
      await conn.sendMessage(chatId, {
        text: `⚠️ Sewa group *${metadata.subject || chat.name}* telah dibatalkan.\nBot akan keluar sebentar lagi...`
      });
    } catch (err) {
      console.error(err);
    }

    try {
      if (metadata.participants?.length) {
        const admins = metadata.participants.filter(
          (u) => u.admin === "admin" || u.admin === "superadmin"
        );
        for (let admin of admins) {
          await conn.sendMessage(admin.id, {
            text: `⚠️ Sewa group *${metadata.subject || chat.name}* telah dibatalkan.\nBot akan keluar dari group.`
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    try {
      if (global.owner?.contact + "@s.whatsapp.net") {
        await conn.sendMessage(global.owner.contat + "@s.whatsapp.net", {
          text: `⚠️ [CC] Sewa group *${metadata.subject || chat.name}* dibatalkan oleh owner bot/admin.`
        });
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(async () => {
      try {
        await conn.groupLeave(chatId);
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return m.reply(
      `✅ Sewa group *${metadata.subject || chat.name || chatId}* berhasil dihapus.\nBot akan keluar sebentar lagi.`
    );
  }
};

async function getChatIdFromLink(link, conn) {
  try {
    const rex1 = /chat\.whatsapp\.com\/([\w\d]*)/i;
    const match = rex1.exec(link);
    if (!match || !match[1]) return null;

    const code = match[1];
    return await conn.groupAcceptInvite(code);
  } catch (err) {
    console.error(err);
    return null;
  }
}
