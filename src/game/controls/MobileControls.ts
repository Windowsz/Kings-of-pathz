import * as THREE from 'three';
import { Player } from '@/game/entities/Player';

export class MobileControls {
  private camera: THREE.PerspectiveCamera;
  private player: Player;
  private moveTouchId: number | null = null;
  private lookTouchId: number | null = null;
  private moveStart = { x: 0, y: 0 };
  private lookLast = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, player: Player) {
    this.camera = camera;
    this.player = player;
    this.setupMobileUI();
  }

  private setupMobileUI(): void {
    const touchZones = document.getElementById('mobile-touch-zones');
    const attackBtn = document.getElementById('attack-btn');
    const instructionsElement = document.getElementById('instructions');

    if (touchZones) touchZones.style.display = 'block';
    if (attackBtn) attackBtn.style.display = 'flex';
    if (instructionsElement) instructionsElement.innerText = 'Left side to Move. Right side to Look.';

    this.setupMoveZone();
    this.setupLookZone();
    this.setupAttackButton();
  }

  private setupMoveZone(): void {
    const moveZone = document.getElementById('move-zone');
    if (!moveZone) return;

    moveZone.addEventListener('touchstart', (e) => this.handleMoveTouchStart(e));
    moveZone.addEventListener('touchmove', (e) => this.handleMoveTouchMove(e));
    moveZone.addEventListener('touchend', (e) => this.handleMoveTouchEnd(e));
  }

  private setupLookZone(): void {
    const lookZone = document.getElementById('look-zone');
    if (!lookZone) return;

    lookZone.addEventListener('touchstart', (e) => this.handleLookTouchStart(e));
    lookZone.addEventListener('touchmove', (e) => this.handleLookTouchMove(e));
    lookZone.addEventListener('touchend', (e) => this.handleLookTouchEnd(e));
  }

  private setupAttackButton(): void {
    const attackBtn = document.getElementById('attack-btn');
    if (!attackBtn) return;

    attackBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.player.attack();
    });
  }

  private handleMoveTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.moveTouchId !== null) return;
    const touch = e.changedTouches[0];
    this.moveTouchId = touch.identifier;
    this.moveStart = { x: touch.clientX, y: touch.clientY };
  }

  private handleMoveTouchMove(e: TouchEvent): void {
    e.preventDefault();
    for (let touch of e.changedTouches) {
      if (touch.identifier === this.moveTouchId) {
        const dx = touch.clientX - this.moveStart.x;
        const dy = touch.clientY - this.moveStart.y;
        this.player.setMovement(dy < -20, dy > 20, dx < -20, dx > 20);
      }
    }
  }

  private handleMoveTouchEnd(e: TouchEvent): void {
    for (let touch of e.changedTouches) {
      if (touch.identifier === this.moveTouchId) {
        this.moveTouchId = null;
        this.player.setMovement(false, false, false, false);
      }
    }
  }

  private handleLookTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.lookTouchId !== null) return;
    const touch = e.changedTouches[0];
    this.lookTouchId = touch.identifier;
    this.lookLast = { x: touch.clientX, y: touch.clientY };
  }

  private handleLookTouchMove(e: TouchEvent): void {
    e.preventDefault();
    for (let touch of e.changedTouches) {
      if (touch.identifier === this.lookTouchId) {
        const dx = touch.clientX - this.lookLast.x;
        const dy = touch.clientY - this.lookLast.y;
        this.camera.rotation.y -= dx * 0.005;
        this.camera.rotation.x -= dy * 0.005;
        this.camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.rotation.x));
        this.lookLast = { x: touch.clientX, y: touch.clientY };
      }
    }
  }

  private handleLookTouchEnd(e: TouchEvent): void {
    for (let touch of e.changedTouches) {
      if (touch.identifier === this.lookTouchId) this.lookTouchId = null;
    }
  }

  public update(_delta: number): void {
    // Update logic handled by event listeners
  }
}
