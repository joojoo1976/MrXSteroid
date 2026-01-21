export default function BlogPostPage({ params }: { params: { slug: string } }) {
    return (
        <main className="p-8 max-w-3xl mx-auto">
            <article>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Article: {params.slug.replace(/-/g, ' ')}</h1>
                <div className="mt-8 prose prose-invert max-w-none">
                    <p>Scientific breakdown and protocols regarding {params.slug}...</p>
                </div>
            </article>
        </main>
    );
}
