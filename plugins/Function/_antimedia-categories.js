export default {
  name: "antiMediaHook",
  description: "Hook otomatis menghapus media dan link sesuai pengaturan antimedia di grup",
  type: "hook",
  before: async (m, { conn }) => {
    try {
      if (!m.isGroup) return;
      const chat = global.db.data.chats[m.chat];
      if (!chat.antimedia) {
        chat.antimedia = {
          all: false,
          audio: false,
          image: false,
          video: false,
          sticker: false,
          link: false,
          linkgc: false,
          tagswgc: false
        };
      }

      const antimedia = chat.antimedia;
      const sender = m.sender;

      const mapType = {
        imageMessage: "image",
        videoMessage: "video",
        audioMessage: "audio",
        stickerMessage: "sticker",
        groupStatusMentionMessage: "tagswgc"
      };

      const mediaType = mapType[m.type];
      const isAntiAll = antimedia.all;
      const isAntiThis = mediaType && antimedia[mediaType];

      if (mediaType && (isAntiAll || isAntiThis)) {
        if (m.isAdmin || !m.isBotAdmin) return;

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: sender
          }
        });

        const prettyType = mediaType.toUpperCase().split("").join(" ");
        await conn.sendMessage(
          m.chat,
          {
            text: styleSmallCaps(
              `乂 *A N T I  ${prettyType}*\n\nPesan dari @${sender.split("@")[0]} telah dihapus karena fitur *anti ${isAntiAll ? "semua media" : mediaType}* aktif.`
            ),
            mentions: [sender]
          },
          { quoted: fkontak }
        );
        return;
      }

      if (antimedia.link || antimedia.linkgc || antimedia.linkch) {
        const text =
          m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || "";

        if (!text) return;

        const lower = text.toLowerCase();
        const isLink = /(https?:\/\/[^\s]+)/i.test(lower);
        const isGroupLink = /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i.test(lower);

        const isChannelLink = /whatsapp\.com\/channel\/[A-Za-z0-9]{20,30}/i.test(lower);

        if (
          (antimedia.link && isLink) ||
          (antimedia.linkgc && isGroupLink) ||
          (antimedia.linkch && isChannelLink)
        ) {
          if (m.isAdmin || !m.isBotAdmin) return;

          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: m.key.id,
              participant: sender
            }
          });

          const reason = isGroupLink
            ? "link grup WhatsApp"
            : isChannelLink
              ? "link channel WhatsApp"
              : "tautan";

          await conn.sendMessage(
            m.chat,
            {
              text: styleSmallCaps(
                `乂 *A N T I  L I N K*\n\nPesan dari @${sender.split("@")[0]} telah dihapus karena mengirim ${reason}.`
              ),
              mentions: [sender]
            },
            { quoted: fkontak }
          );
        }
      }
    } catch (err) {
      console.error("Error di antiMediaHook:", err);
    }
  }
};
