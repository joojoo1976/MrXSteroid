import React from 'react';
import { Quote } from 'lucide-react';
import { ContentStrings } from '../types';
import AuthorImage from './AuthorImage';

const AuthorSection: React.FC<{ content: ContentStrings }> = ({ content }) => (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 right-[10%] w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
                <div className="relative group">
                    {/* Image Decoration */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-gold-500/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <AuthorImage name={content.authorName} />
                </div>

                <div className="flex-1 text-center md:text-start relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-500 text-xs font-black uppercase tracking-widest rounded-full mb-6 shadow-sm">
                        <Quote className="w-3 h-3 fill-current" />
                        {content.authorSection}
                    </div>

                    <h2 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                        {content.authorName}
                    </h2>

                    <div className="relative">
                        <Quote className="absolute -top-6 -left-6 w-12 h-12 text-gold-500/10 transform -scale-x-100" />
                        <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-loose text-lg mb-8 relative z-10">
                            <p>{content.authorBio}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <div className="h-1 w-12 bg-gold-500 rounded-full"></div>
                        <div className="h-1 w-2 bg-gold-500/50 rounded-full"></div>
                        <div className="h-1 w-1 bg-gold-500/30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default AuthorSection;
