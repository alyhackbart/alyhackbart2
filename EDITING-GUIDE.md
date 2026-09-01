# AlyHackbart.com Editing Guide

Routine updates happen in three predictable places:

1. `assets/media/` for pictures and the hero video
2. `content/site-content.js` for wording, prices, services, packages, FAQs, policies, portfolio details, media paths, contact information, form choices, and SEO text
3. the `:root` section at the top of `styles.css` for the muted-pink color palette

Do not edit `index.html` for normal content changes. It is generated from the editable content file and the template.

## Publish a content change

### Automatic GitHub workflow

When `content/site-content.js`, a file in `templates/`, or `scripts/build-site.mjs` changes on `main`, the GitHub workflow rebuilds the static pages and commits them automatically when needed.

### Manual build

From the repository root, run:

```bash
node scripts/build-site.mjs
```

The build updates:

- `index.html`
- `privacy.html`
- `thanks.html`
- `robots.txt`
- `sitemap.xml`

Commit the editable source and the generated files together when working locally.

## Replace a sample project image

The current concept files already live in `assets/media/`:

| Website use | File | Shape |
| --- | --- | --- |
| Hero poster | `assets/media/hero-poster.webp` | 16:9 |
| Restaurant project | `assets/media/restaurant.webp` | 16:9 |
| Creator project | `assets/media/creator.webp` | 4:5 |
| Event project | `assets/media/event.webp` | 3:2 |
| Celebration project | `assets/media/wedding.webp` | 16:9 |
| Aly portrait | `assets/media/portrait.webp` | 4:5 |

Use WebP or JPEG. Aim for about 1,600 pixels on the longest edge and less than 700 KB when practical.

### Easiest replacement

Upload your real file using the same filename, then edit the matching project in `content/site-content.js` and change:

```js
sample: true
```

to:

```js
sample: false
```

That removes the **Concept sample** badge.

### Use a different filename

Update the project entry:

```js
image: "assets/media/my-restaurant-project.webp",
fallbackImage: "assets/media/restaurant.webp",
sample: false
```

If the real image fails to load, the original concept image remains available as a fallback.

Valid layout values are `wide`, `portrait`, and `landscape`.

## Replace the hero video

1. Upload an H.264 MP4 to `assets/media/`.
2. Upload a poster image to `assets/media/`.
3. Update the hero paths in `content/site-content.js`:

```js
video: "assets/media/my-reel.mp4",
poster: "assets/media/my-reel-poster.webp",
fallbackVideo: "assets/media/hero-reel.mp4",
fallbackPoster: "assets/media/hero-poster.webp"
```

Recommended video settings:

- 4:5 or 16:9
- 10 to 30 seconds
- Muted playback
- H.264 MP4
- Under about 8 MB for mobile performance

## Change page copy and SEO text

Open `content/site-content.js`.

The `site` block controls the page title, meta description, canonical domain, social image path, and sitemap update date. Update `site.updated` when publishing a meaningful site change.

The remaining blocks control their matching page sections:

- `hero`
- `work`
- `services`
- `packages`
- `process`
- `faq`
- `policies`
- `about`
- `contact`
- `privacy`

Run the build after editing.

## Change services and prices

Find `services.items` and edit the values inside quotation marks:

```js
{
  title: "Video editing",
  description: "Your updated service description.",
  price: "From $250"
}
```

To add a service, copy one complete service block, paste it after another block, and keep the comma between blocks.

## Change packages, boundaries, and add-ons

Find `packages.items` in `content/site-content.js`.

Each package controls its name, price, description, feature list, highlighted styling, and matching inquiry-form value:

```js
{
  name: "Content Session",
  price: "$650",
  description: "Package description.",
  featured: true,
  formValue: "Content Session",
  features: [
    "Feature one",
    "Feature two"
  ]
}
```

Use `packages.addOns` for optional services and `packages.note` for the scope disclaimer. Only one package should usually use `featured: true`.

## Change FAQs and policies

Edit `faq.items` to add or revise common questions. Each item contains a `question` and `answer`.

Edit `policies.items` for booking, payment, feedback, rescheduling, usage, travel, and file-delivery summaries. Final project terms should still be confirmed in a written proposal.

## Add a professional portrait

1. Upload the portrait to `assets/media/portrait.webp`.
2. Find `about.portrait` in `content/site-content.js`.
3. Set:

```js
portrait: "assets/media/portrait.webp"
```

The AH placeholder will be replaced by the portrait after the build.

## Change contact information

Find the `business` block near the top of `content/site-content.js`.

The form destination is controlled by `contact.formEndpoint`. The current tokenized FormSubmit endpoint is active. If the destination email changes, activate a new endpoint before replacing it.

## Change the color palette

Open `styles.css` and edit the values in `:root`:

```css
--ink: #2f2028;
--paper: #f4e7eb;
--paper-soft: #ecd8df;
--surface: #faeff2;
--accent: #a84f6b;
--accent-dark: #7f3851;
--accent-light: #d89aae;
```

Keep enough contrast between text and backgrounds for comfortable reading.

## Search setup

The repository now includes canonical metadata, structured data, `robots.txt`, `sitemap.xml`, favicons, and a social-sharing image.

To finish Google Search Console setup, add the site as a Domain property and complete Google's ownership verification. After verification, submit:

```text
https://alyhackbart.com/sitemap.xml
```

A Google verification token should only be added after Google provides the exact value.

## Form submissions and privacy

The inquiry form is active and sends submissions through FormSubmit to `alysonhackbart@gmail.com`. The form links to `privacy.html`, which describes the current information flow and website practices.

## Before publishing real work

Confirm that you have permission to publish footage, client names, logos, testimonials, music, and identifiable people. Do not present generated concept imagery as client work.
