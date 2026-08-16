import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentStrings, FaqItem } from '@/shared/types/types';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { Search, MessageSquare, ChevronDown, Zap, HelpCircle } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

const FAQItemComponent: React.FC<{ item: FaqItem, content: ContentStrings }> = ({ item, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = React.useId();
  const ariaProps = {
    "aria-expanded": isOpen,
    "aria-controls": `faq-${id}`
  };

  return (
    <motion.div
      initial={false}
      className={`group rounded-2xl border transition-all duration-500 overflow-hidden ${isOpen ? 'bg-white dark:bg-zinc-800/80 shadow-2xl border-gold-500/50' : 'bg-zinc-50 dark:bg-card border-zinc-100 dark:border-zinc-800 hover:border-gold-500/30'}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        {...ariaProps}
        id={`faq-btn-${id}`}
        className="w-full flex justify-between items-center p-3 cursor-pointer text-start select-none relative"
      >
        <span className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isOpen ? 360 : 0, scale: isOpen ? 1.1 : 1 }}
            className={`w-9 h-9 flex items-center justify-center rounded-lg shadow-lg transition-colors ${isOpen ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 group-hover:text-gold-500'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-black tracking-tight">
              <StyledBrandName text={item.question} />
            </h3>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 block opacity-60">
              {content.faqCategories[item.category] || item.category}
            </span>
          </div>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`p-1.5 rounded-lg ${isOpen ? 'bg-gold-500/10 text-gold-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`faq-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="px-5 pb-5 ps-16 text-zinc-600 dark:text-zinc-300 leading-relaxed text-base font-medium border-t border-zinc-100 dark:border-zinc-700/50 pt-3">
              <StyledBrandName text={item.answer} />

              <div className="mt-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-500 animate-pulse" />
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest">{content.expertProtocol || 'EXPERT PROTOCOL'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ: React.FC<{ content: ContentStrings }> = ({ content }) => {
  const { isRTL } = usePreferences();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const categories = Object.keys(content.faqCategories) as Array<keyof typeof content.faqCategories>;

  const filteredFaqs = content.faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'all' || faq.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="faq" className="py-32 bg-white dark:bg-background border-t border-zinc-200 dark:border-zinc-800 relative overflow-hidden">

      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30 -z-10">
        <div className="absolute top-0 start-0 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-float-slow [animation-delay:-4s]"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-gold-500/10 rounded-3xl mb-8 relative group"
          >
            <HelpCircle className="w-10 h-10 text-gold-500 animate-pulse" />
            <div className="absolute inset-0 bg-gold-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tight">
            {content.faqTitle}
          </h2>
          <p className="text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-bold italic animate-glow">{content.faqSubtitle}</p>
        </div>

        <div className="mb-16 space-y-10">
          {/* Enhanced Search */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-gold-500 via-emerald-500 to-gold-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-700 animate-pulse"></div>
            <div className="relative bg-white dark:bg-card rounded-[2rem] shadow-2xl border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden flex items-center p-2">
              <Search className="ms-6 w-8 h-8 text-zinc-300 group-focus-within:text-gold-500 transition-all group-hover:scale-110" />
              <input
                type="text"
                placeholder={content.faqSearchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none py-6 px-6 focus:ring-0 text-zinc-900 dark:text-white placeholder-zinc-400 text-2xl font-bold"
              />
            </div>
          </motion.div>

          {/* Enhanced Categories */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFilter('all')}
              className={`px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${filter === 'all' ? 'bg-gold-500 text-black shadow-gold-500/40 ring-4 ring-gold-500/20 animate-glow' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-2 border-transparent hover:border-gold-500/30 hover:text-gold-500'}`}
            >
              {content.allTopics || 'ALL TOPICS'}
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat as string}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFilter(cat as string)}
                className={`px-8 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all shadow-xl ${filter === cat ? 'bg-gold-500 text-black shadow-gold-500/40 ring-4 ring-gold-500/20 animate-glow' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-2 border-transparent hover:border-gold-500/30 hover:text-gold-500'}`}
              >
                {content.faqCategories[cat]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <motion.div
                  key={faq.question}
                  layout
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <FAQItemComponent item={faq} content={content} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 animate-glow"
              >
                <HelpCircle className="w-20 h-20 text-zinc-300 dark:text-zinc-700 mx-auto mb-6 animate-bounce" />
                <p className="text-zinc-400 text-2xl font-black uppercase tracking-tighter">{content.noFaqsFound || 'No encrypted answers found matching your search.'}</p>
                <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-8 text-gold-500 font-black underline underline-offset-8">{content.resetScan || 'RESET SCAN'}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
