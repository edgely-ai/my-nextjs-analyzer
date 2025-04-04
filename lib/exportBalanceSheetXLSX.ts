import { StructuredSection, StructuredSheet } from "@/types/financial";
import { utils, write } from "xlsx"; // ✅ make sure this is 'write', not 'writeFile'

export function generateStructuredBalanceSheetBuffer(
  structured: StructuredSheet
): Buffer {
  const rows: { Account: string; Value?: number }[] = [];

  const pushSection = (title: string, data: StructuredSection[] = []) => {
    rows.push({ Account: title });
    for (const entry of data) {
      const value = typeof entry.value === "number" ? entry.value : 0;
      rows.push({ Account: entry.account, Value: value });
    }
  };

  pushSection("Assets", structured.assets);
  pushSection("Liabilities", structured.liabilities);
  pushSection("Equity", structured.equity);

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "BalanceSheet");

  const buffer = write(workbook, {
    bookType: "xlsx",
    type: "buffer", // ✅ this makes it return a Buffer instead of saving to disk
  });

  return buffer;
}
