# Project Notes

Last verified against the local working tree: **2026-11-17**. Runtime files, content JSON, CMS schema, and deployment workflow are the source of truth; this date does not confirm the live deployment.

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
- `tailwind.css`: committed static utility CSS from the earlier Tailwind phase
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
  - `/portfolio/?case=<slug>&lang=<ru|en>` (GitHub Pages); locally `/?case=<slug>&lang=<ru|en>`
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
  - `tailwind.css`
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
- The local `_site/` artifact, root-level verification PNGs, and `favicon/` source folder are ignored.
- On a fresh Mac or copied worktree, Git may report mode-only changes; use `git config core.filemode false` locally instead of committing mode churn.
- Do not blindly `git add .`
- Stage only the exact files intended for commit.

## Safe Update Checklist

Before committing:

- Verify whether `origin/main` contains new CMS commits.
- Rebase or pull before pushing workflow or code changes.
- Avoid changing CMS data shape unless necessary.
- If touching routing or deploy, verify GitHub Pages compatibility.
- If changing hero media behavior, confirm the exact current asset path in `home.json`.

## Verification Tools

- Do not use Playwright in this project.
- Prefer lightweight local checks, static servers, browser manual verification, and CLI-based validation.
- There are no package-manager dependencies to install for normal work.
- Use `node --check app.js` for a quick JavaScript syntax check.

## CSS / Performance Notes

- The site started with Tailwind, but the production runtime now uses committed static CSS.
- `tailwind.css` is kept as a static utility stylesheet, not generated during deploy.
- `styles.css` contains the custom visual system and project-specific styling.
- Do not reintroduce `cdn.tailwindcss.com` or a required frontend build step without a deliberate reason.

## Media Handling

- Keep media within the repository and check referenced paths before replacing files.
- Hosting service limits are external policy, not a project invariant; check current official limits when planning large uploads.

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

## Verified Snapshot — 2026-11-17

This snapshot describes local files, not a checked live deployment or CMS editing session.

### Current Content

- Six categories: `interfaces`, `branding`, `illustration`, `packaging`, `motion`, `print`.
- `interfaces` has `id`/`slug` `ui`; `motion` has `id`/`slug` `video`. Preserve the stable `key` values used by cases and CMS options.
- Five cases, sorted by their `order` fields at runtime:

| Slug | Category key | Gallery images |
| --- | --- | --- |
| `landing-summit` | `interfaces` | 1 |
| `illustration-drive` | `illustration` | 1 |
| `illustration-jet` | `illustration` | 1 |
| `1ci-cat` | `interfaces` | 2 |
| `package-olea` | `packaging` | 3 |

- Hero asset: `assets/Hero-1.svg` from `home.hero.visual`.
- Favicon asset: `assets/favicon-an2.svg` from `site.favicon`.
- Current theme: paper `#f6fbff`, panel `#fcfeff`, ink `#111111`, accent `#000000`, line `#dfeaf5`. `applyTheme` overrides CSS defaults from `site.json` and uses the same accent for `--color-accent-soft`.
- Homepage renders hero, proof points, focus, portfolio, about, contacts, and footer. `home.categories` content remains editable but has no separate rendered homepage section.
- RU uses the graphic designer role; EN uses Product Designer. Preserve this existing editorial choice unless asked to change it.

### Current Layout

- Case cover: `16 / 9`; gallery: `1 / 1`; both use `object-cover` and can crop source images.
- Case hero uses `lg:items-start`.
- `.case-page-main`: top `2.5rem`, bottom `3.5rem`; top becomes `3.5rem` from `768px`.
- `.case-back-link`: bottom margin `2.25rem`.
- `.case-gallery-section`: top padding `5rem` on mobile and `3.5rem` from `768px`.
- From `768px`, focus bottom padding and portfolio top padding are both `5rem`.
- Homepage cards omit summaries; the first card in each filtered result spans two columns from `md`.
- `.cms-text` preserves line breaks via `white-space: pre-wrap`.
- Focus uses an ink background with dark glass cards and light text, implemented by `.focus-glass-card`.
- Proof cards use `px-5 py-4`, circular bordered `h-16 w-16` icon containers, and `mb-5` icon spacing.
- Header site name inherits Manrope with `font-semibold`; display headings use Unbounded.
- Accent hover opacity is `0.3`; normal `bg-accentSoft` remains full opacity.

### Favicon and Loading

- Workflow replaces favicon placeholders in both HTML entry points using a SHA-256 digest truncated to 12 characters.
- Both HTML entry points also fetch `site.json` with `cache: "no-store"` and a timestamp, then update icon links. Runtime refresh failures are silently ignored.
- Serving raw source locally can briefly request unresolved favicon placeholders before the runtime refresh. Deployment replaces those placeholders.
- Hero and case cover load eagerly with high priority. Portfolio and gallery images use lazy loading with an IntersectionObserver and a `320px` root margin.
- Google Fonts supplies Manrope and Unbounded; no npm install is required, but fonts are an external request.
- Root-level `hero-image.svg` and `hero-image-2.svg` are untracked local files at this review; neither is the configured hero. The workflow copies `assets/`, not arbitrary root SVG files. Do not delete or stage them automatically.

### Current Runtime Limitations

- `detectLang` explicitly recognizes `lang=en`; other values, including `lang=ru`, fall back to `site.default_lang`. Current default is `ru`. If default language changes to `en`, explicit RU switching needs a code fix.
- Missing case slugs render the localized not-found view. Other unknown paths currently render the homepage, despite `routeInfo` classifying them as `not-found`.
- GitHub Pages base-path detection assumes the first pathname segment is the repository on `github.io`; other hosts use the origin root. Test routing and assets when changing hosting topology.
- JSON content is interpolated into HTML templates. Treat CMS content as trusted editorial input; it is not a sanitized public submission system.

### Verification Scope

- Review covered all five context documents, runtime HTML/JS/CSS, six content JSON files, `.pages.yml`, and the deploy workflow.
- Documentation refresh does not establish remote branch freshness, GitHub Actions status, or a successful live CMS save.
- Preserve existing staged and unstaged work. This refresh does not commit or deploy changes.

## Decorative Simplification — 2026-11-17

- Page background now has one faint accent gradient at 2.5% opacity over the paper color.
- Hero uses a solid panel background; hero overlay gradients and blurred visual halos were removed.
- Light `.glass-edge` cards use one subtle neutral shadow; hover lifts `.card-tilt` by `2px` with a neutral shadow and a clearer border.
- Hero image frame uses a single neutral shadow; the unused `shadow-glow` class was removed from its markup.
- Active portfolio filter no longer uses a cyan shadow.
- Dark `.focus-glass-card` styling, content, section order, layout dimensions, and hero float animation remain unchanged.

## Hero Heading Spacing — 2026-11-17

- Main homepage heading uses `.hero-title`: `line-height: 1` and `letter-spacing: -0.035em` (previously `0.9` and `-0.055em`).
- Font family, responsive font sizes, and heading text remain unchanged in RU and EN.
