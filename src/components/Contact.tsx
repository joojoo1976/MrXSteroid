import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../types';
import { Mail, Send, Zap, ShieldCheck } from 'lucide-react';
import { StyledBrandName } from './StyledBrandName';
import { usePreferences } from '../context/PreferencesContext';

interface ContactProps {
  content: ContentStrings;
}

const Contact: React.FC<ContactProps> = ({ content }) => {
  const { isRTL } = usePreferences();
  return (
    <section id="contact" className={`py-8 lg:py-12 bg-zinc-50 dark:bg-background border-t-8 border-gold-500/20 relative overflow-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Kinetic Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full animate-float-slow -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full animate-float-slow -z-10 [animation-delay:-5s]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">

          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 lg:pt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 text-gold-500 rounded-full text-sm font-black uppercase tracking-[0.3em] mb-8 border border-gold-500/20">
              <Zap className="w-4 h-4 animate-pulse" /> Protocol: Secure
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter text-start">
              <StyledBrandName text={content.contactPageTitle} />
            </h2>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed font-bold italic animate-glow text-start">
              <StyledBrandName text={content.contactPageSubtitle} />
            </p>

            <div className="space-y-8">
              <motion.a
                href="https://wa.me/201000722050"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 20, scale: 1.02 }}
                className="group flex items-center gap-4 p-5 bg-white dark:bg-background/50 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-xl hover:border-green-500/50 transition-all duration-500 backdrop-blur-3xl animate-glow"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-[1.5rem] flex items-center justify-center text-green-500 shadow-inner group-hover:bg-green-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                  <Zap className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-base uppercase tracking-[0.3em] text-zinc-400">{isRTL ? "تواصل مباشر" : "Direct Hash"}</h4>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                  </div>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">WhatsApp</p>
                  <p className="text-sm font-black text-green-500 uppercase tracking-widest opacity-50">{isRTL ? "متاح 24/7" : "24/7 Priority Relay"}</p>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ x: 20, scale: 1.02 }}
                className="group flex items-center gap-4 p-5 bg-white dark:bg-background/50 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-xl hover:border-gold-500/50 transition-all duration-500 backdrop-blur-3xl animate-glow"
              >
                <div className="w-20 h-20 bg-gold-500/10 rounded-[1.5rem] flex items-center justify-center text-gold-500 shadow-inner group-hover:bg-gold-500 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                  <Mail className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-base uppercase tracking-[0.3em] text-zinc-400">{isRTL ? "الشبكة الاجتماعية" : "Social Network"}</h4>
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping"></div>
                  </div>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{isRTL ? "مواقعنا" : "Our Nodes"}</p>
                  <p className="text-sm font-black text-gold-500 uppercase tracking-widest opacity-50">{isRTL ? "تابع التحديثات" : "Follow Signal Stream"}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white dark:bg-background/60 backdrop-blur-3xl p-5 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-zinc-200 dark:border-zinc-800 relative overflow-hidden card-shine animate-glow"
          >
            {/* Form Top Stripe */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-600 via-white to-gold-400"></div>

            <form
              className="space-y-4 relative z-10"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const email = formData.get('email') as string;
                const subject = formData.get('subject') as string;
                const message = formData.get('message') as string;
                const mailtoLink = `mailto:foryoutalk@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
                window.location.href = mailtoLink;
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-start">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ms-1">Identity</label>
                  <input name="name" type="text" placeholder={content.contactFormNamePlaceholder} className="w-full bg-zinc-50 dark:bg-background/50 border-2 border-transparent focus:border-gold-500 rounded-xl p-3 text-base font-bold outline-none shadow-inner transition-all" required />
                </div>
                <div className="space-y-2 text-start">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ms-1">Signal Hash</label>
                  <input name="email" type="email" placeholder={content.contactFormEmailPlaceholder} className="w-full bg-zinc-50 dark:bg-background/50 border-2 border-transparent focus:border-gold-500 rounded-xl p-3 text-base font-bold outline-none shadow-inner transition-all" required />
                </div>
              </div>
              <div className="space-y-2 text-start">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ms-1">Transmission Header</label>
                <input name="subject" type="text" placeholder={content.contactFormSubjectPlaceholder} className="w-full bg-zinc-50 dark:bg-background/50 border-2 border-transparent focus:border-gold-500 rounded-xl p-3 text-base font-bold outline-none shadow-inner transition-all" required />
              </div>
              <div className="space-y-2 text-start">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ms-1">Payload</label>
                <textarea name="message" rows={3} placeholder={content.contactFormMessagePlaceholder} className="w-full bg-zinc-50 dark:bg-background/50 border-2 border-transparent focus:border-gold-500 rounded-xl p-3 text-base font-bold outline-none shadow-inner transition-all resize-none" required></textarea>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-background dark:bg-white text-white dark:text-black font-black text-lg rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <Send className={`w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                {content.contactFormSubmit}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </motion.button>
            </form>

            <div className="mt-8 flex justify-center items-center gap-4 opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-black uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
              <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-black uppercase tracking-widest">Insta-Signal Relay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
