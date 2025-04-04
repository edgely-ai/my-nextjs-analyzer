// /types/financial.ts

export interface StructuredSection {
  account: string;
  value: number;
}


export interface StructuredSheet {
  assets: StructuredSection[];
  liabilities: StructuredSection[];
  equity: StructuredSection[];
  date: string;
}