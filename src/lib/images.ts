import piexif from 'piexifjs'

export interface ExifEntry {
  tag: string
  value: string
}

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export async function readExif(file: File): Promise<ExifEntry[]> {
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') return []
  const dataUrl = await dataUrlFromFile(file)
  try {
    const exif = piexif.load(dataUrl)
    const entries: ExifEntry[] = []
    for (const ifd of ['0th', 'Exif', 'GPS', 'Interop', '1st'] as const) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const section = (exif as any)[ifd]
      if (!section) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tags: any = (piexif as any).TAGS?.[ifd] ?? {}
      for (const [tag, value] of Object.entries(section)) {
        const name = tags[tag]?.name ?? `Tag ${tag}`
        let v: string
        if (ifd === 'GPS' && Array.isArray(value)) v = JSON.stringify(value)
        else if (Array.isArray(value)) v = value.join(', ')
        else v = String(value)
        if (v.length > 200) v = v.slice(0, 200) + '…'
        entries.push({ tag: `${ifd.toUpperCase()} · ${name}`, value: v })
      }
    }
    return entries
  } catch {
    return []
  }
}

/** Strip metadata by re-encoding through canvas (works for jpeg/png/webp) */
export async function scrubImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const type = file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
  return new Promise((res) => canvas.toBlob((b) => res(b!), type, 0.92))
}

export async function convertImage(file: File, target: 'image/png' | 'image/jpeg' | 'image/webp', quality = 0.92): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  if (target === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(bitmap, 0, 0)
  return new Promise((res) => canvas.toBlob((b) => res(b!), target, quality))
}
