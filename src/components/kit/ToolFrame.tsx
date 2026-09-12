import { useEffect } from "react";
import type { ToolDef } from "@/lib/tools";
import { useWorkspace } from "@/lib/workspace";

export function useIncomingFiles(
  match: (f: File) => boolean,
  apply: (files: File[]) => void,
) {
  const takeFiles = useWorkspace((s) => s.takeFiles);
  useEffect(() => {
    const incoming = takeFiles(match);
    if (incoming.length) apply(incoming);
    // consume once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function ToolFrame({
  tool,
  children,
}: {
  tool: ToolDef;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-12 pt-6 sm:pt-10">
      <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-subtle">
        {tool.group}
      </p>
      <h1 className="mt-2 text-[32px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[40px]">
        {tool.name}
      </h1>
      <p className="mt-3 max-w-prose text-[17px] leading-relaxed text-muted-foreground">
        {tool.desc}
      </p>
      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}
