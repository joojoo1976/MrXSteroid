import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings, Page } from '../types';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Zap, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
  openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
  pool: string[];
  lang: string;
}

const WeeklyKeywords: React.FC<{ pool: string[] }> = ({ pool }) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const weekNumber = Math.floor(diff / oneDay / 7);
  const subsetSize = 100;
  const totalKeywords = pool.length;
  const startIndex = (weekNumber * subsetSize) % totalKeywords;
  let currentKeywords = pool.slice(startIndex, startIndex + subsetSize);
  if (currentKeywords.length < subsetSize) currentKeywords = [...currentKeywords, ...pool.slice(0, subsetSize - currentKeywords.length)];

  return (
    <div className="mt-16 pt-10 border-t border-white/5">
      <p className="text-[10px] leading-relaxed text-zinc-800 text-justify opacity-20 select-none font-mono tracking-tighter uppercase italic">
        {currentKeywords.join(' • ')}
      </p>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ content, navigateTo, openLegal, pool, lang }) => {
  const isRTL = lang === 'ar' || lang === 'he';

  return (
    <footer className={`bg-black text-white pt-32 pb-16 border-t-8 border-gold-500/20 relative overflow-hidden ${isRTL ? 'font-cairo' : ''}`}>

      {/* Background Kinetic Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      <div className="absolute bottom-0 end-0 w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full animate-float-slow -z-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 mb-24">

          {/* Branding & Mission */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-black mb-10 flex items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center text-black shadow-2xl animate-glow"
              >
                <Zap className="w-8 h-8" />
              </motion.div>
              {lang === 'ar' ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gold-500 italic">مستر إكس-سترويد</span>
              ) : (
                <span className="font-permanent-marker text-5xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-gold-500 via-white to-gold-500 animate-text-flash">MR. X-STEROID</span>
              )}
            </motion.div>

            <p className="text-xl text-zinc-500 leading-relaxed max-w-xl mb-12 font-bold italic animate-glow">
              {content.heroSubtitle.slice(0, 180)}...
            </p>

            <div className="flex flex-wrap gap-6">
              {[
                { icon: Facebook, href: "https://www.facebook.com/mrxsteroid/", color: "hover:bg-blue-600" },
                { icon: Twitter, href: "https://x.com/Mr_X_Steroid", color: "hover:bg-zinc-800" },
                { icon: Instagram, href: "https://www.instagram.com/prince_alex_ana/", color: "hover:bg-pink-600" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/prince-speaks-234849131/", color: "hover:bg-blue-700" },
                { icon: Youtube, href: "https://www.youtube.com/@IamPrince", color: "hover:bg-red-600" }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -10, scale: 1.1 }}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-14 h-14 rounded-[1.2rem] bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-zinc-400 transition-all shadow-2xl ${social.color} hover:text-white hover:border-transparent group`}
                >
                  <social.icon className="w-6 h-6 group-hover:scale-125 transition-transform" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black mb-10 text-gold-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-8 h-0.5 bg-gold-500"></span>
              {content.quickLinks}
            </h4>
            <ul className="space-y-6 text-xl font-black">
              {[
                { label: content.homeLink, action: () => navigateTo(Page.HOME) },
                { label: content.pricingTitle, action: () => { navigateTo(Page.HOME); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { label: content.contact, action: () => { navigateTo(Page.HOME); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); } }
              ].map((link, idx) => (
                <motion.li key={idx} whileHover={{ x: isRTL ? -10 : 10 }}>
                  <button onClick={link.action} className="text-zinc-500 hover:text-gold-500 transition-colors uppercase tracking-tight">
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal Protocol */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-black mb-10 text-gold-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-8 h-0.5 bg-gold-500"></span>
              {content.legal}
            </h4>
            <ul className="space-y-4">
              {[
                { label: content.privacyPolicy, key: 'privacy' },
                { label: content.termsOfService, key: 'terms' },
                { label: content.refundPolicy, key: 'refund' },
                { label: content.legalDisclaimer, key: 'disclaimer' }
              ].map((link, idx) => (
                <motion.li key={idx} whileHover={{ opacity: 1, scale: 1.05 }} className="opacity-60 hover:opacity-100 transition-all">
                  <button onClick={() => openLegal(link.key as 'privacy' | 'terms' | 'refund' | 'disclaimer')} className="text-zinc-400 hover:text-white font-bold text-sm uppercase tracking-widest block text-start w-full">
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <div className="mt-12 p-6 bg-white/5 rounded-[2rem] border-2 border-white/5 backdrop-blur-3xl animate-glow">
              <div className="flex items-center gap-4 mb-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Status: Protected</span>
              </div>
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Biometric Integrity: Verified</span>
              </div>
            </div>
          </div>
        </div>

        <WeeklyKeywords pool={pool} />

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 text-center md:text-start">
            {content.copyright} • <span className="text-gold-500/20">Design by Antigravity OS</span>
          </p>
          <div className="flex gap-10">
            <div className="flex items-center gap-3 opacity-30">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">SSL: 4096-BIT</span>
            </div>
            <div className="flex items-center gap-3 opacity-30">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">SECURE GATEWAY</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
