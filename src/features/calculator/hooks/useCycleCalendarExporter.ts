import { useState, useCallback } from 'react';
import { ContentStrings } from '@/shared/types/types';

export interface Compound {
    id: string;
    name: string;
    dosage: string;
    freq: string;
    duration: string;
    halfLife: number;
}

interface ICSEvent {
    start: string;
    end: string;
    summary: string;
    description: string;
}

interface UseCycleCalendarExporterOptions {
    content: ContentStrings;
}

export const useCycleCalendarExporter = ({ content }: UseCycleCalendarExporterOptions) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [stealthMode, setStealthMode] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [autoPCT, setAutoPCT] = useState(true);

    const [compounds, setCompounds] = useState<Compound[]>([
        { id: '1', name: 'Testosterone Enanthate', dosage: '250', freq: 'twiceWeekly', duration: '12', halfLife: 4.5 }
    ]);

    const handleVerify = useCallback(() => {
        setTimeout(() => setIsUnlocked(true), 1000);
    }, []);

    const addCompound = useCallback(() => {
        setCompounds(prev => [...prev, {
            id: Math.random().toString(),
            name: 'Deca Durabolin',
            dosage: '200',
            freq: 'weekly',
            duration: '10',
            halfLife: 6
        }]);
    }, []);

    const removeCompound = useCallback((id: string) => {
        setCompounds(prev => prev.filter(c => c.id !== id));
    }, []);

    const updateCompound = useCallback((id: string, field: string, value: string | number) => {
        setCompounds(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    }, []);

    const loadPreset = useCallback((type: 'beginnerBulk' | 'cutting' | 'trt') => {
        if (type === 'beginnerBulk') {
            setCompounds([
                { id: '1', name: 'Testosterone Enanthate', dosage: '500', freq: 'twiceWeekly', duration: '12', halfLife: 4.5 },
                { id: '2', name: 'Dianabol', dosage: '30', freq: 'daily', duration: '4', halfLife: 0.2 }
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
    }, []);

    const generateICS = useCallback(() => {
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
            if (freqType === 'twiceWeekly') daysInterval = 3.5;

            const totalDays = durationWeeks * 7;
            const endDate = new Date(start);
            endDate.setDate(start.getDate() + totalDays);
            if (endDate > maxCycleEndDate) maxCycleEndDate = endDate;
            if (comp.halfLife > maxHalfLife) maxHalfLife = comp.halfLife;

            const currentDate = new Date(start);
            let count = 0;

            while (currentDate < endDate) {
                if (freqType === 'twiceWeekly') {
                    const jump = count % 2 === 0 ? 3 : 4;
                    currentDate.setDate(currentDate.getDate() + jump);
                } else {
                    currentDate.setDate(currentDate.getDate() + daysInterval);
                }

                if (currentDate >= endDate) break;

                const dateString = currentDate.toISOString().replace(/-|:|\.\d+/g, "");

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

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'My_Cycle_Plan.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [startDate, compounds, stealthMode, autoRotate, autoPCT, content]);

    return {
        isUnlocked,
        handleVerify,
        startDate,
        setStartDate,
        stealthMode,
        setStealthMode,
        autoRotate,
        setAutoRotate,
        autoPCT,
        setAutoPCT,
        compounds,
        addCompound,
        removeCompound,
        updateCompound,
        loadPreset,
        generateICS
    };
};
