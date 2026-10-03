# Sundello Homes (`sundello.com`)

Hand-written static website for Sundello Homes. HTML, CSS, and vanilla JavaScript. No framework and no build step.

The site files are in [`sundello-github/dist/`](sundello-github/dist/). That folder is what gets published. `sundello-github/concepts/` is old drafts, not the live site. Instructions for people and for AI coding tools are in [`AGENTS.md`](AGENTS.md). Follow that file.

## Preview

From this folder:

```bash
python3 -m http.server --directory sundello-github/dist
```

Then open http://127.0.0.1:8000/. The not-found page is http://127.0.0.1:8000/404.html (Python does not attach it to unknown URLs; Cloudflare Pages does).

## Deploy

Cloudflare Pages, free plan, connected to this GitHub repo.

- Production branch: `main`
- Framework preset: None
- Build command: empty
- Build output directory: `sundello-github/dist`

A pull request gets a preview URL once the Pages project exists. Merging to `main` deploys. Blair approves merges.

The live domain still points at the previous host until DNS is cut over at IONOS. That cutover is separate. Do not change email DNS records (MX, SPF, DKIM, DMARC).

## Images and fonts

Images are architectural concepts and may differ from final construction specifications. Included font licenses remain with their assets. No license is granted for the branding or other original project assets by this repository.
