// src/components/AnalyzePanel.jsx
import React, { useEffect, useState } from "react";
import { analyze, getData } from "../api";
import TableView from "./TableView";

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-4 shadow-sm flex-1 min-w-[120px] text-slate-100">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value ?? "N/A"}</div>
    </div>
  );
}

export default function AnalyzePanel({ columns = [] }) {
  const [selected, setSelected] = useState(columns[0] || "");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const [tableRows, setTableRows] = useState([]);
  const [tableCols, setTableCols] = useState([]);

  // 🔹 NEW: column that is actually being analyzed (for highlight)
  const [highlightCol, setHighlightCol] = useState("");

  useEffect(() => {
    if (columns.length && !selected) setSelected(columns[0]);
  }, [columns]);

  async function runAnalysis() {
    if (!selected) return;

    setBusy(true);
    setError(null);
    setStats(null);

    try {
      // 1️⃣ Load rows from DB
      const res = await getData(50, 0);      // GET /data?limit=50&offset=0
      const items = res.items || res;        // handle {items:[...]} or [...]

      // Prefer raw_json if present, else whole record
      const rows = (items || []).map((r) => r.raw_json || r);

      // 2️⃣ Build columns but REMOVE technical fields (id, uploaded_at, raw_json)
      const cols = rows.length
        ? Object.keys(rows[0]).filter(
            (k) => !["id", "uploaded_at", "raw_json"].includes(k)
          )
        : [];

      setTableRows(rows);
      setTableCols(cols);

      // 3️⃣ Run numeric analysis for selected column
      const result = await analyze(selected);
      setStats(result);

      // 4️⃣ Only NOW highlight the column that was analyzed
      setHighlightCol(selected);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  const fmt = (v) =>
    v === null || v === undefined ? "N/A" : Intl.NumberFormat().format(v);

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 shadow-md text-slate-200 backdrop-blur-md">

          {/* HEADER BAR */}
          <div className="flex gap-3 mb-6">
            <select
              className={`p-2 rounded-md bg-slate-800 text-slate-200 
                ${selected ? "border-blue-500 ring-1 ring-blue-500" : "border border-slate-700"}`}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={busy || columns.length === 0}
            >
              <option value="">-- choose column --</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={runAnalysis}
              disabled={!selected || busy}
              className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600"
            >
              {busy ? "Running..." : "Run"}
            </button>
          </div>

          {error && <div className="text-red-400 mb-4">{error}</div>}

          {/* TABLE BELOW RUN BUTTON */}
          {tableRows.length > 0 && (
            <div className="mb-6">
              <TableView
                columns={tableCols}
                rows={tableRows}
                highlight={highlightCol}  // 🔹 only changes on Run
                hideDownload={true}        // no CSV in Analysis
              />
            </div>
          )}

          {/* STATS BELOW TABLE */}
          {stats ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <StatCard label="Count" value={fmt(stats.count)} />
                <StatCard label="Sum" value={fmt(stats.sum)} />
                <StatCard label="Average" value={fmt(Math.round(stats.avg))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Minimum" value={fmt(stats.min)} />
                <StatCard label="Maximum" value={fmt(stats.max)} />
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-400">
              Choose a column and click Run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
