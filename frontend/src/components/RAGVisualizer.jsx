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
    <div className="w-full py-12 px-8 glow-card mt-8">
      <div className="flex items-center justify-between relative">
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

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isActive ? step.color : '#1a1a1a',
                  borderColor: isActive ? step.color : '#333',
                  boxShadow: isCurrent ? `0 0 20px ${step.color}` : 'none'
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-colors duration-500`}
              >
                <Icon size={24} color={isActive ? '#fff' : '#666'} />
              </motion.div>
              
              <motion.div 
                animate={{ opacity: isActive ? 1 : 0.4 }}
                className="mt-4 text-sm font-medium whitespace-nowrap"
                style={{ color: isActive ? '#fff' : '#666' }}
              >
                {step.label}
              </motion.div>

              <AnimatePresence>
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-16 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs backdrop-blur-md"
                  >
                    {step.id === 'hybrid' && stats?.hybrid_counts && (
                       <span className="text-blue-400">
                         {stats.hybrid_counts.bm25} BM25 + {stats.hybrid_counts.vector} Vector docs
                       </span>
                    )}
                    {step.id === 'rerank' && (
                       <span className="text-emerald-400">Scoring Relevancy...</span>
                    )}
                    {step.id === 'llm' && (
                       <span className="text-amber-400">Llama-3 Generating...</span>
                    )}
                    {step.id === 'query' && (
                       <span className="text-blue-200">Analyzing Intent...</span>
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
          <div className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-semibold flex items-center gap-2">
            <Layers size={14} /> Reranking Insights (Top Relevancy)
          </div>
          <div className="grid grid-cols-5 gap-4">
            {stats.rerank_stats.map((doc, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div className="text-xs text-gray-400 mb-1">Rank #{doc.rank}</div>
                <div className="flex items-end gap-1">
                  <div className="text-xl font-bold text-emerald-400">{(doc.score * 100).toFixed(0)}%</div>
                  <div className="text-[10px] text-gray-600 mb-1">relevancy</div>
                </div>
                <motion.div 
                  className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden"
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
