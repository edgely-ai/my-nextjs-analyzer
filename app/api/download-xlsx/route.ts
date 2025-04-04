import { NextResponse } from "next/server";
import { generateStructuredBalanceSheetBuffer } from "@/lib/exportBalanceSheetXLSX";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.structured) {
      return NextResponse.json(
        { error: "Missing structured balance sheet" },
        { status: 400 }
      );
    }

    const buffer = await generateStructuredBalanceSheetBuffer(body.structured);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="structured-balance-sheet.xlsx"',
      },
    });
  } catch (err) {
    console.error("Error generating XLSX:", err);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
