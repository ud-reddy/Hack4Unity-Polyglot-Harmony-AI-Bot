import React from 'react';
import { AppMode } from '../types';
import { MessageCircle, Globe, Users } from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, isOpen, setIsOpen }) => {
  const modes = [
    { 
      id: AppMode.Standard, 
      label: 'Code-Switch Chat', 
      desc: 'Seamless multilingual AI',
      icon: MessageCircle,
      color: 'text-blue-500 dark:text-blue-400' 
    },
    { 
      id: AppMode.Cultural, 
      label: 'Cultural Context', 
      desc: 'Nuance & etiquette insights',
      icon: Globe,
      color: 'text-purple-500 dark:text-cultural' 
    },
    { 
      id: AppMode.Harmony, 
      label: 'Harmony Mediation', 
      desc: 'Cross-language mediation',
      icon: Users,
      color: 'text-green-500 dark:text-green-400' 
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 left-0 h-full z-30 w-72 transition-transform duration-300 ease-in-out
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static flex flex-col
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
            PolyGlot AI
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Linguistic Intelligence</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setMode(mode.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`
                  w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}
                `}
              >
                <div className={`mt-1 p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 ${isActive ? mode.color : 'text-gray-400 dark:text-gray-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`block font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {mode.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {mode.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Capabilities</h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Dialect Detection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Emotion Analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Audio Processing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};