const GITHUB_PAGES_BASE = (() => {
  if (!window.location.hostname.endsWith("github.io")) {
    return "";
  }

  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : "";
})();

const BASE_URL = `${window.location.origin}${GITHUB_PAGES_BASE}`;
const CONTENT_PATH = `${BASE_URL}/content`;

const state = {
  lang: null,
  data: null,
  activeCategory: "all"
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const pathWithoutBase = () => {
  const path = window.location.pathname;
  if (GITHUB_PAGES_BASE && path.startsWith(GITHUB_PAGES_BASE)) {
    return path.slice(GITHUB_PAGES_BASE.length) || "/";
  }
  return path || "/";
};

const routeInfo = () => {
  const params = new URLSearchParams(window.location.search);
  const caseSlug = params.get("case");
  if (caseSlug) {
    return {
      type: "case",
      slug: decodeURIComponent(caseSlug)
    };
  }

  const path = pathWithoutBase().replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/index.html") {
    return { type: "home" };
  }

  if (path.startsWith("/cases/")) {
    return {
      type: "case",
      slug: decodeURIComponent(path.replace("/cases/", ""))
    };
  }

  return { type: "not-found" };
};

const caseHref = (slug, lang) => `${BASE_URL}/?case=${encodeURIComponent(slug)}&lang=${lang}`;
const portfolioHref = (lang) => `${BASE_URL}/?lang=${lang}#portfolio`;

const loadJSON = async (path) => {
  const response = await fetch(`${CONTENT_PATH}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
};

const detectLang = (site) => {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("lang");
  return fromQuery === "en" ? "en" : site.default_lang || "ru";
};

const hexToRgbValue = (hex) => {
  if (!hex || typeof hex !== "string") {
    return null;
  }

  const normalized = hex.replace("#", "").trim();
  const full = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return null;
  }

  const numeric = parseInt(full, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return `${r} ${g} ${b}`;
};

const applyTheme = (theme = {}) => {
  const root = document.documentElement;
  const paper = hexToRgbValue(theme.paper) || "246 251 255";
  const panel = hexToRgbValue(theme.panel) || "252 254 255";
  const ink = hexToRgbValue(theme.ink) || "17 17 17";
  const accent = hexToRgbValue(theme.accent) || "20 216 255";
  const line = hexToRgbValue(theme.line) || "184 198 212";

  root.style.setProperty("--color-paper", paper);
  root.style.setProperty("--color-panel", panel);
  root.style.setProperty("--color-ink", ink);
  root.style.setProperty("--color-line", line);
  root.style.setProperty("--color-accent", accent);
  root.style.setProperty("--color-accent-soft", accent);
};

const faviconTypeFor = (path = "") => {
  if (path.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (path.endsWith(".ico")) {
    return "image/x-icon";
  }

  return "image/png";
};

const faviconHrefFor = (path) => {
  const href = assetUrl(path);
  const separator = href.includes("?") ? "&" : "?";

  // Browsers cache favicons aggressively, so force a fresh fetch on each deploy/page load.
  return `${href}${separator}v=${Date.now()}`;
};

const applySiteAssets = (site = {}) => {
  if (!site.favicon) {
    return;
  }

  const href = faviconHrefFor(site.favicon);
  const type = faviconTypeFor(site.favicon);
  const iconRels = ["icon", "shortcut icon", "apple-touch-icon"];
  const existingIcons = document.querySelectorAll(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );

  existingIcons.forEach((icon) => icon.remove());

  iconRels.forEach((rel) => {
    const icon = document.createElement("link");
    icon.rel = rel;

    icon.type = type;
    icon.href = href;
    document.head.appendChild(icon);
  });
};

const assetUrl = (path) => {
  if (!path) {
    return "";
  }
  const normalized = path.replace(/^\/+/, "");
  return `${BASE_URL}/${normalized}`;
};

const textFor = (value, lang) => {
  if (typeof value === "string") {
    return value;
  }
  if (!value) {
    return "";
  }
  return value[lang] || value.ru || value.en || "";
};

const siteNameFor = (site, lang) => (
  lang === "ru"
    ? site.site_name_ru || site.site_name
    : site.site_name_en || site.site_name
);

const siteRoleFor = (site, lang) => (
  lang === "ru"
    ? site.role_ru || site.role_en || ""
    : site.role_en || site.role_ru || ""
);

const ensureMetaDescription = () => {
  let meta = document.querySelector('meta[name="description"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  return meta;
};

const applyPageMeta = (data, lang, route) => {
  const { site, home, categories, cases, ui } = data;
  const siteName = siteNameFor(site, lang);
  const siteRole = siteRoleFor(site, lang);
  const defaultDescription = textFor(home.hero?.text, lang) || siteRole;
  let title = siteRole ? `${siteName} — ${siteRole}` : siteName;
  let description = defaultDescription;

  if (route.type === "case") {
    const item = cases.find((entry) => entry.slug === route.slug);

    if (item) {
      const caseTitle = lang === "ru" ? item.title_ru : item.title_en;
      const caseSummary = lang === "ru" ? item.summary_ru : item.summary_en;
      const category = resolveCategory(categories, item.category);
      const categoryName = category
        ? (lang === "ru" ? category.title_ru : category.title_en)
        : "";

      title = `${caseTitle} — ${siteName}`;
      description = caseSummary || categoryName || defaultDescription;
    } else {
      title = `${textFor(ui.labels.notFound, lang)} — ${siteName}`;
      description = textFor(ui.labels.notFoundText, lang) || defaultDescription;
    }
  }

  document.title = title;
  ensureMetaDescription().content = description;
};

const resolveCategory = (categories, key) => {
  if (!Array.isArray(categories) || !key) {
    return null;
  }

  return (
    categories.find((entry) => entry.key === key) ||
    categories.find((entry) => entry.id === key) ||
    categories.find((entry) => entry.slug === key) ||
    null
  );
};

const normalizeCategory = (entry) => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const relationKey = entry.key || entry.id || entry.slug;
  if (!relationKey) {
    return null;
  }

  return {
    ...entry,
    key: relationKey,
    id: entry.id || relationKey,
    slug: entry.slug || relationKey
  };
};

const normalizeCase = (entry) => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  if (!entry.slug || !entry.category) {
    return null;
  }

  return entry;
};

const proofIcon = (name) => {
  const base = "h-10 w-10 text-ink";
  const icons = {
    spark: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v4"></path>
        <path d="M12 17v4"></path>
        <path d="M3 12h4"></path>
        <path d="M17 12h4"></path>
        <path d="M6.5 6.5l2.8 2.8"></path>
        <path d="M14.7 14.7l2.8 2.8"></path>
        <path d="M17.5 6.5l-2.8 2.8"></path>
        <path d="M9.3 14.7l-2.8 2.8"></path>
      </svg>
    `,
    lead: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4"></rect>
        <path d="M8 15l2.5-3 2 2 3.5-5"></path>
      </svg>
    `,
    globe: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M3 12h18"></path>
        <path d="M12 3c2.7 2.5 4.2 5.7 4.2 9s-1.5 6.5-4.2 9c-2.7-2.5-4.2-5.7-4.2-9S9.3 5.5 12 3z"></path>
      </svg>
    `,
    grid: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5"></rect>
        <rect x="14" y="4" width="6" height="6" rx="1.5"></rect>
        <rect x="4" y="14" width="6" height="6" rx="1.5"></rect>
        <rect x="14" y="14" width="6" height="6" rx="1.5"></rect>
      </svg>
    `
  };

  return icons[name] || icons.spark;
};

const renderProofIcon = (point) => {
  if (point.icon_asset) {
    return `<img class="h-10 w-10 object-contain" src="${assetUrl(point.icon_asset)}" alt="" />`;
  }

  return proofIcon(point.icon);
};

const focusIcon = (name) => {
  const base = "h-5 w-5 text-white";
  const icons = {
    product: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="3"></rect>
        <path d="M8 9h8"></path>
        <path d="M8 13h4"></path>
      </svg>
    `,
    visual: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M3 12c2.3-4.5 5.3-6.8 9-6.8s6.7 2.3 9 6.8c-2.3 4.5-5.3 6.8-9 6.8S5.3 16.5 3 12z"></path>
      </svg>
    `,
    range: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="13" y="4" width="7" height="7" rx="1.5"></rect>
        <rect x="4" y="13" width="7" height="7" rx="1.5"></rect>
        <path d="M16.5 13v7"></path>
        <path d="M13 16.5h7"></path>
      </svg>
    `,
    team: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="9" r="3"></circle>
        <circle cx="17" cy="8" r="2.5"></circle>
        <path d="M4.5 18c.8-2.5 2.6-4 5-4s4.2 1.5 5 4"></path>
        <path d="M15 16.5c.5-1.7 1.7-2.8 3.5-3.1"></path>
      </svg>
    `
  };

  return icons[name] || icons.product;
};

const renderFocusIcon = (item) => {
  if (item.icon_asset) {
    return `<img class="h-5 w-5 object-contain" src="${assetUrl(item.icon_asset)}" alt="" />`;
  }

  return focusIcon(item.icon);
};

const contactIcon = (name) => {
  const base = "h-5 w-5 text-white";
  const icons = {
    phone: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6.8 4.5h2.5l1.3 4-1.8 1.8a14.8 14.8 0 0 0 4.9 4.9l1.8-1.8 4 1.3v2.5c0 1-.8 1.8-1.8 1.8C10 19 5 14 5 7.3c0-1 .8-1.8 1.8-1.8z"></path>
      </svg>
    `,
    telegram: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 4L3 11l6 2 2 6 10-15z"></path>
        <path d="M9 13l7-5"></path>
      </svg>
    `,
    email: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3"></rect>
        <path d="M5.5 8l6.5 5 6.5-5"></path>
      </svg>
    `,
    linkedin: `
      <svg class="${base}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 9v8"></path>
        <path d="M12 12.5V17"></path>
        <path d="M12 12.5c0-1.7 1.1-3 2.8-3S18 10.8 18 13v4"></path>
        <circle cx="7" cy="6.5" r="1"></circle>
        <rect x="3" y="3" width="18" height="18" rx="4"></rect>
      </svg>
    `
  };

  return icons[name] || icons.email;
};

const createSectionIntro = (title, intro) => `
  <div class="section-reveal grid gap-8 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:items-start">
    <div>
      <p class="mb-3 font-display text-[1.24rem] leading-none tracking-[-0.03em] text-ink/62 md:text-[1.56rem]">${title}</p>
    </div>
    <p class="max-w-2xl text-base leading-7 text-ink/70 md:text-lg">${intro}</p>
  </div>
`;

const portfolioChipClass = (active = false) =>
  active
    ? "filter-chip rounded-full border border-accent/18 bg-accent/10 px-5 py-3 text-base font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_rgba(20,216,255,0.08)]"
    : "filter-chip glass-edge rounded-full border bg-panel/88 px-5 py-3 text-base font-medium text-ink/66 hover:bg-panel hover:text-ink";

const renderHeader = (site, navigation, ui, lang) => {
  const siteName = siteNameFor(site, lang);
  const resolveNavHref = (href) =>
    href && href.startsWith("#") ? `${BASE_URL}/?lang=${lang}${href}` : href;
  const navItems = navigation.items
    .map(
      (item) => `
        <a class="text-[0.96rem] font-medium text-ink transition hover:text-ink/80" href="${resolveNavHref(item.href)}">${textFor(
          ui.labels[item.id],
          lang
        )}</a>
      `
    )
    .join("");

  const mobileNavItems = navigation.items
    .map(
      (item) => `
        <a class="rounded-[1rem] border border-ink/8 bg-white/72 px-4 py-3 text-base font-medium text-ink/78 transition hover:border-accent hover:bg-accentSoft hover:text-ink" href="${resolveNavHref(item.href)}">
          ${textFor(ui.labels[item.id], lang)}
        </a>
      `
    )
    .join("");

  const nextLang = lang === "ru" ? "en" : "ru";
  const langParams = new URLSearchParams(window.location.search);
  langParams.set("lang", nextLang);
  const langHref = `${window.location.pathname}?${langParams.toString()}${
    window.location.hash || ""
  }`;

  return `
    <header class="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div class="container-wide flex items-center justify-between gap-6 py-5">
        <a href="${BASE_URL}/?lang=${lang}" class="group flex flex-col">
          <span class="text-[1.18rem] font-semibold tracking-[-0.025em] md:text-[1.24rem]">${siteName}</span>
          <span class="text-[0.88rem] text-ink/55 md:text-[0.92rem]">${siteRoleFor(site, lang)}</span>
        </a>
        <div class="hidden items-center gap-8 md:flex">
          <nav class="flex items-center gap-6">${navItems}</nav>
          <a
            class="rounded-full border border-ink/10 px-4 py-2 text-[0.96rem] font-medium transition hover:border-accent hover:bg-accentSoft"
            href="${langHref}"
          >
            ${lang.toUpperCase()} / ${nextLang.toUpperCase()}
          </a>
        </div>
        <details class="group relative md:hidden">
          <summary class="flex list-none items-center justify-center rounded-full bg-transparent px-2 py-2 text-[0.96rem] font-medium text-ink transition hover:text-ink/80">
            <span class="sr-only">Menu</span>
            <svg class="h-7 w-7 group-open:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 17h16"></path>
            </svg>
            <svg class="hidden h-7 w-7 group-open:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 6l12 12"></path>
              <path d="M18 6L6 18"></path>
            </svg>
          </summary>
          <div class="absolute right-0 top-[calc(100%+0.75rem)] w-[min(21rem,calc(100vw-1.75rem))] rounded-[1.4rem] border border-ink/10 bg-paper/95 p-3 shadow-[0_18px_40px_rgba(9,19,29,0.12)] backdrop-blur-xl">
            <nav class="flex flex-col gap-2">
              ${mobileNavItems}
              <a
                class="mt-1 inline-flex items-center justify-between rounded-[1rem] border border-ink/10 bg-ink px-4 py-3 text-base font-medium text-white"
                href="${langHref}"
              >
                <span>${lang.toUpperCase()} / ${nextLang.toUpperCase()}</span>
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M7 17L17 7"></path>
                  <path d="M9 7h8v8"></path>
                </svg>
              </a>
            </nav>
          </div>
        </details>
      </div>
    </header>
  `;
};

const renderHero = (home, ui, lang) => `
  <section class="container-wide section-reveal pt-8 md:pt-14">
    <div class="hero-grid glass-edge overflow-hidden rounded-[2rem] border bg-panel px-6 py-8 md:px-10 md:py-10">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-start">
        <div class="flex flex-col gap-8">
          <div class="max-w-2xl">
            <p class="mb-4 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink/55 sm:mb-5 sm:text-[0.72rem] sm:tracking-[0.18em]">
              ${textFor(home.hero.eyebrow, lang)}
            </p>
            <h1 class="max-w-4xl font-display text-[2.55rem] leading-[0.9] tracking-[-0.055em] text-ink sm:text-[4.2rem] lg:text-[4.7rem]">
              ${textFor(home.hero.title, lang)}
            </h1>
          </div>
          <div class="flex max-w-xl flex-col gap-7">
            <p class="max-w-xl text-[0.95rem] leading-[1.8] text-ink/72 sm:text-base sm:leading-7 md:text-lg">
              ${textFor(home.hero.text, lang)}
            </p>
            <div class="flex flex-wrap gap-3">
              ${home.hero.actions
                .map((action) => {
                  const isPrimary = action.style === "primary";
                  return `
                    <a
                      class="${
                        isPrimary
                          ? "bg-ink text-white hover:bg-ink/90"
                          : "border border-ink/12 bg-white/85 hover:border-accent hover:bg-accentSoft"
                      } rounded-full px-5 py-3 text-sm font-semibold transition"
                      href="${action.href}"
                    >
                      ${textFor(ui.labels[action.id], lang)}
                    </a>
                  `;
                })
                .join("")}
            </div>
          </div>
        </div>
        <div class="hero-visual-wrap relative lg:pt-1">
          <div class="hero-visual-float accent-mix-ring relative z-[1] overflow-hidden rounded-[2rem] border border-white/60 bg-white p-3 shadow-glow">
            <img
              class="h-[360px] w-full rounded-[1.4rem] bg-white object-cover md:h-[460px]"
              src="${assetUrl(home.hero.visual)}"
              alt=""
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
`;

const renderProofPoints = (points, lang) => `
  <section class="container-wide section-reveal pt-4 pb-10 md:pt-4 md:pb-14">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      ${points
        .map(
          (point) => `
            <div class="glass-edge rounded-[1.4rem] border bg-white/65 px-5 py-4 backdrop-blur-sm">
              <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-ink/10 bg-panel">
                ${renderProofIcon(point)}
              </div>
              <p class="text-sm font-medium leading-6 text-ink/78">${textFor(point, lang)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  </section>
`;

const renderFocus = (home, lang) => `
  <section id="focus" class="container-wide py-20 md:py-28">
    <div class="section-reveal relative isolate overflow-hidden rounded-[2.4rem] border border-white/8 bg-ink px-6 py-8 text-white shadow-[0_20px_60px_rgba(7,14,24,0.16)] md:px-8 md:py-10 lg:px-10">
      <div class="focus-neon opacity-100">
        <div class="focus-neon-orb focus-neon-orb-a"></div>
        <div class="focus-neon-orb focus-neon-orb-b"></div>
        <div class="focus-neon-orb focus-neon-orb-c"></div>
      </div>
      <div class="grid gap-8 md:grid-cols-[340px_minmax(0,1fr)] md:items-start">
      <div>
        <p class="mb-3 font-display text-[1.28rem] leading-none tracking-[-0.03em] text-white/82 md:text-[1.62rem]">${textFor(
          home.focus.title,
          lang
        )}</p>
      </div>
        <p class="max-w-3xl text-base leading-8 text-white/74 md:text-lg">${textFor(home.focus.intro, lang)}</p>
      </div>
      <div class="relative z-[1] mt-10 grid gap-4 md:grid-cols-2">
        ${home.focus.items
          .map(
            (item) => `
              <article class="section-reveal focus-glass-card rounded-[1.7rem] border bg-[rgba(19,23,28,0.72)] p-6 backdrop-blur-md md:p-7">
                <div class="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-3.5 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white md:text-[0.82rem]">
                  ${renderFocusIcon(item)}
                  <span>${textFor(item.title, lang)}</span>
                </div>
                <p class="mt-5 max-w-xl text-base leading-7 text-white/92 md:text-[1.02rem]">${textFor(item.text, lang)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  </section>
`;

const renderPortfolioSection = (home, categories, ui, lang) => `
  <section id="portfolio" class="container-wide py-20 md:py-28">
    ${createSectionIntro(textFor(home.portfolio.title, lang), textFor(home.portfolio.intro, lang))}
    <div class="mt-10 flex flex-wrap gap-3 section-reveal" id="portfolio-filters">
      <button class="${portfolioChipClass(true)}" data-filter="all">
        ${textFor(ui.labels.all, lang)}
      </button>
      ${categories
        .map(
          (category) => `
            <button
              class="${portfolioChipClass(false)}"
              data-filter="${category.key || category.id}"
            >
              ${lang === "ru" ? category.title_ru : category.title_en}
            </button>
          `
        )
        .join("")}
    </div>
    <div id="portfolio-grid" class="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3"></div>
  </section>
`;

const renderPortfolioCards = (categories, cases, ui, lang, filter) => {
  const categoryMap = new Map(
    categories.flatMap((item) => [
      [item.key, item],
      [item.id, item],
      [item.slug, item]
    ])
  );
  const filtered =
    filter === "all"
      ? cases
      : cases.filter((item) => {
          const category = resolveCategory(categories, item.category);
          if (!category) {
            return item.category === filter;
          }

          return (category.key || category.id || category.slug) === filter;
        });
  const sorted = [...filtered].sort((a, b) => a.order - b.order);

  return sorted
    .map((item, index) => {
      const category = categoryMap.get(item.category);
      const categoryName = category
        ? (lang === "ru" ? category.title_ru : category.title_en)
        : item.category;
      const title = lang === "ru" ? item.title_ru : item.title_en;
      const summary = lang === "ru" ? item.summary_ru : item.summary_en;
      const wideClass = index === 0 ? "md:col-span-2 2xl:col-span-2" : "";

      return `
        <a
          href="${caseHref(item.slug, lang)}"
          class="section-reveal card-tilt glass-edge group flex h-full flex-col overflow-hidden rounded-[1.8rem] border bg-white/80 ${wideClass}"
        >
          <div class="overflow-hidden">
            <img
              class="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-72"
              src="${assetUrl(item.cover)}"
              alt="${title}"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
            />
          </div>
          <div class="flex flex-1 flex-col gap-3 p-5 md:p-6">
            <p class="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink/45">${categoryName}</p>
            <h3 class="text-[1.32rem] font-normal tracking-[-0.025em] md:text-[1.48rem]">${title}</h3>
            <p class="max-w-xl text-sm leading-7 text-ink/72 md:text-base">${summary}</p>
            <div class="mt-auto flex items-center justify-between pt-4">
              <span class="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span>${textFor(ui.labels.openCase, lang)}</span>
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M7 17L17 7"></path>
                  <path d="M9 7h8v8"></path>
                </svg>
              </span>
              <span class="rounded-full border border-accent/20 bg-accentSoft px-3 py-1.5 text-xs font-medium text-white">${item.year || ""}</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
};

const renderAbout = (home, lang) => `
  <section id="about" class="container-wide py-20 md:py-28">
    <div class="section-reveal grid gap-8 md:grid-cols-[340px_minmax(0,1fr)] md:items-start">
      <div>
        <p class="mb-3 font-display text-[1.24rem] leading-none tracking-[-0.03em] text-ink/62 md:text-[1.56rem]">${textFor(
          home.about.title,
          lang
        )}</p>
      </div>
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div class="space-y-6 text-base leading-8 text-ink/72 md:text-lg">
          ${home.about.paragraphs.map((paragraph) => `<p>${textFor(paragraph, lang)}</p>`).join("")}
        </div>
        <div class="glass-edge rounded-[1.8rem] border bg-white/72 p-6 md:p-7">
          <p class="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink/50">
            ${lang === "ru" ? "Принципы" : "Principles"}
          </p>
          <div class="space-y-3">
            ${home.about.principles
              .map(
                (principle) => `
                  <div class="rounded-2xl bg-panel px-4 py-4 text-sm font-semibold leading-6 text-ink md:text-base">
                    ${textFor(principle, lang)}
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  </section>
`;

const renderContacts = (home, site, ui, lang) => {
  const links = [
    { id: "phone", value: site.phone, href: `tel:${site.phone.replace(/[^\d+]/g, "")}` },
    { id: "telegram", value: site.telegram, href: site.telegram },
    { id: "email", value: site.email, href: `mailto:${site.email}` }
  ];

  if (lang === "en" && site.linkedin) {
    links.push({ id: "linkedin", value: site.linkedin, href: site.linkedin });
  }

  return `
    <section id="contact" class="container-wide py-20 md:py-28">
      <div class="section-reveal grain relative overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-white md:px-10 md:py-12">
        <div class="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p class="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/45">
              ${textFor(home.contact.title, lang)}
            </p>
            <h2 class="max-w-3xl font-display text-[2.5rem] leading-[0.98] tracking-[-0.05em] md:text-[3.9rem]">
              ${textFor(home.contact.text, lang)}
            </h2>
          </div>
          <div class="grid gap-3 self-end">
            ${links
              .map(
                (item) => `
                  <a
                    class="group flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/[0.07] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-white/18 hover:bg-white/[0.11]"
                    href="${item.href}"
                    target="${item.href.startsWith("http") ? "_blank" : "_self"}"
                    rel="${item.href.startsWith("http") ? "noreferrer" : ""}"
                  >
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/92 transition group-hover:border-white/20 group-hover:bg-white/[0.1]">
                        ${contactIcon(item.id)}
                      </span>
                      <div class="min-w-0">
                        <span class="block text-[0.72rem] font-medium uppercase tracking-[0.16em] text-white/45">${textFor(
                          ui.labels[item.id],
                          lang
                        )}</span>
                        <span class="mt-1 block truncate text-sm font-semibold text-white/95 md:text-base">${item.value}</span>
                      </div>
                    </div>
                    <span class="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/74 transition group-hover:border-white/18 group-hover:text-white">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M7 17L17 7"></path>
                        <path d="M9 7h8v8"></path>
                      </svg>
                    </span>
                  </a>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
};

const renderFooter = (home, site, lang) => `
  <footer class="container-wide pb-8">
    <div class="section-reveal divider-line h-px w-full"></div>
    <div class="section-reveal flex flex-col gap-2 py-5 text-sm text-ink/55 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-col md:flex-row md:items-center md:gap-3">
        <span class="font-semibold text-ink">${textFor(home.footer.title, lang)}</span>
        <span>${textFor(home.footer.role, lang)}</span>
      </div>
      <span>© ${site.footer_year}</span>
    </div>
  </footer>
`;

const renderHome = (data, lang) => {
  const { site, navigation, ui, home, categories } = data;

  return `
    ${renderHeader(site, navigation, ui, lang)}
    <main>
      ${renderHero(home, ui, lang)}
      ${renderProofPoints(home.proof_points, lang)}
      ${renderFocus(home, lang)}
      ${renderPortfolioSection(home, categories, ui, lang)}
      ${renderAbout(home, lang)}
      ${renderContacts(home, site, ui, lang)}
    </main>
    ${renderFooter(home, site, lang)}
  `;
};

const renderCase = (data, lang, slug) => {
  const { site, navigation, ui, categories, cases } = data;
  const item = cases.find((entry) => entry.slug === slug);

  if (!item) {
    return `
      ${renderHeader(site, navigation, ui, lang)}
      <main class="container-copy py-20 md:py-28">
        <section class="section-reveal glass-edge rounded-[2rem] border bg-white/75 p-8 md:p-12">
          <p class="mb-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink/45">${textFor(
            ui.labels.notFound,
            lang
          )}</p>
          <h1 class="font-display text-4xl tracking-[-0.05em] md:text-6xl">${textFor(ui.labels.notFound, lang)}</h1>
          <p class="mt-5 max-w-xl text-base leading-7 text-ink/70">${textFor(ui.labels.notFoundText, lang)}</p>
          <a class="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" href="${portfolioHref(lang)}">
            <span>${textFor(ui.labels.backToPortfolio, lang)}</span>
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17L17 7"></path>
              <path d="M9 7h8v8"></path>
            </svg>
          </a>
        </section>
      </main>
    `;
  }

  const category = resolveCategory(categories, item.category);
  const title = lang === "ru" ? item.title_ru : item.title_en;
  const summary = lang === "ru" ? item.summary_ru : item.summary_en;
  const categoryName = category ? (lang === "ru" ? category.title_ru : category.title_en) : item.category;

  return `
    ${renderHeader(site, navigation, ui, lang)}
    <main class="container-wide py-14 md:py-22">
      <section class="section-reveal glass-edge overflow-hidden rounded-[2rem] border bg-white/78 p-6 md:p-8">
        <a class="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-accentSoft" href="${portfolioHref(lang)}">
          <span>${textFor(ui.labels.backToPortfolio, lang)}</span>
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17L17 7"></path>
            <path d="M9 7h8v8"></path>
          </svg>
        </a>
        <div class="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div class="max-w-xl">
            <p class="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink/45">${categoryName}</p>
            <h1 class="font-display text-[2.6rem] leading-[0.98] tracking-[-0.035em] md:text-[4rem]">${title}</h1>
            <p class="mt-6 text-base leading-7 text-ink/72 md:text-lg">${summary}</p>
            <div class="mt-8 flex flex-wrap gap-3">
              ${item.year ? `<div class="rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-semibold text-white">${item.year}</div>` : ""}
              ${
                item.link
                  ? `<a class="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white" href="${item.link}" target="_blank" rel="noreferrer"><span>${textFor(ui.labels.visitLink, lang)}</span><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"></path><path d="M9 7h8v8"></path></svg></a>`
                  : ""
              }
            </div>
          </div>
          <div class="glass-edge overflow-hidden rounded-[1.6rem] border bg-panel">
            <img
              class="h-[320px] w-full object-cover md:h-[460px]"
              src="${assetUrl(item.cover)}"
              alt="${title}"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
      </section>
      ${
        Array.isArray(item.gallery) && item.gallery.length > 0
          ? `
            <section class="py-14 md:py-22">
              <div class="section-reveal grid gap-5 md:grid-cols-2">
                ${item.gallery
                  .map(
                    (image, index) => `
                      <figure class="card-tilt glass-edge overflow-hidden rounded-[1.8rem] border bg-white/78">
                        <img
                          class="h-[280px] w-full object-cover md:h-[380px]"
                          src="${assetUrl(image)}"
                          alt="${title} ${index + 1}"
                          loading="lazy"
                          fetchpriority="low"
                          decoding="async"
                        />
                      </figure>
                    `
                  )
                  .join("")}
              </div>
            </section>
          `
          : ""
      }
    </main>
    ${renderFooter(data.home, site, lang)}
  `;
};

const wireInteractions = (categories, cases, ui, lang) => {
  const filters = document.getElementById("portfolio-filters");
  const grid = document.getElementById("portfolio-grid");

  if (!filters || !grid) {
    return;
  }

  const renderGrid = (filter) => {
    state.activeCategory = filter;
    grid.innerHTML = renderPortfolioCards(categories, cases, ui, lang, filter);
    revealObserved();
  };

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) {
      return;
    }

    const nextFilter = button.dataset.filter;
    renderGrid(nextFilter);

    [...filters.querySelectorAll("[data-filter]")].forEach((item) => {
      const isActive = item.dataset.filter === nextFilter;
      item.className = portfolioChipClass(isActive);
    });
  });

  renderGrid(state.activeCategory);
};

let revealObserver;

const revealObserved = () => {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".section-reveal").forEach((node) => node.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
  }

  document.querySelectorAll(".section-reveal:not(.is-visible)").forEach((node) => revealObserver.observe(node));
};

const scrollToHashTarget = () => {
  const hash = window.location.hash;
  if (!hash || hash === "#") {
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
  });
};

const loadData = async () => {
  const [site, navigation, ui, home, categories, cases] = await Promise.all([
    loadJSON("globals/site.json"),
    loadJSON("globals/navigation.json"),
    loadJSON("globals/ui.json"),
    loadJSON("pages/home.json"),
    loadJSON("collections/categories.json"),
    loadJSON("collections/cases.json")
  ]);

  return {
    site,
    navigation,
    ui,
    home,
    categories: toArray(categories)
      .map(normalizeCategory)
      .filter(Boolean)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    cases: toArray(cases)
      .map(normalizeCase)
      .filter(Boolean)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  };
};

const mount = async () => {
  const app = document.getElementById("app");

  try {
    const data = await loadData();
    state.data = data;
    state.lang = detectLang(data.site);
    applyTheme(data.site.theme);
    applySiteAssets(data.site);

    const route = routeInfo();
    if (route.type === "case") {
      app.innerHTML = renderCase(data, state.lang, route.slug);
    } else {
      app.innerHTML = renderHome(data, state.lang);
      wireInteractions(data.categories, data.cases, data.ui, state.lang);
    }

    document.documentElement.lang = state.lang;
    applyPageMeta(data, state.lang, route);
    revealObserved();
    scrollToHashTarget();
  } catch (error) {
    console.error(error);
    app.innerHTML = `
      <main class="container-shell py-16">
        <div class="rounded-[2rem] border border-line bg-white/80 p-8">
          <p class="text-sm font-medium text-ink/70">Failed to load the portfolio content.</p>
        </div>
      </main>
    `;
  }
};

mount();
