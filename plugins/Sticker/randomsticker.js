import axios from 'axios';

const actions = [
  'handhold', 'shinobu', 'highfive', 'cuddle', 'cringe', 'dance', 'happy',
  'glomp', 'smug', 'blush', 'awoo', 'wave', 'smile', 'slap', 'nom', 'poke',
  'wink', 'bonk', 'bully', 'yeet', 'bite', 'kiss', 'lick', 'pat', 'hug',
  'kill', 'cry', 'spank', 'tickle'
];

const actionListMessage = `📋 Daftar perintah sticker yang tersedia:\n\n${actions.map((act, idx) => `${idx + 1}. *stick${act}*`).join('\n')}`;

export default {
  name: 'randomstick',
  alias: [...actions.map(action => `stick${action}`), 'randomstick'],
  description: 'Tampilkan daftar perintah sticker atau buat sticker berdasarkan aksi yang dipilih',
  tags: ['sticker'],

  run: async (m, { conn, args, command }) => {
    try {
      if (command === 'randomstick') {
        return await conn.sendMessage(m.chat, { text: actionListMessage}, { quoted: m });
      }
        
      const action = command.replace('stick', '');
      if (!actions.includes(action)) {
        return await conn.sendMessage(m.chat, { text: `❌ Perintah tidak valid!\n${actionListMessage}` }, { quoted: m });
      }

      const apiUrl = (action === 'spank' || action === 'tickle')
        ? 'https://nekos.life/api/v2/img/' + action
        : 'https://api.waifu.pics/sfw/' + action;

      const { data } = await axios.get(apiUrl);
      await conn.sendSticker(m.chat, data.url, m, {
        packname: sticker.packname,
        author: sticker.author
      });
    } catch (error) {
      console.error('Kesalahan pada fungsi sticker:', error);
      await conn.sendMessage(m.chat, { text: '⚠️ Terjadi kesalahan saat mengambil gambar atau menampilkan daftar.' });
    }
  }
};
