import React, { useState } from 'react';
import { CalendarCheck, Target, X, Plus, Download, Lock } from 'lucide-react';
import { ContentStrings } from '../types';

interface CycleCalendarExporterProps {
    content: ContentStrings;
    isRTL: boolean;
}

const CycleCalendarExporter: React.FC<CycleCalendarExporterProps> = ({ content, isRTL }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [stealthMode, setStealthMode] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [autoPCT, setAutoPCT] = useState(true);

    const [compounds, setCompounds] = useState<Array<{ id: string, name: string, dosage: string, freq: string, duration: string, halfLife: number }>>([
        { id: '1', name: 'Testosterone Enanthate', dosage: '250', freq: 'twiceWeekly', duration: '12', halfLife: 4.5 }
    ]);

    // Mock unlock for demo
    const handleVerify = () => {
        setTimeout(() => setIsUnlocked(true), 1000);
    };

    const addCompound = () => {
        setCompounds([...compounds, { id: Math.random().toString(), name: 'Deca Durabolin', dosage: '200', freq: 'weekly', duration: '10', halfLife: 6 }]);
    };

    const removeCompound = (id: string) => {
        setCompounds(compounds.filter(c => c.id !== id));
    };

    const updateCompound = (id: string, field: string, value: string | number) => {
        setCompounds(compounds.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const loadPreset = (type: 'beginnerBulk' | 'cutting' | 'trt') => {
        if (type === 'beginnerBulk') {
            setCompounds([
                { id: '1', name: 'Testosterone Enanthate', dosage: '500', freq: 'twiceWeekly', duration: '12', halfLife: 4.5 },
                { id: '2', name: 'Dianabol', dosage: '30', freq: 'daily', duration: '4', halfLife: 0.2 } // Oral
            ]);
        } else if (type === 'cutting') {
            setCompounds([
                { id: '1', name: 'Testosterone Propionate', dosage: '100', freq: 'eod', duration: '8', halfLife: 0.8 },
                { id: '2', name: 'Trenbolone Acetate', dosage: '75', freq: 'eod', duration: '8', halfLife: 1 },
                { id: '3', name: 'Winstrol', dosage: '50', freq: 'daily', duration: '6', halfLife: 0.4 }
            ]);
        } else {
            setCompounds([
                { id: '1', name: 'Testosterone Cypionate', dosage: '150', freq: 'weekly', duration: '20', halfLife: 5 }
            ]);
        }
    };

    const generateICS = () => {
        interface ICSEvent {
            start: string;
            end: string;
            summary: string;
            description: string;
        }
        const events: ICSEvent[] = [];
        const start = new Date(startDate);
        let maxCycleEndDate = new Date(start);
        let maxHalfLife = 0;

        const rotationSites = content.cycleArchitect.rotationSites;
        let rotationIndex = 0;

        const stealthAliases = content.cycleArchitect.stealthAliases;

        compounds.forEach(comp => {
            const durationWeeks = parseInt(comp.duration) || 1;
            const freqType = comp.freq;
            let daysInterval = 7;
            if (freqType === 'daily') daysInterval = 1;
            if (freqType === 'eod') daysInterval = 2;
            if (freqType === 'twiceWeekly') daysInterval = 3.5; // Logic handled in loop

            const totalDays = durationWeeks * 7;
            const endDate = new Date(start);
            endDate.setDate(start.getDate() + totalDays);
            if (endDate > maxCycleEndDate) maxCycleEndDate = endDate;
            if (comp.halfLife > maxHalfLife) maxHalfLife = comp.halfLife;

            const currentDate = new Date(start);
            let count = 0;

            while (currentDate < endDate) {
                // Handle Twice Weekly specially (Mon/Thu logic approximation)
                if (freqType === 'twiceWeekly') {
                    // If it's the first injection of the week (e.g., Mon), next is +3 days (Thu), then +4 days (Mon)
                    // Simplified: just alternating 3 and 4 days
                    const jump = count % 2 === 0 ? 3 : 4;
                    currentDate.setDate(currentDate.getDate() + jump);
                } else {
                    currentDate.setDate(currentDate.getDate() + daysInterval);
                }

                if (currentDate >= endDate) break;

                const dateString = currentDate.toISOString().replace(/-|:|\.\d+/g, ""); // Format: YYYYMMDDTHHmmSSZ

                let summary = `${comp.name} (${comp.dosage}mg)`;
                if (stealthMode) {
                    summary = stealthAliases[Math.floor(Math.random() * stealthAliases.length)];
                }

                let description = `${content.cycleArchitect.form.compoundLabel}: ${comp.name} ${comp.dosage}${content.units.mg}.`.replace(/[,;]/g, '\\$&');
                if (autoRotate && comp.halfLife > 1) {
                    description += ` Site: ${rotationSites[rotationIndex % rotationSites.length]}`;
                    rotationIndex++;
                }

                const eventEndDate = new Date(currentDate);
                eventEndDate.setDate(currentDate.getDate() + 1);
                const endDateString = eventEndDate.toISOString().replace(/-|:|\.\d+/g, "");

                events.push({
                    start: dateString.substring(0, 8),
                    end: endDateString.substring(0, 8),
                    summary: summary.replace(/[,;]/g, '\\$&'),
                    description: description
                });
                count++;
            }
        });

        // Add PCT
        if (autoPCT) {
            const pctStartDate = new Date(maxCycleEndDate);
            pctStartDate.setDate(pctStartDate.getDate() + Math.round(5 * maxHalfLife));
            const startString = pctStartDate.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 8);

            const pctEndDate = new Date(pctStartDate);
            pctEndDate.setDate(pctStartDate.getDate() + 1);
            const endString = pctEndDate.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 8);

            events.push({
                start: startString,
                end: endString,
                summary: stealthMode ? content.cycleArchitect.stealthPctAlias : content.cycleArchitect.pctEventSummary,
                description: content.cycleArchitect.pctEventDescription
            });
        }

        // Build ICS File Content
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//MrXSteroid//CycleArchitect//EN\n";
        events.forEach(e => {
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `DTSTART;VALUE=DATE:${e.start}\n`;
            icsContent += `DTEND;VALUE=DATE:${e.end}\n`;
            icsContent += `SUMMARY:${e.summary}\n`;
            icsContent += `DESCRIPTION:${e.description}\n`;
            icsContent += "END:VEVENT\n";
        });
        icsContent += "END:VCALENDAR";

        // Download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'My_Cycle_Plan.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isUnlocked) {
        return (
            <div className="max-w-4xl mx-auto py-10">
                <div className="text-center mb-10"><h1 className="text-3xl font-bold mb-2">{content.cycleArchitect.title}</h1><p className="text-zinc-500">{content.cycleArchitect.subtitle}</p></div>
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 animate-pulse"><Lock className="w-10 h-10 text-gold-500" /></div>
                        <h3 className="text-2xl font-black mb-3">{content.cycleArchitect.premiumLock.lockedTitle}</h3>
                        <p className="text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">{content.cycleArchitect.premiumLock.lockedDesc}</p>
                        <div className="flex gap-3 w-full max-w-sm">
                            <input type="text" placeholder={content.cycleArchitect.premiumLock.placeholder} className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 focus:border-gold-500 outline-none" />
                            <button onClick={handleVerify} className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl whitespace-nowrap transition-colors">{content.cycleArchitect.premiumLock.verifyBtn}</button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-4">{content.cycleArchitect.premiumLock.demoHint}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 animate-fade-in-up">
            <div className="text-center mb-10">
                <CalendarCheck className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                <h1 className="text-3xl font-black mb-2">{content.cycleArchitect.title}</h1>
                <p className="text-zinc-500 max-w-2xl mx-auto">{content.cycleArchitect.subtitle}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-gold-500" /> {content.cycleArchitect.presetsTitle}</h3>
                        <div className="space-y-2">
                            <button onClick={() => loadPreset('beginnerBulk')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-sm font-medium transition-colors">{content.cycleArchitect.presets.beginnerBulk}</button>
                            <button onClick={() => loadPreset('cutting')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-sm font-medium transition-colors">{content.cycleArchitect.presets.cutting}</button>
                            <button onClick={() => loadPreset('trt')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-sm font-medium transition-colors">{content.cycleArchitect.presets.trt}</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-bold mb-4">{content.cycleArchitect.configLabel}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm text-zinc-600 dark:text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>{content.cycleArchitect.stealthModeLabel}</span>
                                <button aria-label={content.cycleArchitect.toggleStealth} onClick={() => setStealthMode(!stealthMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${stealthMode ? 'bg-gold-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${stealthMode ? (isRTL ? '-translate-x-6' : 'translate-x-6') : ''}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm text-zinc-600 dark:text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>{content.cycleArchitect.rotationLabel}</span>
                                <button aria-label={content.cycleArchitect.toggleRotation} onClick={() => setAutoRotate(!autoRotate)} className={`w-12 h-6 rounded-full p-1 transition-colors ${autoRotate ? 'bg-gold-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoRotate ? (isRTL ? '-translate-x-6' : 'translate-x-6') : ''}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm text-zinc-600 dark:text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>{content.cycleArchitect.pctLabel}</span>
                                <button aria-label={content.cycleArchitect.togglePct} onClick={() => setAutoPCT(!autoPCT)} className={`w-12 h-6 rounded-full p-1 transition-colors ${autoPCT ? 'bg-gold-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoPCT ? (isRTL ? '-translate-x-6' : 'translate-x-6') : ''}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Builder Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1">
                                <label htmlFor="start-date" className="text-xs font-bold text-zinc-500 uppercase block mb-2">{content.cycleArchitect.form.startDateLabel}</label>
                                <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-gold-500" />
                            </div>
                            <div className="flex-1"></div>
                        </div>

                        <div className="space-y-4">
                            {compounds.map((comp, idx) => (
                                <div key={comp.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative group">
                                    <button aria-label="Remove Compound" onClick={() => removeCompound(comp.id)} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-4 space-y-1">
                                            <label htmlFor={`compound-${comp.id}`} className="text-[10px] font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.compoundLabel}</label>
                                            <input id={`compound-${comp.id}`} type="text" value={comp.name} onChange={e => updateCompound(comp.id, 'name', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm outline-none" />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label htmlFor={`dosage-${comp.id}`} className="text-[10px] font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.dosageLabel}</label>
                                            <input id={`dosage-${comp.id}`} type="number" value={comp.dosage} onChange={e => updateCompound(comp.id, 'dosage', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm outline-none" />
                                        </div>
                                        <div className="md:col-span-3 space-y-1">
                                            <label htmlFor={`freq-${comp.id}`} className="text-[10px] font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.frequencyLabel}</label>
                                            <select id={`freq-${comp.id}`} value={comp.freq} onChange={e => updateCompound(comp.id, 'freq', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm outline-none">
                                                {Object.entries(content.cycleArchitect.form.frequencies).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label htmlFor={`weeks-${comp.id}`} className="text-[10px] font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.weeksLabel}</label>
                                            <input id={`weeks-${comp.id}`} type="number" value={comp.duration} onChange={e => updateCompound(comp.id, 'duration', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm outline-none" />
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-2">
                                            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-4">
                            <button onClick={addCompound} className="px-6 py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-gold-500 hover:text-gold-500 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> {content.cycleArchitect.form.addCompoundBtn}</button>
                            <button onClick={generateICS} className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" /> {content.cycleArchitect.premiumLock.exportBtn}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CycleCalendarExporter;
