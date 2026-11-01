import { z } from 'zod';

export const AcwrSessionSchema = z.object({
  date: z.string().date(),
  load: z.number().finite().min(0).max(100000),
}).strict();

export const AcwrInputSchema = z.object({
  sessions: z.array(AcwrSessionSchema).max(500),
}).strict();

export type AcwrSession = z.infer<typeof AcwrSessionSchema>;
export type AcwrInput = z.infer<typeof AcwrInputSchema>;
export type AcwrBand = 'insufficient_data' | 'undertraining' | 'optimal' | 'spike';

export interface AcwrResult {
  acuteLoad: number;
  chronicLoad: number | null;
  acwr: number | null;
  band: AcwrBand;
  sufficientData: boolean;
  recordedDays: number;
  disclaimer: string;
}

export function calculateTrainingLoadAcwrV6(input: AcwrInput): AcwrResult {
  const { sessions } = input;
  if (!Array.isArray(sessions)) throw new Error('invalid input');

  const parsed = sessions.map((s) => {
    if (!s || typeof s.date !== 'string') throw new Error('invalid date');
    const d = new Date(s.date);
    if (Number.isNaN(d.getTime())) throw new Error('invalid date');
    if (!Number.isFinite(s.load)) throw new Error('invalid load');
    return { date: d, load: s.load };
  });

  if (parsed.length === 0) return { acuteLoad: 0, chronicLoad: null, acwr: null, band: 'insufficient_data', sufficientData: false, recordedDays: 0, disclaimer: 'مؤشر نسبي، ليس ضمان إصابة أو عدم إصابة' };

  const DAY_MS = 24 * 60 * 60 * 1000;
  const dayStamp = (date: Date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayStamps = parsed.map((s) => dayStamp(s.date));
  const maxDay = Math.max(...dayStamps);
  const minDay = Math.min(...dayStamps);
  const sevenDayStart = maxDay - 6 * DAY_MS;
  const twentyEightDayStart = maxDay - 27 * DAY_MS;

  const inWindow = parsed.map((s, i) => ({ ...s, day: dayStamps[i] })).filter((s) => s.day >= twentyEightDayStart && s.day <= maxDay);
  const acuteLoad = inWindow.filter((s) => s.day >= sevenDayStart).reduce((a, b) => a + b.load, 0);
  const total28 = inWindow.reduce((a, b) => a + b.load, 0);

  const recordedDays = new Set(inWindow.map((s) => s.day)).size;
  const sufficientData = minDay <= twentyEightDayStart;

  if (!sufficientData) {
    return { acuteLoad, chronicLoad: null, acwr: null, band: 'insufficient_data', sufficientData: false, recordedDays, disclaimer: 'مؤشر نسبي، ليس ضمان إصابة أو عدم إصابة' };
  }

  const chronicLoad = total28 / 4;
  const acwr = chronicLoad === 0 ? null : acuteLoad / chronicLoad;
  const band: AcwrBand = acwr === null ? 'undertraining' : acwr < 0.8 ? 'undertraining' : acwr <= 1.3 ? 'optimal' : 'spike';

  return { acuteLoad, chronicLoad, acwr, band, sufficientData: true, recordedDays, disclaimer: 'مؤشر نسبي، ليس ضمان إصابة أو عدم إصابة' };
}

