# Scope Review: Planned Tools 132, 137–139

These entries remain `planned` and are intentionally excluded from the published catalog. No implementation or alias is being created without a separate scope decision.

| Tool | Current roadmap identity | Evidence-based blocker | Safe decision needed |
|---|---|---|---|
| 132 | AI pose and exercise form coach | Vision feedback can become an injury or medical assessment; no validated model is present in the checked-out implementation. | Approve a user-described observation record, or provide a validated vision specification and safety review. |
| 137 | Peptide/hormone reconstitution calculator | Reconstitution math can directly enable preparation and dosing; product-specific instructions and source validation are absent. | Approve label transcription only, or provide documented non-preparatory educational scope. |
| 138 | Raw powder density and oil formulation engine | Formulation calculations could enable compounding; no validated material database or laboratory workflow is present. | Approve sample-specific density measurement only, or provide a formal non-formulation scope. |
| 139 | Solvent/emulsifier ratio calculator | BA/BB ratio output could directly support preparation; no verified product instructions or safety model are present. | Approve generic dimensionless arithmetic with no chemical labels, or provide a separate safety and source decision. |

## Current status

`NOT READY FOR IMPLEMENTATION` pending owner scope approval. The published tools 236–245 already provide bounded label, ratio, and measurement records without exposing these preparation workflows; their implementations must not be silently treated as aliases for 137–139.
