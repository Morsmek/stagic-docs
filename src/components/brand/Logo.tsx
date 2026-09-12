import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[19px] font-semibold tracking-[-0.045em] text-foreground sm:text-[21px]",
        className,
      )}
    >
      Documender
    </span>
  );
}
