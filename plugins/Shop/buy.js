export default {
  name: "buy",
  alias: ["beli"],
  description: "Membeli limit atau limitgame menggunakan balance",
  access: { limit: false },

  run: async (m, { conn, args }) => {
    let user = global.db.data.users[m.sender];

    if (!args[0]) {
      return m.reply(
        `Hi ${m.pushName}
Silahkan pilih apa yang ingin dibeli:

1. *buy limit <jumlah>*  
   Harga: *1000 balance / limit*

2. *buy limitgame <jumlah>*  
   Harga: *1500 balance / limitgame*

Contoh penggunaan:
• .buy limit 5  
• .buy limitgame 3`
      );
    }

    let item = args[0].toLowerCase();
    let jumlah = parseInt(args[1]);

    if (!["limit", "limitgame"].includes(item)) {
      return m.reply("Item tidak dikenal. Pilih: *limit* atau *limitgame*");
    }

    if (!jumlah || jumlah < 1) {
      return m.reply("Masukkan jumlah yang benar.\nContoh: *.buy limit 5*");
    }

    const priceList = {
      limit: 1000,
      limitgame: 1500
    };

    let harga = priceList[item] * jumlah;

    if (user.balance < harga) {
      return m.reply(
        `❌ Balance anda tidak cukup!

Harga total: *${harga}*  
Balance anda: *${user.balance}*  
Kekurangan: *${harga - user.balance}*`
      );
    }

    user.balance -= harga;

    if (item === "limit") {
      user.limit += jumlah;
    } else if (item === "limitgame") {
      user.limitgame = (user.limitgame || 0) + jumlah;
    }

    return m.reply(
      `🎉 *Pembelian Berhasil!*

Anda membeli: *${jumlah} ${item}*  
Total harga: *${harga} balance*  
Sisa balance: *${user.balance}*`
    );
  }
};
