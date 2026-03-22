import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  BookOpen,
  Copy,
  Check
} from 'lucide-react';

const CitationCard = ({ citation, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyContent = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(citation.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mb-4 overflow-hidden rounded-2xl border transition-all ${isOpen ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
            <BookOpen size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-blue-400">Source #{index + 1}</div>
            <div className="text-sm font-medium text-gray-300 truncate max-w-xs">{citation.source}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {citation.score && (
              <div className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                {(citation.score * 100).toFixed(0)}% MATCH
              </div>
          )}
          <div className="transform transition-transform duration-300" style={{ rotate: isOpen ? '180deg' : '0deg' }}>
             {isOpen ? <Minus size={18} /> : <Plus size={18} />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 pt-2"
          >
            <div className="p-4 bg-black rounded-xl border border-zinc-700 text-sm leading-relaxed text-gray-300 relative group">
              {citation.content}
              <div className="absolute top-2 right-2 flex gap-2">
                 <button 
                   onClick={copyContent}
                   className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded transition-all"
                   title="Copy snippet"
                 >
                   {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#a1a1aa" />}
                 </button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
               <div className="bg-blue-500/20 px-2 py-1 rounded">DOC_ID: {citation.doc_id.substring(0, 8)}...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CitationList = ({ citations }) => {
  if (!citations?.length) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-gray-500">Supporting Context</h3>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {citations.map((c, i) => (
          <CitationCard key={i} citation={c} index={i} />
        ))}
      </div>
    </div>
  );
};

export default CitationList;
