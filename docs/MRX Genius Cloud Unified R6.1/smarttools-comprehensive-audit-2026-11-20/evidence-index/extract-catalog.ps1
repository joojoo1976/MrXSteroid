# READ-ONLY deterministic extraction of SmartTools catalog + registry facts.
# Emits JSON to stdout. Never writes outside this audit folder.
$ErrorActionPreference = 'Stop'
$root = 'E:\MrXSteroid-main'

function Get-Field([string]$Line, [string]$Name) {
  $m = [regex]::Match($Line, "${Name}:\s*'((?:\\.|[^'])*)'")
  if ($m.Success) { return $m.Groups[1].Value }
  return $null
}

function Split-Entries([string]$Text) {
  # Split immediately before each object literal that starts with toolId.
  # Handles both single-line and multi-line entry formatting.
  return @([regex]::Split($Text, "(?=\{\s*toolId:\s*')") | Where-Object { $_ -match "^\s*\{\s*toolId:\s*'" })
}

$catalogFiles = @(Get-ChildItem -Path (Join-Path $root 'lib/tools') -Filter 'smartToolsCatalog*.ts' -File | Sort-Object Name)
$entries = @()
foreach ($f in $catalogFiles) {
  $content = Get-Content -LiteralPath $f.FullName -Raw -Encoding utf8
  foreach ($chunk in (Split-Entries $content)) {
    $toolId = Get-Field $chunk 'toolId'
    if (-not $toolId) { continue }
    $status = Get-Field $chunk 'status'
    if (-not $status) { $status = 'implemented (default)' }
    $entries += [pscustomobject]@{
      sourceFile = $f.Name
      toolId = $toolId
      slug = Get-Field $chunk 'slug'
      href = Get-Field $chunk 'href'
      order = [double]([regex]::Match($chunk, 'order:\s*([0-9.]+)').Groups[1].Value)
      titleEn = Get-Field $chunk 'titleEn'
      titleAr = Get-Field $chunk 'titleAr'
      componentPath = Get-Field $chunk 'componentPath'
      enginePath = Get-Field $chunk 'enginePath'
      schemaPath = Get-Field $chunk 'schemaPath'
      status = $status
    }
  }
}

$registryFile = Join-Path $root 'lib/tools/registry.ts'
$registry = @()
foreach ($chunk in (Split-Entries (Get-Content -LiteralPath $registryFile -Raw -Encoding utf8))) {
  $toolId = Get-Field $chunk 'toolId'
  if (-not $toolId) { continue }
  $registry += [pscustomobject]@{
    toolId = $toolId
    slug = Get-Field $chunk 'slug'
    href = Get-Field $chunk 'href'
    order = [double]([regex]::Match($chunk, 'order:\s*([0-9.]+)').Groups[1].Value)
    titleEn = Get-Field $chunk 'titleEn'
    titleAr = Get-Field $chunk 'titleAr'
    stackStatus = Get-Field $chunk 'stackStatus'
  }
}

$published = @($entries | Where-Object { $_.status -ne 'planned' })
$planned = @($entries | Where-Object { $_.status -eq 'planned' })

function Get-Dupes($items, $prop) {
  @($items | Group-Object -Property $prop | Where-Object { $_.Count -gt 1 } | ForEach-Object {
    [pscustomobject]@{ key = $_.Name; count = $_.Count; files = (($_.Group | ForEach-Object { $_.sourceFile }) -join ',') }
  })
}

$result = [ordered]@{
  catalogFiles = @($catalogFiles | ForEach-Object { $_.Name })
  catalogTotalEntries = $entries.Count
  catalogPublished = $published.Count
  catalogPlanned = $planned.Count
  catalogByFile = @($entries | Group-Object sourceFile | Sort-Object Name | ForEach-Object { [pscustomobject]@{ file = $_.Name; entries = $_.Count; published = @($_.Group | Where-Object { $_.status -ne 'planned' }).Count; planned = @($_.Group | Where-Object { $_.status -eq 'planned' }).Count } })
  duplicateToolIdCount = @(Get-Dupes $entries toolId).Count
  duplicateSlugCount = @(Get-Dupes $entries slug).Count
  duplicateHrefCount = @(Get-Dupes $entries href).Count
  duplicateToolIds = @(Get-Dupes $entries toolId)
  duplicateSlugs = @(Get-Dupes $entries slug)
  duplicateHrefs = @(Get-Dupes $entries href)
  registryTotal = $registry.Count
  registryDuplicateToolIdCount = @(Get-Dupes $registry toolId).Count
  registryDuplicateSlugCount = @(Get-Dupes $registry slug).Count
  registryDuplicateHrefCount = @(Get-Dupes $registry href).Count
  registryByStackStatus = @($registry | Group-Object stackStatus | ForEach-Object { [pscustomobject]@{ stackStatus = $_.Name; count = $_.Count } })
  catalogDuplicateOrderCount = @($entries | Group-Object order | Where-Object { $_.Count -gt 1 }).Count
  catalogOnlyToolIds = @($entries | Where-Object { $registry.toolId -notcontains $_.toolId } | ForEach-Object { $_.toolId })
  registryOnlyToolIds = @($registry | Where-Object { $entries.toolId -notcontains $_.toolId } | ForEach-Object { $_.toolId })
  slugMismatchesByToolId = @($entries | ForEach-Object { $e = $_; $r = $registry | Where-Object { $_.toolId -eq $e.toolId } | Select-Object -First 1; if ($r -and $r.slug -ne $e.slug) { [pscustomobject]@{ toolId = $e.toolId; catalogSlug = $e.slug; registrySlug = $r.slug } } })
  entries = $entries
  registry = $registry
}
$json = $result | ConvertTo-Json -Depth 8
$outPath = Join-Path $root 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20/evidence-index/catalog-extraction.json'
[System.IO.File]::WriteAllText($outPath, $json, (New-Object System.Text.UTF8Encoding($false)))
"catalogTotalEntries=$($entries.Count) catalogPublished=$($published.Count) catalogPlanned=$($planned.Count) registryTotal=$($registry.Count)"
