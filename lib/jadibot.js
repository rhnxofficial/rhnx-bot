import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";
import * as simple from "./simple.js";
import { memberUpdate, groupUpdate } from "../middleware/group.js";
import handler from "../handler.js";
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} from "baileys";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connections = {};

export async function startJadiBot(jid, conn) {
  const sessionFolder = path.join("jadibot-session", jid);
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    version,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({ level: "fatal" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino().child({ level: "silent", stream: "store" })
      )
    }
  });
  sock.isJadiBot = true;
  global.conn = simple.Func(sock);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log(`[✓] Bot ${jid} berhasil connect!`);

      if (conn) {
        try {
          /*  await conn.sendMessage(`${jid}@s.whatsapp.net`, {
          text: `✅ Bot ${jid} berhasil terhubung!`
        });*/
        } catch (err) {
          console.error(`[!] Gagal mengirim notifikasi reconnect ke ${jid}:`, err.message);
        }
      }
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`[!] Koneksi ${jid} ditutup. Status: ${statusCode || "Tidak diketahui"}`);

      const shouldReconnect = statusCode !== 401;

      if (conn) {
        try {
          const message = `❌ Bot ${jid} terputus.\nKoneksi telah ditutup.\nKode kesalahan: ${statusCode || "Tidak diketahui"}`;
          // await conn.sendMessage(`${jid}@s.whatsapp.net`, { text: message });
        } catch (err) {
          console.error(`[!] Gagal mengirim notifikasi putus ke ${jid}:`, err.message);
        }
      }
      if (shouldReconnect) {
        console.log(`[i] Mencoba reconnect untuk ${jid}...`);
        try {
          await startJadiBot(jid, conn);
        } catch (err) {
          console.error(`[!] Gagal reconnect ${jid}:`, err.message);
        }
      } else {
        console.log(`[i] Bot ${jid} sudah logout. Tidak reconnect.`);
        try {
          stopJadiBot(jid);
        } catch (err) {
          console.error(`[!] Gagal menghentikan bot ${jid}:`, err.message);
        }
      }
    }
  });

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
  sock.ev.on("creds.update", saveCreds);

  connections[jid] = { sock };

  return sock;
}

export async function getPairingCode(jid, number) {
  const bot = connections[jid]?.sock;
  if (!bot) throw new Error(`Bot ${jid} belum aktif`);

  try {
    console.log("[i] Menunggu socket siap...");
    await new Promise((res) => setTimeout(res, 3000)); // delay 3 detik
    const code = await bot.requestPairingCode(number);
    console.log(`[✓] Pairing code untuk ${number}: ${code}`);
    return { jid, number, code };
  } catch (err) {
    console.error("Gagal request pairing code:", err);
    throw err;
  }
}

export function getAllJadiBot() {
  const basePath = path.join("jadibot-session");
  if (!fs.existsSync(basePath)) return [];

  const folders = fs.readdirSync(basePath).filter((name) => {
    const fullPath = path.join(basePath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  return folders.map((jid) => {
    const connData = connections[jid];
    const status = connData?.sock?.ws?.readyState;

    let connectionStatus = "❔ Tidak diketahui";
    switch (status) {
      case 0:
        connectionStatus = "🔄 Menghubungkan...";
        break;
      case 1:
        connectionStatus = "✅ Terhubung";
        break;
      case 2:
        connectionStatus = "⚠️ Menutup...";
        break;
      case 3:
        connectionStatus = "❌ Terputus";
        break;
      default:
        if (!connData) connectionStatus = "❌ Tidak aktif";
        break;
    }

    return {
      jid,
      conn: connData?.sock || null,
      status: connectionStatus
    };
  });
}

export function stopJadiBot(jid) {
  if (!connections[jid]) return false;
  const { sock } = connections[jid];
  sock.ev.removeAllListeners();
  sock.end();
  delete connections[jid];
  console.log(`[i] Bot ${jid} dimatikan.`);
  return true;
}

export function deleteSession(jid) {
  const sessionPath = path.join("jadibot-session", jid);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    stopJadiBot(jid);
    console.log(`[i] Session ${jid} dihapus.`);
    return true;
  }
  return false;
}

export async function loadAllJadiBot() {
  const basePath = path.join("jadibot-session");
  if (!fs.existsSync(basePath)) return [];

  const folders = fs.readdirSync(basePath).filter((name) => {
    const fullPath = path.join(basePath, name);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const jid of folders) {
    try {
      console.log(`[i] Menyambungkan ulang session ${jid}...`);
      await startJadiBot(jid);
    } catch (e) {
      console.error(`[!] Gagal menyambungkan ${jid}:`, e.message);
    }
  }
}
