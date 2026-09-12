import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight,
  Lock,
  Search,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GROUPS, searchTools, toolsForFiles, type ToolDef } from "@/lib/tools";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/download";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const setFiles = useWorkspace((s) => s.setFiles);
  const pending = useWorkspace((s) => s.files);
  const navigate = useNavigate();

  const tools = useMemo(() => searchTools(query), [query]);
  const suggestions = useMemo(() => toolsForFiles(pending), [pending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth += 1;
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) setFiles(files);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
    };
  }, [setFiles]);

  const openTool = useCallback(
    (id: string) => {
      navigate(`/tools/${id}`);
    },
    [navigate],
  );

  return (
    <div className="relative mx-auto max-w-6xl px-5 pb-10 sm:px-8">
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-overlay">
          <div className="rounded-[28px] bg-card px-10 py-8 text-center shadow-[var(--shadow-float)]">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              Drop to begin
            </p>
            <p className="mt-1 text-muted-foreground">
              Files stay on this device.
            </p>
          </div>
        </div>
      )}

      <section className="pt-12 text-center sm:pt-20">
        <p className="rise-in text-[13px] font-medium uppercase tracking-[0.16em] text-subtle">
          Document toolkit
        </p>
        <h1 className="rise-in rise-in-1 mx-auto mt-4 max-w-3xl text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[64px]">
          Every document chore.
          <br />
          Zero uploads.
        </h1>
        <p className="rise-in rise-in-2 mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
          Merge, split, compress, convert, and scrub metadata entirely in your
          browser. Nothing is sent to a server.
        </p>

        <div className="rise-in rise-in-3 relative mx-auto mt-8 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools"
            aria-label="Search tools"
            className="h-12 w-full rounded-full bg-card pl-11 pr-16 text-[15px] text-foreground shadow-[var(--shadow-card)] outline-none placeholder:text-subtle focus-visible:shadow-[var(--shadow-card-hover)]"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-fill px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline">
            Cmd+K
          </kbd>
        </div>
      </section>

      {pending.length > 0 && (
        <section className="mx-auto mt-10 max-w-2xl rounded-[28px] bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[17px] font-semibold tracking-tight text-foreground">
                {pending.length} {pending.length === 1 ? "file" : "files"} ready
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {pending
                  .slice(0, 3)
                  .map((f) => f.name)
                  .join(", ")}
                {pending.length > 3 ? ` +${pending.length - 3}` : ""}
                {" · "}
                {formatBytes(pending.reduce((n, f) => n + f.size, 0))}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => useWorkspace.getState().clear()}
            >
              Clear
            </Button>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openTool(t.id)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-fill px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-fill-hover"
                >
                  <t.icon className="size-3.5" strokeWidth={1.75} />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="rise-in rise-in-4 mt-14 space-y-12">
        {GROUPS.map((group) => {
          const items = tools.filter((t) => t.group === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <h2 className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-subtle">
                {group}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
        {tools.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            No tools match that search.
          </p>
        )}
      </div>

      <section className="mt-20 grid gap-4 sm:grid-cols-3">
        <PrivacyPoint
          icon={Lock}
          title="On this device"
          body="Every file is processed in your browser. Nothing is uploaded, stored, or logged."
        />
        <PrivacyPoint
          icon={Shield}
          title="Metadata, gone"
          body="Scrub PDF info and photo EXIF including GPS, camera serials, and timestamps."
        />
        <PrivacyPoint
          icon={Smartphone}
          title="No account"
          body="Open the page, drop a file, download the result. That is the whole product."
        />
      </section>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  return (
    <Link
      to={`/tools/${tool.id}`}
      className={cn(
        "group flex items-center gap-4 rounded-[22px] bg-card p-4 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-out-smooth)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        "sm:flex-col sm:items-start sm:p-5",
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-fill text-foreground transition-colors duration-150 group-hover:bg-primary-soft group-hover:text-primary sm:size-12">
        <Icon className="size-5" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
            {tool.name}
          </h3>
          <ChevronRight className="size-4 shrink-0 text-subtle sm:hidden" />
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
          {tool.desc}
        </p>
      </div>
    </Link>
  );
}

function PrivacyPoint({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Lock;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[22px] bg-card p-5 shadow-[var(--shadow-card)]">
      <span className="flex size-10 items-center justify-center rounded-[12px] bg-fill text-foreground">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[17px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
