import type { ToolDef } from "@/lib/tools";
import { ImageResizer } from "@/tools/image-resize-tool";
import { OrganizePdf } from "@/tools/organize-tool";
import {
  BurstPdf,
  PageNumbersPdf,
  PdfToText,
  WatermarkPdf,
} from "@/tools/pdf-extra-tools";
import {
  CompressPdf,
  ImagesToPdf,
  MergePdf,
  PdfToImages,
  RotatePdf,
  SplitPdf,
} from "@/tools/pdf-tools";
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
    case "organize":
      return <OrganizePdf />;
    case "watermark":
      return <WatermarkPdf />;
    case "pagenums":
      return <PageNumbersPdf />;
    case "burst":
      return <BurstPdf />;
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
    case "pdf2txt":
      return <PdfToText />;
    case "imgsize":
      return <ImageResizer />;
    default:
      return null;
  }
}
