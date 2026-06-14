import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Users, Search, Loader2, Database, DatabaseZap, Save, Code } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { InfoTooltip } from '../components/ui/info-tooltip';


const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function Segments() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [segmentName, setSegmentName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: async () => {
      const res = await api.get('/segments');
      return res.data;
    }
  });

  const handleCreateAI = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setQueryResult(null);
    try {
      const res = await api.post('/segments/query', { prompt });
      setQueryResult(res.data);
      setSegmentName("");
    } catch (err) {
      console.error(err);
      alert("Failed to process natural language query.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSegment = async () => {
    if (!segmentName || !queryResult) return;
    setIsSaving(true);
    try {
      await api.post('/segments', {
        name: segmentName,
        description: prompt,
        criteriaJson: queryResult.criteriaJson
      });
      setQueryResult(null);
      setPrompt("");
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto w-full space-y-10 relative z-10 pb-24 pt-4"
      >
      <motion.div variants={fadeUp} className="border-b border-white/10 pb-6 mb-8 flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 text-white/50 text-base font-medium mb-1">
             <Database className="w-4 h-4" /> Data Lake
           </div>
           <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center">
             Audience Topology <InfoTooltip content="Dynamic consumer segments computed via deterministic queries." />
           </h1>
           <p className="text-base text-white/50 mt-2">
             Dynamic consumer segments computed via deterministic queries.
           </p>
        </div>
      </motion.div>

      {/* AI Segment Builder Terminal */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden focus-within:border-emerald-500/30 transition-all duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 focus-within:ring-emerald-500/20 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <DatabaseZap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white tracking-widest uppercase flex items-center">Intelligence Query Terminal <InfoTooltip content="Enter a natural language request to instantly query the database." /></span>
          </div>
          <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Natural Language to SQL</span>
        </div>
        
        <div className="p-4 relative">
          <div className="flex items-start gap-4">
            <div className="mt-2 text-white/30">
              <Search className="w-4 h-4" />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleCreateAI();
              }}
              rows={2}
              className="w-full bg-transparent border-none p-0 mt-1.5 text-lg text-white focus:ring-0 resize-none placeholder:text-white/20 font-mono"
              placeholder="e.g., Select customers who spent > ₹5000 and have been inactive for 45 days..."
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-mono text-white/30">Press ⌘ Enter to execute</span>
            <button 
              onClick={handleCreateAI}
              disabled={isGenerating || !prompt}
              className="h-8 px-4 flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 font-semibold rounded-md transition-all disabled:opacity-50 text-base"
            >
              {isGenerating ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isGenerating ? "Synthesizing..." : "Execute Query"}
            </button>
          </div>
        </div>

        {/* AI Query Result */}
        {queryResult && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-white/5 p-6 bg-white/[0.01] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div>
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4" /> Generated Query Map
                </h4>
                <div className="bg-[#050505] p-4 rounded-xl border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] overflow-x-auto">
                  <pre className="text-sm font-mono text-emerald-400/80">
                    {JSON.stringify(queryResult.criteriaJson, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-400" /> Target Audience Discovered <InfoTooltip content="The number of real customers that match the generated MongoDB query." />
                  </h4>
                  <div className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-bold mb-1 tracking-tight">
                    {queryResult.count.toLocaleString('en-IN')} <span className="text-lg text-white/40 font-semibold uppercase tracking-wider ml-1">Nodes Matched</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <input
                    type="text"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder="Enter Segment Designation..."
                    className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                  />
                  <button 
                    onClick={handleSaveSegment}
                    disabled={isSaving || !segmentName}
                    className="h-12 w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-50 text-sm"
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Lock Topology to Database
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-base font-semibold text-white/80 flex items-center gap-2">
              <Users className="w-4 h-4 text-white/40" />
              Active Audience Matrix <InfoTooltip content="Saved dynamic segments available for campaign targeting." />
           </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-3 text-center text-white/40 text-base py-12 animate-pulse">Synchronizing Topology...</div>
          ) : (
            <>
              
              {segments.map((s: any) => {
                let statusColor = 'indigo';
                if (s.name.includes('VIP')) statusColor = 'emerald';
                else if (s.name.includes('Inactive')) statusColor = 'rose';
                else if (s.name.includes('Frequent')) statusColor = 'blue';

                return (
                  <SegmentCard 
                    key={s._id}
                    name={s.name} 
                    desc={s.description || 'Auto-generated dynamic segment.'} 
                    users={s.count || 0} 
                    extra="Dynamic"
                    statusColor={statusColor} 
                  />
                );
              })}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
    </>
  );
}

function SegmentCard({ name, desc, users, extra, statusColor }: any) {
  const statusColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
  };

  const glowColorMap: Record<string, string> = {
    emerald: 'from-emerald-500/10',
    rose: 'from-rose-500/10',
    blue: 'from-blue-500/10',
    indigo: 'from-indigo-500/10',
  };

  const dotColor = statusColorMap[statusColor] || statusColorMap.indigo;
  const glowColor = glowColorMap[statusColor] || glowColorMap.indigo;

  return (
    <motion.div variants={fadeUp} className="h-full">
      <div className="h-full flex flex-col justify-between cursor-pointer group p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden">
        
        {/* Subtle Corner Glow */}
        <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${glowColor} via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2.5">
             <div className={`w-1.5 h-1.5 rounded-full ${dotColor} shadow-[0_0_8px_currentColor]`} />
             <h3 className="text-lg font-semibold text-white/90 truncate tracking-tight">
               {name}
             </h3>
          </div>
          <Users className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
        </div>
        
        <p className="text-sm font-medium text-white/40 leading-relaxed line-clamp-2 h-[40px] group-hover:text-white/60 transition-colors">{desc}</p>
      </div>
      
      <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">{users.toLocaleString('en-IN')}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">nodes</span>
        </div>
        <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md shadow-sm text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:bg-white/10 transition-colors">
          {extra}
        </div>
      </div>
      </div>
    </motion.div>
  );
}
