# Sundello Homes website (`sundello.com`)

This is the only instruction file for this repo. `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` only point here. If a tool loads one of those, come back and follow this file.

Sundello Homes markets compact 320 sq ft (20 × 16 ft) homes. The public site is a small hand-written static site: HTML, CSS, and vanilla JavaScript. No framework, no build. Blair owns it and is the only person who merges to `main`.

One page per home, plus a workforce hub. `/` is the site landing. It points people to the homes and to workforce. Do not put a single model back on `/`.

Public pages:

- **Home** (`/`): landing for the homes and for workforce.
- **Origin 320** (`/origin/`): a studio home with flat or pitched roof options and regional finish palettes, for individual buyers. It has a quote form (`#contact`) and links to the customizer at `/origin/customize/`. The approved price wording is “Starting at $99,000 plus site work and permits”, confirmed by Blair on October 10, 2026. Use those words exactly, on the Origin page and the customizer.
- **AVA 320** (`/ava/`): a 320 sq ft accessory dwelling unit (ADU), same size class as Origin. The foundation is helical ground screws. Its price wording is Blair’s approved “Starting under $100K plus dirtwork.” Use it on this page only. The page is `noindex` and is left out of the sitemap on purpose. Keep it that way until Blair decides to launch it. Do not add another price, a payment plan, or a comparison.
- **Workforce** (`/workforce/`): hub for work housing. People choose an offering here (Outpost or Haven), not a square-footage option.
- **Outpost 320** (`/workforce/outpost/`): single-occupancy workforce housing for employers and project sites.
- **Haven 320** (`/workforce/haven/`): private homes for healthcare travelers, written for housing operators ("For services") and hospitals ("For hospitals").

Each home model page (`/origin/`, `/ava/`, and any future home) has a square-foot selector at the top. The only size today is 320, marked current. Add a future size as another link in that list. Do not redesign the page to do it.

`/outpost/` and `/haven/` are old addresses. Each is a short `noindex` page with a meta refresh and a link to the new path, so a bookmark still resolves. They are not canonical and they are not in the sitemap. Do not add `_redirects` for them.

Do not publish AVA specs Blair has not stated. For AVA that set is: 320 sq ft ADU, helical ground screws, and “Starting under $100K plus dirtwork.”

## Where the files are

The GitHub root is not the website. Publish `sundello-github/dist/` only.

| Path | What it is |
|---|---|
| `sundello-github/dist/` | The website. This is the only folder a host may publish. |
| `sundello-github/dist/index.html` | Site landing (`/`) |
| `sundello-github/dist/origin/index.html` | Origin 320 (`/origin/`) |
| `sundello-github/dist/ava/index.html` | AVA 320 (`/ava/`) |
| `sundello-github/dist/workforce/index.html` | Workforce hub (`/workforce/`) |
| `sundello-github/dist/workforce/outpost/index.html` | Outpost 320 (`/workforce/outpost/`) |
| `sundello-github/dist/workforce/haven/index.html` | Haven 320 (`/workforce/haven/`) |
| `sundello-github/dist/origin/customize/index.html` | Origin customizer (`/origin/customize/`) |
| `sundello-github/dist/privacy/index.html` | Privacy page (`/privacy/`). Draft, needs legal review. |
| `sundello-github/dist/terms/index.html` | Terms page (`/terms/`). Draft, needs legal review. |
| `sundello-github/dist/legal.css` | Styles for the privacy and terms pages |
| `sundello-github/dist/assets/sundello-config.js` | Span business id and base URL. The Origin quote form, the customizer and the chat bubble read it. |
| `sundello-github/dist/assets/og-sundello.png` | 1200 × 630 social preview image used by `og:image` and `twitter:image` |
| `sundello-github/dist/favicon.ico` | 16, 32 and 48 px icon. Pages also link the SVG mark. |
| `sundello-github/dist/outpost/index.html` | Old-address courtesy page for `/outpost/` |
| `sundello-github/dist/haven/index.html` | Old-address courtesy page for `/haven/` |
| `sundello-github/dist/styles.css` | Site styles and the design tokens |
| `sundello-github/dist/navigation.css` | Shared header. This is the file the pages load. |
| `sundello-github/dist/navigation.js` | Shared header menu behavior |
| `sundello-github/concepts/` | Old drafts (Sundial, and an older standalone Haven). Not the live site. Do not edit them as if they were, and do not publish them. |

`sundello-github/dist/workforce/haven/navigation.css` and `sundello-github/dist/workforce/haven/navigation.js` are unused copies. Haven loads `../../navigation.css` and `../../navigation.js`. Editing the copies inside `workforce/haven/` does not change the page. The old root `app.js` (an earlier Origin region picker) was unused and has been deleted.

`sundello-github/dist/assets/hero.webp` is not referenced by any page. Leave it.

Header, footer, and page copy are written into each HTML file. There is no shared template and there must not be a build step to create one. The HTML, CSS, and JS are packed onto long lines. Edit the exact text you mean to change. Do not reflow a whole file unless that is the task. A footer change is one edit per page (ten pages, including the courtesy pages and `404.html`).

## Preview locally

From the repo root:

```bash
python3 -m http.server --directory sundello-github/dist
```

Open `http://127.0.0.1:8000/`. Check `/`, `/origin/`, `/origin/customize/`, `/ava/`, `/workforce/`, `/workforce/outpost/`, `/workforce/haven/`, `/privacy/`, `/terms/`, and the old-address pages `/outpost/` and `/haven/`.

Python’s server does not use `404.html` for unknown paths. Open `http://127.0.0.1:8000/404.html` to preview the not-found page. On Cloudflare Pages, that file is the body of a real 404 for any missing URL, so every asset and link in `404.html` stays root-absolute (`/styles.css`, not `styles.css`).

## Brand

Use the existing tokens and classes. Do not restyle the site for its own sake.

Tokens in `sundello-github/dist/styles.css` (a later `:root` in that file wins where they disagree):

- `--ink: #193E34`
- `--paper: #F6F0E5`
- `--muted: #526257` (an earlier block sets `#52605B`)
- `--accent: #AD563D`
- `--amber: #E6B65B`
- `--line: #C5CEB9`
- Type: `'Inter Display'` for headings, `'Inter'` for body, Arial fallback. Fonts are self-hosted under `sundello-github/dist/assets/fonts/` (SIL Open Font License). Do not add a font service.

Reuse `.button`, `.button.light`, `.button.dark`, `.text-link`, `.eyebrow`, `.section`, `.nav-cta`, and `.site-header`.

`#AD563D` on `#F6F0E5` is about 4.4:1. Do not use the accent for small text such as form errors or labels.

Approved partnership fact, not yet on the site: Sundello is a partnership between Enterlectual and Green Building Solutions USA (`https://gbs-usa.build`).

Approved product sentence, not yet on the site. Use it verbatim if a task asks for it. Do not add approval numbers, NOA codes, wind speeds, fire durations, "code-approved", "certified", or anything like them:

> Sundello homes are built with non-combustible, fire- and hurricane-rated MgO and steel materials from Green Building Solutions USA, with Florida and Miami-Dade approval.

Blair’s other allowed wording, also verbatim, is: "Sundello homes are built with GBS's non-combustible, fire- and hurricane-rated MgO and steel materials, with Florida and Miami-Dade approval." Only the placement of the link to `https://gbs-usa.build` may change. Same tab. Do not add `nofollow`.

## Hard rules

- No framework, no bundler, no `package.json`, no npm, no Node build, no React/Vue/Next, no templating step, no site generator.
- Near-zero cost, simple enough for one person. Cloudflare Pages on the free plan is the host. Do not add paid services, analytics, trackers, cookies, or a form backend unless Blair asks in that task.
- Do not invent email addresses, phone numbers, street addresses, service areas, legal entity names, prices, ratings, certifications, warranties, lead times, testimonials, or project examples. If it is not already on a public page or written in this file as approved, leave it out. The two approved price lines in the Hard rules below are the only prices.
- Do not publish placeholder contact details. Never replace live copy with a `PLACEHOLDER_` token or a guess. Never render a `mailto:` or `tel:` link that points at a placeholder.
- There is no phone number on the site. Do not add one.
- The only email shown on a live page is the Haven mailbox in `sundello-github/dist/workforce/haven/index.html` (`#form-note`) and `sundello-github/dist/workforce/haven/app.js`. Leave it until Blair decides. Do not copy it onto other pages. The courtesy page at `sundello-github/dist/haven/index.html` must not include it. The sales fallback address in the Origin quote form and customizer (see the Sales email item below) is shown only if the lead system cannot be reached. Do not print it on any page.
- Origin quote form and customizer: both post to the Span lead intake. The business id and base URL are in `sundello-github/dist/assets/sundello-config.js` (`SPAN_BUSINESS_ID`, `SPAN_BASE`, which is `https://span.scaffold.site`). The code is `sundello-github/dist/origin-contact.js` (quote form) and `sundello-github/dist/origin/customize/customize.js` (customizer), with shared helpers in `sundello-github/dist/assets/sundello-span.js` and `sundello-config.js`. If Span cannot be reached or rejects the request, both fall back to a `mailto:` for the sales address in their `SALES_EMAIL` constant, which is `todd.ellis@gbs-usa.build`, and offer Copy inquiry. Blair has not said whether that is the right fallback address. Do not change it, and do not touch these two files unless the task is about the form.
- Keep each page’s footer text as it is. Do not add a copyright line that is not already there. The one addition is the Privacy and Terms links that close every page’s footer.
- Never touch email DNS. MX, SPF, DKIM, and DMARC stay as they are. Sundello mail is at IONOS. A bad edit can break it. Do not add a second SPF record.
- The Cloudflare cutover is done. `https://sundello.com` is served by the Cloudflare Pages project, and `https://www.sundello.com` redirects to the apex. Do not change DNS records, nameservers, or the `www` redirect as part of content work. Only the cutover itself (already finished) was allowed to.
- Do not add prices, price ranges, financing terms, or cost comparisons. Two price lines are approved, each on its own pages only. Origin (`/origin/` and `/origin/customize/`): “Starting at $99,000 plus site work and permits”, confirmed by Blair on October 10, 2026. AVA (`/ava/`): “Starting under $100K plus dirtwork.” Do not put the AVA sentence on the landing page, Origin, Outpost, Haven, or the workforce hub. Never show the internal ADU budget figure Blair uses. It must not appear on any page, in any asset, or in this repo. A hidden HTML comment such as `<!-- PRICING ON HOLD. PRICE_SLOT: ORIGIN_320_STARTING_PRICE. Do not render until Blair approves. -->` is allowed only when a task asks for a slot. Those comments must not use a `PLACEHOLDER_` prefix, and nothing in the comment may render.
- No wood, anywhere. Sundello homes are steel frame with MgO walls on American Ground Screw helical ground screws. Do not write wood, cedar, oak, lumber, timber, or stud-framing words in copy, alt text, file names, comments, JSON or PDFs, and do not add renders that show wood. Check with a case-insensitive search over the whole publish folder before every PR.
- Do not create a new ChatGPT Site, and do not publish this checkout as a new Sites project. `.openai/hosting.json` is not in this repo. The old host was a ChatGPT Site. This repo replaces that workflow.
- `sundello-github/dist/` is the only publishable folder. Notes and instructions stay outside it.
- Do not add `X-Content-Type-Options: nosniff`.

## Workflow

1. Branch from `main`.
2. Edit `sundello-github/dist/` for anything the browser should show. Put unpublished notes next to it, not inside it.
3. Preview with the command above. Click every link you touched.
4. Open a pull request. Describe what changed, what you did not do, and why.
5. After the Pages project exists, the PR gets a Cloudflare preview URL. Check that, not only your laptop.
6. Stop. Blair reviews and merges. A merge to `main` is what deploys. Do not merge your own PR.

A merge to `main` deploys through the Cloudflare Pages project. The live site is `https://sundello.com`, and `www` redirects to it. Do not merge your own PR. Check the Cloudflare preview URL on the PR as well as your local preview.

## Cloudflare Pages

The Pages project is already connected to this repo. Its settings are:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | empty (no build) |
| Build output directory | `sundello-github/dist` |
| Root directory | `/` (repository root) |
| Pull request previews | On |
| Environment variables | none |

Do not add `wrangler.toml`, `package.json`, `vercel.json`, a Pages Function, or `_redirects`. Do not set a custom domain in the same step as ordinary content edits. Do not add a catch-all redirect to `index.html`. Unknown URLs must 404. Old `/outpost/` and `/haven/` are courtesy pages in the publish folder (`noindex`, a meta refresh, and a link). They are not a catch-all.

There is no `_headers` file. Cloudflare Pages already serves `.webp` as `image/webp`. A `_headers` rule for `.webp` on Blair’s other site produced a duplicated `image/webp, image/webp` header, so do not add one. Do not add `nosniff`. The previous host (the ChatGPT Site) sent `application/octet-stream` for `.webp`; that was the host, not the files. Browsers still showed the images because nothing sent `nosniff`.

`404.html` is served automatically for unknown paths, with a 404 status. Keep it. It is `noindex` and is not in the sitemap.

`robots.txt` allows the site and points at the sitemap. It also disallows `/api/` and `/thanks/`. Those URLs are not pages. The disallows are there so a future form handler or thank-you page is not indexed by accident. Do not build either unless Blair asks.

`sitemap.xml` lists only:

- `https://sundello.com/`
- `https://sundello.com/origin/`
- `https://sundello.com/origin/customize/`
- `https://sundello.com/workforce/`
- `https://sundello.com/workforce/outpost/`
- `https://sundello.com/workforce/haven/`
- `https://sundello.com/privacy/`
- `https://sundello.com/terms/`

`/ava/` is deliberately not in the sitemap and is `noindex`. Do not add it until Blair launches it. `/about/` does not exist. Do not add `concepts/` paths. They are not in the published folder. Add a `lastmod` when you change a page.

Canonical and `og:url` on the public pages:

- `https://sundello.com/`
- `https://sundello.com/origin/`
- `https://sundello.com/origin/customize/`
- `https://sundello.com/ava/`
- `https://sundello.com/workforce/`
- `https://sundello.com/workforce/outpost/`
- `https://sundello.com/workforce/haven/`
- `https://sundello.com/privacy/`
- `https://sundello.com/terms/`

The courtesy pages at `/outpost/` and `/haven/` are `noindex` and point their canonical at the new workforce URLs. Do not list them in the sitemap.

Do not change existing titles or descriptions unless the task says to. Origin, Outpost, and Haven keep the descriptions they had before the path move. Origin’s title is `Sundello Origin 320` because `/` is the site landing, not the Origin page. The landing, AVA, and workforce pages have their own titles and descriptions.

Social previews: the landing, Origin, customizer, AVA, workforce, Outpost, privacy and terms pages use `https://sundello.com/assets/og-sundello.png` (1200 × 630, flat deep green with the wordmark) in `og:image` and `twitter:image`, with `twitter:card` set to `summary_large_image`. Haven keeps its own `og:image`. Every page has a footer link to `/privacy/` and `/terms/`.

## Checks before a PR

```bash
python3 -m http.server --directory sundello-github/dist
```

Confirm `/`, `/origin/`, `/origin/customize/`, `/ava/`, `/workforce/`, `/workforce/outpost/`, `/workforce/haven/`, `/privacy/`, `/terms/`, `/outpost/`, `/haven/`, and `/404.html` return 200. Confirm the Haven mailbox is still as it was, unless the task was to change it. Confirm the prices appear only where approved:

```bash
grep -n "blair@enterlectual.com" sundello-github/dist/workforce/haven/index.html sundello-github/dist/workforce/haven/app.js
grep -n "SALES_EMAIL" sundello-github/dist/origin-contact.js sundello-github/dist/origin/customize/customize.js
grep -n "Starting under \$100K plus dirtwork" sundello-github/dist/ava/index.html
grep -R "Starting under \$100K" sundello-github/dist --include='*.html' --include='*.js'
grep -R "Starting at \$99,000" sundello-github/dist --include='*.html' --include='*.js' --include='*.json'
grep -rniE "wood|cedar|oak|lumber|timber" sundello-github/dist --include='*.html' --include='*.js' --include='*.json' --include='*.css' --include='*.svg' --include='*.xml'
```

## Known open items

Blair has not answered these. Do not guess, and do not build them as a side effect of another task.

1. **Haven mailbox.** `blair@enterlectual.com` is on the live Haven page, in `sundello-github/dist/workforce/haven/index.html` and `sundello-github/dist/workforce/haven/app.js`. It is already public. Leave it until Blair replaces that form. The same address is in the unused draft `sundello-github/concepts/haven/`. Leave the draft alone.
2. **Sales email and fallback.** The Origin quote form and the customizer fall back to `mailto:todd.ellis@gbs-usa.build` only when Span cannot take the lead. Blair has not said whether that is the right fallback address or whether a dedicated sales address is coming. Do not invent one.
3. **Mobile header.** In `sundello-github/dist/navigation.css`, `.site-header > .nav-cta` is `display: none` below 1000px, and `.site-header nav > a` is `display: none` below 700px. On a phone the header keeps the Homes and Workforce menus (`details`). Leave that CSS until Blair decides.
4. **Lead forms.** The Origin quote form and the customizer post to Span (see above). Outpost has no form. Haven opens a `mailto:` to the mailbox above, and replacing it with the Span form is a later task. Do not add a thank-you page or `/api/` unless a task asks for one. There is no analytics, no tracking script and no cookie code on the site. Keep it that way.
5. **Phone, service area, legal name.** None of these are on the site. Do not add them.
6. **Privacy and terms.** `/privacy/` and `/terms/` are drafts written from what the site does. They must be reviewed by legal before launch. They name no legal entity, address or jurisdiction, and show no contact email. Do not add those without Blair. There is no `/about/` page.
7. **GBS sentence.** The approved sentence in the Brand section is not on the site. Do not add it unless the task asks.
8. **www.** Done. `https://www.sundello.com/` redirects to the apex. Leave it.
9. **Domain cutover.** Done. Leave MX, SPF, DKIM, and DMARC alone. Do not touch DNS as a side effect of a content PR.
10. **Search Console.** Not set up in this repo. Blair can add the property later and submit `https://sundello.com/sitemap.xml`.
11. **Prices.** Approved: Origin “Starting at $99,000 plus site work and permits” (Blair, October 10, 2026) and AVA “Starting under $100K plus dirtwork.” Nothing else. See Hard rules.
12. **Home footer brand.** On `sundello-github/dist/index.html` the footer logo points at `#`, so it jumps to the top of the page. The header logo points at `/`. The Origin page footer logo also points at `#`. Leave those unless a task says otherwise.
13. **Brand names in the customizer.** The customizer names product makers such as Behr, LifeProof, JELD-WEN, Therma-Tru and Masonite. Blair has not decided whether to keep, get permission for, or genericize them. Do not change them.
14. **Siding material.** The “primed siding” and “Deep forest siding” wording does not say what the material is. Do not guess one.
15. **Wood in renders and the style guide.** Some concept renders show wood-look porches, decks, floors or accents, and `assets/origin-style-guide.pdf` mentions “wood tones”. Copy and alt text are clean, but those files need new imagery or text from Blair. Do not add new renders with wood.
