export enum SpecialAbilityType {
  SLASH = 'slash',
  WHIRLWIND = 'whirlwind',
  PIERCE = 'pierce',
  SHOCKWAVE = 'shockwave',
  SPIN_ATTACK = 'spin_attack',
  CHARGING_BLOW = 'charging_blow',
}

export interface SpecialAbility {
  id: string;
  type: SpecialAbilityType;
  name: string;
  damageMultiplier: number;
  cooldown: number;
  currentCooldown: number;
  range: number;
  description: string;
  icon: string;
  minEnhancementRequired: number;
}

export const SPECIAL_ABILITIES: Record<SpecialAbilityType, Omit<SpecialAbility, 'id' | 'currentCooldown'>> = {
  [SpecialAbilityType.SLASH]: {
    type: SpecialAbilityType.SLASH,
    name: '✂️ Quick Slash',
    damageMultiplier: 1.5,
    cooldown: 3,
    range: 3.5,
    description: 'Fast slash dealing 1.5x damage',
    icon: '✂️',
    minEnhancementRequired: 0,
  },
  [SpecialAbilityType.WHIRLWIND]: {
    type: SpecialAbilityType.WHIRLWIND,
    name: '🌪️ Whirlwind',
    damageMultiplier: 2.0,
    cooldown: 6,
    range: 4.5,
    description: 'Spin around hitting all enemies. 2.0x damage to all',
    icon: '🌪️',
    minEnhancementRequired: 5,
  },
  [SpecialAbilityType.PIERCE]: {
    type: SpecialAbilityType.PIERCE,
    name: '🔱 Piercing Thrust',
    damageMultiplier: 2.5,
    cooldown: 5,
    range: 6.0,
    description: 'Pierces through enemies. 2.5x damage, longer range',
    icon: '🔱',
    minEnhancementRequired: 7,
  },
  [SpecialAbilityType.SHOCKWAVE]: {
    type: SpecialAbilityType.SHOCKWAVE,
    name: '⚡ Shockwave',
    damageMultiplier: 3.0,
    cooldown: 8,
    range: 8.0,
    description: 'Massive blast. 3.0x damage, pushes enemies back',
    icon: '⚡',
    minEnhancementRequired: 10,
  },
  [SpecialAbilityType.SPIN_ATTACK]: {
    type: SpecialAbilityType.SPIN_ATTACK,
    name: '🔴 Spin Attack',
    damageMultiplier: 2.2,
    cooldown: 7,
    range: 5.0,
    description: 'Full rotation strike. 2.2x damage to all nearby enemies',
    icon: '🔴',
    minEnhancementRequired: 8,
  },
  [SpecialAbilityType.CHARGING_BLOW]: {
    type: SpecialAbilityType.CHARGING_BLOW,
    name: '💥 Charging Blow',
    damageMultiplier: 3.5,
    cooldown: 10,
    range: 4.0,
    description: 'Charge and release. 3.5x damage, massive knockback',
    icon: '💥',
    minEnhancementRequired: 12,
  },
};

export class SpecialAbilitySlot {
  private slotIndex: number;
  private ability: SpecialAbility | null = null;

  constructor(slotIndex: number) {
    this.slotIndex = slotIndex;
  }

  public setAbility(abilityType: SpecialAbilityType): boolean {
    const baseAbility = SPECIAL_ABILITIES[abilityType];
    this.ability = {
      ...baseAbility,
      id: `ability_${this.slotIndex}_${Date.now()}`,
      currentCooldown: 0,
    };
    return true;
  }

  public getAbility(): SpecialAbility | null {
    return this.ability;
  }

  public canUseAbility(): boolean {
    if (!this.ability) return false;
    return this.ability.currentCooldown <= 0;
  }

  public useAbility(): boolean {
    if (!this.canUseAbility()) return false;
    if (this.ability) {
      this.ability.currentCooldown = this.ability.cooldown;
    }
    return true;
  }

  public update(delta: number): void {
    if (this.ability && this.ability.currentCooldown > 0) {
      this.ability.currentCooldown = Math.max(0, this.ability.currentCooldown - delta);
    }
  }

  public getCooldownPercent(): number {
    if (!this.ability) return 0;
    return Math.max(0, Math.min(1, this.ability.currentCooldown / this.ability.cooldown));
  }
}

export class SpecialAbilitySystem {
  private slots: SpecialAbilitySlot[] = [];
  private maxSlots: number = 3;
  private activeSlotIndex: number = 0;

  constructor(maxSlots: number = 3) {
    this.maxSlots = maxSlots;
    for (let i = 0; i < maxSlots; i++) {
      this.slots.push(new SpecialAbilitySlot(i));
    }
    // Set default abilities
    this.slots[0].setAbility(SpecialAbilityType.SLASH);
    if (this.slots[1]) this.slots[1].setAbility(SpecialAbilityType.WHIRLWIND);
    if (this.slots[2]) this.slots[2].setAbility(SpecialAbilityType.PIERCE);
  }

  public setAbilityInSlot(slotIndex: number, abilityType: SpecialAbilityType): boolean {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return false;
    const slot = this.slots[slotIndex];
    return slot.setAbility(abilityType);
  }

  public getSlot(index: number): SpecialAbilitySlot | null {
    if (index < 0 || index >= this.slots.length) return null;
    return this.slots[index];
  }

  public getActiveAbility(): SpecialAbility | null {
    const slot = this.slots[this.activeSlotIndex];
    return slot ? slot.getAbility() : null;
  }

  public switchSlot(index: number): boolean {
    if (index < 0 || index >= this.slots.length) return false;
    this.activeSlotIndex = index;
    return true;
  }

  public useActiveAbility(): boolean {
    const slot = this.slots[this.activeSlotIndex];
    if (!slot) return false;
    return slot.useAbility();
  }

  public canUseActiveAbility(): boolean {
    const slot = this.slots[this.activeSlotIndex];
    if (!slot) return false;
    return slot.canUseAbility();
  }

  public getActiveSlotIndex(): number {
    return this.activeSlotIndex;
  }

  public getAllSlots(): SpecialAbilitySlot[] {
    return this.slots;
  }

  public update(delta: number): void {
    this.slots.forEach((slot) => slot.update(delta));
  }

  public getAvailableAbilitiesForEnhancement(enhancement: number): SpecialAbilityType[] {
    return Object.values(SpecialAbilityType).filter((type) => {
      const ability = SPECIAL_ABILITIES[type as SpecialAbilityType];
      return ability.minEnhancementRequired <= enhancement;
    });
  }
}
