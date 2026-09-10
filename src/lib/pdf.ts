import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const f of files) {
    const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true })
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
  }
  return out.save()
}

/** ranges like "1-3,5,8-" (1-based) */
export function parseRanges(input: string, max: number): number[] {
  const out: number[] = []
  for (const part of input.split(',')) {
    const p = part.trim()
    if (!p) continue
    const m = p.match(/^(\d+)?\s*-\s*(\d+)?$/)
    if (m) {
      const a = m[1] ? parseInt(m[1]) : 1
      const b = m[2] ? parseInt(m[2]) : max
      for (let i = Math.max(1, a); i <= Math.min(max, b); i++) out.push(i - 1)
    } else if (/^\d+$/.test(p)) {
      const n = parseInt(p)
      if (n >= 1 && n <= max) out.push(n - 1)
    }
  }
  return [...new Set(out)].sort((a, b) => a - b)
}

export async function splitPdf(file: File, ranges: string): Promise<Uint8Array> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  const indices = parseRanges(ranges, src.getPageCount())
  if (indices.length === 0) throw new Error('No valid pages selected')
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, indices)
  pages.forEach((p) => out.addPage(p))
  return out.save()
}

export async function rotatePdf(file: File, angle: 90 | 180 | 270, ranges: string): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  const pages = doc.getPages()
  const targets = ranges.trim() ? parseRanges(ranges, pages.length) : pages.map((_, i) => i)
  for (const i of targets) {
    const p = pages[i]
    p.setRotation(degrees((p.getRotation().angle + angle) % 360))
  }
  return doc.save()
}

export interface PdfMeta {
  title: string
  author: string
  subject: string
  keywords: string
  creator: string
  producer: string
  creationDate: string
  modificationDate: string
}

export async function readPdfMeta(file: File): Promise<{ meta: PdfMeta; pageCount: number }> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false })
  const d = (v: Date | undefined) => (v ? v.toISOString() : '')
  return {
    pageCount: doc.getPageCount(),
    meta: {
      title: doc.getTitle() ?? '',
      author: doc.getAuthor() ?? '',
      subject: doc.getSubject() ?? '',
      keywords: doc.getKeywords() ?? '',
      creator: doc.getCreator() ?? '',
      producer: doc.getProducer() ?? '',
      creationDate: d(doc.getCreationDate()),
      modificationDate: d(doc.getModificationDate()),
    },
  }
}

export async function writePdfMeta(file: File, meta: Partial<PdfMeta>): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  if (meta.title !== undefined) doc.setTitle(meta.title)
  if (meta.author !== undefined) doc.setAuthor(meta.author)
  if (meta.subject !== undefined) doc.setSubject(meta.subject)
  if (meta.keywords !== undefined) doc.setKeywords(meta.keywords ? meta.keywords.split(',').map((k) => k.trim()) : [])
  if (meta.creator !== undefined) doc.setCreator(meta.creator)
  if (meta.producer !== undefined) doc.setProducer(meta.producer)
  return doc.save()
}

export async function scrubPdfMeta(file: File): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setCreator('')
  doc.setProducer('')
  doc.setCreationDate(new Date(0))
  doc.setModificationDate(new Date(0))
  // Drop the XMP metadata stream entirely
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catalog = (doc as any).catalog
    if (catalog?.delete) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { PDFName } = (await import('pdf-lib')) as any
      catalog.delete(PDFName.of('Metadata'))
    }
  } catch {
    /* non-fatal */
  }
  return doc.save()
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const f of files) {
    const buf = await f.arrayBuffer()
    let img
    if (f.type === 'image/png') img = await doc.embedPng(buf)
    else if (f.type === 'image/jpeg' || f.type === 'image/jpg') img = await doc.embedJpg(buf)
    else {
      // Convert other formats through canvas to PNG
      const png = await imageFileToPngBytes(f)
      img = await doc.embedPng(png)
    }
    const page = doc.addPage([img.width, img.height])
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
  }
  return doc.save()
}

export async function imageFileToPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
  return new Uint8Array(await blob.arrayBuffer())
}

export async function textToPdf(text: string, title: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const pageW = 595.28
  const pageH = 841.89
  const margin = 56
  const size = 11
  const lineH = size * 1.5
  const maxWidth = pageW - margin * 2

  const wrapLine = (line: string, f = font, s = size): string[] => {
    const words = line.split(/\s+/)
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w
      if (f.widthOfTextAtSize(test, s) <= maxWidth) cur = test
      else {
        if (cur) lines.push(cur)
        cur = w
      }
    }
    lines.push(cur)
    return lines
  }

  // Very light markdown handling: headings get bold/larger, list markers kept
  interface Line {
    text: string
    bold: boolean
    size: number
  }
  const outLines: Line[] = []
  for (const raw of text.split(/\r?\n/)) {
    const h = raw.match(/^(#{1,4})\s+(.*)/)
    if (h) {
      const s = h[1].length <= 2 ? 15 : 13
      for (const l of wrapLine(h[2], bold, s)) outLines.push({ text: l, bold: true, size: s })
      outLines.push({ text: '', bold: false, size })
      continue
    }
    const cleaned = raw.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1')
    if (!cleaned.trim()) {
      outLines.push({ text: '', bold: false, size })
      continue
    }
    for (const l of wrapLine(cleaned)) outLines.push({ text: l, bold: false, size })
  }

  let page = doc.addPage([pageW, pageH])
  let y = pageH - margin
  const cursor = rgb(0.09, 0.07, 0.05)
  if (title) {
    doc.setTitle(title)
    doc.setCreator('Stagic Docs')
    doc.setProducer('Stagic Docs')
  }
  for (const l of outLines) {
    const h = l.size * 1.5 || lineH
    if (y - h < margin) {
      page = doc.addPage([pageW, pageH])
      y = pageH - margin
    }
    if (l.text) {
      page.drawText(l.text, { x: margin, y: y - l.size, size: l.size, font: l.bold ? bold : font, color: cursor })
    }
    y -= h
  }
  return doc.save()
}
