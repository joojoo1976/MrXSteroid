export default function BlogArchivePage() {
    return (
        <main className="p-8">
            <h1 className="text-4xl font-black">Knowledge Hub</h1>
            <p className="mt-4 text-zinc-400">Deep dives into hormonal science, training, and longevity.</p>
            <div className="mt-8 grid gap-6">
                {/* Blog post previews will go here */}
                <a href="/blog/understanding-hormones" className="p-6 border border-white/10 rounded-xl hover:border-gold-500/50 transition-colors">
                    <h2 className="text-xl font-bold">Understanding Hormones 101</h2>
                    <p className="text-zinc-500 mt-2">A guide for beginners and advanced athletes alike.</p>
                </a>
            </div>
        </main>
    );
}
