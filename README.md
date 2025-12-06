📄 Dynamic PDF Data Extraction & Storage

A simple system that lets users upload PDFs, extract tables/text, convert them into JSON, and store everything in a dynamic database. New JSON keys automatically create new columns in the table. The frontend shows extracted data and basic analysis.

⭐ Features

PDF upload

Table + text extraction

JSON conversion

Dynamic schema update

Store & view records

Column analysis (count, min, max, avg, frequency)

🛠 Tech Stack

Backend: FastAPI, Python, pdfplumber, PostgreSQL/Supabase
Frontend: React (Vite), TailwindCSS

▶ Run Locally

Backend:

uvicorn app.main:app --reload


Frontend:

npm install
npm run dev
