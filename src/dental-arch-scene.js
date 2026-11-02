import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { crownGeometry } from "./dental-scene.js";

const clamp = (value) => THREE.MathUtils.clamp(value, 0, 1);
const ease = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);

function anteriorGeometry(pointed = false) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.21, 0);
  shape.bezierCurveTo(-0.27, 0.15, -0.31, 0.55, -0.29, 0.88);
  if (pointed) {
    shape.quadraticCurveTo(-0.18, 0.94, 0, 1.09);
    shape.quadraticCurveTo(0.18, 0.94, 0.29, 0.88);
  } else {
    shape.quadraticCurveTo(0, 0.94, 0.29, 0.88);
  }
  shape.bezierCurveTo(0.31, 0.55, 0.27, 0.15, 0.21, 0);
  shape.quadraticCurveTo(0, -0.05, -0.21, 0);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.23,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 10,
  });
}

function normalizeCrown(geometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  geometry.translate(
    -(box.min.x + box.max.x) / 2,
    -box.min.y,
    -(box.min.z + box.max.z) / 2,
  );
  geometry.computeBoundingBox();
  return geometry;
}

function buildDentition() {
  const root = new THREE.Group();
  const upper = new THREE.Group();
  const lowerPivot = new THREE.Group();
  const lower = new THREE.Group();
  lowerPivot.position.set(0, 0.8, -0.8);
  lower.position.set(0, -0.8, 0.8);
  lowerPivot.add(lower);
  root.add(upper, lowerPivot);
  const geometries = {
    incisor: normalizeCrown(anteriorGeometry()),
    canine: normalizeCrown(anteriorGeometry(true)),
    molar: normalizeCrown(crownGeometry({ rings: 20, segments: 32 })),
  };
  const rootGeometry = new THREE.ConeGeometry(0.12, 0.83, 10);
  rootGeometry.rotateZ(Math.PI);
  const rootMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4e8ee,
    emissive: 0x3a7c99,
    emissiveIntensity: 0.25,
    roughness: 0.7,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x82c9e0,
    transparent: true,
    opacity: 0.15,
    wireframe: true,
    depthWrite: false,
  });
  const ghostMaterial = new THREE.MeshBasicMaterial({
    color: 0x8bd3e5,
    transparent: true,
    opacity: 0.15,
    wireframe: true,
    depthWrite: false,
  });
  const gumMaterial = new THREE.MeshStandardMaterial({
    color: 0x829bab,
    emissive: 0x1a3749,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.18,
    roughness: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const skeletalMaterial = new THREE.MeshStandardMaterial({
    color: 0xa2becd,
    transparent: true,
    opacity: 0.18,
    roughness: 0.85,
    depthWrite: false,
  });
  const teeth = [];
  const selected = [];
  const halfAngles = [0.1, 0.295, 0.5, 0.73, 0.96, 1.22, 1.49];
  const widths = [0.6, 0.55, 0.58, 0.61, 0.63, 0.68, 0.7];

  for (const isUpper of [true, false]) {
    const arch = isUpper ? upper : lower;
    const rx = isUpper ? 3.05 : 2.9;
    const rz = isUpper ? 2.5 : 2.35;
    for (let i = 0; i < 14; i++) {
      const rank = Math.floor(Math.abs(i - 6.5));
      const angle = halfAngles[rank] * (i < 7 ? -1 : 1);
      const group = new THREE.Group();
      group.position.set(
        rx * Math.sin(angle),
        isUpper ? 0.92 : -0.96,
        rz * Math.cos(angle),
      );
      group.rotation.y = angle;
      group.scale.y = isUpper ? -1 : 1;
      const geometry =
        rank < 2
          ? geometries.incisor
          : rank === 2
            ? geometries.canine
            : geometries.molar;
      const dimensions = new THREE.Vector3();
      geometry.boundingBox.getSize(dimensions);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xc5dbe4,
        emissive: 0x306180,
        emissiveIntensity: 0.16,
        roughness: 0.26,
        metalness: 0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.25,
        transparent: true,
        opacity: 0.24,
      });
      const crown = new THREE.Mesh(geometry, material);
      crown.scale.set(
        widths[rank] / dimensions.x,
        0.91 / dimensions.y,
        (rank < 3 ? 0.4 : 0.64) / dimensions.z,
      );
      group.add(crown);
      const wire = new THREE.Mesh(geometry, wireMaterial);
      wire.scale.copy(crown.scale).multiplyScalar(1.002);
      group.add(wire);
      const roots = rank >= 3 ? [-0.14, 0.14] : [0];
      roots.forEach((x) => {
        const toothRoot = new THREE.Mesh(rootGeometry, rootMaterial);
        toothRoot.position.set(x, -0.36, 0);
        toothRoot.rotation.z = -x * 0.65;
        if (rank < 3) toothRoot.scale.y = 1.15;
        group.add(toothRoot);
      });
      arch.add(group);
      const tooth = {
        group,
        crown,
        wire,
        material,
        index: i,
        isUpper,
        seed: (i - 6.5) / 2,
      };
      teeth.push(tooth);
      if (isUpper && [5, 6, 7, 8].includes(i)) {
        const socket = new THREE.Mesh(geometry, ghostMaterial);
        socket.scale.copy(crown.scale).multiplyScalar(1.01);
        group.add(socket);
        selected.push(tooth);
      }
    }

    const archPoints = [];
    for (let j = 0; j <= 64; j++) {
      const a = -1.56 + (j / 64) * 3.12;
      archPoints.push(
        new THREE.Vector3(
          rx * Math.sin(a),
          isUpper ? 1.28 : -1.3,
          rz * Math.cos(a),
        ),
      );
    }
    const bone = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(archPoints),
        80,
        isUpper ? 0.39 : 0.4,
        14,
        false,
      ),
      gumMaterial,
    );
    arch.add(bone);
    const boneWire = new THREE.Mesh(bone.geometry, ghostMaterial);
    arch.add(boneWire);
  }

  // The mandibular rami make the scan read as a jaw, rather than loose teeth.
  [-1, 1].forEach((side) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 2.88, -1.3, 0.25),
      new THREE.Vector3(side * 3.12, -0.9, -0.4),
      new THREE.Vector3(side * 3.04, 0.0, -0.92),
      new THREE.Vector3(side * 2.9, 0.65, -1.05),
    ]);
    lower.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(path, 28, 0.22, 12, false),
        skeletalMaterial,
      ),
    );
    const joint = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 14, 10),
      skeletalMaterial,
    );
    joint.scale.set(1.3, 0.7, 0.9);
    joint.position.set(side * 2.9, 0.65, -1.05);
    lower.add(joint);
  });

  const scan = new THREE.Group();
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0x68cce8,
    transparent: true,
    opacity: 0.075,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 7.0), beamMaterial);
  beam.rotation.x = -Math.PI / 2;
  beam.position.z = 0.7;
  scan.add(beam);
  const scanLineMaterial = new THREE.LineBasicMaterial({
    color: 0x8fe2fa,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(beam.geometry),
    scanLineMaterial,
  );
  border.rotation.copy(beam.rotation);
  border.position.copy(beam.position);
  scan.add(border);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(4.35, 0.012, 6, 100),
    new THREE.MeshBasicMaterial({
      color: 0x7bc6e1,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.z = 0.6;
  scan.add(ring);
  root.add(scan);

  // A sparse cloud evokes a reconstructed scan; these are procedural points.
  lowerPivot.rotation.x = 0.15;
  root.updateMatrixWorld(true);
  const samples = [];
  const vertex = new THREE.Vector3();
  teeth.forEach(({ crown }) => {
    const positions = crown.geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 9) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(crown.matrixWorld);
      samples.push(vertex.x, vertex.y, vertex.z);
    }
  });
  const cloudMaterial = new THREE.PointsMaterial({
    color: 0x95dbf0,
    size: 0.028,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const cloud = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(samples, 3),
    ),
    cloudMaterial,
  );
  root.add(cloud);
  return {
    root,
    teeth,
    selected,
    lowerPivot,
    scan,
    beamMaterial,
    scanLineMaterial,
    ring,
    cloudMaterial,
    rootMaterial,
    wireMaterial,
    ghostMaterial,
    gumMaterial,
    skeletalMaterial,
  };
}

export function createDentalArchScene(container) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xc6d8e8, 1.5));
  const key = new THREE.DirectionalLight(0xffeee1, 3.2);
  key.position.set(-3, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8bc8ed, 2.5);
  rim.position.set(5, 3, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc1d8ee, 1.1);
  fill.position.set(-6, -1, 2);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 70);
  const model = buildDentition();
  scene.add(model.root);
  const state = {
    target: 0.04,
    progress: 0.04,
    active: false,
    frame: null,
    disposed: false,
  };
  const ivory = new THREE.Color(0xf8f0df);
  const xray = new THREE.Color(0xb2d3e2);
  const gum = new THREE.Color(0x9b717b);
  const scanBone = new THREE.Color(0x819faf);
  const cyan = new THREE.Color(0x49b9d8);
  const noGlow = new THREE.Color(0x000000);

  function pose(progress) {
    const p = clamp(progress);
    const reveal = ease(0.3, 0.72, p);
    const scanStrength = 1 - ease(0.31, 0.43, p);
    const extraction = ease(0.25, 0.42, p) * (1 - ease(0.43, 0.69, p));
    const functionProgress = ease(0.72, 1, p);
    const bite = Math.pow(Math.sin(functionProgress * Math.PI * 2), 2);
    model.root.rotation.y = THREE.MathUtils.lerp(
      -0.38,
      -0.12,
      ease(0.2, 0.86, p),
    );
    model.root.rotation.z = THREE.MathUtils.lerp(-0.05, 0.015, reveal);
    model.root.scale.setScalar(THREE.MathUtils.lerp(0.94, 1.02, reveal));
    model.lowerPivot.rotation.x =
      THREE.MathUtils.lerp(0.15, 0, ease(0.57, 0.74, p)) + bite * 0.17;
    model.lowerPivot.position.x =
      Math.sin(functionProgress * Math.PI * 4) * 0.045;
    model.scan.position.y = THREE.MathUtils.lerp(2.0, -2.2, ease(0, 0.32, p));
    model.scan.visible = scanStrength > 0.005;
    model.beamMaterial.opacity = 0.09 * scanStrength;
    model.scanLineMaterial.opacity = 0.64 * scanStrength;
    model.ring.material.opacity = 0.38 * scanStrength;
    model.cloudMaterial.opacity = 0.45 * scanStrength;
    model.wireMaterial.opacity = 0.12 * (1 - reveal);
    model.ghostMaterial.opacity = 0.07 * (1 - reveal) + extraction * 0.2;
    model.rootMaterial.opacity = 0.45 * (1 - reveal);
    model.skeletalMaterial.opacity = 0.22 * (1 - reveal);
    model.gumMaterial.color.copy(scanBone).lerp(gum, reveal);
    model.gumMaterial.opacity = THREE.MathUtils.lerp(0.13, 0.83, reveal);
    model.gumMaterial.emissiveIntensity = 0.18 * (1 - reveal);
    model.teeth.forEach((tooth) => {
      tooth.material.color.copy(xray).lerp(ivory, reveal);
      tooth.material.opacity = THREE.MathUtils.lerp(0.2, 1, reveal);
      tooth.material.emissiveIntensity = 0.18 * (1 - reveal);
    });
    model.selected.forEach((tooth) => {
      const offset = extraction * (1 - Math.abs(tooth.seed) * 0.12);
      tooth.crown.position.set(
        Math.sign(tooth.seed) * 0.23 * offset,
        -1.45 * offset,
        1.65 * offset,
      );
      tooth.crown.rotation.set(
        offset * 0.2,
        tooth.seed * offset * 0.13,
        tooth.seed * offset * 0.1,
      );
      tooth.material.opacity = Math.max(
        tooth.material.opacity,
        0.8 * extraction,
      );
      tooth.material.emissive.copy(noGlow).lerp(cyan, extraction * 0.55);
      tooth.material.emissiveIntensity = extraction * 0.48;
      tooth.wire.visible = extraction < 0.03;
    });
    container.style.setProperty("--scan-opacity", scanStrength.toFixed(3));
  }

  function frame() {
    state.frame = null;
    if (state.disposed) return;
    state.progress = reduced.matches
      ? state.target
      : THREE.MathUtils.lerp(state.progress, state.target, 0.12);
    pose(state.progress);
    renderer.render(scene, camera);
    if (
      state.active &&
      !document.hidden &&
      Math.abs(state.progress - state.target) > 0.00015
    )
      state.frame = requestAnimationFrame(frame);
  }
  function requestFrame() {
    if (
      state.active &&
      !state.disposed &&
      !document.hidden &&
      state.frame === null
    )
      state.frame = requestAnimationFrame(frame);
  }
  function resize() {
    const bounds = container.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.position.set(7.3, 4.7, 11.5);
    if (innerWidth <= 600) camera.position.multiplyScalar(0.88);
    if (camera.aspect < 0.8) camera.position.multiplyScalar(1.12);
    camera.lookAt(0, 0.15, 0.65);
    camera.updateProjectionMatrix();
    pose(state.progress);
    renderer.render(scene, camera);
  }
  const visibility = new IntersectionObserver(
    ([entry]) => {
      state.active = entry.isIntersecting;
      if (!state.active && state.frame !== null) {
        cancelAnimationFrame(state.frame);
        state.frame = null;
      }
      requestFrame();
    },
    { rootMargin: "100px" },
  );
  visibility.observe(container);
  const dimensions = new ResizeObserver(resize);
  dimensions.observe(container);
  document.addEventListener("visibilitychange", requestFrame);
  reduced.addEventListener("change", requestFrame);
  resize();
  function setProgress(value) {
    state.target = clamp(value);
    requestFrame();
  }
  return {
    setTimelineProgress: setProgress,
    setStoryProgress(step, within) {
      setProgress([0.12, 0.51, 0.88][step] + within * 0.06);
    },
    resetTimeline() {
      setProgress(0.12);
    },
    renderOnce() {
      state.progress = state.target;
      pose(state.progress);
      renderer.render(scene, camera);
    },
    dispose() {
      state.disposed = true;
      if (state.frame !== null) cancelAnimationFrame(state.frame);
      visibility.disconnect();
      dimensions.disconnect();
      document.removeEventListener("visibilitychange", requestFrame);
      reduced.removeEventListener("change", requestFrame);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
