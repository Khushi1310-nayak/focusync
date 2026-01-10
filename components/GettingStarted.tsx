
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Zap, LayoutDashboard, Activity, MessageSquareHeart, Settings, Shield, Lock, Play, CheckCircle, ChevronRight } from 'lucide-react';

interface GettingStartedProps {
  onClose: () => void;
}

const GettingStarted: React.FC<GettingStartedProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleClose();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  const steps = [
    {
      title: "Welcome to FOCUSYNC",
      subtitle: "Privacy-First Productivity for Developers",
      content: (
        <div className="space-y-6 text-center">
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary p-1 animate-pulse shadow-[0_0_30px_rgba(0,229,255,0.4)]">
                     <div className="w-full h-full bg-[#0B1C2D] rounded-xl flex items-center justify-center">
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">FS</span>
                     </div>
                </div>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed max-w-lg mx-auto">
                A modern suite designed for developers who care about <span className="text-primary font-bold">focus</span>, <span className="text-secondary font-bold">balance</span>, and <span className="text-success font-bold">growth</span>.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-400">
                    FOCUSYNC helps you track your work, understand your habits, and avoid burnout—<strong className="text-white">all without sending your data to any server.</strong>
                </p>
            </div>
        </div>
      )
    },
    {
      title: "The Simple Loop",
      subtitle: "Focus → Track → Analyze → Improve",
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                {[
                    { icon: Zap, label: "Focus", desc: "Use the Timer", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                    { icon: CheckCircle, label: "Track", desc: "Local Recording", color: "text-green-400", bg: "bg-green-400/10" },
                    { icon: Activity, label: "Analyze", desc: "Calc Risk & Score", color: "text-blue-400", bg: "bg-blue-400/10" },
                    { icon: MessageSquareHeart, label: "Improve", desc: "AI Coaching", color: "text-purple-400", bg: "bg-purple-400/10" }
                ].map((item, idx) => (
                    <div key={idx} className="relative group" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className={`p-6 rounded-2xl border border-white/10 ${item.bg} hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center animate-fade-in-up`}>
                             <item.icon size={32} className={`mb-3 ${item.color}`} />
                             <h4 className="font-bold text-white mb-1">{item.label}</h4>
                             <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        {idx < 3 && (
                            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-600 z-10">
                                <ChevronRight size={24} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center max-w-md mx-auto bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-gray-300">"That’s it. No noise. No pressure."</p>
            </div>
        </div>
      )
    },
    {
      title: "Core Features",
      subtitle: "Everything you need to ship code sustainably.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group animate-fade-in-up delay-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-colors"><Zap size={20} /></div>
                    <h4 className="font-bold text-white">Timer</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Enter <strong>Flow State</strong>. The UI adapts to reduce distractions. Includes smart break reminders based on your preferences.
                </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group animate-fade-in-up delay-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400 group-hover:bg-blue-400 group-hover:text-black transition-colors"><LayoutDashboard size={20} /></div>
                    <h4 className="font-bold text-white">Dashboard</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Your daily snapshot: Productivity Score, <strong>Burnout Risk Meter</strong>, and Github Commits. Answers: "How am I doing today?"
                </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400 group-hover:bg-purple-400 group-hover:text-black transition-colors"><MessageSquareHeart size={20} /></div>
                    <h4 className="font-bold text-white">AI Coach</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Context-aware advice. Overworked? It says rest. Coding? Use <strong>Debug Mode</strong> for clean code help.
                </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors group animate-fade-in-up delay-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-400/10 text-green-400 group-hover:bg-green-400 group-hover:text-black transition-colors"><Activity size={20} /></div>
                    <h4 className="font-bold text-white">Analytics</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Spot patterns. Weekly trends, category distribution (Pie Chart), and daily focus hours.
                </p>
            </div>
        </div>
      )
    },
    {
      title: "Privacy & Settings",
      subtitle: "Your data, your rules.",
      content: (
        <div className="space-y-6">
             <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl flex items-start gap-4 animate-fade-in-up">
                <div className="p-3 bg-red-500/10 rounded-full text-red-400 shrink-0">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-white mb-1">Privacy First — Always</h4>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                        <li>No accounts or cloud storage required.</li>
                        <li>No background tracking.</li>
                        <li>All data stored in <code className="bg-white/10 px-1 rounded text-xs">localStorage</code>.</li>
                    </ul>
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-start gap-4 animate-fade-in-up delay-100">
                <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                    <Settings size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-white mb-1">Customize Everything</h4>
                    <p className="text-sm text-gray-400 mb-2">Go to Settings to:</p>
                    <div className="flex flex-wrap gap-2">
                        {['Daily Goals', 'Github Username', 'LinkedIn Metrics', 'Notifications', 'Data Export'].map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded bg-black/40 border border-white/10 text-gray-300">{tag}</span>
                        ))}
                    </div>
                </div>
             </div>
        </div>
      )
    },
    {
      title: "You're Ready 🚀",
      subtitle: "Start your first session.",
      content: (
        <div className="text-center space-y-8 animate-fade-in-up">
            <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-white/10">
                <h4 className="text-xl font-bold text-white mb-4">How to get the best experience:</h4>
                <ul className="space-y-3 text-left max-w-sm mx-auto">
                    {[
                        "Start with short focus sessions.",
                        "Log your mood honestly.",
                        "Check the Dashboard daily.",
                        "Review Analytics weekly."
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                            <CheckCircle size={16} className="text-success shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            
            <p className="text-gray-400 italic">
                "FOCUSYNC isn’t about doing more.<br/>It’s about doing what matters, sustainably." 💙
            </p>

            <button 
                onClick={handleClose}
                className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-background font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
            >
                Let's Go <ArrowRight size={20} />
            </button>
        </div>
      )
    }
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        
        <div className={`glass-panel w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-transform duration-300 ${isExiting ? 'scale-95' : 'scale-100'}`}>
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                     <div className="flex gap-2 mb-1">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === step ? 'w-8 bg-primary' : 'w-2 bg-gray-600'}`}
                            />
                        ))}
                     </div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Step {step + 1} of {steps.length}</p>
                </div>
                <button 
                    onClick={handleClose}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                <div key={step} className="animate-fade-in">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{steps[step].title}</h2>
                        <p className="text-primary font-medium">{steps[step].subtitle}</p>
                    </div>
                    {steps[step].content}
                </div>
            </div>

            {/* Footer Controls */}
            {step < steps.length - 1 && (
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center">
                    <button 
                        onClick={prevStep}
                        disabled={step === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    
                    <button 
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 hover:scale-105 transition-all shadow-lg"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default GettingStarted;
