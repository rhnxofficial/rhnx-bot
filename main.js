import { execSync } from "child_process";

try {
  if (global.system.prettier) {
    console.log("🧹 Merapikan kode dengan Prettier...\n");

    execSync('npx prettier --write . "!session/**" "!jadibot-session/**" "!.npm/**"', {
      stdio: "ignore"
    });

    console.log("✅ Kode sudah rapi! Menjalankan bot...\n");
  } else {
    console.log("⚙️ Prettier dimatikan di setting.js, langsung jalankan bot...\n");
  }
} catch (e) {
  console.log("⚠️ Gagal merapikan kode (Prettier kemungkinan belum terinstal)\n");
}

import "./settings.js";
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} from "baileys";
import fs from "fs";
import pino from "pino";
import chalk from "chalk";
import CFonts from "cfonts";
import { loadAllJadiBot } from "./lib/jadibot.js";
import { connectionUpdate, clearConsole } from "./lib/connection.js";
import notifSholat from "./lib/notifSholat.js";
import { memberUpdate, groupUpdate } from "./middleware/group.js";
import * as simple from "./lib/simple.js";
import handler from "./handler.js";

// Banner
CFonts.say("RHNX BOT", {
  font: "tiny",
  align: "center",
  colors: ["system"]
});

CFonts.say("Follow & Subscribe:", {
  font: "console",
  align: "center",
  colors: ["white"]
});

CFonts.say("https://www.youtube.com/@rhnxofficial", {
  font: "console",
  align: "center",
  colors: ["blue"]
});

const connectToWhatsApp = async () => {
  // lowdb (ESM)
  const { Low } = await import("lowdb");
  const { JSONFile } = await import("lowdb/node");

  const dbFolder = "./database";
  if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });

  const dbFile = `${dbFolder}/database.json`;
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "{}");

  const defaultData = {
    data: [],
    users: {},
    chats: {},
    chanel: {},
    blockcmd: [],
    antispam: [],
    banned: [],
    settings: {},
    dashboard: {},
    toxic: [],
    others: {}
  };

  const adapter = new JSONFile(dbFile);
  global.db = new Low(adapter, defaultData);

  global.safeWriteDB = async () => {
    try {
      const tmpFile = `${dbFolder}/.database.json.tmp`;

      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
        console.log("🧹 File tmp dihapus:", tmpFile);
      }

      if (!global.db?.data) {
        global.db.data = { ...defaultData };
      }

      await global.db.write();
    } catch (err) {
      console.warn("⚠️ Gagal menulis database:", err.message);
    }
  };
  (async () => {
    try {
      await global.db.read();
      if (!global.db.data || Object.keys(global.db.data).length === 0) {
        global.db.data = { ...defaultData };
        await global.safeWriteDB();
      }

      console.log("✅ Database siap dipakai");
    } catch (err) {
      console.error("❌ Gagal load database:", err.message);
      global.db.data = { ...defaultData };
    }
  })();

  setInterval(() => {
    let data = global.db.data.others["runtime"];

    if (data) {
      if (new Date() - data.lastTime > 60000 * 60) {
        data.runtime = +new Date();
        data.lastTime = +new Date();
        console.log("Runtime di perbarui");
      } else data.lastTime = +new Date();
    } else {
      global.db.data.others["runtime"] = {
        runtime: +new Date(),
        lastTime: +new Date()
      };
      console.log("New update runtime");
    }
  }, 60000);

  const { state, saveCreds } = await useMultiFileAuthState(system.sessionName);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    printQRInTerminal: !system.pairingCode,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    version,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({
      level: "fatal"
    }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino().child({
          level: "silent",
          stream: "store"
        })
      )
    }
  });

  sock.isJadiBot = false;

  global.conn = simple.Func(sock);
  if (!conn.isJadiBot) {
    //console.log(chalk.green(`[BOT UTAMA] Terhubung sebagai ${conn.user?.id}`));
  } else {
    //console.log(chalk.yellow(`[JADIBOT] Terhubung sebagai ${conn.user?.id}`));
  }
  if (system.pairingCode && !sock.authState.creds.registered) {
    await clearConsole();
    console.log(`🔗 Sedang proses pairing ke nomor ${system.pairingNumber}`);
    setTimeout(async () => {
      let code = await sock.requestPairingCode(system.pairingNumber);

      console.log(`🔑 Pairing Code: ${code.toUpperCase()}`);
    }, 2000);
  }

  global.processedMessages = global.processedMessages || new Set();
  (async () => {
    // console.log("[✓] Bot utama aktif, memuat semua session jadibot...");

    await loadAllJadiBot();
  })();
  sock.ev.on("connection.update", async (update) => {
    connectionUpdate(connectToWhatsApp, sock, update);
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      if (!chatUpdate.messages) return;

      for (let msg of chatUpdate.messages) {
        if (!msg.message || !msg.key.remoteJid) continue;
        if (global.processedMessages.has(msg.key.id)) continue;
        global.processedMessages.add(msg.key.id);

        if (msg.message?.viewOnceMessageV2) msg.message = msg.message.viewOnceMessageV2.message;
        if (msg.message?.viewOnceMessageV2Extension)
          msg.message = msg.message.viewOnceMessageV2Extension.message;
        if (msg.message?.documentWithCaptionMessage)
          msg.message = msg.message.documentWithCaptionMessage.message;

        if (msg.isBaileys) continue;
        if (msg.key.fromMe) continue;
        if (msg.key?.id?.startsWith("3EB0") && msg.key.id.length === 22) continue;

        let m = await simple.smsg(sock, msg);
        if (!m) continue;
        if (typeof handler === "function") {
          await handler(sock, m, chatUpdate);
        }
      }
    } catch (err) {
      console.error("❌ Error di messages.upsert:", err);
    }
  });

  // welcome
  conn.ev.on("group-participants.update", async (anu) => {
    try {
      await memberUpdate(conn, anu);
    } catch (err) {
      console.error("❌ Error memberUpdate:", err);
    }
  });

  // group update
  conn.ev.on("groups.update", async (updates) => {
    try {
      await groupUpdate(conn, updates);
    } catch (err) {
      console.error("❌ Error groupUpdate:", err);
    }
  });

  // NOTIFSHOLAT
  await notifSholat.ambilJadwal();

  setTimeout(() => notifSholat.ambilJadwal(), 5 * 60 * 1000);

  setInterval(() => notifSholat.cekSholat(conn), 30 * 1000);

  async function daily() {
    await notifSholat.ambilJadwal();

    setTimeout(daily, notifSholat.msToMidnight());
  }

  setTimeout(daily, notifSholat.msToMidnight());

  function clockString(ms) {
    let d = isNaN(ms) ? "--" : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
    var dDisplay = d > 0 ? d + " hari, " : "";
    var hDisplay = h > 0 ? h + " jam, " : "";
    var mDisplay = m > 0 ? m + " menit, " : "";
    var sDisplay = s > 0 ? s + " detik" : "";
    let time = d > 0 ? dDisplay + hDisplay + mDisplay + sDisplay : hDisplay + mDisplay + sDisplay;
    return time;
  }
  global.clockString = clockString;

  return sock;
};

connectToWhatsApp();
