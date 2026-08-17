import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings, Page } from '@/shared/types/types';
import {
  Facebook, Twitter, Instagram, Youtube, Zap, ShieldCheck,
  CreditCard, Smartphone, Store, Shield, Lock, QrCode, Globe, CheckCircle2
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import DynamicBrandLogo from './DynamicBrandLogo';

import { usePreferences } from '../../context/PreferencesContext';

interface FooterProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
  openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
  pool: string[];
}

const PAYMENT_METHODS_DATA = [
  {
    categoryAr: 'داخل مصر (EGP)',
    categoryEn: 'Egypt (EGP)',
    methods: [
      { nameAr: 'إنستاباي (InstaPay IPN)', nameEn: 'InstaPay IPN', badge: 'لحظي ⚡', icon: QrCode, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
      { nameAr: 'فودافون كاش & محافظ المحمول', nameEn: 'Vodafone Cash & Wallets', badge: 'فوري', icon: Smartphone, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
      { nameAr: 'فيزا & ماستركارد & ميزة', nameEn: 'Visa / MC / Meeza', badge: 'بنكي', icon: CreditCard, color: 'text-gold-400 border-gold-500/30 bg-gold-500/10' },
      { nameAr: 'أمان & مصاري (Accept Kiosk)', nameEn: 'Aman & Masary Kiosks', badge: 'نقدي', icon: Store, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }
    ]
  },
  {
    categoryAr: 'دولياً (USD / Global)',
    categoryEn: 'International (USD)',
    methods: [
      { nameAr: 'Stripe (Apple Pay & Cards)', nameEn: 'Stripe & Apple Pay', badge: '256-bit', icon: ShieldCheck, color: 'text-[#635bff] border-[#635bff]/30 bg-[#635bff]/10' },
      { nameAr: 'PayPal Global Express', nameEn: 'PayPal Express', badge: 'Global', icon: Globe, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
      { nameAr: 'بطاقات ائتمان دولية (Credit Cards)', nameEn: 'International Cards', badge: 'PCI-DSS', icon: CreditCard, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' }
    ]
  }
];

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
  const { isRTL, language } = usePreferences();
  const isAr = language === 'ar';

  return (
    <footer className={`bg-black text-white pt-24 pb-16 border-t-8 border-gold-500/20 relative overflow-hidden ${isRTL ? 'font-cairo' : ''}`}>

      {/* Background Kinetic Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      <div className="absolute bottom-0 end-0 w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full animate-float-slow -z-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Modern Payment Gateways & Trust Showcase */}
        <div className="mb-20 p-6 md:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {isAr ? "بوابات الدفع والمعاملات الآمنة المعتمدة" : "Verified Payment Gateways & Secure Processing"}
                </h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  {isAr ? "دفع مشفر بنظام 256-Bit SSL ومتوافق مع معايير البنك المركزي و PCI-DSS" : "256-Bit SSL encrypted transactions compliant with CBE and PCI-DSS Level 1"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 shrink-0">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span>{isAr ? "تشفير مصرفي آمن 100%" : "100% Secure Checkout"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PAYMENT_METHODS_DATA.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <span className="text-[11px] font-black text-gold-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                  {isAr ? group.categoryAr : group.categoryEn}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.methods.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${m.color}`}>
                          <m.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                          {isAr ? m.nameAr : m.nameEn}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 shrink-0">
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 mb-20">

          {/* Branding & Mission */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <BrandLogo className="text-4xl" isLink={true} variant="short" />
            </motion.div>

            <p className="text-xs leading-relaxed text-zinc-400 mb-6 max-w-xs font-medium">
              {isAr
                ? "المنظومة العلمية والهندسية المتكاملة لتصميم خطط البناء العضلي وإدارة المكملات باحترافية وأمان مطلق."
                : "Precision metabolic protocol engine — body-composition modeling, adaptive nutrition & performance engineering."}
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Facebook, href: "https://www.facebook.com/mrxsteroid/" },
                { icon: Twitter, href: "https://x.com/Mr_X_Steroid" },
                { icon: Instagram, href: "https://www.instagram.com/prince_alex_ana/" },
                { icon: Youtube, href: "https://www.youtube.com/@IamPrince" }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -4, scale: 1.08 }}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-gold-500 hover:border-gold-500/30 transition-all shrink-0"
                  aria-label={`Visit our ${social.icon.name}`}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* General Menu */}
          <nav className="lg:col-span-1" aria-label={content.generalLinks}>
            <h4 className="text-xs font-black mb-6 text-gold-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
              <span className="w-3.5 h-0.5 bg-gold-500"></span>
              {content.generalLinks}
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: content.homeLink, action: () => navigateTo(Page.HOME) },
                { label: content.nav?.about || "About Us", action: () => navigateTo(Page.ABOUT) },
                { label: content.pricingTitle || "Choose Your Plan", action: () => { navigateTo(Page.HOME); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { label: content.blogTitle, action: () => navigateTo(Page.BLOG) },
                { label: content.careersTitle, action: () => navigateTo(Page.CAREERS) },
                { label: content.nav?.sitemap || "Sitemap", action: () => navigateTo(Page.SITEMAP) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Commercial */}
          <nav className="lg:col-span-1" aria-label={content.commercialLinks}>
            <h4 className="text-xs font-black mb-6 text-gold-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
              <span className="w-3.5 h-0.5 bg-gold-500"></span>
              {content.commercialLinks}
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: content.nav?.signup || "Cart / Checkout", action: () => navigateTo(Page.CHECKOUT) },
                { label: content.shippingPolicyTitle, action: () => navigateTo(Page.SHIPPING_POLICY) },
                { label: content.returnPolicyTitle, action: () => navigateTo(Page.RETURN_POLICY) },
                { label: content.refundTitle, action: () => navigateTo(Page.REFUND) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* International Legal */}
          <nav className="lg:col-span-1" aria-label={content.internationalLegalLinks}>
            <h4 className="text-xs font-black mb-6 text-gold-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
              <span className="w-3.5 h-0.5 bg-gold-500"></span>
              {content.internationalLegalLinks}
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: content.privacyTitle || content.privacyPolicy, action: () => navigateTo(Page.PRIVACY) },
                { label: content.termsTitle || content.termsOfService, action: () => navigateTo(Page.TERMS) },
                { label: content.cookiePolicyTitle, action: () => navigateTo(Page.COOKIE_POLICY) },
                { label: content.legalDisclaimerTitle || content.legalDisclaimer, action: () => navigateTo(Page.LEGAL_DISCLAIMER_PAGE) },
                { label: content.medicalDisclaimerPage.title, action: () => navigateTo(Page.MEDICAL_DISCLAIMER) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support & Compliance */}
          <nav className="lg:col-span-1" aria-label={content.supportLinks}>
            <h4 className="text-xs font-black mb-6 text-gold-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
              <span className="w-3.5 h-0.5 bg-gold-500"></span>
              {content.supportLinks}
            </h4>
            <ul className="space-y-3.5 mb-6">
              {[
                { label: content.contactPageTitle || content.contact, action: () => navigateTo(Page.CONTACT) },
                { label: content.supportTitle, action: () => navigateTo(Page.SUPPORT) },
                { label: content.faqPageTitle, action: () => navigateTo(Page.FAQ) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-tight text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="text-[11px] font-black mb-3 text-zinc-500 uppercase tracking-widest">{content.complianceLinks}</h4>
            <ul className="space-y-2">
              {[
                { label: content.accessibilityTitle, action: () => navigateTo(Page.ACCESSIBILITY) },
                { label: content.gdprTitle, action: () => navigateTo(Page.GDPR) },
                { label: content.ccpaTitle, action: () => navigateTo(Page.CCPA) }
              ].map((link, idx) => (
                <li key={idx}>
                  <button onClick={link.action} className="text-zinc-600 hover:text-zinc-300 transition-colors text-[10px] font-bold uppercase tracking-widest text-start">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <WeeklyKeywords pool={pool} />

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs font-bold tracking-wider text-zinc-500 text-center md:text-start">
            {content.copyright} • <span className="text-gold-400/50"><DynamicBrandLogo inline variant="full" /> "George Mourice"</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-gold-500" />
              <span>SSL: 4096-BIT ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>VERIFIED GATEWAY</span>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
