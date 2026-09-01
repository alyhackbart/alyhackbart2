---
status: active
last_reviewed: 2026-08-31
source_of_truth_for:
  - Project identity, business positioning, stack, and standing content constraints
depends_on:
  - docs/contracts/foundational/architecture.md
  - docs/contracts/foundational/vision.md
referenced_by:
  - docs/working-mode.md
  - docs/99-project-status.md
type: foundational
---

# Project Context

AlyHackbart.com is Aly Hackbart's client-facing video editing and content portfolio.

## Business profile
- Based in San Diego, California
- Early-career independent creator with less than one year in business
- Primary services: video editing, social content production, restaurant content, and event coverage
- Limited secondary offering: elopements and intimate celebrations by custom scope
- Priority clients: local businesses, restaurants, creators, events, and couples
- Public contact email: alysonhackbart@gmail.com

## User job
A visitor should quickly understand what Aly offers, browse services and packages, review clearly labeled sample visual directions, understand introductory starting prices, read common project policies, and submit enough information for Aly to scope a project.

Aly should be able to replace temporary media and update site content without redesigning the page.

## Current implementation
- Pre-rendered static HTML, CSS, and vanilla JavaScript
- Central editable content in `content/site-content.js`
- Dependency-free page generator in `scripts/build-site.mjs`
- Automatic GitHub workflow that regenerates static pages when editable content changes
- Replaceable images and video in `assets/media/`
- Search foundation including canonical metadata, structured data, favicons, social image, `robots.txt`, and `sitemap.xml`
- FAQ, policy summaries, and a privacy notice
- Served by a small Python HTTP server from `Dockerfile`
- Deployed from the `main` branch to Google Cloud
- Inquiry form posts through an activated FormSubmit endpoint and redirects to `thanks.html`
- No frontend framework or runtime package dependency is required

## Design direction
Professional creative-services portfolio with a muted pink editorial palette, clear navigation, visible services and packages, meaningful media, strong hierarchy, restrained interaction, and easy conversion to inquiry.

## Pricing strategy
Use transparent introductory starting prices for smaller editing, social content, restaurant, and event work. Treat elopements, intimate celebrations, larger productions, travel, ongoing retainers, and expanded deliverables as custom quotes. Prices are planning anchors rather than fixed universal quotes.

## Content truth
Do not invent clients, projects, awards, metrics, testimonials, or outcomes. Generated concept imagery must remain clearly labeled as sample imagery and must not be represented as Aly's client work.

## Remaining inputs
- Professional portrait and behind-the-scenes photo
- 3 to 6 real portfolio projects with client or project name, media, year, and Aly's exact role
- Preferred travel radius
- Equipment details if they materially help client confidence
- Testimonials only with permission to publish
- Google Search Console ownership verification token
- Working custom-domain mailbox before changing the public email
