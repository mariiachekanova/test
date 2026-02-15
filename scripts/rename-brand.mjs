import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = '/vercel/share/v0-project';

const files = [
  'components/faq-section.tsx',
  'app/about/page.tsx',
  'app/checkout/page.tsx',
  'app/product/[id]/page.tsx',
  'app/category/[slug]/page.tsx',
  'app/category/[slug]/[child]/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/account/signup/page.tsx',
  'app/account/signin/page.tsx',
  'app/store/page.tsx',
  'scripts/004_create_blog_system.sql',
];

const replacements = [
  // URLs first (more specific)
  [/https:\/\/www\.royalsewa\.com/g, 'https://www.premiumsubscriptions.com'],
  [/support@royalsewa\.com/g, 'support@premiumsubscriptions.com'],
  [/www\.royalsewa\.com/g, 'www.premiumsubscriptions.com'],
  [/royalsewa\.com/g, 'premiumsubscriptions.com'],
  // Keywords
  [/"royalsewa"/g, '"premium subscriptions store"'],
  [/'royalsewa about'/g, "'premium subscriptions store about'"],
  // Brand name
  [/RoyalSewa Team/g, 'Premium Subscriptions Store Team'],
  [/RoyalSewa/g, 'Premium Subscriptions Store'],
  // Account names in checkout
  [/Royal Sewa Digital Pvt\. Ltd\./g, 'Premium Subscriptions Digital Pvt. Ltd.'],
  [/Royal Sewa Digital/g, 'Premium Subscriptions Digital'],
];

let totalChanges = 0;

for (const file of files) {
  const fullPath = join(ROOT, file);
  try {
    let content = readFileSync(fullPath, 'utf-8');
    const original = content;
    
    for (const [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    if (content !== original) {
      writeFileSync(fullPath, content, 'utf-8');
      const changes = original.split('RoyalSewa').length + original.split('royalsewa').length + original.split('Royal Sewa').length - 3;
      console.log(`[v0] Updated: ${file} (${changes} potential matches)`);
      totalChanges++;
    } else {
      console.log(`[v0] No changes: ${file}`);
    }
  } catch (e) {
    console.log(`[v0] Error with ${file}: ${e.message}`);
  }
}

console.log(`\n[v0] Done. Updated ${totalChanges} files.`);
