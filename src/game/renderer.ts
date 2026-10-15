import type { Tower, Enemy, Projectile, Particle, Point } from './types.ts';
import { TOWER_CONFIGS, ENEMY_CONFIGS } from './rules.ts';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  bowlRadius: number;
  noodlePath: Point[];
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  selectedTowerId: string | null;
  hoveredPos: Point | null;
  placingTowerType: string | null;
  isPlacementValid: boolean;
  placementRange: number;
  baoHp: number;
  maxBaoHp: number;
  superEnergy: number;
  cameraShake: number;
  gameTime: number;
}

export function renderGameScene(rc: RenderContext) {
  const { ctx, width, height, centerX, centerY, bowlRadius, cameraShake, gameTime } = rc;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Apply Camera Shake (trauma * trauma offset)
  if (cameraShake > 0) {
    const shakeAmount = cameraShake * 10;
    const shakeX = (Math.random() * 2 - 1) * shakeAmount;
    const shakeY = (Math.random() * 2 - 1) * shakeAmount;
    ctx.translate(shakeX, shakeY);
  }

  // 1. Draw Table & Bowl Shadow
  drawBackgroundTable(ctx, width, height);

  // 2. Draw Ceramic Ramen Bowl Rim & Interior
  drawRamenBowl(ctx, centerX, centerY, bowlRadius, gameTime);

  // 3. Draw Curled Ramen Noodle Paths
  drawNoodlePath(ctx, rc.noodlePath, gameTime);

  // 4. Draw Towers (Base & Fortifications)
  drawTowers(ctx, rc.towers, rc.selectedTowerId, gameTime);

  // 5. Draw Enemies (Ramen Toppings)
  drawEnemies(ctx, rc.enemies, gameTime);

  // 6. Draw Center Bamboo Steamer & Bao (The Pork Bun Hero)
  drawBaoSanctuary(ctx, centerX, centerY, bowlRadius * 0.16, rc.baoHp, rc.maxBaoHp, rc.superEnergy, gameTime);

  // 7. Draw Projectiles & Sizzles
  drawProjectiles(ctx, rc.projectiles, gameTime);

  // 8. Draw Floating Particles, Embers & Floating Damage Numbers
  drawParticles(ctx, rc.particles);

  // 9. Draw Placement Preview & Range Ring
  if (rc.placingTowerType && rc.hoveredPos) {
    drawPlacementPreview(
      ctx,
      rc.hoveredPos.x,
      rc.hoveredPos.y,
      rc.placementRange,
      rc.isPlacementValid,
      rc.placingTowerType,
      gameTime
    );
  }

  // 10. Draw Selected Tower Range & Highlight
  if (rc.selectedTowerId) {
    const selTower = rc.towers.find((t) => t.id === rc.selectedTowerId);
    if (selTower) {
      drawSelectedTowerHighlight(ctx, selTower, gameTime);
    }
  }

  ctx.restore();
}

/**
 * Japanese dining table counter with warm wooden grain
 */
function drawBackgroundTable(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Rich dark lacquered wood background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1c1917');
  bgGrad.addColorStop(0.5, '#292524');
  bgGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle wood plank lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = 40; y < height; y += 70) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Ceramic Ramen Bowl: Rim with Seigaiha wave pattern, glossy porcelain, and steaming broth
 */
function drawRamenBowl(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  gameTime: number
) {
  // Outer soft bowl shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
  ctx.fillStyle = '#0c0a09';
  ctx.fill();
  ctx.restore();

  // Ceramic Rim (Black matte porcelain with gold lip)
  const rimGrad = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius + 24);
  rimGrad.addColorStop(0, '#292524');
  rimGrad.addColorStop(0.7, '#1c1917');
  rimGrad.addColorStop(1, '#0c0a09');

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 24, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Gold Trim Lip
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Interior Ceramic Bowl Edge
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Savory Broth (Rich golden-amber Tonkotsu/Shoyu gradient)
  const brothGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, radius);
  brothGrad.addColorStop(0, '#78350f');   // warm spicy center
  brothGrad.addColorStop(0.4, '#92400e'); // rich tonkotsu amber
  brothGrad.addColorStop(0.75, '#b45309'); // golden broth glow
  brothGrad.addColorStop(1, '#451a03');   // deep broth shadow near bowl edge

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = brothGrad;
  ctx.fill();

  // Swirling broth steam and chili oil slicks on the broth surface
  ctx.save();
  ctx.clip(); // stay within bowl

  // Drifting red chili oil droplets
  const oilCount = 18;
  for (let i = 0; i < oilCount; i++) {
    const angle = (i * (Math.PI * 2) / oilCount) + gameTime * 0.15;
    const dist = (radius * 0.35) + Math.sin(gameTime * 0.5 + i) * (radius * 0.4);
    const ox = cx + Math.cos(angle) * dist;
    const oy = cy + Math.sin(angle) * dist;
    const r = 5 + (i % 4) * 3;

    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.35)'; // crimson chili oil bead
    ctx.fill();
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Floating toasted sesame seeds on broth
  for (let i = 0; i < 28; i++) {
    const seedAngle = i * 2.39996 + gameTime * 0.04;
    const seedDist = (i * 11) % (radius * 0.85);
    const sx = cx + Math.cos(seedAngle) * seedDist;
    const sy = cy + Math.sin(seedAngle) * seedDist;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(seedAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef3c7'; // toasted white sesame seed
    ctx.fill();
    ctx.restore();
  }

  // Steaming Broth concentric currents
  for (let r = 80; r < radius - 30; r += 70) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.08)';
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Ramen Noodle spiral path winding from outer rim to center Bao
 */
function drawNoodlePath(ctx: CanvasRenderingContext2D, path: Point[], gameTime: number) {
  if (path.length < 2) return;

  // 1. Noodle shadow track
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.55)';
  ctx.lineWidth = 36;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 2. Main golden ramen noodles (multiple intertwining strands)
  ctx.strokeStyle = '#f59e0b'; // rich ramen egg noodle yellow
  ctx.lineWidth = 26;
  ctx.stroke();

  // 3. Highlighted noodle crests
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 14;
  ctx.stroke();

  // 4. Subtle directional broth ripples along path to indicate flow towards center
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 18]);
  ctx.lineDashOffset = -gameTime * 45; // moving inward
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Center Bamboo Steamer & Bao (Pork Bun Hero)
 */
function drawBaoSanctuary(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  baoHp: number,
  maxBaoHp: number,
  superEnergy: number,
  gameTime: number
) {
  ctx.save();

  // Bamboo Steamer Lid Throne Shadow
  ctx.beginPath();
  ctx.arc(cx, cy + 6, radius + 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fill();

  // Woven Bamboo Steamer Platform
  const bambooGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius + 4);
  bambooGrad.addColorStop(0, '#fef3c7');
  bambooGrad.addColorStop(0.7, '#d97706');
  bambooGrad.addColorStop(1, '#92400e');

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
  ctx.fillStyle = bambooGrad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Bamboo slats pattern
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.lineWidth = 2;
  for (let offset = -radius + 8; offset < radius - 8; offset += 12) {
    const halfChord = Math.sqrt(Math.max(0, radius * radius - offset * offset));
    ctx.beginPath();
    ctx.moveTo(cx + offset, cy - halfChord);
    ctx.lineTo(cx + offset, cy + halfChord);
    ctx.stroke();
  }

  // Narutomaki Garnish ring under Bao
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Steaming wisps rising from Bao
  for (let s = 0; s < 3; s++) {
    const steamX = cx + (s - 1) * 14 + Math.sin(gameTime * 2 + s) * 5;
    const steamY = cy - radius - 8 - ((gameTime * 25 + s * 16) % 35);
    ctx.beginPath();
    ctx.arc(steamX, steamY, 6 + s, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 - (s * 0.08)})`;
    ctx.fill();
  }

  // BAO (The Pork Bun Hero)
  // Squash and stretch breathing animation
  const isHurt = baoHp < maxBaoHp * 0.35;
  const isSuperReady = superEnergy >= 100;
  const breath = Math.sin(gameTime * 3) * 0.05;
  const scaleX = 1 + breath;
  const scaleY = 1 - breath;

  ctx.translate(cx, cy);
  ctx.scale(scaleX, scaleY);

  // Super ready aura
  if (isSuperReady) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65 + Math.sin(gameTime * 8) * 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Bao body (Fluffy white steamed bun with crimps on top)
  const baoBodyGrad = ctx.createRadialGradient(-6, -10, 4, 0, 0, radius * 0.55);
  baoBodyGrad.addColorStop(0, '#ffffff');
  baoBodyGrad.addColorStop(0.7, '#fffbeb');
  baoBodyGrad.addColorStop(1, isHurt ? '#fed7aa' : '#fef3c7');

  ctx.beginPath();
  ctx.ellipse(0, 2, radius * 0.52, radius * 0.44, 0, 0, Math.PI * 2);
  ctx.fillStyle = baoBodyGrad;
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Bao top crimps/folds (the signature steamed bun swirl)
  ctx.beginPath();
  ctx.arc(0, -radius * 0.34, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a';
  ctx.fill();

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  for (let f = 0; f < 6; f++) {
    const foldAngle = (f * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.34);
    ctx.lineTo(Math.cos(foldAngle) * 9, -radius * 0.34 + Math.sin(foldAngle) * 7);
    ctx.stroke();
  }

  // Kawaii Face
  // Rosy cheeks
  ctx.beginPath();
  ctx.arc(-13, 5, 4.5, 0, Math.PI * 2);
  ctx.arc(13, 5, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.fill();

  // Eyes (happy winking or shocked if low HP)
  ctx.fillStyle = '#1c1917';
  if (isHurt) {
    // Worried eyes
    ctx.beginPath();
    ctx.arc(-8, 0, 3, 0, Math.PI * 2);
    ctx.arc(8, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sweat drop
    ctx.beginPath();
    ctx.arc(15, -8, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
  } else {
    // Happy twinkling eyes
    ctx.beginPath();
    ctx.arc(-8, 0, 3, 0, Math.PI * 2);
    ctx.arc(8, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-9, -1, 1.2, 0, Math.PI * 2);
    ctx.arc(7, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cute mouth
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  if (isHurt) {
    ctx.arc(0, 10, 4, Math.PI, 0); // frown
  } else {
    ctx.arc(0, 4, 3.5, 0, Math.PI); // cute smile
  }
  ctx.stroke();

  // Fiery Master Chef Headband
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-17, -9, 34, 4.5);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -7, 2.5, 0, Math.PI * 2); // sun crest on headband
  ctx.fill();

  ctx.restore();
}

/**
 * Draw all placed towers with animated elements
 */
function drawTowers(
  ctx: CanvasRenderingContext2D,
  towers: Tower[],
  selectedId: string | null,
  gameTime: number
) {
  for (const tower of towers) {
    ctx.save();
    ctx.translate(tower.x, tower.y);

    const isSelected = tower.id === selectedId;

    if (tower.type === 'chili_oil') {
      // Chili Oil Fortification: Bubbling puddle moat
      drawChiliOilFortification(ctx, tower, gameTime, isSelected);
    } else if (tower.type === 'chili_flakes') {
      drawChiliFlakesTower(ctx, tower, gameTime, isSelected);
    } else if (tower.type === 'garlic_mortar') {
      drawGarlicMortarTower(ctx, tower, gameTime, isSelected);
    } else if (tower.type === 'peppercorn') {
      drawPeppercornTower(ctx, tower, gameTime, isSelected);
    } else if (tower.type === 'habanero_cannon') {
      drawHabaneroCannonTower(ctx, tower, gameTime, isSelected);
    }

    // Level pips (stars / chili peppers)
    drawLevelPips(ctx, tower.level);

    ctx.restore();
  }
}

/**
 * Chili Flakes Shaker Tower
 */
function drawChiliFlakesTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  gameTime: number,
  isSelected: boolean
) {
  // Shadow
  ctx.beginPath();
  ctx.ellipse(0, 6, 16, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Base platform
  ctx.beginPath();
  ctx.arc(0, 2, 17, 0, Math.PI * 2);
  ctx.fillStyle = '#451a03';
  ctx.fill();
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotating Shaker Body
  ctx.rotate(tower.rotation);

  // Glass/Steel Shaker
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(-10, -14, 20, 22, [4]);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Shaker holes lid
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-11, -18, 22, 5);
  ctx.fillStyle = '#0f172a';
  for (let i = -7; i <= 7; i += 5) {
    ctx.fillRect(i, -17, 2, 3);
  }

  // Inside red flakes vibrating
  ctx.fillStyle = '#fbbf24';
  for (let i = 0; i < 4; i++) {
    const fx = -6 + (i * 4);
    const fy = -9 + Math.sin(gameTime * 12 + i) * 2;
    ctx.fillRect(fx, fy, 2, 2);
  }
}

/**
 * Chili Oil Fortification: Bubbling spicy pool moat
 */
function drawChiliOilFortification(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  gameTime: number,
  isSelected: boolean
) {
  const pulse = Math.sin(gameTime * 4) * 3;
  const radius = 24 + (tower.level * 4) + pulse;

  // Molten crimson oil pool
  const oilGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
  oilGrad.addColorStop(0, '#ef4444');
  oilGrad.addColorStop(0.5, '#dc2626');
  oilGrad.addColorStop(0.85, '#991b1b');
  oilGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = oilGrad;
  ctx.fill();

  // Bubbles bursting in chili crisp
  for (let b = 0; b < 5; b++) {
    const angle = b * 1.25 + gameTime * 2;
    const dist = (b * 6) % (radius * 0.7);
    const bx = Math.cos(angle) * dist;
    const by = Math.sin(angle) * dist;

    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
  }

  // Center spicy oil jar dispenser
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#7f1d1d';
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Floating chili flakes in oil
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-2, -2, 4, 4);
}

/**
 * Fried Garlic Cruncher Mortar Tower
 */
function drawGarlicMortarTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  gameTime: number,
  isSelected: boolean
) {
  // Shadow
  ctx.beginPath();
  ctx.ellipse(0, 8, 20, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Mortar Stone/Clay Base
  ctx.beginPath();
  ctx.arc(0, 3, 19, 0, Math.PI * 2);
  ctx.fillStyle = '#78350f';
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.rotate(tower.rotation);

  // Mortar Tube / Bowl
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#451a03';
  ctx.fill();

  // Garlic chip cannon barrel
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-6, -18, 12, 14);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-6, -18, 12, 14);

  // Golden crispy garlic slice in barrel
  ctx.beginPath();
  ctx.arc(0, -16, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fef3c7';
  ctx.fill();
}

/**
 * Sichuan Peppercorn Mala Totem
 */
function drawPeppercornTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  gameTime: number,
  isSelected: boolean
) {
  // Shadow
  ctx.beginPath();
  ctx.ellipse(0, 8, 18, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Stone Grinder Base
  ctx.beginPath();
  ctx.arc(0, 2, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#3f3f46';
  ctx.fill();
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotating electric mala rings
  const ringCount = 3;
  for (let i = 0; i < ringCount; i++) {
    const angle = gameTime * 3 + (i * Math.PI * 2) / ringCount;
    const px = Math.cos(angle) * 11;
    const py = Math.sin(angle) * 11;

    // Sichuan peppercorn husk
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#7c2d12'; // deep burgundy Sichuan berry
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Center sparking mala crystal
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fb923c';
  ctx.fill();

  // Electric sparks
  if (Math.random() > 0.4) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 26);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/**
 * Habanero Magma Cannon Tower
 */
function drawHabaneroCannonTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  gameTime: number,
  isSelected: boolean
) {
  // Shadow
  ctx.beginPath();
  ctx.ellipse(0, 9, 21, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Iron base
  ctx.beginPath();
  ctx.arc(0, 3, 19, 0, Math.PI * 2);
  ctx.fillStyle = '#1c1917';
  ctx.fill();
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.rotate(tower.rotation);

  // Glowing Habanero Pepper Cannon body
  const habGrad = ctx.createLinearGradient(0, -22, 0, 8);
  habGrad.addColorStop(0, '#f97316');
  habGrad.addColorStop(0.6, '#ea580c');
  habGrad.addColorStop(1, '#c2410c');

  ctx.beginPath();
  ctx.roundRect(-8, -20, 16, 26, [6]);
  ctx.fillStyle = habGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffedd5';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Green pepper stem
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-3, 6, 6, 5);

  // Hot muzzle
  ctx.beginPath();
  ctx.arc(0, -20, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#fef08a';
  ctx.fill();
}

/**
 * Level Pips (1 to 3 stars)
 */
function drawLevelPips(ctx: CanvasRenderingContext2D, level: number) {
  for (let i = 0; i < level; i++) {
    const px = (i - (level - 1) * 0.5) * 7;
    const py = 18;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

/**
 * Draw Enemies (Ramen Toppings crawling along the noodles)
 */
function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[], gameTime: number) {
  for (const enemy of enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // KO animation (topple / squash and dissolve)
    if (enemy.koTimer > 0) {
      const dissolveAlpha = Math.max(0, 1 - (enemy.koTimer / 0.35));
      ctx.globalAlpha = dissolveAlpha;
      ctx.scale(1.3, 0.7); // squash
    }

    // Hit flash or status effect tints
    const isFrozen = enemy.stunTimer > 0;
    const isSlowed = enemy.slowTimer > 0;
    const isBurning = enemy.burnTimer > 0;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius * 0.7, enemy.radius, enemy.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Subtle walk wobble
    const wobble = Math.sin(enemy.wobblePhase + gameTime * 8) * 0.12;
    ctx.rotate(wobble);

    // Draw specific enemy archetype
    if (enemy.type === 'scallion') {
      drawScallionEnemy(ctx, enemy.radius);
    } else if (enemy.type === 'bok_choy') {
      drawBokChoyEnemy(ctx, enemy.radius);
    } else if (enemy.type === 'soy_egg') {
      drawSoyEggEnemy(ctx, enemy.radius, enemy.hp / enemy.maxHp);
    } else if (enemy.type === 'menma') {
      drawMenmaEnemy(ctx, enemy.radius);
    } else if (enemy.type === 'narutomaki') {
      drawNarutomakiEnemy(ctx, enemy.radius, gameTime);
    } else if (enemy.type === 'chashu') {
      drawChashuEnemy(ctx, enemy.radius, gameTime);
    }

    // Status effect visual indicators
    if (isBurning) {
      // Fire sizzle flame
      ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.beginPath();
      ctx.arc(0, -enemy.radius - 4, 4 + Math.sin(gameTime * 15) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isSlowed) {
      // Chili oil coat
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (isFrozen) {
      // Mala electric stun ring
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Enemy Health Bar (visible when damaged)
    if (enemy.hp < enemy.maxHp && enemy.koTimer <= 0) {
      const barW = Math.max(26, enemy.radius * 2);
      const barH = 4;
      const barY = -enemy.radius - 10;
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(-barW / 2, barY, barW, barH);

      ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barW / 2, barY, barW, barH);
    }

    ctx.restore();
  }
}

/**
 * Scallion: Chopped bright green spring onion ring
 */
function drawScallionEnemy(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e'; // vivid scallion green
  ctx.fill();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Hollow inner ring
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#bbf7d0'; // light onion core
  ctx.fill();
  ctx.stroke();

  // Little eyes
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(-3, -2, 2, 3);
  ctx.fillRect(2, -2, 2, 3);
}

/**
 * Bok Choy: Crisp white stalk with fan of green leafy crown
 */
function drawBokChoyEnemy(ctx: CanvasRenderingContext2D, radius: number) {
  // Stalk
  ctx.beginPath();
  ctx.ellipse(0, 4, radius * 0.65, radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f0fdf4'; // crisp white stalk
  ctx.fill();
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Leafy crown
  ctx.beginPath();
  ctx.arc(0, -radius * 0.45, radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = '#16a34a';
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.arc(-4, 3, 2, 0, Math.PI * 2);
  ctx.arc(4, 3, 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Soy Egg: Savory Ajitsuke Tamago (halved soft-boiled egg with golden yolk)
 */
function drawSoyEggEnemy(ctx: CanvasRenderingContext2D, radius: number, hpRatio: number) {
  // White/Marinated outer egg albumen
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 1.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fed7aa'; // soy marinated tan
  ctx.fill();
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Jammy runny egg yolk
  ctx.beginPath();
  ctx.arc(0, 2, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = '#f97316'; // deep jammy orange yolk
  ctx.fill();

  // Yolk highlight
  ctx.beginPath();
  ctx.arc(-2, 0, radius * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#fef08a';
  ctx.fill();

  // Stern egg eyes
  ctx.fillStyle = '#431407';
  ctx.fillRect(-5, 0, 3, 3);
  ctx.fillRect(3, 0, 3, 3);
}

/**
 * Menma: Slender marinated bamboo shoot skewer
 */
function drawMenmaEnemy(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.beginPath();
  ctx.roundRect(-radius * 0.55, -radius * 1.2, radius * 1.1, radius * 2.2, [4]);
  ctx.fillStyle = '#d97706'; // fermented bamboo gold
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bamboo grain lines
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.9);
  ctx.lineTo(0, radius * 0.9);
  ctx.stroke();

  // Speedy goggles / eyes
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-4, -4, 3, 4);
  ctx.fillRect(2, -4, 3, 4);
}

/**
 * Narutomaki: Whirling pink spiral fishcake
 */
function drawNarutomakiEnemy(ctx: CanvasRenderingContext2D, radius: number, gameTime: number) {
  ctx.rotate(gameTime * 5); // spinning rapid sawblade

  // White fishcake outer cog
  ctx.beginPath();
  const teeth = 8;
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.85;
    const a = (i * Math.PI) / teeth;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Iconic pink swirl in center
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3.5;
  ctx.stroke();
}

/**
 * Chashu Pork Belly: Torched braised meat slab boss
 */
function drawChashuEnemy(ctx: CanvasRenderingContext2D, radius: number, gameTime: number) {
  // Heavy round meat slab
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#78350f'; // caramelized braised pork
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Spiral pork belly fat layer
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = '#fed7aa'; // rich tender fat ring
  ctx.lineWidth = 6;
  ctx.stroke();

  // Torched grill marks
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.7)';
  ctx.lineWidth = 3;
  for (let g = -radius * 0.5; g <= radius * 0.5; g += 10) {
    ctx.beginPath();
    ctx.moveTo(g - 6, g - 6);
    ctx.lineTo(g + 6, g + 6);
    ctx.stroke();
  }

  // Boss eyes and fierce expression
  ctx.fillStyle = '#fde047'; // glowing yellow eyes
  ctx.beginPath();
  ctx.arc(-8, -2, 3.5, 0, Math.PI * 2);
  ctx.arc(8, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-8, -2, 1.8, 0, Math.PI * 2);
  ctx.arc(8, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Boss crown
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(-10, -radius);
  ctx.lineTo(-6, -radius - 8);
  ctx.lineTo(0, -radius - 4);
  ctx.lineTo(6, -radius - 8);
  ctx.lineTo(10, -radius);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw in-flight projectiles
 */
function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[], gameTime: number) {
  for (const p of projectiles) {
    ctx.save();

    if (p.isArc) {
      // Arcing mortar projectile (fried garlic bomb)
      const arcHeight = Math.sin(p.progress * Math.PI) * 70;
      const currentX = p.startX + (p.targetX - p.startX) * p.progress;
      const currentY = p.startY + (p.targetY - p.startY) * p.progress - arcHeight;

      ctx.translate(currentX, currentY);
      ctx.rotate(gameTime * 12);

      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Direct bullet / laser / magma ball
      ctx.translate(p.x, p.y);
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Projectile glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draw particles, sizzle smoke, damage numbers
 */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const pt of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.alpha);

    if (pt.shape === 'text' && pt.text) {
      // Floating damage number
      ctx.font = `bold ${Math.round(pt.size)}px "Titan One", "Fredoka", sans-serif`;
      ctx.fillStyle = pt.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeText(pt.text, pt.x, pt.y);
      ctx.fillText(pt.text, pt.x, pt.y);
    } else if (pt.shape === 'flake') {
      // Pepper flake
      ctx.translate(pt.x, pt.y);
      ctx.fillStyle = pt.color;
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 1.5);
    } else if (pt.shape === 'spark') {
      // Mala electric spark
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.fill();
    } else {
      // Default circular steam / smoke particle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Placement Preview Ring & Blueprint
 */
function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  range: number,
  isValid: boolean,
  towerType: string,
  gameTime: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Range Circle
  ctx.beginPath();
  ctx.arc(0, 0, range, 0, Math.PI * 2);
  ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.15)';
  ctx.fill();
  ctx.strokeStyle = isValid ? '#22c55e' : '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -gameTime * 20;
  ctx.stroke();
  ctx.setLineDash([]);

  // Tower Footprint
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
  ctx.fill();
  ctx.strokeStyle = isValid ? '#15803d' : '#991b1b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Highlight and range ring for currently selected tower
 */
function drawSelectedTowerHighlight(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  gameTime: number
) {
  ctx.save();
  ctx.translate(tower.x, tower.y);

  // Range Ring
  ctx.beginPath();
  ctx.arc(0, 0, tower.range, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tower Selection Reticle
  const reticleR = 26;
  ctx.beginPath();
  ctx.arc(0, 0, reticleR, 0, Math.PI * 2);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}
