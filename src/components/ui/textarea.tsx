import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full resize-y rounded-[18px] bg-fill px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-subtle outline-none transition-[box-shadow,background-color] duration-150",
        "focus-visible:bg-card focus-visible:shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}
