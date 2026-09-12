import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({
  label,
  display,
  value,
  min,
  max,
  step,
  onValueChange,
  className,
}: {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (v: number) => void;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm tabular-nums text-foreground">{display}</span>
      </span>
      <SliderPrimitive.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onValueChange(v[0] ?? value)}
        className="relative flex h-7 w-full touch-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-fill">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-5 rounded-full bg-card shadow-[var(--shadow-thumb)] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </SliderPrimitive.Root>
    </label>
  );
}
