import React from 'react';
import { Quote } from 'lucide-react';
import { ContentStrings } from '../types';
import AuthorImage from './AuthorImage';

const AuthorSection: React.FC<{ content: ContentStrings }> = ({ content }) => (
    <section className="py-20 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
                <AuthorImage name={content.authorName} />
                <div className="flex-1 text-center md:text-start">
                    <div className="inline-block px-3 py-1 bg-gold-500/10 text-gold-600 dark:text-gold-500 text-xs font-bold uppercase tracking-widest rounded-full mb-4">{content.authorSection}</div>
                    <h2 className="text-4xl font-black mb-6">{content.authorName}</h2>
                    <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8"><p>{content.authorBio}</p></div>
                    <Quote className="w-10 h-10 text-gold-500/20 mx-auto md:mx-0" />
                </div>
            </div>
        </div>
    </section>
);

export default AuthorSection;
