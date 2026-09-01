---
status: active
last_reviewed: 2026-08-31
source_of_truth_for:
  - Current implementation status, validation, known gaps, and production readiness
depends_on:
  - docs/00-project-context.md
  - docs/contracts/foundational/architecture.md
referenced_by:
  - docs/working-mode.md
type: status
---

# Project Status

## Current
- Static portfolio architecture preserved
- Primary content pre-rendered into crawlable HTML from `content/site-content.js`
- Automatic GitHub workflow regenerates static pages after editable content changes
- Muted pink editorial design retained without the excluded mobile-header redesign
- Sticky navigation includes Work, Services, Packages, About, FAQ, and Contact
- Generated concept images and reel remain clearly labeled as sample imagery
- Replaceable sample image and video files now live in `assets/media/`
- Six service categories and three introductory packages retained
- Elopement and intimate-celebration positioning replaces broad full-wedding positioning
- Package turnaround, revision boundaries, optional add-ons, and scope disclaimers added
- Restaurant portfolio collaboration callout added
- FAQ and project-policy sections added
- Privacy notice linked from the inquiry form and footer
- Canonical metadata, structured data, favicons, social image, `robots.txt`, and `sitemap.xml` added
- Activated FormSubmit inquiry flow and thank-you page retained
- `EDITING-GUIDE.md` documents content, media, build, policy, privacy, and search updates

## Pricing status
Current prices are introductory planning anchors. They are not fixed universal quotes and should be reviewed as Aly gains project history and better understands production costs, turnaround, travel, revision scope, and minimum project size.

## Content status
- Generated concept visuals are temporary and do not represent client work
- Real project footage, titles, clients, years, outcomes, and exact roles are still needed
- A real professional portrait is still needed
- Testimonials may be added only with permission to publish
- Google Search Console ownership verification still requires an exact token from Google

## Verification
- Dependency-free build completed twice with identical generated-page hashes
- Static HTML parsing, unique IDs, local references, and fragment links passed
- Primary headings, services, FAQs, and form choices remained visible with JavaScript disabled
- Canonical metadata, Open Graph metadata, Twitter metadata, JSON-LD, favicons, social image, sitemap, and robots checks passed
- Structured data includes visible and accurate `WebSite`, `Person`, `ProfessionalService`, and `FAQPage` entities
- Inquiry form retained the activated tokenized FormSubmit endpoint, required fields, consent, package prefill, and privacy link
- Hero video is a 12-second H.264 MP4 at 720 by 900 with a poster and fallback behavior
- Rendered Chromium verification passed at 1440 by 1000 and 375 by 812 through an inlined local harness
- Desktop and mobile overflow checks passed
- Mobile menu open, close, and Escape behavior passed
- Hero reel playback control, FAQ disclosure, package prefill, and native form validation passed
- Homepage and privacy-page visual review passed
- Generated-copy em-dash guardrail passed
- Production-domain verification remains required after the push to `main`

## Release gate
A change is DONE only after the intended source is on `main` and AlyHackbart.com reflects it.
