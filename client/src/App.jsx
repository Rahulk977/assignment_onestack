// // src/App.jsx
// import React, { useState } from "react";
// import Upload from "./components/Upload";
// import TableView from "./components/TableView";
// import DataList from "./components/DataList";
// import AnalyzePanel from "./components/AnalyzePanel";

// export default function App() {
//   const [view, setView] = useState("upload"); // upload | data | analyze
//   const [lastTable, setLastTable] = useState(null);
//   const [dbState, setDbState] = useState({ items: [], columns: [] });

//   return (
//     <div className="min-h-screen bg-slate-100 grid grid-cols-[16rem_1fr]">
//       {/* SIDEBAR */}
//       <aside className="w-64 bg-white border-r p-6 flex flex-col gap-6">
//         <h1 className="text-2xl font-bold">Pdfetch</h1>

//         <nav className="flex flex-col gap-2">
//           <button
//             onClick={() => setView("upload")}
//             className={`text-left px-4 py-2 rounded-md ${
//               view === "upload" ? "bg-blue-600 text-white" : "hover:bg-slate-50"
//             }`}
//           >
//             📤 Upload PDF
//           </button>

//           <button
//             onClick={() => setView("data")}
//             className={`text-left px-4 py-2 rounded-md ${
//               view === "data" ? "bg-blue-600 text-white" : "hover:bg-slate-50"
//             }`}
//           >
//             📁 View Database
//           </button>

//           <button
//             onClick={() => setView("Analysis Dashboard")}
//             className={`text-left px-4 py-2 rounded-md ${
//               view === "Analysis Dashboard"
//                 ? "bg-blue-600 text-white"
//                 : "hover:bg-slate-50"
//             }`}
//           >
//             📊 Analysis Dashboard
//           </button>
//         </nav>
//       </aside>

//       {/* MAIN */}
//       <main className="flex-1 p-8 flex flex-col">
//         <div className="mb-4">
//           <h2 className="text-2xl font-semibold">
//             {view === "upload"
//               ? "Upload & Extract PDF"
//               : view === "data"
//               ? "Database Records"
//               : "Analysis Dashboard"}
//           </h2>
//         </div>

//         {/* center inner content horizontally */}
//         <div className="flex-1 flex justify-center items-start">
//           {/* width constraint + centered with mx-auto */}
//           <div className="w-full max-w-6xl mx-auto">
//             {view === "upload" && (
//               <>
//                 <Upload onResult={(t) => setLastTable(t)} />
//                 {lastTable && (
//                   <div className="mt-6">
//                     <h3 className="text-md font-semibold mb-2">
//                       Extracted Table
//                     </h3>
//                     <TableView
//                       columns={lastTable.columns}
//                       rows={lastTable.rows}
//                     />
//                   </div>
//                 )}
//               </>
//             )}

//             {/* {view === "data" && (
//               <>
//                 <DataList onDataLoaded={(payload) => setDbState(payload)} />
//                 {dbState.items.length > 0 && (
//                   <div className="mt-6">
//                     <TableView
//                       columns={dbState.columns.length ? dbState.columns : Object.keys(dbState.items[0]).filter(k => !["id","uploaded_at","raw_json"].includes(k))}
//                       rows={dbState.items.map(r => r.raw_json ? r.raw_json : r)}
//                     />
//                   </div>
//                 )}
//               </>
//             )} */}

//             {view === "data" && (
//               <div className="max-w-5xl">
//                 <h2 className="text-lg font-semibold mb-4">Database Records</h2>

//                 {/* DataList will load & render the table itself */}
//                 <DataList onDataLoaded={(payload) => setDbState(payload)} />
//               </div>
//             )}

//             {view === "Analysis Dashboard" && (
//               // pass columns from DB or last upload
//               <div className="mt-2">
//                 <AnalyzePanel
//                   columns={
//                     dbState.columns.length
//                       ? dbState.columns
//                       : lastTable?.columns || []
//                   }
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



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

  const getTitle = () => {
    if (view === "upload") return "Upload & Extract PDF";
    if (view === "data") return "Database Records";
    return "Analysis Dashboard";
  };

  const getSubtitle = () => {
    if (view === "upload")
      return "Upload a financial PDF and preview the extracted table instantly.";
    if (view === "data")
      return "Browse all stored JSON records and preview their details.";
    return "Run quick analytics on keys/columns from uploaded data.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto min-h-screen grid grid-cols-[15rem_1fr] gap-4 px-4 py-6">
        {/* SIDEBAR */}
        <aside className="rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
              📄
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Pdfetch</h1>
              <p className="text-xs text-slate-400">PDF → JSON → Insights</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <button
              onClick={() => setView("upload")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-left ${
                view === "upload"
                  ? "bg-blue-500 text-white border-blue-400 shadow-sm shadow-blue-500/40"
                  : "border-transparent hover:bg-slate-800/70 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">📤</span>
              <div className="flex flex-col leading-tight">
                <span>Upload PDF</span>
                <span className="text-[10px] text-slate-300/80">
                  Extract tables & text
                </span>
              </div>
            </button>

            <button
              onClick={() => setView("data")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-left ${
                view === "data"
                  ? "bg-blue-500 text-white border-blue-400 shadow-sm shadow-blue-500/40"
                  : "border-transparent hover:bg-slate-800/70 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">📁</span>
              <div className="flex flex-col leading-tight">
                <span>View Database</span>
                <span className="text-[10px] text-slate-300/80">
                  Stored JSON records
                </span>
              </div>
            </button>

            <button
              onClick={() => setView("Analysis Dashboard")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-left ${
                view === "Analysis Dashboard"
                  ? "bg-blue-500 text-white border-blue-400 shadow-sm shadow-blue-500/40"
                  : "border-transparent hover:bg-slate-800/70 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">📊</span>
              <div className="flex flex-col leading-tight">
                <span>Analysis</span>
                <span className="text-[10px] text-slate-300/80">
                  Quick metrics & trends
                </span>
              </div>
            </button>
          </nav>

          
        </aside>

        {/* MAIN */}
        <main className="flex flex-col">
          {/* Top bar inside main */}
          <header className="mb-4 flex items-center justify-between">
            <div>
              {/* <h2 className="text-2xl font-semibold tracking-tight">
                {getTitle()}
              </h2> */}
              {/* <p className="text-sm text-slate-300 mt-1">{getSubtitle()}</p> */}
            </div>

       
          </header>

          {/* Content card */}
          <section className="flex-1 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md p-5 overflow-hidden">
            <div className="h-full w-full">
              {view === "upload" && (
                <>
                  <div className="mb-5 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-300">
                      Drop a PDF file in the uploader below. The system will:
                    </p>
                    <ul className="mt-2 text-xs text-slate-400 space-y-1 list-disc list-inside">
                      <li>Extract tables & text from the PDF</li>
                      <li>Convert them into clean JSON</li>
                      <li>Store them in your database dynamically</li>
                    </ul>
                  </div>

                  <Upload
                    onResult={(t) => {
                      setLastTable(t);
                    }}
                  />

                  {lastTable && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2 text-slate-100">
                        Extracted Table Preview
                      </h3>
                      <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3">
                        <TableView
                          columns={lastTable.columns}
                          rows={lastTable.rows}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {view === "data" && (
                <div className="h-full flex flex-col gap-4">
                  {/* <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-100">
                      Database Records
                    </h2>
                    <span className="text-xs text-slate-400">
                      Latest uploads appear at the top
                    </span>
                  </div> */}

                  <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 h-full">
                    {/* DataList will load & render the table itself */}
                    <DataList
                      onDataLoaded={(payload) => {
                        setDbState(payload);
                      }}
                    />
                  </div>
                </div>
              )}

              {view === "Analysis Dashboard" && (
                <div className="h-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-100">
                        Analysis Dashboard
                      </h2>
                     
                    </div>
                    
                  </div>

                  <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3">
                    <AnalyzePanel
                      columns={
                        dbState.columns.length
                          ? dbState.columns
                          : lastTable?.columns || []
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
