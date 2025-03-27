"use client"; // Required for browser-based PDF parsing & state

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
 
export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => setFiles(acceptedFiles),
  });

  // Extract text from PDF
  async function extractTextFromPDF(file: File): Promise<string> {
    try {
      // 1) Convert File → ArrayBuffer → Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      // 2) Pass the data to pdf.js
      const loadingTask = pdfjsLib.getDocument({ data: typedArray });
      const pdf = await loadingTask.promise; // PDFDocumentProxy

      // 3) Loop through pages and extract text
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent(); // TextContent
        text += content.items.map((item) => item.str).join(" ");
      }
      return text;
    } catch (error) {
      console.error("PDF parse error:", error);
      return ""; // Return empty string if something fails
    }
  }

  // Basic sanitization
  const sanitizeText = (input: string): string => {
    return input
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "[REDACTED]")
      .replace(/\b[A-Z]{2}\d{2} [A-Z0-9]{4} \d{4} \d{4} \d{4}\b/g, "[REDACTED]")
      .replace(/\b\d{2}-\d{2}-\d{2}\b/g, "[REDACTED]")
      .replace(/\b\d{10,}\b/g, "[REDACTED]");
  };

  // Summarize
  const handleSummarize = async () => {
    if (!files.length) return;
    setProcessing(true);
    setError(null);
    setSummary(null);

    try {
      // 1) Extract & sanitize text
      let combinedText = "";
      for (const file of files) {
        const raw = await extractTextFromPDF(file);
        const sanitized = sanitizeText(raw);
        combinedText += `File: ${file.name}\n${sanitized}\n\n`;
      }

      if (!combinedText.trim()) {
        setError("No text found to summarize.");
        setProcessing(false);
        return;
      }

      // 2) Post to our serverless route
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText }),
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary || "No summary found");
      }
    } catch (e: unknown) {
      console.error(e);
       if (e instanceof Error) {
         setError(e.message);
       } else {
         setError("Unexpected error occurred.");
       }
    }

    setProcessing(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Bank Statement Analyzer</h1>

      {/* PDF Dropzone */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-4 text-center rounded cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag & drop PDFs or click to select</p>
      </div>

      {/* File List */}
      <ul className="mt-4">
        {files.map((file) => (
          <li key={file.name} className="text-gray-700">
            {file.name}
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={handleSummarize}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={processing || !files.length}
      >
        {processing ? "Processing..." : "Generate Balance Sheet"}
      </button>

      {/* Error */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Summary */}
      {summary && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">AI-Generated Summary</h2>
          <pre className="whitespace-pre-wrap">{summary}</pre>
        </div>
      )}
    </main>
  );
}
