
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Bell, Zap, Coffee, Battery, CheckCircle, Sparkles, Brain, Cpu } from 'lucide-react';

interface OnboardingProps {
  userProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "What's your primary coding goal right now?",
    icon: <Zap size={32} className="text-yellow-400" />,
    options: [
      { label: "Mastering DSA / LeetCode", value: "DSA", focus: "Placements" },
      { label: "Building Shipping Projects", value: "Dev", focus: "Projects" },
      { label: "Learning New Tech Stack", value: "Learner", focus: "Learning" },
      { label: "Landing an Internship/Job", value: "Job", focus: "Internships" },
    ]
  },
  {
    id: 2,
    question: "How do you usually handle stress while coding?",
    icon: <Brain size={32} className="text-pink-400" />,
    options: [
      { label: "I push through until it works", style: "Deep Work" },
      { label: "I take a nap or walk away", style: "Short Bursts" },
      { label: "I get frustrated & procrastinate", style: "Short Bursts" },
      { label: "I listen to music & zone out", style: "Flow" },
    ]
  },
  {
    id: 3,
    question: "What's your preferred work environment?",
    icon: <Cpu size={32} className="text-blue-400" />,
    options: [
      { label: "Absolute Silence 🤫", type: "Focus" },
      { label: "Lofi / Music 🎵", type: "Flow" },
      { label: "Coffee Shop Chaos ☕", type: "Social" },
      { label: "Late Night Darkness 🌙", type: "NightOwl" },
    ]
  },
  {
    id: 4,
    question: "How often do you forget to take breaks?",
    icon: <Coffee size={32} className="text-orange-400" />,
    options: [
      { label: "Always, I code for 4h+ straight", freq: 60 },
      { label: "Sometimes, when I'm in flow", freq: 45 },
      { label: "Rarely, I get distracted easily", freq: 25 },
      { label: "I use Pomodoro strictly", freq: 25 },
    ]
  },
  {
    id: 5,
    question: "What motivates you to code the most?",
    icon: <Sparkles size={32} className="text-purple-400" />,
    options: [
      { label: "Solving complex logic puzzles", role: "Engineer" },
      { label: "Visual creativity & UI", role: "Developer" },
      { label: "Building useful products", role: "Founder" },
      { label: "Money & Career Growth", role: "Professional" },
    ]
  },
  {
    id: 6,
    question: "How would you rate your current burnout level?",
    icon: <Battery size={32} className="text-red-400" />,
    options: [
      { label: "100% Charged & Ready", mood: "GREAT" },
      { label: "Okay, surviving", mood: "OKAY" },
      { label: "Starting to feel crispy", mood: "TIRED" },
      { label: "Fried. Completely fried.", mood: "EXHAUSTED" },
    ]
  },
  {
    id: 7,
    question: "One last thing: Can we help you stay on track?",
    sub: "We need permission to send smart alerts for breaks & burnout prevention.",
    icon: <Bell size={32} className="text-green-400" />,
    isPermission: true,
    options: [
      { label: "Yes, Enable Smart Alerts", value: true },
      { label: "No, I'll track myself", value: false },
    ]
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ userProfile, onComplete }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [preferences, setPreferences] = useState<any>({});

  const handleOptionSelect = async (option: any) => {
    // Save selection logic
    const currentQ = QUESTIONS[step];
    
    let updates: Partial<UserProfile> = {};
    
    // Map answers to profile fields
    if (currentQ.id === 1 && option.focus) updates.currentFocus = option.focus;
    if (currentQ.id === 2 && option.style) updates = { preferences: { ...userProfile.preferences, focusStyle: option.style } };
    if (currentQ.id === 4 && option.freq) updates = { preferences: { ...userProfile.preferences, breakFrequency: option.freq } };
    
    // Merge updates locally
    const mergedProfile = { ...userProfile, ...updates, ...preferences };
    setPreferences(mergedProfile);

    // Specific logic for Permission Step
    if (currentQ.isPermission) {
      if (option.value === true) {
        // Request Browser Permission
        if ('Notification' in window) {
           const permission = await Notification.requestPermission();
           mergedProfile.preferences.notifications = {
             burnout: permission === 'granted',
             breaks: permission === 'granted',
             reports: permission === 'granted',
             checkins: permission === 'granted'
           };
        }
      } else {
         mergedProfile.preferences.notifications = {
             burnout: false, breaks: false, reports: false, checkins: false
         };
      }
      
      // FINISH
      mergedProfile.hasCompletedOnboarding = true;
      onComplete(mergedProfile);
      return;
    }

    // Advance Step
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const question = QUESTIONS[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      {/* Progress Bar */}
      <div className="absolute top-10 w-64 md:w-96 h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        ></div>
      </div>

      <div key={step} className="w-full max-w-2xl animate-fade-in-up">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md">
            {question.icon}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
            {question.question}
          </h2>
          {question.sub && (
             <p className="text-gray-400 text-lg">{question.sub}</p>
          )}
          <p className="text-sm font-mono text-primary/80 mt-4 tracking-widest uppercase">
            Step {step + 1} / {QUESTIONS.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className="group relative p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all duration-300 text-left hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center justify-between overflow-hidden"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <span className="text-lg font-medium text-gray-200 group-hover:text-white relative z-10">
                {option.label}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors relative z-10">
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Button Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
