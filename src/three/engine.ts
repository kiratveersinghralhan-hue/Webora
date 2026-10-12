import * as THREE from "three/src/Three.js";
import { pointer, subscribePointer } from "../lib/pointer";
import { featuredProjects } from "../data/studio";
import type { SceneKind } from "./Spatial";
import { horizontalDrag } from "../lib/gesture";
import { assetUrl } from "../lib/site";
import { recordRuntime, recordFrame, recordEvent } from "./runtime/diagnostics";

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
/** A family of folded surfaces derived from the same W, rendered without postprocessing. */
export function createScene(
  host: HTMLElement,
  kind: SceneKind,
  onReady: (ready: boolean) => void,
) {
  let mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    // DPR supplies edge quality without a costly multisample framebuffer.
    antialias: false,
    powerPreference: "low-power",
  });
  const gl = renderer.getContext();
  const diagnostics = recordRuntime("v1", kind);
  let diagnosticTime: number | undefined;
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const software =
    !!debug &&
    /swiftshader|llvmpipe|software/i.test(
      String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)),
    );
  host.dataset.quality = software ? "software-low" : mobile ? "touch" : "high";
  let dpr = Math.min(devicePixelRatio, mobile ? 1.15 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    kind === "work" ? 38 : 35,
    1,
    0.1,
    80,
  );
  camera.position.set(0, 0, 9);
  const group = new THREE.Group();
  scene.add(group);
  const textures = new Set<THREE.Texture>();
  // Tiny studio-light reflection maps, generated locally; no model/environment downloads.
  const faces = Array.from({ length: 6 }, (_, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, i % 2 ? "#d7dcff" : "#10152c");
    gradient.addColorStop(0.3, "#343e79");
    gradient.addColorStop(0.55, "#a69cec");
    gradient.addColorStop(1, "#0b0d1c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return canvas;
  });
  const environment = new THREE.CubeTexture(faces);
  environment.needsUpdate = true;
  environment.colorSpace = THREE.SRGBColorSpace;
  textures.add(environment);
  scene.environment = environment;
  const alloy = new THREE.MeshStandardMaterial({
    color: 0x8e93db,
    metalness: 0.86,
    roughness: 0.26,
    envMapIntensity: 1.2,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x20283f,
    metalness: 0.72,
    roughness: 0.34,
  });
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xafa5ff });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xb2bfff,
    transparent: true,
    opacity: 0.38,
  });
  scene.add(new THREE.AmbientLight(0xabbaff, 1.1));
  const blue = new THREE.PointLight(0x547cff, 42, 25);
  blue.position.set(-4, 3, 5);
  scene.add(blue);
  const violet = new THREE.PointLight(0xae72ff, 32, 25);
  violet.position.set(3, -1, 4);
  scene.add(violet);
  const key = new THREE.DirectionalLight(0xe9eaff, 3);
  key.position.set(1, 4, 6);
  scene.add(key);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const beam = (
    width: number,
    height: number,
    depth: number,
    material: THREE.Material = alloy,
  ) => {
    const mesh = new THREE.Mesh(box, material);
    mesh.scale.set(width, height, depth);
    return mesh;
  };
  const outline: [number, number][] = [
    [-2, 1.6],
    [-1.25, -1.6],
    [-0.7, -1.6],
    [0, 0.1],
    [0.7, -1.6],
    [1.25, -1.6],
    [2, 1.6],
    [1.35, 1.6],
    [0.85, -0.5],
    [0.23, 1.1],
    [-0.23, 1.1],
    [-0.85, -0.5],
    [-1.35, 1.6],
  ];
  let rear: THREE.Mesh | undefined;
  let sculpture: THREE.Mesh | undefined;
  const assembly: THREE.Mesh[] = [];
  let introStart = 0;
  let rotation = 0,
    tilt = 0,
    momentum = 0,
    dragging = false;
  let workPosition = 0;
  let completion = 1;
  let heroDepth = 0;
  const structures: THREE.Group[] = [];
  const fragments: THREE.Mesh[] = [];
  const browsers: THREE.Group[] = [];
  const screens: THREE.MeshBasicMaterial[] = [];
  const tones = [0x7392bb, 0x7458a1, 0x628fa0, 0xa48cba].map(
    (tone) => new THREE.Color(tone),
  );
  const servicePlanes: THREE.Mesh[] = [];
  const nodes: THREE.Mesh[] = [];
  let traveler: THREE.Mesh | undefined;
  let path: THREE.CatmullRomCurve3 | undefined;
  let fabric: THREE.ShaderMaterial | undefined;
  if (kind === "hero") {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) =>
      i ? shape.lineTo(x, y) : shape.moveTo(x, y),
    );
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.85,
      bevelEnabled: true,
      bevelSegments: mobile || software ? 2 : 4,
      bevelSize: 0.095,
      bevelThickness: 0.12,
      steps: 1,
    });
    geometry.center();
    const w = new THREE.Mesh(geometry, alloy);
    sculpture = w;
    group.add(w);
    w.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 28),
        edgeMaterial,
      ),
    );
    rear = new THREE.Mesh(geometry, dark);
    rear.position.set(0.17, 0.12, -0.7);
    group.add(rear);
    // Triangulate the actual custom W silhouette. Dimensional pieces converge
    // to their shared coordinates before the seamless beveled sculpture resolves.
    const points = outline.map(([x, y]) => new THREE.Vector2(x, y));
    THREE.ShapeUtils.triangulateShape(points, []).forEach((triangle, i) => {
      const piece = new THREE.Shape(triangle.map((index) => points[index]));
      const geo = new THREE.ExtrudeGeometry(piece, {
        depth: 0.85,
        bevelEnabled: false,
        steps: 1,
      });
      geo.translate(0, 0, -0.425);
      const fragment = new THREE.Mesh(geo, alloy);
      fragment.userData.origin = new THREE.Vector3(
        (i % 2 ? 1 : -1) * (1.4 + i * 0.12),
        ((i % 3) - 1) * 1.4,
        -1.5 - i * 0.12,
      );
      fragment.visible = false;
      assembly.push(fragment);
      group.add(fragment);
    });
    const contour = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 28),
      new THREE.LineBasicMaterial({
        color: 0x788dff,
        transparent: true,
        opacity: 0.45,
      }),
    );
    contour.position.set(-0.16, -0.12, -1.15);
    group.add(contour);
    for (let i = 0; i < 6; i++) {
      const f = beam(0.16, 0.6 + i * 0.1, 0.24);
      f.position.set(
        (i % 2 ? 1 : -1) * (2.25 + i * 0.1),
        (i - 2.5) * 0.38,
        -0.5 - i * 0.12,
      );
      f.rotation.z = i % 2 ? -0.35 : 0.35;
      fragments.push(f);
      group.add(f);
    }
    // Structural guides carry the W into the browser-plane visual language.
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(5.6 + i * 0.4, 4.1 + i * 0.3);
      const guide = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: 0x7474bd,
          transparent: true,
          opacity: 0.16 - i * 0.025,
        }),
      );
      guide.position.z = -1.6 - i * 0.6;
      group.add(guide);
      geo.dispose();
    }
    // Detached structural brackets occupy separate depth planes around the core.
    for (let i = 0; i < 3; i++) {
      const frame = new THREE.Group();
      const width = 1.6 + i * 0.25,
        height = 1 + i * 0.15;
      for (const sign of [-1, 1]) {
        const horizontal = beam(width, 0.055, 0.16, dark);
        horizontal.position.y = (sign * height) / 2;
        const vertical = beam(0.055, height, 0.16);
        vertical.position.x = (sign * width) / 2;
        frame.add(horizontal, vertical);
      }
      frame.position.set(
        i === 1 ? 2.15 : -2.15,
        i === 0 ? 1.25 : -1.3,
        i === 2 ? 1.1 : -1.8,
      );
      frame.rotation.set(0.2, i === 1 ? -0.65 : 0.6, i === 2 ? -0.32 : 0.18);
      frame.userData.base = frame.position.clone();
      structures.push(frame);
      group.add(frame);
    }
  }
  if (kind === "work") {
    const chassisMaterial = new THREE.MeshBasicMaterial({ color: 0x141827 });
    featuredProjects.forEach((project, index) => {
      const browser = new THREE.Group();
      browsers.push(browser);
      group.add(browser);
      const chassis = beam(6.8, 4.15, 0.22, chassisMaterial);
      browser.add(chassis);
      const rim = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(6.84, 4.19, 0.24)),
        edgeMaterial,
      );
      browser.add(rim);
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 620;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#12131e";
      ctx.fillRect(0, 0, 1024, 620);
      ctx.strokeStyle = "#454164";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 160, 0);
        ctx.lineTo(i * 160 - 100, 620);
        ctx.stroke();
      }
      ctx.fillStyle = "#a9a4d5";
      ctx.font = "20px monospace";
      ctx.fillText(
        project.image
          ? "LOADING PROJECT PREVIEW"
          : "CURRENTLY BUILDING / EDITORIAL WEBSITE",
        70,
        110,
      );
      ctx.fillStyle = "#f1edff";
      ctx.font = "68px sans-serif";
      ctx.fillText(project.name, 70, 310);
      ctx.fillStyle = "#a9a4d5";
      ctx.font = "22px monospace";
      ctx.fillText(
        project.image ? project.imageNote : "PROJECT PREVIEW TO FOLLOW",
        70,
        500,
      );
      const texture = new THREE.CanvasTexture(canvas);
      textures.add(texture);
      const surfaceMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        transparent: true,
      });
      screens.push(surfaceMaterial);
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(6.58, 3.77),
        surfaceMaterial,
      );
      surface.position.set(0, -0.07, 0.125);
      browser.add(surface);
      const bar = beam(6.58, 0.18, 0.02, chassisMaterial);
      bar.position.set(0, 1.91, 0.14);
      browser.add(bar);
      for (let dot = 0; dot < 3; dot++) {
        const node = new THREE.Mesh(
          new THREE.CircleGeometry(0.024, 8),
          lightMaterial,
        );
        node.position.set(-3.1 + dot * 0.1, 1.91, 0.158);
        browser.add(node);
      }
      browser.userData.index = index;
      browser.userData.load = () => {
        if (!project.image) return;
        const loaded = new THREE.TextureLoader().load(
          assetUrl(project.image),
          (map) => {
            if (disposed) {
              map.dispose();
              return;
            }
            map.colorSpace = THREE.SRGBColorSpace;
            map.anisotropy = Math.min(
              4,
              renderer.capabilities.getMaxAnisotropy(),
            );
            // Fit the capture to the screen, preserving its aspect ratio.
            const image = map.image as { width: number; height: number };
            const ratio = image.width / image.height / (6.58 / 3.77);
            if (ratio > 1) {
              map.repeat.x = 1 / ratio;
              map.offset.x = (1 - map.repeat.x) / 2;
            } else {
              map.repeat.y = ratio;
              map.offset.y = 1 - ratio;
            }
            surfaceMaterial.map = map;
            surfaceMaterial.needsUpdate = true;
            dirty = true;
            resume();
          },
          undefined,
          () => {
            /* The labelled preview remains; DOM content is independent. */
          },
        );
        textures.add(loaded);
      };
    });
  }
  if (kind === "services") {
    for (let i = 0; i < 7; i++) {
      const plane = beam(3.6, 2.2, 0.065, i % 2 ? dark : alloy);
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6, 2.2, 0.065)),
        edgeMaterial,
      );
      plane.add(frame); // Correct the edge scale inherited from the unit mesh.
      frame.scale.set(1 / 3.6, 1 / 2.2, 1 / 0.065);
      servicePlanes.push(plane);
      group.add(plane);
    }
  }
  if (kind === "process") {
    const points = [
      new THREE.Vector3(-2.6, 1.1, -0.4),
      new THREE.Vector3(-1.6, -1.1, 0.4),
      new THREE.Vector3(-0.55, 0.8, -0.2),
      new THREE.Vector3(0.55, -0.9, 0.3),
      new THREE.Vector3(1.6, 1.1, -0.4),
      new THREE.Vector3(2.7, -0.1, 0.1),
    ];
    path = new THREE.CatmullRomCurve3(points);
    group.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(path, mobile ? 48 : 96, 0.065, 8, false),
        alloy,
      ),
    );
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(path.getPoints(80)),
        edgeMaterial,
      ),
    );
    const nodeGeo = new THREE.IcosahedronGeometry(0.3, 0);
    points.forEach((point, i) => {
      const node = new THREE.Mesh(nodeGeo, alloy.clone());
      node.position.copy(point);
      nodes.push(node);
      group.add(node);
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.045, 6, mobile ? 20 : 32),
        dark,
      );
      collar.position.copy(point);
      collar.rotation.y = i % 2 ? 0.5 : -0.5;
      node.userData.collar = collar;
      group.add(collar);
      const plinth = beam(0.85, 0.11, 0.75, dark);
      plinth.position.copy(point).add(new THREE.Vector3(0, -0.55, -0.1));
      group.add(plinth);
    });
    traveler = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      lightMaterial,
    );
    group.add(traveler);
    for (let i = 0; i < 6; i++) {
      const f = beam(0.018, 1.6, 0.018, dark);
      f.position.set(points[i].x, 0, -0.65);
      group.add(f);
    }
  }
  if (kind === "fabric") {
    fabric = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uPointer: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uVelocity: { value: 0 },
      },
      vertexShader: `uniform vec2 uPointer; uniform float uTime; uniform float uProgress; uniform float uVelocity; varying vec2 vUv; varying float vLift;
      void main(){ vUv=uv; vec3 p=position; float d=distance(uv,uPointer*.25+.5); float lift=exp(-d*8.)*(.45+uVelocity*.2); p.z=lift+sin(p.x*1.4+uTime*.4)*.12+uProgress*.2*sin(p.y*2.); vLift=lift; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `varying vec2 vUv; varying float vLift; void main(){ vec2 grid=abs(fract(vUv*vec2(28.,18.)-.5)-.5)/fwidth(vUv*vec2(28.,18.)); float line=1.-min(min(grid.x,grid.y),1.); float fade=smoothstep(0.,.12,vUv.x)*smoothstep(0.,.12,1.-vUv.x)*smoothstep(0.,.12,vUv.y)*smoothstep(0.,.12,1.-vUv.y); gl_FragColor=vec4(mix(vec3(.24,.3,.55),vec3(.63,.51,1.),vLift*2.),line*fade*.65); }`,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 5, mobile ? 28 : 48, mobile ? 18 : 32),
      fabric,
    );
    mesh.rotation.x = -0.4;
    group.add(mesh);
  }
  let disposed = false,
    visible = false,
    frame = 0,
    previous = 0,
    dirty = true,
    settling = true,
    adaptive = false,
    restingQuality = false,
    lost = false;
  let scroll = 0,
    variant = 0,
    samples = 0,
    slowSamples = 0,
    draws = 0;
  const loaded = new Set<number>();
  const update = (time: number, delta: number) => {
    const rect = host.getBoundingClientRect();
    const progress = clamp(
      (innerHeight - rect.top) / (innerHeight + rect.height),
      0,
      1,
    );
    const targetVariant = Math.max(0, Number(host.dataset.active) || 0);
    settling =
      Math.abs(progress - scroll) > 0.0005 ||
      Math.abs(targetVariant - variant) > 0.001;
    const damping = 1 - Math.exp(-delta / 170);
    scroll = mix(scroll, progress, damping);
    variant = mix(variant, targetVariant, damping);
    const x = pointer.nx,
      y = pointer.ny;
    blue.position.x = -3 + x * 1.2;
    blue.position.y = 3 + y * 0.6;
    violet.position.x = 3 + x * 0.5;
    if (kind === "hero") {
      const opening = host.dataset.intro === "active";
      if (opening && !introStart) introStart = time;
      const phase = opening ? clamp((time - introStart) / 2050, 0, 1) : 1;
      const converge = 1 - Math.pow(1 - clamp(phase / 0.72, 0, 1), 3);
      if (!dragging) {
        rotation += momentum * delta;
        momentum *= Math.exp(-delta / 260);
        if (Math.abs(momentum) < 0.00001) momentum = 0;
      }
      const targetDepth = Number(
        host.closest(".hero")?.getAttribute("data-depth") || 0,
      );
      heroDepth = mix(heroDepth, targetDepth, damping);
      settling ||= Math.abs(heroDepth - targetDepth) > 0.0005;
      const exit = heroDepth;
      const targetCompletion = Number(host.dataset.progress ?? 1);
      completion = mix(completion, targetCompletion, damping);
      settling ||= Math.abs(completion - targetCompletion) > 0.0005;
      group.rotation.set(
        -0.18 - y * 0.12 + exit * 0.45 + tilt,
        -0.55 + x * 0.3 + exit * 1.7 + rotation + (1 - phase) * 1.4,
        -0.12 + x * 0.04 - exit * 0.3,
      );
      group.position.set(
        exit * 0.8,
        Math.sin(time * 0.0004) * 0.055 + exit * 0.9,
        exit * 1.3,
      );
      group.scale.setScalar(mobile ? 0.9 : 1.08);
      camera.position.z =
        Math.max(8.7, 5.5 / camera.aspect) - exit * 4.8 - (1 - phase) * 0.8;
      camera.position.x = x * 0.15 + exit * 0.45;
      camera.position.y = y * 0.1;
      structures.forEach((structure, i) => {
        structure.position.copy(structure.userData.base);
        structure.position.y += Math.sin(time * 0.0003 + i * 2) * 0.12;
        structure.rotation.y = (i === 1 ? -0.65 : 0.6) + x * 0.1 + exit * 0.6;
      });
      if (sculpture) sculpture.visible = phase >= 0.72;
      if (rear) {
        rear.position.z = -0.45 - completion * 0.4;
        rear.visible = phase > 0.72;
      }
      assembly.forEach((piece, i) => {
        piece.visible = phase < 0.72;
        piece.position.copy(piece.userData.origin).multiplyScalar(1 - converge);
        piece.rotation.set(
          (1 - converge) * 0.35,
          (1 - converge) * (i % 2 ? -0.6 : 0.6),
          (1 - converge) * (i % 2 ? -0.25 : 0.25),
        );
      });
      fragments.forEach((f, i) => {
        f.position.z = -0.6 - i * 0.15 - completion * 0.25;
        f.scale.y = (0.6 + i * 0.1) * (0.35 + completion * 0.65);
      });
      alloy.emissive.setHex(0x7360c5);
      alloy.emissiveIntensity = Math.sin(phase * Math.PI) * 0.22;
      violet.intensity = (22 + completion * 14) * (0.4 + phase * 0.6);
      key.position.x = opening ? -5 + phase * 10 : 1 + x * 1.5;
      if (!opening && !software && !adaptive)
        key.position.x += Math.sin(time * 0.0003) * 0.4;
      host.dataset.rotation = String(rotation);
      host.dataset.introPhase = String(phase);
      host.dataset.cameraDepth = String(exit);
    } else if (kind === "work") {
      const targetPosition = Number(
        host.closest(".work-stage")?.getAttribute("data-position") || 0,
      );
      workPosition = mix(
        workPosition,
        targetPosition,
        1 - Math.exp(-delta / 125),
      );
      settling ||= Math.abs(workPosition - targetPosition) > 0.0005;
      const value = workPosition;
      browsers.forEach((browser, i) => {
        const distance = i - value;
        screens[i].opacity = Math.max(0.48, 1 - Math.abs(distance) * 0.35);
        browser.position.set(
          distance * (mobile ? 4.9 : 5.35),
          0.12 + Math.abs(distance) * 0.18,
          -Math.abs(distance) * 3.7,
        );
        browser.rotation.set(
          -0.06 - y * 0.025,
          -0.035 - distance * 0.62 + x * 0.07,
          distance * -0.035,
        );
        browser.scale.setScalar(Math.max(0.7, 1 - Math.abs(distance) * 0.08));
        browser.visible = Math.abs(distance) < 2.6;
        if (Math.abs(distance) < 1.6 && !loaded.has(i)) {
          loaded.add(i);
          browser.userData.load();
        }
      });
      camera.position.set(
        x * 0.13,
        y * 0.1,
        Math.max(7.4, 11.2 / camera.aspect),
      );
      violet.color.lerp(tones[Math.min(3, Math.round(value))], damping);
      host.dataset.cameraPosition = String(value);
    } else if (kind === "services") {
      servicePlanes.forEach((plane, i) => {
        const offset = i - 3;
        const forms = [
          [
            offset * 0.06,
            offset * 0.12,
            offset * 0.24,
            -0.12,
            -0.35,
            offset * 0.012,
            3.6,
            2.2,
          ],
          [0, offset * 0.31, 0, -0.1, -0.28, 0, 3.8, 0.27],
          [
            ((i % 3) - 1) * 1.35,
            (Math.floor(i / 3) - 1) * 0.95,
            -Math.floor(i / 3) * 0.25,
            -0.12,
            -0.18,
            0,
            1.18,
            0.8,
          ],
          [
            offset * 0.36,
            Math.abs(offset) * -0.12,
            Math.abs(offset) * -0.35,
            -0.1,
            offset * 0.12,
            offset * 0.075,
            2.6,
            1.9,
          ],
          [
            offset * 0.4,
            Math.abs(offset % 2) * 0.5,
            offset * 0.08,
            -0.15,
            -0.28,
            offset % 2 ? -0.32 : 0.32,
            0.45,
            2.4,
          ],
          [
            offset * 0.28,
            offset * 0.22,
            -Math.abs(offset) * 0.4,
            -0.2,
            offset * 0.14,
            offset * 0.06,
            3.2,
            1.8,
          ],
        ];
        const a = forms[Math.floor(variant)] || forms[0],
          b = forms[Math.min(5, Math.ceil(variant))];
        const t = variant % 1;
        const values = a.map((v, index) => mix(v, b[index], t));
        plane.position.set(values[0], values[1], values[2]);
        plane.rotation.set(
          values[3] - y * 0.045,
          values[4] + x * 0.08,
          values[5],
        );
        plane.scale.set(values[6], values[7], 0.065);
      });
      group.rotation.set(-0.17 - y * 0.08, 0.22 + x * 0.12, -0.13);
      camera.position.z = Math.max(mobile ? 7.3 : 6.8, 3.1 / camera.aspect);
    } else if (kind === "process" && path && traveler) {
      const selected = variant / 5;
      traveler.position.copy(path.getPointAt(clamp(selected, 0, 1)));
      nodes.forEach((node, i) => {
        node.scale.setScalar(1 + Math.max(0, 1 - Math.abs(i - variant)) * 0.65);
        const material = node.material as THREE.MeshStandardMaterial;
        material.emissive.setHex(0x6b4cdd);
        material.emissiveIntensity =
          Math.max(0, 1 - Math.abs(i - variant)) * 0.7;
        const collar = node.userData.collar as THREE.Mesh;
        collar.rotation.x = 0.2 + variant * 0.15;
        collar.scale.setScalar(
          1 + Math.max(0, 1 - Math.abs(i - variant)) * 0.18,
        );
        collar.material = i <= Math.round(variant) ? lightMaterial : dark;
      });
      group.rotation.set(
        -0.22 - y * 0.05,
        -0.3 + selected * 0.55 + x * 0.1,
        -0.08,
      );
      group.position.x = 0.25 - selected * 0.5;
      camera.position.set(
        -0.45 + selected * 0.9,
        0.12 + selected * 0.2,
        Math.max(6.6, 3.7 / camera.aspect) -
          Math.sin(selected * Math.PI) * 0.45,
      );
      host.dataset.cameraPosition = String(variant);
    } else if (fabric) {
      fabric.uniforms.uPointer.value.set(x, y);
      fabric.uniforms.uTime.value = time * 0.001;
      fabric.uniforms.uProgress.value = scroll;
      fabric.uniforms.uVelocity.value = pointer.velocity;
      group.rotation.y = x * 0.04;
    }
  };
  const render = (time: number, delta = 16.7) => {
    if (disposed || lost) return;
    const diagnosticNow = diagnostics ? performance.now() : 0;
    update(time, delta);
    renderer.render(scene, camera);
    recordFrame(
      diagnostics,
      renderer,
      diagnosticTime === undefined ? undefined : diagnosticNow - diagnosticTime,
    );
    diagnosticTime = diagnosticNow;
    if (diagnostics) diagnostics.quality = host.dataset.quality || "unknown";
    host.dataset.frames = String(++draws);
    host.dataset.dpr = String(dpr);
    dirty = false;
  };
  let previousWidth = 0,
    previousHeight = 0;
  const resize = () => {
    if (disposed || !host.clientWidth || !host.clientHeight) return;
    mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    dpr = Math.min(devicePixelRatio, adaptive ? 1 : mobile ? 1.15 : 1.5);
    // Software devices render interaction at a lower fill rate, then resolve
    // one sharper still frame once damping stops. Idle scenes never keep looping.
    const budget =
      software && restingQuality
        ? 900000
        : adaptive
          ? software
            ? 180000
            : 500000
          : software
            ? 350000
            : mobile
              ? 700000
              : 1600000;
    dpr = Math.min(
      dpr,
      Math.sqrt(budget / (host.clientWidth * host.clientHeight)),
    );
    if (
      previousWidth === host.clientWidth &&
      previousHeight === host.clientHeight &&
      renderer.getPixelRatio() === dpr
    )
      return;
    previousWidth = host.clientWidth;
    previousHeight = host.clientHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    dirty = true;
    if (visible && !document.hidden) render(performance.now());
  };
  const animate = (time: number) => {
    frame = 0;
    if (!visible || document.hidden || disposed || lost) return;
    const continuous =
      (kind === "hero" &&
        (host.dataset.intro === "active" ||
          momentum !== 0 ||
          dragging ||
          (!!host.closest(".hero") && !software && !adaptive))) ||
      (kind === "fabric" && !software && !adaptive);
    if (!continuous && !dirty && !settling) {
      if (software && !restingQuality) {
        restingQuality = true;
        resize();
        host.dataset.quality = "software-still";
      }
      return;
    }
    const delta = previous ? Math.min(time - previous, 100) : 16.7;
    previous = time;
    render(time, delta);
    if (++samples <= 30 && delta > 30) slowSamples++;
    if (samples === 30 && slowSamples > 18) {
      adaptive = true;
      resize();
      host.dataset.quality = "adaptive";
    }
    frame = requestAnimationFrame(animate);
  };
  const resume = () => {
    if (!frame && visible && !document.hidden && !disposed && !lost) {
      previous = 0;
      if (dirty) render(performance.now());
      frame = requestAnimationFrame(animate);
    }
  };
  let pointerX = 0,
    pointerY = 0;
  const unsubscribe = subscribePointer((state) => {
    if (
      Math.abs(state.nx - pointerX) + Math.abs(state.ny - pointerY) >
      0.0005
    ) {
      pointerX = state.nx;
      pointerY = state.ny;
      if (restingQuality) {
        restingQuality = false;
        resize();
      }
      dirty = true;
      resume();
    }
  });
  const scrollWake = () => {
    if (restingQuality) {
      restingQuality = false;
      resize();
    }
    dirty = true;
    resume();
  };
  const dragSurface =
    kind === "hero" ? host.closest<HTMLElement>(".core") : null;
  const stopDrag = dragSurface
    ? horizontalDrag(dragSurface, {
        start: () => {
          dragging = true;
          momentum = 0;
        },
        move: (dx, dy, dt) => {
          const sensitivity =
            (Math.PI * 2) / Math.max(300, dragSurface.clientWidth * 0.85);
          rotation += dx * sensitivity;
          tilt = clamp(tilt + dy * 0.003, -0.8, 0.8);
          momentum = clamp((dx * sensitivity) / dt, -0.025, 0.025);
          scrollWake();
        },
        end: (cancelled) => {
          dragging = false;
          if (cancelled) momentum = 0;
          scrollWake();
        },
      })
    : undefined;
  const turn = (event: Event) => {
    const amount = (event as CustomEvent<number>).detail;
    momentum = 0;
    if (amount === 0) {
      rotation = 0;
      tilt = 0;
    } else momentum = amount / 260;
    scrollWake();
  };
  dragSurface?.addEventListener("core-turn", turn);
  const stateObserver = new MutationObserver(scrollWake);
  stateObserver.observe(host, {
    attributes: true,
    attributeFilter: ["data-active", "data-progress", "data-intro"],
  });
  const hero = host.closest(".hero");
  if (hero)
    stateObserver.observe(hero, {
      attributes: true,
      attributeFilter: ["data-depth"],
    });
  const workStage = host.closest(".work-stage");
  if (workStage)
    stateObserver.observe(workStage, {
      attributes: true,
      attributeFilter: ["data-position"],
    });
  window.addEventListener("scroll", scrollWake, { passive: true });
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else resume();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (diagnostics) diagnostics.visible = visible;
    if (visible) resume();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    recordEvent(diagnostics, "context-lost");
    visible = false;
    cancelAnimationFrame(frame);
    frame = 0;
    renderer.domElement.style.display = "none";
    onReady(false);
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  document.addEventListener("visibilitychange", visibility);
  resize();
  visible = true;
  render(performance.now());
  onReady(true);
  resume();
  return () => {
    disposed = true;
    if (diagnostics) diagnostics.active = false;
    recordEvent(diagnostics, "disposed");
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    stateObserver.disconnect();
    unsubscribe();
    stopDrag?.();
    dragSurface?.removeEventListener("core-turn", turn);
    window.removeEventListener("scroll", scrollWake);
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    const geometries = new Set<THREE.BufferGeometry>([box]);
    const materials = new Set<THREE.Material>([
      alloy,
      dark,
      lightMaterial,
      edgeMaterial,
    ]);
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh.material)
        (Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        ).forEach((material) => materials.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    scene.environment = null;
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
