import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { applyToon } from '@/game/utils/Render';
import { ENEMY_TYPES, GAME_CONFIG, EnemyConfig } from '@/game/utils/Constants';

interface Template {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
  scale: number;
  yOffset: number;
  tint?: number;
}

export interface ModelInstance {
  /** outer group positioned in the world; faces the player via lookAt */
  root: THREE.Group;
  mixer: THREE.AnimationMixer;
  animations: THREE.AnimationClip[];
}

/**
 * Loads and caches GLTF character models once, then hands out independent
 * skinned clones (each with its own skeleton + AnimationMixer).
 */
export class AssetManager {
  private static templates = new Map<string, Template>();
  private static loaded = false;

  static async preload(onProgress?: (fraction: number) => void): Promise<void> {
    if (this.loaded) return;
    const loader = new GLTFLoader();
    let done = 0;

    await Promise.all(
      ENEMY_TYPES.map(async (cfg: EnemyConfig) => {
        const gltf = await loader.loadAsync(cfg.model);
        const scene = gltf.scene;

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const height = size.y || 1;
        const scale = GAME_CONFIG.TARGET_ENEMY_HEIGHT / height;
        const yOffset = -box.min.y * scale;

        this.templates.set(cfg.key, {
          scene,
          animations: gltf.animations,
          scale,
          yOffset,
          tint: cfg.tint,
        });

        done += 1;
        onProgress?.(done / ENEMY_TYPES.length);
      })
    );

    this.loaded = true;
  }

  static isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Some GLTF clips target nodes by UUID (unnamed nodes). SkeletonUtils.clone
   * gives clones new UUIDs, breaking those bindings. We walk the original and
   * clone trees in lockstep (clone preserves order) and name each cloned node
   * after the original's name-or-UUID so the shared clips still bind.
   */
  private static rebindAnimationNames(original: THREE.Object3D, clone: THREE.Object3D): void {
    const origNodes: THREE.Object3D[] = [];
    const cloneNodes: THREE.Object3D[] = [];
    original.traverse((n) => origNodes.push(n));
    clone.traverse((n) => cloneNodes.push(n));
    for (let i = 0; i < cloneNodes.length; i++) {
      const orig = origNodes[i];
      if (!orig) continue;
      cloneNodes[i].name = orig.name && orig.name.length > 0 ? orig.name : orig.uuid;
    }
  }

  /** Build a fresh, independently-animatable instance of a model. */
  static createInstance(key: string, facingOffset = 0): ModelInstance | null {
    const tpl = this.templates.get(key);
    if (!tpl) return null;

    const model = cloneSkinned(tpl.scene) as THREE.Object3D;
    this.rebindAnimationNames(tpl.scene, model);
    model.scale.setScalar(tpl.scale);
    model.position.y = tpl.yOffset;
    model.rotation.y = facingOffset;
    applyToon(model, tpl.tint);

    const root = new THREE.Group();
    root.add(model);

    const mixer = new THREE.AnimationMixer(model);

    return { root, mixer, animations: tpl.animations };
  }
}
