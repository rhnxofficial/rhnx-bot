"use strict";

import fs from "fs";
import chalk from "chalk";

export default async function allfake(m) {
  const from = m?.chat;
  const sender = m?.sender;
  const pushname = m?.pushName || "User";
  const ucapanWaktu = "Selamat";

  global.fvn = {
    key: {
      fromMe: false,
      participant: `6281316643491@s.whatsapp.net`,
      ...(from ? { remoteJid: "status@broadcast" } : {})
    },
    message: {
      audioMessage: { mimetype: "audio/ogg; codecs=opus", seconds: "9999", ptt: "true" }
    }
  };

  global.fkontak = {
    key: {
      fromMe: false,
      participant: `0@s.whatsapp.net`,
      ...(m.chat ? { remoteJid: `0@s.whatsapp.net` } : {})
    },
    message: {
      contactMessage: {
        displayName: pushname,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${pushname};;;\nFN:${pushname}\nitem1.TEL;waid=${sender.split("@")[0]}:${sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        jpegThumbnail: fs.readFileSync("./media/image/quoted.jpg")
      }
    }
  };

  global.ftroli = {
    key: {
      fromMe: false,
      participant: `0@s.whatsapp.net`,
      ...(from ? { remoteJid: "120363162611448409@g.us" } : {})
    },
    message: {
      orderMessage: {
        itemCount: 200,
        status: 1,
        surface: 2,
        message: `${bot.name}\n${pushname} kak`,
        orderTitle: `${ucapanWaktu} kak`,
        thumbnail: fs.readFileSync("./media/image/quoted.jpg"),
        sellerJid: `0@s.whatsapp.net`
      }
    }
  };

  let file = import.meta.url;
  fs.watchFile(file, () => {
    fs.unwatchFile(file);
  });
}
