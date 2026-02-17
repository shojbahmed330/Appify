
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import MessageItem from './MessageItem';
import ChatEmptyState from './ChatEmptyState';
import { useLanguage } from '../../../i18n/LanguageContext';

interface MessageListProps {
  messages: any[];
  isGenerating: boolean;
  handleSend: (extraData?: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isGenerating, handleSend }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isGenerating]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 p-6 overflow-y-auto space-y-10 pt-32 md:pt-6 pb-48 scroll-smooth custom-scrollbar"
    >
      {messages.length > 0 ? (
        messages.map((m, idx) => (
          <MessageItem key={m.id || idx} message={m} index={idx} handleSend={handleSend} />
        ))
      ) : (
        <ChatEmptyState />
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
  );
};

export default MessageList;
