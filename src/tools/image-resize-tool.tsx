import { useState } from "react";
import { toast } from "sonner";
import { DropZone } from "@/components/kit/DropZone";
import { Field } from "@/components/kit/Field";
import { FileList } from "@/components/kit/FileList";
import { ProgressNote } from "@/components/kit/ProgressNote";
import { RunBar } from "@/components/kit/RunBar";
import { StatusNote } from "@/components/kit/StatusNote";
import { useIncomingFiles } from "@/components/kit/ToolFrame";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { baseName, downloadBlob, formatBytes } from "@/lib/download";
import { resizeImage, type ResizeOptions } from "@/lib/images";
import { getTool } from "@/lib/tools";

const FORMATS: { value: ResizeOptions["format"]; label: string }[] = [
  { value: "keep", label: "Keep" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
];

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ImageResizer() {
  const tool = getTool("imgsize")!;
  const [files, setFiles] = useState<File[]>([]);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1920);
  const [quality, setQuality] = useState(0.82);
  const [format, setFormat] = useState<ResizeOptions["format"]>("keep");
  const [noUpscale, setNoUpscale] = useState(true);
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
        const out = await resizeImage(f, {
          maxWidth,
          maxHeight,
          format,
          quality,
          noUpscale,
        });
        const ext = EXT[out.type] ?? "png";
        downloadBlob(out.blob, `${baseName(f.name)}-${out.width}x${out.height}.${ext}`);
        done.push(
          `${f.name}: ${formatBytes(f.size)} → ${formatBytes(out.blob.size)} (${out.width}×${out.height})`,
        );
      } catch (e) {
        done.push(`Error: ${f.name} — ${(e as Error).message}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setLog(done);
    toast.success("Resized images saved");
    setBusy(false);
    setProgress(null);
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
      />
      <div className="grid gap-6 rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <Field label="Max width (px)">
          <Input
            type="number"
            min={16}
            value={maxWidth}
            onChange={(e) => setMaxWidth(Math.max(16, Number(e.target.value) || 16))}
          />
        </Field>
        <Field label="Max height (px)">
          <Input
            type="number"
            min={16}
            value={maxHeight}
            onChange={(e) =>
              setMaxHeight(Math.max(16, Number(e.target.value) || 16))
            }
          />
        </Field>
        <Slider
          label="Quality"
          display={`${Math.round(quality * 100)}%`}
          value={quality}
          min={0.3}
          max={1}
          step={0.02}
          onValueChange={setQuality}
        />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={noUpscale}
              onChange={(e) => setNoUpscale(e.target.checked)}
              className="size-4 accent-[var(--color-primary)]"
            />
            Never enlarge small images
          </label>
        </div>
      </div>
      <Field label="Output format">
        <Segmented
          value={format}
          onChange={setFormat}
          options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
        />
      </Field>
      {progress && <ProgressNote {...progress} label="Resizing images" />}
      <RunBar
        onClick={run}
        disabled={!files.length}
        busy={busy}
        label="Resize images"
      />
      <StatusNote log={log} />
    </>
  );
}
