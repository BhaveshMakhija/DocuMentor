import React, { useState, useEffect } from 'react';
import { MessageSquare, Quote } from 'lucide-react';
import CitationBadge from './CitationBadge';

const AnswerDisplay = ({ answer, citations }) => {
  const [activeBadgeId, setActiveBadgeId] = useState(null);

  // Close tooltip when clicking elsewhere
  useEffect(() => {
    const handleGlobalClick = () => setActiveBadgeId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  if (!answer) return null;

  // Regex to find citation patterns like [id] or [id1, id2]
  const citationRegex = /\[([a-f0-9-]{36,}(?:\s*,\s*[a-f0-9-]{36,})*)\]/gi;

  const renderProcessedText = (text) => {
    // Map unique document IDs to numbers [1], [2] for the UI labels
    const uniqueDocIds = Array.from(new Set([...text.matchAll(citationRegex)].flatMap(m => m[1].split(',').map(id => id.trim()))));
    const docIdToNumMap = new Map(uniqueDocIds.map((id, index) => [id, index + 1]));

    const parts = text.split(citationRegex);
    let badgeCounter = 0;

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const ids = part.split(',').map(id => id.trim());
        return (
          <span key={index} className="inline-flex gap-1 items-center align-baseline -mt-1 mx-0.5">
            {ids.map(id => {
              const currentBadgeId = `badge-${badgeCounter++}`;
              return (
                <CitationBadge 
                  key={currentBadgeId} 
                  badgeId={currentBadgeId}
                  docId={id} 
                  label={docIdToNumMap.get(id)}
                  citations={citations} 
                  activeBadgeId={activeBadgeId}
                  setActiveBadgeId={setActiveBadgeId}
                />
              );
            })}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="mt-12 overflow-visible relative z-30">
      <div className="absolute top-0 left-0 h-full bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ width: '4px' }} />
      
      <div className="px-10 py-12 bg-black border border-white/10 rounded-3xl relative overflow-visible shadow-2xl z-30">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                 <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">AI Intelligence</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Verified Response</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">Confidence: High</div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-200 leading-relaxed text-lg font-medium selection:bg-blue-500/30">
          {renderProcessedText(answer)}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">Sources: {citations?.length || 0}</div>
            </div>
            <div className="text-[10px] text-zinc-500 italic flex items-center gap-2">
               <Quote size={12} className="opacity-30" />
               Hover over numbers for source verification.
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerDisplay;
