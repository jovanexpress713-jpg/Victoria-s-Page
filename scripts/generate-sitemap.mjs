#!/usr/bin/env node
/**
 * توليد sitemap.xml و robots.txt داخل مجلد dist/ بعد البناء.
 *
 *   VITE_SITE_URL=https://example.com node scripts/generate-sitemap.mjs
 *
 * - إن لم يُضبط VITE_SITE_URL تُكتب المسارات نسبية بدون سطر Sitemap في robots
 *   (مناسب للمعاينة المحلية)، مع تنبيه لتعيين النطاق قبل النشر.
 * - يستخرج عناوين المقالات (slug) تلقائياً من src/data/insights.ts.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

const BASE_ROUTES = ['/', '/store', '/products', '/lab', '/ai/sales', '/insights', '/contact', '/about', '/privacy'];
const DISALLOW = ['/admin', '/admin/login', '/whatsapp'];

/** أولويات تقديرية لتحسين الزحف. */
const PRIORITY = {
  '/': '1.0',
  '/store': '0.9',
  '/products': '0.9',
  '/contact': '0.9',
  '/lab': '0.8',
  '/ai/sales': '0.8',
  '/insights': '0.8',
};

async function readInsightSlugs() {
  const source = await readFile(path.join(ROOT, 'src', 'data', 'insights.ts'), 'utf8');
  const slugs = [...source.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
  return slugs;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const siteUrl = (process.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '');
  const slugs = await readInsightSlugs();
  const routes = [...BASE_ROUTES, ...slugs.map((s) => `/insights/${s}`)];
  const lastmod = today();

  const loc = (route) => (siteUrl ? `${siteUrl}${route === '/' ? '/' : route}` : route);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${loc(route)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${PRIORITY[route] || '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const robots = `# Victoria Line Soft — robots.txt
User-agent: *
Allow: /
${DISALLOW.map((d) => `Disallow: ${d}`).join('\n')}
Disallow: /icons/og-image
${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : '\n# ملاحظة: اضبط VITE_SITE_URL أثناء البناء لإضافة سطر Sitemap.\n'}`;

  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(DIST, 'robots.txt'), robots, 'utf8');
  console.log(`✓ dist/sitemap.xml (${routes.length} عناوين)`);
  console.log(`✓ dist/robots.txt${siteUrl ? ` (النطاق: ${siteUrl})` : ' (بدون نطاق — معاينة محلية)'}`);
}

main().catch((error) => {
  console.error('فشل توليد خريطة الموقع:', error);
  process.exit(1);
});
