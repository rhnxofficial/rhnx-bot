"use strict";

import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from "baileys";

export default {
  name: "fashion",
  alias: ["baju"],
  description: "Menampilkan baju",
  tags: ["tools"],
  access: { groupstore: true },

  run: async (m, { conn }) => {
    try {
      async function createCard(text, imageUrl) {
        const media = await prepareWAMessageMedia(
          { image: { url: imageUrl } },
          { upload: conn.waUploadToServer }
        );

        return {
          header: proto.Message.InteractiveMessage.Header.create({
            ...media,
            gifPlayback: false,
            hasMediaAttachment: false
          }),

          body: { text },

          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Kirim pesan",
                  url: api.rhnx,
                  merchant_url: "https://whatsapp.com"
                })
              }
            ]
          }
        };
      }

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: { text: "salam kenal aku gue" },

                carouselMessage: {
                  cards: [
                    await createCard("Iki siji", global.image.default),
                    await createCard("Iki loro", global.image.default),
                    await createCard("Iki telu", global.image.default)
                  ],
                  messageVersion: 1
                }
              }
            }
          }
        },
        {}
      );

      await conn.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
      });
    } catch (e) {
      console.error(e);
      m.reply("Terjadi kesalahan.");
    }
  }
};
