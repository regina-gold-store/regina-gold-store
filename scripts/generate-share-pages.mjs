import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const productsPath = path.join(root, 'assets', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const siteUrl = (process.env.SITE_URL || 'https://regina-gold-store.github.io/regina-gold-store').replace(/\/$/, '');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteImage(product) {
  const image = product.image || (Array.isArray(product.images) ? product.images[0] : '');
  if (!image) return `${siteUrl}/0.png`;
  return /^https?:\/\//i.test(image) ? image : `${siteUrl}/${image.replace(/^\//, '')}`;
}

for (const product of products) {
  if (!product || !product.id || !product.category) continue;
  const number = String(product.id).startsWith(`${product.category}-`)
    ? String(product.id).slice(`${product.category}-`.length)
    : String(product.id).split('-').slice(1).join('-');
  const shareDir = path.join(root, 'products', product.category, number);
  fs.mkdirSync(shareDir, { recursive: true });

  const title = product.name || product.category || 'منتج روجينا جولد';
  const description = String(product.description || 'اكتشف هذه القطعة المميزة من روجينا جولد.').replace(/\s+/g, ' ').trim();
  const shareUrl = `${siteUrl}/products/${encodeURIComponent(product.category)}/${encodeURIComponent(number)}/share.html`;
  const productUrl = `${siteUrl}/index.html?product=${encodeURIComponent(product.id)}`;
  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Regina Gold">
  <meta property="og:title" content="${escapeHtml(title)} | روجينا جولد">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(absoluteImage(product))}">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="1200">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} | روجينا جولد">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(absoluteImage(product))}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(productUrl)}">
  <title>${escapeHtml(title)} | روجينا جولد</title>
</head>
<body>
  <p><a href="${escapeHtml(productUrl)}">فتح المنتج في متجر روجينا جولد</a></p>
</body>
</html>
`;
  fs.writeFileSync(path.join(shareDir, 'share.html'), html, 'utf8');
}

console.log(`Generated share pages for ${products.length} products.`);