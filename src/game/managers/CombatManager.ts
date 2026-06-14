import * as THREE from 'three';
import { WeaponManager } from '@/game/managers/WeaponManager';
import { Monster } from '@/game/entities/Monster';
import { ScoreManager } from '@/game/managers/ScoreManager';
import { SpecialAbilitySystem } from '@/game/entities/SpecialAbilitySystem';

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

  public performAttack(monsters: Monster[]): number {
    if (!this.weaponManager.isCurrentlySwinging()) return 0;

    const weapon = this.weaponManager.getCurrentWeapon();
    if (!weapon) return 0;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    let hitCount = 0;
    const range = this.weaponManager.getSwingRange();
    const damage = this.weaponManager.getDamage();
    const ability = this.weaponManager.getCurrentAbility();

    const intersects = raycaster.intersectObjects(
      monsters.map((m) => m.getMesh())
    );

    for (const intersection of intersects) {
      if (intersection.distance > range) break;

      const targetMonster = monsters.find((m) => m.getMesh() === intersection.object);
      if (targetMonster) {
        const abilityName = ability ? ` [${ability.name}]` : '';
        console.log(`Hit! Damage: ${damage.toFixed(1)}${abilityName}`);
        this.createHitEffect(targetMonster.getMesh().position, damage, ability?.damageMultiplier || 1);
        hitCount++;
        this.scoreManager.addPoints(Math.ceil(damage));
      }
    }

    return hitCount;
  }

  private createHitEffect(position: THREE.Vector3, damage: number, multiplier: number): void {
    const particleCount = Math.ceil(multiplier * 6);
    const pGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const pMat = new THREE.MeshBasicMaterial({ 
      color: multiplier > 1 ? 0xFF00FF : 0xffffff 
    });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(position);
      this.scene.add(p);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 4,
        (Math.random() - 0.5) * 4
      );

      const pTimer = setInterval(() => {
        p.position.addScaledVector(vel, 0.016);
        vel.y -= 0.1;
        p.scale.subScalar(0.03);

        if (p.scale.x <= 0) {
          clearInterval(pTimer);
          this.scene.remove(p);
        }
      }, 16);
    }
  }

  public getAbilitySystem(): SpecialAbilitySystem {
    return this.abilitySystem;
  }
}
