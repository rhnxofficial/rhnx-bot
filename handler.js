import "./settings.js";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import chalk from "chalk";
import stringSimilarity from "string-similarity";
import { fileURLToPath } from "url";

// ==== PEMANGGILAN ====//
import { isNumber } from "./lib/myfunc.js";
import { updateDashboard, scheduleMidnightReset } from "./lib/dashboard.js";
import { getAllJadiBot } from "./lib/jadibot.js";
import { register } from "./middleware/register.js";
import { settings } from "./middleware/settings.js";
import checkAccess from "./middleware/access.js";
import { Logmessage, Logcommands } from "./middleware/logger.js";
import {
  handlePluginSpam,
  removeExpiredSpam,
  msgFilter,
  checkExpiredBanned
} from "./middleware/antispam.js";
import { isCmdOwner, isCmdPrem, isCmdLimit } from "./middleware/cmdManager.js";
import { vn, stik, getRandom } from "./middleware/botContent.js";
import { isBlockedCommand } from "./middleware/blockcmd.js";
import { translateLang } from "./media/text/langue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginsDir = path.join(__dirname, "plugins");
let plugins = {};

function loadPlugins(dir = pluginsDir) {
  plugins = {};
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.readdirSync(dir).forEach((folder) => {
    const folderPath = path.join(dir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      fs.readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"))
        .forEach((file) => loadPlugin(path.join(folderPath, file)));
    } else if (folder.endsWith(".js")) {
      loadPlugin(folderPath);
    }
  });

  //console.log(chalk.green(`[✓] Plugins loaded: ${Object.keys(plugins).length}`));
}

async function loadPlugin(filePath) {
  try {
    const pluginModule = await import(path.resolve(filePath) + `?update=${Date.now()}`);
    const plugin = pluginModule.default || pluginModule;
    if (plugin && plugin.name) {
      plugin.__file = filePath;
      plugins[plugin.name] = plugin;
      return true;
    }
  } catch (err) {
    console.error(chalk.red(`❌ Gagal load plugin: ${path.basename(filePath)}\n`), err);
  }
  return false;
}

function watchPlugins(dir = pluginsDir) {
  if (!fs.existsSync(dir)) return;

  const watcher = chokidar.watch(dir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on("add", (file) => {
      if (file.endsWith(".js")) {
        loadPlugin(file).then((ok) => {
          if (ok) console.log(chalk.blue(`[NEW] Plugin ditambahkan: ${path.relative(dir, file)}`));
        });
      }
    })
    .on("change", (file) => {
      if (file.endsWith(".js")) {
        loadPlugin(file).then((ok) => {
          if (ok)
            console.log(chalk.yellow(`[UPDATE] Plugin diupdate: ${path.relative(dir, file)}`));
        });
      }
    })
    .on("unlink", (file) => {
      if (!file.endsWith(".js")) return;
      const pluginName = Object.keys(plugins).find((k) => plugins[k].__file === file);
      if (pluginName) {
        delete plugins[pluginName];
        console.log(chalk.red(`[DELETE] Plugin dihapus: ${path.relative(dir, file)}`));
      }
    });
}

loadPlugins();
watchPlugins();

export default async (conn, m, chatUpdate) => {
  try {
    const { budy, body } = m;
    const sender = m.sender;
    const senderNumber = sender.split("@")[0];
    const from = m.chat;
    const isGroup = m.isGroup;
    const itsMe = sender === conn.user.jid;

    await settings(m, isNumber);
    await register(m, conn, isNumber);
    // Ambil data DB
    var publik = db.data.settings.public;
    const AntiSpam = db.data.antispam;
    const spammer = [];
    const isAntiSpam = m.isGroup ? db.data.chats[m.chat]?.antispam : false;
    let checkNumber = senderNumber.endsWith("@s.whatsapp.net")
      ? senderNumber
      : senderNumber + "@s.whatsapp.net";

    // cek banned
    const isBanned = (global.db.data?.banned || []).some((u) => u.id === checkNumber);

    const ownerData = Object.values(global.db.data.data.owner || {});

    const ownerNumber = [
      ...ownerData.map((o) => o.number + "@s.whatsapp.net"),
      conn.decodeJid(conn.user.id),
      "6281316643491@s.whatsapp.net",
      `${owner.contact}@s.whatsapp.net`
    ];
    const isOwner = ownerNumber.includes(conn.decodeJid(m.sender));
    const isPremium = isOwner || global.db.data.users[m.sender]?.premium === true;
    const allJadiBot = await getAllJadiBot();
    const jadiBotNumbers = allJadiBot.map((v) => v.user?.split("@")[0]?.replace(/:.+/, ""));
    const connNumber = conn.user?.id?.split("@")[0]?.replace(/:.+/, "");
    const isJadibot = jadiBotNumbers.includes(connNumber);
    const botRun = global.db.data.others["runtime"];
    const botTime = botRun ? new Date() - botRun.runtime : "Tidak terdeteksi";
    const runTime = clockString(botTime);
    global.runTime = runTime;
    const Tnow = Math.floor(Date.now() / 1000);
    if (Tnow - m.messageTimestamp.low > global.system.Intervalmsg)
      return console.log(chalk.gray(`Pesan lama diabaikan`));

    const defaultPrefix = db.data?.settings?.prefix || ".";
    const multi = db.data?.settings?.multi || false;
    const prefix = defaultPrefix;
    let prefixes = [defaultPrefix];
    if (multi) {
      prefixes = [".", "!", "#", defaultPrefix];
    }
    const usedPrefix = prefixes.find((p) => body.startsWith(p)) || null;
    const isCmd = usedPrefix !== null;
    const command = isCmd
      ? m.body.slice(usedPrefix.length).trim().split(/\s+/)[0].toLowerCase()
      : isOwner
        ? (m.body || "").trim().split(/\s+/)[0].toLowerCase()
        : "";
    const args = isCmd
      ? m.body.slice(usedPrefix.length).trim().split(/\s+/).slice(1)
      : isOwner
        ? (m.body || "").trim().split(/\s+/).slice(1)
        : [];
    const q = args.join(" ");

    // BANCHAT
    const isBanchat = isGroup ? db.data.chats[m.chat].banchat : false;
    if (isGroup && !isPremium && !m.isAdmin && isBanchat && !itsMe && !isOwner) {
      return;
    }
    // === GLOBAL LANGUAGE ===
    global.language = db.data.settings.language;
    global.t = async (text) => await translateLang(text, global.language);
    scheduleMidnightReset();
    await (await import("./lib/allfake.js")).default(m);

    // Log
    if (!isCmd && body.length < 8000 && m.type !== "protocolMessage") Logmessage(conn, m, body);
    if (isCmd) Logcommands(m, command);

    // === AUTO BIO BOT ===
    let botSet = global.db.data.settings;
    if (!botSet.status) botSet.status = new Date() * 1;

    if (botSet.autoBio && new Date() * 1 - botSet.status > 2000) {
      try {
        let data = global.db.data.others.runtime;
        let time = new Date() - data.runtime;

        let bio = styleText(
          `Im ${bot.name} 🤖 || ⏰ Runtime ${clockString(time)} || 🌎 Mode: ${publik ? "Public" : "Self"}`
        );

        await conn.updateProfileStatus(bio).catch(() => {});

        botSet.status = new Date() * 1;
      } catch (e) {
        console.log("Auto Bio Error:", e);
      }
    }

    if (isCmd) {
      conn.sendPresenceUpdate("composing", m.chat);
    } else {
      conn.sendPresenceUpdate("available", m.chat);
    }
    conn.readMessages([m.key]);

    if (m.key.remoteJid == "status@broadcast")
      return conn
        .sendMessage(
          m.key.remoteJid,
          { react: { text: "🥰", key: m.key } },
          { statusJidList: [m.key.participant, m.sender] }
        )
        .catch(() => false);

    // setReply
    const setReply = async (text) => {
      const gambar = [
        "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RUnw.jpg",
        "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-RUnw.jpg"
      ];

      const photo = gambar[Math.floor(Math.random() * gambar.length)];

      await conn.sendMessage(
        m.chat,
        {
          text: styleText(text),
          contextInfo: {
            externalAdReply: {
              showAdAttribution: false,
              renderLargerThumbnail: false,
              title: bot.name,
              body: api.rhnx,
              mediaType: 2,
              mediaUrl: "https://www.youtube.com/@rhnxofficial",
              thumbnailUrl: photo,
              sourceUrl: ""
            }
          }
        },
        { quoted: m }
      );
    };
    // cek cmd
    if (isBanned && !m.fromMe) {
      return conn.sendMessage(
        m.chat,
        { text: "🚫 Kamu sementara dibanned, tidak bisa menggunakan command." },
        { quoted: m }
      );
    }
    if (isCmd) {
      if (isBlockedCommand(command))
        return setReply(`⛔ Maaf, command *${command}* sedang diblokir oleh owner`);

      if (isCmdOwner(command) && !isOwner)
        return setReply(`⛔ Command "${command}" hanya bisa digunakan owner`);

      if (isCmdPrem(command) && !isPremium) {
        return setReply(`⛔ Command "${command}" hanya untuk user premium`);
      }
      if (isCmdLimit(command)) {
        const userLimit = db.data.users[sender]?.limit || 0;
        if (userLimit <= 0) return setReply(`⛔ Command "${command}" membutuhkan limit tersisa`);
        db.data.users[sender].limit -= 1;
        console.log(
          `[LIMIT] ${sender} menggunakan command "${command}", sisa limit: ${db.data.users[sender].limit}`
        );
      }
    }

    if (isCmd && !itsMe) {
      removeExpiredSpam(senderNumber);
      checkExpiredBanned();
      const blocked = handlePluginSpam({ senderNumber, conn, m });
      if (blocked) return;
      if (msgFilter.isFiltered(sender)) return;
    }

    if (budy && budy.toLowerCase().includes("ekprefix")) {
      let info = `📌 Prefix saat ini: *${prefix}*\n⚡ Multi Prefix: *${multi ? "ON" : "OFF"}*`;
      if (multi) {
        info += `\n🔹 Prefix tambahan: . ! #`;
      }
      await m.reply(info);
    }

    if (
      m.isGroup &&
      m.mentionByTag &&
      m.mentionByTag().includes(`${owner.contact}@s.whatsapp.net`)
    ) {
      const kta = [
        "*Iya kak itu nomer ayang aku ada apa ya ??*\n",
        "*Jangan di tag dia sedang sibuk.*\n",
        "*Kenapa kak tag ayang aku??*\n"
      ];
      const su = kta[Math.floor(Math.random() * kta.length)];
      conn.sendMessage(
        m.chat,
        {
          text: "@" + m.chat,
          contextInfo: {
            mentionedJid: false,
            groupMentions: [
              {
                groupJid: m.chat,
                groupSubject: su
              }
            ]
          }
        },
        { quoted: m }
      );
    }
    // ====== BATAS FUNCTION ======//

    for (let p of Object.values(plugins)) {
      if (p.type === "start" && typeof p.start === "function") {
        try {
          await p.start(conn);
          console.log(chalk.green(`[AUTO START] ${p.name} aktif`));
        } catch (e) {
          console.error(chalk.red(`[AUTO START ERROR] ${p.name}`), e);
        }
      }
    }
    // 1️⃣  "before"
    for (let p of Object.values(plugins)) {
      if (typeof p.before === "function") {
        try {
          await p.before(m, {
            conn,
            command,
            prefix: usedPrefix || prefix,
            q,
            args,
            setReply,
            isOwner,
            isPremium,
            isJadibot
          });
        } catch (e) {
          console.error(chalk.red(`[BEFORE ERROR] ${p.name}`), e);
        }
      }
    }

    let pluginExecuted = false;

    // 2️⃣  command
    const plugin = Object.values(plugins).find(
      (p) =>
        (!p.type || p.type === "command") &&
        (p.name === command || (p.alias && p.alias.includes(command)))
    );

    if (plugin) {
      const extras = {
        conn,
        command,
        prefix: usedPrefix || prefix,
        q,
        args,
        setReply,
        isOwner,
        isPremium,
        isJadibot
      };

      try {
        const allowed = await checkAccess(m, plugin, { ...extras, m });
        if (!allowed) return;

        await plugin.run?.(m, extras);
        pluginExecuted = true;
        updateDashboard("success", command, m, !isCmd && isOwner);

        if (typeof plugin.after === "function") {
          try {
            await plugin.after(m, { conn, ...extras });
          } catch (e) {
            console.error(chalk.red(`[AFTER ERROR] ${plugin.name}`), e);
          }
        }
      } catch (e) {
        console.error(chalk.red(`[PLUGIN ERROR] ${plugin.name}`), e);
        updateDashboard("fail", command, m, !isCmd && isOwner);
        m.reply(`⚠️ Terjadi kesalahan di plugin *${plugin.name}*:\n${e.message}`);

        let errorMsg = `
⚠️ *PLUGIN ERROR*
📂 Plugin: *${plugin.name}*
👤 User: ${m.sender}
💬 Chat: ${m.chat}
🏷️ Nama Group: ${m.isGroup ? (await conn.groupMetadata(m.chat)).subject : "Private Chat"}
⏰ Waktu: ${new Date().toLocaleString("id-ID")}
❌ Error: ${e.message}
  `.trim();

        let target = global.owner.contact + "@s.whatsapp.net";
        await conn
          .sendMessage(target, { text: styleSans(`${errorMsg}`) }, { quoted: m })
          .catch(() => {});
      }
      } else if (isCmd) {
  const allCommands = Object.values(plugins)
    .filter((p) => !p.type || p.type === "command")
    .flatMap((p) => [p.name, ...(p.alias || [])])
    .filter(Boolean);

  const { bestMatch } = stringSimilarity.findBestMatch(command, allCommands);

  if (bestMatch.rating >= 0.4) {
    const replyText = `Command *${usedPrefix}${command}* tidak ditemukan\nMungkin yang kamu maksud adalah *${usedPrefix}${bestMatch.target}*`;

    await m.reply(replyText);
  }
}
    // 3️⃣ after
    for (let p of Object.values(plugins)) {
      if (typeof p.globalAfter === "function") {
        try {
          await p.globalAfter(m, { conn, pluginExecuted });
        } catch (e) {
          console.error(chalk.red(`[GLOBAL AFTER ERROR] ${p.name}`), e);
        }
      }
    }
  } catch (err) {
    console.error(err);
    let firstStackLine = err.stack?.split("\n")[1] || "Stack tidak tersedia";
    let errorMsg =
      `⚠️ Terjadi kesalahan di handler\n\n` +
      `Error: ${err.message}\n` +
      `Lokasi: ${firstStackLine.trim()}`;

    m.reply(errorMsg);
  }
};

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    console.log(chalk.bgBlue.black(` UPDATE HANDLER ${__filename} `));
  });
}
