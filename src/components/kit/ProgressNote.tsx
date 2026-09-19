import { Progress } from "@/components/ui/progress";

export function ProgressNote({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label?: string;
}) {
  if (!total) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="rounded-[18px] bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label ?? "Working"}</span>
        <span className="tabular-nums text-muted-foreground">
          {done} / {total} · {pct}%
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
