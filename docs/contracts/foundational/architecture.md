# Architecture

## Runtime
AlyHackbart.com is intentionally a static site. Production code is plain HTML, CSS, and minimal vanilla JavaScript.

## Editable content
`content/site-content.js` is the single source for routine website copy, services, prices, packages, project metadata, contact details, media paths, and form options.

## Media
Real image and video files are uploaded to `assets/media/` and referenced from `content/site-content.js`. The existing text-based files under `media/` contain the generated concept visuals and remain temporary fallbacks until Aly supplies real media. A missing replacement asset falls back without leaving a blank section.

`EDITING-GUIDE.md` documents the nontechnical update workflow.

## Serving
`Dockerfile` uses Python 3.12 Alpine and serves the repository with `python -m http.server` on port 8080.

## Deployment
The production deployment path is the `main` branch to Google Cloud. Deployment configuration is operational infrastructure and must not be changed without explicit approval.

## Implementation rule
Use native browser capabilities first. Do not introduce a framework, package manager, build system, CMS, animation library, or frontend dependency unless a real requirement cannot reasonably be met by the existing stack and the user approves the change.
