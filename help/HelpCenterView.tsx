
import React, { useState } from 'react';
import { 
  ArrowLeft, Book, Github, Zap, Smartphone, 
  Key, Rocket, Code, HelpCircle, ChevronRight,
  ExternalLink, ShieldCheck, PlayCircle
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HelpCenterViewProps {
  onBack: () => void;
}

const HelpCenterView: React.FC<HelpCenterViewProps> = ({ onBack }) => {
  const [activeTopic, setActiveTopic] = useState<'basics' | 'github' | 'ai' | 'build'>('basics');
  const { t, language } = useLanguage();

  const guides = {
    basics: [
      { title: language === 'en' ? "How to start?" : language === 'bn' ? "কিভাবে শুরু করবেন?" : "शुरुआत कैसे करें?", desc: t('chat.empty_desc'), icon: PlayCircle },
      { title: language === 'en' ? "Saving Project" : language === 'bn' ? "প্রজেক্ট সেভ করা" : "परियोजना सहेजना", desc: t('projects.subtitle'), icon: Book },
      { title: language === 'en' ? "Live Preview" : language === 'bn' ? "লাইভ প্রিভিউ" : "लाइव पूर्वावलोकन", desc: t('preview.uplink_desc'), icon: Smartphone }
    ],
    github: [
      { title: "Token Generation", desc: language === 'en' ? "Go to GitHub Settings > Developer Settings > PAT (Classic) and create a token with repo and workflow scopes." : language === 'bn' ? "GitHub Settings > Developer Settings > PAT (Classic) এ গিয়ে repo এবং workflow স্কোপ দিয়ে একটি টোকেন তৈরি করুন।" : "GitHub Settings > Developer Settings > PAT (Classic) पर जाएं और रेपो और वर्कफ़्लो स्कोप के साथ एक टोकन बनाएं।", icon: Key },
      { title: "Auto-Link", desc: language === 'en' ? "Connect GitHub from profile to automatically push your projects." : language === 'bn' ? "প্রোফাইল থেকে গিটহাব কানেক্ট করলে আপনার প্রতিটি প্রজেক্ট অটোমেটিক গিটহাবে পুশ হবে।" : "परियोजनाओं को स्वचालित रूप से पुश करने के लिए प्रोफ़ाइल से गिटहब कनेक्ट करें।", icon: Github },
      { title: "Token Security", desc: language === 'en' ? "Your token is stored encrypted in our secure database." : language === 'bn' ? "আপনার টোকেনটি এনক্রিপ্টেড অবস্থায় আমাদের সুরক্ষিত ডেটাবেসে সংরক্ষিত থাকে।" : "आपका टोकन हमारे सुरक्षित डेटाबेस में एन्क्रिप्टेड संग्रहीत है।", icon: ShieldCheck }
    ],
    ai: [
      { title: "Prompt Tips", desc: language === 'en' ? "Be specific. E.g., 'Create a modern dark theme calculator'." : language === 'bn' ? "AI-কে নির্দিষ্টভাবে বলুন আপনি কি চান। যেমন: 'একটি আধুনিক ডার্ক থিম ক্যালকুলেটর তৈরি করো'।" : "विशिष्ट रहें। जैसे: 'एक आधुनिक डार्क थीम कैलकुलेटर बनाएं'।", icon: Zap },
      { title: "Image to Code", desc: t('chat.empty_desc'), icon: Smartphone },
      { title: "Code Editing", desc: language === 'en' ? "You can manually edit code from the editor." : language === 'bn' ? "আপনি সরাসরি কোড এডিটর থেকেও ম্যানুয়ালি কোড পরিবর্তন করতে পারেন।" : "आप मैन्युअल रूप से संपादक से कोड संपादित कर सकते हैं।", icon: Code }
    ],
    build: [
      { title: "Cloud Build", desc: language === 'en' ? "Click 'Execute Build' to create an APK." : language === 'bn' ? "আপনার কোড রেডি হলে 'Execute Build' বাটনে ক্লিক করুন।" : "APK बनाने के लिए 'एग्जीक्यूट बिल्ड' पर क्लिक करें।", icon: Rocket },
      { title: "Install", desc: language === 'en' ? "Scan the QR code to install on your phone." : language === 'bn' ? "বিল্ড সফল হলে আপনি একটি QR কোড পাবেন।" : "अपने फोन पर इंस्टॉल करने के लिए क्यूआर कोड स्कैन करें।", icon: Zap }
    ]
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-black animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-zinc-400 transition-all active:scale-95">
              <ArrowLeft size={24}/>
            </button>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('help.title').split(' ')[0]} <span className="text-pink-600">{t('help.title').split(' ')[1]}</span></h2>
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] mt-1">{t('help.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] text-zinc-400 hover:text-white transition-all flex items-center gap-2">
                <ExternalLink size={14}/> Support Terminal
             </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
          {[
            { id: 'basics', label: t('help.tabs.basics'), icon: PlayCircle },
            { id: 'github', label: t('help.tabs.github'), icon: Github },
            { id: 'ai', label: t('help.tabs.ai'), icon: Zap },
            { id: 'build', label: t('help.tabs.build'), icon: Rocket }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTopic(tab.id as any)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTopic === tab.id ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-zinc-500 hover:bg-white/5'}`}
            >
              <tab.icon size={16}/> {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides[activeTopic].map((guide, idx) => (
            <div key={idx} className="glass-tech p-8 rounded-[2.5rem] border-white/5 group hover:border-pink-500/20 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                <guide.icon size={28}/>
              </div>
              <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{guide.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-bold uppercase tracking-widest">{guide.desc}</p>
            </div>
          ))}
          
          <div className="md:col-span-2 glass-tech p-10 rounded-[3rem] border-pink-500/10 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-pink-500/5 to-transparent">
             <div className="text-center md:text-left space-y-4">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">{t('help.video_title')}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-bold uppercase tracking-widest max-w-sm">
                   {t('help.video_desc')}
                </p>
                <button className="px-8 py-4 bg-pink-600 rounded-2xl font-black uppercase text-[10px] text-white shadow-xl shadow-pink-600/20 active:scale-95 transition-all">
                   {t('help.watch_video')}
                </button>
             </div>
             <div className="flex-1 flex justify-center">
                <div className="w-40 h-40 bg-pink-600/10 rounded-full flex items-center justify-center border-4 border-pink-500/20 relative group">
                   <div className="absolute inset-0 bg-pink-500/20 blur-3xl animate-pulse rounded-full"></div>
                   <HelpCircle size={60} className="text-pink-500 relative z-10 group-hover:scale-110 transition-transform duration-500"/>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpCenterView;
