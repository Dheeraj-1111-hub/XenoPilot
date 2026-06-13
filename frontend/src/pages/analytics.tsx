import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Activity, TrendingUp, Users, Receipt, MousePointerClick, BarChart3, PieChart as PieIcon, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AnimatedCounter } from '../components/ui/animated-counter';
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data;
    },
    refetchInterval: 5000 // Poll every 5 seconds for real-time updates
  });

  const revenueData = stats?.revenueData || [];

  const channelData = stats?.channelPerformance?.map((c: any) => ({
    name: c.name,
    value: c.volume
  })).filter((c: any) => c.value > 0) || [];

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#a855f7'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-white/10 p-3 rounded shadow-2xl">
          <p className="text-sm font-medium text-white/50 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-base font-mono text-white">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8 pb-24 pt-4 relative z-10 w-full"
      >
      <motion.div variants={fadeUp} className="border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 text-white/50 text-base font-medium mb-1">
             <BarChart3 className="w-4 h-4" /> Reports
           </div>
           <h1 className="text-3xl font-semibold text-white tracking-tight">
             Performance Telemetry
           </h1>
           <p className="text-base text-white/50 mt-2">
             Real-time aggregation of campaign execution metrics.
           </p>
        </div>
        
        {/* System Health Dashboard */}
        <div className="flex gap-3">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-lg p-2.5 px-4 text-right shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 flex items-center justify-end gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${stats?.health?.channelStatus === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`}></div> Channel Service
            </div>
            <div className={`text-xs font-mono font-bold ${stats?.health?.channelStatus === 'ONLINE' ? 'text-white/90' : 'text-rose-400'}`}>
              {stats?.health?.channelStatus || 'OFFLINE'}
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-lg p-2.5 px-4 text-right shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Callbacks Received</div>
            <div className="text-xs font-mono font-bold text-white/90">{stats?.health?.totalCallbacks?.toLocaleString('en-IN') || 0}</div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-lg p-2.5 px-4 text-right shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Failure Rate</div>
            <div className="text-xs font-mono font-bold text-rose-400">{stats?.health?.failureRate || '0.0'}%</div>
          </div>
        </div>
      </motion.div>

      {/* Primary Telemetry Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Average Open Rate"
          value={isLoading ? "..." : (stats?.openRate || 0)}
          isPercentage
          icon={Activity}
        />
        <MetricCard 
          title="Average CTR"
          value={isLoading ? "..." : (stats?.ctr || 0)}
          isPercentage
          icon={MousePointerClick}
        />
        <MetricCard 
          title="Conversions"
          value={isLoading ? "..." : (stats?.conversions || 0)}
          icon={CheckCircle}
        />
        <MetricCard 
          title="Revenue Influenced"
          value={isLoading ? "..." : (stats?.revenue || 0)}
          isCurrency
          icon={Receipt}
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Channel Performance Comparison */}
        <motion.div variants={fadeUp} className="lg:col-span-2 border border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-2xl p-6 relative shadow-sm transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 hover:shadow-lg group/chart">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white/40" />
              <h3 className="text-base font-semibold text-white/90">Channel Performance Comparison</h3>
            </div>
            <div className="relative group/tooltip cursor-help flex items-center justify-center">
              <Info className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs leading-relaxed text-white/70 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                Live comparison of Open, CTR, and Conversion rates grouped by communication channel to determine the most effective medium.
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.channelPerformance || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight={500} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} fontWeight={500} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="openRate" name="Open Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ctr" name="CTR" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversionRate" name="Conv. Rate" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vector Distribution */}
        <motion.div variants={fadeUp} className="border border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-2xl p-6 relative shadow-sm flex flex-col transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 hover:shadow-lg group/chart">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-white/40" />
              <h3 className="text-base font-semibold text-white/90">Execution Vectors</h3>
            </div>
            <div className="relative group/tooltip cursor-help flex items-center justify-center">
              <Info className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs leading-relaxed text-white/70 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                The exact distribution of total message volume deployed across different channels (e.g., WhatsApp vs Email).
              </div>
            </div>
          </div>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {channelData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {channelData.map((item: any, index: number) => (
              <div key={item.name} className="flex items-center gap-2 bg-[#050505] p-2.5 rounded-lg border border-white/5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs font-semibold text-white/70">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Conversion Funnel */}
        <motion.div variants={fadeUp} className="lg:col-span-3 border border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-2xl p-6 relative shadow-sm transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 hover:shadow-lg group/chart">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-white/40" />
              <h3 className="text-base font-semibold text-white/90">Global Conversion Funnel</h3>
            </div>
            <div className="relative group/tooltip cursor-help flex items-center justify-center">
              <Info className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs leading-relaxed text-white/70 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                Real-time tracking of the user journey from initial audience targeting through to final purchase conversion.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FunnelStep label="Target Audience" value={stats?.funnel?.audience || 0} />
            <FunnelStep label="Delivered" value={stats?.funnel?.delivered || 0} />
            <FunnelStep label="Opened" value={stats?.funnel?.opened || 0} />
            <FunnelStep label="Clicked" value={stats?.funnel?.clicked || 0} />
            <FunnelStep label="Converted" value={stats?.funnel?.converted || 0} isLast />
          </div>
        </motion.div>
      </div>
      </motion.div>
    </>
  );
}

function FunnelStep({ label, value, isLast = false }: any) {
  return (
    <div className="relative p-5 bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-xl text-center flex flex-col items-center justify-center transition-all hover:bg-[#0A0A0A] hover:border-white/10 duration-300 shadow-sm hover:shadow-lg group">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <p className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 tracking-tight">
        {typeof value === 'number' ? <AnimatedCounter value={value} formatFn={v => Math.round(v).toLocaleString('en-IN')} /> : value}
      </p>
      {!isLast && (
        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/10 group-hover:bg-white/30 transition-colors"></div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, isCurrency, isPercentage }: any) {
  let colorClass = "from-indigo-500/10";
  if (title.includes('Open')) colorClass = "from-emerald-500/10";
  if (title.includes('CTR')) colorClass = "from-blue-500/10";
  if (title.includes('Revenue')) colorClass = "from-rose-500/10";

  return (
    <div className="h-full flex flex-col cursor-pointer group p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden">
      
      {/* Subtle Corner Glow */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${colorClass} via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{title}</h3>
          <div className="text-white/30 group-hover:text-white/60 transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <h2 className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
            {isCurrency && "₹"}
            {typeof value === 'number' ? <AnimatedCounter value={value} formatFn={v => Math.round(v).toLocaleString('en-IN')} /> : value}
            {isPercentage && "%"}
          </h2>
          {trend && <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{trend}</span>}
        </div>
      </div>
    </div>
  );
}
