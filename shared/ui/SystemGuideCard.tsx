import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export interface SystemGuideItem {
  icon: React.ElementType;
  title: { ar: string; en: string };
  body: { ar: string; en: string };
}

export interface SystemGuideCardProps {
  isAr: boolean;
  icon: React.ElementType;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  intro: { ar: string; en: string };
  items: SystemGuideItem[];
  className?: string;
}

/**
 * Reusable "System Guide & Benefits" explanation card used across calculator pages.
 * Matches the BodyFatCalculator's multi-dimensional analysis banner styling
 * (glassmorphism card, collapsible toggle, animated feature grid).
 */
const SystemGuideCard: React.FC<SystemGuideCardProps> = ({
  isAr,
  icon: Icon,
  title,
  subtitle,
  intro,
  items,
  className = '',
}) => {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-4xl mx-auto bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-900/90 border border-gold-500/30 rounded-3xl p-6 shadow-2xl text-start relative overflow-hidden backdrop-blur-2xl ${className}`}
    >
      <div className="absolute top-0 end-0 w-48 h-48 bg-gold-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap relative">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-400 shrink-0">
            <Icon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
              <span>{isAr ? title.ar : title.en}</span>
            </h2>
            <p className="text-xs text-gold-400/90 font-bold">
              {isAr ? subtitle.ar : subtitle.en}
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 text-xs font-black rounded-xl transition-all flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span>
            {open
              ? isAr ? 'إخفاء الشرح' : 'Hide Details'
              : isAr ? 'شرح المنظومة وفائدتها' : 'System Guide & Benefits'}
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 text-xs leading-relaxed text-zinc-300 border-t border-zinc-800/80 pt-4 mt-2 overflow-hidden"
          >
            <p className="font-medium text-zinc-300">{isAr ? intro.ar : intro.en}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * idx, type: 'spring', stiffness: 120 }}
                  whileHover={{ y: -2, borderColor: 'rgba(234,179,8,0.4)' }}
                  className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1"
                >
                  <div className="flex items-center gap-2 text-gold-400 font-black">
                    <item.icon className="w-4 h-4" />
                    <span>{isAr ? item.title.ar : item.title.en}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">{isAr ? item.body.ar : item.body.en}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SystemGuideCard;
