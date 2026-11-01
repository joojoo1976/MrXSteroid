# Tool 108 source and scope update (2026-10-26)

The implementation is a deterministic Deurenberg/body-composition reference estimator from user-entered measurements. It is not an AI vision model and does not receive image pixels. The input schema now enforces finite bounded values, integer age/photo counts, and rejects unknown fields.

No diagnosis, stage classification, training prescription, or external image service is provided. Visual confidence is metadata quality only, not measurement accuracy.

Focused tests are included in the 101–110 engine batch. Browser, accessibility, and live persistence remain unverified.
