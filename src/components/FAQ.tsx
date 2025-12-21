import React, { useState, useMemo } from 'react';
import { ContentStrings, FaqItem } from '../types';
import { Search, MessageSquare, ChevronDown } from 'lucide-react';

const FAQItemComponent: React.FC<{ item: FaqItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  return (
    <div className={`group bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white dark:bg-zinc-800/50 shadow-lg border-gold-500/30' : 'hover:border-gold-500/30'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        aria-expanded={isOpen}
        aria-controls={`faq-${id}`}
        className="w-full flex justify-between items-start p-6 cursor-pointer list-none font-bold text-lg select-none text-left"
      >
        <span className="flex items-start gap-4">
          <div className={`mt-1 p-2 rounded-lg transition-colors ${isOpen ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 group-hover:text-gold-500'}`}>
             <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 pt-1">
             <span className={`block transition-colors ${isOpen ? 'text-gold-600 dark:text-gold-500' : 'text-zinc-700 dark:text-zinc-200'}`}>
                {item.question}
             </span>
             <span className="text-[10px] text-zinc-400 font-normal uppercase tracking-wider mt-1 block">{item.category}</span>
          </div>
        </span>
        <div className={`mt-1 p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-gold-500/20 rotate-180' : ''}`}>
           <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-gold-500' : 'text-zinc-400'}`} />
        </div>
      </button>
      <div 
        id={`faq-${id}`}
        role="region"
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
           <div className="px-6 pb-6 pl-[4.5rem] text-zinc-600 dark:text-zinc-300 leading-relaxed text-base">
             {item.answer}
           </div>
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC<{ content: ContentStrings }> = ({ content }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const categories = Object.keys(content.faqCategories) as Array<keyof typeof content.faqCategories>;
  const filteredFaqs = content.faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'all' || faq.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="faq" className="py-20 bg-white dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4">{content.faqTitle}</h2><p className="text-zinc-500 max-w-2xl mx-auto">{content.faqSubtitle}</p></div>
        <div className="mb-10 space-y-6">
          <div className="relative max-w-xl mx-auto"><Search className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-zinc-400" /><input type="text" placeholder={content.faqSearchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-12 pr-4 focus:border-gold-500 focus:outline-none transition-colors" /></div>
          <div className="flex flex-wrap justify-center gap-2">{categories.map(cat => (<button key={cat as string} onClick={() => setFilter(cat as string)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === cat ? 'bg-gold-500 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{content.faqCategories[cat]}</button>))}</div>
        </div>
        <div className="space-y-4">{filteredFaqs.length > 0 ? (filteredFaqs.map((faq, idx) => (<FAQItemComponent key={idx} item={faq} />))) : (<div className="text-center py-10 text-zinc-400"><p>No questions found matching your criteria.</p></div>)}</div>
      </div>
    </section>
  );
};

export default FAQ;
