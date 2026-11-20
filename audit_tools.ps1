$allLines = Select-String -Path 'lib\tools\smartToolsCatalog*.ts' -Pattern "toolId: '" | ForEach-Object { $_.Line.Trim() }

$results = @()
foreach ($line in $allLines) {
    $toolId       = if ($line -match "toolId: '([^']+)'")       { $Matches[1] } else { 'UNKNOWN' }
    $slug         = if ($line -match "slug: '([^']+)'")         { $Matches[1] } else { '' }
    $titleEn      = if ($line -match "titleEn: '([^']+)'")      { $Matches[1] } else { '' }
    $status       = if ($line -match "status: '([^']+)'")       { $Matches[1] } else { 'implemented' }
    $accessTier   = if ($line -match "accessTier: '([^']+)'")   { $Matches[1] } else { '' }
    $componentPath= if ($line -match "componentPath: '([^']+)'") { $Matches[1] } else { '' }
    $enginePath   = if ($line -match "enginePath: '([^']+)'")   { $Matches[1] } else { '' }
    $schemaPath   = if ($line -match "schemaPath: '([^']+)'")   { $Matches[1] } else { '' }

    # Resolve paths
    $compFile = $componentPath -replace '@/', ''
    $compExists = if ($compFile -and (Test-Path "$compFile.tsx" -ErrorAction SilentlyContinue)) { 'YES' }
                  elseif ($compFile -and (Test-Path "$compFile.ts" -ErrorAction SilentlyContinue)) { 'YES' }
                  elseif ($compFile -and (Test-Path $compFile -ErrorAction SilentlyContinue)) { 'YES' }
                  else { 'NO' }

    $engExists = if ($enginePath -and (Test-Path "$enginePath.ts" -ErrorAction SilentlyContinue)) { 'YES' }
                 elseif ($enginePath -and (Test-Path "$enginePath.tsx" -ErrorAction SilentlyContinue)) { 'YES' }
                 else { 'NO' }

    $schExists = if ($schemaPath -and (Test-Path "$schemaPath.ts" -ErrorAction SilentlyContinue)) { 'YES' }
                 else { 'NO' }

    $testFile = ($compFile -replace '\.tsx?$', '') + '.test.tsx'
    $testExists = if (Test-Path $testFile -ErrorAction SilentlyContinue) { 'YES' } else { 'NO' }

    $results += [PSCustomObject]@{
        ToolId    = $toolId
        Slug      = $slug
        TitleEn   = $titleEn
        Status    = $status
        Tier      = $accessTier
        Component = $compExists
        Engine    = $engExists
        Schema    = $schExists
        Test      = $testExists
    }
}

Write-Output "TOTAL: $($results.Count)"
$results | Export-Csv -Path 'C:\Users\foryo\AppData\Local\Temp\tools_audit.csv' -NoTypeInformation -Encoding UTF8

# Summary stats
$implemented = $results | Where-Object { $_.Status -eq 'implemented' }
$planned     = $results | Where-Object { $_.Status -eq 'planned' }
$fullStack   = $results | Where-Object { $_.Component -eq 'YES' -and $_.Engine -eq 'YES' -and $_.Schema -eq 'YES' }
$noComp      = $results | Where-Object { $_.Component -eq 'NO' }
$noEngine    = $results | Where-Object { $_.Engine -eq 'NO' }
$noSchema    = $results | Where-Object { $_.Schema -eq 'NO' }
$withTests   = $results | Where-Object { $_.Test -eq 'YES' }

Write-Output "Implemented: $($implemented.Count)"
Write-Output "Planned: $($planned.Count)"
Write-Output "Full Stack (Comp+Eng+Schema): $($fullStack.Count)"
Write-Output "Missing Component: $($noComp.Count)"
Write-Output "Missing Engine: $($noEngine.Count)"
Write-Output "Missing Schema: $($noSchema.Count)"
Write-Output "Has Tests: $($withTests.Count)"
Write-Output ""
Write-Output "=== FULL STACK TOOLS ==="
$fullStack | ForEach-Object { Write-Output "$($_.ToolId) | $($_.TitleEn)" }
Write-Output ""
Write-Output "=== MISSING COMPONENT ==="
$noComp | ForEach-Object { Write-Output "$($_.ToolId) | $($_.Status)" }
Write-Output ""
Write-Output "=== MISSING ENGINE ==="
$noEngine | ForEach-Object { Write-Output "$($_.ToolId) | $($_.Status)" }
