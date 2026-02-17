
import React from 'react';
import { Layers } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

const ChatEmptyState: React.FC = () => {
  const { t } = useLanguage();
  return (
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
  );
};

export default ChatEmptyState;
