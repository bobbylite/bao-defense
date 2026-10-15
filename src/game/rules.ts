import type { TowerType, EnemyType, TowerConfig, WaveDefinition, Point } from './types.ts';

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  chili_flakes: {
    type: 'chili_flakes',
    name: 'Chili Flakes Shaker',
    role: 'Rapid Single/Swarm Pepper Sprayer',
    description: 'Sprinkles fiery red pepper flakes rapidly. Devastating against low-HP scallion swarms.',
    baseCost: 80,
    baseRange: 130,
    baseDamage: 12,
    baseFireRate: 3.2, // shots per sec
    splashRadius: 0,
    slowAmount: 0.1,
    slowDuration: 1.0,
    burnDps: 4,
    burnDuration: 2.0,
    stunDuration: 0,
    iconColor: '#ef4444',
    accentColor: '#f97316',
  },
  chili_oil: {
    type: 'chili_oil',
    name: 'Chili Oil Fortification',
    role: 'Area Sizzle & Sticky Slow Puddle',
    description: 'Infuses broth with scalding chili crisp oil. Drastically slows toppings and sears them with burn damage.',
    baseCost: 110,
    baseRange: 110,
    baseDamage: 8,
    baseFireRate: 1.0, // pulse aura
    splashRadius: 100,
    slowAmount: 0.45,
    slowDuration: 2.5,
    burnDps: 18,
    burnDuration: 3.0,
    stunDuration: 0,
    iconColor: '#b91c1c',
    accentColor: '#dc2626',
  },
  garlic_mortar: {
    type: 'garlic_mortar',
    name: 'Fried Garlic Cruncher',
    role: 'Long-Range Explosive AOE Mortar',
    description: 'Catapults crunchy fried garlic chips high in the air, creating fragrant spicy garlic crunch blasts.',
    baseCost: 140,
    baseRange: 210,
    baseDamage: 65,
    baseFireRate: 0.65,
    splashRadius: 75,
    slowAmount: 0.15,
    slowDuration: 1.5,
    burnDps: 8,
    burnDuration: 2.0,
    stunDuration: 0.2,
    iconColor: '#d97706',
    accentColor: '#f59e0b',
  },
  peppercorn: {
    type: 'peppercorn',
    name: 'Sichuan Peppercorn',
    role: 'Numbing Mala Shock & Crowd Stun',
    description: 'Crackles with authentic tingling Sichuan mala numbing waves that stun and disrupt topping momentum.',
    baseCost: 160,
    baseRange: 140,
    baseDamage: 24,
    baseFireRate: 1.4,
    splashRadius: 50,
    slowAmount: 0.6,
    slowDuration: 2.0,
    burnDps: 0,
    burnDuration: 0,
    stunDuration: 0.7,
    iconColor: '#7c2d12',
    accentColor: '#ea580c',
  },
  habanero_cannon: {
    type: 'habanero_cannon',
    name: 'Habanero Magma Blaster',
    role: 'Heavy Boss-Melting Single Target',
    description: 'Shoots concentrated boiling habanero lava drops. High single-target armor-piercing damage.',
    baseCost: 200,
    baseRange: 170,
    baseDamage: 120,
    baseFireRate: 0.85,
    splashRadius: 25,
    slowAmount: 0.2,
    slowDuration: 1.2,
    burnDps: 35,
    burnDuration: 4.0,
    stunDuration: 0,
    iconColor: '#ea580c',
    accentColor: '#f97316',
  },
};

export interface EnemyBaseStats {
  name: string;
  baseHp: number;
  baseSpeed: number; // pixels per sec along path
  armor: number;
  spiceValue: number;
  radius: number;
  flavor: string;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyBaseStats> = {
  scallion: {
    name: 'Scallion Snippers',
    baseHp: 38,
    baseSpeed: 105,
    armor: 0,
    spiceValue: 10,
    radius: 12,
    flavor: 'Swift chopped green scallions running in swarms.',
  },
  bok_choy: {
    name: 'Bok Choy Crunchers',
    baseHp: 95,
    baseSpeed: 75,
    armor: 2,
    spiceValue: 18,
    radius: 16,
    flavor: 'Crunchy leafy green stalks weaving steadily.',
  },
  soy_egg: {
    name: 'Soy Marinated Ajitama',
    baseHp: 210,
    baseSpeed: 60,
    armor: 6,
    spiceValue: 35,
    radius: 20,
    flavor: 'Dense, soft-boiled soy egg rolling toward the center.',
  },
  menma: {
    name: 'Bamboo Shoot Menma',
    baseHp: 130,
    baseSpeed: 95,
    armor: 3,
    spiceValue: 24,
    radius: 14,
    flavor: 'Fermented bamboo strips sprinting along the noodles.',
  },
  narutomaki: {
    name: 'Spinning Narutomaki',
    baseHp: 340,
    baseSpeed: 68,
    armor: 8,
    spiceValue: 55,
    radius: 22,
    flavor: 'Iconic pink swirl fishcake with spinning deflective agility.',
  },
  chashu: {
    name: 'Braised Pork Belly (Chashu)',
    baseHp: 650,
    baseSpeed: 45,
    armor: 14,
    spiceValue: 90,
    radius: 26,
    flavor: 'Heavy, torched pork belly slab. Massive health and thick fat armor.',
  },
};

/**
 * Calculates upgrade cost for a tower based on base cost and current level (1->2 or 2->3).
 */
export function calculateUpgradeCost(baseCost: number, currentLevel: number): number {
  if (currentLevel >= 3) return 0;
  return Math.round(baseCost * (currentLevel === 1 ? 0.9 : 1.4));
}

/**
 * Calculates resale value (65% of total invested spice).
 */
export function calculateSellValue(totalInvested: number): number {
  return Math.max(10, Math.round(totalInvested * 0.65));
}

/**
 * Calculates upgraded tower stats for level 1, 2, or 3.
 */
export function calculateTowerStats(type: TowerType, level: number) {
  const cfg = TOWER_CONFIGS[type];
  const levelMultiplier = level === 1 ? 1 : level === 2 ? 1.6 : 2.4;
  const rangeMultiplier = level === 1 ? 1 : level === 2 ? 1.15 : 1.35;
  const fireRateMultiplier = level === 1 ? 1 : level === 2 ? 1.2 : 1.45;

  return {
    damage: Math.round(cfg.baseDamage * levelMultiplier),
    range: Math.round(cfg.baseRange * rangeMultiplier),
    fireRate: Number((cfg.baseFireRate * fireRateMultiplier).toFixed(2)),
    splashRadius: Math.round(cfg.splashRadius * (level > 1 ? 1.25 : 1)),
    slowAmount: Math.min(0.8, Number((cfg.slowAmount * (1 + (level - 1) * 0.25)).toFixed(2))),
    burnDps: Math.round(cfg.burnDps * levelMultiplier),
  };
}

/**
 * Computes net damage inflicted on an enemy after armor subtraction.
 */
export function calculateDamage(rawDamage: number, armor: number): number {
  const reduction = Math.min(armor * 0.5, rawDamage * 0.7);
  return Math.max(1, Math.round(rawDamage - reduction));
}

/**
 * Computes composite slow multiplier, ensuring slow never completely halts movement (clamped between 0.2 and 1.0).
 */
export function calculateSlowMultiplier(appliedSlows: number[]): number {
  if (appliedSlows.length === 0) return 1.0;
  const strongestSlow = Math.max(...appliedSlows);
  const clamped = Math.min(0.8, Math.max(0, strongestSlow));
  return Number((1.0 - clamped).toFixed(2));
}

/**
 * Evaluates whether the player can afford an action with available spice.
 */
export function canAfford(spiceAvailable: number, cost: number): boolean {
  return spiceAvailable >= cost;
}

/**
 * Euclidean distance helper
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.hypot(dx, dy);
}

/**
 * Finds optimal enemy target within tower range according to targeting priority:
 * 'first': closest to the center bowl Bao (highest pathProgress)
 * 'strongest': highest current HP
 * 'closest': shortest distance to tower
 */
export function findTarget(
  towerX: number,
  towerY: number,
  range: number,
  enemies: Array<{
    id: string;
    x: number;
    y: number;
    hp: number;
    pathProgress: number;
    koTimer: number;
  }>,
  priority: 'first' | 'strongest' | 'closest' = 'first'
): string | null {
  const inRange = enemies.filter(
    (e) => e.koTimer <= 0 && e.hp > 0 && getDistance(towerX, towerY, e.x, e.y) <= range
  );

  if (inRange.length === 0) return null;

  if (priority === 'strongest') {
    inRange.sort((a, b) => b.hp - a.hp);
    return inRange[0].id;
  }

  if (priority === 'closest') {
    inRange.sort(
      (a, b) => getDistance(towerX, towerY, a.x, a.y) - getDistance(towerX, towerY, b.x, b.y)
    );
    return inRange[0].id;
  }

  // default 'first' (highest path progress toward Bao)
  inRange.sort((a, b) => b.pathProgress - a.pathProgress);
  return inRange[0].id;
}

/**
 * Generates the ramen noodle spiral path points from bowl edge (radius ~ 360) winding inward to Bao's center (radius ~ 60).
 */
export function generateRamenNoodlePath(
  centerX: number,
  centerY: number,
  bowlRadius: number,
  numPoints: number = 240
): Point[] {
  const points: Point[] = [];
  const startRadius = bowlRadius * 0.88;
  const endRadius = bowlRadius * 0.16;
  const totalTurns = 2.75 * Math.PI * 2; // ~2.75 full rotations around the bowl

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // radius decreases as t increases
    const r = startRadius - (startRadius - endRadius) * Math.pow(t, 0.95);
    // angle rotates inwards
    const angle = t * totalTurns;
    
    // Add subtle wavy noodle curl
    const noodleWave = Math.sin(t * 28) * (8 * (1 - t * 0.5));
    const effectiveR = r + noodleWave;

    const x = centerX + Math.cos(angle) * effectiveR;
    const y = centerY + Math.sin(angle) * effectiveR;
    points.push({ x, y });
  }

  return points;
}

/**
 * Samples a point along the noodle path based on 0..1 progress.
 */
export function getPointOnPath(path: Point[], progress: number): Point {
  if (path.length === 0) return { x: 0, y: 0 };
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const exactIndex = clampedProgress * (path.length - 1);
  const indexA = Math.floor(exactIndex);
  const indexB = Math.min(path.length - 1, indexA + 1);
  const frac = exactIndex - indexA;

  const pA = path[indexA];
  const pB = path[indexB];

  return {
    x: pA.x + (pB.x - pA.x) * frac,
    y: pA.y + (pB.y - pA.y) * frac,
  };
}

/**
 * Checks if a given coordinate is a legal tower placement:
 * 1. Inside the ramen bowl rim
 * 2. Not directly inside Bao's central bamboo steamer island
 * 3. Not too close to another placed tower
 * 4. Not directly on the center noodle track (towers are placed on side broth or sockets)
 */
export function isValidPlacement(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  bowlRadius: number,
  existingTowers: Array<{ x: number; y: number }>,
  noodlePath: Point[],
  isChiliOilMoat: boolean = false
): { valid: boolean; reason?: string } {
  const distFromCenter = getDistance(x, y, centerX, centerY);

  // Outside bowl
  if (distFromCenter > bowlRadius * 0.88) {
    return { valid: false, reason: 'Outside the ramen bowl rim!' };
  }

  // Too close to center Bao steamer island (unless moat)
  if (distFromCenter < bowlRadius * 0.18) {
    return { valid: false, reason: "Too close to Bao's steamer throne!" };
  }

  // Check collision with other towers
  for (const t of existingTowers) {
    if (getDistance(x, y, t.x, t.y) < 38) {
      return { valid: false, reason: 'Too close to another spicy tower!' };
    }
  }

  // Chili Oil Fortification CAN be placed directly on or next to the noodle path (it's a puddle/moat)
  if (isChiliOilMoat) {
    return { valid: true };
  }

  // Other towers shouldn't be planted right dead center on the noodle line (leave room for toppings to crawl)
  for (let i = 0; i < noodlePath.length; i += 6) {
    const pt = noodlePath[i];
    if (getDistance(x, y, pt.x, pt.y) < 18) {
      return { valid: false, reason: 'Cannot block noodle path! Place in the broth adjacent to track.' };
    }
  }

  return { valid: true };
}

/**
 * Generates wave configuration with scaling ingredient difficulty.
 * Later waves feature faster ingredients, tanky pork belly, and boss toppings!
 */
export function getWaveDefinition(waveNum: number): WaveDefinition {
  const baseWaves: WaveDefinition[] = [
    {
      waveNumber: 1,
      title: 'Scallion Stampede',
      flavor: 'Freshly chopped green scallions tumble into the broth!',
      spawns: [
        { type: 'scallion', count: 8, interval: 1.1, delay: 0.5 },
      ],
      rewardSpice: 60,
    },
    {
      waveNumber: 2,
      title: 'Greens & Crunch',
      flavor: 'Bok Choy joins the fray with tough fibrous armor.',
      spawns: [
        { type: 'scallion', count: 10, interval: 0.9, delay: 0.5 },
        { type: 'bok_choy', count: 4, interval: 1.6, delay: 3.5 },
      ],
      rewardSpice: 75,
    },
    {
      waveNumber: 3,
      title: 'Soy Egg Avalanche',
      flavor: 'Ajitsuke Tamago rolls in, packing thick protein density!',
      spawns: [
        { type: 'scallion', count: 12, interval: 0.8, delay: 0.2 },
        { type: 'bok_choy', count: 6, interval: 1.3, delay: 2.0 },
        { type: 'soy_egg', count: 3, interval: 2.5, delay: 5.0 },
      ],
      rewardSpice: 90,
    },
    {
      waveNumber: 4,
      title: 'Bamboo Shoot Blitz',
      flavor: 'Rapid Menma bamboo shoots surge down the noodle spiral!',
      spawns: [
        { type: 'menma', count: 8, interval: 0.75, delay: 0.5 },
        { type: 'bok_choy', count: 8, interval: 1.1, delay: 2.0 },
        { type: 'soy_egg', count: 4, interval: 2.0, delay: 5.0 },
      ],
      rewardSpice: 110,
    },
    {
      waveNumber: 5,
      title: 'Chashu Boss: Braised Titan',
      flavor: 'A mammoth slab of braised Chashu Pork Belly enters the bowl!',
      spawns: [
        { type: 'scallion', count: 14, interval: 0.6, delay: 0.2 },
        { type: 'chashu', count: 1, interval: 0, delay: 4.0 },
        { type: 'soy_egg', count: 4, interval: 1.8, delay: 6.0 },
      ],
      rewardSpice: 150,
    },
    {
      waveNumber: 6,
      title: 'Narutomaki Cyclone',
      flavor: 'Spinning pink-swirl fishcakes whirlwind across the broth!',
      spawns: [
        { type: 'narutomaki', count: 5, interval: 1.8, delay: 0.5 },
        { type: 'menma', count: 10, interval: 0.7, delay: 2.5 },
        { type: 'bok_choy', count: 8, interval: 1.0, delay: 4.0 },
      ],
      rewardSpice: 160,
    },
    {
      waveNumber: 7,
      title: 'The Great Broth Rush',
      flavor: 'High-speed ingredients coordinated assault on Bao!',
      spawns: [
        { type: 'scallion', count: 20, interval: 0.45, delay: 0.2 },
        { type: 'menma', count: 12, interval: 0.6, delay: 3.0 },
        { type: 'narutomaki', count: 6, interval: 1.5, delay: 6.0 },
      ],
      rewardSpice: 180,
    },
    {
      waveNumber: 8,
      title: 'Double Chashu Juggernaut',
      flavor: 'Twin braised pork slabs with heavy soy egg vanguard!',
      spawns: [
        { type: 'soy_egg', count: 8, interval: 1.4, delay: 0.5 },
        { type: 'chashu', count: 2, interval: 3.5, delay: 4.0 },
        { type: 'menma', count: 14, interval: 0.55, delay: 7.0 },
      ],
      rewardSpice: 220,
    },
    {
      waveNumber: 9,
      title: 'Spicy Inferno Gauntlet',
      flavor: 'All topping factions unite in an overwhelming wave!',
      spawns: [
        { type: 'scallion', count: 25, interval: 0.35, delay: 0.2 },
        { type: 'bok_choy', count: 14, interval: 0.8, delay: 2.0 },
        { type: 'narutomaki', count: 8, interval: 1.2, delay: 5.0 },
        { type: 'chashu', count: 2, interval: 2.5, delay: 8.0 },
      ],
      rewardSpice: 260,
    },
    {
      waveNumber: 10,
      title: 'The Emperor Ramen Bowl (Final Showdown)',
      flavor: 'Mega Chashu Warlord accompanied by relentless topping battalions!',
      spawns: [
        { type: 'narutomaki', count: 10, interval: 1.0, delay: 0.2 },
        { type: 'soy_egg', count: 10, interval: 1.2, delay: 3.0 },
        { type: 'chashu', count: 4, interval: 2.5, delay: 6.0 },
        { type: 'menma', count: 18, interval: 0.4, delay: 10.0 },
      ],
      rewardSpice: 350,
    },
  ];

  if (waveNum <= baseWaves.length) {
    return baseWaves[waveNum - 1];
  }

  // Endless / Procedural wave generation beyond Wave 10
  const endlessLevel = waveNum - baseWaves.length;
  return {
    waveNumber: waveNum,
    title: `Endless Bowl Frenzy (Tier ${endlessLevel})`,
    flavor: 'Endless hungry waves assault Bao with hyper speed and thick armor!',
    spawns: [
      { type: 'scallion', count: 20 + endlessLevel * 3, interval: Math.max(0.2, 0.4 - endlessLevel * 0.02), delay: 0.2 },
      { type: 'menma', count: 12 + endlessLevel * 2, interval: Math.max(0.3, 0.6 - endlessLevel * 0.02), delay: 2.0 },
      { type: 'soy_egg', count: 8 + endlessLevel * 2, interval: 1.2, delay: 4.0 },
      { type: 'narutomaki', count: 6 + endlessLevel, interval: 1.2, delay: 6.0 },
      { type: 'chashu', count: 3 + Math.floor(endlessLevel * 0.7), interval: 2.0, delay: 8.0 },
    ],
    rewardSpice: 300 + endlessLevel * 40,
  };
}
