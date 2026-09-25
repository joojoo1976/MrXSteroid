/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CANONICAL PAYMENT GATEWAY CONFIGURATION                                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The Admin Dashboard already had a per-gateway operational control
 * (`legacy-pages/MissionControl.tsx` → `gatewayRow()`, writing `admin_settings`
 * keys `gateway_paymob`, `gateway_stripe`, `gateway_spaceremit`,
 * `gateway_kashier` with values `disabled` | `sandbox` | `live`). It was
 * WRITE-ONLY: nothing on the server ever read those keys, so the operator's
 * choice had no effect on whether a payment could actually be initiated.
 *
 * This module is the reader that closes that loop. It introduces no new table,
 * no new column, and no new state vocabulary — the three literal values are the
 * ones the existing `<select>` already writes.
 *
 * THE TWO AXES (kept deliberately separate)
 * -----------------------------------------
 *   operational status  → may a payment session be initiated at all?
 *   customer visibility → may the gateway be RENDERED to a shopper?
 *
 * `ACTIVE + HIDDEN` is a valid, supported combination: the integration stays
 * fully present and functional server-side (adapters, routes, webhook,
 * reconciliation, tests) and can be re-shown at any time by flipping one
 * setting, with no rebuild. Visibility NEVER changes operational state, and
 * operational state NEVER implies visibility.
 *
 * DEFAULTS ARE DELIBERATE
 * -----------------------
 * A MISSING `gateway_<name>` row means "the operator has never touched this
 * control", and the correct default is the gateway's current effective
 * behaviour — which is *working*.
 *
 * Verified production `admin_settings` (2026-09-25): `gateway_kashier`=live,
 * `gateway_spaceremit`=live, `gateway_paymob`=disabled, and `gateway_stripe` has
 * NO ROW AT ALL. So `DEFAULT_GATEWAY_STATE` must be 'live' for Stripe to keep
 * working; defaulting an absent row to `disabled` would have silently switched
 * Stripe off in production.
 *
 * The admin `<select>` previously *displayed* `disabled` for an absent row,
 * which mis-reported the working Stripe gateway; it now derives its display from
 * this same resolver, so the UI and the server can never disagree.
 */

/**
 * The canonical operational states.
 *
 * These are NOT invented here — they are the exact `value` strings the existing
 * admin three-state `<select>` writes:
 *   <option value="disabled">  <option value="sandbox">  <option value="live">
 * `live` is the value that means "the gateway operates".
 */
export const GATEWAY_OPERATIONAL_STATES = ['disabled', 'sandbox', 'live'] as const;
export type GatewayOperationalState = (typeof GATEWAY_OPERATIONAL_STATES)[number];

/** The state that means "this gateway works". */
export const ACTIVE_GATEWAY_STATE: GatewayOperationalState = 'live';

/** Effective state for a gateway with no `gateway_<name>` row. */
export const DEFAULT_GATEWAY_STATE: GatewayOperationalState = 'live';

/**
 * Effective customer visibility for a gateway with no
 * `gateway_<name>_customer_visible` row.
 *
 * `true`: an untouched gateway stays visible, i.e. exactly how every gateway
 * behaves today. A gateway only becomes hidden when an operator explicitly
 * stores `false` — which is what was done for Paymob. Note this default is why
 * hiding Paymob REQUIRES an explicit row: production had no
 * `gateway_*_customer_visible` rows at all before this change.
 */
export const DEFAULT_CUSTOMER_VISIBLE = true;

/**
 * Customer-visibility settings key suffix. Stored in the SAME `admin_settings`
 * table, same `section: 'gateways'`, following the same `gateway_*` convention —
 * no new schema. Absent means visible, so gateways nobody has touched keep
 * behaving exactly as they do today.
 */
export const CUSTOMER_VISIBLE_SUFFIX = '_customer_visible';

export type GatewayName = 'paymob' | 'stripe' | 'kashier' | 'spaceremit';

/** The four gateways the existing admin control manages. */
export const ADMIN_MANAGED_GATEWAYS: readonly GatewayName[] = [
    'paymob',
    'stripe',
    'kashier',
    'spaceremit',
];

export const operationalKey = (name: string): string => `gateway_${name}`;
export const customerVisibleKey = (name: string): string => `gateway_${name}${CUSTOMER_VISIBLE_SUFFIX}`;

export interface GatewayConfig {
    name: string;
    /** Canonical operational state. Never an unknown string. */
    operational: GatewayOperationalState;
    /** May this gateway be rendered to a shopper? */
    customerVisible: boolean;
    /** True only when the operator explicitly stored a recognised value. */
    operationalWasExplicit: boolean;
    customerVisibleWasExplicit: boolean;
}

type Row = { key: string; value: string };

/** Narrow arbitrary stored text to a canonical state, or fall back. */
export function normalizeGatewayState(raw: unknown): GatewayOperationalState {
    const v = String(raw ?? '').trim().toLowerCase();
    return (GATEWAY_OPERATIONAL_STATES as readonly string[]).includes(v)
        ? (v as GatewayOperationalState)
        : DEFAULT_GATEWAY_STATE;
}

/**
 * Parse the stored settings rows into per-gateway config.
 *
 * Unknown/garbage values fall back to the default rather than throwing: a typo
 * in an admin text field must not take a payment gateway offline.
 */
export function parseGatewayConfig(rows: Row[]): Record<string, GatewayConfig> {
    const map = new Map<string, string>();
    for (const r of rows) {
        if (r && typeof r.key === 'string') map.set(r.key, String(r.value ?? ''));
    }

    const out: Record<string, GatewayConfig> = {};
    const names = new Set<string>([
        ...ADMIN_MANAGED_GATEWAYS,
        ...[...map.keys()]
            .filter((k) => k.startsWith('gateway_'))
            .map((k) => k.slice('gateway_'.length).replace(CUSTOMER_VISIBLE_SUFFIX, '')),
    ]);

    for (const name of names) {
        if (!name) continue;
        const rawState = map.get(operationalKey(name));
        const rawVisible = map.get(customerVisibleKey(name));
        out[name] = {
            name,
            operational: normalizeGatewayState(rawState),
            customerVisible: rawVisible == null
                ? DEFAULT_CUSTOMER_VISIBLE
                : String(rawVisible).trim() === 'true',
            operationalWasExplicit: rawState != null,
            customerVisibleWasExplicit: rawVisible != null,
        };
    }
    return out;
}

export type GatewayRowLoader = () => Promise<Row[]>;

export type GatewayConfigMap = Record<string, GatewayConfig>;

export async function loadGatewayConfig(getRows: GatewayRowLoader): Promise<Record<string, GatewayConfig>> {
    try {
        return parseGatewayConfig(await getRows());
    } catch {
        // Config read failure must NOT take payment gateways offline; fall back
        // to the effective defaults, which is the current production behaviour.
        return parseGatewayConfig([]);
    }
}

/**
 * Can a payment session be INITIATED for this gateway?
 *
 * Only `live` qualifies. `sandbox` and `disabled` are both refused: there is no
 * sandbox capture path wired up, so honouring that state as "allowed" would be
 * a lie. An absent row resolves to `live` (see the defaults note above).
 */
export function isOperationallyAllowed(cfg: GatewayConfigMap | undefined, name: string): boolean {
    if (!cfg) return true;
    const entry = cfg[name];
    if (!entry) return true;
    return entry.operational === ACTIVE_GATEWAY_STATE;
}

/**
 * May this gateway be RENDERED to a shopper?
 *
 * Visibility is NOT a bypass of operational state: a gateway that is not
 * operationally allowed is never rendered regardless of its visibility flag.
 */
export function isCustomerRenderable(cfg: GatewayConfigMap | undefined, name: string): boolean {
    if (!isOperationallyAllowed(cfg, name)) return false;
    if (!cfg) return true;
    const entry = cfg[name];
    if (!entry) return true;
    return entry.customerVisible;
}
