import { useState } from 'react'
import mammoth from 'mammoth'
import { DropZone, FileList, RunButton, StatusLine, Field } from '@/components/kit'
import { downloadBlob, baseName, formatBytes } from '@/lib/download'
import { textToPdf } from '@/lib/pdf'
import { convertImage } from '@/lib/images'

export function DocxToHtml() {
  const [file, setFile] = useState<File | null>(null)
  const [html, setHtml] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!file) return
    setBusy(true)
    setLog([])
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
      const doc = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${baseName(file.name)}</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:3rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #999;padding:.3rem .6rem}</style>
</head>
<body>
${result.value}
</body>
</html>`
      setHtml(result.value)
      downloadBlob(new Blob([doc], { type: 'text/html' }), `${baseName(file.name)}.html`)
      const warnings = result.messages.filter((m) => m.type === 'warning').length
      setLog([`Converted → ${baseName(file.name)}.html${warnings ? ` (${warnings} formatting warnings)` : ''}`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hint="Drop a .docx file" onFiles={(f) => { setFile(f[0]); setHtml('') }} />
      <FileList files={file ? [file] : []} onRemove={() => { setFile(null); setHtml('') }} />
      <RunButton onClick={run} disabled={!file} busy={busy} label="Convert to HTML" />
      {html && (
        <div className="rule max-h-80 overflow-auto p-4 bg-white/50">
          <p className="micro-label opacity-50 mb-2">Preview</p>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
      <StatusLine log={log} />
    </div>
  )
}

export function TextMdToPdf() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setLog([])
    try {
      const out = await textToPdf(text, title || 'Document')
      downloadBlob(new Blob([out as BlobPart], { type: 'application/pdf' }), `${title || 'document'}.pdf`)
      setLog([`Typeset → ${title || 'document'}.pdf (${formatBytes(out.length)})`])
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`])
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone
        accept=".txt,.md,text/plain,text/markdown"
        hint="Drop a .txt / .md file — or paste below"
        onFiles={async (f) => {
          setText(await f[0].text())
          setTitle(baseName(f[0].name))
        }}
      />
      <Field label="Document title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" className="w-full rule bg-transparent px-3 py-2 text-sm font-mono2 outline-none focus:bg-[#ff4d00]/10" />
      </Field>
      <Field label="Content (# headings and **bold** are typeset)">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={'# Report title\n\nWrite or paste text here…'}
          className="w-full rule bg-transparent px-3 py-2 text-sm font-mono2 outline-none focus:bg-[#ff4d00]/10 resize-y"
        />
      </Field>
      <RunButton onClick={run} disabled={!text.trim()} busy={busy} label="Typeset as PDF" />
      <StatusLine log={log} />
    </div>
  )
}

const TARGETS = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
] as const

export function ImageConvert() {
  const [files, setFiles] = useState<File[]>([])
  const [target, setTarget] = useState<(typeof TARGETS)[number]['value']>('image/webp')
  const [log, setLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setLog([])
    const ext = TARGETS.find((t) => t.value === target)!.ext
    const done: string[] = []
    for (const f of files) {
      try {
        const blob = await convertImage(f, target)
        downloadBlob(blob, `${baseName(f.name)}.${ext}`)
        done.push(`${f.name}: ${formatBytes(f.size)} → ${formatBytes(blob.size)}`)
      } catch (e) {
        done.push(`${f.name}: error — ${(e as Error).message}`)
      }
    }
    setLog(done)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <DropZone accept="image/*" multiple hint="Drop images to convert" onFiles={(f) => setFiles((p) => [...p, ...f])} />
      <FileList files={files} onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))} />
      <Field label="Target format">
        <div className="grid grid-cols-3 rule divide-x divide-[#16130e]">
          {TARGETS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTarget(t.value)}
              className={`micro-label py-2.5 transition-colors ${target === t.value ? 'bg-[#16130e] text-[#f4f1ea]' : 'hover:bg-[#ff4d00]/15'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Field>
      <RunButton onClick={run} disabled={!files.length} busy={busy} label="Convert images" />
      <StatusLine log={log} />
    </div>
  )
}
