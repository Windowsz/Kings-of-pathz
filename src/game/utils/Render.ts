import * as THREE from 'three';
import { GAME_CONFIG, PALETTE } from '@/game/utils/Constants';

let gradient: THREE.DataTexture | null = null;

/** A small stepped gradient used by every MeshToonMaterial to get cel-shaded banding. */
export function getToonGradient(): THREE.DataTexture {
  if (gradient) return gradient;
  const steps = new Uint8Array([140, 185, 220, 255]);
  const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  gradient = tex;
  return tex;
}

export function toonMaterial(
  params: THREE.MeshToonMaterialParameters = {}
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ gradientMap: getToonGradient(), ...params });
}

/**
 * Prepares a loaded model for the scene: enables shadows and gives untextured
 * meshes a cel-shaded toon material. Textured meshes keep their original
 * material so their baked texture (e.g. fur) still shows, only converting to a
 * flat toon look when an explicit `tint` is requested.
 */
export function applyToon(root: THREE.Object3D, tint?: number): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const keepTextured = (m: THREE.Material): boolean =>
      tint === undefined && !!(m as THREE.MeshStandardMaterial).map;

    const convert = (src: THREE.Material): THREE.Material => {
      if (keepTextured(src)) return src;
      const std = src as THREE.MeshStandardMaterial;
      return new THREE.MeshToonMaterial({
        color: tint !== undefined ? tint : std.color ? std.color.getHex() : 0xffffff,
        map: std.map ?? null,
        gradientMap: getToonGradient(),
        emissive: std.emissive ? std.emissive.getHex() : 0x000000,
        emissiveIntensity: std.emissiveIntensity ?? 1,
        transparent: std.transparent,
        opacity: std.opacity ?? 1,
      });
    };

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(convert);
    } else if (mesh.material) {
      mesh.material = convert(mesh.material);
    }
  });
}

/**
 * Cheap cel outline for static (non-skinned) meshes: a back-side, slightly inflated
 * copy. Returns a child mesh you can add next to the original.
 */
export function makeOutline(mesh: THREE.Mesh): THREE.Mesh {
  const outline = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color: PALETTE.outline, side: THREE.BackSide })
  );
  outline.position.copy(mesh.position);
  outline.rotation.copy(mesh.rotation);
  outline.scale.copy(mesh.scale).multiplyScalar(1 + GAME_CONFIG.OUTLINE_THICKNESS);
  return outline;
}

/** Add outlines to every static mesh inside a group (used for the held weapon). */
export function outlineGroup(group: THREE.Group): void {
  if (!GAME_CONFIG.OUTLINE_ENABLED) return;
  const meshes: THREE.Mesh[] = [];
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if ((mesh as unknown as { isMesh?: boolean }).isMesh && !(mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      meshes.push(mesh);
    }
  });
  for (const mesh of meshes) {
    if (mesh.parent) mesh.parent.add(makeOutline(mesh));
  }
}
