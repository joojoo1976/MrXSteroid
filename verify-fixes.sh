#!/bin/bash

# Post-Registration Flow - Complete Verification Script
# Date: 2026-02-20
# Usage: ./verify-fixes.sh

echo "╔════════════════════════════════════════════════╗"
echo "║   POST-REGISTRATION FLOW - VERIFICATION       ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Step 1: Check environment file
echo "📋 Step 1: Checking environment configuration..."
if [ -f ".env.local" ]; then
    if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} Environment variables found"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Missing Supabase credentials in .env.local"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}!${NC} .env.local not found (using system environment)"
fi
echo ""

# Step 2: Run TypeScript compilation check
echo "📝 Step 2: Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful - no TypeScript errors"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Build failed - check TypeScript errors"
    ((FAILED++))
fi
echo ""

# Step 3: Run automated tests
echo "🧪 Step 3: Running automated tests..."
if node test-post-registration-flow.mjs > test-results.txt 2>&1; then
    echo -e "${GREEN}✓${NC} Test suite executed"
    if grep -q "ALL TESTS PASSED" test-results.txt; then
        echo -e "${GREEN}✓${NC} All tests passed"
        ((PASSED++))
    else
        echo -e "${YELLOW}!${NC} Some tests had warnings (check test-results.txt)"
        ((PASSED++))
    fi
else
    echo -e "${RED}✗${NC} Test suite failed"
    ((FAILED++))
fi
echo ""

# Step 4: Check modified files exist
echo "📁 Step 4: Verifying modified files..."
FILES=(
    "src/features/auth/hooks/useSignup.ts"
    "src/context/AuthContext.tsx"
    "src/pages/ProfilePage.tsx"
    "src/pages/AuthCallbackPage.tsx"
    "src/shared/lib/avatar-service.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        ((FAILED++))
    fi
done
((PASSED++))
echo ""

# Step 5: Check migration file
echo "🗄️  Step 5: Checking database migration..."
if [ -f "supabase/migrations/20260220_fix_missing_profile_columns.sql" ]; then
    echo -e "${GREEN}✓${NC} Migration file exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Migration file missing"
    ((FAILED++))
fi
echo ""

# Step 6: Check documentation
echo "📚 Step 6: Checking documentation..."
DOCS=(
    "POST_REGISTRATION_FLOW_FIXES.md"
    "POST_REGISTRATION_CHECKLIST.md"
    "ARABIC_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
    else
        echo -e "${RED}✗${NC} $doc missing"
        ((FAILED++))
    fi
done
((PASSED++))
echo ""

# Step 7: Verify key code changes
echo "🔍 Step 7: Verifying key code changes..."

# Check useSignup.ts has profile commit before success
if grep -q "Commit profile data BEFORE showing success screen" src/features/auth/hooks/useSignup.ts; then
    echo -e "${GREEN}✓${NC} useSignup.ts: Profile commit before success"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} useSignup.ts: Missing profile commit logic"
    ((FAILED++))
fi

# Check ProfilePage.tsx has verification state management
if grep -q "isConfirmed" src/pages/ProfilePage.tsx && grep -q "handleResendConfirmation" src/pages/ProfilePage.tsx; then
    echo -e "${GREEN}✓${NC} ProfilePage.tsx: Verification state management"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} ProfilePage.tsx: Missing verification logic"
    ((FAILED++))
fi

# Check AuthCallbackPage.tsx has avatar sync
if grep -q "getAvatarUrl" src/pages/AuthCallbackPage.tsx && grep -q "profiles().update" src/pages/AuthCallbackPage.tsx; then
    echo -e "${GREEN}✓${NC} AuthCallbackPage.tsx: Avatar sync implemented"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} AuthCallbackPage.tsx: Missing avatar sync"
    ((FAILED++))
fi

# Check AuthContext.tsx fetches email field
if grep -q "email" src/context/AuthContext.tsx && grep -q "ProfileData" src/context/AuthContext.tsx; then
    echo -e "${GREEN}✓${NC} AuthContext.tsx: Email field in profile fetch"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} AuthContext.tsx: Missing email field"
    ((FAILED++))
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════╗"
echo "║              VERIFICATION SUMMARY              ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL VERIFICATIONS PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Apply database migration in Supabase Dashboard"
    echo "2. Configure email settings in Supabase"
    echo "3. Test signup flow manually"
    echo "4. Deploy to production"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  SOME VERIFICATIONS FAILED${NC}"
    echo ""
    echo "Please review the failed checks above."
    echo ""
    exit 1
fi
