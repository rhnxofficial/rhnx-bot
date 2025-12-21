export async function settings(m, isNumber) {
  try {
    if (!global.db.data.settings) {
      global.db.data.settings = {
        status: Date.now(),
        multi: true,
        prefix: "!",
        public: true,
        autoBio: false,
        setmenu: "thumbnail",
        respontype: "auto",
        style: "normal",
        language: "auto"
      };
    }

    let settings = global.db.data.settings;
    if (!isNumber(settings.status)) settings.status = Date.now();
    if (typeof settings.multi !== "boolean") settings.multi = true;
    if (typeof settings.prefix !== "string") settings.prefix = "!";
    if (typeof settings.sarancmd !== "boolean") settings.sarancmd = false;
    if (typeof settings.autoBio !== "boolean") settings.autoBio = false;
    if (typeof settings.public !== "boolean") settings.public = true;

    await global.safeWriteDB();
  } catch (e) {
    console.error("❌ Error settings:", e);
  }
}
