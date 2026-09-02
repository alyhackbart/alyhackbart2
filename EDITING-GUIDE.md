# AlyHackbart.com Editing Guide

## Recommended editing method

Use Pages CMS instead of editing code directly.

1. Open `https://app.pagescms.org`.
2. Sign in with the GitHub account connected to `alyhackbart/alyhackbart2`.
3. Select the `main` branch.
4. Open **AlyHackbart.com content**.
5. Edit the field you want and press Save.

The save creates a GitHub commit. The **Prerender editable site content** workflow rebuilds the public HTML, and the existing Google Cloud deployment publishes the new version.

A Pages CMS button labeled **Rebuild website** is also available for manually starting the build when needed.

## What you can edit

The Pages CMS form includes:

- Search title, description, and social-sharing image
- Business name, location, public email, and service area
- Hero headline, introduction, buttons, reel, and poster
- Professional YouTube credit
- Portfolio projects and Concept sample labels
- Services and prices
- Packages, package features, and add-ons
- Process steps
- Frequently asked questions
- Project policies
- Biography, portrait, and behind-the-scenes image
- Contact-form wording and choices
- Privacy-page title and effective date

Technical form-delivery fields are protected so the active FormSubmit endpoint is not changed accidentally.

## Replace a sample project image

1. Open the project under **Portfolio and work**.
2. Upload or select a new image in **Project image**.
3. Update the project title, description, role, and image description.
4. Turn off **Show Concept sample label** only when the project and image are real, approved work.
5. Save.

Recommended image shapes:

| Website use | Shape |
| --- | --- |
| Wide project | 16:9 |
| Portrait project | 4:5 |
| Landscape project | 3:2 |
| Aly portrait | 4:5 |
| Behind-the-scenes image | 4:5 or 3:2 |

Use WebP or JPEG when possible. Aim for about 1,600 pixels on the longest edge and under 700 KB.

## Replace the hero reel

Under **Homepage hero**:

1. Upload an H.264 MP4 in **Hero reel**.
2. Upload a WebP or JPEG in **Hero poster image**.
3. Update the reel labels and disclosure if the media is no longer a concept sample.
4. Save.

Recommended reel settings:

- 10 to 30 seconds
- Muted-friendly visual edit
- 4:5 or 16:9
- Under about 8 MB when practical

## Add Aly's portrait

Under **About Aly**, upload a real approved image in **Professional portrait**. You can also add a real working image in **Behind-the-scenes image**.

Do not use a generated person as Aly. The image should be a real photograph of Aly or a truthful still from her work.

## Change services and packages

Open **Services** or **Packages and add-ons**. Each item can be expanded, edited, reordered, added, or removed.

Keep the package **Inquiry form value** aligned with one of the choices under **Contact form > Project type choices**. Only one package should normally have **Highlight this package** turned on.

## Publish and verify

After saving:

1. Wait for the GitHub Actions build to finish.
2. Open `https://alyhackbart.com` in a private browser tab.
3. Hard refresh if the old version is cached.
4. Confirm the edited section on both desktop and phone.

## Manual developer fallback

If Pages CMS is unavailable, edit `content/site-content.json` directly and run:

```bash
node scripts/build-site.mjs
python3 scripts/validate-site.py
```

Commit both the JSON source and generated pages.

## Content truth

Do not invent clients, awards, testimonials, metrics, project outcomes, or roles. Keep generated images labeled as concept samples until they are replaced with real approved work.
