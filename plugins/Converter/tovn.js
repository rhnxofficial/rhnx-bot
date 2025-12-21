import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export default {
  name: "tovn",
  alias: ["tovn", "topt", "audiopt"],
  description: "Ubah audio menjadi voice note (PTT)",
  access: { group: true },
  run: async (m, { conn }) => {
    const isQuotedAudio = m.quoted && m.quoted.type === "audioMessage";
    if (!isQuotedAudio) return m.reply("🎧 *Reply audio yang ingin dijadikan voice note (PTT).*");

    try {
      m.react("⏱️");

      const inputBuffer = await m.quoted.download();
      if (!inputBuffer) return m.reply("❌ Gagal mengambil audio.");

      const tempInput = `./temp_${Date.now()}.mp3`;
      const tempOutput = `./temp_${Date.now()}.ogg`;
      fs.writeFileSync(tempInput, inputBuffer);

      await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
          .audioCodec("libopus")
          .audioChannels(1)
          .audioFrequency(48000)
          .audioBitrate("64k")
          .format("ogg")
          .on("end", resolve)
          .on("error", reject)
          .save(tempOutput);
      });

      const buffer = fs.readFileSync(tempOutput);

      await conn.sendMessage(
        m.chat,
        { audio: buffer, mimetype: "audio/ogg; codecs=opus", ptt: true },
        { quoted: m }
      );

      fs.unlinkSync(tempInput);
      fs.unlinkSync(tempOutput);
      m.react("✅");
    } catch (e) {
      console.error(e);
      m.reply("❌ Terjadi kesalahan saat konversi audio ke PTT.");
    }
  }
};
