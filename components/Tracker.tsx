
import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Coffee, AlertTriangle, Zap, Code, Terminal, BookOpen, Layers } from 'lucide-react';
import { Session, UserProfile } from '../types';

interface TrackerProps {
  onSaveSession: (session: Session) => void;
  userProfile: UserProfile;
}

const CATEGORY_THEMES: Record<string, { color: string; icon: any; glow: string }> = {
  'DSA': { 
    color: '#A855F7', // Purple
    glow: 'rgba(168, 85, 247, 0.5)',
    icon: Terminal 
  },
  'Web Dev': { 
    color: '#06B6D4', // Cyan
    glow: 'rgba(6, 182, 212, 0.5)',
    icon: Code 
  },
  'Projects': { 
    color: '#22C55E', // Green
    glow: 'rgba(34, 197, 94, 0.5)',
    icon: Layers 
  },
  'Learning': { 
    color: '#EAB308', // Yellow
    glow: 'rgba(234, 179, 8, 0.5)',
    icon: BookOpen 
  },
  'Debug': { 
    color: '#EF4444', // Red
    glow: 'rgba(239, 68, 68, 0.5)',
    icon: Zap 
  },
};

const Tracker: React.FC<TrackerProps> = ({ onSaveSession, userProfile }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [category, setCategory] = useState('DSA');
  const [showBreakAlert, setShowBreakAlert] = useState(false);

  const currentTheme = CATEGORY_THEMES[category];

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => {
           const newSeconds = s + 1;
           if (userProfile.preferences.notifications.breaks) {
             const breakSeconds = userProfile.preferences.breakFrequency * 60;
             if (newSeconds > 0 && newSeconds % breakSeconds === 0) {
                setShowBreakAlert(true);
                setTimeout(() => setShowBreakAlert(false), 10000);
             }
           }
           return newSeconds;
        });
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, userProfile.preferences]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    if (seconds > 60) {
      const newSession: Session = {
        id: Date.now().toString(),
        category,
        duration: seconds,
        timestamp: Date.now(),
      };
      onSaveSession(newSession);
    }
    setSeconds(0);
    setIsActive(false);
    setShowBreakAlert(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return (
      <div className="flex items-baseline justify-center gap-0.5 md:gap-1 w-full">
        <span className="w-16 md:w-24 text-center font-mono">{h.toString().padStart(2, '0')}</span>
        <span className="text-2xl md:text-5xl text-gray-500 animate-pulse font-light">:</span>
        <span className="w-16 md:w-24 text-center font-mono">{m.toString().padStart(2, '0')}</span>
        <span className="text-2xl md:text-5xl text-gray-500 animate-pulse font-light">:</span>
        <span className="w-16 md:w-24 text-center font-mono">{s.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] items-center justify-center relative w-full py-8 md:py-12">
      
      {/* Background Ambience - Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {isActive && Array.from({ length: 8 }).map((_, i) => (
             <div 
               key={i}
               className="absolute rounded-full opacity-20 animate-float"
               style={{
                 backgroundColor: currentTheme.color,
                 width: Math.random() * 100 + 20 + 'px',
                 height: Math.random() * 100 + 20 + 'px',
                 top: Math.random() * 100 + '%',
                 left: Math.random() * 100 + '%',
                 animationDuration: Math.random() * 5 + 5 + 's',
                 filter: 'blur(40px)'
               }}
             />
         ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-between gap-10">
        
        {/* Category Selector Pills */}
        <div className="flex flex-wrap justify-center gap-3 w-full px-4">
          {Object.keys(CATEGORY_THEMES).map((cat) => {
            const theme = CATEGORY_THEMES[cat];
            const isSelected = category === cat;
            const Icon = theme.icon;
            
            return (
              <button
                key={cat}
                onClick={() => !isActive && setCategory(cat)}
                disabled={isActive}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border whitespace-nowrap ${
                  isSelected
                    ? 'text-white shadow-lg scale-110 backdrop-blur-lg' // Glass Effect applied here
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                } ${isActive && !isSelected ? 'opacity-30' : ''}`}
                style={{
                   // Dynamic background color with 20% opacity (Hex + 33) for glass tint
                   backgroundColor: isSelected ? `${theme.color}33` : undefined, 
                   borderColor: isSelected ? theme.color : 'rgba(255,255,255,0.1)',
                   boxShadow: isSelected ? `0 0 15px ${theme.color}40` : 'none'
                }}
              >
                <Icon size={16} className={isSelected ? 'text-white' : ''} style={{ color: isSelected ? theme.color : undefined }} />
                {cat}
              </button>
            );
          })}
        </div>

        {/* MAIN TIMER CIRCLE */}
        <div className="relative group flex-shrink-0">
          
          {/* Animated Ripples (Behind) */}
          {isActive && (
            <>
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: currentTheme.color }}
              ></div>
              <div 
                className="absolute -inset-4 rounded-full opacity-10 animate-pulse"
                style={{ backgroundColor: currentTheme.color }}
              ></div>
            </>
          )}

          {/* The Engaging Center Circle */}
          <div 
            className="w-72 h-72 md:w-96 md:h-96 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-500 border-4 shadow-2xl backdrop-blur-sm"
            style={{
              borderColor: currentTheme.color,
              // User Engaging Color: Radial Gradient blending category color into dark bg
              background: `radial-gradient(circle at center, ${currentTheme.color}25 0%, #0B1C2D 85%)`,
              boxShadow: isActive 
                ? `0 0 60px ${currentTheme.glow}, inset 0 0 40px ${currentTheme.glow}` 
                : `0 0 20px ${currentTheme.glow}`
            }}
          >
             <p 
               className="text-xs md:text-sm uppercase tracking-[0.2em] font-medium mb-2 md:mb-6 transition-colors duration-300"
               style={{ color: currentTheme.color, textShadow: `0 0 10px ${currentTheme.color}` }}
             >
               {isActive ? 'Session Active' : 'Ready to Focus'}
             </p>

             <div className="text-4xl md:text-7xl font-bold text-white tracking-tighter drop-shadow-lg z-20">
                {formatTime(seconds)}
             </div>

             {/* Inner Orbiting Dot Animation */}
             {isActive && (
               <div className="absolute inset-0 w-full h-full rounded-full animate-spin-slow pointer-events-none">
                  <div 
                    className="w-3 h-3 rounded-full absolute top-6 left-1/2 -translate-x-1/2 shadow-[0_0_15px_#fff]"
                    style={{ backgroundColor: currentTheme.color }}
                  ></div>
               </div>
             )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 mb-4">
          <button
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl text-white relative overflow-hidden group border-2 border-white/10"
            style={{ 
                backgroundColor: currentTheme.color,
                boxShadow: `0 0 30px ${currentTheme.glow}` 
            }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            {isActive ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-1" />}
          </button>

          <button
             onClick={stopTimer}
             disabled={seconds === 0}
             className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                 seconds === 0 
                 ? 'border-gray-700 text-gray-700 cursor-not-allowed opacity-50 bg-gray-900/50' 
                 : 'border-alert/50 text-alert hover:bg-alert hover:text-white hover:border-alert shadow-lg bg-black/40'
             }`}
           >
             <StopCircle size={24} />
           </button>
        </div>

        {/* Dynamic Alerts */}
        {showBreakAlert && (
           <div className="absolute bottom-20 md:bottom-24 animate-bounce z-50 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md border border-warning px-6 py-4 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <AlertTriangle className="text-warning" size={24} />
                <div className="text-left">
                    <h4 className="font-bold text-white text-sm">Break Time!</h4>
                    <p className="text-xs text-gray-300">You've reached your {userProfile.preferences.breakFrequency} min milestone.</p>
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Tracker;
