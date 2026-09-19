#!/bin/bash
# Deterministic single-truth probe. Pure ASCII. No host-shell quoting.
cd /mnt/e/MrXSteroid-main || exit 90
echo "--P1-- porcelain:"; git status --porcelain=v1
echo "--P2-- branch:"; git rev-parse --abbrev-ref HEAD
echo "--P3-- top:"; git rev-parse --show-toplevel
echo "--P4-- hashes (git hash-object, working tree, tracked+untracked):"
for f in \
  server/payments/backoffPolicy.ts \
  server/payments/reconciliationRunner.ts \
  server/payments/fulfillmentService.ts \
  server/payments/webhook.ts \
  server/payments/reconciliationService.ts \
  server/seo/seoService.ts \
  supabase/migrations/20260918160000_phase7_reconciliation_runs.sql \
  supabase/migrations/20260919000000_phase8_gate_version.sql; do
  if [ -f "$f" ]; then
    printf "%-12s %s\n" "$(git hash-object "$f" | cut -c1-12)" "$f"
  else
    echo "ABSENT                  $f"
  fi
done
echo "--P5-- does git track backoffPolicy?"; git ls-files --error-unmatch server/payments/backoffPolicy.ts; echo "P5_EXIT=$?"
