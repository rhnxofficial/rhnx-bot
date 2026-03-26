export default {
  name: "listpremium",
  alias: ["listprem"],
  description: "Menampilkan daftar user Premium",
  access: { owner: true },
  run: async (m, { setReply }) => {
    let users = global.db.data.users || {};
    let premUsers = Object.entries(users)
      .filter(([_, u]) => u.premium)
      .map(([id, u], i) => {
        return `${i + 1}. ${id.split("@")[0]}\n   📅 Sejak: ${u.premiumsince}\n   ⏳ Expired: ${u.premiumend}`;
      });

    if (!premUsers.length) return setReply("⚠️ Tidak ada user premium saat ini.");

    setReply(
      `📂 *Daftar Premium User*
    
${premUsers.join("\n\n")}`
    );
  }
};
