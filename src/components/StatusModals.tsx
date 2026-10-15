import React from 'react';
import type { GameStats } from '../game/types.ts';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onTitle }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/80 pointer-events-auto">
      <div className="w-full max-w-md bg-stone-900 border-2 border-amber-600/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
        <div className="space-y-1">
          <div className="text-amber-500 text-xs font-bold tracking-widest uppercase">Broth Simulator Paused</div>
          <h2 className="text-3xl font-display text-amber-200">GAME PAUSED</h2>
        </div>

        <p className="text-stone-300 text-sm">
          Take a breath, chef! Inspect the ramen broth or adjust your spice defenses when you resume.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-bold tracking-wide shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            Resume Cooking [Esc / P]
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold border border-stone-700 transition cursor-pointer"
          >
            Restart Siege [R]
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full py-2.5 px-6 rounded-xl bg-transparent hover:bg-stone-800/50 text-stone-400 hover:text-stone-200 text-sm transition cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, onTitle }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/85 pointer-events-auto">
      <div className="w-full max-w-md bg-stone-900 border-2 border-red-600/60 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-3xl">
          🥟💥
        </div>

        <div className="space-y-1">
          <div className="text-red-400 text-xs font-bold tracking-widest uppercase">Broth Breach!</div>
          <h2 className="text-3xl font-display text-red-200">BAO WAS GOBBLED!</h2>
          <p className="text-stone-400 text-sm">The ramen toppings overwhelmed your spice defenses.</p>
        </div>

        {/* Progress Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 bg-stone-950/70 p-4 rounded-xl border border-stone-800">
          <div className="text-center">
            <div className="text-xs text-stone-400 uppercase font-semibold">Wave</div>
            <div className="text-2xl font-bold font-display text-amber-400 tabular-nums">
              {stats.wave}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-stone-400 uppercase font-semibold">Toppings Cooked</div>
            <div className="text-2xl font-bold font-display text-orange-400 tabular-nums">
              {stats.enemiesDefeated}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-stone-400 uppercase font-semibold">Score</div>
            <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
              {stats.score}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            data-start="true"
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer border border-red-400/40"
          >
            Try Again [Space / Enter]
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full py-2.5 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition cursor-pointer"
          >
            Back to Title
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  stats: GameStats;
  onNextWave: () => void;
  onTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onNextWave, onTitle }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/85 pointer-events-auto">
      <div className="w-full max-w-md bg-stone-900 border-2 border-emerald-500/60 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-3xl">
          👑🥟
        </div>

        <div className="space-y-1">
          <div className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Mastery Achieved!</div>
          <h2 className="text-3xl font-display text-emerald-200">RAMEN CONQUERED!</h2>
          <p className="text-stone-300 text-sm">
            All 10 legendary topping waves were vaporized by your glorious spices!
          </p>
        </div>

        {/* Mastery Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 bg-stone-950/70 p-4 rounded-xl border border-stone-800">
          <div className="text-center">
            <div className="text-xs text-stone-400 uppercase font-semibold">Bao HP Left</div>
            <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
              {stats.baoHp}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-stone-400 uppercase font-semibold">Ingredients Melted</div>
            <div className="text-2xl font-bold font-display text-amber-400 tabular-nums">
              {stats.enemiesDefeated}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-stone-400 uppercase font-semibold">Total Score</div>
            <div className="text-2xl font-bold font-display text-orange-400 tabular-nums">
              {stats.score}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            data-start="true"
            onClick={onNextWave}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-amber-600 to-orange-600 hover:from-emerald-500 hover:to-orange-500 text-stone-950 font-bold tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            Enter Endless Frenzy Mode!
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full py-2.5 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
