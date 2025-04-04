import React, { useState } from "react";
import { toast } from "react-toastify";
import { StructuredSheet } from "@/types/financial";

export interface DownloadTaxButtonProps {
  summary: string;
  structured: StructuredSheet | null;
  structuredDate: string;
  onReset: () => void;
}

export default function DownloadTaxButton({
  summary,
  structured,
  onReset,
}: Readonly<DownloadTaxButtonProps>) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!structured) return;
    setDownloading(true);

    try {
      const res = await fetch("/api/download-xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, structured }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "structured-balance-sheet.xlsx";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("✅ Excel downloaded");

      // ✅ Trigger reset after a short delay
      setTimeout(() => {
        onReset();
      }, 1500);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("❌ Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
      onClick={handleDownload}
      disabled={!structured || downloading}
    >
      {downloading ? "Preparing..." : "Download Excel File"}
    </button>
  );
}
