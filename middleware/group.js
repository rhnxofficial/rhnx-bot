import chalk from "chalk";

export async function memberUpdate(conn, update) {
  try {
    const groupId = update.id;
    const participants = update.participants;

    const groupMetadata = (await conn.groupMetadata(groupId).catch(() => ({}))) || {};
    const groupName = groupMetadata.subject || "Grup";
    const groupDesc = groupMetadata.desc || "Tidak ada deskripsi.";
    const groupMembers = groupMetadata.participants || [];
    const totalMembers = groupMembers.length;
    const actor = update.author || update.by;
    const actorName = actor ? actor.split("@")[0] : "Unknown";
    for (let user of participants) {
      const member = groupMembers.find(p => p.id === user);
if (!member) return;

const memberId = member.phoneNumber; 
const username = memberId.split("@")[0];

      let pp;
      try {
        pp = await conn.profilePictureUrl(user, "image");
      } catch (e) {
        pp =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60";
      }

      if (update.action === "add" && global.db.data.chats[groupId]?.welcome) {
        const welcomeText = `
👋 Halo @${username}!

Selamat datang di *${groupName}* 🎉  
${groupDesc ? `📜 Deskripsi: ${groupDesc}\n` : ""}
📊 Member ke: *${totalMembers}*

Semoga betah ya di sini 😄
        `.trim();

        await conn.sendMessage(groupId, {
          text: welcomeText,
          mentions: [member.id],
          contextInfo: {
            externalAdReply: {
              title: `${bot.name}`,
              body: `Member ke-${totalMembers}`,
              thumbnailUrl: pp,
              sourceUrl: "https://chat.whatsapp.com/EcaZKuqXYGk8DL35OUCetp",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });

        console.log(chalk.green(`[WELCOME] ${username} bergabung ke grup ${groupName}`));
      }

      if (update.action === "remove" && global.db.data.chats[groupId]?.welcome) {
        await conn.sendMessage(groupId, {
          text: `Byeee @${username} keluar dari *${groupName}*`,
          mentions: [member.id],
          contextInfo: {
            externalAdReply: {
              title: `${bot.name}`,
              body: `Member ke-${totalMembers}`,
              thumbnailUrl: pp,
              sourceUrl: "https://chat.whatsapp.com/EcaZKuqXYGk8DL35OUCetp",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });

        console.log(chalk.yellow(`[LEAVE] ${username} keluar dari grup ${groupName}`));
      }

      if (update.action === "promote") {
        await conn.sendMessage(groupId, {
          text: `🔰 @${username} telah *dipromote jadi admin* oleh @${actorName}`,
          mentions: [member.id, actor]
        });

        console.log(
          chalk.blue(`[PROMOTE] ${username} dipromote oleh ${actorName} di grup ${groupName}`)
        );
      }

      if (update.action === "demote") {
        await conn.sendMessage(groupId, {
          text: `⚠️ @${username} telah *dicabut adminnya* oleh @${actorName}`,
          mentions: [member.id, actor]
        });

        console.log(
          chalk.magenta(`[DEMOTE] ${username} didemote oleh ${actorName} di ${groupName}`)
        );
      }
    }
  } catch (err) {
    console.error(chalk.red("❌ Error memberUpdate:"), err);
  }
}

export async function groupUpdate(conn, updates) {
  try {
    for (let update of updates) {
      const chatData = global.db.data.chats[update.id];
      if (!chatData?.groupupdate) continue;

      let text = `📢 *Info Grup Diperbarui!*\n\n`;
      if (update.subject) text += `📛 Nama grup: *${update.subject}*\n`;
      if (update.desc) text += `📜 Deskripsi baru:\n${update.desc}\n`;
      if (update.restrict !== undefined)
        text += `🔒 Restrict pesan: *${update.restrict ? "Hanya admin" : "Semua anggota"}*\n`;
      if (update.announce !== undefined)
        text += `📣 Mode pengumuman: *${update.announce ? "Aktif" : "Nonaktif"}*\n`;

      await conn.sendMessage(update.id, { text });

      console.log(chalk.cyan(`[GROUP UPDATE] Grup ${chatData?.name || update.id} diperbarui`));
    }
  } catch (err) {
    console.error(chalk.red("❌ Error groupUpdate:"), err);
  }
}
