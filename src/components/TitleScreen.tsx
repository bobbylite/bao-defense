import React, { useEffect } from 'react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenHowToPlay?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 pointer-events-auto bg-stone-950/85">
      {/* Top Banner / Theme */}
      <div className="w-full flex items-center justify-between text-amber-500/80 text-sm tracking-widest font-semibold uppercase">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>Authentic Ramen Bowl Defense</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-stone-400">
          <span>Wave-Based Strategy</span>
          <span>•</span>
          <span>60 FPS Sim</span>
        </div>
      </div>

      {/* Main Center Monument: Bespoke SVG Title Lockup & Hero Bao */}
      <div className="flex flex-col items-center max-w-2xl text-center space-y-6 my-auto">
        {/* Bespoke Ramen Bowl & Bao Mascot SVG Emblem */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto animate-bounce-subtle">
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-2xl">
            {/* Ramen Bowl Base */}
            <ellipse cx="80" cy="115" rx="68" ry="32" fill="#1c1917" stroke="#d97706" strokeWidth="4" />
            <ellipse cx="80" cy="110" rx="62" ry="24" fill="#92400e" />
            {/* Steaming Broth & Chili Oil */}
            <ellipse cx="80" cy="110" rx="54" ry="18" fill="#b45309" />
            <circle cx="55" cy="112" r="6" fill="#dc2626" />
            <circle cx="105" cy="108" r="8" fill="#dc2626" />
            <circle cx="85" cy="116" r="5" fill="#ef4444" />
            
            {/* Bamboo Steamer Rim */}
            <circle cx="80" cy="80" r="46" fill="#fef3c7" stroke="#78350f" strokeWidth="4" />
            <circle cx="80" cy="80" r="38" fill="#d97706" />

            {/* BAO (The Pork Bun Hero) */}
            <ellipse cx="80" cy="80" rx="30" ry="26" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
            {/* Bao Top Swirl */}
            <circle cx="80" cy="62" r="5" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
            {/* Cute Kawaii Face */}
            <circle cx="72" cy="79" r="3" fill="#1c1917" />
            <circle cx="88" cy="79" r="3" fill="#1c1917" />
            {/* Blushing cheeks */}
            <circle cx="67" cy="84" r="4" fill="#f43f5e" opacity="0.6" />
            <circle cx="93" cy="84" r="4" fill="#f43f5e" opacity="0.6" />
            {/* Happy Smile */}
            <path d="M 76 84 Q 80 88 84 84" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Chef Fiery Headband */}
            <rect x="58" y="70" width="44" height="6" rx="2" fill="#ef4444" />
            <circle cx="80" cy="73" r="2" fill="#ffffff" />

            {/* Rising Chili Flakes / Steam */}
            <circle cx="70" cy="38" r="3" fill="#ef4444" opacity="0.8" />
            <circle cx="90" cy="32" r="4" fill="#f97316" opacity="0.7" />
            <circle cx="80" cy="22" r="3.5" fill="#facc15" opacity="0.6" />
          </svg>
        </div>

        {/* Title Lockup */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded bg-red-950/80 border border-red-600/50 text-red-400 text-xs font-bold tracking-wider uppercase mb-1">
            SPICY TOWER DEFENSE
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
            BAO DEFENSE
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-amber-100 tracking-wide">
            RAMEN BOWL SIEGE
          </p>
        </div>

        {/* Narrative / Pitch */}
        <p className="text-stone-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          You are <strong className="text-amber-300">Bao</strong>, a tender steamed pork bun resting in a steaming bowl of ramen. Hungry topping waves—<span className="text-emerald-400">scallions</span>, <span className="text-amber-400">soy eggs</span>, and colossal <span className="text-orange-400">chashu pork belly</span>—are swarming down the noodle spiral! Fortify your broth with fiery chili oil and searing spice towers to survive!
        </p>

        {/* Primary Start CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-display text-lg tracking-wider shadow-lg shadow-red-900/40 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-amber-300/40"
          >
            START RAMEN SIEGE
          </button>
        </div>
      </div>

      {/* Control Hint Line (Strictly Single Flat Line in Bottom Margin) */}
      <div className="w-full text-center text-xs sm:text-sm text-stone-400 font-medium tracking-wide border-t border-stone-800/80 pt-4">
        Click to Place · 1-5 Select Spice · Space Chili Frenzy · Esc/P Pause · M Mute
      </div>
    </div>
  );
};
