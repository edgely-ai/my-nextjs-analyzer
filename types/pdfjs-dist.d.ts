// types/pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf" {
  // 1. Worker options
  interface PDFWorkerOptions {
    workerSrc: string;
  }

  // 2. Document parameters
  interface GetDocumentParams {
    data?: Uint8Array;
    url?: string;
  }

  // 3. Document proxy with pages
  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  // 4. Page proxy with text content
  interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  // 5. Text content
  interface TextContent {
    items: TextItem[];
  }

  // 6. Text item
  interface TextItem {
    str: string;
  }

  // 7. The main library exports
  export const GlobalWorkerOptions: PDFWorkerOptions;

  export function getDocument(src: GetDocumentParams | string): {
    promise: Promise<PDFDocumentProxy>;
  };
}
