import * as THREE from "three/src/Three.js";
/** Original opaque studio: dark walls, soft neutral cards and narrow blue/violet strips. */
export function createStudioEnvironment(
  profile: "studio" | "impression" = "studio",
) {
  const neutral = profile === "impression";
  const faces = Array.from({ length: 6 }, (_, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Studio environment unavailable");
    const gradient = context.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, neutral ? "#302e29" : "#10141e");
    gradient.addColorStop(
      0.5,
      neutral
        ? i === 2
          ? "#b3ad9f"
          : "#59574f"
        : i === 2
          ? "#555f73"
          : "#222a3c",
    );
    gradient.addColorStop(1, neutral ? "#171715" : "#080a10");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    // Generated softboxes, never downloaded HDRs. A dark gap keeps reflections dimensional.
    const card = context.createLinearGradient(12, 0, 94, 0);
    card.addColorStop(0, neutral ? "#292822" : "#111827");
    card.addColorStop(
      0.28,
      neutral ? "#fff3dc" : i === 1 ? "#566bc4" : "#dce5f2",
    );
    card.addColorStop(
      0.65,
      neutral ? "#d4d0c5" : i === 4 ? "#8c78bb" : "#a8b9d4",
    );
    card.addColorStop(1, neutral ? "#34332d" : "#121827");
    context.fillStyle = card;
    if (i !== 3) context.fillRect(12 + i * 4, 12, i === 2 ? 88 : 38, 102);
    context.fillStyle = neutral ? "#f0eadc" : i % 2 ? "#9b83c7" : "#6389d2";
    if (i !== 3) context.fillRect(102, 10, 3, 106);
    return canvas;
  });
  const environment = new THREE.CubeTexture(faces);
  environment.colorSpace = THREE.SRGBColorSpace;
  environment.needsUpdate = true;
  return environment;
}
