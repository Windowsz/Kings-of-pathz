import * as THREE from 'three';
import { PALETTE } from '@/game/utils/Constants';
import { WeaponType, WeaponItem } from '@/game/entities/WeaponSystem';
import { SpecialAbility, SpecialAbilityType } from '@/game/entities/SpecialAbilitySystem';

export class WeaponManager {
  private weaponMesh: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private currentWeapon: WeaponItem | null = null;
  private isSwinging: boolean = false;
  private swingTimer: number = 0;
  private baseQuaternion: THREE.Quaternion;
  private pointLight: THREE.PointLight;
  private specialAbilityEffect: THREE.Group | null = null;
  private currentAbility: SpecialAbility | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.weaponMesh = new THREE.Group();
    this.baseQuaternion = new THREE.Quaternion();
    
    // Add dynamic light to weapon
    this.pointLight = new THREE.PointLight(0xffd700, 0, 20);
    this.pointLight.position.set(0, 0.6, 0);
    this.weaponMesh.add(this.pointLight);
    
    camera.add(this.weaponMesh);
  }

  public equipWeapon(weapon: WeaponItem): void {
    this.currentWeapon = weapon;
    this.weaponMesh.children = this.weaponMesh.children.filter(
      (child) => child instanceof THREE.Light
    );
    this.createWeaponMesh(weapon);
    this.updateWeaponGlow(weapon);
  }

  private createWeaponMesh(weapon: WeaponItem): void {
    let mesh: THREE.Mesh;

    switch (weapon.type) {
      case WeaponType.SWORD:
        mesh = this.createSwordMesh(weapon);
        break;
      case WeaponType.AXE:
        mesh = this.createAxeMesh(weapon);
        break;
      case WeaponType.SPEAR:
        mesh = this.createSpearMesh(weapon);
        break;
      case WeaponType.HAMMER:
        mesh = this.createHammerMesh(weapon);
        break;
      default:
        mesh = this.createSwordMesh(weapon);
    }

    this.weaponMesh.add(mesh);
    this.weaponMesh.position.set(0.3, -0.4, -0.8);
    this.weaponMesh.rotation.set(0.2, -0.4, -0.3);
    this.baseQuaternion.copy(this.weaponMesh.quaternion);
  }

  private createSwordMesh(weapon: WeaponItem): THREE.Mesh {
    const group = new THREE.Group();
    
    // Blade - thicker for higher enhancements
    const bladeWidth = 0.1 + weapon.enhancement * 0.01;
    const bladeGeo = new THREE.BoxGeometry(bladeWidth, 1.2, 0.03);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: this.getWeaponColor(weapon),
      flatShading: true,
      metalness: 0.8 + weapon.enhancement * 0.01,
      roughness: 0.3 - weapon.enhancement * 0.01,
      emissive: this.getWeaponEmissive(weapon),
      emissiveIntensity: Math.min(1, weapon.enhancement * 0.05),
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.6;
    group.add(blade);

    // Handle
    const handleGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      flatShading: true,
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.1;
    group.add(handle);

    return group as any;
  }

  private createAxeMesh(weapon: WeaponItem): THREE.Mesh {
    const group = new THREE.Group();

    // Axe head - larger
    const headGeo = new THREE.BoxGeometry(0.3, 0.5, 0.1);
    const headMat = new THREE.MeshStandardMaterial({
      color: this.getWeaponColor(weapon),
      flatShading: true,
      metalness: 0.8,
      emissive: this.getWeaponEmissive(weapon),
      emissiveIntensity: Math.min(1, weapon.enhancement * 0.05),
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.7;
    group.add(head);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xA0826D,
      flatShading: true,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.2;
    group.add(shaft);

    return group as any;
  }

  private createSpearMesh(weapon: WeaponItem): THREE.Mesh {
    const group = new THREE.Group();

    // Spear point - narrow
    const pointGeo = new THREE.ConeGeometry(0.05, 0.4, 8);
    const pointMat = new THREE.MeshStandardMaterial({
      color: this.getWeaponColor(weapon),
      flatShading: true,
      metalness: 0.8,
      emissive: this.getWeaponEmissive(weapon),
      emissiveIntensity: Math.min(1, weapon.enhancement * 0.05),
    });
    const point = new THREE.Mesh(pointGeo, pointMat);
    point.position.y = 0.8;
    group.add(point);

    // Shaft - longer range
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xA0826D,
      flatShading: true,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.1;
    group.add(shaft);

    return group as any;
  }

  private createHammerMesh(weapon: WeaponItem): THREE.Mesh {
    const group = new THREE.Group();

    // Hammer head - very large
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshStandardMaterial({
      color: this.getWeaponColor(weapon),
      flatShading: true,
      metalness: 0.8,
      emissive: this.getWeaponEmissive(weapon),
      emissiveIntensity: Math.min(1, weapon.enhancement * 0.05),
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.6;
    group.add(head);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xA0826D,
      flatShading: true,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.0;
    group.add(shaft);

    return group as any;
  }

  private getWeaponColor(weapon: WeaponItem): number {
    const baseColor = 0xffd3b6;
    if (weapon.enhancement < 5) return baseColor;
    if (weapon.enhancement < 10) return 0xFFD700; // Gold
    if (weapon.enhancement < 15) return 0xC0C0C0; // Silver
    return 0xFF6B6B; // Red for high enhancement
  }

  private getWeaponEmissive(weapon: WeaponItem): number {
    if (weapon.enhancement < 5) return 0x000000;
    if (weapon.enhancement < 10) return 0x664400;
    if (weapon.enhancement < 15) return 0x555555;
    return 0x660000;
  }

  private updateWeaponGlow(weapon: WeaponItem): void {
    const maxIntensity = 3;
    const intensity = (weapon.enhancement / 20) * maxIntensity;
    this.pointLight.intensity = intensity;
    
    // Color based on enhancement
    if (weapon.enhancement < 5) {
      this.pointLight.color.setHex(0xffd700);
    } else if (weapon.enhancement < 10) {
      this.pointLight.color.setHex(0xFFFF00);
    } else if (weapon.enhancement < 15) {
      this.pointLight.color.setHex(0xFF6B9D);
    } else {
      this.pointLight.color.setHex(0xFF0000);
    }
  }

  public swing(): void {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingTimer = 0;
    }
  }

  public activateSpecialAbility(ability: SpecialAbility): void {
    this.currentAbility = ability;
    this.createAbilityEffect(ability);
    this.swing();
  }

  private createAbilityEffect(ability: SpecialAbility): void {
    if (this.specialAbilityEffect) {
      this.weaponMesh.remove(this.specialAbilityEffect);
    }

    const effectGroup = new THREE.Group();

    switch (ability.type) {
      case SpecialAbilityType.WHIRLWIND:
        this.createWhirlwindEffect(effectGroup);
        break;
      case SpecialAbilityType.SHOCKWAVE:
        this.createShockwaveEffect(effectGroup);
        break;
      case SpecialAbilityType.CHARGING_BLOW:
        this.createChargingBlowEffect(effectGroup);
        break;
      case SpecialAbilityType.SPIN_ATTACK:
        this.createSpinAttackEffect(effectGroup);
        break;
      default:
        this.createSlashEffect(effectGroup);
    }

    this.weaponMesh.add(effectGroup);
    this.specialAbilityEffect = effectGroup;
  }

  private createSlashEffect(group: THREE.Group): void {
    const geometry = new THREE.ConeGeometry(0.3, 1.5, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00FF00,
      transparent: true,
      opacity: 0.6,
      emissive: 0x00FF00,
      emissiveIntensity: 0.8,
    });
    const slash = new THREE.Mesh(geometry, material);
    slash.rotation.z = Math.PI / 4;
    group.add(slash);
  }

  private createWhirlwindEffect(group: THREE.Group): void {
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(0.5 + i * 0.2, 0.1, 16, 8);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.7 - i * 0.15,
        emissive: 0x00FFFF,
        emissiveIntensity: 0.8,
      });
      const torus = new THREE.Mesh(geometry, material);
      torus.rotation.x = Math.PI / 4;
      group.add(torus);
    }
  }

  private createShockwaveEffect(group: THREE.Group): void {
    const geometry = new THREE.IcosahedronGeometry(1, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0xFFFF00,
      transparent: true,
      opacity: 0.5,
      emissive: 0xFFFF00,
      emissiveIntensity: 1.0,
      wireframe: true,
    });
    const shockwave = new THREE.Mesh(geometry, material);
    group.add(shockwave);
  }

  private createSpinAttackEffect(group: THREE.Group): void {
    const geometry = new THREE.OctahedronGeometry(0.7, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xFF00FF,
      transparent: true,
      opacity: 0.6,
      emissive: 0xFF00FF,
      emissiveIntensity: 0.9,
    });
    const octahedron = new THREE.Mesh(geometry, material);
    group.add(octahedron);
  }

  private createChargingBlowEffect(group: THREE.Group): void {
    // Core charge ball
    const coreGeo = new THREE.IcosahedronGeometry(0.3, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xFF3300,
      emissive: 0xFF3300,
      emissiveIntensity: 1.0,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Outer shell
    const shellGeo = new THREE.IcosahedronGeometry(0.5, 3);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.4,
      emissive: 0xFF6600,
      emissiveIntensity: 0.8,
      wireframe: true,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);
  }

  public isCurrentlySwinging(): boolean {
    return this.isSwinging;
  }

  public update(delta: number, time: number): void {
    if (this.isSwinging) {
      this.swingTimer += delta * 15;
      if (this.swingTimer > Math.PI) {
        this.isSwinging = false;
        this.weaponMesh.quaternion.copy(this.baseQuaternion);
        if (this.specialAbilityEffect) {
          this.weaponMesh.remove(this.specialAbilityEffect);
          this.specialAbilityEffect = null;
        }
        this.currentAbility = null;
      } else {
        this.weaponMesh.rotation.z = -0.3 - Math.sin(this.swingTimer) * 1.2;
        this.weaponMesh.rotation.x = 0.2 + Math.sin(this.swingTimer) * 0.5;
        
        // Rotate ability effects
        if (this.specialAbilityEffect) {
          this.specialAbilityEffect.rotation.z += 0.1;
          this.specialAbilityEffect.rotation.x += 0.05;
        }
      }
    } else {
      this.weaponMesh.position.y = -0.4 + Math.sin(time * 0.003) * 0.01;
    }

    // Update weapon glow
    if (this.currentWeapon) {
      this.updateWeaponGlow(this.currentWeapon);
    }
  }

  public getSwingRange(): number {
    if (!this.currentWeapon) return 3.5;
    let range = this.currentWeapon.stats.range;
    if (this.currentAbility) {
      range = this.currentAbility.range;
    }
    return range;
  }

  public getDamage(): number {
    if (!this.currentWeapon) return 15;
    let baseDamage = this.currentWeapon.stats.baseDamage;
    
    if (this.currentAbility) {
      baseDamage *= this.currentAbility.damageMultiplier;
    }
    
    return baseDamage * (Math.random() < this.currentWeapon.stats.critChance ? 1.5 : 1.0);
  }

  public getCurrentWeapon(): WeaponItem | null {
    return this.currentWeapon;
  }

  public getCurrentAbility(): SpecialAbility | null {
    return this.currentAbility;
  }
}
