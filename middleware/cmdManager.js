import moment from "moment-timezone";
moment.tz.setDefault("Asia/Jakarta");

export function addCmdOwner(command, sender) {
  if (!global.db.data.data.cmdowner) global.db.data.data.cmdowner = [];
  if (global.db.data.data.cmdowner.find((c) => c.command === command)) return false;

  global.db.data.data.cmdowner.push({
    command,
    by: sender,
    date: moment().format("YYYY-MM-DD HH:mm:ss")
  });
  console.log(`[CMDOWNER] ${command} ditambahkan oleh ${sender}`);
  return true;
}

export function addCmdPrem(command, sender) {
  if (!global.db.data.data.cmdprem) global.db.data.data.cmdprem = [];
  if (global.db.data.data.cmdprem.find((c) => c.command === command)) return false;

  global.db.data.data.cmdprem.push({
    command,
    by: sender,
    date: moment().format("YYYY-MM-DD HH:mm:ss")
  });
  console.log(`[CMDPREM] ${command} ditambahkan oleh ${sender}`);
  return true;
}

export function addCmdLimit(command, sender) {
  if (!global.db.data.data.cmdlimit) global.db.data.data.cmdlimit = [];
  if (global.db.data.data.cmdlimit.find((c) => c.command === command)) return false;

  global.db.data.data.cmdlimit.push({
    command,
    by: sender,
    date: moment().format("YYYY-MM-DD HH:mm:ss")
  });
  console.log(`[CMDLIMIT] ${command} ditambahkan oleh ${sender}`);
  return true;
}

export function delCmdOwner(command) {
  if (!global.db.data.data.cmdowner) return false;
  const idx = global.db.data.data.cmdowner.findIndex((c) => c.command === command);
  if (idx !== -1) {
    global.db.data.data.cmdowner.splice(idx, 1);
    console.log(`[CMDOWNER] ${command} dihapus`);
    return true;
  }
  return false;
}

export function delCmdPrem(command) {
  if (!global.db.data.data.cmdprem) return false;
  const idx = global.db.data.data.cmdprem.findIndex((c) => c.command === command);
  if (idx !== -1) {
    global.db.data.data.cmdprem.splice(idx, 1);
    console.log(`[CMDPREM] ${command} dihapus`);
    return true;
  }
  return false;
}

export function delCmdLimit(command) {
  if (!global.db.data.data.cmdlimit) return false;
  const idx = global.db.data.data.cmdlimit.findIndex((c) => c.command === command);
  if (idx !== -1) {
    global.db.data.data.cmdlimit.splice(idx, 1);
    console.log(`[CMDLIMIT] ${command} dihapus`);
    return true;
  }
  return false;
}

export function listCmd(type) {
  if (!global.db.data.data[type] || global.db.data.data[type].length === 0)
    return "Belum ada command";
  return global.db.data.data[type]
    .map((c, i) => `${i + 1}. ${c.command} (by: ${c.by}, date: ${c.date})`)
    .join("\n");
}

export function isCmdOwner(command) {
  return global.db.data.data.cmdowner?.some((c) => c.command === command);
}

export function isCmdPrem(command) {
  return global.db.data.data.cmdprem?.some((c) => c.command === command);
}

export function isCmdLimit(command) {
  return global.db.data.data.cmdlimit?.some((c) => c.command === command);
}
