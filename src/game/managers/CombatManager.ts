import * as THREE from 'three';
import { WeaponManager } from '@/game/managers/WeaponManager';
import { Monster } from '@/game/entities/Monster';
import { ScoreManager } from '@/game/managers/ScoreManager';
import { SpecialAbilitySystem, SpecialAbilityType } from '@/game/entities/SpecialAbilitySystem';

const AOE_ABILITIES = new Set<SpecialAbilityType>([
  SpecialAbilityType.WHIRLWIND,
  SpecialAbilityType.SHOCKWAVE,
  SpecialAbilityType.SPIN_ATTACK,
]);

export class CombatManager {
  private weaponManager: WeaponManager;
  private scoreManager: ScoreManager;
  private abilitySystem: SpecialAbilitySystem;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  constructor(
    weaponManager: WeaponManager,
    scoreManager: ScoreManager,
    abilitySystem: SpecialAbilitySystem,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    this.weaponManager = weaponManager;
    this.scoreManager = scoreManager;
    this.abilitySystem = abilitySystem;
    this.scene = scene;
    this.camera = camera;
  }

  /** Resolves a swing against the monster list; returns the number of kills. */
  public performAttack(monsters: Monster[]): number {
    if (!this.weaponManager.isCurrentlySwinging()) return 0;
    if (this.weaponManager.consumeSwingResolved()) return 0; // one resolution per swing

    const weapon = this.weaponManager.getCurrentWeapon();
    if (!weapon) return 0;

    const range = this.weaponManager.getSwingRange();
    const damage = this.weaponManager.getDamage();
    const ability = this.weaponManager.getCurrentAbility();
    const knockback = weapon.stats.knockback + (ability ? 1.5 : 0);
    const isAoe = ability ? AOE_ABILITIES.has(ability.type) : false;

    const hit = new Set<Monster>();

    if (isAoe) {
      // hit everything within range of the player
      for (const monster of monsters) {
        if (monster.isDead()) continue;
        if (monster.getPosition().distanceTo(this.camera.position) <= range) hit.add(monster);
      }
    } else {
      // hit whatever the crosshair ray strikes within range
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      const intersects = raycaster.intersectObjects(
        monsters.map((m) => m.getMesh()),
        true
      );
      for (const intersection of intersects) {
        if (intersection.distance > range) break;
        const owner = this.findOwner(intersection.object, monsters);
        if (owner && !owner.isDead()) hit.add(owner);
      }
    }

    let kills = 0;
    const mult = ability?.damageMultiplier ?? 1;
    for (const monster of hit) {
      const knockDir = new THREE.Vector3().subVectors(monster.getPosition(), this.camera.position);
      this.createHitEffect(monster.getPosition(), damage, mult);
      monster.applyKnockback(knockDir, knockback * 0.25);
      const died = monster.takeDamage(damage);
      if (died) {
        kills++;
        this.scoreManager.addPoints(monster.getScoreValue());
      }
    }

    return kills;
  }

  private findOwner(object: THREE.Object3D, monsters: Monster[]): Monster | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      const owner = monsters.find((m) => m.getMesh() === node);
      if (owner) return owner;
      node = node.parent;
    }
    return null;
  }

  private createHitEffect(position: THREE.Vector3, _damage: number, multiplier: number): void {
    const particleCount = Math.ceil(multiplier * 6);
    const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const mat = new THREE.MeshBasicMaterial({ color: multiplier > 1 ? 0xff00ff : 0xffe7a0 });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(position);
      p.position.y += 1;
      this.scene.add(p);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 4,
        (Math.random() - 0.5) * 4
      );

      const timer = setInterval(() => {
        p.position.addScaledVector(vel, 0.016);
        vel.y -= 0.1;
        p.scale.subScalar(0.03);
        if (p.scale.x <= 0) {
          clearInterval(timer);
          this.scene.remove(p);
        }
      }, 16);
    }
  }

  public getAbilitySystem(): SpecialAbilitySystem {
    return this.abilitySystem;
  }
}
