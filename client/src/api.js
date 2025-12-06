// src/api.js
const BASE = "http://localhost:8000/api"; // backend base for upload
const V1 = "http://localhost:8000/api/v1"; // backend base for data/analyze

export async function uploadPDF(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(()=>null);
    let msg = errBody || res.statusText || "Upload failed";
    throw new Error(msg);
  }

  return res.json();
}

export async function getData(limit = 50, offset = 0, columns = null) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (columns) params.set("columns", columns.join(","));
  const res = await fetch(`${V1}/data?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(()=>null);
    throw new Error(text || "Fetch data failed");
  }
  return res.json(); // should return { items: [...], limit, offset } or an array depending on backend
}

export async function analyze(column) {
  const res = await fetch(`${V1}/analyze?column=${encodeURIComponent(column)}`);
  if (!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error(txt || "Analyze failed");
  }
  return res.json();
}
