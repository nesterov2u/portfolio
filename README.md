# nesterov2u/portfolio

Last verified against the local working tree: **2026-11-17**. Runtime files, content JSON, CMS schema, and deployment workflow are the source of truth; this date does not confirm the live deployment.

Static bilingual portfolio site published on GitHub Pages and edited through Pages CMS.

This repository is intentionally simple:
- no build step for the app itself;
- content lives in JSON files under `content/`;
- media lives in `assets/`;
- deployment is handled by GitHub Actions and published to GitHub Pages.

The site originally used Tailwind during development, but the runtime now uses committed static CSS for lighter page loading. Do not reintroduce the Tailwind CDN or a required frontend build step unless there is a deliberate performance and maintenance decision.

The project is currently maintained in the repository `nesterov2u/portfolio`. The primary handoff scenario for this documentation is transferring maintenance to another person or agent while keeping the same GitHub account and repository.

## Project Overview

The site is a single frontend app with two main views:
- homepage portfolio view;
- case detail view rendered by the same app.

Main characteristics:
- static hosting on GitHub Pages;
- Pages CMS used as the content editor;
- bilingual content in Russian and English;
- query-driven routing with fallback support for legacy case URLs;
- no separate backend, database, or media storage service.

Live URLs before transfer:
- site: `https://nesterov2u.github.io/portfolio/`
- CMS shortcut: `https://nesterov2u.github.io/portfolio/admin/`

## Tech Stack

- `index.html`: main app shell
- `404.html`: GitHub Pages SPA fallback for legacy routes
- `app.js`: rendering, routing, localization, content loading
- `tailwind.css`: committed static utility CSS kept from the Tailwind-based phase
- `styles.css`: custom visual system and utility styles
- `.pages.yml`: Pages CMS schema
- `.github/workflows/deploy-pages.yml`: static deploy workflow

There is no bundler, framework runtime, or package manager dependency required for normal operation.

## Repository Structure

```text
.
├── index.html
├── 404.html
├── app.js
├── tailwind.css
├── styles.css
├── admin/
│   └── index.html
├── assets/
├── content/
│   ├── globals/
│   │   ├── navigation.json
│   │   ├── site.json
│   │   └── ui.json
│   ├── pages/
│   │   └── home.json
│   └── collections/
│       ├── categories.json
│       └── cases.json
├── .pages.yml
├── .github/workflows/deploy-pages.yml
├── PROJECT_NOTES.md
├── context.md
├── agent.md
└── codex.md
```

## Content Model

### Globals

`content/globals/site.json`
- site names in RU/EN;
- role in RU/EN;
- default language;
- favicon path;
- phone / telegram / email / linkedin;
- theme colors.

`content/globals/navigation.json`
- header navigation items.

`content/globals/ui.json`
- shared labels used throughout the interface.

### Page Content

`content/pages/home.json`
- hero section;
- proof points;
- focus section;
- categories intro;
- contact section.

### Collections

`content/collections/categories.json`
- category definitions used by cases and filters.

`content/collections/cases.json`
- case cards;
- case detail content;
- case images and optional gallery.

## Important Data Invariants

These are critical and should not be broken during edits, migrations, or CMS changes.

### Language

- The site is bilingual: `ru` and `en`.
- User-facing content should generally be mirrored in both languages.
- Language switching is handled through `?lang=ru` and `?lang=en`.

### Categories and Cases

- `category.key` is the stable relation key.
- `case.category` must reference `category.key`.
- Do not rename `category.key` casually.
- `category.id`, `slug`, labels, summaries, and order can change if needed.

### Media

- Media is stored inside this repository under `assets/`.
- Pages CMS may create a new filename instead of overwriting an old asset.
- When replacing visuals, always verify which asset path is currently referenced from content JSON.

### CMS Schema

- `.pages.yml` is part of the application contract, not optional documentation.
- Changing content shape in JSON usually requires coordinated changes in `.pages.yml`.
- Current case gallery limit in CMS is `8` images.

## Routing Model

### Current Main Route

- homepage: `/portfolio/`
- case view: `/portfolio/?case=<slug>&lang=<ru|en>` (GitHub Pages); locally `/?case=<slug>&lang=<ru|en>`

### Legacy Support

Legacy `/cases/:slug` URLs are still supported through `404.html`, which boots the same frontend app on GitHub Pages.

This means:
- `404.html` is operationally important;
- changes to routing should always consider GitHub Pages fallback behavior.

## Current Frontend Behavior Notes

These are presentation decisions in `app.js`, `styles.css`, and the committed static `tailwind.css`. They should not require CMS schema changes.

### Case Pages

- The case cover uses `.case-cover-frame` and should stay `16 / 9`.
- Case gallery/internal images use `.case-gallery-frame` and should stay `1 / 1`.
- The case hero grid aligns media to the top with `lg:items-start`, so long summaries do not push the cover down.
- `.case-page-main` controls case page vertical spacing, especially on mobile near the sticky header.
- `.case-back-link` controls spacing after the back button.
- `.case-gallery-section` keeps extra mobile spacing between the main case block and the gallery; desktop spacing is tighter.

### Homepage Portfolio

- Homepage case cards intentionally hide descriptions.
- Case descriptions still live in `content/collections/cases.json` and still render on case detail pages.

### CMS Text

- Multiline CMS text should render with `.cms-text`.
- `.cms-text` uses `white-space: pre-wrap` so CMS-authored line breaks and blank lines are preserved.

### Focus Section

- The focus section uses `bg-ink` (`#111111` in current site settings) without a separate blue glow.
- Focus cards use `.focus-glass-card`: dark translucent backgrounds, gradients, blur, and light text.
- Focus labels are rounded pills with `font-semibold` and light text; `.focus-card-label` is not present in the runtime.
- Focus body copy uses `.cms-text` and `text-white/92`; verify any added utility exists in the committed `tailwind.css`.

### Homepage Proof Cards

- Proof-point cards use `px-5 py-4`; the hero uses `px-6 md:px-10`.
- Proof icons sit in circular `h-16 w-16` containers with `rounded-full border border-ink/10 bg-panel`.
- Proof icon-to-text spacing is `mb-5` (`20px`).
- Header/site name uses the inherited Manrope body font with `font-semibold`; `font-display` maps to Unbounded elsewhere.

### Accent Hover

- `hover:bg-accentSoft` in `tailwind.css` is intentionally softened to 30% opacity.
- Do not reduce normal `bg-accentSoft` globally unless badges and other full-accent elements should also change.

## Favicon Behavior

Favicon is controlled by `content/globals/site.json` via the `favicon` field.

Deployment behavior:
- the GitHub Actions workflow reads `site.json`;
- it computes a hash of the current favicon file;
- it injects the resolved favicon URL and MIME type into both `index.html` and `404.html`.

Important notes:
- favicon is injected at deploy time and refreshed from content at runtime;
- both `index.html` and `404.html` must stay aligned;
- relative favicon paths on GitHub Pages can break on nested routes, so the current HTML includes normalization logic for case pages.

## Deployment

Deployment is defined in:
- `.github/workflows/deploy-pages.yml`

What the workflow does:
1. creates `_site/`;
2. copies `index.html`, `404.html`, `app.js`, `tailwind.css`, `styles.css`;
3. copies `assets/` and `content/`;
4. copies optional `admin/` and optional `CNAME`;
5. injects the current favicon into HTML;
6. verifies the static artifact;
7. uploads and deploys to GitHub Pages.

There is no application build step beyond assembling the static artifact.

## Pages CMS

Pages CMS is configured through `.pages.yml`.

What it currently edits:
- site settings;
- navigation;
- UI labels;
- homepage content;
- categories;
- cases.

Current media config:
- input: `assets`
- output: `assets`

Important transfer note:
- `admin/index.html` is only a redirect helper to Pages CMS;
- it contains text mentioning `nesterov2u/portfolio`;
- this text should be updated after transfer so the new owner sees the correct repository name.

## Working Locally

Because this is a static site, local editing is straightforward:

1. edit HTML, CSS, JS, JSON, or media files;
2. open the site in a static server or browser context compatible with your workflow;
3. verify both languages and at least one case page;
4. commit only intended files.

Recommended things to verify after changes:
- homepage in RU and EN;
- one case page in RU and EN;
- favicon;
- contact block on mobile;
- images on portfolio cards and case pages;
- Pages CMS field compatibility if content structure changed.

No dependency installation is required on a fresh machine. Useful local tools are Git, Node for `node --check app.js`, and any lightweight static server or browser workflow.

## Known Local Caveats

### Untracked Media Duplicates

On macOS, the worktree may accumulate untracked duplicate media files caused by Unicode normalization of Cyrillic filenames.

Practical rule:
- never use `git add .`;
- stage only exact intended files.

### `_site/`

The local `_site/` directory may exist during testing or from previous runs.

Practical rule:
- do not accidentally commit `_site/` unless there is a deliberate workflow reason.

### File Permissions After Transfer

On some macOS transfers, Git may report many files as modified only because their executable bit changed.

Practical rule:
- set `git config core.filemode false` for this local clone if that happens;
- do not commit broad `100644` / `100755` mode churn.

## Handoff Checklist In The Same GitHub Account

This is the expected handoff path for this project: same GitHub account, same repository, different maintainer.

### Access

1. Confirm the new maintainer has repository access.
2. Confirm the new maintainer can open GitHub Actions runs.
3. Confirm the new maintainer can access Pages settings if operational work is expected.

### Pages CMS

1. Sign in to [Pages CMS](https://app.pagescms.org/).
2. Connect the same GitHub account that owns `nesterov2u/portfolio`.
3. Open the repository in Pages CMS.
4. Make one safe content edit and verify that the CMS commit lands in `main`.

### Operational Verification

After handoff, verify:
- homepage loads;
- at least one case page loads;
- RU and EN content both render;
- favicon is correct;
- latest `Deploy GitHub Pages` workflow is green.

## Optional Transfer Checklist For Another GitHub Account

If the repository is later moved to another owner or another repository name, review all of the following.

### GitHub Repository

1. Transfer or recreate the repository under the new account.
2. Verify that `main` is the active branch.
3. Re-enable GitHub Pages in repository settings if needed.
4. Confirm that GitHub Actions is allowed to deploy Pages.

### GitHub Pages URL

If the owner or repository name changes, the Pages URL will likely change too.

Examples:
- old: `https://nesterov2u.github.io/portfolio/`
- new: `https://NEWOWNER.github.io/NEWREPO/`

After transfer, verify:
- homepage loads;
- case routes load;
- `404.html` fallback still works;
- favicon paths resolve on case pages.

### Pages CMS Access

1. Sign in to [Pages CMS](https://app.pagescms.org/).
2. Connect the new GitHub account.
3. Select the transferred repository.
4. Verify that `.pages.yml` is detected correctly.
5. Test editing one safe field and confirm the commit lands in the new repository.

### Admin Shortcut

Review `admin/index.html` and update:
- visible repository name in the helper text;
- any wording that still references `nesterov2u/portfolio`.

### Content and Media

After transfer, verify:
- `content/globals/site.json` still points to valid media files;
- hero visual path is valid;
- case cover paths are valid;
- favicon path is valid.

### Deployment Workflow

After first push in the new account:
- check the `Deploy GitHub Pages` workflow;
- confirm build and deploy are green;
- ignore older cancelled runs if a newer green run exists.

## Safe Change Process

Before committing:
- fetch `origin/main`;
- rebase or pull if CMS made new commits;
- avoid schema drift between JSON and `.pages.yml`;
- avoid accidental media staging;
- verify the exact current content path before replacing a visual asset.

## Recommended Handoff Reading Order

For a new developer, editor, or AI agent:
1. `PROJECT_NOTES.md`
2. `context.md`
3. `agent.md`
4. `codex.md`
5. `README.md`
6. `.pages.yml`
7. `.github/workflows/deploy-pages.yml`

## Additional Notes

- This project intentionally favors direct file editing over build complexity.
- The repository contains both product logic and editorial content, so code changes and content changes often coexist.
- GitHub Pages compatibility is a first-class constraint.
- Pages CMS compatibility is also a first-class constraint.

## Verified Runtime Details

- Current hero: `content/pages/home.json` → `hero.visual` → `assets/Hero-1.svg`.
- Current favicon: `content/globals/site.json` → `favicon` → `assets/favicon-an2.svg`.
- Both HTML entry points refresh favicon links from `site.json` with `cache: "no-store"` and a timestamp query, in addition to deploy-time hash injection.
- See `PROJECT_NOTES.md` for the verified content inventory, exact spacing, and current runtime limitations. Re-read JSON before changing media; these paths are a dated snapshot.
