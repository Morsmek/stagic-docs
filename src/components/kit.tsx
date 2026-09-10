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
        over ? 'bg-[#16130e] text-[#f4f1ea]' : 'hover:bg-black/5'
      }`}
    >
      <Upload className="w-5 h-5" strokeWidth={1.5} />
      <p className="micro-label">{hint}</p>
      <p className="text-xs opacity-50">Drop {multiple ? 'files' : 'a file'} here or click to browse — processed locally, never uploaded</p>
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
    <div className="rule divide-y divide-[#16130e]">
      {files.map((f, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
          <span className="truncate">
            <span className="font-mono2 tnum text-xs opacity-40 mr-2">{String(i + 1).padStart(2, '0')}</span>
            {f.name}
          </span>
          <span className="flex items-center gap-3 shrink-0 ml-3">
            <span className="font-mono2 tnum text-xs opacity-50">{formatBytes(f.size)}</span>
            {onRemove && (
              <button onClick={() => onRemove(i)} className="micro-label hover:text-[#ff4d00]">
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
      className="micro-label rule px-6 py-3 bg-[#16130e] text-[#f4f1ea] hover:bg-[#ff4d00] hover:text-[#16130e] disabled:opacity-30 disabled:hover:bg-[#16130e] disabled:hover:text-[#f4f1ea] transition-colors w-full"
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
        <p key={i} className="font-mono2 text-xs tnum">
          <span className="text-[#ff4d00]">▸</span> {l}
        </p>
      ))}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="micro-label opacity-60 block mb-1">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rule bg-transparent px-3 py-2 text-sm font-mono2 outline-none focus:bg-[#ff4d00]/10 placeholder:text-black/30'
