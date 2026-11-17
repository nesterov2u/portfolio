# Project Context

Last verified against the local working tree: **2026-11-17**. Runtime files, content JSON, CMS schema, and deployment workflow are the source of truth; this date does not confirm the live deployment.

Short operational context for the next maintainer, editor, or AI agent.

## Project Type

- Static bilingual portfolio
- Hosted on GitHub Pages
- Edited through Pages CMS
- Same GitHub account is expected to remain in use

## Repository

- repo: `nesterov2u/portfolio`
- main branch: `main`
- site: `https://nesterov2u.github.io/portfolio/`
- CMS shortcut: `https://nesterov2u.github.io/portfolio/admin/`

## Core Runtime Files

- `index.html`
- `404.html`
- `app.js`
- `tailwind.css`
- `styles.css`
- `.pages.yml`
- `.github/workflows/deploy-pages.yml`

## Main Content Files

- `content/globals/site.json`
- `content/globals/navigation.json`
- `content/globals/ui.json`
- `content/pages/home.json`
- `content/collections/categories.json`
- `content/collections/cases.json`

## Critical Invariants

- read `PROJECT_NOTES.md` first
- `category.key` is the stable relation key
- `case.category` must reference `category.key`
- `.pages.yml` is part of the CMS contract
- media lives in `assets/`
- Pages CMS may upload replacement media as new filenames instead of overwriting old ones

## Routing

- homepage: `/portfolio/`
- current case route: `/portfolio/?case=<slug>&lang=<ru|en>` (GitHub Pages); locally `/?case=<slug>&lang=<ru|en>`
- legacy `/cases/:slug` routes still work through `404.html`

## Language

- supported languages: `ru`, `en`
- language is controlled by `?lang=ru` and `?lang=en`

## Favicon

- source of truth: `content/globals/site.json` -> `favicon`
- deploy workflow injects the current favicon into both `index.html` and `404.html`

## Deployment

- workflow: `.github/workflows/deploy-pages.yml`
- publishes a static `_site` artifact to GitHub Pages
- includes `tailwind.css` and `styles.css`; there is no CSS build step in deploy
- if the latest deploy run is green, older cancelled runs are usually not a problem

## Recent Frontend Layout Decisions

- Case hero cover image uses `.case-cover-frame` in `styles.css` and should stay `16 / 9`.
- Case hero layout aligns media to the top with `lg:items-start`, so long case text must not push the cover down.
- Case gallery/internal images use `.case-gallery-frame` and should stay square, `1 / 1`.
- Case pages use `.case-page-main` for explicit top/bottom page padding; this protects mobile spacing near the sticky header.
- The back link on case pages uses `.case-back-link` for stable spacing before the category/title block.
- Case gallery sections use `.case-gallery-section`; mobile top padding is intentionally larger than desktop to keep internal images from touching the main case block.
- Homepage portfolio cards intentionally do not render case descriptions; descriptions remain available on the case detail page.
- CMS-authored multiline text uses `.cms-text { white-space: pre-wrap; }` so line breaks and blank lines entered in Pages CMS are preserved on the site.
- Focus section uses `bg-ink` (currently `#111111`) without a separate blue glow. Cards use `.focus-glass-card` with dark translucent backgrounds, blur, light pill labels, and light body text.
- Proof-point cards use `px-5 py-4`; icons have circular bordered `h-16 w-16` containers with `bg-panel`, followed by `mb-5` (`20px`).
- Header/site name inherits Manrope with `font-semibold`; Unbounded is used by `font-display` elsewhere.
- `hover:bg-accentSoft` in static `tailwind.css` is intentionally softened to 30% opacity for hover states while normal accent badges can remain fully saturated.

## Local Setup

- no npm/pnpm/yarn/pip dependencies are required
- Tailwind was used earlier, but runtime CSS is now committed statically for lighter loading
- useful checks: `node --check app.js`, static server/browser smoke test

## Git Safety

- fetch `origin/main` before commits
- CMS may push directly to `main`
- do not use `git add .`
- stage exact files only

## Known Local Noise

- untracked `_site/`
- untracked duplicate media files in `assets/` caused by filename normalization on macOS
- temporary screenshots
- root-level verification PNGs and `favicon/` source files are ignored locally
- mode-only Git churn after transfer should be handled with local `git config core.filemode false`

## Recommended Reading Order

1. `PROJECT_NOTES.md`
2. `context.md`
3. `agent.md`
4. `codex.md`
5. `README.md`

## Verified Runtime Details

- Current hero: `content/pages/home.json` → `hero.visual` → `assets/Hero-1.svg`.
- Current favicon: `content/globals/site.json` → `favicon` → `assets/favicon-an2.svg`.
- Both HTML entry points refresh favicon links from `site.json` with `cache: "no-store"` and a timestamp query, in addition to deploy-time hash injection.
- See `PROJECT_NOTES.md` for the verified content inventory, exact spacing, and current runtime limitations. Re-read JSON before changing media; these paths are a dated snapshot.
