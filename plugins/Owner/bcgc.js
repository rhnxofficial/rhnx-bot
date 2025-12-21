// Created By RHNX
"use strict";

import fs from "fs";

export default {
  name: "bcgc",
  alias: ["broadcastgc"],
  description: "Broadcast pesan ke semua grup (support media & tag)",
  tags: ["owner"],
  access: { owner: true },

  run: async (m, { conn, q, setReply }) => {
    if (!q) return setReply("Teksnya?\n\nJika ingin sambil tag ketik *.bcgc <teks> -tag*");

    const getGroups = await conn.groupFetchAllParticipating();
    const groups = Object.values(getGroups).filter((g) => !g.isCommunity && !g.isCommunityAnnounce);
    const groupIds = groups.map((g) => g.id);

    if (!groupIds.length) return setReply("Tidak ada grup yang tersedia untuk broadcast.");

    let mediaFile;
    const isImage = m.type === "imageMessage";
    const isVideo = m.type === "videoMessage";
    const isAudio = m.type === "audioMessage";

    const isQuoted =
      m.quoted && ["imageMessage", "videoMessage", "audioMessage"].includes(m.quoted.type);

    if (isImage || isVideo || isAudio || isQuoted) {
      try {
        mediaFile = m.quoted ? await m.quoted.downloadAndSave() : await m.downloadAndSave();
      } catch (e) {
        console.error(e);
        return setReply("Gagal mengunduh media.");
      }
    }

    setReply(`Mengirim broadcast ke ${groupIds.length} grup...`);

    for (const id of groupIds) {
      await sleep(2500);

      let metadata = await conn.groupMetadata(id);
      let members = metadata.participants.map((u) => u.id);
      let mem = [];

      if (q.endsWith("-tag")) mem.push(...members);

      const kirimPesan = q.replace("-tag", "").trim();

      const text = styleText(`乂 *BROADCAST*
◦ *Author :* RHNX
◦ *Message :* ${kirimPesan}`);

      const textContextInfo = {
        forwardingScore: 50,
        isForwarded: true,
        mentionedJid: mem,
        forwardedNewsletterMessageInfo: {
          newsletterJid: `${bot.idch}`,
          serverMessageId: 100,
          newsletterName: "RHNX"
        },
        externalAdReply: {
          showAdAttribution: false,
          title: "BROADCAST",
          body: `${week} ${calender}`,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "",
          thumbnailUrl:
            "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-eRtV.jpg"
        }
      };

      try {
        if (mediaFile) {
          const fileData = fs.readFileSync(mediaFile);

          if (isImage || (isQuoted && m.quoted.type === "imageMessage")) {
            await conn.sendMessage(id, {
              image: fileData,
              caption: text,
              mentions: mem
            });
          } else if (isVideo || (isQuoted && m.quoted.type === "videoMessage")) {
            await conn.sendMessage(id, {
              video: fileData,
              caption: text,
              mentions: mem
            });
          } else if (isAudio || (isQuoted && m.quoted.type === "audioMessage")) {
            await conn.sendMessage(id, {
              audio: fileData,
              mimetype: "audio/mp4",
              contextInfo: {
                externalAdReply: {
                  showAdAttribution: false,
                  renderLargerThumbnail: false,
                  title: `⇆ㅤ ||◁ㅤ❚❚ㅤ▷||ㅤ ↻`,
                  body: `   ━━━━⬤──────────    `,
                  description: "Now Playing ....",
                  mediaType: 2,
                  thumbnailUrl:
                    "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-FnPK.jpg",
                  mediaUrl: "https://www.youtube.com/@rangelbot"
                }
              }
            });
          }
        } else {
          await conn.sendMessage(id, {
            text,
            mentions: mem,
            contextInfo: textContextInfo
          });
        }
      } catch (err) {
        console.error(`Gagal kirim ke ${id}:`, err);
      }
    }

    setReply(`✅ Sukses mengirim broadcast ke ${groupIds.length} grup.`);
  }
};
