# READ-ONLY: builds the authoritative deduplicated tool universe CSV.
# Inputs: catalog-extraction.json (from extract-catalog.ps1) + filesystem + git read commands.
$ErrorActionPreference = 'Stop'
$root = 'E:\MrXSteroid-main'
$outDir = Join-Path $root 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20'

$j = Get-Content -Raw -Encoding utf8 (Join-Path $outDir 'evidence-index/catalog-extraction.json') | ConvertFrom-Json
$entries = @($j.entries)
$registry = @($j.registry)
$regBySlug = @{}
foreach ($r in $registry) { $regBySlug[$r.slug] = $r }

# ---------- Historical 88-batch plan (R5, withdrawn as execution order) ----------
$batchBySlug = @{}
$planPath = Join-Path $root 'docs/MrXSteroid_Genius_Intelligence_V4.0/R5_255_TOOL_EXECUTION_PLAN.md'
foreach ($line in (Get-Content -LiteralPath $planPath -Encoding utf8)) {
  if ($line -notmatch '^\|\s*(B\d+)\s*\|') { continue }
  $b = $matches[1]
  foreach ($m in [regex]::Matches($line, '`([^`]+)`')) {
    $tok = $m.Groups[1].Value.Trim()
    if ($tok -match '^[a-z0-9][a-z0-9-]*$' -and -not $batchBySlug.ContainsKey($tok)) { $batchBySlug[$tok] = $b }
  }
}

# ---------- Already-completed 29-tool audit (do not re-audit) ----------
$audited29 = @{}
$referenceOnly = @{}
$cmp = Import-Csv -LiteralPath (Join-Path $root 'docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/phase-next/R6.1-29-TOOLS-VS-039-COMPARISON.csv') -Encoding utf8
foreach ($r in $cmp) {
  if (-not $r.canonical_slug -or $r.canonical_slug -eq 'canonical_slug') { continue }
  if ($r.tool_id -like '*-REFERENCE') { $referenceOnly[$r.canonical_slug] = $true } else { $audited29[$r.canonical_slug] = $true }
}

# ---------- R6 exempt slugs ----------
$exempt = @{}
$manifestText = Get-Content -LiteralPath (Join-Path $root 'lib/tools/r6/manifest.ts') -Raw -Encoding utf8
foreach ($m in [regex]::Matches($manifestText, "R6_EXEMPT_SLUGS\s*=\s*new Set<string>\(\[(.*?)\]\);", 'Singleline')) {
  foreach ($q in [regex]::Matches($m.Groups[1].Value, "'([^']+)'")) { $exempt[$q.Groups[1].Value] = $true }
}

# ---------- Filesystem / git helpers ----------
$exts = @('.tsx', '.ts', '.jsx', '.js')
function Resolve-SourcePath([string]$declared) {
  if (-not $declared) { return $null }
  $p = $declared -replace '^@/', ''
  if ($p -match '\.(tsx?|jsx?)$') {
    if (Test-Path -LiteralPath (Join-Path $root $p) -PathType Leaf) { return $p }
  }
  foreach ($e in $exts) {
    $cand = $p + $e
    if (Test-Path -LiteralPath (Join-Path $root $cand) -PathType Leaf) { return $cand }
  }
  foreach ($e in $exts) {
    $cand = $p + '/index' + $e
    if (Test-Path -LiteralPath (Join-Path $root $cand) -PathType Leaf) { return $cand }
  }
  return $null
}

$gitTrackedCache = @{}
$gitCommitCache = @{}
$blobCache = @{}
$worktreeModified = @{}
foreach ($line in (git -C $root status --porcelain --untracked-files=no)) {
  $p = $line.Substring([Math]::Min(3, $line.Length)).Trim().Trim('"').Replace('\', '/')
  if ($p) { $worktreeModified[$p] = $true }
}
function Get-Tracked([string]$rel) {
  if ($gitTrackedCache.ContainsKey($rel)) { return $gitTrackedCache[$rel] }
  $literal = ':(literal)' + $rel
  git -C $root ls-files --error-unmatch -- $literal 2>$null | Out-Null
  $v = ($LASTEXITCODE -eq 0)
  $gitTrackedCache[$rel] = $v
  return $v
}
function Get-LastCommit([string]$rel) {
  if (-not $rel) { return 'NOT_FOUND' }
  if ($gitCommitCache.ContainsKey($rel)) { return $gitCommitCache[$rel] }
  if (-not (Get-Tracked $rel)) { $gitCommitCache[$rel] = 'UNTRACKED'; return 'UNTRACKED' }
  $literal = ':(literal)' + $rel
  $h = (git -C $root log -1 --format=%h -- $literal 2>$null).Trim()
  if (-not $h) { $h = 'NOT_FOUND' }
  $gitCommitCache[$rel] = $h
  return $h
}
function Get-SourceSha([string]$rel) {
  if (-not $rel) { return 'NOT_FOUND' }
  if ($blobCache.ContainsKey($rel)) { return $blobCache[$rel] }
  $abs = Join-Path $root $rel
  if (-not (Test-Path -LiteralPath $abs -PathType Leaf)) { $blobCache[$rel] = 'NOT_FOUND'; return 'NOT_FOUND' }
  if (Get-Tracked $rel) {
    $h = (git -C $root hash-object -- $abs).Trim()
    $v = 'GIT_BLOB_WORKTREE:' + $h
  } else {
    $h = (Get-FileHash -LiteralPath $abs -Algorithm SHA256).Hash.ToLowerInvariant()
    $v = 'SHA256:' + $h + ' (UNTRACKED)'
  }
  $blobCache[$rel] = $v
  return $v
}

# ---------- Route inventory ----------
$dynamicRoute = 'app/smarttools/[category]/[tool]/page.tsx'
$staticRoutes = @{}
foreach ($f in (Get-ChildItem -Path (Join-Path $root 'app/smarttools') -Recurse -File -Filter 'page.tsx')) {
  $rel = $f.FullName.Substring($root.Length + 1).Replace('\', '/')
  if ($rel -eq $dynamicRoute) { continue }
  $staticRoutes[$rel] = $true
}

# ---------- Artifact name index ----------
$engineNames = @(Get-ChildItem -Path (Join-Path $root 'lib/tools/engines') -Recurse -File | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') })
$schemaNames = @(Get-ChildItem -Path (Join-Path $root 'lib/tools/schemas') -Recurse -File | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') })
$pipelineNames = @(Get-ChildItem -Path (Join-Path $root 'lib/tools/r6') -File -Filter '*-pipeline.ts' | Where-Object { $_.Name -notlike '*.test.ts' } | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') })
$i18nNames = @(Get-ChildItem -Path (Join-Path $root 'i18n') -File -Filter '*.json' | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') })

function Find-ByBase($list, [string]$base) {
  $exact = @($list | Where-Object { $_ -eq $base })
  if ($exact.Count -gt 0) { return $exact[0] }
  return $null
}
function Find-Pipeline([string]$slug) {
  $want = $slug + '-pipeline.ts'
  $exact = @($pipelineNames | Where-Object { $_.EndsWith('/' + $want) })
  if ($exact.Count -gt 0) { return $exact[0] }
  if ($slug -match '^(tool-\d+)-') {
    $prefix = $matches[1]
    $cand = @($pipelineNames | Where-Object { [System.IO.Path]::GetFileName($_) -match ('^' + [regex]::Escape($prefix) + '-.*-pipeline\.ts$') })
    if ($cand.Count -eq 1) { return $cand[0] }
    if ($cand.Count -gt 1) { return ($cand[0] + ' [AMBIGUOUS]') }
  }
  return $null
}

function Esc([string]$s) {
  if ($null -eq $s) { return '' }
  $s = [string]$s
  if ($s -match '["",\r\n]') { return '"' + ($s -replace '"', '""') + '"' }
  return $s
}

$header = 'Tool ID,Name EN,Name AR,Slug,Category,Canonical EN Route,Canonical AR Route,Component Path,Engine Path,Pipeline Path,Schema Path,Registry Status,Implementation Status,Batch,Last Relevant Commit,Source SHA,Catalog Status,Notes'
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add($header)
$detail = New-Object System.Collections.ArrayList

foreach ($e in $entries) {
  $slug = [string]$e.slug
  $compDecl = [string]$e.componentPath
  $engDecl = [string]$e.enginePath
  $schDecl = [string]$e.schemaPath
  $comp = Resolve-SourcePath $compDecl
  $eng = Resolve-SourcePath $engDecl
  $sch = Resolve-SourcePath $schDecl
  $pipe = Find-Pipeline $slug
  $pipeAmbiguous = $false
  if ($pipe -and $pipe.EndsWith(' [AMBIGUOUS]')) {
    $pipeAmbiguous = $true
    $pipe = $pipe.Substring(0, $pipe.Length - ' [AMBIGUOUS]'.Length)
  }
  $i18n = Find-ByBase $i18nNames ('i18n/' + $slug + '.json')

  $cat = ''
  if ($e.href -match '^/smarttools/([^/]+)/') { $cat = $matches[1] }

  $r = $null
  if ($regBySlug.ContainsKey($slug)) { $r = $regBySlug[$slug] }
  if ($r) {
    $regStatus = 'IN_REGISTRY;stackStatus=' + $r.stackStatus
  } else {
    $regStatus = 'NOT_IN_REGISTRY'
  }

  $routeType = 'NONE'
  if ($e.href -match '^/smarttools/([^/]+)/([^/]+)$') {
    $c = $matches[1]; $t = $matches[2]
    $dyn = @($staticRoutes.Keys | Where-Object { $_ -like "app/smarttools/$c/$t/page.tsx" })
    if ($dyn.Count -gt 0) { $routeType = 'STATIC_EXACT' }
    elseif (Test-Path -LiteralPath (Join-Path $root $dynamicRoute)) { $routeType = 'DYNAMIC' }
  } elseif ($staticRoutes.ContainsKey('app/smarttools' + $e.href + '/page.tsx')) {
    $routeType = 'STATIC_EXACT'
  }

  $impl = @()
  $impl += 'COMPONENT=' + $(if ($comp) { 'FOUND' } else { 'NOT_FOUND' })
  $impl += 'ENGINE=' + $(if ($eng) { 'FOUND' } else { 'NOT_FOUND' })
  $impl += 'SCHEMA=' + $(if ($sch) { 'FOUND' } else { 'NOT_FOUND' })
  $impl += 'ROUTE=' + $routeType
  $impl += 'PIPELINE=' + $(if ($pipe) { 'FOUND' } else { 'NOT_FOUND' })
  $impl += 'I18N=' + $(if ($i18n) { 'FOUND' } else { 'NOT_FOUND' })
  $missing = @($impl | Where-Object { $_ -like '*NOT_FOUND*' })
  $overall = if ($missing.Count -eq 0) { 'IMPLEMENTED' } elseif ($missing.Count -le 2) { 'PARTIAL' } else { 'UNVERIFIED' }
  $implText = $overall + ' [' + ($impl -join ';') + ']'

  $batch = 'NOT_DOCUMENTED'
  if ($batchBySlug.ContainsKey($slug)) { $batch = $batchBySlug[$slug] }
  if ($audited29.ContainsKey($slug)) { $batch += ';R6_PHASE_NEXT_29_AUDITED' }
  if ($referenceOnly.ContainsKey($slug)) { $batch += ';R6_PHASE_NEXT_039_REFERENCE_ONLY' }

  $primary = $comp
  if (-not $primary) { $primary = $eng }
  $lastCommit = Get-LastCommit $primary
  $sha = Get-SourceSha $primary

  $notes = @()
  if ($r -and $r.toolId -ne $e.toolId) { $notes += 'REGISTRY_ID_VARIANT=' + $r.toolId }
  if ($exempt.ContainsKey($slug)) { $notes += 'R6_EXEMPT' }
  if ($audited29.ContainsKey($slug)) { $notes += 'AUDIT_ALREADY_COMPLETED_2026-11-19' }
  if ($referenceOnly.ContainsKey($slug)) { $notes += 'REFERENCE_ONLY_039_NOT_AUDIT_TARGET' }
  if (-not $comp) { $notes += 'DECLARED_COMPONENT=' + $compDecl + ' NOT_FOUND' }
  if (-not $eng) { $notes += 'DECLARED_ENGINE=' + $engDecl + ' NOT_FOUND' }
  if (-not $sch) { $notes += 'DECLARED_SCHEMA=' + $schDecl + ' NOT_FOUND' }
  if ($i18n) { $notes += 'I18N=' + $i18n } else { $notes += 'I18N_NOT_FOUND' }
  if ($pipeAmbiguous) { $notes += 'PIPELINE_MATCH_AMBIGUOUS' }
  elseif ($pipe -and ([System.IO.Path]::GetFileName($pipe)) -ne ($slug + '-pipeline.ts')) { $notes += 'PIPELINE_PREFIX_FALLBACK' }
  if ($primary -eq $eng -and -not $comp) { $notes += 'SOURCE_SHA_FROM_ENGINE (component missing)' }
  if ($primary -and $worktreeModified.ContainsKey($primary)) { $notes += 'SOURCE_SHA_IS_WORKTREE_BLOB;PRIMARY_COMPONENT_MODIFIED' }
  $notes += 'AR_ROUTE_VIA_MIDDLEWARE_REWRITE'
  if ($e.status -eq 'planned') { $notes += 'CATALOG_STATUS_PLANNED' }

  $row = @(
    $e.toolId, $e.titleEn, $e.titleAr, $slug, $cat,
    $e.href, ('/ar' + $e.href),
    $(if ($comp) { $comp } else { $compDecl + '[NOT_FOUND]' }),
    $(if ($eng) { $eng } else { $engDecl + '[NOT_FOUND]' }),
    $(if ($pipe) { $pipe } else { 'NOT_FOUND' }),
    $(if ($sch) { $sch } else { $schDecl + '[NOT_FOUND]' }),
    $regStatus, $implText, $batch, $lastCommit, $sha,
    $(if ($e.status -eq 'planned') { 'PLANNED' } else { 'PUBLISHED' }),
    ($notes -join ' | ')
  )
  $lines.Add((($row | ForEach-Object { Esc $_ }) -join ','))
  [void]$detail.Add([pscustomobject]@{
    toolId = $e.toolId; slug = $slug; component = $comp; engine = $eng; schema = $sch
    pipeline = $pipe; i18n = $i18n; routeType = $routeType; batch = $batch
    lastCommit = $lastCommit; sha = $sha; implementation = $implText
  })
}

$csvPath = Join-Path $outDir 'SMARTTOOLS-CATALOG-RECONCILIATION.csv'
[System.IO.File]::WriteAllText($csvPath, ($lines -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
$detail | ConvertTo-Json -Depth 6 | Out-File -Encoding utf8 (Join-Path $outDir 'evidence-index/universe-detail.json')
"rows=$($entries.Count)"
"csv=$csvPath"
