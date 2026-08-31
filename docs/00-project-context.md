# Project Context

AlyHackbart.com is Aly Hackbart's client-facing video editing and content portfolio.

## Business profile
- Based in San Diego, California
- Early-career independent creator with less than one year in business
- Primary services: video editing, social content production, event coverage
- Secondary offering: wedding and celebration films by custom scope
- Priority clients: local businesses, restaurants, creators, events, and couples
- Public contact email: alysonhackbart@gmail.com

## User job
A visitor should quickly understand what Aly offers, browse services and packages, review sample visual directions, understand introductory starting prices, and submit enough information for Aly to scope a project.

## Current implementation
- Static `index.html`, `styles.css`, and `script.js`
- Served by a small Python HTTP server from `Dockerfile`
- Deployed from the `main` branch to Google Cloud
- No frontend framework or package dependency is required
- Inquiry form posts to FormSubmit and redirects to `thanks.html`
- Temporary concept images and the lightweight MP4 concept reel are embedded through text-based files under `media/`

## Design direction
Professional creative-services portfolio with a muted pink editorial palette, clear navigation, visible services and packages, meaningful media, strong hierarchy, restrained interaction, and easy conversion to inquiry.

## Pricing strategy
Use transparent introductory starting prices for smaller editing, social content, restaurant, and event work. Treat weddings, larger productions, travel, ongoing retainers, and expanded deliverables as custom quotes. Prices are planning anchors rather than fixed universal quotes.

## Content truth
Do not invent clients, projects, awards, metrics, testimonials, or outcomes. Generated concept imagery must remain clearly labeled as sample imagery and must not be represented as Aly's client work.

## Remaining inputs
- Professional portrait or usable reference photo
- 3 to 6 real portfolio projects with client or project name, media, year, and Aly's exact role
- Preferred travel radius
- Equipment details if they materially help client confidence
- Typical turnaround preferences
- Testimonials only with permission to publish
- Activation of the FormSubmit email endpoint after the first test submission
