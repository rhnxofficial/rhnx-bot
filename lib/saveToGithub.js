import fetch from "node-fetch";

export const saveToGithub = async ({ token, owner, repo, path, newData, message }) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  let sha = null;
  let data = [];

  const get = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (get.status === 200) {
    const res = await get.json();
    sha = res.sha;
    data = JSON.parse(Buffer.from(res.content, "base64").toString());
  }

  data.push(newData);

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  const push = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content,
      sha
    })
  });

  return push.json();
};
