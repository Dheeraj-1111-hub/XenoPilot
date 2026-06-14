import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { X, Target, Send, Users, Activity, BarChart3, Clock, Rocket, Sparkles, Code, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { InfoTooltip } from '../components/ui/info-tooltip';
import { AnimatedNumber } from '../components/ui/animated-number';


const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const { data: campaignDetails, isLoading: isDetailLoading } = useQuery({
    queryKey: ['campaign-detail', selectedCampaign?._id],
    queryFn: async () => {
      const res = await api.get(`/analytics/campaign/${selectedCampaign._id}`);
      return res.data;
    },
    enabled: !!selectedCampaign,
    refetchInterval: 5000 // Poll every 5 seconds for live events
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await api.get('/campaigns');
      return res.data;
    },
    refetchInterval: 3000
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-emerald-500/10 text-emerald-400';
      case 'Draft': return 'bg-white/10 text-white/60';
      case 'Sending': return 'bg-amber-500/10 text-amber-400';
      case 'Completed': return 'bg-blue-500/10 text-blue-400';
      case 'Failed': return 'bg-rose-500/10 text-rose-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-blue-400';
      case 'Delivered': return 'bg-indigo-400';
      case 'Opened': return 'bg-purple-400';
      case 'Clicked': return 'bg-emerald-400';
      case 'Converted': return 'bg-yellow-400';
      case 'Failed': return 'bg-rose-400';
      case 'Failed_Final': return 'bg-red-500';
      default: return 'bg-white/40';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] w-full flex gap-6 relative z-10 pb-6 pt-10">
      
      {/* Main Table */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={`flex-1 flex flex-col space-y-8 transition-all duration-500 ${selectedCampaign ? 'pr-[450px]' : ''}`}
      >
        <motion.div variants={fadeUp} className="border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-white/50 text-base font-medium mb-1">
              <Rocket className="w-4 h-4" /> Orchestration
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Active Deployments
            </h1>
            <p className="text-base text-white/50 mt-2">
              Live monitoring of multi-channel AI campaign orchestration.
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex-1 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-sm">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-8 text-center text-white/40 text-base animate-pulse">Establishing Connection...</div>
            ) : (
              <div className="bg-white/[0.02] backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 overflow-hidden">
                <table className="w-full text-base text-left border-collapse">
                  <thead className="bg-[#050505]/50 backdrop-blur-md text-white/40 border-b border-white/5 sticky top-0 z-10 text-[10px] uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4 flex items-center">Directive <InfoTooltip content="The natural language objective or goal that generated this campaign." /></th>
                      <th className="px-6 py-4">Segment <InfoTooltip content="The target audience for this campaign." /></th>
                      <th className="px-6 py-4">Channel <InfoTooltip content="The medium used to deliver the payload (e.g. WhatsApp, SMS)." /></th>
                      <th className="px-6 py-4 text-right">Open Rate <InfoTooltip content="Percentage of recipients who opened the message." /></th>
                      <th className="px-6 py-4 text-right">CTR <InfoTooltip content="Click-Through Rate: Percentage of recipients who clicked a link." /></th>
                      <th className="px-6 py-4 text-right">Status <InfoTooltip content="Current state of the orchestration pipeline." /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-transparent">
                    {campaigns.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-white/40 text-sm">No active directives.</td></tr>
                    )}
                    {campaigns.map((c: any) => (
                      <motion.tr 
                        variants={fadeUp}
                        key={c._id} 
                        onClick={() => setSelectedCampaign(c)}
                        className={`hover:bg-white/[0.04] cursor-pointer transition-colors group ${selectedCampaign?._id === c._id ? 'bg-white/[0.06]' : ''}`}
                      >
                        <td className="px-6 py-4 font-semibold text-white/90 group-hover:text-emerald-400 transition-colors truncate max-w-xs" title={c.directive}>{c.directive || c.name}</td>
                        <td className="px-6 py-4 text-white/50 text-sm">{c.segmentId || 'Global'}</td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          <div className="flex items-center gap-2">
                            <Send className="h-3.5 w-3.5 text-white/30 group-hover:text-emerald-400 transition-colors" /> {c.channel}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white/90">
                          {c.status === 'Pending' || c.stats?.delivered === 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin inline-block text-white/30" /> : <AnimatedNumber value={c.openRate} suffix="%" />}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white/90">
                          {c.status === 'Pending' || c.stats?.delivered === 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin inline-block text-white/30" /> : <AnimatedNumber value={c.ctr} suffix="%" />}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center justify-center text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm ${c.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : c.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                            {c.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Detail Drawer */}
      <div 
        className={`fixed top-14 right-0 bottom-0 w-[450px] border-l border-white/10 bg-black/60 backdrop-blur-3xl transition-transform duration-500 ease-out z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] ${selectedCampaign ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedCampaign && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" /> Deployment Inspector
                </div>
                <button 
                  onClick={() => setSelectedCampaign(null)}
                  className="p-1.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Header */}
                <div className="relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
                  <span className={`inline-flex mb-4 items-center justify-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm ${selectedCampaign.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : selectedCampaign.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                    {selectedCampaign.status}
                  </span>
                  <h3 className="text-2xl font-semibold tracking-tight text-white/90 leading-tight relative z-10">{selectedCampaign.name}</h3>
                  <div className="flex items-center gap-3 mt-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-mono bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-md text-white/60"><Users className="h-3 w-3 text-white/30" /> {selectedCampaign.segmentId || 'Global'}</div>
                    <div className="flex items-center gap-2 text-xs font-mono bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-md text-white/60"><Send className="h-3 w-3 text-white/30" /> {selectedCampaign.channel}</div>
                  </div>
                </div>

                {isDetailLoading ? (
                  <div className="py-10 text-center text-white/40 text-sm animate-pulse">Loading intelligence...</div>
                ) : campaignDetails && (
                  <>
                    {/* Prediction vs Actual */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Intelligence Deviation <InfoTooltip content="Compares the AI's predictive baseline against real-time actual performance." />
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
                          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-xl pointer-events-none transition-colors ${campaignDetails.funnel.openRate >= (selectedCampaign.predictedOpenRate || 0) ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`} />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 relative z-10">Open Rate</p>
                          <div className="flex items-end justify-between relative z-10">
                            {campaignDetails.funnel.delivered === 0 ? (
                              <div className="flex items-center gap-2 text-sm text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Syncing</div>
                            ) : (
                              <div className="text-[28px] font-mono font-bold tracking-tight text-white/90 flex items-center gap-2">
                                <AnimatedNumber value={campaignDetails.funnel.openRate} suffix="%" />
                              </div>
                            )}
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm mb-1 border ${campaignDetails.funnel.openRate >= (selectedCampaign.predictedOpenRate || 0) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                              vs {selectedCampaign.predictedOpenRate || 0}%
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
                          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-xl pointer-events-none transition-colors ${campaignDetails.funnel.ctr >= (selectedCampaign.predictedCTR || 0) ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`} />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 relative z-10">CTR</p>
                          <div className="flex items-end justify-between relative z-10">
                            {campaignDetails.funnel.delivered === 0 ? (
                              <div className="flex items-center gap-2 text-sm text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Syncing</div>
                            ) : (
                              <div className="text-[28px] font-mono font-bold tracking-tight text-white/90 flex items-center gap-2">
                                <AnimatedNumber value={campaignDetails.funnel.ctr} suffix="%" />
                              </div>
                            )}
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm mb-1 border ${campaignDetails.funnel.ctr >= (selectedCampaign.predictedCTR || 0) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                              vs {selectedCampaign.predictedCTR || 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div>
                      <div className="p-5 border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl rounded-xl shadow-lg relative overflow-hidden group/insight">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover/insight:bg-indigo-500/20 transition-colors" />
                        <div className="flex items-center gap-2 mb-3 text-indigo-400 relative z-10">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Cognitive Insight <InfoTooltip content="Real-time analysis generated by the AI engine based on current telemetry." /></span>
                        </div>
                        <div className="text-sm text-indigo-100/80 leading-relaxed relative z-10">
                          {campaignDetails.insight}
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" /> Generated Payload
                      </h4>
                      <div className="p-4 rounded-xl border border-white/5 bg-[#050505] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] overflow-x-auto text-sm font-mono whitespace-pre-wrap text-white/70 leading-relaxed">
                        {selectedCampaign.generatedMessage || selectedCampaign.message}
                      </div>
                    </div>

                    {/* Webhook Timeline Funnel */}
                    <div>
                      <h4 className="text-base font-semibold text-white/80 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-white/40" /> Execution Funnel <InfoTooltip content="The step-by-step conversion pipeline of the current campaign." />
                      </h4>
                      <div className="border-l border-white/10 ml-2 pl-6 space-y-4 relative py-2">
                        <TimelineStep label="Target Audience" value={campaignDetails.funnel.audience} max={campaignDetails.funnel.audience} colorClass="bg-white/20" isFirst />
                        <TimelineStep label="Transmission Sent" value={campaignDetails.funnel.sent} max={campaignDetails.funnel.audience} colorClass="bg-blue-400" />
                        <TimelineStep label="Nodes Reached" value={campaignDetails.funnel.delivered} max={campaignDetails.funnel.sent} colorClass="bg-indigo-400" />
                        <TimelineStep label="Payloads Opened" value={campaignDetails.funnel.opened} max={campaignDetails.funnel.delivered} colorClass="bg-purple-400" />
                        <TimelineStep label="Links Activated" value={campaignDetails.funnel.clicked} max={campaignDetails.funnel.opened} colorClass="bg-emerald-400" />
                        <TimelineStep label="Revenue Converted" value={campaignDetails.funnel.converted} max={campaignDetails.funnel.clicked} colorClass="bg-yellow-400" />
                      </div>
                    </div>

                    {/* Live Event Stream */}
                    <div>
                      <h4 className="text-base font-semibold text-white/80 mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Event Stream <InfoTooltip content="Asynchronous webhooks received from the Channel Service." />
                      </h4>
                      <div className="space-y-2">
                        {campaignDetails.eventStream?.map((event: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-[#050505] border border-white/5 p-3 rounded text-sm">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${getEventColor(event.status)}`} />
                              <span className="text-white/80 font-medium">{event.customer}</span>
                              <span className="text-white/40">{event.status} {event.retryCount > 0 ? `(Retry ${event.retryCount})` : ''}</span>
                            </div>
                            <span className="text-white/30 font-mono text-xs">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                        {(!campaignDetails.eventStream || campaignDetails.eventStream.length === 0) && (
                          <div className="text-white/30 text-sm text-center py-4 bg-[#050505] rounded border border-white/5">
                            Waiting for channel service events...
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
    </>
  );
}

function TimelineStep({ label, value, max, colorClass, isFirst = false }: { label: string, value: number, max: number, colorClass: string, isFirst?: boolean }) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  
  return (
    <div className="relative group mb-2">
      <div className={`absolute -left-[29px] top-1 w-2 h-2 rounded-full ${isFirst ? 'bg-white' : colorClass} ring-4 ring-[#050505] transition-transform group-hover:scale-125 z-10`}></div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-white/90">{label}</span>
        <div className="flex items-center gap-3">
          {!isFirst && value > 0 && <span className="text-[10px] font-bold text-white/40">{percentage}%</span>}
          <span className="text-base font-mono text-white/90">{value.toLocaleString('en-IN')}</span>
        </div>
      </div>
      {!isFirst && (
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${colorClass.replace('bg-', 'bg-')}`} 
          />
        </div>
      )}
    </div>
  );
}
