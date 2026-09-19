import { Link, useLocation } from "react-router";
import { ChevronLeft, Moon, Search, Sun } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { usePalette } from "@/lib/palette";
import { useTheme } from "@/lib/theme";

export function Nav() {
  const pathname = useLocation().pathname;
  const isTool = pathname.startsWith("/tools/");
  const { theme, toggle } = useTheme();
  const openPalette = usePalette((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[52px] sm:px-6">
        {isTool ? (
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-primary"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
            Tools
          </Link>
        ) : (
          <Link to="/" aria-label="Documender home">
            <Logo />
          </Link>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openPalette(true)}
            aria-label="Search tools"
            className="mr-1 inline-flex h-9 items-center gap-2 rounded-full bg-fill px-3 text-sm text-muted-foreground transition-colors duration-150 hover:bg-fill-hover hover:text-foreground"
          >
            <Search className="size-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded bg-background/70 px-1.5 py-0.5 text-[11px] font-medium sm:inline">
              ⌘K
            </kbd>
          </button>
          <span className="mr-1 hidden items-center rounded-full bg-fill px-3 py-1 text-xs font-medium text-muted-foreground lg:inline-flex">
            On this device
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="size-4" strokeWidth={1.75} />
            ) : (
              <Moon className="size-4" strokeWidth={1.75} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
