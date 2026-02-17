# MrXSteroid Import Path Fixer - PowerShell Version
# Fixes all incorrect import paths in the project

$ErrorActionPreference = "Stop"
$srcPath = Join-Path $PSScriptRoot "..\src"

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║     MrXSteroid Import Path Fixer (PowerShell)            ║
║     Fixing incorrect import paths                        ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Define path replacements
$replacements = @{
    "../components/layout/DynamicBrandLogo" = "../shared/ui/DynamicBrandLogo"
    "../components/shared/BrandLogo" = "../shared/ui/BrandLogo"
    "../components/shared/StyledBrandName" = "../shared/ui/StyledBrandName"
    "../components/ui/card" = "../shared/ui/card"
    "../components/ui/button" = "../shared/ui/button"
    "../components/ui/alert" = "../shared/ui/alert"
    "../components/ui/badge" = "../shared/ui/badge"
    "../components/checkout/CheckoutForm" = "../features/checkout/CheckoutForm"
    "../components/checkout/ProductSelector" = "../features/checkout/ProductSelector"
    "../components/checkout/OrderSummary" = "../features/checkout/OrderSummary"
    "../components/marketing/ContactSection" = "../features/marketing/ContactSection"
}

$filesFixed = 0
$totalReplacements = 0

# Get all .ts and .tsx files
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($key in $replacements.Keys) {
        if ($content -match [regex]::Escape($key)) {
            $matches = ([regex]::Matches($content, [regex]::Escape($key)))
            $count = $matches.Count
            if ($count -gt 0) {
                $content = $content -replace [regex]::Escape($key), $replacements[$key]
                $fileReplacements += $count
            }
        }
    }
    
    if ($fileReplacements -gt 0) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "✓ Fixed $fileReplacements import(s) in $($file.FullName.Replace($srcPath, 'src'))" -ForegroundColor Green
        $filesFixed++
        $totalReplacements += $fileReplacements
    }
}

Write-Host @"

╔══════════════════════════════════════════════════════════╗
║                    Path Fix Summary                      ║
╠══════════════════════════════════════════════════════════╣
║  Files fixed: $filesFixed
║  Total replacements: $totalReplacements
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if ($filesFixed -gt 0) {
    Write-Host "`n✨ Path fixing completed! Run 'npm run build' to verify.`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠ No path fixes needed.`n" -ForegroundColor Yellow
}
