
import React, { useState } from 'react';
import { LayoutDashboard, Timer, Activity, MessageSquareHeart, Settings, LogOut } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Timer', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'coach', label: 'AI Coach', icon: MessageSquareHeart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  return (
    <>
      {/* Desktop Sidebar (lg and up) */}
      <div className="hidden lg:flex w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 flex-col justify-between z-50 transition-all duration-300">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
               <span className="font-bold text-background text-lg">F</span>
            </div>
            <span className="ml-3 font-bold text-xl tracking-wide text-primary neon-text">
              FOCUSYNC
            </span>
          </div>

          <nav className="mt-8 px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center justify-start p-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary/10 text-primary neon-glow border border-primary/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={22} className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="ml-4 font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-start p-3 rounded-xl text-gray-400 hover:bg-alert/10 hover:text-alert transition-all"
          >
            <LogOut size={22} />
            <span className="ml-4 font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation (below lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full h-20 glass-panel border-t border-white/5 z-50 flex items-center justify-around px-2 pb-2">
         {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-400'
                }`}
              >
                <div className={`p-2 rounded-full mb-1 ${isActive ? 'bg-primary/10 neon-glow' : ''}`}>
                   <Icon size={24} className={`${isActive ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
           <button
            onClick={handleLogoutClick}
            className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 text-gray-400 hover:text-alert"
          >
            <div className="p-2 rounded-full mb-1">
               <LogOut size={24} />
            </div>
            <span className="text-[10px] font-medium">Log Out</span>
          </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-alert/10 flex items-center justify-center mb-4 text-alert border border-alert/20">
                        <LogOut size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                    <p className="text-gray-400 text-sm">You are about to log out of your session. You'll need to sign in again to access your data.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowLogoutModal(false)}
                        className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmLogout}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-alert hover:bg-alert/90 shadow-lg shadow-alert/20 transition-all"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
