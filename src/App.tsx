import React, { useEffect, useRef, useState, useCallback } from 'react';
import type {
  Tower,
  Enemy,
  Projectile,
  Particle,
  TowerType,
  GameState,
  GameStats,
  WaveDefinition,
  Point,
} from './game/types.ts';
import {
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  calculateDamage,
  calculateSlowMultiplier,
  calculateUpgradeCost,
  calculateSellValue,
  calculateTowerStats,
  findTarget,
  getDistance,
  getPointOnPath,
  generateRamenNoodlePath,
  isValidPlacement,
  getWaveDefinition,
} from './game/rules.ts';
import { sounds } from './game/audio.ts';
import { renderGameScene } from './game/renderer.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { PauseModal, GameOverModal, VictoryModal } from './components/StatusModals.tsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level Game State for React UI
  const [gameState, setGameState] = useState<GameState>('title');
  const [isWaveActive, setIsWaveActive] = useState<boolean>(false);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [enemiesRemaining, setEnemiesRemaining] = useState<number>(0);

  // HUD stats throttled to discrete updates
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    wave: 1,
    maxWave: 10,
    spEarned: 240,
    enemiesDefeated: 0,
    spicyTowersPlaced: 0,
    baoHp: 100,
    maxBaoHp: 100,
    spicePoints: 240, // Starting Spice Points for immediate strategic placement
    superEnergy: 0,
  });

  // Current wave definition
  const [currentWaveDef, setCurrentWaveDef] = useState<WaveDefinition>(() => getWaveDefinition(1));

  // Simulation Refs (Decoupled from React renders so 60Hz loop never restarts on state change)
  const simRef = useRef({
    gameState: 'title' as GameState,
    gameSpeed: 1,
    gameTime: 0,
    cameraShake: 0,
    hitstop: 0,
    lastFrameTime: performance.now(),
    width: 1200,
    height: 800,
    centerX: 600,
    centerY: 400,
    bowlRadius: 360,
    noodlePath: [] as Point[],
    towers: [] as Tower[],
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    wave: 1,
    waveQueue: [] as Array<{ type: string; delay: number }>,
    waveTimeElapsed: 0,
    waveSpawnDone: false,
    selectedTowerType: null as TowerType | null,
    selectedTowerId: null as string | null,
    hoveredPos: null as Point | null,
    isPlacementValid: false,
    stats: {
      score: 0,
      wave: 1,
      maxWave: 10,
      spEarned: 240,
      enemiesDefeated: 0,
      spicyTowersPlaced: 0,
      baoHp: 100,
      maxBaoHp: 100,
      spicePoints: 240,
      superEnergy: 0,
    },
  });

  // Synchronize state with body attribute for testability
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Check URL autostart (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startGame();
    }
  }, []);

  // Update canvas bounds and recalculate noodle path
  const updateDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean(navigator.webdriver) || /HeadlessChrome/i.test(navigator.userAgent));
    const dpr = isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    }

    const cx = width / 2;
    const cy = height / 2;
    // Bowl radius scales nicely with screen size
    const bowlRadius = Math.min(width, height) * 0.44;

    simRef.current.width = width;
    simRef.current.height = height;
    simRef.current.centerX = cx;
    simRef.current.centerY = cy;
    simRef.current.bowlRadius = bowlRadius;
    simRef.current.noodlePath = generateRamenNoodlePath(cx, cy, bowlRadius, 260);
  }, []);

  // Window resize observer
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Start Game
  const startGame = useCallback(() => {
    sounds.startAmbientLoop();
    setGameState('playing');
    simRef.current.gameState = 'playing';
    document.body.dataset.state = 'playing';
  }, []);

  // Pause / Resume
  const togglePause = useCallback(() => {
    if (simRef.current.gameState === 'playing') {
      setGameState('paused');
      simRef.current.gameState = 'paused';
    } else if (simRef.current.gameState === 'paused') {
      setGameState('playing');
      simRef.current.gameState = 'playing';
    }
  }, []);

  // Restart
  const restartGame = useCallback(() => {
    const freshStats: GameStats = {
      score: 0,
      wave: 1,
      maxWave: 10,
      spEarned: 240,
      enemiesDefeated: 0,
      spicyTowersPlaced: 0,
      baoHp: 100,
      maxBaoHp: 100,
      spicePoints: 240,
      superEnergy: 0,
    };

    simRef.current.stats = { ...freshStats };
    simRef.current.wave = 1;
    simRef.current.towers = [];
    simRef.current.enemies = [];
    simRef.current.projectiles = [];
    simRef.current.particles = [];
    simRef.current.waveQueue = [];
    simRef.current.waveTimeElapsed = 0;
    simRef.current.waveSpawnDone = false;
    simRef.current.selectedTowerType = null;
    simRef.current.selectedTowerId = null;

    setStats(freshStats);
    setCurrentWaveDef(getWaveDefinition(1));
    setSelectedTowerType(null);
    setSelectedTowerId(null);
    setIsWaveActive(false);
    setGameState('playing');
    simRef.current.gameState = 'playing';
  }, []);

  // Return to Title
  const returnToTitle = useCallback(() => {
    setGameState('title');
    simRef.current.gameState = 'title';
  }, []);

  // Start Next Wave
  const startNextWave = useCallback(() => {
    const waveDef = getWaveDefinition(simRef.current.wave);
    setCurrentWaveDef(waveDef);

    // Build spawn queue
    const queue: Array<{ type: string; delay: number }> = [];
    for (const group of waveDef.spawns) {
      for (let i = 0; i < group.count; i++) {
        queue.push({
          type: group.type,
          delay: group.delay + i * group.interval,
        });
      }
    }
    // Sort by delay
    queue.sort((a, b) => a.delay - b.delay);

    simRef.current.waveQueue = queue;
    simRef.current.waveTimeElapsed = 0;
    simRef.current.waveSpawnDone = false;
    setIsWaveActive(true);
    sounds.playPlaceTower();
  }, []);

  // Trigger Bao's Super: Chili Oil Inferno
  const triggerSuper = useCallback(() => {
    if (simRef.current.stats.superEnergy < 100) return;

    sounds.playChiliInferno();
    simRef.current.stats.superEnergy = 0;
    simRef.current.cameraShake = 1.0;

    // Sizzle and heavily damage all current enemies in the broth!
    for (const e of simRef.current.enemies) {
      if (e.koTimer <= 0) {
        e.hp -= 200;
        e.slowTimer = 4.0;
        e.slowMultiplier = 0.3;
        e.burnTimer = 4.0;
        e.burnDps = 40;

        // Floating super damage
        simRef.current.particles.push({
          x: e.x,
          y: e.y,
          vx: (Math.random() - 0.5) * 40,
          vy: -60,
          life: 0.9,
          maxLife: 0.9,
          color: '#ef4444',
          size: 20,
          alpha: 1,
          shape: 'text',
          text: '-200 INFERNO!',
        });
      }
    }

    // Explosion particles across the bowl
    for (let p = 0; p < 45; p++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 220;
      simRef.current.particles.push({
        x: simRef.current.centerX,
        y: simRef.current.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8,
        maxLife: 0.8,
        color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
        size: 5 + Math.random() * 7,
        alpha: 1,
        shape: 'flake',
      });
    }

    setStats({ ...simRef.current.stats });
  }, []);

  // Upgrade Selected Tower
  const handleUpgradeTower = useCallback((towerId: string) => {
    const tower = simRef.current.towers.find((t) => t.id === towerId);
    if (!tower || tower.level >= 3) return;

    const cost = calculateUpgradeCost(TOWER_CONFIGS[tower.type].baseCost, tower.level);
    if (simRef.current.stats.spicePoints < cost) return;

    simRef.current.stats.spicePoints -= cost;
    tower.level += 1;
    tower.cost += cost;

    const stats = calculateTowerStats(tower.type, tower.level);
    tower.damage = stats.damage;
    tower.range = stats.range;
    tower.fireRate = stats.fireRate;

    sounds.playUpgradeTower();

    // Upgrade flash particles
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      simRef.current.particles.push({
        x: tower.x,
        y: tower.y,
        vx: Math.cos(angle) * 80,
        vy: Math.sin(angle) * 80,
        life: 0.5,
        maxLife: 0.5,
        color: '#facc15',
        size: 5,
        alpha: 1,
        shape: 'spark',
      });
    }

    setStats({ ...simRef.current.stats });
  }, []);

  // Sell Selected Tower
  const handleSellTower = useCallback((towerId: string) => {
    const towerIdx = simRef.current.towers.findIndex((t) => t.id === towerId);
    if (towerIdx === -1) return;

    const tower = simRef.current.towers[towerIdx];
    const returnSpice = calculateSellValue(tower.cost);

    simRef.current.stats.spicePoints += returnSpice;
    simRef.current.towers.splice(towerIdx, 1);
    simRef.current.selectedTowerId = null;
    setSelectedTowerId(null);

    sounds.playPlaceTower();
    setStats({ ...simRef.current.stats });
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  }, []);

  // Toggle Game Speed (1x <-> 2x)
  const handleToggleSpeed = useCallback(() => {
    setGameSpeed((prev) => {
      const next = prev === 1 ? 2 : 1;
      simRef.current.gameSpeed = next;
      return next;
    });
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const sim = simRef.current;

      // Escape key handles deselect or pause
      if (e.key === 'Escape') {
        e.preventDefault();
        if (sim.selectedTowerType) {
          sim.selectedTowerType = null;
          setSelectedTowerType(null);
        } else if (sim.selectedTowerId) {
          sim.selectedTowerId = null;
          setSelectedTowerId(null);
        } else {
          togglePause();
        }
        return;
      }

      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        restartGame();
        return;
      }

      // Space key triggers Wave Start or Super
      if (e.key === ' ') {
        e.preventDefault();
        if (sim.gameState === 'playing') {
          if (!isWaveActive) {
            startNextWave();
          } else if (sim.stats.superEnergy >= 100) {
            triggerSuper();
          }
        }
        return;
      }

      // Number keys [1 - 5] select spicy towers
      const keyIndex = parseInt(e.key, 10);
      if (keyIndex >= 1 && keyIndex <= 5) {
        e.preventDefault();
        const types: TowerType[] = [
          'chili_flakes',
          'chili_oil',
          'garlic_mortar',
          'peppercorn',
          'habanero_cannon',
        ];
        const targetType = types[keyIndex - 1];
        if (sim.stats.spicePoints >= TOWER_CONFIGS[targetType].baseCost) {
          sim.selectedTowerType = targetType;
          sim.selectedTowerId = null;
          setSelectedTowerType(targetType);
          setSelectedTowerId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause, handleToggleMute, restartGame, startNextWave, triggerSuper, isWaveActive]);

  // Pointer/Mouse Click & Move interaction on the ramen bowl
  const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sim = simRef.current;
    sim.hoveredPos = { x, y };

    if (sim.selectedTowerType) {
      const isMoat = sim.selectedTowerType === 'chili_oil';
      const check = isValidPlacement(
        x,
        y,
        sim.centerX,
        sim.centerY,
        sim.bowlRadius,
        sim.towers,
        sim.noodlePath,
        isMoat
      );
      sim.isPlacementValid = check.valid;
    }
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const sim = simRef.current;

    if (sim.gameState !== 'playing') return;

    // 1. If clicking directly on an existing placed tower, always select it!
    const clickedExisting = sim.towers.find((t) => getDistance(x, y, t.x, t.y) <= 28);
    if (clickedExisting) {
      sim.selectedTowerId = clickedExisting.id;
      sim.selectedTowerType = null;
      setSelectedTowerId(clickedExisting.id);
      setSelectedTowerType(null);
      sounds.playPlaceTower();
      return;
    }

    // 2. If currently placing a tower
    if (sim.selectedTowerType) {
      const isMoat = sim.selectedTowerType === 'chili_oil';
      const check = isValidPlacement(
        x,
        y,
        sim.centerX,
        sim.centerY,
        sim.bowlRadius,
        sim.towers,
        sim.noodlePath,
        isMoat
      );

      if (check.valid) {
        const config = TOWER_CONFIGS[sim.selectedTowerType];
        if (sim.stats.spicePoints >= config.baseCost) {
          sim.stats.spicePoints -= config.baseCost;
          sim.stats.spicyTowersPlaced += 1;

          const stats = calculateTowerStats(sim.selectedTowerType, 1);
          const newTower: Tower = {
            id: `tower_${Date.now()}_${Math.random()}`,
            type: sim.selectedTowerType,
            x,
            y,
            level: 1,
            lastFired: 0,
            targetId: null,
            rotation: 0,
            kills: 0,
            totalDamage: 0,
            range: stats.range,
            damage: stats.damage,
            fireRate: stats.fireRate,
            cost: config.baseCost,
          };

          sim.towers.push(newTower);
          sounds.playPlaceTower();

          // Placement burst particles
          for (let p = 0; p < 12; p++) {
            const angle = (p * Math.PI * 2) / 12;
            sim.particles.push({
              x,
              y,
              vx: Math.cos(angle) * 60,
              vy: Math.sin(angle) * 60,
              life: 0.4,
              maxLife: 0.4,
              color: config.accentColor,
              size: 4,
              alpha: 1,
              shape: 'flake',
            });
          }

          // Select the newly placed tower and clear placement mode
          sim.selectedTowerType = null;
          sim.selectedTowerId = newTower.id;
          setSelectedTowerType(null);
          setSelectedTowerId(newTower.id);

          setStats({ ...sim.stats });
        }
      }
      return;
    }

    // 3. Clicking on empty broth deselects
    sim.selectedTowerId = null;
    setSelectedTowerId(null);
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let hudSyncTimer = 0;

    const gameLoop = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const sim = simRef.current;
      const rawDt = (timestamp - sim.lastFrameTime) / 1000;
      sim.lastFrameTime = timestamp;

      // Clamped dt to prevent tunneling
      const dt = Math.min(rawDt, 0.05);

      // Decay Camera Shake
      if (sim.cameraShake > 0) {
        sim.cameraShake = Math.max(0, sim.cameraShake - dt * 2.5);
      }

      // Hitstop logic
      if (sim.hitstop > 0) {
        sim.hitstop = Math.max(0, sim.hitstop - dt);
      } else if (sim.gameState === 'playing') {
        const simDt = dt * sim.gameSpeed;
        sim.gameTime += simDt;

        // 1. Process Wave Spawns
        if (sim.waveQueue.length > 0) {
          sim.waveTimeElapsed += simDt;
          while (sim.waveQueue.length > 0 && sim.waveQueue[0].delay <= sim.waveTimeElapsed) {
            const item = sim.waveQueue.shift()!;
            const enemyType = item.type as any;
            const cfg = ENEMY_CONFIGS[enemyType];

            // Scaling wave difficulty boost
            const waveScale = 1 + (sim.wave - 1) * 0.14;
            const enemy: Enemy = {
              id: `enemy_${Date.now()}_${Math.random()}`,
              type: enemyType,
              name: cfg.name,
              x: sim.noodlePath[0]?.x ?? sim.centerX,
              y: sim.noodlePath[0]?.y ?? sim.centerY,
              pathProgress: 0,
              maxHp: Math.round(cfg.baseHp * waveScale),
              hp: Math.round(cfg.baseHp * waveScale),
              baseSpeed: cfg.baseSpeed * (1 + (sim.wave - 1) * 0.04), // Ingredients get faster in higher waves!
              speed: cfg.baseSpeed * (1 + (sim.wave - 1) * 0.04),
              armor: cfg.armor + Math.floor((sim.wave - 1) * 0.5),
              spiceValue: Math.round(cfg.spiceValue * (1 + (sim.wave - 1) * 0.05)),
              radius: cfg.radius,
              slowTimer: 0,
              slowMultiplier: 1.0,
              burnTimer: 0,
              burnDps: 0,
              stunTimer: 0,
              wobblePhase: Math.random() * Math.PI * 2,
              koTimer: 0,
              isBoss: enemyType === 'chashu',
            };

            sim.enemies.push(enemy);
          }

          if (sim.waveQueue.length === 0) {
            sim.waveSpawnDone = true;
          }
        }

        // 2. Update Enemies along Noodle Spiral
        for (let i = sim.enemies.length - 1; i >= 0; i--) {
          const e = sim.enemies[i];

          // KO Dissolve
          if (e.koTimer > 0) {
            e.koTimer += simDt;
            if (e.koTimer > 0.35) {
              sim.enemies.splice(i, 1);
            }
            continue;
          }

          // Status Effects Ticking
          if (e.stunTimer > 0) {
            e.stunTimer = Math.max(0, e.stunTimer - simDt);
          }
          if (e.slowTimer > 0) {
            e.slowTimer = Math.max(0, e.slowTimer - simDt);
            if (e.slowTimer === 0) e.slowMultiplier = 1.0;
          }
          if (e.burnTimer > 0) {
            e.burnTimer = Math.max(0, e.burnTimer - simDt);
            const burnTick = e.burnDps * simDt;
            e.hp -= burnTick;

            // Occasional burn sizzle particles
            if (Math.random() < 0.25) {
              sim.particles.push({
                x: e.x + (Math.random() - 0.5) * e.radius,
                y: e.y + (Math.random() - 0.5) * e.radius,
                vx: 0,
                vy: -30,
                life: 0.3,
                maxLife: 0.3,
                color: '#ef4444',
                size: 3,
                alpha: 0.8,
                shape: 'smoke',
              });
            }
          }

          // Check if defeated by burn
          if (e.hp <= 0 && e.koTimer === 0) {
            e.koTimer = 0.01;
            sim.stats.score += e.spiceValue * 15;
            sim.stats.spicePoints += e.spiceValue;
            sim.stats.enemiesDefeated += 1;
            sim.stats.superEnergy = Math.min(100, sim.stats.superEnergy + 3.5);
            sounds.playEnemyPop();
            continue;
          }

          // Advance Position along Noodle Spiral (if not stunned)
          if (e.stunTimer <= 0) {
            const currentSpeed = e.baseSpeed * e.slowMultiplier;
            const pathAdvance = (currentSpeed * simDt) / (sim.bowlRadius * 3.8);
            e.pathProgress = Math.min(1.0, e.pathProgress + pathAdvance);

            const pos = getPointOnPath(sim.noodlePath, e.pathProgress);
            e.x = pos.x;
            e.y = pos.y;
          }

          // Reach Center Bao's Steamer Island!
          if (e.pathProgress >= 0.98) {
            const breachDmg = e.isBoss ? 25 : 10;
            sim.stats.baoHp = Math.max(0, sim.stats.baoHp - breachDmg);
            sim.cameraShake = 0.6;
            sim.hitstop = 0.04;
            sounds.playBaoHurt();

            // Bao hurt visual text
            sim.particles.push({
              x: sim.centerX,
              y: sim.centerY - 20,
              vx: 0,
              vy: -50,
              life: 0.8,
              maxLife: 0.8,
              color: '#ef4444',
              size: 22,
              alpha: 1,
              shape: 'text',
              text: `-${breachDmg} HP!`,
            });

            // Remove enemy that reached Bao
            sim.enemies.splice(i, 1);

            // Check Defeat
            if (sim.stats.baoHp <= 0) {
              setGameState('gameover');
              sim.gameState = 'gameover';
              sounds.playDefeat();
              break;
            }
          }
        }

        // 3. Update Towers & Firing Logic
        for (const tower of sim.towers) {
          // Chili Oil Fortification: Passive sizzle & slow aura on nearby toppings
          if (tower.type === 'chili_oil') {
            for (const enemy of sim.enemies) {
              if (enemy.koTimer <= 0) {
                const dist = getDistance(tower.x, tower.y, enemy.x, enemy.y);
                if (dist <= tower.range) {
                  enemy.slowTimer = 2.0;
                  enemy.slowMultiplier = 0.55 - (tower.level - 1) * 0.1;
                  enemy.burnTimer = 2.0;
                  enemy.burnDps = 22 * tower.level;
                  tower.totalDamage += 22 * tower.level * simDt;

                  if (Math.random() < 0.04) {
                    sounds.playSizzle();
                  }
                }
              }
            }
            continue;
          }

          // Active Firing Towers
          const fireInterval = 1 / tower.fireRate;
          if (sim.gameTime - tower.lastFired >= fireInterval) {
            // Find target
            const targetId = findTarget(tower.x, tower.y, tower.range, sim.enemies, 'first');
            tower.targetId = targetId;

            if (targetId) {
              const target = sim.enemies.find((e) => e.id === targetId);
              if (target) {
                tower.lastFired = sim.gameTime;

                // Aim rotation
                tower.rotation = Math.atan2(target.y - tower.y, target.x - tower.x) + Math.PI / 2;

                if (tower.type === 'garlic_mortar') {
                  // Catapult Garlic Bomb (Arcing AOE)
                  sounds.playMortarLaunch();
                  sim.projectiles.push({
                    id: `proj_${Date.now()}_${Math.random()}`,
                    sourceType: tower.type,
                    x: tower.x,
                    y: tower.y,
                    startX: tower.x,
                    startY: tower.y,
                    targetX: target.x,
                    targetY: target.y,
                    targetEnemyId: null,
                    speed: 1.2,
                    damage: tower.damage,
                    splashRadius: 75,
                    slowAmount: 0.15,
                    slowDuration: 1.5,
                    burnDps: 0,
                    burnDuration: 0,
                    stunDuration: 0.2,
                    color: '#fef08a',
                    size: 6,
                    progress: 0,
                    isArc: true,
                  });
                } else if (tower.type === 'peppercorn') {
                  // Electric Mala Shock
                  sounds.playMalaShock();
                  target.hp -= calculateDamage(tower.damage, target.armor);
                  target.stunTimer = 0.7;
                  tower.totalDamage += tower.damage;

                  // Lightning spark line
                  for (let s = 0; s < 6; s++) {
                    sim.particles.push({
                      x: target.x + (Math.random() - 0.5) * 20,
                      y: target.y + (Math.random() - 0.5) * 20,
                      vx: (Math.random() - 0.5) * 60,
                      vy: (Math.random() - 0.5) * 60,
                      life: 0.25,
                      maxLife: 0.25,
                      color: '#fef08a',
                      size: 3,
                      alpha: 1,
                      shape: 'spark',
                    });
                  }
                } else if (tower.type === 'habanero_cannon') {
                  // Boiling Habanero Magma Drop
                  sounds.playHabaneroBlast();
                  sim.projectiles.push({
                    id: `proj_${Date.now()}_${Math.random()}`,
                    sourceType: tower.type,
                    x: tower.x,
                    y: tower.y,
                    startX: tower.x,
                    startY: tower.y,
                    targetX: target.x,
                    targetY: target.y,
                    targetEnemyId: target.id,
                    speed: 460,
                    damage: tower.damage,
                    splashRadius: 25,
                    slowAmount: 0.2,
                    slowDuration: 1.0,
                    burnDps: 35,
                    burnDuration: 3.5,
                    stunDuration: 0,
                    color: '#ea580c',
                    size: 5,
                    progress: 0,
                  });
                } else {
                  // Rapid Chili Flakes Sprinkler
                  sounds.playPepperShoot();
                  sim.projectiles.push({
                    id: `proj_${Date.now()}_${Math.random()}`,
                    sourceType: tower.type,
                    x: tower.x,
                    y: tower.y,
                    startX: tower.x,
                    startY: tower.y,
                    targetX: target.x,
                    targetY: target.y,
                    targetEnemyId: target.id,
                    speed: 520,
                    damage: tower.damage,
                    splashRadius: 0,
                    slowAmount: 0.1,
                    slowDuration: 0.8,
                    burnDps: 6,
                    burnDuration: 1.5,
                    stunDuration: 0,
                    color: '#ef4444',
                    size: 3.5,
                    progress: 0,
                  });
                }
              }
            }
          }
        }

        // 4. Update Projectiles
        for (let pIdx = sim.projectiles.length - 1; pIdx >= 0; pIdx--) {
          const p = sim.projectiles[pIdx];

          if (p.isArc) {
            // Mortar Garlic Chip
            p.progress += dt * p.speed * sim.gameSpeed;
            if (p.progress >= 1.0) {
              // Impact explosion!
              sounds.playExplosion();
              sim.cameraShake = Math.max(sim.cameraShake, 0.4);

              // Splash damage to all toppings in radius
              for (const e of sim.enemies) {
                if (e.koTimer <= 0) {
                  const dist = getDistance(p.targetX, p.targetY, e.x, e.y);
                  if (dist <= p.splashRadius) {
                    const dmg = calculateDamage(p.damage, e.armor);
                    e.hp -= dmg;
                    e.stunTimer = Math.max(e.stunTimer, p.stunDuration);
                  }
                }
              }

              // Garlic crunch particles
              for (let i = 0; i < 14; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 30 + Math.random() * 90;
                sim.particles.push({
                  x: p.targetX,
                  y: p.targetY,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  life: 0.5,
                  maxLife: 0.5,
                  color: '#fef3c7',
                  size: 4 + Math.random() * 3,
                  alpha: 1,
                  shape: 'flake',
                });
              }

              sim.projectiles.splice(pIdx, 1);
            }
          } else {
            // Direct projectile
            let targetX = p.targetX;
            let targetY = p.targetY;

            if (p.targetEnemyId) {
              const targetEnemy = sim.enemies.find((e) => e.id === p.targetEnemyId);
              if (targetEnemy) {
                targetX = targetEnemy.x;
                targetY = targetEnemy.y;
              }
            }

            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.hypot(dx, dy);
            const step = p.speed * simDt;

            if (dist <= step || dist < 12) {
              // Hit target
              if (p.targetEnemyId) {
                const targetEnemy = sim.enemies.find((e) => e.id === p.targetEnemyId);
                if (targetEnemy && targetEnemy.koTimer <= 0) {
                  const netDmg = calculateDamage(p.damage, targetEnemy.armor);
                  targetEnemy.hp -= netDmg;
                  targetEnemy.slowTimer = p.slowDuration;
                  targetEnemy.slowMultiplier = 0.65;
                  if (p.burnDps > 0) {
                    targetEnemy.burnTimer = p.burnDuration;
                    targetEnemy.burnDps = p.burnDps;
                  }

                  // Floating damage text
                  sim.particles.push({
                    x: targetEnemy.x,
                    y: targetEnemy.y - 12,
                    vx: (Math.random() - 0.5) * 20,
                    vy: -35,
                    life: 0.45,
                    maxLife: 0.45,
                    color: p.color,
                    size: 13,
                    alpha: 1,
                    shape: 'text',
                    text: `-${netDmg}`,
                  });
                }
              }

              sim.projectiles.splice(pIdx, 1);
            } else {
              p.x += (dx / dist) * step;
              p.y += (dy / dist) * step;
            }
          }
        }

        // 5. Update Particles
        for (let i = sim.particles.length - 1; i >= 0; i--) {
          const pt = sim.particles[i];
          pt.life -= dt;
          if (pt.life <= 0) {
            sim.particles.splice(i, 1);
          } else {
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.alpha = pt.life / pt.maxLife;
          }
        }

        // 6. Check Wave Completion
        const aliveEnemies = sim.enemies.filter((e) => e.koTimer <= 0).length;
        if (sim.waveSpawnDone && aliveEnemies === 0 && sim.waveQueue.length === 0) {
          const finishedWave = sim.wave;
          sim.stats.score += finishedWave * 200;
          sim.stats.spicePoints += currentWaveDef.rewardSpice;
          sim.stats.spEarned += currentWaveDef.rewardSpice;

          sounds.playWaveFanfare();

          // Check if Victory (completed Wave 10)
          if (finishedWave === 10) {
            setGameState('victory');
            sim.gameState = 'victory';
          } else {
            sim.wave += 1;
            sim.stats.wave = sim.wave;
            setCurrentWaveDef(getWaveDefinition(sim.wave));
            setIsWaveActive(false);
          }

          setStats({ ...sim.stats });
        }
      }

      // Throttled HUD update (every ~100ms) to avoid re-rendering React at 60Hz
      hudSyncTimer += dt;
      if (hudSyncTimer > 0.1) {
        hudSyncTimer = 0;
        setStats({ ...sim.stats });
        setEnemiesRemaining(sim.enemies.filter((e) => e.koTimer <= 0).length + sim.waveQueue.length);
      }

      // Render Scene onto Canvas
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        renderGameScene({
          ctx,
          width: sim.width,
          height: sim.height,
          centerX: sim.centerX,
          centerY: sim.centerY,
          bowlRadius: sim.bowlRadius,
          noodlePath: sim.noodlePath,
          towers: sim.towers,
          enemies: sim.enemies,
          projectiles: sim.projectiles,
          particles: sim.particles,
          selectedTowerId: sim.selectedTowerId,
          hoveredPos: sim.hoveredPos,
          placingTowerType: sim.selectedTowerType,
          isPlacementValid: sim.isPlacementValid,
          placementRange: sim.selectedTowerType
            ? TOWER_CONFIGS[sim.selectedTowerType].baseRange
            : 0,
          baoHp: sim.stats.baoHp,
          maxBaoHp: sim.stats.maxBaoHp,
          superEnergy: sim.stats.superEnergy,
          cameraShake: sim.cameraShake,
          gameTime: sim.gameTime,
        });
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentWaveDef]);

  // Selected tower object for HUD inspector
  const activeSelectedTower = simRef.current.towers.find((t) => t.id === selectedTowerId) || null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* 60 FPS Isolated Canvas */}
      <canvas
        ref={canvasRef}
        onPointerMove={handleCanvasPointerMove}
        onPointerDown={handleCanvasPointerDown}
        className="absolute inset-0 block cursor-crosshair touch-none"
      />

      {/* Screen States */}
      {gameState === 'title' && <TitleScreen onStart={startGame} />}

      {gameState === 'playing' && (
        <GameHUD
          stats={stats}
          currentWaveDef={currentWaveDef}
          isWaveActive={isWaveActive}
          selectedTowerType={selectedTowerType}
          onSelectTowerType={(type) => {
            simRef.current.selectedTowerType = type;
            setSelectedTowerType(type);
          }}
          selectedTower={activeSelectedTower}
          onUpgradeTower={handleUpgradeTower}
          onSellTower={handleSellTower}
          onDeselectTower={() => {
            simRef.current.selectedTowerId = null;
            setSelectedTowerId(null);
          }}
          onStartNextWave={startNextWave}
          onTriggerSuper={triggerSuper}
          onTogglePause={togglePause}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
          gameSpeed={gameSpeed}
          onToggleSpeed={handleToggleSpeed}
          enemiesRemaining={enemiesRemaining}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal onResume={togglePause} onRestart={restartGame} onTitle={returnToTitle} />
      )}

      {gameState === 'gameover' && (
        <GameOverModal stats={stats} onRestart={restartGame} onTitle={returnToTitle} />
      )}

      {gameState === 'victory' && (
        <VictoryModal
          stats={stats}
          onNextWave={() => {
            // Enter endless mode
            simRef.current.wave += 1;
            simRef.current.stats.wave = simRef.current.wave;
            setCurrentWaveDef(getWaveDefinition(simRef.current.wave));
            setGameState('playing');
            simRef.current.gameState = 'playing';
            startNextWave();
          }}
          onTitle={returnToTitle}
        />
      )}
    </main>
  );
}
