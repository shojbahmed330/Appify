
import React, { useEffect, useRef } from 'react';
import { Sparkles, Loader2, Send, Zap, Layers, Image as ImageIcon, X } from 'lucide-react';
import Questionnaire from './Questionnaire';
import { useLanguage } from '../../i18n/LanguageContext';

interface ChatBoxProps {
  messages: any[];
  input: string;
  setInput: (s: string) => void;
  isGenerating: boolean;
  handleSend: (extraData?: string) => void;
  mobileTab: 'chat' | 'preview';
  selectedImage: { data: string; mimeType: string; preview: string } | null;
  setSelectedImage: (img: any) => void;
  handleImageSelect: (file: File) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  messages, input, setInput, isGenerating, handleSend, mobileTab,
  selectedImage, setSelectedImage, handleImageSelect
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isGenerating]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className={`w-full lg:w-[520px] border-r border-white/5 flex flex-col bg-[#09090b] h-full relative ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-10 pt-32 md:pt-6 pb-48 scroll-smooth custom-scrollbar"
      >
        {messages.length > 0 ? messages.map((m, idx) => (
          <div 
            key={m.id || idx} 
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
                  {m.content && m.content.split(/(\*\*.*?\*\*)/g).map((part, i) => 
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
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
             <div className="relative">
                <div className="absolute inset-0 bg-pink-500/10 blur-[80px] rounded-full"></div>
                <div className="relative z-10 p-8 bg-black/40 border border-white/5 rounded-[3rem] shadow-2xl animate-float">
                   <Layers size={50} className="text-pink-500 opacity-40"/>
                </div>
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">{t('chat.empty_title')}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500">{t('chat.secure_uplink')}</p>
             </div>
             <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed font-bold">{t('chat.empty_desc')}</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-pink-500/20 animate-in fade-in slide-in-from-left-4 duration-500 max-w-[280px] shadow-2xl">
            <div className="flex items-center gap-4 text-pink-500">
               <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-pink-500/20 blur-md rounded-full animate-ping"></div>
                  <Loader2 className="animate-spin relative z-10" size={18}/>
               </div>
               <span className="text-xs font-black uppercase tracking-tighter text-pink-500">{t('chat.processing')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-12 z-[100]">
        {selectedImage && (
          <div className="mb-3 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-xl group">
              <img src={selectedImage.preview} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12}/>
              </button>
            </div>
          </div>
        )}
        <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 md:p-3 flex items-center gap-2 md:gap-3 mb-20 md:mb-0 shadow-2xl focus-within:border-pink-500/40 transition-all">
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
           <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 md:w-12 md:h-12 text-zinc-500 hover:text-pink-500 hover:bg-white/5 rounded-2xl transition-all flex items-center justify-center">
             <ImageIcon size={20}/>
           </button>
           <textarea 
             value={input} 
             onChange={e => setInput(e.target.value)} 
             onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} 
             placeholder={t('chat.placeholder')} 
             className="flex-1 bg-transparent p-2 text-[13px] h-12 outline-none text-white resize-none placeholder:text-zinc-700 font-bold" 
           />
           <button onClick={() => handleSend()} disabled={isGenerating || (!input.trim() && !selectedImage)} className="w-10 h-10 md:w-12 md:h-12 bg-pink-600 text-white rounded-2xl flex items-center justify-center active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-pink-600/20">
             <Send size={16}/>
           </button>
        </div>
      </div>
    </section>
  );
};

export default ChatBox;
