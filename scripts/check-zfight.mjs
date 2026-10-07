// Laporan z-fighting: sebelum dan sesudah pass pemisahan otomatis.
//   node scripts/check-zfight.mjs          -> laporan
//   node scripts/check-zfight.mjs --strict -> keluar dengan kode 1 jika masih ada konflik setelah pass
import { buildSite } from '../model.js';
import { findConflicts, separate, summarize } from './zfight.mjs';

const { site } = buildSite();
const before = findConflicts(site);
console.log(`Sebelum pass otomatis: ${before.length} konflik (berimpit ${before.filter(c => c.gap < 1e-4).length}, terlalu rapat ${before.filter(c => c.gap >= 1e-4).length})`);
if (before.length) console.log(summarize(before, 15));
const { fixed, remaining } = separate(site);
console.log(`\nPass otomatis memisahkan ${fixed} sisi. Sisa konflik: ${remaining}`);
if (remaining) console.log(summarize(findConflicts(site)));
if (process.argv.includes('--strict') && remaining) process.exit(1);
