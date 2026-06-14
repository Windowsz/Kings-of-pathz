import { WeaponItem, WeaponSystem, WeaponType } from '@/game/entities/WeaponSystem';
import { SpecialAbilitySystem } from '@/game/entities/SpecialAbilitySystem';

export interface WeaponUIActions {
  onEnhance: () => void;
  onSwitchWeapon: (type: WeaponType) => void;
  onSelectSlot: (slot: number) => void;
}

const WEAPON_ICONS: Record<WeaponType, string> = {
  [WeaponType.SWORD]: '⚔️',
  [WeaponType.AXE]: '🪓',
  [WeaponType.SPEAR]: '🔱',
  [WeaponType.HAMMER]: '🔨',
};

export class WeaponUIManager {
  private weaponSystem: WeaponSystem;
  private abilitySystem: SpecialAbilitySystem;
  private actions: WeaponUIActions;
  private container: HTMLElement;
  private isOpen = false;

  constructor(
    weaponSystem: WeaponSystem,
    abilitySystem: SpecialAbilitySystem,
    actions: WeaponUIActions
  ) {
    this.weaponSystem = weaponSystem;
    this.abilitySystem = abilitySystem;
    this.actions = actions;

    this.container = document.createElement('div');
    this.container.id = 'weapon-ui';
    document.body.appendChild(this.container);

    // single delegated handler survives innerHTML re-renders
    const dispatch = (ev: Event) => {
      const target = (ev.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!target) return;
      ev.preventDefault();
      const action = target.dataset.action;
      if (action === 'enhance') this.actions.onEnhance();
      else if (action === 'close') this.toggle();
      else if (action === 'weapon') this.actions.onSwitchWeapon(target.dataset.weapon as WeaponType);
      else if (action === 'slot') this.actions.onSelectSlot(Number(target.dataset.slot));
    };
    this.container.addEventListener('click', dispatch);
    this.container.addEventListener('touchstart', dispatch, { passive: false });

    this.update();
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('open', this.isOpen);
    if (this.isOpen) this.update();
  }

  public update(): void {
    const weapon = this.weaponSystem.getEquippedWeapon();
    if (!weapon) return;

    const info = this.weaponSystem.getEnhancementInfo(weapon.enhancement);
    const stones = this.weaponSystem.getEnhancementStones();
    const canAfford = stones >= info.materialCost;
    const zoneText = info.inSafeZone ? '✓ Safe zone' : '⚠ Danger zone';

    this.container.innerHTML = `
      <div class="ui-header">
        <span>Inventory</span>
        <button class="ui-close" data-action="close">✕</button>
      </div>

      <div class="weapon-tabs">
        ${(Object.values(WeaponType) as WeaponType[])
          .map(
            (type) => `
          <button class="weapon-tab ${type === weapon.type ? 'active' : ''}"
                  data-action="weapon" data-weapon="${type}">
            ${WEAPON_ICONS[type]}
          </button>`
          )
          .join('')}
      </div>

      <div class="weapon-title">${WEAPON_ICONS[weapon.type]} ${weapon.type.toUpperCase()} +${weapon.enhancement}</div>

      <div class="stat-grid">
        ${this.stat('DMG', weapon.stats.baseDamage.toFixed(1))}
        ${this.stat('SPD', weapon.stats.attackSpeed.toFixed(2) + 'x')}
        ${this.stat('RNG', weapon.stats.range.toFixed(1) + 'm')}
        ${this.stat('KB', weapon.stats.knockback.toFixed(1))}
        ${this.stat('CRIT', (weapon.stats.critChance * 100).toFixed(0) + '%')}
        ${this.stat('Zone', zoneText)}
      </div>

      <div class="enhance-box">
        <div class="enhance-row"><span>Success</span><b>${info.successRate.toFixed(0)}%</b></div>
        <div class="enhance-row"><span>Cost</span><b class="stones">${info.materialCost} 💎</b></div>
        <div class="enhance-row"><span>You have</span><b class="stones">${stones} 💎</b></div>
        <button class="enhance-btn ${canAfford ? '' : 'disabled'}" data-action="enhance">
          ⚒️ Enhance Weapon
        </button>
      </div>

      <div class="abilities-title">Special Abilities (tap to equip active)</div>
      <div class="ability-list">
        ${this.abilitySystem
          .getAllSlots()
          .map((slot, i) => {
            const ability = slot.getAbility();
            const active = this.abilitySystem.getActiveSlotIndex() === i;
            if (!ability) return `<div class="ability-row empty" data-action="slot" data-slot="${i}">Slot ${i + 1}: empty</div>`;
            return `
              <div class="ability-row ${active ? 'active' : ''}" data-action="slot" data-slot="${i}">
                <div class="ability-name">${ability.icon} ${ability.name}</div>
                <div class="ability-meta">${ability.damageMultiplier.toFixed(1)}x · CD ${ability.cooldown}s</div>
              </div>`;
          })
          .join('')}
      </div>
    `;
  }

  private stat(label: string, value: string): string {
    return `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;
  }
}
