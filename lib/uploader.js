import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";

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
  uploadToCatbox,
  uploadImage
};
