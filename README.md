# Documender

Every document chore. Zero uploads.

A privacy-first, on-device document toolkit — merge, split, compress, convert, and scrub metadata entirely in your browser. Nothing is uploaded. A part of [Stagic](https://stagic.pl).

## Tools

**PDF**
- Merge PDF — combine multiple PDFs in order
- Split / Extract — pull page ranges (`1-3, 5, 8-`)
- Rotate Pages — 90/180/270°, all or selected pages
- Compress PDF — raster compression with quality/resolution sliders
- PDF → PNG — render pages at up to 3x, bundled as ZIP
- Images → PDF — pack images into a single PDF

**Privacy**
- PDF Metadata — view, edit, or fully scrub (incl. XMP stream)
- EXIF Inspector — see GPS/camera/timestamp data in JPEGs
- Photo Scrubber — strip all metadata via pixel re-encode

**Convert**
- DOCX → HTML — clean, styled HTML with preview
- Text / Markdown → PDF — lightweight typesetting
- Image Converter — PNG / JPEG / WebP batch conversion

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4, on open-source libraries:
[pdf-lib](https://github.com/Hopding/pdf-lib), [PDF.js](https://github.com/mozilla/pdf.js), [Mammoth](https://github.com/mwilliamson/mammoth.js), [piexifjs](https://github.com/hMatoba/piexifjs), [JSZip](https://github.com/Stuk/jszip).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs static site to dist/
```

## Deploy to Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Select this repository
3. Build command `npm run build`, output directory `dist`
4. Deploy — every push to `main` auto-deploys

## Why client-side?

Files never leave the device. No server costs, no accounts, free hosting on any static CDN.

## License

MIT for the Documender code. Bundled open-source libraries carry their own licenses (MIT/Apache-2.0).
