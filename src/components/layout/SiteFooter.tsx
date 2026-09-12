import { stagic_dark, stagic_light } from "@/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 px-5 pt-8 pb-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="text-sm text-subtle">
          Documender processes files on this device. Nothing is uploaded.
        </p>
        <a
          href="https://stagic.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2.5 text-sm text-muted-foreground transition-opacity duration-150 hover:opacity-80"
        >
          <span>A part of</span>
          <img
            src={stagic_light}
            alt="Stagic"
            className="h-6 w-auto dark:hidden"
          />
          <img
            src={stagic_dark}
            alt=""
            className="hidden h-6 w-auto dark:block"
          />
        </a>
      </div>
    </footer>
  );
}
