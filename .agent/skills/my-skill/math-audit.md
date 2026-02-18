---
name: equation-validator
description: A specialized mathematical auditor for "Mr. X-Steroid". Reviews, debugs, and upgrades algorithms related to dosage, shipping, unit conversion, and biological half-life.
---

# Equation & Logic Auditor (Mr. X Protocol)

This skill treats every mathematical operation in the codebase as a critical mission component. Errors in dosage math cause harm; errors in billing math cause loss.

## 1. Audit Protocols (The 3-Step Verification)

When reviewing ANY code containing math (`+`, `-`, `*`, `/`, `%`, `Math.pow`), apply this sequence:

### A. Dimensional Consistency Check

* **Input vs. Output:** Ensure units match. Do not subtract `lbs` from `kg`. Do not multiply `currency` by `distance`.
* **The Fix:** If a mismatch is found, inject a conversion helper function immediately.

### B. The "Red Line" Safety Check (Domain Specific)

* **Dosage Logic:** Scan for calculations involving `mg`, `ml`, or `iu`.
  * *Rule:* If a calculated dosage exceeds standard medical limits (e.g., > 1000mg/week for a beginner), flag it as a **[CRITICAL HAZARD]**.
* **Financial Logic:** Scan for totals.
  * *Rule:* Total Price can never be negative. Shipping cannot be zero for physical items.

### C. Algorithmic Upgrade (Refactoring)

* **Replace:** `x = x + 1` loops → **Vectorized operations** or direct formulas.
* **Precision:** Replace standard floating-point math for money (`0.1 + 0.2`) with `decimal` or integer-based math (cents) to avoid rounding errors.

## 2. Targeted Domains

### Domain 1: Pharmacokinetics (The "Cycle" Math)

Review `Half-Life` and `Active Life` formulas.

* *Current (Basic):* Linear decay (Wrong).
* *Upgrade Target:* Implement Exponential Decay Formula:
    $$C_t = C_0 \times (0.5)^{\frac{t}{t_{1/2}}}$$
* *Ester Weight Adjustment:* Ensure calculations account for the ester weight (e.g., Testosterone Enanthate is only ~70% actual testosterone).

### Domain 2: Logistics & E-commerce

Review `Shipping` and `Tax` calculators.

* *Validation:* Ensure (Base Rate + (Weight * Factor)) logic is robust.
* *Edge Case:* What happens if Weight is 0? Or Country is undefined? (Must fallback to default safe values).

## 3. How to Provide Feedback

Don't just say "It's wrong." Output the correction like this:

**Location:** `src/utils/cycle-calculator.ts`
**Error:** Linear subtraction used for half-life.
**Risk:** Inaccurate blood concentration levels.
**The Fix (Code):**

```typescript
// UPGRADED ALGORITHM: Exponential Decay
export const calculateRemainingLevel = (dose: number, daysElapsed: number, halfLife: number): number => {
  return dose * Math.pow(0.5, daysElapsed / halfLife);
};
