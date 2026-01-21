export default function DownloadsPage() {
    return (
        <main className="p-8">
            <h1 className="text-4xl font-black italic uppercase">Your Downloads</h1>
            <div className="mt-8 grid gap-4">
                <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10">
                    <span className="font-bold">Mr. X-Steroid (EPUB)</span>
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10">
                    <span className="font-bold">Protocol Blueprints (PDF)</span>
                </button>
            </div>
        </main>
    );
}
