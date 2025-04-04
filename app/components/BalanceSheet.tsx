"use client";
import React from "react";

interface BalanceSheetProps {
  readonly data: { [key: string]: number };
}

export default function BalanceSheet({ data }: BalanceSheetProps) {
  const total = Object.values(data).reduce((acc, val) => acc + val, 0);

  return (
    <div className="p-2 bg-white rounded shadow mt-4">
      <h2 className="font-bold mb-2">Final Balance Sheet</h2>
      <ul>
        {Object.entries(data).map(([cat, amt]) => (
          <li key={cat}>
            <span className="font-semibold">{cat}:</span> ${amt.toFixed(2)}
          </li>
        ))}
      </ul>
      <hr className="my-2" />
      <p className="font-semibold">Total: ${total.toFixed(2)}</p>
    </div>
  );
}
