// Created by Raihan Fadillah
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const tmpDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

export async function videoToStickerBuffer(buffer, duration = 5) {
  return new Promise((resolve, reject) => {
    const tmpIn = path.join(tmpDir, Date.now() + ".mp4");
    const tmpOut = path.join(tmpDir, Date.now() + ".webp");

    fs.writeFileSync(tmpIn, buffer);

    ffmpeg(tmpIn)
      .on("error", (err) => {
        fs.unlinkSync(tmpIn);
        reject(err);
      })
      .on("end", () => {
        try {
          const out = fs.readFileSync(tmpOut);
          fs.unlinkSync(tmpIn);
          fs.unlinkSync(tmpOut);
          resolve(out);
        } catch (e) {
          reject(e);
        }
      })
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        "-loop",
        "0",
        "-ss",
        "00:00:00",
        "-t",
        `00:00:${String(duration).padStart(2, "0")}`,
        "-preset",
        "default",
        "-an",
        "-vsync",
        "0"
      ])
      .toFormat("webp")
      .save(tmpOut);
  });
}

export async function stickerify(input, options = {}) {
  const meta = {
    pack: options.packname || "MyBot",
    author: options.author || "Raihan",
    type: options.type || StickerTypes.FULL,
    quality: options.quality || 70
  };

  if (Buffer.isBuffer(input)) {
    const mime = await fileTypeFromBuffer(input);
    if (mime && mime.mime.startsWith("video")) {
      return await videoToStickerBuffer(input, options.duration || 5);
    }
  }

  const sticker = new Sticker(input, meta);
  return await sticker.toBuffer();
}
