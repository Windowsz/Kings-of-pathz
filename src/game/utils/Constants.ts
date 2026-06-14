export const PALETTE = {
  bg: 0xbfe6f2,
  fog: 0xc9ecf5,
  ground: 0x8fd6a4,
  groundEdge: 0x7cc593,
  monster: 0xffaaa6,
  sword: 0xffd3b6,
  ambient: 0xffffff,
  light: 0xfff3d4,
  skyGround: 0xa9e0c2,
  outline: 0x2a2336,
};

export const GAME_CONFIG = {
  TERRAIN_SIZE: 100,
  TERRAIN_SEGMENTS: 24,
  MONSTER_SPAWN_RADIUS_MIN: 12,
  MONSTER_SPAWN_RADIUS_MAX: 22,
  INITIAL_MONSTERS: 5,
  MAX_MONSTERS: 6,
  CAMERA_HEIGHT: 2,
  PLAYER_SPEED: 35,
  PLAYER_MAX_HP: 100,
  ENEMY_MELEE_RANGE: 2.4,
  ENEMY_ATTACK_DAMAGE: 9,
  ENEMY_ATTACK_INTERVAL: 1.3,
  RESPAWN_DELAY_MS: 1600,
  TARGET_ENEMY_HEIGHT: 1.7,
  OUTLINE_ENABLED: true,
  OUTLINE_THICKNESS: 0.04,
};

/** A clip can be referenced by its name or by its index in the GLTF animations array. */
export type ClipRef = string | number;

export interface EnemyConfig {
  key: string;
  model: string;
  displayName: string;
  hp: number;
  speed: number;
  scoreValue: number;
  /** which animation to use for each state; falls back to index 0 when missing */
  clips: { idle?: ClipRef; walk?: ClipRef; run?: ClipRef };
  /** optional flat color override applied to the whole model */
  tint?: number;
  /** extra yaw (radians) to correct the model's forward axis */
  facingOffset?: number;
}

export const ENEMY_TYPES: EnemyConfig[] = [
  {
    key: 'fox',
    model: '/models/fox.glb',
    displayName: 'Forest Beast',
    hp: 40,
    speed: 2.3,
    scoreValue: 10,
    clips: { idle: 'Survey', walk: 'Walk', run: 'Run' },
    facingOffset: Math.PI,
  },
  {
    key: 'walker',
    model: '/models/walker.glb',
    displayName: 'Lost Wanderer',
    hp: 60,
    speed: 1.8,
    scoreValue: 15,
    clips: { walk: 0 },
  },
  {
    key: 'robot',
    model: '/models/robot.glb',
    displayName: 'Iron Construct',
    hp: 95,
    speed: 1.3,
    scoreValue: 30,
    clips: { walk: 0 },
  },
];
