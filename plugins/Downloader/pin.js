"use strict";

import axios from "axios";
import {
  generateWAMessageFromContent,
  proto,
  prepareWAMessageMedia
} from "baileys";

export default {
  name: "pin",
  alias: ["pinterest"],
  description: "Pinterest search",
  tags: ["downloader"],
  access: { group: true },

  run: async (m, { conn, args }) => {
    try {
      if (!args || !args.length)
        return m.reply("Contoh: .pin kucing 5");

      let jumlah = 5;

      // cek angka di akhir
      let last = args[args.length - 1];

      if (/^\d+$/.test(last)) {
        jumlah = parseInt(last);
        args.pop();
      }

      if (jumlah > 18) jumlah = 18;
      if (jumlah < 1) jumlah = 1;

      let query = args.join(" ");

      if (!query)
        return m.reply("Contoh: .pin kucing 5");

      let url = `${api.rhnx}/api/downloader/pinsearch?query=${encodeURIComponent(
        query
      )}&apikey=${key.rhnx}`;

      let { data } = await axios.get(url);

      if (!data.status) return m.reply("Tidak ditemukan");

      let results = data.results.slice(0, jumlah);

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
                  display_text: "Open",
                  url: imageUrl,
                  merchant_url: "https://pinterest.com"
                })
              }
            ]
          }
        };
      }

      let cards = [];

      for (let img of results) {
        cards.push(await createCard(query, img));
      }

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: {
                  text: `Hasil Pinterest: ${query} (${jumlah})`
                },

                carouselMessage: {
                  cards,
                  messageVersion: 1
                }
              }
            }
          }
        },
        {}
      );

      await conn.relayMessage(
        msg.key.remoteJid,
        msg.message,
        { messageId: msg.key.id }
      );

    } catch (e) {
      console.error(e);
      m.reply("Terjadi kesalahan");
    }
  }
};