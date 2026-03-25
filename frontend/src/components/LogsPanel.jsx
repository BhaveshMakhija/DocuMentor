import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Clock, 
  MessageSquare, 
  Terminal, 
  ExternalLink, 
  Activity,
  Layers,
  Cpu,
  Database,
  Search
} from 'lucide-react';

const TraceStep = ({ icon: Icon, label, detail, color, isLast }) => (
  <div className="flex gap-4 group">
    <div className="flex flex-col items-center">
      <div 
        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg`}
        style={{ 
          backgroundColor: `${color}11`, 
          borderColor: `${color}33`,
          color: color,
          boxShadow: `0 0 20px ${color}11`
        }}
      >
        <Icon size={18} />
      </div>
      {!isLast && <div className="w-0.5 h-12 bg-gradient-to-b from-white/10 to-transparent my-2" />}
    </div>
    <div className="pt-1">
      <div className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
        {label}
        {detail && <span className="text-[9px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full lowercase font-mono">{detail}</span>}
      </div>
      <div className="text-[10px] text-zinc-500 mt-1 max-w-sm leading-relaxed transition-colors group-hover:text-zinc-400">
        System trace successfully completed for this module within the pipeline.
      </div>
    </div>
  </div>
);

const LogEntryCard = ({ log }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout 
      className={`border rounded-3xl transition-all mb-4 overflow-hidden ${
        isOpen 
          ? 'bg-zinc-900 border-blue-500/30 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.2)]' 
          : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
      }`}
    >
      <div 
        className="px-8 py-6 flex items-center justify-between cursor-pointer group" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-6 flex-1">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
            isOpen 
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-blue-500/10 border-blue-500/10 text-blue-400 group-hover:scale-110'
          }`}>
            <Activity size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-200 truncate group-hover:text-white transition-colors">
              {log.query}
            </h4>
            <div className="flex items-center gap-6 mt-1.5">
               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Clock size={12} className="text-blue-500/60" /> 
                  <span className="text-zinc-300">{log.latency_ms}ms</span>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Terminal size={12} className="text-purple-500/60" /> 
                  <span className="text-zinc-300">{log.timestamp?.split('T')[1]?.substring(0, 5)}</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className={`p-3 rounded-xl transition-all duration-500 border ${
          isOpen ? 'bg-blue-500/10 border-blue-500/20 rotate-180 text-blue-400' : 'bg-white/5 border-white/5 text-zinc-500'
        }`}>
          <ChevronDown size={16} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-4 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Pipeline Trace Visualizer */}
              <div className="lg:col-span-5 border-r border-white/5 pr-4">
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8">Pipeline Trace</h5>
                <div className="space-y-1">
                  <TraceStep icon={Search} label="Query Understanding" detail="Semantic Analysis" color="#3b82f6" />
                  <TraceStep icon={Database} label="Hybrid Retrieval" detail={`${log.retrieved_docs?.length || 0} Chunks Found`} color="#8b5cf6" />
                  <TraceStep icon={Layers} label="Cross-Encoder Rerank" detail="top_k precision" color="#10b981" />
                  <TraceStep icon={Cpu} label="Answer Generation" color="#f59e0b" isLast />
                </div>
              </div>

              {/* Data Insights */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Context Injected into Prompt</h5>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                    {log.retrieved_docs?.map((doc, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] leading-relaxed text-zinc-400 hover:border-white/10 transition-colors">
                        <div className="text-[9px] font-bold text-zinc-600 mb-2 uppercase tracking-widest">CHUNK SOURCE #{idx + 1}</div>
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Final System Response</h5>
                  <div className="p-5 rounded-2xl bg-blue-500/[0.05] border border-blue-500/20 text-sm leading-relaxed text-zinc-100 shadow-inner">
                    {log.answer}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LogsPanel = ({ logs, loading }) => {
  return (
    <div className="mt-24 text-left">
      <div className="flex items-center justify-between mb-10 px-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
             Observability <span className="text-blue-500">Center</span>
          </h2>
          <p className="text-sm text-zinc-500 font-medium">Investigate exactly how the AI retrieves and processes information.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Total Traces: {logs?.length || 0}</div>
           <button className="flex items-center gap-2 text-[10px] font-bold text-blue-500 px-5 py-2.5 rounded-xl border border-blue-500/20 hover:bg-blue-500/10 transition-all uppercase tracking-widest">
            Export <ExternalLink size={14} />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, idx) => (
            <LogEntryCard key={idx} log={log} />
          ))}
        </div>
      ) : (
        <div className="p-20 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
           <div className="w-16 h-16 rounded-full bg-zinc-800/1) flex items-center justify-center text-zinc-600 mx-auto mb-6">
              <Terminal size={32} />
           </div>
           <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-[0.3em]">Neural Engine Waiting...</h3>
        </div>
      )}
    </div>
  );
};

export default LogsPanel;
