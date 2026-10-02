// Model tapak Pesantren Merah Putih (titik kabupaten/kota).
// Dipakai bersama oleh index.html (penampil) dan scripts/build-glb.mjs (ekspor .glb).
// Koordinat lokal dalam meter: x = barat→timur (0–60), z = utara→selatan (0–100), y = atas.
import * as THREE from 'three';

export const SITE_W = 60, SITE_D = 100, FLOOR_H = 3.6;
export const ZONE_COLORS = { santri: 0xC8102E, ibadah: 0xE0A100, layanan: 0xB34834, pengelola: 0x6F0A1C, luar: 0x9DB08A };
export const ZONE_NAMES = { santri: 'Santri', ibadah: 'Ibadah', layanan: 'Layanan', pengelola: 'Pengelola', luar: 'Ruang Luar' };

// [id, nama, zona, lantai, luas, rincian]
export const ITEMS = [
  ['asrama', 'Asrama Santri', 'santri', 2, 972, '9 kamar × 24 santri (12 ranjang susun + loker per kamar), ruang belajar lesehan, blok KM/WC di tiap lantai, tangga di aula depan.'],
  ['masjid', 'Masjid / Mushola', 'ibadah', 1, 450, 'Ruang shalat berkarpet dengan garis saf, mihrab dan mimbar di dinding kiblat, rak Al-Qur\'an, 6 lingkaran halaqah dengan rehal, serambi, ruang wudhu putra/putri, menara.'],
  ['serbaguna', 'Ruang Serbaguna', 'layanan', 1, 180, '6 ruang × 30 m²: 4 kelas dengan meja-kursi dan papan tulis, 2 ruang halaqah lesehan.'],
  ['klinik', 'Klinik', 'layanan', 1, 60, 'Ruang tunggu, ruang periksa (meja dokter, bed periksa, wastafel), ruang observasi 2 bed bertirai, ruang obat.'],
  ['dapur', "Dapur & Mat'am", 'layanan', 1, 460, 'Ruang makan lesehan 6 baris karpet dengan 66 nampan, meja saji, dapur 80 m² (kompor besar, kulkas, meja persiapan, tabung gas), gudang & tempat cuci piring.'],
  ['mess', 'Mess Musyrif & Guru', 'pengelola', 2, 120, '10 kamar × 2 orang (ranjang, lemari, meja belajar), kamar mandi bersama di tiap lantai.'],
  ['kantor', 'Kantor Administrasi', 'pengelola', 2, 150, 'Lt.1: lobi, resepsionis, ruang staf admin (6 meja komputer, lemari arsip). Lt.2: ruang pimpinan dan ruang rapat koordinator.'],
  ['posjaga', 'Pos Jaga', 'pengelola', 1, 9, 'Meja CCTV, kursi jaga, lemari kecil. Palang pintu di gerbang utama.'],
  ['posbarat', 'Pos Barat Daya', 'pengelola', 1, 9, 'Pos security sudut barat daya.'],
  ['postimur', 'Pos Tenggara', 'pengelola', 1, 9, 'Pos security sudut tenggara.'],
  ['parkir', 'Parkir & RTH', 'luar', 0, 300, '5 mobil, deretan motor, marka parkir, taman RTH dengan pohon dan tempat sampah.'],
  ['lapangan', 'Lapangan Serbaguna', 'luar', 0, 600, 'Lapangan futsal dengan gawang dan marka, bangku penonton, jemuran santri, TPS.'],
];

// ---------- dasar ----------
const UNIT = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 20);
const SPH = new THREE.SphereGeometry(0.5, 16, 12);
const HEMI = new THREE.SphereGeometry(0.5, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2);
const CONE = new THREE.ConeGeometry(0.5, 1, 16);

const matCache = new Map();
function m(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts }));
  return matCache.get(key);
}
const M = {
  wallIn: m(0xF2EBDF), tile: m(0xE4DDD0), concrete: m(0xB7B0A5), wood: m(0xA0703F), woodD: m(0x6A4528),
  door: m(0x7B4B2A), metal: m(0x8C939A, { metalness: 0.4, roughness: 0.5 }), steel: m(0xC7CCD1, { metalness: 0.5, roughness: 0.35 }),
  white: m(0xF5F4F0), black: m(0x26282B), glass: m(0x9CC9DA, { transparent: true, opacity: 0.35, roughness: 0.1 }),
  darkGlass: m(0x2C3B46, { roughness: 0.2 }), mattress: m(0xEFE9DC), pillow: m(0xFFFFFF), blanket: m(0x2F5E8E),
  blanket2: m(0x7A2E3B), locker: m(0x5F7D8C), carpet: m(0x2C6A4E), carpetLine: m(0xE9E2C8),
  gold: m(0xD9A92C, { metalness: 0.5, roughness: 0.35 }), matRed: m(0x8E3B2E), tray: m(0xB8BEC4, { metalness: 0.6, roughness: 0.3 }),
  rice: m(0xFAF7EE), lauk: m(0xC0692B), green: m(0x3E8E4E), yellow: m(0xE5B620), red: m(0xC8102E), blue: m(0x2F6FB0),
  asphalt: m(0x4B4D50), paving: m(0xC4BBAE), stripe: m(0xF3F1EA), grass: m(0x86A866), leaf: m(0x4E7D3A), leaf2: m(0x6A9447),
  trunk: m(0x6B4B33), field: m(0x5F9450), lamp: m(0xFFF3C4, { emissive: 0xFFE9A0, emissiveIntensity: 0.8 }),
  fabric: m(0x4B5A6B), fabric2: m(0x8A6A4A), curtain: m(0xA8D0D8), board: m(0xFFFFFF), tileBlue: m(0x7FB3C8),
  sand: m(0xE9DCC8), brick: m(0xB89A6A), plant: m(0x3F7A3A), pot: m(0x9A5B3A),
};
const BOOKS = [M.green, M.red, M.blue, M.yellow, M.woodD];

function grp(p, x = 0, y = 0, z = 0, ry = 0, name) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; if (name) g.name = name; p.add(g); return g;
}
// kotak dengan alas di y
function bx(p, x, y, z, w, h, d, mat, ry = 0) {
  const o = new THREE.Mesh(UNIT, mat); o.scale.set(w, h, d); o.position.set(x, y + h / 2, z); o.rotation.y = ry; p.add(o); return o;
}
function cy(p, x, y, z, r, h, mat) {
  const o = new THREE.Mesh(CYL, mat); o.scale.set(r * 2, h, r * 2); o.position.set(x, y + h / 2, z); p.add(o); return o;
}
function sp(p, x, y, z, r, mat, sy = 1) {
  const o = new THREE.Mesh(SPH, mat); o.scale.set(r * 2, r * 2 * sy, r * 2); o.position.set(x, y, z); p.add(o); return o;
}
function wheel(p, x, y, z, r, w, mat) {
  const o = new THREE.Mesh(CYL, mat); o.scale.set(r * 2, w, r * 2); o.rotation.z = Math.PI / 2; o.position.set(x, y, z); p.add(o); return o;
}
function hipRoof(p, x, y, z, w, d, h, mat) {
  const hw = w / 2, hd = d / 2, v = [];
  const A = [-hw, 0, -hd], B = [hw, 0, -hd], C = [hw, 0, hd], D = [-hw, 0, hd];
  let r1, r2, faces;
  if (w >= d) { r1 = [-(hw - hd), h, 0]; r2 = [hw - hd, h, 0]; faces = [[A, B, r2], [A, r2, r1], [C, D, r1], [C, r1, r2], [D, A, r1], [B, C, r2]]; }
  else { r1 = [0, h, -(hd - hw)]; r2 = [0, h, hd - hw]; faces = [[D, A, r1], [D, r1, r2], [B, C, r2], [B, r2, r1], [A, B, r1], [C, D, r2]]; }
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let [p1, p2, p3] of faces) {
    a.fromArray(p1); b.fromArray(p2); c.fromArray(p3);
    const n = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a));
    if (n.y < 0) [p2, p3] = [p3, p2];
    v.push(...p1, ...p2, ...p3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  geo.computeVertexNormals();
  const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); p.add(o); return o;
}

// ---------- dinding ----------
// Dinding lurus sejajar sumbu dengan bukaan: {at (m dari awal), kind: 'win'|'door'|'door2'|'gap', w, y0, h}
function wall(p, x0, z0, x1, z1, y, h, t, mat, ops = []) {
  const alongX = Math.abs(z1 - z0) < 1e-6;
  const L = alongX ? x1 - x0 : z1 - z0;
  const place = (s, yy, w, hh, mt, th) => alongX ? bx(p, x0 + s, yy, z0, w, hh, th, mt) : bx(p, x0, yy, z0 + s, th, hh, w, mt);
  const seg = (a, b, yy, hh) => { if (b - a > 0.02 && hh > 0.02) place((a + b) / 2, yy, b - a, hh, mat, t); };
  let cur = 0;
  [...ops].sort((a, b) => a.at - b.at).forEach(o => {
    const kind = o.kind || 'door';
    const w = o.w ?? (kind === 'win' ? 1.2 : kind === 'door2' ? 1.8 : 0.9);
    const y0 = o.y0 ?? (kind === 'win' ? 0.9 : 0);
    const oh = Math.min(o.h ?? (kind === 'win' ? 1.3 : 2.1), h - y0);
    const a = o.at - w / 2, b = o.at + w / 2;
    seg(cur, a, y, h); seg(a, b, y, y0); seg(a, b, y + y0 + oh, h - y0 - oh);
    if (kind === 'win') { place(o.at, y + y0, w, oh, M.glass, 0.04); place(o.at, y + y0 - 0.05, w + 0.1, 0.05, M.white, t + 0.08); }
    if (kind === 'door') { place(o.at, y, w - 0.04, oh - 0.02, M.door, 0.05); place(o.at + w * 0.35, y + 1.0, 0.05, 0.12, M.steel, t + 0.08); }
    if (kind === 'door2') {
      place(o.at - w / 4, y, w / 2 - 0.03, oh - 0.02, M.door, 0.05); place(o.at + w / 4, y, w / 2 - 0.03, oh - 0.02, M.door, 0.05);
      place(o.at - 0.08, y + 1.0, 0.05, 0.14, M.steel, t + 0.08); place(o.at + 0.08, y + 1.0, 0.05, 0.14, M.steel, t + 0.08);
    }
    cur = b;
  });
  seg(cur, L, y, h);
}
const part = (p, x0, z0, x1, z1, y, h, ops) => wall(p, x0, z0, x1, z1, y, h, 0.12, M.wallIn, ops);

function slab(p, x0, z0, x1, z1, y, t, mat, hole) {
  if (!hole) return bx(p, (x0 + x1) / 2, y, (z0 + z1) / 2, x1 - x0, t, z1 - z0, mat);
  const [hx0, hz0, hx1, hz1] = hole;
  bx(p, (x0 + x1) / 2, y, (z0 + hz0) / 2, x1 - x0, t, hz0 - z0, mat);
  bx(p, (x0 + x1) / 2, y, (hz1 + z1) / 2, x1 - x0, t, z1 - hz1, mat);
  bx(p, (x0 + hx0) / 2, y, (hz0 + hz1) / 2, hx0 - x0, t, hz1 - hz0, mat);
  bx(p, (hx1 + x1) / 2, y, (hz0 + hz1) / 2, x1 - hx1, t, hz1 - hz0, mat);
}

// tangga lurus naik ke arah +x atau +z mulai dari (x, z)
function stairs(p, x, z, y, rise, dir, width) {
  const n = Math.round(rise / 0.18), sh = rise / n, run = 0.28;
  const g = grp(p, 0, 0, 0, 0, 'Tangga');
  for (let i = 0; i < n; i++) {
    if (dir === 'x') bx(g, x + i * run + run / 2, y, z, run, sh * (i + 1), width, M.concrete);
    else bx(g, x, y, z + i * run + run / 2, width, sh * (i + 1), run, M.concrete);
  }
  return n * run;
}
function railing(p, x0, z0, x1, z1, y) {
  const alongX = Math.abs(z1 - z0) < 1e-6, L = alongX ? x1 - x0 : z1 - z0;
  if (alongX) bx(p, (x0 + x1) / 2, y + 0.95, z0, L, 0.06, 0.06, M.metal); else bx(p, x0, y + 0.95, (z0 + z1) / 2, 0.06, 0.06, L, M.metal);
  for (let s = 0; s <= L + 1e-6; s += 1) alongX ? bx(p, x0 + s, y, z0, 0.04, 0.95, 0.04, M.metal) : bx(p, x0, y, z0 + s, 0.04, 0.95, 0.04, M.metal);
}

// Bangunan bertingkat: dinding luar zona, jendela otomatis, pelat lantai, atap.
function building(parent, o) {
  const g = grp(parent, 0, 0, 0, 0, o.name); g.userData.id = o.id;
  const H = o.h ?? FLOOR_H, FL = f => 0.3 + f * H;
  const w = o.x1 - o.x0, d = o.z1 - o.z0, cx = o.x0 + w / 2, cz = o.z0 + d / 2;
  const ext = m(o.color);
  const sides = { N: [o.x0, o.z0, o.x1, o.z0], S: [o.x0, o.z1, o.x1, o.z1], W: [o.x0, o.z0, o.x0, o.z1], E: [o.x1, o.z0, o.x1, o.z1] };
  const floors = [];
  for (let f = 0; f < (o.floors || 1); f++) {
    const fg = grp(g, 0, 0, 0, 0, `${o.name} Lt${f + 1}`);
    Object.assign(fg.userData, { merge: true, id: o.id, floor: f });
    floors.push(fg);
    if (f === 0) bx(fg, cx, 0, cz, w + 0.3, 0.3, d + 0.3, M.tile);
    else slab(fg, o.x0, o.z0, o.x1, o.z1, FL(f) - 0.2, 0.2, M.tile, o.hole);
    for (const s of Object.keys(sides)) {
      if (o.skip?.includes(s)) continue;
      const len = s === 'N' || s === 'S' ? w : d;
      const ops = (o.ops || []).filter(op => op.side === s && (op.f ?? 0) === f);
      if (!o.noWin?.includes(s)) {
        const n = Math.max(1, Math.floor((len - 1) / (o.winStep ?? 3.2)));
        for (let i = 0; i < n; i++) {
          const at = len * (i + 0.5) / n;
          if (!ops.some(op => Math.abs(op.at - at) < (op.w ?? 1) / 2 + 0.9)) ops.push({ at, kind: 'win', w: o.winW });
        }
      }
      wall(fg, ...sides[s], FL(f), H - 0.2, 0.2, ext, ops);
    }
  }
  const roof = grp(g, 0, 0, 0, 0, `${o.name} Atap`);
  Object.assign(roof.userData, { merge: true, id: o.id, part: 'roof' });
  const top = FL(o.floors || 1) - 0.2;
  const roofColor = new THREE.Color(o.color).multiplyScalar(0.8).getHex();
  bx(roof, cx, top, cz, w + 0.3, 0.25, d + 0.3, m(roofColor));
  let peak = top + 0.25;
  if (o.roof !== 'flat') {
    const rh = Math.min(Math.min(w, d) * 0.28, 3.5);
    hipRoof(roof, cx, top + 0.25, cz, w + 1.2, d + 1.2, rh, m(roofColor));
    peak += rh;
  }
  return { g, floors, roof, FL, H, peak };
}

// ---------- perabot (lokal: depan menghadap +z) ----------
function bunkBed(p, x, y, z, ry) {
  const g = grp(p, x, y, z, ry, 'Ranjang Susun');
  for (const sx of [-0.45, 0.45]) for (const sz of [-0.97, 0.97]) bx(g, sx, 0, sz, 0.06, 1.75, 0.06, M.metal);
  [[0.3, M.blanket], [1.25, M.blanket2]].forEach(([yy, bl]) => {
    bx(g, 0, yy, 0, 0.96, 0.06, 2.0, M.metal);
    bx(g, 0, yy + 0.06, 0, 0.88, 0.14, 1.92, M.mattress);
    bx(g, 0, yy + 0.2, -0.72, 0.55, 0.1, 0.32, M.pillow);
    bx(g, 0, yy + 0.2, 0.32, 0.9, 0.04, 1.2, bl);
  });
  bx(g, -0.47, 1.45, 0, 0.04, 0.04, 1.9, M.metal);
  for (let i = 0; i < 4; i++) bx(g, 0.49, 0.35 + i * 0.3, 0.75, 0.04, 0.04, 0.4, M.metal);
}
function singleBed(p, x, y, z, ry, blanket = M.blanket) {
  const g = grp(p, x, y, z, ry, 'Ranjang');
  bx(g, 0, 0, 0, 0.95, 0.35, 2.0, M.wood);
  bx(g, 0, 0.35, 0, 0.9, 0.15, 1.95, M.mattress);
  bx(g, 0, 0.5, -0.72, 0.55, 0.1, 0.32, M.pillow);
  bx(g, 0, 0.5, 0.3, 0.92, 0.04, 1.25, blanket);
  bx(g, 0, 0, -1.0, 0.95, 0.9, 0.06, M.woodD);
}
function locker(p, x, y, z, ry, w = 1.0) {
  const g = grp(p, x, y, z, ry, 'Loker');
  bx(g, 0, 0, 0, w, 1.8, 0.5, M.locker);
  bx(g, 0, 0, 0.255, 0.02, 1.8, 0.01, M.black);
  for (const yy of [0.45, 0.9, 1.35]) bx(g, 0, yy, 0.255, w, 0.02, 0.01, M.black);
  for (const sx of [-w / 4, w / 4]) for (const yy of [0.2, 0.65, 1.1, 1.55]) bx(g, sx + 0.12, yy, 0.27, 0.04, 0.08, 0.03, M.steel);
}
function desk(p, x, y, z, ry, w = 1.2, d = 0.6, h = 0.75, top = M.wood) {
  const g = grp(p, x, y, z, ry, 'Meja');
  bx(g, 0, h - 0.04, 0, w, 0.04, d, top);
  for (const sx of [-w / 2 + 0.04, w / 2 - 0.04]) for (const sz of [-d / 2 + 0.04, d / 2 - 0.04]) bx(g, sx, 0, sz, 0.04, h - 0.04, 0.04, M.metal);
  return g;
}
function chair(p, x, y, z, ry, mat = M.fabric) {
  const g = grp(p, x, y, z, ry, 'Kursi');
  bx(g, 0, 0.42, 0, 0.44, 0.05, 0.42, mat);
  for (const sx of [-0.19, 0.19]) for (const sz of [-0.18, 0.18]) bx(g, sx, 0, sz, 0.03, 0.42, 0.03, M.metal);
  bx(g, 0, 0.47, -0.2, 0.44, 0.45, 0.04, mat);
}
function monitor(p, x, y, z, ry) {
  const g = grp(p, x, y, z, ry, 'Komputer');
  bx(g, 0, 0, 0, 0.18, 0.02, 0.15, M.black); bx(g, 0, 0.02, -0.02, 0.04, 0.15, 0.04, M.black);
  bx(g, 0, 0.15, 0, 0.52, 0.32, 0.03, M.black); bx(g, 0, 0.17, 0.016, 0.48, 0.28, 0.005, M.darkGlass);
  bx(g, 0, 0, 0.25, 0.42, 0.02, 0.14, M.black);
}
function whiteboard(p, x, y, z, ry, w = 2.4) {
  const g = grp(p, x, y, z, ry, 'Papan Tulis');
  bx(g, 0, 0.9, 0, w + 0.08, 1.28, 0.03, M.metal); bx(g, 0, 0.94, 0.02, w, 1.2, 0.02, M.board);
  bx(g, 0, 0.88, 0.06, w, 0.03, 0.08, M.metal);
}
function shelf(p, x, y, z, ry, w = 1.6, h = 1.8, d = 0.35, books = true) {
  const g = grp(p, x, y, z, ry, 'Rak');
  bx(g, -w / 2 + 0.02, 0, 0, 0.04, h, d, M.wood); bx(g, w / 2 - 0.02, 0, 0, 0.04, h, d, M.wood);
  bx(g, 0, 0, -d / 2 + 0.01, w, h, 0.02, M.woodD);
  const n = Math.max(2, Math.round(h / 0.4));
  for (let i = 0; i <= n; i++) {
    const yy = i * (h - 0.03) / n;
    bx(g, 0, yy, 0, w, 0.03, d, M.wood);
    if (books && i < n) {
      let bxp = -w / 2 + 0.08, k = i;
      while (bxp < w / 2 - 0.1) { const bw = 0.05 + ((k * 7) % 3) * 0.015; bx(g, bxp + bw / 2, yy + 0.03, 0.02, bw, 0.22 + (k % 2) * 0.04, d - 0.1, BOOKS[k % BOOKS.length]); bxp += bw + 0.01; k++; }
    }
  }
}
function cabinet(p, x, y, z, ry, w = 0.5, h = 1.3) {
  const g = grp(p, x, y, z, ry, 'Lemari Arsip');
  bx(g, 0, 0, 0, w, h, 0.6, M.metal);
  const n = Math.round(h / 0.33);
  for (let i = 0; i < n; i++) { bx(g, 0, i * h / n + 0.02, 0.301, w - 0.04, h / n - 0.04, 0.01, M.steel); bx(g, 0, (i + 0.6) * h / n, 0.31, 0.14, 0.03, 0.03, M.black); }
}
function wardrobe(p, x, y, z, ry, w = 1.0) {
  const g = grp(p, x, y, z, ry, 'Lemari Pakaian');
  bx(g, 0, 0, 0, w, 1.9, 0.55, M.wood);
  bx(g, 0, 0.02, 0.276, 0.02, 1.86, 0.01, M.woodD);
  for (const sx of [-0.08, 0.08]) bx(g, sx, 0.95, 0.29, 0.03, 0.18, 0.03, M.steel);
}
function sofa(p, x, y, z, ry, w = 1.8) {
  const g = grp(p, x, y, z, ry, 'Sofa');
  bx(g, 0, 0, 0, w, 0.42, 0.85, M.fabric2); bx(g, 0, 0.42, -0.32, w, 0.42, 0.2, M.fabric2);
  bx(g, -w / 2 + 0.1, 0.42, 0, 0.2, 0.2, 0.85, M.fabric2); bx(g, w / 2 - 0.1, 0.42, 0, 0.2, 0.2, 0.85, M.fabric2);
}
function plant(p, x, y, z, s = 1) {
  const g = grp(p, x, y, z, 0, 'Tanaman Pot');
  cy(g, 0, 0, 0, 0.18 * s, 0.35 * s, M.pot); sp(g, 0, 0.55 * s, 0, 0.32 * s, M.plant, 1.2);
}
function lowTable(p, x, y, z, ry, w = 1.2, d = 0.5) {
  const g = grp(p, x, y, z, ry, 'Meja Lesehan');
  bx(g, 0, 0.26, 0, w, 0.04, d, M.wood);
  for (const sx of [-w / 2 + 0.06, w / 2 - 0.06]) bx(g, sx, 0, 0, 0.05, 0.26, d - 0.06, M.woodD);
}
function rehal(p, x, y, z, ry) {
  const g = grp(p, x, y, z, ry, 'Rehal');
  const a = bx(g, 0, 0, 0, 0.32, 0.03, 0.26, M.wood); a.rotation.x = 0.5;
  const b = bx(g, 0, 0, 0, 0.32, 0.03, 0.26, M.wood); b.rotation.x = -0.5;
  bx(g, 0, 0.13, -0.02, 0.2, 0.03, 0.15, M.green);
}
function tray(p, x, y, z) {
  const g = grp(p, x, y, z, 0, 'Nampan');
  cy(g, 0, 0, 0, 0.36, 0.03, M.tray); sp(g, 0, 0.05, 0, 0.18, M.rice, 0.5);
  sp(g, 0.2, 0.05, 0.08, 0.07, M.lauk, 0.6); sp(g, -0.18, 0.05, 0.1, 0.06, M.green, 0.6);
}
function stall(p, x, y, z, ry) {
  const g = grp(p, x, y, z, ry, 'Bilik WC');
  bx(g, -0.63, 0, 0, 0.04, 2.0, 1.55, M.tileBlue); bx(g, 0.63, 0, 0, 0.04, 2.0, 1.55, M.tileBlue);
  bx(g, 0.15, 0, 0.78, 0.9, 1.9, 0.04, M.door);
  bx(g, -0.2, 0, -0.25, 0.42, 0.12, 0.55, M.white);
  bx(g, 0.35, 0, -0.5, 0.5, 0.7, 0.5, M.tileBlue);
  cy(g, 0.35, 0, 0.25, 0.14, 0.25, M.blue);
}
function washTrough(p, x, y, z, ry, len, n) {
  const g = grp(p, x, y, z, ry, 'Tempat Wudhu');
  bx(g, 0, 0, 0, len, 0.75, 0.55, M.tileBlue);
  bx(g, 0, 0.75, 0, len - 0.1, 0.02, 0.4, M.concrete);
  bx(g, 0, 0, -0.3, len, 1.25, 0.08, M.tile);
  for (let i = 0; i < n; i++) { const sx = -len / 2 + len * (i + 0.5) / n; bx(g, sx, 1.0, -0.22, 0.04, 0.04, 0.18, M.steel); bx(g, sx, 0, 0.6, 0.35, 0.15, 0.35, M.concrete); }
}
function sinkCounter(p, x, y, z, ry, w = 1.2) {
  const g = grp(p, x, y, z, ry, 'Wastafel');
  bx(g, 0, 0, 0, w, 0.85, 0.6, M.steel); bx(g, 0, 0.8, 0.02, w * 0.6, 0.06, 0.4, M.black);
  bx(g, 0, 0.85, -0.22, 0.04, 0.3, 0.04, M.steel); bx(g, 0, 1.13, -0.14, 0.04, 0.04, 0.18, M.steel);
}
function stove(p, x, y, z, ry, w = 1.6) {
  const g = grp(p, x, y, z, ry, 'Kompor Besar');
  bx(g, 0, 0, 0, w, 0.75, 0.75, M.steel);
  for (const sx of [-w / 4, w / 4]) { cy(g, sx, 0.75, 0, 0.22, 0.05, M.black); cy(g, sx, 0.8, 0, 0.3, 0.3, M.metal); }
  cy(g, w / 2 + 0.3, 0, 0.1, 0.16, 0.6, M.blue);
}
function fridge(p, x, y, z, ry) {
  const g = grp(p, x, y, z, ry, 'Kulkas');
  bx(g, 0, 0, 0, 0.8, 1.9, 0.7, M.white); bx(g, 0, 1.2, 0.351, 0.78, 0.01, 0.01, M.metal);
  bx(g, 0.3, 0.6, 0.37, 0.03, 0.4, 0.03, M.steel); bx(g, 0.3, 1.4, 0.37, 0.03, 0.3, 0.03, M.steel);
}
function clinicBed(p, x, y, z, ry, curtain = false) {
  const g = grp(p, x, y, z, ry, 'Bed Pasien');
  bx(g, 0, 0, 0, 0.9, 0.6, 1.95, M.steel); bx(g, 0, 0.6, 0, 0.85, 0.12, 1.9, M.curtain);
  bx(g, 0, 0.72, -0.72, 0.5, 0.1, 0.3, M.pillow);
  if (curtain) { bx(g, -0.75, 0, 0, 0.03, 2.1, 0.03, M.steel); bx(g, -0.75, 0.15, 0.2, 0.02, 1.85, 2.0, M.curtain); }
}
function trashSet(p, x, z, ry = 0) {
  const g = grp(p, x, 0, z, ry, 'Tempat Sampah');
  [[-0.6, M.green], [0, M.yellow], [0.6, M.red]].forEach(([sx, mt]) => {
    cy(g, sx, 0, 0, 0.24, 0.78, mt); cy(g, sx, 0.78, 0, 0.26, 0.06, M.black);
  });
  bx(g, 0, 0, -0.32, 1.9, 0.06, 0.08, M.metal);
}
function car(p, x, z, ry, color, kind = 'sedan') {
  const g = grp(p, x, 0, z, ry, kind === 'van' ? 'Ambulans' : kind === 'pickup' ? 'Mobil Bak' : 'Mobil');
  const body = m(color, { roughness: 0.4, metalness: 0.3 });
  const len = kind === 'van' ? 4.8 : 4.4;
  bx(g, 0, 0.28, 0, 1.78, 0.72, len, body);
  if (kind === 'sedan') { bx(g, 0, 1.0, -0.15, 1.6, 0.58, 2.3, M.darkGlass); bx(g, 0, 1.56, -0.15, 1.55, 0.06, 2.1, body); }
  if (kind === 'van') {
    bx(g, 0, 1.0, -0.25, 1.78, 1.3, 3.9, body); bx(g, 0, 1.15, 1.72, 1.7, 0.55, 0.06, M.darkGlass);
    bx(g, 0, 1.25, -0.25, 1.8, 0.2, 3.92, M.red); bx(g, 0, 2.3, 0.6, 0.9, 0.12, 0.3, M.red);
  }
  if (kind === 'pickup') {
    bx(g, 0, 1.0, 1.0, 1.7, 0.6, 1.5, M.darkGlass); bx(g, 0, 1.6, 1.0, 1.7, 0.06, 1.5, body);
    for (const sx of [-0.86, 0.86]) bx(g, sx, 1.0, -1.1, 0.06, 0.45, 2.1, body);
    bx(g, 0, 1.0, -2.17, 1.78, 0.45, 0.06, body);
    for (let i = 0; i < 3; i++) bx(g, -0.4 + i * 0.4, 1.0, -1.2 + (i % 2) * 0.5, 0.36, 0.3, 0.5, M.rice);
  }
  for (const sx of [-0.85, 0.85]) for (const sz of [-len / 2 + 0.8, len / 2 - 0.8]) wheel(g, sx, 0.33, sz, 0.33, 0.24, M.black);
  for (const sx of [-0.6, 0.6]) { bx(g, sx, 0.7, len / 2, 0.35, 0.12, 0.04, M.lamp); bx(g, sx, 0.75, -len / 2 - 0.02, 0.3, 0.12, 0.04, M.red); }
}
function motorbike(p, x, z, ry, color) {
  const g = grp(p, x, 0, z, ry, 'Motor');
  for (const sz of [-0.62, 0.62]) wheel(g, 0, 0.3, sz, 0.3, 0.1, M.black);
  bx(g, 0, 0.35, 0, 0.3, 0.35, 1.0, m(color, { roughness: 0.4 }));
  bx(g, 0, 0.7, -0.15, 0.28, 0.1, 0.6, M.black);
  bx(g, 0, 0.6, 0.55, 0.08, 0.5, 0.08, M.metal); bx(g, 0, 1.08, 0.55, 0.6, 0.04, 0.04, M.black);
}
function tree(p, x, z, s = 1, leaf = M.leaf) {
  const g = grp(p, x, 0, z, 0, 'Pohon');
  cy(g, 0, 0, 0, 0.15 * s, 2.2 * s, M.trunk);
  sp(g, 0, 2.8 * s, 0, 1.5 * s, leaf, 0.85); sp(g, 0.5 * s, 3.4 * s, 0.2 * s, 1.0 * s, leaf);
}
function lampPost(p, x, z) {
  const g = grp(p, x, 0, z, 0, 'Lampu Taman');
  cy(g, 0, 0, 0, 0.06, 3.6, M.black); cy(g, 0, 3.6, 0, 0.2, 0.08, M.black); sp(g, 0, 3.55, 0, 0.17, M.lamp);
}
function bench(p, x, z, ry) {
  const g = grp(p, x, 0, z, ry, 'Bangku');
  bx(g, 0, 0.42, 0, 1.6, 0.05, 0.42, M.wood); bx(g, 0, 0.55, -0.2, 1.6, 0.35, 0.04, M.wood);
  for (const sx of [-0.7, 0.7]) bx(g, sx, 0, 0, 0.06, 0.42, 0.4, M.black);
}

// ---------- isi bangunan ----------
function fillAsrama(B) {
  const x0 = 2, x1 = 20, cor = 17.8, zs = [30.5, 40.26, 50.02, 59.78, 69.54, 79.3];
  B.floors.forEach((fg, f) => {
    const y = B.FL(f), h = B.H - 0.2;
    // dinding koridor dengan pintu kamar, bukaan ke aula & pintu toilet
    const ops = [{ at: 22.5 - 19, kind: 'door' }, { at: 28.25 - 19, kind: 'gap', w: 3.2, h: 2.6 }];
    for (let r = 0; r < 5; r++) ops.push({ at: zs[r + 1] - 0.8 - 19, kind: 'door' });
    part(fg, cor, 19, cor, 79.3, y, h, ops);
    part(fg, x0, 26, cor, 26, y, h);
    part(fg, x0, 30.5, cor, 30.5, y, h);
    for (let r = 1; r < 5; r++) part(fg, x0, zs[r], cor, zs[r], y, h);
    // blok KM/WC
    for (let i = 0; i < 7; i++) { stall(fg, 2.85 + i * 1.3, y, 19.95, 0); stall(fg, 2.85 + i * 1.3, y, 25.15, Math.PI); }
    washTrough(fg, 7.2, y, 22.85, 0, 8, 8); washTrough(fg, 7.2, y, 22.25, Math.PI, 8, 8);
    // kamar
    for (let r = 0; r < 5; r++) {
      const s = zs[r], e = zs[r + 1];
      if (f === 1 && r === 4) {
        bx(fg, 9.9, y, (s + e) / 2, 14.5, 0.02, 8.4, M.carpet);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) lowTable(fg, 4.5 + j * 3.4, y, s + 2.2 + i * 2.6, 0, 1.6, 0.6);
        shelf(fg, 9.9, y, s + 0.3, 0, 4, 1.8);
        whiteboard(fg, 2.15, y, (s + e) / 2, Math.PI / 2);
        continue;
      }
      for (let i = 0; i < 6; i++) { bunkBed(fg, 3.15, y, s + 1.05 + i * 1.45, Math.PI / 2); bunkBed(fg, 7.4, y, s + 1.05 + i * 1.45, Math.PI / 2); }
      for (let k = 0; k < 6; k++) locker(fg, 10.2 + k * 1.05, y, s + 0.36, 0);
      bx(fg, 13.2, y, e - 3.0, 6, 0.02, 3.2, M.matRed);
      for (let k = 0; k < 3; k++) lowTable(fg, 11.4 + k * 1.8, y, e - 3.0, 0);
    }
    if (f === 0) {
      stairs(fg, 5, 26.95, y, B.H, 'x', 1.5);
      plant(fg, 16.5, y, 29.6); plant(fg, 3, y, 29.6);
    } else {
      railing(fg, 5, 27.75, 10.8, 27.75, y);
      shelf(fg, 13.5, y, 30.25, Math.PI, 3, 1.6);
    }
  });
}

function fillMasjid(hall, wudhu, root) {
  const fg = hall.floors[0], y = hall.FL(0);
  bx(fg, 30.8, y, 36.15, 15.0, 0.02, 21.5, M.carpet);
  for (let x = 24.9; x < 37.6; x += 1.2) bx(fg, x, y + 0.02, 36.15, 0.06, 0.005, 21.5, M.carpetLine);
  // mihrab & mimbar di dinding kiblat (barat)
  const mh = grp(fg, 23.3, y, 36.15, Math.PI / 2, 'Mihrab');
  for (const sx of [-0.95, 0.95]) bx(mh, sx, 0, 0.1, 0.3, 2.8, 0.3, M.gold);
  bx(mh, 0, 2.8, 0.1, 2.2, 0.5, 0.3, M.gold); bx(mh, 0, 0, -0.02, 1.6, 2.8, 0.04, M.white);
  const mb = grp(fg, 24.4, y, 38.6, Math.PI / 2, 'Mimbar');
  for (let i = 0; i < 4; i++) bx(mb, 0, 0, 0.6 - i * 0.3, 0.9, 0.25 * (i + 1), 0.3, M.woodD);
  for (const sx of [-0.45, 0.45]) { bx(mb, sx, 0, -0.45, 0.06, 2.6, 0.06, M.woodD); bx(mb, sx, 0.9, 0.15, 0.04, 0.8, 1.2, M.wood); }
  bx(mb, 0, 2.6, -0.3, 1.1, 0.12, 0.6, M.gold);
  // tiang penyangga kubah
  for (const [tx, tz] of [[26.6, 32], [35, 32], [26.6, 40.3], [35, 40.3]]) cy(fg, tx, y, tz, 0.3, hall.H - 0.2, M.white);
  // rak Al-Qur'an
  for (const sx of [28, 31.5, 35]) { shelf(fg, sx, y, 25.45, 0, 3, 1.6); shelf(fg, sx, y, 46.85, Math.PI, 3, 1.6); }
  // lingkaran halaqah
  for (const hx of [31.4, 35.6]) for (const hz of [29.3, 36.15, 43]) {
    const g = grp(fg, hx, y, hz, 0, 'Halaqah');
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; rehal(g, Math.sin(a) * 1.4, 0.02, Math.cos(a) * 1.4, a + Math.PI); }
    lowTable(g, 0, 0, 0, 0, 0.6, 0.4);
  }
  // ruang wudhu putra / putri
  const wf = wudhu.floors[0], wy = wudhu.FL(0);
  part(wf, 38.5, 43.1, 44.2, 43.1, wy, wudhu.H - 0.2);
  washTrough(wf, 43.8, wy, 41.05, -Math.PI / 2, 3.6, 5); washTrough(wf, 43.8, wy, 45.15, -Math.PI / 2, 3.6, 5);
  // serambi
  const sr = grp(root, 0, 0, 0, 0, 'Serambi'); Object.assign(sr.userData, { merge: true, id: 'masjid' });
  bx(sr, 41.35, 0, 32.05, 5.7, 0.3, 13.9, M.tile);
  for (const sz of [25.4, 29.9, 34.4, 38.8]) cy(sr, 43.9, 0.3, sz, 0.18, 3.9, M.white);
  for (let i = 0; i < 3; i++) bx(sr, 44.45 + i * 0.25, 0, 32.05, 0.25, 0.3 - i * 0.1, 6, M.tile);
  // menara
  const mn = grp(root, 0, 0, 0, 0, 'Menara'); Object.assign(mn.userData, { merge: true, id: 'masjid' });
  cy(mn, 43.9, 0.3, 25.4, 0.9, 16, M.white); cy(mn, 43.9, 12, 25.4, 1.2, 0.3, M.gold);
  cy(mn, 43.9, 16.3, 25.4, 1.1, 0.4, M.gold);
  const cn = new THREE.Mesh(CONE, M.gold); cn.scale.set(2.2, 2.6, 2.2); cn.position.set(43.9, 18, 25.4); mn.add(cn);
  const sroof = grp(root, 0, 0, 0, 0, 'Atap Serambi'); Object.assign(sroof.userData, { merge: true, id: 'masjid', part: 'roof' });
  bx(sroof, 41.4, 4.2, 32.05, 6.2, 0.3, 14.2, m(0xB38000));
  // kubah di atap ruang utama
  const r = hall.roof, top = hall.FL(1) - 0.2 + 0.25;
  cy(r, 30.8, top, 36.15, 5.2, 1.4, m(ZONE_COLORS.ibadah));
  const dome = new THREE.Mesh(HEMI, M.gold); dome.scale.set(10.4, 9, 10.4); dome.position.set(30.8, top + 1.4, 36.15); r.add(dome);
  cy(r, 30.8, top + 5.8, 36.15, 0.08, 1.4, M.gold); sp(r, 30.8, top + 6.5, 36.15, 0.28, M.gold);
  return top + 7;
}

function fillDapur(B) {
  const fg = B.floors[0], y = B.FL(0), h = B.H - 0.2;
  part(fg, 23.1, 70.3, 44.2, 70.3, y, h, [{ at: 4.5, kind: 'gap', w: 4, y0: 0.95, h: 1.1 }, { at: 9, kind: 'door' }, { at: 14, kind: 'door' }]);
  part(fg, 33.1, 70.3, 33.1, 78.3, y, h, [{ at: 3.7, kind: 'door' }]);
  // ruang makan lesehan
  for (let k = 0; k < 6; k++) {
    const z = 52.5 + k * 3.0;
    bx(fg, 33.65, y, z, 18.3, 0.02, 1.6, M.matRed);
    for (let i = 0; i < 11; i++) tray(fg, 25.4 + i * 1.65, y + 0.02, z);
  }
  // meja saji
  desk(fg, 27.6, y, 69.6, 0, 4.2, 0.7, 0.85, M.steel);
  for (let i = 0; i < 5; i++) { bx(fg, 25.9 + i * 0.85, y + 0.85, 69.6, 0.7, 0.12, 0.45, M.steel); bx(fg, 25.9 + i * 0.85, y + 0.97, 69.6, 0.66, 0.02, 0.4, [M.rice, M.lauk, M.green, M.lauk, M.yellow][i]); }
  washTrough(fg, 23.6, y, 60.3, Math.PI / 2, 6, 6);
  // dapur
  for (let i = 0; i < 3; i++) stove(fg, 26.0 + i * 2.7, y, 77.85, Math.PI);
  for (let i = 0; i < 2; i++) cy(fg, 29.0 + i * 0.7, y + 0.85, 73.75, 0.22, 0.4, M.white);
  sinkCounter(fg, 23.55, y, 72.5, Math.PI / 2, 1.6); sinkCounter(fg, 23.55, y, 74.3, Math.PI / 2, 1.6);
  desk(fg, 28, y, 74, 0, 3.2, 1.0, 0.85, M.steel);
  for (let i = 0; i < 3; i++) cy(fg, 26.6 + i * 0.75, y + 0.85, 74.2, 0.22, 0.3, M.metal);
  fridge(fg, 32.5, y, 71.0, -Math.PI / 2); fridge(fg, 32.5, y, 71.9, -Math.PI / 2);
  shelf(fg, 25.5, y, 70.6, 0, 2.4, 1.6, 0.4, false);
  for (let i = 0; i < 4; i++) cy(fg, 24.6 + i * 0.6, y + 0.85, 70.6, 0.2, 0.3, M.metal);
  // gudang & cuci piring
  for (let i = 0; i < 3; i++) sinkCounter(fg, 35.5 + i * 1.4, y, 77.85, Math.PI, 1.3);
  for (let i = 0; i < 2; i++) shelf(fg, 43.85, y, 73.6 + i * 2.1, -Math.PI / 2, 1.8, 1.6, 0.45, false);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 3; k++) bx(fg, 35 + i * 0.75, y + k * 0.25, 71.2 + j * 0.55, 0.65, 0.25, 0.45, M.rice);
  for (let i = 0; i < 2; i++) shelf(fg, 40 + i * 2.2, y, 70.65, 0, 2, 1.8, 0.45, false);
}

function fillSerbaguna(B) {
  const fg = B.floors[0], y = B.FL(0), h = B.H - 0.2;
  const ops = [];
  for (let r = 0; r < 6; r++) ops.push({ at: r * 3.85 + 0.8, kind: 'door' });
  part(fg, 49.2, 19.1, 49.2, 42.2, y, h, ops);
  for (let r = 1; r < 6; r++) part(fg, 49.2, 19.1 + r * 3.85, 58.2, 19.1 + r * 3.85, y, h);
  for (let r = 0; r < 6; r++) {
    const zc = 19.1 + r * 3.85 + 1.925;
    whiteboard(fg, 58.05, y, zc, -Math.PI / 2);
    if (r < 4) {
      desk(fg, 57.1, y, zc + 0.9, -Math.PI / 2, 1.2, 0.6); chair(fg, 57.6, y, zc + 0.9, -Math.PI / 2);
      for (let i = 0; i < 4; i++) for (let j = -1; j <= 1; j++) {
        desk(fg, 50.6 + i * 1.45, y, zc + j * 1.1, Math.PI / 2, 0.6, 0.45, 0.72);
        chair(fg, 50.1 + i * 1.45, y, zc + j * 1.1, Math.PI / 2);
      }
    } else {
      bx(fg, 53.8, y, zc, 8.4, 0.02, 3.4, M.carpet);
      for (let i = 0; i < 3; i++) lowTable(fg, 51.3 + i * 2.4, y, zc, Math.PI / 2, 1.4, 0.5);
      shelf(fg, 50.0, y, zc + 1.6, Math.PI, 1.2, 1.4);
    }
  }
}

function fillKlinik(B) {
  const fg = B.floors[0], y = B.FL(0), h = B.H - 0.2;
  part(fg, 52.7, 44.2, 52.7, 55.3, y, h, [{ at: 2.8, kind: 'door' }]);
  part(fg, 47.2, 49.75, 58.2, 49.75, y, h, [{ at: 2.8, kind: 'door' }, { at: 8.3, kind: 'door' }]);
  // ruang tunggu
  for (let i = 0; i < 4; i++) chair(fg, 47.7, y, 45.2 + i * 0.6, Math.PI / 2, M.blue);
  desk(fg, 51.4, y, 45.2, Math.PI, 1.4, 0.6); chair(fg, 51.4, y, 44.65, 0); monitor(fg, 51.4, y + 0.75, 45.3, Math.PI);
  plant(fg, 52.2, y, 49.2);
  // ruang obat
  shelf(fg, 50, y, 55.0, Math.PI, 3.6, 1.9, 0.4); cabinet(fg, 47.6, y, 52.5, Math.PI / 2, 0.6, 1.3);
  desk(fg, 50.3, y, 51.7, 0, 1.4, 0.6); chair(fg, 50.3, y, 51.15, 0);
  // ruang periksa
  desk(fg, 54.5, y, 45.0, Math.PI, 1.4, 0.7); chair(fg, 54.5, y, 44.5, 0); chair(fg, 54.5, y, 45.8, Math.PI); monitor(fg, 54.2, y + 0.75, 45.1, Math.PI);
  clinicBed(fg, 57.4, y, 47.3, 0, true); sinkCounter(fg, 53.2, y, 48.6, Math.PI / 2, 0.8);
  // observasi
  clinicBed(fg, 54.3, y, 52.6, 0, true); clinicBed(fg, 56.9, y, 52.6, 0, true);
  cabinet(fg, 57.8, y, 50.4, -Math.PI / 2, 0.5, 1.0);
}

function fillMess(B) {
  const x0 = 47.2, cor = 49.0;
  B.floors.forEach((fg, f) => {
    const y = B.FL(f), h = B.H - 0.2;
    const ops = [{ at: 1.5, kind: 'gap', w: 2.4, h: 2.6 }];
    for (let r = 0; r < 6; r++) ops.push({ at: 3 + r * 3 + 1.5, kind: 'door' });
    part(fg, cor, 57.3, cor, 78.3, y, h, ops);
    for (let r = 0; r < 6; r++) part(fg, cor, 60.3 + r * 3, 58.2, 60.3 + r * 3, y, h);
    for (let r = 0; r < 5; r++) {
      const s = 60.3 + r * 3;
      singleBed(fg, 57.1, y, s + 0.6, -Math.PI / 2, r % 2 ? M.blanket2 : M.blanket);
      singleBed(fg, 57.1, y, s + 2.4, -Math.PI / 2, r % 2 ? M.blanket : M.blanket2);
      wardrobe(fg, 53.6, y, s + 0.36, 0);
      desk(fg, 51.2, y, s + 2.6, Math.PI, 1.2, 0.6); chair(fg, 51.2, y, s + 2.0, 0);
    }
    for (let i = 0; i < 3; i++) stall(fg, 52 + i * 1.3, y, 77.45, Math.PI);
    sinkCounter(fg, 56.6, y, 77.9, Math.PI, 2.2);
    if (f === 0) stairs(fg, 50, 58.3, y, B.H, 'x', 1.4); else railing(fg, 50, 59.05, 55.8, 59.05, y);
  });
}

function fillKantor(B) {
  const [g1, g2] = B.floors, y1 = B.FL(0), y2 = B.FL(1), h = B.H - 0.2;
  // Lt.1: lobi + ruang staf
  part(g1, 49.5, 2, 49.5, 14.1, y1, h, [{ at: 6, kind: 'gap', w: 2, h: 2.4 }]);
  desk(g1, 47.6, y1, 4.2, -Math.PI / 2, 1.8, 0.6, 1.05, M.woodD); chair(g1, 48.4, y1, 4.2, -Math.PI / 2);
  monitor(g1, 47.7, y1 + 1.05, 4.2, Math.PI / 2);
  sofa(g1, 45.1, y1, 7.0, Math.PI / 2, 1.8); lowTable(g1, 46.4, y1, 7.0, Math.PI / 2, 1.0, 0.5);
  plant(g1, 45.0, y1, 2.5); plant(g1, 49.0, y1, 13.6);
  stairs(g1, 45.7, 8.4, y1, B.H, 'z', 1.4);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const dx = 51.5 + c * 2.4, dz = 5 + r * 4;
    desk(g1, dx, y1, dz, 0, 1.4, 0.7); chair(g1, dx, y1, dz - 0.6, 0); monitor(g1, dx, y1 + 0.75, dz + 0.1, Math.PI);
  }
  for (let i = 0; i < 6; i++) cabinet(g1, 57.8, y1, 3.2 + i * 0.6, -Math.PI / 2, 0.55, 1.3);
  desk(g1, 55.8, y1, 13.5, Math.PI, 1.2, 0.5, 0.75); bx(g1, 55.8, y1 + 0.75, 13.5, 0.5, 0.3, 0.4, M.white);
  whiteboard(g1, 52.5, y1, 2.15, 0, 2.0);
  // Lt.2: ruang pimpinan + ruang rapat
  part(g2, 49.5, 2, 49.5, 14.1, y2, h, [{ at: 4, kind: 'door' }, { at: 9.5, kind: 'door' }]);
  part(g2, 49.5, 8, 58.2, 8, y2, h);
  desk(g2, 55.5, y2, 5, -Math.PI / 2, 1.8, 0.9, 0.78, M.woodD); chair(g2, 56.3, y2, 5, -Math.PI / 2, M.black);
  chair(g2, 54.4, y2, 4.5, Math.PI / 2); chair(g2, 54.4, y2, 5.5, Math.PI / 2); monitor(g2, 55.6, y2 + 0.78, 5, -Math.PI / 2);
  shelf(g2, 57.95, y2, 5, -Math.PI / 2, 2.4, 2.0);
  sofa(g2, 51.5, y2, 2.6, 0, 2.2); lowTable(g2, 51.5, y2, 3.9, 0, 1.2, 0.6);
  bx(g2, 51.3, y2, 7.0, 0.08, 2.4, 0.08, M.metal); bx(g2, 51.62, y2 + 1.8, 7.0, 0.6, 0.2, 0.02, M.red); bx(g2, 51.62, y2 + 1.6, 7.0, 0.6, 0.2, 0.02, M.white);
  desk(g2, 54, y2, 11.1, 0, 4.2, 1.3, 0.76, M.wood);
  for (let i = 0; i < 4; i++) { chair(g2, 52.4 + i * 1.05, y2, 10.1, 0); chair(g2, 52.4 + i * 1.05, y2, 12.1, Math.PI); }
  chair(g2, 51.5, y2, 11.1, Math.PI / 2); chair(g2, 56.5, y2, 11.1, -Math.PI / 2);
  whiteboard(g2, 58.05, y2, 11.1, -Math.PI / 2);
  sofa(g2, 45.1, y2, 4.5, Math.PI / 2, 1.8); shelf(g2, 47, y2, 2.25, 0, 2.4, 1.8);
  railing(g2, 46.45, 8.3, 46.45, 14.0, y2);
}

function fillPos(B, deskZ, ry) {
  const fg = B.floors[0], y = B.FL(0);
  const box3 = new THREE.Box3().setFromObject(fg), c = box3.getCenter(new THREE.Vector3());
  const dx = c.x, dz = c.z + deskZ, sn = Math.sin(ry), cs = Math.cos(ry);
  desk(fg, dx, y, dz, ry, 1.2, 0.55); chair(fg, dx - 0.6 * sn, y, dz - 0.6 * cs, ry);
  for (const o of [-0.28, 0.28]) monitor(fg, dx + o * cs + 0.1 * sn, y + 0.75, dz - o * sn + 0.1 * cs, ry + Math.PI);
  cabinet(fg, dx + 1.2 * cs, y, dz - 1.2 * sn, ry, 0.5, 1.0);
}

// ---------- tapak ----------
export function buildSite() {
  const site = new THREE.Group();
  site.name = 'Pesantren Merah Putih - Tapak';
  const labels = {};
  const C = ZONE_COLORS;
  const zoneOf = Object.fromEntries(ITEMS.map(i => [i[0], i]));
  const label = (id, x, y, z) => { labels[id] = { pos: [x, y, z] }; };

  // lahan, jalan, paving
  const ground = grp(site, 0, 0, 0, 0, 'Lahan & Jalan'); ground.userData.merge = true;
  bx(ground, SITE_W / 2, -0.05, SITE_D / 2, SITE_W, 0.05, SITE_D, M.sand);
  bx(ground, 30, 0, 9.3, 12, 0.03, 18.6, M.asphalt);
  bx(ground, 30, 0, 16.6, 56, 0.03, 4, M.asphalt);
  for (let x = 4; x < 58; x += 3) bx(ground, x, 0.03, 16.6, 1.5, 0.005, 0.12, M.stripe);
  bx(ground, 21.6, 0, 50, 2.6, 0.04, 62, M.paving);
  bx(ground, 45.7, 0, 50, 2.6, 0.04, 62, M.paving);
  bx(ground, 33.65, 0, 48.75, 21.1, 0.04, 2.5, M.paving);
  bx(ground, 30, 0, 80.9, 56, 0.04, 2.6, M.paving);
  bx(ground, 33.65, 0, 21.8, 21.1, 0.04, 6.4, M.paving);

  // pagar keliling + gerbang
  const fence = grp(site, 0, 0, 0, 0, 'Pagar & Gerbang'); fence.userData.merge = true;
  const fenceRun = (x0, z0, x1, z1) => {
    const alongX = z0 === z1, L = alongX ? x1 - x0 : z1 - z0;
    if (alongX) { bx(fence, (x0 + x1) / 2, 0, z0, L, 0.9, 0.25, M.brick); bx(fence, (x0 + x1) / 2, 1.75, z0, L, 0.08, 0.08, M.black); }
    else { bx(fence, x0, 0, (z0 + z1) / 2, 0.25, 0.9, L, M.brick); bx(fence, x0, 1.75, (z0 + z1) / 2, 0.08, 0.08, L, M.black); }
    for (let s = 0; s <= L + 0.01; s += 4) alongX ? bx(fence, x0 + Math.min(s, L), 0, z0, 0.4, 2.0, 0.4, M.brick) : bx(fence, x0, 0, z0 + Math.min(s, L), 0.4, 2.0, 0.4, M.brick);
    for (let s = 0.25; s < L; s += 0.25) alongX ? bx(fence, x0 + s, 0.9, z0, 0.03, 0.85, 0.03, M.black) : bx(fence, x0, 0.9, z0 + s, 0.03, 0.85, 0.03, M.black);
  };
  fenceRun(0, 0, 24.6, 0); fenceRun(35.4, 0, SITE_W, 0); fenceRun(0, SITE_D, SITE_W, SITE_D);
  fenceRun(0, 0, 0, SITE_D); fenceRun(SITE_W, 0, SITE_W, SITE_D);
  for (const x of [24.6, 35.4]) bx(fence, x, 0, 0, 0.9, 4.2, 0.9, m(C.santri));
  bx(fence, 30, 4.2, 0, 11.7, 1.0, 0.9, m(C.santri));
  bx(fence, 30, 4.4, -0.47, 7, 0.6, 0.04, M.white);
  // palang pintu
  const barrier = (x, dir) => { bx(fence, x, 0, 2, 0.35, 1.0, 0.35, M.yellow); for (let i = 0; i < 5; i++) bx(fence, x + dir * (0.4 + i * 0.9), 0.9, 2, 0.9, 0.1, 0.1, i % 2 ? M.white : M.red); };
  barrier(35.0, -1); barrier(25.0, 1);
  label('gerbang', 30, 6.2, 0);

  // bangunan
  const add = (spec, extra) => { const B = building(site, { ...spec, color: C[zoneOf[spec.id][2]], name: zoneOf[spec.id][1] }); return B; };

  const asrama = add({ id: 'asrama', x0: 2, z0: 19, x1: 20, z1: 79.3, floors: 2, hole: [5, 26.3, 10.8, 27.7],
    ops: [{ side: 'N', at: 16.9, kind: 'door' }, { side: 'S', at: 16.9, kind: 'door' }, { side: 'E', at: 9.25, kind: 'door2' }] });
  fillAsrama(asrama); label('asrama', 11, asrama.peak + 1, 49);

  const hall = add({ id: 'masjid', x0: 23.1, z0: 25.1, x1: 38.5, z1: 47.2, floors: 1, h: 4.6, roof: 'flat', noWin: ['W'], winW: 1.4,
    ops: [{ side: 'E', at: 2.9, kind: 'door2' }, { side: 'E', at: 7.3, kind: 'door2' }, { side: 'E', at: 11.7, kind: 'door2' }, { side: 'E', at: 16, kind: 'door' }, { side: 'S', at: 4, kind: 'door2' }] });
  const wudhu = building(site, { id: 'masjid', name: 'Ruang Wudhu', x0: 38.5, z0: 39, x1: 44.2, z1: 47.2, floors: 1, h: 3.4, roof: 'flat', skip: ['W'], color: C.ibadah,
    ops: [{ side: 'N', at: 3.5, kind: 'door' }, { side: 'S', at: 3.5, kind: 'door' }] });
  wudhu.g.userData.id = 'masjid';
  const mTop = fillMasjid(hall, wudhu, hall.g); label('masjid', 30.8, mTop + 1, 36.15);

  const dapur = add({ id: 'dapur', x0: 23.1, z0: 50.3, x1: 44.2, z1: 78.3, floors: 1, h: 4.0,
    ops: [{ side: 'N', at: 6, kind: 'door2' }, { side: 'N', at: 15, kind: 'door2' }, { side: 'E', at: 9.7, kind: 'door2' }, { side: 'W', at: 4.5, kind: 'door' }, { side: 'S', at: 1.0, kind: 'door' }, { side: 'S', at: 17.9, kind: 'door2' }] });
  fillDapur(dapur); label('dapur', 33.65, dapur.peak + 1, 64.3);

  const serba = add({ id: 'serbaguna', x0: 47.2, z0: 19.1, x1: 58.2, z1: 42.2, floors: 1,
    ops: [{ side: 'N', at: 1, kind: 'door' }, { side: 'S', at: 1, kind: 'door' }] });
  fillSerbaguna(serba); label('serbaguna', 52.7, serba.peak + 1, 30.65);

  const klinik = add({ id: 'klinik', x0: 47.2, z0: 44.2, x1: 58.2, z1: 55.3, floors: 1,
    ops: [{ side: 'W', at: 2.6, kind: 'door2', w: 1.4 }] });
  fillKlinik(klinik); label('klinik', 52.7, klinik.peak + 1, 49.75);

  const mess = add({ id: 'mess', x0: 47.2, z0: 57.3, x1: 58.2, z1: 78.3, floors: 2, hole: [50, 57.5, 55.8, 59.1],
    ops: [{ side: 'N', at: 0.9, kind: 'door' }, { side: 'S', at: 0.9, kind: 'door' }] });
  fillMess(mess); label('mess', 52.7, mess.peak + 1, 67.8);

  const kantor = add({ id: 'kantor', x0: 44.5, z0: 2, x1: 58.2, z1: 14.1, floors: 2, hole: [45.0, 8.3, 46.4, 14.0],
    ops: [{ side: 'W', at: 3.5, kind: 'door2' }, { side: 'S', at: 2.5, kind: 'door' }] });
  fillKantor(kantor); label('kantor', 51.35, kantor.peak + 1, 8);

  const pj = add({ id: 'posjaga', x0: 36.3, z0: 1.5, x1: 42.9, z1: 10.7, floors: 1, h: 3.2, ops: [{ side: 'W', at: 6.5, kind: 'door' }] });
  fillPos(pj, -1.5, Math.PI / 2); label('posjaga', 39.6, pj.peak + 1, 6.1);
  const pb = add({ id: 'posbarat', x0: 2, z0: 88.2, x1: 6.4, z1: 93.4, floors: 1, h: 3.0, ops: [{ side: 'N', at: 2.2, kind: 'door' }] });
  fillPos(pb, 0.8, Math.PI); label('posbarat', 4.2, pb.peak + 1, 90.8);
  const pt = add({ id: 'postimur', x0: 53.8, z0: 88.2, x1: 58.2, z1: 93.4, floors: 1, h: 3.0, ops: [{ side: 'N', at: 2.2, kind: 'door' }] });
  fillPos(pt, 0.8, Math.PI); label('postimur', 56, pt.peak + 1, 90.8);

  // parkir & RTH
  const pk = grp(site, 0, 0, 0, 0, 'Parkir & RTH'); Object.assign(pk.userData, { merge: true, id: 'parkir' });
  bx(pk, 10.25, 0, 8.05, 16.5, 0.06, 12.1, M.asphalt);
  bx(pk, 20.55, 0, 8.05, 4.1, 0.1, 12.1, M.grass);
  for (let i = 0; i <= 6; i++) bx(pk, 2.5 + i * 2.7, 0.06, 4.6, 0.1, 0.005, 4.8, M.stripe);
  for (let i = 0; i <= 12; i++) bx(pk, 3.0 + i * 1.2, 0.06, 12.2, 0.06, 0.005, 2.6, M.stripe);
  for (const tz of [3.5, 8, 12.5]) tree(pk, 20.6, tz, 0.9, tz === 8 ? M.leaf2 : M.leaf);
  trashSet(pk, 17.6, 2.6);
  const cars = grp(site, 0, 0, 0, 0, 'Kendaraan'); Object.assign(cars.userData, { merge: true, id: 'parkir' });
  [0xF2F2F2, 0x1F2A36, 0xA61B29, 0x8F9AA3, 0x2E5E8C].forEach((c, i) => { if (i !== 3) car(cars, 3.85 + i * 2.7, 4.6, 0, c); });
  car(cars, 11.95, 4.6, Math.PI, 0x8F9AA3);
  for (let i = 0; i < 11; i++) motorbike(cars, 3.6 + i * 1.2, 12.2, Math.PI, [0x111111, 0xC8102E, 0x2F6FB0, 0xEEEEEE][i % 4]);
  car(cars, 45.7, 50.3, 0, 0xFFFFFF, 'van');
  car(cars, 34.8, 80.9, Math.PI / 2, 0x3A6EA5, 'pickup');
  car(cars, 52.5, 16.6, -Math.PI / 2, 0x26282B);
  label('parkir', 10.25, 3, 8);

  // lapangan
  const lp = grp(site, 0, 0, 0, 0, 'Lapangan Serbaguna'); Object.assign(lp.userData, { merge: true, id: 'lapangan' });
  bx(lp, 30.05, 0, 90.45, 44.5, 0.08, 16.1, M.field);
  const L = (x, z, w, d) => bx(lp, x, 0.08, z, w, 0.01, d, M.stripe);
  L(30.05, 83.2, 42.9, 0.1); L(30.05, 97.7, 42.9, 0.1); L(8.6, 90.45, 0.1, 14.6); L(51.5, 90.45, 0.1, 14.6); L(30.05, 90.45, 0.1, 14.6);
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.9, 3.0, 48), M.stripe); ring.rotation.x = -Math.PI / 2; ring.position.set(30.05, 0.1, 90.45); lp.add(ring);
  for (const [x, dir] of [[8.6, -1], [51.5, 1]]) {
    for (const dz of [-1.5, 1.5]) bx(lp, x, 0, 90.45 + dz, 0.1, 2.0, 0.1, M.white);
    bx(lp, x, 2.0, 90.45, 0.1, 0.1, 3.1, M.white);
    bx(lp, x + dir * 0.5, 0, 90.45, 1.0, 2.0, 3.0, m(0xFFFFFF, { transparent: true, opacity: 0.25 }));
  }
  for (const bxp of [14, 22, 38, 46]) bench(lp, bxp, 81.9, Math.PI);
  // jemuran
  const jm = grp(lp, 0, 0, 0, 0, 'Jemuran');
  for (const jx of [2.5, 7.2]) for (const jz of [83.2, 87.2]) bx(jm, jx, 0, jz, 0.08, 1.9, 0.08, M.metal);
  const clothes = [M.white, M.blanket, M.green, M.red, M.yellow, M.blanket2];
  for (const jz of [83.2, 85.2, 87.2]) {
    bx(jm, 4.85, 1.85, jz, 4.7, 0.02, 0.02, M.metal);
    for (let i = 0; i < 6; i++) bx(jm, 2.9 + i * 0.75, 1.15, jz, 0.5, 0.7, 0.02, clothes[(i + Math.round(jz)) % 6]);
  }
  for (const jx of [2.5, 7.2]) for (const jz of [85.2]) bx(jm, jx, 0, jz, 0.08, 1.9, 0.08, M.metal);
  // TPS
  const tps = grp(lp, 0, 0, 0, 0, 'TPS');
  bx(tps, 56.5, 0, 82.8, 6, 0.15, 5, M.concrete);
  bx(tps, 56.5, 0, 85.2, 6, 1.4, 0.2, M.concrete); bx(tps, 59.4, 0, 82.8, 0.2, 1.4, 5, M.concrete); bx(tps, 53.6, 0, 83.5, 0.2, 1.4, 3.6, M.concrete);
  for (const tx of [54.9, 57.6]) { bx(tps, tx, 0.15, 83.8, 2.2, 1.2, 1.4, M.green); bx(tps, tx, 1.35, 83.8, 2.3, 0.08, 1.5, M.black); }
  trashSet(tps, 56.2, 81.4, Math.PI);
  bx(tps, 56.5, 2.6, 83.0, 6.4, 0.08, 5.0, M.metal);
  for (const [tx, tz] of [[53.6, 80.6], [59.4, 80.6]]) bx(tps, tx, 0, tz, 0.1, 2.6, 0.1, M.metal);
  label('lapangan', 30.05, 3, 90.45);

  // lanskap & perlengkapan luar
  const ls = grp(site, 0, 0, 0, 0, 'Lanskap'); ls.userData.merge = true;
  const fp = grp(ls, 30, 0, 21.3, 0, 'Tiang Bendera');
  bx(fp, 0, 0, 0, 3, 0.2, 3, M.concrete); bx(fp, 0, 0.2, 0, 2, 0.2, 2, M.concrete); bx(fp, 0, 0.4, 0, 1, 0.2, 1, M.concrete);
  cy(fp, 0, 0.6, 0, 0.06, 10, M.white); sp(fp, 0, 10.65, 0, 0.12, M.gold);
  bx(fp, 0.8, 9.35, 0, 1.5, 0.5, 0.03, M.red); bx(fp, 0.8, 8.85, 0, 1.5, 0.5, 0.03, M.white);
  for (const [x, z, r] of [[25.5, 23.7, 0], [34.5, 23.7, 0], [40.5, 19.6, Math.PI]]) bench(ls, x, z, r);
  for (const [x, z] of [[24, 19.5], [43.4, 23.2], [23.6, 80.5], [43.6, 80.5], [43.5, 15.6]]) tree(ls, x, z, 0.85, M.leaf2);
  for (const z of [24, 36, 48, 60, 72]) { lampPost(ls, 20.5, z); lampPost(ls, 46.85, z); }
  for (const x of [6, 18, 40, 50]) lampPost(ls, x, 18.4);
  for (const [x, z] of [[22.6, 31], [22.6, 62], [25.5, 49.5], [37.5, 23.6], [46.8, 33], [46.8, 70], [8.5, 81], [51, 81], [43.7, 12.6]]) trashSet(ls, x, z, x > 44 ? -Math.PI / 2 : x < 23 && z < 70 ? Math.PI / 2 : 0);

  const meta = ITEMS.map(([id, name, zone, floors, area, desc]) => ({ id, name, zone, floors, area, desc, label: labels[id]?.pos }));
  return { site, meta, gateLabel: labels.gerbang.pos };
}
