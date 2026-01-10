
import React, { useState, useEffect, useRef } from 'react';
import { Session, Mood, UserProfile } from '../types';
import { Flame, CheckCircle, TrendingUp, Github, Code, Battery, Sparkles, PlayCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import GettingStarted from './GettingStarted';

interface DashboardProps {
  sessions: Session[];
  moods: { date: string; mood: Mood }[];
  dailyGoalSeconds: number;
  userProfile: UserProfile;
}

const FadeInView = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ sessions, moods, dailyGoalSeconds, userProfile }) => {
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);
  const totalSecondsToday = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  
  const productivityScore = Math.min(100, Math.round((totalSecondsToday / dailyGoalSeconds) * 100));
  
  const burnoutRisk = React.useMemo(() => {
    let risk = 10; // Base risk
    if (totalSecondsToday > 8 * 3600) risk += 50;
    if (totalSecondsToday > 4 * 3600) risk += 20;
    const lastMood = moods[moods.length - 1]?.mood;
    if (lastMood === Mood.EXHAUSTED) risk += 30;
    if (lastMood === Mood.OKAY) risk += 10;
    if (lastMood === Mood.GREAT) risk -= 20;
    return Math.max(0, Math.min(100, risk));
  }, [totalSecondsToday, moods]);

  // Calculate Real Weekly Activity Data
  const weeklyData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDate = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toDateString();
        
        const daySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === dateStr);
        const totalSeconds = daySessions.reduce((acc, s) => acc + s.duration, 0);
        
        data.push({
            name: dayName,
            hours: parseFloat((totalSeconds / 3600).toFixed(2))
        });
    }
    return data;
  }, [sessions]);

  return (
    <div className="space-y-6 relative">
      {/* Getting Started Overlay */}
      {showGettingStarted && <GettingStarted onClose={() => setShowGettingStarted(false)} />}

      {/* Getting Started Trigger Banner */}
      <div className="glass-panel rounded-2xl p-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-fade-in">
         <div className="bg-[#0f172a] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse">
                     <Sparkles size={20} className="text-white" />
                 </div>
                 <div>
                     <h3 className="font-bold text-white">New to FOCUSYNC?</h3>
                     <p className="text-sm text-gray-400">Discover how to maximize your productivity in 30 seconds.</p>
                 </div>
             </div>
             <button 
                onClick={() => setShowGettingStarted(true)}
                className="w-full md:w-auto px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
             >
                <PlayCircle size={18} /> Start Guide
             </button>
         </div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in delay-75">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            Welcome back, {userProfile.name ? userProfile.name.split(' ')[0] : 'Dev'} <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-gray-400">Let's build something great while staying healthy.</p>
        </div>
        {userProfile.integrations.github && (
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-white/5">
            <Github size={18} className="text-white" />
            <span className="text-sm text-gray-300">Connected</span>
          </div>
        )}
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Productivity Score */}
        <FadeInView delay={100}>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group h-full hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} className="text-primary" />
            </div>
            <h3 className="text-gray-400 font-medium mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-primary" /> Productivity Score
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{productivityScore}</span>
              <span className="text-sm text-gray-400">/ 100</span>
            </div>
            <div className="mt-4 w-full bg-background rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000"
                style={{ width: `${productivityScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {productivityScore >= 80 ? "Excellent flow today!" : "Keep consistent, you got this."}
            </p>
          </div>
        </FadeInView>

        {/* Coding Hours */}
        <FadeInView delay={200}>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group h-full hover:border-secondary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code size={80} className="text-secondary" />
            </div>
            <h3 className="text-gray-400 font-medium mb-2 flex items-center gap-2">
              <Code size={16} className="text-secondary" /> Focus Time
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{(totalSecondsToday / 3600).toFixed(1)}</span>
              <span className="text-sm text-gray-400">hours</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Target: {(dailyGoalSeconds / 3600).toFixed(1)} hrs</p>
          </div>
        </FadeInView>

        {/* Burnout Meter */}
        <FadeInView delay={300}>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group h-full hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame size={80} className={burnoutRisk > 70 ? 'text-alert' : 'text-success'} />
            </div>
            <h3 className="text-gray-400 font-medium mb-2 flex items-center gap-2">
              <Battery size={16} className={burnoutRisk > 70 ? 'text-alert' : 'text-success'} /> Burnout Risk
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${burnoutRisk > 50 ? (burnoutRisk > 80 ? 'text-alert' : 'text-warning') : 'text-success'}`}>
                {burnoutRisk}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {burnoutRisk > 70 ? "High risk. Please take a break immediately." : "Levels optimal. Stay hydrated."}
            </p>
          </div>
        </FadeInView>
      </div>

      {/* Main Chart Section */}
      <FadeInView delay={400}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto md:h-[400px]">
          {/* Activity Graph */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col min-h-[300px]">
            <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity Trend</h3>
            <div className="flex-1 w-full min-h-0">
              {sessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="#4B5563" 
                        tick={{fill: '#9CA3AF', fontSize: 12}}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#132F4C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#00E5FF' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#00E5FF" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorHours)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                      No activity recorded yet. Start tracking time!
                  </div>
              )}
            </div>
          </div>

          {/* GitHub / Tasks Summary */}
          <div className="glass-panel p-6 rounded-2xl overflow-y-auto min-h-[300px]">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Commits</h3>
            <div className="space-y-4">
              {userProfile.integrations.github && userProfile.stats?.github?.recent_events && userProfile.stats.github.recent_events.length > 0 ? (
                userProfile.stats.github.recent_events.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-l-2 border-primary/30">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {event.payload.commits?.[0]?.message || 'Pushed commits'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{event.repo.name}</p>
                    </div>
                  </div>
                ))
              ) : userProfile.integrations.github ? (
                // GitHub Connected but no recent events or fallback
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <p>No recent public commits found.</p>
                </div>
              ) : (
                // GitHub Not Connected
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <Github size={40} className="mb-2 opacity-50" />
                    <p>GitHub not connected.</p>
                    <p className="text-xs mt-1">Go to Settings to sync commits.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">Today's Focus</h3>
              {todaySessions.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {Array.from(new Set(todaySessions.map(s => s.category))).map(cat => (
                        <span key={cat} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">{cat}</span>
                    ))}
                  </div>
              ) : (
                  <p className="text-xs text-gray-500">No sessions today.</p>
              )}
            </div>
          </div>
        </div>
      </FadeInView>
    </div>
  );
};

export default Dashboard;
