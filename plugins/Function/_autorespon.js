import { teks, vn, stik, getRandom } from "../../middleware/botContent.js";
import moment from "moment-timezone";
const lastSent = {};

const normalize = (str = "") =>
  str
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase();

export default {
  name: "autoResponses",
  description: "Respon otomatis VN, Sticker, atau Text sesuai trigger",
  type: "hook",

  before: async (m, { conn }) => {
    try {
      if (!m.isGroup) return false;
      const chatId = m.chat;
      const time = moment().tz("Asia/Jakarta").format("HH:mm");

      const msgText = m.budy?.trim() || "";
if (!msgText) return false;

const words = msgText.split(/\s+/);
if (words.length !== 1) return false;

const strawish = words[0].toLowerCase();

      const now = Date.now();
      const cooldown = 5000;
      const settings = global.db?.data?.settings || {};
      const responseType = normalize(settings.respontype || "text");

      async function sendvn(url) {
        await conn.sendMessage(chatId, { audio: { url }, mimetype: "audio/mpeg",ptt:true }, { quoted: m });
      }

      const sendResponse = async (category) => {
        if (!lastSent[chatId] || now - lastSent[chatId] > cooldown) {
          let responded = false;

          switch (responseType) {
            case "vn":
              if (vn[category]?.length) {
                const vnUrl = getRandom(vn[category]);
                await conn.sendMessage(
                  chatId,
                  { audio: { url: vnUrl }, mimetype: "audio/mpeg" },
                  { quoted: m }
                );
                responded = true;
              }
              break;

            case "sticker":
              if (stik[category]?.length) {
                const stikerUrl = getRandom(stik[category]);
                await conn.sendMessage(chatId, { sticker: { url: stikerUrl } }, { quoted: m });
                responded = true;
              }
              break;

            case "text":
            default:
              responded = false;
              break;
          }

          // custom
          if (!responded) {
            switch (category) {
              case "toxic":
                await m.reply("🚫 Jangan toxic cuy!");
                break;
              case "araara":
                await m.reply("😳 Ara ara apaan sih...");
                break;
              case "bot":
                await sendvn(getRandom(vn.bot));
                break;
              case "salam":
                await sendvn(getRandom(vn.salam));
                break;
              case "siang":
                await sendvn(getRandom(vn.siang));
                break;
              case "malam":
                await sendvn(getRandom(vn.malam));
                break;
              case "pagi":
                await sendvn(getRandom(vn.pagi));
                break;
              default:
                await m.reply("⚡ Ada respon tapi belum diatur cuy!");
            }
          }

          lastSent[chatId] = now;
        }
      };

      if (teks.toxic?.includes(strawish)) {
        await sendResponse("toxic");
        return true;
      }

      if (teks.araara?.includes(strawish)) {
        await sendResponse("araara");
        return true;
      }

      if (teks.bot?.includes(strawish)) {
        await sendResponse("bot");
        return true;
      }

      if (teks.salam?.includes(strawish)) {
        await sendResponse("salam");
        return true;
      }

      if (teks.siang?.includes(strawish)) {
        if (time < "10:00" || time > "15:59") {
          return m.reply("Hadeuh sekarang udah bukan siang, kak 😴");
        }
        await sendResponse("siang");
        return true;
      }

      if (teks.malam?.includes(strawish)) {
        if (time < "18:00" || time > "23:59") {
          return m.reply("Sekarang belum waktunya malam, kak 🌅");
        }
        await sendResponse("malam");
        return true;
      }
      if (teks.pagi?.includes(strawish)) {
        if (time < "04:00" || time > "09:59") {
          return m.reply("Sekarang udah bukan pagi, kak 🌞");
        }
        await sendResponse("pagi");
        return true;
      }

      return false;
    } catch (err) {
      console.error("❌ Error di autoResponses.js:", err);
      return false;
    }
  }
};
