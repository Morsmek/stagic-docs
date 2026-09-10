import { useState } from 'react'
import { MergePdf, SplitPdf, RotatePdf } from '@/tools/pdfBasics'
import { CompressPdf, PdfToImages, ImagesToPdf } from '@/tools/pdfMedia'
import { PdfMetadata, ExifViewer, ImageScrubber } from '@/tools/metadata'
import { DocxToHtml, TextMdToPdf, ImageConvert } from '@/tools/convert'

interface Tool {
  id: string
  name: string
  desc: string
  group: string
  el: React.ReactNode
}

const TOOLS: Tool[] = [
  { id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs into one file, in order.', group: 'PDF', el: <MergePdf /> },
  { id: 'split', name: 'Split / Extract', desc: 'Pull out page ranges: 1-3, 5, 8- and so on.', group: 'PDF', el: <SplitPdf /> },
  { id: 'rotate', name: 'Rotate Pages', desc: 'Rotate all or selected pages by 90/180/270°.', group: 'PDF', el: <RotatePdf /> },
  { id: 'compress', name: 'Compress PDF', desc: 'Raster compression for scanned, image-heavy files.', group: 'PDF', el: <CompressPdf /> },
  { id: 'pdf2img', name: 'PDF → PNG', desc: 'Render every page to a PNG at up to 3x resolution.', group: 'PDF', el: <PdfToImages /> },
  { id: 'img2pdf', name: 'Images → PDF', desc: 'Pack JPG/PNG/WebP images into a single PDF.', group: 'PDF', el: <ImagesToPdf /> },
  { id: 'pdfmeta', name: 'PDF Metadata', desc: 'Inspect, edit, or completely scrub PDF metadata.', group: 'Privacy', el: <PdfMetadata /> },
  { id: 'exif', name: 'EXIF Inspector', desc: 'See the GPS, camera and timestamp data in photos.', group: 'Privacy', el: <ExifViewer /> },
  { id: 'scrub', name: 'Photo Scrubber', desc: 'Remove all metadata by full pixel re-encode.', group: 'Privacy', el: <ImageScrubber /> },
  { id: 'docx2html', name: 'DOCX → HTML', desc: 'Convert Word documents to clean, styled HTML.', group: 'Convert', el: <DocxToHtml /> },
  { id: 'md2pdf', name: 'Text / MD → PDF', desc: 'Typeset plain text or Markdown into a tidy PDF.', group: 'Convert', el: <TextMdToPdf /> },
  { id: 'imgconv', name: 'Image Converter', desc: 'Batch convert between PNG, JPEG and WebP.', group: 'Convert', el: <ImageConvert /> },
]

const GROUPS = ['PDF', 'Privacy', 'Convert']

export default function Workspace() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = TOOLS.find((t) => t.id === activeId)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="rule-b flex items-stretch">
        <button onClick={() => setActiveId(null)} className="rule-r px-5 py-4 flex items-center gap-2 hover:bg-[#ff4d00]/15 transition-colors">
          <span className="w-3 h-3 bg-[#ff4d00] inline-block" />
          <span className="font-mono2 font-bold tracking-[0.2em] text-sm">STAGIC DOCS</span>
        </button>
        <div className="flex-1 flex items-center px-5">
          <span className="micro-label opacity-50">
            {TOOLS.length} tools · 100% client-side · no uploads · no tracking
          </span>
        </div>
        <div className="rule-l px-5 hidden md:flex items-center">
          <span className="micro-label opacity-50">PDF · WORD · IMAGES</span>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-56 md:w-64 shrink-0 rule-r flex flex-col">
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="micro-label px-4 pt-5 pb-2 opacity-40">{g}</p>
              {TOOLS.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm border-l-4 transition-colors ${
                    activeId === t.id
                      ? 'border-[#ff4d00] bg-[#16130e] text-[#f4f1ea] font-medium'
                      : 'border-transparent hover:bg-black/5'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          ))}
          <div className="mt-auto rule-t px-4 py-4">
            <p className="font-mono2 text-[10px] leading-relaxed opacity-50">
              Files are processed in your browser and never leave this device.
            </p>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 min-w-0">
          {active ? (
            <div>
              <div className="rule-b px-6 md:px-10 py-6">
                <p className="micro-label text-[#ff4d00] mb-1">{active.group}</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{active.name}</h1>
                <p className="text-sm opacity-60 mt-1">{active.desc}</p>
              </div>
              <div className="px-6 md:px-10 py-8 max-w-3xl">{active.el}</div>
            </div>
          ) : (
            <div className="px-6 md:px-10 py-10 max-w-4xl">
              <p className="micro-label text-[#ff4d00] mb-3">Stagic · Document Toolkit</p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[0.95] mb-4">
                Every document chore.
                <br />
                Zero uploads.
              </h1>
              <p className="text-base md:text-lg opacity-70 max-w-xl leading-relaxed mb-10">
                Merge, split, compress and convert PDFs. Scrub hidden metadata from documents and
                photos. Move between Word, HTML, Markdown, PDF and image formats — entirely in your
                browser.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#16130e] rule">
                {TOOLS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className="bg-[#f4f1ea] text-left p-5 hover:bg-[#16130e] hover:text-[#f4f1ea] transition-colors group"
                  >
                    <div className="flex items-baseline justify-between mb-6">
                      <span className="font-mono2 tnum text-xs opacity-40">{String(i + 1).padStart(2, '0')}</span>
                      <span className="micro-label text-[#ff4d00]">{t.group}</span>
                    </div>
                    <p className="font-bold mb-1">{t.name}</p>
                    <p className="text-xs opacity-60 leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>
              <p className="font-mono2 text-xs opacity-50 mt-6 tnum">
                ▸ Powered by open-source libraries: pdf-lib · PDF.js · Mammoth · piexifjs
              </p>
            </div>
          )}
        </main>
      </div>

      <footer className="rule-t px-5 py-3 flex items-center justify-between">
        <span className="micro-label opacity-50">© {new Date().getFullYear()} Stagic</span>
        <span className="micro-label opacity-50">Open tools, built on open source</span>
      </footer>
    </div>
  )
}
