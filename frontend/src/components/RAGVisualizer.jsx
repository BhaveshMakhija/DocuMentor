import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Cpu, 
  MessageSquare, 
  Database
} from 'lucide-react';

const steps = [
  { id: 'query', label: 'Processing Query', icon: MessageSquare, color: '#3b82f6' },
  { id: 'hybrid', label: 'Hybrid Retrieval (BM25 + Vector)', icon: Database, color: '#8b5cf6' },
  { id: 'rerank', label: 'Cross-Encoder Reranking', icon: Layers, color: '#10b981' },
  { id: 'llm', label: 'Answer Generation', icon: Cpu, color: '#f59e0b' }
];

const RAGVisualizer = ({ currentStep, stats }) => {
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-20 px-8 glow-card mt-8 relative overflow-visible">
      <div className="flex items-center justify-between relative h-20">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full overflow-hidden">
           <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
           />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIdx;
          const isCurrent = index === currentIdx;

          // Edge Case detection for tooltips
          const isFirstStep = index === 0;
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.25 : 1,
                  backgroundColor: isActive ? step.color : '#1a1a1a',
                  borderColor: isActive ? step.color : '#333',
                  boxShadow: isCurrent ? `0 0 30px ${step.color}44` : 'none'
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 relative`}
              >
                <Icon size={24} color={isActive ? '#fff' : '#666'} />
              </motion.div>
              
              <motion.div 
                animate={{ opacity: isActive ? 1 : 0.4 }}
                className="mt-4 text-[10px] md:text-xs font-bold text-center w-24 md:w-32 uppercase tracking-wide leading-tight"
                style={{ color: isActive ? '#fff' : '#666' }}
              >
                {step.label}
              </motion.div>

              <AnimatePresence mode='wait'>
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    key={step.id}
                    className={`absolute -top-14 ${isFirstStep ? 'left-0' : isLastStep ? 'right-0' : 'left-1/2 -translate-x-1/2'} min-w-max bg-zinc-950 border border-white/10 px-4 py-2 rounded-xl text-[10px] md:text-xs backdrop-blur-3xl z-[100] text-center shadow-2xl flex items-center gap-2 whitespace-nowrap`}
                  >
                    <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: step.color, color: step.color }} />
                    {step.id === 'hybrid' && stats?.hybrid_counts && (
                       <span className="text-white">
                         Found <span className="text-blue-400 font-bold">{stats.hybrid_counts.bm25}</span> BM25 + <span className="text-purple-400 font-bold">{stats.hybrid_counts.vector}</span> Vector docs
                       </span>
                    )}
                    {step.id === 'rerank' && (
                       <span className="text-emerald-400 font-bold tracking-tight">Optimizing Relevancy Scores...</span>
                    )}
                    {step.id === 'llm' && (
                       <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">Llama-3</span>
                          <span className="text-white/60">Finalizing Response...</span>
                       </div>
                    )}
                    {step.id === 'query' && (
                       <span className="text-blue-100 font-bold">Decoding Intelligence...</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {stats?.rerank_stats?.length > 0 && currentStep === 'llm' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-16 pt-8 border-t border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Cross-Encoder Optimization</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Reranking Insight</p>
              </div>
            </div>
            <div className="max-w-xs text-right group relative">
               <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                 Percentages represent the <span className="text-emerald-400 font-bold">Semantic Relevancy Score</span> calculated by a Cross-Encoder model. 
               </p>
               <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-2xl z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 text-left">
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                    Unlike standard vector search, the Reranker analyzes the query and document together to provide a precise relevancy percentage, ensuring only the most helpful context reaches the LLM.
                  </p>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.rerank_stats.map((doc, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0.9, opacity: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111111] p-4 rounded-2xl border border-[#222222] hover:bg-[#1a1a1a] transition-all"
              >
                <div className="text-[10px] uppercase font-bold text-zinc-600 mb-1 tracking-tighter">Rank #{doc.rank}</div>
                <div className="flex items-end gap-1">
                  <div className="text-2xl font-black text-emerald-400">{(doc.score * 100).toFixed(0)}<span className="text-xs">%</span></div>
                </div>
                <motion.div 
                  className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden"
                >
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${doc.score * 100}%` }}
                     className="h-full bg-emerald-500"
                     transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RAGVisualizer;
