import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function RunBar({
  onClick,
  disabled,
  busy,
  label,
  secondary,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  label: string;
  secondary?: { label: string; onClick: () => void; destructive?: boolean };
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", secondary && "sm:grid sm:grid-cols-2")}>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={onClick}
        disabled={disabled || busy}
      >
        {busy ? (
          <>
            <Spinner />
            Working
          </>
        ) : (
          label
        )}
      </Button>
      {secondary && (
        <Button
          type="button"
          size="lg"
          variant={secondary.destructive ? "destructive" : "secondary"}
          className="w-full"
          onClick={secondary.onClick}
          disabled={busy}
        >
          {secondary.label}
        </Button>
      )}
    </div>
  );
}
