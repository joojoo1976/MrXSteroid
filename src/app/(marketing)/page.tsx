export default function HomePage() {
    return (
        <main className="p-8">
            <h1 className="text-6xl font-black">Mr. X-Steroid</h1>
            <p className="text-xl mt-4">Mastering Hormonal Science & Longevity.</p>
            <div className="mt-8 flex gap-4">
                <a href="/pricing" className="bg-gold-500 text-black px-6 py-3 font-bold rounded-lg">Buy the Book</a>
                <a href="/tools/smart-injection-map" className="border border-white/20 px-6 py-3 font-bold rounded-lg">Explore Tools</a>
            </div>
        </main>
    );
}
