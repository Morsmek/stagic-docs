import { Link, useParams } from "react-router";
import { ToolFrame } from "@/components/kit/ToolFrame";
import { Button } from "@/components/ui/button";
import { getTool } from "@/lib/tools";
import { RenderTool } from "@/tools/render-tool";

export function ToolPage() {
  const { toolId } = useParams();
  const tool = getTool(toolId ?? "");

  if (!tool) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Tool not found
        </h1>
        <p className="mt-2 text-[17px] text-muted-foreground">
          That tool isn’t in the kit.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Back to tools</Link>
        </Button>
      </div>
    );
  }

  return (
    <ToolFrame tool={tool}>
      <RenderTool tool={tool} />
    </ToolFrame>
  );
}
