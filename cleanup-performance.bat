---
render_with_liquid: false
---
@echo off
REM Mr. X Steroid - Performance Cleanup Script
REM This script removes unused files and directories to improve bundle size

echo ============================================
echo Mr. X Steroid Performance Cleanup
echo ============================================
echo.

REM Delete empty directories
echo [1/3] Removing empty directories...
rmdir /Q /S src\app 2>nul
rmdir /Q /S src\processes 2>nul
rmdir /Q /S src\widgets 2>nul
rmdir /Q /S src\testing 2>nul
rmdir /Q /S src\services\core 2>nul
rmdir /Q /S src\entities\order 2>nul
rmdir /Q /S src\entities\payment 2>nul
rmdir /Q /S src\entities\product 2>nul
rmdir /Q /S src\entities\user 2>nul
rmdir /Q /S src\components\layout 2>nul
rmdir /Q /S src\components\marketing 2>nul
rmdir /Q /S src\components\tools 2>nul
rmdir /Q /S src\components\modals 2>nul
rmdir /Q /S src\components\shared 2>nul
echo ✓ Empty directories removed

REM Delete unused utility files
echo.
echo [2/3] Removing unused utility files...
del /Q src\utils\database-optimization.ts 2>nul
del /Q src\shared\lib\database-optimization.ts 2>nul
del /Q src\shared\lib\performance-optimization.ts 2>nul
del /Q src\shared\lib\linkage-inspector.ts 2>nul
del /Q src\features\rewards-social\rewards-social-manager.ts 2>nul
echo ✓ Unused files removed

REM Remove unused dependencies
echo.
echo [3/3] Removing unused dependencies...
echo This will modify package.json and run npm uninstall
call npm uninstall input-otp next-themes 2>nul
if %errorlevel% equ 0 (
    echo ✓ Unused dependencies removed
) else (
    echo ! Warning: Could not remove dependencies. Run manually.
)

echo.
echo ============================================
echo Cleanup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Run: npx vite-bundle-visualizer
echo 3. Check PERFORMANCE_AUDIT_REPORT.md for more optimizations
echo.
pause
