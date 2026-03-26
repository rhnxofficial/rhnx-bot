import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";

export async function uploadToRHNX(media, opsi = "30", filename = null) {
  const form = new FormData();
  const expire = opsi === "permanent" ? "0" : "30";

  let finalName;
  let contentType;

  if (Buffer.isBuffer(media)) {
    const info = await fileTypeFromBuffer(media);

    const ext = info?.ext || "bin";
    contentType = info?.mime || "application/octet-stream";

    finalName = filename
      ? path.basename(filename)
      : `rhnx-${Date.now()}.${ext}`;

    // 🔥 pastikan extension benar
    if (!finalName.includes(".")) {
      finalName += `.${ext}`;
    }

    form.append("file", media, {
      filename: finalName,
      contentType
    });

  } else if (typeof media === "string") {
    finalName = path.basename(media);
    form.append("file", fs.createReadStream(media), finalName);

  } else {
    throw new Error("Media harus berupa Buffer atau path file");
  }

  form.append("expire", expire);

  const res = await axios.post(
    "https://cdn.rhnx.xyz/upload",
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 30000
    }
  );

  return res.data;
}