import * as THREE from 'three';
import { Player } from '@/game/entities/Player';

const JOYSTICK_RADIUS = 55; // px the thumb can travel from the base

export class MobileControls {
  private camera: THREE.PerspectiveCamera;
  private player: Player;

  private moveTouchId: number | null = null;
  private moveBase = { x: 0, y: 0 };
  private knob: HTMLElement | null;
  private base: HTMLElement | null;

  private lookTouchId: number | null = null;
  private lookLast = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, player: Player) {
    this.camera = camera;
    this.player = player;
    this.knob = document.getElementById('joystick-knob');
    this.base = document.getElementById('joystick-base');
    this.setup();
  }

  private setup(): void {
    const zones = document.getElementById('mobile-touch-zones');
    if (zones) zones.style.display = 'block';
    const instructions = document.getElementById('instructions');
    if (instructions) instructions.innerText = 'Left thumb to move • Right side to look';

    const moveZone = document.getElementById('move-zone');
    moveZone?.addEventListener('touchstart', (e) => this.moveStart(e), { passive: false });
    moveZone?.addEventListener('touchmove', (e) => this.moveMove(e), { passive: false });
    moveZone?.addEventListener('touchend', (e) => this.moveEnd(e));
    moveZone?.addEventListener('touchcancel', (e) => this.moveEnd(e));

    const lookZone = document.getElementById('look-zone');
    lookZone?.addEventListener('touchstart', (e) => this.lookStart(e), { passive: false });
    lookZone?.addEventListener('touchmove', (e) => this.lookMove(e), { passive: false });
    lookZone?.addEventListener('touchend', (e) => this.lookEnd(e));
    lookZone?.addEventListener('touchcancel', (e) => this.lookEnd(e));
  }

  private showJoystick(x: number, y: number): void {
    if (this.base) {
      this.base.style.display = 'block';
      this.base.style.left = `${x}px`;
      this.base.style.top = `${y}px`;
    }
    this.moveKnob(0, 0);
  }

  private moveKnob(dx: number, dy: number): void {
    if (this.knob) this.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  private hideJoystick(): void {
    if (this.base) this.base.style.display = 'none';
  }

  private moveStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.moveTouchId !== null) return;
    const touch = e.changedTouches[0];
    this.moveTouchId = touch.identifier;
    this.moveBase = { x: touch.clientX, y: touch.clientY };
    this.showJoystick(touch.clientX, touch.clientY);
  }

  private moveMove(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier !== this.moveTouchId) continue;
      let dx = touch.clientX - this.moveBase.x;
      let dy = touch.clientY - this.moveBase.y;
      const len = Math.hypot(dx, dy);
      if (len > JOYSTICK_RADIUS) {
        dx = (dx / len) * JOYSTICK_RADIUS;
        dy = (dy / len) * JOYSTICK_RADIUS;
      }
      this.moveKnob(dx, dy);
      // screen-down (positive dy) = move backward, so invert y
      this.player.setMoveInput(dx / JOYSTICK_RADIUS, -dy / JOYSTICK_RADIUS);
    }
  }

  private moveEnd(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier !== this.moveTouchId) continue;
      this.moveTouchId = null;
      this.player.setMoveInput(0, 0);
      this.hideJoystick();
    }
  }

  private lookStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.lookTouchId !== null) return;
    const touch = e.changedTouches[0];
    this.lookTouchId = touch.identifier;
    this.lookLast = { x: touch.clientX, y: touch.clientY };
  }

  private lookMove(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier !== this.lookTouchId) continue;
      const dx = touch.clientX - this.lookLast.x;
      const dy = touch.clientY - this.lookLast.y;
      this.camera.rotation.y -= dx * 0.005;
      this.camera.rotation.x -= dy * 0.005;
      this.camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.rotation.x));
      this.lookLast = { x: touch.clientX, y: touch.clientY };
    }
  }

  private lookEnd(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === this.lookTouchId) this.lookTouchId = null;
    }
  }

  public update(_delta: number): void {
    // input handled via events
  }
}
