# 🧾 Balance Sheet PDF Analyzer

A web-based tool built with **Next.js**, **React**, and **OpenAI GPT-4**, designed to parse, analyze, and extract **financial balance sheet summaries** from multiple **bank and credit card statement PDFs**. Ideal for solo contractors, freelancers, or small businesses preparing books or tax filings.

---

## ✨ Features

- ✅ Upload and parse multiple PDFs (chequing or credit card statements)
- 🤖 Uses GPT-4 to:
  - Classify each PDF (e.g., Chequing or Credit Card)
  - Summarize key financial activity
  - Extract structured CRA-style balance sheet data
- 📊 Displays summary and structured balance sheet in the UI
- 📥 One-click download as `.xlsx` (Excel format)
- 🧼 Auto-clears after download for new batch upload
- 🎯 Built-in redaction of sensitive data (e.g., credit card numbers, emails, addresses)

---

## 🧱 Tech Stack

- **Next.js 14+ / App Router**
- **React / React Hooks**
- **Tailwind CSS** for layout and animations
- **OpenAI GPT-4** via API
- **react-dropzone** for drag & drop uploads
- **xlsx** for Excel file generation
- **react-toastify** for user feedback

---

## 📂 Folder Structure (relevant parts)

```
app/
├── api/
│   ├── summarize/route.ts           # Calls OpenAI to summarize + extract JSON
│   ├── download-xlsx/route.ts       # Generates .xlsx from balance sheet JSON
│
├── components/
│   ├── MultiPDFAnalyzer.tsx         # Main logic (UI + interactions)
│   ├── DownloadTaxButton.tsx        # Download + reset UI
│   ├── StructuredBalanceSheetPreview.tsx
│
lib/
├── exportBalanceSheetXLSX.ts        # Converts JSON → Excel buffer
├── pdfjs setup, extract helpers

types/
├── financial.ts                     # StructuredSheet types
```

---

## 🚀 How It Works

1. **Upload PDFs** (chequing/credit card)
2. Click **"Parse PDFs"** – PDFs are converted to text and sanitized
3. Click **"Summarize"** – LLM:
   - Classifies statements
   - Summarizes activity
   - Returns a structured CRA-style balance sheet (JSON)
4. Preview the result
5. Click **Download** to export `.xlsx`
6. UI resets for next round

---

## 🛠 Local Development

```bash
# 1. Clone and install
git clone https://github.com/your-repo/pdf-balance-analyzer.git
cd pdf-balance-analyzer
pnpm install

# 2. Set up .env.local
OPENAI_API_KEY=sk-...

# 3. Run the dev server
pnpm dev
```

---

## 📌 Notes

- ⚠️ Requires GPT-4 API key
- 🌐 No server-side file uploads – all PDFs are parsed in-browser
- ⏳ Large file batches may take 10–20 seconds depending on GPT response
- ✨ Animations used to reduce UI clutter (fade-out processed PDFs/buttons)

---

## 🧹 Optional Cleanup

If you're only using the balance sheet functionality, you can safely remove:

- `lib/chunkAndSummarize.ts`
- `lib/extractCRAValues.ts`
- `components/StatementAnalyzer.tsx`
- `components/MyDropzone.tsx`
- `lib/generateT5Xml.ts` (if not generating XML tax returns)

---

## 📄 License

MIT – feel free to fork and adapt for your workflow!
