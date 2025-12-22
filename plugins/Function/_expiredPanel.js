import fetch from "node-fetch";

const OWNER = dataPanel?.owner;
const REPO = dataPanel?.repo;
const PATH = dataPanel?.path;

const GH_URL =
  OWNER && REPO && PATH ? `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}` : null;

function isGithubReady() {
  return (
    dataPanel &&
    typeof dataPanel.tokenGH === "string" &&
    dataPanel.tokenGH.trim().length > 0 &&
    OWNER &&
    REPO &&
    PATH
  );
}

async function getBuyerData() {
  if (!isGithubReady()) {
    throw new Error("GitHub config / token belum lengkap");
  }

  const res = await fetch(GH_URL, {
    headers: {
      Authorization: `Bearer ${dataPanel.tokenGH}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    throw new Error(`Gagal ambil data GitHub (${res.status})`);
  }

  const json = await res.json();

  return {
    sha: json.sha,
    data: JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"))
  };
}

async function saveBuyerData(data, sha, message) {
  if (!isGithubReady()) return;

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  const res = await fetch(GH_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${dataPanel.tokenGH}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content,
      sha
    })
  });

  if (!res.ok) {
    throw new Error(`Gagal simpan data GitHub (${res.status})`);
  }
}

function diffDays(expired) {
  const [d, m, y] = expired.split("/").map(Number);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(y, m - 1, d);
  exp.setHours(0, 0, 0, 0);

  return Math.floor((exp - today) / 86400000);
}

async function deletePanelFull(panelData) {
  try {
    if (panelData.server_id) {
      const resServer = await fetch(
        `${panel.domain}/api/application/servers/${panelData.server_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${panel.apiPlta}`,
            Accept: "application/json"
          }
        }
      );
      if (!resServer.ok) throw new Error("Gagal hapus server");
    }

    if (panelData.panel_user_id) {
      const resUser = await fetch(
        `${panel.domain}/api/application/users/${panelData.panel_user_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${panel.apiPlta}`,
            Accept: "application/json"
          }
        }
      );
      if (!resUser.ok) throw new Error("Gagal hapus user panel");
    }

    return true;
  } catch (err) {
    console.error("❌ Delete panel error:", err.message);
    return false;
  }
}

async function panelWatcher(conn) {
  if (!isGithubReady()) {
    console.log("⏸ Panel watcher dilewati (GitHub token belum diisi)");
    return;
  }

  try {
    const { data, sha } = await getBuyerData();
    let updated = false;

    const ownerJid = global.owner?.contact?.[0]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    for (let i = data.length - 1; i >= 0; i--) {
      const panelData = data[i];
      const sisaHari = diffDays(panelData.expired);
      const userJid = panelData.number + "@s.whatsapp.net";

      if (sisaHari <= 0) {
        const deleted = await deletePanelFull(panelData);
        if (!deleted) continue;

        data.splice(i, 1);
        updated = true;

        await saveBuyerData(data, sha, `auto delete expired panel ${panelData.id}`);

        await conn.sendMessage(userJid, {
          text:
            styleText(`🛑 *Panel Expired*
Panel kamu telah *berakhir* dan sudah dihapus otomatis.
📅 Expired : ${panelData.expired}
 Terima kasih 🙏`)
        });

        if (ownerJid) {
          await conn.sendMessage(ownerJid, {
            text:
              styleText(`🗑 *Panel Dihapus*👤 User : ${panelData.buyer_name}
🖥 RAM : ${panelData.data?.ram}
📅 Expired : ${panelData.expired}`)
          });
        }

        continue;
      }

      if (sisaHari <= 3 && sisaHari > 0 && panelData.data?.notification === false) {
          
        await conn.sendMessage(userJid, {
          text:
            styleText(`⚠️ *Panel Akan Expired*
Halo *${panelData.buyer_name}*
Panel kamu akan berakhir dalam *${sisaHari} hari*.
📅 Expired : ${panelData.expired}
Silakan lakukan perpanjangan 🙏`)
        });

        panelData.data.notification = true;
        updated = true;
      }
    }

    if (updated) {
      await saveBuyerData(data, sha, "panel watcher update");
      console.log("✅ Panel watcher sukses");
    }
  } catch (err) {
    console.error("❌ Panel watcher fatal:", err.message);
  }
}

export default {
  name: "panelExpireHook",
  type: "hook",
  description: "Auto notif H-3 & auto delete panel expired",

  async before(m, { conn }) {
    if (!isGithubReady()) return;

    if (!global.panelWatcherInterval) {
      global.panelWatcherInterval = setInterval(() => panelWatcher(conn), 60 * 1000);
    }
  }
};
