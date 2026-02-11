import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings, Page } from '../../types';
import { Facebook, Twitter, Instagram, Youtube, Zap, ShieldCheck } from 'lucide-react';
import BrandLogo from '../shared/BrandLogo';
import DynamicBrandLogo from './DynamicBrandLogo';

import { usePreferences } from '../../context/PreferencesContext';

interface FooterProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
  openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
  pool: string[];
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
      <p className="text-xs leading-relaxed text-zinc-800 text-justify opacity-20 select-none font-mono tracking-tighter uppercase italic">
        {currentKeywords.join(' • ')}
      </p>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ content, navigateTo, pool }) => {
  const { isRTL } = usePreferences();

  return (
    <footer className={`bg-black text-white pt-32 pb-16 border-t-8 border-gold-500/20 relative overflow-hidden ${isRTL ? 'font-cairo' : ''}`}>

      {/* Background Kinetic Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      <div className="absolute bottom-0 end-0 w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full animate-float-slow -z-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 mb-24">

          {/* Branding & Mission */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <BrandLogo className="text-4xl" isLink={true} variant="short" />
            </motion.div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: Facebook, href: "https://www.facebook.com/mrxsteroid/" },
                { icon: Twitter, href: "https://x.com/Mr_X_Steroid" },
                { icon: Instagram, href: "https://www.instagram.com/prince_alex_ana/" },
                { icon: Youtube, href: "https://www.youtube.com/@IamPrince" }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -5, scale: 1.1 }}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-gold-500 transition-all shrink-0"
                  aria-label={`Visit our ${social.icon.name}`}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* General Menu */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-black mb-8 text-gold-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-4 h-0.5 bg-gold-500"></span>
              {content.generalLinks}
            </h4>
            <ul className="space-y-4">
              {[
                { label: content.homeLink, action: () => navigateTo(Page.HOME) },
                { label: content.nav?.about || "About Us", action: () => navigateTo(Page.ABOUT) },
                { label: content.pricingTitle || "Choose Your Plan", action: () => { navigateTo(Page.HOME); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { label: content.blogTitle, action: () => navigateTo(Page.BLOG) },
                { label: content.careersTitle, action: () => navigateTo(Page.CAREERS) },
                { label: content.nav?.sitemap || "Sitemap", action: () => navigateTo(Page.SITEMAP) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Commercial */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-black mb-8 text-gold-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-4 h-0.5 bg-gold-500"></span>
              {content.commercialLinks}
            </h4>
            <ul className="space-y-4">
              {[
                { label: content.nav?.signup || "Cart / Checkout", action: () => navigateTo(Page.CHECKOUT) },
                { label: content.shippingPolicyTitle, action: () => navigateTo(Page.SHIPPING_POLICY) },
                { label: content.returnPolicyTitle, action: () => navigateTo(Page.RETURN_POLICY) },
                { label: content.refundTitle, action: () => navigateTo(Page.REFUND) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* International Legal */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-black mb-8 text-gold-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-4 h-0.5 bg-gold-500"></span>
              {content.internationalLegalLinks}
            </h4>
            <ul className="space-y-4">
              {[
                { label: content.privacyTitle || content.privacyPolicy, action: () => navigateTo(Page.PRIVACY) },
                { label: content.termsTitle || content.termsOfService, action: () => navigateTo(Page.TERMS) },
                { label: content.cookiePolicyTitle, action: () => navigateTo(Page.COOKIE_POLICY) },
                { label: content.legalDisclaimerTitle || content.legalDisclaimer, action: () => navigateTo(Page.LEGAL_DISCLAIMER_PAGE) },
                { label: content.medicalDisclaimerPage.title, action: () => navigateTo(Page.MEDICAL_DISCLAIMER) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Compliance */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-black mb-8 text-gold-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-4 h-0.5 bg-gold-500"></span>
              {content.supportLinks}
            </h4>
            <ul className="space-y-4 mb-8">
              {[
                { label: content.contactPageTitle || content.contact, action: () => navigateTo(Page.CONTACT) },
                { label: content.supportTitle, action: () => navigateTo(Page.SUPPORT) },
                { label: content.faqPageTitle, action: () => navigateTo(Page.FAQ) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-black mb-4 text-zinc-600 uppercase tracking-[0.3em]">{content.complianceLinks}</h4>
            <ul className="space-y-2">
              {[
                { label: content.accessibilityTitle, action: () => navigateTo(Page.ACCESSIBILITY) },
                { label: content.gdprTitle, action: () => navigateTo(Page.GDPR) },
                { label: content.ccpaTitle, action: () => navigateTo(Page.CCPA) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-700 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <WeeklyKeywords pool={pool} />

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xs font-black tracking-[0.3em] text-zinc-700 text-center md:text-start">
            {content.copyright} • <span className="text-gold-500/20"><DynamicBrandLogo inline variant="full" /> "George Mourice"</span>
          </div>
          <div className="flex gap-10">
            <div className="flex items-center gap-3 opacity-30">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest text-white">SSL: 4096-BIT</span>
            </div>
            <div className="flex items-center gap-3 opacity-30">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest text-white">SECURE GATEWAY</span>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
