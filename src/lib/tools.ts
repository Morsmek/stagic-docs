import type { LucideIcon } from "lucide-react";
import {
  Layers,
  Scissors,
  RotateCw,
  Minimize2,
  Image as ImageIcon,
  Images,
  FileText,
  Camera,
  Eraser,
  FileCode2,
  Type,
  RefreshCw,
  LayoutGrid,
  Stamp,
  Hash,
  Files,
  AlignLeft,
  Scaling,
} from "lucide-react";

export type ToolGroup = "PDF" | "Privacy" | "Convert";

export interface ToolDef {
  id: string;
  name: string;
  desc: string;
  group: ToolGroup;
  hint: string;
  accept: string;
  multiple: boolean;
  icon: LucideIcon;
  tags: string[];
  match: (file: File) => boolean;
}

const isPdf = (f: File) =>
  f.type === "application/pdf" || /\.pdf$/i.test(f.name);

const isImage = (f: File) =>
  f.type.startsWith("image/") ||
  /\.(png|jpe?g|webp|gif|bmp|tif{1,2})$/i.test(f.name);

const isJpeg = (f: File) =>
  f.type === "image/jpeg" ||
  f.type === "image/jpg" ||
  /\.jpe?g$/i.test(f.name);

const isDocx = (f: File) =>
  f.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
  /\.docx$/i.test(f.name);

const isText = (f: File) =>
  f.type.startsWith("text/") || /\.(txt|md|markdown)$/i.test(f.name);

export const TOOLS: ToolDef[] = [
  {
    id: "merge",
    name: "Merge PDF",
    desc: "Combine several PDFs into one file, in the order you choose.",
    group: "PDF",
    hint: "Drop PDFs — order is preserved",
    accept: "application/pdf,.pdf",
    multiple: true,
    icon: Layers,
    tags: ["combine", "join", "append", "concatenate"],
    match: isPdf,
  },
  {
    id: "split",
    name: "Split / Extract",
    desc: "Pull out page ranges like 1–3, 5, 8– from a single PDF.",
    group: "PDF",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: Scissors,
    tags: ["extract", "pages", "range", "cut"],
    match: isPdf,
  },
  {
    id: "rotate",
    name: "Rotate Pages",
    desc: "Turn all or selected pages by 90, 180, or 270 degrees.",
    group: "PDF",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: RotateCw,
    tags: ["turn", "orientation", "landscape", "portrait"],
    match: isPdf,
  },
  {
    id: "compress",
    name: "Compress PDF",
    desc: "Raster compression for scans and image-heavy documents.",
    group: "PDF",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: Minimize2,
    tags: ["shrink", "smaller", "optimize", "size"],
    match: isPdf,
  },
  {
    id: "pdf2img",
    name: "PDF to PNG",
    desc: "Render every page as a PNG, up to 3× resolution.",
    group: "PDF",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: ImageIcon,
    tags: ["render", "image", "export", "screenshot"],
    match: isPdf,
  },
  {
    id: "img2pdf",
    name: "Images to PDF",
    desc: "Pack JPG, PNG, or WebP images into a single PDF.",
    group: "PDF",
    hint: "Drop images — one page each",
    accept: "image/*,.png,.jpg,.jpeg,.webp",
    multiple: true,
    icon: Images,
    tags: ["photos", "scans", "combine", "album"],
    match: isImage,
  },
  {
    id: "pdfmeta",
    name: "PDF Metadata",
    desc: "Inspect, edit, or fully scrub titles, authors, and XMP.",
    group: "Privacy",
    hint: "Drop one PDF to inspect",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: FileText,
    tags: ["exif", "author", "title", "clean", "privacy"],
    match: isPdf,
  },
  {
    id: "exif",
    name: "EXIF Inspector",
    desc: "See GPS, camera, and timestamp data embedded in photos.",
    group: "Privacy",
    hint: "Drop a photo",
    accept: "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: false,
    icon: Camera,
    tags: ["gps", "location", "camera", "photo", "metadata"],
    match: isJpeg,
  },
  {
    id: "scrub",
    name: "Photo Scrubber",
    desc: "Strip all metadata by re-encoding the pixels into a new file.",
    group: "Privacy",
    hint: "Drop photos to scrub",
    accept: "image/*,.png,.jpg,.jpeg,.webp",
    multiple: true,
    icon: Eraser,
    tags: ["gps", "remove", "privacy", "clean", "anonymize"],
    match: isImage,
  },
  {
    id: "docx2html",
    name: "DOCX to HTML",
    desc: "Turn Word documents into clean, styled HTML you can save.",
    group: "Convert",
    hint: "Drop a .docx file",
    accept:
      ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: false,
    icon: FileCode2,
    tags: ["word", "web", "markup", "export"],
    match: isDocx,
  },
  {
    id: "md2pdf",
    name: "Text to PDF",
    desc: "Typeset plain text or Markdown into a tidy, printable PDF.",
    group: "Convert",
    hint: "Drop a .txt or .md file — or paste below",
    accept: ".txt,.md,text/plain,text/markdown",
    multiple: false,
    icon: Type,
    tags: ["markdown", "txt", "typeset", "write", "document"],
    match: isText,
  },
  {
    id: "imgconv",
    name: "Image Converter",
    desc: "Batch convert between PNG, JPEG, and WebP.",
    group: "Convert",
    hint: "Drop images to convert",
    accept: "image/*,.png,.jpg,.jpeg,.webp",
    multiple: true,
    icon: RefreshCw,
    tags: ["png", "jpeg", "webp", "format", "batch"],
    match: isImage,
  },
  {
    id: "organize",
    name: "Organize Pages",
    desc: "Reorder, rotate, duplicate, and delete pages with live thumbnails.",
    group: "PDF",
    hint: "Drop one PDF to organize",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: LayoutGrid,
    tags: ["reorder", "sort", "delete", "duplicate", "pages", "arrange"],
    match: isPdf,
  },
  {
    id: "watermark",
    name: "Watermark",
    desc: "Stamp text across a page — single, diagonal, or tiled.",
    group: "PDF",
    hint: "Drop one PDF to watermark",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: Stamp,
    tags: ["stamp", "brand", "draft", "confidential", "overlay"],
    match: isPdf,
  },
  {
    id: "pagenums",
    name: "Page Numbers",
    desc: "Add page numbers with your choice of position and format.",
    group: "PDF",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: Hash,
    tags: ["numbering", "footer", "header", "pagination"],
    match: isPdf,
  },
  {
    id: "burst",
    name: "Split Every Page",
    desc: "Explode a PDF into one file per page, bundled as a ZIP.",
    group: "PDF",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: Files,
    tags: ["burst", "explode", "separate", "individual", "zip"],
    match: isPdf,
  },
  {
    id: "pdf2txt",
    name: "PDF to Text",
    desc: "Extract selectable text from every page, copy or save as .txt.",
    group: "Convert",
    hint: "Drop one PDF",
    accept: "application/pdf,.pdf",
    multiple: false,
    icon: AlignLeft,
    tags: ["extract", "copy", "text", "ocr", "content"],
    match: isPdf,
  },
  {
    id: "imgsize",
    name: "Image Resizer",
    desc: "Resize and compress images to fit a maximum width and height.",
    group: "Convert",
    hint: "Drop images to resize",
    accept: "image/*,.png,.jpg,.jpeg,.webp",
    multiple: true,
    icon: Scaling,
    tags: ["resize", "scale", "shrink", "compress", "dimensions"],
    match: isImage,
  },
];

export const GROUPS: ToolGroup[] = ["PDF", "Privacy", "Convert"];

export const GROUP_BLURBS: Record<ToolGroup, string> = {
  PDF: "Assemble, reshape, and shrink documents.",
  Privacy: "See and strip the data hiding in your files.",
  Convert: "Move between formats without leaving the browser.",
};

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsForFiles(files: File[]): ToolDef[] {
  if (!files.length) return [];
  const all = TOOLS.filter((t) => files.every(t.match));
  if (all.length) return all;
  return TOOLS.filter((t) => files.some(t.match));
}

export function searchTools(query: string): ToolDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.group.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)),
  );
}
