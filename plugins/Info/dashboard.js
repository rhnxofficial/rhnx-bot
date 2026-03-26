import moment from "moment-timezone";
import { getSystemInfo } from "../../lib/dashboard.js";

function getRunTime() {
  const uptime = process.uptime();
  const duration = moment.duration(uptime * 1000);
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  return `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`;
}

export default {
  name: "dashboard",
  alias: ["dash", "status"],
  description: "Menampilkan statistik sistem dan bot",
  async run(m, { conn, setReply }) {
    const dash = global.db.data.dashboard || {};
    const sys = getSystemInfo();
    const runTime = getRunTime();

    // Reset info timer
    const now = moment().tz("Asia/Jakarta");
    const nextReset = now.clone().endOf("day").add(1, "millisecond");
    const diff = nextReset.diff(now);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const resetInfo = `${hours} jam ${minutes} menit ${seconds} detik`;

    // === Top 1 Key Stats ===
    const mostUsedCmd = Object.entries(dash.commandStats || {}).sort((a, b) => b[1] - a[1])?.[0];

    const mostActiveUser = Object.entries(global.db.data.users || {}).sort(
      (a, b) => (b[1].hit || 0) - (a[1].hit || 0)
    )?.[0];
    const userName = mostActiveUser ? mostActiveUser[1].name || mostActiveUser[0] : "-";

    const mostActiveGroup = Object.entries(global.db.data.chats || {}).sort(
      (a, b) => (b[1].hit || 0) - (a[1].hit || 0)
    )?.[0];
    const groupName = mostActiveGroup ? mostActiveGroup[1].name || mostActiveGroup[0] : "-";

    // === Top 3 Lists ===
    const userList =
      Object.entries(global.db.data.users || {})
        .sort((a, b) => (b[1].hit || 0) - (a[1].hit || 0))
        .slice(0, 3)
        .map(([jid, u], i) => `${i + 1}. ${u.name || jid} (hit: ${u.hit || 0})`)
        .join("\n") || "-";

    const groupList =
      Object.entries(global.db.data.chats || {})
        .sort((a, b) => (b[1].hit || 0) - (a[1].hit || 0))
        .slice(0, 3)
        .map(([jid, g], i) => `${i + 1}. ${g.name || jid} (hit: ${g.hit || 0})`)
        .join("\n") || "-";

    // === Success Summary ===
    const successSummary = {};
    (dash.successHistory || []).forEach((x) => {
      successSummary[x.name] = (successSummary[x.name] || 0) + 1;
    });
    const successText =
      Object.entries(dash.commandStats || {})
        .sort((a, b) => b[1] - a[1])
        .map(([cmd, count]) => `◦ ${cmd} (${count}×)`)
        .join("\n") || "-";

    // === Error Summary ===
    const errorSummary = {};
    (dash.errorHistory || []).forEach((x) => {
      errorSummary[x.name] = (errorSummary[x.name] || 0) + 1;
    });
    const errorText =
      Object.entries(errorSummary)
        .sort((a, b) => b[1] - a[1])
        .map(([cmd, count]) => `◦ ${cmd} (${count}×)`)
        .join("\n") || "-";

    const reply = styleSmallCaps(`
––––––『 DASHBOARD 』––––––

⭔ *Runtime:* ${runTime}
⭔ *Reset:* ${resetInfo}
⭔ *Database:* ${sys.dbSize} KB
⭔ *Session:* ${sys.sessionSize} KB
⭔ *Node Modules:* ${sys.nodeModulesSize} MB
⭔ *CPU Load:* ${sys.cpuLoad}%
⭔ *RAM:* ${sys.ramUsed}/${sys.totalMem} GB

––––––『 KEY STATISTICS 』––––––
⭔ *Command Berhasil:* ${dash.successCount || 0}
⭔ *Command Error:* ${dash.errorCount || 0}
⭔ *User Teraktif:* ${userName}
⭔ *Group Teraktif:* ${groupName}
⭔ *Command Terbanyak:* ${mostUsedCmd ? `${mostUsedCmd[0]} (${mostUsedCmd[1]}×)` : "-"}

––––『 Command Summary 』––––
⭔ *Berhasil:*
${successText}

⭔ *Error:*
${errorText}

––––––『 Top User & Group 』––––––
⭔ *Top 3 Group Teraktif:*
${groupList}

⭔ *Top 3 User Teraktif:*
${userList}
`);

    await setReply(reply.trim());
  }
};
