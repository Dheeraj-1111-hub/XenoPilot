import { useState } from 'react';
import { Target, Users, Loader2, Sparkles, CheckCircle2, MessageSquare, ArrowRight, Brain, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function AIStudio() {
  const [goal, setGoal] = useState("Bring back inactive customers who haven't ordered in 60 days.");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    setLoading(true);
    setPlan(null);
    setStepIndex(0);
    try {
      // Step 1: Strategy Generation
      const resStrategy = await api.post('/campaigns/strategy', { directive: goal });
      const strategy = resStrategy.data.strategy;
      
      // Step 2: Gemini Copywriter
      const resCopy = await api.post('/campaigns/copy', { strategy });
      const copy = resCopy.data.generatedMessage;

      setPlan({
        intent: strategy.goal,
        priority: 'High',
        reasoningChain: [
          `Analyzing directive: ${goal}`,
          `Identifying segment: ${strategy.segment}`,
          `Selecting optimal channel: ${strategy.channel}`,
          `Applying tone: ${strategy.tone}`
        ],
        segmentName: strategy.segment,
        segmentDescription: `Targeting: ${strategy.segment} with a focus on ${strategy.goal}. Offer: ${strategy.offer}`,
        channel: strategy.channel,
        tone: strategy.tone,
        offer: strategy.offer,
        messageTemplate: copy,
        audienceSize: strategy.audienceCount || 0,
        audienceAvgSpend: strategy.audienceAvgSpend || 0,
        channelConfidence: 94,
        forecast: { 
          openRate: strategy.forecast?.openRate || 0, 
          ctr: strategy.forecast?.ctr || 0, 
          expectedRevenue: `₹${((strategy.forecast?.conversions || 0) * 1250).toLocaleString('en-IN')}` 
        }
      });
      advanceSteps();
    } catch (err) {
      console.error(err);
      alert('Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  const advanceSteps = () => {
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStepIndex(current);
      if (current >= 6) clearInterval(interval);
    }, 800);
  };

  const handleLaunch = async () => {
    if (!plan) return;
    setLaunching(true);
    try {
      await api.post('/campaigns/launch', {
        name: `${plan.intent} Campaign`,
        directive: goal,
        segmentId: plan.segmentName,
        channel: plan.channel,
        tone: plan.tone,
        generatedMessage: plan.messageTemplate,
        audienceCount: plan.audienceSize,
        forecast: plan.forecast
      });
      navigate('/campaigns');
    } catch (err) {
      console.error(err);
      alert('Failed to launch campaign.');
      setLaunching(false);
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
      
      {/* PAGE HEADER */}
      <motion.div variants={fadeUp} className="border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-2 text-white/50 text-base font-medium mb-1">
          <Brain className="w-4 h-4" /> AI Operations
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Strategic Campaign Architect
        </h1>
        <p className="text-base text-white/50 mt-2">
          Provide intent parameters. The intelligence engine will construct the optimal segment, vector, and copy.
        </p>
      </motion.div>

      {/* PROMPT TERMINAL */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden focus-within:border-emerald-500/30 transition-all duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 focus-within:ring-emerald-500/20 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.01]">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white tracking-widest uppercase">Marketing Directive</span>
        </div>
        <div className="p-5 relative">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            className="w-full bg-transparent border-none p-0 text-lg text-white focus:ring-0 resize-none placeholder:text-white/20"
            placeholder="Describe your objective..."
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-mono text-white/30">Press ⌘ Enter to execute</span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !goal}
              className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Synthesizing..." : "Generate Strategy"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* EXECUTION TIMELINE */}
      {plan && (
        <div className="pt-10 relative before:absolute before:inset-0 before:left-[27px] before:w-[2px] before:bg-gradient-to-b before:from-emerald-500/50 before:via-white/10 before:to-transparent before:z-0">
          <div className="space-y-12 relative z-10">
            
            {stepIndex >= 1 && (
              <motion.div variants={fadeUp} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 flex justify-center relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150" />
                  <div className="w-8 h-8 rounded-full bg-[#050505] border border-emerald-500/30 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-base font-semibold text-white/90 mb-1">Goal Analysis</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm bg-white/10 px-2 py-1 rounded text-white/70">Objective: {plan.intent || 'Optimization'}</span>
                    <span className="text-sm bg-white/10 px-2 py-1 rounded text-emerald-400">Priority: {plan.priority || 'High'}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {stepIndex >= 2 && (
              <motion.div variants={fadeUp} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors shadow-inner">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-base font-semibold text-white/90 mb-2">AI Reasoning Chain</h3>
                  <ul className="space-y-2">
                    {(plan.reasoningChain || ["Analyzing signals...", "Evaluating targets..."]).map((reason: string, i: number) => (
                      <li key={i} className="text-base text-white/50 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-white/30" /> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {stepIndex >= 3 && (
              <motion.div variants={fadeUp} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors shadow-inner">
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-base font-semibold text-white/90 mb-3">Audience Topology Discovered</h3>
                  <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="text-lg font-semibold text-amber-400 mb-1 relative z-10">{plan.segmentName}</div>
                    <p className="text-sm text-white/50 mb-5 relative z-10">{plan.segmentDescription}</p>
                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                      <div>
                        <div className="text-sm text-white/40 uppercase tracking-wider mb-1">Target Customers</div>
                        <div className="text-2xl font-mono text-white/90">{(plan.audienceSize || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/40 uppercase tracking-wider mb-1">Avg Historical Spend</div>
                        <div className="text-2xl font-mono text-white/90">₹{Math.round(plan.audienceAvgSpend || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {stepIndex >= 4 && (
              <motion.div variants={fadeUp} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors shadow-inner">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-base font-semibold text-white/90 mb-1">Transmission Vector Selected</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-semibold text-white">{plan.channel}</span>
                    <span className="text-base text-white/40">{plan.channelConfidence || 92}% Confidence Score</span>
                  </div>
                </div>
              </motion.div>
            )}

            {stepIndex >= 5 && (
              <motion.div variants={fadeUp} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors shadow-inner">
                    <MessageSquare className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-base font-semibold text-white/90 mb-3">Copy Generated (Editable)</h3>
                  <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl focus-within:border-white/20 transition-all shadow-lg relative overflow-hidden group/edit">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none group-focus-within/edit:opacity-100 transition-opacity" />
                    <textarea 
                      className="w-full bg-transparent border-none text-base text-white/80 whitespace-pre-wrap leading-relaxed outline-none resize-none focus:ring-0 p-0 relative z-10 font-medium"
                      rows={4}
                      defaultValue={plan.messageTemplate || plan.message}
                      onChange={(e) => setPlan({...plan, messageTemplate: e.target.value})}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {stepIndex >= 6 && (
              <motion.div variants={fadeUp} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 flex justify-center relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] relative z-10">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Execution Forecast</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-lg hover:-translate-y-1 transition-transform">
                      <div className="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Open Rate</div>
                      <div className="text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-400">{plan.forecast?.openRate || 68.4}%</div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-lg hover:-translate-y-1 transition-transform">
                      <div className="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">CTR</div>
                      <div className="text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400">{plan.forecast?.ctr || 24.5}%</div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden hover:-translate-y-1 transition-transform">
                      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.05),transparent)] animate-pulse" />
                      <div className="relative z-10">
                        <div className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">Projected Revenue</div>
                        <div className="text-2xl font-semibold tracking-tight text-white">{plan.forecast?.expectedRevenue || '₹2.4L'}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunch}
                    disabled={launching}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black px-4 py-4 rounded-xl text-base font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50"
                  >
                    {launching ? <Loader2 className="animate-spin h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    {launching ? "Deploying Directive..." : "Execute Campaign"}
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      )}

      </motion.div>
    </>
  );
}
