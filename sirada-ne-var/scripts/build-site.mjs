// Sitene yuklenecek paketi hazirlar:  SUPPORT_EMAIL=ad@site.com npm run site
// Cikti: dist/sirada-ne-var/ klasoru ve dist/sirada-ne-var-site.zip
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const email = (process.env.SUPPORT_EMAIL || '').trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('SUPPORT_EMAIL gerekli (destek ve gizlilik sayfasinda gorunecek e-posta).');
  console.error('Ornek: SUPPORT_EMAIL=destek@siteniz.com npm run site');
  process.exit(1);
}

const dist = join(root, 'dist');
const out = join(dist, 'sirada-ne-var');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, 'web'), out, { recursive: true });

let replaced = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(html|js|css|webmanifest)$/.test(name)) continue;
    const text = readFileSync(p, 'utf8');
    if (text.includes('__SUPPORT_EMAIL__')) {
      writeFileSync(p, text.split('__SUPPORT_EMAIL__').join(email));
      replaced++;
    }
  }
}
walk(out);

execFileSync('zip', ['-r', '-q', '-X', 'sirada-ne-var-site.zip', 'sirada-ne-var'], { cwd: dist });
console.log(`Hazir: dist/sirada-ne-var-site.zip (${replaced} sayfaya e-posta yazildi)`);
