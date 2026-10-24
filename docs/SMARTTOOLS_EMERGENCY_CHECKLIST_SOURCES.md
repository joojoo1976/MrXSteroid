# SmartTools Tool 146 — Emergency Warning Signs Source Register

Reviewed: 2026-10-24
Rule set: `acep-know-when-to-go-reviewed-2026-10-24-v1`

## Sources

- **Primary source:** American College of Emergency Physicians, [Know When to Go](https://www.emergencyphysicians.org/article/know-when-to-go/know-when-to-go-overview). The page provides separate adult and pediatric warning-sign lists and states the lists are not exhaustive. It recommends seeking immediate care when a person may be experiencing an emergency.
- **Supporting source:** U.S. National Library of Medicine, MedlinePlus, [Recognizing medical emergencies](https://medlineplus.gov/ency/article/001927.htm). It attributes its warning signs to ACEP, includes adult and child groups, advises calling the local emergency number without delay when needed, and carries a review date of 2025-01-08.
- Source pages were manually checked on 2026-10-24. The app ships concise paraphrases as a fixed, versioned rule pack; it does not scrape, fetch, or interpret source pages at runtime.

## Rule and matching method

- Adult and pediatric signs are represented as separate, stable identifiers in `lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6.ts`.
- The list is paraphrased rather than copied verbatim. Arabic is an explanatory translation written for the tool and is not an official ACEP translation.
- The user first selects adult or child, then explicitly selects Yes, No, or Not sure for every displayed item. A match occurs only for an explicit Yes; no text parsing, symptom inference, diagnosis, probability, or severity scoring is performed.
- Any explicit Yes triggers urgent escalation even while other answers remain incomplete. The state remains `PARTIAL` until all questions are answered Yes or No. A complete all-No checklist is `NO_MATCH`, which explicitly does not establish safety or rule out an emergency.
- Missing or invalid rules or source metadata returns `NOT_AVAILABLE` and suppresses matching while preserving generic emergency escalation copy. Invalid inputs return `INVALID_INPUT`.

## Emergency numbers and limitations

- No country-specific number is currently configured. The number state is `NOT_AVAILABLE`, and the interface says to use the local emergency number. The tool does not infer location, request location, or display a hard-coded number.
- No country-specific number can be added until its source is reviewed and recorded in an approved source-backed registry.
- This is a non-exhaustive checklist, not a diagnosis, triage severity estimate, treatment tool, first-aid guide, or replacement for professional assessment or emergency services. A no-match result is not a safety clearance.
