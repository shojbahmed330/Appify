
import React from 'react';
import { Brain, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface ThinkingPanelProps {
  thought?: string;
  isGenerating: boolean;
}

const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ thought, isGenerating }) => {
  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Neural Insights</h3>
        {isGenerating && (
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
              <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest">Thinking...</span>
           </div>
        )}
      </div>

      <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-5 overflow-y-auto custom-scrollbar relative group">
        {!thought && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 gap-4">
             <Brain size={40}/>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-[140px]">Neural core idle. Awaiting user prompt.</p>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500 mt-1"><Sparkles size={14}/></div>
                <div className="space-y-3">
                   <h4 className="text-[11px] font-black text-white uppercase tracking-widest underline decoration-pink-500/40 underline-offset-4">Generation Strategy</h4>
                   <p className="text-[11px] text-zinc-400 font-medium leading-relaxed italic">
                      {thought || "Analyzing project structure and requirements to formulate optimal code architecture..."}
                   </p>
                </div>
             </div>

             <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                   <Zap size={10} className="text-pink-500"/>
                   <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Logical Blocks</span>
                </div>
                <div className="space-y-2">
                   {['Dual-Workspace Isolation', 'Supabase Real-time Uplink', 'Tailwind Grid Optimization'].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
                         <ShieldCheck size={10} className="text-green-500/40"/> {t}
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl">
         <p className="text-[8px] font-black text-pink-500 uppercase leading-relaxed tracking-wider">
            This panel shows the AI's internal reasoning (Chain of Thought). It helps developers understand the "Why" behind the generated code.
         </p>
      </div>
    </div>
  );
};

export default ThinkingPanel;
