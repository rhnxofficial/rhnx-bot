import fs from "fs";
import { exec } from "child_process";

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};

export default {
  name: "convert",
  alias: [
    "bass",
    "blown",
    "deep",
    "earrape",
    "fast",
    "fat",
    "robot",
    "slow",
    "smooth",
    "chipmunk",
    "reverb",
    "vocaloid",
    "reverse",
    "nightcore"
  ],
  description: "Ubah audio menjadi suara berbeda",
  access: { group: true },

  run: async (m, { conn, command, prefix, setReply }) => {
    const effects = [
      "bass",
      "blown",
      "deep",
      "earrape",
      "fast",
      "fat",
      "robot",
      "slow",
      "smooth",
      "chipmunk",
      "reverb",
      "vocaloid",
      "reverse",
      "nightcore"
    ];

    if (!command || !effects.includes(command)) {
      let effectList = `*🎧 Daftar efek yang tersedia:*\n\n`;
      effects.forEach((effect, index) => {
        effectList += `${index + 1}. ${effect}\n`;
      });
      effectList += `\nKetik *${prefix}[nama efek]* untuk menggunakannya.\nContoh: *${prefix}bass*`;
      return m.reply(effectList);
    }

    const mime = (m.quoted?.msg || m.quoted)?.type || "";
    if (!m.quoted || !/audio/.test(mime)) {
      return m.reply("Reply audio yang ingin diberi efek!");
    }

    try {
      let set;
      switch (command) {
        case "bass":
          set = "-af equalizer=f=54:width_type=o:width=2:g=20";
          break;
        case "blown":
          set = "-af acrusher=.1:1:64:0:log";
          break;
        case "deep":
          set = "-af atempo=4/4,asetrate=44500*2/3";
          break;
        case "earrape":
          set = "-af volume=12";
          break;
        case "fast":
          set = '-filter:a "atempo=1.63,asetrate=44100"';
          break;
        case "fat":
          set = '-filter:a "atempo=1.6,asetrate=22100"';
          break;
        case "robot":
          set =
            "-filter_complex \"afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75\"";
          break;
        case "slow":
          set = '-filter:a "atempo=0.7,asetrate=44100"';
          break;
        case "smooth":
          set = "-filter:v \"minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120'\"";
          break;
        case "chipmunk":
          set = '-filter:a "atempo=1.5,asetrate=44100*1.5"';
          break;
        case "reverb":
          set = '-af "aecho=0.8:0.9:1000:0.3"';
          break;
        case "vocaloid":
          set = '-af "rubberband=tempo=1.2"';
          break;
        case "reverse":
          set = '-filter:a "areverse"';
          break;
        case "nightcore":
          set = '-filter:a "atempo=1.25,asetrate=44100*1.25"';
          break;
      }

      m.react("⏱️");
      const media = await m.quoted.downloadAndSave();
      const ran = getRandom(".mp3");

      exec(`ffmpeg -i ${media} ${set} ${ran}`, (err) => {
        fs.unlinkSync(media);
        if (err) return m.reply(` ${err.message}`);

        const buff = fs.readFileSync(ran);
        conn.sendMusic(m.chat, buff, m);
        fs.unlinkSync(ran);
      });
    } catch (e) {
      console.error(e);
      setReply(`Terjadi kesalahan: ${e.message}`);
    }
  }
};
