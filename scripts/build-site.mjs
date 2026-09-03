#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site-content.json'), 'utf8'));

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeUrl = (value) => {
  const url = String(value ?? '').trim();
  return /^(https?:|mailto:|\/|[a-z0-9_.-]+\.html|#)/i.test(url) ? url : '#';
};

const absoluteUrl = (relativePath) => {
  const base = content.site.url.replace(/\/$/, '');
  return `${base}/${String(relativePath || '').replace(/^\//, '')}`;
};

const listItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
const publicEmail = content.identity.publicEmail?.trim() || content.identity.email;
const socialImageUrl = absoluteUrl(content.site.socialImage);
const analyticsId = content.site.googleAnalyticsId?.trim() || '';
const verificationToken = content.site.googleSiteVerification?.trim() || '';

const searchConsoleMeta = verificationToken
  ? `<meta name="google-site-verification" content="${escapeHtml(verificationToken)}">`
  : '<!-- Google Search Console verification can be added through Pages CMS. -->';

const analyticsScript = analyticsId
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(analyticsId)}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${escapeHtml(analyticsId)}');
  </script>`
  : '<!-- Analytics is disabled until an approved measurement ID is added. -->';

const analyticsPrivacyText = analyticsId
  ? 'This website uses Google Analytics to understand general website use and inquiry activity. Google may process device, browser, usage, and approximate location information and may use cookies or similar technologies.'
  : 'This website does not currently use advertising cookies or behavioral analytics. Basic technical logs may still be created by browsers, networks, hosting providers, or security systems.';

const tickerItems = [...content.hero.ticker, ...content.hero.ticker]
  .map((item) => `        <span>${escapeHtml(item)}</span><i aria-hidden="true"></i>`)
  .join('\n');
const manifestoParagraphs = content.manifesto.paragraphs.map((p) => `          <p>${escapeHtml(p)}</p>`).join('\n');
const experienceItems = content.experience.items.map((item) => `          <article class="experience-item reveal">
            <div class="experience-meta"><p>${escapeHtml(item.company)}</p><span>${escapeHtml(item.dates)}</span></div>
            <div class="experience-body">
              <h3>${escapeHtml(item.role)}</h3>
              <p>${escapeHtml(item.summary)}</p>
              <ul>${listItems(item.details)}</ul>
            </div>
          </article>`).join('\n');
const capabilityItems = content.capabilities.items.map((item) => `          <article class="capability-item reveal">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <span aria-hidden="true">↗</span>
          </article>`).join('\n');
const aboutParagraphs = content.about.paragraphs.map((p) => `          <p>${escapeHtml(p)}</p>`).join('\n');
const qualityItems = content.qualities.items.map((item) => `          <article class="quality-item reveal">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </article>`).join('\n');
const opportunityTargets = content.opportunities.targets.map((item) => `          <li>${escapeHtml(item)}<span aria-hidden="true">↗</span></li>`).join('\n');
const freelanceServices = content.freelance.services.map((item) => `          <li>${escapeHtml(item)}</li>`).join('\n');
const inquiryTypes = content.contact.inquiryTypes.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
const budgetRanges = content.contact.budgetRanges.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
const resumeExperience = content.resume.experience.map((item) => `        <article>
          <div class="resume-job-heading"><div><h3>${escapeHtml(item.role)}</h3><p>${escapeHtml(item.company)}</p></div><span>${escapeHtml(item.dates)}</span></div>
          <ul>${listItems(item.bullets)}</ul>
        </article>`).join('\n');

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${content.site.url}/#website`,
      url: `${content.site.url}/`,
      name: content.site.name,
      description: content.site.description,
      inLanguage: 'en-US'
    },
    {
      '@type': 'ProfilePage',
      '@id': `${content.site.url}/#profile`,
      url: `${content.site.url}/`,
      name: content.site.title,
      mainEntity: { '@id': `${content.site.url}/#aly` }
    },
    {
      '@type': 'Person',
      '@id': `${content.site.url}/#aly`,
      name: content.identity.name,
      url: `${content.site.url}/`,
      image: absoluteUrl(content.about.portrait),
      email: publicEmail,
      jobTitle: content.identity.role,
      homeLocation: { '@type': 'City', name: 'San Diego' },
      knowsAbout: [...content.toolkit.software, ...content.capabilities.items.map((item) => item.title)]
    },
    {
      '@type': 'CreativeWork',
      '@id': `${content.site.url}/#featured-work`,
      name: content.work.featured.title,
      url: content.work.featured.videoUrl,
      creator: { '@id': `${content.site.url}/#aly` },
      creditText: `${content.work.featured.role}, ${content.work.featured.production}`,
      description: content.work.featured.description
    }
  ]
};

const replacements = {
  TITLE: content.site.title,
  DESCRIPTION: content.site.description,
  SEARCH_CONSOLE_META: searchConsoleMeta,
  ANALYTICS_SCRIPT: analyticsScript,
  SITE_URL: content.site.url,
  SITE_NAME: content.site.name,
  SOCIAL_IMAGE_URL: socialImageUrl,
  STRUCTURED_DATA: JSON.stringify(structuredData, null, 2).replaceAll('<', '\\u003c'),
  NAME: content.identity.name,
  ROLE: content.identity.role,
  LOCATION: content.identity.location,
  EMAIL: publicEmail,
  AVAILABILITY: content.identity.availability,
  HERO_EYEBROW: content.hero.eyebrow,
  HERO_NAME: content.hero.name,
  HERO_ROLE: content.hero.role,
  HERO_STATEMENT: content.hero.statement,
  HERO_INTRODUCTION: content.hero.introduction,
  HERO_PRIMARY_ACTION: content.hero.primaryAction,
  HERO_SECONDARY_ACTION: content.hero.secondaryAction,
  HERO_VIDEO: content.hero.video,
  HERO_POSTER: content.hero.poster,
  HERO_MEDIA_NOTE: content.hero.mediaNote,
  TICKER_ITEMS: tickerItems,
  MANIFESTO_LABEL: content.manifesto.label,
  MANIFESTO_HEADLINE: content.manifesto.headline,
  MANIFESTO_PARAGRAPHS: manifestoParagraphs,
  MANIFESTO_QUOTE: content.manifesto.pullQuote,
  WORK_LABEL: content.work.label,
  WORK_HEADLINE: content.work.headline,
  WORK_INTRODUCTION: content.work.introduction,
  FEATURED_CATEGORY: content.work.featured.category,
  FEATURED_TITLE: content.work.featured.title,
  FEATURED_PRODUCTION: content.work.featured.production,
  FEATURED_ROLE: content.work.featured.role,
  FEATURED_DESCRIPTION: content.work.featured.description,
  FEATURED_VIDEO_ID: content.work.featured.videoId,
  FEATURED_VIDEO_URL: safeUrl(content.work.featured.videoUrl),
  FEATURED_BUTTON: content.work.featured.button,
  REEL_LABEL: content.work.reel.label,
  REEL_HEADLINE: content.work.reel.headline,
  REEL_DESCRIPTION: content.work.reel.description,
  REEL_STATUS: content.work.reel.status,
  REEL_BUTTON: content.work.reel.button,
  EXPERIENCE_LABEL: content.experience.label,
  EXPERIENCE_HEADLINE: content.experience.headline,
  EXPERIENCE_INTRODUCTION: content.experience.introduction,
  EXPERIENCE_ITEMS: experienceItems,
  CAPABILITIES_LABEL: content.capabilities.label,
  CAPABILITIES_HEADLINE: content.capabilities.headline,
  CAPABILITIES_INTRODUCTION: content.capabilities.introduction,
  CAPABILITY_ITEMS: capabilityItems,
  TOOLKIT_LABEL: content.toolkit.label,
  TOOLKIT_HEADLINE: content.toolkit.headline,
  TOOLKIT_INTRODUCTION: content.toolkit.introduction,
  TOOLKIT_SOFTWARE: listItems(content.toolkit.software),
  TOOLKIT_WORKFLOW: listItems(content.toolkit.workflow),
  ABOUT_LABEL: content.about.label,
  ABOUT_HEADLINE: content.about.headline,
  ABOUT_PORTRAIT: content.about.portrait,
  ABOUT_PORTRAIT_ALT: content.about.portraitAlt,
  ABOUT_PARAGRAPHS: aboutParagraphs,
  ABOUT_CLOSING: content.about.closing,
  QUALITIES_LABEL: content.qualities.label,
  QUALITIES_HEADLINE: content.qualities.headline,
  QUALITY_ITEMS: qualityItems,
  OPPORTUNITIES_LABEL: content.opportunities.label,
  OPPORTUNITIES_HEADLINE: content.opportunities.headline,
  OPPORTUNITIES_DESCRIPTION: content.opportunities.description,
  OPPORTUNITY_TARGETS: opportunityTargets,
  OPPORTUNITIES_PRIMARY: content.opportunities.primaryAction,
  OPPORTUNITIES_SECONDARY: content.opportunities.secondaryAction,
  FREELANCE_LABEL: content.freelance.label,
  FREELANCE_HEADLINE: content.freelance.headline,
  FREELANCE_DESCRIPTION: content.freelance.description,
  FREELANCE_SERVICES: freelanceServices,
  FREELANCE_ACTION: content.freelance.action,
  CONTACT_LABEL: content.contact.label,
  CONTACT_HEADLINE: content.contact.headline,
  CONTACT_DESCRIPTION: content.contact.description,
  FORM_ENDPOINT: content.contact.formEndpoint,
  FORM_SUBJECT: content.contact.formSubject,
  FORM_NEXT: content.contact.thankYouUrl,
  FORM_SOURCE: content.contact.formSourceUrl,
  FORM_AUTORESPONSE: content.contact.autoresponse,
  INQUIRY_TYPES: inquiryTypes,
  BUDGET_RANGES: budgetRanges,
  RESUME_HEADLINE: content.resume.headline,
  RESUME_ROLE: content.resume.role,
  RESUME_SUMMARY: content.resume.summary,
  RESUME_EXPERIENCE: resumeExperience,
  RESUME_SKILLS: listItems(content.resume.skills),
  PRIVACY_TITLE: content.privacy.title,
  PRIVACY_DESCRIPTION: content.privacy.description,
  PRIVACY_EFFECTIVE_DATE: content.privacy.effectiveDate,
  ANALYTICS_PRIVACY_TEXT: analyticsPrivacyText
};

const rawTokens = new Set([
  'SEARCH_CONSOLE_META', 'ANALYTICS_SCRIPT', 'STRUCTURED_DATA', 'TICKER_ITEMS',
  'MANIFESTO_PARAGRAPHS', 'EXPERIENCE_ITEMS', 'CAPABILITY_ITEMS', 'TOOLKIT_SOFTWARE',
  'TOOLKIT_WORKFLOW', 'ABOUT_PARAGRAPHS', 'QUALITY_ITEMS', 'OPPORTUNITY_TARGETS',
  'FREELANCE_SERVICES', 'INQUIRY_TYPES', 'BUDGET_RANGES', 'RESUME_EXPERIENCE',
  'RESUME_SKILLS'
]);

const renderTemplate = (templateName, outputName) => {
  let output = fs.readFileSync(path.join(root, 'templates', templateName), 'utf8');
  for (const [token, rawValue] of Object.entries(replacements)) {
    output = output.replaceAll(`{{${token}}}`, rawTokens.has(token) ? String(rawValue) : escapeHtml(rawValue));
  }
  const unresolved = output.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved template tokens in ${templateName}: ${[...new Set(unresolved)].join(', ')}`);
  fs.writeFileSync(path.join(root, outputName), output);
};

renderTemplate('index.html', 'index.html');
renderTemplate('resume.html', 'resume.html');
renderTemplate('privacy.html', 'privacy.html');
renderTemplate('thanks.html', 'thanks.html');
renderTemplate('404.html', '404.html');

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${content.site.url}/sitemap.xml\n`);
const pages = [
  ['', '1.0', 'weekly'],
  ['resume.html', '0.8', 'monthly'],
  ['privacy.html', '0.2', 'yearly']
];
const urls = pages.map(([page, priority, frequency]) => `  <url>
    <loc>${content.site.url}/${page}</loc>
    <lastmod>${content.site.updated}</lastmod>
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

console.log('Built index.html, resume.html, privacy.html, thanks.html, 404.html, robots.txt, and sitemap.xml');
