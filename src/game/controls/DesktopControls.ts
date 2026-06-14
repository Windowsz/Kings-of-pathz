import * as THREE from 'three';
import { Player } from '@/game/entities/Player';

export class DesktopControls {
  private camera: THREE.PerspectiveCamera;
  private player: Player;
  private container: HTMLElement | null;

  constructor(camera: THREE.PerspectiveCamera, player: Player) {
    this.camera = camera;
    this.player = player;
    this.container = document.getElementById('canvas-container');
    this.setupControls();
  }

  private setupControls(): void {
    const instructionsElement = document.getElementById('instructions');
    if (instructionsElement) {
      instructionsElement.innerHTML = `Click to Lock Mouse. WASD to Move. Click to Attack.<br><small>1-4: Weapon | Q/W/R: Abilities | SPACE: Activate Ability | I: Stats | E: Enhance</small>`;
    }

    if (this.container) {
      this.container.addEventListener('click', () => {
        this.container?.requestPointerLock();
      });
    }

    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mousedown', () => this.handleMouseDown());
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
        this.player.setMovement(true, false, false, false);
        break;
      case 'KeyS':
        this.player.setMovement(false, true, false, false);
        break;
      case 'KeyA':
        this.player.setMovement(false, false, true, false);
        break;
      case 'KeyD':
        this.player.setMovement(false, false, false, true);
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
      case 'KeyS':
      case 'KeyA':
      case 'KeyD':
        this.player.setMovement(false, false, false, false);
        break;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (document.pointerLockElement !== this.container) return;
    this.camera.rotation.y -= e.movementX * 0.002;
    this.camera.rotation.x -= e.movementY * 0.002;
    this.camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.rotation.x));
  }

  private handleMouseDown(): void {
    if (document.pointerLockElement === this.container) {
      // Attack handled by GameManager
    }
  }

  public update(_delta: number): void {
    // Update logic handled by event listeners
  }
}
