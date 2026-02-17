
import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import Questionnaire from '../Questionnaire';
import { useLanguage } from '../../../i18n/LanguageContext';

interface MessageItemProps {
  message: any;
  index: number;
  handleSend: (extraData?: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message: m, index: idx, handleSend }) => {
  const { t } = useLanguage();
  
  return (
    <div 
      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both`}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="flex flex-col items-start w-full max-w-full">
        {m.role === 'assistant' && (
          <div className="flex items-center gap-2 mb-3 ml-2">
            <div className="w-6 h-6 bg-pink-500/10 rounded-lg border border-pink-500/30 flex items-center justify-center">
              <Sparkles size={12} className="text-pink-500"/>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">{t('chat.neural_engine')}</span>
          </div>
        )}
        
        <div className={`
          max-w-[92%] p-5 rounded-3xl text-[13px] leading-relaxed transition-all relative break-words overflow-hidden
          ${m.role === 'user' 
            ? 'bg-pink-600 text-white rounded-tr-sm self-end shadow-lg shadow-pink-600/10' 
            : 'bg-white/5 border border-white/10 rounded-tl-sm self-start text-zinc-300'}
        `}>
          {m.image && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <img src={m.image} className="w-full max-h-[300px] object-cover" alt="Uploaded UI" />
            </div>
          )}
          <div className="relative z-10 whitespace-pre-wrap font-medium break-words overflow-hidden w-full">
            {m.content && m.content.split(/(\*\*.*?\*\*)/g).map((part: string, i: number) => 
              part.startsWith('**') && part.endsWith('**') 
              ? <strong key={i} className={m.role === 'user' ? 'text-white' : 'text-pink-400'} style={{fontWeight: 900}}>{part.slice(2, -2)}</strong> 
              : part
            )}
          </div>

          {m.answersSummary ? (
            <div className="mt-4 p-5 bg-white/5 border border-white/5 rounded-2xl italic text-zinc-500 text-[11px] leading-relaxed animate-in fade-in duration-700 break-words">
              <div className="flex items-center gap-2 mb-1">
                 <Zap size={10} className="text-pink-500"/>
                 <span className="font-black uppercase text-[9px] tracking-widest text-pink-500">{t('chat.config_locked')}</span>
              </div>
              {m.answersSummary.split('\n').map((line: string, i: number) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            m.questions && m.questions.length > 0 && (
              <Questionnaire 
                questions={m.questions} 
                onComplete={(answers) => handleSend(answers)}
                onSkip={() => handleSend("User skipped clarifying questions. Proceed with modern default estimates.")}
              />
            )
          )}
        </div>
        
        <div className={`text-[8px] mt-3 font-black uppercase tracking-widest text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity ${m.role === 'user' ? 'mr-4 self-end' : 'ml-4 self-start'}`}>
          {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
