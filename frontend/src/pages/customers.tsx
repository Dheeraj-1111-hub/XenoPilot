import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, X, Sparkles, Receipt, Megaphone, Clock, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function Customers() {
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailedCustomer, setDetailedCustomer] = useState<any>(null);

  const handleCustomerClick = async (c: any) => {
    setSelectedCustomer(c);
    setDetailedCustomer(null); // Clear previous details
    try {
      const res = await api.get(`/customers/${c._id}`);
      setDetailedCustomer(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data;
    }
  });

  const filtered = customers.filter(
    (c: any) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] w-full flex gap-6 relative z-10 pb-6 pt-4">
      
      {/* Main Area */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={`flex-1 flex flex-col space-y-8 transition-all duration-500 ${selectedCustomer ? 'pr-[400px]' : ''}`}
      >
        <motion.div variants={fadeUp} className="border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-white/50 text-base font-medium mb-1">
              <Users className="w-4 h-4" /> CRM Database
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center">
              Customer Telemetry <InfoTooltip content="High-resolution records of individual consumer LTV and behavioral patterns." />
            </h1>
            <p className="text-base text-white/50 mt-2">
              High-resolution records of individual consumer LTV and behavioral patterns.
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 focus-within:ring-emerald-500/30 transition-all duration-500">
          <div className="border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 px-5 py-4">
              <Search className="h-4 w-4 text-emerald-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers by name or email..."
                className="flex-1 bg-transparent text-sm font-medium outline-none text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-8 text-center text-white/40 text-base animate-pulse">Synchronizing Data...</div>
            ) : (
              <table className="w-full text-base text-left border-collapse">
                <thead className="bg-[#050505]/50 backdrop-blur-md text-white/40 border-b border-white/5 sticky top-0 z-10 text-[10px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4 flex items-center">Identity <InfoTooltip content="The customer's full name." /></th>
                    <th className="px-6 py-4">Protocol Address <InfoTooltip content="The primary communication email address." /></th>
                    <th className="px-6 py-4 text-right flex items-center justify-end">Transactions <InfoTooltip content="Total number of successful orders." /></th>
                    <th className="px-6 py-4 text-right">Lifetime Value <InfoTooltip content="Cumulative monetary value of all orders." /></th>
                    <th className="px-6 py-4 text-right">Status <InfoTooltip content="Current activity status based on recent purchase behavior." /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {filtered.map((c: any) => (
                    <motion.tr 
                      variants={fadeUp}
                      key={c._id} 
                      onClick={() => handleCustomerClick(c)}
                      className={`hover:bg-white/[0.04] cursor-pointer transition-colors group ${selectedCustomer?._id === c._id ? 'bg-white/[0.06]' : ''}`}
                    >
                      <td className="px-6 py-4 font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">{c.name}</td>
                      <td className="px-6 py-4 text-white/50 text-sm">{c.email}</td>
                      <td className="px-6 py-4 text-right text-white/70 font-mono">{c.totalOrders}</td>
                      <td className="px-6 py-4 text-right text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 font-mono font-bold">₹{c.totalSpent?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                          {c.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Slide-over Drawer */}
      <div 
        className={`fixed top-14 right-0 bottom-0 w-[450px] border-l border-white/10 bg-black/60 backdrop-blur-3xl transition-transform duration-500 ease-out z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] ${selectedCustomer ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedCustomer && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="text-base text-white/50 font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Telemetry Inspector
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Header Info */}
                <div className="text-center relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
                  <div className="h-16 w-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white/90 relative z-10">{selectedCustomer.name}</h3>
                  <p className="text-sm font-medium text-white/50 mt-1 relative z-10">{selectedCustomer.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
                    <span className="text-xs font-mono bg-white/[0.03] border border-white/10 px-2.5 py-1 rounded-md text-white/60">{selectedCustomer.city}</span>
                    <span className="text-xs font-mono bg-white/[0.03] border border-white/10 px-2.5 py-1 rounded-md text-white/60">{selectedCustomer.phone}</span>
                  </div>
                </div>

                {/* Intelligence Metrics */}
                {detailedCustomer?.intelligence && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden group/risk">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none group-hover/risk:bg-rose-500/20 transition-colors" />
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 relative z-10 flex items-center">Risk Level <InfoTooltip content="AI assessment of the customer's likelihood to churn." /></div>
                      <div className={`text-xl tracking-tight font-semibold relative z-10 ${detailedCustomer.intelligence.riskLevel === 'HIGH' ? 'text-rose-400' : detailedCustomer.intelligence.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {detailedCustomer.intelligence.riskLevel}
                      </div>
                    </div>
                    <div className="p-4 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden group/seg">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover/seg:bg-emerald-500/20 transition-colors" />
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 relative z-10 flex items-center">Segment <InfoTooltip content="The primary behavioral cohort this customer belongs to." /></div>
                      <div className="text-lg tracking-tight font-semibold text-white/90 relative z-10 line-clamp-1">
                        {detailedCustomer.intelligence.segment}
                      </div>
                    </div>
                    <div className="p-4 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden group/chan">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover/chan:bg-blue-500/20 transition-colors" />
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 relative z-10 flex items-center">Optimal Channel <InfoTooltip content="The communication channel with the highest historical engagement for this user." /></div>
                      <div className="text-lg tracking-tight font-semibold text-white/90 relative z-10">
                        {detailedCustomer.intelligence.recommendedChannel}
                      </div>
                    </div>
                    <div className="p-4 border border-white/5 bg-white/[0.02] backdrop-blur-md rounded-xl shadow-lg relative overflow-hidden group/act">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover/act:bg-purple-500/20 transition-colors" />
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 relative z-10 flex items-center">Suggested Action <InfoTooltip content="AI-recommended marketing action to maximize lifetime value." /></div>
                      <div className="text-lg tracking-tight font-semibold text-white/90 truncate relative z-10" title={detailedCustomer.intelligence.recommendedAction}>
                        {detailedCustomer.intelligence.recommendedAction}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Insight */}
                <div className="p-5 border border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-xl shadow-lg relative overflow-hidden group/insight">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover/insight:bg-indigo-500/20 transition-colors" />
                  <div className="flex items-center gap-2 mb-3 text-indigo-400 relative z-10">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest flex items-center">Cognitive Insight <InfoTooltip content="Contextual behavioral analysis generated by the AI engine." /></span>
                  </div>
                  {detailedCustomer?.intelligence ? (
                    <p className="text-sm text-white/80 leading-relaxed relative z-10">
                      {detailedCustomer.intelligence.insight}
                    </p>
                  ) : (
                    <div className="animate-pulse flex space-x-4 mt-3 relative z-10">
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-2 bg-white/10 rounded"></div>
                        <div className="h-2 bg-white/10 rounded w-5/6"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 border border-white/5 bg-[#050505] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-xl text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center justify-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-emerald-400" /> Total Yield
                    </div>
                    <p className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">₹{selectedCustomer.totalSpent?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-5 border border-white/5 bg-[#050505] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-xl text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center justify-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" /> Frequency
                    </div>
                    <p className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{selectedCustomer.totalOrders}</p>
                  </div>
                </div>

                {/* Campaign History */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
                    <Megaphone className="h-4 w-4" /> Interaction History
                  </h4>
                  <div className="border-l-2 border-white/5 ml-2.5 pl-6 space-y-6">
                    {detailedCustomer ? (
                      detailedCustomer.communications?.length > 0 ? (
                        detailedCustomer.communications.map((comm: any) => (
                          <div key={comm._id} className="relative group">
                            <div className={`absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#050505] ${comm.status === 'Converted' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                            <div className="text-[10px] font-mono text-white/30 mb-1 tracking-widest uppercase">{new Date(comm.sentAt || comm._id.getTimestamp()).toLocaleDateString()}</div>
                            <div className="text-sm font-semibold text-white/90">{comm.campaignId?.name || 'Manual Broadcast'}</div>
                            <div className={`text-xs mt-1 font-medium ${comm.status === 'Converted' ? 'text-emerald-400' : 'text-white/40'}`}>Status: {comm.status}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-white/40 font-medium">No interaction history found.</p>
                      )
                    ) : (
                      <div className="animate-pulse space-y-5">
                        <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        <div className="h-3 bg-white/5 rounded w-1/3"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="text-base font-semibold text-white/80 mb-4 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-white/40" /> Recent Transactions
                  </h4>
                  <div className="space-y-3">
                    {detailedCustomer ? (
                      detailedCustomer.orders?.length > 0 ? (
                        detailedCustomer.orders.map((order: any) => (
                          <div key={order._id} className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02] rounded-lg">
                            <div>
                              <div className="text-base font-medium text-white/90">{order.category}</div>
                              <div className="text-sm text-white/40">{new Date(order.orderDate).toLocaleDateString()}</div>
                            </div>
                            <div className="text-base font-mono font-medium text-white/90">₹{order.amount.toLocaleString('en-IN')}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/40">No recent transactions.</p>
                      )
                    ) : (
                      <div className="animate-pulse h-12 bg-white/10 rounded"></div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
    </>
  );
}
