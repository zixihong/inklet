# Changelog

All notable changes to inklet are documented here. The format roughly follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] — 2026-04-09

### Fixed

- README screenshots now load correctly on npmjs.com. The previous release referenced images via GitHub's `user-attachments` CDN, which requires an authenticated github.com session and returns 404 to anonymous fetchers. Images are now committed to `docs/` and served via `raw.githubusercontent.com`, which works on both github.com and npmjs.com.

## [0.1.1] — 2026-04-09

### Changed

- Reframed the README around interactivity as the core value proposition (rather than color)
- Added two demo screenshots to the README — the rendered React output with a hover effect, and the visual editor with painted regions
- Tightened the `package.json` description to match the new framing: *"Turn images into interactive ASCII art"*
- Documented a Vite JSON-import gotcha for users with large `ascii-config.json` files

> ⚠️ The screenshots in this version's README do not render on npmjs.com due to a hotlinking issue with GitHub's user-attachments CDN. Use `0.1.2` or later instead.

## [0.1.0] — 2026-04-09

### Initial public release

- **CLI** (`npx inklet <image>`) for converting PNG / JPG / WebP images to colored ASCII art
- **Visual region editor** that opens automatically in the browser, with:
  - Live image controls — toggle background removal, tone inversion, and color mode without re-running the CLI
  - Six monospace fonts (JetBrains Mono, Fira Code, IBM Plex Mono, Roboto Mono, Inconsolata, Courier Prime)
  - Brush-based region painting with auto-fill on closed outlines
  - Pastel UI, P/E tool toggle, Ctrl+scroll brush sizing, undo
- **React component** (`inklet/react`) — `<AsciiImage>` with per-region hover effects, click handlers, and per-character callbacks
- **Library API** for programmatic use — `generateAscii`, `segmentRegions`, `buildRegionMap`, character ramp constants
- **Compact output format** — run-length encoded regions and a deduplicated color palette

[0.1.2]: https://github.com/zixihong/inklet/releases/tag/v0.1.2
[0.1.1]: https://github.com/zixihong/inklet/releases/tag/v0.1.1
[0.1.0]: https://github.com/zixihong/inklet/releases/tag/v0.1.0
