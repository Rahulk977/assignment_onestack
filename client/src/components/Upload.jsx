import React, { useRef, useState } from "react";
import { uploadPDF } from "../api";

export default function Upload({ onResult }) {
  const fileRef = useRef();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  async function handleFile(file) {
    setBusy(true);
    setMessage("Uploading...");
    setResult(null);

    try {
      const data = await uploadPDF(file);
      // data: { columns: [...], rows: [...] }
      setResult(data);
      setMessage("Upload & extraction completed.");
      if (onResult) onResult(data);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed: " + (err.message || err));
    } finally {
      setBusy(false);
    }
  }

  function onPick(e) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Upload PDF (first table only)</label>

      <div
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${
          busy ? "opacity-60" : "hover:bg-slate-100"
        }`}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onPick}
        />
        <div className="flex flex-col items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16v-4m0 0l-4 4m4-4l4 4M17 8v8m0 0l4-4m-4 4l-4-4" />
          </svg>
          <div className="text-sm text-slate-600">Click or drop a PDF here</div>
          <div className="text-xs text-slate-400">Backend expected at /api/upload</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-600">
        {message ? <div>{message}</div> : <div>No uploads yet.</div>}
      </div>

      {result && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Extracted Table</div>
          <div className="text-xs text-slate-500 mb-2">Columns: {result.columns.join(", ")}</div>
        </div>
      )}
    </div>
  );
}
