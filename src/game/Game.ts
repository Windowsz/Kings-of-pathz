import * as THREE from 'three';
import { GameScene } from '@/game/scenes/GameScene';
import { GameManager } from '@/game/managers/GameManager';
import { DeviceDetector } from '@/game/utils/DeviceDetector';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private gameManager: GameManager;
  private gameScene: GameScene;
  private container: HTMLElement;
  private isMobile: boolean;

  constructor(container: HTMLElement) {
    this.container = container;
    this.isMobile = DeviceDetector.isMobileDevice();

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.y = 2;
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Initialize game components
    this.gameScene = new GameScene(this.scene, this.camera);
    this.gameManager = new GameManager(this.scene, this.camera, this.isMobile);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  public start(): void {
    this.animate();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.gameManager.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
