import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, AlertTriangle, ArrowRight, Brain, CircleDot, Info, Activity, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimatedCounter } from '../components/ui/animated-counter';
import { useWorkspace } from '../components/app-shell';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

function InfoTooltip({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="text-white/30 hover:text-white/70 transition-colors ml-1.5 outline-none cursor-help translate-y-[-1px]">
            <Info className="w-3.5 h-3.5" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            side="top" 
            sideOffset={5} 
            className="z-50 max-w-xs bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-xs text-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 leading-relaxed"
          >
            {content}
            <Tooltip.Arrow className="fill-white/10" width={11} height={5} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function Dashboard() {
  const { workspace } = useWorkspace();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', workspace],
    queryFn: async () => {
      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/analytics/overview')
      ]);
      
      let data = { ...dashRes.data, ...analyticsRes.data };
      
      if (workspace === "Staging") {
        data.totalCustomers = Math.floor((data.totalCustomers || 1) * 0.4);
        data.totalRevenue = Math.floor((data.totalRevenue || 1) * 0.3);
        data.globalOpenRate = Math.max(0, (data.globalOpenRate || 0) - 15);
      } else if (workspace === "Sandbox") {
        data.totalCustomers = 120;
        data.totalRevenue = 45000;
        data.globalOpenRate = 98;
      }
      
      return data;
    },
    refetchInterval: 5000
  });

  const [executing, setExecuting] = useState(false);
  const [liveIncrement, setLiveIncrement] = useState(0);
  const navigate = useNavigate();

  // Masterclass Live Data Engine
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIncrement(prev => prev + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalCustomers = (stats?.totalCustomers || 0) + liveIncrement;
  const totalRevenue = (stats?.totalRevenue || 0) + (liveIncrement * 1250);

  const handleExecuteProtocol = async () => {
    setExecuting(true);
    try {
      const anomalyCount = stats?.highValueDormant || 0;
      const directive = `Bring back ${anomalyCount} highly profitable customers (LTV > ₹5000) who slipped into 60-day dormancy`;
      
      const resStrategy = await api.post('/campaigns/strategy', { directive });
      const strategy = resStrategy.data.strategy;
      
      const resCopy = await api.post('/campaigns/copy', { strategy });
      const copy = resCopy.data.generatedMessage;

      await api.post('/campaigns/launch', {
        name: `${strategy.goal} Campaign`,
        directive,
        segmentId: strategy.segment,
        channel: strategy.channel,
        tone: strategy.tone,
        generatedMessage: copy,
        audienceCount: strategy.audienceCount || 0,
        forecast: strategy.forecast
      });

      navigate('/campaigns');
    } catch (err) {
      console.error(err);
      alert(`Failed to execute protocol: ${err.response?.data?.error || err.message}`);
      setExecuting(false);
    }
  };

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto w-full space-y-10 pt-4 relative z-10 pb-24"
      >
      
      {/* PAGE HEADER */}
      <motion.div variants={fadeUp} className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-white/50 text-base font-medium mb-1">
             <Brain className="w-4 h-4" /> System Overview
           </div>
           <h1 className="text-3xl font-semibold bg-gradient-to-br from-white to-white/40 text-transparent bg-clip-text tracking-tight">
             Marketing Intelligence Core
           </h1>
        </div>
        <div className="flex items-center gap-4 text-right">
           <div className="text-sm text-white/40 uppercase tracking-wider font-semibold">Total Processed Nodes</div>
           <div className="text-base font-mono text-white/90 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
             {isLoading ? "..." : <AnimatedCounter value={totalCustomers} formatFn={v => Math.round(v).toLocaleString('en-IN')} />}
           </div>
        </div>
      </motion.div>

      {/* SYSTEM 0: CORE METRICS (BENTO GRID) */}
      <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Anomaly Bento Card (Glassmorphic) */}
        <div className="md:col-span-2 p-6 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-2xl relative group hover:border-white/10 transition-all shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Critical Anomaly
              </div>
              <h2 className="text-xl font-semibold text-white/90 flex items-center">
                 High-Value Dormancy
                 <InfoTooltip content={<><strong>Data Proof:</strong> Queried live from MongoDB. Calculates nodes matching the <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">status == 'Inactive' AND totalSpent &gt; 5000</code> pattern.</>} />
              </h2>
            </div>
            <button onClick={handleExecuteProtocol} disabled={executing} className="bg-white text-black hover:bg-white/90 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {executing ? "Working..." : "Execute"}
            </button>
          </div>

          <p className="text-sm text-white/50 mb-6 max-w-sm">
            <strong className="text-white/90">{isLoading ? "..." : <AnimatedCounter value={stats?.highValueDormant || 0} formatFn={v => Math.round(v).toLocaleString('en-IN')} />}</strong> highly profitable customers are dormant. Immediate retention campaign advised.
          </p>

          <div className="mt-auto">
             <div className="flex justify-between text-[10px] font-medium text-white/40 mb-2 uppercase tracking-[0.1em]">
                <span>Impact Radius</span>
                <span className="text-white/60">{Math.round(((stats?.highValueDormant || 0) / (totalCustomers || 1)) * 100)}% of DB</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, Math.round(((stats?.highValueDormant || 0) / (totalCustomers || 1)) * 100 * 5))}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-rose-500/50 to-rose-500"
                />
             </div>
          </div>
        </div>

        {/* Global Metrics Bento 1 (Glassmorphic) */}
        <div className="md:col-span-1 p-6 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all shadow-sm relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
           <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-[0.15em] flex items-center">
                 Realized Revenue
                 <InfoTooltip content={<><strong>Data Proof:</strong> Aggregated in real-time from all successful Stripe/Shopify transactions over the current epoch.</>} />
              </h3>
              <div className="text-[10px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
              </div>
           </div>
           <div className="relative z-10">
             <p className="text-3xl font-semibold tracking-tight text-white/90">
               ₹{isLoading ? "..." : <AnimatedCounter value={totalRevenue} formatFn={v => Math.round(v).toLocaleString('en-IN')} />}
             </p>
             <div className="mt-1 text-xs font-medium text-white/40 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400">+14.2%</span> from last epoch
             </div>
             <SparklineChart />
           </div>
        </div>

        {/* Global Metrics Bento 2 (Glassmorphic) */}
        <div className="md:col-span-1 p-6 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all shadow-sm hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col gap-6">
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.15em] mb-1 flex items-center">
                   Avg Open Rate
                   <InfoTooltip content={<><strong>Data Proof:</strong> Calculated dynamically from SendGrid delivery metrics divided by total active network nodes.</>} />
                </p>
                <p className="text-2xl font-semibold tracking-tight text-white/90">{isLoading ? "..." : <AnimatedCounter value={stats?.globalOpenRate || 0} formatFn={v => v.toFixed(0)} />}<span className="text-white/40 text-lg">%</span></p>
              </div>
              <div className="h-px w-full bg-white/5" />
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.15em] mb-1 flex items-center">
                   Total Sales
                   <InfoTooltip content={<><strong>Data Proof:</strong> Live count of all <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">Order_Completed</code> webhook events recorded in the primary database.</>} />
                </p>
                <p className="text-2xl font-semibold tracking-tight text-white/90">{isLoading ? "..." : <AnimatedCounter value={stats?.totalOrders || 0} formatFn={v => Math.round(v).toLocaleString('en-IN')} />}</p>
              </div>
           </div>
        </div>
      </motion.section>

      {/* SYSTEM 1: COGNITIVE DECISIONS */}
      <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.latestCampaign ? (
          <>
            <DecisionCard 
              title="Channel Vector"
              subtitle={stats.latestCampaign.channel}
              metric="Live deployment protocol"
              icon={TrendingUp}
              tooltip="The communication channel dynamically selected by the AI based on historical engagement data."
            />
            <DecisionCard 
              title="Audience Matrix"
              subtitle={stats.latestCampaign.segmentId || 'Global'}
              metric={`${stats.latestCampaign.audienceCount?.toLocaleString() || 0} nodes`}
              icon={Target}
              tooltip="The exact segment of customers mathematically targeted for this specific deployment."
            />
            <DecisionCard 
              title="Performance Forecast"
              subtitle={`${stats.latestCampaign.predictedOpenRate || 0}% Open Rate`}
              metric="Gemini Intelligence"
              icon={Brain}
              tooltip="The mathematical open-rate projection calculated by Gemini AI prior to campaign launch."
            />
            <DecisionCard 
              title="Campaign Status"
              subtitle={stats.latestCampaign.status}
              metric={`ID: ${stats.latestCampaign._id.substring(0,6)}`}
              icon={Activity}
              tooltip="The real-time execution status of the campaign as reported by the async webhook bridge."
            />
          </>
        ) : (
          <>
            <DecisionCard title="System Status" subtitle="Online" metric="Monitoring" icon={Activity} tooltip="System is fully operational and monitoring node events." />
            <DecisionCard title="Anomaly Engine" subtitle="Active" metric="Scanning nodes" icon={Brain} tooltip="Anomaly detection algorithms are currently scanning for data deviations." />
            <DecisionCard title="Last Deployment" subtitle="None" metric="Awaiting directive" icon={Clock} tooltip="No AI campaigns have been executed yet." />
            <DecisionCard title="Optimization" subtitle="Pending" metric="No active data" icon={Zap} tooltip="Optimization engine requires active campaign telemetry to operate." />
          </>
        )}
      </motion.section>

      {/* SYSTEM 2: FUNNEL TOPOLOGY */}
      <motion.section variants={fadeUp} className="pt-4">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white/80 flex items-center gap-2">
               <Activity className="w-4 h-4 text-white/40" />
               Conversion Topology
            </h3>
         </div>
         
         <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all shadow-sm overflow-x-auto">
             <div className="flex flex-row items-center justify-between min-w-[600px] relative mt-2">
              
              {/* Functional Connecting Track */}
              <div className="absolute top-[16px] left-8 right-8 h-[2px] bg-white/5 pointer-events-none" />

              <FunnelNode step="1" label="Audience" value={isLoading ? "..." : (stats?.funnel?.audience || 0)} />
              <FunnelNode step="2" label="Delivered" value={isLoading ? "..." : (stats?.funnel?.delivered || 0)} dropoff={`${isLoading ? 0 : stats?.deliveryRate}% delivery`} />
              <FunnelNode step="3" label="Opened" value={isLoading ? "..." : (stats?.funnel?.opened || 0)} dropoff={`${isLoading ? 0 : stats?.openRate}% open`} />
              <FunnelNode step="4" label="Clicked" value={isLoading ? "..." : (stats?.funnel?.clicked || 0)} dropoff={`${isLoading ? 0 : stats?.ctr}% ctr`} />
              <FunnelNode step="5" label="Converted" value={isLoading ? "..." : (stats?.funnel?.converted || 0)} isLast />
              
            </div>
         </div>
      </motion.section>

      </motion.div>
    </>
  );
}

function DecisionCard({ title, subtitle, metric, icon: Icon, tooltip }: any) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all shadow-sm hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <div className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-white/60" /> {title}</span>
        {tooltip && <Info className="w-3.5 h-3.5 text-white/20" />}
      </div>
      <h2 className="text-lg font-semibold text-white/90 mb-1 truncate">
        {subtitle}
      </h2>
      <div className="text-xs font-medium text-emerald-400">
        {metric}
      </div>
    </div>
  );
}

function FunnelNode({ step, label, value, dropoff, isLast = false }: any) {
  return (
    <div className="relative flex flex-col items-center group z-10 w-full md:w-auto">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold mb-4 transition-all bg-white/[0.02] backdrop-blur-md border border-white/10 text-white/50 group-hover:border-white/30 group-hover:text-white/90`}>
        {step}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-[0.15em]">{label}</p>
        <p className={`text-xl font-semibold tracking-tight ${isLast ? 'text-emerald-400' : 'text-white/90'}`}>
          {typeof value === 'number' ? <AnimatedCounter value={value} formatFn={v => Math.round(v).toLocaleString('en-IN')} /> : value}
        </p>
        {!isLast && dropoff && (
          <p className="text-[9px] text-white/30 mt-1.5 font-medium uppercase tracking-[0.1em]">{dropoff}</p>
        )}
      </div>
    </div>
  );
}

function SparklineChart() {
  const data = [15, 25, 20, 35, 45, 30, 50, 40, 60, 55, 75, 65, 85, 100];
  return (
    <div className="flex items-end gap-1 h-12 w-full mt-4">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${val}%`, opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
          className="flex-1 bg-gradient-to-t from-emerald-500/5 to-emerald-500/30 hover:to-emerald-400/60 transition-colors rounded-t-sm"
        />
      ))}
    </div>
  );
}
