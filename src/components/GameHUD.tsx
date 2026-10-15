import React from 'react';
import type { Tower, TowerType, GameStats, WaveDefinition } from '../game/types.ts';
import { TOWER_CONFIGS, calculateUpgradeCost, calculateSellValue, calculateTowerStats } from '../game/rules.ts';

interface GameHUDProps {
  stats: GameStats;
  currentWaveDef: WaveDefinition;
  isWaveActive: boolean;
  selectedTowerType: TowerType | null;
  onSelectTowerType: (type: TowerType | null) => void;
  selectedTower: Tower | null;
  onUpgradeTower: (towerId: string) => void;
  onSellTower: (towerId: string) => void;
  onDeselectTower: () => void;
  onStartNextWave: () => void;
  onTriggerSuper: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  gameSpeed: number;
  onToggleSpeed: () => void;
  enemiesRemaining: number;
}

const TOWER_KEYS: TowerType[] = [
  'chili_flakes',
  'chili_oil',
  'garlic_mortar',
  'peppercorn',
  'habanero_cannon',
];

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  currentWaveDef,
  isWaveActive,
  selectedTowerType,
  onSelectTowerType,
  selectedTower,
  onUpgradeTower,
  onSellTower,
  onDeselectTower,
  onStartNextWave,
  onTriggerSuper,
  onTogglePause,
  onToggleMute,
  isMuted,
  gameSpeed,
  onToggleSpeed,
  enemiesRemaining,
}) => {
  const hpPercent = Math.max(0, Math.min(100, Math.round((stats.baoHp / stats.maxBaoHp) * 100)));
  const superReady = stats.superEnergy >= 100;

  return (
    <div className="fixed inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between z-20 select-none">
      {/* Top Perimeter Cluster */}
      <div className="flex flex-wrap sm:flex-nowrap items-start justify-between w-full gap-2 sm:gap-4">
        {/* Left: Bao Health, Super Energy, and Wave Info */}
        <div className="flex flex-col gap-1.5 pointer-events-auto max-w-[62%] sm:max-w-none">
          {/* Bao Vitality Bar */}
          <div className="flex items-center gap-2 sm:gap-3 bg-stone-900/90 border border-stone-800 rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-lg">
            <div className="flex items-center gap-1 text-red-400 font-bold text-xs sm:text-sm tracking-wider">
              <span className="text-base sm:text-xl">🥟</span>
              <span className="hidden xs:inline">BAO</span> <span>HP</span>
            </div>
            {/* Health Bar with delayed pip */}
            <div className="w-20 xs:w-28 sm:w-44 h-3 sm:h-3.5 bg-stone-950 rounded-full overflow-hidden border border-stone-700 relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  hpPercent > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : hpPercent > 25
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold font-display tabular-nums text-stone-200">
              {stats.baoHp}
            </span>
          </div>

          {/* Wave & Super Meter Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Wave Badge */}
            <div className="bg-stone-900/90 border border-amber-600/40 rounded-lg px-2 sm:px-3 py-1 shadow flex items-center gap-1.5">
              <span className="text-amber-500 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                W{stats.wave}
              </span>
              <span className="text-stone-300 text-[11px] sm:text-xs font-semibold truncate max-w-[100px] sm:max-w-[180px]">
                {currentWaveDef.title}
              </span>
              {isWaveActive && (
                <span className="text-orange-400 text-[10px] sm:text-xs font-bold tabular-nums">
                  ({enemiesRemaining})
                </span>
              )}
            </div>

            {/* Super Ability Ready Button / Meter */}
            <button
              type="button"
              onClick={onTriggerSuper}
              disabled={!superReady}
              title="Press [Space] to trigger Bao's Chili Oil Inferno!"
              className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all shadow ${
                superReady
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-bounce border border-amber-300 cursor-pointer shadow-red-600/50'
                  : 'bg-stone-900/90 border border-stone-800 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>🔥 FRENZY</span>
              <span className="tabular-nums font-mono text-[10px]">
                {superReady ? 'READY!' : `${Math.floor(stats.superEnergy)}%`}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Spice Bankroll, Game Speed, Mute & Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto">
          {/* Spice Points Bankroll */}
          <div className="bg-stone-900/90 border-2 border-amber-500/60 rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl">🌶️</span>
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[10px] text-amber-400/80 uppercase font-black tracking-widest">
                SPICE
              </span>
              <span className="text-base sm:text-2xl font-black font-display text-amber-300 tabular-nums leading-none">
                {stats.spicePoints} <span className="text-[10px] sm:text-xs text-amber-500">SP</span>
              </span>
            </div>
          </div>

          {/* Speed Toggle (1x / 2x) */}
          <button
            type="button"
            onClick={onToggleSpeed}
            title="Toggle Game Speed (1x / 2x)"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-900/90 border border-stone-700 hover:border-amber-500 hover:text-amber-400 text-stone-300 font-bold text-xs flex items-center justify-center transition shadow cursor-pointer"
          >
            {gameSpeed}x
          </button>

          {/* Mute Toggle [M] */}
          <button
            type="button"
            onClick={onToggleMute}
            title="Mute / Unmute Audio [M]"
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-900/90 border border-stone-700 hover:border-amber-500 hover:text-amber-400 text-stone-300 flex items-center justify-center transition shadow cursor-pointer text-xs sm:text-base"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause Button [Esc / P] */}
          <button
            type="button"
            onClick={onTogglePause}
            title="Pause Game [Esc / P]"
            aria-label="Pause Game"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-900/90 border border-stone-700 hover:border-amber-500 hover:text-amber-400 text-stone-300 flex items-center justify-center transition shadow cursor-pointer font-bold text-xs sm:text-sm"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* Selected Tower Inspector (Floats on mid-right if a placed tower is clicked) */}
      {selectedTower && (
        <div className="self-end my-auto pointer-events-auto bg-stone-900/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl max-w-xs w-full animate-in fade-in slide-in-from-right duration-150">
          <div className="flex items-start justify-between border-b border-stone-800 pb-2 mb-3">
            <div>
              <div className="text-xs text-amber-500 font-bold uppercase tracking-wider">
                TIER {selectedTower.level} / 3
              </div>
              <h3 className="text-base font-bold text-stone-100">
                {TOWER_CONFIGS[selectedTower.type].name}
              </h3>
            </div>
            <button
              type="button"
              onClick={onDeselectTower}
              aria-label="Close Inspector"
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Current Tower Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-stone-300">
            <div className="bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-stone-400">Damage:</span>{' '}
              <strong className="text-red-400 font-bold tabular-nums">{selectedTower.damage}</strong>
            </div>
            <div className="bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-stone-400">Range:</span>{' '}
              <strong className="text-amber-400 font-bold tabular-nums">{selectedTower.range}px</strong>
            </div>
            <div className="bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-stone-400">Fire Rate:</span>{' '}
              <strong className="text-orange-400 font-bold tabular-nums">{selectedTower.fireRate}/s</strong>
            </div>
            <div className="bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
              <span className="text-stone-400">Enemies Cooked:</span>{' '}
              <strong className="text-emerald-400 font-bold tabular-nums">{selectedTower.kills}</strong>
            </div>
          </div>

          {/* Action Buttons: Upgrade & Sell */}
          <div className="flex flex-col gap-2">
            {selectedTower.level < 3 ? (
              (() => {
                const upCost = calculateUpgradeCost(TOWER_CONFIGS[selectedTower.type].baseCost, selectedTower.level);
                const canUp = stats.spicePoints >= upCost;
                const nextStats = calculateTowerStats(selectedTower.type, selectedTower.level + 1);

                return (
                  <button
                    type="button"
                    onClick={() => onUpgradeTower(selectedTower.id)}
                    disabled={!canUp}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs tracking-wide flex items-center justify-between transition cursor-pointer ${
                      canUp
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md hover:scale-[1.01]'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    }`}
                  >
                    <span>Upgrade to Tier {selectedTower.level + 1}</span>
                    <span className="font-display tabular-nums">+{nextStats.damage - selectedTower.damage} DMG ({upCost} SP)</span>
                  </button>
                );
              })()
            ) : (
              <div className="text-center text-xs text-amber-400 font-bold py-1 bg-amber-950/40 rounded-lg border border-amber-600/30">
                ⭐ MAX TIER REACHED ⭐
              </div>
            )}

            <button
              type="button"
              onClick={() => onSellTower(selectedTower.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-red-400 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span>Sell Tower</span>
              <span className="tabular-nums">+{calculateSellValue(selectedTower.cost)} SP</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Perimeter Dock: Spicy Tower Selector Strip & Next Wave Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Next Wave Trigger CTA (if idle) */}
        {!isWaveActive ? (
          <div className="pointer-events-auto">
            <button
              type="button"
              data-start="true"
              onClick={onStartNextWave}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-display text-sm tracking-wider shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-400/50 flex items-center gap-2"
            >
              <span>▶ START WAVE {stats.wave}</span>
              <span className="text-xs bg-stone-950/40 px-2 py-0.5 rounded font-mono">[SPACE]</span>
            </button>
          </div>
        ) : (
          <div className="hidden sm:block pointer-events-auto text-xs text-stone-400 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
            Wave in progress... melt those toppings!
          </div>
        )}

        {/* Tower Selector Cards Strip */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 pointer-events-auto">
          {TOWER_KEYS.map((type, idx) => {
            const config = TOWER_CONFIGS[type];
            const canAffordTower = stats.spicePoints >= config.baseCost;
            const isSelected = selectedTowerType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectTowerType(isSelected ? null : type)}
                disabled={!canAffordTower && !isSelected}
                className={`relative flex flex-col items-center justify-between p-2 rounded-xl transition-all cursor-pointer min-w-[76px] sm:min-w-[88px] h-20 sm:h-22 border text-center ${
                  isSelected
                    ? 'bg-amber-950/90 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                    : canAffordTower
                    ? 'bg-stone-900/90 border-stone-700/80 hover:border-amber-500/70 hover:bg-stone-800/90'
                    : 'bg-stone-900/50 border-stone-800/50 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Hotkey Badge [1-5] */}
                <span className="absolute -top-2 -left-1 text-[10px] bg-stone-950 border border-stone-700 px-1.5 py-0.2 rounded font-mono font-bold text-amber-400">
                  {idx + 1}
                </span>

                {/* Tower Icon / Graphic representation */}
                <div className="text-xl mt-1">
                  {type === 'chili_flakes' && '🌶️'}
                  {type === 'chili_oil' && '🥣'}
                  {type === 'garlic_mortar' && '🧄'}
                  {type === 'peppercorn' && '⚡'}
                  {type === 'habanero_cannon' && '🔥'}
                </div>

                {/* Name */}
                <div className="text-[10px] sm:text-[11px] font-bold text-stone-200 leading-tight truncate max-w-[68px] sm:max-w-[76px]">
                  {type === 'chili_flakes'
                    ? 'Flakes'
                    : type === 'chili_oil'
                    ? 'Oil Moat'
                    : type === 'garlic_mortar'
                    ? 'Garlic'
                    : type === 'peppercorn'
                    ? 'Sichuan'
                    : 'Habanero'}
                </div>

                {/* Cost */}
                <div className="text-[10px] sm:text-[11px] font-extrabold font-display tabular-nums text-amber-300">
                  {config.baseCost} <span className="text-[8px] sm:text-[9px] text-amber-500 font-normal">SP</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
