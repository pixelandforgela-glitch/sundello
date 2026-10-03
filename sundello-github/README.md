# Sundello

Website source and assets for Sundello, with separate concept sites.

## Projects

| Directory | Contents |
| --- | --- |
| `dist/` | Main Sundello website, Origin finish comparison, Haven and Outpost pages, images, videos, fonts and downloadable style guide |
| `concepts/sundial/` | Sundial concept website and demo source/assets; `dist/` is its published static site |
| `concepts/haven/` | Standalone Haven concept website; `dist/` is its published static site |

These are static HTML, CSS and JavaScript projects. The `dist` folders are intentionally committed: they contain the editable website source and required media, rather than disposable compiled output.

## Preview locally

With Python 3 installed, run from this repository:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. To preview a concept, replace `dist` with `concepts/sundial/dist` or `concepts/haven/dist`.

## Hosting

The existing public site is https://sundello.com. Each `.openai/hosting.json` preserves its existing Sites project identity. A GitHub push alone does not publish changes to that site; publication is a separate Sites workflow. Do not create replacement Sites for these projects.

## Assets

Images are architectural concepts and may differ from final construction specifications. Included font licenses remain with their assets. No license is granted for the branding or other original project assets by this repository.

This is a source snapshot of the existing project checkouts, including working media. Historical drawings and unrelated workspace files are not part of the web application.
