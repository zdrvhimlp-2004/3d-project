// Muat ulang pesantren-merah-putih.glb dengan GLTFLoader three.js dan periksa z-fighting langsung dari file.
import fs from 'node:fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { findConflicts, summarize } from './zfight.mjs';

const buf = fs.readFileSync(new URL('../pesantren-merah-putih.glb', import.meta.url));
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const gltf = await new GLTFLoader().parseAsync(ab, '');
let meshes = 0; gltf.scene.traverse(o => { if (o.isMesh) meshes++; });
const c = findConflicts(gltf.scene);
console.log(`GLB dimuat: ${meshes} mesh. Konflik z-fighting: ${c.length}`);
if (c.length) { console.log(summarize(c)); process.exit(1); }
