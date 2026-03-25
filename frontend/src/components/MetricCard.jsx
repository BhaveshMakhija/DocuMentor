import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';

const MetricCard = ({ title, value, delta, icon: Icon, color = "blue" }) => {
  const isPositive = delta > 0;
  const colorMap = {
    blue: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
    emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-2xl border bg-gradient-to-br ${colorMap[color]} backdrop-blur-xl group transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
          <Icon size={20} />
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <TrendingUp size={12} className={!isPositive ? 'rotate-180' : ''} />
            {isPositive ? '+' : ''}{delta}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-bold tracking-tight text-white group-hover:scale-105 origin-left transition-transform duration-300">
          {value}
        </div>
      </div>
      
      {/* Decorative gradient blur */}
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
    </motion.div>
  );
};

export default MetricCard;
