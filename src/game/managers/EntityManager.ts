import * as THREE from 'three';
import { Monster } from '@/game/entities/Monster';
import { PALETTE } from '@/game/utils/Constants';

export class EntityManager {
  private scene: THREE.Scene;
  private monsters: Monster[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public spawnInitialMonsters(count: number): void {
    for (let i = 0; i < count; i++) {
      this.spawnMonster();
    }
  }

  public spawnMonster(cameraPosition?: THREE.Vector3): void {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const material = new THREE.MeshStandardMaterial({
      color: PALETTE.monster,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    const pos = cameraPosition || new THREE.Vector3(0, 0.6, 0);

    mesh.position.set(
      pos.x + Math.cos(angle) * radius,
      0.6,
      pos.z + Math.sin(angle) * radius
    );

    const monster = new Monster(mesh);
    this.scene.add(mesh);
    this.monsters.push(monster);
  }

  public update(delta: number, cameraPosition: THREE.Vector3, time: number): void {
    this.monsters.forEach((monster) => {
      monster.update(delta, cameraPosition, time);
    });
  }

  public removeMonster(index: number): void {
    if (index >= 0 && index < this.monsters.length) {
      const monster = this.monsters[index];
      this.scene.remove(monster.getMesh());
      this.monsters.splice(index, 1);
    }
  }

  public getMonsters(): Monster[] {
    return this.monsters;
  }
}
