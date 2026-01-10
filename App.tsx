
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';
import Settings from './components/Settings';
import MoodCheckin from './components/MoodCheckin';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { View, Session, Mood, UserProfile } from './types';
import { AlertTriangle, X, HeartPulse, BellRing } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  avatar: '',
  role: 'Developer',
  field: 'Web Dev',
  currentFocus: 'Projects',
  isStudent: false,
  hasCompletedOnboarding: false,
  chatHistory: [],
  work: { company: '', title: '', experience: '', type: 'Remote' },
  education: { university: '', degree: '', year: '', gradYear: '' },
  integrations: { github: '', linkedin: '', githubToken: '' },
  stats: { github: undefined, linkedin: { connections: 0, followers: 0, posts: 0 } },
  preferences: {
      workHours: '',
      breakFrequency: 45,
      focusStyle: 'Deep Work',
      notifications: { burnout: true, breaks: true, reports: false, checkins: true },
      privacy: { aiPersonalization: true, dataImprovement: false }
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [moods, setMoods] = useState<{ date: string; mood: Mood }[]>([]);
  const [dailyGoalSeconds] = useState(4 * 3600); 
  const [alerts, setAlerts] = useState<{id: string, message: string, type: 'warning' | 'info'}[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load User Data on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('focusync_current_user');
    if (storedUser) {
      loadUserData(storedUser);
    }
  }, []);

  const loadUserData = (email: string) => {
    const allUsers = JSON.parse(localStorage.getItem('focusync_users') || '{}');
    const userData = allUsers[email];
    if (userData) {
      setCurrentUser(email);
      // Merge with default to ensure new fields like 'privacy' and 'hasCompletedOnboarding' exist for old users
      setUserProfile({ 
          ...DEFAULT_PROFILE, 
          ...userData.profile,
          preferences: { ...DEFAULT_PROFILE.preferences, ...userData.profile?.preferences },
          integrations: { ...DEFAULT_PROFILE.integrations, ...userData.profile?.integrations }
      });
      setSessions(userData.sessions || []);
      setMoods(userData.moods || []);
      localStorage.setItem('focusync_current_user', email);
    }
  };

  const persistData = () => {
    if (!currentUser) return;
    const allUsers = JSON.parse(localStorage.getItem('focusync_users') || '{}');
    allUsers[currentUser] = {
      ...allUsers[currentUser],
      profile: userProfile,
      sessions: sessions,
      moods: moods,
    };
    localStorage.setItem('focusync_users', JSON.stringify(allUsers));
  };

  // Persist on changes
  useEffect(() => {
    if (currentUser) {
      persistData();
    }
  }, [sessions, moods, userProfile]);

  const handleLogin = (email: string) => {
    loadUserData(email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('focusync_current_user');
    // Clear state
    setUserProfile(DEFAULT_PROFILE);
    setSessions([]);
    setMoods([]);
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
      const allUsers = JSON.parse(localStorage.getItem('focusync_users') || '{}');
      delete allUsers[currentUser];
      localStorage.setItem('focusync_users', JSON.stringify(allUsers));
      handleLogout();
    }
  };
  
  // FIXED: Strictly update localStorage AND state to ensure buttons work immediately
  const handleClearData = (type: 'sessions' | 'moods' | 'ai' | 'all') => {
      if (!currentUser) return;

      const allUsers = JSON.parse(localStorage.getItem('focusync_users') || '{}');
      if (!allUsers[currentUser]) return;

      if (type === 'sessions' || type === 'all') {
          setSessions([]); // Update State
          allUsers[currentUser].sessions = []; // Update Storage Obj
      }
      if (type === 'moods' || type === 'all') {
          setMoods([]);
          allUsers[currentUser].moods = [];
      }
      if (type === 'ai' || type === 'all') {
          const resetPrefs = { ...userProfile.preferences, privacy: { aiPersonalization: true, dataImprovement: false } };
          setUserProfile(prev => ({ ...prev, preferences: resetPrefs }));
          if (allUsers[currentUser].profile) {
              allUsers[currentUser].profile.preferences = resetPrefs;
          }
      }

      // Force Save
      localStorage.setItem('focusync_users', JSON.stringify(allUsers));
      
      // Feedback
      const msg = type === 'ai' ? 'AI Profile Reset' : `${type.charAt(0).toUpperCase() + type.slice(1)} Cleared`;
      setAlerts(prev => [...prev, { id: Date.now().toString(), message: `${msg} Successfully.`, type: 'info' }]);
  };

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      // Data will auto-persist due to useEffect
  };

  const today = new Date().toDateString();
  const todaysMood = moods.find(m => m.date === today)?.mood || null;

  // Helper to trigger real system notifications
  const sendNotification = (title: string, body: string) => {
    // In-app
    setAlerts(prev => {
        // Prevent duplicate in-app alerts if one exists recently
        if (prev.some(a => a.message === body)) return prev;
        return [...prev, { id: Date.now().toString(), message: body, type: 'warning' }];
    });

    // Browser System Notification
    if ('Notification' in window && Notification.permission === 'granted') {
       new Notification(title, { body, icon: '/favicon.ico' }); // Use default or specific icon
    }
  };

  // Alert System Logic with Real Notification Integration
  useEffect(() => {
    if (!currentUser) return;

    const checkAlerts = () => {
        const todaySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);
        const totalSeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);

        // 1. Burnout Check
        if (userProfile.preferences.notifications.burnout) {
            if (totalSeconds > 8 * 3600) {
                 // Check if we haven't alerted yet today (simplified check)
                 if (!alerts.find(a => a.id.startsWith('burnout'))) {
                    sendNotification("⚠️ High Workload Detected", "You've exceeded 8 hours today. Time to rest to avoid burnout.");
                 }
            }
        }

        // 2. Check-in Reminder
        if (userProfile.preferences.notifications.checkins) {
             // If worked > 2 hours and no mood logged
             if (totalSeconds > 2 * 3600 && !todaysMood) {
                 if (!alerts.find(a => a.message.includes('mood check-in'))) {
                     sendNotification("🧠 Mood Check-in", "How are you feeling? Log your mood to keep track of your mental health.");
                 }
             }
        }
        
        // Note: Break alerts are handled directly in Tracker.tsx during active sessions
    };

    const interval = setInterval(checkAlerts, 60000 * 5); // Check every 5 mins
    
    // Initial check after mount
    const timeout = setTimeout(checkAlerts, 5000); 

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, [sessions, moods, userProfile.preferences.notifications, currentUser, todaysMood]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveSession = (session: Session) => {
    setSessions((prev) => [session, ...prev]);
    // Send a mini celebration notification if enabled
    if (userProfile.preferences.notifications.reports) {
       // Just a toast for finishing session
       setAlerts(prev => [...prev, { 
           id: Date.now().toString(), 
           message: `Great job! ${Math.floor(session.duration / 60)}m logged for ${session.category}.`, 
           type: 'info' 
       }]);
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    setMoods((prev) => [...prev, { date: today, mood }]);
    removeAlert('checkin');
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  // Show Onboarding if not completed
  if (!userProfile.hasCompletedOnboarding) {
      return <Onboarding userProfile={userProfile} onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard sessions={sessions} moods={moods} dailyGoalSeconds={dailyGoalSeconds} userProfile={userProfile} />;
      case 'tracker':
        return <Tracker onSaveSession={handleSaveSession} userProfile={userProfile} />;
      case 'analytics':
        return <Analytics sessions={sessions} />;
      case 'coach':
        // Passed setUserProfile here
        return <AICoach sessions={sessions} moods={moods} userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'settings':
        return (
            <Settings 
                userProfile={userProfile} 
                setUserProfile={setUserProfile} 
                onDeleteAccount={handleDeleteAccount} 
                onClearData={handleClearData}
                sessions={sessions} 
                moods={moods}
            />
        );
      default:
        return <Dashboard sessions={sessions} moods={moods} dailyGoalSeconds={dailyGoalSeconds} userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen text-text font-sans selection:bg-primary selection:text-background flex flex-col lg:flex-row relative overflow-x-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      
      {/* Global Alerts Container */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full">
        {alerts.map(alert => (
            <div 
                key={alert.id} 
                className={`p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 animate-fade-in-down ${
                    alert.type === 'warning' 
                    ? 'bg-alert/20 border-alert/50 text-white' 
                    : 'bg-secondary/20 border-secondary/50 text-white'
                }`}
            >
                {alert.type === 'warning' ? <AlertTriangle size={20} /> : <BellRing size={20} />}
                <p className="text-sm font-medium flex-1">{alert.message}</p>
                <button onClick={() => removeAlert(alert.id)} className="opacity-70 hover:opacity-100">
                    <X size={16} />
                </button>
            </div>
        ))}
      </div>

      <main className="flex-1 p-4 lg:p-8 min-h-screen transition-all mb-20 lg:mb-0 lg:ml-64 w-full">
        <div className="max-w-7xl mx-auto">
          {/* Mood Checkin appears on top if not done today and on Dashboard/Tracker */}
          {!todaysMood && (currentView === 'dashboard' || currentView === 'tracker') && (
            <MoodCheckin onSelect={handleMoodSelect} selectedMood={todaysMood} />
          )}
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
