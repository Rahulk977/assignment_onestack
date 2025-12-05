// src/api.js
const BASE = "http://localhost:8000/api"; // backend route base (server serves /api/upload)

export async function uploadPDF(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    // try to read JSON error, fallback to status text
    const errBody = await res.text().catch(()=>null);
    let msg = errBody || res.statusText || "Upload failed";
    throw new Error(msg);
  }

  // API returns: { columns: [...], rows: [...] }
  return res.json();
}

export async function getData(limit = 50, offset = 0) {
  const res = await fetch(`${BASE}/data?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Fetch data failed");
  return res.json();
}
