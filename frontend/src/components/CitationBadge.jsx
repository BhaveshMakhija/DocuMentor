import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ExternalLink, Quote, Sparkles } from 'lucide-react';

const CitationBadge = ({ 
  docId, 
  badgeId, 
  label, 
  citations, 
  activeBadgeId, 
  setActiveBadgeId 
}) => {
  const [position, setPosition] = useState('bottom');
  const tooltipRef = useRef(null);
  const badgeRef = useRef(null);
  const citation = citations?.find(c => c.doc_id === docId);
  const isOpen = activeBadgeId === badgeId;

  // Safe flip logic based on the stationary badge position, avoiding infinite loops
  React.useLayoutEffect(() => {
    if (isOpen && badgeRef.current) {
      const badgeRect = badgeRef.current.getBoundingClientRect();
      // If the badge is within 400px of the top viewport edge (near the navbar),
      // render the tooltip pointing downwards so it never slides under the blurry navbar.
      if (badgeRect.top < 400) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleInteraction = (e) => {
    e.stopPropagation();
    setActiveBadgeId(badgeId);
  };

  // Even if metadata is missing, we show a "Reference" badge to maintain visual consistency
  const displayLabel = label || "?";
  const displaySource = citation?.source || "Source details unavailable";
  const displayContent = citation?.content || "Specific snippet could not be retrieved from the indexing layer.";

  return (
    <span 
      ref={badgeRef}
      className="relative inline-block align-top group mx-0.5"
      onMouseEnter={handleInteraction}
      onMouseLeave={() => setActiveBadgeId(null)}
      onClick={handleInteraction}
    >
      {/* Visual area bridge */}
      <div className={`absolute ${position === 'bottom' ? 'bottom-full' : 'top-full'} left-0 w-full h-4 bg-transparent`} />

      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className={`px-2 h-[18px] min-w-[18px] rounded-md border font-bold text-[10px] transition-all cursor-help -translate-y-1 flex items-center justify-center ${
          isOpen 
            ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30 z-[101]' 
            : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-blue-500 hover:border-blue-400 hover:text-white hover:shadow-lg hover:shadow-blue-500/20'
        }`}
      >
        {displayLabel}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? 5 : -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{ 
               zIndex: 2147483647
            }}
            className={`absolute ${position === 'bottom' ? 'bottom-full mb-3' : 'top-full mt-3'} left-1/2 -translate-x-1/2 w-[350px] bg-zinc-800 border-2 border-zinc-600 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,1)] p-5 text-left pointer-events-auto`}
          >
            <div className={`absolute ${position === 'bottom' ? 'top-0' : 'bottom-0'} left-0 w-full h-[6px] !bg-blue-600 rounded-full`} />
            
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0 shadow-inner"
              >
                <FileText size={20} />
              </div>
              <div className="min-w-0 pr-2">
                <div className="text-[12px] font-extrabold text-white truncate mb-0.5 uppercase tracking-tight">
                  {displaySource}
                </div>
                <div className="flex items-center gap-2">
                   <div 
                     style={{ backgroundColor: '#1a1a1a', opacity: 1 }}
                     className="text-[9px] text-blue-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-zinc-800 flex items-center gap-1"
                   >
                      <Sparkles size={8} /> Evidence Source
                   </div>
                </div>
              </div>
            </div>
            
            <div 
              className="relative p-4 rounded-xl bg-zinc-900 border border-zinc-700 max-h-[160px] overflow-y-auto custom-scrollbar group/text shadow-inner mt-4"
            >
               <Quote className="absolute -top-1 -right-1 text-white/5 opacity-5" size={40} />
               <p className="text-[11px] font-medium text-white leading-relaxed relative z-10 whitespace-pre-wrap italic">
                 "{displayContent}"
               </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
               <div 
                 className="text-[8px] font-mono text-zinc-400 px-3 py-1.5 rounded bg-zinc-900 truncate flex-1 tracking-tighter border border-zinc-700 uppercase"
                >
                  Registry: {docId.substring(0,16)}
               </div>
               {citation && (
                 <button 
                    onClick={() => {
                      // Open document
                      const baseUrl = window.location.origin.includes('3000') ? 'http://localhost:8000' : window.location.origin;
                      window.open(`${baseUrl}/api/documents/serve/${encodeURIComponent(citation.source)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-xl transition-all shadow-xl active:scale-95"
                 >
                   View <ExternalLink size={12} />
                 </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default CitationBadge;
