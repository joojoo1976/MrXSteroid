# V7 Tools 171–175 Scope Proposal (2026-10-26)

| ID | Approved identity | Safe implementation boundary |
|---:|---|---|
|171|cycle-length-optimizer|Record user-defined interval; no cycle optimization or recommendation.|
|172|bloodwork-trend-analyzer|Display arithmetic deltas between user entries; no lab interpretation.|
|173|compound-clearance|Mathematical decay scenario only; no clearance guarantee.|
|174|hormone-conversion|Generic labeled unit conversion only; no hormone dosing.|
|175|injection-schedule-planner|Record user-entered dates only; no generated injection schedule.|

Implementation is pending after owner review of these safety boundaries.

## Engine checkpoint (2026-10-26)
Implemented strict v7 educational engines for 171–175: date/observation records and arithmetic scenarios only. Focused tests: 5/5 PASS; TypeScript PASS. No protocol, dose, interpretation, clearance guarantee, or generated injection schedule.

## Application integration checkpoint (2026-10-26)
Added Page identities, registry records, category-first routes, and bilingual UI components for 171–175. Focused tests 5/5 PASS; TypeScript PASS; validate-tools 5/5 PASS. No database, commit, push, or deployment.
- Production build after integration: PASS, 395/395 pages (2026-10-26). Existing Browserslist and metadataBase warnings remain.
