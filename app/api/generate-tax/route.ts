// app/api/generate-tax/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_income,
      interest_income,
      meals_entertainment,
      freight_delivery,
      credit_card_fees,
      net_income,
    } = body;

    const now = new Date();
    const craLines = {
      8299: business_income,
      8099: interest_income,
      9281: meals_entertainment,
      9275: freight_delivery,
      8710: credit_card_fees,
      9999: net_income,
    };

    const lines = [
      "# CRA .tax file - Auto-generated from AI Summary",
      `# Generated on ${now.toISOString()}`,
      "ReturnType=T2",
      "TaxYear=2024",
      "BusinessNumber=123456789RC0001",
      "CorporationName=MyContractingCorp",
      "FiscalStart=2024-01-01",
      "FiscalEnd=2024-12-31",
      "",
    ];

    for (const [line, value] of Object.entries(craLines)) {
      lines.push(`${line}=${value}   # Auto-filled`);
    }

    const fileName = `CRA_2024_BalanceSheet.tax`;
    const filePath = path.join("/tmp", fileName);
    fs.writeFileSync(filePath, lines.join("\n"));

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate .tax file", detail: String(err) },
      { status: 500 }
    );
  }
}
