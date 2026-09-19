import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { parseRanges } from "@/lib/pdf";

export interface OrganizeItem {
  srcIndex: number;
  rotation: number;
}

/**
 * Rebuild a PDF from a page plan: pick a source page, apply extra rotation,
 * repeat it or drop it — in any order.
 */
export async function organizePdf(
  file: File,
  items: OrganizeItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  if (!items.length) throw new Error("Keep at least one page");
  const src = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: true,
  });
  const out = await PDFDocument.create();
  const copies = await out.copyPages(
    src,
    items.map((it) => it.srcIndex),
  );
  copies.forEach((page, i) => {
    const item = items[i];
    if (item && item.rotation) {
      page.setRotation(
        degrees((page.getRotation().angle + item.rotation) % 360),
      );
    }
    out.addPage(page);
    onProgress?.(i + 1, copies.length);
  });
  return out.save();
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  layout: "single" | "tile";
  color: { r: number; g: number; b: number };
  ranges: string;
}

function targetPages(pageCount: number, ranges: string): number[] {
  return ranges.trim()
    ? parseRanges(ranges, pageCount)
    : Array.from({ length: pageCount }, (_, i) => i);
}

function drawCentered(
  page: PDFPage,
  font: PDFFont,
  text: string,
  size: number,
  opacity: number,
  color: ReturnType<typeof rgb>,
  rotationDeg: number,
) {
  const { width, height } = page.getSize();
  const w = font.widthOfTextAtSize(text, size);
  const h = font.heightAtSize(size);
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = (w / 2) * cos - (h / 2) * sin;
  const dy = (w / 2) * sin + (h / 2) * cos;
  page.drawText(text, {
    x: width / 2 - dx,
    y: height / 2 - dy,
    size,
    font,
    color,
    opacity,
    rotate: degrees(rotationDeg),
  });
}

function drawTiled(
  page: PDFPage,
  font: PDFFont,
  text: string,
  size: number,
  opacity: number,
  color: ReturnType<typeof rgb>,
  rotationDeg: number,
) {
  const { width, height } = page.getSize();
  const w = font.widthOfTextAtSize(text, size);
  const h = font.heightAtSize(size);
  const stepX = w + size * 4;
  const stepY = h + size * 5;
  for (let y = h; y < height; y += stepY) {
    for (let x = w / 2; x < width + w; x += stepX) {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color,
        opacity,
        rotate: degrees(rotationDeg),
      });
    }
  }
}

export async function watermarkPdf(
  file: File,
  opts: WatermarkOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  if (!opts.text.trim()) throw new Error("Enter watermark text");
  const doc = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: true,
  });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const color = rgb(opts.color.r, opts.color.g, opts.color.b);
  const targets = targetPages(doc.getPageCount(), opts.ranges);
  targets.forEach((idx, i) => {
    const page = doc.getPage(idx);
    if (opts.layout === "tile") {
      drawTiled(page, font, opts.text, opts.fontSize, opts.opacity, color, opts.rotation);
    } else {
      drawCentered(
        page,
        font,
        opts.text,
        opts.fontSize,
        opts.opacity,
        color,
        opts.rotation,
      );
    }
    onProgress?.(i + 1, targets.length);
  });
  return doc.save();
}

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export interface PageNumberOptions {
  position: PageNumberPosition;
  format: "n" | "n-of-total" | "page-n";
  startAt: number;
  fontSize: number;
  margin: number;
}

export async function numberPdf(
  file: File,
  opts: PageNumberOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: true,
  });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const color = rgb(0.35, 0.35, 0.38);
  pages.forEach((page, i) => {
    const n = opts.startAt + i;
    const label =
      opts.format === "n"
        ? `${n}`
        : opts.format === "n-of-total"
          ? `${n} / ${total}`
          : `Page ${n}`;
    const { width, height } = page.getSize();
    const w = font.widthOfTextAtSize(label, opts.fontSize);
    const h = font.heightAtSize(opts.fontSize);
    const top = opts.position.startsWith("top");
    const left = opts.position.endsWith("left");
    const right = opts.position.endsWith("right");
    const x = left
      ? opts.margin
      : right
        ? width - opts.margin - w
        : (width - w) / 2;
    const y = top ? height - opts.margin - h : opts.margin;
    page.drawText(label, { x, y, size: opts.fontSize, font, color });
    onProgress?.(i + 1, total);
  });
  return doc.save();
}

export interface BurstPage {
  page: number;
  bytes: Uint8Array;
}

export async function burstPdf(
  file: File,
  onProgress?: (done: number, total: number) => void,
): Promise<BurstPage[]> {
  const src = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: true,
  });
  const total = src.getPageCount();
  const out: BurstPage[] = [];
  for (let i = 0; i < total; i++) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(src, [i]);
    if (page) single.addPage(page);
    out.push({ page: i + 1, bytes: await single.save() });
    onProgress?.(i + 1, total);
  }
  return out;
}
