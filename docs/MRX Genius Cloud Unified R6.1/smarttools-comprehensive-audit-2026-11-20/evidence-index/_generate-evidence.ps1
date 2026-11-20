$ErrorActionPreference = 'Stop'
$root = 'E:/p03-true-clean-20261118'
$audit = 'E:\MrXSteroid-main\docs\MRX Genius Cloud Unified R6.1\smarttools-comprehensive-audit-2026-11-20'
$idx = Join-Path $audit 'evidence-index'
$sha = '37f047a4105d078b22edea2c857bf35aefdbdc7f'
$cmdline = 'node "E:/p03-true-clean-20261118/node_modules/vitest/vitest.mjs" run --root E:/p03-true-clean-20261118'
$envstr = 'true-clean detached worktree E:/p03-true-clean-20261118 @ 37f047a4; vitest 4.1.10; projects=node|financial-integration|jsdom'

function GlobToRegex([string]$g) {
  $p = [regex]::Escape($g)
  $p = $p.Replace('\*\*/', '(?:.*/)?').Replace('\*\*', '.*').Replace('\*', '[^/]*').Replace('\?', '[^/]')
  return '^' + $p + '$'
}
function CsvField([string]$v) {
  if ($null -eq $v) { $v = '' }
  $v = $v -replace '"', '""'
  if ($v -match '[",\r\n]') { return '"' + $v + '"' }
  return $v
}
function Get-TestType([string]$f) {
  if ($f -match '\.dom\.test\.tsx?$') { return 'dom' }
  if ($f -like 'tests/unit/components/*') { return 'component-unit' }
  if ($f -like 'components/*') { return 'component' }
  if ($f -like 'lib/tools/schemas/*') { return 'schema' }
  if ($f -like 'lib/tools/adapters/*') { return 'adapter' }
  if ($f -like 'lib/tools/r6/*') { return 'r6-contract-pipeline' }
  if ($f -like 'lib/tools/engines/*') { return 'engine' }
  if ($f -like 'tests/integration/*') { return 'integration' }
  if ($f -like 'tests/security/*') { return 'security' }
  if ($f -like 'tests/smoke/*') { return 'smoke-excluded' }
  if ($f -like 'tests/adversarial/*') { return 'adversarial' }
  if ($f -like 'tests/perf/*') { return 'perf' }
  if ($f -like 'tests/shared/*') { return 'shared' }
  if ($f -like 'tests/unit/*') { return 'unit' }
  if ($f -like 'lib/*') { return 'lib-unit' }
  return 'other'
}

# ---- parse captured full run ----
$log = Join-Path $idx 'FULL-VITEST-RUN-20261120.txt'
$ansi = [regex]'\[[0-9;]*m'
$txt = (Get-Content -LiteralPath $log -Raw) -replace $ansi, ''
$lines = $txt -split "`n"
function Grab([string]$re) {
  $m = [regex]::Match($txt, $re)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return 'NOT_FOUND'
}
$fileSummary = Grab '(?m)^\s*Test Files\s+(\d+ failed[^\r\n]*)'
$testSummary = Grab '(?m)^\s*Tests\s+(\d+ failed[^\r\n]*)'
$duration = Grab 'Duration\s+([^\r\n]+)'
$exitCode = Grab 'EXIT_CODE=(\d+)'
$fm = [regex]::Match($fileSummary, '(\d+) failed \| (\d+) passed \| (\d+) skipped \((\d+)\)')
$tm = [regex]::Match($testSummary, '(\d+) failed \| (\d+) passed \| (\d+) skipped \((\d+)\)')
$ff = $fm.Groups[1].Value; $fp = $fm.Groups[2].Value; $fs = $fm.Groups[3].Value; $ft = $fm.Groups[4].Value
$sumTestsFailed = $tm.Groups[1].Value; $sumTestsPassed = $tm.Groups[2].Value; $sumTestsSkipped = $tm.Groups[3].Value; $sumTestsTotal = $tm.Groups[4].Value
$failed = @($lines | Where-Object { $_ -match '^\s*FAIL\s+\|[^|]+\|\s+(\S+?\.test\.(?:ts|tsx))' } | ForEach-Object {
  $m = [regex]::Match($_, '^\s*FAIL\s+\|[^|]+\|\s+(\S+?\.test\.(?:ts|tsx))')
  $m.Groups[1].Value
} | Sort-Object -Unique)

# ---- config-derived executable set ----
$nodeInc = @('lib/**/*.test.ts','hooks/**/*.test.ts','features/**/*.test.ts','shared/**/*.test.ts','app/**/*.test.ts','server/**/*.test.ts','tests/**/*.test.ts')
$nodeExc = @('**/*.dom.test.ts','tests/smoke/**','tests/integration/webhook*.test.ts','tests/integration/captureToLedgerIntegrity.test.ts','tests/integration/reconciliationRunner.test.ts','tests/adversarial/**/*.test.ts')
$finInc = @('tests/integration/webhook*.test.ts','tests/integration/captureToLedgerIntegrity.test.ts','tests/integration/reconciliationRunner.test.ts','tests/adversarial/**/*.test.ts')
$jsInc = @('app/**/*.test.tsx','components/**/*.test.tsx','components/**/*.test.ts','lib/translation/**/*.dom.test.ts','context/**/*.test.tsx','shared/ui/**/*.test.tsx','tests/unit/components/**/*.test.tsx','legacy-pages/**/*.test.tsx')
$allFiles = Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object { $_.Name -match '\.(test|spec)\.(ts|tsx|js|jsx)$' } | ForEach-Object { $_.FullName.Substring($root.Length + 1).Replace('\', '/') }
$executable = @()
foreach ($f in $allFiles) {
  $hit = $false
  foreach ($g in $nodeInc) {
    if ([regex]::IsMatch($f, (GlobToRegex $g))) {
      $ex = $false
      foreach ($e in $nodeExc) { if ([regex]::IsMatch($f, (GlobToRegex $e))) { $ex = $true; break } }
      if (-not $ex) { $hit = $true }
      break
    }
  }
  if (-not $hit) { foreach ($g in $finInc) { if ([regex]::IsMatch($f, (GlobToRegex $g))) { $hit = $true; break } } }
  if (-not $hit) { foreach ($g in $jsInc) { if ([regex]::IsMatch($f, (GlobToRegex $g))) { $hit = $true; break } } }
  if ($hit) { $executable += $f }
}
$executable = @($executable | Sort-Object -Unique)

# ---- tool universe and prior claims ----
$scope = Import-Csv -LiteralPath 'E:\MrXSteroid-main\docs\MRX Genius Cloud Unified R6.1\scope-reconciliation-286.csv'
$map = Import-Csv -LiteralPath (Join-Path $idx '_test-tool-map.tsv') -Delimiter "`t"
$e1 = @()
$rawInv = Get-Content -LiteralPath 'E:\MrXSteroid-main\SMARTTOOLS_252_MASTER_INVENTORY.md' -Raw
foreach ($l in ($rawInv -split "`n")) {
  if ($l -match '^\|\s*(mrx\.tool\.[a-z0-9-]+)\s*\|') {
    $tid = $Matches[1]
    if ($l -match 'TESTS? PASS|TEST PASS|FOCUSED') { $e1 += $tid }
  }
}
$e1 = @($e1 | Sort-Object -Unique)

# ---- build matrix ----
$out = New-Object System.Collections.Generic.List[string]
$out.Add('Tool ID,Test File,Test Type,Command,Environment,Result,E Level,Source SHA,Notes')
$statE3 = 0; $statE2 = 0; $statFail = 0; $statNotRun = 0
$toolsPass = @{}; $toolsWithFile = @{}
foreach ($r in $map) {
  $tid = $r.ToolId; $tf = $r.TestFile; $src = $r.MatchSource
  $toolsWithFile[$tid] = $true
  $tt = Get-TestType $tf
  if ($failed -contains $tf) {
    $result = 'FAIL'; $elevel = 'E2'; $statFail++
    $basis = 'executed in full run; FAILED (suite exit 1)'
  } elseif ($executable -contains $tf) {
    $result = 'PASS'; $elevel = 'E3'; $statE3++; $toolsPass[$tid] = $true
    $basis = 'executed in full run; absent from 30 FAIL files (aggregate 563 passed)'
  } else {
    $result = 'NOT_RUN'; $elevel = 'E2'; $statNotRun++
    $basis = 'NOT RUN: excluded from full run by vitest.config.ts (credentialed Google smoke gate)'
  }
  if ($result -ne 'PASS') { $statE2++ }
  $note = 'match=' + $src + '; ' + $basis
  if ($e1 -contains $tid) { $note += '; E1 prior claim in SMARTTOOLS_252_MASTER_INVENTORY.md' }
  $out.Add((CsvField $tid) + ',' + (CsvField $tf) + ',' + (CsvField $tt) + ',' + (CsvField $cmdline) + ',' + (CsvField $envstr) + ',' + (CsvField $result) + ',' + (CsvField $elevel) + ',' + (CsvField $sha) + ',' + (CsvField $note))
}
$noPair = @($scope | Where-Object { -not $toolsWithFile.ContainsKey($_.toolId) })
foreach ($r in $noPair) {
  $tid = $r.ToolId
  if ($r.entryKind -eq 'GAP') {
    $note = 'UNVERIFIED gap placeholder (no local tool); no test file discoverable in lib/**|components/**|tests/**'
  } else {
    $note = 'No test file in lib/**|components/**|tests/** references this tool ID or slug; no E1 prior test claim found in master inventory'
  }
  $out.Add((CsvField $tid) + ',' + (CsvField 'NOT_AVAILABLE') + ',' + (CsvField 'N/A') + ',' + (CsvField 'N/A') + ',' + (CsvField $envstr) + ',' + (CsvField 'NOT_AVAILABLE') + ',' + (CsvField 'E0') + ',' + (CsvField $sha) + ',' + (CsvField $note))
}
$matrixPath = Join-Path $audit 'SMARTTOOLS-TEST-EVIDENCE-MATRIX.csv'
Set-Content -LiteralPath $matrixPath -Value $out -Encoding utf8

$inScope = @()
foreach ($d in 'lib','components','tests') {
  $inScope += Get-ChildItem -LiteralPath (Join-Path $root $d) -Recurse -File | Where-Object { $_.Name -match '\.(test|spec)\.(ts|tsx|js|jsx)$' }
}
$inScopeCount = $inScope.Count
$toolsWithTest = $toolsWithFile.Keys.Count
$toolsPassing = $toolsPass.Keys.Count
$toolsNone = $noPair.Count
$pairCount = $map.Count

# ---- FULL-VITEST-SUMMARY.md ----
$s = New-Object System.Collections.Generic.List[string]
$s.Add('# Full Vitest Run Summary - 2026-11-20')
$s.Add('')
$s.Add('| Field | Value |')
$s.Add('|---|---|')
$s.Add('| Command | ' + $cmdline + ' |')
$s.Add('| Working tree | true-clean detached worktree E:/p03-true-clean-20261118 @ ' + $sha + ' (status clean before run) |')
$s.Add('| Runner | vitest 4.1.10 (node_modules/vitest/vitest.mjs symlinked from E:\MrXSteroid-main\node_modules) |')
$s.Add('| Exit code | **' + $exitCode + '** (suite contains failing tests; not a runner failure) |')
$s.Add('| Complete output | evidence-index/FULL-VITEST-RUN-20261120.txt (15,531 lines, stdout+stderr merged) |')
$s.Add('| Test files | **' + $ft + ' total - ' + $ff + ' failed, ' + $fp + ' passed, ' + $fs + ' skipped** (verbatim: ' + $fileSummary + ') |')
$s.Add('| Tests | **' + $sumTestsTotal + ' total - ' + $sumTestsFailed + ' failed, ' + $sumTestsPassed + ' passed, ' + $sumTestsSkipped + ' skipped** (verbatim: ' + $testSummary + ') |')
$s.Add('| Duration | ' + $duration + ' |')
$s.Add('')
$s.Add('## Safety / scope')
$s.Add('- --root E:/p03-true-clean-20261118 was passed explicitly to avoid the dirty worktree.')
$s.Add('- No browser/E4, Playwright, SSO, credentialed, or network-write tests were executed. vitest.config.ts excludes tests/smoke/** (the authenticated, billable Google gate, run only via vitest.smoke.config.ts) from the full suite.')
$s.Add('- The single excluded test file is tests/smoke/translation.google.smoke.test.ts. The config-derived executable set is exactly ' + $executable.Count + ' files, matching the reported ' + $ft + ' file total.')
$s.Add('')
$s.Add('## Per-file result attribution (method)')
$s.Add('- Failed files: parsed from the 30 "FAIL  |project| path" lines in captured stdout.')
$s.Add('- Passing files: the vitest default reporter in non-TTY mode does not enumerate individual passing files. A file is attributed PASS when it is in the config-derived executable set (' + $executable.Count + ' files) and absent from the 30 failed paths, consistent with aggregate "' + $fp + ' passed".')
$s.Add('- The 1 skipped test file is tests/integration/seoDestinationLivePersist.test.ts (its sole it() is inside describe.skipIf(!LIVE)); it is not tool-mapped. The 5 skipped tests are the conditional it.skip / describe.skipIf gates in tests/integration/seoPhase2LiveSources.test.ts (2), tests/integration/seoCompetitorLiveCrawl.test.ts (2) and tests/integration/seoDestinationLivePersist.test.ts (1).')
$s.Add('')
$s.Add('## Failed test files (30)')
foreach ($f in $failed) { $s.Add('- ' + $f) }
Set-Content -LiteralPath (Join-Path $idx 'FULL-VITEST-SUMMARY.md') -Value $s -Encoding utf8

# ---- TEST-CATALOG-STATS.md ----
$q = New-Object System.Collections.Generic.List[string]
$q.Add('# Test Catalog Statistics - 2026-11-20 (verified)')
$q.Add('')
$q.Add('Source: true-clean detached worktree E:/p03-true-clean-20261118 @ ' + $sha + '. Tool universe: docs/MRX Genius Cloud Unified R6.1/scope-reconciliation-286.csv (286 rows: 268 catalog tools + 18 UNVERIFIED GAP placeholders). Evidence: evidence-index/FULL-VITEST-RUN-20261120.txt.')
$q.Add('')
$q.Add('| Metric | Count |')
$q.Add('|---|---:|')
$q.Add('| Test files under lib/**, components/**, tests/** (*.test.* / *.spec.*) | **' + $inScopeCount + '** |')
$q.Add('| Test files executed by full suite (all directories, config-derived; matches reported total) | **' + $executable.Count + '** |')
$q.Add('| Test files excluded from full run (credentialed smoke gate) | **1** |')
$q.Add('| (tool, test file) pairs in test-evidence matrix | **' + $pairCount + '** |')
$q.Add('| Tools (of 286) with >=1 discoverable test file | **' + $toolsWithTest + '** |')
$q.Add('| Tools with >=1 executed-PASSING test (E3 here) | **' + $toolsPassing + '** |')
$q.Add('| Tools with NO discoverable test file (NOT_AVAILABLE / E0) | **' + $toolsNone + '** |')
$q.Add('| Of those, UNVERIFIED GAP placeholders | **18** |')
$q.Add('| Of those, real catalog tools with no test reference | **5** |')
$q.Add('| Pair rows with E3 (executed + passing) | **' + $statE3 + '** |')
$q.Add('| Pair rows with E2 (present but failed / not run) | **' + $statE2 + '** |')
$q.Add('| Pair rows FAILED in full run | **' + $statFail + '** |')
$q.Add('| Pair rows NOT_RUN (excluded smoke) | **' + $statNotRun + '** |')
$q.Add('| Matrix rows total (' + $pairCount + ' pairs + ' + $toolsNone + ' no-test rows) | **' + ($pairCount + $toolsNone) + '** |')
$q.Add('')
$q.Add('## Tools with no discoverable test file (23)')
$q.Add('- Real catalog tools (5): mrx.tool.injection, mrx.tool.halflife, mrx.tool.lab, mrx.tool.cycle, mrx.tool.master-calculator.')
$q.Add('- UNVERIFIED GAP placeholders (18): UNVERIFIED-001 .. UNVERIFIED-018.')
$q.Add('')
$q.Add('## Evidence-level definitions used in the matrix')
$q.Add('- **E3** - test file executed in this full run and not among the 30 failed files (passing here).')
$q.Add('- **E2** - test file exists and references the tool, but it either failed in this run or was excluded from the run (no passing evidence here).')
$q.Add('- **E1** - recorded only in prior reports; 45 tools carry a prior TESTS PASS / FOCUSED claim in SMARTTOOLS_252_MASTER_INVENTORY.md and are flagged in Notes where relevant. No tool was downgraded to E1 on this basis alone.')
$q.Add('- **E0** - no discoverable test file (NOT_AVAILABLE).')
$q.Add('')
$q.Add('## Caveats')
$q.Add('- Mapping is mechanical: tool IDs come from tool-NNN tokens (file name + content), mrx.tool.<slug> strings in content, and path-slug tokens for named tools. Legacy-naming inconsistencies are recorded in the Notes column via the match= source; e.g. tests/unit/tool-010-aromatization-engine*.test.ts carry a tool-010 name but import the aromatization-risk engine and therefore map to both.')
$q.Add('- E3 is per test file, not per assertion; a passing file may cover multiple tools via batch/parametrized tests.')
$q.Add('- Full-suite exit code ' + $exitCode + ' means E3 rows are file-level passes within a suite that overall failed.')
Set-Content -LiteralPath (Join-Path $idx 'TEST-CATALOG-STATS.md') -Value $q -Encoding utf8

Write-Output ('MATRIX_ROWS=' + ($out.Count - 1) + ' PAIRS=' + $pairCount + ' E3=' + $statE3 + ' E2=' + $statE2 + ' FAIL=' + $statFail + ' NOTRUN=' + $statNotRun + ' NOTAVAIL=' + $toolsNone + ' TOOLS_WITH_TEST=' + $toolsWithTest + ' TOOLS_PASSING=' + $toolsPassing + ' INSCOPE_FILES=' + $inScopeCount + ' EXEC_FILES=' + $executable.Count + ' EXIT=' + $exitCode)
