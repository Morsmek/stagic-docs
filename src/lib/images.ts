export interface ExifEntry {
  tag: string;
  value: string;
}

interface Piexif {
  load: (dataUrl: string) => Record<string, Record<string, unknown>>;
  TAGS?: Record<string, Record<string, { name?: string }>>;
}

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export async function readExif(file: File): Promise<ExifEntry[]> {
  if (file.type !== "image/jpeg" && file.type !== "image/jpg") return [];
  const dataUrl = await dataUrlFromFile(file);
  try {
    const mod = await import("piexifjs");
    const piexif = (mod as unknown as { default?: Piexif; load: Piexif["load"]; TAGS?: Piexif["TAGS"] }).default ?? (mod as unknown as Piexif);
    const exif = piexif.load(dataUrl);
    const entries: ExifEntry[] = [];
    for (const ifd of ["0th", "Exif", "GPS", "Interop", "1st"] as const) {
      const section = exif[ifd] as Record<string, unknown> | undefined;
      if (!section) continue;
      const tags = (piexif.TAGS?.[ifd] ?? {}) as Record<
        string,
        { name?: string }
      >;
      for (const [tag, value] of Object.entries(section)) {
        const name = tags[tag]?.name ?? `Tag ${tag}`;
        let v: string;
        if (ifd === "GPS" && Array.isArray(value)) v = JSON.stringify(value);
        else if (Array.isArray(value)) v = value.join(", ");
        else v = String(value);
        if (v.length > 200) v = v.slice(0, 200) + "…";
        entries.push({ tag: `${ifd.toUpperCase()} · ${name}`, value: v });
      }
    }
    return entries;
  } catch {
    return [];
  }
}

export async function scrubImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const type =
    file.type === "image/png"
      ? "image/png"
      : file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg";
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Encode failed"))), type, 0.92),
  );
}

export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  format: "keep" | "image/png" | "image/jpeg" | "image/webp";
  quality: number;
  noUpscale: boolean;
}

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
  type: string;
}

export async function resizeImage(
  file: File,
  opts: ResizeOptions,
): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file);
  const fit = Math.min(
    opts.maxWidth / bitmap.width,
    opts.maxHeight / bitmap.height,
  );
  const scale = opts.noUpscale ? Math.min(fit, 1) : fit;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const type =
    opts.format === "keep"
      ? file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp"
        ? file.type
        : "image/png"
      : opts.format;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Encode failed"))),
      type,
      opts.quality,
    ),
  );
  return { blob, width, height, type };
}

export async function convertImage(
  file: File,
  target: "image/png" | "image/jpeg" | "image/webp",
  quality = 0.92,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  if (target === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Encode failed"))),
      target,
      quality,
    ),
  );
}
