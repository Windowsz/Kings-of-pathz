import * as THREE from 'three';
import { Monster } from '@/game/entities/Monster';
import { AssetManager } from '@/game/utils/AssetManager';
import { ENEMY_TYPES, GAME_CONFIG } from '@/game/utils/Constants';

export class EntityManager {
  private scene: THREE.Scene;
  private monsters: Monster[] = [];
  private lastCenter = new THREE.Vector3();
  private pendingRespawns = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public spawnInitialMonsters(count: number): void {
    for (let i = 0; i < count; i++) {
      this.spawnMonster();
    }
  }

  public spawnMonster(center?: THREE.Vector3): void {
    if (this.monsters.length >= GAME_CONFIG.MAX_MONSTERS) return;

    const cfg = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    const instance = AssetManager.createInstance(cfg.key, cfg.facingOffset ?? 0);
    if (!instance) return;

    const origin = center ?? this.lastCenter;
    const angle = Math.random() * Math.PI * 2;
    const radius =
      GAME_CONFIG.MONSTER_SPAWN_RADIUS_MIN +
      Math.random() * (GAME_CONFIG.MONSTER_SPAWN_RADIUS_MAX - GAME_CONFIG.MONSTER_SPAWN_RADIUS_MIN);

    instance.root.position.set(
      origin.x + Math.cos(angle) * radius,
      0,
      origin.z + Math.sin(angle) * radius
    );

    this.scene.add(instance.root);
    this.monsters.push(new Monster(instance, cfg));
  }

  /** Advances all monsters; returns how many melee hits landed on the player this frame. */
  public update(delta: number, center: THREE.Vector3, time: number): number {
    this.lastCenter.copy(center);

    let meleeHits = 0;
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i];
      if (monster.update(delta, center, time)) meleeHits++;

      if (monster.isRemovable()) {
        this.scene.remove(monster.getMesh());
        monster.dispose();
        this.monsters.splice(i, 1);
        this.scheduleRespawn();
      }
    }
    return meleeHits;
  }

  private scheduleRespawn(): void {
    this.pendingRespawns++;
    setTimeout(() => {
      this.pendingRespawns--;
      this.spawnMonster();
    }, GAME_CONFIG.RESPAWN_DELAY_MS);
  }

  public getMonsters(): Monster[] {
    return this.monsters;
  }

  public clear(): void {
    for (const monster of this.monsters) {
      this.scene.remove(monster.getMesh());
      monster.dispose();
    }
    this.monsters = [];
  }
}
