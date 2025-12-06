export default {
  name: "afkHook",
  type: "hook",
  description: "Respon otomatis ketika user AFK disebut atau aktif kembali",

  before: async (m, { conn }) => {
    try {
      let user = global.db.data.users[m.sender];

      if (user && user.afk > -1) {
        await conn.sendMessage(
          m.chat,
          {
            text: styleText(
              `👋 *@${m.sender.split("@")[0]}*, kamu berhenti AFK${
                user.afkReason ? " setelah *" + user.afkReason + "*" : ""
              }\n🕒 Selama *${msToTime(Date.now() - user.afk)}*`
            ),
            mentions: [m.sender]
          },
          { quoted: m }
        );

        user.afk = -1;
        user.afkReason = "";
      }

      const jids = [...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])];

      for (let jid of jids) {
        const u = global.db.data.users[jid];
        if (!u || u.afk < 0) continue;

        const reason = u.afkReason || "tanpa alasan";
        const duration = msToTime(Date.now() - u.afk);

        await conn.sendMessage(
          m.chat,
          {
            text: styleText(
              `💤 *@${jid.split("@")[0]}* sedang AFK ${
                u.afkReason ? "dengan alasan *" + reason + "*" : ""
              }\n⏱ Selama *${duration}*`
            ),
            mentions: [jid]
          },
          { quoted: m }
        );
      }

      return true;
    } catch (err) {
      console.error(err);
    }
  }
};

function msToTime(ms) {
  let sec = Math.floor(ms / 1000) % 60;
  let min = Math.floor(ms / (1000 * 60)) % 60;
  let hrs = Math.floor(ms / (1000 * 60 * 60));
  return `${hrs ? `${hrs} jam ` : ""}${min ? `${min} menit ` : ""}${sec} detik`;
}
