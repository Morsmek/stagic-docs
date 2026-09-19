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
import { Textarea } from "@/components/ui/textarea";
import { convertImage } from "@/lib/images";
import { textToPdf } from "@/lib/pdf";
import { baseName, bytesToBlob, downloadBlob, formatBytes } from "@/lib/download";
import { TOOLS } from "@/lib/tools";

export function DocxToHtml() {
  const tool = TOOLS[9]!;
  const [file, setFile] = useState<File | null>(null);
  const [html, setHtml] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, (incoming) => {
    setFile(incoming[0] ?? null);
    setHtml("");
  });

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    try {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.convertToHtml({
        arrayBuffer: await file.arrayBuffer(),
      });
      const doc = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${baseName(file.name)}</title>
<style>body{font-family:ui-serif,Georgia,serif;max-width:720px;margin:3rem auto;padding:0 1rem;line-height:1.6;color:#1d1d1f}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #d2d2d7;padding:.3rem .6rem}</style>
</head>
<body>
${result.value}
</body>
</html>`;
      setHtml(result.value);
      downloadBlob(new Blob([doc], { type: "text/html" }), `${baseName(file.name)}.html`);
      const warnings = result.messages.filter((m) => m.type === "warning").length;
      setLog([
        `Converted to HTML${warnings ? ` · ${warnings} formatting warnings` : ""}`,
      ]);
      toast.success("HTML saved");
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
          setFile(f[0] ?? null);
          setHtml("");
        }}
      />
      <FileList
        files={file ? [file] : []}
        onRemove={() => {
          setFile(null);
          setHtml("");
        }}
      />
      <RunBar onClick={run} disabled={!file} busy={busy} label="Convert to HTML" />
      {html && (
        <div className="max-h-80 overflow-auto rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-subtle">
            Preview
          </p>
          <div
            className="prose-preview text-[15px] leading-relaxed text-foreground [&_img]:max-w-full [&_p]:mb-3 [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
      <StatusNote log={log} />
    </>
  );
}

export function TextMdToPdf() {
  const tool = TOOLS[10]!;
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useIncomingFiles(tool.match, async (incoming) => {
    const f = incoming[0];
    if (!f) return;
    setText(await f.text());
    setTitle(baseName(f.name));
  });

  const run = async () => {
    setBusy(true);
    setLog([]);
    try {
      const out = await textToPdf(text, title || "Document");
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${title || "document"}.pdf`,
      );
      setLog([`Typeset · ${formatBytes(out.length)}`]);
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
        hint={tool.hint}
        onFiles={async (f) => {
          if (!f[0]) return;
          setText(await f[0].text());
          setTitle(baseName(f[0].name));
        }}
      />
      <Field label="Document title">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
        />
      </Field>
      <Field label="Content — # headings and **bold** are typeset">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={"# Report title\n\nWrite or paste text here…"}
        />
      </Field>
      <RunBar
        onClick={run}
        disabled={!text.trim()}
        busy={busy}
        label="Typeset as PDF"
      />
      <StatusNote log={log} />
    </>
  );
}

const TARGETS = [
  { value: "image/png" as const, label: "PNG", ext: "png" },
  { value: "image/jpeg" as const, label: "JPEG", ext: "jpg" },
  { value: "image/webp" as const, label: "WebP", ext: "webp" },
];

export function ImageConvert() {
  const tool = TOOLS[11]!;
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<(typeof TARGETS)[number]["value"]>(
    "image/webp",
  );
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
    const ext = TARGETS.find((t) => t.value === target)!.ext;
    const done: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i]!;
      try {
        const blob = await convertImage(f, target);
        downloadBlob(blob, `${baseName(f.name)}.${ext}`);
        done.push(`${f.name}: ${formatBytes(f.size)} → ${formatBytes(blob.size)}`);
      } catch (e) {
        done.push(`Error: ${f.name} — ${(e as Error).message}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setLog(done);
    toast.success("Converted images saved");
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
      <Field label="Target format">
        <Segmented
          value={target}
          onChange={setTarget}
          options={TARGETS.map((t) => ({ value: t.value, label: t.label }))}
        />
      </Field>
      {progress && <ProgressNote {...progress} label="Converting images" />}
      <RunBar
        onClick={run}
        disabled={!files.length}
        busy={busy}
        label="Convert images"
      />
      <StatusNote log={log} />
    </>
  );
}
