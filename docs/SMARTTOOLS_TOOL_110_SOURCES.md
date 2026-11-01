# Tool 110 source and scope update (2026-10-26)

Tool 110 is a deterministic portion reference estimator. It does not receive image pixels or call an external AI model. The UI now starts with an empty food list rather than seeded meal data. The schema is strict and rejects attached photos unless explicit consent is `given`.

Focused existing engine tests: `npx vitest run lib/tools/engines/tool-110-ai-meal-vision-scanner.test.ts` — to be rerun with the full 101–110 batch.

Limitations: generalized plate arithmetic is not nutritional measurement; no meal plan, prescription, diagnosis, or medical guidance is produced. Browser, accessibility, and live persistence remain unverified.
