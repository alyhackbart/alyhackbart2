---
status: active
last_reviewed: 2026-09-02
source_of_truth_for:
  - Runtime architecture, editable-content build flow, CMS integration, media storage, serving, and deployment boundary
depends_on: []
referenced_by:
  - docs/00-project-context.md
  - docs/99-project-status.md
type: foundational
---

# Architecture

## Runtime
AlyHackbart.com is intentionally a static site. Production pages are pre-rendered HTML with CSS and minimal vanilla JavaScript for navigation, video controls, package prefill, media fallback behavior, analytics events when enabled, and form state.

Primary page content is present in the delivered HTML, so visitors and search crawlers do not depend on JavaScript to read the site.

## Editable content and Pages CMS
`content/site-content.json` is the authoritative source for routine website copy, services, prices, packages, project metadata, FAQs, policy summaries, contact details, media paths, form options, and SEO text.

`.pages.yml` exposes that JSON file through Pages CMS as structured, user-friendly fields and configures the repository media library. Pages CMS is an editing layer only. It writes changes to GitHub and does not add a production runtime, database, frontend framework, or deployment dependency.

`content/site-content.js` is a small compatibility adapter used by the existing dependency-free generator. It imports `content/site-content.json` and exports the same object shape expected by the build script.

`scripts/build-site.mjs` uses only Node.js standard-library modules. It reads the editable content and templates, then generates:

- `index.html`
- `privacy.html`
- `thanks.html`
- `robots.txt`
- `sitemap.xml`

The GitHub workflow `.github/workflows/prerender.yml` runs after the JSON content, compatibility adapter, templates, or build script change on `main`. It validates the content and generated site, then commits generated pages only when output changed. Pages CMS also exposes a manual Rebuild website action that dispatches this workflow.

## Media
Normal image and video files live in `assets/media/`. Pages CMS provides image and video upload fields for this folder. The generated concept assets remain clearly labeled until replaced with real work.

The social-sharing image lives under `assets/`. `EDITING-GUIDE.md` documents the Pages CMS and manual update workflows.

## Search, measurement, and privacy
The homepage includes canonical metadata, Open Graph and Twitter metadata, crawlable JSON-LD, favicons, and a social-sharing image. `robots.txt` points to `sitemap.xml`. The project inquiry form links to a dedicated privacy notice.

`site.googleSiteVerification` and `site.googleAnalyticsId` are optional editable fields. They remain blank until Google supplies an ownership token or Aly approves analytics. The generated privacy notice changes its analytics disclosure when an analytics ID is enabled.

`business.publicEmail` remains blank until a custom-domain mailbox is confirmed. Generated pages fall back to the verified Gmail address without changing the activated FormSubmit endpoint.

## Serving
`Dockerfile` uses Python 3.12 Alpine and serves the repository with `python -m http.server` on port 8080.

## Deployment
The production deployment path remains the `main` branch to Google Cloud. Deployment infrastructure outside the repository is unchanged.

## Implementation rule
Use native browser capabilities first. Pages CMS is approved only as a Git-backed editing interface. Do not add a frontend framework, runtime CMS, animation library, database, or package dependency unless a real requirement cannot reasonably be met by the existing stack and the user explicitly approves it.
