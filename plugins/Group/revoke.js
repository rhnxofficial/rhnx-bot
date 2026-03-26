export default {
  name: "revoke",
  description: "Mengatur ulang tautan undangan grup (revoke invite link)",
  access: { group: true, botadmin: true },

  run: async (m, { conn, setReply }) => {
    try {
      await conn.groupRevokeInvite(m.chat);
      await setReply("✅ Sukses menyetel ulang tautan undangan grup ini!");
    } catch (e) {
      console.error(e);
      await setReply("❌ Gagal menyetel ulang tautan undangan grup.");
    }
  }
};
