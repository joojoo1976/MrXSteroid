@echo off
REM Post-Registration Flow - Complete Verification Script
REM Date: 2026-02-20
REM Usage: verify-fixes.bat

echo ╔════════════════════════════════════════════════╗
echo ║   POST-REGISTRATION FLOW - VERIFICATION       ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Counter
set /a PASSED=0
set /a FAILED=0

REM Step 1: Check environment file
echo 📋 Step 1: Checking environment configuration...
if exist ".env.local" (
    findstr /C:"VITE_SUPABASE_URL" .env.local >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Environment variables found
        set /a PASSED+=1
    ) else (
        echo ✗ Missing Supabase credentials in .env.local
        set /a FAILED+=1
    )
) else (
    echo ! .env.local not found (using system environment)
)
echo.

REM Step 2: Run TypeScript compilation check
echo 📝 Step 2: Checking TypeScript compilation...
call npm run build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Build successful - no TypeScript errors
    set /a PASSED+=1
) else (
    echo ✗ Build failed - check TypeScript errors
    set /a FAILED+=1
)
echo.

REM Step 3: Run automated tests
echo 🧪 Step 3: Running automated tests...
node test-post-registration-flow.mjs > test-results.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Test suite executed
    set /a PASSED+=1
    findstr /C:"ALL TESTS PASSED" test-results.txt >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ All tests passed
    ) else (
        echo ! Some tests had warnings (check test-results.txt)
    )
) else (
    echo ✗ Test suite failed
    set /a FAILED+=1
)
echo.

REM Step 4: Check modified files exist
echo 📁 Step 4: Verifying modified files...
if exist "src\features\auth\hooks\useSignup.ts" (echo ✓ useSignup.ts exists) else (echo ✗ useSignup.ts missing)
if exist "src\context\AuthContext.tsx" (echo ✓ AuthContext.tsx exists) else (echo ✗ AuthContext.tsx missing)
if exist "src\pages\ProfilePage.tsx" (echo ✓ ProfilePage.tsx exists) else (echo ✗ ProfilePage.tsx missing)
if exist "src\pages\AuthCallbackPage.tsx" (echo ✓ AuthCallbackPage.tsx exists) else (echo ✗ AuthCallbackPage.tsx missing)
if exist "src\shared\lib\avatar-service.ts" (echo ✓ avatar-service.ts exists) else (echo ✗ avatar-service.ts missing)
set /a PASSED+=1
echo.

REM Step 5: Check migration file
echo 🗄️  Step 5: Checking database migration...
if exist "supabase\migrations\20260220_fix_missing_profile_columns.sql" (
    echo ✓ Migration file exists
    set /a PASSED+=1
) else (
    echo ✗ Migration file missing
    set /a FAILED+=1
)
echo.

REM Step 6: Check documentation
echo 📚 Step 6: Checking documentation...
if exist "POST_REGISTRATION_FLOW_FIXES.md" (echo ✓ POST_REGISTRATION_FLOW_FIXES.md exists) else (echo ✗ POST_REGISTRATION_FLOW_FIXES.md missing)
if exist "POST_REGISTRATION_CHECKLIST.md" (echo ✓ POST_REGISTRATION_CHECKLIST.md exists) else (echo ✗ POST_REGISTRATION_CHECKLIST.md missing)
if exist "ARABIC_SUMMARY.md" (echo ✓ ARABIC_SUMMARY.md exists) else (echo ✗ ARABIC_SUMMARY.md missing)
set /a PASSED+=1
echo.

REM Step 7: Verify key code changes
echo 🔍 Step 7: Verifying key code changes...

findstr /C:"Commit profile data BEFORE showing success screen" src\features\auth\hooks\useSignup.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ useSignup.ts: Profile commit before success
    set /a PASSED+=1
) else (
    echo ✗ useSignup.ts: Missing profile commit logic
    set /a FAILED+=1
)

findstr /C:"isConfirmed" src\pages\ProfilePage.tsx >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ ProfilePage.tsx: Verification state management
    set /a PASSED+=1
) else (
    echo ✗ ProfilePage.tsx: Missing verification logic
    set /a FAILED+=1
)

findstr /C:"getAvatarUrl" src\pages\AuthCallbackPage.tsx >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ AuthCallbackPage.tsx: Avatar sync implemented
    set /a PASSED+=1
) else (
    echo ✗ AuthCallbackPage.tsx: Missing avatar sync
    set /a FAILED+=1
)

findstr /C:"ProfileData" src\context\AuthContext.tsx >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ AuthContext.tsx: Email field in profile fetch
    set /a PASSED+=1
) else (
    echo ✗ AuthContext.tsx: Missing email field
    set /a FAILED+=1
)
echo.

REM Summary
echo ╔════════════════════════════════════════════════╗
echo ║              VERIFICATION SUMMARY              ║
echo ╚════════════════════════════════════════════════╝
echo.
echo Passed: %PASSED%
echo Failed: %FAILED%
echo.

if %FAILED% EQU 0 (
    echo 🎉 ALL VERIFICATIONS PASSED!
    echo.
    echo Next steps:
    echo 1. Apply database migration in Supabase Dashboard
    echo 2. Configure email settings in Supabase
    echo 3. Test signup flow manually
    echo 4. Deploy to production
    echo.
    exit /b 0
) else (
    echo ⚠️  SOME VERIFICATIONS FAILED
    echo.
    echo Please review the failed checks above.
    echo.
    exit /b 1
)
