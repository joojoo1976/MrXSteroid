import Tool036V4Shell from '@/components/tools/tool-036-v4/tool-036-v4-shell';
import { DICT } from '@/lib/tools/tool-036-v4/i18n-copy';
import { RULE_BY_ID } from '@/lib/tools/tool-036-v4/rules/registry';

/**
 * Tool-036 V4 preview route (decision R1): branch-only surface, outside the
 * SmartTools catalog, noindexed, never linked from the tool registry.
 * V3 remains the live production surface, untouched.
 *
 * Bundle gate (acceptance-fixes-plan: preview route First Load JS ≤ 150 kB):
 * the interface copy and the cited-rule corpus are resolved here, on the
 * server, and passed to the shell as props. Both are data, so this is what
 * keeps them out of the route's client entry chunk; the shell itself no longer
 * imports either module. Rendering is unchanged (the shell still runs on the
 * server and on the client with the same content).
 */
export default function Tool036V4PreviewPage() {
  return <Tool036V4Shell dict={DICT} rules={RULE_BY_ID} />;
}