import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../types';
import { Mail, MapPin, Send, Zap, ShieldCheck } from 'lucide-react';

interface ContactProps {
  content: ContentStrings;
  isRTL: boolean;
}

const Contact: React.FC<ContactProps> = ({ content, isRTL }) => {
  return (
    <section id="contact" className={`py-32 bg-zinc-50 dark:bg-black border-t-8 border-gold-500/20 relative overflow-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Kinetic Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/5 blur-[150px] rounded-full animate-float-slow -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full animate-float-slow -z-10" style={{ animationDelay: '-5s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 max-w-7xl mx-auto">

          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 lg:pt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 text-gold-500 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-8 border border-gold-500/20">
              <Zap className="w-4 h-4 animate-pulse" /> Protocol: Secure
            </div>
            <h2 className="text-5xl md:text-8xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
              {content.contactPageTitle}
            </h2>
            <p className="text-2xl text-zinc-500 dark:text-zinc-400 mb-16 leading-relaxed font-bold italic animate-glow">
              {content.contactPageSubtitle}
            </p>

            <div className="space-y-8">
              {[
                { icon: Mail, label: "Channel 01", value: content.contactInfoEmail, sub: "Encrypted Comms" },
                { icon: MapPin, label: "HQ Locale", value: content.contactInfoAddress, sub: "Global Operations" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 20, scale: 1.02 }}
                  className="group flex items-center gap-8 p-8 bg-white dark:bg-zinc-950/50 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl hover:border-gold-500/50 transition-all duration-500 backdrop-blur-3xl animate-glow"
                >
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[1.5rem] flex items-center justify-center text-gold-500 shadow-inner group-hover:bg-gold-500 group-hover:text-black transition-all duration-500 group-hover:rotate-12">
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-sm uppercase tracking-[0.3em] text-zinc-400">{item.label}</h4>
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping"></div>
                    </div>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{item.value}</p>
                    <p className="text-xs font-black text-gold-500 uppercase tracking-widest opacity-50">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white dark:bg-zinc-900/60 backdrop-blur-3xl p-12 rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-zinc-200 dark:border-zinc-800 relative overflow-hidden card-shine animate-glow"
          >
            {/* Form Top Stripe */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-600 via-white to-gold-400"></div>

            <form className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Identity</label>
                  <input type="text" placeholder={content.contactFormNamePlaceholder} className="w-full bg-zinc-50 dark:bg-black/50 border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-xl font-bold outline-none shadow-inner transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Signal Hash</label>
                  <input type="email" placeholder={content.contactFormEmailPlaceholder} className="w-full bg-zinc-50 dark:bg-black/50 border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-xl font-bold outline-none shadow-inner transition-all" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Transmission Header</label>
                <input type="text" placeholder={content.contactFormSubjectPlaceholder} className="w-full bg-zinc-50 dark:bg-black/50 border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-xl font-bold outline-none shadow-inner transition-all" />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Payload</label>
                <textarea rows={5} placeholder={content.contactFormMessagePlaceholder} className="w-full bg-zinc-50 dark:bg-black/50 border-2 border-transparent focus:border-gold-500 rounded-2xl p-6 text-xl font-bold outline-none shadow-inner transition-all resize-none"></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-8 bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-2xl rounded-[2.5rem] transition-all shadow-3xl flex items-center justify-center gap-4 group relative overflow-hidden"
              >
                <Send className={`w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                {content.contactFormSubmit}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </motion.button>
            </form>

            <div className="mt-12 flex justify-center items-center gap-6 opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
              <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Insta-Signal Relay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
