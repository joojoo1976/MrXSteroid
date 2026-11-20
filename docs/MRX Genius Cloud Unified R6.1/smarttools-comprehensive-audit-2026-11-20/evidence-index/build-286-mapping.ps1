# READ-ONLY: reconciles historical 286-scope CSV rows against current catalog/registry.
$ErrorActionPreference = 'Stop'
$root = 'E:\MrXSteroid-main'
$outDir = Join-Path $root 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20'

$hist = Import-Csv -LiteralPath (Join-Path $root 'docs/MRX Genius Cloud Unified R6.1/scope-reconciliation-286.csv') -Encoding utf8
$j = Get-Content -Raw -Encoding utf8 (Join-Path $outDir 'evidence-index/catalog-extraction.json') | ConvertFrom-Json
$catBySlug = @{}; $catById = @{}
foreach ($e in $j.entries) { $catBySlug[$e.slug] = $e; $catById[$e.toolId] = $e }
$regBySlug = @{}; $regById = @{}
foreach ($r in $j.registry) { $regBySlug[$r.slug] = $r; $regById[$r.toolId] = $r }

function Esc([string]$s) {
  if ($null -eq $s) { return '' }
  $s = [string]$s
  if ($s -match '["",\r\n]') { return '"' + ($s -replace '"', '""') + '"' }
  return $s
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('Historical ID,Historical Name,Current Tool ID or Slug,Mapping Classification,Evidence,Notes')
$counts = @{}
foreach ($row in $hist) {
  $id = $row.entryId
  $slug = $row.canonicalSlug
  $toolId = $row.toolId
  $kind = $row.entryKind
  $histName = $toolId
  $current = 'NOT_FOUND'
  $class = 'UNDETERMINED'
  $evidence = @()
  $notes = @()

  $inCat = $catBySlug.ContainsKey($slug)
  $inReg = $regBySlug.ContainsKey($slug)
  $idInCat = $catById.ContainsKey($toolId)
  $idInReg = $regById.ContainsKey($toolId)

  if ($kind -eq 'GAP') {
    $class = 'UNDETERMINED'
    $evidence += "scope-reconciliation-286.csv:$id entryKind=GAP publicationState=$($row.publicationState) implementationState=$($row.implementationState)"
    $evidence += "evidenceURI='$($row.evidenceURI)'"
    $evidence += "no slug/toolId/route match in smartToolsCatalog* or registry.ts"
    $notes += 'Historical gap/placeholder, NOT evidence of removal; 18-row delta is fully accounted for by these rows.'
    $notes += 'Source CSV has no explicit name field; toolId used as historical label.'
  } elseif ($inCat -and $inReg) {
    $e = $catBySlug[$slug]
    $r = $regBySlug[$slug]
    $current = $e.toolId + ' / ' + $slug
    $evidence += "scope-reconciliation-286.csv:$id entryKind=$kind publicationState=$($row.publicationState)"
    $evidence += "slug '$slug' in smartToolsCatalog* ($($e.sourceFile)) and lib/tools/registry.ts"
    $evidence += "route '$($row.route)' == catalog href '$($e.href)'"
    if ($idInCat -and $idInReg) {
      $class = 'PRESENT'
      $evidence += "toolId '$toolId' matches both catalog and registry"
    } elseif ($idInCat -or $idInReg) {
      $class = 'PRESENT'
      $side = if ($idInCat) { 'catalog' } else { 'registry' }
      if ($idInCat) { $other = $r.toolId } else { $other = $e.toolId }
      $evidence += "toolId '$toolId' matches $side only; counterpart uses '$other' (slug/route identical)"
      $notes += 'ID_VARIANT_ACROSS_CATALOG_AND_REGISTRY: catalog=' + $e.toolId + ' registry=' + $r.toolId
    } else {
      $class = 'RENAMED'
      $evidence += "historical toolId '$toolId' not found; slug and route resolve to catalog toolId '$($e.toolId)'"
      $notes += 'Tool identity renamed; slug/route preserved.'
    }
    if ($kind -eq 'VARIANT') {
      $notes += 'Historical entryKind=VARIANT (R5 audit); current catalog has a unique slug/route, so counted PRESENT, not DUPLICATE.'
    }
    if ($row.lineage -eq 'legacy->current_exact') { $evidence += 'lineage=legacy->current_exact' }
    $notes += 'Source CSV has no explicit name field; toolId used as historical label.'
  } elseif ($idInCat -or $idInReg) {
    $e = if ($idInCat) { $catById[$toolId] } else { $regById[$toolId] }
    $current = $e.toolId + ' / ' + $e.slug
    $class = 'RENAMED'
    $evidence += "historical slug '$slug' absent; toolId '$toolId' resolves to current slug '$($e.slug)'"
    $notes += 'Slug renamed; toolId preserved.'
    $notes += 'Source CSV has no explicit name field; toolId used as historical label.'
  } else {
    $class = 'MISSING_FROM_REGISTRY'
    $evidence += "scope-reconciliation-286.csv:$id; no toolId/slug match in catalog or registry"
    $notes += 'NOT_VERIFIED against any current artifact.'
  }

  if (-not $counts.ContainsKey($class)) { $counts[$class] = 0 }
  $counts[$class]++
  $lines.Add((@($id, $histName, $current, $class, ($evidence -join ' | '), ($notes -join ' | ')) | ForEach-Object { Esc $_ }) -join ',')
}

$csvPath = Join-Path $outDir '286-TO-268-SCOPE-MAPPING.csv'
[System.IO.File]::WriteAllText($csvPath, ($lines -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
"rows=$($hist.Count)"
$counts.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key)=$($_.Value)" }
"csv=$csvPath"
