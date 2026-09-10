import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { formatBytes } from '@/lib/download'

export function DropZone({
  accept,
  multiple,
  onFiles,
  hint,
}: {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  hint: string
}) {
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      onFiles(Array.from(list))
    },
    [onFiles]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        handle(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`rule cursor-pointer flex flex-col items-center justify-center gap-2 py-10 px-4 text-center transition-colors ${
        over ? 't-hover' : 't-subtle-hover'
      }`}
    >
      <Upload className="w-5 h-5" strokeWidth={1.5} />
      <p className="micro-label">{hint}</p>
      <p className="text-xs t-muted">Drop {multiple ? 'files' : 'a file'} here or click to browse — processed locally, never uploaded</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function FileList({ files, onRemove }: { files: File[]; onRemove?: (i: number) => void }) {
  if (!files.length) return null
  return (
    <div className="rule t-divide">
      {files.map((f, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
          <span className="truncate">
            <span className="font-body2 tnum text-xs t-muted mr-2">{String(i + 1).padStart(2, '0')}</span>
            {f.name}
          </span>
          <span className="flex items-center gap-3 shrink-0 ml-3">
            <span className="font-body2 tnum text-xs t-muted">{formatBytes(f.size)}</span>
            {onRemove && (
              <button onClick={() => onRemove(i)} className="micro-label t-accent-hover">
                ✕
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RunButton({
  onClick,
  disabled,
  busy,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  busy?: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className="micro-label rule px-6 py-3 t-btn disabled:opacity-30 transition-colors w-full"
      style={{ background: 'var(--btn-bg)', color: 'var(--btn-fg)' }}
      onMouseEnter={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.background = 'var(--accent)'
          e.currentTarget.style.color = 'var(--accent-fg)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--btn-bg)'
        e.currentTarget.style.color = 'var(--btn-fg)'
      }}
    >
      {busy ? 'WORKING…' : label}
    </button>
  )
}

export function StatusLine({ log }: { log: string[] }) {
  if (!log.length) return null
  return (
    <div className="rule-t pt-3 space-y-1">
      {log.map((l, i) => (
        <p key={i} className="font-body2 text-xs tnum">
          <span className="t-accent">▸</span> {l}
        </p>
      ))}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="micro-label t-muted block mb-1">{label}</span>
      {children}
    </label>
  )
}

export const inputCls = 'w-full rule bg-transparent px-3 py-2 text-sm font-body2 outline-none t-accent-focus placeholder:opacity-40'
