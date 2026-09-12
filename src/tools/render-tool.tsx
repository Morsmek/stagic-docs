import type { ToolDef } from "@/lib/tools";
import { CompressPdf, ImagesToPdf, MergePdf, PdfToImages, RotatePdf, SplitPdf } from "@/tools/pdf-tools";
import { ExifViewer, ImageScrubber, PdfMetadata } from "@/tools/privacy-tools";
import { DocxToHtml, ImageConvert, TextMdToPdf } from "@/tools/convert-tools";

export function RenderTool({ tool }: { tool: ToolDef }) {
  switch (tool.id) {
    case "merge":
      return <MergePdf />;
    case "split":
      return <SplitPdf />;
    case "rotate":
      return <RotatePdf />;
    case "compress":
      return <CompressPdf />;
    case "pdf2img":
      return <PdfToImages />;
    case "img2pdf":
      return <ImagesToPdf />;
    case "pdfmeta":
      return <PdfMetadata />;
    case "exif":
      return <ExifViewer />;
    case "scrub":
      return <ImageScrubber />;
    case "docx2html":
      return <DocxToHtml />;
    case "md2pdf":
      return <TextMdToPdf />;
    case "imgconv":
      return <ImageConvert />;
    default:
      return null;
  }
}
