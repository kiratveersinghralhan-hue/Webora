let supported: boolean | undefined;

/**
 * Probes for WebGL2 (the only context three r163+ can use) before a renderer
 * is constructed, so unsupported browsers reach the SVG fallback without
 * three logging a context-creation error. The probe context is released
 * immediately and the answer cached, to stay within browser context limits.
 */
export function supportsWebGL() {
  if (supported !== undefined) return supported;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    supported = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supported = false;
  }
  return supported;
}
