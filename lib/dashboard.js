import os from "os";
import fs from "fs";
import moment from "moment-timezone";

export function updateDashboard(type, command, m, withoutPrefix = false) {
  if (!global.db || !global.db.data) return;
  if (!global.db.data.users || !global.db.data.chats) return;

  if (!global.db.data.dashboard) global.db.data.dashboard = {};
  const dash = global.db.data.dashboard;

  const today = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");

  if (!dash.lastResetDate) dash.lastResetDate = today;

  if (dash.lastResetDate !== today) {
    dash.totalCommands = 0;
    dash.successCount = 0;
    dash.errorCount = 0;
    dash.commandStats = {};
    dash.successHistory = [];
    dash.errorHistory = [];
    dash.lastResetDate = today;
  }

  dash.systemStart ??= new Date().toISOString();

  dash.totalCommands = (dash.totalCommands || 0) + 1;
  dash.successCount ??= 0;
  dash.errorCount ??= 0;
  dash.commandStats ??= {};
  dash.successHistory ??= [];
  dash.errorHistory ??= [];

  if (type === "success") dash.successCount += 1;
  if (type === "fail") dash.errorCount += 1;

  const commandKey = withoutPrefix ? `[noprefix] ${command}` : command;
  dash.commandStats[commandKey] = (dash.commandStats[commandKey] || 0) + 1;

  const entry = {
    name: commandKey,
    user: m.pushName || m.sender,
    time: moment().tz("Asia/Jakarta").format("HH:mm:ss")
  };

  if (type === "success") {
    dash.successHistory.unshift(entry);
    dash.successHistory = dash.successHistory.slice(0, 10);
  } else if (type === "fail") {
    dash.errorHistory.unshift(entry);
    dash.errorHistory = dash.errorHistory.slice(0, 10);
  }

  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  if (!user || !chat) return;

  user.hit = (user.hit || 0) + 1;
  if (m.isGroup) chat.hit = (chat.hit || 0) + 1;
}

export function getCommandSummary(dash) {
  const stats = dash.commandStats || {};
  const arr = [];

  for (const cmd in stats) {
    arr.push({ cmd, count: stats[cmd] });
  }

  arr.sort((a, b) => b.count - a.count);

  return (
    arr
      .slice(0, 10)
      .map((v) => `◦ ${v.cmd} (${v.count}×)`)
      .join("\n") || "-"
  );
}

export function getSystemInfo() {
  const mem = process.memoryUsage();
  const ramUsed = (mem.rss / 1024 / 1024).toFixed(1);
  const cpuLoad = os.loadavg()[0].toFixed(2);
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
  const uptime = moment
    .duration(os.uptime(), "seconds")
    .humanize()
    .replace("a few seconds", "baru saja");

  let dbSize = 0;
  try {
    if (fs.existsSync("./database/database.json")) {
      dbSize = (fs.statSync("./database/database.json").size / 1024).toFixed(1);
    }
  } catch {}

  const getFolderSize = (dir) => {
    let total = 0;
    if (!fs.existsSync(dir)) return total;
    for (const file of fs.readdirSync(dir)) {
      try {
        const stat = fs.statSync(`${dir}/${file}`);
        if (stat.isDirectory()) total += getFolderSize(`${dir}/${file}`);
        else total += stat.size;
      } catch {}
    }
    return total;
  };

  let sessionSize = 0;
  try {
    sessionSize = (getFolderSize("./session") / 1024).toFixed(1); // KB
  } catch {}

  let nodeModulesSize = 0;
  try {
    nodeModulesSize = (getFolderSize("./node_modules") / 1024 / 1024).toFixed(1); // MB
  } catch {}

  const pluginCount = Object.keys(global.plugins || {}).length;
  const userCount = Object.keys(global.db.data.users || {}).length;
  const groupCount = Object.keys(global.db.data.chats || {}).length;

  return {
    uptime,
    cpuLoad,
    ramUsed,
    totalMem,
    dbSize,
    sessionSize,
    nodeModulesSize,
    pluginCount,
    userCount,
    groupCount
  };
}

export function scheduleMidnightReset() {
  const now = moment().tz("Asia/Jakarta");
  const nextMidnight = now.clone().add(1, "day").startOf("day");
  const msUntilMidnight = nextMidnight.diff(now);

  setTimeout(() => {
    if (global.db && global.db.data && global.db.data.dashboard) {
      const dash = global.db.data.dashboard;
      dash.totalCommands = 0;
      dash.successCount = 0;
      dash.errorCount = 0;
      dash.commandStats = {};
      dash.successHistory = [];
      dash.errorHistory = [];
      dash.lastResetDate = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
      console.log("✅ Dashboard otomatis reset tengah malam WIB");
    }
    scheduleMidnightReset();
  }, msUntilMidnight);
}
