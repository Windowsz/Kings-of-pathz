import * as THREE from 'three';
import { Player } from '@/game/entities/Player';

export class DesktopControls {
  private camera: THREE.PerspectiveCamera;
  private player: Player;
  private container: HTMLElement | null;
  private pressed = new Set<string>();

  constructor(camera: THREE.PerspectiveCamera, player: Player) {
    this.camera = camera;
    this.player = player;
    this.container = document.getElementById('canvas-container');
    this.setupControls();
  }

  private setupControls(): void {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.innerHTML =
        'Click to lock mouse • WASD move • Click attack<br><small>1-4 weapon · Q/E/R ability · Space special · F enhance · I stats</small>';
    }

    if (this.container) {
      this.container.addEventListener('click', () => this.container?.requestPointerLock());
    }

    document.addEventListener('keydown', (e) => this.handleKey(e.code, true));
    document.addEventListener('keyup', (e) => this.handleKey(e.code, false));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mousedown', () => this.handleMouseDown());
  }

  private handleKey(code: string, down: boolean): void {
    if (code !== 'KeyW' && code !== 'KeyA' && code !== 'KeyS' && code !== 'KeyD') return;
    if (down) this.pressed.add(code);
    else this.pressed.delete(code);

    this.player.setMoveInput(
      Number(this.pressed.has('KeyD')) - Number(this.pressed.has('KeyA')),
      Number(this.pressed.has('KeyW')) - Number(this.pressed.has('KeyS'))
    );
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
    // input handled via events
  }
}
