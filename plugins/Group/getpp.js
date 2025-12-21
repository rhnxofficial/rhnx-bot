export default {
  name: "getpp",
  description: "Ambil foto profil user dari reply atau nomor manual",
  async run(m, { conn, args }) {
    let target;
    let metadata, members;
    if (m.isGroup) {
      metadata = await conn.groupMetadata(m.chat);
      members = metadata.participants.map((v) => v.id);
    }
    if (m.quoted?.sender) {
      target = m.quoted.sender;
    } else if (args[0]) {
      let num = args[0].replace(/\D/g, "");
      if (m.isGroup && members) {
        const found = members.find((id) => id.includes(num));
        target = found || `${num}@s.whatsapp.net`;
      } else {
        target = `${num}@s.whatsapp.net`;
      }
    } else {
      target = m.sender;
    }

    let ppUrl;
    try {
      ppUrl = await conn.profilePictureUrl(target, "image");
    } catch {
      ppUrl =
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }

    const nomor = target.split("@")[0];

    await conn.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: `📸 Foto profil dari @${nomor}`,
      mentions: [target]
    });
  }
};
