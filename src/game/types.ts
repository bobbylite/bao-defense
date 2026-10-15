export type TowerType =
  | 'chili_flakes'
  | 'chili_oil'
  | 'garlic_mortar'
  | 'peppercorn'
  | 'habanero_cannon';

export type EnemyType =
  | 'scallion'
  | 'bok_choy'
  | 'soy_egg'
  | 'chashu'
  | 'menma'
  | 'narutomaki';

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface Point {
  x: number;
  y: number;
}

export interface TowerConfig {
  type: TowerType;
  name: string;
  role: string;
  description: string;
  baseCost: number;
  baseRange: number;
  baseDamage: number;
  baseFireRate: number; // shots per second
  splashRadius: number;
  slowAmount: number; // 0 to 0.8
  slowDuration: number;
  burnDps: number;
  burnDuration: number;
  stunDuration: number;
  iconColor: string;
  accentColor: string;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  level: number; // 1, 2, or 3
  lastFired: number;
  targetId: string | null;
  rotation: number;
  kills: number;
  totalDamage: number;
  range: number;
  damage: number;
  fireRate: number;
  cost: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  pathProgress: number; // 0 to 1 along the noodle spiral
  maxHp: number;
  hp: number;
  baseSpeed: number;
  speed: number;
  armor: number;
  spiceValue: number;
  radius: number;
  slowTimer: number;
  slowMultiplier: number;
  burnTimer: number;
  burnDps: number;
  stunTimer: number;
  wobblePhase: number;
  koTimer: number; // death animation timer
  isBoss?: boolean;
}

export interface Projectile {
  id: string;
  sourceType: TowerType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetEnemyId: string | null;
  speed: number;
  damage: number;
  splashRadius: number;
  slowAmount: number;
  slowDuration: number;
  burnDps: number;
  burnDuration: number;
  stunDuration: number;
  color: string;
  size: number;
  progress: number; // for mortar arcs
  isArc?: boolean;
}

export interface ChiliOilPuddle {
  id: string;
  x: number;
  y: number;
  radius: number;
  slowAmount: number;
  burnDps: number;
  level: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  shape?: 'circle' | 'flake' | 'spark' | 'smoke' | 'text' | 'star';
  text?: string;
}

export interface WaveSpawnItem {
  type: EnemyType;
  count: number;
  interval: number;
  delay: number;
}

export interface WaveDefinition {
  waveNumber: number;
  title: string;
  flavor: string;
  spawns: WaveSpawnItem[];
  rewardSpice: number;
}

export interface GameStats {
  score: number;
  wave: number;
  maxWave: number;
  spEarned: number;
  enemiesDefeated: number;
  spicyTowersPlaced: number;
  baoHp: number;
  maxBaoHp: number;
  spicePoints: number;
  superEnergy: number; // 0 to 100 for Chili Frenzy
}
