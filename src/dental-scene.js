import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Each pose is a point on a reversible scroll timeline, rather than elapsed time.
// [progress, separation, rotation, pitch, roll, scale, lift, screw rotation]
const INTRO_POSES = [
  [0, 0.14, -0.45, 0.04, -0.2, 1, 0, 0],
  [0.2, 0.28, 0.4, 0.09, -0.12, 1.1, 0, 0.5],
  [0.45, 1.05, 1.7, 0.16, 0.06, 0.8, -0.03, 3.2],
  [0.64, 0.9, 3.7, -0.03, -0.12, 0.83, -0.03, 5.5],
  [0.84, 0.35, 5.1, 0.08, -0.17, 1.06, 0, 8],
  [1, 0.12, 5.85, 0.04, -0.2, 1.04, 0, 9.4],
];
const STORY_POSES = [
  [0, 0.14, -0.45, 0.04, -0.12, 1.02, 0, 0],
  [0.18, 0.95, 0.4, 0.1, -0.07, 1, -0.08, 2.4],
  [0.34, 1.24, 1.4, 0.14, 0.05, 1, -0.08, 4.7],
  [0.5, 1.15, 3.05, 0.18, -0.1, 1.06, -0.08, 6.3],
  [0.66, 0.92, 4.0, -0.04, -0.07, 1.02, -0.06, 7.8],
  [0.84, 0.32, 5.3, 0.06, -0.15, 1.13, 0, 10.8],
  [1, 0.07, 5.85, 0.04, -0.12, 1.16, 0, 12.56],
];

function samplePose(poses, progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let next = poses.findIndex((pose) => pose[0] >= p);
  if (next < 1) next = 1;
  const a = poses[next - 1];
  const b = poses[next];
  const t = THREE.MathUtils.smoothstep(p, a[0], b[0]);
  return a.map((value, i) => THREE.MathUtils.lerp(value, b[i], t));
}

// Original procedural illustration: no external 3D asset or runtime CDN required.
function crownGeometry() {
  const rings = 66;
  const segments = 96;
  const profile = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.31, 0),
    new THREE.Vector3(0.39, 0.32, 0),
    new THREE.Vector3(0.56, 0.43, 0),
    new THREE.Vector3(0.77, 0.75, 0),
    new THREE.Vector3(0.88, 1.14, 0),
    new THREE.Vector3(0.89, 1.47, 0),
    new THREE.Vector3(0.78, 1.68, 0),
    new THREE.Vector3(0.55, 1.73, 0),
    new THREE.Vector3(0.28, 1.59, 0),
    new THREE.Vector3(0, 1.55, 0),
  ]);
  const positions = [];
  const indices = [];
  const colors = [];
  const tint = new THREE.Color();
  for (let j = 0; j <= rings; j++) {
    const t = j / rings;
    const p = profile.getPoint(t);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const squareX =
        Math.sign(Math.cos(angle)) * Math.pow(Math.abs(Math.cos(angle)), 0.73);
      const squareZ =
        Math.sign(Math.sin(angle)) * Math.pow(Math.abs(Math.sin(angle)), 0.73);
      const top = THREE.MathUtils.smoothstep(t, 0.53, 0.74);
      const cusp =
        Math.cos(angle * 4 + 0.1) *
        0.1 *
        top *
        Math.pow(Math.sin(Math.PI * Math.max(0, (t - 0.52) / 0.48)), 0.75);
      const radius = p.x * (1 + Math.cos(angle * 4) * 0.025);
      positions.push(squareX * radius, p.y + cusp, squareZ * radius * 0.86);
      tint.setRGB(0.965 - t * 0.015, 0.956 + t * 0.012, 0.885 + t * 0.055);
      colors.push(tint.r, tint.g, tint.b);
      if (j < rings && i < segments) {
        const a = j * (segments + 1) + i;
        indices.push(
          a,
          a + segments + 1,
          a + 1,
          a + 1,
          a + segments + 1,
          a + segments + 2,
        );
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createImplant() {
  const group = new THREE.Group();
  const enamel = new THREE.MeshPhysicalMaterial({
    color: 0xfffdf3,
    vertexColors: true,
    roughness: 0.19,
    metalness: 0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.16,
    ior: 1.46,
  });
  const titanium = new THREE.MeshStandardMaterial({
    color: 0xc5c9c6,
    metalness: 0.95,
    roughness: 0.25,
  });
  const grooves = new THREE.MeshStandardMaterial({
    color: 0x68746e,
    metalness: 0.9,
    roughness: 0.34,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd7c89e,
    metalness: 0.8,
    roughness: 0.28,
  });
  const crown = new THREE.Group();
  crown.add(new THREE.Mesh(crownGeometry(), enamel));

  const abutment = new THREE.Group();
  const connector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.235, 0.31, 0.53, 64),
    titanium,
  );
  connector.position.y = 0.08;
  abutment.add(connector);
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.32, 0.12, 64),
    gold,
  );
  collar.position.y = -0.17;
  abutment.add(collar);
  const upperRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.025, 10, 64),
    titanium,
  );
  upperRing.rotation.x = Math.PI / 2;
  upperRing.position.y = 0.29;
  abutment.add(upperRing);

  const screw = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.18, 1.47, 64),
    titanium,
  );
  core.position.y = -1.07;
  screw.add(core);
  const topRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.33, 0.14, 64),
    titanium,
  );
  topRing.position.y = -0.34;
  screw.add(topRing);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.323 - i * 0.006, 0.015, 8, 64),
      grooves,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.37 - i * 0.048;
    screw.add(ring);
  }
  // Continuous helix rather than stacked discs, to suggest a screw thread.
  const helix = [];
  const turns = 9.5;
  for (let i = 0; i <= 950; i++) {
    const t = i / 950;
    const radius = 0.3 - t * 0.08;
    helix.push(
      new THREE.Vector3(
        Math.cos(t * turns * Math.PI * 2) * radius,
        -0.53 - t * 1.18,
        Math.sin(t * turns * Math.PI * 2) * radius,
      ),
    );
  }
  const thread = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(helix),
      700,
      0.055,
      6,
      false,
    ),
    titanium,
  );
  screw.add(thread);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.185, 32, 20), titanium);
  tip.scale.y = 0.8;
  tip.position.y = -1.8;
  screw.add(tip);
  group.add(crown, abutment, screw);
  return { group, crown, abutment, screw };
}

export function createDentalScene(container, { dark = false } = {}) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = dark ? 1.15 : 1.25;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(4.2, 3.0, 8.5);
  camera.lookAt(0, 0.05, 0);
  const ambient = new THREE.AmbientLight(0xe4eed8, 1.0);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 4.2);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe0edcb, 1.8);
  fill.position.set(4, 2, -3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(-4, 1, -2);
  scene.add(rim);

  const model = createImplant();
  scene.add(model.group);
  model.group.rotation.set(0.04, -0.45, -0.2);
  const state = {
    active: false,
    expansion: dark ? 0.5 : 0.14,
    targetExpansion: dark ? 0.5 : 0.14,
    targetY: -0.45,
    targetPitch: 0.04,
    targetRoll: dark ? -0.12 : -0.2,
    targetScale: 1,
    targetLift: 0,
    targetScrewRotation: 0,
    timelineControlled: false,
    step: 0,
    pointerX: 0,
    pointerY: 0,
    disposed: false,
    frame: null,
  };

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the entire illustration in the short mobile storytelling viewport.
    camera.position.set(4.2, 3.0, 8.5);
    camera.position.multiplyScalar(
      dark || innerWidth <= 600 ? 1.2 : camera.aspect < 0.85 ? 1.12 : 0.9,
    );
    camera.lookAt(0, 0.03, 0);
    camera.updateProjectionMatrix();
    renderFrame(performance.now(), true);
  };

  function renderFrame(time, once = false) {
    if (state.disposed) return;
    const moving = !reducedMotion.matches;
    state.expansion = moving
      ? THREE.MathUtils.lerp(state.expansion, state.targetExpansion, 0.07)
      : dark
        ? 0.68
        : 0.14;
    const spread = state.expansion;
    model.crown.position.y = spread * 0.92;
    model.abutment.position.y = spread * 0.05;
    model.screw.position.y = spread * -0.5;
    model.group.rotation.y = moving
      ? THREE.MathUtils.lerp(
          model.group.rotation.y,
          state.targetY + state.pointerX * 0.27,
          0.035,
        )
      : -0.45;
    model.group.rotation.x = THREE.MathUtils.lerp(
      model.group.rotation.x,
      moving ? state.targetPitch + state.pointerY * 0.06 : 0.04,
      0.08,
    );
    model.group.rotation.z = THREE.MathUtils.lerp(
      model.group.rotation.z,
      state.targetRoll,
      0.08,
    );
    model.group.scale.setScalar(
      THREE.MathUtils.lerp(
        model.group.scale.x,
        state.targetScale,
        moving ? 0.08 : 1,
      ),
    );
    const float =
      moving && !state.timelineControlled ? Math.sin(time * 0.0008) * 0.045 : 0;
    model.group.position.y = THREE.MathUtils.lerp(
      model.group.position.y,
      state.targetLift + float,
      moving ? 0.08 : 1,
    );
    model.screw.rotation.y = THREE.MathUtils.lerp(
      model.screw.rotation.y,
      state.targetScrewRotation,
      moving ? 0.08 : 1,
    );
    renderer.render(scene, camera);
    if (!once && state.active && moving && !document.hidden)
      state.frame = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null;
    if (state.active && !document.hidden) {
      if (reducedMotion.matches) renderFrame(performance.now(), true);
      else state.frame = requestAnimationFrame(renderFrame);
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      state.active = entries[0].isIntersecting;
      start();
    },
    { rootMargin: "100px" },
  );
  observer.observe(container);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const onPointer = (event) => {
    if (reducedMotion.matches || event.pointerType === "touch") return;
    const bounds = container.getBoundingClientRect();
    state.pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    state.pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };
  const onLeave = () => {
    state.pointerX = 0;
    state.pointerY = 0;
  };
  container.addEventListener("pointermove", onPointer);
  container.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", start);
  resize();
  function applyPose(poses, progress) {
    const [, expansion, rotation, pitch, roll, scale, lift, screwRotation] =
      samplePose(poses, progress);
    state.timelineControlled = true;
    state.targetExpansion = expansion;
    state.targetY = rotation;
    state.targetPitch = pitch;
    state.targetRoll = roll;
    state.targetScale = scale;
    state.targetLift = lift;
    state.targetScrewRotation = screwRotation;
  }
  return {
    setIntroProgress(progress) {
      applyPose(INTRO_POSES, progress);
    },
    setTimelineProgress(progress) {
      applyPose(STORY_POSES, progress);
    },
    resetTimeline() {
      state.timelineControlled = false;
      state.targetExpansion = dark ? 0.5 : 0.14;
      state.targetY = -0.45;
      state.targetPitch = 0.04;
      state.targetRoll = dark ? -0.12 : -0.2;
      state.targetScale = 1;
      state.targetLift = 0;
      state.targetScrewRotation = 0;
    },
    setStoryProgress(step, within) {
      state.step = step;
      state.targetExpansion =
        step === 0
          ? 0.95 + within * 0.22
          : step === 1
            ? 1.0 - within * 0.3
            : Math.max(0.1, 0.65 - within * 0.85);
      state.targetY =
        step === 0
          ? -0.45 + within * 0.3
          : step === 1
            ? 0.15 + within * 0.4
            : 0.45 + within * 0.45;
    },
    renderOnce() {
      renderFrame(performance.now(), true);
    },
    dispose() {
      state.disposed = true;
      cancelAnimationFrame(state.frame);
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointer);
      container.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
      reducedMotion.removeEventListener("change", start);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (object.material) object.material.dispose();
      });
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
