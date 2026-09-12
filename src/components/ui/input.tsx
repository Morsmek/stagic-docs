import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[14px] bg-fill px-4 text-[15px] text-foreground placeholder:text-subtle outline-none transition-[box-shadow,background-color] duration-150",
        "focus-visible:bg-card focus-visible:shadow-[var(--shadow-card)]",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
