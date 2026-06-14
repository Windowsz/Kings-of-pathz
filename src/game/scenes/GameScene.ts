import * as THREE from 'three';
import { PALETTE } from '@/game/utils/Constants';

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
    this.scene.fog = new THREE.FogExp2(PALETTE.fog, 0.05);
    this.setupLighting();
    this.createTerrain();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(PALETTE.ambient, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(PALETTE.light, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1048;
    dirLight.shadow.mapSize.height = 1048;
    this.scene.add(dirLight);
  }

  private createTerrain(): void {
    const geometry = new THREE.PlaneGeometry(100, 100, 24, 24);
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.5;
        position.setY(i, y);
      }
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: PALETTE.ground,
      flatShading: true,
      roughness: 0.8,
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }
}
