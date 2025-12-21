import chalk from "chalk";

export const msgFilter = {
  _filters: [],
  isFiltered: (chatId) => msgFilter._filters.includes(chatId),
  addFilter: (chatId, time = 5000) => {
    if (!msgFilter.isFiltered(chatId)) {
      msgFilter._filters.push(chatId);
      setTimeout(() => {
        msgFilter._filters = msgFilter._filters.filter((f) => f !== chatId);
        console.log(chalk.bgBlue.black("[ FILTER ]"), `Cooldown selesai: ${chatId}`);
      }, time);
    }
  }
};

export function handlePluginSpam({
  senderNumber,
  conn,
  m,
  cooldown = 5000, // jeda 5 detik
  banLimit = 7, // banned setelah >7 kali spam
  banTime = 15 * 60 * 1000 // 15 menit
}) {
  if (!global.db.data.antispam) global.db.data.antispam = [];
  if (!global.db.data.banned) global.db.data.banned = [];

  const AntiSpam = global.db.data.antispam;
  const banned = global.db.data.banned;
  const now = Date.now();

  let banRecord = banned.find((b) => b.id === senderNumber);
  if (banRecord) {
    if (now - banRecord.time >= banTime) {
      banned.splice(banned.indexOf(banRecord), 1);
      console.log(chalk.green(`[UNBAN] ${senderNumber} auto unban`));
    } else {
      console.log(chalk.red(`[BANNED] ${senderNumber} masih banned`));
      return true;
    }
  }

  let userData = AntiSpam.find((u) => u.id === senderNumber);
  if (!userData) {
    userData = { id: senderNumber, last: 0, spamCount: 0 };
    AntiSpam.push(userData);
  }

  if (now - userData.last < cooldown) {
    userData.spamCount++;
    conn.sendMessage(
      m.chat,
      {
        text: styleSans(
          `Beri Bot Jeda ${Math.ceil((cooldown - (now - userData.last)) / 1000)} detik lagi.`
        )
      },
      { quoted: m }
    );
    console.log(
      chalk.yellow(`[WARN] ${senderNumber} spam terlalu cepat (spamCount=${userData.spamCount})`)
    );
  } else {
    userData.spamCount = 0;
  }

  userData.last = now;

  if (userData.spamCount >= banLimit) {
    banned.push({ id: senderNumber, time: now });
    conn.sendMessage(
      m.chat,
      { text: `🚫 Kamu dibanned sementara karena spam tanpa jeda 5 detik.` },
      { quoted: m }
    );
    console.log(
      chalk.red(`[BAN] ${senderNumber} banned karena spam (spamCount=${userData.spamCount})`)
    );
    return true;
  }

  if (userData.spamCount > 0) return true;

  return false;
}

export function removeExpiredSpam(senderNumber, resetTime = 5 * 60 * 1000) {
  if (!global.db.data.antispam) return;
  const AntiSpam = global.db.data.antispam;
  const now = Date.now();

  for (let i = AntiSpam.length - 1; i >= 0; i--) {
    const u = AntiSpam[i];
    if (u.id === senderNumber) {
      if (now - u.last >= resetTime) {
        AntiSpam.splice(i, 1);
        console.log(chalk.bgGreen.black("[ REMOVE SPAM ]"), `${senderNumber} spam count reset`);
      }
    }
  }
}

export function checkExpiredBanned(banTime = 15 * 60 * 1000) {
  if (!global.db.data.banned) return;
  const banned = global.db.data.banned;
  const now = Date.now();

  for (let i = banned.length - 1; i >= 0; i--) {
    if (now - banned[i].time >= banTime) {
      console.log(chalk.green(`[UNBAN] ${banned[i].id} sudah di-unban otomatis`));
      banned.splice(i, 1);
    }
  }
}
