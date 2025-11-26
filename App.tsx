import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Menu, Send, RefreshCw, Settings, X, MessageSquare, Globe, Users, Sun, Moon } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { MicButton } from './components/MicButton';
import { IntroPage } from './components/IntroPage';
import { sendMessageToGemini } from './services/geminiService';
import { AppMode, ChatMessage, Speaker, HarmonySettings } from './types';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [mode, setMode] = useState<AppMode>(AppMode.Standard);
  
  // Separate chat histories for each mode
  const [chatHistory, setChatHistory] = useState<Record<AppMode, ChatMessage[]>>({
    [AppMode.Standard]: [{
      id: 'welcome-std',
      sender: Speaker.Bot,
      text: "Namaste! Hello! Vanakkam! I am your PolyGlot linguistic companion. I can speak multiple languages mixed together. How can I help you today?",
      timestamp: Date.now(),
      emotion: 'Welcoming',
      originalLanguage: 'English/Hindi/Tamil'
    }],
    [AppMode.Cultural]: [{
      id: 'welcome-cult',
      sender: Speaker.Bot,
      text: "Welcome to Cultural Context mode. I analyze messages for cultural nuances, etiquette, and hidden meanings. Try saying something polite or rude in any language.",
      timestamp: Date.now(),
      emotion: 'Respectful',
      originalLanguage: 'English'
    }],
    [AppMode.Harmony]: [{
      id: 'welcome-harm',
      sender: Speaker.Bot,
      text: "Welcome to Harmony Mediation. I help translate and mediate conversations between two people to ensure understanding and prevent conflict. Please configure languages to start.",
      timestamp: Date.now(),
      emotion: 'Peaceful',
      originalLanguage: 'English'
    }]
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Harmony Mode State
  const [harmonyPartnerActive, setHarmonyPartnerActive] = useState(false); // false = User A, true = User B
  const [harmonySettings, setHarmonySettings] = useState<HarmonySettings | null>(null);
  const [showHarmonySetup, setShowHarmonySetup] = useState(false);
  const [tempLangA, setTempLangA] = useState('');
  const [tempLangB, setTempLangB] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Derived state for current view
  const messages = chatHistory[mode];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mode]);

  // Trigger setup modal when entering Harmony mode if settings aren't present
  useEffect(() => {
    if (!showIntro && mode === AppMode.Harmony && !harmonySettings) {
      setShowHarmonySetup(true);
    }
  }, [mode, harmonySettings, showIntro]);

  // Sync settings to modal inputs when it opens
  useEffect(() => {
    if (showHarmonySetup && harmonySettings) {
      setTempLangA(harmonySettings.userALang);
      setTempLangB(harmonySettings.userBLang);
    }
  }, [showHarmonySetup]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleStartApp = async () => {
    try {
      // Request microphone permission immediately so it's ready for use later
      // This creates the browser prompt right after the user interaction (click)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We don't need the stream yet, just the permission. Stop tracks to release mic.
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.warn("Microphone permission denied or cancelled:", err);
      // Proceed anyway, as text chat is primary functionality
    } finally {
      setShowIntro(false);
    }
  };

  const addMessageToHistory = (targetMode: AppMode, message: ChatMessage) => {
    setChatHistory(prev => ({
      ...prev,
      [targetMode]: [...prev[targetMode], message]
    }));
  };

  const handleSaveHarmonySettings = () => {
    if (tempLangA.trim() && tempLangB.trim()) {
      setHarmonySettings({
        userALang: tempLangA,
        userBLang: tempLangB
      });
      setShowHarmonySetup(false);
      
      const sysMsg: ChatMessage = {
        id: uuidv4(),
        sender: Speaker.Bot,
        text: `Harmony Mode Active. Mediating between ${tempLangA} (User A) and ${tempLangB} (User B).`,
        timestamp: Date.now(),
        emotion: 'Ready'
      };
      
      addMessageToHistory(AppMode.Harmony, sysMsg);
    }
  };

  const handleSendMessage = async (audioBase64?: string) => {
    if ((!inputText.trim() && !audioBase64) || isLoading) return;

    const currentText = inputText;
    // Capture the mode at the time of sending to ensure response goes to correct history
    const sendingMode = mode; 
    
    const isHarmonyPartner = harmonyPartnerActive && sendingMode === AppMode.Harmony;
    const currentSender = isHarmonyPartner ? Speaker.Partner : Speaker.User;
    
    setInputText('');
    
    // Optimistic UI Update
    const newUserMsg: ChatMessage = {
      id: uuidv4(),
      sender: currentSender,
      text: currentText || (audioBase64 ? "🎤 Audio message sent" : ""),
      timestamp: Date.now(),
      isAudio: !!audioBase64
    };

    addMessageToHistory(sendingMode, newUserMsg);
    setIsLoading(true);

    try {
      // Prepare history for API (using specific mode history)
      const history = chatHistory[sendingMode].map(m => ({
        role: m.sender === Speaker.Bot ? 'model' as const : 'user' as const,
        parts: [{ text: m.text }]
      }));

      // Call Gemini with extra context for Harmony
      const response = await sendMessageToGemini(
        history, 
        currentText, 
        sendingMode, 
        audioBase64,
        sendingMode === AppMode.Harmony ? harmonySettings! : undefined,
        currentSender
      );

      // Create Bot Response
      const botMsg: ChatMessage = {
        id: uuidv4(),
        sender: Speaker.Bot,
        text: response.reply,
        timestamp: Date.now(),
        emotion: response.detected_emotion,
        culturalInsight: response.cultural_insight || undefined,
        originalLanguage: response.detected_language,
        transliteration: response.transliteration
      };

      addMessageToHistory(sendingMode, botMsg);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        sender: Speaker.Bot,
        text: "I encountered an error processing that request. Please check your API key or connection.",
        timestamp: Date.now(),
        emotion: 'Error'
      };
      addMessageToHistory(sendingMode, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getHeaderIcon = () => {
    switch (mode) {
      case AppMode.Standard: return <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case AppMode.Cultural: return <Globe className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case AppMode.Harmony: return <Users className="w-5 h-5 text-green-500 dark:text-green-400" />;
    }
  };

  // Main wrapper with theme class
  return (
    <div className={`${theme} h-screen w-full flex flex-col`}>
      {showIntro ? (
        <IntroPage 
          onStart={handleStartApp} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      ) : (
        <div className="flex h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
          
          <Sidebar 
            currentMode={mode} 
            setMode={setMode} 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
          />

          <div className="flex-1 flex flex-col h-full relative w-full">
            
            {/* Header */}
            <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-4 z-10 sticky top-0 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="hidden md:block bg-gray-100 dark:bg-gray-800 p-2 rounded-lg transition-colors">
                    {getHeaderIcon()}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-semibold text-lg leading-tight">{mode}</h2>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      {isLoading ? 'Processing...' : 'Gemini 2.5 Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle in Header (optional but useful) */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {mode === AppMode.Harmony && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowHarmonySetup(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                      title="Change Languages"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg transition-colors">
                      <button 
                        onClick={() => setHarmonyPartnerActive(false)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors flex flex-col items-center ${!harmonyPartnerActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      >
                        <span className="font-bold">User A</span>
                        {harmonySettings && <span className="text-[10px] opacity-80">{harmonySettings.userALang}</span>}
                      </button>
                      <button 
                        onClick={() => setHarmonyPartnerActive(true)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors flex flex-col items-center ${harmonyPartnerActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      >
                        <span className="font-bold">User B</span>
                        {harmonySettings && <span className="text-[10px] opacity-80">{harmonySettings.userBLang}</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
              <div className="max-w-3xl mx-auto">
                {messages.map(msg => (
                  <ChatMessageBubble key={msg.id} message={msg} mode={mode} />
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
                    </div>
                    <div className="text-sm text-gray-500 pt-1">
                      {mode === AppMode.Harmony ? 'Mediating and translating...' : 'Analyzing context...'}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <div className="max-w-3xl mx-auto flex items-end gap-3">
                <MicButton onAudioCaptured={handleSendMessage} disabled={isLoading} />
                
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      mode === AppMode.Harmony 
                        ? `Message as User ${harmonyPartnerActive ? 'B' : 'A'} (${harmonyPartnerActive ? harmonySettings?.userBLang || '...' : harmonySettings?.userALang || '...'})` 
                        : "Type in Hinglish, Tamil, or any mix..."
                    }
                    className="w-full bg-transparent text-gray-900 dark:text-white p-3 max-h-32 min-h-[50px] resize-none focus:outline-none placeholder-gray-500 dark:placeholder-gray-500"
                    rows={1}
                  />
                </div>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputText.trim())}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-lg shadow-blue-900/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-500 dark:text-gray-600">
                  AI can make mistakes. PolyGlot uses Gemini 2.5 Flash for rapid cultural reasoning.
                </p>
              </div>
            </div>

            {/* Harmony Setup Modal */}
            {showHarmonySetup && (
              <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl transform transition-all p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                      Harmony Mediation Setup
                    </h3>
                    {harmonySettings && (
                      <button onClick={() => setShowHarmonySetup(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">User A Language</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Hindi, Spanish, Mandarin"
                        value={tempLangA}
                        onChange={(e) => setTempLangA(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-gray-400 dark:text-gray-600 rotate-90" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">User B Language</label>
                      <input 
                        type="text" 
                        placeholder="e.g., English, French, Arabic"
                        value={tempLangB}
                        onChange={(e) => setTempLangB(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleSaveHarmonySettings}
                        disabled={!tempLangA || !tempLangB}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20"
                      >
                        {harmonySettings ? "Update Languages" : "Start Mediation Session"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-center text-gray-500">
                    PolyGlot will translate and mediate responses between these two languages, providing both script and transliteration.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default App;