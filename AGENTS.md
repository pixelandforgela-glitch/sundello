# Sundello Homes website (`sundello.com`)

This is the only instruction file for this repo. `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` only point here. If a tool loads one of those, come back and follow this file.

Sundello Homes markets compact 320 sq ft (20 × 16 ft) homes. The public site is a small hand-written static site: HTML, CSS, and vanilla JavaScript. No framework, no build. Blair owns it and is the only person who merges to `main`.

Three public pages:

- **Origin 320** (`/`): a studio home with flat or pitched roof options and regional finish palettes, for individual buyers.
- **Outpost 320** (`/outpost/`): single-occupancy workforce housing for employers and project sites.
- **Haven 320** (`/haven/`): private homes for healthcare travelers, written for housing operators ("For services") and hospitals ("For hospitals").

## Where the files are

The GitHub root is not the website. Publish `sundello-github/dist/` only.

| Path | What it is |
|---|---|
| `sundello-github/dist/` | The website. This is the only folder a host may publish. |
| `sundello-github/dist/index.html` | Origin 320, the home page (`/`) |
| `sundello-github/dist/outpost/index.html` | Outpost 320 (`/outpost/`) |
| `sundello-github/dist/haven/index.html` | Haven 320 (`/haven/`) |
| `sundello-github/dist/styles.css` | Site styles and the design tokens |
| `sundello-github/dist/navigation.css` | Shared header. This is the file the pages load. |
| `sundello-github/dist/navigation.js` | Shared header menu behavior |
| `sundello-github/concepts/` | Old drafts (Sundial, and an older standalone Haven). Not the live site. Do not edit them as if they were, and do not publish them. |

`sundello-github/dist/haven/navigation.css` and `sundello-github/dist/haven/navigation.js` are unused copies. Haven loads `../navigation.css` and `../navigation.js`. Editing the copies inside `haven/` does not change the page.

`sundello-github/dist/assets/hero.webp` is not referenced by any page. Leave it.

Header, footer, and page copy are written into each HTML file. There is no shared template and there must not be a build step to create one. The HTML, CSS, and JS are packed onto long lines. Edit the exact text you mean to change. Do not reflow a whole file unless that is the task. A footer change is three edits.

## Preview locally

From the repo root:

```bash
python3 -m http.server --directory sundello-github/dist
```

Open `http://127.0.0.1:8000/`. Check `/`, `/outpost/`, and `/haven/`.

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
- Do not invent email addresses, phone numbers, street addresses, service areas, legal entity names, prices, ratings, certifications, warranties, lead times, testimonials, or project examples. If it is not already on a public page or written in this file as approved, leave it out.
- Do not publish placeholder contact details. Never replace live copy with a `PLACEHOLDER_` token or a guess. Never render a `mailto:` or `tel:` link that points at a placeholder.
- There is no phone number on the site. Do not add one.
- The only email on a live page is the Haven mailbox in `sundello-github/dist/haven/index.html` (`#form-note`) and `sundello-github/dist/haven/app.js`. Leave it until Blair decides. Do not copy it onto other pages.
- `const SALES_EMAIL='';` in `sundello-github/dist/app.js` is empty on purpose. While it is empty, the home contact action stays the style-guide PDF. Do not fill it with a guessed address.
- Keep each page’s footer text as it is. Do not add a copyright line that is not already there.
- Never touch email DNS. MX, SPF, DKIM, and DMARC stay as they are. Sundello mail is at IONOS. A bad edit can break it. Do not add a second SPF record.
- DNS stays at IONOS. Pointing `sundello.com` at Cloudflare Pages is a later cutover. It is not part of ordinary content work. Do not change nameservers, A records, or the apex verification TXT unless Blair’s task is the cutover itself.
- Do not add prices, price ranges, "starting at" figures, financing terms, or cost comparisons. A hidden HTML comment such as `<!-- PRICING ON HOLD. PRICE_SLOT: ORIGIN_320_STARTING_PRICE. Do not render until Blair approves. -->` is allowed only when a task asks for a slot. Those comments must not use a `PLACEHOLDER_` prefix, and nothing may render.
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

Until Blair connects this repo in Cloudflare Pages **and** later cuts the domain over at IONOS, a merge updates GitHub only. `https://sundello.com` is still the existing ChatGPT Site until that cutover. Do not expect a git push, by itself, to change the live domain today.

## Cloudflare Pages

Blair connects the GitHub repo once, in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git). Use the free plan. Settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | empty (no build) |
| Build output directory | `sundello-github/dist` |
| Root directory | `/` (repository root) |
| Pull request previews | On |
| Environment variables | none |

Do not add `wrangler.toml`, `package.json`, `vercel.json`, a Pages Function, or `_redirects`. Do not set a custom domain in the same step as ordinary content edits. Do not add a catch-all redirect to `index.html`. Unknown URLs must 404.

There is no `_headers` file. Cloudflare Pages already serves `.webp` as `image/webp`. A `_headers` rule for `.webp` on Blair’s other site produced a duplicated `image/webp, image/webp` header, so do not add one. Do not add `nosniff`. The previous host (the ChatGPT Site) sent `application/octet-stream` for `.webp`; that was the host, not the files. Browsers still showed the images because nothing sent `nosniff`.

`404.html` is served automatically for unknown paths, with a 404 status. Keep it. It is `noindex` and is not in the sitemap.

`robots.txt` allows the site and points at the sitemap. It also disallows `/api/` and `/thanks/`. Those URLs are not pages. The disallows are there so a future form handler or thank-you page is not indexed by accident. Do not build either unless Blair asks.

`sitemap.xml` lists only:

- `https://sundello.com/`
- `https://sundello.com/outpost/`
- `https://sundello.com/haven/`

Do not add `/privacy/`, `/terms/`, or `/about/` until those pages exist and Blair says the content is final. Do not add `concepts/` paths. They are not in the published folder.

Canonical and `og:url` on the three public pages:

- `https://sundello.com/`
- `https://sundello.com/outpost/`
- `https://sundello.com/haven/`

Do not change existing titles or descriptions unless the task says to.

## Checks before a PR

```bash
python3 -m http.server --directory sundello-github/dist
```

Confirm `/`, `/outpost/`, `/haven/`, and `/404.html` return 200. Confirm the Haven mailbox and the empty `SALES_EMAIL` are still as they were, unless the task was to change them:

```bash
grep -n "blair@enterlectual.com" sundello-github/dist/haven/index.html sundello-github/dist/haven/app.js
grep -n "SALES_EMAIL" sundello-github/dist/app.js
```

## Known open items

Blair has not answered these. Do not guess, and do not build them as a side effect of another task.

1. **Haven mailbox.** `blair@enterlectual.com` is on the live Haven page, in `sundello-github/dist/haven/index.html` and `sundello-github/dist/haven/app.js`. It is already public. Leave it until Blair replaces that form. The same address is in the unused draft `sundello-github/concepts/haven/`. Leave the draft alone.
2. **Sales email.** `const SALES_EMAIL='';` in `sundello-github/dist/app.js`. Empty means the home page keeps the style-guide PDF button and does not show "Email Sundello". Blair is creating a sales address. Do not invent one.
3. **Mobile header.** In `sundello-github/dist/navigation.css`, `.site-header > .nav-cta` is `display: none` below 1000px, and `.site-header nav > a` is `display: none` below 700px. On a phone the header keeps the Work Housing menu. Leave that until Blair decides.
4. **Lead forms.** Origin and Outpost do not collect a lead. "Start a conversation" on those pages goes to the home `#contact` section, whose button downloads `assets/origin-style-guide.pdf`. Haven opens a `mailto:` to the mailbox above. A form backend (the standing recommendation is a Google Apps Script web app writing to a Google Sheet, no DNS change) waits on Blair. Do not add a form, a thank-you page, or `/api/` unless that task is explicit.
5. **Phone, service area, legal name.** None of these are on the site. Do not add them.
6. **About, privacy, and terms.** Those URLs 404. Do not publish empty legal pages or write legal text. Ask Blair before any "content pending" page goes into `sundello-github/dist/`.
7. **GBS sentence.** The approved sentence in the Brand section is not on the site. Do not add it unless the task asks.
8. **www.** `https://www.sundello.com/` currently reaches the old host and shows "No site here". The fix belongs to the domain cutover (add `www` on this Pages project and 301 it to the apex, preserving path and query). Do not do it in a content change. Leave MX, SPF, DKIM, and DMARC alone. `http://sundello.com/` is a 302 to https on the old host; Pages will terminate TLS on its own after cutover.
9. **Domain cutover.** DNS stays at IONOS (nameservers `ns1066.ui-dns.de`, `ns1078.ui-dns.org`, `ns1103.ui-dns.com`, `ns1038.ui-dns.biz`). Export the zone first. Change only the web records Pages tells Blair to change. Do not touch mail records. Do not do this as a side effect of a content PR.
10. **Search Console.** Not set up in this repo. Blair can add the property later and submit `https://sundello.com/sitemap.xml`.
11. **Prices.** None on the site. Keep it that way until Blair approves figures.
12. **Home footer brand.** On `sundello-github/dist/index.html` the footer logo points at `#`, so it jumps to the top of the page. The header logo points at `./`. Leave both unless a task says otherwise.
