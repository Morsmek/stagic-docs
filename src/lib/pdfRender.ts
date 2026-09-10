import * as pdfjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument } from 'pdf-lib'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

export async function getPdfPageCount(file: File): Promise<number> {
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const n = doc.numPages
  doc.destroy()
  return n
}

export interface RenderedPage {
  page: number
  blob: Blob
  width: number
  height: number
}

export async function pdfToImages(
  file: File,
  scale: number,
  onProgress?: (done: number, total: number) => void
): Promise<RenderedPage[]> {
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const out: RenderedPage[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
    out.push({ page: i, blob, width: canvas.width, height: canvas.height })
    onProgress?.(i, doc.numPages)
  }
  doc.destroy()
  return out
}

/**
 * Real compression: re-render each page at reduced scale and re-embed as JPEG.
 * Great for scanned / image-heavy PDFs.
 */
export async function compressPdf(
  file: File,
  quality: number, // 0.4 - 0.9
  scale: number, // 1 - 2
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  const src = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const out = await PDFDocument.create()
  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', quality))
    const img = await out.embedJpg(await blob.arrayBuffer())
    const orig = page.getViewport({ scale: 1 })
    const p = out.addPage([orig.width, orig.height])
    p.drawImage(img, { x: 0, y: 0, width: orig.width, height: orig.height })
    onProgress?.(i, src.numPages)
  }
  src.destroy()
  return out.save()
}
