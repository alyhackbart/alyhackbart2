# Architecture

## Runtime
AlyHackbart.com is intentionally a static site. Production code is plain HTML, CSS, and minimal vanilla JavaScript.

## Serving
`Dockerfile` uses Python 3.12 Alpine and serves the repository with `python -m http.server` on port 8080.

## Deployment
The production deployment path is the `main` branch to Google Cloud. Deployment configuration is operational infrastructure and must not be changed without explicit approval.

## Implementation rule
Use native browser capabilities first. Do not introduce a framework, package manager, build system, CMS, animation library, or frontend dependency unless a real requirement cannot reasonably be met by the existing stack and the user approves the change.
