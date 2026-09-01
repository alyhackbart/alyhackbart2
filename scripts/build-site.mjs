#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const contentPath = path.join(root, 'content', 'site-content.js');
delete require.cache[require.resolve(contentPath)];
const content = require(contentPath);

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const escapeXml = escapeHtml;
const absoluteUrl = (relativePath) => {
  const base = content.site.url.replace(/\/$/, '');
  const pathValue = String(relativePath || '').replace(/^\//, '');
  return `${base}/${pathValue}`;
};

const heroProof = content.hero.proof.map((item) =>
  `        <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>`
).join('\n');

const projects = content.work.projects.map((project) => {
  const layout = ['wide', 'portrait', 'landscape'].includes(project.layout) ? project.layout : 'landscape';
  const featured = layout === 'wide' ? ' project-featured' : '';
  const badge = project.sample ? '\n            <span class="media-badge">Concept sample</span>' : '';
  const dimensions = layout === 'portrait' ? 'width="800" height="1000"' : layout === 'wide' ? 'width="1280" height="720"' : 'width="1200" height="800"';
  return `        <article class="project${featured}">
          <div class="media-frame media-${layout}">
            <img src="${escapeHtml(project.image)}" data-fallback-src="${escapeHtml(project.fallbackImage || project.image)}" data-fallback-key="${escapeHtml(project.fallbackKey || "")}" ${dimensions} alt="${escapeHtml(project.alt)}" loading="lazy">${badge}
          </div>
          <div class="project-meta">
            <div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p></div>
            <p>${escapeHtml(project.services)}</p>
          </div>
        </article>`;
}).join('\n\n');

const services = content.services.items.map((service) =>
  `        <article><div><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description)}</p></div><strong>${escapeHtml(service.price)}</strong></article>`
).join('\n');

const packages = content.packages.items.map((item) => `        <article class="package-card${item.featured ? ' featured-package' : ''}">
          <div class="package-top"><p class="package-name">${escapeHtml(item.name)}</p><p class="package-price">From <strong>${escapeHtml(item.price)}</strong></p></div>
          <p>${escapeHtml(item.description)}</p>
          <ul>${item.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
          <a href="#contact" data-package="${escapeHtml(item.formValue)}">Ask about ${escapeHtml(item.name)}</a>
        </article>`).join('\n');

const addOns = content.packages.addOns.map((item) => `          <li>${escapeHtml(item)}</li>`).join('\n');
const processSteps = content.process.steps.map((step) =>
  `        <article><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p></article>`
).join('\n');

const aboutImages = [];
if (content.about.portrait?.trim()) {
  aboutImages.push(`<figure class="about-photo about-photo-primary"><img src="${escapeHtml(content.about.portrait)}" alt="${escapeHtml(content.about.portraitAlt)}" loading="lazy"></figure>`);
}
if (content.about.behindScenes?.trim()) {
  aboutImages.push(`<figure class="about-photo about-photo-secondary"><img src="${escapeHtml(content.about.behindScenes)}" alt="${escapeHtml(content.about.behindScenesAlt)}" loading="lazy"></figure>`);
}
const aboutMedia = aboutImages.length
  ? `      <div class="about-gallery" aria-label="Aly Hackbart photography">${aboutImages.join('')}</div>`
  : `      <div class="about-mark" aria-label="Aly Hackbart portrait area"><span>${escapeHtml(content.about.monogram)}</span><small>${escapeHtml(content.about.placeholder)}</small></div>`;

const faqItems = content.faq.items.map((item, index) => `          <details${index === 0 ? ' open' : ''}>
            <summary>${escapeHtml(item.question)}</summary>
            <p>${escapeHtml(item.answer)}</p>
          </details>`).join('\n');

const policyItems = content.policies.items.map((item) => `            <article>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.description)}</p>
            </article>`).join('\n');

const projectTypes = content.contact.projectTypes.map((item) => `            <option>${escapeHtml(item)}</option>`).join('\n');
const budgets = content.contact.budgets.map((item) => `            <option>${escapeHtml(item)}</option>`).join('\n');

const socialImageUrl = absoluteUrl(content.site.socialImage);
const publicEmail = content.business.publicEmail?.trim() || content.business.email;
const searchConsoleMeta = content.site.googleSiteVerification?.trim()
  ? `<meta name="google-site-verification" content="${escapeHtml(content.site.googleSiteVerification.trim())}">`
  : '<!-- Google Search Console verification can be added in content/site-content.js. -->';
const analyticsId = content.site.googleAnalyticsId?.trim();
const analyticsScript = analyticsId
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(analyticsId)}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${escapeHtml(analyticsId)}');
  </script>`
  : '<!-- Analytics is not enabled. Add an approved measurement ID in content/site-content.js. -->';
const analyticsPrivacyText = analyticsId
  ? 'This website uses Google Analytics to understand general website use and inquiry activity. Google may process device, browser, usage, and approximate location information and may use cookies or similar technologies. Analytics should be enabled only after the applicable privacy and consent requirements are reviewed.'
  : 'This website does not currently use advertising cookies or behavioral analytics. A basic session may still involve technical logs created by browsers, networks, hosting providers, or security systems.';
const schema = {
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
      '@type': 'Person',
      '@id': `${content.site.url}/#aly`,
      name: content.business.name,
      url: `${content.site.url}/`,
      email: publicEmail,
      jobTitle: 'Video Editor and Content Creator',
      homeLocation: {
        '@type': 'City',
        name: 'San Diego'
      },
      knowsAbout: content.services.items.map((service) => service.title)
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${content.site.url}/#business`,
      name: content.business.name,
      url: `${content.site.url}/`,
      image: socialImageUrl,
      description: content.site.description,
      email: publicEmail,
      founder: { '@id': `${content.site.url}/#aly` },
      areaServed: content.business.areaServed.map((name) => ({ '@type': 'AdministrativeArea', name })),
      serviceType: content.services.items.map((service) => service.title)
    },
    {
      '@type': 'FAQPage',
      '@id': `${content.site.url}/#faq`,
      mainEntity: content.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
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
  DOMAIN_NAME: content.site.domainName,
  SOCIAL_IMAGE_URL: socialImageUrl,
  STRUCTURED_DATA: JSON.stringify(schema, null, 2).replaceAll('<', '\\u003c'),
  BUSINESS_NAME: content.business.name,
  BUSINESS_EMAIL: publicEmail,
  BUSINESS_LOCATION: content.business.location,
  BUSINESS_SERVICE_AREA: content.business.serviceArea,
  HERO_EYEBROW: content.hero.eyebrow,
  HERO_HEADLINE: content.hero.headline,
  HERO_INTRODUCTION: content.hero.introduction,
  HERO_PRIMARY_ACTION: content.hero.primaryAction,
  HERO_SECONDARY_ACTION: content.hero.secondaryAction,
  HERO_POSTER: content.hero.poster,
  HERO_VIDEO: content.hero.video,
  HERO_FALLBACK_VIDEO: content.hero.fallbackVideo || content.hero.video,
  HERO_FALLBACK_POSTER: content.hero.fallbackPoster || content.hero.poster,
  HERO_VIDEO_LABEL: content.hero.videoLabel,
  HERO_VIDEO_NOTE: content.hero.videoNote,
  HERO_DISCLOSURE: content.hero.disclosure,
  HERO_PROOF: heroProof,
  WORK_EYEBROW: content.work.eyebrow,
  WORK_HEADLINE: content.work.headline,
  WORK_INTRODUCTION: content.work.introduction,
  PROJECTS: projects,
  INVITATION_EYEBROW: content.work.invitation.eyebrow,
  INVITATION_HEADLINE: content.work.invitation.headline,
  INVITATION_DESCRIPTION: content.work.invitation.description,
  INVITATION_ACTION: content.work.invitation.action,
  SERVICES_EYEBROW: content.services.eyebrow,
  SERVICES_HEADLINE: content.services.headline,
  SERVICES_INTRODUCTION: content.services.introduction,
  SERVICES: services,
  SERVICES_NOTE: content.services.note,
  PACKAGES_EYEBROW: content.packages.eyebrow,
  PACKAGES_HEADLINE: content.packages.headline,
  PACKAGES_INTRODUCTION: content.packages.introduction,
  PACKAGES: packages,
  ADD_ONS: addOns,
  PACKAGES_NOTE: content.packages.note,
  CUSTOM_EYEBROW: content.packages.custom.eyebrow,
  CUSTOM_HEADLINE: content.packages.custom.headline,
  CUSTOM_DESCRIPTION: content.packages.custom.description,
  CUSTOM_ACTION: content.packages.custom.action,
  PROCESS_EYEBROW: content.process.eyebrow,
  PROCESS_HEADLINE: content.process.headline,
  PROCESS_INTRODUCTION: content.process.introduction,
  PROCESS_STEPS: processSteps,
  ABOUT_MEDIA: aboutMedia,
  ABOUT_EYEBROW: content.about.eyebrow,
  ABOUT_HEADLINE: content.about.headline,
  ABOUT_BODY: content.about.body,
  ABOUT_NOTE: content.about.note,
  FAQ_EYEBROW: content.faq.eyebrow,
  FAQ_HEADLINE: content.faq.headline,
  FAQ_INTRODUCTION: content.faq.introduction,
  FAQ_ITEMS: faqItems,
  POLICIES_EYEBROW: content.policies.eyebrow,
  POLICIES_HEADLINE: content.policies.headline,
  POLICIES_INTRODUCTION: content.policies.introduction,
  POLICY_ITEMS: policyItems,
  POLICIES_NOTE: content.policies.note,
  CONTACT_EYEBROW: content.contact.eyebrow,
  CONTACT_HEADLINE: content.contact.headline,
  CONTACT_INTRODUCTION: content.contact.introduction,
  FORM_ENDPOINT: content.contact.formEndpoint,
  FORM_SUBJECT: content.contact.formSubject,
  FORM_NEXT: content.contact.thankYouUrl,
  FORM_SOURCE: content.contact.formSourceUrl,
  FORM_AUTORESPONSE: content.contact.autoresponse,
  PROJECT_TYPES: projectTypes,
  BUDGETS: budgets,
  PRIVACY_TITLE: content.privacy.title,
  PRIVACY_DESCRIPTION: content.privacy.description,
  PRIVACY_EFFECTIVE_DATE: content.privacy.effectiveDate,
  ANALYTICS_PRIVACY_TEXT: analyticsPrivacyText
};

const renderTemplate = (templatePath, outputPath) => {
  let output = fs.readFileSync(templatePath, 'utf8');
  for (const [token, rawValue] of Object.entries(replacements)) {
    const value = ['STRUCTURED_DATA', 'SEARCH_CONSOLE_META', 'ANALYTICS_SCRIPT', 'HERO_PROOF', 'PROJECTS', 'SERVICES', 'PACKAGES', 'ADD_ONS', 'PROCESS_STEPS', 'ABOUT_MEDIA', 'FAQ_ITEMS', 'POLICY_ITEMS', 'PROJECT_TYPES', 'BUDGETS'].includes(token)
      ? String(rawValue)
      : escapeHtml(rawValue);
    output = output.replaceAll(`{{${token}}}`, value);
  }

  const unresolved = output.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved template tokens in ${templatePath}: ${unresolved.join(', ')}`);
  fs.writeFileSync(outputPath, output);
};

renderTemplate(path.join(root, 'templates', 'index.html'), path.join(root, 'index.html'));
renderTemplate(path.join(root, 'templates', 'privacy.html'), path.join(root, 'privacy.html'));
renderTemplate(path.join(root, 'templates', 'thanks.html'), path.join(root, 'thanks.html'));

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${content.site.url}/sitemap.xml\n`);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(content.site.url)}/</loc>
    <lastmod>${escapeXml(content.site.updated)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${escapeXml(content.site.url)}/privacy.html</loc>
    <lastmod>${escapeXml(content.site.updated)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

console.log('Built index.html, privacy.html, thanks.html, robots.txt, and sitemap.xml');
