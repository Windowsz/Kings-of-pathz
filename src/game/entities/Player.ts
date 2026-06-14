import * as THREE from 'three';
import { GAME_CONFIG } from '@/game/utils/Constants';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private velocity = new THREE.Vector3();
  /** analog input: x = strafe (right +), y = forward (+) */
  private input = new THREE.Vector2();

  private maxHp = GAME_CONFIG.PLAYER_MAX_HP;
  private hp = GAME_CONFIG.PLAYER_MAX_HP;

  private attackHandler: (() => void) | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /** Continuous movement input. Components are clamped to [-1, 1]. */
  public setMoveInput(x: number, y: number): void {
    this.input.set(
      Math.max(-1, Math.min(1, x)),
      Math.max(-1, Math.min(1, y))
    );
  }

  /** Back-compat boolean movement (desktop keys map to full-tilt input). */
  public setMovement(forward: boolean, backward: boolean, left: boolean, right: boolean): void {
    this.setMoveInput(
      Number(right) - Number(left),
      Number(forward) - Number(backward)
    );
  }

  public setAttackHandler(handler: () => void): void {
    this.attackHandler = handler;
  }

  public attack(): void {
    this.attackHandler?.();
  }

  public update(delta: number): void {
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.velocity.z -= this.input.y * GAME_CONFIG.PLAYER_SPEED * delta;
    this.velocity.x -= this.input.x * GAME_CONFIG.PLAYER_SPEED * delta;

    this.camera.translateX(-this.velocity.x * delta);
    this.camera.translateZ(this.velocity.z * delta);
    this.camera.position.y = GAME_CONFIG.CAMERA_HEIGHT;
  }

  public takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  public isDead(): boolean {
    return this.hp <= 0;
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public reset(): void {
    this.hp = this.maxHp;
    this.velocity.set(0, 0, 0);
    this.input.set(0, 0);
    this.camera.position.set(0, GAME_CONFIG.CAMERA_HEIGHT, 0);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
