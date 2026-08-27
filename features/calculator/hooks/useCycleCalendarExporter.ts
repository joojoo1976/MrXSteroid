'use client';

import { useState, useCallback, useMemo } from 'react';
import { ContentStrings } from '@/shared/types/types';
import { toMetric } from '../../../shared/lib/logic';

const MG_PER_OZ = 28349.523125;

export interface Compound {
    id: string;
    name: string;
    dosage: string;       // displayed value (mg or oz)
    dosageMg: number;     // internal metric value (mg)
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
    unitSystem: 'metric' | 'imperial';
}

/** Local calendar date as `YYYY-MM-DD` (avoids the UTC shift of toISOString). */
const toISOLocal = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Local calendar date as `YYYYMMDD` for the ICS format. */
const toICSDate = (d: Date): string =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

/** Convert displayed dosage to internal mg */
const toMg = (displayed: string | number, system: 'metric' | 'imperial'): number => {
    const val = parseFloat(String(displayed));
    if (isNaN(val)) return 0;
    return system === 'imperial' ? toMetric(val, 'volume') * 1000 : val; // oz -> mg (via ml)
};

/** Convert internal mg to displayed dosage */
const fromMg = (mg: number, system: 'metric' | 'imperial'): string => {
    if (system === 'imperial') {
        const oz = mg / MG_PER_OZ;
        return oz.toFixed(3).replace(/\.?0+$/, '');
    }
    return Math.round(mg).toString();
};

export const useCycleCalendarExporter = ({ content, unitSystem }: UseCycleCalendarExporterOptions) => {
    const isImperial = unitSystem === 'imperial';
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [startDate, setStartDate] = useState(() => toISOLocal(new Date()));
    const [stealthMode, setStealthMode] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [autoPCT, setAutoPCT] = useState(true);

    // Initialize with metric internal values, display converted
    const initialCompounds = useMemo(() => ([
        { id: '1', name: 'Testosterone Enanthate', dosageMg: 250, dosage: fromMg(250, unitSystem), freq: 'twiceWeekly', duration: '12', halfLife: 4.5 }
    ]), [unitSystem]);

    const [compounds, setCompounds] = useState<Compound[]>(initialCompounds);

    const handleVerify = useCallback(() => {
        setTimeout(() => setIsUnlocked(true), 1000);
    }, []);

    const addCompound = useCallback(() => {
        const mg = 200;
        setCompounds(prev => [...prev, {
            id: Math.random().toString(),
            name: 'Deca Durabolin',
            dosageMg: mg,
            dosage: fromMg(mg, unitSystem),
            freq: 'weekly',
            duration: '10',
            halfLife: 6
        }]);
    }, [unitSystem]);

    const removeCompound = useCallback((id: string) => {
        setCompounds(prev => prev.filter(c => c.id !== id));
    }, []);

    const updateCompound = useCallback((id: string, field: string, value: string | number) => {
        setCompounds(prev => prev.map(c => {
            if (c.id !== id) return c;
            const updated = { ...c, [field]: value };
            if (field === 'dosage') {
                updated.dosageMg = toMg(value, unitSystem);
            }
            return updated;
        }));
    }, [unitSystem]);

    const loadPreset = useCallback((type: 'beginnerBulk' | 'cutting' | 'trt') => {
        if (type === 'beginnerBulk') {
            setCompounds([
                { id: '1', name: 'Testosterone Enanthate', dosageMg: 500, dosage: fromMg(500, unitSystem), freq: 'twiceWeekly', duration: '12', halfLife: 4.5 },
                { id: '2', name: 'Dianabol', dosageMg: 30, dosage: fromMg(30, unitSystem), freq: 'daily', duration: '4', halfLife: 0.2 }
            ]);
        } else if (type === 'cutting') {
            setCompounds([
                { id: '1', name: 'Testosterone Propionate', dosageMg: 100, dosage: fromMg(100, unitSystem), freq: 'eod', duration: '8', halfLife: 0.8 },
                { id: '2', name: 'Trenbolone Acetate', dosageMg: 75, dosage: fromMg(75, unitSystem), freq: 'eod', duration: '8', halfLife: 1 },
                { id: '3', name: 'Winstrol', dosageMg: 50, dosage: fromMg(50, unitSystem), freq: 'daily', duration: '6', halfLife: 0.4 }
            ]);
        } else {
            setCompounds([
                { id: '1', name: 'Testosterone Cypionate', dosageMg: 150, dosage: fromMg(150, unitSystem), freq: 'weekly', duration: '20', halfLife: 5 }
            ]);
        }
    }, [unitSystem]);

    const generateICS = useCallback(() => {
        const events: ICSEvent[] = [];
        const start = new Date(startDate);
        // Guard against a cleared/invalid date input — `new Date("")` is an
        // Invalid Date whose toISOString() throws RangeError.
        if (!startDate || isNaN(start.getTime())) return;
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

                const dateString = toICSDate(currentDate);

                // Use internal mg value, display in current unit system
                const displayDosage = comp.dosage; // already converted for display
                const unitLabel = isImperial ? content.units.oz : content.units.mg;

                let summary = `${comp.name} (${displayDosage}${unitLabel})`;
                if (stealthMode) {
                    summary = stealthAliases[Math.floor(Math.random() * stealthAliases.length)];
                }

                let description = `${content.cycleArchitect.form.compoundLabel}: ${comp.name} ${displayDosage}${unitLabel}.`.replace(/[,;]/g, '\\$&');
                if (autoRotate && comp.halfLife > 1) {
                    description += ` Site: ${rotationSites[rotationIndex % rotationSites.length]}`;
                    rotationIndex++;
                }

                const eventEndDate = new Date(currentDate);
                eventEndDate.setDate(currentDate.getDate() + 1);
                const endDateString = toICSDate(eventEndDate);

                events.push({
                    start: dateString,
                    end: endDateString,
                    summary: summary.replace(/[,;]/g, '\\$&'),
                    description: description
                });
                count++;
            }
        });

        if (autoPCT) {
            const pctStartDate = new Date(maxCycleEndDate);
            pctStartDate.setDate(pctStartDate.getDate() + Math.round(5 * maxHalfLife));
            const startString = toICSDate(pctStartDate);

            const pctEndDate = new Date(pctStartDate);
            pctEndDate.setDate(pctStartDate.getDate() + 1);
            const endString = toICSDate(pctEndDate);

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
    }, [startDate, compounds, stealthMode, autoRotate, autoPCT, content, unitSystem]);

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
