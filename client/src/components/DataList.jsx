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
  <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 text-slate-200 backdrop-blur-md">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium text-slate-100">Database records</h3>

      <div className="flex gap-2">
        <input
          type="number"
          value={limit}
          min={1}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="w-20 p-1 bg-slate-800 text-slate-100 border border-slate-700 rounded"
        />

        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-600"
        >
          {loading ? "Loading..." : "Load DB"}
        </button>
      </div>
    </div>

    <div className="text-sm text-slate-300 mb-3">
      {message}
    </div>

    {items.length === 0 ? (
      <div className="text-slate-400">No data loaded. Click "Load DB".</div>
    ) : (
      <TableView
        columns={columns.length ? columns : Object.keys(items[0]).filter(k => !["id","uploaded_at","raw_json"].includes(k))}
        rows={items.map((r) => (r.raw_json && typeof r.raw_json === "object" ? r.raw_json : r))}
      />
    )}
  </div>
);

}
