# AlyHackbart.com

Client-facing portfolio and services website for Aly Hackbart, a San Diego video editor and content creator.

## Edit the website without code

The repository is configured for Pages CMS.

1. Sign in at `https://app.pagescms.org` with GitHub.
2. Open `alyhackbart/alyhackbart2` and select the `main` branch.
3. Open **AlyHackbart.com content**.
4. Change text, prices, packages, projects, FAQs, policies, contact choices, or media.
5. Save the entry.

Pages CMS writes the changes to `content/site-content.json`. GitHub Actions then rebuilds the static pages automatically. Google Cloud continues deploying from `main`.

Use the Pages CMS media library to upload images and videos into `assets/media/`. See `EDITING-GUIDE.md` for exact replacement steps.

## Developer workflow

The site remains dependency-free at runtime.

```bash
node scripts/build-site.mjs
python3 scripts/validate-site.py
python3 -m http.server 8080
```

Open `http://localhost:8080` to preview.

## Structure

- `.pages.yml`: Pages CMS editor configuration
- `content/site-content.json`: authoritative editable website content
- `content/site-content.js`: compatibility adapter used by the generator
- `assets/media/`: replaceable portfolio images, portrait, and hero video
- `templates/`: source templates for generated pages
- `scripts/build-site.mjs`: static page generator
- `styles.css`: muted-pink design system and responsive layout
- `script.js`: menu, reel controls, package prefill, fallbacks, and form state
- `privacy.html`: generated privacy notice
- `robots.txt` and `sitemap.xml`: generated search files

## Deployment

The production site deploys from the `main` branch to Google Cloud.
