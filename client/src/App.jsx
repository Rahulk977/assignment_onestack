// src/App.jsx
import React, { useState } from "react";
import Upload from "./components/Upload";
import TableView from "./components/TableView";
import DataList from "./components/DataList";
import AnalyzePanel from "./components/AnalyzePanel";

export default function App() {
  const [view, setView] = useState("upload"); // upload | data | analyze
  const [lastTable, setLastTable] = useState(null);
  const [dbState, setDbState] = useState({ items: [], columns: [] });

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold mb-4">Pdfetch</h1>

        <button
          onClick={() => setView("upload")}
          className={`w-full text-left px-4 py-2 rounded ${
            view === "upload"
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-700"
          }`}
        >
          📤 Upload PDF
        </button>

        <button
          onClick={() => setView("data")}
          className={`w-full text-left px-4 py-2 rounded ${
            view === "data"
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-700"
          }`}
        >
          📁 View Database
        </button>

        <button
          onClick={() => setView("analyze")}
          className={`w-full text-left px-4 py-2 rounded ${
            view === "analyze"
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-700"
          }`}
        >
          📊 Analyze Data
        </button>

     
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {view === "upload" && (
          <div className="max-w-4xl">
            <h2 className="text-lg font-semibold mb-4">Upload & Extract PDF</h2>
            <Upload onResult={(table) => setLastTable(table)} />

            {lastTable && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">Extracted Table</h3>
                <TableView
                  columns={lastTable.columns}
                  rows={lastTable.rows}
                />
              </div>
            )}
          </div>
        )}

        {view === "data" && (
          <div className="max-w-5xl">
            <h2 className="text-lg font-semibold mb-4">Database Records</h2>
            <DataList
              onDataLoaded={(payload) => setDbState(payload)}
            />

            {dbState.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">DB Table View</h3>
                <TableView
                  columns={
                    dbState.columns.length
                      ? dbState.columns
                      : Object.keys(dbState.items[0]).filter(
                          (k) => !["id", "uploaded_at", "raw_json"].includes(k)
                        )
                  }
                  rows={dbState.items.map((r) =>
                    r.raw_json ? r.raw_json : r
                  )}
                />
              </div>
            )}
          </div>
        )}

        {view === "analyze" && (
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold mb-4">Analyze Column</h2>
            <AnalyzePanel columns={dbState.columns || []} />
          </div>
        )}
      </main>
    </div>
  );
}
