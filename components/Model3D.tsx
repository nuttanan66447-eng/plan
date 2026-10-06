"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Plan } from "@/lib/types";
import { roomLayout } from "./FloorPlan";
import { Icon } from "./Icon";

// Interactive massing model generated from a plan's data (footprint, storeys, style, features).
// It is schematic, not the BIM file itself, but lets visitors orbit, zoom and cut through floors.
// When the admin uploads a real model (.glb) for the plan, that model is shown instead.

const STOREY = 3.2;
const WALL = 0.22;

interface Palette { wall: string; upper: string; roof: string; trim: string }
const PALETTES: Record<string, Palette> = {
  nordic: { wall: "#2b3036", upper: "#2b3036", roof: "#3a4049", trim: "#8a5a35" },
  modern: { wall: "#f2f0eb", upper: "#9a6b43", roof: "#e6e3dd", trim: "#3a4049" },
  tropical: { wall: "#efe9df", upper: "#8b5e3c", roof: "#ece8e1", trim: "#5b3d27" },
  japandi: { wall: "#f1ece3", upper: "#f1ece3", roof: "#4a4a48", trim: "#a87a4f" },
  minimal: { wall: "#f4f4f2", upper: "#f4f4f2", roof: "#d9d9d6", trim: "#7d7a74" },
};

type Mode = "full" | number; // number = show cut-away of that floor index

interface Built {
  floors: { shell: THREE.Group; interior: THREE.Group; whole: THREE.Group }[];
  roof: THREE.Group;
  glass: THREE.MeshStandardMaterial;
  span: number;
}

/** Lawn + lot outline used under an uploaded model. */
function buildGround(scene: THREE.Scene, lotW: number, lotD: number) {
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(lotW * 4, lotD * 4), new THREE.MeshStandardMaterial({ color: "#cfd8c4", roughness: 0.95 }));
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.y = -0.01;
  lawn.receiveShadow = true;
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(lotW, lotD)), new THREE.LineBasicMaterial({ color: "#c59b27" }));
  edge.rotation.x = -Math.PI / 2;
  edge.position.y = 0.02;
  scene.add(lawn, edge);
}

/** Load a .glb, convert to metres, centre it on the lot and rest it on the ground. */
async function loadModel(url: string, scene: THREE.Scene) {
  const draco = new DRACOLoader().setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const gltf = await loader.loadAsync(url);
  draco.dispose();
  const root = gltf.scene;
  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  // exports often come in millimetres or centimetres; houses are 5–60 m across
  const unit = maxDim > 1500 ? 0.001 : maxDim > 150 ? 0.01 : 1;
  root.scale.multiplyScalar(unit);
  box = new THREE.Box3().setFromObject(root);
  const c = box.getCenter(new THREE.Vector3());
  root.position.x -= c.x;
  root.position.z -= c.z;
  root.position.y -= box.min.y;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = m.receiveShadow = true;
    // show inner faces when the model is sliced open with the cut slider
    (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => (x.side = THREE.DoubleSide));
  });
  scene.add(root);
  return new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
}

function buildHouse(plan: Plan, scene: THREE.Scene): Built {
  const pal = PALETTES[plan.style] ?? PALETTES.modern;
  const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, ...extra });
  const glass = new THREE.MeshStandardMaterial({ color: "#7d9bb8", roughness: 0.15, metalness: 0.1, emissive: "#ffb35c", emissiveIntensity: 0 });
  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
  };

  // footprint of the ground floor, proportioned like the minimum lot
  const ratio = plan.land_width && plan.land_depth ? Math.min(1.6, Math.max(0.45, plan.land_width / plan.land_depth)) : 0.85;
  const a0 = plan.floor_areas[0] ?? plan.area_sqm / plan.storeys;
  const W = Math.sqrt(a0 * ratio);
  const D = a0 / W;

  // site: lot boundary and lawn
  const lotW = Math.max(plan.land_width ?? W + 6, W + 4);
  const lotD = Math.max(plan.land_depth ?? D + 8, D + 6);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(lotW * 3, lotD * 3), mat("#cfd8c4"));
  lawn.rotation.x = -Math.PI / 2;
  lawn.receiveShadow = true;
  scene.add(lawn);
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(lotW, lotD), mat("#b9c7a8"));
  lot.rotation.x = -Math.PI / 2;
  lot.position.y = 0.01;
  lot.receiveShadow = true;
  scene.add(lot);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(lotW, lotD)), new THREE.LineBasicMaterial({ color: "#c59b27" }));
  edge.rotation.x = -Math.PI / 2;
  edge.position.y = 0.03;
  scene.add(edge);

  const floors: Built["floors"] = [];
  let prev = { w: W, d: D, x: 0, z: 0 };
  for (let f = 0; f < plan.storeys; f++) {
    const area = plan.floor_areas[f] ?? a0;
    const scale = f === 0 ? 1 : Math.min(1, Math.sqrt(area / a0));
    const w = W * (f === 0 ? 1 : Math.min(1, scale * 1.05));
    const d = (area / w) * (f === 0 ? 1 : 1);
    // upper floors step back (or cantilever forward for modern)
    const z = f === 0 ? 0 : plan.style === "modern" ? Math.min(1.2, D - d) / 2 + 0.6 : -(D - Math.min(d, D)) / 2;
    const x = 0;
    const y0 = f * STOREY + 0.45;
    const whole = new THREE.Group();
    const shell = new THREE.Group();
    const interior = new THREE.Group();
    const wallMat = mat(f > 0 ? pal.upper : pal.wall);

    // slab
    whole.add(box(w + 0.3, 0.3, Math.min(d, f === 0 ? D : d) + 0.3, mat("#d9d6cf"), x, y0 - 0.15, z));
    // exterior walls (front/back/left/right)
    const H = STOREY - 0.3;
    const dd = Math.min(d, f === 0 ? D : d);
    shell.add(box(w, H, WALL, wallMat, x, y0 + H / 2, z + dd / 2));
    shell.add(box(w, H, WALL, wallMat, x, y0 + H / 2, z - dd / 2));
    shell.add(box(WALL, H, dd, wallMat, x - w / 2, y0 + H / 2, z));
    shell.add(box(WALL, H, dd, wallMat, x + w / 2, y0 + H / 2, z));

    // glazing: generous on the front facade, punched windows on the sides
    const front = new THREE.Group();
    const wide = f === 0 && plan.style !== "nordic";
    const panes = Math.max(2, Math.floor(w / 2.6));
    for (let i = 0; i < panes; i++) {
      const pw = wide ? w / panes - 0.25 : Math.min(1.8, w / panes - 0.6);
      const px = x - w / 2 + (w / panes) * (i + 0.5);
      front.add(box(pw, wide ? H - 0.35 : 2.1, 0.06, glass, px, y0 + (wide ? (H - 0.35) / 2 + 0.05 : 1.45), z + dd / 2 + 0.13));
    }
    for (let i = 0; i < Math.max(1, Math.floor(dd / 4)); i++) {
      const pz = z - dd / 2 + (dd / Math.max(1, Math.floor(dd / 4))) * (i + 0.5);
      front.add(box(0.06, 1.6, 1.2, glass, x - w / 2 - 0.13, y0 + 1.6, pz));
      front.add(box(0.06, 1.6, 1.2, glass, x + w / 2 + 0.13, y0 + 1.6, pz));
    }
    shell.add(front);
    if (plan.style === "modern" && f > 0) shell.add(box(w * 0.42, H + 0.1, 0.12, mat(pal.trim), x - w * 0.29, y0 + H / 2, z + dd / 2 + 0.2));

    // interior partitions + room floors from the schematic room layout
    for (const r of roomLayout(plan, f)) {
      const rx = x - w / 2 + ((r.x + r.w / 2) / 100) * w;
      const rz = z - dd / 2 + ((r.y + r.h / 2) / 100) * dd;
      const rw = (r.w / 100) * w;
      const rd = (r.h / 100) * dd;
      const isOutdoor = /TERRACE|POOL|CARPORT|BALCONY/.test(r.label);
      const floor = box(rw - 0.08, 0.04, rd - 0.08, mat(isOutdoor ? "#c9c3b6" : r.accent ? "#e6c98e" : "#d8b98c"), rx, y0 + 0.03, rz);
      interior.add(floor);
      if (!isOutdoor) {
        const pm = mat("#fbfaf7");
        interior.add(box(rw, 1.0, 0.1, pm, rx, y0 + 0.5, rz - rd / 2));
        interior.add(box(0.1, 1.0, rd, pm, rx - rw / 2, y0 + 0.5, rz));
      }
      const label = textSprite(r.sub ?? r.label, r.label);
      label.position.set(rx, y0 + 1.6, rz);
      interior.add(label);
    }
    interior.visible = false;

    whole.add(shell, interior);
    scene.add(whole);
    floors.push({ shell, interior, whole });
    prev = { w, d: dd, x, z };
  }

  // roof over the top floor
  const roof = new THREE.Group();
  const top = plan.storeys * STOREY + 0.45;
  const { w: rw, d: rd, x: rx, z: rz } = prev;
  const roofMat = mat(pal.roof, { roughness: 0.5, metalness: plan.style === "nordic" ? 0.5 : 0.05 });
  if (plan.style === "nordic") {
    const span = rw + 0.4;
    const h = span * 0.55;
    const shape = new THREE.Shape();
    shape.moveTo(-span / 2, 0);
    shape.lineTo(0, h);
    shape.lineTo(span / 2, 0);
    shape.lineTo(-span / 2, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: rd + 0.4, bevelEnabled: false });
    geo.translate(0, 0, -(rd + 0.4) / 2);
    const m = new THREE.Mesh(geo, roofMat);
    m.position.set(rx, top - 0.3, rz);
    m.castShadow = m.receiveShadow = true;
    roof.add(m);
    // glazed gable end facing front
    const gShape = new THREE.Shape();
    gShape.moveTo(-span / 2 + 0.6, 0.15);
    gShape.lineTo(0, h - 0.5);
    gShape.lineTo(span / 2 - 0.6, 0.15);
    const g = new THREE.Mesh(new THREE.ShapeGeometry(gShape), glass);
    g.position.set(rx, top - 0.3, rz + (rd + 0.4) / 2 + 0.02);
    roof.add(g);
  } else {
    const over = plan.style === "tropical" ? 1.4 : plan.style === "modern" ? 0.7 : plan.style === "japandi" ? 0.9 : 0.25;
    roof.add(box(rw + over * 2, 0.35, rd + over * 2, roofMat, rx, top - 0.12, rz));
    roof.add(box(rw + over * 2 + 0.04, 0.2, rd + over * 2 + 0.04, mat(pal.trim), rx, top - 0.2, rz)); // fascia band under the roof edge
  }
  scene.add(roof);

  // site extras
  if (plan.features.includes("pool")) {
    const pool = box(Math.min(10, W * 0.7), 0.1, 4, mat("#3d8fb8", { roughness: 0.1, metalness: 0.1, emissive: "#0d3b55", emissiveIntensity: 0.2 }), 0, 0.06, D / 2 + 3.6);
    scene.add(pool, box(Math.min(10, W * 0.7) + 1.2, 0.06, 5.2, mat("#d9d3c6"), 0, 0.03, D / 2 + 3.6));
  } else {
    scene.add(box(W * 0.6, 0.12, 2.4, mat(pal.trim), -W * 0.15, 0.06, D / 2 + 1.3)); // terrace deck
  }
  // a couple of trees for scale
  const tree = (x: number, z: number, s = 1) => {
    const g = new THREE.Group();
    g.add(box(0.25 * s, 2.2 * s, 0.25 * s, mat("#6b4a2f"), 0, 1.1 * s, 0));
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 * s, 0), mat("#5d7a4a"));
    crown.position.y = 2.8 * s;
    crown.castShadow = true;
    g.add(crown);
    g.position.set(x, 0, z);
    scene.add(g);
  };
  tree(-lotW / 2 + 1.5, lotD / 2 - 2, 1.1);
  tree(lotW / 2 - 1.6, -lotD / 2 + 2.2, 0.9);
  tree(lotW / 2 - 1.2, lotD / 2 - 1.5, 0.8);

  return { floors, roof, glass, span: Math.max(lotW, lotD, top * 2) };
}

function textSprite(main: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const g = c.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily;
  g.fillStyle = "rgba(30,35,42,0.88)";
  g.fillRect(0, 0, 512, 160);
  g.fillStyle = "#c59b27";
  g.fillRect(0, 0, 10, 160);
  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.font = `600 58px ${font}`;
  g.fillText(main, 261, 78);
  g.fillStyle = "#eec14b";
  g.font = `600 30px ${font}`;
  g.fillText(sub, 261, 126);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set(3.2, 1, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    mats.forEach((x) => {
      (x as THREE.SpriteMaterial).map?.dispose();
      x.dispose();
    });
  });
}

export default function Model3D({ plan }: { plan: Plan }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{
    controls: OrbitControls;
    camera: THREE.PerspectiveCamera;
    built: Built;
    sun: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
    scene: THREE.Scene;
    home: THREE.Vector3;
    clip: THREE.Plane;
  } | null>(null);
  const [mode, setMode] = useState<Mode>("full");
  const [auto, setAuto] = useState(true);
  const [hour, setHour] = useState(15);
  const [failed, setFailed] = useState(false);
  const custom = Boolean(plan.model_url);
  const [loading, setLoading] = useState(custom);
  const [loadError, setLoadError] = useState(false);
  const [modelH, setModelH] = useState(0);
  const [cutH, setCutH] = useState<number | null>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6);
    renderer.clippingPlanes = [clip];
    const lotW = plan.land_width ?? 20;
    const lotD = plan.land_depth ?? 24;
    const built: Built = custom
      ? { floors: [], roof: new THREE.Group(), glass: new THREE.MeshStandardMaterial(), span: Math.max(lotW, lotD, 16) }
      : buildHouse(plan, scene);
    if (custom) buildGround(scene, lotW, lotD);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2000);
    const home = new THREE.Vector3(built.span * 0.85, built.span * 0.55, built.span * 1.05);
    camera.position.copy(home);

    const hemi = new THREE.HemisphereLight("#dfe8f5", "#8a8f7a", 1.1);
    const sun = new THREE.DirectionalLight("#fff1d6", 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -built.span;
    sc.right = sc.top = built.span;
    sc.far = built.span * 6;
    scene.add(hemi, sun, sun.target);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 3, 0);
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = built.span * 0.35;
    controls.maxDistance = built.span * 3;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.addEventListener("start", () => setAuto(false));

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    api.current = { controls, camera, built, sun, hemi, scene, home, clip };

    let cancelled = false;
    const fit = (span: number, height: number) => {
      built.span = span;
      home.set(span * 0.85, Math.max(span * 0.55, height * 1.4), span * 1.05);
      camera.position.copy(home);
      controls.target.set(0, height * 0.4, 0);
      controls.minDistance = span * 0.2;
      controls.maxDistance = span * 4;
      sc.left = sc.bottom = -span;
      sc.right = sc.top = span;
      sc.far = span * 8;
      sc.updateProjectionMatrix();
    };
    if (custom && plan.model_url) {
      loadModel(plan.model_url, scene)
        .then((size) => {
          if (cancelled) return;
          fit(Math.max(size.x, size.z, lotW, lotD) * 1.1, size.y);
          setModelH(Math.ceil(size.y * 10) / 10);
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("model load failed", err);
          // fall back to the generated massing model so the tab is never empty
          const b = buildHouse(plan, scene);
          Object.assign(built, b);
          fit(b.span, 8);
          setLoadError(true);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, [plan, custom]);

  // horizontal section through an uploaded model
  useEffect(() => {
    const a = api.current;
    if (a) a.clip.constant = cutH ?? 1e6;
  }, [cutH]);

  // floors / roof cut-away
  useEffect(() => {
    const a = api.current;
    if (!a) return;
    a.built.floors.forEach((f, i) => {
      const cut = mode !== "full" && i === mode;
      f.whole.visible = mode === "full" || i <= (mode as number);
      f.shell.scale.y = cut ? 0.32 : 1;
      f.shell.position.y = cut ? (i * STOREY + 0.45) * (1 - 0.32) : 0;
      f.shell.children.forEach((c) => c.type === "Group" && (c.visible = !cut));
      f.interior.visible = cut;
    });
    a.built.roof.visible = mode === "full";
    const ty = mode === "full" ? 3 : (mode as number) * STOREY + 0.5;
    a.controls.target.set(0, ty, 0);
    const s = a.built.span;
    if (mode !== "full") a.camera.position.set(s * 0.35, ty + s * 1.05, s * 0.6);
    else a.camera.position.copy(a.home);
  }, [mode]);

  useEffect(() => {
    if (api.current) api.current.controls.autoRotate = auto;
  }, [auto]);

  // sun position for the chosen hour (Thailand, ~16°N: sun arcs east → south → west)
  useEffect(() => {
    const a = api.current;
    if (!a) return;
    const t = (hour - 6) / 12; // 0 at sunrise, 1 at sunset
    const az = Math.PI * t; // east (0) → west (π)
    const el = Math.sin(Math.PI * t) * 1.25 + 0.05;
    const r = a.built.span * 2;
    a.sun.position.set(Math.cos(az) * r, Math.sin(el) * r, -Math.sin(az) * r * 0.35 + r * 0.25);
    const dusk = Math.min(1, Math.abs(t - 0.5) * 2);
    a.sun.intensity = 0.4 + 2.2 * (1 - dusk ** 3);
    a.sun.color.set(dusk > 0.75 ? "#ffb070" : "#fff1d6");
    a.hemi.intensity = 0.75 + 0.55 * (1 - dusk ** 2);
    const night = Math.max(0, dusk - 0.55) / 0.45;
    a.built.glass.emissiveIntensity = night * night * 1.2;
    a.built.glass.color.set(night > 0.5 ? "#2a3440" : "#7d9bb8");
    a.scene.background = new THREE.Color(dusk > 0.8 ? "#2c3347" : "#e9eef6").lerp(new THREE.Color("#c8d6ea"), 0.3);
  }, [hour]);

  const zoom = (k: number) => {
    const a = api.current;
    if (!a) return;
    const dir = a.camera.position.clone().sub(a.controls.target).multiplyScalar(k);
    const len = THREE.MathUtils.clamp(dir.length(), a.controls.minDistance, a.controls.maxDistance);
    a.camera.position.copy(a.controls.target.clone().add(dir.setLength(len)));
  };
  const reset = () => {
    const a = api.current;
    if (!a) return;
    setMode("full");
    setCutH(null);
    a.camera.position.copy(a.home);
    setAuto(true);
  };

  if (failed) {
    return (
      <div className="grid h-full place-items-center bg-wash-2 p-6 text-center text-[13px] text-muted">
        เบราว์เซอร์นี้ไม่รองรับการแสดงผล 3D (WebGL) — ลองเปิดด้วย Chrome, Safari หรือ Edge รุ่นล่าสุด
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mount} className="absolute inset-0 cursor-grab active:cursor-grabbing" role="img" aria-label={`โมเดล 3 มิติของ ${plan.code} ลากเพื่อหมุน`} />
      <div className="pointer-events-none absolute left-3 top-3 hidden bg-ink/85 px-2.5 py-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-white md:block">
        <Icon name="3d_rotation" className="text-bronze" /> ลากเพื่อหมุน • ล้อเมาส์/2 นิ้วเพื่อซูม
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-2 bg-ink/85 px-2.5 py-1.5 text-[11px] text-white">
        <Icon name="light_mode" className="text-bronze" />
        <label htmlFor="sun-hour" className="whitespace-nowrap">เวลา {String(hour).padStart(2, "0")}:00</label>
        <input id="sun-hour" type="range" min={6} max={18} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="w-20 accent-[#c59b27] sm:w-28" />
      </div>
      {custom && !loadError ? (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-ink/90 px-2.5 py-1.5 text-[11.5px] text-white">
          <label htmlFor="cut-h" className="whitespace-nowrap">{cutH == null ? "ตัดดูภายใน" : `ตัดที่ ${cutH.toFixed(1)} ม.`}</label>
          <input id="cut-h" type="range" min={0.3} max={Math.max(0.5, modelH)} step={0.1} value={cutH ?? Math.max(0.5, modelH)}
            onChange={(e) => { const v = Number(e.target.value); setCutH(v >= modelH ? null : v); setAuto(false); }}
            disabled={loading} className="w-24 accent-[#c59b27] sm:w-36" />
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1 bg-ink/90 p-1 text-[11.5px] text-white">
          <span className="hidden px-2 text-white/60 sm:inline">มุมมอง:</span>
          <button onClick={() => setMode("full")} className={`px-2.5 py-1 ${mode === "full" ? "bg-bronze font-bold text-ink" : "hover:bg-white/10"}`}>ทั้งหลัง</button>
          {Array.from({ length: plan.storeys }, (_, i) => (
            <button key={i} onClick={() => { setMode(i); setAuto(false); }} className={`px-2.5 py-1 ${mode === i ? "bg-bronze font-bold text-ink" : "hover:bg-white/10"}`}>ตัดชั้น {i + 1}</button>
          ))}
        </div>
      )}
      <span className={`pointer-events-none absolute left-3 top-12 hidden px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] md:block ${custom && !loadError ? "bg-bronze text-ink" : "bg-white/85 text-ink"}`}>
        {custom && !loadError ? "โมเดลจริงจากสถาปนิก" : "โมเดลจำลองจากข้อมูลแบบ"}
      </span>
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-wash/70 text-[13px] text-ink">
          <span className="flex items-center gap-2 bg-white px-4 py-2 shadow-[2px_2px_0_0_#1e232a]"><Icon name="progress_activity" className="animate-spin text-bronze-dark" /> กำลังโหลดโมเดล 3 มิติ...</span>
        </div>
      )}
      <div className="absolute bottom-3 right-3 flex bg-ink/90 text-white">
        <button onClick={() => zoom(0.8)} className="grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="ซูมเข้า"><Icon name="zoom_in" /></button>
        <button onClick={() => zoom(1.25)} className="grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="ซูมออก"><Icon name="zoom_out" /></button>
        <button onClick={() => setAuto((v) => !v)} className={`grid h-9 w-9 place-items-center ${auto ? "bg-bronze text-ink" : "hover:bg-white/10"}`} aria-label={auto ? "หยุดหมุนอัตโนมัติ" : "หมุนอัตโนมัติ"} aria-pressed={auto}><Icon name="3d_rotation" /></button>
        <button onClick={reset} className="grid h-9 w-9 place-items-center text-bronze hover:bg-white/10" aria-label="รีเซ็ตมุมมอง"><Icon name="restart_alt" /></button>
      </div>
    </div>
  );
}
