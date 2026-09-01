# AlyHackbart.com

Client-facing portfolio and services website for Aly Hackbart, a San Diego video editor and content creator.

## Edit the site

Routine changes happen in two places:

- `content/site-content.js` controls page copy, services, prices, packages, FAQs, policies, portfolio details, media paths, contact information, form choices, and SEO text.
- `assets/media/` stores the hero reel, project images, future portrait, and behind-the-scenes photography.

After editing the content file, run:

```bash
node scripts/build-site.mjs
```

This generates the production-ready `index.html`, `privacy.html`, `thanks.html`, `robots.txt`, and `sitemap.xml` with the editable content already written into the HTML.

A GitHub Actions workflow also runs the build automatically after `content/site-content.js`, the templates, or the build script changes on `main`.

Follow `EDITING-GUIDE.md` for step-by-step instructions.

## Preview locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `content/site-content.js`: editable business and website content
- `assets/media/`: replaceable image and video files
- `templates/`: source templates for generated pages
- `scripts/build-site.mjs`: dependency-free static page generator
- `styles.css`: muted-pink design system and responsive layout
- `script.js`: mobile menu, mobile inquiry CTA behavior, reel controls, package prefill, optional analytics events, media fallbacks, and form state
- `privacy.html`: generated privacy notice
- `GOOGLE-SETUP.md`: account-level Search Console, Business Profile, analytics, and custom-email steps
- `robots.txt` and `sitemap.xml`: generated search files

## Deployment

The site is deployed from the `main` branch to Google Cloud.
