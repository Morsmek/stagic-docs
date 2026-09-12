import { useState } from "react";
import { toast } from "sonner";
import { DropZone } from "@/components/kit/DropZone";
import { Field } from "@/components/kit/Field";
import { FileList } from "@/components/kit/FileList";
import { RunBar } from "@/components/kit/RunBar";
import { StatusNote } from "@/components/kit/StatusNote";
import { useIncomingFiles } from "@/components/kit/ToolFrame";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { baseName, bytesToBlob, downloadBlob, formatBytes } from "@/lib/download";
import { mergePdfs, rotatePdf, splitPdf } from "@/lib/pdf";
import { compressPdf, pdfToImages } from "@/lib/pdfRender";
import { imagesToPdf } from "@/lib/pdf";
import { TOOLS } from "@/lib/tools";

function moveFile(files: File[], i: number, dir: -1 | 1): File[] {
  const j = i + dir;
  if (j < 0 || j >= files.length) return files;
  const next = [...files];
  const a = next[i];
  const b = next[j];
  if (!a || !b) return files;
  next[i] = b;
  next[j] = a;
  return next;
}

export function MergePdf() {
  const tool = TOOLS[0]!;
  const [files, setFiles] = useState<File[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => setFiles((p) => [...p, ...incoming]));

  const run = async () => {
    setBusy(true);
    setLog([]);
    try {
      const out = await mergePdfs(files);
      downloadBlob(bytesToBlob(out, "application/pdf"), "merged.pdf");
      setLog([`Merged ${files.length} files · ${formatBytes(out.length)}`]);
      toast.success("Merged PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        multiple
        hint={tool.hint}
        onFiles={(f) => setFiles((p) => [...p, ...f])}
      />
      <FileList
        files={files}
        onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))}
        onMove={(i, dir) => setFiles((p) => moveFile(p, i, dir))}
      />
      <RunBar
        onClick={run}
        disabled={files.length < 2}
        busy={busy}
        label="Merge into one PDF"
      />
      <StatusNote log={log} />
    </>
  );
}

export function SplitPdf() {
  const tool = TOOLS[1]!;
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const out = await splitPdf(file, ranges);
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-pages.pdf`,
      );
      setLog([`Extracted pages [${ranges}] · ${formatBytes(out.length)}`]);
      toast.success("Pages extracted");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <Field label="Pages to extract">
        <Input
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          placeholder="1-3, 5, 8-"
        />
      </Field>
      <RunBar
        onClick={run}
        disabled={!file || !ranges.trim()}
        busy={busy}
        label="Extract pages"
      />
      <StatusNote log={log} />
    </>
  );
}

export function RotatePdf() {
  const tool = TOOLS[2]!;
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [ranges, setRanges] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const out = await rotatePdf(file, angle, ranges);
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-rotated.pdf`,
      );
      setLog([`Rotated ${ranges.trim() || "all pages"} by ${angle}°`]);
      toast.success("Rotated PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <Field label="Rotation">
        <Segmented
          value={angle}
          onChange={setAngle}
          options={[
            { value: 90, label: "90°" },
            { value: 180, label: "180°" },
            { value: 270, label: "270°" },
          ]}
        />
      </Field>
      <Field label="Pages (leave blank for all)">
        <Input
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          placeholder="all pages"
        />
      </Field>
      <RunBar onClick={run} disabled={!file} busy={busy} label="Rotate and save" />
      <StatusNote log={log} />
    </>
  );
}

export function CompressPdf() {
  const tool = TOOLS[3]!;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.6);
  const [scale, setScale] = useState(1.5);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog(["Rendering pages…"]);
    try {
      const out = await compressPdf(file, quality, scale, (d, t) =>
        setLog([`Rendering page ${d} of ${t}…`]),
      );
      const pct = ((1 - out.length / file.size) * 100).toFixed(0);
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-compressed.pdf`,
      );
      setLog([
        `${formatBytes(file.size)} → ${formatBytes(out.length)} (${Number(pct) >= 0 ? `${pct}% smaller` : "already lean"})`,
        "Pages become images — text is no longer selectable.",
      ]);
      toast.success("Compressed PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  return (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Each page is re-rendered as JPEG. Dramatic savings on scans; text-heavy
        PDFs may grow or lose selectable text.
      </p>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <div className="grid gap-6 rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <Slider
          label="JPEG quality"
          display={`${Math.round(quality * 100)}%`}
          value={quality}
          min={0.4}
          max={0.9}
          step={0.05}
          onValueChange={setQuality}
        />
        <Slider
          label="Resolution"
          display={`${scale}×`}
          value={scale}
          min={1}
          max={2}
          step={0.25}
          onValueChange={setScale}
        />
      </div>
      <RunBar onClick={run} disabled={!file} busy={busy} label="Compress PDF" />
      <StatusNote log={log} />
    </>
  );
}

export function PdfToImages() {
  const tool = TOOLS[4]!;
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => setFile(incoming[0] ?? null));

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const pages = await pdfToImages(file, scale, (d, t) =>
        setLog([`Rendering page ${d} of ${t}…`]),
      );
      if (pages.length === 1 && pages[0]) {
        downloadBlob(pages[0].blob, `${baseName(file.name)}-p1.png`);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        pages.forEach((p) =>
          zip.file(
            `${baseName(file.name)}-p${String(p.page).padStart(3, "0")}.png`,
            p.blob,
          ),
        );
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, `${baseName(file.name)}-pages.zip`);
      }
      setLog([`Rendered ${pages.length} page${pages.length === 1 ? "" : "s"} at ${scale}×`]);
      toast.success("PNG export saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => setFile(f[0] ?? null)}
      />
      <FileList files={file ? [file] : []} onRemove={() => setFile(null)} />
      <div className="rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)]">
        <Slider
          label="Resolution"
          display={`${scale}×`}
          value={scale}
          min={1}
          max={3}
          step={0.5}
          onValueChange={setScale}
        />
      </div>
      <RunBar onClick={run} disabled={!file} busy={busy} label="Render to PNG" />
      <StatusNote log={log} />
    </>
  );
}

export function ImagesToPdf() {
  const tool = TOOLS[5]!;
  const [files, setFiles] = useState<File[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => setFiles((p) => [...p, ...incoming]));

  const run = async () => {
    setBusy(true);
    setLog([]);
    try {
      const out = await imagesToPdf(files);
      downloadBlob(bytesToBlob(out, "application/pdf"), "images.pdf");
      setLog([`Packed ${files.length} images · ${formatBytes(out.length)}`]);
      toast.success("PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  return (
    <>
      <DropZone
        accept={tool.accept}
        multiple
        hint={tool.hint}
        onFiles={(f) => setFiles((p) => [...p, ...f])}
      />
      <FileList
        files={files}
        onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))}
        onMove={(i, dir) => setFiles((p) => moveFile(p, i, dir))}
      />
      <RunBar
        onClick={run}
        disabled={!files.length}
        busy={busy}
        label="Build PDF from images"
      />
      <StatusNote log={log} />
    </>
  );
}
