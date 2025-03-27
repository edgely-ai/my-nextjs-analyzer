declare module "pdfjs-dist/build/pdf" {
  /** Parameters for getDocument() */
  interface GetDocumentParams {
    /** Either a URL or raw PDF data */
    url?: string;
    data?: Uint8Array;
  }

  /** A loading task that resolves to a PDFDocumentProxy */
  interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  /** A basic PDF Document interface */
  interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
    // You can add more methods if you need them
  }

  /** A basic PDF Page interface */
  interface PDFPageProxy {
    getTextContent: () => Promise<TextContent>;
    // Add more if needed
  }

  /** The text content returned by getTextContent() */
  interface TextContent {
    items: TextItem[];
  }

  /** Each item in the text layer */
  interface TextItem {
    str: string;
    // Possibly more properties, e.g. fontName, transform, etc.
  }

  /** The global worker options. We only really set `workerSrc` */
  interface PDFJSWorkerOptions {
    workerSrc: string;
  }

  /** The root object exported by pdfjs-dist. */
  interface PDFJSStatic {
    GlobalWorkerOptions: PDFJSWorkerOptions;
    version: string;
    getDocument: (args: GetDocumentParams | string) => PDFDocumentLoadingTask;
  }

  const pdfjsLib: PDFJSStatic;
  export default pdfjsLib;
}

declare module "pdfjs-dist/build/pdf.worker.entry" {
  // Typically no need to export anything
  const workerEntry: unknown;
  export default workerEntry;
}
