import * as THREE from 'three';
import { EntityManager } from '@/game/managers/EntityManager';
import { ScoreManager } from '@/game/managers/ScoreManager';
import { DesktopControls } from '@/game/controls/DesktopControls';
import { MobileControls } from '@/game/controls/MobileControls';
import { Player } from '@/game/entities/Player';
import { WeaponManager } from '@/game/managers/WeaponManager';
import { WeaponSystem, WeaponType } from '@/game/entities/WeaponSystem';
import { CombatManager } from '@/game/managers/CombatManager';
import { WeaponUIManager } from '@/game/ui/WeaponUIManager';
import { SpecialAbilitySystem, SpecialAbilityType } from '@/game/entities/SpecialAbilitySystem';

export class GameManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private entityManager: EntityManager;
  private scoreManager: ScoreManager;
  private controls: DesktopControls | MobileControls;
  private player: Player;
  private prevTime: number = performance.now();
  private isMobile: boolean;
  private weaponSystem: WeaponSystem;
  private weaponManager: WeaponManager;
  private combatManager: CombatManager;
  private weaponUIManager: WeaponUIManager;
  private abilitySystem: SpecialAbilitySystem;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;
    this.isMobile = isMobile;

    this.entityManager = new EntityManager(scene);
    this.scoreManager = new ScoreManager();
    this.player = new Player(camera);
    
    // Initialize weapon system
    this.weaponSystem = new WeaponSystem();
    this.weaponManager = new WeaponManager(camera);
    this.abilitySystem = new SpecialAbilitySystem(3);
    this.combatManager = new CombatManager(this.weaponManager, this.scoreManager, this.abilitySystem, scene, camera);
    this.weaponUIManager = new WeaponUIManager(this.weaponSystem, this.abilitySystem);

    // Equip starting weapon
    const sword = this.weaponSystem.createWeapon(WeaponType.SWORD);
    this.weaponSystem.equipWeapon(sword.id);
    this.weaponManager.equipWeapon(sword);
    
    // Add test enhancement stones
    this.weaponSystem.addEnhancementStones(500);

    if (isMobile) {
      this.controls = new MobileControls(camera, this.player);
    } else {
      this.controls = new DesktopControls(camera, this.player);
    }

    this.entityManager.spawnInitialMonsters(5);
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === '1') this.switchWeapon(WeaponType.SWORD);
      if (e.key === '2') this.switchWeapon(WeaponType.AXE);
      if (e.key === '3') this.switchWeapon(WeaponType.SPEAR);
      if (e.key === '4') this.switchWeapon(WeaponType.HAMMER);
      if (e.key === 'i') this.weaponUIManager.toggle();
      if (e.key === 'e') this.enhanceCurrentWeapon();
      if (e.key === 'q') this.abilitySystem.switchSlot(0);
      if (e.key === 'w') this.abilitySystem.switchSlot(1);
      if (e.key === 'r') this.abilitySystem.switchSlot(2);
      if (e.key === ' ') {
        e.preventDefault();
        this.activateSpecialAbility();
      }
    });
  }

  private switchWeapon(type: WeaponType): void {
    let weapon = this.weaponSystem.getAllWeapons().find((w) => w.type === type);
    if (!weapon) {
      weapon = this.weaponSystem.createWeapon(type);
    }
    this.weaponSystem.equipWeapon(weapon.id);
    this.weaponManager.equipWeapon(weapon);
    this.weaponUIManager.update();
    console.log(`Switched to ${type.toUpperCase()}`);
  }

  private enhanceCurrentWeapon(): void {
    const weapon = this.weaponSystem.getEquippedWeapon();
    if (!weapon) return;
    const result = this.weaponSystem.enhanceWeapon(weapon.id);
    console.log(result.message);
    this.weaponUIManager.update();
  }

  private activateSpecialAbility(): void {
    if (!this.abilitySystem.canUseActiveAbility()) {
      console.log('⏳ Ability still on cooldown!');
      return;
    }

    const ability = this.abilitySystem.getActiveAbility();
    if (!ability) return;

    const used = this.abilitySystem.useActiveAbility();
    if (used) {
      this.weaponManager.activateSpecialAbility(ability);
      console.log(`⚡ ${ability.name} activated!`);
      this.weaponUIManager.update();
    }
  }

  public update(): void {
    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;

    this.controls.update(delta);
    this.player.update(delta);
    this.entityManager.update(delta, this.camera.position, time);
    this.weaponManager.update(delta, time);
    this.abilitySystem.update(delta);
    
    // Combat detection
    const monstersHit = this.combatManager.performAttack(this.entityManager.getMonsters());
    if (monstersHit > 0) {
      // Remove hit monsters
      const toRemove: number[] = [];
      this.entityManager.getMonsters().forEach((monster, index) => {
        const distance = this.camera.position.distanceTo(monster.getMesh().position);
        if (distance < this.weaponManager.getSwingRange() && this.weaponManager.isCurrentlySwinging()) {
          toRemove.push(index);
        }
      });
      
      // Remove in reverse order to maintain indices
      toRemove.reverse().forEach(index => {
        this.entityManager.removeMonster(index);
        setTimeout(() => this.entityManager.spawnMonster(this.camera.position), 1000);
      });
    }

    this.prevTime = time;
  }
}
