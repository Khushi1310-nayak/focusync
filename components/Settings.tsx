
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Session, Mood } from '../types';
import { User, Layers, Bell, Shield, Github, Linkedin, Briefcase, GraduationCap, Save, Check, Link as LinkIcon, Camera, Trash2, Edit2, Clock, Activity, Zap, LogOut, AlertTriangle, Download, FileJson, FileSpreadsheet, Brain, Eye, EyeOff, Lock, Database, GitCommit, Share2, ToggleLeft, ToggleRight, Users, BarChart2 } from 'lucide-react';

interface SettingsProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onDeleteAccount: () => void;
  onClearData: (type: 'sessions' | 'moods' | 'ai' | 'all') => void;
  sessions: Session[];
  moods: { date: string; mood: Mood }[];
}

type Tab = 'profile' | 'integrations' | 'preferences' | 'privacy';

// Helper: Compress Image to max 200px and JPEG 80% to save LocalStorage space
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 200; // Max dimension
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Canvas context failed"));
            return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG 0.8 quality
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
};

const Settings: React.FC<SettingsProps> = ({ userProfile, setUserProfile, onDeleteAccount, onClearData, sessions, moods }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [githubTokenInput, setGithubTokenInput] = useState(userProfile.integrations.githubToken || '');
  const [linkedinUrlInput, setLinkedinUrlInput] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Modal State for Disconnecting
  const [disconnectModal, setDisconnectModal] = useState<{ isOpen: boolean; type: 'github' | 'linkedin' | null }>({ isOpen: false, type: null });

  // LinkedIn Edit Mode State
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [linkedinStatsInput, setLinkedinStatsInput] = useState({
      connections: userProfile.stats?.linkedin?.connections || 0,
      followers: userProfile.stats?.linkedin?.followers || 0,
      posts: userProfile.stats?.linkedin?.posts || 0,
      profileViews: userProfile.stats?.linkedin?.profileViews || 0,
      postImpressions: userProfile.stats?.linkedin?.postImpressions || 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Metrics Calculations ---
  const consistency = useMemo(() => {
    if (sessions.length === 0) return 0;
    const today = new Date();
    let activeDaysCount = 0;
    // Check last 7 days
    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toDateString();
        const hasSession = sessions.some(s => new Date(s.timestamp).toDateString() === dateStr);
        if(hasSession) activeDaysCount++;
    }
    return Math.round((activeDaysCount / 7) * 100);
  }, [sessions]);

  const profileStrength = useMemo(() => {
    let score = 0;
    if (userProfile.name) score += 20;
    if (userProfile.avatar) score += 10;
    if (userProfile.integrations.github) score += 25;
    if (userProfile.integrations.linkedin) score += 25;
    if (userProfile.isStudent && userProfile.education?.university) score += 20;
    if (!userProfile.isStudent && userProfile.work?.company) score += 20;
    return Math.min(100, score);
  }, [userProfile]);

  const totalHours = useMemo(() => {
    return (sessions.reduce((acc, s) => acc + s.duration, 0) / 3600).toFixed(1);
  }, [sessions]);

  // Weekly Stats for Growth Overview
  const growthStats = useMemo(() => {
      const commits = userProfile.stats?.github?.recent_events?.length || 0;
      const posts = userProfile.stats?.linkedin?.posts || 0;
      
      let insight = "Start logging sessions to unlock insights.";
      const hours = parseFloat(totalHours);

      if (hours > 10 && posts === 0) {
          insight = "You’re coding a lot but haven’t shared progress publicly. Consider posting once this week.";
      } else if (hours < 2 && posts > 2) {
          insight = "Great networking! Try to balance it with some deep work coding sessions this week.";
      } else if (hours > 5 && posts > 0) {
          insight = "Excellent balance between shipping code and building your personal brand! 🚀";
      } else if (hours > 0) {
          insight = "Consistency is key. Keep showing up every day!";
      }

      return { commits, posts, insight };
  }, [userProfile.stats, totalHours]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call persistence
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [key]: value }));
  };

  const updateNested = (parent: 'education' | 'work' | 'preferences' | 'integrations', key: string, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [key]: value
      }
    }));
  };

  const updatePrivacy = (key: keyof UserProfile['preferences']['privacy'], value: boolean) => {
     setUserProfile(prev => ({
         ...prev,
         preferences: {
             ...prev.preferences,
             privacy: {
                 ...prev.preferences.privacy,
                 [key]: value
             }
         }
     }));
  };

  const updateNotifications = (key: string, value: boolean) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [key]: value
        }
      }
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        updateProfile('avatar', compressedBase64);
      } catch (err) {
        console.error("Image processing error", err);
        alert("Failed to process image. Please try a different file.");
      }
    }
  };

  // --- Export Data Logic ---
  const handleExport = (format: 'json' | 'csv') => {
      if (format === 'json') {
          const data = {
              profile: userProfile,
              sessions: sessions,
              moods: moods,
              exportDate: new Date().toISOString()
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `focusync_data_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
      } else {
          const sessionHeader = "SessionID,Timestamp,Date,Category,Duration(Seconds),Notes\n";
          const sessionRows = sessions.map(s => 
            `${s.id},${s.timestamp},"${new Date(s.timestamp).toLocaleDateString()}",${s.category},${s.duration},"${s.notes || ''}"`
          ).join("\n");
          
          const blob = new Blob([sessionHeader + sessionRows], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `focusync_sessions_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
      }
  };

  // --- Real GitHub Fetch Logic ---
  const handleConnectGithub = async () => {
    const url = githubUrlInput.trim();
    if (!url && !userProfile.integrations.github) return; // Need at least a URL or existing one
    
    // Logic: If user just inputs token but has URL already
    const targetUrl = url || userProfile.integrations.github;
    const username = targetUrl.split('/').pop() || targetUrl;
    
    setIsFetchingGithub(true);
    try {
        const headers: HeadersInit = {};
        if (githubTokenInput.trim()) {
            headers['Authorization'] = `Bearer ${githubTokenInput.trim()}`;
        }

        const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!profileRes.ok) {
             if (profileRes.status === 403) throw new Error("Rate limit exceeded. Please add a Token.");
             if (profileRes.status === 404) throw new Error("GitHub user not found.");
             throw new Error("GitHub API Error");
        }
        const profileData = await profileRes.json();

        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=10`, { headers });
        const eventsData = await eventsRes.json();
        
        const pushEvents = Array.isArray(eventsData) 
            ? eventsData.filter((e: any) => e.type === 'PushEvent') 
            : [];
        
        const newStats = {
            username: profileData.login,
            followers: profileData.followers,
            following: profileData.following,
            public_repos: profileData.public_repos,
            avatar_url: profileData.avatar_url,
            recent_events: pushEvents.slice(0, 5),
            last_fetched: Date.now()
        };

        setUserProfile(prev => {
            const updated = {
                ...prev,
                integrations: { 
                    ...prev.integrations, 
                    github: `https://github.com/${profileData.login}`,
                    githubToken: githubTokenInput.trim() 
                },
                stats: { ...prev.stats, github: newStats }
            };
            if (!prev.avatar && profileData.avatar_url) {
                updated.avatar = profileData.avatar_url;
            }
            return updated;
        });
        setGithubUrlInput('');
    } catch (error: any) {
        alert(`Failed to sync GitHub: ${error.message}`);
        console.error(error);
    } finally {
        setIsFetchingGithub(false);
    }
  };

  const initiateDisconnect = (type: 'github' | 'linkedin') => {
      setDisconnectModal({ isOpen: true, type });
  };

  const confirmDisconnect = () => {
      if (disconnectModal.type === 'github') {
        setUserProfile(prev => ({
            ...prev,
            integrations: { ...prev.integrations, github: '', githubToken: '' },
            stats: { ...prev.stats, github: undefined }
        }));
        setGithubTokenInput('');
      } else if (disconnectModal.type === 'linkedin') {
        setUserProfile(prev => ({
            ...prev,
            integrations: { ...prev.integrations, linkedin: '' },
            stats: { ...prev.stats, linkedin: undefined }
        }));
      }
      setDisconnectModal({ isOpen: false, type: null });
  };

  // --- LinkedIn Logic ---
  const handleConnectLinkedIn = () => {
    if(linkedinUrlInput.trim() !== '') {
        updateNested('integrations', 'linkedin', linkedinUrlInput);
        // Initialize stats with defaults if not present
        setUserProfile(prev => {
             const baseStats = prev.stats?.linkedin || { 
                connections: 0, 
                followers: 0, 
                posts: 0,
                profileViews: 0,
                postImpressions: 0
             };
             return {
                 ...prev,
                 stats: { ...prev.stats, linkedin: baseStats }
             }
        });
        setLinkedinUrlInput(''); 
        // Immediately trigger edit mode because we can't fetch private stats automatically
        setIsEditingLinkedin(true);
    }
  };
  
  const saveLinkedinStats = () => {
      setUserProfile(prev => ({
          ...prev,
          stats: { ...prev.stats, linkedin: linkedinStatsInput }
      }));
      setIsEditingLinkedin(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] relative">
      {/* Settings Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="glass-panel p-4 rounded-2xl h-full">
          <h2 className="text-xl font-bold text-white mb-6 px-2">Settings</h2>
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'integrations', label: 'Integrations', icon: Layers },
              { id: 'preferences', label: 'Preferences', icon: Bell },
              { id: 'privacy', label: 'Privacy & Data', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex-shrink-0 lg:w-full flex items-center p-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary border border-primary/20 neon-glow'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 glass-panel p-6 lg:p-10 rounded-2xl overflow-y-auto mb-20 lg:mb-0">
        
        {/* === PROFILE TAB === */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in-up">
            <header className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white">Public Profile</h3>
                <p className="text-gray-400 text-sm mt-1">Manage your professional identity and career goals.</p>
              </div>
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                     {userProfile.avatar ? (
                       <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       <User size={32} className="text-gray-400" />
                     )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-background hover:scale-110 transition-transform shadow-lg"
                  title="Upload Photo"
                >
                  <Camera size={14} />
                </button>
              </div>
            </header>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={userProfile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none focus:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <select
                  value={userProfile.role}
                  onChange={(e) => updateProfile('role', e.target.value)}
                  className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                >
                  <option className="bg-card text-white">Student</option>
                  <option className="bg-card text-white">Developer</option>
                  <option className="bg-card text-white">Engineer</option>
                  <option className="bg-card text-white">Freelancer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Primary Field</label>
                <select
                  value={userProfile.field}
                  onChange={(e) => updateProfile('field', e.target.value)}
                  className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                >
                  <option className="bg-card text-white">Web Dev</option>
                  <option className="bg-card text-white">App Dev</option>
                  <option className="bg-card text-white">Backend</option>
                  <option className="bg-card text-white">AI / ML</option>
                  <option className="bg-card text-white">DSA / CP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Current Focus</label>
                <select
                  value={userProfile.currentFocus}
                  onChange={(e) => updateProfile('currentFocus', e.target.value)}
                  className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                >
                  <option className="bg-card text-white">Projects</option>
                  <option className="bg-card text-white">Placements</option>
                  <option className="bg-card text-white">Internships</option>
                  <option className="bg-card text-white">Learning</option>
                </select>
              </div>
            </div>

            <div className="border-t border-white/5 my-6"></div>

            {/* Education / Work Toggle */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                 <button 
                  onClick={() => updateProfile('isStudent', true)}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${userProfile.isStudent ? 'bg-primary/10 border-primary/50 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                 >
                   <GraduationCap size={20} /> I am a Student
                 </button>
                 <button 
                  onClick={() => updateProfile('isStudent', false)}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${!userProfile.isStudent ? 'bg-secondary/10 border-secondary/50 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                 >
                   <Briefcase size={20} /> I am a Professional
                 </button>
              </div>

              {userProfile.isStudent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">University / College</label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={userProfile.education?.university || ''}
                      onChange={(e) => updateNested('education', 'university', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Degree & Major</label>
                    <input
                      type="text"
                      placeholder="e.g. B.S. Computer Science"
                      value={userProfile.education?.degree || ''}
                      onChange={(e) => updateNested('education', 'degree', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={userProfile.work?.company || ''}
                      onChange={(e) => updateNested('work', 'company', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={userProfile.work?.title || ''}
                      onChange={(e) => updateNested('work', 'title', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Professional Growth Overview - Unified Activity Dashboard */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-primary" /> Professional Growth Overview
              </h3>
              
              <div className="bg-gradient-to-br from-[#1e293b] to-card border border-white/5 rounded-2xl p-6 shadow-xl">
                {/* 1. Consistency Index */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-200">Weekly Consistency Index</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{consistency}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000"
                      style={{ width: `${consistency}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Based on active session days in the last 7 days.</p>
                </div>

                {/* 2. Coding vs Networking Balance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                     <div className="p-3 bg-primary/10 rounded-full">
                       <GitCommit size={20} className="text-primary" />
                     </div>
                     <div>
                       <p className="text-xs text-gray-400">Coding Activity</p>
                       <p className="text-lg font-bold text-white">{growthStats.commits > 0 ? `${growthStats.commits} events` : 'No events'}</p>
                       <p className="text-[10px] text-gray-500">GitHub pushes & activity</p>
                     </div>
                  </div>

                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                     <div className="p-3 bg-blue-500/10 rounded-full">
                       <Share2 size={20} className="text-blue-400" />
                     </div>
                     <div>
                       <p className="text-xs text-gray-400">Networking Activity</p>
                       <p className="text-lg font-bold text-white">{growthStats.posts} posts</p>
                       <p className="text-[10px] text-gray-500">LinkedIn updates</p>
                     </div>
                  </div>
                </div>

                {/* 3. AI Insight */}
                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl flex items-start gap-3">
                  <Brain size={20} className="text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">AI Growth Insight</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      "{growthStats.insight}"
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2 italic">*AI analyzes your weekly habits to provide these tips. No pressure, just suggestions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === INTEGRATIONS TAB === */}
        {activeTab === 'integrations' && (
          <div className="space-y-8 animate-fade-in-up">
             <div>
                <h3 className="text-2xl font-bold text-white">Platform Integrations</h3>
                <p className="text-gray-400 text-sm mt-1">Connect your dev tools for deeper insights.</p>
              </div>

              {/* GitHub Card */}
              <div className={`p-6 rounded-2xl border transition-all ${userProfile.integrations.github ? 'bg-primary/5 border-primary/30' : 'bg-card border-white/5'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <Github size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">GitHub</h4>
                      <p className="text-sm text-gray-400">Sync commits, PRs, and coding streaks.</p>
                    </div>
                  </div>
                  {userProfile.integrations.github && (
                     <button 
                     onClick={() => initiateDisconnect('github')}
                     className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20"
                   >
                     Disconnect
                   </button>
                  )}
                </div>

                {!userProfile.integrations.github ? (
                     <div className="flex flex-col gap-3 animate-fade-in">
                        {/* URL Input */}
                        <div className="flex flex-col sm:flex-row gap-2">
                           <input
                                type="text"
                                placeholder="https://github.com/username"
                                value={githubUrlInput}
                                onChange={(e) => setGithubUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConnectGithub()}
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all w-full"
                            />
                             <button 
                                onClick={handleConnectGithub}
                                disabled={!githubUrlInput || isFetchingGithub}
                                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-primary text-background rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 min-w-[100px]"
                             >
                                {isFetchingGithub ? 'Syncing...' : 'Connect'}
                             </button>
                        </div>
                        
                        {/* Optional Token Input */}
                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="Personal Access Token (Optional - fixes Rate Limits)"
                                value={githubTokenInput}
                                onChange={(e) => setGithubTokenInput(e.target.value)}
                                className="w-full bg-black/10 border border-white/5 rounded-xl px-4 py-2 text-sm text-gray-300 focus:border-primary/30 focus:outline-none transition-all"
                            />
                            <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                Add a classic PAT with `repo` scope if you see rate limit errors. Stored locally.
                            </p>
                        </div>
                    </div>
                ) : (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5 break-all">
                        <div className="flex items-center gap-3">
                            <Check size={18} className="text-green-400 flex-shrink-0" />
                            <span className="text-gray-300">Connected to <strong>{userProfile.stats?.github?.username || userProfile.integrations.github}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => {
                                    setGithubTokenInput(userProfile.integrations.githubToken || '');
                                    // Trigger fetch again
                                    handleConnectGithub();
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white"
                                title="Refresh Data / Update Token"
                            >
                                <Zap size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="bg-black/20 p-4 rounded-xl">
                          <p className="text-xs text-gray-400 mb-1">Active Repos</p>
                          <p className="text-2xl font-bold text-white">{userProfile.stats?.github?.public_repos || 0}</p>
                       </div>
                       <div className="bg-black/20 p-4 rounded-xl">
                          <p className="text-xs text-gray-400 mb-1">Following</p>
                          <p className="text-2xl font-bold text-primary">{userProfile.stats?.github?.following || 0}</p>
                       </div>
                       <div className="bg-black/20 p-4 rounded-xl">
                          <p className="text-xs text-gray-400 mb-1">Followers</p>
                          <p className="text-2xl font-bold text-white">{userProfile.stats?.github?.followers || 0}</p>
                       </div>
                       <div className="bg-black/20 p-4 rounded-xl">
                          <p className="text-xs text-gray-400 mb-1">Events</p>
                          <p className="text-2xl font-bold text-secondary">{userProfile.stats?.github?.recent_events?.length || 0}</p>
                       </div>
                    </div>
                    
                    {/* Visual Contribution Graph */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-sm font-bold text-white mb-4">Contribution Graph</p>
                        <div className="w-full overflow-x-auto">
                            <img 
                                src={`https://ghchart.rshah.org/00E5FF/${userProfile.stats?.github?.username}`} 
                                alt="Github Chart" 
                                className="min-w-[600px] w-full opacity-90"
                            />
                        </div>
                    </div>
                  </div>
                )}
              </div>

               {/* LinkedIn Card */}
               <div className={`p-6 rounded-2xl border transition-all ${userProfile.integrations.linkedin ? 'bg-blue-600/10 border-blue-500/30' : 'bg-card border-white/5'}`}>
                 <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Linkedin size={24} className="text-white" />
                        </div>
                        <div>
                        <h4 className="text-lg font-bold text-white">LinkedIn</h4>
                        <p className="text-sm text-gray-400">Track professional growth.</p>
                        </div>
                    </div>
                    {userProfile.integrations.linkedin && !isEditingLinkedin && (
                        <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                    setLinkedinStatsInput({
                                        connections: userProfile.stats?.linkedin?.connections || 0,
                                        followers: userProfile.stats?.linkedin?.followers || 0,
                                        posts: userProfile.stats?.linkedin?.posts || 0,
                                        profileViews: userProfile.stats?.linkedin?.profileViews || 0,
                                        postImpressions: userProfile.stats?.linkedin?.postImpressions || 0,
                                    });
                                    setIsEditingLinkedin(true);
                                }}
                                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            >
                                <Edit2 size={16} /> Update Stats
                            </button>
                            <button 
                                onClick={() => initiateDisconnect('linkedin')}
                                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                                Disconnect
                            </button>
                       </div>
                    )}
                </div>
                 {!userProfile.integrations.linkedin ? (
                     <div className="flex flex-col sm:flex-row gap-2 animate-fade-in">
                        <input
                            type="text"
                            placeholder="https://linkedin.com/in/username"
                            value={linkedinUrlInput}
                            onChange={(e) => setLinkedinUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConnectLinkedIn()}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none transition-all w-full"
                        />
                         <button 
                            onClick={handleConnectLinkedIn}
                            disabled={!linkedinUrlInput}
                            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            Connect
                         </button>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6">
                         <div className="bg-black/20 p-4 rounded-xl flex items-center gap-3 border border-white/5 break-all">
                            <Check size={18} className="text-green-400 flex-shrink-0" />
                            <span className="text-gray-300">Connected to <strong>{userProfile.integrations.linkedin}</strong></span>
                         </div>
                         
                         {isEditingLinkedin ? (
                             <div className="bg-black/20 p-6 rounded-xl border border-blue-500/30">
                                 <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                     <BarChart2 size={18} className="text-blue-400" /> Update LinkedIn Metrics
                                 </h4>
                                 <p className="text-xs text-gray-400 mb-4">
                                     🔒 Private metrics like Profile Views and Post Impressions cannot be fetched publicly due to LinkedIn's API privacy policy. 
                                     Please input them manually from your dashboard to track your growth here.
                                 </p>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                     <div>
                                         <label className="text-xs text-gray-500 mb-1 block">Connections</label>
                                         <input 
                                            type="number" 
                                            value={linkedinStatsInput.connections}
                                            onChange={(e) => setLinkedinStatsInput({...linkedinStatsInput, connections: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs text-gray-500 mb-1 block">Followers</label>
                                         <input 
                                            type="number" 
                                            value={linkedinStatsInput.followers}
                                            onChange={(e) => setLinkedinStatsInput({...linkedinStatsInput, followers: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs text-gray-500 mb-1 block">Profile Views (Last 90 Days)</label>
                                         <input 
                                            type="number" 
                                            value={linkedinStatsInput.profileViews}
                                            onChange={(e) => setLinkedinStatsInput({...linkedinStatsInput, profileViews: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs text-gray-500 mb-1 block">Post Impressions (Last 7 Days)</label>
                                         <input 
                                            type="number" 
                                            value={linkedinStatsInput.postImpressions}
                                            onChange={(e) => setLinkedinStatsInput({...linkedinStatsInput, postImpressions: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
                                         />
                                     </div>
                                      <div>
                                         <label className="text-xs text-gray-500 mb-1 block">Total Posts</label>
                                         <input 
                                            type="number" 
                                            value={linkedinStatsInput.posts}
                                            onChange={(e) => setLinkedinStatsInput({...linkedinStatsInput, posts: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
                                         />
                                     </div>
                                 </div>
                                 <button 
                                    onClick={saveLinkedinStats}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                                 >
                                     Save Metrics
                                 </button>
                             </div>
                         ) : (
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Connections</p>
                                    <p className="text-2xl font-bold text-white">{userProfile.stats?.linkedin?.connections || 0}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Followers</p>
                                    <p className="text-2xl font-bold text-blue-400">{userProfile.stats?.linkedin?.followers || 0}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Profile Views</p>
                                    <p className="text-2xl font-bold text-white">{userProfile.stats?.linkedin?.profileViews || 0}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 mb-1">Impressions</p>
                                    <p className="text-2xl font-bold text-green-400">{userProfile.stats?.linkedin?.postImpressions || 0}</p>
                                </div>
                             </div>
                         )}
                    </div>
                )}
               </div>
          </div>
        )}

        {/* === PREFERENCES TAB === */}
        {activeTab === 'preferences' && (
           <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-2xl font-bold text-white">Productivity Preferences</h3>
                <p className="text-gray-400 text-sm mt-1">Tailor the experience to your workflow. Everything is optional.</p>
              </div>

              {/* Work Configuration */}
              <div className="bg-card/30 p-6 rounded-2xl border border-white/5">
                 <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <Clock size={18} className="text-primary" /> Work & Focus Config
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Preferred Work Hours</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 - 17:00"
                        value={userProfile.preferences.workHours}
                        onChange={(e) => updateNested('preferences', 'workHours', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none placeholder-gray-600"
                      />
                      <p className="text-[10px] text-gray-500">Used to calculate daily productivity targets.</p>
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Break Frequency (Minutes)</label>
                      <select
                        value={userProfile.preferences.breakFrequency}
                        onChange={(e) => updateNested('preferences', 'breakFrequency', parseInt(e.target.value))}
                        className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                      >
                        <option className="bg-card text-white" value={25}>25 (Pomodoro)</option>
                        <option className="bg-card text-white" value={45}>45 (Balanced)</option>
                        <option className="bg-card text-white" value={60}>60 (Deep Work)</option>
                        <option className="bg-card text-white" value={90}>90 (Extended)</option>
                      </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-300">Focus Style</label>
                      <div className="grid grid-cols-3 gap-3">
                         {['Deep Work', 'Short Bursts', 'Flow'].map((style) => (
                           <button
                             key={style}
                             onClick={() => updateNested('preferences', 'focusStyle', style)}
                             className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                               userProfile.preferences.focusStyle === style 
                               ? 'bg-primary/20 border-primary text-primary' 
                               : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                             }`}
                           >
                             {style}
                           </button>
                         ))}
                      </div>
                  </div>
                </div>
              </div>

              {/* Notifications Control */}
              <div className="bg-card/30 p-6 rounded-2xl border border-white/5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <Bell size={18} className="text-secondary" /> Notifications Control
                </h4>
                <p className="text-sm text-gray-400 mb-6">Manage your alerts. No spam, we promise. 🚫</p>
                
                <div className="space-y-4">
                  {[
                    { key: 'burnout', label: 'Burnout Prevention Alerts', desc: 'Get notified when you exceed 8 hours of coding or report high fatigue.' },
                    { key: 'breaks', label: 'Smart Break Reminders', desc: 'Gentle nudges to take a breather based on your break frequency.' },
                    { key: 'reports', label: 'Weekly Progress Reports', desc: 'A concise summary of your productivity and mood sent weekly.' },
                    { key: 'checkins', label: 'AI Mood Check-ins', desc: 'Occasional prompts to log your mood during long sessions.' },
                  ].map((item) => {
                     const isEnabled = userProfile.preferences.notifications[item.key as keyof typeof userProfile.preferences.notifications];
                     return (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="pr-4">
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => updateNotifications(item.key, !isEnabled)}
                            className={`flex-shrink-0 w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isEnabled ? 'bg-secondary' : 'bg-gray-700'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                      </div>
                     );
                  })}
                </div>
              </div>
           </div>
        )}

        {/* === PRIVACY & DATA TAB === */}
        {activeTab === 'privacy' && (
          <div className="space-y-10 animate-fade-in-up">
            <div>
              <h3 className="text-2xl font-bold text-white">Privacy & Data Control</h3>
              <p className="text-gray-400 text-sm mt-1">Total transparency. Your data stays on your device.</p>
            </div>

            {/* 1. Download Your Data */}
            <section className="bg-card/50 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Download size={20} className="text-primary" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Download Your Data</h4>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                    Export your productivity logs, mood history, and insights. Perfect for your own records or analysis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => handleExport('json')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-gray-200"
                    >
                        <FileJson size={18} className="text-yellow-400" /> Export JSON (Full Backup)
                    </button>
                    <button 
                        onClick={() => handleExport('csv')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-gray-200"
                    >
                        <FileSpreadsheet size={18} className="text-green-400" /> Export CSV (Reports)
                    </button>
                </div>
            </section>

            {/* 2. AI Data Usage Transparency */}
            <section className="bg-card/50 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <Brain size={20} className="text-secondary" />
                    </div>
                    <h4 className="text-lg font-bold text-white">AI Usage & Privacy</h4>
                </div>
                
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6 space-y-2">
                    <div className="flex items-start gap-2">
                         <Check size={16} className="text-success mt-0.5" />
                         <p className="text-sm text-gray-300">AI analyzes activity patterns, <strong className="text-white">not your code content</strong>.</p>
                    </div>
                     <div className="flex items-start gap-2">
                         <Check size={16} className="text-success mt-0.5" />
                         <p className="text-sm text-gray-300">No source code or private repo data is stored on our servers.</p>
                    </div>
                     <div className="flex items-start gap-2">
                         <Check size={16} className="text-success mt-0.5" />
                         <p className="text-sm text-gray-300">All session data is stored locally in your browser.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Allow AI Personalization</p>
                            <p className="text-xs text-gray-500">Tailors coaching advice based on your mood logs.</p>
                        </div>
                        <button 
                            onClick={() => updatePrivacy('aiPersonalization', !userProfile.preferences.privacy?.aiPersonalization)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${userProfile.preferences.privacy?.aiPersonalization ? 'bg-secondary' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${userProfile.preferences.privacy?.aiPersonalization ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Share Anonymous Stats</p>
                            <p className="text-xs text-gray-500">Helps us improve the burnout prediction model.</p>
                        </div>
                         <button 
                            onClick={() => updatePrivacy('dataImprovement', !userProfile.preferences.privacy?.dataImprovement)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${userProfile.preferences.privacy?.dataImprovement ? 'bg-secondary' : 'bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${userProfile.preferences.privacy?.dataImprovement ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </section>

             {/* 3. Clear History & Danger Zone */}
             <section className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <Trash2 size={20} className="text-red-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">History & Reset</h4>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-200">Clear Productivity History</p>
                            <p className="text-xs text-gray-500">Deletes all tracked sessions and timers.</p>
                        </div>
                        <button 
                            onClick={() => onClearData('sessions')}
                            className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10"
                        >
                            Clear Logs
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-200">Reset Burnout Metrics</p>
                            <p className="text-xs text-gray-500">Clears mood logs and daily fatigue stats.</p>
                        </div>
                        <button 
                            onClick={() => onClearData('moods')}
                            className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10"
                        >
                            Reset Metrics
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-200">Reset AI Learning Profile</p>
                            <p className="text-xs text-gray-500">Forgets your personalization preferences.</p>
                        </div>
                        <button 
                             onClick={() => onClearData('ai')}
                             className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10"
                        >
                            Reset Profile
                        </button>
                    </div>

                    <div className="h-px bg-red-500/20 my-4"></div>

                    <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-bold text-red-500">Delete Account</p>
                            <p className="text-xs text-red-500/60">Permanently remove all data. Cannot be undone.</p>
                        </div>
                         {!showDeleteConfirm ? (
                          <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-500/20"
                          >
                            Delete Account
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setShowDeleteConfirm(false)}
                              className="px-3 py-2 bg-gray-700 text-white rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={onDeleteAccount}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold animate-pulse"
                            >
                              Confirm
                            </button>
                          </div>
                        )}
                    </div>
                </div>
             </section>
          </div>
        )}

      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 z-50">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all ${isSaving ? 'bg-success text-white' : 'bg-primary text-background hover:bg-primary/90 hover:scale-105'}`}
        >
          {isSaving ? <Check size={20} /> : <Save size={20} />}
          {isSaving ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

       {/* Disconnect Modal */}
       {disconnectModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-alert/10 flex items-center justify-center mb-4 text-alert border border-alert/20">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Disconnect Integration?</h3>
                        <p className="text-gray-400 text-sm">
                            Are you sure you want to disconnect <strong>{disconnectModal.type === 'github' ? 'GitHub' : 'LinkedIn'}</strong>? 
                            This will stop tracking metrics for this platform.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDisconnectModal({ isOpen: false, type: null })}
                            className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDisconnect}
                            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-alert hover:bg-alert/90 shadow-lg shadow-alert/20 transition-all"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Settings;
