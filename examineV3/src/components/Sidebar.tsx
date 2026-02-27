import React from 'react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tabId: Tab) => void;
  tabs: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

export function Sidebar({ activeTab, onTabChange, tabs }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-full border-r border-white/5 bg-[#0D0D0D]/95 backdrop-blur-xl relative z-20 transition-all duration-300">
      {/* Decorative gradient line */}
      <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Menu</p>
        </div>
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/[0.06] text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                  : 'text-white/40 hover:bg-white/[0.02] hover:text-white/80'
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300"
                  style={{ background: tab.color, boxShadow: `0 0 12px ${tab.color}66` }}
                />
              )}
              
              {/* Icon Container */}
              <div 
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
                style={{ 
                  background: isActive ? `${tab.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? `${tab.color}30` : 'rgba(255,255,255,0.05)'}`
                }}
              >
                <span style={{ color: isActive ? tab.color : 'currentColor', transition: 'color 0.3s' }}>
                  {tab.icon}
                </span>
              </div>
              
              {/* Label */}
              <span className={`text-sm font-bold tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>
                {tab.label}
              </span>
              
              {/* Glow effect on active */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, ${tab.color}00, ${tab.color}33)` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Extra Info could go here */}
      <div className="p-4 border-t border-white/5">
        <div className="rounded-xl p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5">
           <p className="text-[10px] text-white/40 text-center">CryptoBet © 2026</p>
        </div>
      </div>
    </aside>
  );
}
