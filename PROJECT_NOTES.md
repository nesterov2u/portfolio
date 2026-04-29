# Project Notes

Working notes for future chats and safe project updates.

## Project Type

Static bilingual portfolio site published on GitHub Pages and edited through Pages CMS.

Primary repo:

- `nesterov2u/portfolio`

Live URLs:

- site: `https://nesterov2u.github.io/portfolio/`
- CMS shortcut: `https://nesterov2u.github.io/portfolio/admin/`

## Core Files

- `index.html`: app shell
- `app.js`: rendering, routing, language handling
- `styles.css`: visual system
- `.pages.yml`: Pages CMS config
- `.github/workflows/deploy-pages.yml`: GitHub Pages deploy workflow
- `content/globals/site.json`: site-wide settings, theme, contacts, favicon
- `content/globals/navigation.json`: header links
- `content/globals/ui.json`: shared labels
- `content/pages/home.json`: homepage content
- `content/collections/categories.json`: category definitions
- `content/collections/cases.json`: case data

## Language Rules

- The site is bilingual: `ru` and `en`.
- Language switching is controlled by `?lang=ru` and `?lang=en`.
- Content fields that are user-facing should stay mirrored in both languages unless intentionally single-language.

## Routing Rules

- Homepage: `/portfolio/`
- Case pages are rendered by the same frontend app.
- Current canonical case route behavior is query-based:
  - `/?case=<slug>&lang=<ru|en>`
- Legacy `/cases/:slug` routes are still supported through the `404.html` fallback on GitHub Pages.
- `/admin/` is a static redirect page that sends users to Pages CMS hosted app.

## CMS Rules

- Pages CMS edits content directly in the GitHub repo.
- Media is stored in the repository under `assets/`; Pages CMS does not provide a separate media bucket.
- `media.input` and `media.output` are configured in `.pages.yml`.
- Current case gallery limit in CMS: `8` images.

## Category / Case Invariants

- `category.key` is the stable relation key.
- `case.category` must reference `category.key`.
- `category.id`, `category.slug`, titles, summaries, and order can change.
- Do not casually rename `category.key` unless code and case references are migrated together.
- `.pages.yml` currently uses a static select for case category options.
- If a new category is added, its option list may also need to be updated in `.pages.yml`.

## Hero Visual Rules

- The homepage hero image path is controlled by `content/pages/home.json` via `hero.visual`.
- Pages CMS may create a new uploaded asset instead of overwriting the old one.
- When hero background fixes are needed, patch the asset currently referenced by `hero.visual`, not an older similarly named file.

## GitHub Pages Deployment

- GitHub Pages is deployed through `.github/workflows/deploy-pages.yml`.
- The workflow publishes a static `_site` artifact built from:
  - `index.html`
  - `404.html`
  - `app.js`
  - `styles.css`
  - `assets/`
  - `content/`
  - optional `CNAME`
  - optional `admin/`
- There is a minimal artifact sanity check before upload.
- If the latest `Deploy GitHub Pages` run is green, old cancelled runs can be ignored.

## Deploy Caveats

- `cancelled` usually means a newer push superseded an older deploy.
- `queued` for a short time is normal; long queue times usually indicate GitHub Pages environment contention.
- GitHub may show non-blocking warnings about action runtime deprecations even when deploy succeeds.

## Known Local Noise

- The worktree may contain untracked duplicate media files caused by Unicode normalization of Cyrillic filenames on macOS.
- Do not blindly `git add .`
- Stage only the exact files intended for commit.

## Safe Update Checklist

Before committing:

- Verify whether `origin/main` contains new CMS commits.
- Rebase or pull before pushing workflow or code changes.
- Avoid changing CMS data shape unless necessary.
- If touching routing or deploy, verify GitHub Pages compatibility.
- If changing hero media behavior, confirm the exact current asset path in `home.json`.

## Media Limits

Practical limits come from GitHub, not Pages CMS:

- hard limit per file in git repo: `100 MiB`
- GitHub starts warning around `50 MiB`
- recommended GitHub Pages repo size: around `1 GB`
- published GitHub Pages site limit: `1 GB`

## Good Default Practice For New Chats

If context is lost, provide the new chat with:

1. Repo path or repo URL.
2. Mention that this is a static GitHub Pages + Pages CMS portfolio.
3. Mention that `category.key` is the stable relation key.
4. Mention that deploy is controlled by `.github/workflows/deploy-pages.yml`.
5. Mention that media lives in `assets/` and CMS may create new filenames on upload.

## New Chat Prompt

Use this as a starting prompt in a new chat:

```text
Работаем с репозиторием nesterov2u/portfolio.

Сначала прочитай PROJECT_NOTES.md в корне проекта и используй его как основной источник проектных инвариантов.
Это статический bilingual portfolio site на GitHub Pages с редактированием через Pages CMS.

Важно:
- не ломай текущую CMS-структуру без явной необходимости;
- category.key считай стабильным relation key;
- case.category должен ссылаться на category.key;
- .pages.yml учитывай как часть рабочей CMS-схемы;
- deploy идёт через .github/workflows/deploy-pages.yml;
- media хранятся в assets/, Pages CMS может создавать новые файлы вместо перезаписи старых;
- если нужно исправить hero image, сначала проверь актуальный hero.visual в content/pages/home.json;
- перед коммитами проверяй актуальный origin/main и аккуратно ребейзься поверх CMS-коммитов;
- не делай git add . без необходимости;
- не добавляй случайные untracked media-дубли;
- если последний Deploy GitHub Pages run зелёный, старые cancelled/queued runs не считаются проблемой.

Формат работы:
- сначала коротко опиши, что проверяешь;
- потом внеси изменения;
- затем проверь результат;
- если делаешь коммит, в конце дай GitHub summary: commit hash, что изменено, риски/ограничения.
```
