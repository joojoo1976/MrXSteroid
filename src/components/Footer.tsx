import React, { useState, useEffect } from 'react';
import { ContentStrings } from '../types';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface FooterProps {
  content: ContentStrings;
  navigateTo: (page: any) => void;
  openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
  pool: string[];
  lang: string;
}

const WeeklyKeywords: React.FC<{ pool: string[] }> = ({ pool }) => {
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  useEffect(() => {
    const now = new Date(); const start = new Date(now.getFullYear(), 0, 0); const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000); const oneDay = 1000 * 60 * 60 * 24; const weekNumber = Math.floor(diff / oneDay / 7); const subsetSize = 100; const totalKeywords = pool.length; const startIndex = (weekNumber * subsetSize) % totalKeywords;
    let selected = pool.slice(startIndex, startIndex + subsetSize); if (selected.length < subsetSize) selected = [...selected, ...pool.slice(0, subsetSize - selected.length)];
    setCurrentKeywords(selected);
  }, [pool]);
  return <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800/50"><p className="text-[10px] leading-relaxed text-zinc-200 dark:text-zinc-800 text-justify opacity-20 select-none">{currentKeywords.join(' • ')}</p></div>;
};

const Footer: React.FC<FooterProps> = ({ content, navigateTo, openLegal, pool, lang }) => {
  return (
    <footer className="bg-zinc-950 text-white pt-20 pb-10 border-t border-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="text-3xl font-black mb-6 flex items-center gap-2">
              {lang === 'ar' ? (
                <span>مستر إكس-سترويد <span className="text-gold-500">Mr. X-Steroid</span></span>
              ) : lang === 'he' ? (
                <div className="font-permanent-marker flex items-center gap-1">
                  <span className="text-[#FACC15]">M</span>
                  <span className="text-[#22D3EE]">r</span>
                  <span className="text-[#1E3A8A] dark:text-[#FEF08A]">.</span>
                  <span className="text-[#1E3A8A] mx-1">X</span>
                  <span className="text-[#1E3A8A] dark:text-[#FEF08A]">-</span>
                  <span className="text-[#FACC15]">S</span>
                  <span className="text-[#4ADE80]">t</span>
                  <span className="text-[#EF4444]">e</span>
                  <span className="text-[#FACC15]">r</span>
                  <span className="text-[#3B82F6]">o</span>
                  <span className="text-[#22D3EE]">i</span>
                  <span className="text-[#EF4444]">d</span>
                </div>
              ) : (
                <div className="font-permanent-marker flex items-center gap-1">
                  <span className="text-[#FACC15]">M</span>
                  <span className="text-[#22D3EE]">r</span>
                  <span className="text-[#1E3A8A] dark:text-[#FEF08A]">.</span>
                  <span className="text-[#1E3A8A] mx-1">X</span>
                  <span className="text-[#1E3A8A] dark:text-[#FEF08A]">-</span>
                  <span className="text-[#FACC15]">S</span>
                  <span className="text-[#4ADE80]">t</span>
                  <span className="text-[#EF4444]">e</span>
                  <span className="text-[#FACC15]">r</span>
                  <span className="text-[#3B82F6]">o</span>
                  <span className="text-[#22D3EE]">i</span>
                  <span className="text-[#EF4444]">d</span>
                </div>
              )}
            </div>
            <p className="text-zinc-500 leading-relaxed max-w-md mb-8">{content.heroSubtitle.slice(0, 150)}...</p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/mrxsteroid/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white text-zinc-500 transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="https://x.com/Mr_X_Steroid" target="_blank" rel="noopener noreferrer" aria-label="Twitter (X)" title="Twitter (X)" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-black hover:border-white hover:text-white text-zinc-500 transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/prince_alex_ana/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 hover:text-white text-zinc-500 transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/in/prince-speaks-234849131/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-blue-700 hover:border-blue-700 hover:text-white text-zinc-500 transition-all"><Linkedin className="w-5 h-5" /></a>
              <a href="https://www.youtube.com/@IamPrince" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white text-zinc-500 transition-all"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white">{content.quickLinks}</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><button onClick={() => navigateTo('home')} className="hover:text-gold-500 transition-colors">{content.homeLink}</button></li>
              <li><button onClick={() => { navigateTo('home'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-gold-500 transition-colors">{content.pricingTitle}</button></li>
              <li><button onClick={() => { navigateTo('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-gold-500 transition-colors">{content.contact}</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white">{content.legal}</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><button onClick={() => openLegal('privacy')} className="hover:text-gold-500 transition-colors">{content.privacyPolicy}</button></li>
              <li><button onClick={() => openLegal('terms')} className="hover:text-gold-500 transition-colors">{content.termsOfService}</button></li>
              <li><button onClick={() => openLegal('refund')} className="hover:text-gold-500 transition-colors">{content.refundPolicy}</button></li>
              <li><button onClick={() => openLegal('disclaimer')} className="hover:text-gold-500 transition-colors">{content.legalDisclaimer}</button></li>
            </ul>
          </div>
        </div>
        <WeeklyKeywords pool={pool} />
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600"><p>{content.copyright}</p><div className="flex gap-4"><span>Secure Payment</span><span>SSL Encrypted</span></div></div>
      </div>
    </footer>
  );
};

export default Footer;
