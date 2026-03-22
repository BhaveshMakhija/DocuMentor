import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  ArrowUpRight, 
  TrendingUp, 
  Activity, 
  Cpu 
} from 'lucide-react';
import MetricCard from './MetricCard';
import LogsPanel from './LogsPanel';
import { fetchEvaluation, fetchLogs } from '../services/api';

const EvaluationDashboard = () => {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const evalData = await fetchEvaluation();
        const logsData = await fetchLogs();
        setData(evalData);
        setLogs(logsData);
      } catch (err) {
        setError(err.message || "Failed to fetch evaluation metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 font-bold uppercase text-[10px] tracking-widest flex flex-col items-center gap-4">
        <ShieldCheck size={48} className="text-red-500/20" />
        {error}
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500/10 rounded-full border border-red-500/10 hover:bg-red-500/20 transition-all font-bold tracking-widest">
          Retry Fetch
        </button>
      </div>
    );
  }

  // Calculate improvement deltas
  const getDelta = (metric) => {
    if (!data?.baseline?.metrics || !data?.improved?.metrics) return 0;
    const diff = data.improved.metrics[metric] - data.baseline.metrics[metric];
    return parseFloat(diff.toFixed(2));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Pipeline Metrics</h2>
          <p className="text-xs text-zinc-500 font-medium tracking-[0.2em] uppercase mt-1">Cross-Encoder Assessment</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <Activity size={12} /> Live Benchmarked
          </div>
          <div className="text-zinc-500">Last run: {data?.improved?.timestamp?.split('T')[1]?.substring(0, 5)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Faithfulness" 
          value={data?.improved?.metrics?.faithfulness || 0} 
          delta={getDelta('faithfulness')} 
          icon={ShieldCheck} 
          color="blue" 
        />
        <MetricCard 
          title="Answer Relevancy" 
          value={data?.improved?.metrics?.answer_relevancy || 0} 
          delta={getDelta('answer_relevancy')} 
          icon={Target} 
          color="purple" 
        />
        <MetricCard 
          title="Context Precision" 
          value={data?.improved?.metrics?.context_precision || 0} 
          delta={getDelta('context_precision')} 
          icon={CheckCircle2} 
          color="emerald" 
        />
      </div>

      {/* Comparison Table Section */}
      <div className="mt-16 text-left">
        <div className="flex items-center gap-3 mb-8 px-2">
          <BarChart3 className="text-blue-500" size={20} />
          <h3 className="text-xl font-bold">Historical Comparison</h3>
        </div>
        
        <div className="overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="py-4 px-8 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">Version</th>
                <th className="py-4 px-8 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">Faithfulness</th>
                <th className="py-4 px-8 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">Relevancy</th>
                <th className="py-4 px-8 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">Context Precision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="group hover:bg-white/[0.03] transition-colors">
                <td className="py-5 px-8 text-sm font-bold text-zinc-400">Baseline (Hybrid)</td>
                <td className="py-5 px-8 text-sm font-mono text-zinc-500">{data?.baseline?.metrics?.faithfulness}</td>
                <td className="py-5 px-8 text-sm font-mono text-zinc-500">{data?.baseline?.metrics?.answer_relevancy}</td>
                <td className="py-5 px-8 text-sm font-mono text-zinc-500">{data?.baseline?.metrics?.context_precision}</td>
              </tr>
              <tr className="group hover:bg-blue-500/[0.02] transition-colors bg-blue-500/[0.04]">
                <td className="py-5 px-8 text-sm font-bold text-blue-400 flex items-center gap-3">
                  With Reranking <span className="text-[10px] bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/10">IMPROVED</span>
                </td>
                <td className="py-5 px-8 font-mono text-emerald-400 text-base font-bold">
                  {data?.improved?.metrics?.faithfulness} 
                  <span className="ml-2 text-[10px] opacity-70">+{getDelta('faithfulness')}</span>
                </td>
                <td className="py-5 px-8 font-mono text-emerald-400 text-base font-bold">
                  {data?.improved?.metrics?.answer_relevancy}
                  <span className="ml-2 text-[10px] opacity-70">+{getDelta('answer_relevancy')}</span>
                </td>
                <td className="py-5 px-8 font-mono text-emerald-400 text-base font-bold">
                  {data?.improved?.metrics?.context_precision}
                  <span className="ml-2 text-[10px] opacity-70">+{getDelta('context_precision')}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Observability Logs Panel */}
      <LogsPanel logs={logs} loading={loading} />
      
      <div className="flex justify-center mt-12 pb-12">
        <button className="flex items-center gap-2 px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Cpu size={16} className="text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Start New Benchmarking Run</span>
          <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default EvaluationDashboard;
