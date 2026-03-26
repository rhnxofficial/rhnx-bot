export default {
  name: "blacklist",
  description: "Kelola blacklist grup (add/remove/list)",
  access: { group: true, admin: true, botadmin: true },
  run: async (m, { conn, command, args }) => {
    if (!m.isGroup) return m.reply("Perintah ini hanya bisa digunakan di dalam grup.");

    const chatData = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    if (!Array.isArray(chatData.blacklist)) chatData.blacklist = [];

    const sub = args && args[0] ? args[0].toLowerCase() : null;
    if (!sub || !["add", "remove", "list"].includes(sub)) {
      return m.reply(
        `Gunakan:\n• ${command} add <nomor/tag/reply>\n• ${command} remove <nomor/tag/reply>\n• ${command} list`
      );
    }

    const mentioned = typeof m.mentionByTag === "function" ? m.mentionByTag() : m.mentionByTag;
    let target =
      m.quoted?.sender ||
      (mentioned && mentioned[0]) ||
      (args[1] ? args[1].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    if (sub === "list") {
      if (!chatData.blacklist.length) return m.reply("📭 Tidak ada yang diblacklist.");
      return conn.sendMessage(m.chat, {
        text:
          "📋 Daftar Blacklist:\n" +
          chatData.blacklist.map((x, i) => `${i + 1}. @${x.split("@")[0]}`).join("\n"),
        mentions: chatData.blacklist
      });
    }

    if (!target) return m.reply("Tentukan target melalui reply, tag, atau nomor.");

    if (sub === "add") {
      if (!chatData.blacklist.includes(target)) {
        chatData.blacklist.push(target);
        await global.db.write();
        await conn.sendMessage(m.chat, {
          text: `✅ @${target.split("@")[0]} ditambahkan ke blacklist.`,
          mentions: [target]
        });
      } else {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${target.split("@")[0]} sudah ada di blacklist.`,
          mentions: [target]
        });
      }
    }

    if (sub === "remove") {
      if (chatData.blacklist.includes(target)) {
        chatData.blacklist = chatData.blacklist.filter((x) => x !== target);
        await global.db.write();
        await conn.sendMessage(m.chat, {
          text: `✅ @${target.split("@")[0]} dihapus dari blacklist.`,
          mentions: [target]
        });
      } else {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${target.split("@")[0]} tidak ditemukan di blacklist.`,
          mentions: [target]
        });
      }
    }
  }
};
