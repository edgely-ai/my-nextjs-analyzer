"use client";
import MultiPDFAnalyzer from "./components/MultiPDFAnalyzer";

export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analyze Multiple PDFs</h1>
      <MultiPDFAnalyzer />
    </main>
  );
}
