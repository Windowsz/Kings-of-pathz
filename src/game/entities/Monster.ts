import * as THREE from 'three';
import { ModelInstance } from '@/game/utils/AssetManager';
import { HealthBar } from '@/game/utils/HealthBar';
import { ClipRef, EnemyConfig, GAME_CONFIG } from '@/game/utils/Constants';

const DEATH_LINGER = 0.7; // seconds the corpse stays before removal

export class Monster {
  private root: THREE.Group;
  private mixer: THREE.AnimationMixer;
  private animations: THREE.AnimationClip[];
  private config: EnemyConfig;

  private speed: number;
  private hp: number;
  private maxHp: number;
  private dead = false;
  private deathTimer = 0;
  private attackCooldown = 0;
  private bobOffset = Math.random() * Math.PI * 2;

  private healthBar: HealthBar;
  private currentAction: THREE.AnimationAction | null = null;

  constructor(instance: ModelInstance, config: EnemyConfig) {
    this.root = instance.root;
    this.mixer = instance.mixer;
    this.animations = instance.animations;
    this.config = config;

    this.speed = config.speed;
    this.maxHp = config.hp;
    this.hp = config.hp;

    this.healthBar = new HealthBar(GAME_CONFIG.TARGET_ENEMY_HEIGHT + 0.45);
    this.healthBar.setRatio(1);
    this.root.add(this.healthBar.getObject());

    this.playClip(config.clips.walk);
  }

  private resolveClip(ref: ClipRef | undefined): THREE.AnimationClip | null {
    if (this.animations.length === 0) return null;
    if (ref === undefined) return this.animations[0];
    if (typeof ref === 'number') return this.animations[ref] ?? this.animations[0];
    return this.animations.find((c) => c.name === ref) ?? this.animations[0];
  }

  private playClip(ref: ClipRef | undefined, fade = 0.2): void {
    const clip = this.resolveClip(ref);
    if (!clip) return;
    const next = this.mixer.clipAction(clip);
    if (next === this.currentAction) return;
    next.reset().fadeIn(fade).play();
    if (this.currentAction) this.currentAction.fadeOut(fade);
    this.currentAction = next;
  }

  /** Returns true if this monster landed a melee hit on the player this frame. */
  update(delta: number, playerPos: THREE.Vector3, _time: number): boolean {
    this.mixer.update(delta);

    if (this.dead) {
      this.deathTimer += delta;
      this.root.position.y -= delta * 0.6; // sink into the ground
      return false;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    const toPlayer = new THREE.Vector3(
      playerPos.x - this.root.position.x,
      0,
      playerPos.z - this.root.position.z
    );
    const dist = toPlayer.length();
    toPlayer.normalize();

    this.root.lookAt(playerPos.x, this.root.position.y, playerPos.z);

    let landedHit = false;
    if (dist > GAME_CONFIG.ENEMY_MELEE_RANGE) {
      this.root.position.addScaledVector(toPlayer, this.speed * delta);
      this.playClip(this.config.clips.walk);
    } else {
      this.playClip(this.config.clips.idle ?? this.config.clips.walk);
      if (this.attackCooldown <= 0) {
        landedHit = true;
        this.attackCooldown = GAME_CONFIG.ENEMY_ATTACK_INTERVAL;
      }
    }

    this.healthBar.setRatio(this.hp / this.maxHp);
    return landedHit;
  }

  /** Apply damage. Returns true if this hit killed the monster. */
  takeDamage(amount: number): boolean {
    if (this.dead) return false;
    this.hp -= amount;
    this.healthBar.setRatio(this.hp / this.maxHp);
    if (this.hp <= 0) {
      this.dead = true;
      this.deathTimer = 0;
      this.healthBar.setVisible(false);
      this.playClip(this.config.clips.idle ?? this.config.clips.walk);
      return true;
    }
    return false;
  }

  applyKnockback(direction: THREE.Vector3, strength: number): void {
    const flat = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    this.root.position.addScaledVector(flat, strength);
  }

  isDead(): boolean {
    return this.dead;
  }

  isRemovable(): boolean {
    return this.dead && this.deathTimer >= DEATH_LINGER;
  }

  getMesh(): THREE.Object3D {
    return this.root;
  }

  getPosition(): THREE.Vector3 {
    return this.root.position;
  }

  getScoreValue(): number {
    return this.config.scoreValue;
  }

  dispose(): void {
    this.healthBar.dispose();
  }
}
