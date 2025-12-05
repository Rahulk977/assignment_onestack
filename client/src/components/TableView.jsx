import React from "react";

/**
 * TableView - renders columns and rows returned by backend.
 * Props:
 *  - columns: array of column keys (strings)
 *  - rows: array of objects mapping column->value
 */
export default function TableView({ columns = [], rows = [] }) {
  if (!columns || !columns.length) {
    return <div className="bg-white border rounded-md p-6">No table to display</div>;
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
    <div className="bg-white border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Extracted Table</h3>
        <button onClick={downloadCSV} className="text-sm px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">Download CSV</button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((h) => (
                <th key={h} className="p-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="p-2 text-slate-500" colSpan={columns.length}>No rows</td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className={i % 2 ? "bg-white" : "bg-slate-50"}>
                  {columns.map((c) => (
                    <td key={c} className="p-2 align-top">{row[c]}</td>
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
