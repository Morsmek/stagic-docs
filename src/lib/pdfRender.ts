import { PDFDocument } from "pdf-lib";

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  return pdfjs;
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const n = doc.numPages;
  await (doc as unknown as { destroy?: () => Promise<void> }).destroy?.();
  return n;
}

export interface RenderedPage {
  page: number;
  blob: Blob;
  width: number;
  height: number;
}

export interface TextPage {
  page: number;
  text: string;
}

interface TextItemLike {
  str?: string;
  hasEOL?: boolean;
}

export async function extractPdfText(
  file: File,
  onProgress?: (done: number, total: number) => void,
): Promise<TextPage[]> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() })
    .promise;
  const out: TextPage[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let text = "";
    for (const raw of content.items as unknown as TextItemLike[]) {
      if (typeof raw.str === "string") text += raw.str;
      if (raw.hasEOL) text += "\n";
    }
    out.push({ page: i, text: text.replace(/[ \t]+\n/g, "\n").trimEnd() });
    onProgress?.(i, doc.numPages);
  }
  await (doc as unknown as { destroy?: () => Promise<void> }).destroy?.();
  return out;
}

export async function pdfToImages(
  file: File,
  scale: number,
  onProgress?: (done: number, total: number) => void,
): Promise<RenderedPage[]> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out: RenderedPage[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("Encode failed"))), "image/png"),
    );
    out.push({ page: i, blob, width: canvas.width, height: canvas.height });
    onProgress?.(i, doc.numPages);
  }
  await (doc as unknown as { destroy?: () => Promise<void> }).destroy?.();
  return out;
}

/**
 * Raster compression: re-render each page at reduced scale and re-embed as JPEG.
 */
export async function compressPdf(
  file: File,
  quality: number,
  scale: number,
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const pdfjs = await loadPdfjs();
  const src = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out = await PDFDocument.create();
  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("Encode failed"))),
        "image/jpeg",
        quality,
      ),
    );
    const img = await out.embedJpg(await blob.arrayBuffer());
    const orig = page.getViewport({ scale: 1 });
    const p = out.addPage([orig.width, orig.height]);
    p.drawImage(img, { x: 0, y: 0, width: orig.width, height: orig.height });
    onProgress?.(i, src.numPages);
  }
  await (src as unknown as { destroy?: () => Promise<void> }).destroy?.();
  return out.save();
}
