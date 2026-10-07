// Deteksi & perbaikan z-fighting untuk model berbahan kotak (bx di model.js).
// Konflik = dua sisi kotak menghadap arah sama, bidangnya berimpit atau terpisah < minGap,
// wilayahnya saling tumpang, dan wilayah itu tidak tersembunyi di dalam kotak lain.
import * as THREE from 'three';

const AX = ['x', 'y', 'z'], EPS = 1e-4;

function collect(root) {
  root.updateMatrixWorld(true);
  const list = [], q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  root.traverse(o => {
    if (!o.isMesh) return;
    // kotak dari model.js, atau kotak yang dimuat ulang dari .glb (24 titik, 36 indeks)
    const g = o.geometry;
    if (g.type !== 'BoxGeometry' && !(g.attributes.position.count === 24 && g.index?.count === 36)) return;
    o.matrixWorld.decompose(v, q, s); e.setFromQuaternion(q);
    if (![e.x, e.y, e.z].every(a => Math.abs(Math.round(a / (Math.PI / 2)) * (Math.PI / 2) - a) < 1e-4)) return;
    list.push({ mesh: o, b: new THREE.Box3().setFromObject(o), transparent: !!o.material.transparent });
  });
  return list;
}
const label = o => { const n = []; for (let p = o.parent; p && n.length < 2; p = p.parent) if (p.name) n.push(p.name); return n.join(' < '); };

export function findConflicts(root, { minGap = 0.01 } = {}) {
  const boxes = collect(root);
  const CELL = 2, grid = new Map(), key = (x, z) => x * 100000 + z;
  boxes.forEach((o, i) => {
    for (let x = Math.floor(o.b.min.x / CELL); x <= Math.floor(o.b.max.x / CELL); x++)
      for (let z = Math.floor(o.b.min.z / CELL); z <= Math.floor(o.b.max.z / CELL); z++) {
        const k = key(x, z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i);
      }
  });
  const hidden = (p, i, j) => (grid.get(key(Math.floor(p.x / CELL), Math.floor(p.z / CELL))) || []).some(k => {
    if (k === i || k === j || boxes[k].transparent) return false;
    const b = boxes[k].b;
    return p.x > b.min.x + 1e-5 && p.x < b.max.x - 1e-5 && p.y > b.min.y + 1e-5 && p.y < b.max.y - 1e-5 && p.z > b.min.z + 1e-5 && p.z < b.max.z - 1e-5;
  });
  const out = [], p = new THREE.Vector3();
  for (let ai = 0; ai < 3; ai++) for (const sg of [-1, 1]) {
    const a = AX[ai], [u, w] = AX.filter((_, j) => j !== ai);
    const faces = boxes.map((o, i) => ({ i, plane: sg > 0 ? o.b.max[a] : o.b.min[a] })).sort((m, n) => m.plane - n.plane);
    for (let x = 0; x < faces.length; x++) for (let y = x + 1; y < faces.length && faces[y].plane - faces[x].plane < minGap - EPS; y++) {
      const A = boxes[faces[x].i], B = boxes[faces[y].i];
      const u0 = Math.max(A.b.min[u], B.b.min[u]), u1 = Math.min(A.b.max[u], B.b.max[u]);
      const w0 = Math.max(A.b.min[w], B.b.min[w]), w1 = Math.min(A.b.max[w], B.b.max[w]);
      if (u1 - u0 < 1e-4 || w1 - w0 < 1e-4) continue;
      const outer = sg > 0 ? Math.max(faces[x].plane, faces[y].plane) : Math.min(faces[x].plane, faces[y].plane);
      const visible = [[0.5, 0.5], [0.05, 0.05], [0.95, 0.95], [0.05, 0.95], [0.95, 0.05]].some(([fu, fw]) => {
        p[u] = u0 + (u1 - u0) * fu; p[w] = w0 + (w1 - w0) * fw; p[a] = outer + sg * 2e-4;
        return !hidden(p, faces[x].i, faces[y].i);
      });
      if (!visible) continue;
      const area = o => (o.b.max[u] - o.b.min[u]) * (o.b.max[w] - o.b.min[w]);
      out.push({ A, B, ai, sg, gap: faces[y].plane - faces[x].plane, areaA: area(A), areaB: area(B),
        lower: faces[x].plane <= faces[y].plane ? A : B, upper: faces[x].plane <= faces[y].plane ? B : A,
        label: `${label(A.mesh)}  ×  ${label(B.mesh)}` });
    }
  }
  return out;
}

// Panjangkan satu sisi kotak sejauh amt ke arah normalnya (sumbu dunia ai, arah sg).
function grow(mesh, ai, sg, amt) {
  const el = mesh.matrixWorld.elements, cols = [[el[0], el[1], el[2]], [el[4], el[5], el[6]], [el[8], el[9], el[10]]];
  const k = [0, 1, 2].reduce((best, c) => Math.abs(cols[c][ai]) > Math.abs(cols[best][ai]) ? c : best, 0);
  mesh.scale.setComponent(k, mesh.scale.getComponent(k) + amt);
  const d = new THREE.Vector3().setComponent(ai, sg * amt / 2);
  d.applyMatrix3(new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert()));
  mesh.position.add(d);
  mesh.updateMatrixWorld(true);
}

// Pisahkan semua konflik: sisi berimpit -> sisi kotak yang lebih kecil maju `sep`;
// sisi terlalu rapat -> sisi terluar maju sampai jaraknya >= minGap.
export function separate(root, { minGap = 0.01, sep = 0.012, passes = 8 } = {}) {
  let fixed = 0;
  for (let pass = 0; pass < passes; pass++) {
    const conflicts = findConflicts(root, { minGap });
    if (!conflicts.length) return { fixed, remaining: 0 };
    const done = new Set();
    for (const c of conflicts) {
      let target, amt;
      if (c.gap < EPS) { target = c.areaA <= c.areaB ? c.A : c.B; amt = sep; }
      else { target = c.sg > 0 ? c.upper : c.lower; amt = minGap - c.gap + 0.003; }
      const key = `${target.mesh.uuid}:${c.ai}:${c.sg}`;
      if (done.has(key)) continue;
      done.add(key);
      grow(target.mesh, c.ai, c.sg, amt);
      fixed++;
    }
  }
  return { fixed, remaining: findConflicts(root, { minGap }).length };
}

export function summarize(conflicts, limit = 30) {
  const by = new Map();
  for (const c of conflicts) by.set(c.label, (by.get(c.label) || 0) + 1);
  return [...by].sort((m, n) => n[1] - m[1]).slice(0, limit).map(([k, n]) => `  ${n}×  ${k}`).join('\n');
}
