import { WeaponItem, WeaponSystem, ENHANCEMENT_CONSTANTS } from '@/game/entities/WeaponSystem';
import { SpecialAbilitySystem, SpecialAbilityType, SPECIAL_ABILITIES } from '@/game/entities/SpecialAbilitySystem';

export class WeaponUIManager {
  private weaponSystem: WeaponSystem;
  private abilitySystem: SpecialAbilitySystem;
  private container: HTMLElement;
  private isOpen: boolean = false;

  constructor(weaponSystem: WeaponSystem, abilitySystem: SpecialAbilitySystem) {
    this.weaponSystem = weaponSystem;
    this.abilitySystem = abilitySystem;
    this.container = document.createElement('div');
    this.container.id = 'weapon-ui';
    this.setupStyles();
    document.body.appendChild(this.container);
    this.createUI();
  }

  private setupStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      #weapon-ui {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #FFD700;
        border-radius: 8px;
        padding: 15px;
        max-width: 350px;
        color: #fff;
        font-family: monospace;
        z-index: 20;
        display: none;
      }

      #weapon-ui.open {
        display: block;
      }

      .weapon-info {
        margin-bottom: 15px;
        font-size: 12px;
      }

      .weapon-title {
        font-weight: bold;
        color: #FFD700;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-label {
        color: #999;
      }

      .stat-value {
        color: #0F0;
        font-weight: bold;
      }

      .enhancement-zone {
        color: #FF6B6B;
        font-weight: bold;
      }

      .enhancement-zone.safe {
        color: #0F0;
      }

      .enhancement-info {
        margin-top: 10px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        margin-bottom: 15px;
      }

      .stones {
        color: #00BFFF;
        font-weight: bold;
      }

      .abilities-section {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #FFD700;
      }

      .abilities-title {
        color: #00FFFF;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .ability-slot {
        background: rgba(0, 150, 255, 0.2);
        border: 1px solid #00BFFF;
        border-radius: 4px;
        padding: 6px;
        margin-bottom: 6px;
        font-size: 11px;
      }

      .ability-slot.active {
        background: rgba(255, 0, 0, 0.3);
        border-color: #FF0000;
      }

      .ability-name {
        color: #00FFFF;
        font-weight: bold;
      }

      .ability-cooldown {
        color: #FFD700;
        float: right;
      }

      .ability-cooldown.ready {
        color: #00FF00;
      }

      .ability-desc {
        color: #999;
        font-size: 10px;
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  private createUI(): void {
    this.update();
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.container.classList.add('open');
    } else {
      this.container.classList.remove('open');
    }
  }

  public update(): void {
    const weapon = this.weaponSystem.getEquippedWeapon();
    if (!weapon) return;

    const info = this.weaponSystem.getEnhancementInfo(weapon.enhancement);
    const stones = this.weaponSystem.getEnhancementStones();
    const inSafeZone = info.inSafeZone;
    const zoneText = inSafeZone ? '✓ SAFE ZONE' : '⚠ DANGER ZONE';
    const zoneColor = inSafeZone ? 'safe' : '';

    // Build ability slots HTML
    let abilitiesHTML = '<div class="abilities-section"><div class="abilities-title">🛡️ SPECIAL ABILITIES</div>';
    
    this.abilitySystem.getAllSlots().forEach((slot, index) => {
      const ability = slot.getAbility();
      const isActive = this.abilitySystem.getActiveSlotIndex() === index;
      const canUse = slot.canUseAbility();
      const cooldownPercent = slot.getCooldownPercent();
      
      const activeClass = isActive ? 'active' : '';
      const readyClass = canUse ? 'ready' : '';
      
      if (ability) {
        const cooldownText = canUse ? '✓ Ready' : `${(cooldownPercent * 100).toFixed(0)}%`;
        abilitiesHTML += `
          <div class="ability-slot ${activeClass}">
            <div class="ability-name">${ability.icon} ${ability.name} (${index + 1})</div>
            <div class="ability-cooldown ${readyClass}">${cooldownText}</div>
            <div class="ability-desc">${ability.description}</div>
            <div class="stat-row" style="border: none; margin-top: 2px;">
              <span style="color: #FF6B6B;">DMG: ${ability.damageMultiplier.toFixed(1)}x</span>
              <span style="color: #00FFFF;">CD: ${ability.cooldown.toFixed(1)}s</span>
            </div>
          </div>
        `;
      }
    });
    
    abilitiesHTML += '</div>';

    this.container.innerHTML = `
      <div class="weapon-info">
        <div class="weapon-title">⚔️ ${weapon.type.toUpperCase()} +${weapon.enhancement}</div>
        <div class="stat-row">
          <span class="stat-label">DMG:</span>
          <span class="stat-value">${weapon.stats.baseDamage.toFixed(1)}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">SPD:</span>
          <span class="stat-value">${weapon.stats.attackSpeed.toFixed(2)}x</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">RNG:</span>
          <span class="stat-value">${weapon.stats.range.toFixed(1)}m</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">KB:</span>
          <span class="stat-value">${weapon.stats.knockback.toFixed(1)}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">CRIT:</span>
          <span class="stat-value">${(weapon.stats.critChance * 100).toFixed(1)}%</span>
        </div>
        <div class="stat-row" style="border: none; margin-top: 10px;">
          <span class="stat-label">Zone:</span>
          <span class="enhancement-zone ${zoneColor}">${zoneText}</span>
        </div>
        <div class="enhancement-info">
          <div class="stat-row">
            <span class="stat-label">Success Rate:</span>
            <span class="stat-value">${info.successRate.toFixed(0)}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cost:</span>
            <span class="stones">${info.materialCost} stones</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Available:</span>
            <span class="stones">${stones} stones</span>
          </div>
        </div>
      </div>
      ${abilitiesHTML}
    `;
  }
}
