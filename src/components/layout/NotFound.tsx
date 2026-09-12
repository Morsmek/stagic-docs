import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-subtle">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        This page doesn’t exist
      </h1>
      <p className="mt-2 text-[17px] text-muted-foreground">
        The tool or page you’re looking for isn’t here.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Back to tools</Link>
      </Button>
    </div>
  );
}
