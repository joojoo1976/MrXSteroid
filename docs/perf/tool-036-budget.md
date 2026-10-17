# Tool-036 — Performance Budget (Mobile-First)

**Status:** DESIGN ONLY. **Target device:** emulated Moto G4, Slow-4G, 4× CPU throttle.
**Enforcement:** CI budget gate in Phase 2 (fails the build if exceeded).

---

## 1. Hard targets

| Metric | Target | Hard fail |
|---|---|---|
| **LCP** | < 1.5 s | > 1.8 s |
| **TTI / INP-proxy** | < 2.5 s | > 3.0 s |
| **CLS** | < 0.1 | > 0.15 |
| **First-load JS (Level 1)** | < 150 KB gz | > 170 KB gz |
| **Lighthouse Performance** | > 90 | < 85 |
| **Horizontal scroll @375px** | none | any |

---

## 2. Bundle budget by level

| Chunk | Contents | Budget (gz) | Loaded |
|---|---|---|---|
| **L1 (initial)** | RSC shell, CompoundSelector, WeeklyList, VolumeGuardBadge, NextInjectionCard, Footer, PersonaToggle | **≤ 150 KB** | always |
| **L2 (lazy)** | BodyMap2D SVG (~4 KB), ComfortFactors, PersonalLogger, RotationTable | ≤ 40 KB | on tap / in-view |
| **L3 (isolated)** | Recharts, dnd-kit, heatmap, PDF | ≤ 120 KB | Pro Lab tab only |

**Forbidden in L1 graph:** `recharts`, `dnd-kit`, any 3D lib, any chart/PDF lib.

---

## 3. Techniques (required)

1. **RSC by default** — `page.tsx` and `WeeklyList` server-rendered; client islands only where interactive.
2. **`next/dynamic`** for L2/L3 with `{ ssr: false }` where hydration is unnecessary.
3. **`IntersectionObserver`** to trigger L3 chart import when scrolled into view (not on load).
4. **Skeleton** placeholders sized to final dimensions (prevents CLS).
5. **`next/font`** self-hosted with `display: swap` (no render-blocking web fonts).
6. **No layout-shifting banners** — L1 educational banner is inline, fixed height.
7. **Explicit `width`/`height`** on SVG/`<img>`; SVG body map is inline DOM (no network).
8. **Defer** non-critical work (logging flush, evidence prefetch) to `requestIdleCallback`.

---

## 4. Measurement plan

- **Local:** `next build` bundle analyzer (`@next/bundle-analyzer`) + Lighthouse CI on emulated Moto G4.
- **Preview:** Vercel preview (SSO-protected) + Lighthouse; compare against budget table.
- **CI gate:** parse the build manifest; assert L1 chunk ≤ 150 KB gz and absence of forbidden libs (§2).
- **Regression rule:** any PR that raises L1 JS by > 10 KB must justify it in the PR description.

---

## 5. Expected LCP path (Level 1)

```
HTML (RSC) → inline critical CSS → text paints (header + weekly list)
           → minimal client island hydrates (selector, guard badge)
           → LCP = largest text block (weekly list / next-injection card)
Charts, body map, PDF, Gantt: NOT in the LCP path (lazy/isolated).
```

---

## 6. Risk register (performance)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Charts leak into L1 via barrel import | Medium | `no-restricted-imports` lint on `level1/**` |
| Waterfall from dynamic import on tap → 300 ms blank | Medium | Prefetch L2 chunk on `idle` after L1 paint |
| Web-font FOIT | Low | `next/font` + `swap` |
| SVG body map re-render storm | Low | memo + static site geometry |
| CLS from skeleton mismatch | Medium | size skeletons to exact final box |

---

*Budget reviewed at each phase gate. No phase merges without a passing budget report.*
