import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  ArrowUpRight, 
  Activity, 
  Cpu,
  RefreshCcw,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import MetricCard from './MetricCard';
import LogsPanel from './LogsPanel';
import { 
  fetchEvaluation, 
  fetchLogs, 
  clearHistory, 
  fetchMetrics, 
  runEvaluation,
  fetchBenchmarkStatus 
} from '../services/api';

const EvaluationDashboard = () => {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Job Tracking State
  const [activeJobId, setActiveJobId] = useState(localStorage.getItem('docu_benchmark_job_id') || null);
  const [jobStatus, setJobStatus] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalDone, setEvalDone] = useState(false);
  const [runtimeError, setRuntimeError] = useState(null);
  
  const pollingRef = useRef(null);

  const loadDashboard = async () => {
    try {
      const evalData = await fetchEvaluation();
      const logsData = await fetchLogs();
      const metricsData = await fetchMetrics();
      setData(evalData);
      setLogs(logsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // Check if we have a persisted job to resume
    if (activeJobId) {
      startPolling(activeJobId);
    }
    return () => stopPolling();
  }, []);

  const startPolling = (jobId) => {
    setEvaluating(true);
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const status = await fetchBenchmarkStatus(jobId);
        setJobStatus(status);
        
        // Also fetch logs for real-time updates
        const logsData = await fetchLogs();
        setLogs(logsData);

        if (status.status === 'completed') {
          stopPolling();
          localStorage.removeItem('docu_benchmark_job_id');
          setActiveJobId(null);
          setEvaluating(false);
          setEvalDone(true);
          loadDashboard(); // Final results
          setTimeout(() => setEvalDone(false), 5000);
        } else if (status.status === 'failed') {
          stopPolling();
          localStorage.removeItem('docu_benchmark_job_id');
          setActiveJobId(null);
          setEvaluating(false);
          setRuntimeError(status.message);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all history?")) return;
    try {
      await clearHistory();
      localStorage.removeItem('docu_benchmark_job_id');
      window.location.reload();
    } catch (err) {
      setRuntimeError("Clear history failed");
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    setRuntimeError(null);
    setEvalDone(false);
    try {
      const { job_id } = await runEvaluation();
      setActiveJobId(job_id);
      localStorage.setItem('docu_benchmark_job_id', job_id);
      startPolling(job_id);
    } catch (err) {
      setRuntimeError("Failed to start benchmark: " + err.message);
      setEvaluating(false);
    }
  };

  const getDelta = (metric) => {
    if (!data?.baseline?.metrics || !data?.improved?.metrics) return 0;
    const diff = data.improved.metrics[metric] - data.baseline.metrics[metric];
    return parseFloat(diff.toFixed(2));
  };

  if (loading) return <div className="p-20 text-center animate-pulse tracking-widest uppercase text-xs font-bold">Initializing Dashboard...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Pipeline Metrics</h2>
          <p className="text-xs text-zinc-500 font-medium tracking-[0.2em] uppercase mt-1">Cross-Encoder Assessment</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className={`flex items-center gap-2 px-6 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full hover:bg-blue-600/20 transition-all font-bold text-[10px] uppercase tracking-widest ${evaluating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {evaluating ? <Loader2 size={12} className="animate-spin" /> : <Cpu size={12} />}
            {evaluating ? "Running Job..." : "Start Benchmark"}
          </button>
          <button onClick={handleClearHistory} className="text-red-400 bg-red-500/10 p-2 rounded-full border border-red-500/20 hover:bg-red-500/30 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <AnimatePresence>
        {evaluating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pb-8 overflow-hidden">
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Loader2 className="text-blue-400 animate-spin" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{jobStatus?.message || "Running Pipeline..."}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Job ID: {activeJobId?.substring(0,8)}... • Stage: {jobStatus?.stage}</p>
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-400">{jobStatus?.progress || 0}%</div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                   initial={{ width: 0 }}
                   animate={{ width: `${jobStatus?.progress || 0}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Faithfulness" value={data?.improved?.metrics?.faithfulness || 0} delta={getDelta('faithfulness')} icon={ShieldCheck} color="blue" />
        <MetricCard title="Answer Relevancy" value={data?.improved?.metrics?.answer_relevancy || 0} delta={getDelta('answer_relevancy')} icon={Target} color="purple" />
        <MetricCard title="Context Precision" value={data?.improved?.metrics?.context_precision || 0} delta={getDelta('context_precision')} icon={CheckCircle2} color="emerald" />
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Queries</div>
          <div className="text-2xl font-bold">{metrics?.total_queries || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Latency</div>
          <div className="text-2xl font-bold">{(metrics?.avg_latency || 0).toFixed(2)}s</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">p95 Latency</div>
          <div className="text-2xl font-bold">{(metrics?.p95_latency || 0).toFixed(2)}s</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Cost</div>
          <div className="text-2xl font-bold">${(metrics?.avg_cost || 0).toFixed(5)}</div>
        </div>
      </div>

      <LogsPanel logs={logs} loading={loading} />

      <AnimatePresence>
        {runtimeError && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] p-4 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center gap-4">
            <AlertCircle size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Error: {runtimeError}</span>
            <button onClick={() => setRuntimeError(null)} className="p-1 px-3 bg-white/20 rounded-full hover:bg-white/30">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EvaluationDashboard;
