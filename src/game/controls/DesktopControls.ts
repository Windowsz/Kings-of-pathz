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
      instructionsElement.innerText = 'Click Screen to Lock Mouse. WASD to Move. Click to Attack.';
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
    const keyMap: { [key: string]: (v: boolean) => void } = {
      KeyW: (v) => this.player.setMovement(v, false, false, false),
      KeyA: (v) => this.player.setMovement(false, false, v, false),
      KeyS: (v) => this.player.setMovement(false, v, false, false),
      KeyD: (v) => this.player.setMovement(false, false, false, v),
    };

    if (keyMap[e.code]) {
      e.preventDefault();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    // Reset movement flags
  }

  private handleMouseMove(e: MouseEvent): void {
    if (document.pointerLockElement !== this.container) return;
    this.camera.rotation.y -= e.movementX * 0.002;
    this.camera.rotation.x -= e.movementY * 0.002;
    this.camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.rotation.x));
  }

  private handleMouseDown(): void {
    if (document.pointerLockElement === this.container) {
      this.player.attack();
    }
  }

  public update(_delta: number): void {
    // Update logic handled by event listeners
  }
}
