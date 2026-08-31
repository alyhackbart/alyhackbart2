# AlyHackbart.com

Client-facing portfolio and services website for Aly Hackbart, a San Diego video editor and content creator.

## Edit the site

- Upload new images and the hero reel to `assets/media/`.
- Change copy, services, prices, packages, project details, contact information, media paths, and form choices in `content/site-content.js`.
- Change the muted-pink color tokens at the top of `styles.css`.
- Follow `EDITING-GUIDE.md` for step-by-step instructions.

The current concept media is retained as an embedded fallback. This keeps the site complete until real media paths are added.

## Preview locally

Run a local web server from the repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The static site is deployed from the `main` branch to Google Cloud.
