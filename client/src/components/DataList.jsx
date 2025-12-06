// src/components/DataList.jsx
import React, { useState } from "react";
import { getData } from "../api";
import TableView from "./TableView";

export default function DataList({ onDataLoaded }) {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function load() {
    setLoading(true);
    setMessage("Loading...");
    try {
      // backend returns { items: [...], limit, offset } in your route
      const res = await getData(limit, offset);
      const data = res.items || res; // adapt if backend returns an array directly
      setItems(data);

      // derive columns: prefer top-level keys (flatten raw_json if present)
      let cols = new Set();
      data.forEach((r) => {
        // r may contain raw_json or direct columns
        if (r.raw_json && typeof r.raw_json === "object") {
          Object.keys(r.raw_json).forEach((k) => cols.add(k));
        } else {
          Object.keys(r).forEach((k) => {
            if (!["id", "uploaded_at", "raw_json"].includes(k)) cols.add(k);
          });
        }
      });
      const colsArr = Array.from(cols);
      setColumns(colsArr);

      if (onDataLoaded) onDataLoaded({ items: data, columns: colsArr });

      setMessage(`Loaded ${data.length} rows.`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load data: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Database records</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={limit}
            min={1}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-20 p-1 border rounded"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
          >
            {loading ? "Loading..." : "Load DB"}
          </button>
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-3">{message}</div>

      {items.length === 0 ? (
        <div className="text-slate-500">No data loaded. Click "Load DB".</div>
      ) : (
        <TableView
          columns={columns.length ? columns : Object.keys(items[0]).filter(k => !["id","uploaded_at","raw_json"].includes(k))}
          rows={items.map((r) => {
            // if raw_json exists, prefer its keys
            if (r.raw_json && typeof r.raw_json === "object") return r.raw_json;
            return r;
          })}
        />
      )}
    </div>
  );
}
