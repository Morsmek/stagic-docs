import { useState } from "react";
import { toast } from "sonner";
import { DropZone } from "@/components/kit/DropZone";
import { FileList } from "@/components/kit/FileList";
import { ProgressNote } from "@/components/kit/ProgressNote";
import { RunBar } from "@/components/kit/RunBar";
import { StatusNote } from "@/components/kit/StatusNote";
import { useIncomingFiles } from "@/components/kit/ToolFrame";
import { Input } from "@/components/ui/input";
import { baseName, bytesToBlob, downloadBlob, formatBytes } from "@/lib/download";
import { readExif, scrubImage, type ExifEntry } from "@/lib/images";
import {
  readPdfMeta,
  scrubPdfMeta,
  writePdfMeta,
  type PdfMeta,
} from "@/lib/pdf";
import { TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";

const META_KEYS: { key: keyof PdfMeta; label: string; editable: boolean }[] = [
  { key: "title", label: "Title", editable: true },
  { key: "author", label: "Author", editable: true },
  { key: "subject", label: "Subject", editable: true },
  { key: "keywords", label: "Keywords", editable: true },
  { key: "creator", label: "Creator", editable: true },
  { key: "producer", label: "Producer", editable: true },
  { key: "creationDate", label: "Created", editable: false },
  { key: "modificationDate", label: "Modified", editable: false },
];

export function PdfMetadata() {
  const tool = TOOLS[6]!;
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMeta | null>(null);
  const [pages, setPages] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async (f: File) => {
    setFile(f);
    setLog([]);
    try {
      const { meta: m, pageCount } = await readPdfMeta(f);
      setMeta(m);
      setPages(pageCount);
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
  };

  useIncomingFiles(tool.match, (incoming) => {
    if (incoming[0]) void load(incoming[0]);
  });

  const save = async () => {
    if (!file || !meta) return;
    setBusy(true);
    try {
      const out = await writePdfMeta(file, meta);
      downloadBlob(bytesToBlob(out, "application/pdf"), `${baseName(file.name)}-meta.pdf`);
      setLog(["Metadata updated and saved"]);
      toast.success("Metadata saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
  };

  const scrub = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const out = await scrubPdfMeta(file);
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-clean.pdf`,
      );
      setLog(["All metadata fields cleared and XMP stream removed"]);
      toast.success("Metadata scrubbed");
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
        onFiles={(f) => {
          if (f[0]) void load(f[0]);
        }}
      />
      {file && (
        <p className="text-sm tabular-nums text-muted-foreground">
          {file.name} · {formatBytes(file.size)} · {pages} pages
        </p>
      )}
      {meta && (
        <div className="overflow-hidden rounded-[22px] bg-card shadow-[var(--shadow-card)]">
          {META_KEYS.map(({ key, label, editable }, i) => (
            <div
              key={key}
              className={cn(
                "grid grid-cols-1 items-center gap-1 px-4 py-2.5 sm:grid-cols-[140px_1fr] sm:gap-3",
                i > 0 && "border-t border-border/70",
              )}
            >
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-subtle">
                {label}
              </span>
              {editable ? (
                <Input
                  className="h-10 bg-transparent px-0 shadow-none focus-visible:bg-transparent focus-visible:shadow-none sm:px-0"
                  value={meta[key]}
                  onChange={(e) => setMeta({ ...meta, [key]: e.target.value })}
                />
              ) : (
                <span className="py-2 text-sm tabular-nums text-muted-foreground">
                  {meta[key] || "—"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {meta && (
        <RunBar
          onClick={save}
          busy={busy}
          label="Save edited metadata"
          secondary={{
            label: "Scrub all metadata",
            onClick: scrub,
            destructive: true,
          }}
        />
      )}
      <StatusNote log={log} />
    </>
  );
}

export function ExifViewer() {
  const tool = TOOLS[7]!;
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ExifEntry[] | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const load = async (f: File) => {
    setFile(f);
    setLog([]);
    const e = await readExif(f);
    setEntries(e);
    if (f.type !== "image/jpeg" && f.type !== "image/jpg" && !/\.jpe?g$/i.test(f.name)) {
      setLog(["EXIF tags live on JPEG files. PNG and WebP rarely carry them."]);
    } else if (!e.length) {
      setLog(["No EXIF metadata found in this file."]);
    }
  };

  useIncomingFiles(tool.match, (incoming) => {
    if (incoming[0]) void load(incoming[0]);
  });

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
          {file.name} · {formatBytes(file.size)} · {file.type || "image"}
        </p>
      )}
      {entries && entries.length > 0 && (
        <div className="max-h-96 overflow-auto rounded-[22px] bg-card shadow-[var(--shadow-card)]">
          {entries.map((e, i) => (
            <div
              key={`${e.tag}-${i}`}
              className={cn(
                "grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[220px_1fr]",
                i > 0 && "border-t border-border/70",
              )}
            >
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">
                {e.tag}
              </span>
              <span className="break-all text-sm text-foreground">{e.value}</span>
            </div>
          ))}
        </div>
      )}
      <StatusNote log={log} />
    </>
  );
}

export function ImageScrubber() {
  const tool = TOOLS[8]!;
  const [files, setFiles] = useState<File[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  useIncomingFiles(tool.match, (incoming) => setFiles((p) => [...p, ...incoming]));

  const run = async () => {
    setBusy(true);
    setLog([]);
    setProgress({ done: 0, total: files.length });
    const done: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i]!;
      try {
        const blob = await scrubImage(f);
        const ext =
          blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
        downloadBlob(blob, `${baseName(f.name)}-clean.${ext}`);
        done.push(`${f.name}: ${formatBytes(f.size)} → ${formatBytes(blob.size)}`);
      } catch (e) {
        done.push(`Error: ${f.name} — ${(e as Error).message}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setLog(done.concat(["GPS, camera, and timestamps removed by pixel re-encode."]));
    toast.success("Clean photos saved");
    setBusy(false);
    setProgress(null);
  };

  return (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Photos often embed GPS coordinates, camera serials, and timestamps. This
        re-encodes the pixels into a fresh file with none of that.
      </p>
      <DropZone
        accept={tool.accept}
        multiple
        hint={tool.hint}
        onFiles={(f) => setFiles((p) => [...p, ...f])}
      />
      <FileList
        files={files}
        onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))}
      />
      {progress && <ProgressNote {...progress} label="Scrubbing photos" />}
      <RunBar
        onClick={run}
        disabled={!files.length}
        busy={busy}
        label="Remove all metadata"
      />
      <StatusNote log={log} />
    </>
  );
}
