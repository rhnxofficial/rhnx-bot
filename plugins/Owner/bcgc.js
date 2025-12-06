import fs from "fs";

export default {
  name: "bcgc",
  alias: ["broadcastgc"],
  description: "Broadcast pesan ke semua grup (support media & tag)",
  tags: ["owner"],
  access: { owner: true },

  run: async (m, { conn, q, setReply }) => {
    if (!q) return setReply("Teksnya?\n\nJika ingin sambil tag ketik *.bcgc <teks> -tag*");

    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups).filter((i) => !i.isCommunity && !i.isCommunityAnnounce);
    let groupIds = groups.map((v) => v.id);

    if (groupIds.length === 0) return setReply("Tidak ada grup yang tersedia untuk broadcast.");

    // === Cek media ===
    let mediaFile;
    const isImage = m.type === "imageMessage";
    const isVideo = m.type === "videoMessage";
    const isAudio = m.type === "audioMessage";
    const isQuoted =
      m.quoted &&
      (m.quoted.type === "imageMessage" ||
        m.quoted.type === "videoMessage" ||
        m.quoted.type === "audioMessage");

    if (isQuoted || isImage || isVideo || isAudio) {
      try {
        if (m.quoted) {
          mediaFile = await m.quoted.downloadAndSave();
        } else {
          mediaFile = await m.downloadAndSave();
        }
      } catch (e) {
        console.error(e);
        return setReply("Gagal mengunduh media.");
      }
    }

    setReply(`Mengirim broadcast ke ${groupIds.length} grup...`);

    for (let id of groupIds) {
      await sleep(2500);

      let groupMetadata = await conn.groupMetadata(id);
      let members = groupMetadata.participants.map((u) => u.id);
      let mem = [];

      if (q.endsWith("-tag")) mem.push(...members);

      let contextInfo = {
        forwardingScore: 100,
        isForwarded: true,
        mentionedJid: mem
      };

      const text = q.replace("-tag", "").trim();

      try {
        if (mediaFile) {
          let fileData = fs.readFileSync(mediaFile);

          if (isImage || (isQuoted && m.quoted.type === "imageMessage")) {
            await conn.sendMessage(id, {
              image: fileData,
              caption: text,
              mentions: mem,
              contextInfo
            });
          } else if (isVideo || (isQuoted && m.quoted.type === "videoMessage")) {
            await conn.sendMessage(id, {
              video: fileData,
              caption: text,
              mentions: mem,
              contextInfo
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
          } else {
            await conn.sendMessage(id, { text, mentions: mem, contextInfo });
          }
        } else {
          await conn.sendMessage(id, { text, mentions: mem, contextInfo });
        }
      } catch (err) {
        console.error(`Gagal kirim ke ${id}:`, err);
      }
    }

    setReply(`✅ Sukses mengirim broadcast ke ${groupIds.length} grup.`);
  }
};
