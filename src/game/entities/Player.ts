import * as THREE from 'three';
import { Weapon } from '@/game/entities/Weapon';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private weapon: Weapon;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.weapon = new Weapon(camera);
  }

  public setMovement(forward: boolean, backward: boolean, left: boolean, right: boolean): void {
    this.moveForward = forward;
    this.moveBackward = backward;
    this.moveLeft = left;
    this.moveRight = right;
  }

  public update(delta: number): void {
    this.updateMovement(delta);
    this.weapon.update(delta, performance.now());
  }

  private updateMovement(delta: number): void {
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 35.0 * delta;
    if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 35.0 * delta;

    this.camera.translateX(-this.velocity.x * delta);
    this.camera.translateZ(this.velocity.z * delta);
    this.camera.position.y = 2;
  }

  public attack(): void {
    this.weapon.swing();
  }

  public getWeapon(): Weapon {
    return this.weapon;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
