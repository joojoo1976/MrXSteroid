import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ContentStrings, LabTest } from '../types';

interface SmartLabReferenceProps {
  content: ContentStrings;
  isRTL?: boolean;
}

const SmartLabReference: React.FC<SmartLabReferenceProps> = ({ content, isRTL }) => {
  const [search, setSearch] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [value, setValue] = useState('');

  const filtered = content.labReference.tests.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()));

  const getAnalysis = (test: LabTest) => {
    const val = parseFloat(value);
    if (isNaN(val)) return null;
    if (val < test.min) return { text: content.labReference.status.low, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (val > test.max) return { text: content.labReference.status.high, color: 'text-red-500', bg: 'bg-red-500/10' };
    return { text: content.labReference.status.normal, color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10"><h1 className="text-3xl font-bold mb-2">{content.labReference.title}</h1><p className="text-zinc-500">{content.labReference.subtitle}</p></div>
      <div className="relative mb-8">
        <Search className={`absolute top-1/2 ${isRTL ? 'right-4' : 'left-4'} -translate-y-1/2 w-5 h-5 text-zinc-400`} />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setAnalyzingId(null); }}
          placeholder={content.labReference.searchPlaceholder}
          className={`w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} shadow-sm focus:border-gold-500 outline-none`}
        />
      </div>
      <div className="grid gap-4">
        {filtered.map(test => {
          const analysis = analyzingId === test.id ? getAnalysis(test) : null;
          return (
            <div key={test.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-lg">{test.name}</h3><span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 uppercase">{test.category}</span></div><div className="text-right"><div className="font-mono font-bold text-gold-600 dark:text-gold-500">{test.range}</div><div className="text-xs text-zinc-400">{test.unit}</div></div></div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">{test.description}</p>

              {analyzingId === test.id ? (
                <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold">{content.labReference.analyzeTitle}</span>
                    <button onClick={() => setAnalyzingId(null)} className="text-xs text-zinc-400 hover:text-zinc-600 underline">{content.labReference.labels.cancel}</button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={content.labReference.enterValue}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500"
                    />
                  </div>
                  {analysis && (
                    <div className={`mt-3 p-3 rounded-lg ${analysis.bg} ${analysis.color} text-sm font-bold flex items-center justify-center animate-bounce-subtle`}>
                      {analysis.text}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { setAnalyzingId(test.id); setValue(''); }}
                  className="mt-2 text-xs font-bold text-gold-600 dark:text-gold-500 hover:underline uppercase tracking-wider"
                >
                  {content.labReference.analyzeBtn}
                </button>
              )}

              <div className="grid md:grid-cols-2 gap-4 text-sm bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl mt-6"><div><strong className="text-red-500 block mb-1">{content.labReference.labels.high}:</strong> {test.elevationMeaning}</div><div><strong className="text-blue-500 block mb-1">{content.labReference.labels.low}:</strong> {test.lowMeaning}</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartLabReference;
