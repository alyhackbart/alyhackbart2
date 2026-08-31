# AlyHackbart.com Editing Guide

Routine updates happen in three predictable places:

1. `assets/media/` for your pictures and hero video
2. `content/site-content.js` for wording, prices, services, packages, portfolio details, media paths, contact information, and form choices
3. the `:root` section at the top of `styles.css` for the muted-pink color palette

The generated concept media remains available as a fallback, so an incomplete upload will not leave an empty website.

## Replace a sample project image

### Upload the file

1. Open the `alyhackbart/alyhackbart2` repository.
2. Open `assets`, then `media`.
3. Choose **Add file**, then **Upload files**.
4. Upload the image and commit it to `main`.

Recommended filenames and shapes:

| Website use | Recommended file | Shape |
| --- | --- | --- |
| Hero poster | `assets/media/hero-poster.webp` | 4:5 or 16:9 |
| Restaurant project | `assets/media/restaurant.webp` | 16:9 |
| Creator project | `assets/media/creator.webp` | 4:5 |
| Event project | `assets/media/event.webp` | 3:2 |
| Wedding project | `assets/media/wedding.webp` | 16:9 |
| Aly portrait | `assets/media/portrait.webp` | 4:5 |

Use WebP or JPEG. Aim for about 1,600 pixels on the longest edge and less than 700 KB when practical.

### Connect the uploaded image

Open `content/site-content.js`, find the matching project under `work.projects`, and change the empty `image` value:

```js
image: "assets/media/restaurant.webp",
fallback: "restaurant",
sample: false
```

Changing `sample` from `true` to `false` removes the **Concept sample** label.

Valid layout values are `wide`, `portrait`, and `landscape`.

## Replace the hero video

1. Upload an H.264 MP4 to `assets/media/hero-reel.mp4`.
2. Upload a poster image to `assets/media/hero-poster.webp`.
3. In `content/site-content.js`, update the hero values:

```js
video: "assets/media/hero-reel.mp4",
poster: "assets/media/hero-poster.webp"
```

Recommended video settings:

- 4:5 works best in the desktop hero
- 10 to 30 seconds
- No audio is required because the reel starts muted
- Keep the file under about 8 MB for mobile performance

If either file is missing or cannot load, the site automatically returns to the current concept reel and poster.

## Change project titles or descriptions

Open `content/site-content.js` and find `work.projects`.

Each project controls its title, description, services, image, fallback, layout, and concept label:

```js
{
  title: "Restaurant and hospitality content",
  description: "Food, atmosphere, staff, menu launches, and social-first storytelling.",
  services: "Filming · Editing · Social cuts",
  image: "assets/media/restaurant.webp",
  fallback: "restaurant",
  alt: "Description of the image",
  layout: "wide",
  sample: false
}
```

## Change services and prices

In `content/site-content.js`, find `services.items` and edit the text inside quotation marks:

```js
{
  title: "Video editing",
  description: "Your updated service description.",
  price: "From $250"
}
```

To add a service, copy one complete service block, paste it after another block, and keep the comma between blocks.

## Change packages

Find `packages.items` in `content/site-content.js`.

Each package controls its name, price, description, feature list, highlighted styling, and matching project type in the inquiry form:

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

Only one package should usually use `featured: true`.

## Add a professional portrait

1. Upload the portrait to `assets/media/portrait.webp`.
2. In `content/site-content.js`, find `about.portrait`.
3. Change the empty value to:

```js
portrait: "assets/media/portrait.webp"
```

The AH placeholder will automatically be replaced by the portrait.

## Change contact information

Find `business` near the top of `content/site-content.js`:

```js
business: {
  name: "Aly Hackbart",
  location: "San Diego, California",
  email: "alysonhackbart@gmail.com",
  serviceArea: "Available for local projects and select travel"
}
```

The form destination is controlled by `contact.formEndpoint` farther down the same file. The current tokenized FormSubmit endpoint is active. If the destination email changes, create and activate a new FormSubmit endpoint before replacing it.

## Change the color palette

Open `styles.css` and edit the color values in the `:root` section at the top. These variables control the full site:

```css
--ink: #2f2028;
--paper: #f4e7eb;
--paper-soft: #ecd8df;
--surface: #faeff2;
--accent: #a84f6b;
--accent-dark: #7f3851;
--accent-light: #d89aae;
```

Keep enough contrast between text and backgrounds so the site remains readable.

## Form submissions

The inquiry form is active and sends submissions through FormSubmit to `alysonhackbart@gmail.com`. Live delivery was verified on August 31, 2026.

## Before publishing real work

Confirm that you have permission to publish the footage, client name, logo, testimonial, and any identifiable people shown. Do not present generated concept imagery as client work.
