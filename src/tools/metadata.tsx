import { useState } from 'react'
import { DropZone, FileList, RunButton, StatusLine } from '@/components/kit'
import { downloadBlob, baseName, formatBytes } from '@/lib/download'
import { readPdfMeta, writePdfMeta, scrubPdfMeta, type PdfMeta } from '@/lib/pdf'
import { readExif, scrubImage, type ExifEntry } from '@/lib/images'

const META_KEYS: { key: keyof PdfMeta; label: string; editable: boolean }[] = [
  { key: 'title', label: 'Title', editable: true },
  { key: 'author', label: 'Author', editable: true },
  { key: 'subject', label: 'Subject', editable: true },
  { key: 'keywords', label: 'Keywords (comma separated)', editable: true },
  { key: 'creator', label: 'Creator app', editable: true },
  { key: 'producer', label: 'Producer', editable: true },
  { key: 'creationDate', label: 'Created', editable: false },
  { key: 'modificationDate', label: 'Modified', editable: false },
]

export function PdfMetadata() {
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<PdfMeta | null>(null)
  const [pages, setPages] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const load = async (f: File) => {
    setFile(f)
    setLog([])
    try {
      const { meta, pageCount } = await readPdfMeta(f)
      setMeta(meta)
      setPages(pageCount)
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
  }

  const save = async () => {
    if (!file || !meta) return
    setBusy(true)
    try {
      const out = await writePdfMeta(file, meta)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), `${baseName(file.name)}-meta.pdf`)
      setLog(['Metadata updated → downloaded'])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  const scrub = async () => {
    if (!file) return
    setBusy(true)
    try {
      const out = await scrubPdfMeta(file)
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), `${baseName(file.name)}-clean.pdf`)
      setLog(['All metadata fields cleared and XMP stream removed → downloaded'])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="application/pdf" hint="Drop one PDF to inspect" onFiles={(f) => load(f[0])} />
      {file && (
        <p className="font-body2 text-xs tnum opacity-60">
          {file.name} · {formatBytes(file.size)} · {pages} pages
        </p>
      )}
      {meta && (
        <div className="rule divide-y t-divide">
          {META_KEYS.map(({ key, label, editable }) => (
            <div key={key} className="grid grid-cols-[140px_1fr] items-center">
              <span className="micro-label px-3 py-2 opacity-60 rule-r">{label}</span>
              {editable ? (
                <input
                  className="px-3 py-2 bg-transparent text-sm font-body2 outline-none t-accent-focus"
                  value={meta[key]}
                  onChange={(e) => setMeta({ ...meta, [key]: e.target.value })}
                />
              ) : (
                <span className="px-3 py-2 text-sm font-body2 tnum opacity-60">{meta[key] || '—'}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {meta && (
        <div className="grid grid-cols-2 gap-4">
          <RunButton onClick={save} busy={busy} label="Save edited metadata" />
          <button onClick={scrub} disabled={busy} className="micro-label rule px-6 py-3 t-accent-fill transition-colors">
            Scrub all metadata
          </button>
        </div>
      )}
      <StatusLine log={log} />
    </div>
  )
}

export function ExifViewer() {
  const [file, setFile] = useState<File | null>(null)
  const [entries, setEntries] = useState<ExifEntry[] | null>(null)
  const [log, setLog] = useState<string[]>([])

  const load = async (f: File) => {
    setFile(f)
    setLog([])
    const e = await readExif(f)
    setEntries(e)
    if (f.type !== 'image/jpeg' && f.type !== 'image/jpg') setLog(['EXIF tags only exist on JPEG files — PNG/WebP carry little or no EXIF.'])
    else if (!e.length) setLog(['No EXIF metadata found in this file.'])
  }

  return (
    <div className="space-y-4">
      <DropZone accept="image/jpeg,image/jpg,image/png,image/webp" hint="Drop an image to inspect EXIF" onFiles={(f) => load(f[0])} />
      {file && (
        <p className="font-body2 text-xs tnum opacity-60">
          {file.name} · {formatBytes(file.size)} · {file.type}
        </p>
      )}
      {entries && entries.length > 0 && (
        <div className="rule divide-y t-divide max-h-96 overflow-auto">
          {entries.map((e, i) => (
            <div key={i} className="grid grid-cols-[220px_1fr] text-sm">
              <span className="micro-label px-3 py-2 opacity-60 rule-r">{e.tag}</span>
              <span className="px-3 py-2 font-body2 text-xs break-all">{e.value}</span>
            </div>
          ))}
        </div>
      )}
      <StatusLine log={log} />
    </div>
  )
}

export function ImageScrubber() {
  const [files, setFiles] = useState<File[]>([])
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setLog([])
    const done: string[] = []
    for (const f of files) {
      try {
        const blob = await scrubImage(f)
        const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
        downloadBlob(blob, `${baseName(f.name)}-clean.${ext}`)
        done.push(`${f.name}: stripped ${formatBytes(f.size)} → ${formatBytes(blob.size)}`)
      } catch (e) {
        done.push(`${f.name}: error — ${(e as Error).message}`)
      }
    }
    setLog(done.concat(['GPS, camera, and timestamp data removed by full pixel re-encode.']))
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs opacity-60 leading-relaxed">
        Photos often embed GPS coordinates, camera serials and timestamps. This re-encodes the pixels into a fresh file with zero metadata.
      </p>
      <DropZone accept="image/*" multiple hint="Drop images to scrub" onFiles={(f) => setFiles((p) => [...p, ...f])} />
      <FileList files={files} onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))} />
      <RunButton onClick={run} disabled={!files.length} busy={busy} label="Remove all metadata" />
      <StatusLine log={log} />
    </div>
  )
}
