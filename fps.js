// Mode FPS: pemain berbentuk pil, fisika sederhana (kapsul vs kotak AABB), pintu berengsel,
// analog sentuh, minimap dengan teleport, kamera orang pertama/ketiga, dan senter.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- tampilan: gabung mesh statis per material, pintu tetap objek hidup ----------
export function buildView(site) {
  const doors = [];
  site.updateMatrixWorld(true);
  function mergeGroup(g) {
    const inv = g.matrixWorld.clone().invert(), buckets = new Map(), live = [];
    (function walk(o) {
      if (o.userData.door) { live.push(o); return; }
      if (o.isMesh) {
        const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        geo.deleteAttribute('uv');
        geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
        if (!buckets.has(o.material)) buckets.set(o.material, []);
        buckets.get(o.material).push(geo);
      }
      o.children.forEach(walk);
    })(g);
    const out = new THREE.Group();
    out.position.copy(g.position); out.rotation.copy(g.rotation); out.userData = { ...g.userData };
    for (const [mat, geos] of buckets) {
      const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
      mesh.castShadow = !mat.transparent; mesh.receiveShadow = true;
      out.add(mesh);
    }
    for (const d of live) {
      const c = d.clone(true);
      new THREE.Matrix4().multiplyMatrices(inv, d.matrixWorld).decompose(c.position, c.quaternion, c.scale);
      c.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      out.add(c);
      doors.push({ obj: c, leaf: c.children[0], ...d.userData.door, angle: 0, target: 0, box: new THREE.Box3(), hinge: new THREE.Vector3() });
    }
    return out;
  }
  function copy(src) {
    if (src.userData.merge) return mergeGroup(src);
    const c = new THREE.Group();
    c.position.copy(src.position); c.rotation.copy(src.rotation); c.userData = { ...src.userData };
    src.children.forEach(ch => c.add(copy(ch)));
    return c;
  }
  return { view: copy(site), doors };
}

// ---------- tabrakan: kotak statis dalam grid 2 m ----------
class Grid {
  constructor(boxes, cell = 2) {
    this.cell = cell; this.boxes = boxes; this.map = new Map();
    this.mark = new Uint32Array(boxes.length); this.stamp = 0; this.out = [];
    boxes.forEach((b, i) => {
      for (let x = Math.floor(b.min.x / cell); x <= Math.floor(b.max.x / cell); x++)
        for (let z = Math.floor(b.min.z / cell); z <= Math.floor(b.max.z / cell); z++) {
          const k = this.key(x, z);
          if (!this.map.has(k)) this.map.set(k, []);
          this.map.get(k).push(i);
        }
    });
  }
  key(x, z) { return (x + 2048) * 4096 + (z + 2048); }
  query(x, z, r) {
    const out = this.out; out.length = 0; this.stamp++;
    const c = this.cell;
    for (let gx = Math.floor((x - r) / c); gx <= Math.floor((x + r) / c); gx++)
      for (let gz = Math.floor((z - r) / c); gz <= Math.floor((z + r) / c); gz++) {
        const list = this.map.get(this.key(gx, gz));
        if (list) for (const i of list) if (this.mark[i] !== this.stamp) { this.mark[i] = this.stamp; out.push(this.boxes[i]); }
      }
    return out;
  }
}
export function buildColliders(site) {
  site.updateMatrixWorld(true);
  const boxes = [];
  (function walk(o) {
    if (o.userData.door) return;
    if (o.isMesh) { const b = new THREE.Box3().setFromObject(o); if (!b.isEmpty()) boxes.push(b); }
    o.children.forEach(walk);
  })(site);
  return new Grid(boxes);
}

// ---------- pemain ----------
const R = 0.3, HEIGHT = 1.75, EYE = 1.6, STEP = 0.4, GRAV = 22, JUMP = 7, WALK = 3.4, RUN = 6.5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createFPS({ scene, renderer, grid, doors, footprints, offset, zoneColors, onExit }) {
  const $ = id => document.getElementById(id);
  const hud = $('fps-hud'), loc = $('fps-loc'), prompt = $('fps-prompt'), paused = $('fps-paused');
  const mini = $('minimap'), mctx = mini.getContext('2d');
  const touch = matchMedia('(pointer: coarse)').matches;
  hud.classList.toggle('touch', touch);

  const cam = new THREE.PerspectiveCamera(72, 1, 0.05, 600);
  cam.rotation.order = 'YXZ';
  scene.add(cam);
  const flashlight = new THREE.SpotLight(0xfff1cc, 0, 30, 0.42, 0.45, 1.3);
  flashlight.position.set(0.15, -0.15, 0); flashlight.target.position.set(0, 0, -1);
  cam.add(flashlight, flashlight.target);

  // pil merah putih dengan visor menunjukkan arah hadap
  const pill = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xC8102E, roughness: 0.5 });
  const white = new THREE.MeshStandardMaterial({ color: 0xF5F4F0, roughness: 0.5 });
  const top = new THREE.Mesh(new THREE.CapsuleGeometry(R, HEIGHT - 2 * R, 6, 20), red);
  top.position.y = HEIGHT / 2;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.005, R + 0.005, HEIGHT / 2 - R, 20), white);
  band.position.y = R + (HEIGHT / 2 - R) / 2;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0x1B2630, roughness: 0.2, metalness: 0.4 }));
  visor.position.set(0, EYE, -R + 0.03);
  [top, band, visor].forEach(m => { m.castShadow = true; pill.add(m); });
  pill.visible = false;
  scene.add(pill);

  const pos = new THREE.Vector3(), vel = new THREE.Vector3();
  let vy = 0, grounded = false, coyote = 0, yaw = Math.PI, pitch = -0.05, eyeY = 0, bob = 0;
  let active = false, third = false, jumpReq = false, locked = false, target = null, uiT = 0;
  const keys = new Set();
  const joy = { id: null, x: 0, y: 0 };
  let look = null;

  // ---- fisika ----
  const near = [];
  function query(x, z, r) {
    const list = grid.query(x, z, r);
    for (const d of near) list.push(d.box);
    return list;
  }
  const overlaps = (b, r) => {
    const dx = pos.x - clamp(pos.x, b.min.x, b.max.x), dz = pos.z - clamp(pos.z, b.min.z, b.max.z);
    return dx * dx + dz * dz < r * r;
  };
  function resolveXZ() {
    const list = query(pos.x, pos.z, R + 0.05);
    for (let it = 0; it < 2; it++) for (const b of list) {
      if (b.max.y <= pos.y + STEP || b.min.y >= pos.y + HEIGHT) continue;
      const cx = clamp(pos.x, b.min.x, b.max.x), cz = clamp(pos.z, b.min.z, b.max.z);
      const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-10) { const d = Math.sqrt(d2), k = (R - d) / d; pos.x += dx * k; pos.z += dz * k; }
      else {
        const opt = [[b.min.x - R - pos.x, 0], [b.max.x + R - pos.x, 0], [0, b.min.z - R - pos.z], [0, b.max.z + R - pos.z]]
          .sort((a, c) => Math.abs(a[0] + a[1]) - Math.abs(c[0] + c[1]))[0];
        pos.x += opt[0]; pos.z += opt[1];
      }
    }
  }
  function groundAt(maxY) {
    let g = -0.06;
    for (const b of query(pos.x, pos.z, R)) if (b.max.y <= maxY && b.max.y > g && overlaps(b, R * 0.8)) g = b.max.y;
    return g;
  }
  function ceilingAt() {
    let c = Infinity;
    for (const b of query(pos.x, pos.z, R)) if (b.min.y >= pos.y + STEP && b.min.y < c && overlaps(b, R * 0.9)) c = b.min.y;
    return c;
  }
  function solidAt(p) {
    for (const b of grid.query(p.x, p.z, 0)) if (p.x > b.min.x && p.x < b.max.x && p.y > b.min.y && p.y < b.max.y && p.z > b.min.z && p.z < b.max.z) return true;
    return false;
  }
  function physics(dt) {
    let f = 0, s = 0, run = keys.has('ShiftLeft') || keys.has('ShiftRight');
    if (keys.has('KeyW') || keys.has('ArrowUp')) f += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) f -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) s += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) s -= 1;
    let mag = Math.min(1, Math.hypot(f, s));
    if (joy.id !== null) { f = -joy.y; s = joy.x; mag = Math.min(1, Math.hypot(f, s)); run = mag > 0.92; }
    const speed = run ? RUN : WALK;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    let mx = fx * f + rx * s, mz = fz * f + rz * s;
    const len = Math.hypot(mx, mz);
    if (len > 0) { mx = mx / len * mag; mz = mz / len * mag; }
    const k = 1 - Math.exp(-(grounded ? 14 : 3) * dt);
    vel.x += (mx * speed - vel.x) * k; vel.z += (mz * speed - vel.z) * k;

    // pintu terdekat ikut jadi penghalang
    near.length = 0;
    for (const d of doors) if (Math.abs(d.hinge.x - pos.x) < 4 && Math.abs(d.hinge.z - pos.z) < 4 && Math.abs(d.hinge.y - pos.y) < 3) {
      d.box.setFromObject(d.leaf); near.push(d);
    }
    const n = Math.max(1, Math.ceil(Math.hypot(vel.x, vel.z) * dt / 0.12));
    for (let i = 0; i < n; i++) { pos.x += vel.x * dt / n; pos.z += vel.z * dt / n; resolveXZ(); }

    if (jumpReq && (grounded || coyote > 0)) { vy = JUMP; grounded = false; coyote = 0; }
    jumpReq = false;
    vy -= GRAV * dt;
    let ny = pos.y + vy * dt;
    const g = groundAt(pos.y + (grounded ? STEP : 0.05));
    if (vy <= 0 && ny <= g) { ny = g; vy = 0; grounded = true; }
    else if (grounded && vy <= 0 && pos.y - g < STEP) { ny = g; vy = 0; }
    else grounded = false;
    if (vy > 0) { const c = ceilingAt(); if (ny + HEIGHT > c) { ny = c - HEIGHT; vy = 0; } }
    pos.y = ny;
    coyote = grounded ? 0.12 : coyote - dt;
    if (pos.y < -10) spawn();
    return Math.hypot(vel.x, vel.z);
  }

  // ---- pintu ----
  const doorMeshes = [], meshDoor = new Map();
  doors.forEach(d => { d.obj.getWorldPosition(d.hinge); d.obj.traverse(m => { if (m.isMesh) { doorMeshes.push(m); meshDoor.set(m, d); } }); });
  const ray = new THREE.Raycaster(); ray.far = 2.8;
  const eye = new THREE.Vector3(), dir = new THREE.Vector3(), tmp = new THREE.Vector3();
  function lookDir(out) { return out.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)); }
  function findDoor() {
    eye.set(pos.x, pos.y + EYE, pos.z); lookDir(dir);
    ray.set(eye, dir);
    const hit = ray.intersectObjects(doorMeshes, false).find(h => h.object.parent.parent.visible);
    if (!hit) return null;
    for (let t = 0.2; t < hit.distance - 0.15; t += 0.15) if (solidAt(tmp.copy(dir).multiplyScalar(t).add(eye))) return null;
    return meshDoor.get(hit.object);
  }
  function toggleDoor(d) {
    if (!d) return;
    if (d.target !== 0) { d.target = 0; return; }
    const away = d.axis === 'x' ? Math.sign(d.hinge.z - pos.z) || 1 : Math.sign(d.hinge.x - pos.x) || 1;
    d.target = (d.axis === 'x' ? -away : away) * d.dir * Math.PI / 2;
  }
  function animateDoors(dt) {
    for (const d of doors) if (d.angle !== d.target) {
      const step = 3.5 * dt, diff = d.target - d.angle;
      d.angle = Math.abs(diff) <= step ? d.target : d.angle + Math.sign(diff) * step;
      d.obj.rotation.y = d.angle;
    }
  }

  // ---- kamera ----
  function placeCamera(dt, moving) {
    bob = grounded && moving > 0.5 ? bob + dt * moving * 2.6 : bob * 0.9;
    const targetY = pos.y + EYE + Math.sin(bob * 2) * 0.035;
    eyeY = Math.abs(targetY - eyeY) > 1.5 ? targetY : eyeY + (targetY - eyeY) * Math.min(1, dt * 16);
    cam.rotation.set(pitch, yaw, 0);
    eye.set(pos.x, eyeY, pos.z);
    pill.position.copy(pos); pill.rotation.y = yaw;
    if (!third) { cam.position.copy(eye); return; }
    lookDir(dir);
    let dist = 3.4;
    for (let t = 0.3; t <= 3.4; t += 0.15) if (solidAt(tmp.copy(eye).addScaledVector(dir, -t).setY(eyeY + 0.35 * t / 3.4))) { dist = Math.max(0.3, t - 0.3); break; }
    cam.position.copy(eye).addScaledVector(dir, -dist).setY(eyeY + 0.35 * dist / 3.4);
  }

  // ---- HUD: lokasi & minimap ----
  const S = 2.0; // piksel minimap per meter
  function drawMap() {
    const dpr = Math.min(devicePixelRatio, 2), W = 60 * S, H = 100 * S;
    if (mini.width !== W * dpr) { mini.width = W * dpr; mini.height = H * dpr; }
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.fillStyle = '#E9DCC8'; mctx.fillRect(0, 0, W, H);
    mctx.fillStyle = '#4B4D50'; mctx.fillRect(24 * S, 0, 12 * S, 18.6 * S); mctx.fillRect(2 * S, 14.6 * S, 56 * S, 4 * S);
    for (const f of footprints) {
      mctx.fillStyle = '#' + zoneColors[f.zone].toString(16).padStart(6, '0');
      mctx.globalAlpha = f.floors ? 0.95 : 0.7;
      mctx.fillRect(f.x0 * S, f.z0 * S, (f.x1 - f.x0) * S, (f.z1 - f.z0) * S);
    }
    mctx.globalAlpha = 1;
    mctx.strokeStyle = '#8A6A3A'; mctx.lineWidth = 2; mctx.strokeRect(1, 1, W - 2, H - 2);
    const px = (pos.x - offset.x) * S, pz = (pos.z - offset.z) * S;
    mctx.save(); mctx.translate(px, pz); mctx.rotate(-yaw);
    mctx.fillStyle = 'rgba(255,255,255,.35)';
    mctx.beginPath(); mctx.moveTo(0, 0); mctx.arc(0, 0, 22, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6); mctx.fill();
    mctx.fillStyle = '#fff'; mctx.strokeStyle = '#C8102E'; mctx.lineWidth = 2;
    mctx.beginPath(); mctx.moveTo(0, -7); mctx.lineTo(5, 5); mctx.lineTo(0, 2); mctx.lineTo(-5, 5); mctx.closePath(); mctx.fill(); mctx.stroke();
    mctx.restore();
  }
  function whereAmI() {
    const x = pos.x - offset.x, z = pos.z - offset.z;
    const f = footprints.find(f => x >= f.x0 && x <= f.x1 && z >= f.z0 && z <= f.z1);
    if (!f) return 'Halaman pesantren';
    if (f.floors < 2) return f.name;
    return `${f.name} · Lt.${clamp(Math.floor((pos.y - 0.3 + 0.6) / f.h) + 1, 1, f.floors)}`;
  }
  mini.addEventListener('click', e => {
    if (!active) return;
    const r = mini.getBoundingClientRect();
    pos.set((e.clientX - r.left) / r.width * 60 + offset.x, 0, (e.clientY - r.top) / r.height * 100 + offset.z);
    pos.y = groundAt(1.0); vy = 0; vel.set(0, 0, 0); resolveXZ();
  });

  // ---- input ----
  const canvas = renderer.domElement;
  addEventListener('keydown', e => {
    if (!active) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code);
    if (e.code === 'Space') jumpReq = true;
    if (e.code === 'KeyE') toggleDoor(target);
    if (e.code === 'KeyV') setThird(!third);
    if (e.code === 'KeyF') setFlash(flashlight.intensity === 0);
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', e => {
    if (!active) return;
    if (e.pointerType === 'touch') { if (look === null) look = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
    if (locked) { toggleDoor(target); return; }
    if (noLock) { look = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
    requestLock();
  });
  addEventListener('pointermove', e => {
    if (!active) return;
    if (locked && e.pointerType === 'mouse') { turn(e.movementX, e.movementY, 0.0022); return; }
    if (look && e.pointerId === look.id) { turn(e.clientX - look.x, e.clientY - look.y, touch ? 0.006 : 0.004); look.x = e.clientX; look.y = e.clientY; }
  });
  const endLook = e => { if (look && e.pointerId === look.id) look = null; };
  addEventListener('pointerup', endLook); addEventListener('pointercancel', endLook);
  function turn(dx, dy, k) { yaw -= dx * k; pitch = clamp(pitch - dy * k, -1.45, 1.45); }
  // Kunci kursor bila diizinkan; jika ditolak, pakai seret mouse untuk menoleh.
  let noLock = !canvas.requestPointerLock;
  function requestLock() {
    try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { noLock = true; paused.hidden = true; }); }
    catch { noLock = true; paused.hidden = true; }
  }
  document.addEventListener('pointerlockerror', () => { noLock = true; paused.hidden = true; });
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas;
    paused.hidden = !active || locked || touch || noLock;
  });

  const joyEl = $('joy'), knob = $('joy-knob');
  const joyMove = e => {
    const r = joyEl.getBoundingClientRect(), max = r.width / 2;
    let dx = e.clientX - (r.left + max), dy = e.clientY - (r.top + max);
    const d = Math.hypot(dx, dy); if (d > max) { dx *= max / d; dy *= max / d; }
    joy.x = dx / max; joy.y = dy / max;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  joyEl.addEventListener('pointerdown', e => { e.preventDefault(); joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); joyMove(e); });
  joyEl.addEventListener('pointermove', e => { if (e.pointerId === joy.id) joyMove(e); });
  const joyEnd = e => { if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
  joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);
  $('btn-jump').addEventListener('pointerdown', e => { e.preventDefault(); jumpReq = true; });
  $('btn-door').addEventListener('pointerdown', e => { e.preventDefault(); toggleDoor(target); });

  // ---- mode ----
  function setThird(on) { third = on; pill.visible = on; $('btn-cam').textContent = on ? 'Kamera: Orang Ketiga' : 'Kamera: Orang Pertama'; }
  function setFlash(on) { flashlight.intensity = on ? 40 : 0; $('btn-flash').setAttribute('aria-pressed', String(on)); }
  $('btn-cam').onclick = () => setThird(!third);
  $('btn-flash').onclick = () => setFlash(flashlight.intensity === 0);
  $('btn-exit-fps').onclick = () => exit();

  function spawn() {
    pos.set(offset.x + 30, 0, offset.z + 6); yaw = Math.PI; pitch = -0.05;
    vel.set(0, 0, 0); vy = 0; pos.y = groundAt(1); eyeY = pos.y + EYE;
  }
  function enter() {
    active = true; hud.hidden = false; spawn(); keys.clear();
    paused.hidden = touch || noLock;
    if (!touch && !noLock) requestLock();
  }
  function exit() {
    active = false; hud.hidden = true; pill.visible = false; setFlash(false);
    if (document.pointerLockElement) document.exitPointerLock();
    onExit?.();
  }

  return {
    camera: cam, enter, exit,
    get active() { return active; },
    get position() { return pos; },
    setAspect(a) { cam.aspect = a; cam.updateProjectionMatrix(); },
    teleport(x, z, faceYaw = yaw) { pos.set(x, 0, z); pos.y = groundAt(1.0); vy = 0; vel.set(0, 0, 0); yaw = faceYaw; pitch = 0; resolveXZ(); },
    press(code, on) { on ? keys.add(code) : keys.delete(code); if (on && code === 'KeyE') toggleDoor(target); if (on && code === 'Space') jumpReq = true; },
    update(dt) {
      animateDoors(dt);
      if (!active) return;
      const moving = physics(dt);
      placeCamera(dt, moving);
      target = findDoor();
      uiT -= dt;
      if (uiT <= 0) {
        uiT = 0.1;
        drawMap();
        loc.textContent = whereAmI();
        const msg = target ? (target.target === 0 ? 'Buka pintu' : 'Tutup pintu') : '';
        prompt.hidden = !msg;
        prompt.textContent = touch ? msg : `E / klik · ${msg}`;
        $('btn-door').disabled = !target;
        $('btn-door').textContent = target && target.target !== 0 ? 'Tutup' : 'Buka';
      }
    },
  };
}
