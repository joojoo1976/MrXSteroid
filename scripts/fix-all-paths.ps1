# MrXSteroid - Comprehensive Path Fixer
# This script fixes ALL remaining import path issues

$ErrorActionPreference = "Stop"
$srcPath = Join-Path $PSScriptRoot "..\src"

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║     MrXSteroid - Comprehensive Path Fixer                ║
║     Fixing ALL remaining import path issues              ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$filesFixed = 0

# Get all .ts and .tsx files
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    # Fix features/../shared/ -> features/../../shared/ui/
    $content = $content -replace "from '\\.\\./shared/StyledBrandName'", "from '../../shared/ui/StyledBrandName'"
    $content = $content -replace "from '\\.\\./shared/BrandLogo'", "from '../../shared/ui/BrandLogo'"
    $content = $content -replace "from '\\.\\./shared/DynamicBrandLogo'", "from '../../shared/ui/DynamicBrandLogo'"
    $content = $content -replace "from '\\.\\./shared/AdPlaceholder'", "from '../../shared/ui/AdPlaceholder'"
    $content = $content -replace "from '\\.\\./shared/RevealOnScroll'", "from '../../shared/ui/RevealOnScroll'"
    $content = $content -replace "from '\\.\\./shared/KineticCounter'", "from '../../shared/ui/KineticCounter'"
    $content = $content -replace "from '\\.\\./shared/UnitToggle'", "from '../../shared/ui/UnitToggle'"
    $content = $content -replace "from '\\.\\./shared/EliteTable'", "from '../../shared/ui/EliteTable'"
    
    # Fix features/calculator/../shared -> features/calculator/../../shared/ui
    $content = $content -replace "from '\\.\\./shared/StyledBrandName'", "from '../../shared/ui/StyledBrandName'"
    $content = $content -replace "from '\\.\\./shared/BrandLogo'", "from '../../shared/ui/BrandLogo'"
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        $relPath = $file.FullName.Replace($srcPath, 'src')
        Write-Host "✓ Fixed: $relPath" -ForegroundColor Green
        $filesFixed++
    }
}

Write-Host @"

╔══════════════════════════════════════════════════════════╗
║                    Fix Summary                           ║
╠══════════════════════════════════════════════════════════╣
║  Files fixed: $filesFixed
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if ($filesFixed -gt 0) {
    Write-Host "`n✨ Path fixing completed! Run 'npm run build' to verify.`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠ No path fixes needed.`n" -ForegroundColor Yellow
}
