---
status: active
last_reviewed: 2026-08-31
source_of_truth_for:
  - Runtime architecture, editable-content build flow, media storage, serving, and deployment boundary
depends_on: []
referenced_by:
  - docs/00-project-context.md
  - docs/99-project-status.md
type: foundational
---

# Architecture

## Runtime
AlyHackbart.com is intentionally a static site. Production pages are pre-rendered HTML with CSS and minimal vanilla JavaScript for navigation, video controls, package prefill, media fallback behavior, and form state.

Primary page content is present in the delivered HTML, so visitors and search crawlers do not depend on JavaScript to read the site.

## Editable content and build
`content/site-content.js` is the single source for routine website copy, services, prices, packages, project metadata, FAQs, policy summaries, contact details, media paths, form options, and SEO text.

`scripts/build-site.mjs` uses only Node.js standard-library modules. It reads the editable content and templates, then generates:

- `index.html`
- `privacy.html`
- `thanks.html`
- `robots.txt`
- `sitemap.xml`

The GitHub workflow `.github/workflows/prerender.yml` runs the generator after editable content, templates, or the build script changes on `main`. It commits generated pages only when the output changed.

## Media
Normal image and video files live in `assets/media/` and are referenced from `content/site-content.js`. The generated concept assets remain clearly labeled until replaced with real work. Replacement paths can retain the concept assets as browser fallbacks.

`EDITING-GUIDE.md` documents the update workflow.

## Search and privacy
The homepage includes canonical metadata, Open Graph and Twitter metadata, crawlable JSON-LD, favicons, and a social-sharing image. `robots.txt` points to `sitemap.xml`. The project inquiry form links to a dedicated privacy notice.

## Serving
`Dockerfile` uses Python 3.12 Alpine and serves the repository with `python -m http.server` on port 8080.

## Deployment
The production deployment path is the `main` branch to Google Cloud. Deployment infrastructure outside the repository remains unchanged.

## Implementation rule
Use native browser capabilities first. Do not introduce a frontend framework, CMS, animation library, or runtime dependency unless a real requirement cannot reasonably be met by the existing stack and the user approves the change.
