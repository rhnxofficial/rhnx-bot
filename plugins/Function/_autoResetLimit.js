import moment from "moment-timezone";

export default {
  name: "limitResetHook",
  description: "Hook untuk reset limit user setelah 24 jam",
  type: "hook",

  before: async (m, { conn }) => {
    let users = global.db.data.users;
    if (!users) return;

    let now = moment();

    for (let jid in users) {
      let user = users[jid];
      if (!user) continue;

      if (user.limit <= 0) {
        if (!user.limitResetTime) {
          user.limitResetTime = now.format();
        } else {
          let diffHours = now.diff(moment(user.limitResetTime), "hours");
          if (diffHours >= 24) {
            user.limit = user.premium ? 100 : 30;
            delete user.limitResetTime;

            await conn.sendMessage(user.id, {
              text: `✅ Limit kamu sudah direset, sekarang tersedia kembali *${user.limit}* limit.`
            });
          }
        }
      }
    }
  }
};
