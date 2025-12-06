// src/components/AnalyzePanel.jsx
import React, { useState } from "react";
import { analyze } from "../api";

export default function AnalyzePanel({ columns = [] }) {
  const [selected, setSelected] = useState(columns[0] || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // update default when columns change
  React.useEffect(() => {
    if (columns && columns.length && !selected) {
      setSelected(columns[0]);
    }
  }, [columns]);

  async function runAnalysis() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyze(selected);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Analyze column</h3>
        <button
          onClick={runAnalysis}
          disabled={!selected || busy}
          className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
        >
          {busy ? "Running..." : "Run"}
        </button>
      </div>

      <div className="mb-3">
        <label className="text-sm text-slate-600 block mb-1">Select column</label>
        <select
          className="p-2 border rounded w-full"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- choose column --</option>
          {columns.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {result && (
        <div className="text-sm">
          <div><strong>Count:</strong> {result.count}</div>
          <div><strong>Sum:</strong> {result.sum ?? "N/A"}</div>
          <div><strong>Avg:</strong> {result.avg ?? "N/A"}</div>
          <div><strong>Min:</strong> {result.min ?? "N/A"}</div>
          <div><strong>Max:</strong> {result.max ?? "N/A"}</div>
        </div>
      )}
    </div>
  );
}
