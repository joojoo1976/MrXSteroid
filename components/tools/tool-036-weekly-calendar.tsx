'use client';
/**
 * Tool #036 V3 — weekly injection calendar with dnd-kit drag-and-drop.
 *
 * Mounted via `next/dynamic` with `ssr:false` in the parent so `@dnd-kit/core`
 * stays out of the route chunk and the First Load JS budget holds.
 * Every shot also carries explicit ←/→ move buttons: HTML5/pointer dragging is
 * unreliable on touch, so the buttons give full parity.
 */
import React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensors,
  useSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import { classifyVolumeZone } from '@/lib/tools/engines/tool-036-injection-schedule';

export interface CalendarShot {
  id: string;
  siteId: string;
  volumeMl: number;
  mg: number;
}

export interface CalendarDay {
  dayIndex: number;
  label: string;
  shots: CalendarShot[];
}

const ZONE_CLS: Record<string, string> = {
  green: 'border-lime-400/40 bg-lime-400/10 text-lime-200',
  yellow: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  red: 'border-rose-500/50 bg-rose-500/10 text-rose-200',
};

function ShotChip({
  shot,
  index,
  dayCount,
  onMove,
}: {
  shot: CalendarShot;
  index: number;
  dayCount: number;
  onMove?: (id: string, toDay: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: shot.id });
  const zone = classifyVolumeZone(shot.volumeMl, shot.siteId).zone;

  return (
    <div
      ref={setNodeRef}
      data-testid={`cal-chip-${shot.id}`}
      data-zone={zone}
      aria-label={`injection ${shot.id} ${shot.siteId}`}
      className={`flex items-center justify-between gap-1 rounded-md border px-1.5 py-1 font-mono text-[11px] ${ZONE_CLS[zone] ?? ZONE_CLS.green} ${isDragging ? 'opacity-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      <span className="truncate">
        {shot.siteId} · {shot.mg}mg
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {index > 0 && (
          <button
            type="button"
            data-testid={`cal-move-left-${shot.id}`}
            aria-label="move to the previous day"
            className="px-1"
            onClick={(e) => {
              e.stopPropagation();
              onMove?.(shot.id, index - 1);
            }}
          >
            ←
          </button>
        )}
        {index < dayCount - 1 && (
          <button
            type="button"
            data-testid={`cal-move-right-${shot.id}`}
            aria-label="move to the next day"
            className="px-1"
            onClick={(e) => {
              e.stopPropagation();
              onMove?.(shot.id, index + 1);
            }}
          >
            →
          </button>
        )}
      </span>
    </div>
  );
}

function DayColumn({
  day,
  index,
  dayCount,
  onMove,
}: {
  day: CalendarDay;
  index: number;
  dayCount: number;
  onMove?: (id: string, toDay: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day.dayIndex}` });

  return (
    <div
      ref={setNodeRef}
      data-testid={`cal-day-${index}`}
      className={`flex min-h-[128px] flex-col gap-1 rounded-lg border p-1.5 ${
        isOver ? 'border-gold-500/60 bg-white/5' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="text-center font-mono text-[10px] uppercase tracking-wider text-zinc-500">{day.label}</div>
      {day.shots.map((shot) => (
        <ShotChip key={shot.id} shot={shot} index={index} dayCount={dayCount} onMove={onMove} />
      ))}
    </div>
  );
}

export default function Tool036WeeklyCalendar({
  days,
  onMove,
}: {
  days: CalendarDay[];
  onMove?: (id: string, toDay: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId?.startsWith('day-')) return;
    const target = Number(overId.slice(4));
    if (!Number.isInteger(target)) return;
    onMove?.(activeId, target);
  }

  return (
    <div data-testid="weekly-calendar" className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <DayColumn key={day.dayIndex} day={day} index={i} dayCount={days.length} onMove={onMove} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
