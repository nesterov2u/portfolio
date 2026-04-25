# portfolio

Content-first scaffold for a bilingual portfolio landing page.

## Structure

- `content/globals`: global site settings, navigation, UI labels
- `content/pages`: page-level content blocks
- `content/collections`: reusable collections such as categories and cases
- `assets/cases`: case media placeholders

## Language Model

Content is stored in a single source of truth with `ru` and `en` fields for translatable values.
Language switching is intended to work through `?lang=ru` and `?lang=en`.

## Next Steps

1. Replace placeholder contact links in `content/pages/home.json`.
2. Add real case entries and assets in `content/collections/cases.json`.
3. Build the static HTML, Tailwind CSS, and JS rendering layer on top of this content model.
