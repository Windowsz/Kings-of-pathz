import * as THREE from 'three';
import { PALETTE, GAME_CONFIG } from '@/game/utils/Constants';
import { toonMaterial } from '@/game/utils/Render';

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.setupScene();
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color(PALETTE.bg);
    this.scene.fog = new THREE.FogExp2(PALETTE.fog, 0.035);
    this.setupLighting();
    this.createTerrain();
  }

  private setupLighting(): void {
    // soft cozy fill from sky + ground
    const hemi = new THREE.HemisphereLight(PALETTE.bg, PALETTE.skyGround, 1.0);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(PALETTE.light, 1.0);
    sun.position.set(18, 36, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const cam = sun.shadow.camera as THREE.OrthographicCamera;
    cam.left = -40;
    cam.right = 40;
    cam.top = 40;
    cam.bottom = -40;
    cam.near = 1;
    cam.far = 120;
    this.scene.add(sun);
  }

  private createTerrain(): void {
    const geometry = new THREE.PlaneGeometry(
      GAME_CONFIG.TERRAIN_SIZE,
      GAME_CONFIG.TERRAIN_SIZE,
      GAME_CONFIG.TERRAIN_SEGMENTS,
      GAME_CONFIG.TERRAIN_SEGMENTS
    );
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      if (Math.abs(x) > 6 || Math.abs(z) > 6) {
        const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.5;
        position.setY(i, y);
      }
    }
    geometry.computeVertexNormals();

    const material = toonMaterial({ color: PALETTE.ground });
    const ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }
}
