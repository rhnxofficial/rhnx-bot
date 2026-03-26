import "../settings.js";
import chalk from "chalk";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { DisconnectReason } from "baileys";
import Spinnies from "spinnies";
import { exec } from "child_process";
import fs from "fs";

const spinner = {
  interval: 130,
  frames: [
    "✖ [░░░░░░░░░░░░░░░]",
    "✖ [■░░░░░░░░░░░░░░]",
    "✖ [■■░░░░░░░░░░░░░]",
    "✖ [■■■░░░░░░░░░░░░]",
    "✖ [■■■■░░░░░░░░░░░]",
    "✖ [■■■■■░░░░░░░░░░]",
    "✖ [■■■■■■░░░░░░░░░]",
    "✖ [■■■■■■■░░░░░░░░]",
    "✖ [■■■■■■■■░░░░░░░]",
    "✖ [■■■■■■■■■░░░░░░]",
    "✖ [■■■■■■■■■■░░░░░]",
    "✖ [■■■■■■■■■■■░░░░]",
    "✖ [■■■■■■■■■■■■░░░]",
    "✖ [■■■■■■■■■■■■■░░]",
    "✖ [■■■■■■■■■■■■■■░]",
    "✖ [■■■■■■■■■■■■■■■]"
  ]
};

let globalSpinner;
const getGlobalSpinner = (disableSpins = false) => {
  if (!globalSpinner) {
    globalSpinner = new Spinnies({
      color: "white",
      succeedColor: "blue",
      spinner,
      disableSpins
    });
  }
  return globalSpinner;
};

let spins = getGlobalSpinner(false);
const start = (id, text) => {
  try {
    spins.add(id, { text });
  } catch {}
};
const success = (id, text) => {
  try {
    spins.succeed(id, { text });
  } catch {}
};

export async function clearConsole() {
  const isWindows = process.platform === "win32";
  const isLinuxOrMac = process.platform === "linux" || process.platform === "darwin";

  return new Promise((resolve) => {
    const command = isWindows ? "cls" : isLinuxOrMac ? "clear" : "";
    if (command) {
      exec(command, () => resolve());
    } else {
      resolve();
    }
  });
}

export const connectionUpdate = async (connectToWhatsApp, conn, update) => {
  try {
    const { connection, lastDisconnect, qr } = update;

    const statusCode = lastDisconnect?.error
      ? new Boom(lastDisconnect.error)?.output?.statusCode
      : null;

    if (qr && !global.system?.pairingCode) {
      console.log(chalk.blueBright("[!] Silakan scan QR berikut:\n"));
      qrcode.generate(qr, { small: true });
    }

    if (connection === "connecting") {
      start("1", "Connecting...");
    }

    if (connection === "open") {
      success("1", "Connected ✅");
      console.log(chalk.blue("[✓] Terhubung ke WhatsApp!"));

    /*  const ownerJid = `${owner.contact}@s.whatsapp.net`;
      try {
        await conn.sendMessage(ownerJid, { text: "Bot aktif kembali ✅" });
      } catch {}

      const bot = global.db?.data?.others?.["restart"];
      if (bot) {
        try {
          const m = bot.m;
          const from = bot.from;
          await conn.sendMessage(from, { text: "Bot is connected" }, { quoted: m });
          delete global.db.data.others["restart"];
        } catch (e) {
          console.error("❌ Gagal kirim pesan restart:", e.message);
        }
      }*/
    }

    if (connection === "close") {
      console.log(chalk.red("✖ Koneksi terputus."));

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(
          chalk.yellow("⚠️ Session rusak / logout. Hapus folder session lalu login ulang.")
        );
      } else {
        console.log(chalk.yellow("🔄 Mencoba reconnect..."));
        connectToWhatsApp();
      }
    }
  } catch (err) {
    console.error("❌ Error di connectionUpdate:", err.message);

    if (err.code === "ENOSPC") {
      console.warn(
        chalk.yellow("⚠️ Storage penuh! Melewati operasi sementara tanpa mematikan bot.")
      );
    } else {
      console.log(chalk.yellow("🔄 Mencoba reconnect setelah error..."));
      connectToWhatsApp();
    }
  }
};

process.on("uncaughtException", (err) => {
  console.error(chalk.red("⚠️ Uncaught Exception:"));
  console.error(err.stack || err);
  if (err.code === "ENOSPC") {
    console.warn(chalk.yellow("⚠️ Disk penuh! Melewati error tanpa matikan bot."));
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red("⚠️ Unhandled Promise Rejection:"));
  console.error("Reason:", reason);
});

process.on("error", (err) => {
  console.error(chalk.red("⚠️ Process Error:"));
  console.error(err.stack || err);
});

setInterval(() => {
  try {
    fs.writeFileSync("/temp/test_disk.txt", "ping");
  } catch (e) {
    if (e.code === "ENOSPC") {
      console.warn(
        chalk.yellow("⚠️ Disk penuh! Bot tetap hidup tapi operasi file dihentikan sementara.")
      );
    }
  }
}, 60_000);
