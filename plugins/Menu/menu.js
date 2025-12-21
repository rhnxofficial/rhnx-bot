"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginsDir = path.join(process.cwd(), "plugins");
const dataGcStore = "./database/store/groupstore.json";

const getGroupStoreIds = () => {
  if (!fs.existsSync(dataGcStore)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(dataGcStore));
    return data.map((v) => v.idGc);
  } catch {
    return [];
  }
};

function listCategories(categories) {
  return Object.keys(categories)
    .map((cat) => `*-* menu ${cat} (${categories[cat].length} fitur)`)
    .join("\n");
}

function listFeaturesInCategory(category, plugins) {
  let teks = `メ *Berikut Adalah Fitur Yang Tersedia di Folder  "${category}":*\n\n`;
  for (const p of plugins) {
    teks += `*⊹* ${p.name}\n`;
    teks += `> └ ${p.description}\n`;
  }
  return teks;
}

function listGroupedFeatures(categories) {
  let teks = "メ  *List Menu ...*\n\n";
  for (const folder in categories) {
    teks += `.☘︎ ݁˖ *${folder}*\n`;
    for (const p of categories[folder]) {
      teks += `*⊹* ${p.name}\n`;
      teks += `> └ ${p.description}\n`;
    }
    teks += "\n";
  }
  return teks;
}

export default {
  name: "menu",
  alias: ["help", "cmd"],
  description: "Menampilkan daftar command bot",
  access: { register: true },
  run: async (m, { conn, args, isOwner, isPremium, prefix }) => {
    const dataInfo = global.db.data.others?.["newinfo"];
    const info = dataInfo ? dataInfo.info : "";
    const timeInfo = dataInfo ? dataInfo.lastinfo : "tidak ada";
    const setmenu = db.data.settings.setmenu || "thumbnail";
    const isGroupStore = m.isGroup && getGroupStoreIds().includes(m.chat);
    const categories = {};
    const privateCategories = {};
    const storeCategories = {};

    const folders = fs
      .readdirSync(pluginsDir)
      .filter((f) => fs.statSync(path.join(pluginsDir, f)).isDirectory());

    for (const folder of folders) {
      const folderPath = path.join(pluginsDir, folder);
      const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

      for (const file of files) {
        try {
          const { default: plugin } = await import(pathToFileURL(path.join(folderPath, file)).href);
          if (!plugin) continue;

          if (
            m.isGroup &&
            !isGroupStore &&
            ["function", "game_hook", "menu"].includes(folder.toLowerCase()) &&
            !isOwner
          )
            continue;

          if (!isOwner && ["function", "game_hook", "menu"].includes(folder.toLowerCase()))
            continue;

          if (!categories[folder]) categories[folder] = [];
          categories[folder].push({
            name: plugin.name,
            description: plugin.description || "Tidak ada deskripsi"
          });

          if (
            plugin.access?.private ||
            plugin.access?.storewithprivate ||
            ((isOwner || isPremium) && plugin.access?.nocmdprivate)
          ) {
            if (!privateCategories[folder]) privateCategories[folder] = [];
            privateCategories[folder].push({
              name: plugin.name,
              description: plugin.description || "Tidak ada deskripsi"
            });
          }

          if (plugin.access?.groupstore || plugin.access?.storewithprivate) {
            if (!storeCategories[folder]) storeCategories[folder] = [];
            storeCategories[folder].push({
              name: plugin.name,
              description: plugin.description || "Tidak ada deskripsi"
            });
          }
        } catch (err) {
          console.error("❌ Gagal load plugin:", file, err.message);
        }
      }
    }

    const jid = m.sender;

    // ========== PRIVATE ==========
    if (!m.isGroup) {
      const teks = styleText(`Hi @${jid.split("@")[0]}⁩ 🍁
Saya Adalah ${bot.name}, Bot WhatsApp Berbagai Fitur.Akses Utama Bersifat Private,Jika Anda Ingin Mengakses Fitur Lebih Anda Dapat Bergabung Ke Group Dengan Mengetik *.gcbot*

${readmore}
${listGroupedFeatures(privateCategories)}`);

      return conn.sendMessageModify(m.chat, teks, m, {
        title: bot.name,
        largeThumb: true,
        thumbnail: image.default,
        url: api.rhnx,
        mentions: [jid]
      });
    }

    // ========== GROUP STORE ==========
    if (isGroupStore) {
      const teks =
        styleText(`Hi @${jid.split("@")[0]}⁩ 🍁, Silahkan Temukan Kebutuhan Anda Di Group Store Ini Dengan Sesuai Kebutuhan Anda Yang Kami Sediankan Di Fitur Nya...
${readmore}
${listGroupedFeatures(storeCategories)}
`);

      return conn.sendMessageModify(m.chat, teks, m, {
        title: bot.name,
        largeThumb: true,
        thumbnail: image.default,
        url: api.rhnx,
        mentions: [jid]
      });
    }

    // ========== GROUP BIASA ==========
    const teksInfo = await global.t(`Hi @${jid.split("@")[0]}⁩ 🍁
I am ${bot.name} virtual assistant on whatsapp who can help you to dare to download and even chat with me okay have fun bro

*⊹* *Language:* ${db.data.settings.language || "id"}
*⊹* *StyleText:* ${db.data.settings.style || "sans"}
*⊹* *Rest API:* ${api.rhnx}
*⊹* *Script:* https://github.com/rhnxofficial/rhnx-bot
*⊹* *New Update:* ${info} -  ${timeInfo}`);

    if (!args[0]) {
      const teks = `${teksInfo}

メ  *List Menu ...*
${readmore}
${listCategories(categories)}

──────────୨ৎ──────────
Ketik *.menu <folder>* untuk melihat fitur di kategori tersebut.`;

      if (setmenu === "thumbnail") {
        return conn.sendMessageModify(m.chat, teks, m, {
          title: bot.name,
          largeThumb: true,
          thumbnail: image.banner,
          url: api.rhnx,
          mentions: [jid]
        });
      }

      if (setmenu === "button") {
        const sections = [
          {
            title: "Kategori Menu",
            rows: Object.keys(categories).map((cat) => ({
              id: `${prefix}menu ${cat}`,
              title: styleText(`Menu ${cat}`),
              description: `${categories[cat].length} fitur`
            }))
          }
        ];

        return conn.sendInteractive(
          m.chat,
          {
            text: styleText(
              teksInfo +
                `\n\n──────────୨ৎ──────────
Select the *button* below to see the features in that *category*.`
            ),
            footer: bot.name,
            image: { url: image.default },
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "List-Menu",
                  sections
                })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Rest-Api",
                  url: api.rhnx
                })
              }
            ]
          },
          { quoted: m }
        );
      }
    }

    // ========== MENU KATEGORI ==========
    const catName = args[0].toLowerCase();
    const foundCategory = Object.keys(categories).find((cat) => cat.toLowerCase() === catName);

    if (!foundCategory) {
      return m.reply(
        `❌ Kategori *${args[0]}* tidak ditemukan.\nGunakan *.menu* untuk melihat daftar kategori.`
      );
    }

    const fiturTeks = listFeaturesInCategory(foundCategory, categories[foundCategory]);
    return conn.sendMessageModify(m.chat, fiturTeks, m, {
      title: bot.name,
      largeThumb: true,
      thumbnail: image.default,
      url: api.rhnx
    });
  }
};
