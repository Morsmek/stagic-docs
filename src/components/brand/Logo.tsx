import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/brand/documender-light.png"
        alt="Documender"
        className="h-7 w-auto sm:h-8 dark:hidden"
      />
      <img
        src="/brand/documender-dark.png"
        alt=""
        className="hidden h-7 w-auto sm:h-8 dark:block"
      />
    </span>
  );
}
