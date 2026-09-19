import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { DropZone } from "@/components/kit/DropZone";
import { Field } from "@/components/kit/Field";
import { FileList } from "@/components/kit/FileList";
import { ProgressNote } from "@/components/kit/ProgressNote";
import { RunBar } from "@/components/kit/RunBar";
import { StatusNote } from "@/components/kit/StatusNote";
import { useIncomingFiles } from "@/components/kit/ToolFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { baseName, bytesToBlob, downloadBlob, formatBytes } from "@/lib/download";
import { burstPdf, numberPdf, watermarkPdf } from "@/lib/pdfEdit";
import type { PageNumberPosition } from "@/lib/pdfEdit";
import { extractPdfText, type TextPage } from "@/lib/pdfRender";
import { getTool } from "@/lib/tools";
import { cn } from "@/lib/utils";

const COLORS = [
  { value: "gray", label: "Gray", rgb: { r: 0.45, g: 0.45, b: 0.48 } },
  { value: "black", label: "Black", rgb: { r: 0.1, g: 0.1, b: 0.12 } },
  { value: "red", label: "Red", rgb: { r: 0.86, g: 0.15, b: 0.15 } },
  { value: "blue", label: "Blue", rgb: { r: 0.0, g: 0.44, b: 0.89 } },
] as const;

type ColorKey = (typeof COLORS)[number]["value"];

export function WatermarkPdf() {
  const tool = getTool("watermark")!;
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.14);
  const [rotation, setRotation] = useState(45);
  const [layout, setLayout] = useState<"single" | "tile">("single");
  const [color, setColor] = useState<ColorKey>("gray");
  const [ranges, setRanges] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const rgb = COLORS.find((c) => c.value === color)!.rgb;
      const out = await watermarkPdf(
        file,
        {
          text,
          fontSize,
          opacity,
          rotation,
          layout,
          color: rgb,
          ranges,
        },
        (done, total) => setProgress({ done, total }),
      );
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-watermarked.pdf`,
      );
      setLog([`Watermark applied · ${formatBytes(out.length)}`]);
      toast.success("Watermarked PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
    setProgress(null);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <Field label="Watermark text">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="CONFIDENTIAL"
        />
      </Field>
      <div className="grid gap-6 rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <Slider
          label="Size"
          display={`${fontSize} pt`}
          value={fontSize}
          min={18}
          max={120}
          step={2}
          onValueChange={setFontSize}
        />
        <Slider
          label="Opacity"
          display={`${Math.round(opacity * 100)}%`}
          value={opacity}
          min={0.04}
          max={0.6}
          step={0.02}
          onValueChange={setOpacity}
        />
        <Slider
          label="Rotation"
          display={`${rotation}°`}
          value={rotation}
          min={0}
          max={90}
          step={5}
          onValueChange={setRotation}
        />
        <div>
          <span className="mb-3 block text-sm font-medium text-muted-foreground">
            Layout
          </span>
          <Segmented
            value={layout}
            onChange={setLayout}
            options={[
              { value: "single", label: "Single" },
              { value: "tile", label: "Tiled" },
            ]}
          />
        </div>
      </div>
      <Field label="Color">
        <Segmented
          value={color}
          onChange={setColor}
          options={COLORS.map((c) => ({ value: c.value, label: c.label }))}
        />
      </Field>
      <Field label="Pages (leave blank for all)">
        <Input
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          placeholder="all pages"
        />
      </Field>
      <RunBar
        onClick={run}
        disabled={!file || !text.trim()}
        busy={busy}
        label="Apply watermark"
      />
      {progress && <ProgressNote {...progress} label="Stamping pages" />}
      <StatusNote log={log} />
    </>
  );
}

const POSITIONS: { value: PageNumberPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

export function PageNumbersPdf() {
  const tool = getTool("pagenums")!;
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [format, setFormat] = useState<"n" | "n-of-total" | "page-n">("n");
  const [startAt, setStartAt] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [margin, setMargin] = useState(30);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const out = await numberPdf(
        file,
        { position, format, startAt, fontSize, margin },
        (done, total) => setProgress({ done, total }),
      );
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-numbered.pdf`,
      );
      setLog([`Page numbers added · ${formatBytes(out.length)}`]);
      toast.success("Numbered PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
    setProgress(null);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <Field label="Position">
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPosition(p.value)}
              className={cn(
                "h-11 rounded-[14px] text-sm font-medium transition-colors duration-150",
                position === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-fill text-foreground hover:bg-fill-hover",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Format">
        <Segmented
          value={format}
          onChange={setFormat}
          options={[
            { value: "n", label: "1" },
            { value: "n-of-total", label: "1 / 12" },
            { value: "page-n", label: "Page 1" },
          ]}
        />
      </Field>
      <div className="grid gap-6 rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-3">
        <div>
          <span className="mb-3 block text-sm font-medium text-muted-foreground">
            Start at
          </span>
          <Input
            type="number"
            min={1}
            value={startAt}
            onChange={(e) => setStartAt(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <Slider
          label="Size"
          display={`${fontSize} pt`}
          value={fontSize}
          min={8}
          max={24}
          step={1}
          onValueChange={setFontSize}
        />
        <Slider
          label="Margin"
          display={`${margin} pt`}
          value={margin}
          min={12}
          max={72}
          step={2}
          onValueChange={setMargin}
        />
      </div>
      <RunBar
        onClick={run}
        disabled={!file}
        busy={busy}
        label="Add page numbers"
      />
      {progress && <ProgressNote {...progress} label="Numbering pages" />}
      <StatusNote log={log} />
    </>
  );
}

export function PdfToText() {
  const tool = getTool("pdf2txt")!;
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<TextPage[]>([]);
  const [pageBreaks, setPageBreaks] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const load = async (f: File) => {
    setFile(f);
    setPages([]);
    setLog([]);
    setBusy(true);
    try {
      const out = await extractPdfText(f, (done, total) =>
        setProgress({ done, total }),
      );
      setPages(out);
      const chars = out.reduce((n, p) => n + p.text.length, 0);
      setLog(
        chars > 0
          ? [`Extracted ${chars.toLocaleString()} characters from ${out.length} pages`]
          : ["No selectable text found — this may be a scanned PDF."],
      );
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
    setProgress(null);
  };

  useIncomingFiles(tool.match, (incoming) => {
    if (incoming[0]) void load(incoming[0]);
  });

  const text = pages
    .map((p) => (pageBreaks ? `----- Page ${p.page} -----\n${p.text}` : p.text))
    .join("\n\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const download = () => {
    if (!file) return;
    downloadBlob(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
      `${baseName(file.name)}.txt`,
    );
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => {
          if (f[0]) void load(f[0]);
        }}
      />
      {file && (
        <p className="text-sm tabular-nums text-muted-foreground">
          {file.name} · {formatBytes(file.size)}
        </p>
      )}
      {busy && !progress && (
        <div className="flex items-center gap-2 rounded-[18px] bg-card px-4 py-3 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
          <Spinner /> Reading document…
        </div>
      )}
      {progress && <ProgressNote {...progress} label="Reading text" />}
      {pages.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={pageBreaks}
                onChange={(e) => setPageBreaks(e.target.checked)}
                className="size-4 accent-[var(--color-primary)]"
              />
              Page separators
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={copy}>
                <Copy className="size-3.5" /> Copy
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={download}>
                <Download className="size-3.5" /> .txt
              </Button>
            </div>
          </div>
          <div className="max-h-96 overflow-auto rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)]">
            <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-foreground">
              {text || "—"}
            </pre>
          </div>
        </>
      )}
      <StatusNote log={log} />
    </>
  );
}

export function BurstPdf() {
  const tool = getTool("burst")!;
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const pages = await burstPdf(file, (done, total) =>
        setProgress({ done, total }),
      );
      const base = baseName(file.name);
      if (pages.length === 1 && pages[0]) {
        downloadBlob(
          bytesToBlob(pages[0].bytes, "application/pdf"),
          `${base}-p1.pdf`,
        );
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        pages.forEach((p) =>
          zip.file(`${base}-p${String(p.page).padStart(3, "0")}.pdf`, p.bytes),
        );
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, `${base}-pages.zip`);
      }
      setLog([`Split into ${pages.length} single-page file${pages.length === 1 ? "" : "s"}`]);
      toast.success("Split pages saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
    setProgress(null);
  };

  return (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Each page becomes its own PDF. Handy for sharing or archiving one page at
        a time.
      </p>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      {progress && <ProgressNote {...progress} label="Splitting pages" />}
      <RunBar
        onClick={run}
        disabled={!file}
        busy={busy}
        label="Split into single pages"
      />
      <StatusNote log={log} />
    </>
  );
}
