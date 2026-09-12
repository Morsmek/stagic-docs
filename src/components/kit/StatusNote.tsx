import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusNote({ log }: { log: string[] }) {
  if (!log.length) return null;
  const isError = log.some((l) => /^error/i.test(l));
  return (
    <div
      className={cn(
        "rounded-[18px] px-4 py-3 text-sm leading-relaxed",
        isError
          ? "bg-destructive/10 text-destructive"
          : "bg-success/10 text-success",
      )}
      role="status"
    >
      <div className="flex gap-2.5">
        {isError ? (
          <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
        ) : (
          <Check className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
        )}
        <ul className="space-y-1">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
