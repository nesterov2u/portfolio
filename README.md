# portfolio

Static bilingual portfolio landing page with a CMS-friendly content model.

## Structure

- `content/globals`: global settings, navigation, UI labels
- `content/pages`: editable page sections
- `content/collections`: categories and cases
- `assets/hero`: hero visual placeholder
- `assets/cases`: case cover and gallery placeholders

## Language Model

Content is stored in editable JSON and mirrored across `ru` / `en` fields.
Language switching works through `?lang=ru` and `?lang=en`.

## Routing

- homepage: `/`
- case pages: `/cases/:slug`

For GitHub Pages, case routes are handled through the custom `404.html` fallback so the same frontend can render both the homepage and case template.

## Next Steps

1. Replace placeholder contact links in `content/globals/site.json`.
2. Replace placeholder case assets and copy in `content/collections/cases.json`.
3. Connect `.pages.yml` to Pages CMS and verify the editor against real content.

## Pages CMS

The repository root now contains `.pages.yml` with:

- global settings (`site`, `navigation`, `ui`)
- editable `home.json`
- editable `categories.json`
- editable `cases.json`

The case gallery is limited to `8` images in CMS.

## Theme

The site's main colors can be controlled from `content/globals/site.json` through:

- `favicon`
- `theme.paper`
- `theme.panel`
- `theme.ink`
- `theme.accent`
- `theme.line`

The favicon path and theme values are applied at runtime, so they are ready to be exposed in a CMS without changing the templates.

## Proof Point Icons

Each proof point in `content/pages/home.json` supports:

- `icon`: built-in icon key such as `spark`, `lead`, `globe`, `grid`
- `icon_asset`: optional custom icon path

If `icon_asset` is filled, the custom asset is rendered instead of the built-in icon. This is ready to expose in CMS so the icons can be swapped without touching the code.

## Focus Card Icons

Each item in `home.focus.items` supports:

- `icon`: built-in icon key such as `product`, `visual`, `range`, `team`
- `icon_asset`: optional custom icon path

If `icon_asset` is set, the custom asset overrides the built-in icon.
