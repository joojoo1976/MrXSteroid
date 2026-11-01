# Tool 130 source and scope update (2026-10-26)

Tool 130 is a deterministic rule-based plateau signal from dated user-entered metrics. It requires at least one metric per point and sufficient time span for a signal. It does not predict outcomes, diagnose causes, or prescribe a training change.

The v6 schema now enforces finite positive metrics, strict point/input objects, and unknown-field rejection. The output is a low/moderate/high rule signal with explicit uncertainty boundaries.
