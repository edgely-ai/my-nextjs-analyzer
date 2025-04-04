// lib/generateT5Xml.ts

import { create } from "xmlbuilder2";
import fs from "fs";

interface T5Recipient {
  name: string;
  sin: string;
  amount: number;
}

interface T5Submission {
  senderId: string; // CRA Business Number (e.g., 123456789RC0001)
  taxYear: string; // e.g., "2024"
  recipients: T5Recipient[];
}

export function generateT5Xml(
  data: T5Submission,
  outputPath = "output/my-return.xml"
) {
  const { senderId, taxYear, recipients } = data;

  const root = create({ version: "1.0" })
    .ele("T619")
    .ele("SenderBN")
    .txt(senderId)
    .up()
    .ele("TaxYear")
    .txt(taxYear)
    .up()
    .ele("T5Return");

  for (const recipient of recipients) {
    root
      .ele("Recipient")
      .ele("Name")
      .txt(recipient.name)
      .up()
      .ele("SIN")
      .txt(recipient.sin)
      .up()
      .ele("Amount")
      .txt(recipient.amount.toFixed(2))
      .up()
      .up(); // closes <Recipient>
  }

  const xml = root.end({ prettyPrint: true });

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync(outputPath, xml);

  console.log(`✅ T5 XML generated at ${outputPath}`);
}
