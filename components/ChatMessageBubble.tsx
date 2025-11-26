import React from 'react';
import { ChatMessage, Speaker, AppMode } from '../types';
import { HeartPulse, Languages, Sparkles } from 'lucide-react';

interface Props {
  message: ChatMessage;
  mode: AppMode;
}

export const ChatMessageBubble: React.FC<Props> = ({ message, mode }) => {
  const isUser = message.sender === Speaker.User || message.sender === Speaker.Partner;
  const isPartner = message.sender === Speaker.Partner;

  // Emotion color mapping for text labels (handles light/dark contrast)
  const getEmotionColor = (emotion?: string) => {
    if (!emotion) return 'text-gray-400 dark:text-gray-500';
    const e = emotion.toLowerCase();
    if (e.includes('joy') || e.includes('happy') || e.includes('excited')) return 'text-yellow-600 dark:text-yellow-400';
    if (e.includes('sad') || e.includes('grief')) return 'text-blue-600 dark:text-blue-400';
    if (e.includes('anger') || e.includes('frustrat')) return 'text-red-600 dark:text-red-400';
    return 'text-purple-600 dark:text-purple-300';
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Label for Harmony Mode */}
        {mode === AppMode.Harmony && (
          <span className="text-xs text-gray-500 dark:text-gray-500 mb-1 ml-1 mr-1">
            {isPartner ? 'Partner' : (message.sender === Speaker.User ? 'You' : 'Mediator')}
          </span>
        )}

        <div className={`
          relative p-4 rounded-2xl shadow-sm
          ${isUser 
            ? (isPartner 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-blue-600 text-white rounded-tr-none') 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm'}
        `}>
          <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.text}</p>
          
          {/* Transliteration for Harmony Mode */}
          {message.transliteration && (
            <p className={`mt-1.5 text-xs italic font-serif border-l-2 pl-2 ${isUser ? 'text-white/70 border-white/20' : 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}>
              {message.transliteration}
            </p>
          )}

          {/* Metadata Footer inside bubble */}
          <div className={`mt-3 pt-3 flex flex-wrap gap-3 text-xs items-center ${isUser ? 'border-t border-white/10' : 'border-t border-gray-100 dark:border-gray-700'}`}>
            
            {/* Detected Language */}
            {message.originalLanguage && (
              <div className={`flex items-center gap-1 ${isUser ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`} title="Detected Language/Code-Switching">
                <Languages className="w-3 h-3" />
                <span>{message.originalLanguage}</span>
              </div>
            )}

            {/* Emotion Badge */}
            {message.emotion && (
              <div className={`flex items-center gap-1 font-medium ${isUser ? 'text-white' : getEmotionColor(message.emotion)}`}>
                <HeartPulse className="w-3 h-3" />
                <span>{message.emotion}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cultural Insight Card (Only for AI responses in Cultural Mode) */}
        {!isUser && message.culturalInsight && mode === AppMode.Cultural && (
          <div className="mt-2 ml-2 p-3 bg-fuchsia-50 dark:bg-cultural-dark/20 border border-fuchsia-100 dark:border-cultural/30 rounded-lg max-w-sm backdrop-blur-sm animate-fade-in-up">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-cultural-dark dark:text-cultural mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-cultural-dark dark:text-cultural mb-1">Cultural Context</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 italic">{message.culturalInsight}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};