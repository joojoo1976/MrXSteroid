import {
  MeasurementSummaryInputSchema,
  MeasurementSummaryResultSchema,
  type DescriptiveSeries,
  type MeasurementReading,
  type MeasurementSummaryInput,
  type MeasurementSummaryResult,
} from '../schemas/tool-029-side-effect-early-warning';

function summarize(metric: DescriptiveSeries['metric'], values: number[], unit: DescriptiveSeries['unit']): DescriptiveSeries | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    metric,
    count: values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    arithmeticMean: sum / values.length,
    unit,
  };
}

/** Computes descriptive statistics only; it applies no clinical thresholds or inference. */
export function summarizeMeasurementReadingsV7(readings: readonly MeasurementReading[]): MeasurementSummaryResult {
  const validated: MeasurementSummaryInput = MeasurementSummaryInputSchema.parse({ readings });
  const bloodPressure = validated.readings.filter((reading) => reading.metric === 'blood_pressure');
  const pulse = validated.readings.filter((reading) => reading.metric === 'pulse');
  const summaries = [
    summarize('blood_pressure_systolic', bloodPressure.map((reading) => reading.systolicMmHg), 'mmHg'),
    summarize('blood_pressure_diastolic', bloodPressure.map((reading) => reading.diastolicMmHg), 'mmHg'),
    summarize('pulse', pulse.map((reading) => reading.beatsPerMinute), 'beats/min'),
  ].filter((series): series is DescriptiveSeries => series !== null);

  return MeasurementSummaryResultSchema.parse({
    resultOrigin: 'CALCULATED',
    method: 'DESCRIPTIVE_ARITHMETIC_ONLY',
    clinicalAssessment: 'NOT_AVAILABLE',
    readings: validated.readings.map((reading) => ({ ...reading })),
    summaries,
  });
}
