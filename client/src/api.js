// src/api.js

// Base URL comes from env so we can switch between local and Render easily
// In dev:  VITE_API_BASE=http://localhost:8000
// In prod: VITE_API_BASE=https://assignment-onestack-backend.onrender.com
const API_ROOT = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const BASE = `${API_ROOT}/api`;      // for /api/upload
const V1   = `${API_ROOT}/api/v1`;   // for /api/v1/data , /api/v1/analyze, ...

export async function uploadPDF(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => null);
    const msg = errBody || res.statusText || "Upload failed";
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
    const text = await res.text().catch(() => null);
    throw new Error(text || "Fetch data failed");
  }
  return res.json();
}

export async function analyze(column) {
  const res = await fetch(
    `${V1}/analyze?column=${encodeURIComponent(column)}`
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(txt || "Analyze failed");
  }
  return res.json();
}

export async function analyzeFrequency(column, top = 8) {
  const url = `${V1}/analyze/frequency?column=${encodeURIComponent(
    column
  )}&top=${encodeURIComponent(top)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(txt || "Frequency analysis failed");
  }
  return res.json();
}

export async function analyzeHist(column, bins = 10) {
  const url = `${V1}/analyze/hist?column=${encodeURIComponent(
    column
  )}&bins=${encodeURIComponent(bins)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(txt || "Histogram analysis failed");
  }
  return res.json();
}
