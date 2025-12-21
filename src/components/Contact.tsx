import React from 'react';
import { ContentStrings } from '../types';
import { Mail, MapPin, Send } from 'lucide-react';

interface ContactProps {
  content: ContentStrings;
  isRTL: boolean;
}

const Contact: React.FC<ContactProps> = ({ content, isRTL }) => {
  return (
    <section id="contact" className="py-20 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">{content.contactPageTitle}</h2>
            <p className="text-zinc-500 mb-8">{content.contactPageSubtitle}</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-gold-500 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Email</h4>
                  <p className="text-zinc-500">{content.contactInfoEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-gold-500 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Location</h4>
                  <p className="text-zinc-500">{content.contactInfoAddress}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg border border-zinc-100 dark:border-zinc-800">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder={content.contactFormNamePlaceholder} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-gold-500 transition-colors" />
                <input type="email" placeholder={content.contactFormEmailPlaceholder} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <input type="text" placeholder={content.contactFormSubjectPlaceholder} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-gold-500 transition-colors" />
              <textarea rows={4} placeholder={content.contactFormMessagePlaceholder} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-gold-500 transition-colors"></textarea>
              <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} /> {content.contactFormSubmit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
