export default {
  name: "on",
  alias: ["on", "off"],
  description: "Aktifkan atau nonaktifkan fitur anti media di grup ini",
  access: { group: true, admin: true, botadmin: true },

  run: async (m, { args, command }) => {
    const chat = global.db.data.chats[m.chat];

    if (!chat.antimedia) {
      chat.antimedia = {
        all: false,
        audio: false,
        image: false,
        video: false,
        sticker: false,
        link: false,
        linkgc: false,
        linkch: false,
        tagswgc: false
      };
    }

    const status = command; // 'on' atau 'off'
    const type = args[0]?.toLowerCase();

    const valid = [
      "antiall",
      "antiaudio",
      "antiimage",
      "antivideo",
      "antisticker",
      "antilink",
      "antilinkgc",
      "antilinkch",
      "antitagswgc"
    ];

    if (!type)
      return m.reply(
        `乂  *A N T I - M E D I A*\n\nFitur yang tersedia:\n${valid
          .map((v) => `• ${v}`)
          .join(
            "\n"
          )}\n\nGunakan format:\n.${status} <fitur>\n\nContoh:\n.${status} antivideo\n.${status} image`
      );

    if (!valid.includes(type))
      return m.reply(
        `📛 Fitur tidak dikenal!\nGunakan salah satu dari:\n${valid.map((v) => "• " + v).join("\n")}`
      );
    const key = type.replace(/^anti/, "");

    if (key === "all") {
      for (const k of Object.keys(chat.antimedia)) chat.antimedia[k] = status === "on";
      return m.reply(
        `🎯 Semua fitur *anti media* berhasil di *${status === "on" ? "aktifkan" : "nonaktifkan"}*!`
      );
    }

    const isOn = chat.antimedia[key];

    if (status === "on" && isOn) return m.reply(`✅ Fitur *${type}* sudah aktif sebelumnya.`);
    if (status === "off" && !isOn) return m.reply(`✅ Fitur *${type}* sudah nonaktif sebelumnya.`);

    chat.antimedia[key] = status === "on";
    m.reply(`🎬 Fitur *${type}* berhasil di *${status === "on" ? "aktifkan" : "nonaktifkan"}*!`);
  }
};
