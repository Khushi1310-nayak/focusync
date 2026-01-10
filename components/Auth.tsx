
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { hashPassword, verifyPassword } from '../utils/crypto';

interface AuthProps {
  onLogin: (email: string) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get users from storage
  const getUsers = () => {
    const users = localStorage.getItem('focusync_users');
    return users ? JSON.parse(users) : {};
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9!@#$%^&*]/.test(pwd)) {
      return "Password must contain at least one number or special character.";
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate network request duration
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getUsers();
      const user = users[email];

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      // Verify Password (Async Hashing)
      const isValid = await verifyPassword(password, user.password);

      if (isValid) {
        // SECURITY UPGRADE:
        // If the user had a legacy plain-text password (no colon), upgrade them to hash now
        if (!user.password.includes(':')) {
           console.log("Upgrading legacy account security...");
           const newHash = await hashPassword(password);
           user.password = newHash;
           users[email] = user;
           localStorage.setItem('focusync_users', JSON.stringify(users));
        }
        
        onLogin(email);
      } else {
        throw new Error('Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate Password Rule
      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getUsers();
      if (users[email]) {
        throw new Error('User already exists. Please login.');
      }

      // Hash the password before storage
      const hashedPassword = await hashPassword(password);

      // Create new user structure
      users[email] = {
        password: hashedPassword, // Store Hash
        profile: {
          name: name || 'Dev',
          avatar: '',
          role: 'Developer',
          field: 'Web Dev',
          currentFocus: 'Projects',
          isStudent: false,
          integrations: { github: '', linkedin: '' },
          stats: { github: undefined, linkedin: { connections: 0, followers: 0, posts: 0 } },
          preferences: {
            workHours: '',
            breakFrequency: 45,
            focusStyle: 'Deep Work',
            notifications: { burnout: true, breaks: true, reports: false, checkins: true }
          }
        },
        sessions: [],
        moods: []
      };

      localStorage.setItem('focusync_users', JSON.stringify(users));
      onLogin(email);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate New Password Rule
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getUsers();
      if (!users[email]) {
        throw new Error('No account found with this email.');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      users[email].password = hashedPassword;
      localStorage.setItem('focusync_users', JSON.stringify(users));
      
      setSuccess('Password secure. Redirecting to login...');
      setTimeout(() => {
        setView('login');
        setPassword('');
        setNewPassword('');
        setSuccess('');
        setIsLoading(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 animate-fade-in-up relative z-10">
        
        <div className="text-center mb-8">
          {/* Modern SVG Logo */}
          <svg 
            width="90" 
            height="90" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-6 drop-shadow-[0_0_25px_rgba(0,229,255,0.4)]"
          >
            <defs>
              <linearGradient id="brandGradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Hexagon Background Frame */}
            <path 
              d="M50 8 L88 28 V72 L50 92 L12 72 V28 Z" 
              stroke="url(#brandGradient)" 
              strokeWidth="1.5" 
              strokeOpacity="0.4"
              fill="rgba(0, 229, 255, 0.03)"
            />

            {/* Stylish F Design */}
            <g filter="url(#glow)">
                <path 
                    d="M 72 32 H 44 C 38 32 35 35 35 41 V 74" 
                    stroke="url(#brandGradient)" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <path 
                    d="M 35 52 H 58" 
                    stroke="url(#brandGradient)" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                />
                <circle cx="68" cy="52" r="4" fill="#00E5FF" className="animate-pulse">
                     <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                     <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
            </g>
          </svg>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight neon-text">FOCUSYNC</h1>
          <p className="text-gray-400">
            {view === 'login' && 'Welcome back, Developer.'}
            {view === 'signup' && 'Start your productive journey.'}
            {view === 'forgot-password' && 'Reset your access.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-alert/10 border border-alert/30 rounded-xl flex items-center gap-2 text-alert text-sm animate-fade-in">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-success/10 border border-success/30 rounded-xl flex items-center gap-2 text-success text-sm animate-fade-in">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : view === 'signup' ? handleSignup : handleForgotPassword} className="space-y-4">
          
          {view === 'signup' && (
             <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all focus:bg-white/5"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all focus:bg-white/5"
              />
            </div>
          </div>

          {(view === 'login' || view === 'signup') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:border-primary/50 focus:outline-none transition-all focus:bg-white/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {view === 'signup' && (
                <p className="text-[10px] text-gray-500 ml-1">
                  Must be 8+ chars, include an uppercase letter & a number/symbol.
                </p>
              )}
            </div>
          )}

          {view === 'forgot-password' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New secure password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:border-primary/50 focus:outline-none transition-all focus:bg-white/5"
                />
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 ml-1">
                  Must be 8+ chars, include an uppercase letter & a number/symbol.
              </p>
            </div>
          )}

          {view === 'login' && (
             <div className="flex justify-end">
               <button 
                 type="button" 
                 onClick={() => { setView('forgot-password'); setError(''); setSuccess(''); }}
                 className="text-xs text-primary hover:text-primary/80 transition-colors"
               >
                 Forgot password?
               </button>
             </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
            ) : (
               <>
                 {view === 'login' && 'Log In'}
                 {view === 'signup' && 'Create Account'}
                 {view === 'forgot-password' && 'Reset Password'}
                 <ArrowRight size={18} />
               </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          {view === 'login' ? (
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => { setView('signup'); setError(''); }} className="text-white font-medium hover:text-primary transition-colors">
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => { setView('login'); setError(''); }} className="text-white font-medium hover:text-primary transition-colors">
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
