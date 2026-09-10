import { useState } from 'react'
import JSZip from 'jszip'
import { DropZone, FileList, RunButton, StatusLine, Field } from '@/components/kit'
import { downloadBlob, baseName, formatBytes } from '@/lib/download'
import { pdfToImages, compressPdf } from '@/lib/pdfRender'
import { imagesToPdf } from '@/lib/pdf'

export function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.6)
  const [scale, setScale] = useState(1.5)
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!file) return
    setBusy(true)
    setLog(['Re-rendering pages…'])
    try {
      const out = await compressPdf(file, quality, scale, (d, t) => setLog([`Re-rendering page ${d}/${t}…`]))
      const pct = ((1 - out.length / file.size) * 100).toFixed(0)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), `${baseName(file.name)}-compressed.pdf`)
      setLog([
        `${formatBytes(file.size)} → ${formatBytes(out.length)} (${Number(pct) >= 0 ? pct + '% smaller' : 'larger — original was already lean'})`,
        'Note: pages become images — text is no longer selectable.',
      ])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs opacity-60 leading-relaxed">
        Raster-compression: each page is re-rendered and re-embedded as JPEG. Dramatic size cuts on scanned documents.
      </p>
      <DropZone accept="application/pdf" hint="Drop one PDF" onFiles={(f) => setFile(f[0])} />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={`JPEG quality — ${Math.round(quality * 100)}%`}>
          <input type="range" min={0.4} max={0.9} step={0.05} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full accent-[#ff4d00]" />
        </Field>
        <Field label={`Render resolution — ${scale}x`}>
          <input type="range" min={1} max={2} step={0.25} value={scale} onChange={(e) => setScale(+e.target.value)} className="w-full accent-[#ff4d00]" />
        </Field>
      </div>
      <RunButton onClick={run} disabled={!file} busy={busy} label="Compress PDF" />
      <StatusLine log={log} />
    </div>
  )
}

export function PdfToImages() {
  const [file, setFile] = useState<File | null>(null)
  const [scale, setScale] = useState(2)
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!file) return
    setBusy(true)
    setLog([])
    try {
      const pages = await pdfToImages(file, scale, (d, t) => setLog([`Rendering page ${d}/${t}…`]))
      if (pages.length === 1) {
        downloadBlob(pages[0].blob, `${baseName(file.name)}-p1.png`)
      } else {
        const zip = new JSZip()
        pages.forEach((p) => zip.file(`${baseName(file.name)}-p${String(p.page).padStart(3, '0')}.png`, p.blob))
        const blob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(blob, `${baseName(file.name)}-pages.zip`)
      }
      setLog([`Rendered ${pages.length} page${pages.length > 1 ? 's' : ''} as PNG at ${scale}x`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="application/pdf" hint="Drop one PDF" onFiles={(f) => setFile(f[0])} />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <Field label={`Resolution — ${scale}x`}>
        <input type="range" min={1} max={3} step={0.5} value={scale} onChange={(e) => setScale(+e.target.value)} className="w-full accent-[#ff4d00]" />
      </Field>
      <RunButton onClick={run} disabled={!file} busy={busy} label="Render to PNG" />
      <StatusLine log={log} />
    </div>
  )
}

export function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setLog([])
    try {
      const out = await imagesToPdf(files)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), 'stagic-images.pdf')
      setLog([`Packed ${files.length} images → stagic-images.pdf (${formatBytes(out.length)})`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="image/*" multiple hint="Add images (one page each, in order)" onFiles={(f) => setFiles((p) => [...p, ...f])} />
      <FileList files={files} onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))} />
      <RunButton onClick={run} disabled={!files.length} busy={busy} label="Build PDF from images" />
      <StatusLine log={log} />
    </div>
  )
}
