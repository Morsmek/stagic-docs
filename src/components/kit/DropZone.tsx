import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function DropZone({
  accept,
  multiple,
  onFiles,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint: string;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      className={cn(
        "relative rounded-[22px] transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-out-smooth)]",
        over
          ? "bg-primary-soft shadow-[inset_0_0_0_2px_var(--color-primary)] scale-[1.01]"
          : "bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label={hint}
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="pointer-events-none flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl transition-colors duration-150",
            over ? "bg-primary text-primary-foreground" : "bg-fill text-foreground",
          )}
        >
          <Upload className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[17px] font-medium tracking-tight text-foreground">
            {hint}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop {multiple ? "files" : "a file"} or click to browse. Processed on
            this device.
          </p>
        </div>
      </div>
    </div>
  );
}
