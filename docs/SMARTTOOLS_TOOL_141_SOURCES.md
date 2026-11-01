# Tool 141 — Physical model and source boundaries

**Review date:** 2026-10-25  
**Purpose:** educational calculation of ideal pressure drop for a user-described Newtonian fluid in one ideal straight circular tube. This is not a medical, injection, device-suitability or product assessment.

## Source basis

1. OpenStax, [12.4 Viscosity and Laminar Flow; Poiseuille’s Law](https://openstax.org/books/college-physics/pages/12-4-viscosity-and-laminar-flow-poiseuilles-law). The source gives the laminar tube resistance relation `R = 8 μ L / (π r⁴)` and flow relation `Q = ΔP / R`, for an incompressible fluid in a uniform-radius tube. Substituting `r = d/2` yields `ΔP = 128 μ L Q / (π d⁴)`. The engine uses this algebraic rearrangement; it does not alter the physical relation.
2. NIST, [Reference Building Plumbing Models](https://www.nist.gov/document/nistreferencebuildingplumbingmodelsbod), Reynolds-number section. It labels `Re < 2,000` laminar, `Re > 4,000` turbulent, and values between 2,000 and 4,000 unpredictable for its pressure-loss calculation. The engine follows those explicit decision boundaries: calculate only below 2,000; return `NOT_AVAILABLE/TRANSITIONAL_FLOW` for 2,000–<4,000; and `NOT_AVAILABLE/TURBULENT_FLOW` at or above 4,000. This is a model applicability gate, not a universal claim about every geometry or fluid.
3. Dexter MB, Shott MJ. [The evaluation of the force to expel oily injection vehicles from syringes](https://pubmed.ncbi.nlm.nih.gov/39986/). *J Pharm Pharmacol.* 1979;31(8):497–500. PMID 39986. The abstract describes plunger resistance in disposable plastic syringes and increased binding after exposure of rubber tips to some vegetable oils. This supports explicitly excluding real syringe plunger force from an ideal tube-only calculation.

## Input provenance and dimensional handling

- User supplies dynamic viscosity, density, tube internal diameter, straight tube length, an assumed volumetric flow rate, and the temperature at which fluid properties were measured.
- Viscosity and density source text is mandatory; the tool does not supply a material-property database or verify the cited source. Temperature is recorded and reported as provenance; the tool does not estimate viscosity/density at a different temperature.
- UI conversions feed canonical SI values into the engine: mPa·s or cP to Pa·s; kg/m³ or lb/ft³ to kg/m³; mm or in to m; mL/min or US fl oz/min to m³/s; °C or °F to °C. The result is displayed in kPa or psi according to the shared unit preference.
- Explicit assumption acknowledgement is required: steady, incompressible, Newtonian fluid; fully developed laminar flow; rigid, straight circular tube with constant internal diameter.
- Reynolds number is `Re = ρ v d / μ`, with `v = Q / (π(d/2)²)`. The reported result is a theoretical pressure difference in the tube only.

## Limits

No actual syringe pressure, plunger force, needle/device resistance, injection time, injectability, sterility, product stability, clinical safety, dose, preparation, formulation, or use recommendation is computed. The model omits entrance/exit effects, connectors, bends, non-Newtonian or shear-dependent behavior, changing geometry, device tolerances, and measured calibration. User-supplied property sources are not validated.
