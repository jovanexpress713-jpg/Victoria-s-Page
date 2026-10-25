#!/usr/bin/env node
/**
 * توليد أصول العلامة التجارية (أيقونات + صورة مشاركة) من ملفات SVG مصدرية.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * المخرجات داخل public/icons/ وتُستخدم في index.html ووسائل التواصل.
 * ملاحظة: لا يتم رسم أي نص لأن الصورة تُبنى متجهياً بالكامل (بلا اعتماد على خطوط النظام).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'icons');

const TILE = `
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2130"/>
      <stop offset="1" stop-color="#080b16"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d8ff7a"/>
      <stop offset="1" stop-color="#9b8cff"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#tile)"/>
  <path d="M16 18h6.6l9.4 22.2L41.4 18H48L34.9 47.2h-5.8z" fill="url(#mark)"/>
  <circle cx="48.5" cy="45.5" r="3.5" fill="#82efda"/>
`;

function iconSvg(size, radiusRatio = 0.25) {
  const rx = (64 * radiusRatio).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${TILE.replace(
    'rx="16"',
    `rx="${rx}"`
  )}</svg>`;
}

/** بطاقة المشاركة الاجتماعية 1200×630 — تصميم متجهي بهوية الموقع. */
const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1020"/>
      <stop offset="0.55" stop-color="#080b16"/>
      <stop offset="1" stop-color="#0d1323"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#7163d7" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#7163d7" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#318eaa" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#318eaa" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d8ff7a"/>
      <stop offset="1" stop-color="#9b8cff"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#161d2e"/>
      <stop offset="1" stop-color="#0a0f1c"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="900" cy="180" r="360" fill="url(#glowA)"/>
  <circle cx="250" cy="520" r="320" fill="url(#glowB)"/>

  <g fill="none" stroke="#a69aff" stroke-opacity="0.22">
    <ellipse cx="600" cy="315" rx="470" ry="180" transform="rotate(-18 600 315)"/>
    <ellipse cx="600" cy="315" rx="400" ry="240" transform="rotate(42 600 315)" stroke="#83efda" stroke-opacity="0.18"/>
    <ellipse cx="600" cy="315" rx="540" ry="120" transform="rotate(6 600 315)" stroke-opacity="0.12"/>
  </g>

  <g transform="translate(486 168) scale(3.6)">
    <rect width="64" height="64" rx="20" fill="url(#tile)" stroke="#ffffff" stroke-opacity="0.10"/>
    <path d="M16 18h6.6l9.4 22.2L41.4 18H48L34.9 47.2h-5.8z" fill="url(#mark)"/>
    <circle cx="48.5" cy="45.5" r="3.5" fill="#82efda"/>
  </g>

  <g>
    <rect x="432" y="452" width="336" height="8" rx="4" fill="#9b8cff" fill-opacity="0.55"/>
    <rect x="482" y="476" width="236" height="6" rx="3" fill="#82efda" fill-opacity="0.40"/>
    <rect x="522" y="498" width="156" height="6" rx="3" fill="#f7f8ff" fill-opacity="0.22"/>
  </g>

  <g stroke="#f7f8ff" stroke-opacity="0.14">
    <line x1="60" y1="60" x2="60" y2="130"/>
    <line x1="60" y1="60" x2="130" y2="60"/>
    <line x1="1140" y1="570" x2="1140" y2="500"/>
    <line x1="1140" y1="570" x2="1070" y2="570"/>
  </g>
</svg>`;

const ICON_SIZES = [
  { size: 16, file: 'favicon-16x16.png', ratio: 0.12 },
  { size: 32, file: 'favicon-32x32.png', ratio: 0.16 },
  { size: 180, file: 'apple-touch-icon.png', ratio: 0.22 },
  { size: 192, file: 'android-chrome-192x192.png', ratio: 0.2 },
  { size: 512, file: 'android-chrome-512x512.png', ratio: 0.2 },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  // المصدر المتجهي للأيقونة
  await writeFile(
    path.join(ROOT, 'public', 'favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Victoria Line Soft">${TILE}</svg>\n`
  );

  for (const icon of ICON_SIZES) {
    const svg = iconSvg(icon.size, icon.ratio);
    await sharp(Buffer.from(svg)).resize(icon.size, icon.size).png().toFile(path.join(OUT, icon.file));
    console.log(`✓ icons/${icon.file}`);
  }

  // أيقونة مركّبة للشاشات التي تطلب قناعاً
  await sharp(Buffer.from(iconSvg(512, 0.2)))
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT, 'maskable-icon-512x512.png'));
  console.log('✓ icons/maskable-icon-512x512.png');

  await sharp(Buffer.from(OG_SVG)).resize(1200, 630).png().toFile(path.join(OUT, 'og-image.png'));
  console.log('✓ icons/og-image.png');

  await sharp(Buffer.from(OG_SVG)).resize(1200, 630).jpeg({ quality: 86 }).toFile(path.join(OUT, 'og-image.jpg'));
  console.log('✓ icons/og-image.jpg');
}

main().catch((error) => {
  console.error('فشل توليد أصول العلامة:', error);
  process.exit(1);
});
