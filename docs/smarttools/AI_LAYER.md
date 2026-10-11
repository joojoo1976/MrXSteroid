# SmartTools AI Layer — Design & Governance

Implements the AI requirements at platform level while respecting SPEC §15, §19,
§37, §39 and §48-B (contracts, safe degradation).

## Components

| Module | Responsibility |
|---|---|
| `lib/ai/types.ts` | Provider-agnostic contracts + optional vision/voice/memory contracts |
| `lib/ai/nlp.ts` | Arabic/English normalisation, tokenisation, intent classification, bilingual synonym expansion (fully offline) |
| `lib/ai/guard.ts` | Safety gate: blocks personalised dosing, escalates emergencies |
| `lib/ai/recommend.ts` | Grounded recommendations from the registry/catalogue only |
| `lib/ai/provider.ts` | Pluggable OpenAI-compatible HTTP provider; no-op when unconfigured |
| `lib/ai/service.ts` | Orchestration: intent → safety → grounding → provider → deterministic fallback |
| `app/api/smarttools/assistant/route.ts` | POST assistant (rate-limited; auth required when a costly provider is configured) |
| `app/api/smarttools/recommend/route.ts` | GET grounded recommendations (public, rate-limited) |

## Safety posture

- **No personalised dosing.** `dosing-request` intents are refused with a
  clinician referral; the refusal is deterministic and does not depend on a model.
- **Emergency escalation.** `emergency` intents return an unmissable urgent-care
  message (EN/AR) and never a calculation.
- **No hallucinated tools.** Suggestions are always drawn from the catalogue.
- **Rate limited + auth-gated** for costly AI (SPEC §15.1, §37).
- **No health data persistence** in these endpoints; image/voice are contract-only.

## Verification

- `lib/ai/ai.test.ts` — 16 tests: normalisation, intent, guard, provider fallback,
  recommendations, service fallback (EN/AR), emergency + dosing refusal.
- **PASS**: deterministic fallback, guardrails, grounding, API structure.
- **NOT RUN**: real model output — requires `AI_PROVIDER_URL` + `AI_PROVIDER_API_KEY`
  (no provider credentials are present in this environment). The provider path is
  therefore not claimed as verified.

## Enabling a real provider (server-side only)

```
AI_PROVIDER_URL=https://api.example.com/v1
AI_PROVIDER_API_KEY=****
AI_PROVIDER_MODEL=gpt-4o-mini
```

Never expose these to the client. When configured, the assistant endpoint requires
a valid Supabase bearer token (401 otherwise).
