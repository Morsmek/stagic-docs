declare module "piexifjs" {
  const piexif: {
    load: (dataUrl: string) => Record<string, Record<string, unknown>>;
    TAGS?: Record<string, Record<string, { name?: string }>>;
  };
  export default piexif;
}
