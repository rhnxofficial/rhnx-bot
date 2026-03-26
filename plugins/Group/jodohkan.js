export default {
  name: "jodohkan",
  description: "Menjodohkan dua orang di grup 😳",
  access: { group: true },
  async run(m, { conn }) {
    if (!conn._tembak) conn._tembak = {};
    const mentions = m.mentionByTag ? m.mentionByTag() : [];
    if (mentions.length < 2)
      return conn.sendMessage(m.chat, {
        text: "Tag dua orang yang mau dijodohkan!\nContoh: *.jodohkan @user1 @user2*"
      });

    const [user1, user2] = mentions;

    if (user1 === user2)
      return conn.sendMessage(m.chat, { text: "😅 Gak bisa jodohin orang yang sama dong!" });

    if (!global.db.data.users[user1]) global.db.data.users[user1] = { pasangan: [] };
    if (!global.db.data.users[user2]) global.db.data.users[user2] = { pasangan: [] };

    const u1 = global.db.data.users[user1];
    const u2 = global.db.data.users[user2];

    if (u1.pasangan.length)
      return conn.sendMessage(m.chat, {
        text: `@${user1.split("@")[0]} sudah punya pasangan 😅`,
        mentions: [user1]
      });
    if (u2.pasangan.length)
      return conn.sendMessage(m.chat, {
        text: `@${user2.split("@")[0]} sudah punya pasangan 😅`,
        mentions: [user2]
      });

    conn._tembak[user1] = user2;
    conn._tembak[user2] = user1;

    await conn.sendMessage(m.chat, {
      text: `💘 Wahh @${user1.split("@")[0]} dijodohkan sama @${user2.split("@")[0]} oleh @${m.sender.split("@")[0]}!\n\nCiee~ silakan @${user1.split("@")[0]} dan @${user2.split("@")[0]} ketik *terima* atau *tolak* 😳`,
      mentions: [user1, user2, m.sender]
    });
  }
};
