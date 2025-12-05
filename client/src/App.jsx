import React, { useState } from "react";
import Upload from "./components/Upload";
import TableView from "./components/TableView";

export default function App() {
  const [lastTable, setLastTable] = useState(null); // { columns, rows }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">PDF Extractor</h1>
          <div className="text-sm text-slate-600">React + Vite + Tailwind</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Upload onResult={(table) => setLastTable(table)} />
          </div>

          <div className="lg:col-span-2">
            {lastTable ? (
              <TableView columns={lastTable.columns} rows={lastTable.rows} />
            ) : (
              <div className="bg-white border rounded-md p-6 min-h-[300px]">
                <div className="text-slate-600">Upload a PDF to see extracted table here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
