import * as THREE from 'three';
import { PALETTE } from '@/game/utils/Constants';

export class Weapon {
  private group: THREE.Group;
  private blade: THREE.Mesh;
  private camera: THREE.PerspectiveCamera;
  private baseQuaternion: THREE.Quaternion;
  private isSwinging: boolean = false;
  private swingTimer: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.group = new THREE.Group();

    const bladeGeo = new THREE.BoxGeometry(0.1, 1.2, 0.03);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: PALETTE.sword,
      flatShading: true,
    });
    this.blade = new THREE.Mesh(bladeGeo, bladeMat);
    this.blade.position.y = 0.6;
    this.group.add(this.blade);

    this.group.position.set(0.3, -0.4, -0.8);
    this.group.rotation.set(0.2, -0.4, -0.3);
    this.baseQuaternion = this.group.quaternion.clone();

    camera.add(this.group);
  }

  public swing(): void {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingTimer = 0;
    }
  }

  public update(delta: number, time: number): void {
    if (this.isSwinging) {
      this.swingTimer += delta * 15;
      if (this.swingTimer > Math.PI) {
        this.isSwinging = false;
        this.group.quaternion.copy(this.baseQuaternion);
      } else {
        this.group.rotation.z = -0.3 - Math.sin(this.swingTimer) * 1.2;
        this.group.rotation.x = 0.2 + Math.sin(this.swingTimer) * 0.5;
      }
    } else {
      this.group.position.y = -0.4 + Math.sin(time * 0.003) * 0.01;
    }
  }

  public isCurrentlySwinging(): boolean {
    return this.isSwinging;
  }

  public getMesh(): THREE.Group {
    return this.group;
  }
}
