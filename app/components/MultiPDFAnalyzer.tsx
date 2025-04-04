"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DownloadTaxButton from "./DownloadTaxButton";
import StructuredBalanceSheetPreview from "./StructuredBalanceSheetPreview";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
}

export interface ParsedFile {
  name: string;
  text: string;
  status?: "parsed" | "summarized";
}

export interface StructuredSection {
  account: string;
  value: number;
}

interface PDFTextItem {
  str: string;
}
export interface StructuredSheet {
  assets: StructuredSection[];
  liabilities: StructuredSection[];
  equity: StructuredSection[];
  date: string;
}

export default function MultiPDFAnalyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [summary, setSummary] = useState("");
  const [structuredSheet, setStructuredSheet] =
    useState<StructuredSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"initial" | "parsed" | "summarized">(
    "initial"
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    onDrop: (acceptedFiles) => setFiles([...files, ...acceptedFiles]),
  });

  function sanitizeText(text: string): string {
    return text
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "[REDACTED]")
      .replace(/\b[A-Z]{2}\d{2} [A-Z0-9]{4} \d{4} \d{4} \d{4}\b/g, "[REDACTED]")
      .replace(/\b\d{2}-\d{2}-\d{2}\b/g, "[REDACTED]")
      .replace(/\b\d{10,}\b/g, "[REDACTED]")
      .replace(
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        "[EMAIL REDACTED]"
      )
      .replace(
        /\d{1,5}\s[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Blvd)/gi,
        "[ADDRESS REDACTED]"
      )
      .replace(/\b[A-Z]\d[A-Z] ?\d[A-Z]\d\b/gi, "[POSTALCODE REDACTED]");
  }

  async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = (content.items as PDFTextItem[])
        .map((item) => (typeof item.str === "string" ? item.str : ""))
        .filter(Boolean)
        .join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  }

  async function handleParsePDFs() {
    setLoading(true);
    setSummary("");
    setStructuredSheet(null);
    setStage("parsed");

    const results: ParsedFile[] = [];
    for (const file of files) {
      const raw = await extractTextFromPDF(file);
      const sanitized = sanitizeText(raw);
      results.push({ name: file.name, text: sanitized, status: "parsed" });
    }

    setParsedFiles(results);
    toast.success("✅ Parsing complete!");
    setLoading(false);
  }

  const handleSummarize = async () => {
    setLoading(true);
    setSummary("Summarizing with LLM. Please wait...");
    setStructuredSheet(null);
    setStage("summarized");

    try {
      const combinedText = parsedFiles
        .map((pf) => `===== ${pf.name} =====\n${pf.text}`)
        .join("\n\n");

      const systemPrompt = `You are a financial analyst assistant.

First, classify each financial document as either a **Chequing Account Statement** or a **Credit Card Statement**.

Then, summarize overall financial activity from all documents, including monthly patterns, overdrafts, interest charges, and payment behavior.

Finally, return a structured CRA-style balance sheet **strictly in this JSON format**:

"""json
{
  "date": "YYYY-MM-DD",
  "assets": [
    { "account": "string", "value": number }
  ],
  "liabilities": [
    { "account": "string", "value": number }
  ],
  "equity": [
    { "account": "string", "value": number }
  ]
}
"""

💡 Make sure all account entries have both an "account" string and a numeric "value". Use 0 if no value is available.`;

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText, systemPrompt }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Failed to summarize");

      setSummary(data.summary);
      setStructuredSheet(data.structured || null);
      toast.success("📄 Summary ready!");
    } catch (err) {
      console.error("Summarize error:", err);
      setSummary("Error occurred. Check console.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-black text-white p-4 border-2 border-white border-dashed rounded">
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Multi-PDF Analyzer</h2>

      <div
        className={`transition-opacity duration-700 ${
          stage === "summarized"
            ? "opacity-0 h-0 overflow-hidden"
            : "opacity-100"
        }`}
      >
        <div
          {...getRootProps()}
          className="bg-gray-800 border border-white p-6 text-center rounded mb-4 cursor-pointer hover:bg-gray-700"
        >
          <input {...getInputProps()} />
          <p>Drag & drop PDFs here, or click to select files</p>
        </div>

        {files.length > 0 && (
          <ul className="mb-4">
            {files.map((f) => {
              const parsed = parsedFiles.find((pf) => pf.name === f.name);
              return (
                <li key={f.name} className="transition-opacity duration-500">
                  {f.name}
                  {parsed?.status === "parsed" && (
                    <span className="ml-2 text-green-400 font-semibold">
                      ✔ Parsed
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600"
            onClick={handleParsePDFs}
            disabled={!files.length || loading}
          >
            {loading ? "Parsing..." : "Parse PDFs"}
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-600"
            onClick={handleSummarize}
            disabled={!parsedFiles.length || loading}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>
      </div>

      {summary && (
        <>
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">LLM Summary:</h3>
            <pre className="whitespace-pre-wrap bg-gray-800 p-3 rounded text-white">
              {summary}
            </pre>
          </div>

          {structuredSheet ? (
            <>
              <StructuredBalanceSheetPreview
                structuredSheet={structuredSheet}
                structuredDate={structuredSheet.date}
              />
              <DownloadTaxButton
                summary={summary}
                structured={structuredSheet}
                structuredDate={structuredSheet?.date || ""}
                onReset={() => {
                  setFiles([]);
                  setParsedFiles([]);
                  setSummary("");
                  setStructuredSheet(null);
                  setStage("initial");
                }}
              />
            </>
          ) : (
            <div className="text-center mt-4 text-sm text-gray-400 animate-pulse">
              Preparing structured balance sheet...
            </div>
          )}
        </>
      )}
    </div>
  );
}
