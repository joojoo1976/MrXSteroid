# T3 — L2 Runtime Translation CACHE ARCHITECTURE DECISION

**Date:** 2026-09-26
**Status:** owner-acknowledged for the T3 phase
**Scope:** runtime translation cache for the D-10 L2 inline path
**Supersedes:** nothing. Adds to the T1/T2 foundation.

---

## 1. The decision

The T3 runtime translation cache is a **client-side, in-memory cache**, implemented in
`lib/translation/cache.ts`.

It is **not** a server cache, and it is **not** backed by Redis, Vercel KV, Upstash, or any
other shared store.

This is a **deliberate deviation from the original working assumption** that an approved,
general-purpose cache architecture already existed and would simply be reused.

---

## 2. Why there is a deviation — the assumption did not hold

The T3 work began on the premise that an existing cache architecture would be integrated.
An exhaustive search of the repository found **no general cache layer** to integrate:

| Candidate inspected | Finding |
| --- | --- |
| `lib/ratelimit.ts` (Upstash Redis) | Rate limiting only. Fixed-window counters, no get/set of cached values, no TTL store, no key-namespacing convention for content. **Not a cache.** |
| `features/modal/PreferencesModal` draft cache | `localStorage`, key `mrx:tool-draft:v1:macro`. Scoped to one tool's form drafts, single hardcoded key, no identity folding, no LRU, no TTL. **Not a translation cache and not a general cache.** |
| `cache:` fetch options | `no-store` on authenticated/sensitive surfaces. Used to *prevent* caching. **Not a cache.** |
| Any `CacheStorage` / service worker | None present. |

There was therefore **no approved architecture to integrate**. Rather than invent a server
cache under a pre-production gate, the phase was completed with a client cache that satisfies
the one cache requirement that *is* binding — the §33 identity contract — and the gap was
escalated rather than silently papered over.

**Escalated to the owner. Acknowledged as accepted for T3.**

---

## 3. Binding requirement: the §33 identity contract

A cache entry may only be reused if it was produced by the *same* configuration. The key
therefore folds in every dimension that can change a translation:

```
mrx:translate:v1:<source>:<target>:<engineVersion>:<glossaryVersion>:<providerId>:<modelIdentifier>:<length>:<fingerprint>
```

| Dimension | Source of truth | Effect of a change |
| --- | --- | --- |
| `source` | The request contract. Always `en` (§3/§37). | Different source ⇒ different key. |
| `target` | Application registry ∩ verified provider capability. | Different target ⇒ different key. |
| `engineVersion` | `TRANSLATION_ENGINE_VERSION` (`server/translation/contracts.ts`). | An engine release must not serve stale output. |
| `glossaryVersion` | `TRANSLATION_GLOSSARY_VERSION`. | A glossary change must not serve stale output. |
| `providerId` | `ProviderIdentity.providerId`. | A provider swap must not serve the old vendor's output. |
| `modelIdentifier` | `ProviderIdentity.modelIdentifier` (e.g. `general/nmt`). | A model change must not serve the old model's output. |
| `length` | Source length bucket. | Prevents a short-string entry masking a longer one. |
| `fingerprint` | Hash of the exact source text. | Prevents different text colliding in one entry. |

**Reads re-validate**, they do not merely trust the key. A hit is only returned when the
stored identity is *deeply equal* to the caller's current identity **and** the stored source
text is byte-identical. A malformed or partial identity is a **miss**, never a hit.

**Only successful translations are cached.** A failure is never stored, so a transient outage
cannot be baked in.

---

## 4. Invalidation behaviour

| Trigger | Behaviour |
| --- | --- |
| Any identity dimension changes | Old entry becomes unreachable — the new key cannot match it. No scan-and-delete is needed, and no stale entry can be served. |
| TTL expiry | 12 hours. Entry is dropped on read. |
| LRU pressure | Maximum 500 entries; the least-recently-used entry is evicted. |
| Source text differs | `fingerprint` mismatch ⇒ miss. |
| Target no longer provider-verified | Capability is re-checked **before** the cache is consulted. A cache hit is impossible for a target that has left the verified set. |
| Page reload / new process / new tab | **The entire cache is gone.** See §5. |
| Explicit refresh | Re-runs capability discovery. Does **not** clear cached translations. |

### Documented limitation — `refresh()` and mid-session model change

`refresh()` re-verifies *capability* but does not discard cached translations. If the
provider's model or provider id changed **while the page was open**, a cache entry produced
under the old identity could in principle still be served, because the client has not yet
learned the new identity (it only learns an identity from a successful `POST` response).

This is bounded in practice, not eliminated:

* the cache is **in-memory only**, so a reload, redeploy, or new tab always starts empty and
  therefore always re-derives identity from a real response;
* the route re-verifies the target against the live capability set on every request;
* the identity dimensions are still in the key, so once the new identity is learned the old
  entries are unreachable.

**This is a known, accepted trade-off, not an oversight.** Closing it fully would require the
capability response to carry a model/provider fingerprint, which would change the locked
`GET /api/translate` contract. That is out of scope for T3.

---

## 5. Scope: intentionally non-persistent

The cache is **intentionally non-persistent** unless separately specified otherwise:

* **Not** written to `localStorage`, `sessionStorage`, `IndexedDB`, or `CacheStorage`.
* **Not** written to disk, and **not** sent to the server.
* **Not** shared between browser tabs, users, devices, or server processes.
* **Survives only** the lifetime of one JavaScript context (a page load / SPA session).

Consequences accepted for this phase:

* A reload re-fetches. This is a cost/latency trade-off, accepted in exchange for eliminating
  any risk of persisting machine-translated content in browser storage.
* No cross-user cache-poisoning surface, because no cache is shared.
* No cache-coherence problem across processes, because there is no shared cache.

A persistent or shared cache would change the privacy and invalidation posture and requires a
**separate owner decision**.

---

## 6. Explicitly out of scope for T3

Per owner instruction, this phase must **not** broaden the cache architecture. The following
are **not** done and must not be introduced without a separate decision:

* Redis / Upstash / Vercel KV / any server-side cache.
* `localStorage`, `sessionStorage`, IndexedDB, or service-worker persistence.
* Cross-tab or cross-user cache sharing.
* ETag / `If-None-Match` revalidation, stale-while-revalidate, or background prefetch.
* Speculative pre-translation of surfaces the user has not requested.
* Any change to the locked `GET`/`POST /api/translate` contract, including adding an identity
  or model fingerprint to the capability response.

---

## 7. Operational consequences

1. **The real cost of a reload is a real API call.** With the client cache, each fresh page
   load in a target language pays for the strings it displays, subject to the route's
   10 requests/minute limit and 4-distinct-target window. The L2 scanner mitigates this by
   deduplicating identical strings and capping a pass at 8 requests, which leaves headroom
   under the route limit.
2. **Rate limiting is per page load, not per user session.** A user who reloads repeatedly
   consumes the per-IP budget faster than a shared server cache would allow. Monitoring
   should watch `RATE_LIMITED` on `/api/translate` as the leading indicator that a shared
   cache is needed.
3. **Provider configuration changes take effect on the next request.** Because the cache
   does not outlive the page, a credential or model change is picked up immediately by any
   new page load.

---

## 8. Where the code lives

| Concern | File |
| --- | --- |
| Key builder, TTL/LRU store, identity equality | `lib/translation/cache.ts` |
| Identity source (`engineVersion`, `glossaryVersion`) | `server/translation/contracts.ts` |
| Identity source (`providerId`, `modelIdentifier`) | `server/translation/provider.ts` |
| Consumer / lifecycle | `context/RuntimeTranslationProvider.tsx` |
| Key + invalidation + non-persistence tests | `lib/translation/cache.test.ts` |
