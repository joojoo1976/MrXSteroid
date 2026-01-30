import React from 'react';
import { motion } from 'framer-motion';
import EliteTable, { EliteTableColumn } from '../shared/EliteTable';
import { CheckCircle, Trophy, Activity, Zap } from 'lucide-react';

const LiveSchedule: React.FC = () => {
    const scheduleData = [
        { id: 1, phase: 'WEEKS 1-4', focus: 'MASS GAIN', protocol: 'Test E + Deca', status: 'ACTIVE', intensity: 'HIGH' },
        { id: 2, phase: 'WEEKS 5-8', focus: 'HARDENING', protocol: 'Test P + Tren A', status: 'PENDING', intensity: 'EXTREME' },
        { id: 3, phase: 'WEEKS 9-12', focus: 'PEAK WEEK', protocol: 'Masteron + Anavar', status: 'LOCKED', intensity: 'MAX' },
    ];

    const columns: EliteTableColumn<typeof scheduleData[0]>[] = [
        {
            header: 'PHASE',
            accessor: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-gold-500 font-bold border border-zinc-700">
                        {item.id}
                    </div>
                    <span className="font-black text-white">{item.phase}</span>
                </div>
            ),
            className: "w-1/4"
        },
        {
            header: 'FOCUS',
            accessor: (item) => (
                <span className="font-bold text-zinc-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent" /> {item.focus}
                </span>
            ),
            className: "w-1/4"
        },
        {
            header: 'PROTOCOL',
            accessor: 'protocol',
            className: "font-mono text-zinc-400 w-1/4"
        },
        {
            header: 'STATUS',
            accessor: (item) => (
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider border ${item.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20 animate-pulse' :
                        item.status === 'PENDING' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' :
                            'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}>
                    {item.status}
                </span>
            ),
            className: "w-1/4"
        }
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background FX */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter"
                    >
                        ELITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">SCHEDULES</span>
                    </motion.h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Access world-class protocols designed for champions.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <EliteTable
                        data={scheduleData}
                        columns={columns}
                        title="MR. OLYMPIA PREP"
                        description="The exact protocol used by the top 1%."
                    />

                    <div className="mt-8 flex justify-center">
                        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest group">
                            <Zap className="w-4 h-4 group-hover:text-gold-500 transition-colors" />
                            View Full Database
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveSchedule;
