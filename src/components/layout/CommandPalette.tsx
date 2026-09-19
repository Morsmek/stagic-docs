import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Command,
  Eraser,
  Moon,
  Search,
  Star,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { searchTools, getTool, type ToolDef } from "@/lib/tools";
import { usePalette } from "@/lib/palette";
import { useRecents } from "@/lib/recent";
import { useTheme } from "@/lib/theme";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

interface Item {
  key: string;
  label: string;
  sub?: string;
  icon: LucideIcon;
  section: string;
  run: () => void;
}

export function CommandPalette() {
  const open = usePalette((s) => s.open);
  const setOpen = usePalette((s) => s.setOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const markUsed = useRecents((s) => s.markUsed);
  const recent = useRecents((s) => s.recent);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!usePalette.getState().open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim();
    const out: Item[] = [];
    const openTool = (tool: ToolDef) => () => {
      markUsed(tool.id);
      setOpen(false);
      navigate(`/tools/${tool.id}`);
    };

    if (!q && recent.length) {
      for (const id of recent) {
        const tool = getTool(id);
        if (!tool) continue;
        out.push({
          key: `recent-${id}`,
          label: tool.name,
          sub: tool.desc,
          icon: tool.icon,
          section: "Recent",
          run: openTool(tool),
        });
      }
    }

    const tools = searchTools(q);
    for (const tool of tools) {
      out.push({
        key: `tool-${tool.id}`,
        label: tool.name,
        sub: tool.desc,
        icon: tool.icon,
        section: tool.group,
        run: openTool(tool),
      });
    }

    const actions: Item[] = [
      {
        key: "action-theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        icon: theme === "dark" ? Sun : Moon,
        section: "Actions",
        run: () => {
          toggle();
          setOpen(false);
        },
      },
      {
        key: "action-clear",
        label: "Clear dropped files",
        icon: Eraser,
        section: "Actions",
        run: () => {
          useWorkspace.getState().clear();
          setOpen(false);
        },
      },
    ];
    const filteredActions = q
      ? actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()))
      : actions;
    out.push(...filteredActions);

    return out;
  }, [query, recent, theme, toggle, markUsed, navigate, setOpen]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const sections = [...new Set(items.map((i) => i.section))];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (items.length ? (a + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) =>
        items.length ? (a - 1 + items.length) % items.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[active]?.run();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-overlay px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-[24px] bg-card shadow-[var(--shadow-float)]"
      >
        <div className="flex items-center gap-3 border-b border-border/70 px-4">
          <Search className="size-4 shrink-0 text-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, actions…"
            aria-label="Search tools and actions"
            className="h-14 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-subtle"
          />
          <kbd className="hidden rounded-md bg-fill px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline">
            esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          className="max-h-[52vh] overflow-y-auto overscroll-contain p-2"
        >
          {items.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”.
            </li>
          )}
          {sections.map((section) => (
            <li key={section}>
              <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                {section}
              </p>
              <ul>
                {items.map((item, index) =>
                  item.section !== section ? null : (
                    <li key={item.key} data-index={index}>
                      <button
                        type="button"
                        onMouseMove={() => setActive(index)}
                        onClick={item.run}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors duration-100",
                          index === active
                            ? "bg-primary-soft text-foreground"
                            : "text-foreground hover:bg-fill",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-[11px]",
                            index === active
                              ? "bg-primary text-primary-foreground"
                              : "bg-fill text-foreground",
                          )}
                        >
                          <item.icon className="size-4" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">
                            {item.label}
                          </span>
                          {item.sub && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.sub}
                            </span>
                          )}
                        </span>
                        <ArrowRight
                          className={cn(
                            "size-4 shrink-0 transition-opacity",
                            index === active ? "opacity-60" : "opacity-0",
                          )}
                        />
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5 text-[11px] text-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Command className="size-3" /> K to toggle
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3" /> Favorites live on the home grid
          </span>
          <span>↑↓ navigate · ↵ open</span>
        </div>
      </div>
    </div>
  );
}
