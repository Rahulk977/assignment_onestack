// src/components/AnalyzePanel.jsx
import React, { useEffect, useState } from "react";
import { analyze, analyzeFrequency, analyzeHist } from "../api";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm flex-1 min-w-[120px]">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value ?? "N/A"}</div>
    </div>
  );
}

// function Histogram({ bins = [], height = 120 }) {
//   if (!bins || !bins.length) {
//     return <div className="text-sm text-slate-500">No numeric distribution available.</div>;
//   }

//   const maxCount = Math.max(...bins.map(b => b.count || 0), 1);
//   const barWidth = Math.max(8, Math.floor(600 / bins.length));

//   return (
//     <svg viewBox={`0 0 ${Math.max(300, bins.length * barWidth)} ${height}`} className="w-full h-28">
//       {bins.map((b, i) => {
//         const h = (b.count / maxCount) * (height - 20);
//         const x = i * barWidth + 6;
//         const y = height - h - 4;
//         return (
//           <g key={i}>
//             <rect x={x} y={y} width={Math.max(4, barWidth - 12)} height={h} rx="3" fill="#60A5FA" />
//             <text x={x + (Math.max(4, barWidth - 12) / 2)} y={height - 2} fontSize="10" fill="#475569" textAnchor="middle">
//               {b.count}
//             </text>
//           </g>
//         );
//       })}
//     </svg>
//   );
// }

export default function AnalyzePanel({ columns = [] }) {
  const [selected, setSelected] = useState(columns[0] || "");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [hist, setHist] = useState(null);
  const [freq, setFreq] = useState(null);
  const [error, setError] = useState(null);
  const [bins, setBins] = useState(8);

  useEffect(() => {
    if (columns && columns.length && !selected) setSelected(columns[0]);
  }, [columns]);

  async function runAnalysis() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setStats(null);
    setHist(null);
    setFreq(null);

    try {
      const [s, h, f] = await Promise.allSettled([
        analyze(selected),
        analyzeHist(selected, bins),
        analyzeFrequency(selected, 8),
      ]);

      if (s.status === "fulfilled") setStats(s.value);
      else setError("Summary failed: " + (s.reason?.message || s.reason));

      if (h.status === "fulfilled") setHist(h.value);
      if (f.status === "fulfilled") setFreq(f.value);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  const fmt = (v) => (v === null || v === undefined ? "N/A" : Intl.NumberFormat().format(v));

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white border rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            

            <div className="flex items-center gap-3">
              <select
                className="p-2 border rounded-md"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={busy || columns.length === 0}
              >
                <option value="">-- choose column --</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={runAnalysis}
                disabled={!selected || busy}
                className={`px-4 py-2 rounded-md font-medium ${busy ? "bg-slate-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {busy ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {stats ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <StatCard label="Count" value={fmt(stats.count)} />
                <StatCard label="Sum" value={stats.sum !== null ? fmt(stats.sum) : "N/A"} />
                <StatCard label="Average" value={stats.avg !== null ? fmt(Math.round(stats.avg)) : "N/A"} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <StatCard label="Minimum" value={stats.min !== null ? fmt(stats.min) : "N/A"} />
                <StatCard label="Maximum" value={stats.max !== null ? fmt(stats.max) : "N/A"} />

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Histogram bins</div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min="4"
                      max="20"
                      value={bins}
                      onChange={(e) => setBins(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm w-10 text-right">{bins}</div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Adjust bins and re-run to update histogram</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500 mb-4">No summary yet — choose a column and click Run.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-50 border rounded-lg p-4 min-h-[140px]">
              <div className="text-sm text-slate-600 mb-2 font-medium">Distribution</div>
              {hist && hist.bins && hist.bins.length ? (
                <>
                  <Histogram bins={hist.bins} />
                  <div className="text-xs text-slate-400 mt-2">Range: {hist.min} — {hist.max}</div>
                </>
              ) : (
                <div className="text-sm text-slate-500">No numeric histogram available for this column.</div>
              )}
            </div>

            <div className="bg-slate-50 border rounded-lg p-4 min-h-[140px]">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Top values</div>
                <div className="text-xs text-slate-400">Top 8</div>
              </div>

              {freq && freq.top && freq.top.length ? (
                <ul className="space-y-2 max-h-48 overflow-auto">
                  {freq.top.map((t, i) => (
                    <li key={i} className="flex items-center justify-between bg-white rounded p-2 shadow-sm">
                      <div className="text-sm truncate" title={String(t.value)}>{String(t.value) || "<empty>"}</div>
                      <div className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">{t.count}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">No top values available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
