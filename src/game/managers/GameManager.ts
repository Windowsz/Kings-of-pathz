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
import { HUD } from '@/game/ui/HUD';
import { SpecialAbilitySystem } from '@/game/entities/SpecialAbilitySystem';
import { GAME_CONFIG } from '@/game/utils/Constants';

export class GameManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private entityManager: EntityManager;
  private scoreManager: ScoreManager;
  private controls: DesktopControls | MobileControls;
  private player: Player;
  private prevTime: number = performance.now();

  private weaponSystem: WeaponSystem;
  private weaponManager: WeaponManager;
  private combatManager: CombatManager;
  private weaponUIManager: WeaponUIManager;
  private abilitySystem: SpecialAbilitySystem;
  private hud: HUD;

  private isGameOver = false;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, isMobile: boolean) {
    this.scene = scene;
    this.camera = camera;

    this.entityManager = new EntityManager(scene);
    this.scoreManager = new ScoreManager();
    this.player = new Player(camera);
    this.player.setAttackHandler(() => this.performSwing());

    this.weaponSystem = new WeaponSystem();
    this.weaponManager = new WeaponManager(camera);
    this.abilitySystem = new SpecialAbilitySystem(3);
    this.combatManager = new CombatManager(
      this.weaponManager,
      this.scoreManager,
      this.abilitySystem,
      scene,
      camera
    );
    this.weaponUIManager = new WeaponUIManager(this.weaponSystem, this.abilitySystem, {
      onEnhance: () => this.enhanceCurrentWeapon(),
      onSwitchWeapon: (type) => this.switchWeapon(type),
      onSelectSlot: (slot) => this.selectAbilitySlot(slot),
    });
    this.hud = new HUD(() => this.reset());

    const sword = this.weaponSystem.createWeapon(WeaponType.SWORD);
    this.weaponSystem.equipWeapon(sword.id);
    this.weaponManager.equipWeapon(sword);
    this.weaponSystem.addEnhancementStones(500);

    this.controls = isMobile
      ? new MobileControls(camera, this.player)
      : new DesktopControls(camera, this.player);

    this.entityManager.spawnInitialMonsters(GAME_CONFIG.INITIAL_MONSTERS);
    this.setupKeyboardShortcuts();
    this.setupActionButtons();
    this.refreshActionUI();
    this.hud.updateHealth(this.player.getHp(), this.player.getMaxHp());
  }

  // ---- input wiring ----

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case '1': this.switchWeapon(WeaponType.SWORD); break;
        case '2': this.switchWeapon(WeaponType.AXE); break;
        case '3': this.switchWeapon(WeaponType.SPEAR); break;
        case '4': this.switchWeapon(WeaponType.HAMMER); break;
        case 'i': this.toggleInventory(); break;
        case 'f': this.enhanceCurrentWeapon(); break;
        case 'q': this.selectAbilitySlot(0); break;
        case 'e': this.selectAbilitySlot(1); break;
        case 'r': this.selectAbilitySlot(2); break;
        case ' ': e.preventDefault(); this.activateSpecialAbility(); break;
      }
    });
  }

  private setupActionButtons(): void {
    const tap = (id: string, fn: () => void) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (ev: Event) => { ev.preventDefault(); fn(); };
      el.addEventListener('touchstart', handler, { passive: false });
      el.addEventListener('click', handler);
    };

    tap('attack-btn', () => this.performSwing());
    tap('special-btn', () => this.activateSpecialAbility());
    tap('enhance-btn', () => this.enhanceCurrentWeapon());
    tap('bag-btn', () => this.toggleInventory());
    tap('wpn-sword', () => this.switchWeapon(WeaponType.SWORD));
    tap('wpn-axe', () => this.switchWeapon(WeaponType.AXE));
    tap('wpn-spear', () => this.switchWeapon(WeaponType.SPEAR));
    tap('wpn-hammer', () => this.switchWeapon(WeaponType.HAMMER));
    tap('slot-0', () => this.selectAbilitySlot(0));
    tap('slot-1', () => this.selectAbilitySlot(1));
    tap('slot-2', () => this.selectAbilitySlot(2));
  }

  // ---- actions ----

  private performSwing(): void {
    if (this.isGameOver) return;
    this.weaponManager.swing();
  }

  private switchWeapon(type: WeaponType): void {
    let weapon = this.weaponSystem.getAllWeapons().find((w) => w.type === type);
    if (!weapon) weapon = this.weaponSystem.createWeapon(type);
    this.weaponSystem.equipWeapon(weapon.id);
    this.weaponManager.equipWeapon(weapon);
    this.weaponUIManager.update();
    this.refreshActionUI();
  }

  private enhanceCurrentWeapon(): void {
    const weapon = this.weaponSystem.getEquippedWeapon();
    if (!weapon) return;
    const result = this.weaponSystem.enhanceWeapon(weapon.id);
    // rebuild the held weapon so its glow/color reflects the new level
    this.weaponManager.equipWeapon(weapon);
    this.weaponUIManager.update();
    this.refreshActionUI();
    this.toast(result.message);
  }

  private activateSpecialAbility(): void {
    if (this.isGameOver) return;
    if (!this.abilitySystem.canUseActiveAbility()) {
      this.toast('Ability on cooldown');
      return;
    }
    const ability = this.abilitySystem.getActiveAbility();
    if (!ability) return;
    if (this.abilitySystem.useActiveAbility()) {
      this.weaponManager.activateSpecialAbility(ability);
      this.weaponUIManager.update();
    }
  }

  private selectAbilitySlot(slot: number): void {
    this.abilitySystem.switchSlot(slot);
    this.weaponUIManager.update();
    this.refreshActionUI();
  }

  private toggleInventory(): void {
    this.weaponUIManager.toggle();
  }

  // ---- per-frame ----

  public update(): void {
    const time = performance.now();
    const delta = Math.min(0.05, (time - this.prevTime) / 1000);
    this.prevTime = time;

    this.controls.update(delta);

    if (this.isGameOver) return;

    this.player.update(delta);

    const meleeHits = this.entityManager.update(delta, this.camera.position, time);
    if (meleeHits > 0) {
      this.player.takeDamage(GAME_CONFIG.ENEMY_ATTACK_DAMAGE * meleeHits);
      this.hud.showDamageFlash();
      this.hud.updateHealth(this.player.getHp(), this.player.getMaxHp());
      if (this.player.isDead()) {
        this.triggerGameOver();
        return;
      }
    }

    this.weaponManager.update(delta, time);
    this.abilitySystem.update(delta);
    this.combatManager.performAttack(this.entityManager.getMonsters());
    this.refreshActionUI();
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    if (document.exitPointerLock) document.exitPointerLock();
    this.hud.showGameOver(this.scoreManager.getScore());
  }

  private reset(): void {
    this.entityManager.clear();
    this.player.reset();
    this.camera.rotation.set(0, 0, 0);
    this.scoreManager.reset();
    this.isGameOver = false;
    this.entityManager.spawnInitialMonsters(GAME_CONFIG.INITIAL_MONSTERS);
    this.hud.updateHealth(this.player.getHp(), this.player.getMaxHp());
    this.refreshActionUI();
  }

  // ---- HUD button state ----

  private refreshActionUI(): void {
    const equipped = this.weaponSystem.getEquippedWeapon();
    const equippedType = equipped?.type;
    const types: [string, WeaponType][] = [
      ['wpn-sword', WeaponType.SWORD],
      ['wpn-axe', WeaponType.AXE],
      ['wpn-spear', WeaponType.SPEAR],
      ['wpn-hammer', WeaponType.HAMMER],
    ];
    for (const [id, type] of types) {
      document.getElementById(id)?.classList.toggle('active', type === equippedType);
    }

    const activeSlot = this.abilitySystem.getActiveSlotIndex();
    this.abilitySystem.getAllSlots().forEach((slot, i) => {
      const el = document.getElementById(`slot-${i}`);
      if (!el) return;
      const ability = slot.getAbility();
      el.classList.toggle('active', i === activeSlot);
      el.classList.toggle('ready', slot.canUseAbility());
      const icon = el.querySelector('.slot-icon');
      const cd = el.querySelector('.slot-cd') as HTMLElement | null;
      if (icon) icon.textContent = ability ? ability.icon : '–';
      if (cd) {
        const pct = slot.getCooldownPercent();
        cd.style.height = `${pct * 100}%`;
      }
    });

    const special = document.getElementById('special-btn');
    if (special) special.classList.toggle('cooldown', !this.abilitySystem.canUseActiveAbility());
  }

  private toast(message: string): void {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout((el as unknown as { _t?: number })._t);
    (el as unknown as { _t?: number })._t = window.setTimeout(
      () => el.classList.remove('show'),
      1400
    );
  }
}
