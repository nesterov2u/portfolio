# Agent Guide

Last verified against the local working tree: **2026-11-17**. Runtime files, content JSON, CMS schema, and deployment workflow are the source of truth; this date does not confirm the live deployment.

This file is for the next developer or AI agent who will maintain this repository.

Read this together with `PROJECT_NOTES.md`. If there is a conflict, prefer the stricter operational rule that avoids CMS or deployment breakage.

## What This Project Is

- Static bilingual portfolio site
- Hosted on GitHub Pages
- Edited through Pages CMS
- No backend
- No build system for the app runtime

Primary repository context at the time of writing:
- repo: `nesterov2u/portfolio`
- site: `https://nesterov2u.github.io/portfolio/`
- admin shortcut: `https://nesterov2u.github.io/portfolio/admin/`

Expected handoff mode:
- same GitHub account;
- same repository;
- different maintainer, editor, or AI agent.

## Files That Matter Most

- `PROJECT_NOTES.md`
- `index.html`
- `404.html`
- `app.js`
- `tailwind.css`
- `styles.css`
- `.pages.yml`
- `.github/workflows/deploy-pages.yml`
- `content/globals/site.json`
- `content/pages/home.json`
- `content/collections/categories.json`
- `content/collections/cases.json`

## Non-Negotiable Invariants

### CMS and Content Shape

- Treat `.pages.yml` as production configuration, not just editor metadata.
- Do not change JSON shape casually.
- If you change content shape, update code and `.pages.yml` together.

### Category Linking

- `category.key` is the stable relation key.
- `case.category` must point to `category.key`.
- Do not rename `category.key` unless you migrate all references safely.

### Media Handling

- All media is in `assets/`.
- Pages CMS may upload a replacement as a new filename instead of overwriting the old one.
- Always verify which exact path is currently referenced before editing or replacing an asset.

### Git Hygiene

- Do not use `git add .`.
- The repo may contain untracked duplicate media files from macOS filename normalization.
- Stage only the files you intend to commit.

### Before Every Commit

- fetch `origin/main`;
- check whether CMS created new commits;
- rebase or fast-forward before pushing;
- do not overwrite CMS content blindly.

## Runtime Behavior Overview

### Frontend

`app.js` is the main runtime:
- loads content JSON;
- resolves localized text;
- renders homepage and case pages;
- handles query language switching;
- supports legacy case routing.

### HTML Entry Points

`index.html`
- main app shell for normal entry.

`404.html`
- required GitHub Pages fallback for legacy nested routes and SPA-style boot.

If one of these is updated without the other, route behavior can diverge.

## Routing Notes

Current canonical case route behavior is query-based:
- `/portfolio/?case=<slug>&lang=<ru|en>` (GitHub Pages); locally `/?case=<slug>&lang=<ru|en>`

Legacy route support still exists:
- `/cases/:slug`

Because GitHub Pages is static hosting, `404.html` is operationally critical. Never treat it as a decorative file.

## Favicon Notes

Favicon is controlled by:
- `content/globals/site.json`

Deployment workflow behavior:
- reads current favicon path;
- computes a hash from the asset;
- injects resolved favicon href and MIME type into `index.html` and `404.html`.

Practical rule:
- if favicon behavior breaks, inspect both the content value and deploy-time HTML injection;
- remember that nested case routes on GitHub Pages can expose relative-path issues.

## Pages CMS Notes

CMS config is in `.pages.yml`.

Important characteristics:
- media input/output both point to `assets/`;
- localized fields are represented with explicit `ru` / `en` fields;
- case category options are static in CMS config, so adding a category may require `.pages.yml` updates too.

If you change:
- category schema;
- labels;
- field names;
- collection structure;

verify Pages CMS still renders and saves correctly.

## Deployment Notes

Workflow:
- `.github/workflows/deploy-pages.yml`

What it copies into `_site`:
- `index.html`
- `404.html`
- `app.js`
- `tailwind.css`
- `styles.css`
- `assets/`
- `content/`
- optional `admin/`
- optional `CNAME`

Deployment sanity checks already exist. If a recent deploy is green, older cancelled runs are usually noise.

## Local Noise You Should Ignore Carefully

Common untracked files in this repo:
- `_site/`
- duplicate media files in `assets/`
- temporary screenshots
- root-level verification PNGs
- `favicon/` source files

These are not automatically safe to delete and not safe to commit by default.

If many tracked files appear modified only because of `100644` / `100755` mode changes after a machine transfer, set `git config core.filemode false` locally and do not commit the mode churn.

## CSS / Runtime Notes

- The project began with Tailwind, but production now avoids Tailwind CDN/runtime generation.
- `tailwind.css` is committed static utility CSS for faster loading and simpler GitHub Pages deployment.
- `styles.css` contains the custom visual system and project-specific styles.
- There is no package-manager dependency installation step for normal work.
- Do not add a required CSS build pipeline unless the user explicitly wants that tradeoff.

## Current Frontend Behavior Notes

### Case Detail Layout

- The case detail hero uses a two-column grid at large breakpoints.
- Keep the grid aligned to the top with `lg:items-start`; using bottom alignment makes the cover image slide down when the case summary is long.
- The main case cover is wrapped in `.case-cover-frame` and should keep a `16 / 9` aspect ratio.
- Gallery/internal case images are wrapped in `.case-gallery-frame` and should keep a `1 / 1` aspect ratio.
- Case detail pages use `.case-page-main` to enforce page-level vertical spacing independently of static Tailwind utilities.
- The case back button uses `.case-back-link`; keep it if adjusting spacing between the back button and category/title on mobile.
- Gallery sections use `.case-gallery-section`; mobile top padding is deliberately larger than desktop so the first internal image does not visually touch the main case block.
- Do not change these aspect-ratio classes through CMS data; they are presentation rules in `styles.css` and `app.js`.

### CMS Text Rendering

- Pages CMS text fields can contain line breaks and blank lines.
- Frontend output for multiline CMS text should use the `.cms-text` class.
- `.cms-text` is defined in `styles.css` with `white-space: pre-wrap` so CMS-authored line breaks are visible on the site.
- Avoid placing `.cms-text` content on a separate indented line inside template literals; otherwise template indentation can become visible whitespace.

### Homepage Portfolio Cards

- Homepage case cards intentionally hide case descriptions.
- Case descriptions/summaries still exist in `content/collections/cases.json` and still render on case detail pages.
- If descriptions are requested on the homepage again, restore them in `renderPortfolioCards` only; do not change the CMS schema.

### Focus Section

- The section uses `bg-ink`, currently `#111111`, without a separate blue glow.
- `.focus-glass-card` provides dark translucent cards, gradients, blur, and light text.
- Labels are rounded pills with `font-semibold`; body text uses `.cms-text` and `text-white/92`.
- `.focus-card-label` and `.focus-card-body` are not defined in the current runtime.

### Homepage Proof Cards

- Cards use `px-5 py-4`; hero padding is `px-6 md:px-10`.
- Icons have circular `h-16 w-16` containers with a border and `bg-panel`.
- Icon-to-text spacing is `mb-5` (`20px`).

### Header Typography

- Site name and role inherit Manrope from `font-body`; site name uses `font-semibold`.
- `font-display` maps to Unbounded and is used for display headings elsewhere.

### Accent Hover States

- The static `tailwind.css` utility `.hover\:bg-accentSoft:hover` is intentionally set to `rgb(var(--color-accent-soft) / 0.3)`.
- Do not change `bg-accentSoft` globally when only hover states should soften, because full-strength accent is still used for badges such as case years.

## When Updating Content-Driven Visuals

### Hero

- current source path is `content/pages/home.json` -> `hero.visual`
- patch the currently referenced asset, not an older similarly named one

### Favicon

- current source path is `content/globals/site.json` -> `favicon`
- verify the file exists in `assets/`

### Case Images

- verify case cover and gallery paths against `content/collections/cases.json`
- do not assume filename continuity after CMS uploads

## Mobile QA Priorities

If you touch layout, always check:
- header
- hero
- proof points
- portfolio grid
- case page media
- contact block

At minimum, validate around `390px` width because that already exposed real layout constraints in this project.

## Same-Account Handoff Notes

If the repo stays in the same GitHub account and is only passed to another maintainer:
- keep the existing Pages setup;
- keep the existing repository path unless there is a deliberate rename;
- verify the new maintainer can use Pages CMS and inspect Actions runs;
- do one safe verification edit through CMS after handoff.

## Transfer-To-Another-Account Notes

If the repo later moves to another GitHub account:
- update any human-facing repository references in docs and `admin/index.html`;
- verify GitHub Pages settings;
- verify Pages CMS access with the new account;
- verify site URL and route fallback behavior;
- confirm first deploy is green.

## Good Operating Pattern

1. Read `PROJECT_NOTES.md`.
2. Inspect the exact files related to the request.
3. Make the smallest safe change.
4. Verify the result locally.
5. Before commit, fetch and compare with `origin/main`.
6. Stage exact files only.
7. Mention risks, especially around CMS schema and GitHub Pages routing.

## If You Start A Fresh Chat

Use this summary:

```text
This repository is a static bilingual portfolio on GitHub Pages with Pages CMS.

Important constraints:
- read PROJECT_NOTES.md first;
- category.key is the stable relation key;
- case.category must reference category.key;
- .pages.yml is part of the production CMS contract;
- deploy is controlled by .github/workflows/deploy-pages.yml;
- tailwind.css is committed static CSS; do not reintroduce Tailwind CDN/build requirements casually;
- media lives in assets/ and CMS may create new filenames instead of overwriting;
- before commits, always fetch/rebase against origin/main;
- never use git add . blindly;
- do not stage accidental media duplicates or _site.
```

## Verified Runtime Details

- Current hero: `content/pages/home.json` → `hero.visual` → `assets/Hero-1.svg`.
- Current favicon: `content/globals/site.json` → `favicon` → `assets/favicon-an2.svg`.
- Both HTML entry points refresh favicon links from `site.json` with `cache: "no-store"` and a timestamp query, in addition to deploy-time hash injection.
- See `PROJECT_NOTES.md` for the verified content inventory, exact spacing, and current runtime limitations. Re-read JSON before changing media; these paths are a dated snapshot.
