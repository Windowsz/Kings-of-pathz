import * as THREE from 'three';
import { GameScene } from '@/game/scenes/GameScene';
import { GameManager } from '@/game/managers/GameManager';
import { AssetManager } from '@/game/utils/AssetManager';
import { DeviceDetector } from '@/game/utils/DeviceDetector';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private gameManager: GameManager | null = null;
  private container: HTMLElement;
  private isMobile: boolean;

  constructor(container: HTMLElement) {
    this.container = container;
    this.isMobile = DeviceDetector.isMobileDevice();

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

    new GameScene(this.scene, this.camera);
    // the first-person weapon is parented to the camera, so the camera must be
    // part of the scene graph for it to render
    this.scene.add(this.camera);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  public async start(): Promise<void> {
    await AssetManager.preload((fraction) => this.setLoadingProgress(fraction));
    this.hideLoading();

    this.gameManager = new GameManager(this.scene, this.camera, this.isMobile);
    this.animate();
  }

  private setLoadingProgress(fraction: number): void {
    const bar = document.getElementById('loading-bar');
    if (bar) bar.style.width = `${Math.round(fraction * 100)}%`;
  }

  private hideLoading(): void {
    const overlay = document.getElementById('loading');
    if (overlay) overlay.classList.add('hidden');
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.gameManager?.update();
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
