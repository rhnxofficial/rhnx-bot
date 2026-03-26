// Created By Raihan Fadillah
"use strict";
import axios from "axios";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export async function textToVoice(caracter, text) {
  const API_KEY = key.elevenlabs;
  const VOICE_ID = caracter;
  const API_URL = `${api.elevenlabs}/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;

  try {
    const response = await axios.post(
      API_URL,
      { text, model_id: "eleven_multilingual_v2" },
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    const mp3FilePath = `./temp/${Date.now()}.mp3`;
    fs.writeFileSync(mp3FilePath, response.data);
    console.log(`✅ Audio berhasil disimpan: ${mp3FilePath}`);

    const oggFilePath = await new Promise((resolve, reject) => {
      const outputPath = `./temp/converted_${Date.now()}.opus`;
      ffmpeg(mp3FilePath)
        .audioCodec("libopus")
        .audioBitrate(128)
        .on("end", () => resolve(outputPath))
        .on("error", (err) => reject(err))
        .save(outputPath);
    });

    console.log(`✅ Audio berhasil dikonversi: ${oggFilePath}`);

    fs.unlinkSync(mp3FilePath);

    return oggFilePath;
  } catch (error) {
    console.error("❌ Error:", error.response ? error.response.data : error);
    return null;
  }
}
