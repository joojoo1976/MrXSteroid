import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ArrowRight, Zap, FlaskConical, Dna } from 'lucide-react';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import { supabase } from '../shared/lib/supabase';
import type { BlogPost } from '../features/admin/useAdminData';

interface BlogPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ content }) => {
    const { isRTL } = usePreferences();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .limit(50)
            .then(({ data, error }) => {
                if (!mounted) return;
                if (error) {
                    setError(error.message);
                    setPosts([]);
                } else {
                    setPosts((data || []) as BlogPost[]);
                }
                setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    const iconFor = (category: string) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('bio') || cat.includes('تكنولوجيا') || cat.includes('تكنلوجيا')) return FlaskConical;
        if (cat.includes('physio') || cat.includes('وظائف')) return Zap;
        if (cat.includes('gen') || cat.includes('وراث')) return Dna;
        return Zap;
    };

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
        } catch {
            return (iso || '').slice(0, 10);
        }
    };

    const rendered = posts.map(p => ({
        title: isRTL ? p.title_ar : p.title_en,
        excerpt: isRTL ? (p.excerpt_ar || p.excerpt_en || '') : (p.excerpt_en || p.excerpt_ar || ''),
        category: isRTL ? p.category_ar : p.category_en,
        date: formatDate(p.published_at || p.created_at),
        icon: iconFor(isRTL ? p.category_ar : p.category_en),
    }));

    return (
        <div className="space-y-16 pb-20">
            {/* Blog Header */}
            <header className="relative py-24 px-8 overflow-hidden rounded-[4rem] bg-zinc-900 border border-zinc-800 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 to-transparent pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10"
                >
                    <BookOpen className="w-16 h-16 text-gold-500 mx-auto mb-8 animate-pulse" />
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gold-200 to-zinc-500">
                        {content.blogTitle}
                    </h1>
                    <p className="text-zinc-500 text-xl font-bold max-w-2xl mx-auto uppercase tracking-widest italic">
                        {isRTL ? "المرجع العلمي الأهم في عالم الأداء البدني" : "The Most Important Scientific Reference for Physical Performance"}
                    </p>
                </motion.div>
            </header>

            {/* Featured Post Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full p-10 text-center text-zinc-600 font-bold">{isRTL ? 'جارٍ التحميل…' : 'Loading…'}</div>
                ) : error ? (
                    <div className="col-span-full p-10 text-center text-red-500 font-bold">{isRTL ? 'حدث خطأ أثناء تحميل المقالات. حاول لاحقاً.' : 'Failed to load posts. Please try again later.'}</div>
                ) : rendered.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-zinc-600 font-bold">{isRTL ? 'لا توجد مقالات منشورة بعد.' : 'No published posts yet.'}</div>
                ) : rendered.map((post, idx) => (
                    <motion.article
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="group relative p-8 rounded-[3rem] bg-zinc-900/50 border border-zinc-800 hover:border-gold-500/30 transition-all overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-500 text-xs font-black uppercase tracking-widest border border-gold-500/20">
                                {post.category}
                            </span>
                            <post.icon className="w-6 h-6 text-zinc-700 group-hover:text-gold-500 transition-colors" />
                        </div>

                        <h3 className="text-2xl font-black leading-tight mb-6 group-hover:text-gold-500 transition-colors">
                            {post.title}
                        </h3>

                        <p className="text-zinc-500 leading-relaxed mb-8 flex-grow">
                            {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                            <div className="flex items-center gap-3 text-zinc-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold">{post.date}</span>
                            </div>
                            <button className="flex items-center gap-2 text-gold-500 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                                {isRTL ? "اقرأ المزيد" : "Read More"}
                                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </motion.article>
                ))}
            </div>

            {/* Newsletter Subscription */}
            <section className="p-12 rounded-[4rem] bg-gradient-to-r from-gold-500/10 via-zinc-900 to-zinc-950 border border-zinc-800 relative overflow-hidden">
                <div className="md:flex items-center justify-between gap-12 text-center md:text-start relative z-10">
                    <div className="space-y-4 mb-8 md:mb-0">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            {isRTL ? "ابقَ محدثاً علمياً" : "Stay Scientifically Updated"}
                        </h2>
                        <p className="text-zinc-500 font-bold max-w-md">
                            {isRTL ? "اشترك في قائمتنا البريدية للحصول على أحدث الدراسات والبروتوكولات مباشرة في بريدك." : "Subscribe to our mailing list for latest studies and protocols directly in your inbox."}
                        </p>
                    </div>
                    <div className="flex gap-2 p-2 bg-black/50 rounded-2xl border border-zinc-800 w-full max-w-md">
                        <input
                            type="email"
                            placeholder={isRTL ? "بريدك الإلكتروني" : "Your Email"}
                            className="bg-transparent border-none focus:ring-0 px-4 py-3 flex-grow text-white"
                        />
                        <button className="px-8 py-3 bg-gold-500 text-black font-black uppercase text-sm rounded-xl hover:bg-gold-400 transition-colors">
                            {isRTL ? "انضم الآن" : "Join Now"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
