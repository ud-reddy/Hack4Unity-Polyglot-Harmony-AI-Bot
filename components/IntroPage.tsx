import React from 'react';
import { MessageCircle, Globe, Users, Mic, Moon, Sun, ArrowRight, ShieldCheck } from 'lucide-react';

interface IntroPageProps {
  onStart: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onStart, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding */}
        <div className="space-y-6">
          <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl mb-4">
            <Globe className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 leading-tight">
            PolyGlot <br/> Harmony AI
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            A next-generation linguistic companion designed for a connected world. Experience seamless code-switching, cultural intelligence, and cross-language conflict mediation.
          </p>
          
          <div className="flex flex-col gap-4 pt-4">
             <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Privacy Focused</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Mic className="w-4 h-4" />
                </div>
                <span>Microphone Permission Required</span>
             </div>
          </div>

          <button 
            onClick={onStart}
            className="group mt-8 flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Start Conversation
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right Side: Features */}
        <div className="grid gap-4">
          <FeatureCard 
            icon={<MessageCircle className="w-6 h-6 text-blue-500" />}
            title="Code-Switching"
            desc="Speak freely in mixed languages (e.g., Hinglish, Spanglish). PolyGlot understands the flow."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-pink-500" />}
            title="Cultural Engine"
            desc="Detects social cues, politeness levels, and offers cultural insights."
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-green-500" />}
            title="Harmony Mediation"
            desc="Bridge the gap between two speakers with real-time conflict softening and translation."
          />
        </div>

      </div>
      
      <div className="absolute bottom-6 text-center text-xs text-gray-400 dark:text-gray-600">
        Powered by Google Gemini 2.5 Flash
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">{desc}</p>
      </div>
    </div>
  </div>
);
