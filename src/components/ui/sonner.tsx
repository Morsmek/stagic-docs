import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "font-sans !bg-card !text-foreground !border-border !rounded-2xl !shadow-[var(--shadow-float)]",
          title: "!text-foreground !font-medium",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}
