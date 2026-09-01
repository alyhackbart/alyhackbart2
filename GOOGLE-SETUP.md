# Google Search and Business Setup

The website code is prepared for Google Search Console, a Google Business Profile, and optional Google Analytics. The remaining steps require Aly's Google account and, for domain verification or custom email, access to the domain's DNS settings.

## Google Search Console

1. Open Google Search Console and add `alyhackbart.com` as a Domain property.
2. Copy the TXT verification value Google provides.
3. Add that TXT record wherever the domain's DNS is managed.
4. Return to Search Console and complete verification.
5. Submit this sitemap after verification:

```text
https://alyhackbart.com/sitemap.xml
```

The repository already contains `robots.txt`, `sitemap.xml`, canonical metadata, structured data, favicons, and a social-sharing image.

For a URL-prefix verification method, paste the exact Google verification token into `site.googleSiteVerification` in `content/site-content.js`, then run:

```bash
node scripts/build-site.mjs
```

Do not invent a verification value. Use only the exact value Google supplies.

## Google Business Profile

Use Aly's real business details:

- Business name: Aly Hackbart
- Primary market: San Diego, California
- Website: `https://alyhackbart.com`
- Current email: `alysonhackbart@gmail.com`
- Core services: video editing, social content production, restaurant content, and event coverage
- Limited custom service: elopements and intimate celebrations

Choose the closest category that Google actually offers. If clients do not visit a staffed business location, configure the profile as a service-area business and do not publish a home address merely to improve rankings.

Add only real photos, real work, accurate hours, and reviews from actual clients. Do not use the generated concept imagery as client evidence on the profile.

## Optional Google Analytics

Analytics is currently disabled. To enable it later:

1. Create a Google Analytics 4 web data stream for `alyhackbart.com`.
2. Copy the exact measurement ID beginning with `G-`.
3. Paste it into `site.googleAnalyticsId` in `content/site-content.js`.
4. Run `node scripts/build-site.mjs` and publish the generated pages.
5. Review the privacy and consent requirements that apply before collecting analytics data.

The site already emits package-selection and lead-submission events when Google Analytics is enabled.

## Custom business email

Do not display `hello@alyhackbart.com` until that address can receive mail reliably.

After configuring Google Workspace or a verified forwarding mailbox:

1. Send a test message to the new address from a different account.
2. Reply from the new address and confirm delivery in both directions.
3. Set `business.publicEmail` in `content/site-content.js` to the working custom address.
4. Keep the activated FormSubmit endpoint unchanged unless the form destination itself is intentionally migrated.
5. Run `node scripts/build-site.mjs` and publish the generated pages.
