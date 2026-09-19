import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  GripVertical,
  RotateCcw,
  RotateCw,
  Trash2,
  Undo2,
} from "lucide-react";
import { DropZone } from "@/components/kit/DropZone";
import { RunBar } from "@/components/kit/RunBar";
import { StatusNote } from "@/components/kit/StatusNote";
import { ProgressNote } from "@/components/kit/ProgressNote";
import { useIncomingFiles } from "@/components/kit/ToolFrame";
import { Button } from "@/components/ui/button";
import { baseName, bytesToBlob, downloadBlob, formatBytes } from "@/lib/download";
import { organizePdf, type OrganizeItem } from "@/lib/pdfEdit";
import { pdfToImages, type RenderedPage } from "@/lib/pdfRender";
import { getTool } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface Item extends OrganizeItem {
  id: string;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function Thumb({ blob, rotation }: { blob?: Blob; rotation: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  return (
    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[12px] bg-fill">
      {url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          className={cn(
            "max-h-full max-w-full object-contain transition-transform duration-200",
            (rotation === 90 || rotation === 270) && "scale-[0.72]",
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      ) : (
        <div className="size-6 animate-pulse rounded-full bg-border" />
      )}
    </div>
  );
}

export function OrganizePdf() {
  const tool = getTool("organize")!;
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<RenderedPage[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const load = async (f: File) => {
    setFile(f);
    setItems([]);
    setThumbs([]);
    setLog([]);
    setProgress({ done: 0, total: 0 });
    try {
      const pages = await pdfToImages(f, 0.35, (done, total) =>
        setProgress({ done, total }),
      );
      setThumbs(pages);
      setItems(pages.map((p) => ({ id: newId(), srcIndex: p.page - 1, rotation: 0 })));
      setLog([`Loaded ${pages.length} page${pages.length === 1 ? "" : "s"}`]);
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setProgress(null);
  };

  useIncomingFiles(tool.match, (incoming) => {
    if (incoming[0]) void load(incoming[0]);
  });

  const reset = () =>
    setItems((prev) =>
      prev
        .slice()
        .sort((a, b) => a.srcIndex - b.srcIndex)
        .map((it) => ({ ...it, rotation: 0 })),
    );

  const rotate = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, rotation: (((it.rotation + delta) % 360) + 360) % 360 }
          : it,
      ),
    );

  const remove = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const duplicate = (id: string) =>
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === id);
      if (i < 0) return prev;
      const copy = { ...prev[i]!, id: newId() };
      return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
    });

  const reorder = (from: number, to: number) =>
    setItems((prev) => {
      if (from === to || from < 0 || to < 0) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setLog([]);
    setProgress({ done: 0, total: items.length });
    try {
      const out = await organizePdf(
        file,
        items.map((it) => ({ srcIndex: it.srcIndex, rotation: it.rotation })),
        (done, total) => setProgress({ done, total }),
      );
      downloadBlob(
        bytesToBlob(out, "application/pdf"),
        `${baseName(file.name)}-organized.pdf`,
      );
      setLog([
        `Saved ${items.length} page${items.length === 1 ? "" : "s"} · ${formatBytes(out.length)}`,
      ]);
      toast.success("Organized PDF saved");
    } catch (e) {
      setLog([`Error: ${(e as Error).message}`]);
    }
    setBusy(false);
    setProgress(null);
  };

  return (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Drag pages to reorder, rotate or duplicate them, or remove pages you no
        longer need. Source pages stay untouched.
      </p>
      <DropZone
        accept={tool.accept}
        hint={tool.hint}
        onFiles={(f) => {
          if (f[0]) void load(f[0]);
        }}
      />
      {file && (
        <p className="text-sm tabular-nums text-muted-foreground">
          {file.name} · {formatBytes(file.size)} · {items.length} pages
        </p>
      )}
      {thumbs.length > 0 && items.length === 0 && (
        <div className="rounded-[18px] bg-fill px-4 py-6 text-center text-sm text-muted-foreground">
          Every page removed. Add the file again or reset.
        </div>
      )}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) reorder(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "group rounded-[18px] bg-card p-2.5 shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-150",
                dragIndex === i && "opacity-50",
                overIndex === i && dragIndex !== null && dragIndex !== i
                  ? "shadow-[inset_0_0_0_2px_var(--color-primary)]"
                  : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
              )}
            >
              <Thumb blob={thumbs[item.srcIndex]?.blob} rotation={item.rotation} />
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
                  <GripVertical
                    className="size-3.5 cursor-grab text-subtle"
                    aria-hidden="true"
                  />
                  {i + 1}
                  <span className="text-subtle">
                    · p{item.srcIndex + 1}
                  </span>
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground"
                    onClick={() => rotate(item.id, -90)}
                    aria-label="Rotate left"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground"
                    onClick={() => rotate(item.id, 90)}
                    aria-label="Rotate right"
                  >
                    <RotateCw className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground"
                    onClick={() => duplicate(item.id)}
                    aria-label="Duplicate page"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(item.id)}
                    aria-label="Remove page"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {progress && <ProgressNote {...progress} label="Rendering pages" />}
      <RunBar
        onClick={run}
        disabled={!file || items.length === 0}
        busy={busy}
        label="Save organized PDF"
        secondary={{
          label: "Reset changes",
          onClick: reset,
        }}
      />
      <StatusNote log={log} />
      {file && (
        <p className="flex items-center gap-2 text-xs text-subtle">
          <Undo2 className="size-3.5" /> Reset restores the original page order and
          rotation.
        </p>
      )}
    </>
  );
}
