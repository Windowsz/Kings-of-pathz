import * as THREE from 'three';

export class Monster {
  private mesh: THREE.Mesh;
  private speed: number;
  private bobOffset: number;

  constructor(mesh: THREE.Mesh) {
    this.mesh = mesh;
    this.speed = 1.2 + Math.random() * 1.2;
    this.bobOffset = Math.random() * 100;
  }

  public update(delta: number, playerPos: THREE.Vector3, time: number): void {
    // Chase player
    const direction = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    direction.y = 0;
    direction.normalize();
    this.mesh.position.addScaledVector(direction, this.speed * delta);
    this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

    // Bob animation
    const scaleY = 1 + Math.abs(Math.sin(time * 0.008 + this.bobOffset)) * 0.2;
    const scaleXZ = 1 - (scaleY - 1) * 0.5;
    this.mesh.scale.set(scaleXZ, scaleY, scaleXZ);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getSpeed(): number {
    return this.speed;
  }
}
