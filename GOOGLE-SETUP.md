# Google Search and Business Setup

The website code is prepared for Google Search Console, a Google Business Profile, and optional Google Analytics. These account-level steps require Aly's Google account and, for domain verification or custom email, access to the domain DNS settings.

## Google Search Console

1. Add `alyhackbart.com` as a Domain property in Google Search Console.
2. Copy the TXT verification value Google provides.
3. Add the TXT record where the domain DNS is managed.
4. Complete verification in Search Console.
5. Submit `https://alyhackbart.com/sitemap.xml`.

For a URL-prefix verification method, enter the exact token in Pages CMS under **Website and search settings > Google Search Console verification token**, then save.

## Google Business Profile

Use only accurate business details:

- Business name: Aly Hackbart
- Primary market: San Diego, California
- Website: `https://alyhackbart.com`
- Current email: `alysonhackbart@gmail.com`
- Core services: video editing, social content, restaurant content, and event coverage
- Limited custom service: elopements and intimate celebrations

If clients do not visit a staffed business location, configure a service-area business and do not publish a home address merely to improve rankings.

## Optional Google Analytics

Analytics is disabled until a valid measurement ID is supplied and privacy requirements are reviewed.

1. Create a Google Analytics 4 web stream.
2. Copy the ID beginning with `G-`.
3. Enter it in Pages CMS under **Website and search settings > Google Analytics measurement ID**.
4. Save and verify the generated privacy notice.

The site can record package selections and lead submissions when analytics is enabled.

## Custom business email

Do not display `hello@alyhackbart.com` until the address works reliably.

After configuring Google Workspace or verified forwarding:

1. Test receiving mail from another account.
2. Test replying from the new address.
3. Enter the working address in Pages CMS under **Business information > Public business email**.
4. Keep the protected FormSubmit delivery endpoint unchanged unless the form destination is intentionally migrated.
