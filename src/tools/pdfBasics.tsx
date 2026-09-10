import { useState } from 'react'
import { DropZone, FileList, RunButton, StatusLine, Field, inputCls } from '@/components/kit'
import { downloadBlob, baseName, formatBytes } from '@/lib/download'
import { mergePdfs, splitPdf, rotatePdf } from '@/lib/pdf'

export function MergePdf() {
  const [files, setFiles] = useState<File[]>([])
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setLog([])
    try {
      const out = await mergePdfs(files)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), 'stagic-merged.pdf')
      setLog([`Merged ${files.length} files → stagic-merged.pdf (${formatBytes(out.length)})`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="application/pdf" multiple hint="Add PDF files (order matters)" onFiles={(f) => setFiles((p) => [...p, ...f])} />
      <FileList files={files} onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))} />
      <RunButton onClick={run} disabled={files.length < 2} busy={busy} label="Merge into one PDF" />
      <StatusLine log={log} />
    </div>
  )
}

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [ranges, setRanges] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!file) return
    setBusy(true)
    setLog([])
    try {
      const out = await splitPdf(file, ranges)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), `${baseName(file.name)}-pages.pdf`)
      setLog([`Extracted pages [${ranges}] → ${baseName(file.name)}-pages.pdf (${formatBytes(out.length)})`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="application/pdf" hint="Drop one PDF" onFiles={(f) => setFile(f[0])} />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <Field label="Pages to extract — e.g. 1-3, 5, 8-">
        <input className={inputCls} value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 5, 8-" />
      </Field>
      <RunButton onClick={run} disabled={!file || !ranges.trim()} busy={busy} label="Extract pages" />
      <StatusLine log={log} />
    </div>
  )
}

export function RotatePdf() {
  const [file, setFile] = useState<File | null>(null)
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
  const [ranges, setRanges] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!file) return
    setBusy(true)
    setLog([])
    try {
      const out = await rotatePdf(file, angle, ranges)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), `${baseName(file.name)}-rotated.pdf`)
      setLog([`Rotated ${ranges.trim() || 'all pages'} by ${angle}° → saved`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="application/pdf" hint="Drop one PDF" onFiles={(f) => setFile(f[0])} />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rotation">
          <select className={inputCls} value={angle} onChange={(e) => setAngle(Number(e.target.value) as 90 | 180 | 270)}>
            <option value={90}>90° clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° clockwise</option>
          </select>
        </Field>
        <Field label="Pages (blank = all)">
          <input className={inputCls} value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="all pages" />
        </Field>
      </div>
      <RunButton onClick={run} disabled={!file} busy={busy} label="Rotate & download" />
      <StatusLine log={log} />
    </div>
  )
}
