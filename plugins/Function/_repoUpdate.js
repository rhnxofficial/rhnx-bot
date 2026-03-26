//import fetch from "node-fetch";

/*let lastCommit = null;

async function checkRepoUpdate(conn, channelJid) {
  try {
    const res = await fetch("https://api.github.com/repos/rhnxofficial/rhnx-bot-cjs/commits");
    const data = await res.json();
    const latest = data[0];

    if (!lastCommit) lastCommit = latest.sha;

    if (latest.sha !== lastCommit) {
      lastCommit = latest.sha;

      const menuText =
        `乂 *Repo Update Detected!*\n\n` +
        `◦ *Message:* ${latest.commit.message}\n` +
        `◦ *Author:* ${latest.commit.author.name}\n` +
        `◦ *Url:* ${latest.html_url}`;

      await conn.sendMessageModify(channelJid, styleText(menuText), null, {
        title: "rhnx-bot ",
        body: "GitHub Repository Update",
        largeThumb: true,
        thumbnail:
          "https://raw.githubusercontent.com/rhnxofficial/Uploader/main/uploader/rhnx-KbEE.jpg",
        url: "",
        businessOwnerJid: conn.user.id
      });

      console.log("✅ Notif repo terkirim ke channel:", latest.commit.message);
    }
  } catch (err) {
    console.error("❌ Error checking repo update:", err);
  }
}

export default {
  name: "detectRepoHook",
  type: "hook",
  description: "Hook untuk deteksi update commit di repo GitHub",
  async before(m, { conn }) {
    if (!global.repoChecker) {
      global.repoChecker = setInterval(() => {
        checkRepoUpdate(conn, "120363185390263663@newsletter");
      }, 60000);
    }
  }
};*/
