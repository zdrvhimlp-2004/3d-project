// Ekspor model tapak ke pesantren-merah-putih.glb (buka di Blender, SketchUp, dll).
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildSite, SITE_W, SITE_D } from '../model.js';
import { separate } from './zfight.mjs';

// GLTFExporter memakai FileReader dari browser; sediakan versi minimal untuk Node.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(buf => { this.result = buf; this.onloadend?.(); }); }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buf).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const { site } = buildSite();
site.position.set(-SITE_W / 2, 0, -SITE_D / 2);
// Pisahkan permukaan yang berimpit/terlalu rapat supaya tidak berkedip (z-fighting).
const z = separate(site);
console.log(`Anti-kedip: ${z.fixed} sisi dipisahkan, sisa konflik ${z.remaining}`);
if (z.remaining) process.exit(1);
const scene = new THREE.Scene();
scene.add(site);

const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
const out = new URL('../pesantren-merah-putih.glb', import.meta.url);
fs.writeFileSync(out, Buffer.from(glb));
let meshes = 0; site.traverse(o => { if (o.isMesh) meshes++; });
console.log(`Tersimpan ${out.pathname} (${(glb.byteLength / 1024).toFixed(0)} KB, ${meshes} mesh)`);
