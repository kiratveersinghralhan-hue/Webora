import * as THREE from "three/src/Three.js";

/**
 * Product-photography studio for polished metal: near-black walls so the
 * sculpture keeps depth, one broad overhead softbox, tall strip lights at the
 * sides and a warm rim card behind. Faces: +x, -x, +y, -y, +z, -z.
 */
function createImpressionEnvironment() {
  const size = 256;
  const faces = Array.from({ length: 6 }, (_, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Studio environment unavailable");
    const wall = context.createLinearGradient(0, 0, 0, size);
    wall.addColorStop(0, i === 3 ? "#2e2c27" : "#34322d");
    wall.addColorStop(1, i === 3 ? "#5e5a50" : "#161513");
    context.fillStyle = wall;
    context.fillRect(0, 0, size, size);
    const softbox = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      feather = 0.18,
    ) => {
      const g = context.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(feather, color);
      g.addColorStop(1 - feather, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = g;
      context.fillRect(x, y, w, h);
    };
    if (i === 2) {
      // Overhead: the broad key that paints the top bevels and folded faces.
      const g = context.createRadialGradient(128, 128, 10, 128, 128, 120);
      g.addColorStop(0, "#fff8ec");
      g.addColorStop(0.55, "#e9e1d1");
      g.addColorStop(1, "#1b1a17");
      context.fillStyle = g;
      context.fillRect(0, 0, size, size);
    }
    if (i === 0) softbox(40, 18, 56, 220, "#f3eee4");
    if (i === 1) {
      softbox(150, 18, 40, 220, "#fff1d8");
      softbox(40, 60, 18, 150, "#8e8678", 0.3);
    }
    if (i === 4) {
      // Behind the viewer: a low, wide fill that keeps the faces readable.
      softbox(36, 150, 184, 70, "#b9b2a4", 0.25);
      softbox(196, 30, 14, 190, "#f6efe1", 0.3);
    }
    if (i === 5) softbox(18, 40, 30, 180, "#e2a46a", 0.3); // Warm rim card.
    return canvas;
  });
  const environment = new THREE.CubeTexture(faces);
  environment.colorSpace = THREE.SRGBColorSpace;
  environment.needsUpdate = true;
  return environment;
}

/** Original opaque studio: dark walls, soft neutral cards and narrow blue/violet strips. */
export function createStudioEnvironment(
  profile: "studio" | "impression" = "studio",
) {
  if (profile === "impression") return createImpressionEnvironment();
  const faces = Array.from({ length: 6 }, (_, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Studio environment unavailable");
    const gradient = context.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, "#10141e");
    gradient.addColorStop(0.5, i === 2 ? "#555f73" : "#222a3c");
    gradient.addColorStop(1, "#080a10");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    // Generated softboxes, never downloaded HDRs. A dark gap keeps reflections dimensional.
    const card = context.createLinearGradient(12, 0, 94, 0);
    card.addColorStop(0, "#111827");
    card.addColorStop(0.28, i === 1 ? "#566bc4" : "#dce5f2");
    card.addColorStop(0.65, i === 4 ? "#8c78bb" : "#a8b9d4");
    card.addColorStop(1, "#121827");
    context.fillStyle = card;
    if (i !== 3) context.fillRect(12 + i * 4, 12, i === 2 ? 88 : 38, 102);
    context.fillStyle = i % 2 ? "#9b83c7" : "#6389d2";
    if (i !== 3) context.fillRect(102, 10, 3, 106);
    return canvas;
  });
  const environment = new THREE.CubeTexture(faces);
  environment.colorSpace = THREE.SRGBColorSpace;
  environment.needsUpdate = true;
  return environment;
}
