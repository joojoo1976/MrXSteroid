import React from 'react';
import { motion } from 'framer-motion';
import { ContentStrings } from '../../types';
import { usePreferences } from '../../context/PreferencesContext';

// Simple cn utility if not available, but assuming it is from existing codebase context
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export interface EliteTableColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface EliteTableProps<T> {
    data: T[];
    columns: EliteTableColumn<T>[];
    title?: string;
    className?: string;
    description?: string;
    onRowClick?: (item: T) => void;
    content?: ContentStrings;
}

const EliteTable = <T extends Record<string, unknown>>({
    data,
    columns,
    title,
    description,
    className,
    onRowClick,
    content
}: EliteTableProps<T>) => {
    const { isRTL } = usePreferences();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn("w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-2xl relative group", className)}
        >
            {/* Decorative Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 inset-inline-start-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

            {(title || description) && (
                <div className="bg-zinc-900/60 px-6 py-5 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                        {title && (
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                                <span className="text-gold-500 text-3xl">///</span> {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-zinc-400 text-sm mt-1 font-medium">{description}</p>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs font-mono text-gold-500 animate-pulse">{content?.liveData || 'LIVE DATA'}</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse delay-75" />
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-150" />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto relative z-10 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                <table className="w-full text-start border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-black uppercase tracking-wider text-zinc-500">
                            {columns.map((col: EliteTableColumn<T>, idx: number) => (
                                <th key={idx} className={cn("px-6 py-4 select-none whitespace-nowrap", col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                        {data.map((item: T, rowIdx: number) => (
                            <motion.tr
                                key={(item as { id?: string | number }).id || rowIdx}
                                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: rowIdx * 0.1, duration: 0.4 }}
                                onClick={() => onRowClick && onRowClick(item)}
                                className={cn(
                                    "group/row relative transition-all duration-300",
                                    onRowClick ? "cursor-pointer hover:bg-white/5" : "hover:bg-white/2"
                                )}
                            >
                                {columns.map((col: EliteTableColumn<T>, colIdx: number) => (
                                    <td key={colIdx} className={cn("px-6 py-5 text-sm text-zinc-300 relative z-10 transition-colors group-hover/row:text-white", col.className)}>
                                        {/* Cell Content */}
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            : (item[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}

                                {/* Row Hover Gradient */}
                                <td className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 pointer-events-none border-inline-start-2 border-gold-500" />
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <div className="p-12 text-center text-zinc-500 italic flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-2">
                        <span className="text-2xl">?</span>
                    </div>
                    {content?.noActiveSchedules || 'No active schedules found.'}
                </div>
            )}
        </motion.div>
    );
};

export default EliteTable;
