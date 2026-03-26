import moment from "moment-timezone";
moment.tz.setDefault("Asia/Jakarta");

export function blockCommand(command) {
  if (!global.db.data.blockcmd) global.db.data.blockcmd = [];
  const exists = global.db.data.blockcmd.find((c) => c.command === command);
  if (!exists) {
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    global.db.data.blockcmd.push({ command, date });
    console.log(`[BLOCKCMD] Command ${command} diblok pada ${date}`);
    return true;
  }
  return false;
}

export function unblockCommand(command) {
  if (!global.db.data.blockcmd) global.db.data.blockcmd = [];
  const idx = global.db.data.blockcmd.findIndex((c) => c.command === command);
  if (idx !== -1) {
    global.db.data.blockcmd.splice(idx, 1);
    console.log(`[UNBLOCKCMD] Command ${command} dibuka`);
    return true;
  }
  return false;
}

export function listBlockedCommands() {
  if (!global.db.data.blockcmd) global.db.data.blockcmd = [];
  return (
    global.db.data.blockcmd
      .map((c, i) => `${i + 1}. ${c.command} (Diblok: ${c.date})`)
      .join("\n") || "Tidak ada command diblok"
  );
}

export function isBlockedCommand(command) {
  if (!global.db.data.blockcmd) global.db.data.blockcmd = [];
  return !!global.db.data.blockcmd.find((c) => c.command === command);
}
