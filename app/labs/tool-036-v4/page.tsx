import Tool036V4Shell from '@/components/tools/tool-036-v4/tool-036-v4-shell';

/**
 * Tool-036 V4 preview route (decision R1): branch-only surface, outside the
 * SmartTools catalog, noindexed, never linked from the tool registry.
 * V3 remains the live production surface, untouched.
 */
export default function Tool036V4PreviewPage() {
  return <Tool036V4Shell />;
}
