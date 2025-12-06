>>> Dynamic PDF Data Extraction & Storage

A simple full-stack project that allows users to upload a PDF, extract table/text data, convert it into JSON, and store it in a database with a dynamic schema. The database automatically adds new columns based on JSON keys from each uploaded file. Users can also view stored records and run basic data analysis.

>>>Features

Upload PDF files

Extract tables + text

Convert data to JSON

Auto-create / update DB columns

Store normalized records

View extracted data and DB data

Analyze columns (summary stats, frequency, histogram)

🛠 Tech Stack

Backend: Python, FastAPI, pdfplumber / PyPDF2, SQLite / Supabase
Frontend: React + Vite, TailwindCSS

▶ How to Run

Backend

uvicorn app.main:app --host 0.0.0.0 --port $PORT


Frontend

npm install
npm run dev

🔗 Live Demo

https://assignment-onestackfrontend.vercel.app/
