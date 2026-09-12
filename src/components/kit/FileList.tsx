import { ChevronDown, ChevronUp, File, X } from "lucide-react";
import { formatBytes } from "@/lib/download";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FileList({
  files,
  onRemove,
  onMove,
}: {
  files: File[];
  onRemove?: (i: number) => void;
  onMove?: (i: number, dir: -1 | 1) => void;
}) {
  if (!files.length) return null;
  const reorderable = Boolean(onMove) && files.length > 1;

  return (
    <ul className="overflow-hidden rounded-[22px] bg-card shadow-[var(--shadow-card)]">
      {files.map((f, i) => (
        <li
          key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5",
            i > 0 && "border-t border-border/70",
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-fill text-foreground">
            <File className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium text-foreground">
              {f.name}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatBytes(f.size)}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            {reorderable && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  disabled={i === 0}
                  onClick={() => onMove?.(i, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  disabled={i === files.length - 1}
                  onClick={() => onMove?.(i, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </>
            )}
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${f.name}`}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
