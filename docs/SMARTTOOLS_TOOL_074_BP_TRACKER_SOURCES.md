# Tool 074 — Blood Pressure Tracker Sources and Scope

Reviewed: 2026-10-25

## Primary sources

1. American Heart Association, “When To Call 911 About High Blood Pressure.” Last reviewed August 14, 2025. https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure
   - The page distinguishes severe readings above 180 systolic and/or 120 diastolic from an emergency that includes concerning symptoms. It advises waiting at least one minute and repeating a severe reading; if it remains high and no concerning symptoms are present, contact a health professional as soon as possible. When concerning symptoms accompany the severe reading, call emergency services.
2. American Heart Association / American College of Cardiology, “Top Things to Know: 2025 High Blood Pressure (BP) Guideline.” Updated August 14, 2025. https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline/top-things-to-know
   - Provides adult categories and states that severe hypertension in nonpregnant adults is above 180/120 mmHg. The tool uses the ordinary adult category thresholds shown by this source and does not implement the full diagnostic or treatment guideline.

## Implemented scope

- A single manually entered SBP/DBP pair is assigned a reference category and the engine calculates pulse pressure and mean arterial pressure. It does not diagnose hypertension, determine an emergency, or recommend medication changes.
- A severe-range reading triggers the AHA repeat-measurement guidance. The tool does not collect symptoms; therefore it presents symptom-dependent instructions in text and never infers the emergency branch from the numbers alone.
- The emergency message says “local emergency services” and does not assume the visitor is in the United States or display a fixed emergency number.
- The reference is described as general adult guidance. Pregnancy, symptoms, cuff/device validation, repeat averages, and individual clinician assessment are outside this single-reading tool.
- Provenance marks confidence `null` / `not_assessed`; no measurement reliability is fabricated from a manually entered value.

## Limitations

This is not a substitute for repeat measurements or professional care. A single reading may not reflect a person's usual blood pressure. The tool does not collect pregnancy status, symptoms, device type, posture, cuff size, or a series of readings. The AHA/ACC sources are displayed in the UI; no external clinical service or AI inference is used.
