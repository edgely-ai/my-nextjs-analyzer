// app/components/StructuredBalanceSheetPreview.tsx

import React from "react";

export interface StructuredSection {
  account: string;
  value: number;
}

export interface StructuredBalanceSheet {
  assets: StructuredSection[];
  liabilities: StructuredSection[];
  equity: StructuredSection[];
}

interface Props {
  structuredSheet: StructuredBalanceSheet;
  structuredDate: string;
}

export default function StructuredBalanceSheetPreview({
  structuredSheet,
  structuredDate,
}: Readonly<Props>) {
  return (
    <div className="bg-gray-900 p-4 rounded w-full md:w-1/2">
      <h3 className="font-semibold mb-2">
        Structured Balance Sheet ({structuredDate})
      </h3>
      <div className="flex gap-6">
        {(["assets", "liabilities", "equity"] as const).map((section) => {
          const entries = structuredSheet[section] ?? [];
          return (
            <div key={section} className="flex-1">
              <h4 className="underline capitalize mb-1">{section}</h4>
              <ul>
                {entries.map((item) => (
                  <li
                    key={item.account}
                    className="flex justify-between text-sm text-white"
                  >
                    <span>{item.account}</span>
                    <span>${item.value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
