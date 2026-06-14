export enum WeaponType {
  SWORD = 'sword',
  AXE = 'axe',
  SPEAR = 'spear',
  HAMMER = 'hammer',
}

export interface WeaponStats {
  baseDamage: number;
  attackSpeed: number;
  range: number;
  knockback: number;
  critChance: number;
}

export interface WeaponItem {
  id: string;
  type: WeaponType;
  enhancement: number;
  stats: WeaponStats;
}

export const ENHANCEMENT_CONSTANTS = {
  SAFE_ZONE_MAX: 7,
  MAX_ENHANCEMENT: 20,
  BASE_SUCCESS_RATES: [100, 95, 90, 85, 80, 75, 65, 55, 45, 35, 25, 20, 15, 12, 10, 8, 6, 5, 4, 3],
  BASE_COSTS: [10, 15, 20, 30, 40, 55, 75, 100, 130, 170, 220, 280, 350, 430, 520, 620, 730, 850, 980, 1120],
};

const BASE_STATS: Record<WeaponType, WeaponStats> = {
  [WeaponType.SWORD]: { baseDamage: 20, attackSpeed: 1.0, range: 3.5, knockback: 1.0, critChance: 0.15 },
  [WeaponType.AXE]:   { baseDamage: 28, attackSpeed: 0.8, range: 3.0, knockback: 1.5, critChance: 0.10 },
  [WeaponType.SPEAR]: { baseDamage: 18, attackSpeed: 1.1, range: 5.0, knockback: 0.8, critChance: 0.20 },
  [WeaponType.HAMMER]:{ baseDamage: 35, attackSpeed: 0.6, range: 2.5, knockback: 2.5, critChance: 0.05 },
};

function applyEnhancement(base: WeaponStats, enhancement: number): WeaponStats {
  const bonus = 1 + enhancement * 0.08;
  return {
    baseDamage:   parseFloat((base.baseDamage * bonus).toFixed(2)),
    attackSpeed:  parseFloat((base.attackSpeed * (1 + enhancement * 0.02)).toFixed(3)),
    range:        parseFloat((base.range + enhancement * 0.05).toFixed(2)),
    knockback:    parseFloat((base.knockback * (1 + enhancement * 0.03)).toFixed(2)),
    critChance:   parseFloat(Math.min(0.75, base.critChance + enhancement * 0.005).toFixed(3)),
  };
}

export class WeaponSystem {
  private weapons: WeaponItem[] = [];
  private equippedId: string | null = null;
  private enhancementStones: number = 0;
  private nextId: number = 1;

  public createWeapon(type: WeaponType): WeaponItem {
    const base = BASE_STATS[type];
    const weapon: WeaponItem = {
      id: `weapon_${this.nextId++}`,
      type,
      enhancement: 0,
      stats: { ...base },
    };
    this.weapons.push(weapon);
    return weapon;
  }

  public equipWeapon(id: string): void {
    const weapon = this.weapons.find((w) => w.id === id);
    if (weapon) {
      this.equippedId = id;
    }
  }

  public getAllWeapons(): WeaponItem[] {
    return this.weapons;
  }

  public getEquippedWeapon(): WeaponItem | null {
    return this.weapons.find((w) => w.id === this.equippedId) ?? null;
  }

  public enhanceWeapon(id: string): { success: boolean; message: string } {
    const weapon = this.weapons.find((w) => w.id === id);
    if (!weapon) {
      return { success: false, message: 'Weapon not found.' };
    }
    if (weapon.enhancement >= ENHANCEMENT_CONSTANTS.MAX_ENHANCEMENT) {
      return { success: false, message: `Already at max enhancement +${ENHANCEMENT_CONSTANTS.MAX_ENHANCEMENT}.` };
    }

    const info = this.getEnhancementInfo(weapon.enhancement);
    if (this.enhancementStones < info.materialCost) {
      return { success: false, message: `Not enough stones. Need ${info.materialCost}, have ${this.enhancementStones}.` };
    }

    this.enhancementStones -= info.materialCost;
    const roll = Math.random() * 100;

    if (roll < info.successRate) {
      weapon.enhancement += 1;
      weapon.stats = applyEnhancement(BASE_STATS[weapon.type], weapon.enhancement);
      return { success: true, message: `Enhancement success! ${weapon.type.toUpperCase()} is now +${weapon.enhancement}.` };
    } else {
      const penalty = !info.inSafeZone && weapon.enhancement > 0 ? 1 : 0;
      weapon.enhancement = Math.max(0, weapon.enhancement - penalty);
      weapon.stats = applyEnhancement(BASE_STATS[weapon.type], weapon.enhancement);
      return {
        success: false,
        message: penalty > 0
          ? `Enhancement failed! ${weapon.type.toUpperCase()} degraded to +${weapon.enhancement}.`
          : `Enhancement failed. ${weapon.type.toUpperCase()} stays at +${weapon.enhancement}.`,
      };
    }
  }

  public addEnhancementStones(count: number): void {
    this.enhancementStones += count;
  }

  public getEnhancementStones(): number {
    return this.enhancementStones;
  }

  public getEnhancementInfo(enhancement: number): {
    inSafeZone: boolean;
    successRate: number;
    materialCost: number;
  } {
    const idx = Math.min(enhancement, ENHANCEMENT_CONSTANTS.BASE_SUCCESS_RATES.length - 1);
    return {
      inSafeZone: enhancement < ENHANCEMENT_CONSTANTS.SAFE_ZONE_MAX,
      successRate: ENHANCEMENT_CONSTANTS.BASE_SUCCESS_RATES[idx],
      materialCost: ENHANCEMENT_CONSTANTS.BASE_COSTS[idx],
    };
  }
}
