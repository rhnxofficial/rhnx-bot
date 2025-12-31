import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";

export async function uploadToGithub(media) {
  try {
    const owner = "rhnxofficial";
    const repo = "Uploader";
    const branch = "main";

    const fileInfo = await fileTypeFromBuffer(media);
    const ext = fileInfo?.ext || "bin";
    const fileName = `rhnx-${makeid(4)}.${ext}`;
    const filePath = `uploader/${fileName}`;

    const base64Content = Buffer.from(media).toString("base64");

    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        message: `Upload file ${fileName}`,
        content: base64Content,
        branch
      },
      {
        headers: {
          Authorization: `Bearer ${key.tokenGithub}`,
          "Content-Type": "application/json"
        }
      }
    );

    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  } catch (error) {
    console.error("❌ Error uploading to GitHub:", error.message);
    throw new Error("Gagal mengunggah file ke GitHub");
  }
}

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
    form,{
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 30000
    }
  );

  return res.data;
}

export async function uploadToCatbox(content, fileName) {
  try {
    const fileInfo = await fileTypeFromBuffer(content);
    const ext = fileInfo?.ext || fileName.split(".").pop() || "bin";
    const safeName = fileName.includes(".") ? fileName : `${fileName}.${ext}`;

    const formData = new FormData();
    formData.append("reqtype", "fileupload");

    formData.append("fileToUpload", content, {
      filename: safeName,
      contentType: fileInfo?.mime || "application/octet-stream"
    });

    const response = await axios.post("https://catbox.moe/user/api.php", formData, {
      headers: formData.getHeaders()
    });

    if (response.status !== 200 || !response.data) {
      throw new Error("Gagal mengunggah ke Catbox");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error uploading to Catbox:", error.message);
    throw new Error("Upload ke Catbox gagal: " + error.message);
  }
}

export async function uploadImage(buffer) {
  try {
    const { data: html } = await axios.get("https://freeimage.host/");
    const token = html.match(/PF\.obj\.config\.auth_token = "(.+?)";/)[1];

    const form = new FormData();
    form.append("source", buffer, "file.jpg");
    form.append("type", "file");
    form.append("action", "upload");
    form.append("timestamp", Math.floor(Date.now() / 1000));
    form.append("auth_token", token);
    form.append("nsfw", "0");

    const { data } = await axios.post("https://freeimage.host/json", form, {
      headers: form.getHeaders()
    });

    if (data?.image?.url) {
      return data.image.url;
    } else {
      throw new Error("Upload gagal, tidak ada URL yang diterima.");
    }
  } catch (error) {
    console.error("❌ Error uploading to FreeImageHost:", error.message);
    throw new Error("Upload ke FreeImage gagal: " + error.message);
  }
}

export default {
  uploadToGithub,
  uploadToRHNX,
  uploadToCatbox,
  uploadImage
};
