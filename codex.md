# Codex Instructions

Last verified against the local working tree: **2026-11-17**. Runtime files, content JSON, CMS schema, and deployment workflow are the source of truth; this date does not confirm the live deployment.

Use this file as the quick-start instruction set for Codex sessions working on this portfolio.

## Project

- Repository: `nesterov2u/portfolio`
- Site: `https://nesterov2u.github.io/portfolio/`
- CMS shortcut: `https://nesterov2u.github.io/portfolio/admin/`
- Type: static bilingual portfolio on GitHub Pages with Pages CMS
- Main branch: `main`
- Runtime: plain HTML/CSS/JS, no required dependency install

## Read First

Before making changes, read these files in this order:

1. `PROJECT_NOTES.md`
2. `context.md`
3. `agent.md`
4. `codex.md`
5. `README.md`

If the files disagree, follow the stricter rule that protects CMS structure, routing, media references, and GitHub Pages deployment.

## Core Rules

- Treat `.pages.yml` as production CMS configuration.
- Do not change JSON content shape unless code and CMS schema are updated together.
- `category.key` is the stable relation key.
- `case.category` must reference `category.key`.
- Do not rename `category.key` casually.
- Keep RU and EN user-facing content aligned unless the user asks otherwise.
- Media lives in `assets/`.
- Pages CMS may create new asset filenames instead of overwriting old files.
- Tailwind was used earlier, but production CSS is now committed statically for lighter loading.

## Git Rules

- Always check `origin/main` before committing.
- CMS may push directly to `main`, so rebase or fast-forward before pushing.
- Never use `git add .`.
- Stage exact files only.
- Do not stage `_site/`, temporary screenshots, or accidental media duplicates.
- Do not revert user or CMS changes unless explicitly asked.

## Important Files

- `index.html`: main app shell
- `404.html`: GitHub Pages fallback for legacy case routes
- `app.js`: rendering, routing, localization, content loading
- `styles.css`: custom visual system
- `tailwind.css`: static generated utility CSS used instead of Tailwind CDN
- `.pages.yml`: Pages CMS schema
- `.github/workflows/deploy-pages.yml`: GitHub Pages deploy workflow
- `content/globals/site.json`: site settings, theme, contacts, favicon
- `content/pages/home.json`: homepage content
- `content/collections/categories.json`: categories
- `content/collections/cases.json`: case data

## Routing

- Homepage: `/portfolio/`
- Current case route: `/portfolio/?case=<slug>&lang=<ru|en>` (GitHub Pages); locally `/?case=<slug>&lang=<ru|en>`
- Legacy case route support: `/cases/:slug` through `404.html`

When touching routing, verify both `index.html` and `404.html`.

## CMS Safety

Changes that can affect CMS:

- edits to `.pages.yml`
- field name changes in `content/`
- category relation changes
- media path changes
- required field changes

After CMS-affecting changes, verify that Pages CMS can still read and save the relevant collection or settings file.

## Deployment

GitHub Pages deploy is handled by `.github/workflows/deploy-pages.yml`.

The workflow publishes:

- `index.html`
- `404.html`
- `app.js`
- `tailwind.css`
- `styles.css`
- `assets/`
- `content/`
- optional `admin/`
- optional `CNAME`

Favicon is injected at deploy time from `content/globals/site.json`.

## Performance Notes

- Do not reintroduce `cdn.tailwindcss.com`.
- `tailwind.css` is the static replacement for Tailwind runtime CSS.
- Keep favicon small; current source should stay an SVG unless the user asks otherwise.
- Large case images should be optimized carefully and only when referenced paths are confirmed.

## Verification Checklist

For most frontend changes, verify:

- `node --check app.js`
- homepage renders
- at least one case page renders
- no console errors
- mobile width around `390px` if layout was touched
- GitHub Pages deploy workflow still includes all required static files

Do not use Playwright in this project. Prefer lightweight local checks, static servers, browser manual verification, and CLI-based validation.

## Local Noise

The worktree may contain:

- `_site/`
- duplicate media files in `assets/`
- temporary screenshots
- root-level verification PNGs
- `favicon/` source files
- mode-only changes after transfer; use local `git config core.filemode false`

Ignore these unless the user explicitly asks to clean or review them.

## Verified Runtime Details

- Current hero: `content/pages/home.json` → `hero.visual` → `assets/Hero-1.svg`.
- Current favicon: `content/globals/site.json` → `favicon` → `assets/favicon-an2.svg`.
- Both HTML entry points refresh favicon links from `site.json` with `cache: "no-store"` and a timestamp query, in addition to deploy-time hash injection.
- See `PROJECT_NOTES.md` for the verified content inventory, exact spacing, and current runtime limitations. Re-read JSON before changing media; these paths are a dated snapshot.
