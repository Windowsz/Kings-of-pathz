import * as THREE from 'three';
import { EntityManager } from '@/game/managers/EntityManager';
import { ScoreManager } from '@/game/managers/ScoreManager';
import { DesktopControls } from '@/game/controls/DesktopControls';
import { MobileControls } from '@/game/controls/MobileControls';
import { Player } from '@/game/entities/Player';

export class GameManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private entityManager: EntityManager;
  private scoreManager: ScoreManager;
  private controls: DesktopControls | MobileControls;
  private player: Player;
  private prevTime: number = performance.now();
  private isMobile: boolean;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.isMobile = isMobile;

    this.entityManager = new EntityManager(scene);
    this.scoreManager = new ScoreManager();
    this.player = new Player(camera);

    if (isMobile) {
      this.controls = new MobileControls(camera, this.player);
    } else {
      this.controls = new DesktopControls(camera, this.player);
    }

    this.entityManager.spawnInitialMonsters(5);
  }

  public update(): void {
    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;

    this.controls.update(delta);
    this.player.update(delta);
    this.entityManager.update(delta, this.camera);

    this.prevTime = time;
  }
}
