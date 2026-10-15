import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDamage,
  calculateSlowMultiplier,
  calculateUpgradeCost,
  calculateSellValue,
  calculateTowerStats,
  canAfford,
  findTarget,
  getDistance,
  getPointOnPath,
  generateRamenNoodlePath,
  isValidPlacement,
  getWaveDefinition,
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
} from './rules.ts';

test('Tower configs are correctly defined with all required spicy attributes', () => {
  assert.ok(TOWER_CONFIGS.chili_flakes, 'chili_flakes must exist');
  assert.ok(TOWER_CONFIGS.chili_oil, 'chili_oil must exist');
  assert.ok(TOWER_CONFIGS.garlic_mortar, 'garlic_mortar must exist');
  assert.ok(TOWER_CONFIGS.peppercorn, 'peppercorn must exist');
  assert.ok(TOWER_CONFIGS.habanero_cannon, 'habanero_cannon must exist');

  assert.equal(TOWER_CONFIGS.chili_flakes.baseCost, 80);
  assert.equal(TOWER_CONFIGS.habanero_cannon.baseCost, 200);
});

test('Enemy configs provide distinct archetypes and stats', () => {
  assert.ok(ENEMY_CONFIGS.scallion.baseSpeed > ENEMY_CONFIGS.chashu.baseSpeed, 'Scallions should be faster than Chashu');
  assert.ok(ENEMY_CONFIGS.chashu.baseHp > ENEMY_CONFIGS.scallion.baseHp, 'Chashu pork belly must have higher HP than scallions');
  assert.ok(ENEMY_CONFIGS.chashu.armor > 0, 'Chashu has armor');
});

test('calculateDamage handles armor reduction properly', () => {
  // rawDamage 50, armor 0 -> 50
  assert.equal(calculateDamage(50, 0), 50);

  // rawDamage 50, armor 10 -> reduction is min(10 * 0.5 = 5, 50 * 0.7 = 35) -> 45
  assert.equal(calculateDamage(50, 10), 45);

  // Extremely high armor should not reduce damage below 1
  assert.equal(calculateDamage(10, 999), 3); // reduction capped at rawDamage * 0.7 = 7, 10 - 7 = 3
  assert.equal(calculateDamage(1, 999), 1);
});

test('calculateSlowMultiplier respects bounds and multiple slows', () => {
  // No slows -> multiplier is 1.0 (100% speed)
  assert.equal(calculateSlowMultiplier([]), 1.0);

  // Chili oil slow of 0.45 -> speed multiplier is 0.55
  assert.equal(calculateSlowMultiplier([0.45]), 0.55);

  // Stacking slows takes the highest slow and caps at 0.8 (never freezes completely)
  assert.equal(calculateSlowMultiplier([0.2, 0.45, 0.6]), 0.4);
  assert.equal(calculateSlowMultiplier([0.95]), 0.2); // clamped at 0.8 slow -> 0.2 speed
});

test('calculateUpgradeCost and calculateSellValue scale appropriately', () => {
  const baseCost = 100;
  // Upgrade from Level 1 -> 2
  assert.equal(calculateUpgradeCost(baseCost, 1), 90);
  // Upgrade from Level 2 -> 3
  assert.equal(calculateUpgradeCost(baseCost, 2), 140);
  // Level 3 is maxed out
  assert.equal(calculateUpgradeCost(baseCost, 3), 0);

  // Sell value is 65%
  assert.equal(calculateSellValue(100), 65);
  assert.equal(calculateSellValue(250), 163);
});

test('calculateTowerStats increases damage, range, and fire rate with tiers', () => {
  const tier1 = calculateTowerStats('chili_flakes', 1);
  const tier2 = calculateTowerStats('chili_flakes', 2);
  const tier3 = calculateTowerStats('chili_flakes', 3);

  assert.ok(tier2.damage > tier1.damage, 'Tier 2 damage should be higher than Tier 1');
  assert.ok(tier3.damage > tier2.damage, 'Tier 3 damage should be higher than Tier 2');
  assert.ok(tier2.range > tier1.range, 'Tier 2 range should be higher than Tier 1');
  assert.ok(tier3.range > tier2.range, 'Tier 3 range should be higher than Tier 2');
});

test('canAfford evaluates player spice bankroll', () => {
  assert.equal(canAfford(100, 80), true);
  assert.equal(canAfford(80, 80), true);
  assert.equal(canAfford(79, 80), false);
});

test('findTarget prioritizes first, strongest, or closest enemy correctly', () => {
  const towerX = 200;
  const towerY = 200;
  const range = 150;

  const enemies = [
    { id: 'scallion_1', x: 220, y: 220, hp: 30, pathProgress: 0.6, koTimer: 0 },
    { id: 'chashu_1', x: 230, y: 230, hp: 500, pathProgress: 0.3, koTimer: 0 },
    { id: 'egg_1', x: 210, y: 210, hp: 150, pathProgress: 0.4, koTimer: 0 },
    { id: 'far_away', x: 600, y: 600, hp: 10, pathProgress: 0.9, koTimer: 0 },
  ];

  // 'first' should choose the one highest along the path (scallion_1 @ 0.6)
  assert.equal(findTarget(towerX, towerY, range, enemies, 'first'), 'scallion_1');

  // 'strongest' should choose chashu_1 (highest hp: 500)
  assert.equal(findTarget(towerX, towerY, range, enemies, 'strongest'), 'chashu_1');

  // 'closest' should choose egg_1 (distance sqrt(10^2 + 10^2) = 14.14)
  assert.equal(findTarget(towerX, towerY, range, enemies, 'closest'), 'egg_1');

  // Ignores dead enemies
  const enemiesWithDead = [
    { id: 'dead_scallion', x: 205, y: 205, hp: 0, pathProgress: 0.9, koTimer: 0.2 },
    { id: 'alive_scallion', x: 210, y: 210, hp: 30, pathProgress: 0.5, koTimer: 0 },
  ];
  assert.equal(findTarget(towerX, towerY, range, enemiesWithDead, 'first'), 'alive_scallion');
});

test('generateRamenNoodlePath and getPointOnPath creates spiral from rim to center', () => {
  const path = generateRamenNoodlePath(400, 400, 300, 100);
  assert.equal(path.length, 101);

  const startPt = getPointOnPath(path, 0);
  const endPt = getPointOnPath(path, 1);

  const startDist = getDistance(startPt.x, startPt.y, 400, 400);
  const endDist = getDistance(endPt.x, endPt.y, 400, 400);

  assert.ok(startDist > endDist, 'Start of path should be on outer rim while end is near center');
});

test('isValidPlacement validates placement inside bowl and prevents overlapping', () => {
  const centerX = 400;
  const centerY = 400;
  const bowlRadius = 300;
  const noodlePath = generateRamenNoodlePath(centerX, centerY, bowlRadius, 60);
  const existingTowers: Array<{ x: number; y: number }> = [{ x: 300, y: 300 }];

  // Way outside bowl
  assert.equal(isValidPlacement(900, 900, centerX, centerY, bowlRadius, existingTowers, noodlePath).valid, false);

  // Directly on center island
  assert.equal(isValidPlacement(405, 405, centerX, centerY, bowlRadius, existingTowers, noodlePath).valid, false);

  // Too close to existing tower (300, 300)
  assert.equal(isValidPlacement(310, 310, centerX, centerY, bowlRadius, existingTowers, noodlePath).valid, false);

  // Valid placement in open broth
  const validCheck = isValidPlacement(480, 420, centerX, centerY, bowlRadius, existingTowers, noodlePath);
  assert.equal(validCheck.valid, true);
});

test('getWaveDefinition produces waves with increasing challenge', () => {
  const wave1 = getWaveDefinition(1);
  const wave5 = getWaveDefinition(5);
  const wave10 = getWaveDefinition(10);
  const endlessWave12 = getWaveDefinition(12);

  assert.equal(wave1.waveNumber, 1);
  assert.equal(wave5.waveNumber, 5);
  assert.ok(wave5.spawns.some(s => s.type === 'chashu'), 'Wave 5 should include Chashu boss');
  assert.ok(wave10.spawns.length >= 4, 'Wave 10 final showdown should include many enemy types');
  assert.ok(endlessWave12.rewardSpice > wave10.rewardSpice, 'Endless waves should give more spice reward');
});
