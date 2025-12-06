// src/components/TableView.jsx
import React from "react";

/**
 * TableView - renders columns and rows returned by backend.
 * Props:
 *  - columns: array of column keys (strings)
 *  - rows: array of objects mapping column->value
 *  - highlight: optional column name to visually highlight
 *  - hideDownload: if true, don't show the Download CSV button
 */
export default function TableView({
  columns = [],
  rows = [],
  highlight = "",
  hideDownload = false,
}) {
  if (!columns || !columns.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-700 text-slate-300 rounded-md p-6">
        No table to display
      </div>
    );
  }

  // CSV download helper
  function downloadCSV() {
    const escape = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const lines = [];
    lines.push(columns.map(escape).join(","));
    for (const r of rows) {
      const row = columns.map((c) => escape(r[c]));
      lines.push(row.join(","));
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-100">Extracted Table</h3>

        {!hideDownload && (  /* 👈 hide button for Analysis panel */
          <button
            onClick={downloadCSV}
            className="text-sm px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-200"
          >
            Download CSV
          </button>
        )}
      </div>

      <div className="overflow-auto border border-slate-700 rounded-lg">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="bg-slate-800/90 text-slate-300">
            <tr>
              {columns.map((h) => (
                <th
                  key={h}
                  className={`p-2 text-left border-b border-slate-700 ${
                    highlight === h ? "bg-slate-100 text-slate-900" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-2 text-slate-400" colSpan={columns.length}>
                  No rows
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 ? "bg-slate-900/30" : "bg-slate-800/30"}
                >
                  {columns.map((c) => (
                    <td
                      key={c}
                      className={`p-2 align-top border-b border-slate-800 ${
                        highlight === c
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : ""
                      }`}
                    >
                      {row[c]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
