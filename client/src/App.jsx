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
    <div className="min-h-screen bg-slate-100 grid grid-cols-[16rem_1fr]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Pdfetch</h1>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setView("upload")}
            className={`text-left px-4 py-2 rounded-md ${
              view === "upload" ? "bg-blue-600 text-white" : "hover:bg-slate-50"
            }`}
          >
            📤 Upload PDF
          </button>

          <button
            onClick={() => setView("data")}
            className={`text-left px-4 py-2 rounded-md ${
              view === "data" ? "bg-blue-600 text-white" : "hover:bg-slate-50"
            }`}
          >
            📁 View Database
          </button>

          <button
            onClick={() => setView("Analysis Dashboard")}
            className={`text-left px-4 py-2 rounded-md ${
              view === "Analysis Dashboard"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-50"
            }`}
          >
            📊 Analysis Dashboard
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">
            {view === "upload"
              ? "Upload & Extract PDF"
              : view === "data"
              ? "Database Records"
              : "Analysis Dashboard"}
          </h2>
        </div>

        {/* center inner content horizontally */}
        <div className="flex-1 flex justify-center items-start">
          {/* width constraint + centered with mx-auto */}
          <div className="w-full max-w-6xl mx-auto">
            {view === "upload" && (
              <>
                <Upload onResult={(t) => setLastTable(t)} />
                {lastTable && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-2">
                      Extracted Table
                    </h3>
                    <TableView
                      columns={lastTable.columns}
                      rows={lastTable.rows}
                    />
                  </div>
                )}
              </>
            )}

            {/* {view === "data" && (
              <>
                <DataList onDataLoaded={(payload) => setDbState(payload)} />
                {dbState.items.length > 0 && (
                  <div className="mt-6">
                    <TableView
                      columns={dbState.columns.length ? dbState.columns : Object.keys(dbState.items[0]).filter(k => !["id","uploaded_at","raw_json"].includes(k))}
                      rows={dbState.items.map(r => r.raw_json ? r.raw_json : r)}
                    />
                  </div>
                )}
              </>
            )} */}

            {view === "data" && (
              <div className="max-w-5xl">
                <h2 className="text-lg font-semibold mb-4">Database Records</h2>

                {/* DataList will load & render the table itself */}
                <DataList onDataLoaded={(payload) => setDbState(payload)} />
              </div>
            )}

            {view === "Analysis Dashboard" && (
              // pass columns from DB or last upload
              <div className="mt-2">
                <AnalyzePanel
                  columns={
                    dbState.columns.length
                      ? dbState.columns
                      : lastTable?.columns || []
                  }
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
