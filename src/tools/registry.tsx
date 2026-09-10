import { MergePdf, SplitPdf, RotatePdf } from '@/tools/pdfBasics'
import { CompressPdf, PdfToImages, ImagesToPdf } from '@/tools/pdfMedia'
import { PdfMetadata, ExifViewer, ImageScrubber } from '@/tools/metadata'
import { DocxToHtml, TextMdToPdf, ImageConvert } from '@/tools/convert'

export interface Tool {
  id: string
  name: string
  cmd: string
  desc: string
  group: string
  el: React.ReactNode
}

export const TOOLS: Tool[] = [
  { id: 'merge', name: 'Merge PDF', cmd: 'merge', desc: 'Combine multiple PDFs into one file, in order.', group: 'PDF', el: <MergePdf /> },
  { id: 'split', name: 'Split / Extract', cmd: 'split', desc: 'Pull out page ranges: 1-3, 5, 8- and so on.', group: 'PDF', el: <SplitPdf /> },
  { id: 'rotate', name: 'Rotate Pages', cmd: 'rotate', desc: 'Rotate all or selected pages by 90/180/270°.', group: 'PDF', el: <RotatePdf /> },
  { id: 'compress', name: 'Compress PDF', cmd: 'compress', desc: 'Raster compression for scanned, image-heavy files.', group: 'PDF', el: <CompressPdf /> },
  { id: 'pdf2img', name: 'PDF → PNG', cmd: 'pdf2png', desc: 'Render every page to a PNG at up to 3x resolution.', group: 'PDF', el: <PdfToImages /> },
  { id: 'img2pdf', name: 'Images → PDF', cmd: 'img2pdf', desc: 'Pack JPG/PNG/WebP images into a single PDF.', group: 'PDF', el: <ImagesToPdf /> },
  { id: 'pdfmeta', name: 'PDF Metadata', cmd: 'pdf-meta', desc: 'Inspect, edit, or completely scrub PDF metadata.', group: 'Privacy', el: <PdfMetadata /> },
  { id: 'exif', name: 'EXIF Inspector', cmd: 'exif', desc: 'See the GPS, camera and timestamp data in photos.', group: 'Privacy', el: <ExifViewer /> },
  { id: 'scrub', name: 'Photo Scrubber', cmd: 'scrub', desc: 'Remove all metadata by full pixel re-encode.', group: 'Privacy', el: <ImageScrubber /> },
  { id: 'docx2html', name: 'DOCX → HTML', cmd: 'docx2html', desc: 'Convert Word documents to clean, styled HTML.', group: 'Convert', el: <DocxToHtml /> },
  { id: 'md2pdf', name: 'Text / MD → PDF', cmd: 'md2pdf', desc: 'Typeset plain text or Markdown into a tidy PDF.', group: 'Convert', el: <TextMdToPdf /> },
  { id: 'imgconv', name: 'Image Converter', cmd: 'imgconv', desc: 'Batch convert between PNG, JPEG and WebP.', group: 'Convert', el: <ImageConvert /> },
]

export const GROUPS = ['PDF', 'Privacy', 'Convert']
export type ThemeId = 'console' | 'press' | 'studio'
export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'console', label: '01 Console' },
  { id: 'press', label: '02 Press' },
  { id: 'studio', label: '03 Studio' },
]
