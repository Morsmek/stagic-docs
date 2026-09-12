import { cn } from "@/lib/utils";
import { documender_dark, documender_light } from "@/brand";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={documender_light}
        alt="Documender"
        className="h-7 w-auto sm:h-8 dark:hidden"
      />
      <img
        src={documender_dark}
        alt=""
        className="hidden h-7 w-auto sm:h-8 dark:block"
      />
    </span>
  );
}
