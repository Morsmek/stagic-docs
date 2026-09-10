# Stagic Docs

Every document chore. Zero uploads.

A client-side document toolkit inspired by [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) — but rebuilt as a pure browser app so there is **no server to run, no file ever leaves the device, and hosting is free on Cloudflare Pages**.

## Tools (12)

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

React 19 · TypeScript · Vite · Tailwind CSS, on open-source libraries:
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

Two options:

**A. Git integration (recommended)**
1. In the Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Select this repository
3. Build settings: Framework preset `Vite` (or: build command `npm run build`, output directory `dist`)
4. Deploy — every push to `main` auto-deploys

**B. Wrangler CLI**
```bash
npm run build
npx wrangler pages deploy dist --project-name stagic-docs
```

## Why client-side?

Stirling-PDF is a Java/Spring server — powerful, but it needs a JVM host. This project covers the most-used document operations with browser-native libraries, which means:

- Privacy by architecture (files never leave the device)
- No server costs, no scaling concerns
- Free global hosting on any static CDN

## License

MIT for the Stagic Docs code. The bundled open-source libraries carry their own licenses (MIT/Apache-2.0). Note: Stirling-PDF itself is GPL — this project shares no code with it, it is a clean-room re-implementation of the same idea for the browser.
