# Tool 102 source and scope update (2026-10-26)

Tool 102 is an educational Bateman absorption/elimination comparison using a dose and concentration already supplied by the user. It does not select a dose, route, frequency, compound, or injection protocol.

The schema now requires finite bounded values and rejects unknown fields. The adapter reports unassessed data quality rather than an artificial confidence score.

Because the model concerns injection routes and controlled substances, source and owner scope review remain required before rollout.
